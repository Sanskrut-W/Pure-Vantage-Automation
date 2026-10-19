import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { rulesEngineLocators } from '../locators/rulesEngineLocators';

export class RulesEnginePage extends BasePage {
    readonly createRuleBtn: Locator;

    // ─── Step 1: Basics ──────────────────────────────────────────────────────
    readonly descriptionInput: Locator;
    readonly regionDropdown: Locator;
    readonly campaignDropdown: Locator;
    readonly actionDropdown: Locator;

    // ─── Step 2: Qualification ───────────────────────────────────────────────
    readonly requiredAmountInput: Locator;
    readonly eligibilityFrequencyDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly isFirstQualifyingAmountCheckbox: Locator;
    readonly multiAwardCheckbox: Locator;

    // ─── Step 3: Rules ────────────────────────────────────────────────────────
    readonly addGroupBtn: Locator;
    readonly groupDescriptionInput: Locator;
    readonly groupOperatorDropdown: Locator;

    readonly addSportBtn: Locator;
    readonly betSlipTypeDropdown: Locator;
    readonly settlementFilterDropdown: Locator;
    readonly feedNameDropdown: Locator;
    readonly sportDropdown: Locator;
    readonly leagueInput: Locator;
    readonly countryInput: Locator;
    readonly eventInput: Locator;
    readonly marketInput: Locator;
    readonly outcomeInput: Locator;
    readonly bookingCodeInput: Locator;
    readonly minimumWagerAmountInput: Locator;
    readonly minimumBetslipOddsMultiplierInput: Locator;
    readonly minimumLegsRequiredInput: Locator;
    readonly minimumLegOddsMultiplierInput: Locator;
    readonly applyOddsAndMultiplierToLegsInTotalCheckbox: Locator;
    readonly applyRuleToAllBetsCheckbox: Locator;
    readonly isSingleLegOnlyCheckbox: Locator;
    readonly isBuildABetCheckbox: Locator;

    readonly addCasinoBtn: Locator;
    readonly casinoProviderDropdown: Locator;
    readonly casinoGameDropdown: Locator;
    readonly casinoCategoryInput: Locator;
    readonly casinoMinimumWagerAmountInput: Locator;
    readonly casinoMinimumMultiplierAmountInput: Locator;

    readonly addDepositBtn: Locator;
    readonly depositMinimumDepositAmountInput: Locator;
    readonly depositPaymentMethodDropdown: Locator;

    // Confirmed live: the active Group's conditions render as 3 sibling cards, each with its own
    // saved-rows <table> (Edit/Delete per row).
    readonly selectedGroupLabel: Locator;
    readonly sportConditionCard: Locator;
    readonly casinoConditionCard: Locator;
    readonly depositConditionCard: Locator;

    // ─── Step 4: Schedule ─────────────────────────────────────────────────────
    readonly addRecurringFrequencyBtn: Locator;
    readonly scheduleStartTimeInput: Locator;
    readonly scheduleDurationInput: Locator;
    readonly scheduleSummaryText: Locator;

    // ─── Step 5: Review ───────────────────────────────────────────────────────
    // Confirmed live: the captured Review step's action row shows ONLY "Back" and "Back to list"
    // — no "Activate" button was present despite the user's functional description of one. This
    // locator is kept for completeness but tests must NOT assume it's visible.
    readonly activateBtn: Locator;
    readonly backToListBtn: Locator;
    readonly reviewStatusBanner: Locator;
    readonly reviewPanels: Locator;

    // ─── Shared across every step/popup ──────────────────────────────────────
    readonly nextBtn: Locator;
    readonly backBtn: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    // Confirmed live: a real <table> under <main>, same convention as every other "Create X" list
    // page in this app (Leaderboard/Streaks/Periods/Segment Schedule) EXCEPT Manage Configurations,
    // which is the one outlier using cards — ASSUMED here since no outerHTML of this specific list
    // page was captured. If it turns out to be cards instead, getRuleRowByDescription needs
    // re-pointing the same way leaderboardLocators' Configuration support was.
    readonly rulesTable: Locator;

