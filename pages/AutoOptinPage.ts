import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { CommonUtils } from '../utils/commonUtils';
import { autoOptinLocators } from '../locators/autoOptinLocators';

export class AutoOptinPage extends BasePage {
    readonly createBtn: Locator;
    readonly searchInput: Locator;
    readonly autoOptInTable: Locator;

    readonly popupDialog: Locator;
    readonly nameInput: Locator;
    readonly regionDropdown: Locator;
    readonly actionDropdown: Locator;
    readonly campaignDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly triggerDropdown: Locator;

    readonly compCodeInput: Locator;
    readonly compValueInput: Locator;

    readonly minRequiredAmountInput: Locator;
    readonly oddsInput: Locator;
    readonly numberOfLegsInput: Locator;
    readonly feedDropdown: Locator;
    readonly sportDropdown: Locator;
    readonly leagueDropdown: Locator;
    readonly eventDropdown: Locator;
    readonly marketDropdown: Locator;
    readonly marketOutcomeDropdown: Locator;

    readonly providerNameDropdown: Locator;
    readonly gameNameDropdown: Locator;

    readonly enableDailyDeletionToggle: Locator;
    readonly enableTestingModeToggle: Locator;
    readonly applyToAllBetsToggle: Locator;
    readonly requiresSingleBetToggle: Locator;
    readonly isActiveToggle: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    readonly confirmDialogAccept: Locator;
    readonly confirmDialogReject: Locator;

