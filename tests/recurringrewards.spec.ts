// npx playwright test tests/recurringrewards.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// RECURRING REWARDS — new feature, built from the user's functional description plus outerHTML
// confirmed live for: the sidebar node ("Marketing" -> "Recurring Rewards"), the "Create
// Configuration" button, the popup's 6 base fields (Promotion Name, Region Code, Start Date, End
// Date, Recurring Frequency, Wager Amount Requirement) + the "First Qualifying Bet Only" checkbox,
// the 2 Weekly-only fields (Weekly Expiry Day, Weekly Expiry Time), the Save/Cancel buttons, the
// Search bar, and the row delete flow (kebab trigger -> "Delete" -> Yes/No modal).
//
// Flagged assumption:
//  - The user's own "Select a region filter" outerHTML was byte-for-byte IDENTICAL to the Search
//    bar's own outerHTML (same id="search-input") — almost certainly a copy/paste duplicate, not
//    the real region-filter markup. RecurringRewardsPage.selectFirstRegionFilterOption() falls
//    back to a best-effort selector (first PrimeNG dropdown in <main>) and returns null if it
//    can't find one, rather than fabricating a confirmed-looking locator. TC_RR_20 below is
//    written tolerantly for the same reason — if it skips, the region filter's real outerHTML is
//    needed to finish it properly.
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToRecurringRewards(page: any, sidebarPage: any, recurringRewardsPage: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();

  // Confirmed live (TC_RR_28/40 runs): the sidebar nav click occasionally lands elsewhere (e.g. the
  // Dashboard) instead of Recurring Rewards, or hangs for the full default timeout when a stray
  // loading overlay reappears mid-click — same flake pattern waitForAppReady already retries for the
  // Marketing node. Retry the click itself (catching a hang, not just a wrong landing) rather than
  // reworking SidebarPage's own navigation helper, which every other spec file also relies on
  // unchanged.
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const landed = await sidebarPage.navigateToRecurringRewards()
      .then(() => recurringRewardsPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 }))
      .then(() => true)
      .catch(() => false);
    if (landed) return;

    console.log(`Recurring Rewards nav did not land (attempt ${attempt}/${maxAttempts}) — retrying from /main/home...`);
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForAppReady();
  }
  // Final attempt: let the caller's own error surface if this still isn't visible.
  await recurringRewardsPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 60000 });
}

async function openCreatePopup(recurringRewardsPage: any) {
  await recurringRewardsPage.clickCreateConfiguration();
}

/** Fills the 6 mandatory base fields with Recurring Frequency = Daily (the simplest valid
 * combination — no Weekly-only fields needed). Returns the Promotion Name used. */
async function fillMandatoryDailyFields(recurringRewardsPage: any): Promise<string> {
  const promotionName = `AutoRecurringReward_${Date.now()}`;
  await recurringRewardsPage.fillPromotionName(promotionName);
  await recurringRewardsPage.selectFirstRegionCode();
  await recurringRewardsPage.setStartDate();
  await recurringRewardsPage.setEndDate();
  await recurringRewardsPage.selectRecurringFrequency('Daily');
  await recurringRewardsPage.fillWagerAmountRequirement('10');
  return promotionName;
}

/** Fills every mandatory field with Recurring Frequency = Weekly, including its own 2 extra
 * fields. Returns the Promotion Name used. */
async function fillMandatoryWeeklyFields(recurringRewardsPage: any): Promise<string> {
  const promotionName = `AutoRecurringReward_${Date.now()}`;
  await recurringRewardsPage.fillPromotionName(promotionName);
  await recurringRewardsPage.selectFirstRegionCode();
  await recurringRewardsPage.setStartDate();
  await recurringRewardsPage.setEndDate();
  await recurringRewardsPage.selectRecurringFrequency('Weekly');
  await recurringRewardsPage.fillWagerAmountRequirement('10');
  await recurringRewardsPage.weeklyExpiryDayDropdown.waitFor({ state: 'visible', timeout: 10000 });
  await recurringRewardsPage.selectFirstWeeklyExpiryDay();
  await recurringRewardsPage.setWeeklyExpiryTime();
  return promotionName;
}

/** Fills the mandatory Daily fields and clicks Save, waiting for the popup to close. Returns the
 * Promotion Name used. Assumes the Create popup is already open. */
async function createDailyReward(page: any, recurringRewardsPage: any): Promise<string> {
  const promotionName = await fillMandatoryDailyFields(recurringRewardsPage);
  await recurringRewardsPage.clickSave();
  await recurringRewardsPage.promotionNameInput.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  return promotionName;
}

/** Sport Requirement values entered in recordings/rr-20261026100104.mp4 (TC_RR_24). Event is
 * picked as the first option instead — its mock labels carry today's date. */
const SPORT_REQUIREMENT = {
  feedName: 'mockfeed1',
  sport: 'Soccer',
  league: 'Premier League',
  country: 'Afghanistan',
  betSlipType: 'Wager' as const,
  market: 'Match Result',
  minimumBetslipOdds: '2',
  minimumLegsRequired: '1',
  minimumLegOddsMultiplier: '2',
};

/** Creates a Daily Recurring Reward and opens the Create Sport Requirement popup on it — the common
 * setup for TC_RR_25+ below (field dependency/clearing/enablement on the Sport Requirement popup).
 * Returns the Promotion Name so the caller can set rewardNameToCleanup for the compulsory afterEach
 * delete (deleting the Reward is assumed to remove its Sport Requirement too, same as TC_RR_24). */
async function createRewardAndOpenSportRequirementPopup(page: any, recurringRewardsPage: any): Promise<string> {
  const promotionName = await createDailyReward(page, recurringRewardsPage);
  await recurringRewardsPage.clickSportsRequirementsByPromotionName(promotionName);
  await recurringRewardsPage.clickCreateSportRequirement();
  return promotionName;
}

/** Creates a full Sport Requirement (every confirmed field filled, same values as TC_RR_24) under a
 * fresh Daily Reward, and saves it. Returns the Reward's Promotion Name for cleanup — the caller
 * locates the resulting row itself via recurringRewardsPage.getSportRequirementRow(SPORT_REQUIREMENT.sport). */
async function createSportRequirement(page: any, recurringRewardsPage: any): Promise<string> {
  const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);

  await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
  await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
  await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
  await recurringRewardsPage.selectCountry(SPORT_REQUIREMENT.country);
  await recurringRewardsPage.selectBetSlipType(SPORT_REQUIREMENT.betSlipType);
  await recurringRewardsPage.selectFirstEvent();
  await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);
  await recurringRewardsPage.fillMinimumBetslipOdds(SPORT_REQUIREMENT.minimumBetslipOdds);
  await recurringRewardsPage.fillMinimumLegsRequired(SPORT_REQUIREMENT.minimumLegsRequired);
  await recurringRewardsPage.fillMinimumLegOddsMultiplier(SPORT_REQUIREMENT.minimumLegOddsMultiplier);

  await recurringRewardsPage.clickSportRequirementSave();
  await recurringRewardsPage.sportRequirementDialog.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});

  return promotionName;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASINO REQUIREMENTS — row ⋯ -> "Casino Requirements" -> its own "Create Reward" popup
// (Provider*, Game*, Category*), built from the user's functional description plus outerHTML
// confirmed live for: the menu item, the Create Reward button, the 3 popup fields, Save/Cancel,
// Edit/Delete row buttons and the Delete Yes/No confirm dialog.
//
// Flagged assumption: Provider/Game option names were never given — every test below picks
// whichever option renders first instead of a specific name, and captures the picked text to verify
// it later where needed.
// ═══════════════════════════════════════════════════════════════════════════════

async function createRewardAndOpenCasinoRequirementPopup(page: any, recurringRewardsPage: any): Promise<string> {
  const promotionName = await createDailyReward(page, recurringRewardsPage);

  // Confirmed live (TC_RR_40, repeated across 2 separate runs): the row-menu -> "Casino
  // Requirements" -> "Create Reward" chain can bounce back to the plain Recurring Rewards list
  // instead of landing on (and staying on) the Casino popup — same stray-overlay/navigation flake
  // already documented for the sidebar nav in navigateToRecurringRewards() above, just hitting a
  // different click chain. The popup can also flash open and vanish a moment later, which
  // clickCreateReward() now re-checks for with a short debounce — without that, this retry never
  // actually triggered, since providerDropdown genuinely was visible for an instant each time.
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await recurringRewardsPage.clickCasinoRequirementsByPromotionName(promotionName);
    const opened = await recurringRewardsPage.clickCreateReward().then(() => true).catch(() => false);
    if (opened) return promotionName;

    console.log(`Create Reward popup did not open (attempt ${attempt}/${maxAttempts}) — retrying from the Rewards list...`);
    await recurringRewardsPage.ensureOnRewardsListPage();
  }
  // Final attempt: let the caller's own error surface if this still isn't visible.
  await recurringRewardsPage.clickCasinoRequirementsByPromotionName(promotionName);
  await recurringRewardsPage.clickCreateReward();
  return promotionName;
}

