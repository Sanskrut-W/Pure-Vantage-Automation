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
  await sidebarPage.navigateToRecurringRewards();
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

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_RR_01 – TC_RR_02 — Page Level Tests
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Marketing - Recurring Rewards - Page Level Tests', () => {

//   test.beforeEach(async ({ page, sidebarPage, recurringRewardsPage }) => {
//     await navigateToRecurringRewards(page, sidebarPage, recurringRewardsPage);
//   });

//   test('TC_RR_01 Verify Recurring Rewards page is accessible', async ({ page, recurringRewardsPage }, testInfo) => {
//     await expect(recurringRewardsPage.createConfigurationBtn, 'Expected the Create Configuration button').toBeVisible({ timeout: 15000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_01_page_accessible');
//     console.log('Recurring Rewards page is accessible with the Create Configuration button visible.');
//   });

//   test('TC_RR_02 Verify Create Configuration button opens the popup with all 6 base fields and the checkbox', async ({ page, recurringRewardsPage }, testInfo) => {
//     await openCreatePopup(recurringRewardsPage);

//     await expect(recurringRewardsPage.promotionNameInput, 'Expected Promotion Name field').toBeVisible({ timeout: 10000 });
//     await expect(recurringRewardsPage.regionCodeDropdown, 'Expected Region Code field').toBeVisible();
//     await expect(recurringRewardsPage.startDateInput, 'Expected Start Date field').toBeVisible();
//     await expect(recurringRewardsPage.endDateInput, 'Expected End Date field').toBeVisible();
//     await expect(recurringRewardsPage.recurringFrequencyDropdown, 'Expected Recurring Frequency field').toBeVisible();
//     await expect(recurringRewardsPage.wagerAmountRequirementInput, 'Expected Wager Amount Requirement field').toBeVisible();
//     await expect(recurringRewardsPage.firstQualifyingBetOnlyCheckbox, 'Expected First Qualifying Bet Only checkbox').toBeVisible();

//     // Confirmed live: Weekly-only fields are NOT part of the initial 6 — they only render once
//     // Recurring Frequency = Weekly.
//     await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to be absent before Weekly is selected').not.toBeVisible();

//     await expect(recurringRewardsPage.saveBtn, 'Expected Save button').toBeVisible();
//     // Confirmed live: Save renders disabled the instant the popup opens.
//     await expect(recurringRewardsPage.saveBtn, 'Expected Save to start disabled').toBeDisabled();
//     await expect(recurringRewardsPage.cancelBtn, 'Expected Cancel button').toBeVisible();

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_02_popup_6_fields');
//     console.log('Create popup opened with all 6 base fields, the checkbox, and Save correctly starting disabled.');

//     await recurringRewardsPage.clickCancel();
//   });
// });

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
      // Deletes every row sharing this name, not just one — this app allows duplicate Promotion
      // Names (confirmed live), so the Clone test below can leave 2 rows behind under one name.
      await recurringRewardsPage.deleteAllRewardsByPromotionName(rewardNameToCleanup);
      rewardNameToCleanup = null;
    }
  });

//   // ─── Base fields ────────────────────────────────────────────────────────────

//   test('TC_RR_03 Verify Promotion Name field accepts input', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = `AutoRecurringReward_${Date.now()}`;
//     await recurringRewardsPage.fillPromotionName(promotionName);
//     expect(await recurringRewardsPage.getPromotionNameValue(), 'Expected Promotion Name value to be accepted').toBe(promotionName);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_03_promotion_name');
//     console.log('Promotion Name field accepts valid input.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_04 Verify Region Code dropdown offers and accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
//     const selected = await recurringRewardsPage.selectFirstRegionCode();
//     const shownValue = await recurringRewardsPage.getDropdownValue(recurringRewardsPage.regionCodeDropdown);
//     expect(shownValue, `Expected the selected Region Code "${selected}" to be shown`).toBe(selected);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_04_region_code');
//     console.log(`Region Code dropdown opened and the selected value "${selected}" is shown.`);

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_05 Verify Start Date field accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.setStartDate();
//     const startValue = await recurringRewardsPage.startDateInput.inputValue();
//     expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_05_start_date');
//     console.log(`Start Date populated as: "${startValue}".`);

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_06 Verify End Date field accepts a selection', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.setEndDate();
//     const endValue = await recurringRewardsPage.endDateInput.inputValue();
//     expect(endValue.trim().length > 0, 'Expected End Date to be selected').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_06_end_date');
//     console.log(`End Date populated as: "${endValue}".`);

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_07 Verify Recurring Frequency dropdown offers Daily and Weekly', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.selectRecurringFrequency('Daily');
//     expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.recurringFrequencyDropdown), 'Expected Daily to be selected').toBe('Daily');

