import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { toastConfigLocators } from '../locators/toastConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class ToastConfigPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createToastConfigBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    readonly scheduleBtn: Locator;
    readonly searchInput: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden,
    // not removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly toastConfigTable: Locator;

    // Create/Edit Toast Configuration popup
    readonly popupDialog: Locator;
    readonly nameInput: Locator;
    readonly dialogRegionDropdown: Locator;
    readonly pathInput: Locator;
    readonly availableCountriesInput: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Included/Excluded Account Tags containers
    readonly includedTagsContainer: Locator;
    readonly excludedTagsContainer: Locator;

    // Delete confirmation dialog (PrimeNG ConfirmDialog)
    readonly confirmDialogAcceptBtn: Locator;
    readonly confirmDialogRejectBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${toastConfigLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.createToastConfigBtn = page.getByRole('button', { name: toastConfigLocators.buttonCreateToastConfig, exact: true });
        this.editBtn = page.getByRole('button', { name: toastConfigLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: toastConfigLocators.buttonDelete, exact: true });
        this.scheduleBtn = page.getByRole('button', { name: toastConfigLocators.buttonSchedule, exact: true });
        this.searchInput = page.locator(toastConfigLocators.searchInput);
        this.toastConfigTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.nameInput = page.locator(toastConfigLocators.inputName);
        this.dialogRegionDropdown = page.locator(toastConfigLocators.dialogRegionDropdown);
        this.pathInput = page.locator(toastConfigLocators.inputPath);
        this.availableCountriesInput = page.locator(toastConfigLocators.inputAvailableCountries);
        this.saveBtn = page.getByRole('button', { name: toastConfigLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: toastConfigLocators.buttonCancel, exact: true });

        this.includedTagsContainer = page.locator(toastConfigLocators.includedTagsContainer);
        this.excludedTagsContainer = page.locator(toastConfigLocators.excludedTagsContainer);

        this.confirmDialogAcceptBtn = page.locator(toastConfigLocators.confirmDialogAccept);
        this.confirmDialogRejectBtn = page.locator(toastConfigLocators.confirmDialogReject);
    }

    private async openDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        );
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Toast Configuration...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(toastConfigLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreateToastConfig() {
        console.log('Clicking Create Toast Config button...');
        await this.clickElement(this.createToastConfigBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickEditFirstToastConfig() {
        console.log('Clicking Edit button for the first Toast Configuration...');
        if (await this.editBtn.count() > 0) {
            await this.clickElement(this.editBtn.first());
            await this.page.waitForTimeout(1000);
        }
    }

    async clickDeleteFirstToastConfig() {
        console.log('Clicking Delete button for the first Toast Configuration...');
        if (await this.deleteBtn.count() > 0) {
            await this.clickElement(this.deleteBtn.first());
            await this.page.waitForTimeout(1000);
        }
    }

    // ─── Create/Edit popup ──────────────────────────────────────────────────────

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        // <banner-tags> is a Stencil web component (confirmed by its "hydrated" class marker,
        // the same pattern this app's other Stencil components show elsewhere) — its internal
        // rows aren't queryable until hydration finishes, which can lag slightly behind the
        // rest of the dialog. Confirmed live: measuring a row count immediately after this
        // method returned 0 instead of 1, undercounting the "before" state of an Add/Delete
        // test. Wait for at least the first row in each tag group before returning.
        await this.includedTagsContainer.locator(toastConfigLocators.tagRow).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
        await this.excludedTagsContainer.locator(toastConfigLocators.tagRow).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    }

    async fillName(name: string) {
        await this.fillInput(this.nameInput, name);
    }

    async fillPath(path: string) {
        await this.fillInput(this.pathInput, path);
    }

    async fillAvailableCountries(codes: string) {
        await this.fillInput(this.availableCountriesInput, codes);
    }

    /**
     * Selects a specific Region in the popup's Region field by name — unlike State/Occurrence/
     * Content (any valid option is fine), the Region here MUST match whatever the caller later
     * searches for via the page-level Region filter, so this takes an explicit name rather than
     * picking "first available".
     */
    async selectRegionInDialog(regionName: string) {
        console.log(`Selecting Region "${regionName}" in Toast Config dialog...`);
        await this.selectDropdown(this.dialogRegionDropdown, regionName);
    }

    /**
     * Opens a plain PrimeNG dropdown and picks whichever option renders first — used for
     * State/Occurrence/Content, whose actual option values are app/environment data and not
     * safe to hardcode. Retries the click once if the panel doesn't open on the first try,
     * since the same click can land on dismissing a still-open calendar overlay instead
     * (confirmed live: State's own click doubles as what closes the End Date calendar per the
     * app's UX — see selectFirstState).
     */
    private async selectFirstDropdownOption(dropdownLocator: Locator): Promise<string> {
        await this.clickElement(dropdownLocator);
        let panel = this.page.locator('.p-dropdown-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
            await this.page.waitForTimeout(300);
            await dropdownLocator.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            panel = this.page.locator('.p-dropdown-panel').last();
        }
        const option = panel.locator('.p-dropdown-item, [role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        return text;
    }

    /**
     * Selects the first available State option. Per the app's UX, clicking this dropdown is
     * also what dismisses the End Date calendar if it's still open — so this is deliberately
     * called right after setting the End Date, not in isolation.
     */
    async selectFirstState(): Promise<string> {
        console.log('Selecting first available State (also closes the End Date calendar if open)...');
        return this.selectFirstDropdownOption(this.page.locator(toastConfigLocators.dialogStateDropdown));
    }

    async selectFirstOccurrence(): Promise<string> {
        console.log('Selecting first available Occurrence...');
        return this.selectFirstDropdownOption(this.page.locator(toastConfigLocators.dialogOccurrenceDropdown));
    }

    async selectFirstContent(): Promise<string> {
        console.log('Selecting first available Content...');
        return this.selectFirstDropdownOption(this.page.locator(toastConfigLocators.dialogContentDropdown));
    }

    async isStateDisabled(): Promise<boolean> {
        return this.page.locator(`${toastConfigLocators.dialogStateDropdown} input`).first().isDisabled();
    }

    // ─── Start/End Date-Time calendars ─────────────────────────────────────────

    /**
     * Adjusts a PrimeVue time (hour/minute) picker via its increment/decrement arrows rather
     * than typing — matches the pattern already proven for CompAlertsPage's clock-arrow time
     * adjustment, extended here with decrement support (needed to move the time BACKWARD, e.g.
     * "4 hours earlier than now"). Logs and no-ops if the arrows never render rather than
     * throwing — a combined date+time panel's text format isn't known ahead of time, so typing
     * a literal fallback value isn't attempted here.
     */
    private async adjustTimeViaArrows(panel: Locator, hourClicks: number, minuteClicks: number, direction: 'up' | 'down') {
        const chevronClass = direction === 'up' ? 'pi-chevron-up' : 'pi-chevron-down';
        const sectionAttr = direction === 'up' ? 'incrementbutton' : 'decrementbutton';

        const hourArrow = panel
            .locator(`.p-hour-picker [data-pc-section="${sectionAttr}"], .p-hour-picker button:has(.${chevronClass}), .p-hour-picker a.p-link:has(.${chevronClass})`)
            .first();
        const minuteArrow = panel
            .locator(`.p-minute-picker [data-pc-section="${sectionAttr}"], .p-minute-picker button:has(.${chevronClass}), .p-minute-picker a.p-link:has(.${chevronClass})`)
            .first();

        if (await hourArrow.isVisible({ timeout: 3000 }).catch(() => false)) {
            for (let i = 0; i < hourClicks; i++) {
                await hourArrow.click();
                await this.page.waitForTimeout(150);
            }
        } else {
            console.log(`Hour ${direction} arrow not found on the time picker — skipping time adjustment.`);
        }

        if (minuteClicks > 0 && await minuteArrow.isVisible({ timeout: 2000 }).catch(() => false)) {
            for (let i = 0; i < minuteClicks; i++) {
                await minuteArrow.click();
                await this.page.waitForTimeout(150);
            }
        }
    }

    /**
     * Opens the Start Date (UTC) calendar and selects TODAY specifically (not just any enabled
     * day) — the widget defaults its time portion to the current clock time when first opened
     * with no prior value, and per explicit instruction, a Start Date-Time left at (or too close
     * to) "now" should instead be moved 4 hours earlier via the hour decrement arrow, rather
     * than computing/typing an absolute value.
     */
    async setStartDateTimeToTodayMinusFourHours() {
        console.log('Opening Start Date calendar and selecting today...');
        const startInput = this.page.locator(`${toastConfigLocators.calendarStartDateTime} input`);
        await startInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#startDateTime_panel, .p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const todayCell = panel.locator('.p-datepicker-today span, .p-datepicker-today').first();
        await todayCell.waitFor({ state: 'visible', timeout: 5000 });
        await todayCell.click();
        await this.page.waitForTimeout(300);

        // Move the time back 4 hours (4 clicks, 1 hour per click) rather than forward — confirmed
        // via user instruction: today's Start Date should not be left at (too close to) "now".
        await this.adjustTimeViaArrows(panel, 4, 0, 'down');
        await this.page.waitForTimeout(300);
    }

    /**
     * Opens the End Date (UTC) calendar — clicking its input also closes the Start Date
     * calendar if still open, per this app's UX (confirmed pattern: clicking the next
     * field dismisses the previous overlay) — and selects the last enabled day in the
     * current view (guaranteed to be after today, same "pick first for start / last for
     * end" idiom already proven in CashbackPage).
     */
    async setEndDateTimeToLastAvailableDay() {
        console.log('Clicking End Date field (also closes the Start Date calendar) and selecting a day...');
        const endInput = this.page.locator(`${toastConfigLocators.calendarEndDateTime} input`);
        await endInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#endDateTime_panel, .p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const lastDay = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await lastDay.click();
        await this.page.waitForTimeout(300);
    }

    // ─── Included/Excluded Account Tags (repeatable rows) ──────────────────────

    tagRowAt(container: Locator, index: number): Locator {
        return container.locator(toastConfigLocators.tagRow).nth(index);
    }

    async getTagRowCount(container: Locator): Promise<number> {
        return container.locator(toastConfigLocators.tagRow).count();
    }

    async selectFirstTagOption(container: Locator, rowIndex: number): Promise<string> {
        const dropdown = this.tagRowAt(container, rowIndex).locator(toastConfigLocators.tagSelectDropdown);
        return this.selectFirstDropdownOption(dropdown);
    }

    async fillTagValue(container: Locator, rowIndex: number, value: string) {
        await this.fillInput(this.tagRowAt(container, rowIndex).locator(toastConfigLocators.tagValueInput), value);
    }

    getTagValueInputAt(container: Locator, rowIndex: number): Locator {
        return this.tagRowAt(container, rowIndex).locator(toastConfigLocators.tagValueInput);
    }

    /**
     * Clicks Add on the LAST existing row in the group — each row carries its own Add/Delete
     * pair (confirmed from markup), so targeting the last one is "add another after the
     * current last row", the natural/expected usage.
     */
    async clickAddTagRow(container: Locator) {
        console.log('Clicking Add on tag row group...');
        const rows = container.locator(toastConfigLocators.tagRow);
        const count = await rows.count();
        await this.clickElement(rows.nth(count - 1).locator(toastConfigLocators.buttonAddTagRow));
    }

    async clickDeleteTagRow(container: Locator, rowIndex: number) {
        console.log(`Clicking Delete on tag row ${rowIndex}...`);
        await this.clickElement(this.tagRowAt(container, rowIndex).locator(toastConfigLocators.buttonDeleteTagRow));
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Toast Configuration popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Toast Configuration popup...');
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

    /**
     * Types into the app-wide table search box. Per the app's UX, a Region must already be
     * selected via the page-level Region filter before searching returns meaningful results.
     */
    async searchToastConfig(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    getRowByName(name: string): Locator {
        return this.toastConfigTable.locator('tbody tr', { hasText: name }).first();
    }

    async isToastConfigVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchToastConfig(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async clickDeleteForToastConfig(name: string) {
        console.log(`Clicking Delete for Toast Configuration "${name}"...`);
        await this.searchToastConfig(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: toastConfigLocators.buttonDelete, exact: true }));
    }

    /**
     * Searches for a Toast Configuration by name and clicks its row's Edit button (opens the
     * Edit popup — same dialog/fields as Create, pre-filled with the existing data).
     */
    async clickEditForToastConfig(name: string) {
        console.log(`Clicking Edit for Toast Configuration "${name}"...`);
        await this.searchToastConfig(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: toastConfigLocators.buttonEdit, exact: true }));
    }

    /**
     * Searches for a Toast Configuration by name and clicks its row's Schedule button (opens
     * the Schedule popup).
     */
    async clickScheduleForToastConfig(name: string) {
        console.log(`Clicking Schedule for Toast Configuration "${name}"...`);
        await this.searchToastConfig(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: toastConfigLocators.buttonSchedule, exact: true }));
    }

    // ─── Schedule popup ─────────────────────────────────────────────────────────

    /**
     * Opens a PrimeNG/PrimeVue multiselect (chip-display mode) and selects the first `count`
     * options — unlike a plain p-dropdown, the panel stays open after each click, letting more
     * than one option be selected in the same interaction, per this popup's fields all allowing
     * multiple selections. Returns the selected options' text.
     *
     * The panel is deliberately left OPEN on return — per explicit instruction (confirmed for
     * Execute At Hour -> Duration), this app's overlays are dismissed by clicking whichever
     * field comes next in the form, the same "next field closes the previous overlay"
     * convention already proven for the Create popup's calendars/dropdowns. Re-clicking this
     * same trigger to self-toggle it closed was never confirmed reliable for this widget, so
     * callers must explicitly dismiss via closeOverlayViaField (or their own next field click)
     * instead of assuming this method leaves things closed.
     */
    async selectMultiSelectOptionsByCount(multiSelectLocator: Locator, count: number): Promise<string[]> {
        await this.closeAnyOpenMultiSelectPanel();
        await this.clickElement(multiSelectLocator);
        await this.page.waitForTimeout(300);

        let panel = this.page.locator('.p-multiselect-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
            // First click may have only dismissed a still-open PREVIOUS overlay (another
            // multiselect, a calendar, etc.) instead of opening this one — the same pitfall
            // BasePage.selectDropdown already guards against for plain p-dropdown fields.
            // Matters here once multiple multiselects are filled back-to-back in one test.
            await this.page.waitForTimeout(300);
            await multiSelectLocator.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            panel = this.page.locator('.p-multiselect-panel').last();
        }
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        const options = panel.locator(toastConfigLocators.multiSelectItem);
        const total = await options.count();
        const toSelect = Math.min(count, total);
        const selected: string[] = [];

        for (let i = 0; i < toSelect; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            await options.nth(i).click();
            selected.push(text);
            await this.page.waitForTimeout(150);
        }

        return selected;
    }

    /**
     * Dismisses whichever calendar/dropdown/multiselect overlay is currently open by clicking
     * a neutral field — matches this app's established convention (Create popup: End Date
     * closes Start Date's calendar, State closes End Date's calendar; Schedule popup: Duration
     * closes Execute At Hour's multiselect). Safe to call even if nothing is open.
     */
    async closeOverlayViaField(fieldLocator: Locator) {
        await fieldLocator.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    /**
     * Closes a multiselect panel left open by a previous selectMultiSelectOptionsByCount call,
     * if one is still open. These panels are absolutely-positioned overlays that don't reflow
     * the form beneath them, so on this compact popup a still-open panel (e.g. Active Months'
     * 12-item list) can visually cover a later field's own trigger or input. That's a deadlock
     * for Playwright: the covering panel would only close in reaction to a click landing outside
     * it, but Playwright's actionability check refuses to dispatch a click it can see is
     * obscured — so the click on the next field retries forever and the panel never gets the
     * outside click that would have closed it.
     *
     * Confirmed live: pressing Escape closes the panel but ALSO closes the parent "Create
     * Schedule" dialog itself (its own Escape handler fires from the same keydown), which then
     * makes every subsequent field wait forever since the whole popup is gone. Clicking the
     * dialog's header instead is an "outside click" for the multiselect panel without being
     * one for the dialog (dialogs here only close via Cancel/Save/the X button, not by
     * clicking their own content), so it dismisses the panel without the side effect.
     */
    private async closeAnyOpenMultiSelectPanel() {
        const openPanel = this.page.locator('.p-multiselect-panel').last();
        if (await openPanel.isVisible().catch(() => false)) {
            await this.popupDialog.locator('.p-dialog-header').first().click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async getMultiSelectChipCount(multiSelectLocator: Locator): Promise<number> {
        return multiSelectLocator.locator(toastConfigLocators.multiSelectChip).count();
    }

    async selectActiveMonths(count: number): Promise<string[]> {
        console.log(`Selecting ${count} Active Months option(s)...`);
        return this.selectMultiSelectOptionsByCount(this.page.locator(toastConfigLocators.scheduleActiveMonths), count);
    }

    async selectActiveDays(count: number): Promise<string[]> {
        console.log(`Selecting ${count} Active Days option(s)...`);
        return this.selectMultiSelectOptionsByCount(this.page.locator(toastConfigLocators.scheduleActiveDays), count);
    }

    async selectActiveDaysOfMonth(count: number): Promise<string[]> {
        console.log(`Selecting ${count} Days Of Month option(s)...`);
        return this.selectMultiSelectOptionsByCount(this.page.locator(toastConfigLocators.scheduleActiveDaysOfMonth), count);
    }

    async selectExecuteAtHours(count: number): Promise<string[]> {
        console.log(`Selecting ${count} Execute At Hour option(s)...`);
        return this.selectMultiSelectOptionsByCount(this.page.locator(toastConfigLocators.scheduleExecuteAtHour), count);
    }

    async fillExecuteAtMinute(value: string) {
        await this.closeAnyOpenMultiSelectPanel();
        await this.fillInput(this.page.locator(`${toastConfigLocators.scheduleExecuteAtMinute} input`), value);
    }

    async fillDuration(value: string) {
        await this.closeAnyOpenMultiSelectPanel();
        await this.fillInput(this.page.locator(`${toastConfigLocators.scheduleDuration} input`), value);
    }

    /**
     * Opens a Schedule popup date field (Start/End Date — plain date pickers, no time
     * component here since time-of-day is covered separately by Execute At Hour/Minute) and
     * picks the first or last enabled day in the current view — same proven idiom as
     * CashbackPage's pickCalendarDay.
     */
    private async pickScheduleCalendarDay(fieldSelector: string, selectLast: boolean) {
        await this.closeAnyOpenMultiSelectPanel();
        const input = this.page.locator(`${fieldSelector} input`);
        await input.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator(`${fieldSelector}_panel, .p-datepicker-panel, .p-datepicker`).last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const day = selectLast
            ? panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last()
            : panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await day.click();
        await this.page.waitForTimeout(300);
    }

    async setScheduleStartDate() {
        console.log('Selecting Schedule Start Date...');
        await this.pickScheduleCalendarDay(toastConfigLocators.scheduleStartDate, false);
    }

    async setScheduleEndDate() {
        console.log('Selecting Schedule End Date...');
        await this.pickScheduleCalendarDay(toastConfigLocators.scheduleEndDate, true);
    }
}
