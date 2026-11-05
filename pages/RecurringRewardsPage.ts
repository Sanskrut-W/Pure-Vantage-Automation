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

    // Sports Requirements sub-page (row ⋯ -> "Sports Requirements") — confirmed live (probe).
    readonly backToRewardsBtn: Locator;
    readonly createSportRequirementBtn: Locator;
    readonly sportRequirementTable: Locator;
    readonly sportRequirementDialog: Locator;
    readonly feedNameDropdown: Locator;
    readonly sportDropdown: Locator;
    readonly leagueDropdown: Locator;
    readonly countryDropdown: Locator;
    readonly betSlipTypeDropdown: Locator;
    readonly eventDropdown: Locator;
    readonly marketDropdown: Locator;
    readonly minimumBetslipOddsInput: Locator;
    readonly minimumLegsRequiredInput: Locator;
    readonly minimumLegOddsMultiplierInput: Locator;
    readonly singleLegOnlySwitch: Locator;
    readonly applyOddsToLegsInTotalSwitch: Locator;
    readonly sportRequirementSaveBtn: Locator;
    readonly sportRequirementCancelBtn: Locator;

    // Casino Requirements sub-page (row ⋯ -> "Casino Requirements") — confirmed live
    // (user-supplied outerHTML).
    readonly createRewardBtn: Locator;
    readonly casinoRequirementTable: Locator;
    readonly casinoRequirementDialog: Locator;
    readonly providerDropdown: Locator;
    readonly gameDropdown: Locator;
    readonly categoryInput: Locator;
    readonly casinoRequirementSaveBtn: Locator;
    readonly casinoRequirementCancelBtn: Locator;

    // Comp Configuration sub-page (row ⋯ -> "Comp Configuration") — confirmed live
    // (user-supplied outerHTML).
    readonly createCompConfigurationBtn: Locator;
    readonly compConfigurationTable: Locator;
    readonly compConfigurationDialog: Locator;
    readonly compCodeDropdown: Locator;
    readonly compAmountInput: Locator;
    readonly scheduledTimeInput: Locator;
    readonly dayOfWeekDropdown: Locator;
    readonly isScheduledCheckbox: Locator;
    readonly compConfigurationSaveBtn: Locator;
    readonly compConfigurationCancelBtn: Locator;

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

        this.backToRewardsBtn = page.locator(locators.buttonBackToRewards).first();
        this.createSportRequirementBtn = page.getByRole('button', { name: locators.buttonCreateSportRequirement, exact: true });
        this.sportRequirementTable = page.locator(locators.sportRequirementTable).first();
        // Confirmed live (TC_RR_33): the Edit flow opens a dialog titled "Update Sport Requirement",
        // NOT "Create Sport Requirement" — name-scoping this to the Create title broke every field
        // locator built from it as soon as Edit was used. Only one such popup is ever open at a time
        // (same simpler convention already used by RecurringRewardsPage's own `dialog` for the
        // Reward-level Create/Edit popup), so a bare, title-agnostic `div[role="dialog"]` works for
        // both Create and Update.
        this.sportRequirementDialog = page.locator('div[role="dialog"]').last();
        this.feedNameDropdown = this.sportRequirementDialog.locator(locators.dropdownFeedName);
        this.sportDropdown = this.sportRequirementDialog.locator(locators.dropdownSport);
        this.leagueDropdown = this.sportRequirementDialog.locator(locators.dropdownLeague);
        this.countryDropdown = this.sportRequirementDialog.locator(locators.dropdownCountry);
        this.betSlipTypeDropdown = this.sportRequirementDialog.locator(locators.dropdownBetSlipType);
        this.eventDropdown = this.sportRequirementDialog.locator(locators.dropdownEvent);
        this.marketDropdown = this.sportRequirementDialog.locator(locators.dropdownMarket);
        this.minimumBetslipOddsInput = this.sportRequirementDialog.locator(locators.inputMinimumBetslipOdds);
        this.minimumLegsRequiredInput = this.sportRequirementDialog.locator(locators.inputMinimumLegsRequired);
        this.minimumLegOddsMultiplierInput = this.sportRequirementDialog.locator(locators.inputMinimumLegOddsMultiplier);
        this.singleLegOnlySwitch = this.sportRequirementDialog.locator(locators.inputSwitch).nth(0);
        this.applyOddsToLegsInTotalSwitch = this.sportRequirementDialog.locator(locators.inputSwitch).nth(1);
        this.sportRequirementSaveBtn = this.sportRequirementDialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.sportRequirementCancelBtn = this.sportRequirementDialog.getByRole('button', { name: locators.buttonCancel, exact: true });

        this.createRewardBtn = page.getByRole('button', { name: locators.buttonCreateReward, exact: true });
        this.casinoRequirementTable = page.locator(locators.casinoRequirementTable).first();
        // Title-agnostic from the start (lesson learned from Sport Requirement's own Create/Update
        // dialog-title mismatch) — only one such popup is ever open at a time.
        this.casinoRequirementDialog = page.locator('div[role="dialog"]').last();
        this.providerDropdown = this.casinoRequirementDialog.locator(locators.dropdownProvider);
        this.gameDropdown = this.casinoRequirementDialog.locator(locators.dropdownGame);
        this.categoryInput = this.casinoRequirementDialog.locator(locators.inputCategory);
        this.casinoRequirementSaveBtn = this.casinoRequirementDialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.casinoRequirementCancelBtn = this.casinoRequirementDialog.getByRole('button', { name: locators.buttonCancel, exact: true });

        this.createCompConfigurationBtn = page.getByRole('button', { name: locators.buttonCreateCompConfiguration, exact: true });
        this.compConfigurationTable = page.locator(locators.compConfigurationTable).first();
        // Confirmed live (every TC_RR_4x run): this popup's own Scheduled Time field renders a
        // SECOND, separate `role="dialog"` element for its clock-arrow overlay ("Choose Date") the
        // moment the popup mounts — not only once it's clicked — so a positional `.last()` (the
        // convention used for Sport/Casino Requirement, neither of which has a Calendar field) picks
        // that overlay instead of the real popup as soon as it exists. Scoped by content instead
        // (the one dialog containing #compCode), which works for both Create and Edit and can never
        // match the Choose Date overlay.
        this.compConfigurationDialog = page.locator('div[role="dialog"]').filter({ has: page.locator(locators.dropdownCompCode) });
        this.compCodeDropdown = this.compConfigurationDialog.locator(locators.dropdownCompCode);
        this.compAmountInput = this.compConfigurationDialog.locator(locators.inputCompAmount);
        this.scheduledTimeInput = this.compConfigurationDialog.locator(locators.calendarScheduledTime);
        this.dayOfWeekDropdown = this.compConfigurationDialog.locator(locators.dropdownDayOfWeek);
        this.isScheduledCheckbox = this.compConfigurationDialog.locator(locators.checkboxIsScheduled);
        this.compConfigurationSaveBtn = this.compConfigurationDialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.compConfigurationCancelBtn = this.compConfigurationDialog.getByRole('button', { name: locators.buttonCancel, exact: true });
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

    /** Picks whichever option does NOT match `excludeText` — used to force a different selection
     * than the one already made (e.g. Casino Requirement's Provider, to verify Game gets cleared).
     * Returns null if only one option exists. */
    async selectOptionOtherThan(dropdownLocator: Locator, excludeText: string): Promise<string | null> {
        const panel = await this.openDropdown(dropdownLocator);
        const options = panel.locator(locators.dropdownItem);
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (text && text !== excludeText) {
                await options.nth(i).click();
                await this.page.waitForTimeout(300);
                return text;
            }
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        return null;
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

    /** The specific toast carrying this text — an earlier toast can still be on screen, so never
     * read "the first toast" when asserting a particular one. */
    getToastByText(text: string): Locator {
        return this.page.locator(locators.toastMessage).filter({ hasText: text });
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

    /** Gets back to the Rewards list page before cleanup runs, regardless of where a failed test
     * left off. Confirmed gap: every Sport/Casino/Comp Configuration sub-page test ends with its own
     * `clickBackToRewards()` as its LAST line — a test that fails earlier (e.g. TC_RR_46's/49's own
     * Scheduled Time timeout) never reaches it, so `deleteAllRewardsByPromotionName` afterward was
     * searching the Rewards-list table while the browser was still sitting on the sub-page, never
     * finding the row, and silently leaking the Reward despite `rewardNameToCleanup` being set.
     * Safe to call unconditionally: a no-op when already on the list. */
    async ensureOnRewardsListPage(): Promise<void> {
        const onList = await this.createConfigurationBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (onList) return;

        // A failed test can leave the Create/Edit popup — and/or its own nested overlay (e.g. Comp
        // Configuration's Scheduled Time "Choose Date" picker, stacked on top) — open over the
        // sub-page. Escape closes one layer at a time, so press it twice to clear both before
        // trying Back to Rewards.
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(300);
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(300);

        const canGoBack = await this.backToRewardsBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (canGoBack) {
            await this.backToRewardsBtn.click({ force: true }).catch(() => {});
            await this.createConfigurationBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
        }
    }

    /** Deletes a Recurring Reward through the UI WITHOUT swallowing errors — for tests that check
     * the Delete flow itself. Confirmed live (TC_RR_24): the list doesn't necessarily reflect the
     * deletion immediately even after the success toast appears and the caller's own
     * `waitForLoadState('networkidle')` resolves — same "list lags the server" behavior already
     * seen elsewhere in this app. Waits for the row to actually disappear before returning, same
     * proven pattern as deleteRewardIfPresent, so a caller's own absence check isn't racing it. */
    async deleteRewardByPromotionName(promotionName: string) {
        console.log(`Deleting Recurring Reward "${promotionName}"...`);
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickDeleteForRow(row);
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await row.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
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

    // ═══════════════════════════════════════════════════════════════════════
    //  Sports Requirements sub-page — confirmed live (probe): row ⋯ -> "Sports Requirements"
    //  opens /recurring-reward-sport/<id> with its own "Create Sport Requirement" popup.
    // ═══════════════════════════════════════════════════════════════════════

    async clickSportsRequirementsByPromotionName(promotionName: string) {
        console.log(`Opening Sports Requirements for "${promotionName}"...`);
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.openRowMenu(row);
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(locators.menuItemSportsRequirements, { exact: true });
        await menuItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menuItem);
        await this.createSportRequirementBtn.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickBackToRewards() {
        console.log('Clicking Back to Recurring Rewards...');
        await this.clickElement(this.backToRewardsBtn);
        await this.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickCreateSportRequirement() {
        console.log('Clicking Create Sport Requirement button...');
        await this.clickElement(this.createSportRequirementBtn);
        await this.feedNameDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Opens a Sport Requirement dropdown via its chevron — Sport is an editable dropdown, so
     * clicking its body only focuses the text box (confirmed live). Types the first word into the
     * panel filter when one is shown, then clicks the option containing `optionText`; with no
     * `optionText`, clicks the first option. Returns the picked option's text. */
    private async pickSportRequirementOption(dropdown: Locator, optionText?: string): Promise<string> {
        await this.clickElement(dropdown.locator(locators.dropdownTrigger));
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        if (optionText) {
            const filterInput = panel.locator('input.p-dropdown-filter');
            if (await filterInput.isVisible().catch(() => false)) {
                await filterInput.fill(optionText.split(' ')[0]);
                await this.page.waitForTimeout(300);
            }
        }

        const option = optionText
            ? panel.locator(locators.dropdownItem, { hasText: optionText }).first()
            : panel.locator(locators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await this.clickElement(option);
        await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(500);
        return text;
    }

    async selectFeedName(value: string) {
        console.log(`Selecting Feed Name: "${value}"...`);
        await this.pickSportRequirementOption(this.feedNameDropdown, value);
    }

    async selectSport(value: string) {
        console.log(`Selecting Sport: "${value}"...`);
        await this.pickSportRequirementOption(this.sportDropdown, value);
        // Confirmed live: League/Country/Event/Market switch from free-text to dropdowns once a
        // Sport is picked — they don't all switch over in the exact same tick, so wait for every one
        // of their triggers (not just League's) before anything downstream reads their enabled state.
        await this.leagueDropdown.locator(locators.dropdownTrigger).waitFor({ state: 'visible', timeout: 10000 });
        await this.countryDropdown.locator(locators.dropdownTrigger).waitFor({ state: 'visible', timeout: 10000 });
        await this.eventDropdown.locator(locators.dropdownTrigger).waitFor({ state: 'visible', timeout: 10000 });
        await this.marketDropdown.locator(locators.dropdownTrigger).waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectLeague(value: string) {
        console.log(`Selecting League: "${value}"...`);
        await this.pickSportRequirementOption(this.leagueDropdown, value);
    }

    async selectCountry(value: string) {
        console.log(`Selecting Country: "${value}"...`);
        await this.pickSportRequirementOption(this.countryDropdown, value);
    }

    async selectBetSlipType(value: 'Wager' | 'Settlement') {
        console.log(`Selecting Bet Slip Type: "${value}"...`);
        await this.pickSportRequirementOption(this.betSlipTypeDropdown, value);
    }

    /** Event options are mock fixtures labelled with today's date, so pick the first one. */
    async selectFirstEvent(): Promise<string> {
        console.log('Selecting the first Event...');
        return this.pickSportRequirementOption(this.eventDropdown);
    }

    async selectMarket(value: string) {
        console.log(`Selecting Market: "${value}"...`);
        await this.pickSportRequirementOption(this.marketDropdown, value);
    }

    /** Picks whichever Sport Requirement dropdown option does NOT match `excludeText` — used by the
     * cascading-clear tests to force a different selection than the one already made. Returns null
     * if only one option exists (nothing to switch to). */
    async selectSportRequirementOptionOtherThan(dropdownLocator: Locator, excludeText: string): Promise<string | null> {
        await this.clickElement(dropdownLocator.locator(locators.dropdownTrigger));
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        // Confirmed live: pickSportRequirementOption() types the selected option's first word into
        // this dropdown's own filter box, and that text persists the next time the panel reopens —
        // without clearing it here, the list stays pre-filtered down to just the already-selected
        // option, making every real alternative invisible even though many exist.
        const filterInput = panel.locator('input.p-dropdown-filter');
        if (await filterInput.isVisible().catch(() => false)) {
            await filterInput.fill('');
            await this.page.waitForTimeout(300);
        }

        const options = panel.locator(locators.dropdownItem);
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (text && text !== excludeText) {
                await this.clickElement(options.nth(i));
                await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
                await this.page.waitForTimeout(500);
                return text;
            }
        }
        await this.page.keyboard.press('Escape').catch(() => {});
        return null;
    }

    // Confirmed live (code comment above selectSport()): League/Country/Event/Market render as
    // plain free-text inputs — NOT functional dropdowns — until a Sport is picked, at which point
    // they switch over TOGETHER, and their chevron trigger appears for the first time.
    //
    // Confirmed live (user clarification, TC_RR_27): rendering the trigger together is NOT the same
    // as being enabled together — the underlying <input> only actually enables one field at a time,
    // each gated by its own immediate predecessor having a value (League needs Sport, Country needs
    // League, Event needs Country, Market needs Event). This method's own check (trigger visible AND
    // input not disabled) already reflects that correctly; it's the callers that must not assume
    // "trigger visible" alone means "usable".
    //
    // Confirmed live (TC_RR_28/29 runs): once a field has already been enabled and a LATER change
    // (to Feed or Sport) disables it again, the chevron trigger stays rendered/visible — only the
    // field's own <input> actually gets the `disabled` attribute (and confusingly keeps showing its
    // old stale value instead of clearing). So trigger visibility alone only catches "never enabled
    // yet"; checking the input's own disabled state is required to catch "disabled again".
    async isSportRequirementFieldEnabled(dropdownLocator: Locator): Promise<boolean> {
        const triggerVisible = await dropdownLocator.locator(locators.dropdownTrigger).isVisible().catch(() => false);
        if (!triggerVisible) return false;
        const inputDisabled = await dropdownLocator.locator('input').first().isDisabled().catch(() => false);
        return !inputDisabled;
    }

    async isSportFieldEnabled(): Promise<boolean> {
        return this.isSportRequirementFieldEnabled(this.sportDropdown);
    }

    async isLeagueFieldEnabled(): Promise<boolean> {
        return this.isSportRequirementFieldEnabled(this.leagueDropdown);
    }

    async isCountryFieldEnabled(): Promise<boolean> {
        return this.isSportRequirementFieldEnabled(this.countryDropdown);
    }

    async isEventFieldEnabled(): Promise<boolean> {
        return this.isSportRequirementFieldEnabled(this.eventDropdown);
    }

    async isMarketFieldEnabled(): Promise<boolean> {
        return this.isSportRequirementFieldEnabled(this.marketDropdown);
    }

    // These are p-inputnumber fields pre-filled with 0 — same keystroke convention as
    // fillWagerAmountRequirement (plain .fill() doesn't register with InputNumber).
    private async fillNumberInput(input: Locator, value: string) {
        await input.waitFor({ state: 'visible' });
        await input.click({ clickCount: 3 });
        await input.pressSequentially(value);
        await input.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async fillMinimumBetslipOdds(value: string) {
        console.log(`Filling Minimum Betslip Odds: "${value}"...`);
        await this.fillNumberInput(this.minimumBetslipOddsInput, value);
    }

    async fillMinimumLegsRequired(value: string) {
        console.log(`Filling Minimum Legs Required: "${value}"...`);
        await this.fillNumberInput(this.minimumLegsRequiredInput, value);
    }

    async fillMinimumLegOddsMultiplier(value: string) {
        console.log(`Filling Minimum Leg Odds Multiplier: "${value}"...`);
        await this.fillNumberInput(this.minimumLegOddsMultiplierInput, value);
    }

    async isSwitchOn(switchLocator: Locator): Promise<boolean> {
        return await switchLocator.locator('input').isChecked();
    }

    async toggleSingleLegOnly() {
        console.log('Toggling Single Leg Only...');
        await this.clickElement(this.singleLegOnlySwitch);
        await this.page.waitForTimeout(200);
    }

    async toggleApplyOddsToLegsInTotal() {
        console.log('Toggling Apply Odds And Multiplier To Legs In Total...');
        await this.clickElement(this.applyOddsToLegsInTotalSwitch);
        await this.page.waitForTimeout(200);
    }

    async clickSportRequirementSave() {
        console.log('Clicking Save (Sport Requirement)...');
        await this.clickElement(this.sportRequirementSaveBtn);
        await this.page.waitForTimeout(300);
    }

    async clickSportRequirementCancel() {
        console.log('Clicking Cancel (Sport Requirement)...');
        await this.clickElement(this.sportRequirementCancelBtn);
        await this.page.waitForTimeout(300);
    }

    getSportRequirementRow(text: string): Locator {
        return this.sportRequirementTable.locator('tbody tr', { hasText: text }).first();
    }

    // Confirmed live (user-supplied outerHTML): unlike the Rewards list (kebab menu), each Sport
    // Requirement row has its own standalone "Edit"/"Delete" buttons (aria-label="Edit"/"Delete") —
    // no kebab trigger involved here.
    //
    // ASSUMED (not independently confirmed): Edit reuses the SAME Create Sport Requirement dialog,
    // pre-filled with the row's existing values — same pattern already proven for the Rewards list's
    // own Edit/Clone. `sportRequirementDialog` (and every field locator built from it) is scoped by
    // the accessible name "Create Sport Requirement" — if the Edit dialog's title turns out to be
    // different (e.g. "Edit Sport Requirement"), these locators will fail to find it, surfacing as a
    // clear "field not visible" failure rather than a silent false pass. Needs live outerHTML of the
    // Edit dialog to confirm/fix if that happens.
    async clickEditSportRequirement(row: Locator) {
        console.log('Clicking Edit on Sport Requirement row...');
        const editBtn = row.getByRole('button', { name: 'Edit', exact: true });
        await editBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(editBtn);
        await this.feedNameDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    // Confirmed live: Delete is a standalone row button here too. Whether a Yes/No confirmation
    // dialog appears before the delete actually happens was NOT independently confirmed for Sport
    // Requirements specifically — click Yes only if one actually shows up, same tolerant pattern
    // already used for Rewards/Leagues/Teams elsewhere in this app.
    async clickDeleteSportRequirement(row: Locator) {
        console.log('Clicking Delete on Sport Requirement row...');
        const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(deleteBtn);
        const confirmAppeared = await this.confirmYesBtn.isVisible({ timeout: 5000 }).catch(() => false);
        if (confirmAppeared) {
            await this.clickElement(this.confirmYesBtn);
        }
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Casino Requirements sub-page — confirmed live (user-supplied outerHTML): row ⋯ -> "Casino
    //  Requirements" navigates to a Casino page with its own "Create Reward" popup (Provider*,
    //  Game*, Category*). Unlike Sport Requirements, Edit/Delete markup and the Delete confirm
    //  dialog were all independently confirmed here.
    // ═══════════════════════════════════════════════════════════════════════

    async clickCasinoRequirementsByPromotionName(promotionName: string) {
        console.log(`Opening Casino Requirements for "${promotionName}"...`);
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.openRowMenu(row);
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(locators.menuItemCasinoRequirements, { exact: true });
        await menuItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menuItem);
        await this.createRewardBtn.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickCreateReward() {
        console.log('Clicking Create Reward button...');
        await this.clickElement(this.createRewardBtn);
        await this.providerDropdown.waitFor({ state: 'visible', timeout: 15000 });

        // Confirmed live (TC_RR_40, repeated): this popup can flash open and then get yanked back to
        // the plain Rewards list a moment later — Provider being visible once isn't proof the popup is
        // actually staying open. Re-check after a short pause so a popup that's about to vanish fails
        // HERE, where the caller's retry wrapper can catch it, instead of surfacing much later as a
        // misleading ".p-dropdown-panel never appeared" timeout from inside selectFirstProvider().
        await this.page.waitForTimeout(800);
        await this.providerDropdown.waitFor({ state: 'visible', timeout: 5000 });
    }

    /** Provider options' real names were never given — picks whichever renders first. Returns the
     * picked text so callers can verify it later (e.g. in the created row). */
    async selectFirstProvider(): Promise<string> {
        console.log('Selecting first available Provider...');
        return this.selectFirstOption(this.providerDropdown);
    }

    async selectProvider(value: string) {
        console.log(`Selecting Provider: "${value}"...`);
        await this.selectOption(this.providerDropdown, value);
    }

    /** Game options' real names were never given either — picks whichever renders first. */
    async selectFirstGame(): Promise<string> {
        console.log('Selecting first available Game...');
        return this.selectFirstOption(this.gameDropdown);
    }

    async selectGame(value: string) {
        console.log(`Selecting Game: "${value}"...`);
        await this.selectOption(this.gameDropdown, value);
    }

    async fillCategory(value: string) {
        console.log(`Filling Category: "${value}"...`);
        await this.fillInput(this.categoryInput, value);
    }

    async getCategoryValue(): Promise<string> {
        return (await this.categoryInput.inputValue()).trim();
    }

    async clickCasinoRequirementSave() {
        console.log('Clicking Save (Casino Requirement)...');
        await this.clickElement(this.casinoRequirementSaveBtn);
        await this.page.waitForTimeout(300);
    }

    async clickCasinoRequirementCancel() {
        console.log('Clicking Cancel (Casino Requirement)...');
        await this.clickElement(this.casinoRequirementCancelBtn);
        await this.page.waitForTimeout(300);
    }

    getCasinoRequirementRow(text: string): Locator {
        return this.casinoRequirementTable.locator('tbody tr', { hasText: text }).first();
    }

    async clickEditCasinoRequirement(row: Locator) {
        console.log('Clicking Edit on Casino Requirement row...');
        const editBtn = row.getByRole('button', { name: 'Edit', exact: true });
        await editBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(editBtn);
        await this.providerDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Confirmed live (user-supplied outerHTML): Delete here DOES show a Yes/No confirm dialog
     * (.p-confirm-dialog-accept / .p-confirm-dialog-reject, aria-label Yes/No) — the same
     * confirmYesBtn/confirmNoBtn locators already used elsewhere in this page object. Unlike Sport
     * Requirements, this one is firm (always expects the dialog), not tolerant. */
    async clickDeleteCasinoRequirement(row: Locator) {
        console.log('Clicking Delete on Casino Requirement row...');
        const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(deleteBtn);
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Comp Configuration sub-page — confirmed live (user-supplied outerHTML): row ⋯ -> "Comp
    //  Configuration" navigates to its own page with a "Create Comp Configuration" popup (Comp
    //  Code*, Comp Amount*, Scheduled Time*, Day of Week*, plus an "Is Scheduled" checkbox).
    //  Edit/Delete row buttons and the Delete Yes/No confirm dialog follow the SAME confirmed
    //  convention already used for Casino Requirements (standalone row buttons, firm Yes/No dialog).
    // ═══════════════════════════════════════════════════════════════════════

    async clickCompConfigurationByPromotionName(promotionName: string) {
        console.log(`Opening Comp Configuration for "${promotionName}"...`);
        await this.ensureRowRenderedAcrossPages(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.openRowMenu(row);
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(locators.menuItemCompConfiguration, { exact: true });
        await menuItem.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menuItem);
        await this.createCompConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickCreateCompConfiguration() {
        console.log('Clicking Create Comp Configuration button...');
        await this.clickElement(this.createCompConfigurationBtn);
        await this.compCodeDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Comp Code options' real names were never given — picks whichever renders first. Returns the
     * picked text so callers can verify it later (e.g. in the created row). */
    async selectFirstCompCode(): Promise<string> {
        console.log('Selecting first available Comp Code...');
        return this.selectFirstOption(this.compCodeDropdown);
    }

    async selectCompCode(value: string) {
        console.log(`Selecting Comp Code: "${value}"...`);
        await this.selectOption(this.compCodeDropdown, value);
    }

    /** Confirmed live (TC_RR_49-52): typing a 6-digit value at pressSequentially's default (no-delay)
     * speed gets randomly mangled (e.g. "343741" -> "3434", "353484" -> "354") — PrimeNG's
     * InputNumber reformats/re-renders (thousands grouping) after every keystroke, and typing faster
     * than that re-render settles drops or reorders characters. Every other p-inputnumber field in
     * this file only ever types 1-2 digits, which never triggered this; Comp Amount's own
     * test-controlled unique-lookup value is long enough to hit it. Verifies the result and retries
     * once with a slower delay rather than silently trusting the first attempt. */
    async fillCompAmount(value: string) {
        console.log(`Filling Comp Amount: "${value}"...`);
        await this.compAmountInput.waitFor({ state: 'visible' });

        for (let attempt = 0; attempt < 2; attempt++) {
            const delay = attempt === 0 ? 50 : 150;
            await this.compAmountInput.click({ clickCount: 3 });
            await this.compAmountInput.pressSequentially(value, { delay });
            await this.compAmountInput.press('Tab');
            await this.page.waitForTimeout(200);

            // PrimeNG may render the raw value with thousands separators (e.g. "343,741") — compare
            // digits only.
            const actual = (await this.getCompAmountValue()).replace(/[^0-9]/g, '');
            if (actual === value) return;
            console.log(`Comp Amount mismatch after typing (got "${actual}", expected "${value}") — retrying with a slower delay...`);
        }
    }

    async getCompAmountValue(): Promise<string> {
        return (await this.compAmountInput.inputValue()).trim();
    }

    /** User-confirmed (outerHTML): Scheduled Time is set via its own clock increment arrows, not
     * typed. Unlike Weekly Expiry Time, the overlay's OWN outer panel id/class was never confirmed
     * for this field — only the inner `.p-timepicker` block was, and its increment buttons carry
     * real, confirmed aria-labels ("Next Hour"/"Next Minute") directly on the <button> itself, so
     * those are used instead of the id/class/icon guesses that broke here. */
    async setScheduledTime(hourClicks: number = 2, minuteClicks: number = 3) {
        console.log(`Setting Scheduled Time via clock arrows (hour+${hourClicks}, minute+${minuteClicks})...`);
        await this.scheduledTimeInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('.p-timepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        const hourUpArrow = panel.getByRole('button', { name: 'Next Hour', exact: true });
        for (let i = 0; i < hourClicks; i++) {
            await hourUpArrow.click();
            await this.page.waitForTimeout(150);
        }

        const minuteUpArrow = panel.getByRole('button', { name: 'Next Minute', exact: true });
        for (let i = 0; i < minuteClicks; i++) {
            await minuteUpArrow.click();
            await this.page.waitForTimeout(150);
        }

        // Same confirmed-elsewhere trick (setWeeklyExpiryTime / CompAlertsPage): Escape closes the
        // WHOLE parent dialog here, not just this time popup, once the arrows are registered. Click
        // a neutral, always-present field instead (Comp Amount) to dismiss it.
        if (await panel.isVisible().catch(() => false)) {
            await this.compAmountInput.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async getScheduledTimeValue(): Promise<string> {
        return (await this.scheduledTimeInput.inputValue()).trim();
    }

    /** Day of Week options' real names were never given either — picks whichever renders first. */
    async selectFirstDayOfWeek(): Promise<string> {
        console.log('Selecting first available Day of Week...');
        return this.selectFirstOption(this.dayOfWeekDropdown);
    }

    async selectDayOfWeek(value: string) {
        console.log(`Selecting Day of Week: "${value}"...`);
        await this.selectOption(this.dayOfWeekDropdown, value);
    }

    async isScheduledChecked(): Promise<boolean> {
        return await this.isScheduledCheckbox.locator('input[type="checkbox"]').isChecked();
    }

    async toggleIsScheduled() {
        console.log('Toggling Is Scheduled...');
        await this.isScheduledCheckbox.locator('.p-checkbox-box').click({ force: true });
        await this.page.waitForTimeout(200);
    }

    async clickCompConfigurationSave() {
        console.log('Clicking Save (Comp Configuration)...');
        await this.clickElement(this.compConfigurationSaveBtn);
        await this.page.waitForTimeout(300);
    }

    async clickCompConfigurationCancel() {
        console.log('Clicking Cancel (Comp Configuration)...');
        await this.clickElement(this.compConfigurationCancelBtn);
        await this.page.waitForTimeout(300);
    }

    getCompConfigurationRow(text: string): Locator {
        return this.compConfigurationTable.locator('tbody tr', { hasText: text }).first();
    }

    async clickEditCompConfiguration(row: Locator) {
        console.log('Clicking Edit on Comp Configuration row...');
        const editBtn = row.getByRole('button', { name: 'Edit', exact: true });
        await editBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(editBtn);
        await this.compCodeDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Confirmed live (user-supplied outerHTML): same Yes/No confirm dialog convention as Casino
     * Requirements — firm (always expects the dialog), not tolerant. */
    async clickDeleteCompConfiguration(row: Locator) {
        console.log('Clicking Delete on Comp Configuration row...');
        const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(deleteBtn);
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }
}
