import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { prizeDrawLocators as locators } from '../locators/prizeDrawLocators';

export class PrizeDrawPage extends BasePage {
    readonly createPrizeBtn: Locator;

    // Confirmed live (user-supplied outerHTML): the popup's 4 base fields, all carrying static ids.
    readonly promotionNameInput: Locator;
    readonly totalPrizePositionsInput: Locator;
    readonly chanceToWinInput: Locator;
    readonly typeDropdown: Locator;

    readonly addConfigurationBtn: Locator;
    readonly saveBtn: Locator;
    // Confirmed live (actual app run): a real Cancel button DOES exist next to Save — an earlier
    // assumption that none was captured turned out wrong once the popup was seen live.
    readonly cancelBtn: Locator;

    // Confirmed live (actual app run): with zero Configurations, the popup shows this literal
    // placeholder text instead of any Configuration block — the popup does NOT start with a
    // default "Configuration 1" (an earlier assumption, based on the user's own captured outerHTML,
    // turned out to be a snapshot of an already-filled-in popup, not its pristine opened state).
    readonly noConfigurationsMessage: Locator;

    // Confirmed live (user-supplied outerHTML): the running Total Chance message sits in its own
    // wrapper below every Configuration block, not inside any one of them.
    readonly totalChanceMessage: Locator;

    // PrimeNG's own default dialog header "X" icon — confirmed live to exist alongside Cancel.
    readonly closeIconBtn: Locator;

    // Confirmed live (user-supplied outerHTML): universal `.pure__table` list wrapper convention
    // (same assumption BetPromotionRulesPage/TimedPromotionsPage make) — the list page itself
    // (columns/rows) wasn't independently captured, only the Create Prize button and search bar.
    readonly table: Locator;
    readonly searchInput: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    private readonly dialog: Locator;

