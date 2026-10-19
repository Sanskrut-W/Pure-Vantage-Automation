import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { leaderboardLocators } from '../locators/leaderboardLocators';

export class LeaderboardPage extends BasePage {
    readonly createLeaderboardBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden, not
    // removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly leaderboardsTable: Locator;
    readonly leaderboardSearchInput: Locator;

    // ─── Create/Edit Leaderboard popup — 6 fields, all ids confirmed live. Is Active / Is
    // Testing render disabled in the freshly-opened Create popup (confirmed live) — treated as
    // "maybe togglable, maybe not" rather than assumed either way; see toggleIsActive/toggleIsTesting.
    readonly promotionNameInput: Locator;
    readonly regionDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly pushNotificationDropdown: Locator;
    readonly isActiveToggle: Locator;
    readonly isTestingToggle: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    // Some Edit popups in this app label their submit button "Update" instead of "Save"
    // (confirmed elsewhere in this suite, e.g. Participant edit) — not confirmed either way for
    // Leaderboard/Configuration edit, so getEditSubmitBtn/clickSaveOrUpdate check for whichever is
    // actually present instead of assuming.
    readonly updateBtn: Locator;

    // ─── Row-level delete flow (kebab menu -> Delete -> custom Yes/No modal) ───
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;
    // PrimeNG dialog header "X" — confirmed live on the Create Leaderboard popup, assumed the
    // same convention on the Configuration popup (same dialog component family in this app).
    readonly closeDialogBtn: Locator;

    // ─── Manage Streaks page — Create/Edit Streak popup (2 fields, both PrimeNG InputNumber) ───
    readonly createStreakBtn: Locator;
    readonly streakValueInput: Locator;
    readonly streakMultiplierInput: Locator;
    // Confirmed live: a real <table> (NOT cards, unlike Manage Configurations) under the
    // "Leaderboard streaks" heading — one row per Streak with cells in column order [Streak
    // Value, Multiplier, Created By, Created Date, Updated By, Updated Date, actions]. Scoped to
    // <main> like leaderboardsTable, for the same SPA-hidden-DOM-bleed-through reason.
    readonly streaksTable: Locator;

    // ─── Periods page — Create/Edit Period popup (Name*, Start Date*, End Date*, Scheduled Date) ───
    readonly createPeriodBtn: Locator;
    readonly periodNameInput: Locator;
    readonly periodStartDateInput: Locator;
    readonly periodEndDateInput: Locator;
    readonly periodScheduledDateInput: Locator;
    // ASSUMPTION — only the Create Period button, popup fields, Save/Cancel, a standalone Edit/
    // Delete button pair and the delete confirmation were confirmed live, not the Period list/row
    // markup itself. Modeled on the OTHER two row-kebab destinations: Manage Configurations
    // renders cards, but Manage Streaks (the other sibling menu item) renders a real <table> with
    // row-level Edit/Delete — assumed here too, and since Name is free text (like Promotion
    // Name), rows are matched by name the same way as leaderboardsTable/getRowByName.
    readonly periodsTable: Locator;

    // ─── Manage Configurations page ─────────────────────────────────────────────
    readonly createConfigurationBtn: Locator;
    // No stable id/aria-label confirmed live for this page's own Active filter (same situation as
    // Generic Predictor's page-level Active/Inactive toggle) — scoped to <main>, first match.
    readonly configActiveToggle: Locator;
    // Populated Configurations render as CARDS, not a table (confirmed live) — see
    // getConfigCardByName's own comment.
    readonly configurationsContainer: Locator;

    // ─── Create/Edit Configuration popup — all ids confirmed live. Unlike the Leaderboard
    // popup's Is Active/Is Testing, THIS popup's Is Testing/Allow Feed Allocations/Include Amount
    // Modifier all render ENABLED on Create (confirmed live) — no Create-vs-Edit disabled dance
    // needed here.
    readonly leaderboardNameInput: Locator;
    readonly descriptionInput: Locator;
    readonly leaderboardTypeDropdown: Locator;
    readonly leagueCountryInput: Locator;
    readonly gameTypeMultiSelect: Locator;
    readonly pointSourceDropdown: Locator;
    readonly minWagerInput: Locator;
    readonly minLegsInput: Locator;
    readonly minOddsInput: Locator;
    readonly leagueNameInput: Locator;
    readonly bannerUrlInput: Locator;
    readonly maxPointsInput: Locator;
    readonly amountModifierToggle: Locator;
    readonly allowFeedAllocationsToggle: Locator;

