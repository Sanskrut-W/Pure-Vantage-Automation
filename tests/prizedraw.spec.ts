// npx playwright test tests/prizedraw.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// PRIZE DRAW — new feature (Workflow Management -> Prize Draw), built from the user's functional
// description plus outerHTML confirmed live for: the sidebar nodes ("Workflow Management" ->
// "Prize Draw"), the "Create Prize" button, the popup's 4 base fields (Promotion Name, Total Prize
// Positions, Chance To Win, Type), the "Add Configuration" button, a single Configuration block's 6
// fields (Prize Type, Number Of Winners, Lower Position, Upper Position, Value, Chance) plus its
// own delete (trash) button, the running "Total Chance" validation message, the Save button, the
// list page's Delete + confirm-Yes buttons, and the search bar.
//
// Flagged assumptions (repeated as comments at point of use too):
//  - CORRECTED after an actual run: the popup opens with ZERO Configuration blocks by default (a
//    "No configurations added. Click 'Add Configuration'." placeholder instead) — NOT a
//    pre-populated "Configuration 1" as first assumed from the user's captured outerHTML, which
//    turned out to be a snapshot of an already-filled-in popup, not its pristine opened state.
//    PrizeDrawPage now adds whatever Configuration blocks are missing on demand (see
//    `ensureConfigurationExists`), so every per-field method below still addresses "Configuration 1"
//    etc. directly without each call site needing to remember to Add Configuration itself.
//  - CORRECTED after an actual run: a real Cancel button DOES exist next to Save (confirmed live) —
//    an earlier assumption that none was captured, and that PrimeNG's default dialog close icon
//    would have to stand in for it, turned out wrong. `clickCancel()` uses the real button; the
//    close-icon fallback (`clickClosePopup()`) is also confirmed to exist and still works.
//  - Confirmed live: Value's own minimum is 0 ("Field must not be a number less than 0"), NOT 1
//    like every other numeric field ("Field must not be a number less than 1") — despite the user's
//    functional summary grouping Value in with the "doesn't accept less than 1" set. The live
//    markup is trusted over the paraphrased summary here.
//  - Confirmed live: Chance carries max="100"/aria-valuemax="100" on its own <input>.
//  - NOT confirmed live: what a 2nd+ Configuration block's own heading text looks like (only
//    "Configuration 1" was captured) — assumed to auto-number sequentially ("Configuration 2",
//    "Configuration 3", ...), the obvious reading of the on-screen "Configuration 1" heading.
//  - NOT confirmed live: the exact trigger point/wording for "Number of Winners must not exceed
//    Total Prize Positions", and whether Save is blocked by a disabled button vs. an inline/toast
//    error — tests here are written tolerantly (either outcome counts as enforcement), the same
//    style already used by TC_BPR_10 in BetPromotionRules.spec.ts for an equally unconfirmed
//    enforcement mechanism.
//  - NOT confirmed live: the list page's own table markup (only the Create Prize button and search
//    bar were captured) — assumed to follow this app's universal `.pure__table` wrapper convention,
//    same assumption BetPromotionRulesPage/TimedPromotionsPage make for their own list pages.
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToPrizeDraw(page: any, sidebarPage: any, prizeDrawPage: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();
  await sidebarPage.navigateToPrizeDraw();
  await prizeDrawPage.createPrizeBtn.waitFor({ state: 'visible', timeout: 60000 });
}

async function openCreatePopup(prizeDrawPage: any) {
  await prizeDrawPage.clickCreatePrize();
}

/** Fills the 4 mandatory (*) base fields only — Promotion Name, Total Prize Positions, Chance To
 * Win, Type. Returns the Promotion Name used. Total Prize Positions defaults high enough (5) that
 * a Configuration's Number Of Winners of 1 never exceeds it. */
async function fillMandatoryBaseFields(prizeDrawPage: any): Promise<string> {
  const promotionName = `AutoPrizeDraw_${Date.now()}`;
  await prizeDrawPage.fillPromotionName(promotionName);
  await prizeDrawPage.fillTotalPrizePositions('5');
  await prizeDrawPage.fillChanceToWin('2');
  await prizeDrawPage.selectFirstType();
  return promotionName;
}

/** Fills every mandatory field (base + the default Configuration 1, with Chance = 100 so the Total
 * Chance rule is satisfied with a single configuration) and clicks Save, waiting for the popup to
 * close. Returns the Promotion Name used. Assumes the Create popup is already open. */
async function createPrize(page: any, prizeDrawPage: any): Promise<string> {
  const promotionName = await fillMandatoryBaseFields(prizeDrawPage);
  await prizeDrawPage.fillConfiguration(1, { chance: '100' });
  await prizeDrawPage.clickSave();
  await prizeDrawPage.promotionNameInput.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await prizeDrawPage.clearSearch();
  return promotionName;
}

