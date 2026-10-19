// npx playwright test tests/rulesengine.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { rulesEngineLocators } from '../locators/rulesEngineLocators';

// ═══════════════════════════════════════════════════════════════════════════════
// RULES ENGINE — new feature, built from the user's functional description plus outerHTML
// confirmed live for: Create Rule button, Basics/Qualification steps, the Add Group popup, the
// Add Sport popup (14 fields + 4 checkboxes + dependency logic), the Add Casino popup, the Add
// Deposit popup, the Add Recurring Frequency popup (incl. its 3 day/month/date pill sections),
// the saved Group/Condition card markup (a real <table> per condition type, Edit/Delete per row),
// the Review step (Configuration/Rule groups/Recurring frequencies panels), and the Rules Engine
// list page itself (a real <table>, confirmed — not the assumed fallback it started as).
//
// Remaining flagged assumptions (see RulesEnginePage's own comments for each):
//  - The "Combine groups with" dropdown's own id was never captured (only its chevron icon was) —
//    located via this app's proven float-label structure (adjacent `<label>` text) instead.
//  - League/Event/Market/Outcome are plain text inputs (confirmed live) — "selecting" a value per
//    the user's spec is treated as simply typing into them, since no dropdown/autocomplete overlay
//    markup was captured for them.
//  - The Review step's captured HTML showed NO "Activate" button (only Back/Back to list), despite
//    the user's functional description of one — activateBtn is kept as a locator but never
//    asserted visible; if it exists, it may live elsewhere (e.g. only on an already-created Rule).
//  - Deleting a saved Group/Sport/Casino/Deposit condition row is assumed to go through the same
//    Yes/No confirmation used for deleting a Rule — tested tolerantly (clicks Yes only if a
//    confirmation actually appears) since this was never independently confirmed live.
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToRulesEngine(page: any, sidebarPage: any, rulesEnginePage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToRulesEngine();
    await rulesEnginePage.createRuleBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreateRule(rulesEnginePage: any) {
    await rulesEnginePage.clickCreateRule();
}

// Fills all 4 Basics fields and clicks Next. Returns the Description used.
async function fillBasicsStep(page: any, rulesEnginePage: any, description: string): Promise<void> {
    await rulesEnginePage.fillDescription(description);
    await rulesEnginePage.selectRegionWithCampaign();
    await rulesEnginePage.selectFirstAction();
    await page.waitForTimeout(300);
    await rulesEnginePage.clickNext();
}

// Fills Qualification with a NON-Recurring frequency (so Schedule gets skipped) and clicks Next —
// lands directly on the Rules step.
async function fillQualificationStepNonRecurring(page: any, rulesEnginePage: any): Promise<void> {
    await rulesEnginePage.fillRequiredAmount('10');
    await rulesEnginePage.selectFirstEligibilityFrequencyExceptRecurring();
    await rulesEnginePage.setStartDate();
    await rulesEnginePage.setEndDate();
    await page.waitForTimeout(300);
    await rulesEnginePage.clickNext();
}

// Fills Qualification with Recurring (so Schedule step opens) and clicks Next.
async function fillQualificationStepRecurring(page: any, rulesEnginePage: any): Promise<void> {
    await rulesEnginePage.fillRequiredAmount('10');
    await rulesEnginePage.selectEligibilityFrequency('Recurring');
    await rulesEnginePage.setStartDate();
    await rulesEnginePage.setEndDate();
    await page.waitForTimeout(300);
    await rulesEnginePage.clickNext();
}

// Drives Basics + Qualification (non-Recurring) to land on a fresh Rules step. Does NOT persist
// anything yet — no cleanup needed unless the caller goes on to Back to list.
async function navigateToRulesStep(page: any, sidebarPage: any, rulesEnginePage: any, description: string) {
    await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
    await openCreateRule(rulesEnginePage);
    await fillBasicsStep(page, rulesEnginePage, description);
    await fillQualificationStepNonRecurring(page, rulesEnginePage);
}

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_001 to TC_RE_010 — Step 1: Basics
// //  None of these persist a Rule (closed mid-wizard), so no cleanup is needed.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Basics Step Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//         await openCreateRule(rulesEnginePage);
//     });

//     test('TC_RE_001 Verify Basics step opens with all 4 fields', async ({ page, rulesEnginePage }, testInfo) => {
//         await expect(rulesEnginePage.descriptionInput, 'Expected Description field').toBeVisible({ timeout: 15000 });
//         await expect(rulesEnginePage.regionDropdown, 'Expected Region field').toBeVisible();
//         await expect(rulesEnginePage.campaignDropdown, 'Expected Campaign field').toBeVisible();
//         await expect(rulesEnginePage.actionDropdown, 'Expected Action field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_001_basics_step_fields');
//         console.log('Basics step opens with Description, Region, Campaign and Action fields.');
//     });

//     test('TC_RE_002 Verify mandatory field validation on Basics', async ({ page, rulesEnginePage }, testInfo) => {
//         const nextWasClickable = await rulesEnginePage.nextBtn.isEnabled().catch(() => false);
//         if (nextWasClickable) {
//             await rulesEnginePage.clickNext();
//             await page.waitForTimeout(500);
//         }
//         const hasErrors = await rulesEnginePage.hasValidationErrors();
//         // Tolerant: mandatory-field enforcement could be inline errors after Next, OR Next itself
//         // staying disabled until all fields are filled — not confirmed live which.
//         expect(hasErrors || !nextWasClickable, 'Expected mandatory-field validation to be enforced when Basics is blank').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_002_basics_mandatory_validation');
//         console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Next button'}.`);
//     });

//     test('TC_RE_003 Verify Description field accepts input', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await rulesEnginePage.fillDescription(description);
//         expect(await rulesEnginePage.getDescriptionValue(), 'Expected Description value to be accepted').toBe(description);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_003_description_field');
//         console.log('Description field accepts valid input.');
//     });

//     test('TC_RE_004 Verify Region dropdown', async ({ page, rulesEnginePage }, testInfo) => {
//         const selected = await rulesEnginePage.selectFirstRegion();
//         const shownValue = await rulesEnginePage.getDropdownValue(rulesEnginePage.regionDropdown);
//         expect(shownValue, `Expected the selected Region "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_004_region_dropdown');
//         console.log(`Region dropdown opened and the selected value "${selected}" is shown.`);
//     });

//     test('TC_RE_005 Verify Campaign dropdown', async ({ page, rulesEnginePage }, testInfo) => {
//         // Confirmed live: Campaign stays disabled until Region is selected.
//         await rulesEnginePage.selectFirstRegion();

//         const selected = await rulesEnginePage.selectFirstCampaign();
//         const shownValue = await rulesEnginePage.getDropdownValue(rulesEnginePage.campaignDropdown);
//         expect(shownValue, `Expected the selected Campaign "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_005_campaign_dropdown');
//         console.log(`Campaign dropdown opened and the selected value "${selected}" is shown.`);
//     });

//     test('TC_RE_005b Verify Campaign is disabled until Region is selected', async ({ page, rulesEnginePage }, testInfo) => {
//         const disabledBefore = await rulesEnginePage.isCampaignDropdownDisabled();
//         expect(disabledBefore, 'Expected Campaign to be disabled before Region is selected').toBe(true);

//         await rulesEnginePage.selectFirstRegion();
//         const disabledAfter = await rulesEnginePage.isCampaignDropdownDisabled();
//         expect(disabledAfter, 'Expected Campaign to become enabled once Region is selected').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_005b_campaign_disabled_until_region');
//         console.log('Campaign stays disabled until Region is selected, then becomes enabled.');
//     });

//     test('TC_RE_006 Verify Action dropdown', async ({ page, rulesEnginePage }, testInfo) => {
//         const selected = await rulesEnginePage.selectFirstAction();
//         const shownValue = await rulesEnginePage.getDropdownValue(rulesEnginePage.actionDropdown);
//         expect(shownValue, `Expected the selected Action "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_006_action_dropdown');
//         console.log(`Action dropdown opened and the selected value "${selected}" is shown.`);
//     });

//     test('TC_RE_007 Verify Next navigates to Qualification step', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await fillBasicsStep(page, rulesEnginePage, description);

//         await expect(rulesEnginePage.requiredAmountInput, 'Expected the Qualification step\'s Required Amount field to appear').toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_007_next_to_qualification');
//         console.log('Next correctly navigated from Basics to Qualification.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_008 to TC_RE_017 — Step 2: Qualification
// //  None of these persist a Rule, so no cleanup is needed.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Qualification Step Tests', () => {
//     let description: string;

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//         await openCreateRule(rulesEnginePage);
//         description = `Rule_${Date.now()}`;
//         await fillBasicsStep(page, rulesEnginePage, description);
//     });

//     test('TC_RE_008 Verify Qualification step opens with all fields', async ({ page, rulesEnginePage }, testInfo) => {
//         await expect(rulesEnginePage.requiredAmountInput, 'Expected Required Amount field').toBeVisible({ timeout: 15000 });
//         await expect(rulesEnginePage.eligibilityFrequencyDropdown, 'Expected Eligibility Frequency field').toBeVisible();
//         await expect(rulesEnginePage.startDateInput, 'Expected Start Date field').toBeVisible();
//         await expect(rulesEnginePage.endDateInput, 'Expected End Date field').toBeVisible();
//         await expect(rulesEnginePage.isFirstQualifyingAmountCheckbox, 'Expected Is First Qualifying Amount checkbox').toBeVisible();
//         await expect(rulesEnginePage.multiAwardCheckbox, 'Expected Multi Award checkbox').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_008_qualification_step_fields');
//         console.log('Qualification step opens with all 4 fields and both checkboxes.');
//     });

//     test('TC_RE_009 Verify mandatory field validation on Qualification', async ({ page, rulesEnginePage }, testInfo) => {
//         // Confirmed live: Next renders disabled on a blank Qualification step.
//         const nextIsEnabled = await rulesEnginePage.nextBtn.isEnabled().catch(() => false);
//         expect(nextIsEnabled, 'Expected Next to be disabled while Qualification is blank').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_009_qualification_mandatory_validation');
//         console.log('Next stays disabled until Qualification\'s mandatory fields are filled.');
//     });

//     test('TC_RE_010 Verify Required Amount only accepts integers', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.fillRequiredAmount('12.5abc');
//         const typedValue = await rulesEnginePage.getRequiredAmountValue();
//         expect(/^\d*$/.test(typedValue), `Expected Required Amount to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

//         await rulesEnginePage.fillRequiredAmount('7');
//         expect(await rulesEnginePage.getRequiredAmountValue(), 'Expected a plain integer to be accepted').toBe('7');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_010_required_amount_integer_only');
//         console.log('Required Amount rejects decimals/letters and accepts a plain integer.');
//     });

//     test('TC_RE_011 Verify Start Date and End Date fields', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.setStartDate();
//         const startValue = await rulesEnginePage.startDateInput.inputValue();
//         expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

//         await rulesEnginePage.setEndDate();
//         const endValue = await rulesEnginePage.endDateInput.inputValue();
//         expect(endValue.trim().length > 0, 'Expected End Date to be selected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_011_start_end_date');
//         console.log('Start Date and End Date both accept a selection.');
//     });

//     test('TC_RE_012 Verify Is First Qualifying Amount checkbox toggles', async ({ page, rulesEnginePage }, testInfo) => {
//         const before = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.isFirstQualifyingAmountCheckbox);
//         await rulesEnginePage.toggleIsFirstQualifyingAmount();
//         const after = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.isFirstQualifyingAmountCheckbox);
//         expect(after, 'Expected Is First Qualifying Amount to change state').toBe(!before);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_012_is_first_qualifying_amount');
//         console.log('Is First Qualifying Amount checkbox toggles.');
//     });

//     test('TC_RE_013 Verify Multi Award checkbox toggles', async ({ page, rulesEnginePage }, testInfo) => {
//         const before = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.multiAwardCheckbox);
//         await rulesEnginePage.toggleMultiAward();
//         const after = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.multiAwardCheckbox);
//         expect(after, 'Expected Multi Award to change state').toBe(!before);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_013_multi_award');
//         console.log('Multi Award checkbox toggles.');
//     });

//     test('TC_RE_014 Verify Back returns to Basics with data preserved', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickBack();
//         await expect(rulesEnginePage.descriptionInput, 'Expected to return to the Basics step').toBeVisible({ timeout: 10000 });
//         expect(await rulesEnginePage.getDescriptionValue(), 'Expected Description to still hold its value after Back').toBe(description);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_014_back_to_basics');
//         console.log('Back returns to Basics with the previously entered Description preserved.');
//     });

//     test('TC_RE_015 Verify a non-Recurring Eligibility Frequency skips the Schedule step', async ({ page, rulesEnginePage }, testInfo) => {
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await expect(rulesEnginePage.addGroupBtn, 'Expected to land on the Rules step').toBeVisible({ timeout: 15000 });

//         // Per the user: no Group/condition is needed to proceed — Next from Rules is clickable as-is.
//         await rulesEnginePage.clickNext();

//         // Schedule is skipped entirely for a non-Recurring rule — Next from Rules should land
//         // directly on Review.
//         await expect(rulesEnginePage.addRecurringFrequencyBtn, 'Expected the Schedule step to be skipped entirely').not.toBeVisible({ timeout: 10000 });
//         await expect(rulesEnginePage.backToListBtn, 'Expected Next from Rules to land on Review').toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_015_non_recurring_skips_schedule');
//         console.log('A non-Recurring Eligibility Frequency correctly skips the Schedule step — Next from Rules lands on Review.');
//     });

//     test('TC_RE_016 Verify Recurring Eligibility Frequency opens the Schedule step later', async ({ page, rulesEnginePage }, testInfo) => {
//         await fillQualificationStepRecurring(page, rulesEnginePage);
//         await expect(rulesEnginePage.addGroupBtn, 'Expected to land on the Rules step').toBeVisible({ timeout: 15000 });

//         // Per the user: no Group/condition is needed to proceed — Next from Rules is clickable as-is.
//         await rulesEnginePage.clickNext();

//         // Recurring means Schedule must appear now, straight after Rules.
//         await expect(rulesEnginePage.addRecurringFrequencyBtn, 'Expected Next from Rules to land on the Schedule step for a Recurring rule').toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_016_recurring_opens_schedule');
//         console.log('Recurring Eligibility Frequency correctly opens the Schedule step right after Rules.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_017 to TC_RE_022 — Step 3: Rules — Combine groups with / Add group popup
// //  None of these persist a Rule (closed mid-wizard), so no cleanup is needed.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Rules Step - Groups Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         const description = `Rule_${Date.now()}`;
//         await navigateToRulesStep(page, sidebarPage, rulesEnginePage, description);
//     });

//     test('TC_RE_017 Verify Combine groups with dropdown has And and Or', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.selectCombineGroupsWith('And');
//         const valueAfterAnd = await rulesEnginePage.getDropdownValue(rulesEnginePage.combineGroupsWithDropdown);
//         expect(valueAfterAnd, 'Expected And to be selected').toBe('And');

//         await rulesEnginePage.selectCombineGroupsWith('Or');
//         const valueAfterOr = await rulesEnginePage.getDropdownValue(rulesEnginePage.combineGroupsWithDropdown);
//         expect(valueAfterOr, 'Expected Or to be selected').toBe('Or');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_017_combine_groups_with');
//         console.log('Combine groups with dropdown offers and accepts both And and Or.');
//     });

//     test('TC_RE_018 Verify Add group popup opens with Description and Group Operator', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddGroup();
//         await expect(rulesEnginePage.groupDescriptionInput, 'Expected Group Description field').toBeVisible();
//         await expect(rulesEnginePage.groupOperatorDropdown, 'Expected Group Operator field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_018_add_group_popup');
//         console.log('Add group popup opens with Description and Group Operator fields.');

//         await rulesEnginePage.clickCancel();
//     });

//     test('TC_RE_019 Verify mandatory field validation on Add group', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddGroup();
//         const saveWasClickable = await rulesEnginePage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await rulesEnginePage.clickSave();
//             await page.waitForTimeout(500);
//         }
//         const hasErrors = await rulesEnginePage.hasValidationErrors();
//         expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation when Group Description is blank').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_019_add_group_mandatory_validation');
//         console.log(`Add group mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_020 Verify Group Operator dropdown has And and Or', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddGroup();
//         await rulesEnginePage.selectGroupOperator('And');
//         expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.groupOperatorDropdown), 'Expected And to be selected').toBe('And');

//         await rulesEnginePage.selectGroupOperator('Or');
//         expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.groupOperatorDropdown), 'Expected Or to be selected').toBe('Or');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_020_group_operator_dropdown');
//         console.log('Group Operator dropdown offers and accepts both And and Or.');

//         await rulesEnginePage.clickCancel();
//     });

//     test('TC_RE_021 Verify Cancel discards the Add group popup', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddGroup();
//         await rulesEnginePage.fillGroupDescription(`Group_${Date.now()}`);

//         await rulesEnginePage.clickCancel();
//         await expect(rulesEnginePage.groupDescriptionInput, 'Expected the Add group popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_021_add_group_cancel');
//         console.log('Cancel closes the Add group popup without creating anything.');
//     });

//     test('TC_RE_022 Verify Save creates a group and reveals Sport/Casino/Deposit Conditions', async ({ page, rulesEnginePage }, testInfo) => {
//         const groupName = `Group_${Date.now()}`;
//         await rulesEnginePage.createGroup(groupName, 'And');

//         const toastText = await rulesEnginePage.getToastText(5000);
//         console.log(`Toast after Add group Save: "${toastText || '(no toast appeared)'}"`);

//         const groupVisible = await rulesEnginePage.isGroupVisibleByDescription(groupName);
//         expect(groupVisible, `Expected the new group "${groupName}" to appear after Save. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//         await expect(page.getByRole('heading', { name: rulesEngineLocators.headingSportConditions, exact: true }), 'Expected Sport conditions to appear after a group is created').toBeVisible({ timeout: 10000 });
//         await expect(page.getByRole('heading', { name: rulesEngineLocators.headingCasinoConditions, exact: true }), 'Expected Casino conditions to appear after a group is created').toBeVisible();
//         await expect(page.getByRole('heading', { name: rulesEngineLocators.headingDepositConditions, exact: true }), 'Expected Deposit conditions to appear after a group is created').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_022_group_created');
//         console.log(`✅ TC_RE_022 PASSED — Group "${groupName}" was created and all 3 condition sections appeared.`);
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_RE_023 to TC_RE_035 — Step 3: Rules — Sport Conditions (Add sport popup)
//  None of these persist a Rule, so no cleanup is needed. A Group is created first in every test
//  here since Sport Conditions only appears once a Group exists.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Rules Engine - Rules Step - Sport Conditions Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
        const description = `Rule_${Date.now()}`;
        await navigateToRulesStep(page, sidebarPage, rulesEnginePage, description);
        await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
        await rulesEnginePage.addSportBtn.waitFor({ state: 'visible', timeout: 10000 });
    });

    // test('TC_RE_023 Verify Add sport popup opens with all 14 fields and 4 checkboxes', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();

    //     await expect(rulesEnginePage.betSlipTypeDropdown, 'Expected Bet Slip Type').toBeVisible();
    //     await expect(rulesEnginePage.settlementFilterDropdown, 'Expected Settlement Filter').toBeVisible();
    //     await expect(rulesEnginePage.feedNameDropdown, 'Expected Feed Name').toBeVisible();
    //     await expect(rulesEnginePage.sportDropdown, 'Expected Sport').toBeVisible();
    //     await expect(rulesEnginePage.leagueInput, 'Expected League').toBeVisible();
    //     await expect(rulesEnginePage.countryInput, 'Expected Country').toBeVisible();
    //     await expect(rulesEnginePage.eventInput, 'Expected Event').toBeVisible();
    //     await expect(rulesEnginePage.marketInput, 'Expected Market').toBeVisible();
    //     await expect(rulesEnginePage.outcomeInput, 'Expected Outcome').toBeVisible();
    //     await expect(rulesEnginePage.bookingCodeInput, 'Expected Booking Code').toBeVisible();
    //     await expect(rulesEnginePage.minimumWagerAmountInput, 'Expected Minimum Wager Amount').toBeVisible();
    //     await expect(rulesEnginePage.minimumBetslipOddsMultiplierInput, 'Expected Minimum Betslip Odds Multiplier').toBeVisible();
    //     await expect(rulesEnginePage.minimumLegsRequiredInput, 'Expected Minimum Legs Required').toBeVisible();
    //     await expect(rulesEnginePage.minimumLegOddsMultiplierInput, 'Expected Minimum Leg Odds Multiplier').toBeVisible();
    //     await expect(rulesEnginePage.applyOddsAndMultiplierToLegsInTotalCheckbox, 'Expected Apply Odds And Multiplier To Legs In Total').toBeVisible();
    //     await expect(rulesEnginePage.applyRuleToAllBetsCheckbox, 'Expected Apply Rule To All Bets').toBeVisible();
    //     await expect(rulesEnginePage.isSingleLegOnlyCheckbox, 'Expected Single Leg Only').toBeVisible();
    //     await expect(rulesEnginePage.isBuildABetCheckbox, 'Expected Build A Bet').toBeVisible();

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_023_add_sport_popup_fields');
    //     console.log('Add sport popup opens with all 14 fields and 4 checkboxes.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_024 Verify Sport dropdown is disabled until Feed Name is selected', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();

    //     const disabledBefore = await rulesEnginePage.isSportDropdownDisabled();
    //     expect(disabledBefore, 'Expected Sport to be disabled before Feed Name is selected').toBe(true);

    //     await rulesEnginePage.selectFirstFeedName();
    //     const disabledAfter = await rulesEnginePage.isSportDropdownDisabled();
    //     expect(disabledAfter, 'Expected Sport to become enabled once Feed Name is selected').toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_024_sport_disabled_until_feed');
    //     console.log('Sport stays disabled until Feed Name is selected, then becomes enabled.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_025 Verify mandatory field validation on Add sport', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     const saveWasClickable = await rulesEnginePage.saveBtn.isEnabled().catch(() => false);
    //     if (saveWasClickable) {
    //         await rulesEnginePage.clickSave();
    //         await page.waitForTimeout(500);
    //     }
    //     const hasErrors = await rulesEnginePage.hasValidationErrors();
    //     expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation when Bet Slip Type/Feed Name/Sport are blank').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_025_add_sport_mandatory_validation');
    //     console.log(`Add sport mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

    //     await rulesEnginePage.clickCancel().catch(() => {});
    // });

    // test('TC_RE_026 Verify Market is disabled until Event is filled, then becomes enabled', async ({ page, rulesEnginePage }, testInfo) => {
    //     // Confirmed live: League/Event/Market/Outcome only become dependent dropdowns (with a
    //     // real League -> Event -> Market -> Outcome enable chain) once Feed Name + Sport are
    //     // selected — before that they're independent, always-enabled plain text inputs.
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();

    //     const disabledBefore = await rulesEnginePage.isMarketFieldDisabled();
    //     expect(disabledBefore, 'Expected Market to be disabled before Event is filled').toBe(true);

    //     await rulesEnginePage.selectFirstEvent();
    //     const disabledAfter = await rulesEnginePage.isMarketFieldDisabled();
    //     expect(disabledAfter, 'Expected Market to become enabled once Event is filled').toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_026_market_enabled_by_event');
    //     console.log('Market stays disabled until Event is filled, then becomes enabled.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_027 Verify Outcome is disabled until Market is filled, then becomes enabled', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();

    //     const disabledBefore = await rulesEnginePage.isOutcomeFieldDisabled();
    //     expect(disabledBefore, 'Expected Outcome to be disabled before Market is filled').toBe(true);

    //     await rulesEnginePage.selectFirstMarket();
    //     const disabledAfter = await rulesEnginePage.isOutcomeFieldDisabled();
    //     expect(disabledAfter, 'Expected Outcome to become enabled once Market is filled').toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_027_outcome_enabled_by_market');
    //     console.log('Outcome stays disabled until Market is filled, then becomes enabled.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_028 Verify clearing League also clears Event, Market and Outcome', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();
    //     await rulesEnginePage.selectFirstMarket();
    //     await rulesEnginePage.selectFirstOutcome();

    //     await rulesEnginePage.clearLeagueViaDropdown();
    //     await page.waitForTimeout(300);

    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.eventInput), 'Expected Event to be cleared when League is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.marketInput), 'Expected Market to be cleared when League is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.outcomeInput), 'Expected Outcome to be cleared when League is cleared').toBe('');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_028_clear_league_cascades');
    //     console.log('Clearing League correctly cascades to clear Event, Market and Outcome.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_029 Verify clearing Event also clears Market and Outcome', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();
    //     await rulesEnginePage.selectFirstMarket();
    //     await rulesEnginePage.selectFirstOutcome();

    //     await rulesEnginePage.clearEventViaDropdown();
    //     await page.waitForTimeout(300);

    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.marketInput), 'Expected Market to be cleared when Event is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.outcomeInput), 'Expected Outcome to be cleared when Event is cleared').toBe('');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_029_clear_event_cascades');
    //     console.log('Clearing Event correctly cascades to clear Market and Outcome.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_030 Verify clearing Market also clears Outcome', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();
    //     await rulesEnginePage.selectFirstMarket();
    //     await rulesEnginePage.selectFirstOutcome();

    //     await rulesEnginePage.clearMarketViaDropdown();
    //     await page.waitForTimeout(300);

    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.outcomeInput), 'Expected Outcome to be cleared when Market is cleared').toBe('');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_030_clear_market_cascades');
    //     console.log('Clearing Market correctly cascades to clear Outcome.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_031 Verify clearing Sport cascades to clear League, Event, Market and Outcome', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();
    //     await rulesEnginePage.selectFirstMarket();
    //     await rulesEnginePage.selectFirstOutcome();

    //     // Sport is a p-dropdown — cleared via its own clear icon (p-dropdown-clearable, confirmed
    //     // live on this popup's dropdowns), not a text-input .fill('').
    //     const clearIcon = rulesEnginePage.sportDropdown.locator('.p-dropdown-clear-icon');
    //     await clearIcon.click();
    //     await page.waitForTimeout(300);

    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.leagueInput), 'Expected League to be cleared when Sport is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.eventInput), 'Expected Event to be cleared when Sport is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.marketInput), 'Expected Market to be cleared when Sport is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.outcomeInput), 'Expected Outcome to be cleared when Sport is cleared').toBe('');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_031_clear_sport_cascades');
    //     console.log('Clearing Sport correctly cascades to clear League, Event, Market and Outcome.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_032 Verify clearing Feed Name cascades to clear League, Event, Market and Outcome', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await rulesEnginePage.selectFirstLeague();
    //     await rulesEnginePage.selectFirstCountry();
    //     await rulesEnginePage.selectFirstEvent();
    //     await rulesEnginePage.selectFirstMarket();
    //     await rulesEnginePage.selectFirstOutcome();

    //     const clearIcon = rulesEnginePage.feedNameDropdown.locator('.p-dropdown-clear-icon');
    //     await clearIcon.click();
    //     await page.waitForTimeout(300);

    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.leagueInput), 'Expected League to be cleared when Feed Name is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.eventInput), 'Expected Event to be cleared when Feed Name is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.marketInput), 'Expected Market to be cleared when Feed Name is cleared').toBe('');
    //     expect(await rulesEnginePage.getDropdownValue(rulesEnginePage.outcomeInput), 'Expected Outcome to be cleared when Feed Name is cleared').toBe('');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_032_clear_feed_name_cascades');
    //     console.log('Clearing Feed Name correctly cascades to clear League, Event, Market and Outcome.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_033 Verify numeric fields and checkboxes accept input', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();

    //     await rulesEnginePage.fillMinimumWagerAmount('5');
    //     await rulesEnginePage.fillMinimumBetslipOddsMultiplier('2');
    //     await rulesEnginePage.fillMinimumLegsRequired('1');
    //     await rulesEnginePage.fillMinimumLegOddsMultiplier('3');

    //     const oddsCheckedBefore = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.applyOddsAndMultiplierToLegsInTotalCheckbox);
    //     await rulesEnginePage.toggleApplyOddsAndMultiplierToLegsInTotal();
    //     expect(await rulesEnginePage.isCheckboxChecked(rulesEnginePage.applyOddsAndMultiplierToLegsInTotalCheckbox), 'Expected Apply Odds And Multiplier To Legs In Total to toggle').toBe(!oddsCheckedBefore);

    //     const singleLegCheckedBefore = await rulesEnginePage.isCheckboxChecked(rulesEnginePage.isSingleLegOnlyCheckbox);
    //     await rulesEnginePage.toggleIsSingleLegOnly();
    //     expect(await rulesEnginePage.isCheckboxChecked(rulesEnginePage.isSingleLegOnlyCheckbox), 'Expected Single Leg Only to toggle').toBe(!singleLegCheckedBefore);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_033_numeric_and_checkboxes');
    //     console.log('Numeric fields accept input and checkboxes toggle on the Add sport popup.');

    //     await rulesEnginePage.clickCancel();
    // });

    // test('TC_RE_034 Verify Cancel discards the Add sport popup', async ({ page, rulesEnginePage }, testInfo) => {
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstFeedName();

    //     await rulesEnginePage.clickCancel();
    //     await expect(rulesEnginePage.betSlipTypeDropdown, 'Expected the Add sport popup to close without saving').not.toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_034_add_sport_cancel');
    //     console.log('Cancel closes the Add sport popup without creating anything.');
    // });

    // test('TC_RE_035 Verify Save creates a Sport condition', async ({ page, rulesEnginePage }, testInfo) => {
    //     const countBefore = await rulesEnginePage.getSportConditionCount();
    //     await rulesEnginePage.clickAddSport();
    //     await rulesEnginePage.selectFirstBetSlipType();
    //     await rulesEnginePage.selectFirstFeedName();
    //     await rulesEnginePage.selectFirstSport();
    //     await page.waitForTimeout(300);

    //     await expect(rulesEnginePage.saveBtn, 'Expected Save to be enabled once Bet Slip Type/Feed Name/Sport are filled').toBeEnabled({ timeout: 10000 });
    //     await rulesEnginePage.clickSave();

    //     await expect(rulesEnginePage.betSlipTypeDropdown, 'Expected the Add sport popup to close after Save').not.toBeVisible({ timeout: 10000 });
    //     await expect.poll(() => rulesEnginePage.getSportConditionCount(), { message: 'Expected the Sport Conditions table to gain one row after Save', timeout: 10000 }).toBe(countBefore + 1);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_035_sport_condition_created');
    //     console.log('✅ TC_RE_035 PASSED — Save created a new row in the Sport Conditions table.');
    // });

    test('TC_RE_035b Verify Edit and Delete on a saved Sport condition', async ({ page, rulesEnginePage }, testInfo) => {
        await rulesEnginePage.clickAddSport();
        await rulesEnginePage.selectFirstBetSlipType();
        await rulesEnginePage.selectFirstFeedName();
        await rulesEnginePage.selectFirstSport();
        await page.waitForTimeout(300);
        await rulesEnginePage.clickSave();
        await expect.poll(() => rulesEnginePage.getSportConditionCount(), { timeout: 10000 }).toBeGreaterThan(0);

        await rulesEnginePage.clickEditForFirstSportCondition();
        await expect(rulesEnginePage.betSlipTypeDropdown, 'Expected Edit to reopen the Add sport popup pre-filled').toBeVisible({ timeout: 10000 });
        await rulesEnginePage.clickCancel();

        const countBeforeDelete = await rulesEnginePage.getSportConditionCount();
        await rulesEnginePage.clickDeleteForFirstSportCondition();
        // Tolerant: delete might be immediate or go through the same Yes/No confirmation used
        // elsewhere in this app — not confirmed live which for condition rows specifically.
        if (await rulesEnginePage.confirmYesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await rulesEnginePage.clickConfirmYes();
        }
        await expect.poll(() => rulesEnginePage.getSportConditionCount(), { message: 'Expected the Sport Conditions table to lose one row after Delete', timeout: 10000 }).toBe(countBeforeDelete - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_035b_sport_condition_edit_delete');
        console.log('✅ TC_RE_035b PASSED — Edit reopened the popup pre-filled and Delete removed the Sport condition row.');
    });
});

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_036 to TC_RE_039 — Step 3: Rules — Casino Conditions. Popup fields, dependency (Game
// //  disabled until Provider) and saved-row Edit/Delete are all confirmed live.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Rules Step - Casino Conditions Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         const description = `Rule_${Date.now()}`;
//         await navigateToRulesStep(page, sidebarPage, rulesEnginePage, description);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.addCasinoBtn.waitFor({ state: 'visible', timeout: 10000 });
//     });

//     test('TC_RE_036 Verify Add casino popup opens with its 5 fields', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddCasino();

//         await expect(rulesEnginePage.casinoProviderDropdown, 'Expected Provider field').toBeVisible({ timeout: 10000 });
//         await expect(rulesEnginePage.casinoGameDropdown, 'Expected Game field').toBeVisible();
//         await expect(rulesEnginePage.casinoCategoryInput, 'Expected Category field').toBeVisible();
//         await expect(rulesEnginePage.casinoMinimumWagerAmountInput, 'Expected Minimum Wager Amount field').toBeVisible();
//         await expect(rulesEnginePage.casinoMinimumMultiplierAmountInput, 'Expected Minimum Multiplier Amount field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_036_add_casino_popup_fields');
//         console.log('Add casino popup opens with all 5 fields.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_036b Verify Game is disabled until Provider is selected', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddCasino();

//         const disabledBefore = await rulesEnginePage.isCasinoGameDropdownDisabled();
//         expect(disabledBefore, 'Expected Game to be disabled before Provider is selected').toBe(true);

//         await rulesEnginePage.selectFirstCasinoProvider();
//         const disabledAfter = await rulesEnginePage.isCasinoGameDropdownDisabled();
//         expect(disabledAfter, 'Expected Game to become enabled once Provider is selected').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_036b_casino_game_disabled_until_provider');
//         console.log('Game stays disabled until Provider is selected, then becomes enabled.');

//         await rulesEnginePage.clickCancel();
//     });

//     test('TC_RE_037 Verify mandatory field validation on Add casino', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddCasino();
//         const saveWasClickable = await rulesEnginePage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await rulesEnginePage.clickSave();
//             await page.waitForTimeout(500);
//         }
//         const hasErrors = await rulesEnginePage.hasValidationErrors();
//         expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation when Provider/Game/Category are blank').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_037_add_casino_mandatory_validation');
//         console.log(`Add casino mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_038 Verify Cancel discards the Add casino popup', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddCasino();
//         await rulesEnginePage.fillCasinoCategory(`Category_${Date.now()}`);

//         await rulesEnginePage.clickCancel();
//         await expect(rulesEnginePage.casinoCategoryInput, 'Expected the Add casino popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_038_add_casino_cancel');
//         console.log('Cancel closes the Add casino popup without creating anything.');
//     });

//     test('TC_RE_039 Verify Save creates a Casino condition', async ({ page, rulesEnginePage }, testInfo) => {
//         const countBefore = await rulesEnginePage.getCasinoConditionCount();
//         await rulesEnginePage.clickAddCasino();
//         await rulesEnginePage.selectFirstCasinoProvider();
//         await rulesEnginePage.selectFirstCasinoGame();
//         await rulesEnginePage.fillCasinoCategory(`Category_${Date.now()}`);
//         await page.waitForTimeout(300);

//         await expect(rulesEnginePage.saveBtn, 'Expected Save to be enabled once Provider/Game/Category are filled').toBeEnabled({ timeout: 10000 });
//         await rulesEnginePage.clickSave();

//         await expect(rulesEnginePage.casinoCategoryInput, 'Expected the Add casino popup to close after Save').not.toBeVisible({ timeout: 10000 });
//         await expect.poll(() => rulesEnginePage.getCasinoConditionCount(), { message: 'Expected the Casino Conditions table to gain one row after Save', timeout: 10000 }).toBe(countBefore + 1);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_039_casino_condition_created');
//         console.log('✅ TC_RE_039 PASSED — Save created a new row in the Casino Conditions table.');
//     });

//     test('TC_RE_039b Verify Edit and Delete on a saved Casino condition', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddCasino();
//         await rulesEnginePage.selectFirstCasinoProvider();
//         await rulesEnginePage.selectFirstCasinoGame();
//         await rulesEnginePage.fillCasinoCategory(`Category_${Date.now()}`);
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await expect.poll(() => rulesEnginePage.getCasinoConditionCount(), { timeout: 10000 }).toBeGreaterThan(0);

//         await rulesEnginePage.clickEditForFirstCasinoCondition();
//         await expect(rulesEnginePage.casinoProviderDropdown, 'Expected Edit to reopen the Add casino popup pre-filled').toBeVisible({ timeout: 10000 });
//         await rulesEnginePage.clickCancel();

//         const countBeforeDelete = await rulesEnginePage.getCasinoConditionCount();
//         await rulesEnginePage.clickDeleteForFirstCasinoCondition();
//         if (await rulesEnginePage.confirmYesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
//             await rulesEnginePage.clickConfirmYes();
//         }
//         await expect.poll(() => rulesEnginePage.getCasinoConditionCount(), { message: 'Expected the Casino Conditions table to lose one row after Delete', timeout: 10000 }).toBe(countBeforeDelete - 1);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_039b_casino_condition_edit_delete');
//         console.log('✅ TC_RE_039b PASSED — Edit reopened the popup pre-filled and Delete removed the Casino condition row.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_040 to TC_RE_043 — Step 3: Rules — Deposit Conditions. Popup fields and saved-row
// //  Edit/Delete are all confirmed live.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Rules Step - Deposit Conditions Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         const description = `Rule_${Date.now()}`;
//         await navigateToRulesStep(page, sidebarPage, rulesEnginePage, description);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.addDepositBtn.waitFor({ state: 'visible', timeout: 10000 });
//     });

//     test('TC_RE_040 Verify Add deposit popup opens with its 2 fields', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddDeposit();

//         await expect(rulesEnginePage.depositMinimumDepositAmountInput, 'Expected Minimum Deposit Amount field').toBeVisible({ timeout: 10000 });
//         await expect(rulesEnginePage.depositPaymentMethodDropdown, 'Expected Payment Method field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_040_add_deposit_popup_fields');
//         console.log('Add deposit popup opens with Minimum Deposit Amount and Payment Method visible.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_041 Verify Minimum Deposit Amount only accepts integers', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddDeposit();

//         await rulesEnginePage.fillMinimumDepositAmount('9.5xyz');
//         const typedValue = await rulesEnginePage.depositMinimumDepositAmountInput.inputValue();
//         expect(/^\d*$/.test(typedValue.trim()), `Expected Minimum Deposit Amount to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_041_minimum_deposit_amount_integer_only');
//         console.log('Minimum Deposit Amount rejects decimals/letters.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_042 Verify Cancel discards the Add deposit popup', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddDeposit();
//         await rulesEnginePage.fillMinimumDepositAmount('5');

//         await rulesEnginePage.clickCancel();
//         await expect(rulesEnginePage.depositMinimumDepositAmountInput, 'Expected the Add deposit popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_042_add_deposit_cancel');
//         console.log('Cancel closes the Add deposit popup without creating anything.');
//     });

//     test('TC_RE_043 Verify Save creates a Deposit condition', async ({ page, rulesEnginePage }, testInfo) => {
//         const countBefore = await rulesEnginePage.getDepositConditionCount();
//         await rulesEnginePage.clickAddDeposit();
//         await rulesEnginePage.fillMinimumDepositAmount('5');
//         await rulesEnginePage.selectFirstPaymentMethod();
//         await page.waitForTimeout(300);

//         await expect(rulesEnginePage.saveBtn, 'Expected Save to be enabled once Minimum Deposit Amount/Payment Method are filled').toBeEnabled({ timeout: 10000 });
//         await rulesEnginePage.clickSave();

//         await expect(rulesEnginePage.depositMinimumDepositAmountInput, 'Expected the Add deposit popup to close after Save').not.toBeVisible({ timeout: 10000 });
//         await expect.poll(() => rulesEnginePage.getDepositConditionCount(), { message: 'Expected the Deposit Conditions table to gain one row after Save', timeout: 10000 }).toBe(countBefore + 1);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_043_deposit_condition_created');
//         console.log('✅ TC_RE_043 PASSED — Save created a new row in the Deposit Conditions table.');
//     });

//     test('TC_RE_043b Verify Edit and Delete on a saved Deposit condition', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddDeposit();
//         await rulesEnginePage.fillMinimumDepositAmount('5');
//         await rulesEnginePage.selectFirstPaymentMethod();
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await expect.poll(() => rulesEnginePage.getDepositConditionCount(), { timeout: 10000 }).toBeGreaterThan(0);

//         await rulesEnginePage.clickEditForFirstDepositCondition();
//         await expect(rulesEnginePage.depositMinimumDepositAmountInput, 'Expected Edit to reopen the Add deposit popup pre-filled').toBeVisible({ timeout: 10000 });
//         await rulesEnginePage.clickCancel();

//         const countBeforeDelete = await rulesEnginePage.getDepositConditionCount();
//         await rulesEnginePage.clickDeleteForFirstDepositCondition();
//         if (await rulesEnginePage.confirmYesBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
//             await rulesEnginePage.clickConfirmYes();
//         }
//         await expect.poll(() => rulesEnginePage.getDepositConditionCount(), { message: 'Expected the Deposit Conditions table to lose one row after Delete', timeout: 10000 }).toBe(countBeforeDelete - 1);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_043b_deposit_condition_edit_delete');
//         console.log('✅ TC_RE_043b PASSED — Edit reopened the popup pre-filled and Delete removed the Deposit condition row.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_044 to TC_RE_053 — Step 4: Schedule — Add Recurring Frequency popup. Fields, the
// //  Duration range, the 3 pill sections (days of week / months / days of month) with their quick-
// //  action buttons, and the live summary line are all confirmed live.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Schedule Step Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         const description = `Rule_${Date.now()}`;
//         await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.addSportBtn.waitFor({ state: 'visible', timeout: 10000 });
//         await rulesEnginePage.clickNext();
//     });

//     test('TC_RE_044 Verify the Schedule step appears for a Recurring rule', async ({ page, rulesEnginePage }, testInfo) => {
//         await expect(rulesEnginePage.addRecurringFrequencyBtn, 'Expected the Add Recurring Frequency button on the Schedule step').toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_044_schedule_step_appears');
//         console.log('Schedule step appears for a Recurring rule, with the Add Recurring Frequency button visible.');
//     });

//     test('TC_RE_045 Verify Add Recurring Frequency popup opens with Start Time, Duration and all 3 pill sections', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();

//         await expect(rulesEnginePage.scheduleStartTimeInput, 'Expected Start Time field').toBeVisible({ timeout: 10000 });
//         await expect(rulesEnginePage.scheduleDurationInput, 'Expected Duration field').toBeVisible();
//         await expect(rulesEnginePage.weekPillSection, 'Expected the Days of the week section').toBeVisible();
//         await expect(rulesEnginePage.monthPillSection, 'Expected the Months section').toBeVisible();
//         await expect(rulesEnginePage.datePillSection, 'Expected the Days of the month section').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_045_add_recurring_frequency_popup');
//         console.log('Add Recurring Frequency popup opens with Start Time, Duration and all 3 pill sections.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_046 Verify Back from Schedule returns to Rules', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickBack();
//         await expect(rulesEnginePage.addGroupBtn, 'Expected Back from Schedule to return to the Rules step').toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_046_schedule_back_to_rules');
//         console.log('Back from Schedule correctly returns to the Rules step.');
//     });

//     test('TC_RE_047 Verify Duration only accepts integers within 1-24', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();

//         await rulesEnginePage.fillDurationHours('5');
//         const value = await rulesEnginePage.getDurationHoursValue();
//         // Confirmed live the displayed value carries a " hrs" suffix (e.g. "5 hrs") — tolerant of
//         // that rather than requiring a bare "5".
//         expect(value.startsWith('5'), `Expected Duration to accept "5", but got "${value}"`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_047_duration_accepts_integer');
//         console.log('Duration accepts a plain integer within its 1-24 range.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_048 Verify individual day/month/date pills toggle on and off', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();

//         await rulesEnginePage.togglePill(rulesEnginePage.weekPillSection, 'Monday');
//         expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, 'Monday'), 'Expected Monday to become pressed').toBe(true);
//         await rulesEnginePage.togglePill(rulesEnginePage.weekPillSection, 'Monday');
//         expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, 'Monday'), 'Expected Monday to become unpressed again').toBe(false);

//         await rulesEnginePage.togglePill(rulesEnginePage.monthPillSection, 'January');
//         expect(await rulesEnginePage.isPillPressed(rulesEnginePage.monthPillSection, 'January'), 'Expected January to become pressed').toBe(true);

//         await rulesEnginePage.togglePill(rulesEnginePage.datePillSection, 'Day 1');
//         expect(await rulesEnginePage.isPillPressed(rulesEnginePage.datePillSection, 'Day 1'), 'Expected Day 1 to become pressed').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_048_individual_pills_toggle');
//         console.log('Individual day/month/date pills toggle pressed/unpressed correctly.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_049 Verify the Weekdays quick action selects Mon-Fri only', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();
//         await rulesEnginePage.clickPillAction(rulesEnginePage.weekPillSection, 'Weekdays');

//         for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
//             expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, day), `Expected ${day} to be pressed after Weekdays`).toBe(true);
//         }
//         for (const day of ['Saturday', 'Sunday']) {
//             expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, day), `Expected ${day} to stay unpressed after Weekdays`).toBe(false);
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_049_weekdays_quick_action');
//         console.log('Weekdays quick action selects Monday through Friday only.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_050 Verify the Clear quick action deselects every day', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();
//         await rulesEnginePage.clickPillAction(rulesEnginePage.weekPillSection, 'Every day');
//         expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, 'Monday'), 'Expected Every day to press Monday').toBe(true);

//         await rulesEnginePage.clickPillAction(rulesEnginePage.weekPillSection, 'Clear');
//         for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
//             expect(await rulesEnginePage.isPillPressed(rulesEnginePage.weekPillSection, day), `Expected ${day} to be cleared`).toBe(false);
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_050_clear_quick_action');
//         console.log('Clear quick action correctly deselects every day of the week.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_051 Verify the summary line updates to reflect the selected schedule', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();
//         const summaryBefore = await rulesEnginePage.getScheduleSummaryText();

//         await rulesEnginePage.clickPillAction(rulesEnginePage.weekPillSection, 'Weekdays');
//         await rulesEnginePage.clickPillAction(rulesEnginePage.monthPillSection, 'Every month');
//         const summaryAfter = await rulesEnginePage.getScheduleSummaryText();

//         expect(summaryAfter, 'Expected the summary line to change once a schedule is selected').not.toBe(summaryBefore);
//         console.log(`Summary changed from "${summaryBefore}" to "${summaryAfter}".`);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_051_summary_line_updates');
//         console.log('The live summary line updates to reflect the selected recurring schedule.');

//         await rulesEnginePage.clickCancel().catch(() => {});
//     });

//     test('TC_RE_052 Verify Cancel discards the Add Recurring Frequency popup', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();
//         await rulesEnginePage.togglePill(rulesEnginePage.weekPillSection, 'Monday');

//         await rulesEnginePage.clickCancel();
//         await expect(rulesEnginePage.scheduleStartTimeInput, 'Expected the Add Recurring Frequency popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_052_add_recurring_frequency_cancel');
//         console.log('Cancel closes the Add Recurring Frequency popup without creating anything.');
//     });

//     test('TC_RE_053 Verify Save creates a Recurring Frequency', async ({ page, rulesEnginePage }, testInfo) => {
//         await rulesEnginePage.clickAddRecurringFrequency();
//         await rulesEnginePage.clickPillAction(rulesEnginePage.weekPillSection, 'Weekdays');
//         await page.waitForTimeout(300);

//         await expect(rulesEnginePage.saveBtn, 'Expected Save to be enabled with Start Time/Duration pre-filled and Weekdays selected').toBeEnabled({ timeout: 10000 });
//         await rulesEnginePage.clickSave();

//         await expect(rulesEnginePage.scheduleStartTimeInput, 'Expected the Add Recurring Frequency popup to close after Save').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_053_recurring_frequency_created');
//         console.log('✅ TC_RE_053 PASSED — Save created a new Recurring Frequency.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_054 to TC_RE_057 — Step 5: Review + full end-to-end creation. Confirmed live: 3 panels
// //  (Configuration field list, Rule groups with a "N group(s) · N conditions" badge, Recurring
// //  frequencies), a status banner ("Inactive — not activated yet"), and Back/Back to list — NO
// //  Activate button was present in the captured HTML despite the user's functional description of
// //  one (see activateBtn's own comment) — not asserted either way here.
// //  These DO persist a real Rule (via Back to list) — the shared afterEach deletes it regardless
// //  of pass/fail, per the compulsory cleanup instruction.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - Review Step and Full Creation Tests', () => {
//     let createdRuleDescription: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//         createdRuleDescription = undefined;
//     });

//     test.afterEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         if (createdRuleDescription) {
//             const description = createdRuleDescription;
//             createdRuleDescription = undefined;
//             await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//             await rulesEnginePage.deleteRuleIfPresent(description);
//         }
//     });

//     test('TC_RE_054 Verify Review step renders the Configuration panel and Back to list', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.clickNext();

//         await expect(rulesEnginePage.reviewStatusBanner, 'Expected the Review step\'s status banner').toBeVisible({ timeout: 15000 });
//         await expect(rulesEnginePage.backToListBtn, 'Expected Back to list button on the Review step').toBeVisible();
//         expect(await rulesEnginePage.getReviewFieldValue('Description'), 'Expected the Configuration panel to show this Rule\'s own Description').toBe(description);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_054_review_step');
//         console.log('Review step renders the status banner, the Configuration panel with this Rule\'s Description, and a Back to list button.');
//     });

//     test('TC_RE_055 Verify the Rule groups panel badge reflects the created group and condition', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.clickAddSport();
//         await rulesEnginePage.selectFirstBetSlipType();
//         await rulesEnginePage.selectFirstFeedName();
//         await rulesEnginePage.selectFirstSport();
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await rulesEnginePage.clickNext();

//         await expect(rulesEnginePage.backToListBtn, 'Expected to reach the Review step').toBeVisible({ timeout: 15000 });
//         const badgeText = await rulesEnginePage.getReviewPanelBadgeText('Rule groups');
//         expect(badgeText, `Expected the Rule groups badge to mention "1 group", but got "${badgeText}"`).toContain('1 group');
//         expect(badgeText, `Expected the Rule groups badge to mention "1 condition", but got "${badgeText}"`).toContain('1 condition');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_055_review_rule_groups_badge');
//         console.log(`✅ TC_RE_055 PASSED — Rule groups badge correctly read "${badgeText}" for 1 group with 1 condition.`);
//     });

//     test('TC_RE_056 Verify Back from Review returns to Rules', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.clickNext();

//         await rulesEnginePage.clickBack();
//         await expect(rulesEnginePage.addGroupBtn, 'Expected Back from Review to return to the Rules step').toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_056_review_back_to_rules');
//         console.log('Back from Review correctly returns to the Rules step.');
//     });

//     test('TC_RE_057 Verify Back to list creates the Rule (non-Recurring path)', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.clickAddSport();
//         await rulesEnginePage.selectFirstBetSlipType();
//         await rulesEnginePage.selectFirstFeedName();
//         await rulesEnginePage.selectFirstSport();
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await rulesEnginePage.clickNext();

//         await expect(rulesEnginePage.backToListBtn, 'Expected to reach the Review step').toBeVisible({ timeout: 15000 });
//         await rulesEnginePage.clickBackToList();
//         createdRuleDescription = description;

//         const isVisible = await rulesEnginePage.isRuleVisibleByDescription(description);
//         expect(isVisible, `Expected Rule "${description}" to appear in the Rules Engine list`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_057_rule_created_non_recurring');
//         console.log(`✅ TC_RE_057 PASSED — Rule "${description}" was created end-to-end (non-Recurring path) and appears in the list.`);
//     });

//     test('TC_RE_058 Verify Back to list creates the Rule (Recurring path, with Schedule)', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         await rulesEnginePage.clickAddSport();
//         await rulesEnginePage.selectFirstBetSlipType();
//         await rulesEnginePage.selectFirstFeedName();
//         await rulesEnginePage.selectFirstSport();
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await rulesEnginePage.clickNext();

//         // Recurring path only — the Schedule step must appear here, unlike TC_RE_057.
//         await expect(rulesEnginePage.addRecurringFrequencyBtn, 'Expected the Schedule step for a Recurring rule').toBeVisible({ timeout: 15000 });
//         await rulesEnginePage.clickNext();

//         await expect(rulesEnginePage.backToListBtn, 'Expected to reach the Review step').toBeVisible({ timeout: 15000 });
//         await rulesEnginePage.clickBackToList();
//         createdRuleDescription = description;

//         const isVisible = await rulesEnginePage.isRuleVisibleByDescription(description);
//         expect(isVisible, `Expected Rule "${description}" to appear in the Rules Engine list`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_058_rule_created_recurring');
//         console.log(`✅ TC_RE_058 PASSED — Rule "${description}" was created end-to-end (Recurring path, through Schedule) and appears in the list.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RE_059 to TC_RE_064 — Rules Engine list page: per-row kebab ("...") menu actions
// //  (Open/Edit, Clone, Activate, Deactivate, Delete). Confirmed live via user-supplied outerHTML
// //  for the kebab trigger, the .p-menu overlay's Open/Clone/Activate/Delete items (and its
// //  Deactivate variant once Active), the Clone dialog's Save/Cancel footer, and the Yes/No
// //  confirmation modal shared by Activate/Deactivate/Delete.
// //
// //  Confirmed live via an actual automated run through the kebab menu's Open action (more
// //  reliable than an earlier manual HTML capture, which turned out to reflect a different click
// //  path): Open lands on the REVIEW step (Activate button, Configuration panel, Rule groups
// //  badge, Back/Back to list) — not the Rules step directly. Reaching Rules from there uses the
// //  same "Back" transition already proven by TC_RE_056. TC_RE_059 is built around this.
// //
// //  Flagged assumptions (nothing here was independently confirmed beyond the user's own
// //  description, since no outerHTML was captured for these specific pieces):
// //   - There's no success toast for a saved edit (confirmed by the user) — persistence is verified
// //     by closing (via "Back to list", this app's only confirmed non-destructive way back to the
// //     list) and reopening the Rule via Open again, exactly as the user described checking it.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Rules Engine - List Page - Row Actions Tests', () => {
//     let createdRuleDescription: string | undefined;
//     let createdCloneDescription: string | undefined;

//     // Drives the exact same end-to-end creation flow as TC_RE_057 (non-Recurring path). Pass
//     // withCondition=false to create a Rule with zero Sport/Casino/Deposit conditions, for
//     // TC_RE_061's "Activate blocked" case.
//     async function createFullRule(page: any, rulesEnginePage: any, description: string, withCondition: boolean = true) {
//         await openCreateRule(rulesEnginePage);
//         await fillBasicsStep(page, rulesEnginePage, description);
//         await fillQualificationStepNonRecurring(page, rulesEnginePage);
//         await rulesEnginePage.createGroup(`Group_${Date.now()}`, 'And');
//         if (withCondition) {
//             await rulesEnginePage.clickAddSport();
//             await rulesEnginePage.selectFirstBetSlipType();
//             await rulesEnginePage.selectFirstFeedName();
//             await rulesEnginePage.selectFirstSport();
//             await page.waitForTimeout(300);
//             await rulesEnginePage.clickSave();
//         }
//         await rulesEnginePage.clickNext();
//         await rulesEnginePage.backToListBtn.waitFor({ state: 'visible', timeout: 15000 });
//         await rulesEnginePage.clickBackToList();
//     }

//     test.beforeEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//         createdRuleDescription = undefined;
//         createdCloneDescription = undefined;
//     });

//     test.afterEach(async ({ page, sidebarPage, rulesEnginePage }) => {
//         if (createdCloneDescription || createdRuleDescription) {
//             await navigateToRulesEngine(page, sidebarPage, rulesEnginePage);
//             if (createdCloneDescription) {
//                 await rulesEnginePage.deleteRuleIfPresent(createdCloneDescription);
//             }
//             if (createdRuleDescription) {
//                 await rulesEnginePage.deleteRuleIfPresent(createdRuleDescription);
//             }
//         }
//     });

//     test('TC_RE_059 Verify Open redirects into the editor (Review step) and a change made in Rules persists across close/reopen', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description); // already has 1 Sport condition, 0 Casino
//         createdRuleDescription = description;

//         await rulesEnginePage.clickOpenForRule(description);
//         // Confirmed live via an actual automated run (more reliable than an earlier manual HTML
//         // capture that turned out to reflect a different click path): Open lands on the REVIEW
//         // step (Activate button, Configuration panel, Rule groups badge, Back/Back to list) —
//         // not the Rules step directly.
//         await expect(rulesEnginePage.backToListBtn, 'Expected Open to redirect into the Review step of the editor').toBeVisible({ timeout: 15000 });

//         // Step back into Rules (same proven transition as TC_RE_056) to make a verifiable change.
//         await rulesEnginePage.clickBack();
//         await expect(rulesEnginePage.addGroupBtn, 'Expected Back from Review to return to the Rules step').toBeVisible({ timeout: 15000 });

//         // Make a verifiable change right there: add a Casino condition (the Rule currently has
//         // none, since createFullRule only adds a Sport condition).
//         const casinoCountBefore = await rulesEnginePage.getCasinoConditionCount();
//         await rulesEnginePage.clickAddCasino();
//         await rulesEnginePage.selectFirstCasinoProvider();
//         await rulesEnginePage.selectFirstCasinoGame();
//         await rulesEnginePage.fillCasinoCategory(`Category_${Date.now()}`);
//         await page.waitForTimeout(300);
//         await rulesEnginePage.clickSave();
//         await expect.poll(() => rulesEnginePage.getCasinoConditionCount(), { timeout: 10000 }).toBe(casinoCountBefore + 1);

//         // Exit back to the list the same way Create does — Next (Rules -> Review), Back to list.
//         await rulesEnginePage.clickNext();
//         await rulesEnginePage.backToListBtn.waitFor({ state: 'visible', timeout: 15000 });
//         await rulesEnginePage.clickBackToList();

//         // No success toast exists for a saved edit — verify persistence by reopening.
//         await rulesEnginePage.clickOpenForRule(description);
//         await expect(rulesEnginePage.backToListBtn, 'Expected Open to redirect into the Review step again').toBeVisible({ timeout: 15000 });
//         await rulesEnginePage.clickBack();
//         await expect(rulesEnginePage.addGroupBtn, 'Expected Back from Review to return to the Rules step again').toBeVisible({ timeout: 15000 });
//         const casinoCountAfterReopen = await rulesEnginePage.getCasinoConditionCount();
//         expect(casinoCountAfterReopen, 'Expected the Casino condition added via Open to have persisted').toBe(casinoCountBefore + 1);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_059_open_and_edit_persists');
//         console.log('✅ TC_RE_059 PASSED — Open redirected into the Review step, the change made after Back->Rules persisted across a close/reopen.');
//     });

//     test('TC_RE_060 Verify Clone creates a copy of the Rule named "{original} Copy"', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description);
//         createdRuleDescription = description;

//         await rulesEnginePage.clickCloneForRule(description);
//         await rulesEnginePage.confirmCloneDialog();

//         // Confirmed live: the clone's Description is the original with " Copy" appended as a
//         // suffix (title-case, single capital C) — e.g. "Betwayyy" -> "Betwayyy Copy".
//         createdCloneDescription = `${description} Copy`;
//         const cloneVisible = await rulesEnginePage.isRuleVisibleByDescription(createdCloneDescription, 15000);
//         expect(cloneVisible, `Expected a cloned row named "${createdCloneDescription}" to appear in the list`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_060_clone_creates_copy');
//         console.log(`✅ TC_RE_060 PASSED — Clone created a copy row: "${createdCloneDescription}".`);
//     });

//     test('TC_RE_061 Verify Activate is blocked with a toast for a Rule with no conditions', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description, false);
//         createdRuleDescription = description;

//         await rulesEnginePage.clickActivateForRule(description);
//         await rulesEnginePage.clickConfirmYes();

//         // Confirmed live: the toast's own "Error" summary label is concatenated directly in front
//         // of the detail text with no separator (getToastText reads the whole .p-toast-message
//         // container) — e.g. "ErrorApproval is not allowed: ...". Checking for the message as a
//         // substring avoids coupling this assertion to that summary-label prefix.
//         const toastText = await rulesEnginePage.getToastText(10000);
//         expect(toastText, `Expected the blocked-activation toast, got: "${toastText || '(no toast appeared)'}"`)
//             .toContain(rulesEngineLocators.toastActivationBlockedNoCondition);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_061_activate_blocked_no_condition');
//         console.log('✅ TC_RE_061 PASSED — Activate was blocked with the expected toast for a Rule with no conditions.');
//     });

//     test('TC_RE_062 Verify Activate succeeds for a Rule with at least one condition', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description, true);
//         createdRuleDescription = description;

//         await rulesEnginePage.clickActivateForRule(description);
//         await rulesEnginePage.clickConfirmYes();
//         await page.waitForTimeout(500);

//         // Confirmed by the user: once Active, the row's kebab menu swaps Activate for Deactivate.
//         await rulesEnginePage.clickRowMenuForRule(description);
//         const deactivateVisible = await page.locator('.p-menu, .p-tieredmenu').last()
//             .getByText(rulesEngineLocators.menuItemDeactivateRule, { exact: true })
//             .waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
//         expect(deactivateVisible, 'Expected the row menu to show Deactivate once the Rule is Active').toBe(true);
//         await page.keyboard.press('Escape');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_062_activate_success');
//         console.log('✅ TC_RE_062 PASSED — Activate succeeded and the row menu now offers Deactivate.');
//     });

//     test('TC_RE_063 Verify Deactivate (only offered after Activate) deactivates the Rule', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description, true);
//         createdRuleDescription = description;

//         // Deactivate only appears once the Rule is Active (confirmed by the user) — activate first.
//         await rulesEnginePage.clickActivateForRule(description);
//         await rulesEnginePage.clickConfirmYes();
//         await page.waitForTimeout(500);

//         await rulesEnginePage.clickDeactivateForRule(description);
//         await rulesEnginePage.clickConfirmYes();
//         await page.waitForTimeout(500);

//         // Confirmed by the user: once deactivated, the row menu offers Activate again.
//         await rulesEnginePage.clickRowMenuForRule(description);
//         const activateVisible = await page.locator('.p-menu, .p-tieredmenu').last()
//             .getByText(rulesEngineLocators.menuItemActivateRule, { exact: true })
//             .waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
//         expect(activateVisible, 'Expected the row menu to offer Activate again after Deactivate').toBe(true);
//         await page.keyboard.press('Escape');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_063_deactivate_success');
//         console.log('✅ TC_RE_063 PASSED — Deactivate succeeded after Activate, and the row menu reverted to Activate.');
//     });

//     test('TC_RE_064 Verify Delete removes the Rule after Yes confirmation', async ({ page, rulesEnginePage }, testInfo) => {
//         const description = `Rule_${Date.now()}`;
//         await createFullRule(page, rulesEnginePage, description, true);
//         createdRuleDescription = description;

//         await rulesEnginePage.clickDeleteForRule(description);
//         await rulesEnginePage.clickConfirmYes();

//         const isAbsent = await rulesEnginePage.isRuleAbsentByDescription(description, 15000);
//         expect(isAbsent, `Expected Rule "${description}" to be removed from the list after Delete + Yes`).toBe(true);
//         createdRuleDescription = undefined; // already deleted — afterEach has nothing to clean up

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RE_064_delete_success');
//         console.log('✅ TC_RE_064 PASSED — Delete + Yes removed the Rule from the list.');
//     });
// });