    constructor(page: Page) {
        super(page);
        this.createLeaderboardBtn = page.getByRole('button', { name: leaderboardLocators.buttonCreateLeaderboard });
        this.editBtn = page.getByRole('button', { name: leaderboardLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: leaderboardLocators.buttonDelete, exact: true });
        this.leaderboardsTable = page.locator('main table').first();
        this.leaderboardSearchInput = page.locator('main').locator(leaderboardLocators.inputSearch).first();

        this.promotionNameInput = page.locator(leaderboardLocators.inputPromotionName);
        this.regionDropdown = page.locator(leaderboardLocators.dropdownRegion);
        this.startDateInput = page.locator(leaderboardLocators.calendarStartDate);
        this.endDateInput = page.locator(leaderboardLocators.calendarEndDate);
        this.pushNotificationDropdown = page.locator(leaderboardLocators.dropdownPushNotification);
        // Confirmed live: #isActive/#isTesting are the INNER hidden <input>, not the outer
        // role="checkbox" div that actually carries aria-checked/data-p-disabled — that div has
        // no id of its own, so it's targeted as "the p-inputswitch wrapping that input" instead.
        this.isActiveToggle = page.locator(`div.p-inputswitch:has(${leaderboardLocators.toggleIsActive})`);
        this.isTestingToggle = page.locator(`div.p-inputswitch:has(${leaderboardLocators.toggleIsTesting})`);

        this.saveBtn = page.getByRole('button', { name: leaderboardLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: leaderboardLocators.buttonCancel, exact: true });
        this.updateBtn = page.getByRole('button', { name: 'Update', exact: true });

        this.confirmYesBtn = page.getByRole('button', { name: leaderboardLocators.buttonConfirmYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: leaderboardLocators.buttonConfirmNo, exact: true });
        this.closeDialogBtn = page.getByRole('button', { name: 'Close', exact: true });

        this.createStreakBtn = page.getByRole('button', { name: leaderboardLocators.buttonCreateStreak, exact: true });
        this.streakValueInput = page.locator(leaderboardLocators.inputStreakValue);
        this.streakMultiplierInput = page.locator(leaderboardLocators.inputStreakMultiplier);
        this.streaksTable = page.locator('main table').first();

        this.createPeriodBtn = page.getByRole('button', { name: leaderboardLocators.buttonCreatePeriod, exact: true });
        this.periodNameInput = page.locator(leaderboardLocators.inputPeriodName);
        this.periodStartDateInput = page.locator(leaderboardLocators.calendarPeriodStartDate);
        this.periodEndDateInput = page.locator(leaderboardLocators.calendarPeriodEndDate);
        this.periodScheduledDateInput = page.locator(leaderboardLocators.calendarPeriodScheduledDate);
        this.periodsTable = page.locator('main table').first();

        this.createConfigurationBtn = page.getByRole('button', { name: leaderboardLocators.buttonCreateConfiguration });
        this.configActiveToggle = page.locator('main').locator('div.p-inputswitch').first();
        this.configurationsContainer = page.locator(leaderboardLocators.configurationsContainer);

        this.leaderboardNameInput = page.locator(leaderboardLocators.inputLeaderboardName);
        this.descriptionInput = page.locator(leaderboardLocators.inputDescription);
        this.leaderboardTypeDropdown = page.locator(leaderboardLocators.dropdownLeaderboardType);
        this.leagueCountryInput = page.locator(leaderboardLocators.inputLeagueCountry);
        this.gameTypeMultiSelect = page.locator(leaderboardLocators.multiselectGameType);
        this.pointSourceDropdown = page.locator(leaderboardLocators.dropdownPointSource);
        this.minWagerInput = page.locator(leaderboardLocators.inputMinWager);
        this.minLegsInput = page.locator(leaderboardLocators.inputMinLegs);
        this.minOddsInput = page.locator(leaderboardLocators.inputMinOdds);
        this.leagueNameInput = page.locator(leaderboardLocators.inputLeagueName);
        this.bannerUrlInput = page.locator(leaderboardLocators.inputBannerUrl);
        this.maxPointsInput = page.locator(leaderboardLocators.inputMaxPoints);
        this.amountModifierToggle = page.locator(`div.p-inputswitch:has(${leaderboardLocators.toggleAmountModifier})`);
        this.allowFeedAllocationsToggle = page.locator(`div.p-inputswitch:has(${leaderboardLocators.toggleAllowFeedAllocations})`);
    }