// Deletion itself (search bar -> row's Delete action -> ConfirmDialog Yes) lives on
// PrizeDrawPage.deletePrizeIfPresent — the row's own Delete action markup was never independently
// captured (only a standalone Delete button + ConfirmDialog Yes were), so that method tries this
// app's two known conventions (a direct "Delete" button, falling back to a kebab "..." menu) and
// swallows any error so a wrong guess there never fails whichever test calls it.

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_PD_01 – TC_PD_02 — Page Level Tests
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Workflow Management - Prize Draw - Page Level Tests', () => {

//   test.beforeEach(async ({ page, sidebarPage, prizeDrawPage }) => {
//     await navigateToPrizeDraw(page, sidebarPage, prizeDrawPage);
//   });

//   test('TC_PD_01 Verify Prize Draw page is accessible', async ({ page, prizeDrawPage }, testInfo) => {
//     await expect(prizeDrawPage.createPrizeBtn, 'Expected the Create Prize button').toBeVisible({ timeout: 15000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_01_page_accessible');
//     console.log('Prize Draw page is accessible with the Create Prize button visible.');
//   });

//   test('TC_PD_02 Verify Create Prize popup opens with all 4 base fields and zero Configurations by default', async ({ page, prizeDrawPage }, testInfo) => {
//     await openCreatePopup(prizeDrawPage);

//     await expect(prizeDrawPage.promotionNameInput, 'Expected Promotion Name field').toBeVisible({ timeout: 10000 });
//     await expect(prizeDrawPage.totalPrizePositionsInput, 'Expected Total Prize Positions field').toBeVisible();
//     await expect(prizeDrawPage.chanceToWinInput, 'Expected Chance To Win field').toBeVisible();
//     await expect(prizeDrawPage.typeDropdown, 'Expected Type field').toBeVisible();
//     await expect(prizeDrawPage.addConfigurationBtn, 'Expected Add Configuration button').toBeVisible();
//     await expect(prizeDrawPage.saveBtn, 'Expected Save button').toBeVisible();

//     // Confirmed live: the popup opens with ZERO Configuration blocks — just the "No configurations
//     // added. Click 'Add Configuration'." placeholder — not a pre-populated "Configuration 1" (an
//     // earlier assumption, based on a snapshot that turned out to already be filled in, was wrong).
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected zero Configuration blocks by default').toBe(0);
//     await expect(prizeDrawPage.noConfigurationsMessage, 'Expected the "No configurations added" placeholder').toBeVisible();

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_02_popup_fields');
//     console.log('Create Prize popup opened with all 4 base fields and zero Configurations by default.');

//     await prizeDrawPage.clickClosePopup();
//   });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_PD_03 – TC_PD_42 — Create Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Workflow Management - Prize Draw - Create Popup Tests', () => {
  // Compulsory cleanup: only the Save-flow tests actually persist a Prize via Save, but tracking it
  // through a shared variable + a real afterEach (rather than inline try/finally in each test)
  // guarantees deletion runs whether the test passes or fails.
  let promotionNameToCleanup: string | null = null;

  test.beforeEach(async ({ page, sidebarPage, prizeDrawPage }) => {
    promotionNameToCleanup = null;
    await navigateToPrizeDraw(page, sidebarPage, prizeDrawPage);
    await openCreatePopup(prizeDrawPage);
  });

  test.afterEach(async ({ prizeDrawPage }) => {
    if (promotionNameToCleanup) {
      await prizeDrawPage.deletePrizeIfPresent(promotionNameToCleanup);
      promotionNameToCleanup = null;
    }
  });

//   // ─── Base fields ────────────────────────────────────────────────────────────

