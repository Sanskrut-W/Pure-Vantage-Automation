// npx playwright test tests/autoOptin.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToAutoOptInConfig(page: any, sidebarPage: any, autoOptinPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToAutoOptInConfig();
    await autoOptinPage.createBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreatePopup(autoOptinPage: any) {
    await autoOptinPage.clickCreateAutoOptIn();
    await autoOptinPage.waitForPopupLoad();
}

// Fills every field that's mandatory regardless of Trigger/Action choice: Name, Region, Action,
// Start Date and End Date. Campaign is optional and left untouched. Auto Opt-In Trigger is
// selected separately by callers via selectTrigger() afterward.
async function fillCoreMandatoryFields(autoOptinPage: any, name: string, action: 'Trigger Workflow' | 'Trigger Comp Account') {
    await autoOptinPage.fillName(name);
    await autoOptinPage.selectFirstRegion();
    await autoOptinPage.selectAction(action);
    await autoOptinPage.setStartDate();
    await autoOptinPage.setEndDate();
}

async function fillSportWagerRequiredFields(autoOptinPage: any) {
    await autoOptinPage.fillMinRequiredAmount('10');
    await autoOptinPage.fillOdds('1.50');
    await autoOptinPage.fillNumberOfLegs('1');
}

async function fillCasinoRequiredFields(autoOptinPage: any) {
    await autoOptinPage.fillMaxRequiredAmount('10');
}