//     await recurringRewardsPage.selectRecurringFrequency('Weekly');
//     expect(await recurringRewardsPage.getDropdownValue(recurringRewardsPage.recurringFrequencyDropdown), 'Expected Weekly to be selected').toBe('Weekly');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_07_recurring_frequency');
//     console.log('Recurring Frequency dropdown offers and accepts both Daily and Weekly.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_08 Verify Wager Amount Requirement field accepts numeric input', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.fillWagerAmountRequirement('25');
//     expect(await recurringRewardsPage.getWagerAmountRequirementValue(), 'Expected a plain integer to be accepted').toBe('25');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_08_wager_amount');
//     console.log('Wager Amount Requirement field accepts a plain integer.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_09 Verify Wager Amount Requirement rejects non-numeric characters', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.fillWagerAmountRequirement('12.5abc');
//     const typedValue = await recurringRewardsPage.getWagerAmountRequirementValue();
//     expect(/^\d*$/.test(typedValue), `Expected Wager Amount Requirement to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_09_wager_amount_non_numeric');
//     console.log(`Wager Amount Requirement with "12.5abc" — field value after entry: "${typedValue}".`);

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_10 Verify First Qualifying Bet Only checkbox toggles', async ({ page, recurringRewardsPage }, testInfo) => {
//     const before = await recurringRewardsPage.isFirstQualifyingBetOnlyChecked();
//     await recurringRewardsPage.toggleFirstQualifyingBetOnly();
//     const after = await recurringRewardsPage.isFirstQualifyingBetOnlyChecked();
//     expect(after, 'Expected First Qualifying Bet Only to change state').toBe(!before);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_10_first_qualifying_bet_only');
//     console.log('First Qualifying Bet Only checkbox toggles.');

//     await recurringRewardsPage.clickCancel();
//   });

//   // ─── Mandatory validation ────────────────────────────────────────────────────

//   test('TC_RR_11 Verify Save stays disabled when the popup is blank', async ({ page, recurringRewardsPage }, testInfo) => {
//     await expect(recurringRewardsPage.saveBtn, 'Expected Save to start disabled with the popup blank').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_11_save_disabled_blank');
//     console.log('Save correctly stays disabled when the popup is blank.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_12 Verify Save becomes enabled once all mandatory Daily fields are filled', async ({ page, recurringRewardsPage }, testInfo) => {
//     await fillMandatoryDailyFields(recurringRewardsPage);
//     await expect(recurringRewardsPage.saveBtn, 'Expected Save to become enabled once all mandatory Daily fields are filled').toBeEnabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_12_save_enabled_daily');
//     console.log('Save becomes enabled once Promotion Name, Region Code, Start/End Date, Recurring Frequency and Wager Amount are all filled.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_13 Verify Cancel discards data without creating a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
//     const draftName = await fillMandatoryDailyFields(recurringRewardsPage);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_13_step1_draft_filled');

//     await recurringRewardsPage.clickCancel();
//     await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

//     const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(draftName, 5000);
//     expect(isPresent, 'Expected the discarded draft to NOT appear in the table').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_13_step2_not_in_table');
//     console.log(`Draft "${draftName}" discarded via Cancel and not present in the table.`);
//   });

//   // ─── Weekly-only fields ──────────────────────────────────────────────────────

//   test('TC_RR_14 Verify selecting Weekly reveals Weekly Expiry Day and Weekly Expiry Time', async ({ page, recurringRewardsPage }, testInfo) => {
//     await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to be absent before Weekly is selected').not.toBeVisible();

//     await recurringRewardsPage.selectRecurringFrequency('Weekly');

//     await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to appear after Weekly is selected').toBeVisible({ timeout: 10000 });
//     await expect(recurringRewardsPage.weeklyExpiryTimeInput, 'Expected Weekly Expiry Time to appear after Weekly is selected').toBeVisible();

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_14_weekly_reveals_fields');
//     console.log('Selecting Weekly revealed Weekly Expiry Day and Weekly Expiry Time.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_15 Verify switching back to Daily hides the Weekly-only fields again', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.selectRecurringFrequency('Weekly');
//     await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to appear after Weekly is selected').toBeVisible({ timeout: 10000 });

