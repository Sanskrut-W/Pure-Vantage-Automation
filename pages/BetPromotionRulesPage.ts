import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { betPromotionRulesLocators as locators } from '../locators/betPromotionRulesLocators';

export class BetPromotionRulesPage extends BasePage {
    readonly createBtn: Locator;

    // Confirmed live (user-supplied outerHTML): the popup opens with these 6 fields immediately —
    // none of them are themselves conditional.
    readonly promotionNameInput: Locator;
    readonly promotionTypeDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly feedDropdown: Locator;
    readonly minimumAmountInput: Locator;

    // Confirmed live: these 4 only render once Feed has a value. Sport itself is NOT disabled
    // (data-p-disabled="false") the instant it appears; League/Event/Market all render disabled
    // (data-p-disabled="true") at that same moment.
    //
    // NOTE on "Outcome": the user's functional description references an "Outcome" field three
    // times (in the clearing-cascade examples and the enablement rules — "Selecting Market should
    // enable the Outcome field"), but explicitly lists only 4 fields that appear after Feed, and
    // the captured outerHTML of the popup after selecting Feed shows exactly Sport/League/Event/
    // Market and nothing else — no Outcome element exists anywhere in it. Rather than fabricate a
    // 5th field with no confirmed markup, Outcome is treated as NOT present on this popup and no
    // locator/tests reference it. If it does exist, fresh outerHTML of the popup after Market is
    // selected would be needed to add it correctly.
    readonly sportDropdown: Locator;
    readonly leagueDropdown: Locator;
    readonly eventDropdown: Locator;
    readonly marketDropdown: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Confirmed live elsewhere in this app (e.g. TimedPromotionsPage) as the universal table
    // wrapper convention for a "Create X" list page — not independently confirmed for this
    // specific list, since no outerHTML of the list page itself (beyond the Create button) was
    // captured.
    readonly table: Locator;

    // ─── List page — confirmed live (user-supplied outerHTML) ──────────────────
    readonly searchInput: Locator;
    // Confirmed live: the delete confirmation is a real PrimeVue ConfirmDialog
    // (.p-confirm-dialog-accept/.p-confirm-dialog-reject), not a generic "Yes"/"No" button.
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    // Confirmed live (user-supplied outerHTML): DIFFERENT elements from the popup's own Start
    // Date/End Date (#effectiveDate/#effectiveEndDate) — these carry a placeholder instead and
    // live on the list page itself, used to filter the table by date range.
    readonly filterStartDateInput: Locator;
    readonly filterEndDateInput: Locator;
    readonly resetFiltersBtn: Locator;

    private readonly dialog: Locator;