// Creates a real Auto Opt-In with a unique, automation-generated name — used afterward to
// search for/delete it (see the shared afterEach hooks below, which delete regardless of
// pass/fail so the database doesn't accumulate test data).
async function createAutoOptIn(
    page: any,
    autoOptinPage: any,
    name: string,
    trigger: 'Sport Wager' | 'Casino Wager' | 'Casino Settlement',
    action: 'Trigger Workflow' | 'Trigger Comp Account' = 'Trigger Workflow'
) {
    await openCreatePopup(autoOptinPage);
    await fillCoreMandatoryFields(autoOptinPage, name, action);
    if (action === 'Trigger Comp Account') {
        await autoOptinPage.fillCompValue('10');
    }
    await autoOptinPage.selectTrigger(trigger);
    if (trigger === 'Sport Wager') {
        await fillSportWagerRequiredFields(autoOptinPage);
    } else {
        await fillCasinoRequiredFields(autoOptinPage);
    }
    await page.waitForTimeout(300);

    await expect(autoOptinPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await autoOptinPage.clickSave();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the Auto Opt-In was created').toBeVisible({ timeout: 15000 });
    console.log('Create Auto Opt-In toast message:', await toastText.textContent());

    const dialogClosedOnItsOwn = await autoOptinPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await autoOptinPage.clickCancel().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});
}

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-1 — Page Level Tests
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Auto Opt-In Config - Page Level Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, autoOptinPage }) => {
//         await navigateToAutoOptInConfig(page, sidebarPage, autoOptinPage);
//     });

//     test('TC-1 Verify Auto Opt-In Config page is accessible', async ({ page, autoOptinPage }, testInfo) => {
//         await expect(autoOptinPage.createBtn, 'Expected Create Auto Opt-In button').toBeVisible();
//         await expect(autoOptinPage.searchInput, 'Expected search bar').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_auto_optin_page_accessible');
//         console.log('Auto Opt-In Config page is accessible with all key elements visible.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-2 to TC-3 — Search Tests
// //  TC-3 creates a real disposable entry to search for — deleted in this block's own afterEach
// //  regardless of pass/fail.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Auto Opt-In Config - Search Tests', () => {
//     let createdName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, autoOptinPage }) => {
//         await navigateToAutoOptInConfig(page, sidebarPage, autoOptinPage);
//         createdName = undefined;
//     });

//     test.afterEach(async ({ autoOptinPage }) => {
//         if (!createdName) return;
//         const nameToDelete = createdName;
//         createdName = undefined;
//         await autoOptinPage.deleteAutoOptInIfPresent(nameToDelete);
//     });

//     test('TC-2 Verify search bar shows no results for a non-matching term', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.searchAutoOptIn('ZZZZZ_NO_MATCH_99999');

//         const rowCount = await autoOptinPage.getRowCount();
//         expect(rowCount, 'Expected no rows to match a nonsense search term').toBe(0);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_search_no_results');
//         console.log('Search bar correctly shows zero rows for a non-matching term.');
//     });

//     test('TC-3 Verify search bar filters the table down to a matching Auto Opt-In name', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await createAutoOptIn(page, autoOptinPage, name, 'Sport Wager');
//         createdName = name;

//         const isVisible = await autoOptinPage.isAutoOptInVisibleByName(name);
//         expect(isVisible, `Expected search for "${name}" to return the created row`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_search_filters_by_name');
//         console.log(`✅ TC-3 PASSED — Search bar correctly filtered the table down to "${name}".`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-4 to TC-24 — Create Popup Tests
// //  None of these tests persist an Auto Opt-In — each ends by closing the popup (Cancel), so no
// //  cleanup is needed in this describe block.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Auto Opt-In Config - Create Popup Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, autoOptinPage }) => {
//         await navigateToAutoOptInConfig(page, sidebarPage, autoOptinPage);
//         await openCreatePopup(autoOptinPage);
//     });

//     test('TC-4 Verify clicking Create Auto Opt-In opens the popup with all 7 core fields and 5 toggles', async ({ page, autoOptinPage }, testInfo) => {
//         await expect(autoOptinPage.popupDialog, 'Expected the popup to open').toBeVisible({ timeout: 15000 });

//         await expect(autoOptinPage.nameInput, 'Expected Auto Opt-In Name field').toBeVisible();
//         await expect(autoOptinPage.regionDropdown, 'Expected Region field').toBeVisible();
//         await expect(autoOptinPage.actionDropdown, 'Expected Auto Opt-In Action field').toBeVisible();
//         await expect(autoOptinPage.campaignDropdown, 'Expected Campaign field').toBeVisible();
//         await expect(autoOptinPage.startDateInput, 'Expected Start Date field').toBeVisible();
//         await expect(autoOptinPage.endDateInput, 'Expected End Date field').toBeVisible();
//         await expect(autoOptinPage.triggerDropdown, 'Expected Auto Opt-In Trigger field').toBeVisible();

//         await expect(autoOptinPage.enableDailyDeletionToggle, 'Expected Enable Automatic Daily Deletion toggle').toBeVisible();
//         await expect(autoOptinPage.enableTestingModeToggle, 'Expected Enable Testing Mode toggle').toBeVisible();
//         await expect(autoOptinPage.applyToAllBetsToggle, 'Expected "apply to all bets" toggle').toBeVisible();
//         await expect(autoOptinPage.requiresSingleBetToggle, 'Expected "requires a Single Bet" toggle').toBeVisible();
//         await expect(autoOptinPage.isActiveToggle, 'Expected Is Active toggle').toBeVisible();

//         await expect(autoOptinPage.saveBtn, 'Expected Save button').toBeVisible();
//         await expect(autoOptinPage.cancelBtn, 'Expected Cancel button').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_all_fields_present');
//         console.log('All 7 core fields and 5 toggles verified in the Create Auto Opt-In popup.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-5 Verify Save is disabled when all mandatory fields are empty', async ({ page, autoOptinPage }, testInfo) => {
//         await expect(autoOptinPage.saveBtn, 'Expected Save to be disabled with no fields filled').toBeDisabled({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_save_disabled_empty_fields');
//         console.log('Save button correctly stays disabled when all mandatory fields are empty.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-6 Verify toggle default states — Enable Testing Mode and Is Active default ON, the other three default OFF', async ({ page, autoOptinPage }, testInfo) => {
//         expect(await autoOptinPage.isEnableDailyDeletionOn(), 'Expected Enable Automatic Daily Deletion to default OFF').toBe(false);
//         expect(await autoOptinPage.isEnableTestingModeOn(), 'Expected Enable Testing Mode to default ON').toBe(true);
//         expect(await autoOptinPage.isApplyToAllBetsOn(), 'Expected "apply to all bets" to default OFF').toBe(false);
//         expect(await autoOptinPage.isRequiresSingleBetOn(), 'Expected "requires a Single Bet" to default OFF').toBe(false);
//         expect(await autoOptinPage.isActiveOn(), 'Expected Is Active to default ON').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_toggle_defaults');
//         console.log('Toggle default states verified: Testing Mode ON, Is Active ON, the rest OFF.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-7 Verify each toggle can be switched on/off', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.toggleEnableDailyDeletion();
//         await page.waitForTimeout(200);
//         expect(await autoOptinPage.isEnableDailyDeletionOn(), 'Expected Enable Automatic Daily Deletion to turn ON after toggling').toBe(true);

//         await autoOptinPage.toggleEnableTestingMode();
//         await page.waitForTimeout(200);
//         expect(await autoOptinPage.isEnableTestingModeOn(), 'Expected Enable Testing Mode to turn OFF after toggling').toBe(false);

//         await autoOptinPage.toggleApplyToAllBets();
//         await page.waitForTimeout(200);
//         expect(await autoOptinPage.isApplyToAllBetsOn(), 'Expected "apply to all bets" to turn ON after toggling').toBe(true);

//         await autoOptinPage.toggleRequiresSingleBet();
//         await page.waitForTimeout(200);
//         expect(await autoOptinPage.isRequiresSingleBetOn(), 'Expected "requires a Single Bet" to turn ON after toggling').toBe(true);

//         await autoOptinPage.toggleIsActive();
//         await page.waitForTimeout(200);
//         expect(await autoOptinPage.isActiveOn(), 'Expected Is Active to turn OFF after toggling').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_toggles_switchable');
//         console.log('All 5 toggles switch on/off correctly.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-8 Verify selecting "Trigger Comp Account" action reveals the Comp Code and Comp Value fields', async ({ page, autoOptinPage }, testInfo) => {
//         expect(await autoOptinPage.isFieldVisibleByLabel('Comp Value'), 'Expected Comp Value to be hidden before selecting Trigger Comp Account').toBe(false);

//         await autoOptinPage.selectAction('Trigger Comp Account');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.compCodeInput, 'Expected Comp Code field to appear').toBeVisible();
//         await expect(autoOptinPage.compValueInput, 'Expected Comp Value field to appear').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_trigger_comp_account_fields');
//         console.log('Comp Code and Comp Value fields appear after selecting Trigger Comp Account.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-9 Verify Start Date calendar opens, a date can be selected, and clicking End Date closes it', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.setStartDate();

//         const startValue = (await autoOptinPage.startDateInput.inputValue()).trim();
//         expect(startValue.length, 'Expected Start Date to have a non-empty value after selecting a day').toBeGreaterThan(0);

//         // Scoped to the Start Date panel's own id specifically — clicking End Date naturally opens
//         // End Date's own calendar next (expected), which also matches the generic `.p-datepicker`
//         // class, so a broad selector here would false-fail on that legitimately-open panel.
//         const startPanel = page.locator('#promotionStartDate_panel');
//         await expect(startPanel, 'Expected the Start Date calendar overlay to be closed after clicking End Date').not.toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_start_date_selected');
//         console.log('Start Date selected:', startValue);

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-10 Verify End Date calendar opens, a date can be selected, and clicking Auto Opt-In Trigger closes it', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.setStartDate();
//         await autoOptinPage.setEndDate();

//         const endValue = (await autoOptinPage.endDateInput.inputValue()).trim();
//         expect(endValue.length, 'Expected End Date to have a non-empty value after selecting a day').toBeGreaterThan(0);

//         const endPanel = page.locator('#promotionEndDate_panel, .p-datepicker-panel, .p-datepicker').last();
//         await expect(endPanel, 'Expected the End Date calendar overlay to be closed after clicking Auto Opt-In Trigger').not.toBeVisible({ timeout: 5000 });

//         const strayDropdownPanel = page.locator('.p-dropdown-panel').last();
//         await expect(strayDropdownPanel, 'Expected the Auto Opt-In Trigger dropdown panel to not be left dangling open').not.toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_end_date_selected');
//         console.log('End Date selected:', endValue);

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-11 Verify selecting Sport Wager trigger reveals all 9 Sport Wager fields', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.minRequiredAmountInput, 'Expected Minimum Required Amount field').toBeVisible();
//         await expect(autoOptinPage.oddsInput, 'Expected Odds field').toBeVisible();
//         await expect(autoOptinPage.numberOfLegsInput, 'Expected Number Of Legs field').toBeVisible();
//         await expect(autoOptinPage.feedDropdown, 'Expected Feed Name field').toBeVisible();
//         await expect(autoOptinPage.sportDropdown, 'Expected Sport field').toBeVisible();
//         await expect(autoOptinPage.leagueDropdown, 'Expected League field').toBeVisible();
//         await expect(autoOptinPage.eventDropdown, 'Expected Event field').toBeVisible();
//         await expect(autoOptinPage.marketDropdown, 'Expected Market field').toBeVisible();
//         await expect(autoOptinPage.marketOutcomeDropdown, 'Expected Market Outcome field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_sport_wager_fields');
//         console.log('All 9 Sport Wager fields appear after selecting the Sport Wager trigger.');

//         await autoOptinPage.clickCancel();
//     });

//     // Confirmed live (via captured DOM snapshots): Feed+Sport only enables League — Event stays
//     // disabled until League is ALSO selected. The chain is linear (Feed+Sport -> League ->
//     // League selected -> Event), not "Feed+Sport enables both League and Event together" as the
//     // original feature description stated.
//     test('TC-12 Verify League becomes enabled once Feed and Sport are selected, and Event requires League too', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.isLeagueEnabled(), 'Expected League to be disabled before Feed/Sport are selected').toBe(false);
//         expect(await autoOptinPage.isEventEnabled(), 'Expected Event to be disabled before Feed/Sport are selected').toBe(false);

//         await autoOptinPage.selectFirstFeed();
//         await page.waitForTimeout(300);
//         expect(await autoOptinPage.isLeagueEnabled(), 'Expected League to still be disabled with only Feed selected').toBe(false);
//         expect(await autoOptinPage.isEventEnabled(), 'Expected Event to still be disabled with only Feed selected').toBe(false);

//         await autoOptinPage.selectFirstSport();
//         await page.waitForTimeout(300);
//         expect(await autoOptinPage.isLeagueEnabled(), 'Expected League to become enabled once both Feed and Sport are selected').toBe(true);
//         expect(await autoOptinPage.isEventEnabled(), 'Expected Event to still be disabled until League is also selected').toBe(false);

//         await autoOptinPage.selectFirstLeague();
//         await page.waitForTimeout(300);
//         expect(await autoOptinPage.isEventEnabled(), 'Expected Event to become enabled once League is selected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_league_event_enabled_by_feed_and_sport');
//         console.log('League becomes enabled once Feed and Sport are selected; Event becomes enabled once League is also selected.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-13 Verify selecting Event enables Market, and selecting Market enables Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.isMarketEnabled(), 'Expected Market to be disabled before Event is selected').toBe(false);

//         await autoOptinPage.selectFirstEvent();
//         await page.waitForTimeout(300);
//         expect(await autoOptinPage.isMarketEnabled(), 'Expected Market to become enabled once Event is selected').toBe(true);
//         expect(await autoOptinPage.isMarketOutcomeEnabled(), 'Expected Market Outcome to still be disabled before Market is selected').toBe(false);

//         await autoOptinPage.selectFirstMarket();
//         await page.waitForTimeout(300);
//         expect(await autoOptinPage.isMarketOutcomeEnabled(), 'Expected Market Outcome to become enabled once Market is selected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_market_marketoutcome_enablement');
//         console.log('Market enables after Event is selected; Market Outcome enables after Market is selected.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-14 Verify clearing League also clears Event, Market and Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await autoOptinPage.selectFirstEvent();
//         await autoOptinPage.selectFirstMarket();
//         await autoOptinPage.selectFirstMarketOutcome();
//         await page.waitForTimeout(300);

//         expect((await autoOptinPage.getMarketOutcomeValue()).length, 'Expected Market Outcome to have a value before clearing League').toBeGreaterThan(0);

//         await autoOptinPage.clearLeague();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getEventValue(), 'Expected Event to be cleared after clearing League').toBe('');
//         expect(await autoOptinPage.getMarketValue(), 'Expected Market to be cleared after clearing League').toBe('');
//         expect(await autoOptinPage.getMarketOutcomeValue(), 'Expected Market Outcome to be cleared after clearing League').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_clear_league_cascades');
//         console.log('Clearing League correctly cascades to clear Event, Market and Market Outcome.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-15 Verify clearing Event also clears Market and Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await autoOptinPage.selectFirstEvent();
//         await autoOptinPage.selectFirstMarket();
//         await autoOptinPage.selectFirstMarketOutcome();
//         await page.waitForTimeout(300);

//         await autoOptinPage.clearEvent();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getMarketValue(), 'Expected Market to be cleared after clearing Event').toBe('');
//         expect(await autoOptinPage.getMarketOutcomeValue(), 'Expected Market Outcome to be cleared after clearing Event').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_clear_event_cascades');
//         console.log('Clearing Event correctly cascades to clear Market and Market Outcome.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-16 Verify clearing Market also clears Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await autoOptinPage.selectFirstEvent();
//         await autoOptinPage.selectFirstMarket();
//         await autoOptinPage.selectFirstMarketOutcome();
//         await page.waitForTimeout(300);

//         await autoOptinPage.clearMarket();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getMarketOutcomeValue(), 'Expected Market Outcome to be cleared after clearing Market').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_clear_market_cascades');
//         console.log('Clearing Market correctly cascades to clear Market Outcome.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-17 Verify clearing Sport also clears League, Event, Market and Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await autoOptinPage.selectFirstEvent();
//         await autoOptinPage.selectFirstMarket();
//         await autoOptinPage.selectFirstMarketOutcome();
//         await page.waitForTimeout(300);

//         await autoOptinPage.clearSport();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getLeagueValue(), 'Expected League to be cleared after clearing Sport').toBe('');
//         expect(await autoOptinPage.getEventValue(), 'Expected Event to be cleared after clearing Sport').toBe('');
//         expect(await autoOptinPage.getMarketValue(), 'Expected Market to be cleared after clearing Sport').toBe('');
//         expect(await autoOptinPage.getMarketOutcomeValue(), 'Expected Market Outcome to be cleared after clearing Sport').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_clear_sport_cascades');
//         console.log('Clearing Sport correctly cascades to clear League, Event, Market and Market Outcome.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-18 Verify clearing Feed also clears League, Event, Market and Market Outcome', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await autoOptinPage.selectFirstFeed();
//         await autoOptinPage.selectFirstSport();
//         await autoOptinPage.selectFirstLeague();
//         await autoOptinPage.selectFirstEvent();
//         await autoOptinPage.selectFirstMarket();
//         await autoOptinPage.selectFirstMarketOutcome();
//         await page.waitForTimeout(300);

//         await autoOptinPage.clearFeed();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getLeagueValue(), 'Expected League to be cleared after clearing Feed').toBe('');
//         expect(await autoOptinPage.getEventValue(), 'Expected Event to be cleared after clearing Feed').toBe('');
//         expect(await autoOptinPage.getMarketValue(), 'Expected Market to be cleared after clearing Feed').toBe('');
//         expect(await autoOptinPage.getMarketOutcomeValue(), 'Expected Market Outcome to be cleared after clearing Feed').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_clear_feed_cascades');
//         console.log('Clearing Feed correctly cascades to clear League, Event, Market and Market Outcome.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-19 Verify selecting Casino Wager trigger reveals Minimum Required Amount, Provider Name and Game Name fields', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Casino Wager');
//         await page.waitForTimeout(300);

//         // Confirmed live: Casino Wager reuses Sport Wager's exact "Minimum Required Amount *"
//         // field (same #minRequiredAmount id) rather than a separate "Maximum" field.
//         await expect(autoOptinPage.minRequiredAmountInput, 'Expected Minimum Required Amount field').toBeVisible();
//         await expect(autoOptinPage.providerNameDropdown, 'Expected Provider Name field').toBeVisible();
//         await expect(autoOptinPage.gameNameDropdown, 'Expected Game Name field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_casino_wager_fields');
//         console.log('Minimum Required Amount, Provider Name and Game Name fields appear for Casino Wager.');

//         await autoOptinPage.clickCancel();
//     });

//     // Confirmed live: Provider Name itself is disabled immediately after selecting Casino Wager
//     // (contrary to the original spec, which only described Game Name as depending on Provider
//     // Name). Filling Minimum Required Amount does NOT enable it (confirmed live — still disabled
//     // with the amount filled), so casino providers are presumably region-scoped: Region is filled
//     // here as the field most likely to actually gate Provider Name.
//     test('TC-20 Verify Game Name stays disabled until Provider Name is selected, for Casino Wager', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Casino Wager');
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.isGameNameEnabled(), 'Expected Game Name to be disabled before Provider Name is selected').toBe(false);

