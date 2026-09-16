// npx playwright test tests/GenericPredictor.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToGenericPredictor(page: any, sidebarPage: any, genericPredictorPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToGenericPredictor();
    await genericPredictorPage.createBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreatePopup(genericPredictorPage: any) {
    await genericPredictorPage.clickCreatePredictor();
    await genericPredictorPage.waitForPopupLoad();
}

// Fills the 5 confirmed-mandatory core fields. Returns the Region text that was selected, since
// it's environment data (not safe to hardcode) and callers need it later to re-filter the list.
async function fillMandatoryFields(genericPredictorPage: any, name: string): Promise<string> {
    await genericPredictorPage.fillName(name);
    const region = await genericPredictorPage.selectFirstRegion();
    await genericPredictorPage.setStartDateTime();
    await genericPredictorPage.setEndDateTime();
    await genericPredictorPage.selectFirstLeague();
    return region;
}

// Creates a real Predictor with a unique, automation-generated name — used afterward to find/
// delete it (see the shared afterEach hooks below, which delete regardless of pass/fail so the
// database doesn't accumulate test data). Returns the Region it was created under.
async function createPredictor(page: any, genericPredictorPage: any, name: string): Promise<string> {
    await openCreatePopup(genericPredictorPage);
    const region = await fillMandatoryFields(genericPredictorPage, name);
    await page.waitForTimeout(300);

    await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await genericPredictorPage.clickSave();

    // A generic .p-toast-message-text check passes on an ERROR toast just as readily as a
    // success one — confirmed live this produces false-positive passes when the save actually
    // failed server-side. Scoping to the success class/severity catches that.
    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(toastText, 'Expected a SUCCESS toast confirming the Predictor was created').toBeVisible({ timeout: 15000 });
    console.log('Create Predictor toast message:', await toastText.textContent());

    const dialogClosedOnItsOwn = await genericPredictorPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await genericPredictorPage.clickCancel().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});
    return region;
}

// Creates a real Period under the given Predictor (mandatory fields only, neither checkbox
// checked — see TC-17), then opens its Events page via the Period row's "..." menu. Returns the
// Period name. Assumes the browser is already on that Predictor's Promotion Periods page.
async function createPeriod(page: any, genericPredictorPage: any, predictorName: string, region: string): Promise<string> {
    await genericPredictorPage.openPromotionPeriods(predictorName, region);
    await genericPredictorPage.clickCreatePeriod();
    await genericPredictorPage.waitForCreatePeriodPopupLoad();

    const periodName = `Period_${Date.now()}`;
    await genericPredictorPage.fillPeriodName(periodName);
    await genericPredictorPage.fillPeriodNumber('1');
    await genericPredictorPage.setPeriodStartDate();
    await genericPredictorPage.setPeriodEndDate();
    await page.waitForTimeout(300);

    await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
    await genericPredictorPage.clickSave();

    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(toastText, 'Expected a SUCCESS toast confirming the Period was created').toBeVisible({ timeout: 15000 });

    const isCreated = await genericPredictorPage.isPeriodVisibleByName(periodName);
    expect(isCreated, `Expected a Period row for "${periodName}" to appear`).toBe(true);

    return periodName;
}

// Creates a real Period under the given Predictor (see createPeriod), then opens its Events page
// via the Period row's "..." menu. Returns the Period name.
async function createPeriodAndOpenEvents(page: any, genericPredictorPage: any, predictorName: string, region: string): Promise<string> {
    const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
    await genericPredictorPage.openEventsForPeriod(periodName);
    return periodName;
}

// Creates a real Event under the currently-open Period Events page (mandatory fields only, no
// participants — see TC-24). Returns the Event name. Assumes the browser is already on that
// Period's Events page.
async function createEvent(page: any, genericPredictorPage: any): Promise<string> {
    await genericPredictorPage.clickCreateEvent();
    await genericPredictorPage.waitForCreateEventPopupLoad();

    const eventName = `Event_${Date.now()}`;
    await genericPredictorPage.fillEventName(eventName);
    await genericPredictorPage.setEventStartDateTime();
    await genericPredictorPage.selectEventLeague();
    await page.waitForTimeout(300);

    await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
    await genericPredictorPage.clickSave();

    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(toastText, 'Expected a SUCCESS toast confirming the Event was created').toBeVisible({ timeout: 15000 });

    const isVisible = await genericPredictorPage.isEventVisibleByName(eventName);
    expect(isVisible, `Expected an Event row for "${eventName}" to appear`).toBe(true);

    return eventName;
}

// Creates a real Event with `participantCount` participants under the currently-open Period
// Events page. Each participant gets Team/Participant Type/Participant Role filled (Team requires
// the Event's own League to be selected first — see selectParticipantTeam). Returns the Event
// name. Used for activating a Predictor, which requires >= 2 participants on its Period's Event.
async function createEventWithParticipants(page: any, genericPredictorPage: any, participantCount: number): Promise<string> {
    await genericPredictorPage.clickCreateEvent();
    await genericPredictorPage.waitForCreateEventPopupLoad();

    const eventName = `Event_${Date.now()}`;
    await genericPredictorPage.fillEventName(eventName);
    await genericPredictorPage.setEventStartDateTime();
    await genericPredictorPage.selectEventLeague();

    // Each participant needs a DISTINCT Team and a DISTINCT Participant Role — confirmed live
    // that duplicates of either across participants are rejected, silently blocking the Event
    // from saving.
    for (let i = 1; i <= participantCount; i++) {
        await genericPredictorPage.clickAddParticipant();
        await genericPredictorPage.selectParticipantTeamByIndex(i, i - 1);
        await genericPredictorPage.selectParticipantType(i);
        await genericPredictorPage.selectParticipantRoleByIndex(i, i - 1);
    }
    await page.waitForTimeout(300);

    await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields and participants filled').toBeEnabled({ timeout: 10000 });
    await genericPredictorPage.clickSave();

    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(toastText, 'Expected a SUCCESS toast confirming the Event was created').toBeVisible({ timeout: 15000 });

    const isVisible = await genericPredictorPage.isEventVisibleByName(eventName);
    expect(isVisible, `Expected an Event row for "${eventName}" to appear`).toBe(true);

    return eventName;
}