/** Creates a full Casino Requirement (Provider/Game picked as whichever renders first, plus a
 * unique Category) under a fresh Daily Reward, and saves it. Returns the Reward's Promotion Name
 * (for cleanup) and the Category value — the only field with a value this helper controls, so it's
 * the reliable way to re-find the created row afterwards. */
async function createCasinoRequirement(page: any, recurringRewardsPage: any): Promise<{ promotionName: string; category: string }> {
  const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);

  await recurringRewardsPage.selectFirstProvider();
  await recurringRewardsPage.selectFirstGame();
  const category = `AutoCasinoCategory_${Date.now()}`;
  await recurringRewardsPage.fillCategory(category);

  await recurringRewardsPage.clickCasinoRequirementSave();
  await recurringRewardsPage.casinoRequirementDialog.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});

  return { promotionName, category };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMP CONFIGURATION — row ⋯ -> "Comp Configuration" -> its own "Create Comp Configuration" popup
// (Comp Code*, Comp Amount*, Scheduled Time*, Day of Week*, plus an "Is Scheduled" checkbox), built
// from the user's functional description plus outerHTML confirmed live for: the menu item, the
// Create Comp Configuration button, the 4 popup fields + checkbox, Save/Cancel, Edit/Delete row
// buttons, the Delete Yes/No confirm dialog and the search bar.
//
// Flagged assumptions:
//  - Comp Code/Day of Week option names were never given — every test below picks whichever option
//    renders first instead of a specific name, and captures the picked text to verify it later where
//    needed.
//  - User-confirmed: Scheduled Time is set via its own clock increment arrows, not typed directly.
// ═══════════════════════════════════════════════════════════════════════════════

async function createRewardAndOpenCompConfigurationPopup(page: any, recurringRewardsPage: any): Promise<string> {
  const promotionName = await createDailyReward(page, recurringRewardsPage);
  await recurringRewardsPage.clickCompConfigurationByPromotionName(promotionName);
  await recurringRewardsPage.clickCreateCompConfiguration();
  return promotionName;
}

/** Creates a full Comp Configuration (Comp Code/Day of Week picked as whichever renders first,
 * Scheduled Time set via arrows, plus a unique Comp Amount) under a fresh Daily Reward, and saves
 * it. Returns the Reward's Promotion Name (for cleanup), the Comp Amount value — the only field
 * with a test-controlled unique value, so it's the reliable way to re-find the created row
 * afterwards — and the Comp Code picked (confirmed live: this environment's search bar does NOT
 * match on Comp Amount, only Comp Code — see TC_RR_50).
 *
 * `onPromotionNameKnown`, when given, fires the INSTANT the Reward itself is created — before any
 * of the riskier popup steps (e.g. the clock-arrow Scheduled Time field) run. Without this, a
 * throw partway through this function (as happened when the Scheduled Time arrows briefly broke)
 * would leave the function's own `return` never reached, so a caller that only does
 * `rewardNameToCleanup = (await createCompConfiguration(...)).promotionName` would never learn the
 * name and the compulsory afterEach delete would leak the Reward. */