//         await autoOptinPage.fillMinRequiredAmount('10');
//         await autoOptinPage.selectFirstRegion();
//         await page.waitForTimeout(300);

//         await autoOptinPage.selectFirstProviderName();
//         // Confirmed live: Game Name's data-p-disabled attribute flips a beat after Provider Name
//         // registers — a fixed 300ms wait caught it mid-flip (still read false at check time, even
//         // though the page snapshot moments later showed it enabled), so poll instead of a static wait.
//         await expect.poll(() => autoOptinPage.isGameNameEnabled(), {
//             message: 'Expected Game Name to become enabled once Provider Name is selected',
//             timeout: 10000,
//         }).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_casino_wager_game_name_enablement');
//         console.log('Game Name becomes enabled only once Provider Name is selected (Casino Wager).');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-21 Verify clearing Provider Name also clears Game Name, for Casino Wager', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Casino Wager');
//         await autoOptinPage.fillMinRequiredAmount('10');
//         await autoOptinPage.selectFirstRegion();
//         await autoOptinPage.selectFirstProviderName();
//         await autoOptinPage.selectFirstGameName();
//         await page.waitForTimeout(300);

//         expect((await autoOptinPage.getGameNameValue()).length, 'Expected Game Name to have a value before clearing Provider Name').toBeGreaterThan(0);

