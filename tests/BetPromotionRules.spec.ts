// npx playwright test tests/BetPromotionRules.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// BET PROMOTION RULES — new feature, built from the user's functional description plus outerHTML
// confirmed live for: the sidebar nodes ("Workflow Management" -> "Bet Promotion Rules"), the
// "Create Bet Promotion Rule" button, the popup's 6 base fields (Promotion Name, Promotion Type,
// Start Date, End Date, Feed, Minimum Amount) and its 4 Feed-dependent fields (Sport, League,
// Event, Market), and the Save/Cancel buttons.
//
// Flagged assumptions (code comments repeat these at point of use too):
//  - "Outcome": the functional description references an Outcome field 3 times (clearing-cascade
//    examples + "Selecting Market should enable the Outcome field"), but explicitly lists only 4
//    fields that appear after Feed, and the captured outerHTML of the popup after Feed is selected
//    shows exactly Sport/League/Event/Market with NO Outcome element anywhere in it. Treated as NOT
//    present on this popup — no locator or test references it. If it does exist, outerHTML of the
//    popup after Market is selected would be needed to add it correctly.
//  - What enables League and what enables Event were never explicitly stated (only "Event enables
//    Market" and "Market enables Outcome" were) — inferred by analogy to the confirmed Event->Market
//    link and to this app's own near-identical Sport Condition popup (Rules Engine), which chains
//    Feed Name -> Sport -> League -> ... -> Market the same left-to-right way. Flagged at point of
//    use; would need outerHTML of the intermediate states to confirm independently.
//  - The list page itself (table columns, row actions, search) was never captured — only the
//    Create button was. Row-level Edit/Delete/kebab-menu behavior is ASSUMED to follow this app's
//    own universal convention (a `.pure__table` wrapper, `button:has(.pi-ellipsis-v)` kebab menu,
//    "Delete" + "Yes" confirmation) seen on every other "Create X" list in this app (Timed
//    Promotions, Coupon Management, Leaderboard, etc.) — used ONLY for best-effort afterEach
//    cleanup of a real created Promotion, wrapped so a wrong guess here never fails the test itself.
//  - The popup's title/aria-label was never captured (only its field markup) — scoped generically
//    via `div[role="dialog"]` instead of a name-scoped one, since only one such popup is ever open
//    at a time (same simpler convention used by CashbackPage/TimedPromotionsPage rather than Rules
//    Engine's extra name-scoping, which that feature only needed to dodge a confirmed duplicate-id
//    bug this feature hasn't been shown to have).
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToBetPromotionRules(page: any, sidebarPage: any, betPromotionRulesPage: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();
  await sidebarPage.navigateToBetPromotionRules();
  await betPromotionRulesPage.createBtn.waitFor({ state: 'visible', timeout: 60000 });
}

async function openCreatePopup(betPromotionRulesPage: any) {
  await betPromotionRulesPage.clickCreateBetPromotionRule();
}

/** Fills the 4 mandatory (*) base fields only — Promotion Name, Promotion Type, Start Date, End
 * Date. Does NOT touch Feed/Sport/etc, since those aren't marked mandatory in the popup. Returns
 * the Promotion Name used. */
async function fillMandatoryBaseFields(betPromotionRulesPage: any): Promise<string> {
  const promotionName = `AutoBetPromoRule_${Date.now()}`;
  await betPromotionRulesPage.fillPromotionName(promotionName);
  await betPromotionRulesPage.selectFirstPromotionType();
  await betPromotionRulesPage.setStartDate();
  await betPromotionRulesPage.setEndDate();
  return promotionName;
}

/** Fills every field on the popup, including the full Feed -> Sport -> League -> Event -> Market
 * chain, so a Save attempt has the best chance of succeeding regardless of which of the unmarked
 * fields (Feed, Minimum Amount) turn out to also be required server-side. Returns the Promotion
 * Name used. */