// Creates a real Participant on the currently-open Event Participants page (Team, Participant
// Type, Participant Role filled; Player filled only if its dropdown actually has data —
// confirmed live it sometimes has none, in which case it's left blank). Returns the selected
// Team name, used to identify its row afterward.
async function createParticipant(page: any, genericPredictorPage: any): Promise<string> {
    await genericPredictorPage.clickCreateParticipant();
    await genericPredictorPage.waitForParticipantPopupLoad();

    const teamName = await genericPredictorPage.selectParticipantTeamOption();
    const playerName = await genericPredictorPage.selectParticipantPlayerOptionIfAvailable();
    console.log(playerName ? `Player selected: "${playerName}"` : 'Player left blank (no data available).');
    await genericPredictorPage.selectParticipantTypeOption();
    await genericPredictorPage.selectParticipantRoleOption();
    await page.waitForTimeout(300);

    await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
    await genericPredictorPage.clickSave();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the participant was created').toBeVisible({ timeout: 15000 });

    const isVisible = await genericPredictorPage.isParticipantRowVisible(teamName);
    expect(isVisible, `Expected a Participant row for Team "${teamName}" to appear`).toBe(true);

    return teamName;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
    });

    test('TC-1 Verify Generic Predictor page is accessible', async ({ page, genericPredictorPage }, testInfo) => {
        await expect(genericPredictorPage.createBtn, 'Expected Create Predictor button').toBeVisible();
        await expect(genericPredictorPage.regionFilterDropdown, 'Expected Select a region filter').toBeVisible();
        await expect(genericPredictorPage.activeInactiveToggle, 'Expected Active/Inactive toggle').toBeVisible();
        await expect(genericPredictorPage.viewLeaguesBtn, 'Expected View Leagues button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_generic_predictor_page_accessible');
        console.log('Generic Predictor page is accessible with all key elements visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-2 to TC-7 — Create Popup Tests
//  None of these tests persist a Predictor — each ends by closing the popup (Cancel), so no
//  cleanup is needed in this describe block.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Create Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await openCreatePopup(genericPredictorPage);
    });

    test('TC-2 Verify clicking Create Predictor opens the popup with all 5 core fields', async ({ page, genericPredictorPage }, testInfo) => {
        await expect(genericPredictorPage.popupDialog, 'Expected the popup to open').toBeVisible({ timeout: 15000 });

        await expect(genericPredictorPage.nameInput, 'Expected Promotion Name field').toBeVisible();
        await expect(genericPredictorPage.regionDropdown, 'Expected Region field').toBeVisible();
        await expect(genericPredictorPage.startDateTimeInput, 'Expected Start Date Time field').toBeVisible();
        await expect(genericPredictorPage.endDateTimeInput, 'Expected End Date Time field').toBeVisible();
        await expect(genericPredictorPage.leagueDropdown, 'Expected League field').toBeVisible();
        await expect(genericPredictorPage.advancedAccordionHeader, 'Expected the Advanced accordion header').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_popup_core_fields');
        console.log('Create Predictor popup opens with all 5 core fields and the Advanced accordion.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-3 Verify Save is disabled when all mandatory fields are empty', async ({ page, genericPredictorPage }, testInfo) => {
        await expect(genericPredictorPage.saveBtn, 'Expected Save to be disabled with no fields filled').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_save_disabled_empty');
        console.log('Save stays disabled while all 5 mandatory fields are empty.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-4 Verify expanding "Advanced" reveals all 14 advanced fields and 11 checkboxes', async ({ page, genericPredictorPage }, testInfo) => {
        expect(await genericPredictorPage.isAdvancedExpanded(), 'Expected Advanced to start collapsed').toBe(false);
        await expect(genericPredictorPage.participationStartDateTimeInput, 'Expected Participation Start Date Time to be hidden before expanding').not.toBeVisible();

        await genericPredictorPage.expandAdvanced();
        expect(await genericPredictorPage.isAdvancedExpanded(), 'Expected Advanced to be expanded').toBe(true);

        await expect(genericPredictorPage.participationStartDateTimeInput, 'Expected Participation Start Date Time field').toBeVisible();
        await expect(genericPredictorPage.participationEndDateTimeInput, 'Expected Participation End Date Time field').toBeVisible();
        await expect(genericPredictorPage.predictionStartDateTimeInput, 'Expected Prediction Start Date Time field').toBeVisible();
        await expect(genericPredictorPage.predictionEndDateTimeInput, 'Expected Prediction End Date Time field').toBeVisible();
        await expect(genericPredictorPage.minimumSelectionsInput, 'Expected Minimum Selections field').toBeVisible();
        await expect(genericPredictorPage.maximumSelectionsInput, 'Expected Maximum Selections field').toBeVisible();
        await expect(genericPredictorPage.minimumDepositInput, 'Expected Minimum Deposit field').toBeVisible();
        await expect(genericPredictorPage.maximumWagerInput, 'Expected Maximum Wager field').toBeVisible();
        await expect(genericPredictorPage.competitionTypeInput, 'Expected Competition Type field').toBeVisible();
        await expect(genericPredictorPage.redirectUrlInput, 'Expected Redirect Url field').toBeVisible();
        await expect(genericPredictorPage.sportIdInput, 'Expected Sport Id field').toBeVisible();
        await expect(genericPredictorPage.leagueNameInput, 'Expected League Name field').toBeVisible();
        await expect(genericPredictorPage.leagueCountryInput, 'Expected League Country field').toBeVisible();
        await expect(genericPredictorPage.allocationCompCodeDropdown, 'Expected Allocation Comp Code field').toBeVisible();

        await expect(genericPredictorPage.duplicateTeamsCheckbox, 'Expected Duplicate Teams checkbox').toBeVisible();
        await expect(genericPredictorPage.allowRepeatTeamsCheckbox, 'Expected Allow Repeat Teams checkbox').toBeVisible();
        await expect(genericPredictorPage.multiTeamCheckbox, 'Expected Multi Team checkbox').toBeVisible();
        await expect(genericPredictorPage.requireOrderedSelectionCheckbox, 'Expected Require Ordered Selection checkbox').toBeVisible();
        await expect(genericPredictorPage.requiresMaxSelectionCheckbox, 'Expected Requires Max Selection checkbox').toBeVisible();
        await expect(genericPredictorPage.drawSelectionsCheckbox, 'Expected Draw Selections checkbox').toBeVisible();
        await expect(genericPredictorPage.isMultiRoundCheckbox, 'Expected Is Multi Round checkbox').toBeVisible();
        await expect(genericPredictorPage.multiWinnerCheckbox, 'Expected Multi Winner checkbox').toBeVisible();
        await expect(genericPredictorPage.requiresTicketCheckbox, 'Expected Requires Ticket checkbox').toBeVisible();
        await expect(genericPredictorPage.isTestingCheckbox, 'Expected Is Testing checkbox').toBeVisible();
        await expect(genericPredictorPage.isAutoOptinCheckbox, 'Expected Is Auto Optin checkbox').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_advanced_expanded');
        console.log('Expanding Advanced reveals all 14 advanced fields and 11 checkboxes.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-5 Verify all 11 checkboxes default OFF and can each be toggled on', async ({ page, genericPredictorPage }, testInfo) => {
        await genericPredictorPage.expandAdvanced();

        expect(await genericPredictorPage.isDuplicateTeamsChecked(), 'Expected Duplicate Teams to default OFF').toBe(false);
        expect(await genericPredictorPage.isAllowRepeatTeamsChecked(), 'Expected Allow Repeat Teams to default OFF').toBe(false);
        expect(await genericPredictorPage.isMultiTeamChecked(), 'Expected Multi Team to default OFF').toBe(false);
        expect(await genericPredictorPage.isRequireOrderedSelectionChecked(), 'Expected Require Ordered Selection to default OFF').toBe(false);
        expect(await genericPredictorPage.isRequiresMaxSelectionChecked(), 'Expected Requires Max Selection to default OFF').toBe(false);
        expect(await genericPredictorPage.isDrawSelectionsChecked(), 'Expected Draw Selections to default OFF').toBe(false);
        expect(await genericPredictorPage.isMultiRoundChecked(), 'Expected Is Multi Round to default OFF').toBe(false);
        expect(await genericPredictorPage.isMultiWinnerChecked(), 'Expected Multi Winner to default OFF').toBe(false);
        expect(await genericPredictorPage.isRequiresTicketChecked(), 'Expected Requires Ticket to default OFF').toBe(false);
        expect(await genericPredictorPage.isTestingChecked(), 'Expected Is Testing to default OFF').toBe(false);
        expect(await genericPredictorPage.isAutoOptinChecked(), 'Expected Is Auto Optin to default OFF').toBe(false);

        await genericPredictorPage.toggleDuplicateTeams();
        expect(await genericPredictorPage.isDuplicateTeamsChecked(), 'Expected Duplicate Teams to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleAllowRepeatTeams();
        expect(await genericPredictorPage.isAllowRepeatTeamsChecked(), 'Expected Allow Repeat Teams to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleMultiTeam();
        expect(await genericPredictorPage.isMultiTeamChecked(), 'Expected Multi Team to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleRequireOrderedSelection();
        expect(await genericPredictorPage.isRequireOrderedSelectionChecked(), 'Expected Require Ordered Selection to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleRequiresMaxSelection();
        expect(await genericPredictorPage.isRequiresMaxSelectionChecked(), 'Expected Requires Max Selection to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleDrawSelections();
        expect(await genericPredictorPage.isDrawSelectionsChecked(), 'Expected Draw Selections to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleIsMultiRound();
        expect(await genericPredictorPage.isMultiRoundChecked(), 'Expected Is Multi Round to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleMultiWinner();
        expect(await genericPredictorPage.isMultiWinnerChecked(), 'Expected Multi Winner to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleRequiresTicket();
        expect(await genericPredictorPage.isRequiresTicketChecked(), 'Expected Requires Ticket to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleIsTesting();
        expect(await genericPredictorPage.isTestingChecked(), 'Expected Is Testing to turn ON after toggling').toBe(true);
        await genericPredictorPage.toggleIsAutoOptin();
        expect(await genericPredictorPage.isAutoOptinChecked(), 'Expected Is Auto Optin to turn ON after toggling').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_checkbox_defaults_and_toggle');
        console.log('All 11 checkboxes default OFF and each toggles ON correctly.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-6 Verify Save stays disabled until all 5 mandatory fields are filled', async ({ page, genericPredictorPage }, testInfo) => {
        await genericPredictorPage.fillName(`Predictor_${Date.now()}`);
        await page.waitForTimeout(200);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with only Promotion Name filled').toBeDisabled();

        await genericPredictorPage.selectFirstRegion();
        await page.waitForTimeout(200);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with Start/End Date Time and League still empty').toBeDisabled();

        await genericPredictorPage.setStartDateTime();
        await page.waitForTimeout(200);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with End Date Time and League still empty').toBeDisabled();

        await genericPredictorPage.setEndDateTime();
        await page.waitForTimeout(200);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with League still empty').toBeDisabled();

        await genericPredictorPage.selectFirstLeague();
        await page.waitForTimeout(200);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to become enabled once all 5 mandatory fields are filled').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_mandatory_fields');
        console.log('Save stays disabled until Promotion Name, Region, Start/End Date Time and League are all filled.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-7 Verify Cancel closes the popup without creating a Predictor', async ({ page, genericPredictorPage }, testInfo) => {
        await genericPredictorPage.fillName(`Predictor_${Date.now()}`);
        await page.waitForTimeout(300);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_before_cancel');

        await genericPredictorPage.clickCancel();

        await expect(genericPredictorPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_after_cancel');
        console.log('Cancel closes the Create Predictor popup without saving.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-8 to TC-10 — Create and Verify Tests
//  Each test creates a real Predictor, verifies it, then the shared afterEach deletes it —
//  regardless of pass/fail — so the database doesn't accumulate test data. Deleting requires
//  re-selecting the Region it was created under and switching the list to Inactive (confirmed
//  live: new predictors are inactive by default, and the list defaults to Active-only).
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Create and Verify Tests', () => {
    let createdName: string | undefined;
    let createdRegion: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        createdName = undefined;
        createdRegion = undefined;
    });

    test.afterEach(async ({ genericPredictorPage }) => {
        if (!createdName || !createdRegion) return;
        const nameToDelete = createdName;
        const regionToDelete = createdRegion;
        createdName = undefined;
        createdRegion = undefined;
        await genericPredictorPage.deletePredictorIfPresent(nameToDelete, regionToDelete);
    });

    test('TC-8 Verify Save successfully creates a Predictor with only mandatory fields filled', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isVisible = await genericPredictorPage.isPredictorVisibleByName(name);
        expect(isVisible, `Expected a Predictor row for "${name}" to appear once filtered to its Region and Inactive`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_mandatory_only_created');
        console.log(`✅ TC-8 PASSED — Predictor created for "${name}" with only mandatory fields and verified via the list.`);
    });

    test('TC-9 Verify Save successfully creates a Predictor with all Advanced fields and checkboxes filled', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        await openCreatePopup(genericPredictorPage);
        const region = await fillMandatoryFields(genericPredictorPage, name);

        await genericPredictorPage.expandAdvanced();
        await genericPredictorPage.setParticipationStartDateTime();
        await genericPredictorPage.setParticipationEndDateTime();
        await genericPredictorPage.setPredictionStartDateTime();
        await genericPredictorPage.setPredictionEndDateTime();
        await genericPredictorPage.fillMinimumSelections('1');
        await genericPredictorPage.fillMaximumSelections('5');
        await genericPredictorPage.fillMinimumDeposit('10');
        await genericPredictorPage.fillMaximumWager('100');
        await genericPredictorPage.fillCompetitionType('League');
        await genericPredictorPage.fillRedirectUrl('https://example.com');
        await genericPredictorPage.fillSportId('1');
        await genericPredictorPage.fillLeagueName('Automation League');
        await genericPredictorPage.fillLeagueCountry('Automation Country');
        await genericPredictorPage.selectFirstAllocationCompCode();

        await genericPredictorPage.toggleDuplicateTeams();
        await genericPredictorPage.toggleAllowRepeatTeams();
        await genericPredictorPage.toggleMultiTeam();
        await genericPredictorPage.toggleRequireOrderedSelection();
        await genericPredictorPage.toggleRequiresMaxSelection();
        await genericPredictorPage.toggleDrawSelections();
        await genericPredictorPage.toggleIsMultiRound();
        await genericPredictorPage.toggleMultiWinner();
        await genericPredictorPage.toggleRequiresTicket();
        await genericPredictorPage.toggleIsTesting();
        await genericPredictorPage.toggleIsAutoOptin();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with every field filled').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Predictor was created').toBeVisible({ timeout: 15000 });
        console.log('Create Predictor toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await genericPredictorPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await genericPredictorPage.clickCancel().catch(() => {});
        }
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isVisible = await genericPredictorPage.isPredictorVisibleByName(name);
        expect(isVisible, `Expected a Predictor row for "${name}" to appear once filtered to its Region and Inactive`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_all_advanced_fields_created');
        console.log(`✅ TC-9 PASSED — Predictor created for "${name}" with every Advanced field and checkbox filled, and verified via the list.`);
    });

    test('TC-10 Verify a newly created Predictor defaults to Inactive', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);

        const activeFilterDefaultsOn = await genericPredictorPage.isActiveFilterOn();
        expect(activeFilterDefaultsOn, 'Expected the list to default to showing Active predictors only').toBe(true);

        const visibleUnderActive = await genericPredictorPage.isPredictorVisibleByName(name, 5000);
        expect(visibleUnderActive, 'Expected a freshly created Predictor to NOT appear while the Active filter is on').toBe(false);

        await genericPredictorPage.toggleActiveInactiveFilter();
        const visibleUnderInactive = await genericPredictorPage.isPredictorVisibleByName(name);
        expect(visibleUnderInactive, 'Expected the freshly created Predictor to appear once the filter is switched to Inactive').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_defaults_to_inactive');
        console.log(`✅ TC-10 PASSED — Predictor "${name}" defaulted to Inactive as expected.`);
    });
});

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-11 to TC-12 — Edit and Delete Tests
// //  Each test creates a real Predictor, then edits/deletes it via the row's "..." menu — only
// //  reachable from the Inactive list under its own Region (confirmed live). The shared afterEach
// //  deletes it (by whichever name is current) regardless of pass/fail, so the database doesn't
// //  accumulate test data — deletePredictorIfPresent is safe to call even if already removed.
// // ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Edit and Delete Tests', () => {
    let createdName: string | undefined;
    let createdRegion: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        createdName = undefined;
        createdRegion = undefined;
    });

    test.afterEach(async ({ genericPredictorPage }) => {
        if (!createdName || !createdRegion) return;
        const nameToDelete = createdName;
        const regionToDelete = createdRegion;
        createdName = undefined;
        createdRegion = undefined;
        await genericPredictorPage.deletePredictorIfPresent(nameToDelete, regionToDelete);
    });

    test('TC-11 Verify editing a Predictor updates its Promotion Name', async ({ page, genericPredictorPage }, testInfo) => {
        const originalName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, originalName);
        createdName = originalName;
        createdRegion = region;

        await genericPredictorPage.clickEditForPredictor(originalName, region);
        await genericPredictorPage.waitForPopupLoad();

        const updatedName = `${originalName}_Edited`;
        await genericPredictorPage.fillName(updatedName);
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled after editing the Promotion Name').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Predictor was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Predictor toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await genericPredictorPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await genericPredictorPage.clickCancel().catch(() => {});
        }

        // From here on, the record only exists under its NEW name — clean up that one instead.
        createdName = updatedName;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isVisible = await genericPredictorPage.isPredictorVisibleByName(updatedName);
        expect(isVisible, `Expected a Predictor row for the updated name "${updatedName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_edit_updates_name');
        console.log(`✅ TC-11 PASSED — Predictor renamed from "${originalName}" to "${updatedName}" and verified via the list.`);
    });

    test('TC-12 Verify deleting a Predictor removes it from the list', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isVisibleBeforeDelete = await genericPredictorPage.isPredictorVisibleByName(name);
        expect(isVisibleBeforeDelete, `Expected a Predictor row for "${name}" to exist before deleting`).toBe(true);

        await genericPredictorPage.clickRowMenuForPredictor(name);
        await genericPredictorPage.clickDeleteFromRowMenu();
        await expect(genericPredictorPage.confirmYesBtn, 'Expected a Yes/No delete confirmation modal').toBeVisible({ timeout: 10000 });
        await genericPredictorPage.clickConfirmYes();

        const isAbsentAfterDelete = await genericPredictorPage.isPredictorAbsentByName(name);
        expect(isAbsentAfterDelete, `Expected the Predictor row for "${name}" to disappear after deleting`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_delete_removes_predictor');
        console.log(`✅ TC-12 PASSED — Predictor "${name}" deleted and confirmed removed from the list.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-13 to TC-19 — Promotion Periods Tests
//  Each test creates a real Predictor first (Promotion Periods lives under a specific predictor),
//  then opens Promotion Periods via the row's "..." menu — only reachable from the Inactive list
//  under the predictor's own Region (same rule as Edit/Delete). The shared afterEach deletes the
//  Predictor regardless of pass/fail; deleting it is assumed to cascade-remove its Periods too.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Promotion Periods Tests', () => {
    let createdName: string | undefined;
    let createdRegion: string | undefined;
    let createdPeriodName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        createdName = undefined;
        createdRegion = undefined;
        createdPeriodName = undefined;
    });

    test.afterEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        if (createdPeriodName && createdName && createdRegion) {
            const periodNameToDelete = createdPeriodName;
            const predictorNameForPeriod = createdName;
            const regionForPeriod = createdRegion;
            createdPeriodName = undefined;
            // Cleanup must be self-sufficient regardless of where the test left off (including a
            // failed test mid-flow) — re-navigate via the hamburger menu to the Generic Predictor
            // list page before filtering/toggling to find the specific predictor's periods.
            await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
            await genericPredictorPage.deletePeriodIfPresent(periodNameToDelete, predictorNameForPeriod, regionForPeriod);
        }
        if (!createdName || !createdRegion) return;
        const nameToDelete = createdName;
        const regionToDelete = createdRegion;
        createdName = undefined;
        createdRegion = undefined;
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.deletePredictorIfPresent(nameToDelete, regionToDelete);
    });

    test('TC-13 Verify Promotion Periods opens from the row menu with a Create Period button', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(name, region);
        expect(await genericPredictorPage.isCreatePeriodButtonVisible(), 'Expected a Create Period button').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_promotion_periods_opens');
        console.log('Promotion Periods opens from the row menu with a Create Period button.');
    });

    test('TC-14 Verify clicking Create Period opens the popup with all 4 fields and 2 checkboxes', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(name, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        expect(await genericPredictorPage.isFieldVisibleByLabel('Period Name'), 'Expected Period Name field').toBe(true);
        expect(await genericPredictorPage.isFieldVisibleByLabel('Period Number'), 'Expected Period Number field').toBe(true);
        expect(await genericPredictorPage.isFieldVisibleByLabel('Start Date'), 'Expected Start Date field').toBe(true);
        expect(await genericPredictorPage.isFieldVisibleByLabel('End Date'), 'Expected End Date field').toBe(true);
        expect(await genericPredictorPage.isFieldVisibleByLabel('Practice Round'), 'Expected Practice Round checkbox').toBe(true);
        expect(await genericPredictorPage.isFieldVisibleByLabel('First Competitive Week'), 'Expected First Competitive Week checkbox').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_create_period_popup_fields');
        console.log('Create Period popup opens with all 4 fields and 2 checkboxes.');

        await genericPredictorPage.clickCancel().catch(() => {});
    });

    test('TC-15 Verify Period Number only accepts integer input', async ({ page, genericPredictorPage }, testInfo) => {
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(name, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        await genericPredictorPage.fillPeriodNumber('12.34abc');
        const value = await genericPredictorPage.getPeriodNumberValue();
        expect(/^\d*$/.test(value), `Expected Period Number to only contain digits, got "${value}"`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_period_number_integer_only');
        console.log(`Period Number rejected non-integer characters — resulting value: "${value}".`);

        await genericPredictorPage.clickCancel().catch(() => {});
    });

    test('TC-16 Verify a Period cannot be created when both Practice Round and First Competitive Week are checked', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const periodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(periodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await genericPredictorPage.togglePracticeRound();
        await genericPredictorPage.toggleCompetitiveWeek();
        await page.waitForTimeout(300);

        const canSave = await genericPredictorPage.saveBtn.isEnabled().catch(() => false);
        if (canSave) {
            await genericPredictorPage.clickSave();
            await page.waitForTimeout(1000);
        }

        const wasCreated = await genericPredictorPage.isPeriodVisibleByName(periodName, 5000);
        expect(wasCreated, 'Expected the Period to NOT be created when both Practice Round and First Competitive Week are checked').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_both_checkboxes_checked_fails');
        console.log('A Period is correctly not created when both Practice Round and First Competitive Week are checked.');

        await genericPredictorPage.clickCancel().catch(() => {});
    });

    // Confirmed: Practice Round / First Competitive Week are NOT mandatory — the "either one of
    // them must be checked" rule only bites when BOTH are checked at once (see TC-16); leaving
    // both unchecked is valid and should create the Period successfully, same as TC-18/19.
    test('TC-17 Verify a Period is created successfully when neither Practice Round nor First Competitive Week is checked', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const periodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(periodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with neither checkbox checked').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Period was created').toBeVisible({ timeout: 15000 });
        console.log('Create Period toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isPeriodVisibleByName(periodName);
        expect(isVisible, `Expected a Period row for "${periodName}" to appear`).toBe(true);
        createdPeriodName = periodName;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_neither_checkbox_checked_succeeds');
        console.log(`✅ TC-17 PASSED — Period "${periodName}" created successfully with neither checkbox checked.`);
    });

    test('TC-18 Verify a Period is created successfully when only Practice Round is checked', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const periodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(periodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await genericPredictorPage.togglePracticeRound();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with only Practice Round checked').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Period was created').toBeVisible({ timeout: 15000 });
        console.log('Create Period toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isPeriodVisibleByName(periodName);
        expect(isVisible, `Expected a Period row for "${periodName}" to appear`).toBe(true);
        createdPeriodName = periodName;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_practice_round_only_succeeds');
        console.log(`✅ TC-18 PASSED — Period "${periodName}" created successfully with only Practice Round checked.`);
    });

    test('TC-19 Verify a Period is created successfully when only First Competitive Week is checked', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const periodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(periodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await genericPredictorPage.toggleCompetitiveWeek();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with only First Competitive Week checked').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Period was created').toBeVisible({ timeout: 15000 });
        console.log('Create Period toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isPeriodVisibleByName(periodName);
        expect(isVisible, `Expected a Period row for "${periodName}" to appear`).toBe(true);
        createdPeriodName = periodName;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_first_competitive_only_succeeds');
        console.log(`✅ TC-19 PASSED — Period "${periodName}" created successfully with only First Competitive Week checked.`);
    });

    test('TC-20 Verify editing a Period updates its Period Name', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const originalPeriodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(originalPeriodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const createToastText = page.locator('.p-toast-message-text').first();
        await expect(createToastText, 'Expected a toast confirming the Period was created').toBeVisible({ timeout: 15000 });
        console.log('Create Period toast message:', await createToastText.textContent());

        const isCreated = await genericPredictorPage.isPeriodVisibleByName(originalPeriodName);
        expect(isCreated, `Expected a Period row for "${originalPeriodName}" to appear`).toBe(true);
        createdPeriodName = originalPeriodName;

        // Click on "..." then Edit (aria-label="Edit", pi-pencil icon — confirmed live) to open
        // the Edit popup, pre-filled with the Period's current data.
        await genericPredictorPage.clickEditForPeriod(originalPeriodName);
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const prefilledName = (await genericPredictorPage.periodNameInput.inputValue()).trim();
        expect(prefilledName, 'Expected the Edit popup to pre-fill the current Period Name').toBe(originalPeriodName);

        const updatedPeriodName = `${originalPeriodName}_Edited`;
        await genericPredictorPage.fillPeriodName(updatedPeriodName);
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled after editing the Period Name').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const editToastText = page.locator('.p-toast-message-text').first();
        await expect(editToastText, 'Expected a toast confirming the Period was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Period toast message:', await editToastText.textContent());

        const dialogClosedOnItsOwn = await genericPredictorPage.createPeriodPopup.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await genericPredictorPage.clickCancel().catch(() => {});
        }

        // From here on, the record only exists under its NEW name — clean up that one instead.
        createdPeriodName = updatedPeriodName;

        const isVisibleAfterEdit = await genericPredictorPage.isPeriodVisibleByName(updatedPeriodName);
        expect(isVisibleAfterEdit, `Expected a Period row for the updated name "${updatedPeriodName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_edit_updates_period_name');
        console.log(`✅ TC-20 PASSED — Period renamed from "${originalPeriodName}" to "${updatedPeriodName}" and verified via the list.`);
    });

    test('TC-21 Verify deleting a Period removes it from the list', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.openPromotionPeriods(predictorName, region);
        await genericPredictorPage.clickCreatePeriod();
        await genericPredictorPage.waitForCreatePeriodPopupLoad();

        const periodName = `Period_${Date.now()}`;
        await genericPredictorPage.fillPeriodName(periodName);
        await genericPredictorPage.fillPeriodNumber('1');
        await genericPredictorPage.setPeriodStartDate();
        await genericPredictorPage.setPeriodEndDate();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Period was created').toBeVisible({ timeout: 15000 });
        console.log('Create Period toast message:', await toastText.textContent());

        const isVisibleBeforeDelete = await genericPredictorPage.isPeriodVisibleByName(periodName);
        expect(isVisibleBeforeDelete, `Expected a Period row for "${periodName}" to exist before deleting`).toBe(true);
        createdPeriodName = periodName;

        await genericPredictorPage.clickRowMenuForPeriod(periodName);
        await genericPredictorPage.clickDeleteFromPeriodRowMenu();
        await expect(genericPredictorPage.confirmYesBtn, 'Expected a Yes/No delete confirmation modal').toBeVisible({ timeout: 10000 });
        await genericPredictorPage.clickConfirmYes();

        const isAbsentAfterDelete = await genericPredictorPage.isPeriodAbsentByName(periodName);
        expect(isAbsentAfterDelete, `Expected the Period row for "${periodName}" to disappear after deleting`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_delete_removes_period');
        console.log(`✅ TC-21 PASSED — Period "${periodName}" deleted and confirmed removed from the list.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-22 to TC-27 — Period Events Tests
//  Each test creates a real Predictor and Period first (Events lives under a specific Period),
//  then opens Events via the Period row's "..." menu. Per the create/delete rule, the shared
//  afterEach deletes only the Predictor regardless of pass/fail — deleting it is assumed to
//  cascade-remove its Periods and Events too, so entries don't accumulate in the database.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Generic Predictor - Period Events Tests', () => {
    let createdName: string | undefined;
    let createdRegion: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        createdName = undefined;
        createdRegion = undefined;
    });

    test.afterEach(async ({ page, sidebarPage, genericPredictorPage }) => {
        if (!createdName || !createdRegion) return;
        const nameToDelete = createdName;
        const regionToDelete = createdRegion;
        createdName = undefined;
        createdRegion = undefined;
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.deletePredictorIfPresent(nameToDelete, regionToDelete);
    });

    test('TC-22 Verify Events opens from the Period row menu with a Create Event button', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);

        expect(await genericPredictorPage.createEventBtn.isVisible(), 'Expected a Create Event button on the Period Events page').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_events_page_opens');
        console.log('Period Events page opens from the row menu with a Create Event button.');
    });

    test('TC-23 Verify clicking Create Event opens the popup with all 3 fields and an Add Participant button', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.clickCreateEvent();
        await genericPredictorPage.waitForCreateEventPopupLoad();

        await expect(genericPredictorPage.eventNameInput, 'Expected Event Name field').toBeVisible();
        await expect(genericPredictorPage.eventStartDateTimeInput, 'Expected Event Start Date Time field').toBeVisible();
        await expect(genericPredictorPage.eventLeagueDropdown, 'Expected League field').toBeVisible();
        await expect(genericPredictorPage.addParticipantBtn, 'Expected Add Participant button').toBeVisible();
        await expect(genericPredictorPage.saveBtn, 'Expected Save to be disabled with no fields filled').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_create_event_popup_fields');
        console.log('Create Event popup shows all 3 fields and an Add Participant button.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-24 Verify an Event can be created successfully without adding any participant', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.clickCreateEvent();
        await genericPredictorPage.waitForCreateEventPopupLoad();

        const eventName = `Event_${Date.now()}`;
        await genericPredictorPage.fillEventName(eventName);
        await genericPredictorPage.setEventStartDateTime();
        await genericPredictorPage.selectEventLeague();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled and no participants').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Event was created').toBeVisible({ timeout: 15000 });
        console.log('Create Event toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isEventVisibleByName(eventName);
        expect(isVisible, `Expected an Event row for "${eventName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_event_created_without_participant');
        console.log(`✅ TC-24 PASSED — Event "${eventName}" created successfully without any participant.`);
    });

    test('TC-25 Verify Add Participant reveals Team, Participant Type and Participant Role fields, and can be clicked multiple times', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.clickCreateEvent();
        await genericPredictorPage.waitForCreateEventPopupLoad();

        await genericPredictorPage.clickAddParticipant();
        await expect(genericPredictorPage.getParticipantTeamDropdown(1), 'Expected Team field for Participant 1').toBeVisible();
        await expect(genericPredictorPage.getParticipantTypeDropdown(1), 'Expected Participant Type field for Participant 1').toBeVisible();
        await expect(genericPredictorPage.getParticipantRoleDropdown(1), 'Expected Participant Role field for Participant 1').toBeVisible();
        expect(await genericPredictorPage.getParticipantCount(), 'Expected 1 participant block after clicking Add Participant once').toBe(1);

        await genericPredictorPage.clickAddParticipant();
        await expect(genericPredictorPage.getParticipantTeamDropdown(2), 'Expected Team field for Participant 2').toBeVisible();
        expect(await genericPredictorPage.getParticipantCount(), 'Expected 2 participant blocks after clicking Add Participant twice').toBe(2);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_multiple_participants_added');
        console.log('Add Participant reveals Team/Participant Type/Participant Role and can be clicked multiple times to add multiple blocks.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-26 Verify deleting a participant removes its block', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.clickCreateEvent();
        await genericPredictorPage.waitForCreateEventPopupLoad();

        await genericPredictorPage.clickAddParticipant();
        await genericPredictorPage.clickAddParticipant();
        expect(await genericPredictorPage.getParticipantCount(), 'Expected 2 participant blocks before deleting').toBe(2);

        await genericPredictorPage.deleteParticipant(2);
        await page.waitForTimeout(300);
        expect(await genericPredictorPage.getParticipantCount(), 'Expected 1 participant block after deleting Participant 2').toBe(1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_delete_participant');
        console.log('Deleting a participant removes its block.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-27 Verify an Event can be created successfully with one fully-filled participant', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.clickCreateEvent();
        await genericPredictorPage.waitForCreateEventPopupLoad();

        const eventName = `Event_${Date.now()}`;
        await genericPredictorPage.fillEventName(eventName);
        await genericPredictorPage.setEventStartDateTime();
        // Team is confirmed disabled until a League is chosen, so select League before adding a
        // participant.
        await genericPredictorPage.selectEventLeague();

        await genericPredictorPage.clickAddParticipant();
        await genericPredictorPage.selectParticipantTeam(1);
        await genericPredictorPage.selectParticipantType(1);
        await genericPredictorPage.selectParticipantRole(1);
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields and one full participant filled').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Event was created').toBeVisible({ timeout: 15000 });
        console.log('Create Event toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isEventVisibleByName(eventName);
        expect(isVisible, `Expected an Event row for "${eventName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_event_created_with_participant');
        console.log(`✅ TC-27 PASSED — Event "${eventName}" created successfully with one fully-filled participant.`);
    });

    test('TC-28 Verify editing an Event updates its Event Name', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const originalEventName = await createEvent(page, genericPredictorPage);

        // Click on "..." then Edit (aria-label-free menu item, confirmed live) to open the Edit
        // popup, pre-filled with the Event's current data.
        await genericPredictorPage.clickEditForEvent(originalEventName);
        await genericPredictorPage.waitForCreateEventPopupLoad();

        const prefilledName = (await genericPredictorPage.eventNameInput.inputValue()).trim();
        expect(prefilledName, 'Expected the Edit popup to pre-fill the current Event Name').toBe(originalEventName);

        const updatedEventName = `${originalEventName}_Edited`;
        await genericPredictorPage.fillEventName(updatedEventName);
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled after editing the Event Name').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const editToastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(editToastText, 'Expected a SUCCESS toast confirming the Event was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Event toast message:', await editToastText.textContent());

        const dialogClosedOnItsOwn = await genericPredictorPage.eventPopup.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await genericPredictorPage.clickCancel().catch(() => {});
        }

        const isVisibleAfterEdit = await genericPredictorPage.isEventVisibleByName(updatedEventName);
        expect(isVisibleAfterEdit, `Expected an Event row for the updated name "${updatedEventName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_edit_updates_event_name');
        console.log(`✅ TC-28 PASSED — Event renamed from "${originalEventName}" to "${updatedEventName}" and verified via the list.`);
    });

    test('TC-29 Verify cancelling an Event displays a confirmation toast message', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        // Click on "..." then Cancel (confirmed live) — validated via the resulting toast message
        // rather than list-state change, since a cancelled Event's list-visibility isn't a
        // reliably confirmed signal.
        await genericPredictorPage.cancelEvent(eventName);

        // Confirmed live: cancelling an Event currently returns an ERROR toast, not success —
        // a genuine product bug, not a test-scoping issue. Scoping to the success class/severity
        // (same as the create/edit toast checks above) is intentional: a generic
        // .p-toast-message-text check would pass on that error toast just as readily as a real
        // success one, silently masking this bug instead of surfacing it. This assertion is
        // EXPECTED to fail until Cancel Event is actually fixed server-side.
        const cancelToastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(cancelToastText, 'Expected a SUCCESS toast confirming the Event was cancelled').toBeVisible({ timeout: 15000 });
        console.log('Cancel Event toast message:', await cancelToastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_cancel_event_toast');
        console.log(`✅ TC-29 PASSED — Cancelling Event "${eventName}" displayed a confirmation toast: "${await cancelToastText.textContent()}".`);
    });

    test('TC-30 Verify Capture Outcome popup opens with Result Type, Home Score and Away Score fields', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openCaptureOutcomeForEvent(eventName);

        await expect(genericPredictorPage.resultTypeDropdown, 'Expected Result Type field').toBeVisible();
        await expect(genericPredictorPage.homeScoreInput, 'Expected Home Score field').toBeVisible();
        await expect(genericPredictorPage.awayScoreInput, 'Expected Away Score field').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_capture_outcome_popup_fields');
        console.log('Capture Outcome popup opens with Result Type, Home Score and Away Score fields.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-31 Verify Save stays disabled when Home Score is a negative number', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openCaptureOutcomeForEvent(eventName);
        await genericPredictorPage.selectResultType('Away');
        // pressSequentially types character-by-character, and this p-inputnumber's own keydown
        // filtering can silently swallow the "-" before it registers, leaving a stripped positive
        // value — .fill()-based fillHomeScoreRaw bypasses that so the negative value actually
        // lands in the field.
        await genericPredictorPage.fillHomeScoreRaw('-5');
        await genericPredictorPage.fillAwayScore('10');
        await page.waitForTimeout(300);

        const homeScoreValue = await genericPredictorPage.getHomeScoreValue();
        console.log(`Home Score field value after entering "-5": "${homeScoreValue}"`);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with a negative Home Score').toBeDisabled();

        // Live-verified: whatever validation message actually appears (inline error and/or toast)
        // for a negative score — logged rather than asserted on exact wording, since it wasn't
        // confirmed beforehand ("Field must not be a number less than 0" per the reported spec).
        const validationToast = page.locator('.p-toast-message-text').first();
        if (await validationToast.isVisible().catch(() => false)) {
            console.log('Negative Home Score validation toast:', await validationToast.textContent());
        }
        const inlineError = genericPredictorPage.captureOutcomePopup.locator('.p-error, small.pure__error-message').first();
        if (await inlineError.isVisible().catch(() => false)) {
            console.log('Negative Home Score inline validation message:', await inlineError.textContent());
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_negative_home_score_disables_save');
        console.log('Save stays disabled when Home Score is a negative number.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-32 Verify Save stays disabled when Away Score is a negative number', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openCaptureOutcomeForEvent(eventName);
        await genericPredictorPage.selectResultType('Away');
        await genericPredictorPage.fillHomeScore('10');
        // See TC-31: fillAwayScoreRaw bypasses this p-inputnumber's keydown-level filtering,
        // which can otherwise silently strip the "-" out of a character-by-character entry.
        await genericPredictorPage.fillAwayScoreRaw('-5');
        await page.waitForTimeout(300);

        const awayScoreValue = await genericPredictorPage.getAwayScoreValue();
        console.log(`Away Score field value after entering "-5": "${awayScoreValue}"`);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to stay disabled with a negative Away Score').toBeDisabled();

        const validationToast = page.locator('.p-toast-message-text').first();
        if (await validationToast.isVisible().catch(() => false)) {
            console.log('Negative Away Score validation toast:', await validationToast.textContent());
        }
        const inlineError = genericPredictorPage.captureOutcomePopup.locator('.p-error, small.pure__error-message').first();
        if (await inlineError.isVisible().catch(() => false)) {
            console.log('Negative Away Score inline validation message:', await inlineError.textContent());
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_negative_away_score_disables_save');
        console.log('Save stays disabled when Away Score is a negative number.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-33 Verify capturing a valid outcome with Result Type "Away" succeeds', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openCaptureOutcomeForEvent(eventName);
        await genericPredictorPage.selectResultType('Away');
        await genericPredictorPage.fillHomeScore('1');
        await genericPredictorPage.fillAwayScore('2');
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with a valid Result Type, Home Score and Away Score').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(toastText, 'Expected a SUCCESS toast confirming the outcome was captured').toBeVisible({ timeout: 15000 });
        console.log('Capture Outcome toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_capture_outcome_success');
        console.log(`✅ TC-33 PASSED — Outcome captured successfully for Event "${eventName}" with Result Type "Away".`);
    });

    test('TC-34 Verify Period Stats navigates to the Predictor Period Stats page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openPeriodStatsForEvent(eventName);

        await expect(genericPredictorPage.periodStatsHeading, 'Expected the Predictor Period Stats page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_period_stats_navigation');
        console.log('Period Stats navigates to the Predictor Period Stats page from the Event row menu.');
    });

    test('TC-35 Verify the Back button on Predictor Period Stats navigates back to the Period Events page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openPeriodStatsForEvent(eventName);
        await expect(genericPredictorPage.periodStatsHeading, 'Expected the Predictor Period Stats page heading').toBeVisible({ timeout: 15000 });

        await genericPredictorPage.clickPeriodStatsBack();

        // Confirmed live: Back is CONTEXTUAL, not a fixed "Predictor Stats" destination — since
        // Period Stats was opened here via the Event's row menu, Back returns to that Period
        // Events page (see periodStatsBackBtn's note).
        await expect(genericPredictorPage.periodEventsHeading, 'Expected the Period Events page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_period_stats_back_button');
        console.log('Back button on Predictor Period Stats (reached via an Event) navigates back to the Period Events page.');
    });

    test('TC-36 Verify deleting an Event shows a Yes/No confirmation and a validation toast', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await createPeriodAndOpenEvents(page, genericPredictorPage, predictorName, region);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.clickRowMenuForEvent(eventName);
        await genericPredictorPage.clickDeleteFromEventRowMenu();

        await expect(genericPredictorPage.confirmYesBtn, 'Expected a Yes/No delete confirmation modal').toBeVisible({ timeout: 10000 });
        await genericPredictorPage.clickConfirmYes();

        // Observed rather than asserted on exact severity/wording — same reasoning as TC-29's
        // Cancel toast: not confirmed beforehand whether this succeeds or fails server-side (see
        // the earlier Period delete finding, which returned an error toast, not a confirm-dialog
        // failure).
        const deleteToast = page.locator('.p-toast-message-text').first();
        await expect(deleteToast, 'Expected a toast confirming the Event delete result').toBeVisible({ timeout: 15000 });
        console.log('Delete Event toast message:', await deleteToast.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_delete_event_toast');
        console.log(`✅ TC-36 PASSED — Deleting Event "${eventName}" showed a Yes/No confirmation and a toast: "${await deleteToast.textContent()}".`);
    });

    test('TC-37 Verify the Back button on the Events page navigates to the Predictor Periods page', async ({ page, genericPredictorPage }, testInfo) => {
        // Creates its own Predictor + Period rather than reusing "whichever already exist" —
        // confirmed live that the first Predictor (with inactive ones shown) can genuinely have
        // zero Periods, leaving nothing to open an Events page for. A fresh Predictor/Period
        // guarantees this test always has real data to navigate through. This describe block's
        // shared afterEach only tracks the Predictor (see TC-22) — deleting it is assumed to
        // cascade-remove its Periods and Events too, so no separate periodName cleanup is needed.
        const name = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, name);
        createdName = name;
        createdRegion = region;

        const periodName = await createPeriodAndOpenEvents(page, genericPredictorPage, name, region);
        await genericPredictorPage.createEventBtn.waitFor({ state: 'visible', timeout: 15000 });

        await genericPredictorPage.clickEventsPageBack();

        await expect(genericPredictorPage.predictorPeriodsHeading, 'Expected the Back button to navigate to the Predictor Periods page').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_events_page_back_button');
        console.log(`✅ TC-37 PASSED — Back button on the Events page for Period "${periodName}" navigates to the Predictor Periods page.`);
    });

    test('TC-38 Verify Stats navigates to the Predictor Period Stats page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);

        await genericPredictorPage.openStatsForPeriod(periodName);

        await expect(genericPredictorPage.periodStatsHeading, 'Expected the Predictor Period Stats page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_period_stats_navigation');
        console.log('Stats navigates to the Predictor Period Stats page from the Period row menu.');
    });

    test('TC-39 Verify the Back button on Predictor Period Stats (reached via Stats) navigates to the Predictor Periods page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);

        await genericPredictorPage.openStatsForPeriod(periodName);
        await expect(genericPredictorPage.periodStatsHeading, 'Expected the Predictor Period Stats page heading').toBeVisible({ timeout: 15000 });

        await genericPredictorPage.clickPeriodStatsBack();

        // Confirmed live: Back is CONTEXTUAL — since Period Stats was opened here via the
        // Period's own row menu ("Stats"), Back returns to the Predictor Periods page (see
        // periodStatsBackBtn's note); TC-35 covers the other entry point (via an Event).
        await expect(genericPredictorPage.predictorPeriodsHeading, 'Expected the Predictor Periods page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_period_stats_back_button');
        console.log('Back button on Predictor Period Stats (reached via Stats) navigates to the Predictor Stats page.');
    });

    test('TC-40 Verify Winners navigates to the Period Winners page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);

        await genericPredictorPage.openWinnersForPeriod(periodName);

        await expect(genericPredictorPage.periodWinnersHeading, 'Expected the Period Winners page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_period_winners_navigation');
        console.log('Winners navigates to the Period Winners page from the Period row menu.');
    });

    test('TC-41 Verify the Back button on Period Winners navigates to the Predictor Periods page', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);

        await genericPredictorPage.openWinnersForPeriod(periodName);
        await expect(genericPredictorPage.periodWinnersHeading, 'Expected the Period Winners page heading').toBeVisible({ timeout: 15000 });

        await genericPredictorPage.clickPeriodWinnersBack();

        await expect(genericPredictorPage.predictorPeriodsHeading, 'Expected the Predictor Periods page heading').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_period_winners_back_button');
        console.log('Back button on Period Winners navigates to the Predictor Periods page.');
    });

    test('TC-42 Verify deleting a Period shows a confirmation popup', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);

        await genericPredictorPage.clickRowMenuForPeriod(periodName);
        await genericPredictorPage.clickDeleteFromPeriodRowMenu();

        // Business rule change: Period delete now shows the same Yes/No confirmation modal as
        // Predictor/Event delete (previously confirmed to fire directly with no modal).
        await expect(genericPredictorPage.confirmYesBtn, 'Expected a Yes/No delete confirmation modal for Period delete').toBeVisible({ timeout: 10000 });
        await genericPredictorPage.clickConfirmYes();

        const deleteToast = page.locator('.p-toast-message-text').first();
        await expect(deleteToast, 'Expected a toast confirming the Period delete result').toBeVisible({ timeout: 15000 });
        console.log('Delete Period toast message:', await deleteToast.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_delete_period_toast');
        console.log(`✅ TC-42 PASSED — Deleting Period "${periodName}" showed a confirmation popup and a toast: "${await deleteToast.textContent()}".`);
    });

    test('TC-43 Verify activating a Predictor succeeds when it has a Period with 2 participants', async ({ page, sidebarPage, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        await createEventWithParticipants(page, genericPredictorPage, 2);

        // activatePredictor filters/toggles on the Generic Predictor LIST page — we're still on
        // the Period Events page after creating the Event above, so navigate back first.
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.activatePredictor(predictorName, region);

        const activateToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(activateToast, 'Expected a SUCCESS toast confirming the Predictor was activated').toBeVisible({ timeout: 15000 });
        console.log('Activate Predictor toast message:', await activateToast.textContent());

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showActivePredictors();
        const isActiveVisible = await genericPredictorPage.isPredictorVisibleByName(predictorName);
        expect(isActiveVisible, `Expected Predictor "${predictorName}" to appear in the Active list after activating`).toBe(true);

        // Leave the Predictor Inactive again so the shared afterEach's standard (Inactive-list-
        // based) delete flow can find and remove it.
        await genericPredictorPage.deactivatePredictor(predictorName, region);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_activate_predictor_success');
        console.log(`✅ TC-43 PASSED — Predictor "${predictorName}" activated successfully with a Period containing 2 participants.`);
    });

    test('TC-44 Verify deactivating a Predictor succeeds', async ({ page, sidebarPage, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        await createEventWithParticipants(page, genericPredictorPage, 2);

        // activatePredictor filters/toggles on the Generic Predictor LIST page — navigate back
        // from the Period Events page first. To deactivate, the Predictor must first be Active —
        // activate it as a setup step (not the assertion under test here, see TC-43 for that).
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.activatePredictor(predictorName, region);
        const activateToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(activateToast, 'Expected a SUCCESS toast confirming the Predictor was activated (setup step)').toBeVisible({ timeout: 15000 });

        await genericPredictorPage.deactivatePredictor(predictorName, region);

        const deactivateToast = page.locator('.p-toast-message-text').first();
        await expect(deactivateToast, 'Expected a toast confirming the Predictor was deactivated').toBeVisible({ timeout: 15000 });
        console.log('Deactivate Predictor toast message:', await deactivateToast.textContent());

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isInactiveVisible = await genericPredictorPage.isPredictorVisibleByName(predictorName);
        expect(isInactiveVisible, `Expected Predictor "${predictorName}" to appear in the Inactive list after deactivating`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_deactivate_predictor_success');
        console.log(`✅ TC-44 PASSED — Predictor "${predictorName}" deactivated successfully.`);
    });

    test('TC-45 Verify activating a Predictor is blocked when it has no Promotion Period', async ({ page, sidebarPage, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        // No Period created — the precondition for activation isn't met. createPredictor already
        // leaves the browser on the Generic Predictor list page, but re-navigate anyway for
        // consistency with TC-43/44/46/47 (don't assume prior page state).
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.activatePredictor(predictorName, region);

        const toast = page.locator('.p-toast-message-text').first();
        await expect(toast, 'Expected a toast reporting the activation result').toBeVisible({ timeout: 15000 });
        console.log('Activate (no Period) toast message:', await toast.textContent());

        const stillInactive = await genericPredictorPage.isPredictorVisibleByName(predictorName);
        expect(stillInactive, `Expected Predictor "${predictorName}" to remain in the Inactive list (activation should be blocked)`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_activate_blocked_no_period');
        console.log(`Activation was blocked for Predictor "${predictorName}" with no Promotion Period, as expected.`);
    });

    test('TC-46 Verify activating a Predictor is blocked when its Period has no participants', async ({ page, sidebarPage, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        await createEvent(page, genericPredictorPage); // 0 participants — see TC-24

        // activatePredictor filters/toggles on the Generic Predictor LIST page — navigate back
        // from the Period Events page first.
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.activatePredictor(predictorName, region);

        const toast = page.locator('.p-toast-message-text').first();
        await expect(toast, 'Expected a toast reporting the activation result').toBeVisible({ timeout: 15000 });
        console.log('Activate (0 participants) toast message:', await toast.textContent());

        const stillInactive = await genericPredictorPage.isPredictorVisibleByName(predictorName);
        expect(stillInactive, `Expected Predictor "${predictorName}" to remain in the Inactive list (activation should be blocked)`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_activate_blocked_no_participants');
        console.log(`Activation was blocked for Predictor "${predictorName}" with a Period that has no participants, as expected.`);
    });

    test('TC-47 Verify activating a Predictor is blocked when its Period has only 1 participant', async ({ page, sidebarPage, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        await createEventWithParticipants(page, genericPredictorPage, 1);

        // activatePredictor filters/toggles on the Generic Predictor LIST page — navigate back
        // from the Period Events page first.
        await navigateToGenericPredictor(page, sidebarPage, genericPredictorPage);
        await genericPredictorPage.activatePredictor(predictorName, region);

        const toast = page.locator('.p-toast-message-text').first();
        await expect(toast, 'Expected a toast reporting the activation result').toBeVisible({ timeout: 15000 });
        console.log('Activate (1 participant) toast message:', await toast.textContent());

        const stillInactive = await genericPredictorPage.isPredictorVisibleByName(predictorName);
        expect(stillInactive, `Expected Predictor "${predictorName}" to remain in the Inactive list (activation should be blocked with fewer than 2 participants)`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_activate_blocked_one_participant');
        console.log(`Activation was blocked for Predictor "${predictorName}" with a Period that has only 1 participant, as expected.`);
    });

    test('TC-48 Verify Toggle Testing Status turns Is Testing on and off', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const initiallyOn = await genericPredictorPage.isTestingToggleOn(predictorName);
        expect(initiallyOn, `Expected Predictor "${predictorName}" to start with Is Testing off`).toBe(false);

        // Toggle ON
        await genericPredictorPage.toggleTestingStatus(predictorName, region);
        const onToast = page.locator('.p-toast-message-text').first();
        await expect(onToast, 'Expected a toast confirming Testing Status was toggled').toBeVisible({ timeout: 15000 });
        console.log('Toggle Testing Status (on) toast message:', await onToast.textContent());

        // No page-level search box exists for Generic Predictor (confirmed live: the only
        // "Search" textbox on the page is the sidebar's own nav search) — re-apply the
        // region/Inactive filter instead to force a fresh list fetch before reading row state.
        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        // Logging BOTH columns — TC-49 showed the wrong column can flip, so surfacing this one's
        // Auto Opt-in state too makes that visible here without needing a repeat failed run.
        console.log(`Is Testing: ${await genericPredictorPage.isTestingToggleOn(predictorName)}, Auto Opt-in: ${await genericPredictorPage.isAutoOptinToggleOn(predictorName)}`);
        const isOnAfterFirstToggle = await genericPredictorPage.isTestingToggleOn(predictorName);
        expect(isOnAfterFirstToggle, `Expected Is Testing to be ON for Predictor "${predictorName}" after toggling`).toBe(true);

        // Toggle OFF — the SAME menu item, clicked again (a true toggle, not a separate action)
        await genericPredictorPage.toggleTestingStatus(predictorName, region);
        const offToast = page.locator('.p-toast-message-text').first();
        await expect(offToast, 'Expected a toast confirming Testing Status was toggled again').toBeVisible({ timeout: 15000 });
        console.log('Toggle Testing Status (off) toast message:', await offToast.textContent());

        // No page-level search box exists for Generic Predictor (confirmed live: the only
        // "Search" textbox on the page is the sidebar's own nav search) — re-apply the
        // region/Inactive filter instead to force a fresh list fetch before reading row state.
        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isOffAfterSecondToggle = await genericPredictorPage.isTestingToggleOn(predictorName);
        expect(isOffAfterSecondToggle, `Expected Is Testing to be OFF for Predictor "${predictorName}" after toggling again`).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_toggle_testing_status');
        console.log(`✅ TC-48 PASSED — Toggle Testing Status turned Is Testing on and then off for Predictor "${predictorName}".`);
    });

    test('TC-49 Verify Toggle Auto-Optin Status turns Auto Opt-in on and off', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const initiallyOn = await genericPredictorPage.isAutoOptinToggleOn(predictorName);
        expect(initiallyOn, `Expected Predictor "${predictorName}" to start with Auto Opt-in off`).toBe(false);

        // Toggle ON
        await genericPredictorPage.toggleAutoOptinStatus(predictorName, region);
        const onToast = page.locator('.p-toast-message-text').first();
        await expect(onToast, 'Expected a toast confirming Auto-Optin Status was toggled').toBeVisible({ timeout: 15000 });
        console.log('Toggle Auto-Optin Status (on) toast message:', await onToast.textContent());

        // No page-level search box exists for Generic Predictor (confirmed live: the only
        // "Search" textbox on the page is the sidebar's own nav search) — re-apply the
        // region/Inactive filter instead to force a fresh list fetch before reading row state.
        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        // Logging BOTH columns — confirmed live once that toggling Auto-Optin can instead flip Is
        // Testing, so surfacing this one's Is Testing state too catches that if it recurs.
        console.log(`Is Testing: ${await genericPredictorPage.isTestingToggleOn(predictorName)}, Auto Opt-in: ${await genericPredictorPage.isAutoOptinToggleOn(predictorName)}`);
        const isOnAfterFirstToggle = await genericPredictorPage.isAutoOptinToggleOn(predictorName);
        expect(isOnAfterFirstToggle, `Expected Auto Opt-in to be ON for Predictor "${predictorName}" after toggling`).toBe(true);

        // Toggle OFF — the SAME menu item, clicked again (a true toggle, not a separate action)
        await genericPredictorPage.toggleAutoOptinStatus(predictorName, region);
        const offToast = page.locator('.p-toast-message-text').first();
        await expect(offToast, 'Expected a toast confirming Auto-Optin Status was toggled again').toBeVisible({ timeout: 15000 });
        console.log('Toggle Auto-Optin Status (off) toast message:', await offToast.textContent());

        // No page-level search box exists for Generic Predictor (confirmed live: the only
        // "Search" textbox on the page is the sidebar's own nav search) — re-apply the
        // region/Inactive filter instead to force a fresh list fetch before reading row state.
        await genericPredictorPage.selectRegionFilterByText(region);
        await genericPredictorPage.showInactivePredictors();
        const isOffAfterSecondToggle = await genericPredictorPage.isAutoOptinToggleOn(predictorName);
        expect(isOffAfterSecondToggle, `Expected Auto Opt-in to be OFF for Predictor "${predictorName}" after toggling again`).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49_toggle_auto_optin_status');
        console.log(`✅ TC-49 PASSED — Toggle Auto-Optin Status turned Auto Opt-in on and then off for Predictor "${predictorName}".`);
    });

    test('TC-50 Verify creating a Participant succeeds (Player filled only if data is available)', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        await genericPredictorPage.clickCreateParticipant();
        await genericPredictorPage.waitForParticipantPopupLoad();

        const teamName = await genericPredictorPage.selectParticipantTeamOption();
        // Player is optional — filled only if its dropdown actually has data, otherwise left
        // blank (confirmed live it sometimes has none).
        const playerName = await genericPredictorPage.selectParticipantPlayerOptionIfAvailable();
        const typeName = await genericPredictorPage.selectParticipantTypeOption();
        const roleName = await genericPredictorPage.selectParticipantRoleOption();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with mandatory fields filled').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the participant was created').toBeVisible({ timeout: 15000 });
        console.log('Create Participant toast message:', await toastText.textContent());

        const isVisible = await genericPredictorPage.isParticipantRowVisible(teamName);
        expect(isVisible, `Expected a Participant row for Team "${teamName}" to appear`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50_create_participant_success');
        console.log(`✅ TC-50 PASSED — Participant created (Team: "${teamName}", Player: "${playerName || '(left blank)'}", Type: "${typeName}", Role: "${roleName}").`);
    });

    test('TC-51 Verify editing a Participant succeeds', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.clickEditParticipant(teamName);
        await genericPredictorPage.waitForParticipantEditPopupLoad();

        const updatedRoleName = await genericPredictorPage.selectParticipantRoleOption();
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.updateParticipantBtn, 'Expected Update to be enabled after editing').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickUpdateParticipant();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the participant was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Participant toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51_edit_participant_success');
        console.log(`✅ TC-51 PASSED — Participant (Team: "${teamName}") edited, Participant Role set to "${updatedRoleName}".`);
    });

    test('TC-52 Verify deleting a Participant shows a validation toast', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.clickDeleteParticipant(teamName);

        // Delete confirmation is inconsistent across this app (Yes/No modal for Predictor/Event,
        // a direct toast with no modal for Period) — observe whichever appears here rather than
        // assuming one.
        const confirmModalAppeared = await genericPredictorPage.confirmYesBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (confirmModalAppeared) {
            console.log('Delete Participant: a Yes/No confirmation modal appeared — clicking Yes.');
            await genericPredictorPage.clickConfirmYes();
        } else {
            console.log('Delete Participant: no confirmation modal appeared (direct action).');
        }

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the participant delete result').toBeVisible({ timeout: 15000 });
        console.log('Delete Participant toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_delete_participant_toast');
        console.log(`✅ TC-52 PASSED — Deleting Participant (Team: "${teamName}") showed a toast: "${await toastText.textContent()}".`);
    });

    test('TC-53 Verify the Search box filters the Participants list', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.searchParticipants(teamName);
        const isVisibleWhenMatching = await genericPredictorPage.isParticipantRowVisible(teamName);
        expect(isVisibleWhenMatching, `Expected the Participant row for Team "${teamName}" to stay visible when searching for it`).toBe(true);

        // A different, genuinely valid Team name (peeked from the dropdown without being
        // selected/created) — not a fabricated nonsense string — so this proves real filtering
        // against actual data rather than just "no match found" behavior.
        const otherTeamName = await genericPredictorPage.peekTeamOptionText(1);
        console.log(`Searching with a different valid Team name: "${otherTeamName}"...`);
        await genericPredictorPage.searchParticipants(otherTeamName);
        const isAbsentWhenNotMatching = await genericPredictorPage.isParticipantRowAbsent(teamName, 10000);
        expect(isAbsentWhenNotMatching, `Expected the Participant row for Team "${teamName}" to disappear when searching for a different valid Team ("${otherTeamName}")`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53_participants_search');
        console.log('Search box on Event Participants page filters the list correctly.');
    });

    test('TC-54 Verify Results popup opens with Is Winner, Finish Position and Participant Score fields', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.openResultsForParticipant(teamName);

        await expect(genericPredictorPage.isWinnerDropdown, 'Expected Is Winner field').toBeVisible();
        await expect(genericPredictorPage.finishPositionInput, 'Expected Finish Position field').toBeVisible();
        await expect(genericPredictorPage.participantScoreInput, 'Expected Participant Score field').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-54_results_popup_fields');
        console.log('Results popup opens with Is Winner, Finish Position and Participant Score fields.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-55 Verify updating Results with Is Winner "Yes" succeeds and turns the row toggle ON', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.openResultsForParticipant(teamName);
        await genericPredictorPage.selectIsWinner('Yes');
        await genericPredictorPage.fillFinishPosition('1');
        await genericPredictorPage.fillParticipantScore('10');
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with valid Results fields').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(toastText, 'Expected a SUCCESS toast confirming Results were updated').toBeVisible({ timeout: 15000 });
        console.log('Update Results (Is Winner: Yes) toast message:', await toastText.textContent());

        const isWinnerOn = await genericPredictorPage.waitForParticipantWinnerToggleState(teamName, true);
        expect(isWinnerOn, `Expected the row's Winner toggle to turn ON after saving Results with Is Winner "Yes"`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55_results_is_winner_yes');
        console.log(`✅ TC-55 PASSED — Results updated (Is Winner: Yes) for Team "${teamName}", row toggle is ON.`);
    });

    test('TC-56 Verify updating Results with Is Winner "No" succeeds and turns the row toggle back OFF', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        // First set Is Winner "Yes" so the toggle actually starts ON — proves the "No" branch
        // genuinely flips it back OFF, rather than it just already being OFF by default.
        await genericPredictorPage.openResultsForParticipant(teamName);
        await genericPredictorPage.selectIsWinner('Yes');
        await genericPredictorPage.fillFinishPosition('1');
        await genericPredictorPage.fillParticipantScore('10');
        await page.waitForTimeout(300);
        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with valid Results fields').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();
        const firstToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(firstToast, 'Expected a SUCCESS toast confirming Results were updated').toBeVisible({ timeout: 15000 });
        const isWinnerOnAfterYes = await genericPredictorPage.waitForParticipantWinnerToggleState(teamName, true);
        expect(isWinnerOnAfterYes, 'Expected the row toggle to be ON after Is Winner "Yes"').toBe(true);

        await genericPredictorPage.openResultsForParticipant(teamName);
        await genericPredictorPage.selectIsWinner('No');
        await genericPredictorPage.fillFinishPosition('4');
        await genericPredictorPage.fillParticipantScore('2');
        await page.waitForTimeout(300);

        await expect(genericPredictorPage.saveBtn, 'Expected Save to be enabled with valid Results fields').toBeEnabled({ timeout: 10000 });
        await genericPredictorPage.clickSave();

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(toastText, 'Expected a SUCCESS toast confirming Results were updated').toBeVisible({ timeout: 15000 });
        console.log('Update Results (Is Winner: No) toast message:', await toastText.textContent());

        const isWinnerOn = await genericPredictorPage.waitForParticipantWinnerToggleState(teamName, false);
        expect(isWinnerOn, `Expected the row's Winner toggle to turn back OFF after saving Results with Is Winner "No"`).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56_results_is_winner_no');
        console.log(`✅ TC-56 PASSED — Results updated (Is Winner: No) for Team "${teamName}", row toggle is OFF.`);
    });

    test('TC-57 Verify Finish Position rejects a negative number and non-numeric characters', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.openResultsForParticipant(teamName);
        await genericPredictorPage.selectIsWinner('Yes');

        // Expected result (per spec): this p-inputnumber (min="0") filters keystrokes as they're
        // typed, so neither a "-" nor a letter should ever land in the field at all — unlike
        // Capture Outcome's Home/Away Score, this is input-level rejection, not a
        // stripped-value-disables-Save case.
        await genericPredictorPage.fillFinishPosition('-1');
        const valueAfterNegative = await genericPredictorPage.getFinishPositionValue();
        console.log(`Finish Position field value after typing "-1": "${valueAfterNegative}"`);
        expect(valueAfterNegative.includes('-'), 'Expected "-" to be filtered out and never appear in Finish Position').toBe(false);

        await genericPredictorPage.fillFinishPosition('abc');
        const valueAfterLetters = await genericPredictorPage.getFinishPositionValue();
        console.log(`Finish Position field value after typing "abc": "${valueAfterLetters}"`);
        expect(/[a-zA-Z]/.test(valueAfterLetters), 'Expected letters to be filtered out and never appear in Finish Position').toBe(false);

        // Save's resulting state isn't confirmed either way (depends on whether the field ends up
        // blank vs. holding leftover valid digits) — observed and logged, not force-asserted.
        console.log('Save button state after invalid Finish Position input — enabled:', await genericPredictorPage.saveBtn.isEnabled().catch(() => 'unknown'));
        const validationToast = page.locator('.p-toast-message-text').first();
        if (await validationToast.isVisible().catch(() => false)) {
            console.log('Finish Position validation toast:', await validationToast.textContent());
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57_finish_position_rejects_invalid_input');
        console.log('Finish Position correctly rejects negative numbers and non-numeric characters.');

        await genericPredictorPage.clickCancel();
    });

    test('TC-58 Verify Participant Score rejects a negative number and non-numeric characters', async ({ page, genericPredictorPage }, testInfo) => {
        const predictorName = `Predictor_${Date.now()}`;
        const region = await createPredictor(page, genericPredictorPage, predictorName);
        createdName = predictorName;
        createdRegion = region;

        const periodName = await createPeriod(page, genericPredictorPage, predictorName, region);
        await genericPredictorPage.openEventsForPeriod(periodName);
        const eventName = await createEvent(page, genericPredictorPage);

        await genericPredictorPage.openParticipantsForEvent(eventName);
        const teamName = await createParticipant(page, genericPredictorPage);

        await genericPredictorPage.openResultsForParticipant(teamName);
        await genericPredictorPage.selectIsWinner('Yes');
        await genericPredictorPage.fillFinishPosition('1');

        // See TC-57: expected result is input-level rejection — neither the "-" nor a letter
        // should ever land in the field.
        await genericPredictorPage.fillParticipantScore('-10');
        const valueAfterNegative = await genericPredictorPage.getParticipantScoreValue();
        console.log(`Participant Score field value after typing "-10": "${valueAfterNegative}"`);
        expect(valueAfterNegative.includes('-'), 'Expected "-" to be filtered out and never appear in Participant Score').toBe(false);

        await genericPredictorPage.fillParticipantScore('xyz');
        const valueAfterLetters = await genericPredictorPage.getParticipantScoreValue();
        console.log(`Participant Score field value after typing "xyz": "${valueAfterLetters}"`);
        expect(/[a-zA-Z]/.test(valueAfterLetters), 'Expected letters to be filtered out and never appear in Participant Score').toBe(false);

        console.log('Save button state after invalid Participant Score input — enabled:', await genericPredictorPage.saveBtn.isEnabled().catch(() => 'unknown'));
        const validationToast = page.locator('.p-toast-message-text').first();
        if (await validationToast.isVisible().catch(() => false)) {
            console.log('Participant Score validation toast:', await validationToast.textContent());
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58_participant_score_rejects_invalid_input');
        console.log('Participant Score correctly rejects negative numbers and non-numeric characters.');

        await genericPredictorPage.clickCancel();
    });
});
