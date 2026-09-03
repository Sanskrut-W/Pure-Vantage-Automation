import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { genericPredictorLocators } from '../locators/genericPredictorLocators';
import { CommonUtils } from '../utils/commonUtils';

export class GenericPredictorPage extends BasePage {
    // ─── Page-level ─────────────────────────────────────────────────────────────
    readonly createBtn: Locator;
    readonly viewLeaguesBtn: Locator;
    // Page-level "Select a region" filter and Active/Inactive toggle sit above the table, outside
    // the create/edit dialog — scoped to <main> and to the first match, since no stable id/aria
    // label was confirmed live for either. Not the same element as the popup's own #regionCode.
    readonly regionFilterDropdown: Locator;
    readonly activeInactiveToggle: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden, not
    // removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly predictorTable: Locator;

    // ─── Create/Edit Predictor popup — 5 core fields ───────────────────────────
    readonly popupDialog: Locator;
    readonly nameInput: Locator;
    readonly regionDropdown: Locator;
    readonly startDateTimeInput: Locator;
    readonly endDateTimeInput: Locator;
    readonly leagueDropdown: Locator;
    readonly advancedAccordionHeader: Locator;

    // ─── Advanced fields — 14 total ─────────────────────────────────────────────
    readonly participationStartDateTimeInput: Locator;
    readonly participationEndDateTimeInput: Locator;
    readonly predictionStartDateTimeInput: Locator;
    readonly predictionEndDateTimeInput: Locator;
    readonly minimumSelectionsInput: Locator;
    readonly maximumSelectionsInput: Locator;
    readonly minimumDepositInput: Locator;
    readonly maximumWagerInput: Locator;
    readonly competitionTypeInput: Locator;
    readonly redirectUrlInput: Locator;
    readonly sportIdInput: Locator;
    readonly leagueNameInput: Locator;
    readonly leagueCountryInput: Locator;
    readonly allocationCompCodeDropdown: Locator;

    // ─── 11 checkboxes ──────────────────────────────────────────────────────────
    readonly duplicateTeamsCheckbox: Locator;
    readonly allowRepeatTeamsCheckbox: Locator;
    readonly multiTeamCheckbox: Locator;
    readonly requireOrderedSelectionCheckbox: Locator;
    readonly requiresMaxSelectionCheckbox: Locator;
    readonly drawSelectionsCheckbox: Locator;
    readonly isMultiRoundCheckbox: Locator;
    readonly multiWinnerCheckbox: Locator;
    readonly requiresTicketCheckbox: Locator;
    readonly isTestingCheckbox: Locator;
    readonly isAutoOptinCheckbox: Locator;

    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // ─── Row-level delete flow (kebab menu -> Delete -> custom Yes/No modal) ───
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    // ─── Predictor Periods — a genuine page navigation (confirmed live: its own heading and
    // breadcrumb, "Predictor Periods"), NOT a dialog. Scoped to <main> like predictorTable.
    readonly createPeriodBtn: Locator;
    readonly periodsTable: Locator;

    // ─── Create Period popup — 4 fields + 2 checkboxes (all confirmed live). Unlike the
    // Predictor Periods page above, this genuinely IS a `.p-dialog` opened on top of it.
    readonly periodNameInput: Locator;
    readonly periodNumberInput: Locator;
    readonly periodStartDateInput: Locator;
    readonly periodEndDateInput: Locator;
    readonly practiceRoundCheckbox: Locator;
    readonly competitiveWeekCheckbox: Locator;

    // ─── Period Events — a genuine page navigation (confirmed live), same pattern as Predictor
    // Periods. The Create Event popup's Event Name / Start Date Time / League are real fielded
    // inputs; its Event Participants section (Team / Type / Role per participant) has no ids.
    readonly createEventBtn: Locator;
    readonly eventsTable: Locator;
    readonly eventNameInput: Locator;
    readonly eventStartDateTimeInput: Locator;
    readonly eventLeagueDropdown: Locator;
    readonly addParticipantBtn: Locator;

    // ─── Capture Outcome — a genuine `.p-dialog` popup (confirmed live), 3 fields: Result Type
    // (dropdown), Home Score / Away Score (p-inputnumber, min="0" — a negative value keeps Save
    // disabled).
    readonly resultTypeDropdown: Locator;
    readonly homeScoreInput: Locator;
    readonly awayScoreInput: Locator;

    // ─── Event Participants page — Create is a page-level button, but Edit/Delete are confirmed
    // live to be PER-ROW buttons inside each row's own frozen action column (no "select a row"
    // step). The Create/Edit popup's 4 dropdown fields (#teamId/Team, #playerId/Player,
    // #participantType/Participant Type, #participantRole/Participant Role) are confirmed live to
    // carry real `for`-linked <label>s, so getByLabel targeting them is correct. Edit's submit
    // button is confirmed live to say "Update" (aria-label="Update"), NOT "Save" like Create.
    readonly createParticipantBtn: Locator;
    readonly editParticipantBtn: Locator;
    readonly deleteParticipantBtn: Locator;
    readonly updateParticipantBtn: Locator;
    readonly participantsSearchInput: Locator;
    readonly participantsTable: Locator;
    readonly participantTeamDropdown: Locator;
    readonly participantPlayerDropdown: Locator;
    readonly participantTypeDropdown: Locator;
    readonly participantRoleDropdown: Locator;

    // Results popup (per-row "Results" button on the Event Participants page) — Is Winner
    // (Yes/No dropdown), Finish Position and Participant Score (p-inputnumber, min="0"), all
    // confirmed live.
    readonly isWinnerDropdown: Locator;
    readonly finishPositionInput: Locator;
    readonly participantScoreInput: Locator;