async function fillAllFields(page: any, betPromotionRulesPage: any): Promise<string> {
  const promotionName = await fillMandatoryBaseFields(betPromotionRulesPage);
  await betPromotionRulesPage.fillMinimumAmount('10');
  await betPromotionRulesPage.selectFirstFeed();
  await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
  await betPromotionRulesPage.selectFirstSport();
  await page.waitForTimeout(500);
  if (!(await betPromotionRulesPage.isLeagueDropdownDisabled())) {
    await betPromotionRulesPage.selectFirstLeague();
    await page.waitForTimeout(500);
  }
  if (!(await betPromotionRulesPage.isEventDropdownDisabled())) {
    await betPromotionRulesPage.selectFirstEvent();
    await page.waitForTimeout(500);
  }
  if (!(await betPromotionRulesPage.isMarketDropdownDisabled())) {
    await betPromotionRulesPage.selectFirstMarket();
    await page.waitForTimeout(500);
  }
  return promotionName;
}

/** Fills every field and clicks Save, waiting for the popup to close. Returns the Promotion Name
 * used. Assumes the Create popup is already open (per this describe block's own beforeEach). */
async function createRule(page: any, betPromotionRulesPage: any): Promise<string> {
  const promotionName = await fillAllFields(page, betPromotionRulesPage);
  await betPromotionRulesPage.clickSave();
  await betPromotionRulesPage.promotionNameInput.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  return promotionName;
}