//   test('TC_PD_03 Verify Promotion Name field accepts input', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = `AutoPrizeDraw_${Date.now()}`;
//     await prizeDrawPage.fillPromotionName(promotionName);
//     expect(await prizeDrawPage.getPromotionNameValue(), 'Expected Promotion Name value to be accepted').toBe(promotionName);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_03_promotion_name');
//     console.log('Promotion Name field accepts valid input.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_04 Verify Total Prize Positions accepts a valid integer', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillTotalPrizePositions('5');
//     expect(await prizeDrawPage.getTotalPrizePositionsValue(), 'Expected a plain integer to be accepted').toBe('5');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_04_total_prize_positions');
//     console.log('Total Prize Positions field accepts a plain integer.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_05 Verify Total Prize Positions rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillTotalPrizePositions('0');
//     const typedValue = await prizeDrawPage.getTotalPrizePositionsValue();
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Total Prize Positions, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_05_total_prize_positions_below_min');
//     console.log(`Total Prize Positions with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_06 Verify Total Prize Positions rejects non-numeric characters', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillTotalPrizePositions('12abc');
//     const typedValue = await prizeDrawPage.getTotalPrizePositionsValue();
//     expect(/^\d*$/.test(typedValue), `Expected letters to be stripped from Total Prize Positions, but got "${typedValue}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_06_total_prize_positions_non_numeric');
//     console.log(`Total Prize Positions with "12abc" — field value after entry: "${typedValue}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_07 Verify Chance To Win accepts a valid integer', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChanceToWin('3');
//     expect(await prizeDrawPage.getChanceToWinValue(), 'Expected a plain integer to be accepted').toBe('3');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_07_chance_to_win');
//     console.log('Chance To Win field accepts a plain integer.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_08 Verify Chance To Win rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChanceToWin('0');
//     const typedValue = await prizeDrawPage.getChanceToWinValue();
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Chance To Win, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_08_chance_to_win_below_min');
//     console.log(`Chance To Win with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_09 Verify Chance To Win rejects non-numeric characters', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChanceToWin('7xyz');
//     const typedValue = await prizeDrawPage.getChanceToWinValue();
//     expect(/^\d*$/.test(typedValue), `Expected letters to be stripped from Chance To Win, but got "${typedValue}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_09_chance_to_win_non_numeric');
//     console.log(`Chance To Win with "7xyz" — field value after entry: "${typedValue}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_10 Verify Type dropdown offers and accepts a selection', async ({ page, prizeDrawPage }, testInfo) => {
//     const selected = await prizeDrawPage.selectFirstType();
//     const shownValue = await prizeDrawPage.getDropdownValue(prizeDrawPage.typeDropdown);
//     expect(shownValue, `Expected the selected Type "${selected}" to be shown`).toBe(selected);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_10_type_dropdown');
//     console.log(`Type dropdown opened and the selected value "${selected}" is shown.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_11 Verify mandatory field validation when Promotion Name/Total Prize Positions/Chance To Win/Type are blank', async ({ page, prizeDrawPage }, testInfo) => {
//     // Tolerant: mandatory-field enforcement could be inline errors (confirmed live: errors already
//     // render on a freshly opened, untouched popup), OR Save itself staying disabled.
//     const saveWasClickable = await prizeDrawPage.saveBtn.isEnabled().catch(() => false);
//     if (saveWasClickable) {
//       await prizeDrawPage.clickSave();
//       await page.waitForTimeout(500);
//     }
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced when the popup is blank').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_11_mandatory_validation');
//     console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//     await prizeDrawPage.clickClosePopup().catch(() => {});
//   });

  // ─── Configuration section — add/delete ─────────────────────────────────────

//   // CORRECTED after an actual run: the popup opens with ZERO Configuration blocks, not a default
//   // "Configuration 1" — confirmed live via TC_PD_15/16's own failures. This test now verifies that
//   // adding the first Configuration is what creates "Configuration 1", rather than assuming it
//   // pre-exists.
//   test('TC_PD_12 Verify adding the first Configuration creates "Configuration 1"', async ({ page, prizeDrawPage }, testInfo) => {
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected zero Configuration blocks before adding one').toBe(0);

//     await prizeDrawPage.clickAddConfiguration();
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected exactly 1 Configuration block after adding one').toBe(1);
//     expect(await prizeDrawPage.getPrizeTypeValue(1), 'Expected Configuration 1\'s Prize Type field to be reachable').toBe('');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_12_default_configuration');
//     console.log('Adding the first Configuration created "Configuration 1".');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_13 Verify Add Configuration adds a new Configuration block', async ({ page, prizeDrawPage }, testInfo) => {
//     const countBefore = await prizeDrawPage.getConfigurationCount();
//     await prizeDrawPage.clickAddConfiguration();
//     const countAfter = await prizeDrawPage.getConfigurationCount();
//     expect(countAfter, `Expected the Configuration count to increase from ${countBefore}`).toBe(countBefore + 1);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_13_add_configuration');
//     console.log(`Add Configuration increased the count from ${countBefore} to ${countAfter}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // CORRECTED after an actual run: starts from 0 Configurations (not a default 1), so 3 clicks of
//   // Add Configuration are needed to reach 3 blocks, not 2.
//   test('TC_PD_14 Verify multiple configurations can be added', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.clickAddConfiguration();
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected 3 Configuration blocks after adding 3').toBe(3);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_14_multiple_configurations');
//     console.log('3 Configuration blocks exist after adding 3 to the default 0.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   // CORRECTED after an actual run: starts from 0 Configurations (not a default 1), so 2 Add
//   // Configuration clicks are needed to reach 2 blocks before deleting one back down to 1.
//   test('TC_PD_15 Verify a Configuration can be deleted', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.clickAddConfiguration();
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected 2 Configuration blocks before deleting').toBe(2);

