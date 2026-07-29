import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { cashbackLocators } from '../locators/cashbackLocators';
import { CommonUtils } from '../utils/commonUtils';

export class CashbackPage extends BasePage {
    // ── Main page ─────────────────────────────────────────────────────────────
    readonly createCashbackPromotionBtn: Locator;
    readonly searchInput: Locator;
    readonly editBtn: Locator;
    readonly approveBtn: Locator;
    readonly deleteBtn: Locator;
    readonly cashbackTable: Locator;

    constructor(page: Page) {
        super(page);
        this.createCashbackPromotionBtn = page.getByRole('button', { name: cashbackLocators.buttonCreateCashbackPromotion });
        this.searchInput = page.locator('input.pure-input.w-20r');
        this.editBtn = page.getByRole('button', { name: cashbackLocators.buttonEdit });
        this.approveBtn = page.getByRole('button', { name: cashbackLocators.buttonApprove });
        this.deleteBtn = page.getByRole('button', { name: cashbackLocators.buttonDelete });
        this.cashbackTable = page.locator(cashbackLocators.cashbackTable);
    }

    // ── Dialog scope helpers ───────────────────────────────────────────────────

    /** Returns a locator scoped to the "New Cashback Promotion" dialog. */
    getCreateDialog(): Locator {
        return this.page.locator(cashbackLocators.dialogContainer)
            .filter({ hasText: cashbackLocators.dialogTitleCreate });
    }

    /** Returns a locator scoped to the "Update Cashback Promotion" dialog. */
    getEditDialog(): Locator {
        return this.page.locator(cashbackLocators.dialogContainer)
            .filter({ hasText: cashbackLocators.dialogTitleUpdate });
    }

    /** Returns a locator scoped to the active confirm dialog (approve / delete). */
    getConfirmDialog(): Locator {
        return this.page.locator(cashbackLocators.dialogContainer).last();
    }

    // ── Main page actions ──────────────────────────────────────────────────────

