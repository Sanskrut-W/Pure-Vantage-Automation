import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { recurringRewardsLocators as locators } from '../locators/recurringRewardsLocators';

export class RecurringRewardsPage extends BasePage {
    readonly createConfigurationBtn: Locator;

    // Confirmed live (user-supplied outerHTML): every field below carries a real id, unlike Bet
    // Promotion Rules — no float-label-sibling lookups needed here.
    readonly promotionNameInput: Locator;
    readonly regionCodeDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly recurringFrequencyDropdown: Locator;
    readonly wagerAmountRequirementInput: Locator;
    readonly firstQualifyingBetOnlyCheckbox: Locator;

    // Confirmed live: these 2 only render once Recurring Frequency = Weekly.
    readonly weeklyExpiryDayDropdown: Locator;
    readonly weeklyExpiryTimeInput: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    readonly table: Locator;
    readonly searchInput: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    private readonly dialog: Locator;

    constructor(page: Page) {
        super(page);

        this.createConfigurationBtn = page.getByRole('button', { name: locators.buttonCreateConfiguration, exact: true });

        // Confirmed live: only one Create/Edit popup is ever open at a time — a bare
        // `div[role="dialog"]` is enough, same simpler convention as BetPromotionRulesPage.
        this.dialog = page.locator('div[role="dialog"]').first();

        this.promotionNameInput = this.dialog.locator(locators.inputPromotionName);
        this.regionCodeDropdown = this.dialog.locator(locators.dropdownRegionCode);
        this.startDateInput = this.dialog.locator(locators.calendarStartDate);
        this.endDateInput = this.dialog.locator(locators.calendarEndDate);
        this.recurringFrequencyDropdown = this.dialog.locator(locators.dropdownRecurringFrequency);
        this.wagerAmountRequirementInput = this.dialog.locator(locators.inputWagerAmountRequirement);
        this.firstQualifyingBetOnlyCheckbox = this.dialog.locator(locators.checkboxFirstQualifyingBetOnly);

        this.weeklyExpiryDayDropdown = this.dialog.locator(locators.dropdownWeeklyExpiryDay);
        this.weeklyExpiryTimeInput = this.dialog.locator(locators.calendarWeeklyExpiryTime);

        this.saveBtn = this.dialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: locators.buttonCancel, exact: true });

        this.table = page.locator('.pure__table').first();
        this.searchInput = page.locator(locators.searchInput);
        this.confirmYesBtn = page.locator(locators.confirmYesBtn).first();
        this.confirmNoBtn = page.locator(locators.confirmNoBtn).first();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page / navigation
    // ═══════════════════════════════════════════════════════════════════════

    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
        await this.clickElement(this.createConfigurationBtn);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    getRowByPromotionName(promotionName: string): Locator {
        return this.table.locator('tbody tr', { hasText: promotionName }).first();
    }

    /** Confirmed live (TC_RR_23): this table paginates server-side (confirmed Page 1/2/3 + Next/
     * Last Page controls) and a freshly created/cloned reward doesn't necessarily land on page 1 —
     * a plain `tbody tr` locator only ever sees the CURRENTLY rendered page's rows, so checking
     * page 1 alone can read 0 even though the reward genuinely exists. Walks the paginator forward
     * with its "Next Page" button (same proven pattern already used for scratch-and-win.spec.ts's
     * own Manage Prizes table) until a matching row turns up or there are no more pages. */
    private async ensureRowRenderedAcrossPages(promotionName: string, maxPages: number = 20) {
        const row = this.getRowByPromotionName(promotionName);

        // Confirmed live (TC_RR_23): this walker only ever moves FORWARD, and a previous call
        // (e.g. the "before Clone" row-count check) can leave the table sitting on a later page.
        // Inserting a new row (Clone, Create) can shift sort order so the target now sits EARLIER
        // than wherever the table was left — without resetting to page 1 first, the next search
        // starts from the wrong spot and can walk straight to the true last page without ever
        // passing back over the page the row is actually on now.
        const firstPageBtn = this.page.getByRole('button', { name: 'First Page' });
        if (await firstPageBtn.isEnabled().catch(() => false)) {
            await firstPageBtn.click();
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.page.waitForTimeout(300);
        }

        const nextPageBtn = this.page.getByRole('button', { name: 'Next Page' });
        for (let i = 0; i < maxPages; i++) {
            const found = await row.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
            if (found) return;
            const canGoNext = await nextPageBtn.isEnabled().catch(() => false);
            if (!canGoNext) return;
            await nextPageBtn.click();
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async isRowVisibleByPromotionName(promotionName: string, timeout: number = 20000): Promise<boolean> {
        await this.ensureRowRenderedAcrossPages(promotionName);
        return await this.getRowByPromotionName(promotionName).waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /** Counts ALL rows matching this Promotion Name — this app does not enforce unique Promotion
     * Names (confirmed live: the real data table already shows 2 separate rows both named "Pranav
     * Test"), so Clone can legitimately leave more than one row sharing the same name. Only counts
     * whichever single page the paginator lands on after ensureRowRenderedAcrossPages — fine for
     * this app's own tests, since Clone's 2 matching rows render adjacently (same sort position),
     * not split across pages. */
    async getRowCountByPromotionName(promotionName: string): Promise<number> {
        await this.ensureRowRenderedAcrossPages(promotionName);
        return await this.table.locator('tbody tr', { hasText: promotionName }).count();
    }

    async searchFor(value: string) {
        console.log(`Searching for "${value}"...`);
        await this.fillInput(this.searchInput, value);
        await this.page.waitForTimeout(500);
    }

    /** UNCONFIRMED: the user's own "region filter" outerHTML was an exact duplicate of the Search
     * bar's markup (same id="search-input"), not the real filter control — so no confirmed
     * selector exists for it. Falls back to the first visible PrimeNG dropdown in <main> that
     * ISN'T inside the Create/Edit dialog or the table's own pagination "rows per page" picker,
     * on the theory that a page-level filter dropdown would render there (same general area as
     * LeaderboardPage's own page-level Active/Inactive filter). Returns false (and does nothing)
     * if no such dropdown is found, rather than guessing further — callers should treat a false
     * return as "ask the user for this control's real outerHTML" rather than a hard failure. */
    async selectFirstRegionFilterOption(): Promise<string | null> {
        const candidate = this.page.locator('main div.p-dropdown').first();
        const found = await candidate.isVisible({ timeout: 5000 }).catch(() => false);
        if (!found) {
            console.log('Region filter dropdown not found with the best-effort selector — outerHTML needed to confirm it.');
            return null;
        }
        return this.selectFirstOption(candidate);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Generic PrimeNG dropdown helpers (same proven pattern as BetPromotionRulesPage)
    // ═══════════════════════════════════════════════════════════════════════

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

    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(locators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    async selectOption(dropdownLocator: Locator, optionText: string) {
        await this.selectDropdown(dropdownLocator, optionText);
    }

    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const label = dropdownLocator.locator('.p-dropdown-label');
        const text = (await label.innerText({ timeout: 3000 }).catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.page.locator(locators.validationError).count()) > 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Base fields
    // ═══════════════════════════════════════════════════════════════════════

    async fillPromotionName(value: string) {
        console.log(`Filling Promotion Name: "${value}"...`);
        await this.fillInput(this.promotionNameInput, value);
    }

    async getPromotionNameValue(): Promise<string> {
        return (await this.promotionNameInput.inputValue()).trim();
    }

    async selectFirstRegionCode(): Promise<string> {
        return this.selectFirstOption(this.regionCodeDropdown);
    }

    // Confirmed live: aria-controls points straight at each calendar's own STATIC panel id
    // (startDate_panel / endDate_panel) — no dynamic lookup needed, unlike the list page's own
    // Start/End Date filters elsewhere in this app.
    private async setDateField(input: Locator, panelId: string) {
        await input.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator(`#${panelId}`);
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td[data-p-today="true"] span').first().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async setStartDate() {
        console.log('Selecting Start Date (today)...');
        await this.setDateField(this.startDateInput, locators.calendarStartDatePanel);
    }

    async setEndDate() {
        console.log('Selecting End Date (today)...');
        await this.setDateField(this.endDateInput, locators.calendarEndDatePanel);
    }

    async selectRecurringFrequency(value: 'Daily' | 'Weekly') {
        await this.selectDropdown(this.recurringFrequencyDropdown, value);
    }

    // Wager Amount Requirement is a p-inputnumber — same proven keystroke-tracking convention
    // used elsewhere in this app (plain .fill() doesn't register with InputNumber).
    async fillWagerAmountRequirement(value: string) {
        await this.wagerAmountRequirementInput.waitFor({ state: 'visible' });
        await this.wagerAmountRequirementInput.click({ clickCount: 3 });
        await this.wagerAmountRequirementInput.pressSequentially(value);
        await this.wagerAmountRequirementInput.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async getWagerAmountRequirementValue(): Promise<string> {
        return (await this.wagerAmountRequirementInput.inputValue()).trim();
    }

    async isFirstQualifyingBetOnlyChecked(): Promise<boolean> {
        return await this.firstQualifyingBetOnlyCheckbox.locator('input[type="checkbox"]').isChecked();
    }

    async toggleFirstQualifyingBetOnly() {
        await this.firstQualifyingBetOnlyCheckbox.locator('.p-checkbox-box').click({ force: true });
        await this.page.waitForTimeout(200);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Weekly-only fields (revealed when Recurring Frequency = Weekly)
    // ═══════════════════════════════════════════════════════════════════════

    async selectFirstWeeklyExpiryDay(): Promise<string> {
        return this.selectFirstOption(this.weeklyExpiryDayDropdown);
    }

    /** Sets Weekly Expiry Time via its clock increment arrows — same proven convention already
     * used elsewhere in this app (CompAlertsPage.adjustTimeViaArrows / timedpromo.spec.ts's
     * selectTimeUsingClockArrows) for a PrimeNG time-only Calendar. */
    async setWeeklyExpiryTime(hourClicks: number = 2, minuteClicks: number = 3) {
        console.log(`Setting Weekly Expiry Time via clock arrows (hour+${hourClicks}, minute+${minuteClicks})...`);
        await this.weeklyExpiryTimeInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator(`#${locators.calendarWeeklyExpiryTimePanel}, .p-timepicker-panel`).last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const hourUpArrow = panel
            .locator('.p-hour-picker [data-pc-section="incrementbutton"], .p-hour-picker button:has(.pi-chevron-up), .p-hour-picker a.p-link:has(.pi-chevron-up)')
            .first();
        for (let i = 0; i < hourClicks; i++) {
            await hourUpArrow.click();
            await this.page.waitForTimeout(150);
        }

        const minuteUpArrow = panel
            .locator('.p-minute-picker [data-pc-section="incrementbutton"], .p-minute-picker button:has(.pi-chevron-up), .p-minute-picker a.p-link:has(.pi-chevron-up)')
            .first();
        for (let i = 0; i < minuteClicks; i++) {
            await minuteUpArrow.click();
            await this.page.waitForTimeout(150);
        }

        // Confirmed live elsewhere in this app (CompAlertsPage's own time-arrow fields): pressing
        // Escape here closes the WHOLE parent Create/Edit dialog, not just this time popup, once
        // the popup has already registered the arrow clicks — wiping out every other field already
        // filled. Click a neutral, always-present field instead (Promotion Name) to dismiss it.
        if (await panel.isVisible().catch(() => false)) {
            await this.promotionNameInput.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Save / Cancel / toast
    // ═══════════════════════════════════════════════════════════════════════

    async clickSave() {
        console.log('Clicking Save...');
        await this.clickElement(this.saveBtn);
        await this.page.waitForTimeout(300);
    }

    async clickCancel() {
        console.log('Clicking Cancel...');
        await this.clickElement(this.cancelBtn);
        await this.page.waitForTimeout(300);
    }

    async getToastText(timeout: number = 10000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Delete cleanup — fully confirmed live (user-supplied outerHTML): kebab "..." trigger ->
    //  .p-menuitem-text "Delete" -> Yes/No modal.
    // ═══════════════════════════════════════════════════════════════════════

    /** Opens a row's "..." kebab menu. Shared by Edit/Clone/Delete, which only differ in which
     * menu item they click next. */
    private async openRowMenu(row: Locator) {
        const dotsBtn = row.locator(locators.rowMenuTrigger);
        await dotsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(dotsBtn);
    }

    private async clickDeleteForRow(row: Locator) {
        await this.openRowMenu(row);
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(locators.menuItemDelete, { exact: true });
        await menuItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menuItem);
    }

    /** Deletes a Recurring Reward by its Promotion Name. Swallows errors so it's safe to call
     * unconditionally from afterEach, even if no reward was ever created (e.g. the test failed
     * before reaching Save) or it was already removed. */
    async deleteRewardIfPresent(promotionName: string) {
        try {
            await this.ensureRowRenderedAcrossPages(promotionName);
            const row = this.getRowByPromotionName(promotionName);
            const isPresent = await row.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for "${promotionName}" — row not present.`);
                return;
            }

            await this.clickDeleteForRow(row);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickElement(this.confirmYesBtn);
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await row.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            console.log(`Delete cleanup completed for "${promotionName}".`);
        } catch (error) {
            console.log(`Delete cleanup failed for "${promotionName}": ${error}`);
        }
    }

    /** Deletes EVERY row matching this Promotion Name, one at a time — needed because this app
     * allows duplicate Promotion Names (e.g. Clone), so a single delete can leave a sibling row
     * behind. Bounded by `maxAttempts` so a genuinely stuck delete can't loop forever. */
    async deleteAllRewardsByPromotionName(promotionName: string, maxAttempts: number = 5) {
        for (let i = 0; i < maxAttempts; i++) {
            const isPresent = await this.isRowVisibleByPromotionName(promotionName, 3000);
            if (!isPresent) return;
            await this.deleteRewardIfPresent(promotionName);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Edit / Clone — confirmed live (user-supplied outerHTML) kebab menu items, same
    //  `.p-menu, .p-tieredmenu` overlay as Delete.
    // ═══════════════════════════════════════════════════════════════════════

    /** Opens the Edit popup for a Reward by its Promotion Name — reuses the SAME Create/Edit
     * dialog fields (promotionNameInput, regionCodeDropdown, etc.), now pre-filled with the
     * existing Reward's values. */
    async clickEditByPromotionName(promotionName: string) {
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.openRowMenu(row);
        const editItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText('Edit', { exact: true });
        await editItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(editItem);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Opens the Clone popup for a Reward by its Promotion Name. ASSUMED (not independently
     * confirmed — only the Clone menu item and the popup's own Save button were captured live):
     * this reuses the same Create/Edit dialog, pre-filled with the original Reward's values, same
     * as the already-confirmed Clone pattern elsewhere in this app (RulesEnginePage's own
     * confirmCloneDialog/cancelCloneDialog for its Rule list). */
    async clickCloneByPromotionName(promotionName: string) {
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.openRowMenu(row);
        const cloneItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText('Clone', { exact: true });
        await cloneItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(cloneItem);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }
}