    /** Identified by CONTENT (containing #promotionNameInput) rather than stacking order, so a
     * `.last()`-style locator doesn't silently point at the wrong dialog if another is also open —
     * same technique used for Generic Predictor's createPeriodPopup. */
    get createLeaderboardPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.promotionNameInput });
    }

    /**
     * Clicks the Create Leaderboard button if visible.
     */
    async clickCreateLeaderboard() {
        console.log('Clicking Create Leaderboard button...');
        if (await this.createLeaderboardBtn.count() > 0) {
            await this.clickElement(this.createLeaderboardBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    async waitForCreateLeaderboardPopupLoad() {
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    async fillPromotionName(value: string) {
        console.log(`Filling Promotion Name: "${value}"...`);
        await this.fillInput(this.promotionNameInput, value);
    }

    async getPromotionNameValue(): Promise<string> {
        return await this.promotionNameInput.inputValue();
    }

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

    /** Selects whichever option renders first in a dropdown — used for fields whose values are
     * environment/real data (Region) and not safe to hardcode. Returns the selected option's text. */
    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(leaderboardLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    async selectFirstRegion(): Promise<string> {
        console.log('Selecting first available Region...');
        return this.selectFirstOption(this.regionDropdown);
    }

    async selectFirstPushNotification(): Promise<string> {
        console.log('Selecting first available Push Notification option...');
        return this.selectFirstOption(this.pushNotificationDropdown);
    }

    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const text = (await dropdownLocator.locator('.p-dropdown-label').innerText().catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.page.locator(leaderboardLocators.validationError).count()) > 0;
    }

    private async setDateField(input: Locator) {
        await input.click();
        await this.page.waitForTimeout(300);

        const panelId = await input.getAttribute('aria-controls');
        const panel = panelId
            ? this.page.locator(`#${panelId}`)
            : this.page.locator('.p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        await panel.locator('td[data-p-today="true"] span').first().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /** Checks whether the date at the given offset (in days, from today) is disabled in the End
     * Date calendar — confirmed live that a date earlier than the selected Start Date renders
     * non-clickable (aria-disabled="true"/p-disabled, its enclosing <td> intercepts pointer
     * events) rather than being selectable and rejected after the fact. Never clicks the cell —
     * clicking a disabled cell just times out, since the click never actually lands on it. Only
     * reliable within the currently-displayed month (no prev/next navigation attempted) —
     * sufficient for a small negative offset like "yesterday". */
    async isEndDateOffsetDisabled(dayOffset: number): Promise<boolean> {
        await this.endDateInput.click();
        await this.page.waitForTimeout(300);

        const panelId = await this.endDateInput.getAttribute('aria-controls');
        const panel = panelId
            ? this.page.locator(`#${panelId}`)
            : this.page.locator('.p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const target = new Date();
        target.setDate(target.getDate() + dayOffset);
        const day = target.getDate();

        const cell = panel.locator('td:not(.p-datepicker-other-month) span', { hasText: new RegExp(`^${day}$`) }).first();
        const isDisabled = await cell.evaluate(
            (el) => el.classList.contains('p-disabled') || el.getAttribute('aria-disabled') === 'true'
        );

        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(300);

        return isDisabled;
    }

    async setStartDate() {
        console.log('Selecting Start Date (today)...');
        await this.setDateField(this.startDateInput);
    }

    async setEndDate() {
        console.log('Selecting End Date (today)...');
        await this.setDateField(this.endDateInput);
    }

    async getStartDateValue(): Promise<string> {
        return await this.startDateInput.inputValue();
    }

    async getEndDateValue(): Promise<string> {
        return await this.endDateInput.inputValue();
    }

    /** PrimeNG inputswitches are read via aria-checked/data-p-disabled on the OUTER
     * role="checkbox" div, not the inner hidden <input> (confirmed live) — same convention as
     * Generic Predictor's Active/Inactive filter toggle. Generic so every switch in both the
     * Leaderboard and Configuration popups (Is Active, Is Testing, Include Amount Modifier, Allow
     * Feed Allocations, the Manage Configurations page's own Active filter) shares one
     * implementation instead of near-duplicate per-field methods. */
    async isToggleChecked(toggle: Locator): Promise<boolean> {
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    async isToggleDisabled(toggle: Locator): Promise<boolean> {
        return (await toggle.getAttribute('data-p-disabled')) === 'true';
    }

    /** Clicks a PrimeNG inputswitch and reports whether its checked-state actually changed —
     * confirmed live a switch can render disabled (e.g. Is Active/Is Testing on a fresh Create
     * Leaderboard popup), in which case a click is expected to be a no-op rather than throw, so
     * the caller can assert tolerantly instead of this method assuming either behavior. */
    async clickToggle(toggle: Locator): Promise<boolean> {
        const before = await this.isToggleChecked(toggle);
        await toggle.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(200);
        const after = await this.isToggleChecked(toggle);
        return before !== after;
    }

    async isActiveChecked(): Promise<boolean> {
        return this.isToggleChecked(this.isActiveToggle);
    }

    async isTestingChecked(): Promise<boolean> {
        return this.isToggleChecked(this.isTestingToggle);
    }

    async isActiveToggleDisabled(): Promise<boolean> {
        return this.isToggleDisabled(this.isActiveToggle);
    }

    async isTestingToggleDisabled(): Promise<boolean> {
        return this.isToggleDisabled(this.isTestingToggle);
    }

    async toggleIsActive(): Promise<boolean> {
        return this.clickToggle(this.isActiveToggle);
    }

    async toggleIsTesting(): Promise<boolean> {
        return this.clickToggle(this.isTestingToggle);
    }

    async clickSave() {
        console.log('Clicking Save on Create/Edit Leaderboard popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create/Edit Leaderboard popup...');
        await this.clickElement(this.cancelBtn);
    }

    /** Returns whichever submit button is actually present on an Edit popup — "Update" or
     * "Save" — instead of assuming either (see updateBtn's own comment). */
    async getEditSubmitBtn(): Promise<Locator> {
        const updateVisible = await this.updateBtn.isVisible().catch(() => false);
        return updateVisible ? this.updateBtn : this.saveBtn;
    }

    async clickSaveOrUpdate() {
        const submitBtn = await this.getEditSubmitBtn();
        console.log(`Clicking ${submitBtn === this.updateBtn ? 'Update' : 'Save'}...`);
        await this.clickElement(submitBtn);
    }

    /** Confirmed live: the list is paginated (10 rows/page) and accumulates test data over time,
     * so a newly-created row isn't guaranteed to render on page 1 — searching by name first (same
     * convention as Generic Predictor's searchParticipants) filters it down regardless of which
     * page it would otherwise land on. */
    async searchLeaderboards(text: string) {
        console.log(`Searching Leaderboards for "${text}"...`);
        await this.leaderboardSearchInput.click({ clickCount: 3 });
        await this.leaderboardSearchInput.press('Backspace');
        await this.leaderboardSearchInput.pressSequentially(text, { delay: 50 });
        // A fixed 800ms (the convention borrowed from Generic Predictor's Participants search)
        // wasn't reliably long enough here — confirmed live: the row was present and alone in the
        // DOM by the time we clicked its kebab, but the resulting menu never rendered, consistent
        // with the backend filter/re-render not having fully settled yet. Waiting for networkidle
        // (the same convention already used elsewhere in this suite, e.g. Generic Predictor's
        // selectRegionFilterByText, for post-filter settling) is more reliable than a fixed delay.
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(500);
    }

    getRowByName(name: string): Locator {
        return this.leaderboardsTable.locator('tbody tr', { hasText: name }).first();
    }

    async isLeaderboardVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchLeaderboards(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isLeaderboardAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchLeaderboards(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    /**
     * Clicks the Edit button on the first Leaderboard entry.
     */
    async clickEditFirstLeaderboard() {
        console.log('Clicking Edit button on first Leaderboard...');
        await this.clickElement(this.editBtn.first());
    }

    /**
     * Clicks the Delete button on the first Leaderboard entry.
     */
    async clickDeleteFirstLeaderboard() {
        console.log('Clicking Delete button on first Leaderboard...');
        await this.clickElement(this.deleteBtn.first());
    }

    async clickEditForLeaderboard(name: string) {
        console.log(`Clicking Edit for Leaderboard "${name}"...`);
        await this.searchLeaderboards(name);
        const row = this.getRowByName(name);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForLeaderboard(name: string) {
        console.log(`Clicking Delete for Leaderboard "${name}"...`);
        await this.searchLeaderboards(name);
        const row = this.getRowByName(name);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonDelete, exact: true }));
    }

    async clickConfirmYes() {
        console.log('Clicking Yes on the delete confirmation modal...');
        await this.clickElement(this.confirmYesBtn);
    }

    async clickConfirmNo() {
        console.log('Clicking No on the delete confirmation modal...');
        await this.clickElement(this.confirmNoBtn);
    }

    // ─── Row-level "..." kebab menu (Manage Configurations / Manage Streaks / Periods) ────

    async clickRowMenuForLeaderboard(name: string) {
        console.log(`Opening the "..." menu for Leaderboard "${name}"...`);
        await this.searchLeaderboards(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(leaderboardLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickManageConfigurationsFromRowMenu() {
        console.log('Clicking Manage Configurations from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(leaderboardLocators.menuItemManageConfigurations, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Manage Configurations for a Leaderboard by name, via its row's "..." menu. */
    async openManageConfigurations(name: string) {
        console.log(`Opening Manage Configurations for Leaderboard "${name}"...`);
        await this.clickRowMenuForLeaderboard(name);
        await this.clickManageConfigurationsFromRowMenu();
    }

    /** Deletes a Leaderboard by name and waits for it to actually disappear. Swallows errors so
     * it's safe to call unconditionally from afterEach, even if the record was never created
     * (e.g. the test failed before Save) or was already removed. */
    async deleteLeaderboardIfPresent(name: string) {
        try {
            const isPresent = await this.isLeaderboardVisibleByName(name, 5000);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for "${name}" — row not present.`);
                return;
            }
            await this.clickDeleteForLeaderboard(name);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isLeaderboardAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup failed for "${name}": ${error}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Manage Streaks page + Create/Edit Streak popup
    // ═══════════════════════════════════════════════════════════════════════════

    async clickManageStreaksFromRowMenu() {
        console.log('Clicking Manage Streaks from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(leaderboardLocators.menuItemManageStreaks, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Manage Streaks for a Leaderboard by name, via its row's "..." menu. */
    async openManageStreaks(name: string) {
        console.log(`Opening Manage Streaks for Leaderboard "${name}"...`);
        await this.clickRowMenuForLeaderboard(name);
        await this.clickManageStreaksFromRowMenu();
    }

    async clickCreateStreak() {
        console.log('Clicking Create Streak button...');
        await this.clickElement(this.createStreakBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForStreakPopupLoad() {
        await this.streakValueInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Identified by CONTENT (containing the Streak Value field) rather than stacking order —
     * same technique used for createLeaderboardPopup/configurationPopup. */
    get createStreakPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.streakValueInput });
    }

    async fillStreakValue(value: string) {
        console.log(`Filling Streak Value: "${value}"...`);
        await this.fillNumericField(this.streakValueInput, value);
    }

    async fillStreakMultiplier(value: string) {
        console.log(`Filling Streak Multiplier: "${value}"...`);
        await this.fillNumericField(this.streakMultiplierInput, value);
    }

    async getStreakValue(): Promise<string> {
        return (await this.streakValueInput.inputValue()).trim();
    }

    async getStreakMultiplier(): Promise<string> {
        return (await this.streakMultiplierInput.inputValue()).trim();
    }

    /** Confirmed live: cells are in column order [Streak Value, Multiplier, ...] — matched by
     * BOTH the Streak Value cell AND the Multiplier cell exactly (:text-is, not a substring), so a
     * value like "5" can't false-positive match inside an unrelated column (e.g. a date). */
    getStreakRowByValues(value: string, multiplier: string): Locator {
        return this.streaksTable.locator(
            `tbody tr:has(td:nth-child(1):text-is("${value}")):has(td:nth-child(2):text-is("${multiplier}"))`
        ).first();
    }

    async isStreakVisibleByValues(value: string, multiplier: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getStreakRowByValues(value, multiplier);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isStreakAbsentByValues(value: string, multiplier: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getStreakRowByValues(value, multiplier);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    async clickEditForStreak(value: string, multiplier: string) {
        console.log(`Clicking Edit for Streak (Value=${value}, Multiplier=${multiplier})...`);
        const row = this.getStreakRowByValues(value, multiplier);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForStreak(value: string, multiplier: string) {
        console.log(`Clicking Delete for Streak (Value=${value}, Multiplier=${multiplier})...`);
        const row = this.getStreakRowByValues(value, multiplier);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonDelete, exact: true }));
    }

    /** Deletes a Streak by its Value/Multiplier via the Yes/No confirmation, waiting for the row
     * to actually disappear. Swallows errors so it's safe to call unconditionally from afterEach,
     * even if no Streak was ever created (e.g. the test failed before Save) or it was already
     * removed. */
    async deleteStreakIfPresent(value: string, multiplier: string) {
        try {
            const isPresent = await this.isStreakVisibleByValues(value, multiplier, 5000);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for Streak (Value=${value}, Multiplier=${multiplier}) — row not present.`);
                return;
            }
            await this.clickDeleteForStreak(value, multiplier);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isStreakAbsentByValues(value, multiplier, 15000);
        } catch (error) {
            console.log(`Delete cleanup failed for Streak (Value=${value}, Multiplier=${multiplier}): ${error}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Periods page + Create/Edit Period popup
    // ═══════════════════════════════════════════════════════════════════════════

    async clickPeriodsFromRowMenu() {
        console.log('Clicking Periods from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(leaderboardLocators.menuItemPeriods, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Periods for a Leaderboard by name, via its row's "..." menu. */
    async openPeriods(name: string) {
        console.log(`Opening Periods for Leaderboard "${name}"...`);
        await this.clickRowMenuForLeaderboard(name);
        await this.clickPeriodsFromRowMenu();
    }

    async clickCreatePeriod() {
        console.log('Clicking Create Period button...');
        await this.clickElement(this.createPeriodBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPeriodPopupLoad() {
        await this.periodNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Identified by CONTENT (containing the Period Name field) rather than stacking order —
     * same technique used for createLeaderboardPopup/configurationPopup/createStreakPopup. */
    get createPeriodPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.periodNameInput });
    }

    async fillPeriodName(value: string) {
        console.log(`Filling Period Name: "${value}"...`);
        await this.fillInput(this.periodNameInput, value);
    }

    async getPeriodNameValue(): Promise<string> {
        return await this.periodNameInput.inputValue();
    }

    /** Confirmed live: this calendar includes a time picker (hour/minute spinners, aria-modal=
     * "true"), so selecting a date does NOT auto-close it the way the plain-date Leaderboard
     * calendar does. A single click on the Name field (per the user) wasn't reliably closing it
     * either — confirmed live across repeated failures where the SAME panel, still at full
     * opacity (p-connected-overlay-enter-done, not mid-fade), was left open and blocked the next
     * field's click. Retries the close with TWO different "click away" targets (the Name field,
     * then a far corner of the page) a few times, since a single one-shot attempt wasn't enough —
     * if this still doesn't close it, the panel likely needs its own explicit close control (e.g.
     * a "Done" button in its time-picker footer) that hasn't been seen live yet.
     *
     * Confirmed live (TC_LB_064+): today's cell is NOT always clickable — the End Date calendar
     * renders it with class="p-disabled" once Start Date has already been set to today, since End
     * Date must fall after Start Date. Clicking a disabled cell never resolves the actionability
     * wait. Confirmed live (round 2): the `data-p-disabled="true"` marker actually lives on the
     * inner <span> (daylabel), NOT on the <td> itself — the <td> never carries that attribute, so
     * an earlier `td:not([data-p-disabled])` filter never excluded anything and kept matching the
     * disabled cell. Filtering the span itself is what actually works. Falls back to the first
     * non-disabled day whenever today itself is disabled. */
    private async setPeriodDateField(input: Locator) {
        await input.click();
        await this.page.waitForTimeout(300);

        const panelId = await input.getAttribute('aria-controls');
        const panel = panelId
            ? this.page.locator(`#${panelId}`)
            : this.page.locator('.p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const enabledToday = panel.locator('td[data-p-today="true"] span:not([data-p-disabled="true"])');
        const dateCell = (await enabledToday.count()) > 0
            ? enabledToday.first()
            : panel.locator('td span:not([data-p-disabled="true"])').first();
        await dateCell.click({ timeout: 10000 });
        await this.page.waitForTimeout(300);

        for (let attempt = 0; attempt < 5 && (await panel.isVisible().catch(() => false)); attempt++) {
            await this.periodNameInput.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            if (!(await panel.isVisible().catch(() => false))) break;
            await this.page.mouse.click(5, 5).catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async setPeriodStartDate() {
        console.log('Selecting Period Start Date (today)...');
        await this.setPeriodDateField(this.periodStartDateInput);
    }

    async setPeriodEndDate() {
        console.log('Selecting Period End Date (today)...');
        await this.setPeriodDateField(this.periodEndDateInput);
    }

    async setPeriodScheduledDate() {
        console.log('Selecting Period Scheduled Date (today)...');
        await this.setPeriodDateField(this.periodScheduledDateInput);
    }

    async getPeriodStartDateValue(): Promise<string> {
        return await this.periodStartDateInput.inputValue();
    }

    async getPeriodEndDateValue(): Promise<string> {
        return await this.periodEndDateInput.inputValue();
    }

    async getPeriodScheduledDateValue(): Promise<string> {
        return await this.periodScheduledDateInput.inputValue();
    }

    getPeriodRowByName(name: string): Locator {
        return this.periodsTable.locator('tbody tr', { hasText: name }).first();
    }

    async isPeriodVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getPeriodRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isPeriodAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getPeriodRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    async clickEditForPeriod(name: string) {
        console.log(`Clicking Edit for Period "${name}"...`);
        const row = this.getPeriodRowByName(name);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForPeriod(name: string) {
        console.log(`Clicking Delete for Period "${name}"...`);
        const row = this.getPeriodRowByName(name);
        await this.clickElement(row.getByRole('button', { name: leaderboardLocators.buttonDelete, exact: true }));
    }

    /** Deletes a Period by name via the Yes/No confirmation, waiting for it to actually
     * disappear. Swallows errors so it's safe to call unconditionally from afterEach, even if no
     * Period was ever created (e.g. the test failed before Save) or it was already removed. */
    async deletePeriodIfPresent(name: string) {
        try {
            const isPresent = await this.isPeriodVisibleByName(name, 5000);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for Period "${name}" — row not present.`);
                return;
            }
            await this.clickDeleteForPeriod(name);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isPeriodAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup failed for Period "${name}": ${error}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  Manage Configurations page + Create/Edit Configuration popup
    // ═══════════════════════════════════════════════════════════════════════════

    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
        await this.clickElement(this.createConfigurationBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForConfigurationPopupLoad() {
        await this.leaderboardNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    /** Identified by CONTENT (containing #leaderboardNameInput) rather than stacking order — same
     * technique used for createLeaderboardPopup. */
    get configurationPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.leaderboardNameInput });
    }

    async clickCloseDialog() {
        console.log('Clicking the dialog\'s "X" Close button...');
        await this.clickElement(this.closeDialogBtn);
    }

    async fillLeaderboardName(value: string) {
        console.log(`Filling Leaderboard Name: "${value}"...`);
        await this.fillInput(this.leaderboardNameInput, value);
    }

    async getLeaderboardNameValue(): Promise<string> {
        return await this.leaderboardNameInput.inputValue();
    }

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    async fillLeagueCountry(value: string) {
        console.log(`Filling League Country: "${value}"...`);
        await this.fillInput(this.leagueCountryInput, value);
    }

    async fillLeagueName(value: string) {
        console.log(`Filling League Name: "${value}"...`);
        await this.fillInput(this.leagueNameInput, value);
    }

    async fillBannerUrl(value: string) {
        console.log(`Filling Banner URL: "${value}"...`);
        await this.fillInput(this.bannerUrlInput, value);
    }

    async getBannerUrlValue(): Promise<string> {
        return await this.bannerUrlInput.inputValue();
    }

    async selectFirstLeaderboardType(): Promise<string> {
        console.log('Selecting first available Leaderboard Type...');
        return this.selectFirstOption(this.leaderboardTypeDropdown);
    }

    async selectFirstPointSource(): Promise<string> {
        console.log('Selecting first available Point Source...');
        return this.selectFirstOption(this.pointSourceDropdown);
    }

    /** Confirmed live: .p-multiselect-panel/.p-multiselect-item are the right classes, but the
     * very FIRST item in this list has an empty label — a genuine blank Game Type entry in the
     * data, not a loading placeholder — so blindly picking .first() silently "selects" nothing.
     * Walks the list for the first option with actual text.
     * Confirmed live (TC_LB_024): a run once burned the entire test timeout (20 min) before any
     * error surfaced, with the failure only reported against this method's own 300ms waitForTimeout
     * once the harness force-closed the browser — i.e. the real hang was upstream of that line and
     * never produced its own error. This method's own clickElement/click calls had no explicit
     * timeout, so they'd silently inherit a long default instead of failing fast. Both are now
     * bounded so a repeat of this hang reports promptly at the actual stuck step. */
    async selectFirstGameType(): Promise<string> {
        console.log('Selecting first available (non-blank) Game Type...');
        await this.gameTypeMultiSelect.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.gameTypeMultiSelect);
        const panel = this.page.locator(leaderboardLocators.multiselectPanel).last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        const options = panel.locator(leaderboardLocators.multiselectItem);
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();

        let text = '';
        for (let i = 0; i < count; i++) {
            const candidate = options.nth(i);
            const candidateText = (await candidate.textContent())?.trim() ?? '';
            if (candidateText.length > 0) {
                text = candidateText;
                await candidate.click({ timeout: 10000 });
                await this.page.waitForTimeout(300);
                break;
            }
        }

        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(200);
        return text;
    }

    /** Confirmed live: once an option is selected, .p-multiselect-label stays in the DOM but its
     * direct text content is replaced by a nested .p-multiselect-token > .p-multiselect-token-label
     * structure — reading .p-multiselect-label-container's innerText (rather than assuming which
     * exact child holds the text) picks up that nested label regardless of the chip markup.
     * Confirmed live (TC_LB_024): the container can still read empty right after the overlay
     * closes — the chip hasn't re-rendered yet — so this polls briefly instead of reading once. */
    async getGameTypeDisplayText(): Promise<string> {
        const container = this.gameTypeMultiSelect.locator('.p-multiselect-label-container');
        for (let attempt = 0; attempt < 10; attempt++) {
            const text = (await container.innerText().catch(() => '')).trim();
            if (text) return text;
            await this.page.waitForTimeout(200);
        }
        return '';
    }

    // Min Wager / Min Legs / Min Odds / Max Point Allocation are p-inputnumber (min="0") —
    // reuses the click(x3)+pressSequentially+Tab pattern already proven elsewhere in this suite
    // (see GenericPredictorPage.fillNumericField) for this component type.
    private async fillNumericField(field: Locator, value: string) {
        await field.waitFor({ state: 'visible' });
        await field.click({ clickCount: 3 });
        await field.pressSequentially(value);
        await field.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async fillMinWager(value: string) {
        console.log(`Filling Min Wager Amount: "${value}"...`);
        await this.fillNumericField(this.minWagerInput, value);
    }

    async fillMinLegs(value: string) {
        console.log(`Filling Min Number of Legs: "${value}"...`);
        await this.fillNumericField(this.minLegsInput, value);
    }

    async fillMinOdds(value: string) {
        console.log(`Filling Min Odds: "${value}"...`);
        await this.fillNumericField(this.minOddsInput, value);
    }

    async fillMaxPoints(value: string) {
        console.log(`Filling Max Point Allocation: "${value}"...`);
        await this.fillNumericField(this.maxPointsInput, value);
    }

    async getMinWagerValue(): Promise<string> {
        return (await this.minWagerInput.inputValue()).trim();
    }

    async getMinLegsValue(): Promise<string> {
        return (await this.minLegsInput.inputValue()).trim();
    }

    async getMinOddsValue(): Promise<string> {
        return (await this.minOddsInput.inputValue()).trim();
    }

    async getMaxPointsValue(): Promise<string> {
        return (await this.maxPointsInput.inputValue()).trim();
    }

    /** See GenericPredictorPage.fillHomeScoreRaw — same PrimeNG InputNumber keydown-level
     * filtering quirk applies here, so a negative value needs .fill() to actually land instead of
     * being silently stripped by pressSequentially. */
    private async fillNumericFieldRaw(field: Locator, value: string) {
        await field.click({ clickCount: 3 });
        await field.fill(value);
        await field.blur();
        await this.page.waitForTimeout(300);
    }

    async fillMinWagerRaw(value: string) {
        console.log(`Filling Min Wager Amount directly (bypassing keystroke filtering): "${value}"...`);
        await this.fillNumericFieldRaw(this.minWagerInput, value);
    }

    async fillMinLegsRaw(value: string) {
        console.log(`Filling Min Number of Legs directly (bypassing keystroke filtering): "${value}"...`);
        await this.fillNumericFieldRaw(this.minLegsInput, value);
    }

    /** Confirmed live: populated Configurations render as CARDS (.leaderboard__configuration-card),
     * not table rows — each titled "Leaderboard Configuration: {name}" in its own <h5>, so a
     * plain hasText match against the card is enough to find it by name. */
    getConfigCardByName(name: string): Locator {
        return this.configurationsContainer.locator(leaderboardLocators.configurationCard, { hasText: name }).first();
    }

    /** Raw trigger locator (no click), for tests that need to click it themselves — e.g. a
     * repeated/forced click stress test where clickRowMenuForConfiguration's own strict
     * actionability wait would be the wrong tool (see its own comment). */
    getConfigRowMenuTrigger(name: string): Locator {
        return this.getConfigCardByName(name).locator(leaderboardLocators.configRowMenuTrigger);
    }

    async isConfigurationVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        const card = this.getConfigCardByName(name);
        return await card.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isConfigurationAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        const card = this.getConfigCardByName(name);
        return await card.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    // ─── Configuration card's "..." kebab menu (Edit / Player Info / Prize Configuration / Delete) ───
    // Confirmed live: a plain PrimeNG icon-only button (NOT .pure__table-menu-trigger like the
    // Leaderboard row's own kebab) — targeted via its ellipsis icon instead. Confirmed live: once
    // open, the menu can sit visually over/near its own trigger, so calling this a SECOND time
    // without closing the menu first can hang on the strict actionability wait (the open menu
    // intercepts the click) — see getConfigRowMenuTrigger for the raw-click alternative used by
    // the repeated-click stress test.

    async clickRowMenuForConfiguration(name: string) {
        console.log(`Opening the "..." menu for Configuration "${name}"...`);
        const card = this.getConfigCardByName(name);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(card.locator(leaderboardLocators.configRowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    getConfigRowMenu(): Locator {
        return this.page.locator('.p-menu, .p-tieredmenu').last();
    }

    async clickEditFromConfigRowMenu() {
        console.log('Clicking Edit from the Configuration row menu...');
        const menuItem = this.getConfigRowMenu().getByText(leaderboardLocators.menuItemConfigEdit, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickPlayerInfoFromConfigRowMenu() {
        console.log('Clicking Player Info from the Configuration row menu...');
        const menuItem = this.getConfigRowMenu().getByText(leaderboardLocators.menuItemConfigPlayerInfo, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    async clickPrizeConfigurationFromConfigRowMenu() {
        console.log('Clicking Prize Configuration from the Configuration row menu...');
        const menuItem = this.getConfigRowMenu().getByText(leaderboardLocators.menuItemConfigPrizeConfiguration, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFromConfigRowMenu() {
        console.log('Clicking Delete from the Configuration row menu...');
        const menuItem = this.getConfigRowMenu().getByText(leaderboardLocators.menuItemConfigDelete, { exact: true });
        await this.clickElement(menuItem);
    }

    async openEditForConfiguration(name: string) {
        console.log(`Opening Edit for Configuration "${name}"...`);
        await this.clickRowMenuForConfiguration(name);
        await this.clickEditFromConfigRowMenu();
    }

    async openPlayerInfoForConfiguration(name: string) {
        console.log(`Opening Player Info for Configuration "${name}"...`);
        await this.clickRowMenuForConfiguration(name);
        await this.clickPlayerInfoFromConfigRowMenu();
    }

    async openPrizeConfigurationForConfiguration(name: string) {
        console.log(`Opening Prize Configuration for Configuration "${name}"...`);
        await this.clickRowMenuForConfiguration(name);
        await this.clickPrizeConfigurationFromConfigRowMenu();
    }

    /** Deletes a Configuration by name via its row's "..." menu and the custom Yes/No modal,
     * waiting for it to actually disappear. Swallows errors so it's safe to call unconditionally
     * from afterEach, even if the record was never created (e.g. the test failed before Save) or
     * was already removed. */
    async deleteConfigurationIfPresent(name: string) {
        try {
            const isPresent = await this.isConfigurationVisibleByName(name, 5000);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for Configuration "${name}" — row not present.`);
                return;
            }
            await this.clickRowMenuForConfiguration(name);
            await this.clickDeleteFromConfigRowMenu();
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isConfigurationAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup failed for Configuration "${name}": ${error}`);
        }
    }
}