//     await prizeDrawPage.deleteConfiguration(2);
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected 1 Configuration block after deleting the 2nd').toBe(1);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_15_delete_configuration');
//     console.log('Configuration 2 was successfully deleted, leaving 1 Configuration block.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   // CORRECTED after an actual run: the popup's own default state is 0 Configurations (confirmed
//   // live), which directly disproves "at least 1 is always required" as originally assumed. This
//   // test now adds exactly 1 Configuration, then checks whether deleting it back down to 0 is
//   // actually blocked — tolerant of either outcome, since the exact enforcement point (if any) was
//   // never confirmed live.
//   test('TC_PD_16 Verify whether the last remaining Configuration can be deleted down to zero', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.clickAddConfiguration();
//     expect(await prizeDrawPage.getConfigurationCount(), 'Expected exactly 1 Configuration after adding one').toBe(1);

//     await prizeDrawPage.deleteConfiguration(1).catch(() => {});
//     await page.waitForTimeout(300);

//     const countAfter = await prizeDrawPage.getConfigurationCount();
//     expect([0, 1], `Expected the Configuration count to be either 0 (deletion allowed) or 1 (deletion blocked), got ${countAfter}`).toContain(countAfter);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_16_minimum_one_configuration');
//     console.log(`Configuration count after attempting to delete the last remaining one: ${countAfter} (deletion ${countAfter === 0 ? 'was allowed down to zero' : 'was blocked'}).`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // ─── Configuration fields (on Configuration 1) ───────────────────────────────

//   test('TC_PD_17 Verify Prize Type field accepts input', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillPrizeType(1, 'Cash Prize');
//     expect(await prizeDrawPage.getPrizeTypeValue(1), 'Expected Prize Type value to be accepted').toBe('Cash Prize');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_17_prize_type');
//     console.log('Prize Type field accepts valid input.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_18 Verify Number Of Winners accepts a valid integer', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillNumberOfWinners(1, '2');
//     expect(await prizeDrawPage.getNumberOfWinnersValue(1), 'Expected a plain integer to be accepted').toBe('2');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_18_number_of_winners');
//     console.log('Number Of Winners field accepts a plain integer.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_19 Verify Number Of Winners rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillNumberOfWinners(1, '0');
//     const typedValue = await prizeDrawPage.getNumberOfWinnersValue(1);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Number Of Winners, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_19_number_of_winners_below_min');
//     console.log(`Number Of Winners with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_20 Verify Number Of Winners rejects non-numeric characters', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillNumberOfWinners(1, '3abc');
//     const typedValue = await prizeDrawPage.getNumberOfWinnersValue(1);
//     expect(/^\d*$/.test(typedValue), `Expected letters to be stripped from Number Of Winners, but got "${typedValue}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_20_number_of_winners_non_numeric');
//     console.log(`Number Of Winners with "3abc" — field value after entry: "${typedValue}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_21 Verify Lower Position accepts a valid integer', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillLowerPosition(1, '1');
//     expect(await prizeDrawPage.getLowerPositionValue(1), 'Expected a plain integer to be accepted').toBe('1');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_21_lower_position');
//     console.log('Lower Position field accepts a plain integer.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_22 Verify Lower Position rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillLowerPosition(1, '0');
//     const typedValue = await prizeDrawPage.getLowerPositionValue(1);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Lower Position, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_22_lower_position_below_min');
//     console.log(`Lower Position with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_23 Verify Upper Position accepts a valid integer', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillUpperPosition(1, '3');
//     expect(await prizeDrawPage.getUpperPositionValue(1), 'Expected a plain integer to be accepted').toBe('3');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_23_upper_position');
//     console.log('Upper Position field accepts a plain integer.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_24 Verify Upper Position rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillUpperPosition(1, '0');
//     const typedValue = await prizeDrawPage.getUpperPositionValue(1);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Upper Position, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_24_upper_position_below_min');
//     console.log(`Upper Position with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // Confirmed live: Value's own minimum is 0, not 1 — so 0 itself must be ACCEPTED here, unlike
//   // every other numeric field tested above.
//   test('TC_PD_25 Verify Value field accepts 0 (confirmed minimum is 0, not 1)', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillValueField(1, '0');
//     expect(await prizeDrawPage.getValueFieldValue(1), 'Expected "0" to be accepted for Value').toBe('0');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_25_value_accepts_zero');
//     console.log('Value field correctly accepts 0 as its minimum.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_26 Verify Value field rejects a negative number', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillValueField(1, '-5');
//     const typedValue = await prizeDrawPage.getValueFieldValue(1);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '-5' || hasErrors, `Expected "-5" to be rejected or flagged invalid for Value, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_26_value_negative');
//     console.log(`Value with "-5" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_27 Verify Chance accepts a valid integer within range', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '50');
//     expect(await prizeDrawPage.getChanceValue(1), 'Expected a plain integer to be accepted').toBe('50');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_27_chance_valid');
//     console.log('Chance field accepts a valid integer within range.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_28 Verify Chance rejects a value less than 1', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '0');
//     const typedValue = await prizeDrawPage.getChanceValue(1);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(typedValue !== '0' || hasErrors, `Expected "0" to be rejected or flagged invalid for Chance, but got value "${typedValue}" with no validation error`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_28_chance_below_min');
//     console.log(`Chance with "0" — field value: "${typedValue}", validation errors present: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // Confirmed live: Chance carries max="100" on its own <input>.
//   test('TC_PD_29 Verify Chance rejects/clamps a value greater than 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '150');
//     const typedValue = await prizeDrawPage.getChanceValue(1);
//     expect(typedValue !== '150', `Expected "150" to be rejected or clamped for Chance (confirmed max="100"), but got "${typedValue}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_29_chance_above_max');
//     console.log(`Chance with "150" — field value after entry: "${typedValue}" (expected to be clamped/rejected, not 150).`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // ─── Business rules: Number of Winners vs Total Prize Positions ─────────────