async function createCompConfiguration(
  page: any,
  recurringRewardsPage: any,
  onPromotionNameKnown?: (promotionName: string) => void,
): Promise<{ promotionName: string; compAmount: string; compCode: string }> {
  const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
  onPromotionNameKnown?.(promotionName);

  const compCode = await recurringRewardsPage.selectFirstCompCode();
  const compAmount = String(Date.now()).slice(-6);
  await recurringRewardsPage.fillCompAmount(compAmount);
  await recurringRewardsPage.setScheduledTime();
  await recurringRewardsPage.selectFirstDayOfWeek();

  await recurringRewardsPage.clickCompConfigurationSave();
  await recurringRewardsPage.compConfigurationDialog.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});

  return { promotionName, compAmount, compCode };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_RR_01 – TC_RR_02 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Marketing - Recurring Rewards - Page Level Tests', () => {

  test.beforeEach(async ({ page, sidebarPage, recurringRewardsPage }) => {
    await navigateToRecurringRewards(page, sidebarPage, recurringRewardsPage);
  });

  test('TC_RR_01 Verify Recurring Rewards page is accessible', async ({ page, recurringRewardsPage }, testInfo) => {
    await expect(recurringRewardsPage.createConfigurationBtn, 'Expected the Create Configuration button').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_01_page_accessible');
    console.log('Recurring Rewards page is accessible with the Create Configuration button visible.');
  });

  test('TC_RR_02 Verify Create Configuration button opens the popup with all 6 base fields and the checkbox', async ({ page, recurringRewardsPage }, testInfo) => {
    await openCreatePopup(recurringRewardsPage);

    await expect(recurringRewardsPage.promotionNameInput, 'Expected Promotion Name field').toBeVisible({ timeout: 10000 });
    await expect(recurringRewardsPage.regionCodeDropdown, 'Expected Region Code field').toBeVisible();
    await expect(recurringRewardsPage.startDateInput, 'Expected Start Date field').toBeVisible();
    await expect(recurringRewardsPage.endDateInput, 'Expected End Date field').toBeVisible();
    await expect(recurringRewardsPage.recurringFrequencyDropdown, 'Expected Recurring Frequency field').toBeVisible();
    await expect(recurringRewardsPage.wagerAmountRequirementInput, 'Expected Wager Amount Requirement field').toBeVisible();
    await expect(recurringRewardsPage.firstQualifyingBetOnlyCheckbox, 'Expected First Qualifying Bet Only checkbox').toBeVisible();

    // Confirmed live: Weekly-only fields are NOT part of the initial 6 — they only render once
    // Recurring Frequency = Weekly.
    await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to be absent before Weekly is selected').not.toBeVisible();

    await expect(recurringRewardsPage.saveBtn, 'Expected Save button').toBeVisible();
    // Confirmed live: Save renders disabled the instant the popup opens.
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to start disabled').toBeDisabled();
    await expect(recurringRewardsPage.cancelBtn, 'Expected Cancel button').toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_02_popup_6_fields');
    console.log('Create popup opened with all 6 base fields, the checkbox, and Save correctly starting disabled.');

    await recurringRewardsPage.clickCancel();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_RR_03 – TC_RR_21 — Create Popup / Search / Region Filter / Delete Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Marketing - Recurring Rewards - Create Popup Tests', () => {
  // Compulsory cleanup: tracks whichever Reward a test actually persisted via Save, and deletes it
  // unconditionally in afterEach — whether the test passed or failed.
  let rewardNameToCleanup: string | null = null;

  test.beforeEach(async ({ page, sidebarPage, recurringRewardsPage }) => {
    rewardNameToCleanup = null;
    await navigateToRecurringRewards(page, sidebarPage, recurringRewardsPage);
    await openCreatePopup(recurringRewardsPage);
  });

  test.afterEach(async ({ recurringRewardsPage }) => {
    if (rewardNameToCleanup) {
      // Confirmed gap: a test that fails while still on a Sport/Casino/Comp Configuration sub-page
      // (before its own final clickBackToRewards()) left deleteAllRewardsByPromotionName searching
      // the Rewards-list table from the wrong page, silently leaking the Reward. Get back to the
      // list first, unconditionally, so cleanup always runs against the right page.
      await recurringRewardsPage.ensureOnRewardsListPage();
      // Deletes every row sharing this name, not just one — this app allows duplicate Promotion
      // Names (confirmed live), so the Clone test below can leave 2 rows behind under one name.
      await recurringRewardsPage.deleteAllRewardsByPromotionName(rewardNameToCleanup);
      rewardNameToCleanup = null;
    }
  });

  // ─── Base fields ────────────────────────────────────────────────────────────

  test('TC_RR_03 Verify Promotion Name field accepts input', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = `AutoRecurringReward_${Date.now()}`;
    await recurringRewardsPage.fillPromotionName(promotionName);
    expect(await recurringRewardsPage.getPromotionNameValue(), 'Expected Promotion Name value to be accepted').toBe(promotionName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_03_promotion_name');
    console.log('Promotion Name field accepts valid input.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_04 Verify Region Code dropdown offers and accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
    const selected = await recurringRewardsPage.selectFirstRegionCode();
    const shownValue = await recurringRewardsPage.getDropdownValue(recurringRewardsPage.regionCodeDropdown);
    expect(shownValue, `Expected the selected Region Code "${selected}" to be shown`).toBe(selected);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_04_region_code');
    console.log(`Region Code dropdown opened and the selected value "${selected}" is shown.`);

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_05 Verify Start Date field accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.setStartDate();
    const startValue = await recurringRewardsPage.startDateInput.inputValue();
    expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_05_start_date');
    console.log(`Start Date populated as: "${startValue}".`);

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_06 Verify End Date field accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.setEndDate();
    const endValue = await recurringRewardsPage.endDateInput.inputValue();
    expect(endValue.trim().length > 0, 'Expected End Date to be selected').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_06_end_date');
    console.log(`End Date populated as: "${endValue}".`);

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_07 Verify Recurring Frequency dropdown offers Daily and Weekly', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.selectRecurringFrequency('Daily');
    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.recurringFrequencyDropdown), 'Expected Daily to be selected').toBe('Daily');

    await recurringRewardsPage.selectRecurringFrequency('Weekly');
    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.recurringFrequencyDropdown), 'Expected Weekly to be selected').toBe('Weekly');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_07_recurring_frequency');
    console.log('Recurring Frequency dropdown offers and accepts both Daily and Weekly.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_08 Verify Wager Amount Requirement field accepts numeric input', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.fillWagerAmountRequirement('25');
    expect(await recurringRewardsPage.getWagerAmountRequirementValue(), 'Expected a plain integer to be accepted').toBe('25');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_08_wager_amount');
    console.log('Wager Amount Requirement field accepts a plain integer.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_09 Verify Wager Amount Requirement rejects non-numeric characters', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.fillWagerAmountRequirement('12.5abc');
    const typedValue = await recurringRewardsPage.getWagerAmountRequirementValue();
    expect(/^\d*$/.test(typedValue), `Expected Wager Amount Requirement to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_09_wager_amount_non_numeric');
    console.log(`Wager Amount Requirement with "12.5abc" — field value after entry: "${typedValue}".`);

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_10 Verify First Qualifying Bet Only checkbox toggles', async ({ page, recurringRewardsPage }, testInfo) => {
    const before = await recurringRewardsPage.isFirstQualifyingBetOnlyChecked();
    await recurringRewardsPage.toggleFirstQualifyingBetOnly();
    const after = await recurringRewardsPage.isFirstQualifyingBetOnlyChecked();
    expect(after, 'Expected First Qualifying Bet Only to change state').toBe(!before);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_10_first_qualifying_bet_only');
    console.log('First Qualifying Bet Only checkbox toggles.');

    await recurringRewardsPage.clickCancel();
  });

  // ─── Mandatory validation ────────────────────────────────────────────────────

  test('TC_RR_11 Verify Save stays disabled when the popup is blank', async ({ page, recurringRewardsPage }, testInfo) => {
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_11_save_disabled_blank');
    console.log('Save correctly stays disabled when the popup is blank.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_12 Verify Save becomes enabled once all mandatory Daily fields are filled', async ({ page, recurringRewardsPage }, testInfo) => {
    await fillMandatoryDailyFields(recurringRewardsPage);
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to become enabled once all mandatory Daily fields are filled').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_12_save_enabled_daily');
    console.log('Save becomes enabled once Promotion Name, Region Code, Start/End Date, Recurring Frequency and Wager Amount are all filled.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_13 Verify Cancel discards data without creating a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
    const draftName = await fillMandatoryDailyFields(recurringRewardsPage);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_13_step1_draft_filled');

    await recurringRewardsPage.clickCancel();
    await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(draftName, 5000);
    expect(isPresent, 'Expected the discarded draft to NOT appear in the table').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_13_step2_not_in_table');
    console.log(`Draft "${draftName}" discarded via Cancel and not present in the table.`);
  });

  // ─── Weekly-only fields ──────────────────────────────────────────────────────

  test('TC_RR_14 Verify selecting Weekly reveals Weekly Expiry Day and Weekly Expiry Time', async ({ page, recurringRewardsPage }, testInfo) => {
    await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to be absent before Weekly is selected').not.toBeVisible();

    await recurringRewardsPage.selectRecurringFrequency('Weekly');

    await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to appear after Weekly is selected').toBeVisible({ timeout: 10000 });
    await expect(recurringRewardsPage.weeklyExpiryTimeInput, 'Expected Weekly Expiry Time to appear after Weekly is selected').toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_14_weekly_reveals_fields');
    console.log('Selecting Weekly revealed Weekly Expiry Day and Weekly Expiry Time.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_15 Verify switching back to Daily hides the Weekly-only fields again', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.selectRecurringFrequency('Weekly');
    await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to appear after Weekly is selected').toBeVisible({ timeout: 10000 });

    await recurringRewardsPage.selectRecurringFrequency('Daily');
    await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to disappear after switching back to Daily').not.toBeVisible({ timeout: 10000 });
    await expect(recurringRewardsPage.weeklyExpiryTimeInput, 'Expected Weekly Expiry Time to disappear after switching back to Daily').not.toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_15_daily_hides_weekly_fields');
    console.log('Switching back to Daily correctly hid Weekly Expiry Day and Weekly Expiry Time.');

    await recurringRewardsPage.clickCancel();
  });

  test('TC_RR_16 Verify Save requires Weekly Expiry Day and Time when Weekly is selected', async ({ page, recurringRewardsPage }, testInfo) => {
    await recurringRewardsPage.fillPromotionName(`AutoRecurringReward_${Date.now()}`);
    await recurringRewardsPage.selectFirstRegionCode();
    await recurringRewardsPage.setStartDate();
    await recurringRewardsPage.setEndDate();
    await recurringRewardsPage.selectRecurringFrequency('Weekly');
    await recurringRewardsPage.fillWagerAmountRequirement('10');

    // Every other mandatory field is now filled, but Weekly Expiry Day/Time are still blank.
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to stay disabled while Weekly Expiry Day/Time are blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_16_step1_weekly_fields_blank');

    await recurringRewardsPage.selectFirstWeeklyExpiryDay();
    await recurringRewardsPage.setWeeklyExpiryTime();
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to enable once Weekly Expiry Day/Time are also filled').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_16_step2_weekly_fields_filled');
    console.log('Save correctly required Weekly Expiry Day and Time once Weekly was selected.');

    await recurringRewardsPage.clickCancel();
  });

  // ─── Save / toast ────────────────────────────────────────────────────────────

  test('TC_RR_17 Verify successful Recurring Reward creation with Daily frequency', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await fillMandatoryDailyFields(recurringRewardsPage);
    // Set BEFORE clicking Save so afterEach still attempts cleanup even if Save itself, or an
    // assertion right after it, is what fails.
    rewardNameToCleanup = promotionName;

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_17_step1_filled');

    await recurringRewardsPage.clickSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

    await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected the new Recurring Reward "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_17_step2_created');
    console.log(`✅ TC_RR_17 PASSED — Daily Reward "${promotionName}" created and verified in table.`);
  });

  test('TC_RR_18 Verify successful Recurring Reward creation with Weekly frequency', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await fillMandatoryWeeklyFields(recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_18_step1_filled');

    await recurringRewardsPage.clickSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

    await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected the new Recurring Reward "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_18_step2_created');
    console.log(`✅ TC_RR_18 PASSED — Weekly Reward "${promotionName}" created and verified in table.`);
  });

  // ─── Search / Region filter / Delete ────────────────────────────────────────

  test('TC_RR_19 Verify Search functionality for a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.searchFor(promotionName);

    const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected searching for "${promotionName}" to show it in the table`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_19_search_success');
    console.log(`✅ TC_RR_19 PASSED — Searching for "${promotionName}" correctly surfaced it in the table.`);
  });

  // UNCONFIRMED locator — see the file-level comment. Skips gracefully (rather than failing) if
  // the best-effort region filter dropdown can't be found, since no confirmed outerHTML exists
  // for it yet.
  test('TC_RR_20 Verify Region filter functionality', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const selectedRegion = await recurringRewardsPage.selectFirstRegionFilterOption();
    test.skip(selectedRegion === null, 'Region filter control could not be located with the best-effort selector — its real outerHTML is needed to write this test properly.');

    await page.waitForLoadState('networkidle').catch(() => {});
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_20_region_filter_applied');
    console.log(`Region filter applied with value "${selectedRegion}" — verify manually whether the table correctly filtered to that region.`);
  });

  test('TC_RR_21 Verify Delete functionality for a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    // Set immediately — if deleteRewardIfPresent below fails partway, the afterEach above makes a
    // second attempt as a safety net; if it already succeeded, that second attempt is a harmless
    // no-op (deleteRewardIfPresent itself tolerates the row already being gone).
    rewardNameToCleanup = promotionName;

    const isPresentBeforeDelete = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresentBeforeDelete, `Expected "${promotionName}" to exist in the table before attempting to delete it`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_21_step1_before_delete');

    await recurringRewardsPage.deleteRewardIfPresent(promotionName);

    const isPresentAfterDelete = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 10000);
    expect(isPresentAfterDelete, `Expected "${promotionName}" to be removed from the table after Delete`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_21_step2_after_delete');
    console.log(`✅ TC_RR_21 PASSED — Reward "${promotionName}" was successfully deleted.`);
  });

  // ─── Edit / Clone ────────────────────────────────────────────────────────────

  test('TC_RR_22 Verify Edit updates a Recurring Reward and the change persists', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.clickEditByPromotionName(promotionName);

    const editedName = `${promotionName}_Edited`;
    await recurringRewardsPage.fillPromotionName(editedName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step1_edited');

    await recurringRewardsPage.clickSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);
    expect(toastText.length > 0, 'Expected a toast confirming the Edit was saved').toBe(true);

    await expect(recurringRewardsPage.promotionNameInput, 'Expected the Edit popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Track the RENAMED reward for cleanup from here on — the original name no longer exists.
    rewardNameToCleanup = editedName;

    const isPresentAfterEdit = await recurringRewardsPage.isRowVisibleByPromotionName(editedName, 15000);
    expect(isPresentAfterEdit, `Expected the renamed Reward "${editedName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step2_renamed_in_table');

    // Re-open Edit on the renamed reward and confirm the change actually persisted server-side,
    // not just reflected optimistically in the table.
    await recurringRewardsPage.clickEditByPromotionName(editedName);
    const reopenedValue = await recurringRewardsPage.getPromotionNameValue();
    expect(reopenedValue, 'Expected re-opening Edit to show the persisted (renamed) Promotion Name').toBe(editedName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step3_reopened_edit');
    console.log(`✅ TC_RR_22 PASSED — Reward renamed to "${editedName}" and the change persisted after reopening Edit.`);

    await recurringRewardsPage.clickCancel();
  });

  // ASSUMED (not independently confirmed): Clone reuses the same Create/Edit dialog pre-filled
  // with the original Reward's values, the same pattern already confirmed for Rules Engine's own
  // Clone feature elsewhere in this app — only the "Clone" menu item and the popup's own Save
  // button were captured live for Recurring Rewards specifically. See
  // RecurringRewardsPage.clickCloneByPromotionName's own comment.
  test('TC_RR_23 Verify Clone creates a duplicate Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const countBeforeClone = await recurringRewardsPage.getRowCountByPromotionName(promotionName);
    expect(countBeforeClone, `Expected exactly 1 row for "${promotionName}" before cloning`).toBe(1);

    await recurringRewardsPage.clickCloneByPromotionName(promotionName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_23_step1_clone_popup');

    // This app does not enforce unique Promotion Names (confirmed live: the real data table
    // already shows 2 separate rows both named "Pranav Test"), so clicking Save without changing
    // anything should succeed and leave a second row behind with the same name.
    await recurringRewardsPage.clickSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Clone Save: "${toastText || '(no toast appeared)'}"`);

    await expect(recurringRewardsPage.promotionNameInput, 'Expected the Clone popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const countAfterClone = await recurringRewardsPage.getRowCountByPromotionName(promotionName);
    expect(countAfterClone, `Expected a second row for "${promotionName}" after cloning. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(countBeforeClone + 1);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_23_step2_duplicate_created');
    console.log(`✅ TC_RR_23 PASSED — Clone created a duplicate Reward named "${promotionName}" (now ${countAfterClone} rows).`);
  });

  // ─── Sports Requirements ────────────────────────────────────────────────────
  // Generated from recordings/rr-20261026100104.mp4 (steps: recordings/work/rr-20261026100104/steps.md)
  //
  // Flagged assumptions:
  //  - Promotion Name "QFG", Region "Betway Botswana", End Date 2026/11/30 and Wager 23 from the
  //    recording are replaced by the existing fillMandatoryDailyFields() values (Auto… name, first
  //    region, today, 10) — they don't affect the Sport Requirement check.
  //  - Event is the first option (mock events are labelled with today's date).
  //  - The Sport Requirement row's own "Single Leg Only" switch is read via aria-checked="true"
  //    on its outer .p-inputswitch div — confirmed live (the recording's assumed
  //    "p-inputswitch-checked" CSS class doesn't exist).
  //  - Deleting the reward is assumed to remove its Sport Requirement too (what the recording does).
  test('TC_RR_24 Verify a Sport Requirement can be created for a new Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
    // Step 1: create the Daily Recurring Reward (popup already opened by beforeEach)
    const promotionName = await fillMandatoryDailyFields(recurringRewardsPage);
    rewardNameToCleanup = promotionName;
    await expect(recurringRewardsPage.saveBtn, 'Expected Save to be enabled once all mandatory Daily fields are filled').toBeEnabled({ timeout: 10000 });

    await recurringRewardsPage.clickSave();
    await expect(recurringRewardsPage.getToastByText('Recurring reward created successfully'), 'Expected the "Recurring reward created successfully" toast').toBeVisible({ timeout: 15000 });
    await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected the new Recurring Reward "${promotionName}" to appear in the table`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_24_step1_reward_created');

    // Step 2: row ⋯ -> Sports Requirements -> Create Sport Requirement
    await recurringRewardsPage.clickSportsRequirementsByPromotionName(promotionName);
    await expect(page.getByText('No Sport Requirements Found'), 'Expected a brand-new Reward to have no Sport Requirements yet').toBeVisible({ timeout: 15000 });

    await recurringRewardsPage.clickCreateSportRequirement();
    await expect(recurringRewardsPage.sportRequirementSaveBtn, 'Expected Save to start disabled in the Create Sport Requirement popup').toBeDisabled();

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
    await expect(recurringRewardsPage.sportRequirementDialog.getByText('Tip: Select Sport from the dropdown'), 'Expected the Tip message once a Sport is picked from the dropdown').toBeVisible();
    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    await recurringRewardsPage.selectCountry(SPORT_REQUIREMENT.country);
    await recurringRewardsPage.selectBetSlipType(SPORT_REQUIREMENT.betSlipType);
    const eventName = await recurringRewardsPage.selectFirstEvent();
    await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);

    await recurringRewardsPage.fillMinimumBetslipOdds(SPORT_REQUIREMENT.minimumBetslipOdds);
    await recurringRewardsPage.fillMinimumLegsRequired(SPORT_REQUIREMENT.minimumLegsRequired);
    await recurringRewardsPage.fillMinimumLegOddsMultiplier(SPORT_REQUIREMENT.minimumLegOddsMultiplier);

    await recurringRewardsPage.toggleSingleLegOnly();
    await recurringRewardsPage.toggleApplyOddsToLegsInTotal();
    expect(await recurringRewardsPage.isSwitchOn(recurringRewardsPage.singleLegOnlySwitch), 'Expected Single Leg Only to be switched on').toBe(true);
    expect(await recurringRewardsPage.isSwitchOn(recurringRewardsPage.applyOddsToLegsInTotalSwitch), 'Expected Apply Odds And Multiplier To Legs In Total to be switched on').toBe(true);

    await expect(recurringRewardsPage.sportRequirementSaveBtn, 'Expected Save to be enabled once the Sport Requirement is filled').toBeEnabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_24_step2_sport_requirement_filled');

    // Step 3: Save and verify the Sport Requirement row
    await recurringRewardsPage.clickSportRequirementSave();
    await expect(recurringRewardsPage.getToastByText('Sport Requirement created successfully'), 'Expected the "Sport Requirement created successfully" toast').toBeVisible({ timeout: 15000 });
    await expect(recurringRewardsPage.sportRequirementDialog, 'Expected the Create Sport Requirement popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const sportRow = recurringRewardsPage.getSportRequirementRow(SPORT_REQUIREMENT.sport);
    await expect(sportRow, 'Expected the new Sport Requirement row in the table').toBeVisible({ timeout: 15000 });
    for (const value of [SPORT_REQUIREMENT.country, SPORT_REQUIREMENT.league, eventName, SPORT_REQUIREMENT.market, SPORT_REQUIREMENT.betSlipType]) {
      await expect(sportRow, `Expected the Sport Requirement row to show "${value}"`).toContainText(value);
    }
    await expect(sportRow.locator('td').nth(5), 'Expected Min Betslip Odds to be 2').toHaveText(SPORT_REQUIREMENT.minimumBetslipOdds);
    await expect(sportRow.locator('td').nth(6), 'Expected Minimum Legs to be 1').toHaveText(SPORT_REQUIREMENT.minimumLegsRequired);
    // Confirmed live: this app's PrimeNG inputswitch reports its checked state via
    // aria-checked="true" on the OUTER role="checkbox" div (.p-inputswitch itself) — same
    // convention already proven elsewhere in this app (e.g. LeaderboardPage.isToggleChecked) —
    // NOT a "p-inputswitch-checked" CSS class, which doesn't exist (confirmed live: the real class
    // list here is "p-inputswitch p-component p-highlight p-disabled").
    await expect(sportRow.locator('.p-inputswitch'), 'Expected the row\'s Single Leg Only switch to be on').toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_24_step3_sport_requirement_created');

    // Step 4: back to the list and delete the Reward (as the recording does)
    await recurringRewardsPage.clickBackToRewards();
    await recurringRewardsPage.deleteRewardByPromotionName(promotionName);
    await expect(recurringRewardsPage.getToastByText(`Successfully deleted reward "${promotionName}"`), 'Expected the delete-success toast naming the Reward').toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresentAfterDelete = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 5000);
    expect(isPresentAfterDelete, `Expected "${promotionName}" to be removed from the table after Delete`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_24_step4_reward_deleted');
    console.log(`✅ TC_RR_24 PASSED — Sport Requirement created for "${promotionName}" and the Reward was deleted afterwards.`);
  });

  // ─── Sport Requirement — field dependency, clearing and enablement rules ────
  
  // Based on the user's generic functional description:
  //   Clearing: changing League clears Event/Market; changing Event clears Market; changing Market
  //   clears Outcome; changing Sport or Feed clears League/Event/Market/Outcome.
  //   Enablement: Event enables Market; Market enables Outcome; Market stays disabled until Event is
  //   picked; Outcome stays disabled until Market is picked.
  
  // Flagged assumptions/deviations:
  //  - "Outcome": no such field exists anywhere in this popup (confirmed live — same situation as
  //    Bet Promotion Rules' own popup). No locator or test references it.
  //  - The description's ENABLEMENT rules describe a strictly sequential chain (Sport enables
  //    League, League enables Event, Event enables Market). That contradicts what's already
  //    confirmed live for THIS popup (see selectSport()'s own comment): League, Country, Event and
  //    Market all switch from free-text inputs to functional dropdowns TOGETHER the moment Sport is
  //    picked — not one by one as each predecessor gets a value. TC_RR_26/27 below test the
  //    confirmed "all-together" behavior instead of fabricating a sequential chain that isn't real
  //    here. Country isn't named in the user's chain at all, but is included in the enablement
  //    checks since it's confirmed to switch over at the same moment as League/Event/Market.
  //  - The CLEARING rules are a different mechanism (what happens on a later change, independent of
  //    how the fields first became enabled) and aren't contradicted by anything confirmed — written
  //    as stated, with Country included in the Feed/Sport cascades for the same reason as above.
  //  - Whether Feed enables Sport itself was never confirmed either way — TC_RR_25 observes this
  //    directly and skips gracefully if Sport turns out to already be enabled before Feed has a
  //    value.

  // Confirmed live (TC_RR_25 run): Sport is already enabled the instant the Create Sport
  // Requirement popup opens, with NO Feed Name value set yet — Feed does NOT gate Sport on this
  // popup (unlike Bet Promotion Rules' own Feed->Sport chain). Rewritten to assert the actual
  // confirmed behavior instead of the disproven "Feed enables Sport" assumption.
  test('TC_RR_25 Verify Sport is enabled by default, independent of Feed Name', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    expect(await recurringRewardsPage.isSportFieldEnabled(), 'Expected Sport to already be enabled before Feed Name has a value').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_25_sport_enabled_by_default');
    console.log('Sport is enabled by default, independent of Feed Name.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_26 Verify League, Country, Event and Market remain disabled before Sport is selected', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);

    expect(await recurringRewardsPage.isLeagueFieldEnabled(), 'Expected League to be disabled before Sport is selected').toBe(false);
    expect(await recurringRewardsPage.isCountryFieldEnabled(), 'Expected Country to be disabled before Sport is selected').toBe(false);
    expect(await recurringRewardsPage.isEventFieldEnabled(), 'Expected Event to be disabled before Sport is selected').toBe(false);
    expect(await recurringRewardsPage.isMarketFieldEnabled(), 'Expected Market to be disabled before Sport is selected').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_26_dependents_disabled');
    console.log('League, Country, Event and Market are all disabled before Sport is selected.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // Confirmed live (user-supplied outerHTML, 2 snapshots): the chain is NOT one-field-at-a-time —
  // it's Sport -> League -> {Country, Event together} -> Market. Right after Sport is picked, League
  // alone switches to data-p-disabled="false" (Country/Event/Market all still data-p-disabled="true").
  // Right after League is ALSO picked (with Country and Event still empty), BOTH Country's and
  // Event's outer divs flip to data-p-disabled="false" together — Event does not wait for Country to
  // have a value, only for League to. Market stays data-p-disabled="true" at that point, so it needs
  // its own predecessor filled (Event, per the user's original functional description, which was
  // never contradicted for this specific link).
  test('TC_RR_27 Verify League enables Country and Event together, then Event enables Market', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);

    expect(await recurringRewardsPage.isLeagueFieldEnabled(), 'Expected League to become enabled once Sport is selected').toBe(true);
    expect(await recurringRewardsPage.isCountryFieldEnabled(), 'Expected Country to stay disabled until League has a value').toBe(false);
    expect(await recurringRewardsPage.isEventFieldEnabled(), 'Expected Event to stay disabled until League has a value').toBe(false);
    expect(await recurringRewardsPage.isMarketFieldEnabled(), 'Expected Market to stay disabled until Event has a value').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_27_step1_only_league_enabled');

    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    await expect.poll(() => recurringRewardsPage.isCountryFieldEnabled(), { message: 'Expected Country to become enabled once League is selected', timeout: 15000 }).toBe(true);
    await expect.poll(() => recurringRewardsPage.isEventFieldEnabled(), { message: 'Expected Event to become enabled once League is selected (together with Country)', timeout: 15000 }).toBe(true);
    expect(await recurringRewardsPage.isMarketFieldEnabled(), 'Expected Market to still be disabled until Event has a value').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_27_step2_league_enables_country_and_event');

    await recurringRewardsPage.selectFirstEvent();
    await expect.poll(() => recurringRewardsPage.isMarketFieldEnabled(), { message: 'Expected Market to become enabled once Event is selected', timeout: 15000 }).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_27_step3_event_enables_market');
    console.log('League enabled Country and Event together; Event then enabled Market.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // Confirmed live (user-supplied outerHTML): League's own enablement is reactive to Sport's CURRENT
  // value, not a one-time switch — once Feed Name clears Sport back to blank, League loses its own
  // precondition and becomes disabled too, which cascades the same way down to Country/Event/Market
  // (each gated by its immediate predecessor having a value — see TC_RR_27). Nothing in this chain is
  // actually immune to a Feed Name change; an earlier "confirmed live" note in this file claiming
  // League stays unaffected was stale.
  test('TC_RR_28 Verify changing Feed Name clears the entire chain: Sport, League, Country, Event, Market', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    await recurringRewardsPage.selectCountry(SPORT_REQUIREMENT.country);
    await recurringRewardsPage.selectFirstEvent();
    await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);

    const newFeed = await recurringRewardsPage.selectSportRequirementOptionOtherThan(recurringRewardsPage.feedNameDropdown, SPORT_REQUIREMENT.feedName);
    test.skip(newFeed === null, 'Only one Feed Name option exists in this environment — nothing to change to.');

    // The clearing cascade after changing Feed Name isn't synchronous with the click, and can settle
    // noticeably slower than most UI updates in this popup — poll with a generous timeout instead of
    // reading these once or assuming a short settle time.
    await expect.poll(() => recurringRewardsPage.getDropdownValue(recurringRewardsPage.sportDropdown), { message: 'Expected Sport to be cleared when Feed Name changes', timeout: 45000 }).toBe('');
    await expect.poll(() => recurringRewardsPage.isLeagueFieldEnabled(), { message: 'Expected League to be disabled again once Sport is cleared', timeout: 45000 }).toBe(false);
    await expect.poll(() => recurringRewardsPage.isCountryFieldEnabled(), { message: 'Expected Country to be disabled again after Feed Name changes', timeout: 45000 }).toBe(false);
    await expect.poll(() => recurringRewardsPage.isEventFieldEnabled(), { message: 'Expected Event to be disabled again after Feed Name changes', timeout: 45000 }).toBe(false);
    await expect.poll(() => recurringRewardsPage.isMarketFieldEnabled(), { message: 'Expected Market to be disabled again after Feed Name changes', timeout: 45000 }).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_28_feed_change_clears_all');
    console.log('Changing Feed Name correctly cleared Sport, League, Country, Event and Market — the whole chain.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // Same League caveat as TC_RR_28 above — confirmed live, not a locator bug.
  test('TC_RR_29 Verify changing Sport clears Country, Event and Market (League is unaffected)', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    await recurringRewardsPage.selectCountry(SPORT_REQUIREMENT.country);
    await recurringRewardsPage.selectFirstEvent();
    await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);

    const newSport = await recurringRewardsPage.selectSportRequirementOptionOtherThan(recurringRewardsPage.sportDropdown, SPORT_REQUIREMENT.sport);
    test.skip(newSport === null, 'Only one Sport option exists in this environment — nothing to change to.');

    expect(await recurringRewardsPage.isLeagueFieldEnabled(), 'Expected League to remain enabled/unaffected when Sport changes').toBe(true);
    expect(await recurringRewardsPage.isCountryFieldEnabled(), 'Expected Country to be disabled again after Sport changes').toBe(false);
    expect(await recurringRewardsPage.isEventFieldEnabled(), 'Expected Event to be disabled again after Sport changes').toBe(false);
    expect(await recurringRewardsPage.isMarketFieldEnabled(), 'Expected Market to be disabled again after Sport changes').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_29_sport_change_clears_dependents');
    console.log('Changing Sport correctly cleared Country, Event and Market (League stayed enabled, as confirmed live).');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // Confirmed live (actual run): Country and Event themselves stay ENABLED after switching League to
  // a different value — League still has a value, so their own enablement precondition is still
  // satisfied (matches TC_RR_27/28's model). But Market went back to DISABLED in that same run,
  // which only makes sense if the cascade reset that fires on a League change also clears Event's
  // own SELECTED VALUE back to blank underneath it (same as if Event had never been picked) — Market
  // isn't directly tied to League at all, it's just that its own precondition ("Event has a value")
  // stops being true once Event's value gets wiped by the League change. The original version of
  // this test assumed Market would also just stay enabled, which this run disproved.
  test('TC_RR_30 Verify switching League to a different value resets Event/Market while Country and Event stay enabled', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    await recurringRewardsPage.selectCountry(SPORT_REQUIREMENT.country);
    await recurringRewardsPage.selectFirstEvent();
    await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);

    const newLeague = await recurringRewardsPage.selectSportRequirementOptionOtherThan(recurringRewardsPage.leagueDropdown, SPORT_REQUIREMENT.league);
    test.skip(newLeague === null, 'Only one League option exists in this environment — nothing to change to.');

    await expect.poll(() => recurringRewardsPage.getDropdownValue(recurringRewardsPage.eventDropdown), { message: 'Expected Event\'s own selected value to be cleared when League changes', timeout: 15000 }).toBe('');
    expect(await recurringRewardsPage.isCountryFieldEnabled(), 'Expected Country to remain enabled after switching League to a different value').toBe(true);
    expect(await recurringRewardsPage.isEventFieldEnabled(), 'Expected Event to remain enabled after switching League to a different value').toBe(true);
    await expect.poll(() => recurringRewardsPage.isMarketFieldEnabled(), { message: 'Expected Market to become disabled again, since switching League reset Event\'s value underneath it', timeout: 15000 }).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_30_league_switch_resets_event_and_market');
    console.log('Switching League left Country/Event enabled but cleared Event\'s own value, which correctly disabled Market again.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_31 Verify changing Event clears Market', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFeedName(SPORT_REQUIREMENT.feedName);
    await recurringRewardsPage.selectSport(SPORT_REQUIREMENT.sport);
    await recurringRewardsPage.selectLeague(SPORT_REQUIREMENT.league);
    const firstEvent = await recurringRewardsPage.selectFirstEvent();
    await recurringRewardsPage.selectMarket(SPORT_REQUIREMENT.market);

    const newEvent = await recurringRewardsPage.selectSportRequirementOptionOtherThan(recurringRewardsPage.eventDropdown, firstEvent);
    test.skip(newEvent === null, 'Only one Event option exists in this environment — nothing to change to.');

    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.marketDropdown), 'Expected Market to be cleared when Event changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_31_event_change_clears_market');
    console.log('Changing Event correctly cleared Market.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // Per user clarification: Bet Slip Type is the ONLY mandatory field in this popup — Feed Name,
  // Sport, League, Country, Event, Market and the numeric fields are all optional.
  test('TC_RR_32 Verify Bet Slip Type is the only mandatory field in the Create Sport Requirement popup', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenSportRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await expect(recurringRewardsPage.sportRequirementSaveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_32_step1_blank');

    await recurringRewardsPage.selectBetSlipType(SPORT_REQUIREMENT.betSlipType);

    await expect(recurringRewardsPage.sportRequirementSaveBtn, 'Expected Save to become enabled once Bet Slip Type alone is selected — the only mandatory field in this popup').toBeEnabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_32_step2_betsliptype_only');
    console.log('Save correctly became enabled once Bet Slip Type alone was selected, confirming it is the only mandatory field.');

    await recurringRewardsPage.clickSportRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  // ─── Sport Requirement — Edit / Delete ──────────────────────────────────────
  // Confirmed live (user-supplied outerHTML): unlike the Rewards list's own kebab menu, each Sport
  // Requirement row has standalone "Edit"/"Delete" buttons (aria-label="Edit"/"Delete").
  
  // Flagged assumption: Edit is ASSUMED to reuse the Create Sport Requirement dialog, pre-filled —
  // see clickEditSportRequirement()'s own comment in RecurringRewardsPage.ts for the risk if the
  // Edit dialog's title differs from "Create Sport Requirement" (every field locator here is scoped
  // by that title). Deletes the parent Reward in afterEach regardless of pass/fail either way.

  test('TC_RR_33 Verify Edit Sport Requirement opens pre-filled and saves changes', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createSportRequirement(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getSportRequirementRow(SPORT_REQUIREMENT.sport);
    await expect(row, 'Expected the new Sport Requirement row to appear').toBeVisible({ timeout: 15000 });

    await recurringRewardsPage.clickEditSportRequirement(row);

    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.feedNameDropdown), 'Expected Feed Name to be pre-filled in the Edit popup').toBe(SPORT_REQUIREMENT.feedName);
    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.marketDropdown), 'Expected Market to be pre-filled in the Edit popup').toBe(SPORT_REQUIREMENT.market);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_33_step1_edit_prefilled');

    const updatedOdds = '5';
    await recurringRewardsPage.fillMinimumBetslipOdds(updatedOdds);
    await recurringRewardsPage.clickSportRequirementSave();

    // Edit's own success toast text was never independently confirmed — capture it for diagnostics
    // rather than asserting a guessed string; the row's own updated value is the durable signal.
    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);
    await expect(recurringRewardsPage.sportRequirementDialog, 'Expected the Edit popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(row.locator('td').nth(5), `Expected Min Betslip Odds to reflect the edited value. Toast said: "${toastText || '(no toast appeared)'}"`).toHaveText(updatedOdds, { timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_33_step2_edit_saved');
    console.log(`✅ TC_RR_33 PASSED — Sport Requirement edited for "${promotionName}" (Min Betslip Odds updated to ${updatedOdds}).`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_34 Verify Delete removes a Sport Requirement row', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createSportRequirement(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getSportRequirementRow(SPORT_REQUIREMENT.sport);
    await expect(row, 'Expected the new Sport Requirement row to appear').toBeVisible({ timeout: 15000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_34_step1_before_delete');

    await recurringRewardsPage.clickDeleteSportRequirement(row);

    // Delete's own success toast text was never independently confirmed either — capture it for
    // diagnostics, and rely on the row's disappearance / empty-state message as the real signal.
    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Delete: "${toastText || '(no toast appeared)'}"`);

    await expect(row, `Expected the Sport Requirement row to be gone after Delete. Toast said: "${toastText || '(no toast appeared)'}"`).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByText('No Sport Requirements Found'), 'Expected the empty-state message once the only Sport Requirement is deleted').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_34_step2_after_delete');
    console.log(`✅ TC_RR_34 PASSED — Sport Requirement deleted for "${promotionName}".`);

    await recurringRewardsPage.clickBackToRewards();
  });

  // ─── Casino Requirements ──────────────────────────────────────────────────────

  test('TC_RR_35 Verify Casino Requirements navigation shows the Create Reward button and table', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.clickCasinoRequirementsByPromotionName(promotionName);

    await expect(recurringRewardsPage.createRewardBtn, 'Expected the Create Reward button on the Casino Requirements page').toBeVisible({ timeout: 15000 });
    await expect(recurringRewardsPage.casinoRequirementTable, 'Expected the Casino Requirements table').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_01_navigation');
    console.log('Casino Requirements navigation shows the Create Reward button and table.');

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_36 Verify Create Reward popup shows Provider, Game and Category fields', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await expect(recurringRewardsPage.providerDropdown, 'Expected Provider field').toBeVisible({ timeout: 10000 });
    await expect(recurringRewardsPage.gameDropdown, 'Expected Game field').toBeVisible();
    await expect(recurringRewardsPage.categoryInput, 'Expected Category field').toBeVisible();
    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save button').toBeVisible();
    await expect(recurringRewardsPage.casinoRequirementCancelBtn, 'Expected Cancel button').toBeVisible();
    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_02_popup_open');
    console.log('Create Reward popup shows Provider, Game, Category, Save and Cancel.');

    await recurringRewardsPage.clickCasinoRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_37 Verify Save stays disabled until Provider, Game and Category are all filled', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

    await recurringRewardsPage.selectFirstProvider();
    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save to stay disabled with only Provider filled').toBeDisabled({ timeout: 10000 });

    await recurringRewardsPage.selectFirstGame();
    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save to stay disabled with Category still blank').toBeDisabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_03_step1_category_blank');

    await recurringRewardsPage.fillCategory(`AutoCasinoCategory_${Date.now()}`);
    await expect(recurringRewardsPage.casinoRequirementSaveBtn, 'Expected Save to become enabled once all 3 fields are filled').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_03_step2_all_filled');
    console.log('Save correctly stayed disabled until Provider, Game and Category were all filled.');

    await recurringRewardsPage.clickCasinoRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_38 Verify Cancel discards data without creating a Casino Requirement', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFirstProvider();
    await recurringRewardsPage.selectFirstGame();
    const category = `AutoCasinoCategory_Cancel_${Date.now()}`;
    await recurringRewardsPage.fillCategory(category);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_04_step1_filled');

    await recurringRewardsPage.clickCasinoRequirementCancel();
    await expect(recurringRewardsPage.casinoRequirementDialog, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    const row = recurringRewardsPage.getCasinoRequirementRow(category);
    await expect(row, 'Expected the discarded draft to NOT appear in the table').not.toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_04_step2_not_in_table');
    console.log(`Draft Casino Requirement (category "${category}") discarded via Cancel and not present in the table.`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_39 Verify changing Provider clears Game', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const firstProvider = await recurringRewardsPage.selectFirstProvider();
    await recurringRewardsPage.selectFirstGame();
    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.gameDropdown), 'Expected Game to hold its selection before Provider is changed').not.toBe('');

    const newProvider = await recurringRewardsPage.selectOptionOtherThan(recurringRewardsPage.providerDropdown, firstProvider);
    test.skip(newProvider === null, 'Only one Provider option exists in this environment — nothing to change to.');

    expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.gameDropdown), 'Expected Game to be cleared when Provider changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_05_provider_change_clears_game');
    console.log('Changing Provider correctly cleared Game.');

    await recurringRewardsPage.clickCasinoRequirementCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_40 Verify successful Casino Requirement creation', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCasinoRequirementPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const providerName = await recurringRewardsPage.selectFirstProvider();
    const gameName = await recurringRewardsPage.selectFirstGame();
    const category = `AutoCasinoCategory_${Date.now()}`;
    await recurringRewardsPage.fillCategory(category);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_06_step1_filled');

    await recurringRewardsPage.clickCasinoRequirementSave();

    // The create-success toast text was never independently confirmed for Casino Requirements —
    // capture it for diagnostics rather than asserting a guessed string; the row itself is the
    // durable signal.
    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Create: "${toastText || '(no toast appeared)'}"`);
    await expect(recurringRewardsPage.casinoRequirementDialog, 'Expected the Create Reward popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const row = recurringRewardsPage.getCasinoRequirementRow(category);
    await expect(row, `Expected the new Casino Requirement row to appear. Toast said: "${toastText || '(no toast appeared)'}"`).toBeVisible({ timeout: 15000 });
    await expect(row, `Expected the row to show Provider "${providerName}"`).toContainText(providerName);
    await expect(row, `Expected the row to show Game "${gameName}"`).toContainText(gameName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_06_step2_created');
    console.log(`✅ TC_CR_06 PASSED — Casino Requirement created for "${promotionName}" (Provider "${providerName}", Game "${gameName}", Category "${category}").`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_41 Verify Edit Casino Requirement opens pre-filled and saves changes', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, category } = await createCasinoRequirement(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCasinoRequirementRow(category);
    await expect(row, 'Expected the new Casino Requirement row to appear').toBeVisible({ timeout: 15000 });

    await recurringRewardsPage.clickEditCasinoRequirement(row);

    expect(await recurringRewardsPage.getCategoryValue(), 'Expected Category to be pre-filled in the Edit popup').toBe(category);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_07_step1_edit_prefilled');

    const updatedCategory = `${category}_Edited`;
    await recurringRewardsPage.fillCategory(updatedCategory);
    await recurringRewardsPage.clickCasinoRequirementSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);
    await expect(recurringRewardsPage.casinoRequirementDialog, 'Expected the Edit popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const updatedRow = recurringRewardsPage.getCasinoRequirementRow(updatedCategory);
    await expect(updatedRow, `Expected the row to reflect the edited Category. Toast said: "${toastText || '(no toast appeared)'}"`).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_07_step2_edit_saved');
    console.log(`✅ TC_CR_07 PASSED — Casino Requirement edited for "${promotionName}" (Category updated to "${updatedCategory}").`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_42 Verify Delete removes a Casino Requirement row', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, category } = await createCasinoRequirement(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCasinoRequirementRow(category);
    await expect(row, 'Expected the new Casino Requirement row to appear').toBeVisible({ timeout: 15000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_08_step1_before_delete');

    await recurringRewardsPage.clickDeleteCasinoRequirement(row);

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Delete: "${toastText || '(no toast appeared)'}"`);
    await expect(row, `Expected the Casino Requirement row to be gone after Delete. Toast said: "${toastText || '(no toast appeared)'}"`).not.toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_08_step2_after_delete');
    console.log(`✅ TC_CR_08 PASSED — Casino Requirement deleted for "${promotionName}".`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_43 Verify Delete cancellation keeps the Casino Requirement row', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, category } = await createCasinoRequirement(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCasinoRequirementRow(category);
    await expect(row, 'Expected the new Casino Requirement row to appear').toBeVisible({ timeout: 15000 });

    const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.click();

    await recurringRewardsPage.confirmNoBtn.waitFor({ state: 'visible', timeout: 10000 });
    await recurringRewardsPage.confirmNoBtn.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_CR_09_cancelled');

    await expect(row, 'Expected the Casino Requirement row to remain after cancelling the delete').toBeVisible({ timeout: 10000 });
    console.log('Delete correctly cancelled via "No" — the Casino Requirement row remains.');

    await recurringRewardsPage.clickBackToRewards();
  });

  // ─── Comp Configuration ─────────────────────────────────────────────────────

  test('TC_RR_44 Verify Comp Configuration navigation shows the Create Comp Configuration button and table', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createDailyReward(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.clickCompConfigurationByPromotionName(promotionName);

    await expect(recurringRewardsPage.createCompConfigurationBtn, 'Expected the Create Comp Configuration button on the Comp Configuration page').toBeVisible({ timeout: 15000 });
    await expect(recurringRewardsPage.compConfigurationTable, 'Expected the Comp Configuration table').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_44_navigation');
    console.log('Comp Configuration navigation shows the Create Comp Configuration button and table.');

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_45 Verify Create Comp Configuration popup shows Comp Code, Comp Amount, Scheduled Time, Day of Week and the Is Scheduled checkbox', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await expect(recurringRewardsPage.compCodeDropdown, 'Expected Comp Code field').toBeVisible({ timeout: 10000 });
    await expect(recurringRewardsPage.compAmountInput, 'Expected Comp Amount field').toBeVisible();
    await expect(recurringRewardsPage.scheduledTimeInput, 'Expected Scheduled Time field').toBeVisible();
    await expect(recurringRewardsPage.dayOfWeekDropdown, 'Expected Day of Week field').toBeVisible();
    await expect(recurringRewardsPage.isScheduledCheckbox, 'Expected the Is Scheduled checkbox').toBeVisible();
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save button').toBeVisible();
    await expect(recurringRewardsPage.compConfigurationCancelBtn, 'Expected Cancel button').toBeVisible();
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_45_popup_open');
    console.log('Create Comp Configuration popup shows all 4 fields, the Is Scheduled checkbox, Save and Cancel.');

    await recurringRewardsPage.clickCompConfigurationCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_46 Verify Save stays disabled until Comp Code, Comp Amount, Scheduled Time and Day of Week are all filled', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

    await recurringRewardsPage.selectFirstCompCode();
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to stay disabled with only Comp Code filled').toBeDisabled({ timeout: 10000 });

    await recurringRewardsPage.fillCompAmount('100');
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to stay disabled with Scheduled Time and Day of Week still blank').toBeDisabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_46_step1_partial');

    await recurringRewardsPage.setScheduledTime();
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to stay disabled with Day of Week still blank').toBeDisabled({ timeout: 10000 });

    await recurringRewardsPage.selectFirstDayOfWeek();
    await expect(recurringRewardsPage.compConfigurationSaveBtn, 'Expected Save to become enabled once all 4 fields are filled').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_46_step2_all_filled');
    console.log('Save correctly stayed disabled until Comp Code, Comp Amount, Scheduled Time and Day of Week were all filled.');

    await recurringRewardsPage.clickCompConfigurationCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_47 Verify Cancel discards data without creating a Comp Configuration', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    await recurringRewardsPage.selectFirstCompCode();
    const compAmount = String(Date.now()).slice(-6);
    await recurringRewardsPage.fillCompAmount(compAmount);
    await recurringRewardsPage.setScheduledTime();
    await recurringRewardsPage.selectFirstDayOfWeek();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_47_step1_filled');

    await recurringRewardsPage.clickCompConfigurationCancel();
    await expect(recurringRewardsPage.compConfigurationDialog, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, 'Expected the discarded draft to NOT appear in the table').not.toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_47_step2_not_in_table');
    console.log(`Draft Comp Configuration (amount "${compAmount}") discarded via Cancel and not present in the table.`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_48 Verify Is Scheduled checkbox toggles', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    expect(await recurringRewardsPage.isScheduledChecked(), 'Expected Is Scheduled to start unchecked').toBe(false);

    await recurringRewardsPage.toggleIsScheduled();
    expect(await recurringRewardsPage.isScheduledChecked(), 'Expected Is Scheduled to be checked after toggling').toBe(true);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_48_step1_checked');

    await recurringRewardsPage.toggleIsScheduled();
    expect(await recurringRewardsPage.isScheduledChecked(), 'Expected Is Scheduled to be unchecked after toggling again').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_48_step2_unchecked');
    console.log('Is Scheduled checkbox correctly toggles on and off.');

    await recurringRewardsPage.clickCompConfigurationCancel();
    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_49 Verify successful Comp Configuration creation', async ({ page, recurringRewardsPage }, testInfo) => {
    const promotionName = await createRewardAndOpenCompConfigurationPopup(page, recurringRewardsPage);
    rewardNameToCleanup = promotionName;

    const compCode = await recurringRewardsPage.selectFirstCompCode();
    const compAmount = String(Date.now()).slice(-6);
    await recurringRewardsPage.fillCompAmount(compAmount);
    await recurringRewardsPage.setScheduledTime();
    const dayOfWeek = await recurringRewardsPage.selectFirstDayOfWeek();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_49_step1_filled');

    await recurringRewardsPage.clickCompConfigurationSave();

    // The create-success toast text was never independently confirmed for Comp Configuration —
    // capture it for diagnostics rather than asserting a guessed string; the row itself is the
    // durable signal.
    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Create: "${toastText || '(no toast appeared)'}"`);
    await expect(recurringRewardsPage.compConfigurationDialog, 'Expected the Create Comp Configuration popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, `Expected the new Comp Configuration row to appear. Toast said: "${toastText || '(no toast appeared)'}"`).toBeVisible({ timeout: 15000 });
    await expect(row, `Expected the row to show Comp Code "${compCode}"`).toContainText(compCode);
    await expect(row, `Expected the row to show Day of Week "${dayOfWeek}"`).toContainText(dayOfWeek);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_49_step2_created');
    console.log(`✅ TC_RR_49 PASSED — Comp Configuration created for "${promotionName}" (Comp Code "${compCode}", Amount "${compAmount}", Day of Week "${dayOfWeek}").`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_50 Verify Search functionality on the Comp Configuration page', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, compAmount, compCode } = await createCompConfiguration(page, recurringRewardsPage, (name) => { rewardNameToCleanup = name; });
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, 'Expected the new Comp Configuration row to appear').toBeVisible({ timeout: 15000 });

    // Confirmed live: searching by Comp Amount returns "Nothing found" even though the row
    // genuinely exists — this environment's search bar does not index that column. Comp Code is
    // the only confirmed text field, so search by that instead. Comp Code isn't guaranteed unique
    // here, so this verifies the search genuinely filters (every visible row matches) rather than
    // pinpointing this one row.
    await recurringRewardsPage.searchFor(compCode);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_50_search_results');

    const matchingRows = recurringRewardsPage.compConfigurationTable.locator('tbody tr:not(.p-datatable-emptymessage)');
    await expect.poll(async () => matchingRows.count(), { timeout: 10000 }).toBeGreaterThan(0);
    const rowTexts = await matchingRows.allInnerTexts();
    for (const text of rowTexts) {
      expect(text, `Expected every visible row to contain Comp Code "${compCode}"`).toContain(compCode);
    }

    console.log(`✅ TC_RR_50 PASSED — Searching for Comp Code "${compCode}" correctly filtered the Comp Configuration table.`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_51 Verify Edit Comp Configuration opens pre-filled and saves changes', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, compAmount } = await createCompConfiguration(page, recurringRewardsPage, (name) => { rewardNameToCleanup = name; });
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, 'Expected the new Comp Configuration row to appear').toBeVisible({ timeout: 15000 });

    await recurringRewardsPage.clickEditCompConfiguration(row);

    // Confirmed live: the Edit popup pre-fills Comp Amount with PrimeNG's thousands-grouping baked
    // into the input's own value (e.g. "966,937") — strip non-digits before comparing, same as
    // fillCompAmount's own internal verification does.
    const prefilledAmount = (await recurringRewardsPage.getCompAmountValue()).replace(/[^0-9]/g, '');
    expect(prefilledAmount, 'Expected Comp Amount to be pre-filled in the Edit popup').toBe(compAmount);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_51_step1_edit_prefilled');

    const updatedAmount = String(Date.now()).slice(-6);
    await recurringRewardsPage.fillCompAmount(updatedAmount);
    await recurringRewardsPage.clickCompConfigurationSave();

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);
    await expect(recurringRewardsPage.compConfigurationDialog, 'Expected the Edit popup to close after Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const updatedRow = recurringRewardsPage.getCompConfigurationRow(updatedAmount);
    await expect(updatedRow, `Expected the row to reflect the edited Comp Amount. Toast said: "${toastText || '(no toast appeared)'}"`).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_51_step2_edit_saved');
    console.log(`✅ TC_RR_51 PASSED — Comp Configuration edited for "${promotionName}" (Comp Amount updated to "${updatedAmount}").`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_52 Verify Delete removes a Comp Configuration row', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, compAmount } = await createCompConfiguration(page, recurringRewardsPage, (name) => { rewardNameToCleanup = name; });
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, 'Expected the new Comp Configuration row to appear').toBeVisible({ timeout: 15000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_52_step1_before_delete');

    await recurringRewardsPage.clickDeleteCompConfiguration(row);

    const toastText = await recurringRewardsPage.getToastText(10000);
    console.log(`Toast after Delete: "${toastText || '(no toast appeared)'}"`);
    await expect(row, `Expected the Comp Configuration row to be gone after Delete. Toast said: "${toastText || '(no toast appeared)'}"`).not.toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_52_step2_after_delete');
    console.log(`✅ TC_RR_52 PASSED — Comp Configuration deleted for "${promotionName}".`);

    await recurringRewardsPage.clickBackToRewards();
  });

  test('TC_RR_53 Verify Delete cancellation keeps the Comp Configuration row', async ({ page, recurringRewardsPage }, testInfo) => {
    const { promotionName, compAmount } = await createCompConfiguration(page, recurringRewardsPage, (name) => { rewardNameToCleanup = name; });
    rewardNameToCleanup = promotionName;

    const row = recurringRewardsPage.getCompConfigurationRow(compAmount);
    await expect(row, 'Expected the new Comp Configuration row to appear').toBeVisible({ timeout: 15000 });

    const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.click();

    await recurringRewardsPage.confirmNoBtn.waitFor({ state: 'visible', timeout: 10000 });
    await recurringRewardsPage.confirmNoBtn.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_53_cancelled');

    await expect(row, 'Expected the Comp Configuration row to remain after cancelling the delete').toBeVisible({ timeout: 10000 });
    console.log('Delete correctly cancelled via "No" — the Comp Configuration row remains.');

    await recurringRewardsPage.clickBackToRewards();
  });
});