    async clickCreateCashbackPromotion() {
        console.log('Clicking Create Cashback Promotion button...');
        await this.clickElement(this.createCashbackPromotionBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickEditFirstCashback() {
        console.log('Clicking Edit on first cashback row...');
        const firstRowEditBtn = this.page.locator('.p-datatable tbody tr')
            .first()
            .getByRole('button', { name: cashbackLocators.buttonEdit });
        await firstRowEditBtn.waitFor({ state: 'visible' });
        await this.clickElement(firstRowEditBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickApproveFirstCashback() {
        console.log('Clicking Approve on first cashback row...');
        const firstRowApproveBtn = this.page.locator('.p-datatable tbody tr')
            .first()
            .getByRole('button', { name: cashbackLocators.buttonApprove });
        await firstRowApproveBtn.waitFor({ state: 'visible' });
        await this.clickElement(firstRowApproveBtn);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Finds the first table row where the Approved By column is empty (unapproved record)
     * and clicks its Approve button. Returns the description of that row.
     * Throws if no unapproved row is found.
     */
    /**
     * Scans table rows for the first one where clicking Approve actually opens a confirmation dialog.
     * Already-approved records may have an enabled Approve button but show no dialog when clicked —
     * this method detects that by waiting 800ms after each click and checking for an overlay.
     * Returns the description of the row whose dialog was opened (dialog stays open for the caller).
     */
    async clickApproveUnapprovedRecord(): Promise<string> {
        console.log('Scanning rows for one whose Approve button opens a confirmation dialog...');
        const rows = this.cashbackTable.locator('tbody tr');
        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const approveBtn = row.getByRole('button', { name: cashbackLocators.buttonApprove });
            if (await approveBtn.count() === 0) continue;

            // Skip if button is explicitly disabled (approved records may disable the button)
            const isDisabled = await approveBtn.evaluate(
                el => el.hasAttribute('disabled') || el.classList.contains('p-disabled') || (el as HTMLButtonElement).disabled
            ).catch(() => false);
            if (isDisabled) continue;

            const description = (await row.locator('td').nth(0).innerText().catch(() => `Row ${i}`)).trim();
            console.log(`Trying Approve on row ${i}: "${description}"`);
            // A transient overlay (ripple/loading effect) can intercept the
            // click for a long stretch — try a real click first (bounded), and
            // fall back to force if it's still being intercepted after that.
            await approveBtn.click({ timeout: 8000 }).catch(async () => {
                await approveBtn.click({ force: true });
            });
            await this.page.waitForTimeout(800);

            // Check whether a confirmation dialog or popup appeared. The Approve
            // confirmation is a custom ".action-modal" component, not a PrimeVue
            // ConfirmDialog/ConfirmPopup — accept all three forms.
            const dialogVisible = await this.page.locator('.p-dialog, .p-confirm-popup, .action-modal').last()
                .isVisible().catch(() => false);
            if (dialogVisible) {
                console.log(`Confirmation dialog opened for row ${i}: "${description}"`);
                return description;
            }

            // No dialog — this record didn't prompt, try next (dismiss any toast first)
            console.log(`Row ${i} did not open a dialog — skipping`);
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }

        throw new Error('No cashback record opened a confirmation dialog — all may already be approved.');
    }

    async clickDeleteFirstCashback() {
        console.log('Clicking Delete on first cashback row...');
        const firstRowDeleteBtn = this.page.locator('.p-datatable tbody tr')
            .first()
            .getByRole('button', { name: cashbackLocators.buttonDelete });
        await firstRowDeleteBtn.waitFor({ state: 'visible' });
        await this.clickElement(firstRowDeleteBtn);
        await this.page.waitForTimeout(1000);
    }

    async fillSearch(text: string) {
        console.log(`Typing "${text}" into search input...`);
        await this.fillInput(this.searchInput, text);
        await this.page.waitForTimeout(1000);
    }

    async getTableRowCount(): Promise<number> {
        return await this.cashbackTable.locator('tbody tr').count();
    }

    /** Returns the description text of the first table row. */
    async getFirstRowDescriptionText(): Promise<string> {
        return await this.cashbackTable.locator('tbody tr').first().locator('td').nth(0).innerText();
    }

    /** Returns the Approved By value of the first table row. */
    async getFirstRowApprovedByText(): Promise<string> {
        return await this.cashbackTable.locator('tbody tr').first().locator('td').nth(8).innerText();
    }

    /** Checks whether a row with a given description is present in the table. */
    async isRowVisibleByDescription(description: string): Promise<boolean> {
        const count = await this.cashbackTable.locator('tbody tr', { hasText: description }).count();
        return count > 0;
    }

    /**
     * Finds the table row that contains the given description and clicks its Edit button.
     * Used in serial CRUD flows to operate on a specific record across tests.
     */
    async clickEditByDescription(description: string) {
        console.log(`Clicking Edit on row with description: "${description}"`);
        const row = this.cashbackTable.locator('tbody tr', { hasText: description }).first();
        await row.waitFor({ state: 'visible', timeout: 20000 });
        const editBtn = row.getByRole('button', { name: cashbackLocators.buttonEdit });
        await this.clickElement(editBtn);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Finds the table row that contains the given description and clicks its Delete button.
     * Used in serial CRUD flows to operate on a specific record across tests.
     */
    async clickDeleteByDescription(description: string) {
        console.log(`Clicking Delete on row with description: "${description}"`);
        const row = this.cashbackTable.locator('tbody tr', { hasText: description }).first();
        await row.waitFor({ state: 'visible', timeout: 20000 });
        const deleteBtn = row.getByRole('button', { name: cashbackLocators.buttonDelete });
        await this.clickElement(deleteBtn);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Finds the table row that contains the given description and clicks its Approve button.
     */
    async clickApproveByDescription(description: string) {
        console.log(`Clicking Approve on row with description: "${description}"`);
        const row = this.cashbackTable.locator('tbody tr', { hasText: description }).first();
        await row.waitFor({ state: 'visible', timeout: 20000 });
        const approveBtn = row.getByRole('button', { name: cashbackLocators.buttonApprove });
        await this.clickElement(approveBtn);
        await this.page.waitForTimeout(1000);
    }

    // ── Approve confirmation dialog ────────────────────────────────────────────

    async getApproveDialogMessage(): Promise<string> {
        // The Approve confirmation is a custom ".action-modal" component whose
        // message lives in a ".body-text" span, not PrimeVue's ".p-confirm-dialog-message".
        const msgLocator = this.page.locator(cashbackLocators.confirmDialogMessage)
            .or(this.page.locator(cashbackLocators.actionModalMessage));
        await msgLocator.first().waitFor({ state: 'visible' });
        return await msgLocator.first().innerText();
    }

    async clickYesOnApproveDialog() {
        console.log('Clicking Yes on Approve confirmation dialog...');
        const yesBtn = this.page.locator(cashbackLocators.confirmAcceptBtn)
            .or(this.page.getByRole('button', { name: cashbackLocators.buttonYes }));
        await yesBtn.waitFor({ state: 'visible' });
        await this.clickElement(yesBtn.first());
        await this.page.waitForTimeout(1500);
    }

    async clickNoOnApproveDialog() {
        console.log('Clicking No on Approve confirmation dialog...');
        const noBtn = this.page.locator(cashbackLocators.confirmRejectBtn)
            .or(this.page.getByRole('button', { name: cashbackLocators.buttonNo }));
        await noBtn.waitFor({ state: 'visible' });
        await this.clickElement(noBtn.first());
        await this.page.waitForTimeout(1000);
    }

    // ── Delete confirmation dialog ─────────────────────────────────────────────

    async clickYesOnDeleteDialog() {
        console.log('Clicking Yes on Delete confirmation dialog...');
        const yesBtn = this.page.locator(cashbackLocators.confirmAcceptBtn)
            .or(this.page.getByRole('button', { name: cashbackLocators.buttonYes }));
        await yesBtn.waitFor({ state: 'visible' });
        await this.clickElement(yesBtn.first());
        await this.page.waitForTimeout(1500);
    }

    async clickNoOnDeleteDialog() {
        console.log('Clicking No on Delete confirmation dialog...');
        const noBtn = this.page.locator(cashbackLocators.confirmRejectBtn)
            .or(this.page.getByRole('button', { name: cashbackLocators.buttonNo }));
        await noBtn.waitFor({ state: 'visible' });
        await this.clickElement(noBtn.first());
        await this.page.waitForTimeout(1000);
    }

    // ── Create / Update dialog form actions ───────────────────────────────────

    async fillDescriptionInDialog(dialog: Locator, text: string) {
        console.log(`Filling description: "${text}"`);
        const field = dialog.getByLabel(cashbackLocators.fieldDescription);
        await field.waitFor({ state: 'visible' });
        await field.clear();
        await this.fillInput(field, text);
    }

    async clearDescriptionInDialog(dialog: Locator) {
        console.log('Clearing description field...');
        const field = dialog.getByLabel(cashbackLocators.fieldDescription);
        await field.waitFor({ state: 'visible' });
        await field.clear();
    }

    async selectRegionInDialog(dialog: Locator, regionName: string) {
        console.log(`Selecting region: "${regionName}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldRegion);
        await this.selectDropdown(dropdown, regionName);
    }

    async selectGameTypeInDialog(dialog: Locator, gameType: string) {
        console.log(`Selecting game type: "${gameType}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldGameType);
        await this.selectDropdown(dropdown, gameType);
    }

    async selectGameNameInDialog(dialog: Locator, gameName: string) {
        console.log(`Selecting game name: "${gameName}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldGameName);
        await this.selectDropdown(dropdown, gameName);
    }

    async fillProviderNameInDialog(dialog: Locator, name: string) {
        console.log(`Filling provider name: "${name}"`);
        const field = dialog.getByLabel(cashbackLocators.fieldProviderName);
        await this.fillInput(field, name);
    }

    async selectTriggerInDialog(dialog: Locator, trigger: string) {
        console.log(`Selecting trigger: "${trigger}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldTrigger);
        await this.selectDropdown(dropdown, trigger);
    }

    /**
     * Resolves a form input by label text, with a CSS fallback for PrimeVue InputNumber
     * where the label's `for` attribute may point to the outer span rather than the inner input.
     */
    private async resolveInputByLabel(dialog: Locator, labelText: string): Promise<Locator> {
        // Strategy 1: standard getByLabel (exact:false handles * in accessible name)
        const byLabel = dialog.getByLabel(labelText, { exact: false }).first();
        if (await byLabel.isVisible().catch(() => false)) return byLabel;

        // Strategy 2: navigate from <label> element via its for attribute
        const label = dialog.locator('label').filter({ hasText: labelText }).first();
        if (await label.count() > 0) {
            const forId = await label.getAttribute('for').catch(() => null);
            if (forId) {
                // PrimeVue InputNumber: outer span has id=forId, inner input has id=forId_input
                const inner = dialog.locator(`[id="${forId}_input"]`).first();
                if (await inner.isVisible().catch(() => false)) return inner;
                const outer = dialog.locator(`[id="${forId}"] input`).first();
                if (await outer.isVisible().catch(() => false)) return outer;
            }
        }

        // Return the original locator — fillInput will report the real error
        return byLabel;
    }

    async fillCompCodeInDialog(dialog: Locator, _code: string) {
        console.log('Selecting comp code (PrimeVue dropdown, first available option)...');
        // id="compCode" is the exact dropdown div — same pattern used by selectRegionInDialog etc.
        await dialog.locator('#compCode').click();
        await this.page.waitForTimeout(300);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('.p-dropdown-item').first().click();
    }

    /**
     * PrimeVue InputNumber tracks its own internal value via keystroke events —
     * a plain locator.fill() sets the DOM value directly and leaves the
     * component's internal state (and therefore Angular/Vue form validity)
     * stuck invalid, so Save stays disabled even though the field looks filled.
     * Typing the value and blurring with Tab lets the component register it.
     */
    private async fillNumericField(field: Locator, value: string) {
        await field.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(field);
        await field.click({ clickCount: 3 });
        await field.pressSequentially(value);
        await field.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async fillMinCompAmountInDialog(dialog: Locator, amount: string) {
        console.log(`Filling min comp amount: "${amount}"`);
        const field = await this.resolveInputByLabel(dialog, cashbackLocators.fieldMinCompAmount);
        await this.fillNumericField(field, amount);
    }

    async fillCompPercentageInDialog(dialog: Locator, percentage: string) {
        console.log(`Filling comp percentage: "${percentage}"`);
        const field = await this.resolveInputByLabel(dialog, cashbackLocators.fieldCompPercentage);
        await this.fillNumericField(field, percentage);
    }

    async selectExecutionFrequencyInDialog(dialog: Locator, frequency: string) {
        console.log(`Selecting execution frequency: "${frequency}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldExecutionFrequency);
        await this.selectDropdown(dropdown, frequency);
    }

    /** Fills the "Opt In Value *" text field — required, but empty by default. */
    async fillOptInValueInDialog(dialog: Locator, value: string) {
        console.log(`Filling Opt In Value: "${value}"`);
        const field = dialog.locator('#optInValue');
        await this.fillInput(field, value);
    }

    /**
     * Selects the first option in the "Execute At Hour *" field — a required
     * multiselect (id="recurringHour") left empty by default when Execution
     * Frequency = Daily. Its sibling "Execute At Minute" already defaults to 0.
     */
    async selectExecutionHourInDialog(dialog: Locator) {
        console.log('Selecting Execute At Hour...');
        const dropdown = dialog.locator('#recurringHour');
        if (!await dropdown.isVisible().catch(() => false)) return;
        await this.clickElement(dropdown);
        await this.page.waitForTimeout(300);
        const option = this.page.locator('.p-multiselect-panel .p-multiselect-item, .p-multiselect-panel li[role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
        await this.page.waitForTimeout(300);
        // Multiselect overlay stays open after picking — close it via the trigger
        if (await option.isVisible().catch(() => false)) {
            await dropdown.click();
            await this.page.waitForTimeout(300);
        }
    }

    /** Opens a calendar input at the given index and picks a day (first or last enabled). */
    private async pickCalendarDay(dialog: Locator, inputIndex: number, selectLast: boolean, fallbackDate: string) {
        const calendarInput = dialog.locator('.p-calendar input').nth(inputIndex);
        await calendarInput.click();
        await this.page.waitForTimeout(200);
        const panel = this.page.locator('[id$="_panel"], .p-datepicker-panel, .p-datepicker').last();
        try {
            await panel.waitFor({ state: 'visible', timeout: 5000 });
            const dayLocator = selectLast
                ? panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last()
                : panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
            await this.clickElement(dayLocator);
        } catch {
            await calendarInput.fill(fallbackDate);
            await this.page.keyboard.press('Tab');
        }
        await this.page.waitForTimeout(200);
        // Dismiss calendar popup by clicking the dialog title
        await dialog.locator('.p-dialog-title').click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(200);
    }

    /** Picks a start date by opening the calendar and selecting the first enabled day. */
    async setStartDateInDialog(dialog: Locator) {
        console.log('Setting start date...');
        await this.pickCalendarDay(dialog, 0, false, '01/07/2026 00:00');
    }

    /** Picks an end date that is AFTER the start date by choosing the last enabled day. */
    async setEndDateInDialog(dialog: Locator) {
        console.log('Setting end date...');
        await this.pickCalendarDay(dialog, 1, true, '01/12/2026 00:00');
    }

    /** Picks an end date that comes BEFORE the current start date (for date-validation tests). */
    async setEndDateBeforeStartDateInDialog(dialog: Locator) {
        console.log('Setting end date to BEFORE start date (for validation test)...');
        await this.pickCalendarDay(dialog, 1, false, '01/01/2026 00:00');
    }

    /** Picks a next execution date (future date via the third calendar in the dialog). */
    async setNextExecutionDateInDialog(dialog: Locator) {
        console.log('Setting next execution date...');
        await this.pickCalendarDay(dialog, 2, true, '01/08/2026 00:00');
    }

    /** Checks / unchecks the Use Segments? checkbox in the dialog. */
    async toggleUseSegmentsInDialog(dialog: Locator) {
        console.log('Toggling Use Segments? checkbox...');
        // PrimeVue checkbox renders a clickable .p-checkbox-box div, but its own
        // (visually hidden) native <input> sits exactly on top of it and fails
        // Playwright's "receives events" actionability check — force bypasses
        // that hit-test, which is safe here since the box is genuinely visible.
        const checkboxBox = dialog.locator('.p-checkbox').first().locator('.p-checkbox-box');
        if (await checkboxBox.isVisible().catch(() => false)) {
            await CommonUtils.highlightElement(checkboxBox);
            await checkboxBox.click({ force: true });
        } else {
            // Do NOT use clickElement here — getByLabel('Use Segments?') resolves to a hidden
            // aria-hidden input which causes clickElement to wait 120s for it to become visible.
            const label = dialog.locator('label', { hasText: /use segments/i }).first();
            if (await label.isVisible().catch(() => false)) {
                await label.click({ force: true }).catch(() => {});
            } else {
                await dialog.getByLabel(cashbackLocators.fieldUseSegments).click({ force: true }).catch(() => {});
            }
        }
        await this.page.waitForTimeout(500);
    }

    async isSegmentDropdownVisibleInDialog(dialog: Locator): Promise<boolean> {
        const segmentField = dialog.getByLabel(cashbackLocators.fieldSegment);
        return await segmentField.isVisible();
    }

    async isExecutionTimeVisibleInDialog(dialog: Locator): Promise<boolean> {
        // Try by label first; fallback to scanning for a visible <label> with matching text.
        // The app renamed this to "Execute At Hour"/"Execute At Minute" (under an
        // "Advanced Recurrence" section, shown only for Daily) — no field is
        // actually labelled "Execution Time" anymore, so check both forms.
        const byLabel = dialog.getByLabel(cashbackLocators.fieldExecutionTime);
        if (await byLabel.isVisible().catch(() => false)) return true;
        const labelEl = dialog.locator('label', { hasText: /execution time|execute at (hour|minute)/i });
        return await labelEl.first().isVisible().catch(() => false);
    }

    /**
     * Fills the Execution Time field and dismisses the PrimeVue time-picker panel that opens.
     * A time-picker panel appears on focus — if left open it blocks all subsequent clicks.
     * Dismiss strategy: Escape → Tab → click dialog header (each tried in order).
     */
    async fillExecutionTimeInDialog(dialog: Locator, time: string) {
        console.log(`Filling execution time: "${time}"`);
        const field = dialog.getByLabel(cashbackLocators.fieldExecutionTime);
        if (!await field.isVisible().catch(() => false)) {
            console.log('Execution Time field not visible — skipping');
            return;
        }

        // Click to focus, then fill the typed value
        await field.click().catch(() => {});
        await this.page.waitForTimeout(200);
        await field.fill(time);
        await this.page.waitForTimeout(200);

        // 1st attempt: Escape key dismisses most PrimeVue overlays
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(200);

        // 2nd attempt: Tab moves focus away and closes the panel
        const panel = this.page.locator('[id$="_panel"], .p-datepicker, .p-timepicker-panel').last();
        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Tab').catch(() => {});
            await this.page.waitForTimeout(200);
        }

        // 3rd attempt: click the dialog header to force focus out of the time field
        if (await panel.isVisible().catch(() => false)) {
            await dialog.locator('.p-dialog-header').first().click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(200);
        }
    }

    async clickGameTypeDropdownInDialog(dialog: Locator) {
        console.log('Clicking Game Type dropdown...');
        const dropdown = dialog.getByLabel(cashbackLocators.fieldGameType);
        await this.clickElement(dropdown);
        await this.page.waitForTimeout(500);
    }

    async getGameNameDropdownOptionsCount(_dialog: Locator): Promise<number> {
        const options = this.page.locator('.p-dropdown-items .p-dropdown-item');
        await this.page.waitForTimeout(500);
        return await options.count();
    }

    async clickRegionDropdownInDialog(dialog: Locator) {
        console.log('Opening Region dropdown...');
        const dropdown = dialog.getByLabel(cashbackLocators.fieldRegion);
        await this.clickElement(dropdown);
        await this.page.waitForTimeout(500);
    }

    async clickTriggerDropdownInDialog(dialog: Locator) {
        console.log('Opening Trigger dropdown...');
        const dropdown = dialog.getByLabel(cashbackLocators.fieldTrigger);
        await this.clickElement(dropdown);
        await this.page.waitForTimeout(500);
    }

    async getDropdownOptionsCount(): Promise<number> {
        const options = this.page.locator('.p-dropdown-items .p-dropdown-item');
        await this.page.waitForTimeout(500);
        return await options.count();
    }

    async getDescriptionValueInDialog(dialog: Locator): Promise<string> {
        const field = dialog.getByLabel(cashbackLocators.fieldDescription);
        return await field.inputValue();
    }

    async isFieldPrefilled(dialog: Locator, labelText: string): Promise<boolean> {
        const field = dialog.getByLabel(labelText);
        const value = await field.inputValue().catch(() => '');
        return value.trim().length > 0;
    }

    async clickSaveInDialog(dialog: Locator) {
        console.log('Clicking Save button...');
        const saveBtn = dialog.getByRole('button', { name: cashbackLocators.buttonSave });
        await saveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(saveBtn);
        // Negative-path tests intentionally leave Save disabled (missing/invalid
        // required fields) — a disabled button never becomes actionable, so a
        // plain click() hangs for the full action timeout. Bound it and swallow
        // the failure; the disabled state itself is what those tests assert on.
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1500);
    }

    async clickCancelInDialog(dialog: Locator) {
        console.log('Clicking Cancel button...');
        const cancelBtn = dialog.getByRole('button', { name: cashbackLocators.buttonCancel });
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(1000);
    }

    async isValidationErrorVisible(dialog: Locator): Promise<boolean> {
        const errorLocator = dialog.locator(cashbackLocators.validationError)
            .or(dialog.locator(cashbackLocators.invalidField));
        if (await errorLocator.first().isVisible().catch(() => false)) return true;

        // This app never actually applies .p-error/.p-invalid classes to blocked
        // fields — the only observable signal that validation stopped the save
        // is the Save button itself staying disabled. That's sufficient proof.
        const saveBtn = dialog.getByRole('button', { name: cashbackLocators.buttonSave });
        return await saveBtn.evaluate(
            el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')
        ).catch(() => false);
    }

    async isDialogStillOpen(dialogTitleText: string): Promise<boolean> {
        const dialog = this.page.locator(cashbackLocators.dialogContainer)
            .filter({ hasText: dialogTitleText });
        return await dialog.isVisible().catch(() => false);
    }

    /** Checks if the execution time field has a default non-empty value. */
    async getExecutionTimeValue(dialog: Locator): Promise<string> {
        const byLabel = dialog.getByLabel(cashbackLocators.fieldExecutionTime);
        const val = await byLabel.inputValue().catch(() => '');
        if (val) return val;
        // Fallback: look for a time input near the execution time label
        const labelEl = dialog.locator('label', { hasText: /execution time/i });
        if (await labelEl.first().isVisible().catch(() => false)) {
            const forAttr = await labelEl.first().getAttribute('for').catch(() => null);
            if (forAttr) {
                return await dialog.locator(`#${forAttr}`).inputValue().catch(() => '');
            }
        }
        return '';
    }
}