    constructor(page: Page) {
        super(page);

        this.createBtn = page.getByRole('button', { name: locators.buttonCreateBetPromotionRule, exact: true });

        // Confirmed live: only one Create/Edit popup is ever open at a time, so a bare
        // `div[role="dialog"]` (no name-scoping needed) is enough — but every field within it is
        // still scoped to this dialog as a cheap extra safety net against this app's confirmed
        // habit (seen in Rules Engine) of duplicate ids/labels existing elsewhere on the page at
        // the same time.
        this.dialog = page.locator('div[role="dialog"]').first();

        this.promotionNameInput = this.getPlainInputByLabel(locators.labelPromotionName);
        this.promotionTypeDropdown = this.getDropdownByLabel(locators.labelPromotionType);
        this.startDateInput = this.dialog.locator(locators.calendarStartDate);
        this.endDateInput = this.dialog.locator(locators.calendarEndDate);
        this.feedDropdown = this.getDropdownByLabel(locators.labelFeed);
        this.minimumAmountInput = this.getNumberInputByLabel(locators.labelMinimumAmount);

        this.sportDropdown = this.getDropdownByLabel(locators.labelSport);
        this.leagueDropdown = this.getDropdownByLabel(locators.labelLeague);
        this.eventDropdown = this.getDropdownByLabel(locators.labelEvent);
        this.marketDropdown = this.getDropdownByLabel(locators.labelMarket);

        this.saveBtn = this.dialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: locators.buttonCancel, exact: true });

        this.table = page.locator('.pure__table').first();

        this.searchInput = page.locator(locators.searchInput);
        this.confirmYesBtn = page.locator(locators.confirmDialogYesBtn).first();
        this.confirmNoBtn = page.locator(locators.confirmDialogNoBtn).first();

        this.filterStartDateInput = page.locator(locators.filterStartDateInput);
        this.filterEndDateInput = page.locator(locators.filterEndDateInput);
        this.resetFiltersBtn = page.getByRole('button', { name: locators.buttonResetFilters, exact: true });
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Float-label lookups — same proven convention as RulesEnginePage, used here because none
    //  of this popup's own fields (besides Start/End Date) carry an id.
    // ═══════════════════════════════════════════════════════════════════════

    private getDropdownByLabel(labelText: string): Locator {
        return this.dialog.locator(`div.p-dropdown:has(+ label:text-is("${labelText}"))`).first();
    }

    private getPlainInputByLabel(labelText: string): Locator {
        return this.dialog.locator(`input.p-inputtext:has(+ label:text-is("${labelText}"))`).first();
    }

    private getNumberInputByLabel(labelText: string): Locator {
        return this.dialog.locator(`span.p-inputnumber:has(+ label:text-is("${labelText}"))`).first().locator('input');
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page / navigation
    // ═══════════════════════════════════════════════════════════════════════

    async clickCreateBetPromotionRule() {
        console.log('Clicking Create Bet Promotion Rule button...');
        await this.clickElement(this.createBtn);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    getRowByPromotionName(promotionName: string): Locator {
        return this.table.locator('tbody tr', { hasText: promotionName }).first();
    }

    async isRowVisibleByPromotionName(promotionName: string, timeout: number = 20000): Promise<boolean> {
        return await this.getRowByPromotionName(promotionName).waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Generic PrimeNG dropdown helpers (same proven pattern as RulesEnginePage/LeaderboardPage)
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

    /** Selects whichever option renders first — used for fields whose values are environment/real
     * data (Promotion Type, Feed, Sport, League, Event, Market) and not safe to hardcode. Returns
     * the selected option's text. */
    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(locators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /** Opens the dropdown and clicks the first option whose text differs from `excludeText` — used
     * to drive the "changing a field clears its dependents" cascade tests, since the user's own
     * description calls for actually changing the value, not clearing it via an "x" icon (this
     * popup's dropdowns, unlike Rules Engine's, show no clear icon in the captured outerHTML).
     * Returns null (and leaves the dropdown closed again) if this environment only has the one
     * option, since there's then nothing to change to. */
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

    async isDropdownDisabled(dropdownLocator: Locator): Promise<boolean> {
        return (await dropdownLocator.getAttribute('data-p-disabled')) === 'true';
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.page.locator(locators.validationError).count()) > 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step: Base fields
    // ═══════════════════════════════════════════════════════════════════════

    async fillPromotionName(value: string) {
        console.log(`Filling Promotion Name: "${value}"...`);
        await this.fillInput(this.promotionNameInput, value);
    }

    async getPromotionNameValue(): Promise<string> {
        return (await this.promotionNameInput.inputValue()).trim();
    }

    async selectFirstPromotionType(): Promise<string> {
        return this.selectFirstOption(this.promotionTypeDropdown);
    }

    // Confirmed live: aria-controls points straight at each calendar's own panel id — no need to
    // read it dynamically the way RulesEnginePage's setDateField does for an uncaptured id.
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
        await this.setDateField(this.startDateInput, 'effectiveDate_panel');
    }

    async setEndDate() {
        console.log('Selecting End Date (today)...');
        await this.setDateField(this.endDateInput, 'effectiveEndDate_panel');
    }

    async selectFirstFeed(): Promise<string> {
        return this.selectFirstOption(this.feedDropdown);
    }

    // Min Amount is a p-inputnumber — same proven keystroke-tracking convention used elsewhere in
    // this app (plain .fill() doesn't register with InputNumber).
    async fillMinimumAmount(value: string) {
        await this.minimumAmountInput.waitFor({ state: 'visible' });
        await this.minimumAmountInput.click({ clickCount: 3 });
        await this.minimumAmountInput.pressSequentially(value);
        await this.minimumAmountInput.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async getMinimumAmountValue(): Promise<string> {
        return (await this.minimumAmountInput.inputValue()).trim();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step: Sport/League/Event/Market (revealed after Feed is selected)
    // ═══════════════════════════════════════════════════════════════════════

    async selectFirstSport(): Promise<string> {
        return this.selectFirstOption(this.sportDropdown);
    }

    async selectFirstLeague(): Promise<string> {
        return this.selectFirstOption(this.leagueDropdown);
    }

    async selectFirstEvent(): Promise<string> {
        return this.selectFirstOption(this.eventDropdown);
    }

    async selectFirstMarket(): Promise<string> {
        return this.selectFirstOption(this.marketDropdown);
    }

    async isSportDropdownDisabled(): Promise<boolean> {
        return this.isDropdownDisabled(this.sportDropdown);
    }

    async isLeagueDropdownDisabled(): Promise<boolean> {
        return this.isDropdownDisabled(this.leagueDropdown);
    }

    async isEventDropdownDisabled(): Promise<boolean> {
        return this.isDropdownDisabled(this.eventDropdown);
    }

    async isMarketDropdownDisabled(): Promise<boolean> {
        return this.isDropdownDisabled(this.marketDropdown);
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

    // Same `.p-toast-message` / `.p-toast-message-text` convention confirmed live elsewhere in
    // this app — reused here since this feature's own toast markup hasn't been captured yet.
    // Returns '' if no toast appears within the timeout (never throws), so it's safe for
    // diagnostics as well as assertions.
    async getToastText(timeout: number = 10000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page — search + delete cleanup
    // ═══════════════════════════════════════════════════════════════════════

    async searchFor(value: string) {
        console.log(`Searching for "${value}"...`);
        await this.fillInput(this.searchInput, value);
        await this.page.waitForTimeout(500);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page — Start/End Date filters
    // ═══════════════════════════════════════════════════════════════════════

    // Unlike the popup's Start Date/End Date (static #effectiveDate/#effectiveEndDate_panel ids),
    // these filter fields' panel ids (e.g. "pr_id_976_panel") are PrimeNG auto-generated and not
    // stable across page loads — read via aria-controls at runtime, same proven pattern as
    // RulesEnginePage's own setDateField for an uncaptured id.
    //
    // Confirmed live (user clarification): this is a RANGE filter on each Rule's OWN Start Date —
    // e.g. filter Start Date = 14 Oct, filter End Date = 16 Oct shows every Rule whose own Start
    // Date falls between 14 and 16 Oct. It is NOT a "pick today in both fields" same-day lookup.
    private async getFilterPanel(input: Locator): Promise<Locator> {
        const panelId = await input.getAttribute('aria-controls');
        return panelId
            ? this.page.locator(`#${panelId}`)
            : this.page.locator('.p-datepicker-panel, .p-datepicker').last();
    }

    private async dismissFilterPanel(panel: Locator) {
        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /** Selects today in the given filter field — a degenerate single-day range, useful for
     * confirming a rule created with today as its own Start Date is matched when the filter range
     * is exactly "today to today". */
    private async setFilterDateToToday(input: Locator) {
        await input.click();
        await this.page.waitForTimeout(300);
        const panel = await this.getFilterPanel(input);
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td[data-p-today="true"] span').first().click();
        await this.page.waitForTimeout(300);
        await this.dismissFilterPanel(panel);
    }

    /** Navigates the given filter field's calendar by whole months (negative = back, positive =
     * forward — confirmed live convention elsewhere in this app, e.g. CouponPage) and picks the
     * first available day in that month. Navigating by whole months rather than a specific
     * day-of-month sidesteps month-boundary edge cases entirely while still landing reliably
     * before/after today for range tests. */
    private async setFilterDateByMonthOffset(input: Locator, monthOffset: number) {
        await input.click();
        await this.page.waitForTimeout(300);
        const panel = await this.getFilterPanel(input);
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const navBtn = monthOffset < 0 ? panel.locator('.p-datepicker-prev') : panel.locator('.p-datepicker-next');
        for (let i = 0; i < Math.abs(monthOffset); i++) {
            await navBtn.click();
            await this.page.waitForTimeout(200);
        }

        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);
        await this.dismissFilterPanel(panel);
    }

    async setFilterStartDate() {
        console.log('Setting the list page\'s Start Date filter (today)...');
        await this.setFilterDateToToday(this.filterStartDateInput);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async setFilterEndDate() {
        console.log('Setting the list page\'s End Date filter (today)...');
        await this.setFilterDateToToday(this.filterEndDateInput);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    /** `monthOffset` of -1 lands a month before today, +1 a month after — used to build a wide
     * range that's guaranteed to include (or, with two same-sign offsets, exclude) today without
     * needing precise day-of-month arithmetic. */
    async setFilterStartDateByMonthOffset(monthOffset: number) {
        console.log(`Setting the list page's Start Date filter ${monthOffset} month(s) from today...`);
        await this.setFilterDateByMonthOffset(this.filterStartDateInput, monthOffset);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async setFilterEndDateByMonthOffset(monthOffset: number) {
        console.log(`Setting the list page's End Date filter ${monthOffset} month(s) from today...`);
        await this.setFilterDateByMonthOffset(this.filterEndDateInput, monthOffset);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickResetFilters() {
        console.log('Clicking Reset on the list page filters...');
        await this.clickElement(this.resetFiltersBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    /** Clicks the row's Delete action. The exact row-action markup for this list was never
     * captured — tries this app's two known conventions in turn: a direct "Delete" button on the
     * row (confirmed live elsewhere, e.g. Hourly/Prize Configuration), falling back to a kebab
     * "..." menu with a "Delete" item (confirmed live elsewhere, e.g. the Rules Engine list). */
    private async clickDeleteForRow(row: Locator) {
        const directDeleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        if (await directDeleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.clickElement(directDeleteBtn);
            return;
        }

        const dotsBtn = row.locator('button:has(.pi-ellipsis-v), button.pure__table-menu-trigger').first();
        await dotsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(dotsBtn);
        const menu = this.page.locator('.p-menu-overlay, .p-menu, .p-tieredmenu').last();
        await menu.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menu.getByText('Delete', { exact: true }));
    }

    /** Deletes a Bet Promotion Rule by its Promotion Name — searches for it first (confirmed live
     * search bar), clicks Delete on the resulting row, confirms via the real ConfirmDialog's Yes
     * button, and waits for it to actually disappear. Swallows errors so it's safe to call
     * unconditionally from afterEach, even if no rule was ever created (e.g. the test failed
     * before reaching Save) or it was already removed. */
    async deleteRuleIfPresent(promotionName: string) {
        try {
            await this.searchFor(promotionName);
            const row = this.getRowByPromotionName(promotionName);
            const isPresent = await row.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for "${promotionName}" — row not present after search.`);
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
}
