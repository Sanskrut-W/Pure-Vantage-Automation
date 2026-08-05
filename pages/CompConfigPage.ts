import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
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

        console.log(`  Selected Campaign: "${text}"`);
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

    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
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
        return text;
    }

    /**
     * Fills every mandatory Configuration field (Description, Region Code, Transaction Type,
     * Minimum/Maximum Comp Awarded), returning the Region Code text selected. Individual tests
     * skip whichever field they're deliberately leaving blank.
     */
    async fillConfigMandatoryFields(overrides?: {
        description?: string;
        skip?: Array<'description' | 'regionCode' | 'transactionType' | 'minimumPayout' | 'maximumPayout'>;
    }): Promise<string> {
        const skip = overrides?.skip ?? [];
        if (!skip.includes('description')) {
            await this.fillConfigDescription(overrides?.description ?? `Automation Config ${Date.now()}`);
        }
        let regionText = '';
        if (!skip.includes('regionCode')) {
            regionText = await this.selectFirstConfigDropdownOption(this.configRegionCodeDropdown);
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

    /**
     * Reads a configuration card's value for a given field label (e.g. "Region", "Banner",
     * "Min Comp Rewarded") — each renders as a disabled input inside a shared p-float-label
     * span next to its own <label>, the same structure already confirmed for Comp Bulk's
     * Configuration cards (see CompBulkConfigurationsPage.getAlreadyConfiguredRegions).
     */
    async getConfigCardFieldValue(card: Locator, fieldLabel: string): Promise<string> {
        const span = card.locator('span.p-float-label').filter({ has: this.page.locator(`label:text-is("${fieldLabel}")`) });
        return (await span.locator('input').inputValue()).trim();
    }
}