//         await autoOptinPage.clearProviderName();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getGameNameValue(), 'Expected Game Name to be cleared after clearing Provider Name').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_clear_provider_cascades_casino_wager');
//         console.log('Clearing Provider Name correctly cascades to clear Game Name (Casino Wager).');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-22 Verify selecting Casino Settlement trigger reveals Minimum Required Amount, Provider Name and Game Name fields', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Casino Settlement');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.minRequiredAmountInput, 'Expected Minimum Required Amount field').toBeVisible();
//         await expect(autoOptinPage.providerNameDropdown, 'Expected Provider Name field').toBeVisible();
//         await expect(autoOptinPage.gameNameDropdown, 'Expected Game Name field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_casino_settlement_fields');
//         console.log('Minimum Required Amount, Provider Name and Game Name fields appear for Casino Settlement.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-23 Verify clearing Provider Name also clears Game Name, for Casino Settlement', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.selectTrigger('Casino Settlement');
//         await autoOptinPage.fillMinRequiredAmount('10');
//         await autoOptinPage.selectFirstRegion();
//         await autoOptinPage.selectFirstProviderName();
//         await autoOptinPage.selectFirstGameName();
//         await page.waitForTimeout(300);

//         await autoOptinPage.clearProviderName();
//         await page.waitForTimeout(300);