    constructor(page: Page) {
        super(page);
        this.createBtn = page.locator(autoOptinLocators.createBtn);
        this.searchInput = page.locator(autoOptinLocators.searchInput);
        this.autoOptInTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.nameInput = page.locator(autoOptinLocators.inputName);
        this.regionDropdown = page.locator(autoOptinLocators.dropdownRegion);
        this.actionDropdown = page.locator(autoOptinLocators.dropdownAction);
        this.campaignDropdown = page.locator(autoOptinLocators.dropdownCampaign);
        this.startDateInput = page.locator(autoOptinLocators.calendarStartDate).locator('input');
        this.endDateInput = page.locator(autoOptinLocators.calendarEndDate).locator('input');
        this.triggerDropdown = page.locator(autoOptinLocators.dropdownTrigger);

        this.compCodeInput = page.locator(autoOptinLocators.inputCompCode);
        this.compValueInput = page.locator(autoOptinLocators.inputCompValue).locator('input');

        this.minRequiredAmountInput = page.locator(autoOptinLocators.inputMinRequiredAmount).locator('input');
        this.oddsInput = page.locator(autoOptinLocators.inputOdds).locator('input');
        this.numberOfLegsInput = page.locator(autoOptinLocators.inputNumberOfLegs).locator('input');
        this.feedDropdown = page.locator(autoOptinLocators.dropdownFeed);
        this.sportDropdown = page.locator(autoOptinLocators.dropdownSport);
        this.leagueDropdown = page.locator(autoOptinLocators.dropdownLeague);
        this.eventDropdown = page.locator(autoOptinLocators.dropdownEvent);
        this.marketDropdown = page.locator(autoOptinLocators.dropdownMarket);
        this.marketOutcomeDropdown = page.locator(autoOptinLocators.dropdownMarketOutcome);

        this.providerNameDropdown = page.locator(autoOptinLocators.dropdownProviderName);
        this.gameNameDropdown = page.locator(autoOptinLocators.dropdownGameName);

        this.enableDailyDeletionToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(autoOptinLocators.toggleEnableDailyDeletion) });
        this.enableTestingModeToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(autoOptinLocators.toggleEnableTestingMode) });
        this.applyToAllBetsToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(autoOptinLocators.toggleApplyToAllBets) });
        this.requiresSingleBetToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(autoOptinLocators.toggleRequiresSingleBet) });
        this.isActiveToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(autoOptinLocators.toggleIsActive) });

        this.saveBtn = page.getByRole('button', { name: autoOptinLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: autoOptinLocators.buttonCancel, exact: true });

        this.confirmDialogAccept = page.locator(autoOptinLocators.confirmDialogAccept);
        this.confirmDialogReject = page.locator(autoOptinLocators.confirmDialogReject);
    }

    // ─── Page-level actions ─────────────────────────────────────────────────────

    async clickCreateAutoOptIn() {
        console.log('Clicking Create Auto Opt-In button...');
        await this.clickElement(this.createBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    async searchAutoOptIn(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    getRowByName(name: string): Locator {
        return this.autoOptInTable.locator('tbody tr', { hasText: name }).first();
    }

    async isAutoOptInVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchAutoOptIn(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /** Actively waits for a deleted row to become hidden/detached rather than passively polling
     * "is it visible" for false — right after confirming a delete, the row can still briefly be
     * present while the backend delete + list refresh are in flight. */
    async isAutoOptInAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchAutoOptIn(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    /** Waits for the table's real data rows (excluding the "No Data Found"/empty-state
     * placeholder row PrimeNG renders as a genuine <tr>) to settle before counting. */
    async getRowCount(): Promise<number> {
        const dataRows = this.autoOptInTable.locator('tbody tr:not(.p-datatable-emptymessage)');
        try {
            await dataRows.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            return 0;
        }
        const deadline = Date.now() + 15000;
        let previousCount = -1;
        while (Date.now() < deadline) {
            const currentCount = await dataRows.count();
            if (currentCount === previousCount) return currentCount;
            previousCount = currentCount;
            await this.page.waitForTimeout(300);
        }
        return previousCount;
    }

    async clickDeleteForAutoOptIn(name: string) {
        console.log(`Clicking Delete for Auto Opt-In "${name}"...`);
        await this.searchAutoOptIn(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: autoOptinLocators.buttonDelete, exact: true }));
    }

    async clickEditForAutoOptIn(name: string) {
        console.log(`Clicking Edit for Auto Opt-In "${name}"...`);
        await this.searchAutoOptIn(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: autoOptinLocators.buttonEdit, exact: true }));
    }

    /** Reads the Active column's own read-only switch directly from the table row — distinct
     * from isActiveOn(), which reads the popup's editable "Is Active" toggle. */
    async isRowActiveByName(name: string): Promise<boolean> {
        await this.searchAutoOptIn(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const rowSwitch = row.locator('[role="switch"]').first();
        return (await rowSwitch.getAttribute('aria-checked')) === 'true';
    }

    async clickConfirmYes() {
        console.log('Clicking Yes on the delete confirmation dialog...');
        await this.clickElement(this.confirmDialogAccept);
    }

    /** Deletes an Auto Opt-In by name and waits for it to actually disappear. Swallows errors so
     * it's safe to call unconditionally from afterEach, even if the record was never created
     * (e.g. the test failed before Save) or was already removed. */
    async deleteAutoOptInIfPresent(name: string) {
        try {
            await this.clickDeleteForAutoOptIn(name);
            await this.confirmDialogAccept.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isAutoOptInAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup skipped for "${name}" (likely never created): ${error}`);
        }
    }

    // ─── Generic PrimeNG dropdown helpers ──────────────────────────────────────

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
     * environment/real data (Region, Campaign, Feed, Sport, League, etc.) and not safe to
     * hardcode. Returns the selected option's text. */
    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(autoOptinLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    /** Selects a specific option by its visible text — used for the small fixed enums (Auto
     * Opt-In Action, Auto Opt-In Trigger) whose values are known in advance. */
    async selectOptionByText(dropdownLocator: Locator, optionText: string) {
        await this.selectDropdown(dropdownLocator, optionText);
        await this.page.waitForTimeout(200);
    }

    /** Reads a dropdown's currently displayed value — empty string if nothing is selected
     * (PrimeNG renders an empty placeholder as a bare non-breaking space). */
    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const text = (await dropdownLocator.locator('.p-dropdown-label').innerText().catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    async isDropdownDisabled(dropdownLocator: Locator): Promise<boolean> {
        return (await dropdownLocator.getAttribute('data-p-disabled').catch(() => null)) === 'true';
    }

    /** Clears a dropdown's selection via its clear ("x") icon, if one is currently rendered
     * (PrimeNG only shows it once a value is selected on a clearable dropdown). */
    async clearDropdown(dropdownLocator: Locator) {
        const clearIcon = dropdownLocator.locator(autoOptinLocators.dropdownClearIcon);
        if (await clearIcon.count() > 0 && await clearIcon.first().isVisible().catch(() => false)) {
            await this.clickElement(clearIcon.first());
            await this.page.waitForTimeout(300);

            // Confirmed live: the clear icon's click can bubble up and also toggle the dropdown
            // itself open (same side-effect behavior seen elsewhere in this app), leaving its
            // option panel dangling on top of later clicks (e.g. Cancel). Close it back down.
            const strayPanel = this.page.locator('.p-dropdown-panel').last();
            if (await strayPanel.isVisible().catch(() => false)) {
                await dropdownLocator.click({ force: true }).catch(() => {});
                await this.page.waitForTimeout(300);
            }
        }
    }

    /**
     * Resolves a field's wrapper element (dropdown div / inputnumber span / calendar span) by
     * its floating <label>'s `for` attribute. Every field in this popup follows the
     * `<label for="X">Text</label>` + `<... id="X">` convention (confirmed for Region, Auto
     * Opt-In Action, Campaign, Feed Name, Sport, League), so this resolves fields whose exact
     * id wasn't directly confirmed (Event, Market, Market Outcome, Provider Name, Game Name)
     * without needing to guess it. Anchored match so e.g. "Sport" doesn't also match the
     * "Sport Wager Configuration" section heading (also a bare <label>, no `for` attribute).
     */
    async resolveFieldByLabel(labelText: string): Promise<Locator> {
        const label = this.popupDialog.locator('label').filter({ hasText: new RegExp(`^${labelText}\\s*\\*?$`) }).first();
        await label.waitFor({ state: 'visible', timeout: 10000 });
        const forId = await label.getAttribute('for');
        if (!forId) throw new Error(`Label "${labelText}" has no "for" attribute to resolve its field from`);
        return this.page.locator(`#${forId}`);
    }

    /** Checks whether a field is currently rendered in the popup, identified purely by its
     * floating label text — used to assert conditional field trees (Sport Wager / Casino Wager
     * / Casino Settlement / Trigger Comp Account) actually appear or disappear as expected. */
    async isFieldVisibleByLabel(labelText: string): Promise<boolean> {
        const label = this.popupDialog.locator('label').filter({ hasText: new RegExp(`^${labelText}\\s*\\*?$`) }).first();
        return await label.isVisible().catch(() => false);
    }

    // ─── Core fields ────────────────────────────────────────────────────────────

    async fillName(name: string) {
        console.log(`Filling Auto Opt-In Name: "${name}"...`);
        await this.fillInput(this.nameInput, name);
    }

    async selectFirstRegion(): Promise<string> {
        console.log('Selecting first available Region...');
        return this.selectFirstOption(this.regionDropdown);
    }

    /** Auto Opt-In Action's two options — confirmed live text is "Trigger Comp Account" (the
     * feature spec called it "Trigger Comp Amount", but the rendered dropdown option reads
     * "Trigger Comp Account" — using the confirmed live text here). */
    async selectAction(action: 'Trigger Workflow' | 'Trigger Comp Account') {
        console.log(`Selecting Auto Opt-In Action: "${action}"...`);
        await this.selectOptionByText(this.actionDropdown, action);
    }

    async getActionValue(): Promise<string> {
        return this.getDropdownValue(this.actionDropdown);
    }

    async selectFirstCampaign(): Promise<string> {
        console.log('Selecting first available Campaign...');
        return this.selectFirstOption(this.campaignDropdown);
    }

    /**
     * Picks the first enabled day in the Start Date calendar, then clicks the End Date field to
     * dismiss it — per confirmed instruction. That click also naturally focuses/opens the End
     * Date calendar next, which is expected since callers proceed straight to setEndDate().
     */
    async setStartDate() {
        console.log('Selecting Start Date...');
        await this.startDateInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#promotionStartDate_panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        await this.endDateInput.scrollIntoViewIfNeeded().catch(() => {});
        await this.endDateInput.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);

        // Fallback: with extra fields above (e.g. Trigger Comp Account's Comp Code/Comp Value)
        // pushing this section further down the dialog, the dismiss click above can land on the
        // wrong coordinate and leave this panel open — confirmed live, clicking a supposedly-safe
        // dialog header didn't help either. This calendar's overlay is a genuine aria-modal dialog
        // (showTime keeps it open after picking a day so the time can also be adjusted), unlike a
        // plain dropdown panel, so Escape correctly targets it as the innermost focused modal
        // instead of bubbling up to close the outer popup (the risk with plain dropdowns).
        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Picks the last enabled day in the End Date calendar (keeping it after Start Date), then
     * closes it via Escape. Confirmed live: dismissing via a click on the Trigger dropdown (a
     * separate field, below Start/End Date) could instead land on the Campaign dropdown (above
     * Start/End Date) once Comp Account's extra fields shift this section's on-screen position —
     * corrupting Campaign with a stray selection and even reopening Start Date's calendar as a
     * side effect. Escape avoids that entirely by closing the calendar (a genuine aria-modal
     * dialog) directly, without depending on any other field's position. Callers select the
     * Trigger dropdown explicitly afterward via selectTrigger(), as a clean, separate step.
     */
    async setEndDate() {
        console.log('Selecting End Date...');
        const panel = this.page.locator('#promotionEndDate_panel');
        if (!(await panel.isVisible().catch(() => false))) {
            await this.endDateInput.click();
            await this.page.waitForTimeout(300);
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async selectTrigger(trigger: 'Sport Wager' | 'Casino Wager' | 'Casino Settlement') {
        console.log(`Selecting Auto Opt-In Trigger: "${trigger}"...`);
        await this.selectOptionByText(this.triggerDropdown, trigger);
    }

    async getTriggerValue(): Promise<string> {
        return this.getDropdownValue(this.triggerDropdown);
    }

    // ─── Numeric field helper (shared by every PrimeVue InputNumber field below) ──

    /** PrimeVue InputNumber tracks its own internal value via keystroke events — a plain
     * locator.fill() sets the DOM value but leaves the component's internal state (and Save's
     * validity check) stuck invalid, so typing + blurring via Tab is required instead. */
    private async fillNumericField(field: Locator, value: string) {
        await field.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(field);
        await field.click({ clickCount: 3 });
        await field.pressSequentially(value);
        await field.press('Tab');
        await this.page.waitForTimeout(200);

        // Tab moves focus to whichever field is next in the DOM — for Comp Value specifically,
        // that's the Start Date calendar, which opens on focus alone (not just click). Left open,
        // it silently intercepts every later click. Close it here rather than leave it dangling.
        const strayCalendar = this.page.locator('#promotionStartDate_panel, #promotionEndDate_panel').first();
        if (await strayCalendar.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    // ─── Trigger Comp Account action fields ────────────────────────────────────

    async fillCompCode(code: string) {
        console.log(`Filling Comp Code: "${code}"...`);
        await this.fillInput(this.compCodeInput, code);
    }

    async fillCompValue(value: string) {
        console.log(`Filling Comp Value: "${value}"...`);
        await this.fillNumericField(this.compValueInput, value);
    }

    // ─── Sport Wager trigger fields ─────────────────────────────────────────────

    async fillMinRequiredAmount(value: string) {
        console.log(`Filling Minimum Required Amount: "${value}"...`);
        await this.fillNumericField(this.minRequiredAmountInput, value);
    }

    async fillOdds(value: string) {
        console.log(`Filling Odds: "${value}"...`);
        await this.fillNumericField(this.oddsInput, value);
    }

    async fillNumberOfLegs(value: string) {
        console.log(`Filling Number Of Legs: "${value}"...`);
        await this.fillNumericField(this.numberOfLegsInput, value);
    }

    async selectFirstFeed(): Promise<string> {
        console.log('Selecting first available Feed...');
        return this.selectFirstOption(this.feedDropdown);
    }

    async selectFirstSport(): Promise<string> {
        console.log('Selecting first available Sport...');
        return this.selectFirstOption(this.sportDropdown);
    }

    async selectFirstLeague(): Promise<string> {
        console.log('Selecting first available League...');
        return this.selectFirstOption(this.leagueDropdown);
    }

    async selectFirstEvent(): Promise<string> {
        console.log('Selecting first available Event...');
        return this.selectFirstOption(this.eventDropdown);
    }

    async selectFirstMarket(): Promise<string> {
        console.log('Selecting first available Market...');
        return this.selectFirstOption(this.marketDropdown);
    }

    async selectFirstMarketOutcome(): Promise<string> {
        console.log('Selecting first available Market Outcome...');
        return this.selectFirstOption(this.marketOutcomeDropdown);
    }

    async isSportEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.sportDropdown));
    }

    async isLeagueEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.leagueDropdown));
    }

    async isEventEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.eventDropdown));
    }

    async isMarketEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.marketDropdown));
    }

    async isMarketOutcomeEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.marketOutcomeDropdown));
    }

    async clearFeed() {
        console.log('Clearing Feed Name...');
        await this.clearDropdown(this.feedDropdown);
    }

    async clearSport() {
        console.log('Clearing Sport...');
        await this.clearDropdown(this.sportDropdown);
    }

    async clearLeague() {
        console.log('Clearing League...');
        await this.clearDropdown(this.leagueDropdown);
    }

    async clearEvent() {
        console.log('Clearing Event...');
        await this.clearDropdown(this.eventDropdown);
    }

    async clearMarket() {
        console.log('Clearing Market...');
        await this.clearDropdown(this.marketDropdown);
    }

    async getLeagueValue(): Promise<string> {
        return this.getDropdownValue(this.leagueDropdown);
    }

    async getEventValue(): Promise<string> {
        return this.getDropdownValue(this.eventDropdown);
    }

    async getMarketValue(): Promise<string> {
        return this.getDropdownValue(this.marketDropdown);
    }

    async getMarketOutcomeValue(): Promise<string> {
        return this.getDropdownValue(this.marketOutcomeDropdown);
    }

    // ─── Casino Wager / Casino Settlement trigger fields (shared shape) ────────
    // Confirmed live: the amount field here IS Sport Wager's "#minRequiredAmount" field, reused
    // verbatim (same id, same "Minimum Required Amount *" label) — not a separate field.

    async fillMaxRequiredAmount(value: string) {
        console.log(`Filling (shared) Minimum Required Amount for Casino trigger: "${value}"...`);
        await this.fillMinRequiredAmount(value);
    }

    async selectFirstProviderName(): Promise<string> {
        console.log('Selecting first available Provider Name...');
        return this.selectFirstOption(this.providerNameDropdown);
    }

    async selectFirstGameName(): Promise<string> {
        console.log('Selecting first available Game Name...');
        return this.selectFirstOption(this.gameNameDropdown);
    }

    async isGameNameEnabled(): Promise<boolean> {
        return !(await this.isDropdownDisabled(this.gameNameDropdown));
    }

    async clearProviderName() {
        console.log('Clearing Provider Name...');
        await this.clearDropdown(this.providerNameDropdown);
    }

    async getProviderNameValue(): Promise<string> {
        return this.getDropdownValue(this.providerNameDropdown);
    }

    async getGameNameValue(): Promise<string> {
        return this.getDropdownValue(this.gameNameDropdown);
    }

    // ─── Toggles ────────────────────────────────────────────────────────────────

    private async isToggleOn(toggleLocator: Locator): Promise<boolean> {
        return (await toggleLocator.getAttribute('aria-checked')) === 'true';
    }

    async toggleEnableDailyDeletion() {
        console.log('Toggling "Enable Automatic Daily Deletion"...');
        await this.clickElement(this.enableDailyDeletionToggle);
    }

    async isEnableDailyDeletionOn(): Promise<boolean> {
        return this.isToggleOn(this.enableDailyDeletionToggle);
    }

    async toggleEnableTestingMode() {
        console.log('Toggling "Enable Testing Mode"...');
        await this.clickElement(this.enableTestingModeToggle);
    }

    async isEnableTestingModeOn(): Promise<boolean> {
        return this.isToggleOn(this.enableTestingModeToggle);
    }

    async toggleApplyToAllBets() {
        console.log('Toggling "Does this Auto Opt-In apply to all bets"...');
        await this.clickElement(this.applyToAllBetsToggle);
    }

    async isApplyToAllBetsOn(): Promise<boolean> {
        return this.isToggleOn(this.applyToAllBetsToggle);
    }

    async toggleRequiresSingleBet() {
        console.log('Toggling "Does this Auto Opt-In config require a Single Bet"...');
        await this.clickElement(this.requiresSingleBetToggle);
    }

    async isRequiresSingleBetOn(): Promise<boolean> {
        return this.isToggleOn(this.requiresSingleBetToggle);
    }

    async toggleIsActive() {
        console.log('Toggling "Is Active"...');
        await this.clickElement(this.isActiveToggle);
    }

    async isActiveOn(): Promise<boolean> {
        return this.isToggleOn(this.isActiveToggle);
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Create Auto Opt-In popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create Auto Opt-In popup...');
        await this.clickElement(this.cancelBtn);
    }
}
