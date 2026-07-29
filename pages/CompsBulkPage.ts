import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compsBulkLocators } from '../locators/compsBulkLocators';
import { CommonUtils } from '../utils/commonUtils';

export class CompsBulkPage extends BasePage {
    readonly createBulkCompBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createBulkCompBtn = this.page.locator(compsBulkLocators.createBulkCompBtn);
    }

    async clickCreateBulkComp() {
        console.log('Clicking Create Bulk Comp button...');
        await this.clickElement(this.createBulkCompBtn);
        await this.page.waitForTimeout(500);
    }

    /** Returns a locator scoped to the Create/Edit Bulk Comp dialog. */
    getDialog(): Locator {
        return this.page.locator('div[role="dialog"]').first();
    }

    /** Locates a Comp Bulk table row by its Description column text. */
    getRowByDescription(description: string): Locator {
        return this.page.locator('table tbody tr', { hasText: description }).first();
    }

    /**
     * Locates the first row that looks like one this automation created (every bulk-comp test
     * prefixes its Description with "AutoBulkComp_") — used so Edit tests never touch a
     * pre-existing/original row, without needing to create a fresh disposable one each time.
     */
    getFirstAutomationRow(): Locator {
        return this.page.locator('table tbody tr').filter({ hasText: /AutoBulkComp_/ }).first();
    }

    /** Reads the Description column (first cell) of a given row. */
    async getRowDescriptionText(row: Locator): Promise<string> {
        return (await row.locator('td').first().textContent())?.trim() ?? '';
    }

    /** Reads the Status column (4th cell: Description, CompCode, Region Code, Status, ...). */
    async getRowStatusText(row: Locator): Promise<string> {
        return (await row.locator('td').nth(3).textContent())?.trim() ?? '';
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Edit. The menu itself renders in a
     * PrimeNG overlay appended elsewhere in the DOM (not nested inside the row), so it's
     * matched globally by its aria-label once opened.
     */
    async clickEditOnRow(description: string): Promise<void> {
        console.log(`Clicking Edit on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(compsBulkLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const editItem = this.page.locator(compsBulkLocators.editMenuItem);
        await editItem.waitFor({ state: 'visible', timeout: 5000 });
        await editItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Review. */
    async clickReviewOnRow(description: string): Promise<void> {
        console.log(`Clicking Review on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(compsBulkLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const reviewItem = this.page.locator(compsBulkLocators.reviewMenuItem);
        await reviewItem.waitFor({ state: 'visible', timeout: 5000 });
        await reviewItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Configurations, navigating to the
     * Configurations management page for this bulk-comp feature (not row-specific data). */
    async clickConfigurationsOnRow(description: string): Promise<void> {
        console.log(`Clicking Configurations on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(compsBulkLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const configurationsItem = this.page.locator(compsBulkLocators.configurationsMenuItem);
        await configurationsItem.waitFor({ state: 'visible', timeout: 5000 });
        await configurationsItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Payouts. */
    async clickPayoutsOnRow(description: string): Promise<void> {
        console.log(`Clicking Payouts on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(compsBulkLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const payoutsItem = this.page.locator(compsBulkLocators.payoutsMenuItem);
        await payoutsItem.waitFor({ state: 'visible', timeout: 5000 });
        await payoutsItem.click();
        await this.page.waitForTimeout(500);
    }

    /** True once the Payouts page's own "Generate Report" button is visible — confirms
     * navigation actually landed there, rather than just checking the kebab menu closed.
     * Confirmed live: the page opens successfully but takes a while to render, so this polls
     * (waitFor, not a single isVisible check) with a generous timeout instead of failing fast. */
    async isOnPayoutsPage(): Promise<boolean> {
        return await this.page.locator(compsBulkLocators.payoutsPageGenerateReportBtn)
            .waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Delete. */
    async clickDeleteOnRow(description: string): Promise<void> {
        console.log(`Clicking Delete on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(compsBulkLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const deleteItem = this.page.locator(compsBulkLocators.deleteMenuItem);
        await deleteItem.waitFor({ state: 'visible', timeout: 5000 });
        await deleteItem.click();
        await this.page.waitForTimeout(500);
    }

    // Delete confirmation is the same custom modal ("modal-buttons-container") already proven
    // in CompAlertsPage — Yes/No matched by aria-label directly.
    async clickYesOnDeleteDialog() {
        console.log('Clicking Yes on delete bulk comp confirmation...');
        const yesBtn = this.page.getByRole('button', { name: 'Yes', exact: true });
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnDeleteDialog() {
        console.log('Clicking No on delete bulk comp confirmation...');
        const noBtn = this.page.getByRole('button', { name: 'No', exact: true });
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }

    /** Process and Cancel are direct buttons in each row's Actions cell (not behind the kebab
     * menu), each opening the same Yes/No confirmation modal used by Delete. */
    async clickProcessOnRow(description: string): Promise<void> {
        console.log(`Clicking Process on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const processBtn = row.getByRole('button', { name: 'Process', exact: true });
        await this.clickElement(processBtn);
        await this.page.waitForTimeout(500);
    }

    async clickCancelOnRow(description: string): Promise<void> {
        console.log(`Clicking Cancel on bulk comp row: "${description}"...`);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const cancelBtn = row.getByRole('button', { name: 'Cancel', exact: true });
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(500);
    }

    // Generic Yes/No confirmation — the same "modal-buttons-container" used by Delete, Process
    // and Cancel alike. clickYesOnDeleteDialog/clickNoOnDeleteDialog above are functionally
    // identical to these; kept separate only for their Delete-specific log messages.
    async clickYesOnConfirmDialog() {
        console.log('Clicking Yes on confirmation dialog...');
        const yesBtn = this.page.getByRole('button', { name: 'Yes', exact: true });
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirmation dialog...');
        const noBtn = this.page.getByRole('button', { name: 'No', exact: true });
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }

    // ── Field lookup helpers ───────────────────────────────────────────────────
    // None of this dialog's text/number fields or dropdowns carry a matching id on their
    // actual input element (their <label for="..."> targets an id that isn't present anywhere
    // in the rendered markup — confirmed live, the same quirk already seen on this app's
    // Simulate Bet page). Every field is instead scoped by its adjacent <label> text.

    private fieldGroupByLabel(scope: Locator, labelText: string): Locator {
        return scope.locator('.pure__input-group, .p-float-label')
            .filter({ has: scope.page().locator(`label:text-is("${labelText}")`) })
            .first();
    }

    private textInputByLabel(scope: Locator, labelText: string): Locator {
        return this.fieldGroupByLabel(scope, labelText).locator('input.p-inputtext, input.p-inputnumber-input').first();
    }

    private dropdownByLabel(scope: Locator, labelText: string): Locator {
        return this.fieldGroupByLabel(scope, labelText).locator('.p-dropdown').first();
    }

    private calendarInputByLabel(scope: Locator, labelText: string): Locator {
        return this.fieldGroupByLabel(scope, labelText).locator('input.p-inputtext').first();
    }

    /**
     * Clears and types a value into a PrimeNG InputNumber field, verifying it actually landed —
     * a plain .fill() sets the DOM value but PrimeNG's InputNumber doesn't reliably pick that up
     * into its Angular model (confirmed live elsewhere in this suite: simulatebet.spec.ts's
     * fillNumberField), leaving the app's own form validity — and so Save's disabled state —
     * unaware the field was ever filled.
     */
    private async fillNumberField(input: Locator, value: string): Promise<void> {
        await input.waitFor({ state: 'visible', timeout: 5000 });

        // Confirmed live: the field can show the correct value while still focused, yet Save
        // stays disabled — this app recomputes form validity on blur, not on input. Blur BEFORE
        // verifying (not after) — a decimal-mode InputNumber elsewhere in this suite was
        // confirmed to reformat its value on blur in a way that silently overwrites whatever
        // the raw pre-blur DOM string showed, so only the post-blur value can be trusted.
        // Compare numerically (tolerant of ".00" padding) rather than the raw string.
        for (let attempt = 0; attempt < 3; attempt++) {
            await input.click({ clickCount: 3 });
            await input.press('Control+A');
            await input.press('Delete');
            await input.pressSequentially(value);
            await input.blur();

            const digitsOnly = (await input.inputValue()).replace(/[^\d.-]/g, '');
            if (parseFloat(digitsOnly) === parseFloat(value)) return;
        }

        await input.evaluate((el: HTMLInputElement, val: string) => {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
            nativeSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
        await input.blur();

        const finalDigits = (await input.inputValue()).replace(/[^\d.-]/g, '');
        if (parseFloat(finalDigits) !== parseFloat(value)) {
            throw new Error(`fillNumberField: failed to set value to "${value}" — field shows "${await input.inputValue()}" after all attempts.`);
        }
    }

    // ── Mandatory fields ───────────────────────────────────────────────────────

    async fillDescription(dialog: Locator, description: string) {
        console.log(`Filling Bulk Comp Description: "${description}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldDescription);
        await this.fillInput(field, description);
    }

    async chooseCsvFile(dialog: Locator, filePath: string) {
        console.log(`Uploading CSV file: "${filePath}"...`);
        const input = dialog.locator(compsBulkLocators.csvFileInput);
        await input.setInputFiles(filePath);
        await this.page.waitForTimeout(300);
    }

    // ── Value getters (used to verify Edit pre-fills existing values) ─────────

    async getDescriptionValue(dialog: Locator): Promise<string> {
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldDescription);
        return await field.inputValue();
    }

    async getCompCodeValue(dialog: Locator): Promise<string> {
        const label = this.dropdownByLabel(dialog, compsBulkLocators.fieldCompCode).locator('.p-dropdown-label');
        return (await label.textContent())?.trim() ?? '';
    }

    async getRegionCodeValue(dialog: Locator): Promise<string> {
        const label = this.dropdownByLabel(dialog, compsBulkLocators.fieldRegionCode).locator('.p-dropdown-label');
        return (await label.textContent())?.trim() ?? '';
    }

    // ── Searchable dropdowns ───────────────────────────────────────────────────

    /**
     * Opens a PrimeNG-style filterable dropdown, optionally types into its search box, then
     * clicks the first matching option and returns its text. Shared by every searchable
     * dropdown in this dialog (Comp Code, Region Code, message templates, tag/segmentation
     * pickers) since they all render the same `.p-dropdown-panel` + filter-input structure.
     */
    private async selectDropdownOption(dropdown: Locator, searchText?: string): Promise<string> {
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await dropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        if (searchText) {
            const filterInput = panel.locator('input[type="text"]').first();
            if (await filterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await filterInput.fill(searchText);
                await this.page.waitForTimeout(400); // debounce for the option list to re-filter
            }
        }

        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /**
     * Comp Code — Region Code is disabled until this is selected. Region Code also stays in a
     * brief loading state right after Comp Code is picked — confirmed live: opening it too soon
     * lets the panel open with no options yet, even though its disabled attribute may have
     * already flipped. Poll until it genuinely reports enabled before returning, so every
     * caller gets a Region Code that's actually ready to open.
     */
    async selectCompCode(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Comp Code${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldCompCode);
        const result = await this.selectDropdownOption(dropdown, searchText);
        await this.waitForRegionCodeReady(dialog);
        return result;
    }

    async selectRegionCode(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Region Code${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldRegionCode);
        return this.selectDropdownOption(dropdown, searchText);
    }

    /** True until a Comp Code has been selected. */
    async isRegionCodeDisabled(dialog: Locator): Promise<boolean> {
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldRegionCode);
        return await dropdown.evaluate(el =>
            el.getAttribute('data-p-disabled') === 'true' || el.classList.contains('p-disabled')
        );
    }

    /** Comp Code is locked (disabled) once editing an existing bulk comp — never on Create. */
    async isCompCodeDisabled(dialog: Locator): Promise<boolean> {
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldCompCode);
        return await dropdown.evaluate(el =>
            el.getAttribute('data-p-disabled') === 'true' || el.classList.contains('p-disabled')
        );
    }

    /** True in the Review dialog, where Description is read-only. Never true on Create/Edit. */
    async isDescriptionDisabled(dialog: Locator): Promise<boolean> {
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldDescription);
        return await field.isDisabled();
    }

    private async waitForRegionCodeReady(dialog: Locator, timeoutMs: number = 15000): Promise<void> {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (!(await this.isRegionCodeDisabled(dialog))) return;
            await this.page.waitForTimeout(500);
        }
    }

    async selectPushMessageTemplate(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Push Message Template${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldPushMessageTemplate);
        return this.selectDropdownOption(dropdown, searchText);
    }

    async selectSmsMessageTemplate(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting SMS Message Template${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldSmsMessageTemplate);
        return this.selectDropdownOption(dropdown, searchText);
    }

    async selectTagName(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Tag Name${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldTagName);
        return this.selectDropdownOption(dropdown, searchText);
    }

    async fillTagValue(dialog: Locator, value: string) {
        console.log(`Filling Tag Value: "${value}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldTagValue);
        await this.fillInput(field, value);
    }

    async selectSegmentationGroup(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Segmentation Group${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldSegmentationGroup);
        return this.selectDropdownOption(dropdown, searchText);
    }

    async fillPercentageOfPlayersToProcess(dialog: Locator, value: string) {
        console.log(`Filling Percentage of Players to Process: "${value}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldPercentagePlayersToProcess);
        await this.fillNumberField(field, value);
    }

    async selectCompPlayerTagName(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Comp Player Tag Name${searchText ? ` matching "${searchText}"` : ''}...`);
        const dropdown = this.dropdownByLabel(dialog, compsBulkLocators.fieldCompPlayerTagName);
        return this.selectDropdownOption(dropdown, searchText);
    }

    // Comp Budget / Comp Value * / Comp Freebet Value are shared by label text between the
    // "Is Segment Based" and "Comp Tagged Players" sections — see locators file note.
    async fillCompBudget(dialog: Locator, value: string) {
        console.log(`Filling Comp Budget: "${value}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldCompBudget);
        await this.fillNumberField(field, value);
    }

    async fillCompValue(dialog: Locator, value: string) {
        console.log(`Filling Comp Value: "${value}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldCompValue);
        await this.fillNumberField(field, value);
    }

    async fillCompFreebetValue(dialog: Locator, value: string) {
        console.log(`Filling Comp Freebet Value: "${value}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldCompFreebetValue);
        await this.fillNumberField(field, value);
    }

    // ── Is Recurring conditional fields ────────────────────────────────────────

    async fillCronExpression(dialog: Locator, expression: string) {
        console.log(`Filling Cron Expression: "${expression}"...`);
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldCronExpression);
        await this.fillInput(field, expression);
    }

    /**
     * Picks the first available day on the Start Date calendar, then clicks the End Date
     * input — per this app's own UX (confirmed by the user) that's what closes the Start Date
     * calendar, and it doubles as opening End Date's own calendar for the next step.
     */
    async setStartDate(dialog: Locator) {
        console.log('Setting Start Date...');
        const input = this.calendarInputByLabel(dialog, compsBulkLocators.fieldStartDate);
        await input.click();
        const panel = this.page.locator('.p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const day = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await day.click();
        await this.page.waitForTimeout(200);

        await this.calendarInputByLabel(dialog, compsBulkLocators.fieldEndDate).click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    /**
     * Picks the last available day on the End Date calendar. Per the user: this calendar is
     * only dismissed by clicking any checkbox or the Save button afterward — callers are
     * responsible for that next click, since which one applies depends on the test.
     */
    async setEndDate(dialog: Locator) {
        console.log('Setting End Date...');
        const input = this.calendarInputByLabel(dialog, compsBulkLocators.fieldEndDate);
        const panel = this.page.locator('.p-datepicker').last();
        if (!await panel.isVisible().catch(() => false)) {
            await input.click();
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }
        const day = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await day.click();
        await this.page.waitForTimeout(200);
    }

    /**
     * Dismisses the End Date calendar once it's done with — per the user, this only closes via
     * clicking any checkbox or the Save button. Clicking the (always-present, state-neutral)
     * Description field achieves the same dismissal without toggling any checkbox's state.
     */
    async dismissCalendarOverlay(dialog: Locator) {
        const field = this.textInputByLabel(dialog, compsBulkLocators.fieldDescription);
        await field.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    // ── Checkboxes ──────────────────────────────────────────────────────────────
    // PrimeNG renders a clickable .p-checkbox-box div with its own visually-hidden native
    // input sitting on top — force bypasses the resulting hit-test failure (same pattern
    // already proven in CompAlertsPage.toggleForceAlert).

    private checkboxBoxById(id: string): Locator {
        return this.page.locator(`.p-checkbox:has(#${id}) .p-checkbox-box`);
    }

    async isCheckboxChecked(id: string): Promise<boolean> {
        return await this.page.locator(`#${id}`).isChecked();
    }

    /** True in the Review dialog, where every checkbox is read-only. Never true on Create/Edit. */
    async isCheckboxDisabled(id: string): Promise<boolean> {
        return await this.page.locator(`#${id}`).isDisabled();
    }

    private async toggleCheckboxById(id: string, label: string) {
        console.log(`Toggling ${label} checkbox...`);
        const box = this.checkboxBoxById(id);
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }

    async toggleSendPushNotification() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxSendPush, 'Send Push Notification');
    }

    async toggleSendSms() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxSendSms, 'Send SMS');
    }

    async toggleTagUser() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxTagUser, 'Tag User');
    }

    async toggleIsSegmentBased() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxIsSegment, 'Is Segment Based');
    }

    async toggleCompTaggedPlayers() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxIsTagComp, 'Comp Tagged Players');
    }

    async toggleIsRecurring() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxIsRecurring, 'Is Recurring');
    }

    async toggleUseSegmentSuggestedCompAmount() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxUseSegmentSuggestedCompAmount, 'Use Segment Suggested Comp Amount');
    }

    async toggleRandomiseOrder() {
        await this.toggleCheckboxById(compsBulkLocators.checkboxRandomiseOrder, 'Randomise Order');
    }

    // ── Save / Cancel ───────────────────────────────────────────────────────────
    // Save starts disabled (p-disabled + disabled attribute) until every mandatory field
    // (Description, Comp Code, Region Code, CSV) is filled — confirmed live.

    async clickSave(dialog: Locator) {
        console.log('Clicking Save button...');
        const saveBtn = dialog.locator(compsBulkLocators.buttonSave);
        await saveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(saveBtn);
        // Same global loading overlay (.pure__loader-container) already fixed in
        // BasePage.clickElement — it can linger over the dialog and intercept this click,
        // silently swallowed by the catch below and easy to mistake for "Save was disabled".
        await this.page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        // A disabled button never becomes actionable, so a plain click() would hang for the
        // full action timeout on negative-path tests that intentionally leave Save disabled.
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }

    async clickCancel(dialog: Locator) {
        console.log('Clicking Cancel button...');
        const cancelBtn = dialog.locator(compsBulkLocators.buttonCancel);
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(500);
    }

    /** Approve button — only present on the Review dialog. */
    async clickApprove(dialog: Locator) {
        console.log('Clicking Approve button...');
        const approveBtn = dialog.locator(compsBulkLocators.buttonApprove);
        await approveBtn.waitFor({ state: 'visible', timeout: 15000 });
        // Confirmed live: the Review dialog opens before it's actually done rendering (it has
        // several extra read-only fields — Created By, Total Records, etc. — to fetch and
        // populate), so clicking Approve immediately after the dialog appears doesn't register.
        // Give it a moment to fully settle first.
        await this.page.waitForTimeout(1500);
        await this.clickElement(approveBtn);
        await this.page.waitForTimeout(1000);
    }

    async isSaveEnabled(dialog: Locator): Promise<boolean> {
        const saveBtn = dialog.locator(compsBulkLocators.buttonSave);
        return !(await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }

    async getToastText(timeout: number = 15000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }
}