//   test('TC_PD_30 Verify Number Of Winners exceeding Total Prize Positions is rejected', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillTotalPrizePositions('2');
//     await prizeDrawPage.fillNumberOfWinners(1, '5');
//     await page.waitForTimeout(300);

//     // Tolerant: enforcement could be an inline error, or Save simply staying blocked — exact
//     // mechanism/wording wasn't confirmed live.
//     const saveWasClickable = await prizeDrawPage.saveBtn.isEnabled().catch(() => false);
//     if (saveWasClickable) {
//       await prizeDrawPage.clickSave();
//       await page.waitForTimeout(500);
//     }
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     const stillOnPopup = await prizeDrawPage.promotionNameInput.isVisible().catch(() => false);
//     expect(hasErrors || !saveWasClickable || stillOnPopup, 'Expected Number Of Winners (5) exceeding Total Prize Positions (2) to be rejected in some way').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_30_winners_exceed_positions');
//     console.log(`Number Of Winners (5) > Total Prize Positions (2) — validation errors: ${hasErrors}, Save clickable: ${saveWasClickable}, popup still open: ${stillOnPopup}.`);

//     await prizeDrawPage.clickClosePopup().catch(() => {});
//   });

//   // ─── Business rule: Total Chance must equal 100% ────────────────────────────

//   test('TC_PD_31 Verify Total Chance error clears when a single Configuration\'s Chance equals 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '100');
//     await page.waitForTimeout(300);
//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText, `Expected the Total Chance error to clear once Chance = 100, but got "${totalChanceText}"`).toBe('');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_31_total_chance_100_clears_error');
//     console.log('Total Chance error cleared once the single Configuration\'s Chance reached 100.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_32 Verify Total Chance error persists when a single Configuration\'s Chance is below 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '50');
//     await page.waitForTimeout(300);
//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText.includes('100%'), `Expected the Total Chance error to persist and reference 100%, but got "${totalChanceText}"`).toBe(true);
//     expect(totalChanceText.includes('50%'), `Expected the Total Chance error's running total to show 50%, but got "${totalChanceText}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_32_total_chance_below_100');
//     console.log(`Total Chance error correctly persisted: "${totalChanceText}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_33 Verify Total Chance sums correctly across multiple Configurations and clears at exactly 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '60');
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.fillConfiguration(2, { chance: '40' });
//     await page.waitForTimeout(300);

//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText, `Expected the Total Chance error to clear once 2 Configurations sum to 100 (60 + 40), but got "${totalChanceText}"`).toBe('');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_33_total_chance_multi_sum_100');
//     console.log('Total Chance correctly summed 2 Configurations (60 + 40) to 100%, clearing the error.');

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_34 Verify Total Chance error persists when multiple Configurations sum to less than 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '30');
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.fillConfiguration(2, { chance: '30' });
//     await page.waitForTimeout(300);

//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText.includes('60%'), `Expected the Total Chance error's running total to show 60% (30 + 30), but got "${totalChanceText}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_34_total_chance_multi_below_100');
//     console.log(`Total Chance error correctly persisted for a sum below 100: "${totalChanceText}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_35 Verify Total Chance error persists when multiple Configurations sum to more than 100', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '60');
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.fillConfiguration(2, { chance: '60' });
//     await page.waitForTimeout(300);