    constructor(page: Page) {
        super(page);

        // Confirmed live: only one Create Prize popup is ever open at a time.
        this.dialog = page.locator('div[role="dialog"]').last();

        this.createPrizeBtn = page.getByRole('button', { name: locators.buttonCreatePrize, exact: true });

        this.promotionNameInput = this.dialog.locator(locators.promotionNameInput);
        this.totalPrizePositionsInput = this.dialog.locator(locators.totalPrizePositionsWrapper).locator('input');
        this.chanceToWinInput = this.dialog.locator(locators.chanceToWinWrapper).locator('input');
        this.typeDropdown = this.dialog.locator(locators.typeDropdown);

        this.addConfigurationBtn = this.dialog.getByRole('button', { name: locators.buttonAddConfiguration, exact: true });
        this.saveBtn = this.dialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: 'Cancel', exact: true });

        this.noConfigurationsMessage = this.dialog.getByText('No configurations added', { exact: false });

        this.totalChanceMessage = this.dialog.locator(locators.totalChanceError, { hasText: 'Total Chance' });

        this.closeIconBtn = this.dialog.locator('[data-pc-section="closebutton"], button.p-dialog-header-close, button[aria-label="Close"]').first();

        this.table = page.locator('.pure__table').first();
        this.searchInput = page.locator(locators.searchInput);
        this.confirmYesBtn = page.getByRole('button', { name: locators.buttonYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: locators.buttonNo, exact: true });
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page / navigation
    // ═══════════════════════════════════════════════════════════════════════

    async clickCreatePrize() {
        console.log('Clicking Create Prize button...');
        await this.clickElement(this.createPrizeBtn);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    getRowByPromotionName(promotionName: string): Locator {
        return this.table.locator('tbody tr', { hasText: promotionName }).first();
    }

    async isRowVisibleByPromotionName(promotionName: string, timeout: number = 20000): Promise<boolean> {
        return await this.getRowByPromotionName(promotionName).waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async searchFor(value: string) {
        console.log(`Searching for "${value}"...`);
        await this.fillInput(this.searchInput, value);
        await this.page.waitForTimeout(500);
    }

    /** Confirmed live (TC_PD_39/40/42): right after a successful Save, the list page's own Search
     * box is already populated (by the app itself, not by any of our own test code) with the just-
     * saved Promotion Name, and the table briefly/sometimes shows "Nothing found" against it — a
     * filter the app applied on its own that our test never asked for and shouldn't rely on when
     * simply checking whether the new row exists. Clearing it lets the unfiltered full list render
     * so isRowVisibleByPromotionName checks the real table instead of racing the app's own filter. */
    async clearSearch() {
        console.log('Clearing search box...');
        await this.fillInput(this.searchInput, '');
        await this.page.waitForTimeout(500);
    }

    /** Confirmed live (TC_PD_39/40/42): clearSearch() alone isn't always enough — the app can
     * re-apply the same stale filter right after we clear it, leaving "Nothing found" showing even
     * though the toast already confirmed the Save succeeded.
     *
     * CORRECTED after an actual run (TC_PD_44/45/46/47): the original recovery step here —
     * `page.reload()`, escalating to `page.goto(bareUrl)` — is exactly the confirmed-bad pattern
     * already documented elsewhere in this suite (timedpromo.spec.ts: "reloading loses that state
     * and Angular redirects to dashboard"; scratch-and-win.spec.ts re-does a full sidebar
     * navigation specifically BECAUSE `page.reload()` loses SPA routing state). TC_PD_44's own
     * beforeEach failure — stuck on "Dashboard", the Create Prize button never appearing — is this
     * exact symptom: reload/goto-bare-url was silently bouncing us off the Prize Draw route
     * entirely, so every later presence check was a false negative against the wrong page, not a
     * real signal about the row. Re-driving the full, proven-safe sidebar navigation sequence
     * (`page.goto('/main/home')` -> waitForAppReady -> navigateToPrizeDraw, the same sequence
     * `navigateToPrizeDraw()` in prizedraw.spec.ts already uses) instead of reload/goto. Requires a
     * `sidebarPage` handle (optional — omitted, this just does the plain clearSearch check once,
     * same as before this fix for any caller that hasn't been updated). */
    async verifyPrizeVisibleAfterSave(
        promotionName: string,
        timeout: number = 15000,
        sidebarPage?: { waitForAppReady(): Promise<void>; navigateToPrizeDraw(): Promise<void> }
    ): Promise<boolean> {
        await this.clearSearch();
        let isPresent = await this.isRowVisibleByPromotionName(promotionName, timeout);
        if (isPresent || !sidebarPage) return isPresent;

        console.log('Row not found after clearing search — re-navigating via the sidebar (NOT reload) and retrying...');
        await this.page.goto('/main/home');
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await sidebarPage.waitForAppReady();
        await sidebarPage.navigateToPrizeDraw();
        await this.createPrizeBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
        await this.clearSearch();
        isPresent = await this.isRowVisibleByPromotionName(promotionName, timeout);
        return isPresent;
    }

    /** Clicks the row's Delete action. Only a standalone "Delete" button + ConfirmDialog "Yes" were
     * confirmed live (not the row markup itself) — tries a direct "Delete" button on the row first
     * (this app's confirmed convention elsewhere, e.g. Hourly/Prize Configuration), falling back to
     * a kebab "..." menu (confirmed live elsewhere, e.g. the Rules Engine list). */
    private async clickDeleteForRow(row: Locator) {
        const directDeleteBtn = row.getByRole('button', { name: locators.buttonDelete, exact: true });
        if (await directDeleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.clickElement(directDeleteBtn);
            return;
        }

        const dotsBtn = row.locator('button:has(.pi-ellipsis-v), button.pure__table-menu-trigger').first();
        await dotsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(dotsBtn);
        const menu = this.page.locator('.p-menu-overlay, .p-menu, .p-tieredmenu').last();
        await menu.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(menu.getByText(locators.buttonDelete, { exact: true }));
    }

    /** Deletes a Prize by its Promotion Name — searches for it first, clicks Delete on the
     * resulting row, confirms via the real ConfirmDialog's Yes button, and waits for it to actually
     * disappear. Swallows errors so it's safe to call unconditionally from afterEach, even if no
     * prize was ever created (e.g. the test failed before reaching Save) or it was already removed. */
    async deletePrizeIfPresent(promotionName: string) {
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

    /** Searches for the Prize, clicks its Delete action, and waits for the real ConfirmDialog to
     * actually appear — WITHOUT confirming it. Lets a test assert the dialog itself showed up, or
     * back out via clickNoOnConfirmDialog(), instead of only ever exercising the Yes path. */
    async openDeleteConfirmDialog(promotionName: string) {
        console.log(`Opening Delete confirmation dialog for "${promotionName}"...`);
        await this.searchFor(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickDeleteForRow(row);
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Backs out of the open Delete ConfirmDialog via its No button, leaving the Prize untouched. */
    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirm dialog...');
        await this.clickElement(this.confirmNoBtn);
        await this.confirmNoBtn.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    /** Opens the given row's Edit action. NOT confirmed live for this feature specifically — only
     * Delete + ConfirmDialog Yes were captured for the list page. Mirrors clickDeleteForRow's own
     * two-convention fallback: a direct "Edit" row button first (this app's confirmed convention
     * for Delete itself, e.g. Hourly/Prize Configuration), falling back to the kebab "..." menu's
     * "Edit" item (confirmed live elsewhere, e.g. CompBulkConfigurationsPage.clickEditOnCard). */
    private async clickEditForRow(row: Locator) {
        const directEditBtn = row.getByRole('button', { name: locators.buttonEdit, exact: true });
        if (await directEditBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.clickElement(directEditBtn);
            return;
        }

        const dotsBtn = row.locator('button:has(.pi-ellipsis-v), button.pure__table-menu-trigger').first();
        await dotsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(dotsBtn);
        const menu = this.page.locator('.p-menu-overlay, .p-menu, .p-tieredmenu').last();
        await menu.waitFor({ state: 'visible', timeout: 10000 });
        const editItem = menu.locator(locators.editMenuItem);
        if (await editItem.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.clickElement(editItem);
        } else {
            await this.clickElement(menu.getByText(locators.buttonEdit, { exact: true }));
        }
    }

    /** Searches for the Prize by Promotion Name, opens its Edit action, and waits for the same
     * Create/Edit popup to open and its Promotion Name field to come back populated — the same
     * single-popup-reused-for-both-modes convention already confirmed elsewhere in this app (e.g.
     * CompBulkConfigurationsPage: "Save/Cancel footer ... identical in markup to the Create/Edit
     * Configuration dialog"). NOT independently confirmed live for this feature. */
    async openEditForPrize(promotionName: string) {
        console.log(`Opening Edit for Prize "${promotionName}"...`);
        await this.searchFor(promotionName);
        const row = this.getRowByPromotionName(promotionName);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickEditForRow(row);
        await this.promotionNameInput.waitFor({ state: 'visible', timeout: 15000 });
        await this.page.waitForTimeout(300);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Generic PrimeNG dropdown helpers (same proven pattern as BetPromotionRulesPage)
    // ═══════════════════════════════════════════════════════════════════════

    private async openDropdown(dropdownLocator: Locator): Promise<Locator> {
        await this.clickElement(dropdownLocator);
        let panel = this.page.locator('.p-dropdown-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
            // Confirmed live (TC_PD_40): the dropdown locator here is an id selector (e.g. `#type`)
            // which PrimeNG also uses on a visually-hidden native <select> it keeps for
            // accessibility, nested inside the real visible/clickable wrapper div. Clicking it can
            // intermittently hit that hidden native element instead of the visible trigger, which
            // opens the BROWSER's own native option picker (a top-level "listbox" in the
            // accessibility tree) rather than the expected .p-dropdown-panel overlay. Escape closes
            // that native picker; clicking the element's own parent wrapper (the actually visible,
            // styled surface) is more likely to open the real custom panel on retry.
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
            await dropdownLocator.locator('xpath=..').click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            panel = this.page.locator('.p-dropdown-panel').last();
        }
        if (!(await panel.isVisible().catch(() => false))) {
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

    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const label = dropdownLocator.locator('.p-dropdown-label');
        const text = (await label.innerText({ timeout: 3000 }).catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.dialog.locator(locators.validationError).count()) > 0;
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

    // p-inputnumber fields — same proven keystroke-tracking convention used elsewhere in this app
    // (plain .fill() doesn't register with InputNumber): click to focus/select-all, type, then Tab
    // to commit and move off the field.
    //
    // Confirmed live (TC_PD_39/40/42, recurring): typing followed immediately by Tab can race
    // PrimeNG's own reformat/suffix recalculation, intermittently dropping the final typed digit
    // before the field's internal model settles (observed repeatedly: "100" landed as "10", "40"
    // landed as "4" — always exactly the trailing digit). A fixed pause before Tab reduces this but
    // doesn't eliminate it, so this now verifies the digits actually registered and retypes (up to
    // 2 extra attempts) before giving up and moving on — the same verify-don't-trust pattern already
    // used elsewhere in this suite (e.g. ManualCompsPage.clickSaveAndVerify).
    private async fillNumberInput(input: Locator, value: string) {
        await input.waitFor({ state: 'visible' });
        const expectedDigits = value.replace(/\D/g, '');

        for (let attempt = 1; attempt <= 3; attempt++) {
            await input.click({ clickCount: 3 });
            await input.pressSequentially(value);
            await this.page.waitForTimeout(150);

            const actualDigits = (await input.inputValue()).replace(/\D/g, '');
            if (actualDigits === expectedDigits) break;

            console.log(`Number input mismatch (attempt ${attempt}): expected "${expectedDigits}", got "${actualDigits}" — retyping...`);
        }

        await input.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async fillTotalPrizePositions(value: string) {
        console.log(`Filling Total Prize Positions: "${value}"...`);
        await this.fillNumberInput(this.totalPrizePositionsInput, value);
    }

    async getTotalPrizePositionsValue(): Promise<string> {
        return (await this.totalPrizePositionsInput.inputValue()).trim();
    }

    async fillChanceToWin(value: string) {
        console.log(`Filling Chance To Win: "${value}"...`);
        await this.fillNumberInput(this.chanceToWinInput, value);
    }

    async getChanceToWinValue(): Promise<string> {
        return (await this.chanceToWinInput.inputValue()).trim();
    }

    /** Type's real option names were never given — picks whichever renders first. */
    async selectFirstType(): Promise<string> {
        return this.selectFirstOption(this.typeDropdown);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Configurations — repeatable blocks, each headed by "Configuration N" (1-based, matching the
    //  on-screen heading). None of a block's own 6 fields carry an id (unlike the 4 base fields
    //  above), only a plain <label> sibling — same float-label-without-id convention already
    //  confirmed and used by BetPromotionRulesPage for its own unlabelled-by-id fields, just scoped
    //  to this one Configuration block instead of the whole dialog.
    // ═══════════════════════════════════════════════════════════════════════

    /** Confirmed live: each Configuration's heading + fields + delete button live together in their
     * own `div.marginb-3` — walking up from the "Configuration N" heading to its nearest such
     * ancestor scopes every field lookup below to that one block, even when several configurations
     * (each with their own duplicate field labels) exist on the popup at once. */
    private getConfigurationBlock(index: number): Locator {
        return this.dialog
            .locator('h4', { hasText: new RegExp(`^Configuration ${index}$`) })
            .locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " marginb-3 ")][1]');
    }

    private getPlainInputByLabel(block: Locator, labelText: string): Locator {
        return block.locator(`input.p-inputtext:has(+ label:text-is("${labelText}"))`).first();
    }

    private getNumberInputByLabel(block: Locator, labelText: string): Locator {
        return block.locator(`span.p-inputnumber:has(+ label:text-is("${labelText}"))`).first().locator('input');
    }

    async getConfigurationCount(): Promise<number> {
        return await this.dialog.locator('h4', { hasText: /^Configuration \d+$/ }).count();
    }

    /** Confirmed live: the popup opens with ZERO Configuration blocks (just the "No configurations
     * added. Click 'Add Configuration'." placeholder) — NOT a default "Configuration 1" as an
     * earlier assumption (based on a snapshot that turned out to already be filled in) claimed.
     * Every per-field method below operates on a specific 1-based index, so each calls this first
     * to add whatever's missing up to that index, letting every test below address "Configuration
     * 1" (etc.) directly without every call site having to remember to Add Configuration itself. */
    private async ensureConfigurationExists(index: number) {
        let count = await this.getConfigurationCount();
        while (count < index) {
            await this.clickAddConfiguration();
            count = await this.getConfigurationCount();
        }
    }

    async clickAddConfiguration() {
        console.log('Clicking Add Configuration...');
        await this.clickElement(this.addConfigurationBtn);
        await this.page.waitForTimeout(300);
    }

    /** Deletes the Nth Configuration block via its own trash icon button. */
    async deleteConfiguration(index: number) {
        console.log(`Deleting Configuration ${index}...`);
        const block = this.getConfigurationBlock(index);
        const deleteBtn = block.locator('button:has(.pi-trash)').first();
        await this.clickElement(deleteBtn);
        await this.page.waitForTimeout(300);
    }

    async fillPrizeType(index: number, value: string) {
        console.log(`Configuration ${index}: filling Prize Type: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getPlainInputByLabel(this.getConfigurationBlock(index), 'Prize Type *');
        await this.fillInput(input, value);
    }

    async getPrizeTypeValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getPlainInputByLabel(this.getConfigurationBlock(index), 'Prize Type *');
        return (await input.inputValue()).trim();
    }

    async fillNumberOfWinners(index: number, value: string) {
        console.log(`Configuration ${index}: filling Number Of Winners: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Number Of Winners *');
        await this.fillNumberInput(input, value);
    }

    async getNumberOfWinnersValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Number Of Winners *');
        return (await input.inputValue()).trim();
    }

    async fillLowerPosition(index: number, value: string) {
        console.log(`Configuration ${index}: filling Lower Position: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Lower Position *');
        await this.fillNumberInput(input, value);
    }

    async getLowerPositionValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Lower Position *');
        return (await input.inputValue()).trim();
    }

    async fillUpperPosition(index: number, value: string) {
        console.log(`Configuration ${index}: filling Upper Position: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Upper Position *');
        await this.fillNumberInput(input, value);
    }

    async getUpperPositionValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Upper Position *');
        return (await input.inputValue()).trim();
    }

    async fillValueField(index: number, value: string) {
        console.log(`Configuration ${index}: filling Value: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Value *');
        await this.fillNumberInput(input, value);
    }

    async getValueFieldValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Value *');
        return (await input.inputValue()).trim();
    }

    async fillChance(index: number, value: string) {
        console.log(`Configuration ${index}: filling Chance: "${value}"...`);
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Chance *');
        await this.fillNumberInput(input, value);
    }

    async getChanceValue(index: number): Promise<string> {
        await this.ensureConfigurationExists(index);
        const input = this.getNumberInputByLabel(this.getConfigurationBlock(index), 'Chance *');
        const raw = (await input.inputValue()).trim();
        // Confirmed live (TC_PD_27): PrimeNG renders this field's displayed value with a "%" suffix
        // baked in (e.g. "50%") — strip it so callers compare against the plain numeric value they
        // typed, consistent with every other Configuration field getter in this class.
        return raw.replace(/%$/, '');
    }

    /** Fills every field of the Nth Configuration with values guaranteed to pass the per-field
     * minimums (all 1, except Value which is confirmed live to accept 0) — callers needing a
     * specific Chance (to hit the 100% total) pass it explicitly; everything else defaults to a
     * simple valid placeholder. */
    async fillConfiguration(index: number, options: { chance: string; numberOfWinners?: string; lowerPosition?: string; upperPosition?: string; value?: string; prizeType?: string }) {
        await this.fillPrizeType(index, options.prizeType ?? `AutoPrizeType_${index}`);
        await this.fillNumberOfWinners(index, options.numberOfWinners ?? '1');
        await this.fillLowerPosition(index, options.lowerPosition ?? '1');
        await this.fillUpperPosition(index, options.upperPosition ?? '1');
        await this.fillValueField(index, options.value ?? '10');
        await this.fillChance(index, options.chance);
    }

    async getTotalChanceText(): Promise<string> {
        return (await this.totalChanceMessage.textContent({ timeout: 5000 }).catch(() => ''))?.trim() ?? '';
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Save / Close / toast
    // ═══════════════════════════════════════════════════════════════════════

    async clickSave() {
        console.log('Clicking Save...');
        await this.clickElement(this.saveBtn);
        await this.page.waitForTimeout(300);
    }

    async clickClosePopup() {
        console.log('Closing the popup via its header close icon...');
        await this.clickElement(this.closeIconBtn);
        await this.page.waitForTimeout(300);
    }

    // Confirmed live: a real Cancel button exists next to Save.
    async clickCancel() {
        console.log('Clicking Cancel...');
        await this.clickElement(this.cancelBtn);
        await this.page.waitForTimeout(300);
    }

    // Same `.p-toast-message` / `.p-toast-message-text` convention confirmed live elsewhere in this
    // app — reused here since this feature's own toast markup hasn't been captured yet. Returns ''
    // if no toast appears within the timeout (never throws), so it's safe for diagnostics as well
    // as assertions.
    async getToastText(timeout: number = 10000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }
}