    constructor(page: Page) {
        super(page);
        this.createBtn = page.locator(genericPredictorLocators.createBtn);
        this.viewLeaguesBtn = page.getByRole('button', { name: genericPredictorLocators.viewLeaguesBtn, exact: true });
        this.regionFilterDropdown = page.locator('main .p-dropdown').first();
        this.activeInactiveToggle = page.locator('main .p-inputswitch').first();
        this.predictorTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.nameInput = page.locator(genericPredictorLocators.inputName);
        this.regionDropdown = page.locator(genericPredictorLocators.dropdownRegion);
        this.startDateTimeInput = page.locator(genericPredictorLocators.calendarStartDateTime);
        this.endDateTimeInput = page.locator(genericPredictorLocators.calendarEndDateTime);
        this.leagueDropdown = page.locator(genericPredictorLocators.dropdownLeague);
        this.advancedAccordionHeader = page.getByRole('button', { name: genericPredictorLocators.advancedAccordionHeader, exact: true });

        this.participationStartDateTimeInput = page.locator(genericPredictorLocators.calendarParticipationStartDateTime);
        this.participationEndDateTimeInput = page.locator(genericPredictorLocators.calendarParticipationEndDateTime);
        this.predictionStartDateTimeInput = page.locator(genericPredictorLocators.calendarPredictionStartDateTime);
        this.predictionEndDateTimeInput = page.locator(genericPredictorLocators.calendarPredictionEndDateTime);
        this.minimumSelectionsInput = page.locator(genericPredictorLocators.inputMinimumSelections);
        this.maximumSelectionsInput = page.locator(genericPredictorLocators.inputMaximumSelections);
        this.minimumDepositInput = page.locator(genericPredictorLocators.inputMinimumDeposit);
        this.maximumWagerInput = page.locator(genericPredictorLocators.inputMaximumWager);
        this.competitionTypeInput = page.locator(genericPredictorLocators.inputCompetitionType);
        this.redirectUrlInput = page.locator(genericPredictorLocators.inputRedirectUrl);
        this.sportIdInput = page.locator(genericPredictorLocators.inputSportId);
        this.leagueNameInput = page.locator(genericPredictorLocators.inputLeagueName);
        this.leagueCountryInput = page.locator(genericPredictorLocators.inputLeagueCountry);
        this.allocationCompCodeDropdown = page.locator(genericPredictorLocators.dropdownAllocationCompCode);

        this.duplicateTeamsCheckbox = page.locator(genericPredictorLocators.checkboxDuplicateTeams);
        this.allowRepeatTeamsCheckbox = page.locator(genericPredictorLocators.checkboxAllowRepeatTeams);
        this.multiTeamCheckbox = page.locator(genericPredictorLocators.checkboxMultiTeam);
        this.requireOrderedSelectionCheckbox = page.locator(genericPredictorLocators.checkboxRequireOrderedSelection);
        this.requiresMaxSelectionCheckbox = page.locator(genericPredictorLocators.checkboxRequiresMaxSelection);
        this.drawSelectionsCheckbox = page.locator(genericPredictorLocators.checkboxDrawSelections);
        this.isMultiRoundCheckbox = page.locator(genericPredictorLocators.checkboxIsMultiRound);
        this.multiWinnerCheckbox = page.locator(genericPredictorLocators.checkboxMultiWinner);
        this.requiresTicketCheckbox = page.locator(genericPredictorLocators.checkboxRequiresTicket);
        this.isTestingCheckbox = page.locator(genericPredictorLocators.checkboxIsTesting);
        this.isAutoOptinCheckbox = page.locator(genericPredictorLocators.checkboxIsAutoOptin);

        this.saveBtn = page.getByRole('button', { name: genericPredictorLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: genericPredictorLocators.buttonCancel, exact: true });

        this.confirmYesBtn = page.getByRole('button', { name: genericPredictorLocators.buttonConfirmYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: genericPredictorLocators.buttonConfirmNo, exact: true });

        this.createPeriodBtn = page.locator(genericPredictorLocators.createPeriodBtn);
        this.periodsTable = page.locator('main table').first();

        this.periodNameInput = page.locator(genericPredictorLocators.inputPeriodName);
        this.periodNumberInput = page.locator(genericPredictorLocators.inputPeriodNumber);
        this.periodStartDateInput = page.locator(genericPredictorLocators.calendarPeriodStartDate);
        this.periodEndDateInput = page.locator(genericPredictorLocators.calendarPeriodEndDate);
        this.practiceRoundCheckbox = page.locator(genericPredictorLocators.checkboxPracticeRound);
        this.competitiveWeekCheckbox = page.locator(genericPredictorLocators.checkboxCompetitiveWeek);

        this.createEventBtn = page.locator(genericPredictorLocators.createEventBtn);
        this.eventsTable = page.locator('main table').first();
        this.eventNameInput = page.locator(genericPredictorLocators.inputEventName);
        this.eventStartDateTimeInput = page.locator(genericPredictorLocators.calendarEventStartDateTime);
        this.eventLeagueDropdown = page.locator(genericPredictorLocators.dropdownEventLeague);
        this.addParticipantBtn = page.locator(genericPredictorLocators.addParticipantBtn);

        this.resultTypeDropdown = page.locator(genericPredictorLocators.dropdownResultType);
        this.homeScoreInput = page.locator(genericPredictorLocators.inputHomeScore);
        this.awayScoreInput = page.locator(genericPredictorLocators.inputAwayScore);

        this.createParticipantBtn = page.locator(genericPredictorLocators.createParticipantBtn);
        this.editParticipantBtn = page.locator(genericPredictorLocators.editParticipantBtn);
        this.deleteParticipantBtn = page.locator(genericPredictorLocators.deleteParticipantBtn);
        this.updateParticipantBtn = page.getByRole('button', { name: 'Update', exact: true });
        this.participantsSearchInput = page.locator(genericPredictorLocators.participantsSearchInput);
        this.participantsTable = page.locator('main table').first();
        this.participantTeamDropdown = page.getByLabel('Team', { exact: false });
        this.participantPlayerDropdown = page.getByLabel('Player', { exact: false });
        this.participantTypeDropdown = page.getByLabel('Participant Type', { exact: false });
        this.participantRoleDropdown = page.getByLabel('Participant Role', { exact: false });

        this.isWinnerDropdown = page.locator(genericPredictorLocators.dropdownIsWinner);
        this.finishPositionInput = page.locator(genericPredictorLocators.inputFinishPosition);
        this.participantScoreInput = page.locator(genericPredictorLocators.inputParticipantScore);
    }