//         expect(await autoOptinPage.getGameNameValue(), 'Expected Game Name to be cleared after clearing Provider Name').toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_clear_provider_cascades_casino_settlement');
//         console.log('Clearing Provider Name correctly cascades to clear Game Name (Casino Settlement).');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-24 Verify Cancel closes the popup without creating an Auto Opt-In', async ({ page, autoOptinPage }, testInfo) => {
//         await autoOptinPage.fillName(`AutoOptIn_${Date.now()}`);
//         await autoOptinPage.selectFirstRegion();
//         await page.waitForTimeout(300);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_before_cancel');

//         await autoOptinPage.clickCancel();

//         await expect(autoOptinPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_after_cancel');
//         console.log('Cancel closes the Create Auto Opt-In popup without saving.');
//     });

//     test('TC-29 Verify Save stays disabled until Sport Wager\'s mandatory fields (Minimum Required Amount, Odds, Number Of Legs) are all filled', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await fillCoreMandatoryFields(autoOptinPage, name, 'Trigger Workflow');
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with none of the Sport Wager mandatory fields filled').toBeDisabled();

//         await autoOptinPage.fillMinRequiredAmount('10');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with only Minimum Required Amount filled').toBeDisabled();

//         await autoOptinPage.fillOdds('1.50');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with Number Of Legs still empty').toBeDisabled();