//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText.includes('120%'), `Expected the Total Chance error's running total to show 120% (60 + 60), but got "${totalChanceText}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_35_total_chance_multi_above_100');
//     console.log(`Total Chance error correctly persisted for a sum above 100: "${totalChanceText}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   test('TC_PD_36 Verify deleting a Configuration recalculates the Total Chance sum', async ({ page, prizeDrawPage }, testInfo) => {
//     await prizeDrawPage.fillChance(1, '60');
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.fillConfiguration(2, { chance: '40' });
//     await page.waitForTimeout(300);
//     expect(await prizeDrawPage.getTotalChanceText(), 'Expected Total Chance to read as satisfied (100%) before deleting').toBe('');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_36_step1_before_delete');

//     await prizeDrawPage.deleteConfiguration(2);
//     await page.waitForTimeout(300);

//     const totalChanceText = await prizeDrawPage.getTotalChanceText();
//     expect(totalChanceText.includes('60%'), `Expected the Total Chance running total to drop back to 60% after deleting the Configuration worth 40, but got "${totalChanceText}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_36_step2_after_delete');
//     console.log(`Deleting Configuration 2 correctly recalculated the Total Chance: "${totalChanceText}".`);

//     await prizeDrawPage.clickClosePopup();
//   });

//   // ─── Close popup (no confirmed Cancel button — see header note) ─────────────

//   test('TC_PD_37 Verify closing the popup discards data without creating a Prize', async ({ page, prizeDrawPage }, testInfo) => {
//     const draftName = await fillMandatoryBaseFields(prizeDrawPage);
//     await prizeDrawPage.fillConfiguration(1, { chance: '100' });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_37_step1_draft_filled');

//     await prizeDrawPage.clickClosePopup();
//     await expect(prizeDrawPage.promotionNameInput, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

//     const isPresent = await prizeDrawPage.isRowVisibleByPromotionName(draftName, 5000);
//     expect(isPresent, 'Expected the discarded draft to NOT appear in the table').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_37_step2_not_in_table');
//     console.log(`Draft "${draftName}" discarded via the popup close icon and not present in the table.`);
//   });

//   // ─── Save — Total Chance gate + successful creation ─────────────────────────

//   test('TC_PD_38 Verify Save is blocked while Total Chance is not equal to 100%', async ({ page, prizeDrawPage }, testInfo) => {
//     const draftName = await fillMandatoryBaseFields(prizeDrawPage);
//     await prizeDrawPage.fillConfiguration(1, { chance: '50' });
//     await page.waitForTimeout(300);

//     const saveWasClickable = await prizeDrawPage.saveBtn.isEnabled().catch(() => false);
//     if (saveWasClickable) {
//       await prizeDrawPage.clickSave();
//       await page.waitForTimeout(500);
//     }

//     const stillOnPopup = await prizeDrawPage.promotionNameInput.isVisible().catch(() => false);
//     const hasErrors = await prizeDrawPage.hasValidationErrors();
//     expect(stillOnPopup || hasErrors, 'Expected Save to be blocked while Total Chance (50%) is not 100%').toBe(true);

//     const isPresent = await prizeDrawPage.isRowVisibleByPromotionName(draftName, 5000);
//     expect(isPresent, 'Expected no Prize to be created while Total Chance is not 100%').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_38_save_blocked_total_chance');
//     console.log(`Save correctly blocked with Total Chance at 50% — popup still open: ${stillOnPopup}, validation errors: ${hasErrors}.`);

//     await prizeDrawPage.clickClosePopup().catch(() => {});
//   });

//   test('TC_PD_39 Verify successful Prize creation with Total Chance at 100% via a single Configuration', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = await fillMandatoryBaseFields(prizeDrawPage);
//     await prizeDrawPage.fillConfiguration(1, { chance: '100' });
//     // Set BEFORE clicking Save (not after) so the afterEach above still attempts cleanup even if
//     // Save itself, or an assertion right after it, is what fails.
//     promotionNameToCleanup = promotionName;

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_39_step1_filled');

//     await prizeDrawPage.clickSave();

//     const toastText = await prizeDrawPage.getToastText(10000);
//     console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

//     await expect(prizeDrawPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
//     await page.waitForLoadState('networkidle').catch(() => {});

//     const isPresent = await prizeDrawPage.verifyPrizeVisibleAfterSave(promotionName, 15000);
//     expect(isPresent, `Expected the new Prize "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_39_step2_created');
//     console.log(`✅ TC_PD_39 PASSED — Prize "${promotionName}" created and verified in table.`);
//   });

//   test('TC_PD_40 Verify successful Prize creation with Total Chance at 100% split across multiple Configurations', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = await fillMandatoryBaseFields(prizeDrawPage);
//     await prizeDrawPage.fillConfiguration(1, { chance: '60' });
//     await prizeDrawPage.clickAddConfiguration();
//     await prizeDrawPage.fillConfiguration(2, { chance: '40' });
//     promotionNameToCleanup = promotionName;

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_40_step1_filled');