    async clickCreatePredictor() {
        console.log('Clicking Create Predictor button...');
        await this.clickElement(this.createBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    // ─── Text fields ────────────────────────────────────────────────────────────

    async fillName(value: string) {
        console.log(`Filling Promotion Name: "${value}"...`);
        await this.fillInput(this.nameInput, value);
    }

    async fillCompetitionType(value: string) {
        await this.fillInput(this.competitionTypeInput, value);
    }

    async fillRedirectUrl(value: string) {
        await this.fillInput(this.redirectUrlInput, value);
    }

    async fillSportId(value: string) {
        await this.fillInput(this.sportIdInput, value);
    }

    async fillLeagueName(value: string) {
        await this.fillInput(this.leagueNameInput, value);
    }

    async fillLeagueCountry(value: string) {
        await this.fillInput(this.leagueCountryInput, value);
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

        // Tab moves focus to whatever is next in the DOM — for Period Number that's the Start
        // Date calendar, which opens on focus alone. Left open, it silently intercepts every
        // later click (same bug already fixed once in AutoOptinPage.ts's fillNumericField).
        const strayCalendar = this.page.locator('.p-datepicker-panel, .p-datepicker').last();
        if (await strayCalendar.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async fillMinimumSelections(value: string) {
        console.log(`Filling Minimum Selections: "${value}"...`);
        await this.fillNumericField(this.minimumSelectionsInput, value);
    }

    async fillMaximumSelections(value: string) {
        console.log(`Filling Maximum Selections: "${value}"...`);
        await this.fillNumericField(this.maximumSelectionsInput, value);
    }

    async fillMinimumDeposit(value: string) {
        console.log(`Filling Minimum Deposit: "${value}"...`);
        await this.fillNumericField(this.minimumDepositInput, value);
    }

    async fillMaximumWager(value: string) {
        console.log(`Filling Maximum Wager: "${value}"...`);
        await this.fillNumericField(this.maximumWagerInput, value);
    }

    // ─── Date/time calendars — 6 total, all showTime-enabled p-calendar fields ──

    /**
     * Opens a Date Time calendar, picks the first enabled day in the current view, then closes it
     * via Escape. Confirmed elsewhere in this suite (Auto Opt-In, Opt-In Expiry) that a
     * showTime-enabled p-calendar renders its own aria-modal dialog, so Escape correctly targets
     * it as the innermost focused modal instead of risking a stray dismiss-click landing on the
     * wrong field or bubbling up to close the whole popup.
     */
    private async setDateTimeField(input: Locator, panelId: string) {
        await input.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator(`#${panelId}`);
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async setStartDateTime() {
        console.log('Selecting Start Date Time...');
        await this.setDateTimeField(this.startDateTimeInput, 'startDateTimeCalendar_panel');
    }

    /**
     * Confirmed live: Start and End Date Time both default their time-of-day to "now" at the
     * moment each is picked, so selecting the same day for both leaves only a razor-thin window
     * between them (observed as little as 1 minute apart, e.g. 16:37 -> 16:38). That's not enough
     * buffer for a Period created later in the same test (after predictor creation, navigation,
     * etc.) to fit inside the promotion's window — it trips "Period end date cannot be after
     * promotion end date" purely because real wall-clock time passed. Navigating End Date Time to
     * the next month (unlike setDateTimeField's plain "first enabled day") gives a comfortably
     * wide window regardless of how long the rest of the test takes.
     */
    async setEndDateTime() {
        console.log('Selecting End Date Time...');
        await this.endDateTimeInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#endDateTimeCalendar_panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        const nextMonthBtn = panel.locator('.p-datepicker-next');
        if (await nextMonthBtn.count() > 0) {
            await nextMonthBtn.click();
            await this.page.waitForTimeout(300);
        }
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async setParticipationStartDateTime() {
        console.log('Selecting Participation Start Date Time...');
        await this.setDateTimeField(this.participationStartDateTimeInput, 'participationStartDateTimeCalendar_panel');
    }

    async setParticipationEndDateTime() {
        console.log('Selecting Participation End Date Time...');
        await this.setDateTimeField(this.participationEndDateTimeInput, 'participationEndDateTimeCalendar_panel');
    }

    async setPredictionStartDateTime() {
        console.log('Selecting Prediction Start Date Time...');
        await this.setDateTimeField(this.predictionStartDateTimeInput, 'predictionStartDateTimeCalendar_panel');
    }

    async setPredictionEndDateTime() {
        console.log('Selecting Prediction End Date Time...');
        await this.setDateTimeField(this.predictionEndDateTimeInput, 'predictionEndDateTimeCalendar_panel');
    }

    // ─── Generic PrimeNG dropdown helpers (Region / League / Allocation Comp Code) ─

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
     * environment/real data (Region, League, Allocation Comp Code) and not safe to hardcode.
     * Returns the selected option's text. */
    async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(genericPredictorLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    /** Selects the option at the given 0-based index in a dropdown's currently-visible option
     * list. Used to pick DISTINCT values across repeated calls on separate dropdown instances
     * (e.g. a different Team per participant) — selectFirstOption always resolves to the same
     * "first" option, and duplicate Teams across an Event's participants are confirmed live to
     * be rejected (the Event silently fails to save). Returns the selected option's text. */
    async selectNthOption(dropdownLocator: Locator, index: number): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(genericPredictorLocators.dropdownItem).nth(index);
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

    async selectFirstLeague(): Promise<string> {
        console.log('Selecting first available League...');
        return this.selectFirstOption(this.leagueDropdown);
    }

    async selectFirstAllocationCompCode(): Promise<string> {
        console.log('Selecting first available Allocation Comp Code...');
        return this.selectFirstOption(this.allocationCompCodeDropdown);
    }

    async getDropdownValue(dropdownLocator: Locator): Promise<string> {
        const text = (await dropdownLocator.locator('.p-dropdown-label').innerText().catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    // ─── Advanced accordion ─────────────────────────────────────────────────────

    async expandAdvanced() {
        console.log('Expanding "Advanced" section...');
        await this.clickElement(this.advancedAccordionHeader);
        await this.page.waitForTimeout(300);
    }

    async isAdvancedExpanded(): Promise<boolean> {
        return (await this.advancedAccordionHeader.getAttribute('aria-expanded')) === 'true';
    }

    // ─── Checkboxes ─────────────────────────────────────────────────────────────

    /**
     * Clicks the checkbox's own `.p-checkbox-box` rather than its `<label>` — this label has no
     * `for` attribute (confirmed in the live HTML), so it has no native forwarding target and
     * clicking it is a no-op. PrimeVue's Checkbox renders a visually-hidden native `<input>`
     * directly on top of the visible box, which fails Playwright's "receives events" actionability
     * check — force bypasses that hit-test, safe here since the box is genuinely visible.
     */
    private async toggleCheckbox(checkbox: Locator) {
        const checkboxBox = checkbox.locator('.p-checkbox-box');
        // Confirmed live: the first several checkboxes in the Advanced accordion toggle fine, but
        // later ones (Is Multi Round onward) silently fail to register — force:true skips
        // Playwright's actionability checks (including scrolling into view), so once the
        // accordion's growing content pushes a checkbox out of the current viewport, the force
        // click can land at the wrong coordinate. Scrolling in first fixes it regardless of force.
        await checkboxBox.scrollIntoViewIfNeeded();
        await CommonUtils.highlightElement(checkboxBox);
        await checkboxBox.click({ force: true });
    }

    private async isChecked(checkbox: Locator): Promise<boolean> {
        return (await checkbox.getAttribute('data-p-highlight')) === 'true';
    }

    async toggleDuplicateTeams() { await this.toggleCheckbox(this.duplicateTeamsCheckbox); }
    async isDuplicateTeamsChecked() { return this.isChecked(this.duplicateTeamsCheckbox); }

    async toggleAllowRepeatTeams() { await this.toggleCheckbox(this.allowRepeatTeamsCheckbox); }
    async isAllowRepeatTeamsChecked() { return this.isChecked(this.allowRepeatTeamsCheckbox); }

    async toggleMultiTeam() { await this.toggleCheckbox(this.multiTeamCheckbox); }
    async isMultiTeamChecked() { return this.isChecked(this.multiTeamCheckbox); }

    async toggleRequireOrderedSelection() { await this.toggleCheckbox(this.requireOrderedSelectionCheckbox); }
    async isRequireOrderedSelectionChecked() { return this.isChecked(this.requireOrderedSelectionCheckbox); }

    async toggleRequiresMaxSelection() { await this.toggleCheckbox(this.requiresMaxSelectionCheckbox); }
    async isRequiresMaxSelectionChecked() { return this.isChecked(this.requiresMaxSelectionCheckbox); }

    async toggleDrawSelections() { await this.toggleCheckbox(this.drawSelectionsCheckbox); }
    async isDrawSelectionsChecked() { return this.isChecked(this.drawSelectionsCheckbox); }

    async toggleIsMultiRound() { await this.toggleCheckbox(this.isMultiRoundCheckbox); }
    async isMultiRoundChecked() { return this.isChecked(this.isMultiRoundCheckbox); }

    async toggleMultiWinner() { await this.toggleCheckbox(this.multiWinnerCheckbox); }
    async isMultiWinnerChecked() { return this.isChecked(this.multiWinnerCheckbox); }

    async toggleRequiresTicket() { await this.toggleCheckbox(this.requiresTicketCheckbox); }
    async isRequiresTicketChecked() { return this.isChecked(this.requiresTicketCheckbox); }

    async toggleIsTesting() { await this.toggleCheckbox(this.isTestingCheckbox); }
    async isTestingChecked() { return this.isChecked(this.isTestingCheckbox); }

    async toggleIsAutoOptin() { await this.toggleCheckbox(this.isAutoOptinCheckbox); }
    async isAutoOptinChecked() { return this.isChecked(this.isAutoOptinCheckbox); }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Create/Edit Predictor popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create/Edit Predictor popup...');
        await this.clickElement(this.cancelBtn);
    }

    // ─── Page-level filters ─────────────────────────────────────────────────────

    async selectRegionFilterByText(region: string) {
        console.log(`Filtering by Region "${region}"...`);
        await this.selectDropdown(this.regionFilterDropdown, region);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async isActiveFilterOn(): Promise<boolean> {
        return (await this.activeInactiveToggle.getAttribute('aria-checked')) === 'true';
    }

    async toggleActiveInactiveFilter() {
        console.log('Toggling the Active/Inactive filter...');
        await this.clickElement(this.activeInactiveToggle);
        await this.page.waitForLoadState('networkidle').catch(() => {});
        await this.page.waitForTimeout(500);
    }

    /** Newly created predictors are inactive by default, and the list defaults to showing only
     * Active predictors (confirmed live) — switches the filter to Inactive if it isn't already,
     * so a just-created predictor's row actually renders. */
    async showInactivePredictors() {
        if (await this.isActiveFilterOn()) {
            await this.toggleActiveInactiveFilter();
        }
    }

    // ─── Table / row lookup ─────────────────────────────────────────────────────

    getRowByName(name: string): Locator {
        return this.predictorTable.locator('tbody tr', { hasText: name }).first();
    }

    async isPredictorVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isPredictorAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    // ─── Edit / Delete flow (kebab menu -> Edit/Delete) ────────────────────────

    async clickRowMenuForPredictor(name: string) {
        console.log(`Opening the "..." menu for Predictor "${name}"...`);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(genericPredictorLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickEditFromRowMenu() {
        console.log('Clicking Edit from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemEdit, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickDeleteFromRowMenu() {
        console.log('Clicking Delete from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemDelete, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Opens the Edit popup for a Predictor by name. Same visibility rule as Delete (confirmed
     * live): only reachable from the Inactive list, filtered to the predictor's own Region, via
     * the row's "..." menu. */
    async clickEditForPredictor(name: string, region: string) {
        console.log(`Opening Edit for Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showInactivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickEditFromRowMenu();
    }

    async clickConfirmYes() {
        console.log('Clicking Yes on the delete confirmation modal...');
        await this.clickElement(this.confirmYesBtn);
    }

    /** Deletes a Predictor by name and waits for it to actually disappear. Swallows errors so
     * it's safe to call unconditionally from afterEach, even if the record was never created
     * (e.g. the test failed before Save) or was already removed. Per confirmed live behavior, a
     * freshly created predictor is inactive and the list defaults to Active-only, so the region
     * filter and Inactive toggle must both be set correctly before its row will even render. */
    async deletePredictorIfPresent(name: string, region: string) {
        try {
            await this.selectRegionFilterByText(region);
            await this.showInactivePredictors();
            await this.clickRowMenuForPredictor(name);
            await this.clickDeleteFromRowMenu();
            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isPredictorAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup skipped for "${name}" (likely never created): ${error}`);
        }
    }

    // ─── Promotion Periods (kebab menu -> Promotion Periods -> Create Period) ──
    //
    // Confirmed live: "Promotion Periods" is a genuine PAGE NAVIGATION (its own heading and
    // breadcrumb reading "Predictor Periods"), not a dialog — unlike the Create Period popup
    // opened from it, which genuinely is a `.p-dialog`. That popup is identified by its CONTENT
    // (containing the #periodNameInput field) rather than by stacking order, so a `.last()`-style
    // locator doesn't silently point at the wrong dialog if another one is also open.

    get createPeriodPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.periodNameInput });
    }

    async clickPromotionPeriodsFromRowMenu() {
        console.log('Clicking Promotion Periods from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemPromotionPeriods, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Promotion Periods for a Predictor by name. Same visibility rule as Edit/Delete
     * (confirmed live): only reachable from the Inactive list, filtered to the predictor's own
     * Region, via the row's "..." menu. Navigates to the Predictor Periods page. */
    async openPromotionPeriods(name: string, region: string) {
        console.log(`Opening Promotion Periods for Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showInactivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickPromotionPeriodsFromRowMenu();
        await this.createPeriodBtn.waitFor({ state: 'visible', timeout: 15000 });
    }

    async isCreatePeriodButtonVisible(): Promise<boolean> {
        return this.createPeriodBtn.isVisible().catch(() => false);
    }

    async clickCreatePeriod() {
        console.log('Clicking Create Period button...');
        await this.clickElement(this.createPeriodBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForCreatePeriodPopupLoad() {
        await this.createPeriodPopup.waitFor({ state: 'visible', timeout: 10000 });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Checks whether a field or checkbox is currently rendered in the Create Period popup,
     * identified purely by its label text — used to assert the 4 fields / 2 checkboxes actually
     * appear. */
    async isFieldVisibleByLabel(labelText: string): Promise<boolean> {
        const label = this.createPeriodPopup.locator('label').filter({ hasText: new RegExp(`^${labelText}\\s*\\*?$`) }).first();
        return await label.isVisible().catch(() => false);
    }

    async fillPeriodName(value: string) {
        console.log(`Filling Period Name: "${value}"...`);
        await this.fillInput(this.periodNameInput, value);
    }

    async fillPeriodNumber(value: string) {
        console.log(`Filling Period Number: "${value}"...`);
        await this.fillNumericField(this.periodNumberInput, value);
    }

    async getPeriodNumberValue(): Promise<string> {
        return (await this.periodNumberInput.inputValue()).trim();
    }

    /**
     * Opens a period date calendar and picks TODAY's day, then closes it via Escape. Reads the
     * input's own `aria-controls` attribute to find its overlay panel — the same pattern proven
     * for the Predictor popup's own 6 date/time calendars.
     *
     * Picks today specifically rather than the first/last day of the displayed month, or a day in
     * the next month: the predictor's own Start/End Date Time fields (set via setStartDateTime /
     * setEndDateTime) each pick the first non-disabled day in THEIR calendar, which disables all
     * days before today — so both end up being today, making the promotion a same-day window
     * (Start == End == today). Any period day outside that exact day gets rejected on save, in
     * either direction ("before promotion start" or "after promotion end"). The Period calendar
     * itself doesn't disable days by date, so today's cell is targeted directly via PrimeNG's
     * `data-p-today="true"` marker rather than relying on disabled/other-month state.
     */
    private async setPeriodDateField(input: Locator) {
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

    async setPeriodStartDate() {
        console.log('Selecting Period Start Date...');
        await this.setPeriodDateField(this.periodStartDateInput);
    }

    async setPeriodEndDate() {
        console.log('Selecting Period End Date...');
        await this.setPeriodDateField(this.periodEndDateInput);
    }

    /** Practice Round / First Competitive Week are plain native checkboxes with a real `for`-
     * labeled <input> (confirmed live) — unlike every other checkbox in this app, no
     * `.p-checkbox-box` force-click workaround is needed here. */
    async togglePracticeRound() {
        console.log('Toggling "Practice Round"...');
        await this.practiceRoundCheckbox.click();
    }

    async isPracticeRoundChecked(): Promise<boolean> {
        return this.practiceRoundCheckbox.isChecked();
    }

    async toggleCompetitiveWeek() {
        console.log('Toggling "First Competitive Week"...');
        await this.competitiveWeekCheckbox.click();
    }

    async isCompetitiveWeekChecked(): Promise<boolean> {
        return this.competitiveWeekCheckbox.isChecked();
    }

    getPeriodRowByName(name: string): Locator {
        return this.periodsTable.locator('tbody tr', { hasText: name }).first();
    }

    async isPeriodVisibleByName(name: string, timeout: number = 15000): Promise<boolean> {
        const row = this.getPeriodRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isPeriodAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        const row = this.getPeriodRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    /** Period rows carry the same "..." kebab menu as Predictor rows (confirmed live: an
     * identical Edit/Delete menu-item structure), so this reuses the same rowMenuTrigger/
     * menuItemDelete locators — just scoped to the Periods table instead of the Predictor list. */
    async clickRowMenuForPeriod(name: string) {
        console.log(`Opening the "..." menu for Period "${name}"...`);
        const row = this.getPeriodRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(genericPredictorLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickDeleteFromPeriodRowMenu() {
        console.log('Clicking Delete from the period row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemDelete, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Confirmed live: the period row's "..." menu also has Edit (aria-label="Edit", pi-pencil
     * icon), Events, Stats, and Winners alongside Delete — same .p-menuitem-link structure as
     * every other row menu in this suite. */
    async clickEditFromPeriodRowMenu() {
        console.log('Clicking Edit from the period row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemEdit, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Opens the Edit popup for a Period by name. Confirmed live: click on "..." for the specific
     * Period row (button.pure__table-menu-trigger, scoped to that row — NOT the Predictor's own
     * row menu), then Edit. Assumes the browser is already on that Predictor's Promotion Periods
     * page (e.g. right after creating the Period in the same test) — unlike deletePeriodIfPresent,
     * this does NOT re-navigate via openPromotionPeriods, since openPromotionPeriods expects to
     * start from the Generic Predictor list page and would otherwise look for the Predictor's row
     * on what is actually the Periods table, clicking the wrong "..." button. Reuses
     * createPeriodPopup / waitForCreatePeriodPopupLoad since the Edit dialog shares the same
     * #periodNameInput-based content, just pre-filled. */
    async clickEditForPeriod(periodName: string) {
        console.log(`Opening Edit popup for Period "${periodName}"...`);
        await this.clickRowMenuForPeriod(periodName);
        await this.clickEditFromPeriodRowMenu();
    }

    /** Deletes a Period by name and waits for it to actually disappear. Swallows errors so it's
     * safe to call unconditionally at the end of a test (or from afterEach), even if the period
     * was never created (e.g. a test intentionally verified a failed-creation scenario) or was
     * already removed.
     *
     * Confirmed live: UNLIKE Predictor/Event deletion, Period deletion has NO Yes/No confirmation
     * modal — clicking Delete fires the action directly and a toast reports the outcome. (Fixed
     * from an earlier version of this method that waited for confirmYesBtn — that wait always
     * timed out, since the modal never appears, meaning Periods were silently never actually
     * deleted by cleanup until now.)
     *
     * Re-navigates to the specific Predictor's Promotion Periods page via openPromotionPeriods
     * (filter by Region, switch to Inactive, open the row's "..." menu) rather than assuming the
     * browser is still sitting on that page — cleanup must be self-sufficient regardless of
     * where the test left off (including a failed test mid-flow), so the caller should land on
     * the Generic Predictor list page first (see navigateToGenericPredictor in the spec). */
    async deletePeriodIfPresent(periodName: string, predictorName: string, region: string) {
        try {
            await this.openPromotionPeriods(predictorName, region);
            await this.clickRowMenuForPeriod(periodName);
            await this.clickDeleteFromPeriodRowMenu();

            // Business rule change: Period delete now shows the same Yes/No confirmation modal as
            // Predictor/Event delete (previously confirmed to fire directly with no modal) — click
            // through it if present so cleanup actually removes the record instead of leaving the
            // modal open.
            const confirmModalAppeared = await this.confirmYesBtn.isVisible({ timeout: 5000 }).catch(() => false);
            if (confirmModalAppeared) {
                await this.clickConfirmYes();
            }

            await this.page.locator('.p-toast-message-text').first().waitFor({ state: 'visible', timeout: 10000 });
            await this.isPeriodAbsentByName(periodName, 15000);
        } catch (error) {
            console.log(`Period delete cleanup skipped for "${periodName}" (likely never created): ${error}`);
        }
    }

    // ─── Period Events (Period row "..." menu -> Events -> Create Event) ──────────
    //
    // Confirmed live: "Events" is a genuine PAGE NAVIGATION (same pattern as Promotion Periods
    // itself), not a dialog — unlike the Create Event popup opened from it, which genuinely IS a
    // `.p-dialog`. That popup is identified by its CONTENT (containing #eventName) rather than by
    // stacking order, same reasoning as createPeriodPopup.

    get eventPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.eventNameInput });
    }

    async clickEventsFromPeriodRowMenu() {
        console.log('Clicking Events from the period row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemEvents, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens the Period Events page for a Period by name. Confirmed live: click "..." on the
     * specific Period row, then Events. Assumes the browser is already on that Predictor's
     * Promotion Periods page (same assumption as clickEditForPeriod) — does not re-navigate. */
    async openEventsForPeriod(periodName: string) {
        console.log(`Opening Events for Period "${periodName}"...`);
        await this.clickRowMenuForPeriod(periodName);
        await this.clickEventsFromPeriodRowMenu();
        await this.createEventBtn.waitFor({ state: 'visible', timeout: 15000 });
    }

    async clickCreateEvent() {
        console.log('Clicking Create Event button...');
        await this.clickElement(this.createEventBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForCreateEventPopupLoad() {
        await this.eventPopup.waitFor({ state: 'visible', timeout: 10000 });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    async fillEventName(value: string) {
        await this.fillInput(this.eventNameInput, value);
    }

    async setEventStartDateTime() {
        console.log('Selecting Event Start Date Time...');
        await this.setDateTimeField(this.eventStartDateTimeInput, 'eventStartDateTime_panel');
    }

    async selectEventLeague(): Promise<string> {
        console.log('Selecting first available League for Event...');
        return this.selectFirstOption(this.eventLeagueDropdown);
    }

    async clickAddParticipant() {
        console.log('Clicking Add Participant button...');
        await this.clickElement(this.addParticipantBtn);
        await this.page.waitForTimeout(300);
    }

    async getParticipantCount(): Promise<number> {
        return this.eventPopup.locator('h4').filter({ hasText: /^Participant \d+$/ }).count();
    }

    /** Participant blocks (1-indexed, confirmed live) are identified by their "Participant N"
     * heading — the Team / Participant Type / Participant Role dropdowns inside have no id and
     * no `for` attribute, so they're targeted only by DOM position within this block.
     *
     * The outer "Event Participants" section and each individual participant block both use the
     * same `marginb-3` class, so filtering `div.marginb-3` by "contains text Participant N" wrongly
     * matches both (the outer section transitively contains that text too) — confirmed live via a
     * strict-mode violation on delete. Walking up from the heading via XPath's `ancestor::` axis
     * and taking `[1]` (nearest ancestor first, for reverse axes) picks only the specific block. */
    getParticipantBlock(index: number): Locator {
        const heading = this.eventPopup.getByText(`Participant ${index}`, { exact: true });
        return heading.locator('xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " marginb-3 ")][1]');
    }

    getParticipantTeamDropdown(index: number): Locator {
        return this.getParticipantBlock(index).locator('.p-dropdown').nth(0);
    }

    getParticipantTypeDropdown(index: number): Locator {
        return this.getParticipantBlock(index).locator('.p-dropdown').nth(1);
    }

    getParticipantRoleDropdown(index: number): Locator {
        return this.getParticipantBlock(index).locator('.p-dropdown').nth(2);
    }

    /** Team is confirmed to render disabled until a League is selected on the Event itself (a
     * participant's Team must belong to the chosen League) — select the Event's League first. */
    async selectParticipantTeam(index: number): Promise<string> {
        console.log(`Selecting first available Team for Participant ${index}...`);
        return this.selectFirstOption(this.getParticipantTeamDropdown(index));
    }

    /** Selects the Team option at `teamOptionIndex` (0-based) for the given participant — used
     * instead of selectParticipantTeam when creating multiple participants on the same Event, so
     * each one gets a DISTINCT Team (confirmed live: duplicate Teams across participants are
     * rejected, silently blocking the Event from saving). */
    async selectParticipantTeamByIndex(participantIndex: number, teamOptionIndex: number): Promise<string> {
        console.log(`Selecting Team option #${teamOptionIndex} for Participant ${participantIndex}...`);
        return this.selectNthOption(this.getParticipantTeamDropdown(participantIndex), teamOptionIndex);
    }

    async selectParticipantType(index: number): Promise<string> {
        console.log(`Selecting first available Participant Type for Participant ${index}...`);
        return this.selectFirstOption(this.getParticipantTypeDropdown(index));
    }

    async selectParticipantRole(index: number): Promise<string> {
        console.log(`Selecting first available Participant Role for Participant ${index}...`);
        return this.selectFirstOption(this.getParticipantRoleDropdown(index));
    }

    /** Selects the Participant Role option at `roleOptionIndex` (0-based) for the given
     * participant — used instead of selectParticipantRole when creating multiple participants on
     * the same Event, so each one gets a DISTINCT Role (confirmed live: duplicate Participant
     * Roles across participants are rejected, same as duplicate Teams). */
    async selectParticipantRoleByIndex(participantIndex: number, roleOptionIndex: number): Promise<string> {
        console.log(`Selecting Participant Role option #${roleOptionIndex} for Participant ${participantIndex}...`);
        return this.selectNthOption(this.getParticipantRoleDropdown(participantIndex), roleOptionIndex);
    }

    async deleteParticipant(index: number) {
        console.log(`Deleting Participant ${index}...`);
        await this.clickElement(this.getParticipantBlock(index).locator('button:has(.pi-trash)'));
        await this.page.waitForTimeout(300);
    }

    getEventRowByName(name: string): Locator {
        return this.eventsTable.locator('tbody tr', { hasText: name }).first();
    }

    async isEventVisibleByName(name: string, timeout: number = 15000): Promise<boolean> {
        const row = this.getEventRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /** Event rows carry the same "..." kebab menu as Predictor/Period rows (confirmed live: Edit
     * and Cancel menu items share the same .p-menuitem-link structure), scoped to the Events
     * table instead. */
    async clickRowMenuForEvent(name: string) {
        console.log(`Opening the "..." menu for Event "${name}"...`);
        const row = this.getEventRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(genericPredictorLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickEditFromEventRowMenu() {
        console.log('Clicking Edit from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemEdit, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickCancelFromEventRowMenu() {
        console.log('Clicking Cancel from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemCancel, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Opens the Edit popup for an Event by name. Confirmed live: click "..." for the specific
     * Event row, then Edit. Assumes the browser is already on that Period's Events page (same
     * assumption as clickEditForPeriod) — does not re-navigate. */
    async clickEditForEvent(eventName: string) {
        console.log(`Opening Edit popup for Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickEditFromEventRowMenu();
    }

    /** Clicks Cancel for an Event by name. Confirmed live: assumes the browser is already on that
     * Period's Events page — does not re-navigate. */
    /** Confirmed live: clicking Cancel opens the same custom Yes/No modal used for Predictor/
     * Period deletion (aria-label="Yes"/"No") — reuses confirmYesBtn / clickConfirmYes. */
    async cancelEvent(eventName: string) {
        console.log(`Cancelling Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickCancelFromEventRowMenu();
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickConfirmYes();
    }

    // ─── Capture Outcome (Event row "..." menu -> Capture Outcome) ────────────────
    //
    // Confirmed live: a genuine `.p-dialog` popup (unlike Events/Promotion Periods, which are
    // page navigations) with 3 fields: Result Type, Home Score, Away Score. Identified by its
    // CONTENT (containing #resultType), same reasoning as createPeriodPopup / eventPopup.

    get captureOutcomePopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.resultTypeDropdown });
    }

    async clickCaptureOutcomeFromEventRowMenu() {
        console.log('Clicking Capture Outcome from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemCaptureOutcome, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Opens Capture Outcome for an Event by name. Confirmed live: click "..." for the specific
     * Event row, then Capture Outcome. Assumes the browser is already on that Period's Events
     * page (same assumption as clickEditForEvent) — does not re-navigate. */
    async openCaptureOutcomeForEvent(eventName: string) {
        console.log(`Opening Capture Outcome for Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickCaptureOutcomeFromEventRowMenu();
        await this.captureOutcomePopup.waitFor({ state: 'visible', timeout: 10000 });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectResultType(resultType: string) {
        console.log(`Selecting Result Type: "${resultType}"...`);
        await this.selectDropdown(this.resultTypeDropdown, resultType);
    }

    // Home/Away Score are p-inputnumber (min="0") — reuses the click(x3)+pressSequentially+Tab
    // pattern already proven elsewhere in this suite for this component type.
    async fillHomeScore(value: string) {
        console.log(`Filling Home Score: "${value}"...`);
        await this.fillNumericField(this.homeScoreInput, value);
    }

    async fillAwayScore(value: string) {
        console.log(`Filling Away Score: "${value}"...`);
        await this.fillNumericField(this.awayScoreInput, value);
    }

    async getHomeScoreValue(): Promise<string> {
        return (await this.homeScoreInput.inputValue()).trim();
    }

    async getAwayScoreValue(): Promise<string> {
        return (await this.awayScoreInput.inputValue()).trim();
    }

    /** PrimeNG's InputNumber (min="0" here) filters keystrokes as they're typed, so a real
     * key-by-key "-" via pressSequentially (what fillHomeScore/fillAwayScore use) can get
     * silently blocked/dropped before it ever registers — confirmed live: Save ends up enabled
     * because the field actually holds a stripped positive value, not the negative one intended.
     * .fill() sets the value directly and dispatches synthetic events instead of real keystrokes,
     * bypassing that keydown-level filter so an out-of-range value like "-5" actually lands in the
     * field for the validation-disables-Save behavior to be exercised at all. */
    async fillHomeScoreRaw(value: string) {
        console.log(`Filling Home Score directly (bypassing keystroke filtering): "${value}"...`);
        await this.homeScoreInput.click({ clickCount: 3 });
        await this.homeScoreInput.fill(value);
        await this.homeScoreInput.blur();
        await this.page.waitForTimeout(300);
    }

    async fillAwayScoreRaw(value: string) {
        console.log(`Filling Away Score directly (bypassing keystroke filtering): "${value}"...`);
        await this.awayScoreInput.click({ clickCount: 3 });
        await this.awayScoreInput.fill(value);
        await this.awayScoreInput.blur();
        await this.page.waitForTimeout(300);
    }

    // ─── Delete (Event row "..." menu -> Delete) ───────────────────────────────────

    async clickDeleteFromEventRowMenu() {
        console.log('Clicking Delete from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemDelete, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Deletes an Event by name. Confirmed live: same custom Yes/No modal as Predictor/Period
     * deletion and Event cancellation — reuses confirmYesBtn / clickConfirmYes. Assumes the
     * browser is already on that Period's Events page — does not re-navigate. */
    async deleteEvent(eventName: string) {
        console.log(`Deleting Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickDeleteFromEventRowMenu();
        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickConfirmYes();
    }

    // ─── Period Stats (Event row "..." menu -> Period Stats) ───────────────────────
    //
    // Confirmed live: a genuine PAGE NAVIGATION to "Predictor Period Stats" (own <h2> heading),
    // not a dialog — same pattern as Events/Promotion Periods.

    async clickPeriodStatsFromEventRowMenu() {
        console.log('Clicking Period Stats from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemPeriodStats, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Predictor Period Stats for an Event by name. Confirmed live: click "..." for the
     * specific Event row, then Period Stats. Assumes the browser is already on that Period's
     * Events page (same assumption as clickEditForEvent) — does not re-navigate. */
    async openPeriodStatsForEvent(eventName: string) {
        console.log(`Opening Period Stats for Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickPeriodStatsFromEventRowMenu();
    }

    get periodStatsHeading(): Locator {
        return this.page.getByRole('heading', { name: /Predictor\s*Period Stats/i });
    }

    /** Heading for the Period Events page (confirmed live text: "Generic Predictor Period
     * Events") — distinct from predictorPeriodsHeading's "Predictor Periods". */
    get periodEventsHeading(): Locator {
        return this.page.getByRole('heading', { name: /Period\s*Events/i });
    }

    /** Back button on Predictor Period Stats — confirmed live: unlabeled icon-only button
     * (pi-chevron-left, btn--info). Confirmed live: the destination is CONTEXTUAL, not a fixed
     * "Predictor Stats" page — it returns to wherever Period Stats was opened FROM: the Period
     * Events page (periodEventsHeading) when reached via an Event row's "Period Stats" menu
     * item, or the Predictor Periods page (predictorPeriodsHeading) when reached via a Period
     * row's "Stats" menu item. */
    get periodStatsBackBtn(): Locator {
        return this.page.locator('button.btn--info.p-button-icon-only:has(.pi-chevron-left)');
    }

    async clickPeriodStatsBack() {
        console.log('Clicking Back on the Predictor Period Stats page...');
        await this.clickElement(this.periodStatsBackBtn);
        await this.page.waitForTimeout(500);
    }

    // ─── Row-menu access without a known name — for tests that reuse whatever Predictor/
    // Period/Event already exists rather than creating new test data. ───────────────

    async clickRowMenuForFirstPredictor() {
        console.log('Opening the "..." menu for the first available Predictor...');
        const row = this.predictorTable.locator('tbody tr').first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(genericPredictorLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    async clickRowMenuForFirstPeriod() {
        console.log('Opening the "..." menu for the first available Period...');
        const row = this.periodsTable.locator('tbody tr').first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(genericPredictorLocators.rowMenuTrigger));
        await this.page.waitForTimeout(300);
    }

    // ─── Period Events page — its own Back button + heading, distinct from Predictor Period
    // Stats' (confirmed live: "Predictor Periods" heading, not "Predictor Period Stats"). ──

    get predictorPeriodsHeading(): Locator {
        return this.page.getByRole('heading', { name: /Predictor\s*Periods/i });
    }

    /** Back button on the Period Events page — confirmed live: same unlabeled icon-only button
     * markup (pi-chevron-left, btn--info) as periodStatsBackBtn, reused here for this page's own
     * context. Navigates up to the Predictor Periods page. */
    get eventsPageBackBtn(): Locator {
        return this.page.locator('button.btn--info.p-button-icon-only:has(.pi-chevron-left)');
    }

    async clickEventsPageBack() {
        console.log('Clicking Back on the Period Events page...');
        await this.clickElement(this.eventsPageBackBtn);
        await this.page.waitForTimeout(500);
    }

    // ─── Period row menu (Predictor Periods page) — Stats/Winners ──────────────────

    async clickStatsFromPeriodRowMenu() {
        console.log('Clicking Stats from the period row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemStats, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    async clickWinnersFromPeriodRowMenu() {
        console.log('Clicking Winners from the period row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemWinners, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Predictor Period Stats for a Period by name via the Period row's "..." -> Stats menu
     * item — lands on the SAME "Predictor Period Stats" page as an Event row's "Period Stats"
     * item (see periodStatsHeading), just reached via a different entry point. Assumes the
     * browser is already on the Predictor Periods page — does not re-navigate. */
    async openStatsForPeriod(periodName: string) {
        console.log(`Opening Stats for Period "${periodName}"...`);
        await this.clickRowMenuForPeriod(periodName);
        await this.clickStatsFromPeriodRowMenu();
    }

    /** Opens Period Winners for a Period by name via the Period row's "..." -> Winners menu item.
     * Assumes the browser is already on the Predictor Periods page — does not re-navigate. */
    async openWinnersForPeriod(periodName: string) {
        console.log(`Opening Winners for Period "${periodName}"...`);
        await this.clickRowMenuForPeriod(periodName);
        await this.clickWinnersFromPeriodRowMenu();
    }

    get predictorStatsHeading(): Locator {
        return this.page.getByRole('heading', { name: /Predictor\s*Stats/i });
    }

    get periodWinnersHeading(): Locator {
        return this.page.getByRole('heading', { name: /Period\s*Winners/i });
    }

    /** Back button on the Period Winners page — confirmed live: same unlabeled icon-only button
     * markup as elsewhere in this drill-down hierarchy. Navigates back to the Predictor Periods
     * page. */
    get periodWinnersBackBtn(): Locator {
        return this.page.locator('button.btn--info.p-button-icon-only:has(.pi-chevron-left)');
    }

    async clickPeriodWinnersBack() {
        console.log('Clicking Back on the Period Winners page...');
        await this.clickElement(this.periodWinnersBackBtn);
        await this.page.waitForTimeout(500);
    }

    // ─── Predictor row menu (Generic Predictor list page) — Activate/Deactivate ───

    async clickActivateFromRowMenu() {
        console.log('Clicking Activate from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemActivate, { exact: true });
        await this.clickElement(menuItem);
    }

    async clickDeactivateFromRowMenu() {
        console.log('Clicking Deactivate from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemDeactivate, { exact: true });
        await this.clickElement(menuItem);
    }

    /** Toggles the Active/Inactive filter to show ACTIVE predictors — the inverse of
     * showInactivePredictors. Needed to find a predictor after activating it (it now only
     * appears in the Active list) so Deactivate can be reached. */
    async showActivePredictors() {
        if (!(await this.isActiveFilterOn())) {
            await this.toggleActiveInactiveFilter();
        }
    }

    /** Activates a Predictor by name via its row's "..." menu. Confirmed live: only reachable
     * from the Inactive list under the predictor's own Region (same visibility rule as
     * Edit/Delete/Promotion Periods). */
    async activatePredictor(name: string, region: string) {
        console.log(`Activating Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showInactivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickActivateFromRowMenu();
    }

    /** Deactivates a Predictor by name via its row's "..." menu. Confirmed live: only reachable
     * from the ACTIVE list — the mirror image of activatePredictor. */
    async deactivatePredictor(name: string, region: string) {
        console.log(`Deactivating Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showActivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickDeactivateFromRowMenu();
    }

    // ─── Predictor row menu — Toggle Testing Status / Toggle Auto-Optin Status ────
    //
    // The "Is Testing" / "Auto Opt-in" switches in the table (columns confirmed live, in this
    // order: ID, Promotion Name, Region, League, Sport, Is Testing, Auto Opt-in, Start Date, End
    // Date) are read-only (disabled) — only changeable via these row menu items, which TOGGLE the
    // same underlying state (one menu item turns it both on and off, clicked repeatedly).

    async clickToggleTestingStatusFromRowMenu() {
        console.log('Clicking Toggle Testing Status from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemToggleTestingStatus, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    async clickToggleAutoOptinStatusFromRowMenu() {
        console.log('Clicking Toggle Auto-Optin Status from the row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemToggleAutoOptinStatus, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Toggles the "Is Testing" status for a Predictor by name via its row's "..." menu.
     * Confirmed live: only reachable from the Inactive list under the predictor's own Region
     * (same visibility rule as Edit/Delete/Activate). Calling this again flips it back. */
    async toggleTestingStatus(name: string, region: string) {
        console.log(`Toggling Testing Status for Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showInactivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickToggleTestingStatusFromRowMenu();
    }

    /** Toggles the "Auto Opt-in" status for a Predictor by name via its row's "..." menu. Same
     * visibility rule and toggle behavior as toggleTestingStatus. */
    async toggleAutoOptinStatus(name: string, region: string) {
        console.log(`Toggling Auto-Optin Status for Predictor "${name}"...`);
        await this.selectRegionFilterByText(region);
        await this.showInactivePredictors();
        await this.clickRowMenuForPredictor(name);
        await this.clickToggleAutoOptinStatusFromRowMenu();
    }

    async isTestingToggleOn(name: string): Promise<boolean> {
        const toggle = this.getRowByName(name).locator('td').nth(5).locator('.p-inputswitch');
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    async isAutoOptinToggleOn(name: string): Promise<boolean> {
        const toggle = this.getRowByName(name).locator('td').nth(6).locator('.p-inputswitch');
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    // ─── Event Participants (Event row "..." menu -> Participants) ────────────────
    //
    // Confirmed live: a genuine page navigation (own Create/Edit/Delete buttons + Search), not a
    // dialog and not a per-row "..." menu — unlike every other list page in this suite.

    async clickParticipantsFromEventRowMenu() {
        console.log('Clicking Participants from the event row menu...');
        const menuItem = this.page.locator('.p-menu, .p-tieredmenu').last().getByText(genericPredictorLocators.menuItemParticipants, { exact: true });
        await this.clickElement(menuItem);
        await this.page.waitForTimeout(500);
    }

    /** Opens Event Participants for an Event by name. Confirmed live: click "..." for the
     * specific Event row, then Participants. Assumes the browser is already on that Period's
     * Events page (same assumption as clickEditForEvent) — does not re-navigate. */
    async openParticipantsForEvent(eventName: string) {
        console.log(`Opening Participants for Event "${eventName}"...`);
        await this.clickRowMenuForEvent(eventName);
        await this.clickParticipantsFromEventRowMenu();
        await this.createParticipantBtn.waitFor({ state: 'visible', timeout: 15000 });
    }

    async clickCreateParticipant() {
        console.log('Clicking Create on Event Participants page...');
        await this.clickElement(this.createParticipantBtn);
        await this.page.waitForTimeout(500);
    }

    /** Confirmed live: Edit is a PER-ROW button inside the row's own frozen action column, not a
     * page-level button acting on a separately-selected row — there is no "select the row" step.
     * Scoped by team name so this stays correct once more than one participant row exists. */
    async clickEditParticipant(teamName: string) {
        console.log(`Clicking Edit for Participant row "${teamName}"...`);
        const editBtn = this.getParticipantRowByText(teamName).locator(genericPredictorLocators.editParticipantBtn);
        await this.clickElement(editBtn);
        await this.page.waitForTimeout(500);
    }

    /** Same per-row-button pattern as clickEditParticipant — see that method's note. */
    async clickDeleteParticipant(teamName: string) {
        console.log(`Clicking Delete for Participant row "${teamName}"...`);
        const deleteBtn = this.getParticipantRowByText(teamName).locator(genericPredictorLocators.deleteParticipantBtn);
        await this.clickElement(deleteBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForParticipantPopupLoad() {
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Confirmed live: the Edit Participant popup's submit button says "Update"
     * (aria-label="Update"), not "Save" like every Create popup in this suite. */
    async waitForParticipantEditPopupLoad() {
        await this.updateParticipantBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    async clickUpdateParticipant() {
        console.log('Clicking Update on Edit Participant popup...');
        await this.clickElement(this.updateParticipantBtn);
    }

    async selectParticipantTeamOption(): Promise<string> {
        console.log('Selecting first available Team for the participant...');
        return this.selectFirstOption(this.participantTeamDropdown);
    }

    /** Reads the Team name at a given dropdown option index WITHOUT selecting it — opens a fresh
     * Create Participant popup just to peek the Team list, then cancels out without saving. Used
     * to get a second, genuinely valid team name (distinct from the one already used to create a
     * participant) for negative-match search testing, instead of a fabricated nonsense string. */
    async peekTeamOptionText(index: number): Promise<string> {
        console.log(`Peeking Team dropdown option at index ${index} (not selecting it)...`);
        await this.clickCreateParticipant();
        await this.waitForParticipantPopupLoad();

        const panel = await this.openDropdown(this.participantTeamDropdown);
        const option = panel.locator(genericPredictorLocators.dropdownItem).nth(index);
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';

        // Confirmed live: re-clicking the trigger to close just the panel (as done in
        // selectParticipantPlayerOptionIfAvailable, where the dialog needs to STAY open) is
        // unreliable here — the panel can end up still covering the Cancel button underneath,
        // intercepting its click for the full 120s action timeout. Escape closes the panel AND
        // bubbles up to close the whole parent p-dialog too (same behavior noted elsewhere in
        // this suite) — exactly what's wanted here, since this popup was only opened to peek.
        await this.page.keyboard.press('Escape').catch(() => {});
        await this.page.waitForTimeout(300);
        return text;
    }

    /** Player is optional and confirmed live to sometimes have no data at all — selects the
     * first available option if the dropdown actually has any, otherwise leaves it blank.
     * Returns the selected player's text, or '' if left blank. */
    async selectParticipantPlayerOptionIfAvailable(): Promise<string> {
        console.log('Checking whether Player dropdown has any data...');

        const isDisabled = await this.participantPlayerDropdown.isDisabled().catch(() => false);
        if (isDisabled) {
            console.log('Player dropdown is disabled — no data, leaving it blank.');
            return '';
        }

        await this.clickElement(this.participantPlayerDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

        const option = panel.locator(genericPredictorLocators.dropdownItem).first();
        const hasData = await option.isVisible({ timeout: 2000 }).catch(() => false);

        if (!hasData) {
            // Confirmed live: unlike a p-calendar (its own aria-modal sub-dialog), a plain
            // p-dropdown panel is NOT an isolated modal — Escape isn't captured by it and bubbles
            // up to close the whole Create/Edit Participant p-dialog instead, wiping out
            // Participant Type/Role along with it. Re-clicking the dropdown's own trigger toggles
            // just the panel closed without touching the parent dialog.
            console.log('Player dropdown opened with no selectable options — leaving it blank.');
            await this.participantPlayerDropdown.click().catch(() => {});
            await this.page.waitForTimeout(300);
            return '';
        }

        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    async selectParticipantTypeOption(): Promise<string> {
        console.log('Selecting first available Participant Type...');
        return this.selectFirstOption(this.participantTypeDropdown);
    }

    async selectParticipantRoleOption(): Promise<string> {
        console.log('Selecting first available Participant Role...');
        return this.selectFirstOption(this.participantRoleDropdown);
    }

    async searchParticipants(text: string) {
        console.log(`Searching Participants for "${text}"...`);
        // Confirmed pattern elsewhere in this suite (fillExpiryTime): some inputs filter off real
        // keyup/keydown events, which .fill() never dispatches (it only fires 'input'/'change') —
        // pressSequentially types char-by-char so the list's debounce actually sees it.
        await this.participantsSearchInput.click({ clickCount: 3 });
        await this.participantsSearchInput.press('Backspace');
        await this.participantsSearchInput.pressSequentially(text, { delay: 50 });
        await this.page.waitForTimeout(800);
    }

    getParticipantRowByText(text: string): Locator {
        return this.participantsTable.locator('tbody tr', { hasText: text }).first();
    }

    async selectParticipantRow(text: string) {
        console.log(`Selecting participant row containing "${text}"...`);
        const row = this.getParticipantRowByText(text);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row);
    }

    async isParticipantRowVisible(text: string, timeout: number = 15000): Promise<boolean> {
        return this.getParticipantRowByText(text).waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async isParticipantRowAbsent(text: string, timeout: number = 20000): Promise<boolean> {
        return this.getParticipantRowByText(text).waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    // ─── Results (Event Participants row "Results" button) ────────────────────────
    //
    // Confirmed live: a PER-ROW button (same pattern as Edit/Delete — see clickEditParticipant's
    // note), opening a genuine `.p-dialog` with 3 fields: Is Winner*, Finish Position*,
    // Participant Score*. Identified by CONTENT (containing #isWinner), same reasoning as
    // captureOutcomePopup.

    get resultsPopup(): Locator {
        return this.page.locator('.p-dialog, [role="dialog"]')
            .filter({ has: this.isWinnerDropdown });
    }

    async clickResultsForParticipant(teamName: string) {
        console.log(`Clicking Results for Participant row "${teamName}"...`);
        const resultsBtn = this.getParticipantRowByText(teamName).locator(genericPredictorLocators.resultsParticipantBtn);
        await this.clickElement(resultsBtn);
        await this.page.waitForTimeout(500);
    }

    async openResultsForParticipant(teamName: string) {
        await this.clickResultsForParticipant(teamName);
        await this.resultsPopup.waitFor({ state: 'visible', timeout: 10000 });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectIsWinner(value: 'Yes' | 'No') {
        console.log(`Selecting Is Winner: "${value}"...`);
        await this.selectDropdown(this.isWinnerDropdown, value);
    }

    // Finish Position/Participant Score are p-inputnumber (min="0") — same click(x3)+
    // pressSequentially+Tab pattern already proven for this component type elsewhere in this
    // suite (Home/Away Score, Period Number, etc.).
    async fillFinishPosition(value: string) {
        console.log(`Filling Finish Position: "${value}"...`);
        await this.fillNumericField(this.finishPositionInput, value);
    }

    async fillParticipantScore(value: string) {
        console.log(`Filling Participant Score: "${value}"...`);
        await this.fillNumericField(this.participantScoreInput, value);
    }

    async getFinishPositionValue(): Promise<string> {
        return (await this.finishPositionInput.inputValue()).trim();
    }

    async getParticipantScoreValue(): Promise<string> {
        return (await this.participantScoreInput.inputValue()).trim();
    }


    /** Reads the participant row's "Is Winner" toggle state. Column confirmed live: the 5th data
     * column (after Team/Player/Participant Type/Participant Role, before the row's date column).
     * The switch itself is read-only in the table (data-p-disabled="true") — only changeable via
     * the Results popup, same read-only-switch pattern as isTestingToggleOn/isAutoOptinToggleOn. */
    async isParticipantWinnerToggleOn(teamName: string): Promise<boolean> {
        const toggle = this.getParticipantRowByText(teamName).locator('td').nth(4).locator('.p-inputswitch');
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    /** Same toggle as isParticipantWinnerToggleOn, but polls until it matches expectedOn or the
     * timeout elapses, instead of a single immediate read. Confirmed live: the table can take a
     * moment to refresh with the new state right after a Results save closes the dialog, and a
     * single read right after the save toast can still catch the pre-update value. Returns
     * whatever the toggle's actual state is when polling stops (matches expectedOn if it settled
     * in time, otherwise the last value observed). */
    async waitForParticipantWinnerToggleState(teamName: string, expectedOn: boolean, timeout: number = 15000): Promise<boolean> {
        const toggle = this.getParticipantRowByText(teamName).locator('td').nth(4).locator('.p-inputswitch');
        const deadline = Date.now() + timeout;
        let current = false;
        do {
            current = (await toggle.getAttribute('aria-checked').catch(() => null)) === 'true';
            if (current === expectedOn) return current;
            await this.page.waitForTimeout(300);
        } while (Date.now() < deadline);
        return current;
    }
}