//         await autoOptinPage.fillNumberOfLegs('1');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to become enabled once all Sport Wager mandatory fields are filled').toBeEnabled({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_sport_wager_mandatory_fields');
//         console.log('Save stays disabled until Minimum Required Amount, Odds and Number Of Legs are all filled for Sport Wager.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-32 Verify Save stays disabled until Casino Wager\'s mandatory field (Minimum Required Amount) is filled', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await fillCoreMandatoryFields(autoOptinPage, name, 'Trigger Workflow');
//         await autoOptinPage.selectTrigger('Casino Wager');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with Minimum Required Amount empty').toBeDisabled();

//         await autoOptinPage.fillMinRequiredAmount('10');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to become enabled once Minimum Required Amount is filled').toBeEnabled({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_casino_wager_mandatory_fields');
//         console.log('Save stays disabled until Minimum Required Amount is filled for Casino Wager.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-33 Verify Save stays disabled until Casino Settlement\'s mandatory field (Minimum Required Amount) is filled', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await fillCoreMandatoryFields(autoOptinPage, name, 'Trigger Workflow');
//         await autoOptinPage.selectTrigger('Casino Settlement');
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with Minimum Required Amount empty').toBeDisabled();

//         await autoOptinPage.fillMinRequiredAmount('10');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to become enabled once Minimum Required Amount is filled').toBeEnabled({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_casino_settlement_mandatory_fields');
//         console.log('Save stays disabled until Minimum Required Amount is filled for Casino Settlement.');

