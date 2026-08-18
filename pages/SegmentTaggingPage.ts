import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentTaggingLocators } from '../locators/segmentTaggingLocators';

export class SegmentTaggingPage extends BasePage {
    readonly createSegmentationTagBtn: Locator;
    readonly searchInput: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden,
    // not removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly segmentTagTable: Locator;

    // Create Segmentation Tag popup
    readonly popupDialog: Locator;
    readonly segmentGroupDropdown: Locator;
    readonly tagDropdown: Locator;
    readonly nextExecutionInput: Locator;
    readonly percentageInput: Locator;
    readonly frequencyTypeDropdown: Locator;
    // Conditional fields — only rendered for certain Frequency Type selections
    readonly frequencyTimeInput: Locator;
    readonly frequencyDayDropdown: Locator;
    readonly publishToElsaToggle: Locator;
    readonly publishToElsaLabel: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Delete confirmation dialog (PrimeNG ConfirmDialog)
    readonly confirmDialogAcceptBtn: Locator;
    readonly confirmDialogRejectBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createSegmentationTagBtn = this.page.locator(segmentTaggingLocators.createSegmentationTagBtn);
        this.searchInput = page.locator(segmentTaggingLocators.searchInput);
        this.segmentTagTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.segmentGroupDropdown = page.locator(segmentTaggingLocators.dropdownSegmentGroup);
        this.tagDropdown = page.locator(segmentTaggingLocators.dropdownSelectedTag);
        this.nextExecutionInput = page.locator(`${segmentTaggingLocators.calendarNextExecution} input`);
        this.percentageInput = page.locator(`${segmentTaggingLocators.inputPercentagePlayers} input`);
        this.frequencyTypeDropdown = page.locator(segmentTaggingLocators.dropdownFrequencyType);
        this.frequencyTimeInput = page.locator(`${segmentTaggingLocators.calendarFrequencyTime} input`);
        this.frequencyDayDropdown = page.locator(segmentTaggingLocators.dropdownFrequencyDay);
        this.publishToElsaToggle = page.locator(segmentTaggingLocators.toggleSwitchPublishToElsa);
        this.publishToElsaLabel = page.locator(segmentTaggingLocators.labelPublishToElsa);
        this.saveBtn = page.getByRole('button', { name: segmentTaggingLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: segmentTaggingLocators.buttonCancel, exact: true });

