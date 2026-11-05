import { Page, Locator } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { compConfigLocators } from '../locators/compConfigLocators';
import { CommonUtils } from '../utils/commonUtils';
export class CompConfigPage extends BasePage {
    readonly payoutReportBtn: Locator;
    readonly createCompBtn: Locator;
    // Create Comp popup
    readonly dialog: Locator;
    readonly titleInput: Locator;
    readonly multiCompBlockDaysInput: Locator;
    readonly startDateInput: Locator;
    readonly startDatePanel: Locator;
    readonly endDateInput: Locator;
    readonly endDatePanel: Locator;
    readonly compCodeInput: Locator;
    readonly campaignDropdown: Locator;
    readonly tagDropdown: Locator;
    readonly alertEmailsInput: Locator;
    readonly isActiveCheckbox: Locator;
    readonly isActiveCheckboxInput: Locator;
    readonly isGiftCheckboxInput: Locator;
    readonly isGiftCheckboxBox: Locator;
    readonly giftDescriptionInput: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly closeIconBtn: Locator;
    readonly toastMessage: Locator;
    // Landing page table row actions
    readonly rowMenuTrigger: Locator;
    readonly actionMenu: Locator;
    readonly firstRowTitleCell: Locator;
    // Copy/Delete confirmation — a separate custom component (<pure-action-modal-component>),
    // not the same .p-dialog used by Create/Edit Comp.
    readonly actionModal: Locator;
    readonly actionModalHeader: Locator;
    readonly actionModalCloseIcon: Locator;
    // The "Status" toggle next to the landing page search box — live-verified to NOT act as
    // an Active/Inactive filter (see CM_070's comment); kept for completeness.
    readonly statusFilterToggle: Locator;
    readonly searchInput: Locator;
    // Comp Config's own "Configurations" screen — reached via a row's kebab menu ->
    // Configurations. The SAME shared Configurations page already confirmed live for Comp Bulk
    // (see CompBulkConfigurationsPage) — same fields, same ".configuration-card" markup.
    readonly createConfigurationBtn: Locator;
    readonly configDialog: Locator;
    readonly configDescriptionInput: Locator;
    readonly configRegionCodeDropdown: Locator;
    readonly configTransactionTypeDropdown: Locator;
    readonly configCasinoBonusTemplateDropdown: Locator;
    readonly configMinimumPayoutInput: Locator;
    readonly configMaximumPayoutInput: Locator;
    readonly configPushNotificationTemplateDropdown: Locator;
    readonly configSmsNotificationTemplateDropdown: Locator;
    readonly configCampaignBudgetInput: Locator;
    readonly configBannerDropdown: Locator;
    readonly configDailyBudgetInput: Locator;
    readonly configSendPushCheckbox: Locator;
    readonly configSendSmsCheckbox: Locator;
    readonly configIsCompValueProvidedCheckbox: Locator;
    readonly configAllowMultipleCompCheckbox: Locator;
    readonly configSaveBtn: Locator;
    readonly configCancelBtn: Locator;
    constructor(page: Page) {
        super(page);
        // Payout Report's outerHTML only shows the inner label span, not a
        // confirmed aria-label on the button itself (unlike Create Comp) — a
        // role-based accessible-name match is resilient either way, since
        // Playwright falls back to visible text content when aria-label is absent.
        this.payoutReportBtn = this.page.getByRole('button', { name: 'Payout Report' });
        this.createCompBtn = this.page.locator(compConfigLocators.createCompBtn);
        this.dialog = this.page.locator(compConfigLocators.dialog).first();
        this.titleInput = this.page.locator(compConfigLocators.titleInput);
        this.multiCompBlockDaysInput = this.page.locator(compConfigLocators.multiCompBlockDaysInput);
        this.startDateInput = this.page.locator(compConfigLocators.startDateInput);
        this.startDatePanel = this.page.locator(compConfigLocators.startDatePanel);
        this.endDateInput = this.page.locator(compConfigLocators.endDateInput);
        this.endDatePanel = this.page.locator(compConfigLocators.endDatePanel);
        this.compCodeInput = this.page.locator(compConfigLocators.compCodeInput);
        this.campaignDropdown = this.page.locator(compConfigLocators.campaignDropdown);
        this.tagDropdown = this.page.locator(compConfigLocators.tagDropdown);
        this.alertEmailsInput = this.page.locator(compConfigLocators.alertEmailsInput);
        this.isActiveCheckbox = this.page.locator(compConfigLocators.isActiveCheckbox);
        this.isActiveCheckboxInput = this.page.locator(compConfigLocators.isActiveCheckboxInput);
        this.isGiftCheckboxInput = this.page.locator(compConfigLocators.isGiftCheckboxInput);
        this.isGiftCheckboxBox = this.page.locator(compConfigLocators.isGiftCheckboxBox);
        this.giftDescriptionInput = this.page.locator(compConfigLocators.giftDescriptionInput);
        this.saveBtn = this.dialog.getByRole('button', { name: 'Save', exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
        this.closeIconBtn = this.dialog.locator(compConfigLocators.closeIconBtn);
        this.toastMessage = this.page.locator(compConfigLocators.toastMessage).first();
        // Row action menu — the trigger is a per-row "..." button; the menu itself renders
        // as a detached overlay (.pure__table-menu.p-menu, role="menu") appended outside the
        // table, so it's queried globally rather than scoped under any particular row.
        this.rowMenuTrigger = this.page.locator('button.pure__table-menu-trigger');
        this.actionMenu = this.page.locator('.pure__table-menu.p-menu, [role="menu"]').last();
        this.firstRowTitleCell = this.page.locator('table tbody tr, .p-datatable-tbody tr').first().locator('td').first();
        this.actionModal = this.page.locator('.action-modal');
        this.actionModalHeader = this.actionModal.locator('.header-text');
        this.actionModalCloseIcon = this.actionModal.locator('.modal-header button, .modal-header .pi-times').first();
        this.statusFilterToggle = this.page.locator('[role="switch"]').first();
        this.searchInput = this.page.getByPlaceholder(/Search by title/i);
        this.createConfigurationBtn = this.page.locator(compConfigLocators.createConfigurationBtn);
        this.configDialog = this.page.locator(compConfigLocators.configDialog).first();
        this.configDescriptionInput = this.page.locator(compConfigLocators.configDescriptionInput);
        this.configRegionCodeDropdown = this.page.locator(compConfigLocators.configRegionCodeDropdown);
        this.configTransactionTypeDropdown = this.page.locator(compConfigLocators.configTransactionTypeDropdown);
        this.configCasinoBonusTemplateDropdown = this.page.locator(compConfigLocators.configCasinoBonusTemplateDropdown);
        this.configMinimumPayoutInput = this.page.locator(compConfigLocators.configMinimumPayoutInput);
        this.configMaximumPayoutInput = this.page.locator(compConfigLocators.configMaximumPayoutInput);
        this.configPushNotificationTemplateDropdown = this.page.locator(compConfigLocators.configPushNotificationTemplateDropdown);
        this.configSmsNotificationTemplateDropdown = this.page.locator(compConfigLocators.configSmsNotificationTemplateDropdown);
        this.configCampaignBudgetInput = this.page.locator(compConfigLocators.configCampaignBudgetInput);
        this.configBannerDropdown = this.page.locator(compConfigLocators.configBannerDropdown);
        this.configDailyBudgetInput = this.page.locator(compConfigLocators.configDailyBudgetInput);
        this.configSendPushCheckbox = this.page.locator(`#${compConfigLocators.configCheckboxSendPush}`);
        this.configSendSmsCheckbox = this.page.locator(`#${compConfigLocators.configCheckboxSendSms}`);
        this.configIsCompValueProvidedCheckbox = this.page.locator(`#${compConfigLocators.configCheckboxCompValueProvided}`);
        this.configAllowMultipleCompCheckbox = this.page.locator(`#${compConfigLocators.configCheckboxAllowMultipleComp}`);
        this.configSaveBtn = this.configDialog.getByRole('button', { name: 'Save', exact: true });
        this.configCancelBtn = this.configDialog.getByRole('button', { name: 'Cancel', exact: true });
    }
    async isStatusFilterOn(): Promise<boolean> {
        return (await this.statusFilterToggle.getAttribute('aria-checked')) === 'true';
    }
    async toggleStatusFilter() {
        console.log('Toggling the Status filter switch...');
        await this.clickElement(this.statusFilterToggle);
    }
    /**
     * Filters the landing page table by title/comp code/comp id. The table can span many
     * rows/pages, so searching for a specific unique title is the reliable way to confirm a
     * row exists (or doesn't), rather than assuming it's on the currently-visible page.
     */
    async searchByTitle(text: string) {
        console.log(`Searching Comp Config table for: ${text}`);
        await this.searchInput.fill(text);
        await this.page.waitForTimeout(800);
    }
    /**
     * The Comp Config landing page can intermittently take well over a minute to render
     * the Create Comp button (same slow cross-origin-widget loading pattern seen on other
     * Marketing pages) — reload and re-check a few times rather than failing outright.
     * Also waits out the app's own page-loader overlay: the button can report as "visible"
     * per Playwright's definition while the loader still visually sits on top of it,
     * intercepting clicks for the full click timeout even though the element underneath
     * is fine (same class of bug fixed on SidebarPage's navigation methods).
     */
    async waitForCreateCompButtonReady() {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const ready = await this.createCompBtn.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
            if (ready) {
                await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
                return;
            }
            console.log(`Create Comp button not ready after ~60s (attempt ${attempt}/${maxAttempts}) — reloading...`);
            await this.page.reload();
            await this.page.waitForLoadState('domcontentloaded');
        }
        // Final attempt: let the caller's own error surface if this still isn't visible.
        await this.createCompBtn.waitFor({ state: 'visible' });
        await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }
    async clickPayoutReport() {
        console.log('Clicking Payout Report button...');
        await this.clickElement(this.payoutReportBtn);
    }
    async clickCreateComp() {
        console.log('Clicking Create Comp button...');
        await this.waitForCreateCompButtonReady();
        await this.clickElement(this.createCompBtn);
    }
    /**
     * Waits for the Create Comp popup to finish loading — the dialog can render
     * skeleton placeholders first, so field locators aren't reliable until they're gone.
     */
    async waitForPopupLoad() {
        await this.dialog.waitFor({ state: 'visible' });
        await this.dialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }
    async fillTitle(value: string) {
        console.log(`Filling Title: ${value}`);
        await this.fillInput(this.titleInput, value);
    }
    async fillMultiCompBlockDays(value: string) {
        console.log(`Filling Multi Comp Block Period Days: ${value}`);
        await this.fillInput(this.multiCompBlockDaysInput, value);
    }
    async fillCompCode(value: string) {
        console.log(`Filling Comp Code: ${value}`);
        await this.fillInput(this.compCodeInput, value);
    }
    async fillAlertEmails(value: string) {
        console.log(`Filling Alert Email Addresses: ${value}`);
        await this.fillInput(this.alertEmailsInput, value);
    }
    /**
     * Opens the Start Date calendar and picks the first enabled day in the active
     * month (mirrors the pattern used for other PrimeNG calendars in this suite —
     * see PromotionConfigPage.setDateRange).
     */
    async selectStartDate() {
        console.log('Selecting Start Date...');
        await this.clickElement(this.startDateInput);
        await this.startDatePanel.waitFor({ state: 'visible' });
        const activeDay = this.startDatePanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeDay, { force: true });
        await this.dismissDatePanel(this.startDatePanel);
    }
    /**
     * Opens the End Date calendar and picks the last enabled day in the active
     * month, guaranteeing it succeeds the selected Start Date.
     */
    async selectEndDate() {
        console.log('Selecting End Date...');
        await this.clickElement(this.endDateInput);
        await this.endDatePanel.waitFor({ state: 'visible' });
        const activeDay = this.endDatePanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeDay, { force: true });
        await this.dismissDatePanel(this.endDatePanel);
    }
    /**
     * Opens the End Date calendar and picks the FIRST enabled day (rather than the
     * last, like selectEndDate()) — paired with selectStartDateLast() to deliberately
     * produce an invalid Start > End range for validation testing.
     */
    async selectEndDateFirst() {
        console.log('Selecting End Date (earliest enabled day)...');
        await this.clickElement(this.endDateInput);
        await this.endDatePanel.waitFor({ state: 'visible' });
        const activeDay = this.endDatePanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeDay, { force: true });
        await this.dismissDatePanel(this.endDatePanel);
    }
    /**
     * Opens the Start Date calendar and picks the LAST enabled day (rather than the
     * first, like selectStartDate()) — see selectEndDateFirst().
     */
    async selectStartDateLast() {
        console.log('Selecting Start Date (latest enabled day)...');
        await this.clickElement(this.startDateInput);
        await this.startDatePanel.waitFor({ state: 'visible' });
        const activeDay = this.startDatePanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeDay, { force: true });
        await this.dismissDatePanel(this.startDatePanel);
    }
    /**
     * This calendar is a date+time picker (selecting a day doesn't auto-close it — the
     * time portion stays open for input) — clicking a day alone leaves the overlay up,
     * where it visually overlaps and intercepts clicks on nearby controls (e.g. the
     * popup's own Close icon). Escape reliably dismisses it without needing to know
     * exactly what other confirm control the time picker exposes.
     */
    private async dismissDatePanel(panel: Locator) {
        await this.page.keyboard.press('Escape');
        await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(300);
    }
    async selectCampaign(optionText: string) {
        console.log(`Selecting Campaign: ${optionText}`);
        await this.selectDropdown(this.campaignDropdown, optionText);
    }
    async openCampaignDropdown() {
        console.log('Opening Campaign dropdown...');
        await this.clickElement(this.campaignDropdown);
    }
    /**
     * Selects whichever Campaign option renders first — used where a test just needs SOME
     * Campaign selected (now part of every comp creation, see createCompWithRetry), not a
     * specific one. Mirrors the identical "first available option" pattern already used for
     * Comp Bulk Configurations' dropdowns.
     */
    async selectFirstAvailableCampaign(): Promise<string> {
        console.log('Selecting first available Campaign...');
        await this.clickElement(this.campaignDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        // The panel doesn't always close from the option click alone — it can stay visually
        // on top and intercept the very next click (Is Gift's checkbox) for the full action
        // timeout, which is what "nothing happens after selecting Campaign" looks like from
        // the outside. Escape reliably dismisses it, mirroring dismissDatePanel above.
        const closed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
        if (!closed) {
            await this.page.keyboard.press('Escape');
            await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
        await this.page.waitForTimeout(300);
        console.log(` Selected Campaign: "${text}"`);
        return text;
    }
    async selectTag(optionText: string) {
        console.log(`Selecting Tag (Internal): ${optionText}`);
        await this.selectDropdown(this.tagDropdown, optionText);
    }
    async openTagDropdown() {
        console.log('Opening Tag (Internal) dropdown...');
        await this.clickElement(this.tagDropdown);
    }
    async isActiveChecked(): Promise<boolean> {
        return await this.isActiveCheckboxInput.isChecked();
    }
    async toggleActiveCheckbox() {
        console.log('Toggling Is Active checkbox...');
        await this.clickElement(this.isActiveCheckbox);
    }
    async isGiftChecked(): Promise<boolean> {
        return await this.isGiftCheckboxInput.isChecked();
    }
    async fillGiftDescription(value: string) {
        console.log(`Filling Gift Description: ${value}`);
        await this.fillInput(this.giftDescriptionInput, value);
    }
    /**
     * Checks Is Gift and Is Active directly, whichever of the two isn't already checked.
     * Is Gift's own native input sits on top of its visual `.p-checkbox-box` and intercepts
     * pointer events (confirmed live: a plain click retries for the full action timeout) —
     * force bypasses that hit-test failure, the same fix already used for every other
     * checkbox in this suite with this exact overlap (e.g. CompBulkConfigurationsPage).
     */
    async ensureGiftAndActiveChecked() {
        if (!(await this.isGiftChecked())) {
            await CommonUtils.highlightElement(this.isGiftCheckboxBox);
            await this.isGiftCheckboxBox.click({ force: true });
        }
        if (!(await this.isActiveChecked())) {
            await this.toggleActiveCheckbox();
        }
    }
    async clickSave() {
        console.log('Clicking Save button...');
        await this.clickElement(this.saveBtn);
    }
    /**
     * Clicks Save and waits (bounded — 20s, not the full 2-minute action timeout) for it to
     * actually take effect — the dialog closing — instead of assuming success and letting
     * some unrelated element hang later in the test when it silently didn't. Confirmed live:
     * this dev environment's Save intermittently no-ops (no toast, no error, dialog stays
     * open — see CM_018's original note); every caller that continued as if it had succeeded
     * was the one actually burning minutes waiting on a saved row/updated value that never
     * showed up.
     */
    async clickSaveAndVerify(timeout: number = 20000): Promise<boolean> {
        await this.clickSave();
        return await this.dialog.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }
    /**
     * Retries clickSaveAndVerify on an already-open Edit/Update popup — for flows with no new
     * Title/Comp Code to vary between attempts, a bare retry of the identical click is the
     * only lever available (unlike createCompWithRetry, which also varies the data).
     */
    async clickSaveWithRetry(maxAttempts: number = 3): Promise<boolean> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            if (await this.clickSaveAndVerify()) return true;
            console.warn(`clickSaveWithRetry: Save attempt ${attempt}/${maxAttempts} did not close the dialog — retrying...`);
        }
        return false;
    }
    async clickCancel() {
        console.log('Clicking Cancel button...');
        await this.clickElement(this.cancelBtn);
    }
    async clickCloseIcon() {
        console.log('Clicking popup close (X) icon...');
        await this.clickElement(this.closeIconBtn);
    }
    /**
     * Opens the three-dot row action menu for the given row (first row by default).
     */
    async openRowActionMenu(rowIndex: number = 0) {
        console.log(`Opening row action menu for row ${rowIndex}...`);
        await this.clickElement(this.rowMenuTrigger.nth(rowIndex));
        await this.actionMenu.waitFor({ state: 'visible' });
    }
    /**
     * Clicks a named option (Edit, Configurations, Payouts, Payout Errors, Copy, Delete)
     * in the currently-open row action menu.
     */
    async clickRowMenuOption(optionName: string) {
        console.log(`Clicking row menu option: ${optionName}`);
        await this.clickElement(this.actionMenu.getByRole('menuitem', { name: optionName, exact: true }));
    }
    /**
     * Clicks the named button (e.g. "Save"/"Cancel" for Copy, "Yes"/"No" for Delete) in the
     * Copy/Delete confirmation modal — a separate custom component from the Create/Edit
     * Comp dialog, so it needs its own locator scope.
     */
    async clickActionModalButton(buttonName: string) {
        console.log(`Clicking "${buttonName}" in the action confirm modal...`);
        await this.clickElement(this.actionModal.getByRole('button', { name: buttonName, exact: true }));
    }
    /**
     * Opens the Update Comp popup for the first row via the three-dot menu's "Edit" option
     * — reuses whatever Comp already exists on the landing page rather than creating a new
     * one, so Update-popup tests don't each pay the cost of a fresh Create.
     */
    async editFirstComp() {
        console.log('Opening Update Comp popup for the first saved Comp...');
        await this.ensureAtLeastOneSavedComp();
        await this.openRowActionMenu();
        await this.clickRowMenuOption('Edit');
        await this.waitForPopupLoad();
    }
    async closeActionModal() {
        console.log('Closing the action confirm modal via its X icon...');
        await this.clickElement(this.actionModalCloseIcon);
    }
    /**
     * Guarantees at least one saved Comp exists on the landing page — creates one if the
     * table is currently empty. Row-action tests (three-dot menu, Edit, Payouts, etc.) need
     * a real saved row to act on; this makes them self-contained instead of depending on
     * leftover data from other tests having run first.
     */
    async ensureAtLeastOneSavedComp() {
        // isVisible() checks the current DOM instantly — give the table a real chance to
        // finish its initial fetch/render before concluding it's genuinely empty.
        const hasRow = await this.rowMenuTrigger.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (hasRow) return;
        console.log('No saved Comp found — creating one for row-action tests...');
        await this.clickCreateComp();
        await this.waitForPopupLoad();
        await this.createCompWithRetry();
        await this.page.waitForTimeout(3000);
    }
    /**
     * Fills every mandatory field (Title, Start Date, End Date, Comp Code) with valid data.
     * Individual tests skip whichever field they're deliberately leaving blank.
     */
    async fillMandatoryFields(overrides?: { title?: string; compCode?: string; skip?: Array<'title' | 'startDate' | 'endDate' | 'compCode'> }) {
        const skip = overrides?.skip ?? [];
        if (!skip.includes('title')) {
            await this.fillTitle(overrides?.title ?? `Automation Comp ${Date.now()}`);
        }
        if (!skip.includes('startDate')) {
            await this.selectStartDate();
        }
        if (!skip.includes('endDate')) {
            await this.selectEndDate();
        }
        if (!skip.includes('compCode')) {
            await this.fillCompCode(overrides?.compCode ?? `CMP${Date.now()}`);
        }
    }
    /**
     * Creates a Comp on an already-open (fresh) Create Comp popup, retrying the entire
     * fill+save with a NEW unique Title/Comp Code if Save doesn't verifiably succeed —
     * addressing this dev environment's intermittent silent Save failures (see
     * clickSaveAndVerify) at the one point that actually matters: before any later step
     * gets a chance to hang waiting on a row/value that never materialized. The dialog is
     * documented to stay open (not close or error) on a silent failure, so refilling the
     * SAME open dialog with fresh values is enough — no need to reopen it between attempts.
     *
     * Also fills in what the popup now requires beyond the original 4 mandatory fields
     * (confirmed live): a Campaign selection, Is Gift + Is Active both checked, and Is Gift's
     * consequently-required Gift Description. This runs on every attempt/every caller
     * unconditionally, since it's a change to the popup itself, not something specific to any
     * one test.
     *
     * `fillExtra` runs after all of the above on every attempt (e.g. filling Alert Emails) —
     * it receives the fresh title/compCode in case a test wants to search for exactly what
     * ended up being saved.
     */
    async createCompWithRetry(
        fillExtra: (title: string, compCode: string) => Promise<void> = async () => {},
        maxAttempts: number = 3,
    ): Promise<{ title: string; compCode: string }> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const title = `Automation Comp ${Date.now()}_${CommonUtils.generateRandomString(4)}`;
            const compCode = `CMP${Date.now()}${CommonUtils.generateRandomString(4)}`;
            await this.fillMandatoryFields({ title, compCode });
            await this.selectFirstAvailableCampaign();
            await this.ensureGiftAndActiveChecked();
            await this.fillGiftDescription('Automation gift description');
            await fillExtra(title, compCode);
            if (await this.clickSaveAndVerify()) return { title, compCode };
            console.warn(`createCompWithRetry: Save attempt ${attempt}/${maxAttempts} did not close the dialog (still open) — refilling with fresh data and retrying...`);
        }
        throw new Error(`createCompWithRetry: Save did not succeed after ${maxAttempts} attempts — dialog never closed.`);
    }
    // ── Configurations screen (Comp Config's own "Configurations" kebab option) ─────────────
    // ASSUMPTION: this whole section mirrors CompBulkConfigurationsPage's already-confirmed-live
    // implementation field-for-field, since the breadcrumb and card markup observed while
    // debugging TC-45 in compbulk.spec.ts ("Marketing -> Marketing Comps -> Comp Config ->
    // Comp Configurations") confirm it's the SAME shared page, just reached from a Comp Config
    // row instead of a Comp Bulk row. It has not been independently live-run from this entry
    // point — if anything here doesn't match once run, it's almost certainly a real difference
    // worth reporting back rather than a typo in this file.
    /**
     * Opens Comp Config's own "Configurations" screen via an existing (or freshly created) row's
     * kebab menu -> Configurations.
     */
    async navigateToConfigurationsScreen() {
        console.log("Navigating to Comp Config's own Configurations screen...");
        await this.ensureAtLeastOneSavedComp();
        await this.openRowActionMenu();
        await this.clickRowMenuOption('Configurations');
        await this.page.waitForLoadState('networkidle');
        const loaded = await this.createConfigurationBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
        if (!loaded) {
            await this.page.reload();
            await this.page.waitForLoadState('networkidle');
            await this.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
        }
    }
    /**
     * Returns an existing configuration card if the Configurations screen already has one,
     * else creates a minimal one. Region Code is a finite, never-cleaned-up resource per Comp
     * (confirmed live: fillConfigMandatoryFields' selectAvailableRegionCode throws once every
     * region is already configured) — tests that don't care about a specific region (menu/
     * navigation behavior, not field values) should reuse whatever already exists rather than
     * insisting on a fresh Create, which will eventually fail outright once regions run out.
     */
    async ensureAtLeastOneConfiguration(): Promise<Locator> {
        const existing = this.page.locator(compConfigLocators.configurationCard).first();
        const hasOne = await existing.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
        if (hasOne) return existing;
        console.log('No existing configuration found — creating one...');
        await this.clickCreateConfiguration();
        await this.waitForConfigPopupLoad();
        const description = `Automation Config ${Date.now()}`;
        await this.fillConfigMandatoryFields({ description });
        await this.clickConfigSaveWithRetry();
        return this.getConfigurationCardByDescription(description);
    }
    /**
     * Same guarantee as ensureAtLeastOneConfiguration, but specifically returns an INACTIVE
     * card. Live-verified (six separate 120s click-timeout failures — COMP_CFG_MENU_003/007/
     * 007b/008/009/011 — all hanging on the exact same disabled kebab-menu link): Edit, Add
     * Band, AND Delete are all disabled on an Active configuration's menu, not just Edit as
     * COMP_CFG_MENU_014 already covered. ensureAtLeastOneConfiguration blindly returns whichever
     * card is first, which stays broken once that first card is left Active by an earlier test
     * (e.g. COMP_CFG_034's status toggle) in this shared, never-cleaned-up dev environment. New
     * configurations are created Inactive by default, so scanning existing cards first and
     * falling back to creating a fresh one always succeeds.
     */
    async ensureAtLeastOneInactiveConfiguration(): Promise<Locator> {
        await this.ensureAtLeastOneConfiguration();
        const cards = this.page.locator(compConfigLocators.configurationCard);
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const candidate = cards.nth(i);
            if (!(await this.isConfigCardActive(candidate))) {
                return candidate;
            }
        }
        console.log('Every existing configuration is Active — creating a fresh Inactive one...');
        await this.clickCreateConfiguration();
        await this.waitForConfigPopupLoad();
        const description = `Automation Config ${Date.now()}`;
        await this.fillConfigMandatoryFields({ description });
        await this.clickConfigSaveWithRetry();
        return this.getConfigurationCardByDescription(description);
    }
    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
        // Live-verified: PrimeNG's dialog mask overlay can linger (mid fade-out) even after the
        // previous Configuration dialog itself is reported hidden by clickConfigSaveAndWait —
        // creating two configurations back-to-back then hits a 120s click timeout with the
        // mask intercepting pointer events. Bounded/best-effort so the very first call (with no
        // prior dialog) isn't affected.
        await this.page.locator('.p-dialog-mask').last().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.clickElement(this.createConfigurationBtn);
        await this.page.waitForTimeout(500);
    }
    async waitForConfigPopupLoad() {
        await this.configDialog.waitFor({ state: 'visible' });
        await this.configDialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }
    async fillConfigDescription(value: string) {
        console.log(`Filling Configuration Description: "${value}"...`);
        await this.fillInput(this.configDescriptionInput, value);
    }
    /**
     * Same decimal-mode PrimeNG InputNumber blur-timing fix already proven in
     * CompBulkConfigurationsPage — blurs before verifying and compares numerically (tolerant
     * of ".00" padding) rather than trusting the pre-blur string.
     */
    private async fillConfigNumberField(input: Locator, value: string): Promise<void> {
        await input.waitFor({ state: 'visible', timeout: 5000 });
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
            throw new Error(`fillConfigNumberField: failed to set value to "${value}" — field shows "${await input.inputValue()}" after all attempts.`);
        }
    }
    async fillConfigMinimumPayout(value: string) {
        console.log(`Filling Minimum Comp Awarded: "${value}"...`);
        await this.fillConfigNumberField(this.configMinimumPayoutInput, value);
    }
    async fillConfigMaximumPayout(value: string) {
        console.log(`Filling Maximum Comp Awarded: "${value}"...`);
        await this.fillConfigNumberField(this.configMaximumPayoutInput, value);
    }
    async fillConfigCampaignBudget(value: string) {
        console.log(`Filling Campaign Budget: "${value}"...`);
        await this.fillConfigNumberField(this.configCampaignBudgetInput, value);
    }
    async fillConfigDailyBudget(value: string) {
        console.log(`Filling Daily Budget: "${value}"...`);
        await this.fillConfigNumberField(this.configDailyBudgetInput, value);
    }
    /**
     * Opens a PrimeNG-style filterable dropdown and clicks whichever option renders first,
     * returning its text — mirrors CompBulkConfigurationsPage.selectDropdownOption. Deliberately
     * does NOT avoid already-used Region Codes (unlike that same method's Comp Bulk counterpart)
     * — COMP_CFG_006 relies on picking the same first option twice in a row to trigger a
     * deliberate duplicate-region Save attempt.
     */
    async selectFirstConfigDropdownOption(dropdown: Locator): Promise<string> {
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await dropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }
        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        // Ensure THIS panel has actually closed before returning — calling this back-to-back
        // for multiple fields (see fillConfigMandatoryFields) opens a new dropdown while the
        // previous one may still be mid-close-animation, and the next call's own
        // '.p-dropdown-panel').last() can then pick up the wrong (still-detaching) panel,
        // landing an unrelated value into the wrong field. Mirrors the identical proven
        // Escape-fallback already used by selectFirstAvailableCampaign in this same file.
        const closed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
        if (!closed) {
            await this.page.keyboard.press('Escape');
            await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
        return text;
    }
    /**
     * Reads the Region already configured on each existing configuration card on the list page
     * behind this dialog (each card shows it as a disabled input next to a "Region" label, e.g.
     * "Betway Ghana (GH)") — mirrors CompBulkConfigurationsPage.getAlreadyConfiguredRegions
     * (same shared card markup). Region duplicates aren't allowed there (confirmed by the
     * user) — Create must never reuse one of these.
     */
    async getAlreadyConfiguredRegions(): Promise<string[]> {
        await this.page.locator(compConfigLocators.configurationCard).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const regionSpans = this.page.locator(compConfigLocators.configurationCard).locator('span.p-float-label')
        .filter({ has: this.page.locator('label:text-is("Region")') });
        const count = await regionSpans.count();
        const regions: string[] = [];
        for (let i = 0; i < count; i++) {
            const value = (await regionSpans.nth(i).locator('input').inputValue()).trim();
            if (value && value !== 'None' && value !== 'undefined') regions.push(value);
        }
        console.log(`Already-configured regions found (${count} card(s) checked): ${JSON.stringify(regions)}`);
        return regions;
    }
    /**
     * Selects the first Region Code dropdown option that ISN'T already configured — mirrors
     * CompBulkConfigurationsPage.selectRegionCode (same shared dialog/card markup). Confirmed
     * there live: picking an already-configured region leaves Save/the create call failing,
     * since the app blocks a duplicate region for this comp — evidently the same constraint
     * this Comp Config entry point never previously accounted for (selectFirstConfigDropdown
     * Option always picked the literal first option regardless of prior use).
     *
     * @param required When true (default false), throws if every option is already configured
     * instead of falling back to a duplicate — use for tests whose whole point is verifying a
     * fresh/unique region (e.g. COMP_CFG_005). Most callers only need a region selected to get
     * past the mandatory-fields gate and don't depend on Save actually succeeding, so a graceful
     * fallback (accepting a duplicate once every region is taken — confirmed live to eventually
     * happen, since Region Code is a finite, never-cleaned-up resource per Comp) keeps them
     * running instead of hard-failing on an unrelated precondition.
     */
    async selectAvailableRegionCode(required: boolean = false): Promise<string> {
        console.log('Selecting first available (not-yet-configured) Region Code...');
        const alreadyConfigured = await this.getAlreadyConfiguredRegions();
        await this.clickElement(this.configRegionCodeDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        const options = panel.locator('.p-dropdown-item');
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();
        let fallbackText = '';
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (!text) continue;
            if (!fallbackText) fallbackText = text;
            const isTaken = alreadyConfigured.some(used => used.includes(text) || text.includes(used));
            if (!isTaken) {
                await options.nth(i).click();
                await this.page.waitForTimeout(300);
                const closed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
                if (!closed) {
                    await this.page.keyboard.press('Escape');
                    await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
                }
                console.log(` Selected Region Code: "${text}" (not previously configured)`);
                return text;
            }
        }
        if (required || !fallbackText) {
            throw new Error('selectAvailableRegionCode: every dropdown option is already configured for this comp.');
        }
        console.warn(`selectAvailableRegionCode: every region is already configured — falling back to "${fallbackText}" (will be a duplicate).`);
        await options.filter({ hasText: fallbackText }).first().click();
        await this.page.waitForTimeout(300);
        const closed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
        if (!closed) {
            await this.page.keyboard.press('Escape');
            await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
        return fallbackText;
    }
    /**
     * Selects a Region Code dropdown option by exact name via keyboard type-ahead, since this
     * panel renders no filter/search input (confirmed live — unlike Banner/Transaction Type
     * etc., see BasePage.selectDropdown's filter-input trick) and scrolling its list container
     * directly via scrollTop does not render further virtualized items either (also confirmed
     * live). PrimeNG dropdowns natively support jumping to a match by typing while focused, the
     * same way a keyboard user would search without a visible filter box. Needed when a
     * SPECIFIC already-configured region must be re-selected (e.g. to deterministically test
     * duplicate-region rejection).
     */
    async selectRegionCodeByName(name: string): Promise<void> {
        console.log(`Selecting Region Code by name via keyboard type-ahead: "${name}"...`);
        await this.clickElement(this.configRegionCodeDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        await this.page.keyboard.type(name, { delay: 50 });
        await this.page.waitForTimeout(500);
        const target = panel.locator('.p-dropdown-item', { hasText: name }).first();
        if (await target.isVisible().catch(() => false)) {
            await target.click();
        } else {
            await this.page.keyboard.press('Enter');
        }
        await this.page.waitForTimeout(300);
        const closed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
        if (!closed) {
            await this.page.keyboard.press('Escape');
            await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }
    /**
     * Fills every mandatory Configuration field (Description, Region Code, Transaction Type,
     * Minimum/Maximum Comp Awarded, Campaign Budget), returning the Region Code text selected.
     * Individual tests skip whichever field they're deliberately leaving blank.
     *
     * Live-verified: Campaign Budget's label also carries a "" (confirmed via a live run's
     * DOM snapshot) — Save stays genuinely disabled without it, same as the other 5 asterisked
     * fields. It defaults to "0" (not empty), which reads as unfilled/untouched to the app's
     * own validation, unlike a real positive value.
     */
    async fillConfigMandatoryFields(overrides?: {
            description?: string;
            skip?: Array<'description' | 'regionCode' | 'transactionType' | 'minimumPayout' | 'maximumPayout' | 'campaignBudget'>;
    }): Promise<string> {
        const skip = overrides?.skip ?? [];
        if (!skip.includes('description')) {
            await this.fillConfigDescription(overrides?.description ?? `Automation Config ${Date.now()}`);
        }
        let regionText = '';
        if (!skip.includes('regionCode')) {
            regionText = await this.selectAvailableRegionCode();
        }
        if (!skip.includes('transactionType')) {
            await this.selectFirstConfigDropdownOption(this.configTransactionTypeDropdown);
        }
        if (!skip.includes('minimumPayout')) {
            await this.fillConfigMinimumPayout('10');
        }
        if (!skip.includes('maximumPayout')) {
            await this.fillConfigMaximumPayout('100');
        }
        if (!skip.includes('campaignBudget')) {
            await this.fillConfigCampaignBudget('1000');
        }
        return regionText;
    }
    private async toggleConfigCheckboxByLocator(checkbox: Locator, label: string) {
        console.log(`Toggling ${label} checkbox...`);
        const box = checkbox.locator('.p-checkbox-box');
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }
    async toggleConfigSendPush() {
        await this.toggleConfigCheckboxByLocator(this.configSendPushCheckbox, 'Push Notification');
    }
    async isConfigSendPushChecked(): Promise<boolean> {
        return await this.configSendPushCheckbox.locator('input').isChecked();
    }
    async toggleConfigSendSms() {
        await this.toggleConfigCheckboxByLocator(this.configSendSmsCheckbox, 'SMS Notification');
    }
    async isConfigSendSmsChecked(): Promise<boolean> {
        return await this.configSendSmsCheckbox.locator('input').isChecked();
    }
    async toggleConfigIsCompValueProvided() {
        await this.toggleConfigCheckboxByLocator(this.configIsCompValueProvidedCheckbox, 'Comp Value Provided');
    }
    async isConfigCompValueProvidedChecked(): Promise<boolean> {
        return await this.configIsCompValueProvidedCheckbox.locator('input').isChecked();
    }
    async toggleConfigAllowMultipleComp() {
        await this.toggleConfigCheckboxByLocator(this.configAllowMultipleCompCheckbox, 'Allow Multiple Comp');
    }
    async isConfigAllowMultipleCompChecked(): Promise<boolean> {
        return await this.configAllowMultipleCompCheckbox.locator('input').isChecked();
    }
    async clickConfigSave() {
        console.log('Clicking Configuration Save button...');
        await this.configSaveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(this.configSaveBtn);
        await this.page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await this.configSaveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }
    /** Clicks Save and waits (bounded) for the dialog to actually close — see clickSaveAndVerify. */
    async clickConfigSaveAndWait(timeout: number = 20000): Promise<boolean> {
        await this.clickConfigSave();
        return await this.configDialog.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }
    /**
     * Retries clickConfigSaveAndWait if the dialog doesn't close — mirrors clickSaveWithRetry
     * (the Create/Edit Comp dialog's identical fix). Confirmed live: Save can leave the
     * Create/Edit Configuration dialog open with a fully valid, enabled Save button and no
     * visible error — the same intermittent silent-no-op Save behavior already extensively
     * documented for the sibling Create/Edit Comp dialog (see CM_018/CM_021/CM_033), evidently
     * also affecting this dialog. There's no fresh data to vary between attempts here (unlike
     * createCompWithRetry) — a bare retry of the identical click is the only lever available.
     */
    async clickConfigSaveWithRetry(maxAttempts: number = 3): Promise<boolean> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            if (await this.clickConfigSaveAndWait()) return true;
            console.warn(`clickConfigSaveWithRetry: Save attempt ${attempt}/${maxAttempts} did not close the dialog — retrying...`);
        }
        return false;
    }
    async clickConfigCancel() {
        console.log('Clicking Configuration Cancel button...');
        await this.clickElement(this.configCancelBtn);
        await this.page.waitForTimeout(500);
    }
    async clickConfigCloseIcon() {
        console.log('Clicking Configuration popup close (X) icon...');
        await this.clickElement(this.configDialog.locator(compConfigLocators.closeIconBtn));
    }
    /** Locates a configuration card by its Description (rendered as the card's <h5> heading). */
    getConfigurationCardByDescription(description: string): Locator {
        return this.page.locator(compConfigLocators.configurationCard)
        .filter({ has: this.page.locator('h5', { hasText: description }) }).first();
    }
    /** Reads a configuration card's own Description (its <h5> heading) — see ensureAtLeastOneConfiguration. */
    async getConfigCardDescription(card: Locator): Promise<string> {
        return (await card.locator('h5').first().textContent())?.trim() ?? '';
    }
    /**
     * Reads a configuration card's value for a given field label (e.g. "Region", "Banner",
     * "Min Comp Rewarded") — each renders as a disabled input inside a shared p-float-label
     * span next to its own <label>, the same structure already confirmed for Comp Bulk's
     * Configuration cards (see CompBulkConfigurationsPage.getAlreadyConfiguredRegions).
     * Only for text/number-style fields — Status, Allow Multiple Comp, Value Provided and Dry
     * Run are NOT this kind of field (see the 4-switches note below); use
     * getConfigCardSwitch()/getConfigCardStatusLabel() for those instead.
     */
    async getConfigCardFieldValue(card: Locator, fieldLabel: string): Promise<string> {
        const span = card.locator('span.p-float-label').filter({ has: this.page.locator(`label:text-is("${fieldLabel}")`) });
        return (await span.locator('input').inputValue()).trim();
    }
    /**
     * Reads the given configuration card's own visible "Active"/"InActive" status label —
     * mirrors CompBulkConfigurationsPage.getActiveStatusLabel (same shared card markup).
     */
    getConfigCardStatusLabel(card: Locator): Locator {
        return card.getByText(/^(Active|InActive)$/, { exact: true }).first();
    }
    async isConfigCardActive(card: Locator): Promise<boolean> {
        return (await this.getConfigCardStatusLabel(card).textContent())?.trim() === 'Active';
    }
    /**
     * Confirmed live (see compBulkConfigurationsLocators.activeToggle's comment on the same
     * shared card markup): every configuration card renders exactly 4 PrimeNG InputSwitches,
     * in this order — Status, Allow Multiple Comp, Value Provided, Dry Run — all sharing the
     * identical ".p-inputswitch-slider" class with no other distinguishing id/aria-label.
     * Status alone has its own uniquely-scoped ".status-toggle" wrapper (see
     * getConfigCardStatusLabel/toggleConfigCardStatus above); the other 3 can only be
     * targeted by their position in that documented order.
     * ASSUMPTION: that ordering hasn't been independently live-confirmed from the Comp Config
     * entry point (only from Comp Bulk's) — adjust the index below if a live run disagrees.
     */
    private configCardSwitch(card: Locator, index: number): Locator {
        return card.locator('.p-inputswitch-slider').nth(index);
    }
    getConfigCardAllowMultipleCompSwitch(card: Locator): Locator {
        return this.configCardSwitch(card, 1);
    }
    getConfigCardValueProvidedSwitch(card: Locator): Locator {
        return this.configCardSwitch(card, 2);
    }
    getConfigCardDryRunSwitch(card: Locator): Locator {
        return this.configCardSwitch(card, 3);
    }
    /**
     * Clicks the given configuration card's Active/Inactive toggle and waits for its visible
     * Active/InActive label to actually flip, throwing if it never does — mirrors
     * CompBulkConfigurationsPage.toggleActiveStatus (same shared card markup, same
     * confirmed-slow backend update and hidden-input/visual-slider overlap needing `force`).
     */
    async toggleConfigCardStatus(card: Locator, timeout: number = 60000): Promise<void> {
        console.log('Toggling Status on configuration card...');
        const toggle = card.locator(compConfigLocators.configCardActiveToggle);
        const statusLabel = this.getConfigCardStatusLabel(card);
        const before = (await statusLabel.textContent().catch(() => null))?.trim() ?? '';
        await toggle.waitFor({ state: 'visible', timeout: 15000 });
        await CommonUtils.highlightElement(toggle);
        await toggle.click({ force: true });
        const pollInterval = 500;
        const maxAttempts = Math.ceil(timeout / pollInterval);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const current = (await statusLabel.textContent().catch(() => null))?.trim() ?? '';
            if (current && current !== before) {
                console.log(` Status changed: "${before}" -> "${current}"`);
                return;
            }
            await this.page.waitForTimeout(pollInterval);
        }
        throw new Error(`toggleConfigCardStatus: status label still reads "${before}" after clicking the toggle — the click may not have registered.`);
    }
    /**
     * Opens the given configuration card's kebab ("⋮") menu — same shared markup already
     * confirmed live for Comp Bulk's Configuration cards (see CompBulkConfigurationsPage's
     * clickEditOnCard/clickPayoutsOnCard/clickDeleteOnCard, which use this identical trigger).
     */
    async openConfigCardActionMenu(card: Locator): Promise<Locator> {
        console.log('Opening configuration card action menu...');
        // Live-verified: once a card has at least one Band added, its own "Comp Bands" section
        // (rendered inside the same .configuration-card container) adds a SECOND kebab trigger
        // for that Band row, sharing the identical button.p-button-icon-only:has(.pi-ellipsis-v)
        // markup — a bare card-scoped match hits a strict-mode violation (2 elements) once that
        // happens. The card's own trigger renders first in DOM order (right after its title/
        // status header, well before the Comp Bands section), so .first() reliably picks it.
        const menuTrigger = card.locator(compConfigLocators.configCardMenuTrigger).first();
        await this.clickElement(menuTrigger);
        const menu = this.page.locator('.p-menu, [role="menu"]').last();
        await menu.waitFor({ state: 'visible', timeout: 5000 });
        return menu;
    }
    /** Locates a named option in whichever configuration card menu is currently open. */
    getConfigCardMenuOption(optionName: string): Locator {
        return this.page.locator(`a.p-menuitem-link[aria-label="${optionName}"]`);
    }
    /**
     * Opens the given card's menu and clicks a named option (Edit, Test, Payouts, Payout
     * Errors, Add Band, Delete) — mirrors clickRowMenuOption (the Comp-level row menu), scoped
     * instead to a Configuration card. Edit/Payouts/Payout Errors/Add Band/Delete's aria-labels
     * are confirmed live on this identical shared markup via CompBulkConfigurationsPage; "Test"
     * is unique to this Comp Config entry point and hasn't been independently confirmed.
     */
    async clickConfigCardMenuOption(card: Locator, optionName: string): Promise<void> {
        console.log(`Clicking configuration card menu option: ${optionName}`);
        await this.openConfigCardActionMenu(card);
        await this.clickElement(this.getConfigCardMenuOption(optionName));
    }
    /**
     * Whether a named, currently-open configuration card menu option is disabled — checked via
     * PrimeNG's standard disabled markup (aria-disabled on the link itself, or a "p-disabled"
     * class on its parent <li>). No disabled item in this menu has been independently confirmed
     * live yet, so this tries both known PrimeNG conventions rather than assuming one.
     */
    async isConfigCardMenuOptionDisabled(optionName: string): Promise<boolean> {
        const option = this.getConfigCardMenuOption(optionName);
        if ((await option.getAttribute('aria-disabled')) === 'true') return true;
        const liClass = await option.locator('xpath=ancestor::li[1]').getAttribute('class').catch(() => null);
        return !!liClass?.includes('p-disabled');
    }
    /**
     * Confirms a just-opened configuration card Delete popup by clicking its affirmative
     * button. Neither the popup's exact component nor its button wording is independently
     * confirmed for this Configurations screen — tries the "Yes" wording already confirmed for
     * Comp Bulk's identical shared Delete modal (see compBulkConfigurationsLocators.buttonYes)
     * first, falling back to other common wordings.
     */
    async confirmConfigCardDelete(): Promise<void> {
        const dialog = this.page.locator('.p-dialog, [role="dialog"], .action-modal').last();
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        for (const label of ['Yes', 'Delete', 'Confirm']) {
            const btn = dialog.getByRole('button', { name: label, exact: true });
            if (await btn.isVisible().catch(() => false)) {
                await this.clickElement(btn);
                return;
            }
        }
        throw new Error('confirmConfigCardDelete: no Yes/Delete/Confirm button found in the delete confirmation popup.');
    }
    /** Cancels a just-opened configuration card Delete popup — see confirmConfigCardDelete. */
    async cancelConfigCardDelete(): Promise<void> {
        const dialog = this.page.locator('.p-dialog, [role="dialog"], .action-modal').last();
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        for (const label of ['No', 'Cancel']) {
            const btn = dialog.getByRole('button', { name: label, exact: true });
            if (await btn.isVisible().catch(() => false)) {
                await this.clickElement(btn);
                return;
            }
        }
        throw new Error('cancelConfigCardDelete: no No/Cancel button found in the delete confirmation popup.');
    }
    /**
     * Adds a Band to the given configuration card via its kebab menu -> Add Band, using the
     * field ids already confirmed live for this dialog on Comp Bulk's identical shared
     * Configurations page (see compBulkConfigurationsLocators bandField) — not independently
     * confirmed from the Comp Config entry point. Needed because toggleConfigCardStatus's
     * Active toggle is confirmed (on that same Comp Bulk side) to require at least 1 Band
     * already on the Configuration to succeed.
     */
    async addBandToConfigCard(card: Locator, minimumAmount: string = '10', maximumAmount: string = '100'): Promise<void> {
        console.log('Adding a Band to the configuration card...');
        await this.clickConfigCardMenuOption(card, 'Add Band');
        const dialog = this.page.locator('.p-dialog, [role="dialog"]').last();
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        await this.fillConfigNumberField(dialog.locator('#minimumBandAmount input'), minimumAmount);
        await this.fillConfigNumberField(dialog.locator('#maximumBandAmount input'), maximumAmount);
        await this.selectFirstConfigDropdownOption(dialog.locator('#transactionType'));
        await this.clickElement(dialog.getByRole('button', { name: 'Save', exact: true }));
        await dialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }
    /** Returns a locator scoped to the currently-open Add Band dialog. */
    getAddBandDialog(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]').last();
    }
    async fillBandMinimumAmount(dialog: Locator, value: string) {
        console.log(`Filling Minimum Band Amount: "${value}"...`);
        await this.fillConfigNumberField(dialog.locator('#minimumBandAmount input'), value);
    }
    async fillBandMaximumAmount(dialog: Locator, value: string) {
        console.log(`Filling Maximum Band Amount: "${value}"...`);
        await this.fillConfigNumberField(dialog.locator('#maximumBandAmount input'), value);
    }
    async fillBandBoostAmount(dialog: Locator, value: string) {
        console.log(`Filling Boost Amount: "${value}"...`);
        await this.fillConfigNumberField(dialog.locator('#boostAmount input'), value);
    }
    async selectBandTransactionType(dialog: Locator): Promise<string> {
        console.log('Selecting (Add Band) Transaction Type...');
        return this.selectFirstConfigDropdownOption(dialog.locator('#transactionType'));
    }
    /**
     * Locates a Band row by its Boost Amount — bands render as a flat list further down the
     * Configurations page, not nested per card (same shared DOM as
     * CompBulkConfigurationsPage.getBandByBoostAmount). Boost Amount is the one field a caller
     * can make reliably unique per test run, so this scopes to the exact Band a test just
     * created rather than any pre-existing one.
     */
    getBandByBoostAmount(boostAmount: string): Locator {
        return this.page.locator(
            `.band-details:has(div.detail-item:has(label:text-is("Boost Amount:")):has(span:text-is("${boostAmount}")))`
        );
    }
    /**
     * Opens the given Band row's kebab ("⋮") menu, clicks Delete, then confirms via Yes —
     * used to clean up Bands a test created so they don't accumulate on the dev site.
     */
    async deleteBandByBoostAmount(boostAmount: string): Promise<void> {
        console.log(`Deleting Band with Boost Amount "${boostAmount}"...`);
        const band = this.getBandByBoostAmount(boostAmount);
        await band.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = band.locator('button.p-button-icon-only:has(.pi-ellipsis-v)');
        await this.clickElement(menuTrigger);
        const deleteItem = this.page.locator('a.p-menuitem-link[aria-label="Delete"]');
        await deleteItem.waitFor({ state: 'visible', timeout: 5000 });
        await deleteItem.click();
        await this.page.waitForTimeout(500);
        const yesBtn = this.page.locator('button[aria-label="Yes"]');
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(500);
    }
    /**
     * Toggles the Add Band dialog's Is Percentage Amount checkbox — mirrors
     * CompBulkConfigurationsPage.toggleIsPercentageAmount (same shared Add Band dialog): the id
     * sits on the native input itself (unlike this file's own 4 Create/Edit Configuration
     * checkboxes, where the id is on the wrapper div).
     */
    async toggleIsPercentageAmount() {
        console.log('Toggling Is Percentage Amount checkbox...');
        const box = this.page.locator('.p-checkbox:has(#isPercentageAmount) .p-checkbox-box');
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }
    async isPercentageAmountChecked(): Promise<boolean> {
        return await this.page.locator('#isPercentageAmount').isChecked();
    }
    /**
     * Whether the given dialog's Save button is enabled — works for any dialog in this class
     * (Create/Edit Configuration, Add Band), which all share the same Save button markup.
     */
    async isDialogSaveEnabled(dialog: Locator): Promise<boolean> {
        const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true });
        return !(await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }
    /**
     * Clicks the given dialog's Save button — tolerant of a disabled button (never hangs the
     * full action timeout on negative-path tests that intentionally leave Save disabled).
     */
    async clickDialogSave(dialog: Locator) {
        console.log('Clicking Save button...');
        const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true });
        await saveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(saveBtn);
        await this.page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }
    async getToastText(timeout: number = 15000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }
}