//         await autoOptinPage.clickCancel();
//     });

//     test('TC-34 Verify Save stays disabled until Trigger Comp Account\'s mandatory field (Comp Value) is filled', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await fillCoreMandatoryFields(autoOptinPage, name, 'Trigger Comp Account');
//         await autoOptinPage.selectTrigger('Sport Wager');
//         await fillSportWagerRequiredFields(autoOptinPage);
//         await page.waitForTimeout(300);

//         await expect(autoOptinPage.saveBtn, 'Expected Save to stay disabled with Comp Value empty').toBeDisabled();

//         await autoOptinPage.fillCompValue('10');
//         await page.waitForTimeout(200);
//         await expect(autoOptinPage.saveBtn, 'Expected Save to become enabled once Comp Value is filled').toBeEnabled({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_trigger_comp_account_mandatory_fields');
//         console.log('Save stays disabled until Comp Value is filled for Trigger Comp Account.');

//         await autoOptinPage.clickCancel();
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-25 to TC-28 — Create and Verify Tests
// //  Each test creates a real Auto Opt-In, verifies the success toast and that it appears via the
// //  search bar, then the shared afterEach deletes it — regardless of pass/fail — so the database
// //  doesn't accumulate test data.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Auto Opt-In Config - Create and Verify Tests', () => {
//     let createdName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, autoOptinPage }) => {
//         await navigateToAutoOptInConfig(page, sidebarPage, autoOptinPage);
//         createdName = undefined;
//     });

//     test.afterEach(async ({ autoOptinPage }) => {
//         if (!createdName) return;
//         const nameToDelete = createdName;
//         createdName = undefined;
//         await autoOptinPage.deleteAutoOptInIfPresent(nameToDelete);
//     });

//     test('TC-25 Verify Save successfully creates an Auto Opt-In with Sport Wager trigger', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await createAutoOptIn(page, autoOptinPage, name, 'Sport Wager');
//         createdName = name;

//         const isVisible = await autoOptinPage.isAutoOptInVisibleByName(name);
//         expect(isVisible, `Expected an Auto Opt-In row for "${name}" to appear via search after creation`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_sport_wager_created');
//         console.log(`✅ TC-25 PASSED — Auto Opt-In created for "${name}" (Sport Wager) and verified via search.`);
//     });

//     test('TC-26 Verify Save successfully creates an Auto Opt-In with Casino Wager trigger', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await createAutoOptIn(page, autoOptinPage, name, 'Casino Wager');
//         createdName = name;

//         const isVisible = await autoOptinPage.isAutoOptInVisibleByName(name);
//         expect(isVisible, `Expected an Auto Opt-In row for "${name}" to appear via search after creation`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_casino_wager_created');
//         console.log(`✅ TC-26 PASSED — Auto Opt-In created for "${name}" (Casino Wager) and verified via search.`);
//     });

//     test('TC-27 Verify Save successfully creates an Auto Opt-In with Casino Settlement trigger', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await createAutoOptIn(page, autoOptinPage, name, 'Casino Settlement');
//         createdName = name;

//         const isVisible = await autoOptinPage.isAutoOptInVisibleByName(name);
//         expect(isVisible, `Expected an Auto Opt-In row for "${name}" to appear via search after creation`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_casino_settlement_created');
//         console.log(`✅ TC-27 PASSED — Auto Opt-In created for "${name}" (Casino Settlement) and verified via search.`);
//     });

//     test('TC-28 Verify Save successfully creates an Auto Opt-In with Trigger Comp Account action', async ({ page, autoOptinPage }, testInfo) => {
//         const name = `AutoOptIn_${Date.now()}`;
//         await createAutoOptIn(page, autoOptinPage, name, 'Sport Wager', 'Trigger Comp Account');
//         createdName = name;

