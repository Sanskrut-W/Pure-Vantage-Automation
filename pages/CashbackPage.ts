import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { cashbackLocators } from '../locators/cashbackLocators';

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
            await this.clickElement(approveBtn);
            await this.page.waitForTimeout(800);

            // Check whether a confirmation dialog or popup appeared
            const dialogVisible = await this.page.locator('.p-dialog, .p-confirm-popup').last()
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
        const msgLocator = this.page.locator(cashbackLocators.confirmDialogMessage);
        await msgLocator.waitFor({ state: 'visible' });
        return await msgLocator.innerText();
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

    async fillMinCompAmountInDialog(dialog: Locator, amount: string) {
        console.log(`Filling min comp amount: "${amount}"`);
        const field = await this.resolveInputByLabel(dialog, cashbackLocators.fieldMinCompAmount);
        await this.fillInput(field, amount);
    }

    async fillCompPercentageInDialog(dialog: Locator, percentage: string) {
        console.log(`Filling comp percentage: "${percentage}"`);
        const field = await this.resolveInputByLabel(dialog, cashbackLocators.fieldCompPercentage);
        await this.fillInput(field, percentage);
    }

    async selectExecutionFrequencyInDialog(dialog: Locator, frequency: string) {
        console.log(`Selecting execution frequency: "${frequency}"`);
        const dropdown = dialog.getByLabel(cashbackLocators.fieldExecutionFrequency);
        await this.selectDropdown(dropdown, frequency);
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
        // PrimeVue checkbox renders a clickable .p-checkbox-box div; the hidden input is aria-hidden.
        const checkboxBox = dialog.locator('.p-checkbox').first().locator('.p-checkbox-box');
        if (await checkboxBox.isVisible().catch(() => false)) {
            await this.clickElement(checkboxBox);
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
        // Try by label first; fallback to scanning for a visible <label> with matching text
        const byLabel = dialog.getByLabel(cashbackLocators.fieldExecutionTime);
        if (await byLabel.isVisible().catch(() => false)) return true;
        const labelEl = dialog.locator('label', { hasText: /execution time/i });
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
        await this.clickElement(saveBtn);
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
        return await errorLocator.first().isVisible().catch(() => false);
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