        this.confirmDialogAcceptBtn = page.locator(segmentTaggingLocators.confirmDialogAccept);
        this.confirmDialogRejectBtn = page.locator(segmentTaggingLocators.confirmDialogReject);
    }

    async clickCreateSegmentationTag() {
        console.log('Clicking Create Segmentation Tag button...');
        await this.clickElement(this.createSegmentationTagBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    // ─── Generic PrimeNG dropdown helpers ──────────────────────────────────────

    /**
     * Opens a PrimeNG dropdown and returns its (now-visible) options panel, retrying the click
     * once if the panel doesn't appear the first time — the same pitfall proven elsewhere in
     * this app (a click can land on dismissing a still-open previous overlay instead of opening
     * this one) once multiple dropdowns are filled back-to-back in the same popup.
     */
    private async openDropdown(dropdownLocator: Locator): Promise<Locator> {
        await this.clickElement(dropdownLocator);
        let panel = this.page.locator('.p-dropdown-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
            await this.page.waitForTimeout(300);
            await dropdownLocator.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            panel = this.page.locator('.p-dropdown-panel').last();
        }
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        return panel;
    }

    /**
     * Opens a dropdown and selects whichever option renders first — used for Segment Group and
     * Tag, whose actual values are app/environment data and not safe to hardcode. Returns the
     * selected option's text so callers can search/verify by it afterward (this popup has no
     * dedicated "Name" field of its own).
     */
    async selectFirstDropdownOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(segmentTaggingLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        return text;
    }

    async selectFirstSegmentGroup(): Promise<string> {
        console.log('Selecting first available Segment Group...');
        return this.selectFirstDropdownOption(this.segmentGroupDropdown);
    }

    async selectFirstTag(): Promise<string> {
        console.log('Selecting first available Tag...');
        return this.selectFirstDropdownOption(this.tagDropdown);
    }

    /**
     * Selects a Frequency Type by its known, fixed label (Daily / Weekly / Once Off — unlike
     * Segment Group/Tag these are a small fixed enum, not environment data). Reuses BasePage's
     * generic dropdown handling, which already types into the panel's own filter box.
     */
    async selectFrequencyType(type: string) {
        console.log(`Selecting Frequency Type "${type}"...`);
        await this.selectDropdown(this.frequencyTypeDropdown, type);
    }

    async selectFirstDayOfWeek(): Promise<string> {
        console.log('Selecting first available Day of the Week...');
        return this.selectFirstDropdownOption(this.frequencyDayDropdown);
    }

    async getDropdownOptionCount(dropdownLocator: Locator): Promise<number> {
        const panel = await this.openDropdown(dropdownLocator);
        return panel.locator(segmentTaggingLocators.dropdownItem).count();
    }

    /**
     * Opens a dropdown and types into its filter/search box, returning the still-open panel so
     * callers can assert on the narrowed option list (or the "no results" empty-state message)
     * before deciding whether to select anything.
     */
    async filterDropdown(dropdownLocator: Locator, term: string): Promise<Locator> {
        const panel = await this.openDropdown(dropdownLocator);
        await this.typeInDropdownFilter(panel, term);
        return panel;
    }

    /**
     * Types into an ALREADY-OPEN dropdown panel's filter box, without re-clicking the trigger.
     * Confirmed live: re-clicking a dropdown's trigger while its panel is still open toggles it
     * CLOSED (PrimeNG dropdowns open/close on alternating clicks, they don't just "ensure open")
     * — so calling openDropdown()/filterDropdown() again on the same dropdown to narrow an
     * already-open panel's list would close-then-reopen it instead of just re-filtering,
     * flaking under timing/animation. Callers that need multiple filter passes on one dropdown
     * (e.g. narrow, read the results, narrow further) should open once via filterDropdown() and
     * reuse the returned panel with this method instead of calling filterDropdown() again.
     */
    async typeInDropdownFilter(panel: Locator, term: string) {
        const filterInput = panel.locator(segmentTaggingLocators.dropdownFilterInput).first();
        await filterInput.waitFor({ state: 'visible', timeout: 5000 });
        await filterInput.fill(term);
        await this.page.waitForTimeout(500);
    }

    // ─── Percentage / Next Execution Date ──────────────────────────────────────

    async fillPercentage(value: string) {
        await this.fillInput(this.percentageInput, value);
    }

    /**
     * Opens the Next Execution Date calendar and picks the first enabled day in the current
     * view — same "pick first for a start-style date" idiom already proven elsewhere
     * (CashbackPage, ToastConfigPage's Schedule Start Date).
     */
    async setNextExecutionDate() {
        console.log('Selecting Next Execution Date...');
        await this.nextExecutionInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#nextExecution_panel, .p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const day = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await day.click();
        await this.page.waitForTimeout(300);
    }

    // ─── Set a Time (hour/minute arrows) ────────────────────────────────────────

    /**
     * Adjusts a PrimeVue time-only picker via its increment arrows rather than typing — matches
     * the pattern already proven for ToastConfigPage's Schedule calendars/CompAlertsPage's
     * clock-arrow time adjustment. Logs and no-ops if the arrows never render rather than
     * throwing.
     */
    private async adjustTimeViaArrows(panel: Locator, hourClicks: number, minuteClicks: number) {
        const hourArrow = panel
            .locator('.p-hour-picker [data-pc-section="incrementbutton"], .p-hour-picker button:has(.pi-chevron-up), .p-hour-picker a.p-link:has(.pi-chevron-up)')
            .first();
        const minuteArrow = panel
            .locator('.p-minute-picker [data-pc-section="incrementbutton"], .p-minute-picker button:has(.pi-chevron-up), .p-minute-picker a.p-link:has(.pi-chevron-up)')
            .first();

        if (await hourArrow.isVisible({ timeout: 3000 }).catch(() => false)) {
            for (let i = 0; i < hourClicks; i++) {
                await hourArrow.click();
                await this.page.waitForTimeout(150);
            }
        } else {
            console.log('Hour increment arrow not found on the time picker — skipping time adjustment.');
        }

        if (minuteClicks > 0 && await minuteArrow.isVisible({ timeout: 2000 }).catch(() => false)) {
            for (let i = 0; i < minuteClicks; i++) {
                await minuteArrow.click();
                await this.page.waitForTimeout(150);
            }
        }
    }

    /**
     * Opens the "Set a Time" popup and increments the hour/minute pickers via their arrows —
     * per explicit instruction, this field is set using the arrows rather than typing.
     */
    async setFrequencyTimeViaArrows(hourClicks: number = 2, minuteClicks: number = 1) {
        console.log('Setting time via the Set a Time arrows...');
        await this.frequencyTimeInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#frequencyTime_panel, .p-datepicker-panel, .p-datepicker, .p-timepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        await this.adjustTimeViaArrows(panel, hourClicks, minuteClicks);
        await this.page.waitForTimeout(300);
    }

    async getFrequencyTimeValue(): Promise<string> {
        return (await this.frequencyTimeInput.inputValue()).trim();
    }

    // ─── Conditional field visibility (Daily / Weekly / Once Off) ─────────────

    async isFrequencyTimeVisible(): Promise<boolean> {
        return this.frequencyTimeInput.isVisible().catch(() => false);
    }

    async isFrequencyDayVisible(): Promise<boolean> {
        return this.frequencyDayDropdown.isVisible().catch(() => false);
    }

    // ─── Publish to Elsa toggle ─────────────────────────────────────────────────

    /**
     * Clicks the toggle's own root element rather than its <label> — the label's `for` points
     * at the switch's wrapper div (id="publishToElsa"), not at the actual, unlabeled <input>
     * nested inside it. A <label for="..."> only auto-forwards clicks to a genuine labelable
     * form control (input/button/select/etc.) sharing that id; here the id belongs to a <div>,
     * so clicking the label is a no-op. PrimeVue's InputSwitch binds its own click handler to
     * the root div (the same element a user visually clicks), so target that instead.
     */
    async togglePublishToElsa() {
        console.log('Toggling "Publish to Elsa?"...');
        await this.clickElement(this.publishToElsaToggle);
    }

    async isPublishToElsaOn(): Promise<boolean> {
        return (await this.publishToElsaToggle.getAttribute('aria-checked')) === 'true';
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Create Segmentation Tag popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create Segmentation Tag popup...');
        await this.clickElement(this.cancelBtn);
    }

    // ─── Delete confirmation dialog (PrimeNG ConfirmDialog, Yes/No) ────────────

    async clickConfirmYes() {
        console.log('Clicking Yes on the confirmation dialog...');
        await this.clickElement(this.confirmDialogAcceptBtn);
    }

    async clickConfirmNo() {
        console.log('Clicking No on the confirmation dialog...');
        await this.clickElement(this.confirmDialogRejectBtn);
    }

    // ─── Table / search ─────────────────────────────────────────────────────────

    async searchSegmentTag(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Returns the table row matching the given text. The Create popup has no dedicated "Name"
     * field, so callers identify a created row by the Segment Group text returned from
     * selectFirstSegmentGroup() — confirmed live that the list table's own "Segmentation"
     * column displays the Segment Group, not the Tag (searching by Tag text never matches any
     * row). Combined with this table's assumed newest-first sort (consistent with every other
     * module in this app), .first() is expected to be the just-created row rather than some
     * pre-existing one that happens to share the same group.
     */
    getRowByName(name: string): Locator {
        return this.segmentTagTable.locator('tbody tr', { hasText: name }).first();
    }

    async isSegmentTagVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchSegmentTag(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /**
     * Verifies a Segmentation Tag has actually been deleted. Actively waits for the row to
     * become hidden/detached rather than polling `isSegmentTagVisibleByName` for `false` — right
     * after confirming a delete, the row can still be present for a moment while the backend
     * delete + list refresh are still in flight, so a short "is it visible yet" check can read
     * `true` and then flip to gone moments later. waitFor({state:'hidden'}) also resolves true
     * once the row locator matches zero elements (e.g. the table shows "Nothing found"), so it
     * correctly succeeds whether the row goes hidden or is removed from the DOM entirely.
     */
    async isSegmentTagAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchSegmentTag(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    async clickDeleteForSegmentTag(name: string) {
        console.log(`Clicking Delete for Segment Tag "${name}"...`);
        await this.searchSegmentTag(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: segmentTaggingLocators.buttonDelete, exact: true }));
    }

    async clickEditForSegmentTag(name: string) {
        console.log(`Clicking Edit for Segment Tag "${name}"...`);
        await this.searchSegmentTag(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: segmentTaggingLocators.buttonEdit, exact: true }));
    }
}