//         const isVisible = await autoOptinPage.isAutoOptInVisibleByName(name);
//         expect(isVisible, `Expected an Auto Opt-In row for "${name}" to appear via search after creation`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_trigger_comp_account_created');
//         console.log(`✅ TC-28 PASSED — Auto Opt-In created for "${name}" with Trigger Comp Account action and verified via search.`);
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-35 to TC-36 — Edit Tests
//  Each test creates a real Auto Opt-In, edits it, and verifies the change — then the shared
//  afterEach deletes it (by whichever name is current — renamed or original) regardless of
//  pass/fail, so the database doesn't accumulate test data.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Auto Opt-In Config - Edit Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, autoOptinPage }) => {
        await navigateToAutoOptInConfig(page, sidebarPage, autoOptinPage);
        createdName = undefined;
    });

    test.afterEach(async ({ autoOptinPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        await autoOptinPage.deleteAutoOptInIfPresent(nameToDelete);
    });

    test('TC-35 Verify editing an Auto Opt-In\'s Name persists the change', async ({ page, autoOptinPage }, testInfo) => {
        const originalName = `AutoOptIn_${Date.now()}`;
        await createAutoOptIn(page, autoOptinPage, originalName, 'Sport Wager');
        createdName = originalName;

        await autoOptinPage.clickEditForAutoOptIn(originalName);
        await autoOptinPage.waitForPopupLoad();

        const updatedName = `${originalName}_Edited`;
        await autoOptinPage.fillName(updatedName);
        await page.waitForTimeout(300);

        await expect(autoOptinPage.saveBtn, 'Expected Save to be enabled after editing the Name').toBeEnabled({ timeout: 10000 });
        await autoOptinPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Auto Opt-In was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Auto Opt-In toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await autoOptinPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await autoOptinPage.clickCancel().catch(() => {});
        }

        // From here on, the record only exists under its NEW name — clean up that one instead.
        createdName = updatedName;

        const isVisibleWithNewName = await autoOptinPage.isAutoOptInVisibleByName(updatedName);
        expect(isVisibleWithNewName, `Expected an Auto Opt-In row for the updated name "${updatedName}" to appear via search`).toBe(true);

        // Not verified: "searching the original name returns nothing" — the search bar matches by
        // substring (confirmed elsewhere in this suite), and updatedName is originalName + suffix,
        // so a search for originalName legitimately still surfaces the renamed row. That's correct
        // search behavior, not a failed rename, so it isn't a valid thing to assert here.

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_edit_updates_name');
        console.log(`✅ TC-35 PASSED — Auto Opt-In renamed from "${originalName}" to "${updatedName}" and verified via search.`);
    });

    // test('TC-36 Verify editing an Auto Opt-In\'s Is Active toggle updates the list\'s Active column', async ({ page, autoOptinPage }, testInfo) => {
    //     const name = `AutoOptIn_${Date.now()}`;
    //     await createAutoOptIn(page, autoOptinPage, name, 'Sport Wager');
    //     createdName = name;

    //     const wasActiveBeforeEdit = await autoOptinPage.isRowActiveByName(name);
    //     expect(wasActiveBeforeEdit, 'Expected the newly created Auto Opt-In to default to Active').toBe(true);

    //     await autoOptinPage.clickEditForAutoOptIn(name);
    //     await autoOptinPage.waitForPopupLoad();

    //     await autoOptinPage.toggleIsActive();
    //     await page.waitForTimeout(300);
    //     expect(await autoOptinPage.isActiveOn(), 'Expected the Is Active toggle to be off after toggling it').toBe(false);

    //     await expect(autoOptinPage.saveBtn, 'Expected Save to be enabled after toggling Is Active').toBeEnabled({ timeout: 10000 });
    //     await autoOptinPage.clickSave();

    //     const toastText = page.locator('.p-toast-message-text').first();
    //     await expect(toastText, 'Expected a toast confirming the Auto Opt-In was updated').toBeVisible({ timeout: 15000 });
    //     console.log('Edit Auto Opt-In toast message:', await toastText.textContent());

    //     const dialogClosedOnItsOwn = await autoOptinPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    //     if (!dialogClosedOnItsOwn) {
    //         await autoOptinPage.clickCancel().catch(() => {});
    //     }

    //     const isActiveAfterEdit = await autoOptinPage.isRowActiveByName(name);
    //     expect(isActiveAfterEdit, 'Expected the list\'s Active column to reflect Is Active turned off').toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_edit_toggles_is_active');
    //     console.log(`✅ TC-36 PASSED — Auto Opt-In "${name}" Is Active toggled off via Edit and verified in the list.`);
    // });
});