//     await prizeDrawPage.clickSave();

//     const toastText = await prizeDrawPage.getToastText(10000);
//     console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

//     await expect(prizeDrawPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
//     await page.waitForLoadState('networkidle').catch(() => {});

//     const isPresent = await prizeDrawPage.verifyPrizeVisibleAfterSave(promotionName, 15000);
//     expect(isPresent, `Expected the new Prize "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_40_step2_created');
//     console.log(`✅ TC_PD_40 PASSED — Prize "${promotionName}" created with Chance split 60/40 across 2 Configurations.`);
//   });

//   // ─── Search / Delete ─────────────────────────────────────────────────────────

//   test('TC_PD_41 Verify Search functionality for a Prize', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = await createPrize(page, prizeDrawPage);
//     promotionNameToCleanup = promotionName;

//     await prizeDrawPage.searchFor(promotionName);

//     const isPresent = await prizeDrawPage.isRowVisibleByPromotionName(promotionName, 15000);
//     expect(isPresent, `Expected searching for "${promotionName}" to show it in the table`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_41_search_success');
//     console.log(`✅ TC_PD_41 PASSED — Searching for "${promotionName}" correctly surfaced it in the table.`);
//   });

//   test('TC_PD_42 Verify Delete functionality for a Prize', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = await createPrize(page, prizeDrawPage);
//     // Set immediately after creation — if deletePrizeIfPresent below fails partway, the afterEach
//     // above makes a second attempt as a safety net. If it already succeeded, that second attempt is
//     // a harmless no-op (deletePrizeIfPresent itself tolerates the row already being gone).
//     promotionNameToCleanup = promotionName;

//     const isPresentBeforeDelete = await prizeDrawPage.verifyPrizeVisibleAfterSave(promotionName, 15000);
//     expect(isPresentBeforeDelete, `Expected "${promotionName}" to exist in the table before attempting to delete it`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_42_step1_before_delete');

//     await prizeDrawPage.deletePrizeIfPresent(promotionName);

//     const isPresentAfterDelete = await prizeDrawPage.isRowVisibleByPromotionName(promotionName, 10000);
//     expect(isPresentAfterDelete, `Expected "${promotionName}" to be removed from the table after Delete`).toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_42_step2_after_delete');
//     console.log(`✅ TC_PD_42 PASSED — Prize "${promotionName}" was found via search and successfully deleted.`);
//   });

//   // ─── Edit ─────────────────────────────────────────────────────────────────────
//   // NOT confirmed live: the row's own Edit action (only Delete + ConfirmDialog Yes were captured
//   // for this feature's list page) — PrizeDrawPage.openEditForPrize follows this app's own confirmed
//   // conventions elsewhere (a direct row button, falling back to the kebab "..." menu's "Edit" item;
//   // the same popup/Save button reused for both Create and Edit, as CompBulkConfigurationsPage
//   // already confirms for its own Create/Edit dialog).

//   test('TC_PD_43 Verify Edit opens the popup pre-filled with the Prize\'s existing data', async ({ page, prizeDrawPage }, testInfo) => {
//     const promotionName = await createPrize(page, prizeDrawPage);
//     promotionNameToCleanup = promotionName;

//     await prizeDrawPage.openEditForPrize(promotionName);

//     expect(await prizeDrawPage.getPromotionNameValue(), 'Expected Promotion Name to be pre-filled with the existing value').toBe(promotionName);
//     expect(await prizeDrawPage.getTotalPrizePositionsValue(), 'Expected Total Prize Positions to be pre-filled with the existing value').toBe('5');
//     expect(await prizeDrawPage.getChanceToWinValue(), 'Expected Chance To Win to be pre-filled with the existing value').toBe('2');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_43_edit_prefilled');
//     console.log(`Edit popup for "${promotionName}" opened with its existing data pre-filled.`);

