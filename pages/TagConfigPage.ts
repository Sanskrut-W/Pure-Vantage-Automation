import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { tagConfigLocators } from '../locators/tagConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class TagConfigPage extends BasePage {
    readonly createTagBtn: Locator;
    readonly editBtn: Locator;
    readonly searchInput: Locator;
    readonly showNonActiveToggle: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden,
    // not removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly tagTable: Locator;

    // Create/Edit Tag popup
    readonly popupDialog: Locator;
    readonly tagNameInput: Locator;
    readonly descriptionInput: Locator;
    readonly userExpiryDaysInput: Locator;
    readonly expiryDateInput: Locator;
    readonly expiryTypeDropdown: Locator;
    readonly campaignDropdown: Locator;
    readonly isInternalTagCheckbox: Locator;
    // Edit-popup-only — not present when creating a new tag (new tags are always active by
    // default, confirmed live: checked/highlighted the moment Edit is opened on a fresh tag).
    readonly isActiveCheckbox: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createTagBtn = this.page.locator(tagConfigLocators.createTagBtn);
        this.editBtn = this.page.locator(tagConfigLocators.editBtn).first();
        this.searchInput = page.locator(tagConfigLocators.searchInput);
        this.showNonActiveToggle = page.locator(tagConfigLocators.showNonActiveToggle);
        this.tagTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.tagNameInput = page.locator(tagConfigLocators.inputTagName);
        this.descriptionInput = page.locator(tagConfigLocators.inputDescription);
        this.userExpiryDaysInput = page.locator(tagConfigLocators.inputUserExpiryDays);
        this.expiryDateInput = page.locator(tagConfigLocators.calendarTagExpiryDate);
        this.expiryTypeDropdown = page.locator(tagConfigLocators.dropdownExpiryType);
        this.campaignDropdown = page.locator(tagConfigLocators.dropdownCampaign);
        this.isInternalTagCheckbox = page.locator(tagConfigLocators.checkboxIsInternalTag);
        this.isActiveCheckbox = page.locator(tagConfigLocators.checkboxIsActive);
        this.saveBtn = page.getByRole('button', { name: tagConfigLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: tagConfigLocators.buttonCancel, exact: true });
    }

    async clickCreateTag() {
        console.log('Clicking Create Tag button...');
        await this.clickElement(this.createTagBtn);
        await this.page.waitForTimeout(500);
    }

    async clickEdit() {
        console.log('Clicking Edit button...');
        await this.clickElement(this.editBtn);
        await this.page.waitForTimeout(500);
    }

    /** Searches for a specific tag by name and clicks ITS Edit button — needed for the Is
     * Active flow, which must operate on a tag this test created, never an arbitrary
     * pre-existing row (clickEdit() always targets whichever row happens to be first). */
    async clickEditForTag(name: string) {
        console.log(`Clicking Edit for Tag "${name}"...`);
        await this.searchTag(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator('button[aria-label="Edit"]'));
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    // ─── Text fields ────────────────────────────────────────────────────────────

    async fillTagName(value: string) {
        console.log(`Filling Tag Name: "${value}"...`);
        await this.fillInput(this.tagNameInput, value);
    }

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    /** Clears and types a value into the User Expiry Days PrimeVue InputNumber field,
     * verifying it actually landed — the same decimal-mode fix already proven throughout this
     * suite (e.g. ManualCompsPage.fillNumberField): a plain .fill() sets the DOM value but
     * PrimeVue's InputNumber doesn't reliably pick that up into its Angular model. */
    async fillUserExpiryDays(value: string) {
        console.log(`Filling User Expiry Days: "${value}"...`);
        const input = this.userExpiryDaysInput;
        await input.waitFor({ state: 'visible', timeout: 5000 });

        for (let attempt = 0; attempt < 3; attempt++) {
            await input.click({ clickCount: 3 });
            await input.press('Control+A');
            await input.press('Delete');
            await input.pressSequentially(value);
            await input.blur();

            const digitsOnly = (await input.inputValue()).replace(/[^\d.-]/g, '');
            if (digitsOnly === value) return;
        }

        await input.evaluate((el: HTMLInputElement, val: string) => {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
            nativeSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
        await input.blur();
    }

    async getUserExpiryDaysValue(): Promise<string> {
        return (await this.userExpiryDaysInput.inputValue()).trim();
    }

    // ─── Tag Expiry Date calendar ───────────────────────────────────────────────

    /**
     * Opens the Tag Expiry Date calendar, picks the first enabled day in the current view, then
     * clicks the Expiry Type field to dismiss the still-open calendar overlay — per confirmed
     * live behavior, clicking elsewhere in this dialog (e.g. the dialog header, used by other
     * popups in this suite) does not close this particular calendar; clicking the Expiry Type
     * field does. Deliberately does NOT press Escape as a follow-up: Escape doesn't just close a
     * stray overlay here, it closes the entire "New/Edit Tag" dialog too (PrimeNG dialogs close
     * on Escape by default), which silently killed every test downstream of this method.
     *
     * That same dismiss-click also opens Expiry Type's OWN option panel as a side effect (it's a
     * PrimeNG dropdown — clicking it while closed opens it). Confirmed live: left open, that
     * panel silently intercepts every later click that lands underneath it (Save, Cancel, even a
     * force-clicked checkbox), so it must be closed again immediately — via a second click on the
     * trigger (PrimeNG toggles an open panel closed on the next click), not Escape.
     */
    async setTagExpiryDate() {
        console.log('Selecting Tag Expiry Date...');
        await this.expiryDateInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#expiry_panel, .p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const day = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await day.click();
        await this.page.waitForTimeout(300);

        // Close the calendar overlay by clicking the Expiry Type field.
        await this.expiryTypeDropdown.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);

        // That click may have opened Expiry Type's own dropdown panel — close it back down.
        const expiryTypePanel = this.page.locator('.p-dropdown-panel').last();
        if (await expiryTypePanel.isVisible().catch(() => false)) {
            await this.expiryTypeDropdown.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async getTagExpiryDateValue(): Promise<string> {
        return (await this.expiryDateInput.inputValue()).trim();
    }

    // ─── Generic PrimeNG dropdown helpers (Expiry Type / Campaign) ─────────────

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

    /** Expiry Type is a small, fixed enum (unlike Campaign, which is environment data) —
     * reuses BasePage's generic dropdown handling, which types into the panel's own filter box. */
    async selectExpiryType(type: string) {
        console.log(`Selecting Expiry Type "${type}"...`);
        await this.selectDropdown(this.expiryTypeDropdown, type);
    }

    async getExpiryTypeValue(): Promise<string> {
        return (await this.expiryTypeDropdown.locator('.p-dropdown-label').innerText()).trim();
    }

    /**
     * Opens Expiry Type and returns its option labels. Confirmed live: this dropdown's panel is
     * a plain listbox with no filter/search input at all (unlike Segment Group/Campaign-style
     * dropdowns elsewhere in this suite) — it's a small, fixed 4-item enum, so there's nothing to
     * filter. Closes the panel by clicking the trigger a second time (PrimeNG toggles an
     * already-open panel closed on the next click) rather than Escape, which would also close
     * the parent dialog.
     */
    async getExpiryTypeOptions(): Promise<string[]> {
        const panel = await this.openDropdown(this.expiryTypeDropdown);
        const names = await panel.locator(tagConfigLocators.dropdownItem).allInnerTexts();
        await this.expiryTypeDropdown.click();
        await this.page.waitForTimeout(200);
        return names.map(n => n.trim());
    }

    /** Opens Expiry Type and selects whichever option isn't the current ("Custom") default, so
     * callers can genuinely exercise a non-default value without hardcoding a label. No filter
     * box exists on this dropdown (see getExpiryTypeOptions) — selects directly from the list. */
    async selectNonDefaultExpiryType(): Promise<string> {
        console.log('Selecting a non-default Expiry Type...');
        const panel = await this.openDropdown(this.expiryTypeDropdown);
        const options = panel.locator(tagConfigLocators.dropdownItem);
        const count = await options.count();
        const target = count > 1 ? options.nth(1) : options.first();
        const text = ((await target.textContent()) ?? '').trim();
        await target.click();
        return text;
    }

    /** Opens the Campaign dropdown and selects whichever option renders first — Campaign values
     * are app/environment data and not safe to hardcode. Returns the selected option's text. */
    async selectFirstCampaign(): Promise<string> {
        console.log('Selecting first available Campaign...');
        const panel = await this.openDropdown(this.campaignDropdown);
        const option = panel.locator(tagConfigLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        return text;
    }

    async getDropdownOptionCount(dropdownLocator: Locator): Promise<number> {
        const panel = await this.openDropdown(dropdownLocator);
        return panel.locator(tagConfigLocators.dropdownItem).count();
    }

    /** Opens a dropdown and types into its filter/search box, returning the still-open panel so
     * callers can assert on the narrowed option list before deciding whether to select anything. */
    async filterDropdown(dropdownLocator: Locator, term: string): Promise<Locator> {
        const panel = await this.openDropdown(dropdownLocator);
        await this.typeInDropdownFilter(panel, term);
        return panel;
    }

    /** Types into an ALREADY-OPEN dropdown panel's filter box, without re-clicking the trigger —
     * re-clicking a dropdown's trigger while its panel is still open toggles it CLOSED (PrimeNG
     * dropdowns open/close on alternating clicks, they don't just "ensure open"). */
    async typeInDropdownFilter(panel: Locator, term: string) {
        const filterInput = panel.locator(tagConfigLocators.dropdownFilterInput).first();
        await filterInput.waitFor({ state: 'visible', timeout: 5000 });
        await filterInput.fill(term);
        await this.page.waitForTimeout(500);
    }

    // ─── Is Internal Tag checkbox ───────────────────────────────────────────────

    /**
     * Clicks the checkbox's own `.p-checkbox-box` rather than its `<label>` — this label has no
     * `for` attribute at all, so it has no native forwarding target and clicking it is a no-op.
     * PrimeVue's Checkbox renders a visually-hidden native `<input>` directly on top of the
     * visible box, which fails Playwright's "receives events" actionability check — force
     * bypasses that hit-test, safe here since the box is genuinely visible and clickable.
     */
    async toggleIsInternalTag() {
        console.log('Toggling "Is Internal Tag"...');
        const checkboxBox = this.isInternalTagCheckbox.locator('.p-checkbox-box');
        await CommonUtils.highlightElement(checkboxBox);
        await checkboxBox.click({ force: true });
    }

    async isInternalTagChecked(): Promise<boolean> {
        return (await this.isInternalTagCheckbox.getAttribute('data-p-highlight')) === 'true';
    }

    // ─── Is Active checkbox (Edit popup only) ──────────────────────────────────

    /** Same label-has-no-`for` / native-input-on-top situation as Is Internal Tag — click the
     * checkbox's own `.p-checkbox-box`, force-bypassing the hidden input's hit-test. */
    async toggleIsActive() {
        console.log('Toggling "Is Active"...');
        const checkboxBox = this.isActiveCheckbox.locator('.p-checkbox-box');
        await CommonUtils.highlightElement(checkboxBox);
        await checkboxBox.click({ force: true });
    }

    async isActiveChecked(): Promise<boolean> {
        return (await this.isActiveCheckbox.getAttribute('data-p-highlight')) === 'true';
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Create/Edit Tag popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create/Edit Tag popup...');
        await this.clickElement(this.cancelBtn);
    }

    // ─── Search / table ─────────────────────────────────────────────────────────

    async searchTag(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    getRowByName(name: string): Locator {
        return this.tagTable.locator('tbody tr', { hasText: name }).first();
    }

    async isTagVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchTag(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /** Waits for the table's real data rows (excluding the "No Data Found"/empty-state
     * placeholder row PrimeNG renders as a genuine <tr>) to settle before counting — see
     * TutorialOrderingPage.waitForStableRowCount for the confirmed race this guards against. */
    async getRowCount(): Promise<number> {
        const dataRows = this.tagTable.locator('tbody tr:not(.p-datatable-emptymessage)');
        try {
            await dataRows.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            return 0;
        }
        const deadline = Date.now() + 15000;
        let previousCount = -1;
        while (Date.now() < deadline) {
            const currentCount = await dataRows.count();
            if (currentCount === previousCount) return currentCount;
            previousCount = currentCount;
            await this.page.waitForTimeout(300);
        }
        return previousCount;
    }

    // ─── Show non-active tags toggle ────────────────────────────────────────────

    async toggleShowNonActive() {
        console.log('Toggling "Show non-active tags"...');
        await this.clickElement(this.showNonActiveToggle);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async isShowNonActiveOn(): Promise<boolean> {
        return (await this.showNonActiveToggle.getAttribute('aria-checked')) === 'true';
    }
}
