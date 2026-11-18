import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ladderPromotionsLocators as locators } from '../locators/ladderPromotionsLocators';

export class LadderPromotionsPage extends BasePage {
    readonly createLadderPromotionBtn: Locator;

    // Confirmed live (user-supplied outerHTML): the popup's 4 fields.
    readonly descriptionInput: Locator;
    readonly regionDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly isPremiumCheckbox: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Confirmed live (user-supplied outerHTML): universal `.pure__table` list wrapper convention
    // (same assumption PrizeDrawPage/BetPromotionRulesPage/TimedPromotionsPage make) — the list
    // page itself (columns/rows) wasn't independently captured, only the search bar and the
    // row-level kebab menu's Delete item.
    readonly table: Locator;
    readonly searchInput: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    private readonly dialog: Locator;

    constructor(page: Page) {
        super(page);

        // Confirmed live elsewhere (TimedPromotionsPage/PrizeDrawPage): only one PrimeNG dialog is
        // ever open at a time, always rendered with role="dialog".
        this.dialog = page.locator('div[role="dialog"]').last();

        this.createLadderPromotionBtn = page.getByRole('button', { name: locators.buttonCreateLadderPromotion, exact: true });

        this.descriptionInput = this.dialog.locator(locators.descriptionInput);
        this.regionDropdown = this.dialog.locator(locators.regionDropdown);
        this.startDateInput = this.dialog.locator(locators.startDateWrapper).locator('input');
        this.endDateInput = this.dialog.locator(locators.endDateWrapper).locator('input');
        this.isPremiumCheckbox = this.dialog.locator(locators.isPremiumCheckbox).locator('input');

        this.saveBtn = this.dialog.getByRole('button', { name: locators.buttonSave, exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: locators.buttonCancel, exact: true });

        this.table = page.locator('.pure__table').first();
        this.searchInput = page.locator(locators.searchInput);
        this.confirmYesBtn = page.getByRole('button', { name: locators.buttonYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: locators.buttonNo, exact: true });
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page / navigation
    // ═══════════════════════════════════════════════════════════════════════

    async clickCreateLadderPromotion() {
        console.log('Clicking Create Ladder Promotion button...');
        await this.clickElement(this.createLadderPromotionBtn);
        await this.descriptionInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    getRowByDescription(description: string): Locator {
        return this.table.locator('tbody tr', { hasText: description }).first();
    }

    async isRowVisibleByDescription(description: string, timeout: number = 20000): Promise<boolean> {
        return await this.getRowByDescription(description).waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async searchFor(value: string) {
        console.log(`Searching for "${value}"...`);
        await this.fillInput(this.searchInput, value);
        await this.page.waitForTimeout(500);
    }

    async clearSearch() {
        console.log('Clearing search box...');
        await this.fillInput(this.searchInput, '');
        await this.page.waitForTimeout(500);
    }

    /** Confirmed live (same confirmed-bad pattern already documented for PrizeDrawPage/
     * timedpromo.spec.ts/scratch-and-win.spec.ts): page.reload()/page.goto(bareUrl) loses Angular's
     * SPA routing state and redirects to Dashboard. Re-navigates via the sidebar instead if the row
     * still isn't found after clearing search. Requires a `sidebarPage` handle (optional — omitted,
     * this just does the plain clearSearch check once). */
    async verifyPromotionVisibleAfterSave(
        description: string,
        timeout: number = 15000,
        sidebarPage?: { waitForAppReady(): Promise<void>; navigateToLadderPromotions(): Promise<void> }
    ): Promise<boolean> {
        await this.clearSearch();
        let isPresent = await this.isRowVisibleByDescription(description, timeout);
        if (isPresent || !sidebarPage) return isPresent;

        console.log('Row not found after clearing search — re-navigating via the sidebar (NOT reload) and retrying...');
        await this.page.goto('/main/home');
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await sidebarPage.waitForAppReady();
        await sidebarPage.navigateToLadderPromotions();
        await this.createLadderPromotionBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
        await this.clearSearch();
        isPresent = await this.isRowVisibleByDescription(description, timeout);
        return isPresent;
    }

    /** Opens the row's kebab ("...") menu and returns it, ready for a menu item to be clicked. */
    private async openKebabMenuForRow(row: Locator): Promise<Locator> {
        const dotsBtn = row.locator(locators.kebabTrigger).first();
        await dotsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(dotsBtn);
        const menu = this.page.locator('.p-menu-overlay, .p-menu, .p-tieredmenu').last();
        await menu.waitFor({ state: 'visible', timeout: 10000 });
        return menu;
    }

    /** Clicks the row's kebab ("...") trigger then its Delete menu item — the only delete
     * convention the user confirmed live for this feature. */
    private async clickDeleteForRow(row: Locator) {
        const menu = await this.openKebabMenuForRow(row);
        await this.clickElement(menu.locator(locators.deleteMenuItem).getByText(locators.buttonDelete, { exact: true }));
    }

    /** Clicks the row's kebab ("...") trigger then its Edit menu item — confirmed live (user-
     * supplied outerHTML): same kebab menu, same `.p-menuitem-text` convention as Delete. */
    private async clickEditForRow(row: Locator) {
        const menu = await this.openKebabMenuForRow(row);
        await this.clickElement(menu.locator(locators.deleteMenuItem).getByText(locators.buttonEdit, { exact: true }));
    }

    /** Clicks the row's kebab ("...") trigger then its Clone menu item — confirmed live (user-
     * supplied outerHTML): same kebab menu, same `.p-menuitem-text` convention as Delete/Edit. */
    private async clickCloneForRow(row: Locator) {
        const menu = await this.openKebabMenuForRow(row);
        await this.clickElement(menu.locator(locators.deleteMenuItem).getByText(locators.buttonClone, { exact: true }));
    }

    /** Searches for the Ladder Promotion by Description, opens its kebab ("...") menu, and
     * returns it WITHOUT clicking any item — lets a test inspect which actions are actually
     * offered (e.g. confirming only one of Mark Premium / Unmark Premium appears at a time). */
    async openKebabMenuForPromotion(description: string): Promise<Locator> {
        await this.searchFor(description);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        return this.openKebabMenuForRow(row);
    }

    /** Deletes a Ladder Promotion by its Description — searches for it first, opens the row's
     * kebab menu, clicks Delete, confirms via the ConfirmDialog's Yes button, and waits for it to
     * actually disappear. Swallows errors so it's safe to call unconditionally from afterEach, even
     * if no promotion was ever created (e.g. the test failed before reaching Save) or it was
     * already removed. */
    async deleteLadderPromotionIfPresent(description: string) {
        try {
            await this.searchFor(description);
            const row = this.getRowByDescription(description);
            const isPresent = await row.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for "${description}" — row not present after search.`);
                return;
            }

            await this.clickDeleteForRow(row);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickElement(this.confirmYesBtn);
            await this.page.waitForLoadState('networkidle').catch(() => {});
            await row.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            console.log(`Delete cleanup completed for "${description}".`);
        } catch (error) {
            console.log(`Delete cleanup failed for "${description}": ${error}`);
        }
    }

    /** Searches for the Ladder Promotion by Description, opens its kebab menu, clicks Edit, and
     * waits for the same Create/Edit popup to open with its Description field already prefilled —
     * the same single-popup-reused-for-both-modes convention already confirmed elsewhere in this
     * app (e.g. CompBulkConfigurationsPage, PrizeDrawPage.openEditForPrize). NOT independently
     * confirmed live for this feature specifically beyond the kebab menu's own Edit item. */
    async openEditForPromotion(description: string) {
        console.log(`Opening Edit for Ladder Promotion "${description}"...`);
        await this.searchFor(description);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickEditForRow(row);
        await this.descriptionInput.waitFor({ state: 'visible', timeout: 15000 });
        await expect(this.descriptionInput).toHaveValue(description, { timeout: 10000 });
    }

    /** Searches for the Ladder Promotion by Description, opens its kebab menu, clicks Clone, and
     * waits for the Create/Edit popup to open. NOT confirmed live whether the popup prefills
     * Description with the exact original value, a modified copy (e.g. "<original> - Copy"), or
     * leaves it blank — only the kebab menu's own Clone item was confirmed (user-supplied
     * outerHTML). Returns whatever Description value the popup actually opens with, so callers
     * can decide whether to keep it or override it with something distinctive before Saving
     * (important if it turns out to duplicate the original value exactly — two rows with the
     * same Description would make them impossible to tell apart by search). */
    async openCloneForPromotion(description: string): Promise<string> {
        console.log(`Opening Clone for Ladder Promotion "${description}"...`);
        await this.searchFor(description);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickCloneForRow(row);
        await this.descriptionInput.waitFor({ state: 'visible', timeout: 15000 });
        const prefilledDescription = await this.getDescriptionValue();
        console.log(`Clone popup opened with Description prefilled as: "${prefilledDescription}"`);
        return prefilledDescription;
    }

    /** Searches for the Ladder Promotion by Description, opens its kebab menu, clicks Mark
     * Premium, and waits for the real ConfirmDialog to appear — WITHOUT confirming it. Confirmed
     * live (user-supplied outerHTML): same kebab menu `.p-menuitem-text` convention as
     * Delete/Edit/Clone. The confirm dialog's own Yes/No buttons weren't independently captured
     * for Mark Premium specifically (only Unmark Premium's were) — reusing `confirmYesBtn`/
     * `confirmNoBtn`, the same convention already confirmed live for Delete and for Unmark
     * Premium itself. */
    async openMarkPremiumConfirmDialog(description: string) {
        console.log(`Opening Mark Premium confirmation for "${description}"...`);
        await this.searchFor(description);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menu = await this.openKebabMenuForRow(row);
        await this.clickElement(menu.locator(locators.deleteMenuItem).getByText(locators.buttonMarkPremium, { exact: true }));
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Searches for the Ladder Promotion by Description, opens its kebab menu, clicks Unmark
     * Premium, and waits for the real ConfirmDialog to appear — WITHOUT confirming it. Confirmed
     * live (user-supplied outerHTML): same kebab menu `.p-menuitem-text` convention, and the
     * confirm dialog's own Yes/No buttons (aria-label="Yes"/"No") match `confirmYesBtn`/
     * `confirmNoBtn` exactly. */
    async openUnmarkPremiumConfirmDialog(description: string) {
        console.log(`Opening Unmark Premium confirmation for "${description}"...`);
        await this.searchFor(description);
        const row = this.getRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menu = await this.openKebabMenuForRow(row);
        await this.clickElement(menu.locator(locators.deleteMenuItem).getByText(locators.buttonUnmarkPremium, { exact: true }));
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Confirms the open ConfirmDialog via its Yes button and waits for the app's own network
     * activity to settle, so whatever changed (e.g. Is Premium) has had a chance to take effect
     * before the caller checks it. */
    async clickYesOnConfirmDialog() {
        console.log('Clicking Yes on confirm dialog...');
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    /** Backs out of the open ConfirmDialog via its No button, leaving whatever it was asking
     * about (e.g. Is Premium) untouched. */
    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirm dialog...');
        await this.clickElement(this.confirmNoBtn);
        await this.confirmNoBtn.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Generic PrimeNG dropdown helper (same proven pattern as PrizeDrawPage/BetPromotionRulesPage)
    // ═══════════════════════════════════════════════════════════════════════

    private async openDropdown(dropdownLocator: Locator): Promise<Locator> {
        await this.clickElement(dropdownLocator);
        let panel = this.page.locator('.p-dropdown-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
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

    /** Region's real option names were never given — picks whichever renders first. */
    async selectFirstRegion(): Promise<string> {
        const panel = await this.openDropdown(this.regionDropdown);
        const option = panel.locator(locators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /** Opens the Region dropdown and selects the first rendered option whose text differs from
     * `excludeValue` — lets a test pick a genuinely different Region than whatever is already
     * selected (plain selectFirstRegion() would just re-pick the same option and look like a
     * no-op when editing). Region's own option list is virtualized (same convention as other
     * PrimeNG dropdowns in this app), so only options already in the viewport are in the DOM —
     * if none of those differs from `excludeValue` (e.g. only one Region exists, or the panel
     * only rendered the already-selected one), closes the panel and returns null rather than
     * guessing or forcing a scroll through an unconfirmed virtualization mechanism. */
    async selectDifferentRegion(excludeValue: string): Promise<string | null> {
        const panel = await this.openDropdown(this.regionDropdown);
        const options = panel.locator(locators.dropdownItem);
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (text && text !== excludeValue) {
                await options.nth(i).click();
                await this.page.waitForTimeout(300);
                return text;
            }
        }
        console.log(`No Region option other than "${excludeValue}" was available to select.`);
        await this.page.keyboard.press('Escape').catch(() => {});
        return null;
    }

    async getRegionValue(): Promise<string> {
        const label = this.regionDropdown.locator('.p-dropdown-label');
        const text = (await label.innerText({ timeout: 3000 }).catch(() => '')).trim();
        return text === 'Region *' ? '' : text;
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.dialog.locator(locators.validationError).count()) > 0;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Fields
    // ═══════════════════════════════════════════════════════════════════════

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    async getDescriptionValue(): Promise<string> {
        return (await this.descriptionInput.inputValue()).trim();
    }

    /** Confirmed live: Description's own error (e.g. "Field must be at most 255 characters long")
     * renders as a `<small class="p-error pure__error-message">` sibling inside the same
     * `div.pure__input-group` that wraps the input + label — only after attempting Save, not as
     * the field is typed into. Walking up to that wrapper scopes the lookup to Description's own
     * error specifically, rather than any other field's error elsewhere in the popup. */
    async getDescriptionErrorText(): Promise<string> {
        const errorLocator = this.descriptionInput
            .locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " pure__input-group ")][1]')
            .locator(locators.validationError);
        return (await errorLocator.textContent({ timeout: 3000 }).catch(() => ''))?.trim() ?? '';
    }

    /** Confirmed live (TC_LP_04/07/08/09/10): this Calendar also shows a time picker (hour/minute
     * spinners), so picking a day alone does NOT close its own "Choose Date" overlay — it stays
     * open waiting for the time to be confirmed too. That overlay is itself rendered as its own
     * `div[role="dialog"]`, so while it's open it becomes the element `this.dialog` ("last" dialog
     * on the page) resolves to, which silently breaks every OTHER field scoped off `this.dialog`
     * (End Date, Save, Cancel, etc. — whichever one is accessed next).
     *
     * CORRECTED after an actual run (TC_LP_15/16): the original fix here — force-clicking Save
     * unconditionally — is only safe while Save is still genuinely disabled (some other required
     * field not yet filled). Once every field is already filled (e.g. right after End Date, the
     * LAST field, is picked), Save is genuinely ENABLED, and force-clicking it doesn't just
     * dismiss the calendar — it performs a real submit right there, silently creating the
     * promotion before the test's own later `clickSave()` call ever runs. That later call then
     * hangs for the full default timeout waiting for a Save button whose dialog has already
     * closed, AND the created promotion never gets tracked for cleanup since the test crashes
     * before reaching its own `descriptionToCleanup = description` line.
     *
     * Checking Save's disabled state first (via a page-level, non-dialog-scoped lookup, since
     * `this.saveBtn` is itself broken while the calendar overlay is "last") and only force-
     * clicking it when it's still actually disabled avoids that. When Save is already enabled,
     * Escape closes the Calendar's own overlay (a standard PrimeNG Calendar keyboard interaction)
     * without touching Save at all, so nothing gets submitted early. */
    async dismissDatePicker() {
        const pageLevelSaveBtn = this.page.getByRole('button', { name: locators.buttonSave, exact: true }).first();
        const saveIsDisabled = await pageLevelSaveBtn.isDisabled({ timeout: 3000 }).catch(() => true);
        if (saveIsDisabled) {
            await pageLevelSaveBtn.click({ force: true }).catch(() => {});
        } else {
            console.log('Save is already enabled — using Escape (not Save) to dismiss the calendar, to avoid an early submit.');
            await this.page.keyboard.press('Escape').catch(() => {});
        }
        await this.page.waitForTimeout(300);
    }

    /** Confirmed live: both calendar inputs carry aria-controls="startDate_panel"/"endDate_panel" —
     * the same PrimeNG Calendar panel-id convention already confirmed and used by
     * TimedPromotionsPage.setDateRange. Picks the first available (enabled, current-month) day for
     * Start Date and the last available day for End Date, so the resulting range is always valid. */
    async setDateRange() {
        console.log('Setting Start Date / End Date via calendar panels...');

        await this.clickElement(this.startDateInput);
        const startPanel = this.page.locator('#startDate_panel');
        await startPanel.waitFor({ state: 'visible' });
        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(300);
        await this.dismissDatePicker();

        await this.clickElement(this.endDateInput);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });
        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(300);
        await this.dismissDatePicker();
    }

    async getStartDateValue(): Promise<string> {
        return (await this.startDateInput.inputValue()).trim();
    }

    async getEndDateValue(): Promise<string> {
        return (await this.endDateInput.inputValue()).trim();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Save / Cancel / toast
    // ═══════════════════════════════════════════════════════════════════════

    /** Confirmed live (TC_LP_04/05/07/10): required/max-length validation here disables the Save
     * button outright (a real, native `disabled` attribute) — BUT confirmed live by the user: a
     * real mouse click on that disabled Save button still reveals every field's inline error
     * (e.g. "Field must be at most 255 characters long" under Description), so some wrapper/
     * container around it — not the native button's own disabled click handler — marks the form
     * touched/submitted on click. `BasePage.clickElement` calls a plain (non-force) `.click()`,
     * which makes Playwright wait for "visible, enabled, stable" first — and a correctly-disabled
     * button never becomes enabled, hanging for the full default action timeout. Passing
     * `force: true` through skips that actionability wait entirely and dispatches the click
     * immediately regardless of the disabled state, matching the real click the user performed. */
    async clickSave() {
        console.log('Clicking Save...');
        await this.clickElement(this.saveBtn, { force: true });
        await this.page.waitForTimeout(300);
    }

    async clickCancel() {
        console.log('Clicking Cancel...');
        await this.clickElement(this.cancelBtn);
        await this.page.waitForTimeout(300);
    }
}