// Deletion itself (search bar -> row's Delete action -> ConfirmDialog Yes) lives on
// BetPromotionRulesPage.deleteRuleIfPresent, built from the user's confirmed outerHTML for the
// search input and the Yes/No ConfirmDialog. The row's own Delete action markup was never
// captured — that one method tries this app's two known conventions (a direct "Delete" button,
// falling back to a kebab "..." menu) and swallows any error so a wrong guess there never fails
// whichever test calls it.

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_BPR_01 – TC_BPR_02 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Workflow Management - Bet Promotion Rules - Page Level Tests', () => {

  test.beforeEach(async ({ page, sidebarPage, betPromotionRulesPage }) => {
    await navigateToBetPromotionRules(page, sidebarPage, betPromotionRulesPage);
  });

  test('TC_BPR_01 Verify Bet Promotion Rules page is accessible', async ({ page, betPromotionRulesPage }, testInfo) => {
    await expect(betPromotionRulesPage.createBtn, 'Expected the Create Bet Promotion Rule button').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_01_page_accessible');
    console.log('Bet Promotion Rules page is accessible with the Create button visible.');
  });

  test('TC_BPR_02 Verify Create Bet Promotion Rule button opens the popup with all 6 base fields', async ({ page, betPromotionRulesPage }, testInfo) => {
    await openCreatePopup(betPromotionRulesPage);

    await expect(betPromotionRulesPage.promotionNameInput, 'Expected Promotion Name field').toBeVisible({ timeout: 10000 });
    await expect(betPromotionRulesPage.promotionTypeDropdown, 'Expected Promotion Type field').toBeVisible();
    await expect(betPromotionRulesPage.startDateInput, 'Expected Start Date field').toBeVisible();
    await expect(betPromotionRulesPage.endDateInput, 'Expected End Date field').toBeVisible();
    await expect(betPromotionRulesPage.feedDropdown, 'Expected Feed field').toBeVisible();
    await expect(betPromotionRulesPage.minimumAmountInput, 'Expected Minimum Amount field').toBeVisible();

    // Confirmed live: Sport/League/Event/Market are NOT part of the initial 6 — they only render
    // after Feed has a value.
    await expect(betPromotionRulesPage.sportDropdown, 'Expected Sport to be absent before Feed is selected').not.toBeVisible();

    await expect(betPromotionRulesPage.saveBtn, 'Expected Save button').toBeVisible();
    await expect(betPromotionRulesPage.cancelBtn, 'Expected Cancel button').toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_02_popup_6_fields');
    console.log('Create popup opened with all 6 base fields; Sport (Feed-dependent) correctly absent.');

    await betPromotionRulesPage.clickCancel();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_BPR_03 – TC_BPR_21 — Create Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Workflow Management - Bet Promotion Rules - Create Popup Tests', () => {
  // Compulsory cleanup: only TC_BPR_22 actually persists a Rule via Save, but tracking it through
  // a shared variable + a real afterEach (rather than an inline try/finally in that one test)
  // guarantees deletion runs whether the test passes or fails, and covers any future test added
  // to this block that also calls Save.
  let promotionNameToCleanup: string | null = null;

  test.beforeEach(async ({ page, sidebarPage, betPromotionRulesPage }) => {
    promotionNameToCleanup = null;
    await navigateToBetPromotionRules(page, sidebarPage, betPromotionRulesPage);
    await openCreatePopup(betPromotionRulesPage);
  });

  test.afterEach(async ({ betPromotionRulesPage }) => {
    if (promotionNameToCleanup) {
      await betPromotionRulesPage.deleteRuleIfPresent(promotionNameToCleanup);
      promotionNameToCleanup = null;
    }
  });

  // ─── Base fields ────────────────────────────────────────────────────────────

  test('TC_BPR_03 Verify Promotion Name field accepts input', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = `AutoBetPromoRule_${Date.now()}`;
    await betPromotionRulesPage.fillPromotionName(promotionName);
    expect(await betPromotionRulesPage.getPromotionNameValue(), 'Expected Promotion Name value to be accepted').toBe(promotionName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_03_promotion_name');
    console.log('Promotion Name field accepts valid input.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_04 Verify Promotion Type dropdown offers and accepts a selection', async ({ page, betPromotionRulesPage }, testInfo) => {
    const selected = await betPromotionRulesPage.selectFirstPromotionType();
    const shownValue = await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.promotionTypeDropdown);
    expect(shownValue, `Expected the selected Promotion Type "${selected}" to be shown`).toBe(selected);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_04_promotion_type');
    console.log(`Promotion Type dropdown opened and the selected value "${selected}" is shown.`);

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_05 Verify Start Date field accepts a selection', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.setStartDate();
    const startValue = await betPromotionRulesPage.startDateInput.inputValue();
    expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_05_start_date');
    console.log(`Start Date populated as: "${startValue}".`);

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_06 Verify End Date field accepts a selection', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.setEndDate();
    const endValue = await betPromotionRulesPage.endDateInput.inputValue();
    expect(endValue.trim().length > 0, 'Expected End Date to be selected').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_06_end_date');
    console.log(`End Date populated as: "${endValue}".`);

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_07 Verify Feed dropdown offers and accepts a selection', async ({ page, betPromotionRulesPage }, testInfo) => {
    const selected = await betPromotionRulesPage.selectFirstFeed();
    const shownValue = await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.feedDropdown);
    expect(shownValue, `Expected the selected Feed "${selected}" to be shown`).toBe(selected);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_07_feed_dropdown');
    console.log(`Feed dropdown opened and the selected value "${selected}" is shown.`);

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_08 Verify Minimum Amount field accepts numeric input', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.fillMinimumAmount('25');
    expect(await betPromotionRulesPage.getMinimumAmountValue(), 'Expected a plain integer to be accepted').toBe('25');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_08_minimum_amount');
    console.log('Minimum Amount field accepts a plain integer.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_09 Verify Minimum Amount rejects non-numeric characters', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.fillMinimumAmount('12.5abc');
    const typedValue = await betPromotionRulesPage.getMinimumAmountValue();
    expect(/^\d*$/.test(typedValue), `Expected Minimum Amount to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_09_minimum_amount_non_numeric');
    console.log(`Minimum Amount with "12.5abc" — field value after entry: "${typedValue}".`);

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_10 Verify mandatory field validation when Promotion Name/Type/Start Date/End Date are blank', async ({ page, betPromotionRulesPage }, testInfo) => {
    // Tolerant: mandatory-field enforcement could be inline errors after Save, OR Save itself
    // staying disabled until all fields are filled — not confirmed live which.
    const saveWasClickable = await betPromotionRulesPage.saveBtn.isEnabled().catch(() => false);
    if (saveWasClickable) {
      await betPromotionRulesPage.clickSave();
      await page.waitForTimeout(500);
    }
    const hasErrors = await betPromotionRulesPage.hasValidationErrors();
    expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced when the popup is blank').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_10_mandatory_validation');
    console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

    await betPromotionRulesPage.clickCancel().catch(() => {});
  });

  test('TC_BPR_11 Verify Cancel discards data without creating a Bet Promotion Rule', async ({ page, betPromotionRulesPage }, testInfo) => {
    const draftName = await fillMandatoryBaseFields(betPromotionRulesPage);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_11_step1_draft_filled');

    await betPromotionRulesPage.clickCancel();
    await expect(betPromotionRulesPage.promotionNameInput, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    const isPresent = await betPromotionRulesPage.isRowVisibleByPromotionName(draftName, 5000);
    expect(isPresent, 'Expected the discarded draft to NOT appear in the table').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_11_step2_not_in_table');
    console.log(`Draft "${draftName}" discarded via Cancel and not present in the table.`);
  });

  // ─── Feed reveals Sport/League/Event/Market ─────────────────────────────────

  test('TC_BPR_12 Verify selecting Feed reveals Sport, League, Event and Market fields', async ({ page, betPromotionRulesPage }, testInfo) => {
    await expect(betPromotionRulesPage.sportDropdown, 'Expected Sport to be absent before Feed is selected').not.toBeVisible();

    await betPromotionRulesPage.selectFirstFeed();

    await expect(betPromotionRulesPage.sportDropdown, 'Expected Sport to appear after Feed is selected').toBeVisible({ timeout: 10000 });
    await expect(betPromotionRulesPage.leagueDropdown, 'Expected League to appear after Feed is selected').toBeVisible();
    await expect(betPromotionRulesPage.eventDropdown, 'Expected Event to appear after Feed is selected').toBeVisible();
    await expect(betPromotionRulesPage.marketDropdown, 'Expected Market to appear after Feed is selected').toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_12_feed_reveals_fields');
    console.log('Selecting Feed revealed Sport, League, Event and Market.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_13 Verify Sport is enabled immediately after Feed is selected', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });

    expect(await betPromotionRulesPage.isSportDropdownDisabled(), 'Expected Sport to be enabled as soon as Feed has a value').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_13_sport_enabled');
    console.log('Sport is enabled immediately once Feed is selected.');

    await betPromotionRulesPage.clickCancel();
  });

  // Confirmed live (outerHTML): League/Event/Market all render disabled the instant Feed is
  // selected, before Sport itself has a value.
  test('TC_BPR_14 Verify League, Event and Market are disabled before Sport is selected', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });

    expect(await betPromotionRulesPage.isLeagueDropdownDisabled(), 'Expected League to be disabled before Sport is selected').toBe(true);
    expect(await betPromotionRulesPage.isEventDropdownDisabled(), 'Expected Event to be disabled before Sport is selected').toBe(true);
    expect(await betPromotionRulesPage.isMarketDropdownDisabled(), 'Expected Market to be disabled before Sport is selected').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_14_league_event_market_disabled');
    console.log('League, Event and Market are all disabled before Sport is selected.');

    await betPromotionRulesPage.clickCancel();
  });

  // NOT explicitly stated by the user (only Event->Market was) — inferred by analogy to the
  // confirmed Event->Market link and this app's own Rules Engine Sport Condition popup, which
  // chains its equivalent fields the same left-to-right way. Flag for re-verification if this
  // doesn't hold.
  test('TC_BPR_15 Verify selecting Sport enables League', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });

    await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.isLeagueDropdownDisabled(), 'Expected League to become enabled once Sport is selected').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_15_sport_enables_league');
    console.log('Selecting Sport enabled League.');

    await betPromotionRulesPage.clickCancel();
  });

  // Same inference caveat as TC_BPR_15 above, one link further down the chain.
  test('TC_BPR_16 Verify selecting League enables Event', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);

    const leagueDisabledBefore = await betPromotionRulesPage.isLeagueDropdownDisabled();
    test.skip(leagueDisabledBefore, 'League never became enabled after selecting Sport (see TC_BPR_15) — skipping, nothing to select.');

    await betPromotionRulesPage.selectFirstLeague();
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.isEventDropdownDisabled(), 'Expected Event to become enabled once League is selected').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_16_league_enables_event');
    console.log('Selecting League enabled Event.');

    await betPromotionRulesPage.clickCancel();
  });

  // Explicitly stated by the user: "Selecting Event should enable the Market field." /
  // "Market should remain disabled until an Event has been selected."
  test('TC_BPR_17 Verify selecting Event enables Market', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);

    if (!(await betPromotionRulesPage.isLeagueDropdownDisabled())) {
      await betPromotionRulesPage.selectFirstLeague();
      await page.waitForTimeout(500);
    }

    const marketDisabledBeforeEvent = await betPromotionRulesPage.isMarketDropdownDisabled();
    expect(marketDisabledBeforeEvent, 'Expected Market to be disabled before Event is selected').toBe(true);

    const eventDisabled = await betPromotionRulesPage.isEventDropdownDisabled();
    test.skip(eventDisabled, 'Event never became enabled (see TC_BPR_16) — skipping, nothing to select.');

    await betPromotionRulesPage.selectFirstEvent();
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.isMarketDropdownDisabled(), 'Expected Market to become enabled once Event is selected').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_17_event_enables_market');
    console.log('Selecting Event enabled Market — matches the explicitly stated rule.');

    await betPromotionRulesPage.clickCancel();
  });

  // ─── Cascading clear logic (all 4 explicitly stated by the user) ────────────

  test('TC_BPR_18 Verify changing Feed clears Sport, League, Event and Market', async ({ page, betPromotionRulesPage }, testInfo) => {
    const firstFeed = await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    const sportSelected = await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.sportDropdown), 'Expected Sport to hold its selection before Feed is changed').toBe(sportSelected);

    const newFeed = await betPromotionRulesPage.selectOptionOtherThan(betPromotionRulesPage.feedDropdown, firstFeed);
    test.skip(newFeed === null, 'Only one Feed option exists in this environment — nothing to change to.');
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.sportDropdown), 'Expected Sport to be cleared when Feed changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.leagueDropdown), 'Expected League to be cleared when Feed changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.eventDropdown), 'Expected Event to be cleared when Feed changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.marketDropdown), 'Expected Market to be cleared when Feed changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_18_feed_change_clears_all');
    console.log('Changing Feed correctly cleared Sport, League, Event and Market.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_19 Verify changing Sport clears League, Event and Market', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    const firstSport = await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);

    if (!(await betPromotionRulesPage.isLeagueDropdownDisabled())) {
      await betPromotionRulesPage.selectFirstLeague();
      await page.waitForTimeout(500);
    }
    const leagueHadValue = (await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.leagueDropdown)) !== '';
    test.skip(!leagueHadValue, 'League never got a value to begin with (see TC_BPR_15) — nothing to verify gets cleared.');

    const newSport = await betPromotionRulesPage.selectOptionOtherThan(betPromotionRulesPage.sportDropdown, firstSport);
    test.skip(newSport === null, 'Only one Sport option exists in this environment — nothing to change to.');
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.leagueDropdown), 'Expected League to be cleared when Sport changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.eventDropdown), 'Expected Event to be cleared when Sport changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.marketDropdown), 'Expected Market to be cleared when Sport changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_19_sport_change_clears_dependents');
    console.log('Changing Sport correctly cleared League, Event and Market.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_20 Verify changing League clears Event and Market', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);

    const leagueDisabled = await betPromotionRulesPage.isLeagueDropdownDisabled();
    test.skip(leagueDisabled, 'League never became enabled (see TC_BPR_15) — nothing to select.');
    const firstLeague = await betPromotionRulesPage.selectFirstLeague();
    await page.waitForTimeout(500);

    if (!(await betPromotionRulesPage.isEventDropdownDisabled())) {
      await betPromotionRulesPage.selectFirstEvent();
      await page.waitForTimeout(500);
    }
    const eventHadValue = (await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.eventDropdown)) !== '';
    test.skip(!eventHadValue, 'Event never got a value to begin with — nothing to verify gets cleared.');

    const newLeague = await betPromotionRulesPage.selectOptionOtherThan(betPromotionRulesPage.leagueDropdown, firstLeague);
    test.skip(newLeague === null, 'Only one League option exists in this environment — nothing to change to.');
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.eventDropdown), 'Expected Event to be cleared when League changes').toBe('');
    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.marketDropdown), 'Expected Market to be cleared when League changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_20_league_change_clears_dependents');
    console.log('Changing League correctly cleared Event and Market.');

    await betPromotionRulesPage.clickCancel();
  });

  test('TC_BPR_21 Verify changing Event clears Market', async ({ page, betPromotionRulesPage }, testInfo) => {
    await betPromotionRulesPage.selectFirstFeed();
    await betPromotionRulesPage.sportDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await betPromotionRulesPage.selectFirstSport();
    await page.waitForTimeout(500);
    if (!(await betPromotionRulesPage.isLeagueDropdownDisabled())) {
      await betPromotionRulesPage.selectFirstLeague();
      await page.waitForTimeout(500);
    }

    const eventDisabled = await betPromotionRulesPage.isEventDropdownDisabled();
    test.skip(eventDisabled, 'Event never became enabled — nothing to select.');
    const firstEvent = await betPromotionRulesPage.selectFirstEvent();
    await page.waitForTimeout(500);

    const marketDisabledAfterEvent = await betPromotionRulesPage.isMarketDropdownDisabled();
    test.skip(marketDisabledAfterEvent, 'Market never became enabled after selecting Event (contradicts the explicitly stated rule — see TC_BPR_17) — nothing to verify gets cleared.');
    await betPromotionRulesPage.selectFirstMarket();
    await page.waitForTimeout(500);

    const newEvent = await betPromotionRulesPage.selectOptionOtherThan(betPromotionRulesPage.eventDropdown, firstEvent);
    test.skip(newEvent === null, 'Only one Event option exists in this environment — nothing to change to.');
    await page.waitForTimeout(500);

    expect(await betPromotionRulesPage.getDropdownValue(betPromotionRulesPage.marketDropdown), 'Expected Market to be cleared when Event changes').toBe('');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_21_event_change_clears_market');
    console.log('Changing Event correctly cleared Market.');

    await betPromotionRulesPage.clickCancel();
  });

  // ─── Save / toast ────────────────────────────────────────────────────────────

  test('TC_BPR_22 Verify successful Bet Promotion Rule creation', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await fillAllFields(page, betPromotionRulesPage);
    // Set BEFORE clicking Save (not after) so the afterEach above still attempts cleanup even if
    // Save itself, or an assertion right after it, is what fails.
    promotionNameToCleanup = promotionName;

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_22_step1_filled');

    await betPromotionRulesPage.clickSave();

    const toastText = await betPromotionRulesPage.getToastText(10000);
    console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

    await expect(betPromotionRulesPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresent = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected the new Bet Promotion Rule "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_22_step2_created');
    console.log(`✅ TC_BPR_22 PASSED — Rule "${promotionName}" created and verified in table.`);
  });

  // ─── Search / Delete ─────────────────────────────────────────────────────────

  test('TC_BPR_23 Verify Search functionality for a Bet Promotion Rule', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await createRule(page, betPromotionRulesPage);
    // Set immediately after creation so afterEach cleans this up regardless of what the search
    // assertions below do.
    promotionNameToCleanup = promotionName;

    await betPromotionRulesPage.searchFor(promotionName);

    const isPresent = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected searching for "${promotionName}" to show it in the table`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_23_search_success');
    console.log(`✅ TC_BPR_23 PASSED — Searching for "${promotionName}" correctly surfaced it in the table.`);
  });

  test('TC_BPR_24 Verify Delete functionality for a Bet Promotion Rule', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await createRule(page, betPromotionRulesPage);
    // Set immediately after creation — if deleteRuleIfPresent below fails partway, the afterEach
    // above makes a second attempt as a safety net. If it already succeeded, that second attempt
    // is a harmless no-op (deleteRuleIfPresent itself tolerates the row already being gone).
    promotionNameToCleanup = promotionName;

    const isPresentBeforeDelete = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresentBeforeDelete, `Expected "${promotionName}" to exist in the table before attempting to delete it`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_24_step1_before_delete');

    // Per the user's own described flow: search for the rule first, then delete it.
    await betPromotionRulesPage.deleteRuleIfPresent(promotionName);

    const isPresentAfterDelete = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 10000);
    expect(isPresentAfterDelete, `Expected "${promotionName}" to be removed from the table after Delete`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_24_step2_after_delete');
    console.log(`✅ TC_BPR_24 PASSED — Rule "${promotionName}" was found via search and successfully deleted.`);
  });

  // ─── Start/End Date filter search ───────────────────────────────────────────

  // Confirmed live (user clarification): this is a RANGE filter on each Rule's OWN Start Date —
  // e.g. filter Start Date = 14 Oct, filter End Date = 16 Oct shows every Rule whose own Start
  // Date falls between 14 and 16 Oct. A rule created via createRule() always has today as its own
  // Start Date (setStartDate() picks the "today" cell), so a filter range that spans a month
  // before today to a month after today is guaranteed to include it, without needing to compute
  // today's exact day-of-month.
  test('TC_BPR_25 Verify a Start Date/End Date range that includes today shows a Bet Promotion Rule whose own Start Date is today', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await createRule(page, betPromotionRulesPage);
    promotionNameToCleanup = promotionName;

    await betPromotionRulesPage.setFilterStartDateByMonthOffset(-1); // a month before today
    await betPromotionRulesPage.setFilterEndDateByMonthOffset(1);    // a month after today

    const isPresent = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresent, `Expected a filter range spanning a month before/after today to include "${promotionName}" (own Start Date = today)`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_25_date_range_includes_today');
    console.log(`✅ TC_BPR_25 PASSED — A Start/End Date range spanning today correctly surfaced "${promotionName}".`);
  });

  test('TC_BPR_25b Verify a Start Date/End Date range that excludes today hides a Bet Promotion Rule whose own Start Date is today', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await createRule(page, betPromotionRulesPage);
    promotionNameToCleanup = promotionName;

    // Both ends of the filter range land a month from now — entirely after today, so today (the
    // rule's own Start Date) falls outside it.
    await betPromotionRulesPage.setFilterStartDateByMonthOffset(1);
    await betPromotionRulesPage.setFilterEndDateByMonthOffset(1);

    const isPresent = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 10000);
    expect(isPresent, `Expected a filter range entirely after today to EXCLUDE "${promotionName}" (own Start Date = today)`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_25b_date_range_excludes_today');
    console.log(`✅ TC_BPR_25b PASSED — A Start/End Date range entirely after today correctly hid "${promotionName}".`);
  });

  test('TC_BPR_26 Verify Reset clears the Start Date/End Date filter', async ({ page, betPromotionRulesPage }, testInfo) => {
    const promotionName = await createRule(page, betPromotionRulesPage);
    promotionNameToCleanup = promotionName;

    await betPromotionRulesPage.setFilterStartDateByMonthOffset(-1);
    await betPromotionRulesPage.setFilterEndDateByMonthOffset(1);
    await expect(betPromotionRulesPage.getRowByPromotionName(promotionName), 'Expected the rule to be visible while the date range filter includes today').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_26_step1_filtered');

    await betPromotionRulesPage.clickResetFilters();

    const startValueAfterReset = (await betPromotionRulesPage.filterStartDateInput.inputValue()).trim();
    const endValueAfterReset = (await betPromotionRulesPage.filterEndDateInput.inputValue()).trim();
    expect(startValueAfterReset, 'Expected Reset to clear the Start Date filter').toBe('');
    expect(endValueAfterReset, 'Expected Reset to clear the End Date filter').toBe('');

    const isPresentAfterReset = await betPromotionRulesPage.isRowVisibleByPromotionName(promotionName, 15000);
    expect(isPresentAfterReset, `Expected "${promotionName}" to still be visible (unfiltered) after Reset`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_BPR_26_step2_after_reset');
    console.log('✅ TC_BPR_26 PASSED — Reset cleared both date filters and the full list reappeared.');
  });
});