    constructor(page: Page) {
        super(page);

        this.createRuleBtn = page.getByRole('button', { name: rulesEngineLocators.buttonCreateRule, exact: true });

        this.descriptionInput = page.locator(rulesEngineLocators.inputDescription);
        this.regionDropdown = page.locator(rulesEngineLocators.dropdownRegion);
        this.campaignDropdown = page.locator(rulesEngineLocators.dropdownCampaign);
        this.actionDropdown = page.locator(rulesEngineLocators.dropdownAction);

        this.requiredAmountInput = page.locator(rulesEngineLocators.inputRequiredAmount);
        this.eligibilityFrequencyDropdown = page.locator(rulesEngineLocators.dropdownEligibilityFrequency);
        this.startDateInput = page.locator(rulesEngineLocators.calendarStartDate);
        this.endDateInput = page.locator(rulesEngineLocators.calendarEndDate);
        this.isFirstQualifyingAmountCheckbox = page.locator(rulesEngineLocators.checkboxIsFirstQualifyingAmount);
        this.multiAwardCheckbox = page.locator(rulesEngineLocators.checkboxMultiAward);

        // Confirmed live: TWO "Add group" buttons render simultaneously while the Rule groups
        // list is empty — one in the panel header, one in the "Create your first rule group"
        // empty-state card. Both open the identical popup, so .first() is a safe, functional pick.
        this.addGroupBtn = page.getByRole('button', { name: rulesEngineLocators.buttonAddGroup, exact: true }).first();
        // Confirmed live: #groupOperator resolves to 2 elements on the page at once (one inside
        // this dialog, one elsewhere in #feed-processor-editor-react) — scoping both fields to
        // the "Create Group" dialog itself (confirmed live as its own aria-label) avoids the
        // strict-mode violation regardless of what that other stray element actually is.
        const createGroupDialog = page.getByRole('dialog', { name: 'Create Group' });
        this.groupDescriptionInput = createGroupDialog.locator(rulesEngineLocators.inputGroupDescription);
        this.groupOperatorDropdown = createGroupDialog.locator(rulesEngineLocators.dropdownGroupOperator);

        this.addSportBtn = page.getByRole('button', { name: rulesEngineLocators.buttonAddSport, exact: true });
        // Confirmed live (TC_RE_026-032): #event (and by the same pattern, likely #league/#market/
        // #outcome) resolves to 2 elements on the page at once — same "#id also exists elsewhere in
        // #feed-processor-editor-react" duplicate-id bug already confirmed once for #groupOperator.
        // A bare page.locator(...) occasionally waited the full actionTimeout for the WRONG (hidden)
        // match to become visible. Scoping every field to the "Create Sport Condition" dialog itself
        // (confirmed live as its own aria role/name in every captured snapshot) avoids this the same
        // way the Create Group dialog scoping did.
        // Confirmed live (TC_RE_035b): the identical popup is titled "Edit Sport Condition" instead
        // of "Create Sport Condition" when opened via a row's Edit button — a plain string match on
        // just the Create title left every field locator unable to find the dialog at all when
        // editing, so match either title.
        const createSportDialog = page.getByRole('dialog', { name: /^(Create|Edit) Sport Condition$/ });
        this.betSlipTypeDropdown = createSportDialog.locator(rulesEngineLocators.dropdownBetSlipType);
        this.settlementFilterDropdown = createSportDialog.locator(rulesEngineLocators.dropdownSettlementFilter);
        this.feedNameDropdown = createSportDialog.locator(rulesEngineLocators.dropdownFeedName);
        this.sportDropdown = createSportDialog.locator(rulesEngineLocators.dropdownSport);
        this.leagueInput = createSportDialog.locator(rulesEngineLocators.inputLeague);
        this.countryInput = createSportDialog.locator(rulesEngineLocators.inputCountry);
        this.eventInput = createSportDialog.locator(rulesEngineLocators.inputEvent);
        this.marketInput = createSportDialog.locator(rulesEngineLocators.inputMarket);
        this.outcomeInput = createSportDialog.locator(rulesEngineLocators.inputOutcome);
        this.bookingCodeInput = createSportDialog.locator(rulesEngineLocators.inputBookingCode);
        this.minimumWagerAmountInput = createSportDialog.locator(rulesEngineLocators.inputMinimumWagerAmount);
        this.minimumBetslipOddsMultiplierInput = createSportDialog.locator(rulesEngineLocators.inputMinimumBetslipOddsMultiplier);
        this.minimumLegsRequiredInput = createSportDialog.locator(rulesEngineLocators.inputMinimumLegsRequired);
        this.minimumLegOddsMultiplierInput = createSportDialog.locator(rulesEngineLocators.inputMinimumLegOddsMultiplier);
        this.applyOddsAndMultiplierToLegsInTotalCheckbox = createSportDialog.locator(rulesEngineLocators.checkboxApplyOddsAndMultiplierToLegsInTotal);
        this.applyRuleToAllBetsCheckbox = createSportDialog.locator(rulesEngineLocators.checkboxApplyRuleToAllBets);
        this.isSingleLegOnlyCheckbox = createSportDialog.locator(rulesEngineLocators.checkboxIsSingleLegOnly);
        this.isBuildABetCheckbox = createSportDialog.locator(rulesEngineLocators.checkboxIsBuildABet);

        this.addCasinoBtn = page.getByRole('button', { name: rulesEngineLocators.buttonAddCasino, exact: true });
        this.casinoProviderDropdown = page.locator(rulesEngineLocators.dropdownCasinoProvider);
        this.casinoGameDropdown = page.locator(rulesEngineLocators.dropdownCasinoGame);
        this.casinoCategoryInput = page.locator(rulesEngineLocators.inputCasinoCategory);
        this.casinoMinimumWagerAmountInput = page.locator(rulesEngineLocators.inputCasinoMinimumWagerAmount);
        this.casinoMinimumMultiplierAmountInput = page.locator(rulesEngineLocators.inputCasinoMinimumMultiplierAmount);

        this.addDepositBtn = page.getByRole('button', { name: rulesEngineLocators.buttonAddDeposit, exact: true });
        this.depositMinimumDepositAmountInput = page.locator(rulesEngineLocators.inputMinimumDepositAmount);
        this.depositPaymentMethodDropdown = page.locator(rulesEngineLocators.dropdownRequiredPaymentMethod);

        this.selectedGroupLabel = page.locator(rulesEngineLocators.selectedGroupLabel);
        this.sportConditionCard = page.locator(rulesEngineLocators.sportConditionCard);
        this.casinoConditionCard = page.locator(rulesEngineLocators.casinoConditionCard);
        this.depositConditionCard = page.locator(rulesEngineLocators.depositConditionCard);

        this.addRecurringFrequencyBtn = page.getByRole('button', { name: rulesEngineLocators.buttonAddRecurringFrequency, exact: true });
        this.scheduleStartTimeInput = page.locator(rulesEngineLocators.inputStartTime);
        this.scheduleDurationInput = page.locator(rulesEngineLocators.inputDurationHours);
        this.scheduleSummaryText = page.locator(rulesEngineLocators.scheduleSummaryText);

        this.activateBtn = page.getByRole('button', { name: rulesEngineLocators.buttonActivate, exact: true });
        this.backToListBtn = page.getByRole('button', { name: rulesEngineLocators.buttonBackToList, exact: true });
        this.reviewStatusBanner = page.locator(rulesEngineLocators.reviewStatusBanner);
        this.reviewPanels = page.locator(rulesEngineLocators.reviewPanel);

        this.nextBtn = page.getByRole('button', { name: rulesEngineLocators.buttonNext, exact: true });
        this.backBtn = page.getByRole('button', { name: rulesEngineLocators.buttonBack, exact: true });
        this.saveBtn = page.getByRole('button', { name: rulesEngineLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: rulesEngineLocators.buttonCancel, exact: true });
        this.editBtn = page.getByRole('button', { name: rulesEngineLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: rulesEngineLocators.buttonDelete, exact: true });
        this.confirmYesBtn = page.getByRole('button', { name: rulesEngineLocators.buttonConfirmYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: rulesEngineLocators.buttonConfirmNo, exact: true });

        this.rulesTable = page.locator('main table').first();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  List page / navigation
    // ═══════════════════════════════════════════════════════════════════════

    async clickCreateRule() {
        console.log('Clicking Create Rule button...');
        await this.clickElement(this.createRuleBtn);
        await this.descriptionInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    getRuleRowByDescription(description: string): Locator {
        return this.rulesTable.locator('tbody tr', { hasText: description }).first();
    }

    async isRuleVisibleByDescription(description: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getRuleRowByDescription(description);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isRuleAbsentByDescription(description: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getRuleRowByDescription(description);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    /** Confirmed live: the list row has no inline Edit/Delete buttons (unlike the saved Sport/
     * Casino/Deposit condition rows) — its own actions are behind a kebab "..." menu, same
     * convention as the Leaderboard list's own row menu. */
    async clickRowMenuForRule(description: string) {
        console.log(`Opening the "..." menu for Rule "${description}"...`);
        const row = this.getRuleRowByDescription(description);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(rulesEngineLocators.ruleRowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickDeleteFromRuleRowMenu() {
        console.log('Clicking Delete from the Rule row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(rulesEngineLocators.menuItemDeleteRule, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickDeleteForRule(description: string) {
        await this.clickRowMenuForRule(description);
        await this.clickDeleteFromRuleRowMenu();
    }

    // Confirmed live (user-supplied outerHTML): the same kebab menu also offers Open/Clone/
    // Activate (or Deactivate once Active) — same ".p-menu, .p-tieredmenu" text-lookup convention
    // as Delete above.
    async clickOpenFromRuleRowMenu() {
        console.log('Clicking Open from the Rule row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(rulesEngineLocators.menuItemOpenRule, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickCloneFromRuleRowMenu() {
        console.log('Clicking Clone from the Rule row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(rulesEngineLocators.menuItemCloneRule, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickActivateFromRuleRowMenu() {
        console.log('Clicking Activate from the Rule row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(rulesEngineLocators.menuItemActivateRule, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickDeactivateFromRuleRowMenu() {
        console.log('Clicking Deactivate from the Rule row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(rulesEngineLocators.menuItemDeactivateRule, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickOpenForRule(description: string) {
        await this.clickRowMenuForRule(description);
        await this.clickOpenFromRuleRowMenu();
    }

    async clickCloneForRule(description: string) {
        await this.clickRowMenuForRule(description);
        await this.clickCloneFromRuleRowMenu();
    }

    async clickActivateForRule(description: string) {
        await this.clickRowMenuForRule(description);
        await this.clickActivateFromRuleRowMenu();
    }

    async clickDeactivateForRule(description: string) {
        await this.clickRowMenuForRule(description);
        await this.clickDeactivateFromRuleRowMenu();
    }

    // Confirmed live (user-supplied outerHTML): Clone opens its own Save/Cancel dialog — distinct
    // from the app's generic Yes/No confirmation used by Activate/Deactivate/Delete. Scoped to the
    // most recently opened dialog, same ".last()" convention already used for dropdown panels.
    async confirmCloneDialog() {
        console.log('Confirming the Clone dialog (Save)...');
        const dialog = this.page.locator('.p-dialog').last();
        await this.clickElement(dialog.getByRole('button', { name: rulesEngineLocators.buttonSave, exact: true }));
    }

    async cancelCloneDialog() {
        console.log('Cancelling the Clone dialog...');
        const dialog = this.page.locator('.p-dialog').last();
        await this.clickElement(dialog.getByRole('button', { name: rulesEngineLocators.buttonCancel, exact: true }));
    }

    /** Deletes a Rule by its Description via the Yes/No confirmation, waiting for it to actually
     * disappear. Swallows errors so it's safe to call unconditionally from afterEach, even if no
     * Rule was ever created (e.g. the test failed before reaching "Back to list") or it was
     * already removed. */
    async deleteRuleIfPresent(description: string) {
        try {
            const isPresent = await this.isRuleVisibleByDescription(description, 5000);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for Rule "${description}" — row not present.`);
                return;
            }
            await this.clickDeleteForRule(description);
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickElement(this.confirmYesBtn);
            await this.isRuleAbsentByDescription(description, 15000);
        } catch (error) {
            console.log(`Delete cleanup failed for Rule "${description}": ${error}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Generic PrimeNG dropdown helpers (same proven pattern as LeaderboardPage)
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
     * data (Region, Campaign, Feed Name, Sport, etc.) and not safe to hardcode. Returns the
     * selected option's text. */
    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(rulesEngineLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    // Confirmed live (TC_RE_031/032): clearing Sport/Feed Name cascades League/Event/Market/
    // Outcome back toward plain-input mode (no .p-dropdown-label to read), not just an empty
    // dropdown — the previous version had no timeout override, so each call silently burned the
    // full 120s actionTimeout before its .catch() rescued it. Bounding both attempts to a few
    // seconds, plus falling back to reading a plain input's value, fixes the multi-minute hang.
    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const label = dropdownLocator.locator('.p-dropdown-label');
        const text = (await label.innerText({ timeout: 3000 }).catch(() => '')).trim();
        if (text) return text === ' ' ? '' : text;
        return (await dropdownLocator.inputValue({ timeout: 3000 }).catch(() => '')).trim();
    }

    async hasValidationErrors(): Promise<boolean> {
        return (await this.page.locator(rulesEngineLocators.validationError).count()) > 0;
    }

    /** Locates a control (p-dropdown div, plain input, p-inputnumber span, or p-checkbox div) by
     * its adjacent `<label>` text — this app's universal float-label/checkbox-label structure,
     * confirmed live across every Basics/Qualification/Group/Sport field, used here ONLY for the
     * "Combine groups with" dropdown and the Casino/Deposit/Schedule popups, whose own ids were
     * never captured live. Prefer the direct #id locators above wherever one is confirmed. */
    getDropdownByLabel(labelText: string): Locator {
        return this.page.locator(`div.p-dropdown:has(+ label:text-is("${labelText}"))`).first();
    }

    getPlainInputByLabel(labelText: string): Locator {
        return this.page.locator(`input.p-inputtext:has(+ label:text-is("${labelText}"))`).first();
    }

    getNumberInputByLabel(labelText: string): Locator {
        return this.page.locator(`span.p-inputnumber:has(+ label:text-is("${labelText}"))`).first().locator('input');
    }

    getCheckboxByLabel(labelText: string): Locator {
        return this.page.locator(`div.p-checkbox:has(+ label:text-is("${labelText}"))`).first();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Checkbox helper (PrimeNG p-checkbox — confirmed live convention elsewhere in this app:
    //  click the visible .p-checkbox-box with force:true; read state off the native input)
    // ═══════════════════════════════════════════════════════════════════════

    async isCheckboxChecked(checkbox: Locator): Promise<boolean> {
        return await checkbox.locator('input[type="checkbox"]').isChecked();
    }

    async clickCheckbox(checkbox: Locator) {
        await checkbox.locator('.p-checkbox-box').click({ force: true });
        await this.page.waitForTimeout(200);
    }

    // Min Wager/Odds Multiplier/Legs fields are p-inputnumber — same proven keystroke-tracking
    // convention used elsewhere in this app (plain .fill() doesn't register with InputNumber).
    private async fillNumericField(field: Locator, value: string) {
        await field.waitFor({ state: 'visible' });
        await field.click({ clickCount: 3 });
        await field.pressSequentially(value);
        await field.press('Tab');
        await this.page.waitForTimeout(200);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 1: Basics
    // ═══════════════════════════════════════════════════════════════════════

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    async getDescriptionValue(): Promise<string> {
        return await this.descriptionInput.inputValue();
    }

    async selectFirstRegion(): Promise<string> {
        return this.selectFirstOption(this.regionDropdown);
    }

    /** Confirmed live: Campaign stays disabled until Region is selected — same dependency
     * pattern as Sport's Sport-disabled-until-Feed-Name and Casino's Game-disabled-until-Provider.
     * Confirmed live the enablement can lag slightly behind the Region selection itself (e.g. the
     * app may fetch that Region's own Campaign list), so this polls for "not disabled" (up to 10s)
     * before opening it, rather than assuming it's already enabled the instant Region is clicked. */
    async selectFirstCampaign(): Promise<string> {
        const deadline = Date.now() + 10000;
        while (await this.isCampaignDropdownDisabled() && Date.now() < deadline) {
            await this.page.waitForTimeout(200);
        }
        // Confirmed live (via outerHTML): data-p-disabled flips to "false" BEFORE the Campaign
        // options themselves finish loading — opening the dropdown immediately clicks into a
        // still-empty list and no panel renders. Give the options list a few seconds to actually
        // populate before attempting to open it.
        await this.page.waitForTimeout(3000);
        return this.selectFirstOption(this.campaignDropdown);
    }

    async isCampaignDropdownDisabled(): Promise<boolean> {
        return (await this.campaignDropdown.getAttribute('data-p-disabled')) === 'true';
    }

    /** Confirmed live (TC_RE_022 failure): at least one Region option has NO Campaigns of its
     * own, so Campaign never leaves data-p-disabled="true" no matter how long you wait — picking
     * "the first Region" can land on that dead end. This tries each Region option in turn until
     * one actually enables the Campaign dropdown, instead of assuming the first option works. */
    async selectRegionWithCampaign(): Promise<{ region: string; campaign: string }> {
        const firstPanel = await this.openDropdown(this.regionDropdown);
        const regionCount = await firstPanel.locator(rulesEngineLocators.dropdownItem).count();

        for (let i = 0; i < regionCount; i++) {
            const panel = i === 0 ? firstPanel : await this.openDropdown(this.regionDropdown);
            const option = panel.locator(rulesEngineLocators.dropdownItem).nth(i);
            const regionText = (await option.textContent())?.trim() ?? '';
            await option.click();
            await this.page.waitForTimeout(200);

            // Confirmed live: this environment only has ONE Region option, so the retry-another-
            // Region loop below never actually gets a second chance — the real issue is simply
            // that the Campaign list can take a while to load, so this needs to wait as long as
            // the original single-Region polling did (10s), not a shorter per-attempt slice.
            const deadline = Date.now() + 10000;
            while (await this.isCampaignDropdownDisabled() && Date.now() < deadline) {
                await this.page.waitForTimeout(200);
            }
            if (!(await this.isCampaignDropdownDisabled())) {
                // Confirmed live (via outerHTML): data-p-disabled flips to "false" BEFORE the
                // Campaign options themselves finish loading — opening the dropdown immediately
                // clicks into a still-empty list and no panel renders. Give the options list a
                // few seconds to actually populate before attempting to open it.
                await this.page.waitForTimeout(3000);
                const campaignText = await this.selectFirstOption(this.campaignDropdown);
                return { region: regionText, campaign: campaignText };
            }
            console.log(`Region "${regionText}" has no enabled Campaign — trying the next Region option...`);
        }
        throw new Error('None of the available Region options enabled the Campaign dropdown');
    }

    async selectFirstAction(): Promise<string> {
        return this.selectFirstOption(this.actionDropdown);
    }

    async clickNext() {
        console.log('Clicking Next...');
        await this.clickElement(this.nextBtn);
        await this.page.waitForTimeout(300);
    }

    async clickBack() {
        console.log('Clicking Back...');
        await this.clickElement(this.backBtn);
        await this.page.waitForTimeout(300);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 2: Qualification
    // ═══════════════════════════════════════════════════════════════════════

    async fillRequiredAmount(value: string) {
        console.log(`Filling Required Amount: "${value}"...`);
        await this.fillNumericField(this.requiredAmountInput, value);
    }

    async getRequiredAmountValue(): Promise<string> {
        return (await this.requiredAmountInput.inputValue()).trim();
    }

    async selectEligibilityFrequency(optionText: string) {
        await this.selectDropdown(this.eligibilityFrequencyDropdown, optionText);
    }

    async selectFirstEligibilityFrequencyExceptRecurring(): Promise<string> {
        const panel = await this.openDropdown(this.eligibilityFrequencyDropdown);
        const options = panel.locator(rulesEngineLocators.dropdownItem);
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (text && text !== rulesEngineLocators.eligibilityFrequencyRecurringOption) {
                await options.nth(i).click();
                await this.page.waitForTimeout(200);
                return text;
            }
        }
        throw new Error('Expected at least one non-Recurring Eligibility Frequency option');
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

    async setStartDate() {
        console.log('Selecting Start Date (today)...');
        await this.setDateField(this.startDateInput);
    }

    async setEndDate() {
        console.log('Selecting End Date (today)...');
        await this.setDateField(this.endDateInput);
    }

    async toggleIsFirstQualifyingAmount() {
        await this.clickCheckbox(this.isFirstQualifyingAmountCheckbox);
    }

    async toggleMultiAward() {
        await this.clickCheckbox(this.multiAwardCheckbox);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 3: Rules — groups
    // ═══════════════════════════════════════════════════════════════════════

    get combineGroupsWithDropdown(): Locator {
        return this.getDropdownByLabel(rulesEngineLocators.labelCombineGroupsWith);
    }

    // Confirmed live: the options render as "And"/"Or" (same title-case text as Group Operator),
    // not "AND"/"OR" as originally assumed.
    async selectCombineGroupsWith(optionText: 'And' | 'Or') {
        await this.selectDropdown(this.combineGroupsWithDropdown, optionText);
    }

    async clickAddGroup() {
        console.log('Clicking Add group button...');
        await this.clickElement(this.addGroupBtn);
        await this.groupDescriptionInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async fillGroupDescription(value: string) {
        await this.fillInput(this.groupDescriptionInput, value);
    }

    async selectGroupOperator(optionText: 'And' | 'Or') {
        await this.selectDropdown(this.groupOperatorDropdown, optionText);
    }

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

    async clickConfirmYes() {
        console.log('Clicking Yes on the confirmation modal...');
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForTimeout(300);
    }

    /** Creates a Group via the Add group popup. Returns nothing — ASSUMED (not confirmed live)
     * that the saved group then renders somewhere identifiable by its Description text; if group
     * cards turn out to use different markup, isGroupVisibleByDescription needs the real HTML. */
    async createGroup(description: string, operator: 'And' | 'Or' = 'And') {
        await this.clickAddGroup();
        await this.fillGroupDescription(description);
        await this.selectGroupOperator(operator);
        await this.clickSave();
    }

    /** Same `.p-toast-message` / `.p-toast-message-text` convention confirmed live elsewhere in
     * this app (CompAlertsPage, CompsBulkPage, LapseCompPage, etc.) — reused here, not guessed
     * fresh, since Rules Engine's own toast markup hasn't been captured yet. Returns '' if no
     * toast appears within the timeout (never throws), so it's safe to call for diagnostics. */
    async getToastText(timeout: number = 10000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }

    /** Confirmed live: the active Group's name renders as "Editing conditions for **{name}**". */
    async isGroupVisibleByDescription(description: string, timeout: number = 10000): Promise<boolean> {
        return await this.selectedGroupLabel.filter({ hasText: description }).first()
            .waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 3: Rules — Sport Conditions
    // ═══════════════════════════════════════════════════════════════════════

    async clickAddSport() {
        console.log('Clicking Add sport button...');
        await this.clickElement(this.addSportBtn);
        await this.betSlipTypeDropdown.waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectFirstBetSlipType(): Promise<string> {
        return this.selectFirstOption(this.betSlipTypeDropdown);
    }

    async selectFirstSettlementFilter(): Promise<string> {
        return this.selectFirstOption(this.settlementFilterDropdown);
    }

    async selectFirstFeedName(): Promise<string> {
        return this.selectFirstOption(this.feedNameDropdown);
    }

    async selectFirstSport(): Promise<string> {
        return this.selectFirstOption(this.sportDropdown);
    }

    async isSportDropdownDisabled(): Promise<boolean> {
        return (await this.sportDropdown.getAttribute('data-p-disabled')) === 'true';
    }

    // Confirmed live: League/Event/Market/Outcome are plain fillable text inputs ONLY until
    // Feed Name + Sport are both selected — at that point they turn into PrimeNG p-dropdowns
    // (same #id, different element) with a real League -> Event -> Market -> Outcome enable
    // chain, each one disabled (data-p-disabled="true") until the previous one has a value.
    // These fill* methods are for the plain-text state only (before Feed Name/Sport exist).
    async fillLeague(value: string) {
        await this.fillInput(this.leagueInput, value);
    }

    async fillCountry(value: string) {
        await this.fillInput(this.countryInput, value);
    }

    async fillEvent(value: string) {
        await this.fillInput(this.eventInput, value);
    }

    async fillMarket(value: string) {
        await this.fillInput(this.marketInput, value);
    }

    async fillOutcome(value: string) {
        await this.fillInput(this.outcomeInput, value);
    }

    async fillBookingCode(value: string) {
        await this.fillInput(this.bookingCodeInput, value);
    }

    // Confirmed live: a plain .fill('') only fires an `input` event, which this app's
    // cascade-clear listener doesn't react to — same reason fillNumericField elsewhere presses
    // Tab after typing. Only relevant in the plain-text state (see fillLeague's comment above).
    async clearLeague() {
        await this.leagueInput.fill('');
        await this.leagueInput.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async clearEvent() {
        await this.eventInput.fill('');
        await this.eventInput.press('Tab');
        await this.page.waitForTimeout(200);
    }

    async clearMarket() {
        await this.marketInput.fill('');
        await this.marketInput.press('Tab');
        await this.page.waitForTimeout(200);
    }

    // ─── Dropdown-mode equivalents — ONLY valid after Feed Name + Sport are both selected,
    // at which point League/Event/Market/Outcome become p-dropdowns (see comment above). ───

    async selectFirstLeague(): Promise<string> {
        return this.selectFirstOption(this.leagueInput);
    }

    // Confirmed live: same lag as Campaign (Basics step) — Country's options take a few seconds
    // to actually load after League is selected, even though the field itself may already look
    // enabled. The real chain is League -> Country -> Event -> Market -> Outcome.
    async selectFirstCountry(): Promise<string> {
        await this.page.waitForTimeout(3000);
        return this.selectFirstOption(this.countryInput);
    }

    async selectFirstEvent(): Promise<string> {
        return this.selectFirstOption(this.eventInput);
    }

    async selectFirstMarket(): Promise<string> {
        return this.selectFirstOption(this.marketInput);
    }

    async selectFirstOutcome(): Promise<string> {
        return this.selectFirstOption(this.outcomeInput);
    }

    // Confirmed live (same .p-dropdown-clear-icon convention already proven for Sport/Feed Name
    // in TC_RE_031/032) — clears a dropdown-mode field via its own clear icon.
    async clearLeagueViaDropdown() {
        await this.leagueInput.locator('.p-dropdown-clear-icon').click();
        await this.page.waitForTimeout(300);
    }

    async clearEventViaDropdown() {
        await this.eventInput.locator('.p-dropdown-clear-icon').click();
        await this.page.waitForTimeout(300);
    }

    async clearMarketViaDropdown() {
        await this.marketInput.locator('.p-dropdown-clear-icon').click();
        await this.page.waitForTimeout(300);
    }

    // Confirmed live: in dropdown mode these fields signal disabled via the data-p-disabled
    // attribute (same convention as isSportDropdownDisabled/isCampaignDropdownDisabled), NOT
    // the native `disabled` attribute .isDisabled() checks — which never matches a <div>, so it
    // always read "not disabled" regardless of actual state.
    async isEventFieldDisabled(): Promise<boolean> {
        return (await this.eventInput.getAttribute('data-p-disabled')) === 'true';
    }

    async isMarketFieldDisabled(): Promise<boolean> {
        return (await this.marketInput.getAttribute('data-p-disabled')) === 'true';
    }

    async isOutcomeFieldDisabled(): Promise<boolean> {
        return (await this.outcomeInput.getAttribute('data-p-disabled')) === 'true';
    }

    async fillMinimumWagerAmount(value: string) {
        await this.fillNumericField(this.minimumWagerAmountInput, value);
    }

    async fillMinimumBetslipOddsMultiplier(value: string) {
        await this.fillNumericField(this.minimumBetslipOddsMultiplierInput, value);
    }

    async fillMinimumLegsRequired(value: string) {
        await this.fillNumericField(this.minimumLegsRequiredInput, value);
    }

    async fillMinimumLegOddsMultiplier(value: string) {
        await this.fillNumericField(this.minimumLegOddsMultiplierInput, value);
    }

    async toggleApplyOddsAndMultiplierToLegsInTotal() {
        await this.clickCheckbox(this.applyOddsAndMultiplierToLegsInTotalCheckbox);
    }

    async toggleApplyRuleToAllBets() {
        await this.clickCheckbox(this.applyRuleToAllBetsCheckbox);
    }

    async toggleIsSingleLegOnly() {
        await this.clickCheckbox(this.isSingleLegOnlyCheckbox);
    }

    async toggleIsBuildABet() {
        await this.clickCheckbox(this.isBuildABetCheckbox);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Saved condition rows (Sport/Casino/Deposit cards) — all confirmed live.
    //  Edit/Delete use the same aria-label convention as everywhere else in this app.
    // ═══════════════════════════════════════════════════════════════════════

    // Confirmed live (TC_RE_035/035b): the empty state renders ONE placeholder row ("No sport
    // conditions found" etc.) whose single cell spans every column via colspan — a plain
    // `tbody tr` count always reads >= 1 even with zero real conditions, throwing off every
    // before/after row-count comparison by exactly one. Excludes that placeholder row.
    private async countDataRows(card: Locator): Promise<number> {
        const rows = card.locator('tbody tr');
        const total = await rows.count();
        if (total === 0) return 0;
        const placeholders = await rows.locator('td[colspan]').count();
        return total - placeholders;
    }

    async getSportConditionCount(): Promise<number> {
        return this.countDataRows(this.sportConditionCard);
    }

    async getCasinoConditionCount(): Promise<number> {
        return this.countDataRows(this.casinoConditionCard);
    }

    async getDepositConditionCount(): Promise<number> {
        return this.countDataRows(this.depositConditionCard);
    }

    async clickEditForFirstSportCondition() {
        const row = this.sportConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForFirstSportCondition() {
        const row = this.sportConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonDelete, exact: true }));
    }

    async clickEditForFirstCasinoCondition() {
        const row = this.casinoConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForFirstCasinoCondition() {
        const row = this.casinoConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonDelete, exact: true }));
    }

    async clickEditForFirstDepositCondition() {
        const row = this.depositConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForFirstDepositCondition() {
        const row = this.depositConditionCard.locator('tbody tr').first();
        await this.clickElement(row.getByRole('button', { name: rulesEngineLocators.buttonDelete, exact: true }));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 3: Rules — Casino / Deposit Conditions — all ids confirmed live
    // ═══════════════════════════════════════════════════════════════════════

    async clickAddCasino() {
        console.log('Clicking Add casino button...');
        await this.clickElement(this.addCasinoBtn);
        await this.casinoProviderDropdown.waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectFirstCasinoProvider(): Promise<string> {
        return this.selectFirstOption(this.casinoProviderDropdown);
    }

    async selectFirstCasinoGame(): Promise<string> {
        return this.selectFirstOption(this.casinoGameDropdown);
    }

    /** Confirmed live: Game renders disabled (data-p-disabled="true") until Provider is selected
     * — same dependency pattern as the Sport popup's Sport-disabled-until-Feed-Name. */
    async isCasinoGameDropdownDisabled(): Promise<boolean> {
        return (await this.casinoGameDropdown.getAttribute('data-p-disabled')) === 'true';
    }

    async fillCasinoCategory(value: string) {
        await this.fillInput(this.casinoCategoryInput, value);
    }

    async fillCasinoMinimumWagerAmount(value: string) {
        await this.fillNumericField(this.casinoMinimumWagerAmountInput, value);
    }

    async fillCasinoMinimumMultiplierAmount(value: string) {
        await this.fillNumericField(this.casinoMinimumMultiplierAmountInput, value);
    }

    async clickAddDeposit() {
        console.log('Clicking Add deposit button...');
        await this.clickElement(this.addDepositBtn);
        await this.depositMinimumDepositAmountInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    async fillMinimumDepositAmount(value: string) {
        await this.fillNumericField(this.depositMinimumDepositAmountInput, value);
    }

    async selectFirstPaymentMethod(): Promise<string> {
        return this.selectFirstOption(this.depositPaymentMethodDropdown);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 4: Schedule — Add Recurring Frequency popup — all confirmed live
    // ═══════════════════════════════════════════════════════════════════════

    async clickAddRecurringFrequency() {
        console.log('Clicking Add Recurring Frequency button...');
        await this.clickElement(this.addRecurringFrequencyBtn);
        await this.scheduleStartTimeInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Duration is a p-inputnumber (min=1 max=24) whose displayed value carries a " hrs" suffix
     * (e.g. "1 hrs") — typed digits replace the number, the suffix re-applies itself. */
    async fillDurationHours(value: string) {
        await this.fillNumericField(this.scheduleDurationInput, value);
    }

    async getDurationHoursValue(): Promise<string> {
        return (await this.scheduleDurationInput.inputValue()).trim();
    }

    private getPillSection(headingText: string): Locator {
        return this.page.locator('section.feed-processor-pill-section')
            .filter({ has: this.page.locator('h5', { hasText: headingText }) });
    }

    get weekPillSection(): Locator {
        return this.getPillSection(rulesEngineLocators.pillSectionHeadingWeek);
    }

    get monthPillSection(): Locator {
        return this.getPillSection(rulesEngineLocators.pillSectionHeadingMonths);
    }

    get datePillSection(): Locator {
        return this.getPillSection(rulesEngineLocators.pillSectionHeadingDates);
    }

    async clickPillAction(section: Locator, label: string) {
        await this.clickElement(section.getByRole('button', { name: label, exact: true }));
        await this.page.waitForTimeout(200);
    }

    async togglePill(section: Locator, title: string) {
        await this.clickElement(section.locator(`button[title="${title}"]`));
        await this.page.waitForTimeout(200);
    }

    async isPillPressed(section: Locator, title: string): Promise<boolean> {
        return (await section.locator(`button[title="${title}"]`).getAttribute('aria-pressed')) === 'true';
    }

    async getScheduleSummaryText(): Promise<string> {
        return (await this.scheduleSummaryText.textContent())?.trim() ?? '';
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Step 5: Review — confirmed live (Configuration/Rule groups/Recurring frequencies panels,
    //  Back/Back to list). No Activate button was present in the captured HTML — see
    //  activateBtn's own comment; do not assert it's visible.
    // ═══════════════════════════════════════════════════════════════════════

    /** Reads a Configuration-panel field's value by its label (e.g. "Description", "Region"). */
    async getReviewFieldValue(label: string): Promise<string> {
        const field = this.page.locator(rulesEngineLocators.reviewConfigPanelField)
            .filter({ has: this.page.locator('.feed-processor-review__field-label', { hasText: label }) })
            .first();
        return (await field.locator('.feed-processor-review__field-value').textContent())?.trim() ?? '';
    }

    /** Reads a Review panel's own badge text by its heading (e.g. "Rule groups", "Recurring
     * frequencies") — e.g. "1 group · 3 conditions" or a bare count like "0". */
    async getReviewPanelBadgeText(headingText: string): Promise<string> {
        const panel = this.reviewPanels.filter({ has: this.page.locator('h4', { hasText: headingText }) }).first();
        return (await panel.locator(rulesEngineLocators.reviewPanelBadge).first().textContent())?.trim() ?? '';
    }

    async clickBackToList() {
        console.log('Clicking Back to list...');
        await this.clickElement(this.backToListBtn);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }
}