//     await recurringRewardsPage.selectRecurringFrequency('Daily');
//     await expect(recurringRewardsPage.weeklyExpiryDayDropdown, 'Expected Weekly Expiry Day to disappear after switching back to Daily').not.toBeVisible({ timeout: 10000 });
//     await expect(recurringRewardsPage.weeklyExpiryTimeInput, 'Expected Weekly Expiry Time to disappear after switching back to Daily').not.toBeVisible();

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_15_daily_hides_weekly_fields');
//     console.log('Switching back to Daily correctly hid Weekly Expiry Day and Weekly Expiry Time.');

//     await recurringRewardsPage.clickCancel();
//   });

//   test('TC_RR_16 Verify Save requires Weekly Expiry Day and Time when Weekly is selected', async ({ page, recurringRewardsPage }, testInfo) => {
//     await recurringRewardsPage.fillPromotionName(`AutoRecurringReward_${Date.now()}`);
//     await recurringRewardsPage.selectFirstRegionCode();
//     await recurringRewardsPage.setStartDate();
//     await recurringRewardsPage.setEndDate();
//     await recurringRewardsPage.selectRecurringFrequency('Weekly');
//     await recurringRewardsPage.fillWagerAmountRequirement('10');

//     // Every other mandatory field is now filled, but Weekly Expiry Day/Time are still blank.
//     await expect(recurringRewardsPage.saveBtn, 'Expected Save to stay disabled while Weekly Expiry Day/Time are blank').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_16_step1_weekly_fields_blank');

//     await recurringRewardsPage.selectFirstWeeklyExpiryDay();
//     await recurringRewardsPage.setWeeklyExpiryTime();
//     await expect(recurringRewardsPage.saveBtn, 'Expected Save to enable once Weekly Expiry Day/Time are also filled').toBeEnabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_16_step2_weekly_fields_filled');
//     console.log('Save correctly required Weekly Expiry Day and Time once Weekly was selected.');

//     await recurringRewardsPage.clickCancel();
//   });

//   // ─── Save / toast ────────────────────────────────────────────────────────────

//   test('TC_RR_17 Verify successful Recurring Reward creation with Daily frequency', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await fillMandatoryDailyFields(recurringRewardsPage);
//     // Set BEFORE clicking Save so afterEach still attempts cleanup even if Save itself, or an
//     // assertion right after it, is what fails.
//     rewardNameToCleanup = promotionName;

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_17_step1_filled');

//     await recurringRewardsPage.clickSave();

//     const toastText = await recurringRewardsPage.getToastText(10000);
//     console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

//     await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
//     await page.waitForLoadState('networkidle').catch(() => {});

//     const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
//     expect(isPresent, `Expected the new Recurring Reward "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_17_step2_created');
//     console.log(`✅ TC_RR_17 PASSED — Daily Reward "${promotionName}" created and verified in table.`);
//   });

//   test('TC_RR_18 Verify successful Recurring Reward creation with Weekly frequency', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await fillMandatoryWeeklyFields(recurringRewardsPage);
//     rewardNameToCleanup = promotionName;

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_18_step1_filled');

//     await recurringRewardsPage.clickSave();

//     const toastText = await recurringRewardsPage.getToastText(10000);
//     console.log(`Toast after Save: "${toastText || '(no toast appeared)'}"`);

//     await expect(recurringRewardsPage.promotionNameInput, 'Expected the popup to close after a successful Save').not.toBeVisible({ timeout: 15000 });
//     await page.waitForLoadState('networkidle').catch(() => {});

//     const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
//     expect(isPresent, `Expected the new Recurring Reward "${promotionName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_18_step2_created');
//     console.log(`✅ TC_RR_18 PASSED — Weekly Reward "${promotionName}" created and verified in table.`);
//   });

//   // ─── Search / Region filter / Delete ────────────────────────────────────────

//   test('TC_RR_19 Verify Search functionality for a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await createDailyReward(page, recurringRewardsPage);
//     rewardNameToCleanup = promotionName;

//     await recurringRewardsPage.searchFor(promotionName);

