import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compConfigLocators } from '../locators/compConfigLocators';

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

    async clickSave() {
        console.log('Clicking Save button...');
        await this.clickElement(this.saveBtn);
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
        await this.fillMandatoryFields();
        await this.clickSave();
        // Save has shown intermittent silent failures in this dev environment (see CM_018's
        // note) — bound the wait so this helper can't hang forever if that happens here.
        await this.dialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
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
}