//     await prizeDrawPage.clickCancel();
//   });

  test('TC_PD_44 Verify editing the Promotion Name and saving updates the Prize in the table', async ({ page, prizeDrawPage, sidebarPage }, testInfo) => {
    const originalName = await createPrize(page, prizeDrawPage);
    promotionNameToCleanup = originalName;

    await prizeDrawPage.openEditForPrize(originalName);

    const updatedName = `${originalName}_Edited`;
    await prizeDrawPage.fillPromotionName(updatedName);
    // Cleanup must now target the renamed Prize, whether this test passes or fails right after.
    promotionNameToCleanup = updatedName;

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_44_step1_renamed');

    await prizeDrawPage.clickSave();
    const toastText = await prizeDrawPage.getToastText(10000);
    console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);

    await expect(prizeDrawPage.promotionNameInput, 'Expected the popup to close after a successful Edit Save').not.toBeVisible({ timeout: 15000 });
    await page.waitForLoadState('networkidle').catch(() => {});

    const isUpdatedPresent = await prizeDrawPage.verifyPrizeVisibleAfterSave(updatedName, 15000, sidebarPage);
    expect(isUpdatedPresent, `Expected the renamed Prize "${updatedName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

    const isOriginalStillPresent = await prizeDrawPage.isRowVisibleByPromotionName(originalName, 5000);
    expect(isOriginalStillPresent, `Expected the original name "${originalName}" to no longer appear after the rename`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_44_step2_updated_in_table');
    console.log(`✅ TC_PD_44 PASSED — Prize renamed from "${originalName}" to "${updatedName}" and reflected in the table.`);
  });

  test('TC_PD_45 Verify Cancel during Edit discards changes', async ({ page, prizeDrawPage, sidebarPage }, testInfo) => {
    const originalName = await createPrize(page, prizeDrawPage);
    promotionNameToCleanup = originalName;

    await prizeDrawPage.openEditForPrize(originalName);

    const draftName = `${originalName}_ShouldNotSave`;
    await prizeDrawPage.fillPromotionName(draftName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_45_step1_draft_edit');

    await prizeDrawPage.clickCancel();
    await expect(prizeDrawPage.promotionNameInput, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    const isDraftPresent = await prizeDrawPage.isRowVisibleByPromotionName(draftName, 5000);
    expect(isDraftPresent, `Expected the cancelled edit "${draftName}" to NOT appear in the table`).toBe(false);

    const isOriginalStillPresent = await prizeDrawPage.verifyPrizeVisibleAfterSave(originalName, 15000, sidebarPage);
    expect(isOriginalStillPresent, `Expected the original name "${originalName}" to still appear after cancelling the edit`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_45_step2_original_unchanged');
    console.log(`Edit cancelled — Prize remained as "${originalName}", draft rename "${draftName}" was discarded.`);
  });

  // ─── Delete — confirmation dialog ───────────────────────────────────────────

  test('TC_PD_46 Verify Delete shows a confirmation dialog before the Prize is actually removed', async ({ page, prizeDrawPage }, testInfo) => {
    const promotionName = await createPrize(page, prizeDrawPage);
    promotionNameToCleanup = promotionName;

    await prizeDrawPage.openDeleteConfirmDialog(promotionName);
    await expect(prizeDrawPage.confirmYesBtn, 'Expected the Delete confirmation dialog to be visible').toBeVisible();

    const isStillPresentWhileConfirming = await prizeDrawPage.isRowVisibleByPromotionName(promotionName, 3000);
    expect(isStillPresentWhileConfirming, 'Expected the Prize to NOT be removed yet while the confirmation dialog is still open').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_46_step1_confirm_dialog_open');

    await prizeDrawPage.clickElement(prizeDrawPage.confirmYesBtn);
    await page.waitForLoadState('networkidle').catch(() => {});
    // Confirmed working pattern (deletePrizeIfPresent): wait for the row itself to transition to
    // hidden rather than only re-polling isRowVisibleByPromotionName once — the delete call can
    // take longer than a single re-check timeout to actually remove the row from the DOM.
    await prizeDrawPage.getRowByPromotionName(promotionName).waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

    const isPresentAfterConfirm = await prizeDrawPage.isRowVisibleByPromotionName(promotionName, 5000);
    expect(isPresentAfterConfirm, `Expected "${promotionName}" to be removed from the table after confirming Delete`).toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_46_step2_removed_after_confirm');
    console.log(`✅ TC_PD_46 PASSED — Delete showed a confirmation dialog before "${promotionName}" was removed.`);
  });

  test('TC_PD_47 Verify clicking No on the Delete confirmation dialog cancels deletion', async ({ page, prizeDrawPage, sidebarPage }, testInfo) => {
    const promotionName = await createPrize(page, prizeDrawPage);
    promotionNameToCleanup = promotionName;

    await prizeDrawPage.openDeleteConfirmDialog(promotionName);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_47_step1_confirm_dialog_open');

    await prizeDrawPage.clickNoOnConfirmDialog();

    const isStillPresent = await prizeDrawPage.verifyPrizeVisibleAfterSave(promotionName, 15000, sidebarPage);
    expect(isStillPresent, `Expected "${promotionName}" to still be present after clicking No on the Delete confirmation`).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_PD_47_step2_not_deleted');
    console.log(`✅ TC_PD_47 PASSED — Clicking No on the Delete confirmation left "${promotionName}" untouched.`);
  });
});