//     const isPresent = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
//     expect(isPresent, `Expected searching for "${promotionName}" to show it in the table`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_19_search_success');
//     console.log(`✅ TC_RR_19 PASSED — Searching for "${promotionName}" correctly surfaced it in the table.`);
//   });

//   // UNCONFIRMED locator — see the file-level comment. Skips gracefully (rather than failing) if
//   // the best-effort region filter dropdown can't be found, since no confirmed outerHTML exists
//   // for it yet.
//   test('TC_RR_20 Verify Region filter functionality', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await createDailyReward(page, recurringRewardsPage);
//     rewardNameToCleanup = promotionName;

//     const selectedRegion = await recurringRewardsPage.selectFirstRegionFilterOption();
//     test.skip(selectedRegion === null, 'Region filter control could not be located with the best-effort selector — its real outerHTML is needed to write this test properly.');

//     await page.waitForLoadState('networkidle').catch(() => {});
//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_20_region_filter_applied');
//     console.log(`Region filter applied with value "${selectedRegion}" — verify manually whether the table correctly filtered to that region.`);
//   });

//   test('TC_RR_21 Verify Delete functionality for a Recurring Reward', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await createDailyReward(page, recurringRewardsPage);
//     // Set immediately — if deleteRewardIfPresent below fails partway, the afterEach above makes a
//     // second attempt as a safety net; if it already succeeded, that second attempt is a harmless
//     // no-op (deleteRewardIfPresent itself tolerates the row already being gone).
//     rewardNameToCleanup = promotionName;

//     const isPresentBeforeDelete = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 15000);
//     expect(isPresentBeforeDelete, `Expected "${promotionName}" to exist in the table before attempting to delete it`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_21_step1_before_delete');

//     await recurringRewardsPage.deleteRewardIfPresent(promotionName);

//     const isPresentAfterDelete = await recurringRewardsPage.isRowVisibleByPromotionName(promotionName, 10000);
//     expect(isPresentAfterDelete, `Expected "${promotionName}" to be removed from the table after Delete`).toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_21_step2_after_delete');
//     console.log(`✅ TC_RR_21 PASSED — Reward "${promotionName}" was successfully deleted.`);
//   });

//   // ─── Edit / Clone ────────────────────────────────────────────────────────────

//   test('TC_RR_22 Verify Edit updates a Recurring Reward and the change persists', async ({ page, recurringRewardsPage }, testInfo) => {
//     const promotionName = await createDailyReward(page, recurringRewardsPage);
//     rewardNameToCleanup = promotionName;

//     await recurringRewardsPage.clickEditByPromotionName(promotionName);

//     const editedName = `${promotionName}_Edited`;
//     await recurringRewardsPage.fillPromotionName(editedName);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step1_edited');

//     await recurringRewardsPage.clickSave();

//     const toastText = await recurringRewardsPage.getToastText(10000);
//     console.log(`Toast after Edit Save: "${toastText || '(no toast appeared)'}"`);
//     expect(toastText.length > 0, 'Expected a toast confirming the Edit was saved').toBe(true);

//     await expect(recurringRewardsPage.promotionNameInput, 'Expected the Edit popup to close after Save').not.toBeVisible({ timeout: 15000 });
//     await page.waitForLoadState('networkidle').catch(() => {});

//     // Track the RENAMED reward for cleanup from here on — the original name no longer exists.
//     rewardNameToCleanup = editedName;

//     const isPresentAfterEdit = await recurringRewardsPage.isRowVisibleByPromotionName(editedName, 15000);
//     expect(isPresentAfterEdit, `Expected the renamed Reward "${editedName}" to appear in the table. Toast said: "${toastText || '(no toast appeared)'}"`).toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step2_renamed_in_table');

//     // Re-open Edit on the renamed reward and confirm the change actually persisted server-side,
//     // not just reflected optimistically in the table.
//     await recurringRewardsPage.clickEditByPromotionName(editedName);
//     const reopenedValue = await recurringRewardsPage.getPromotionNameValue();
//     expect(reopenedValue, 'Expected re-opening Edit to show the persisted (renamed) Promotion Name').toBe(editedName);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_RR_22_step3_reopened_edit');
//     console.log(`✅ TC_RR_22 PASSED — Reward renamed to "${editedName}" and the change persisted after reopening Edit.`);

//     await recurringRewardsPage.clickCancel();
//   });

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
});
