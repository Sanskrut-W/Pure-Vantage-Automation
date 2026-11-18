// npx playwright test tests/LadderPromotion.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// LADDER PROMOTIONS — new feature (Marketing -> Promotions -> Ladder Promotions), built from the
// user's functional description plus outerHTML confirmed live for: the sidebar path ("Marketing"
// -> "Promotions" -> "Ladder Promotions"), the "Create Ladder Promotion" button, the popup's 4
// fields (Description, Region, Start Date, End Date) plus a disabled "Is Premium" checkbox, the
// Save/Cancel footer buttons, the search bar, the row-level kebab ("...") menu's Delete item, and
// the delete ConfirmDialog's Yes/No buttons.
//
// Flagged assumptions (repeated as comments at point of use too):
//  - Description's 255-character max was stated as a functional fact by the user, not captured as a
//    `maxlength` attribute on the live markup — tests here check tolerantly (either the typed value
//    is capped at 255 or a validation error appears), the same tolerant style already used elsewhere
//    in this suite (e.g. TC_BPR_10 in BetPromotionRules.spec.ts) for an unconfirmed enforcement
//    mechanism.
//  - Region's real option names were never captured — tests pick whichever option renders first.
//  - Whether Description/Region/Start Date/End Date being required actually BLOCKS Save (vs. only
//    showing an inline error) was never confirmed — negative tests check tolerantly: either the
//    popup stays open (Save was blocked) or a validation error is present. Region/Start
//    Date/End Date negative tests also fill every OTHER field with a distinctive, trackable
//    Description first, so cleanup can still find and delete the row on the off chance Save
//    unexpectedly succeeds anyway. The Description-required test is the one exception — with
//    Description itself left blank there is no safe, distinctive value to search by afterward, so
//    that one only asserts the tolerant block condition and does not attempt a cleanup search
//    (searching by an empty string would match every row in the table).
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToLadderPromotions(page: any, sidebarPage: any, ladderPromotionsPage: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();
  await sidebarPage.navigateToLadderPromotions();
  await ladderPromotionsPage.createLadderPromotionBtn.waitFor({ state: 'visible', timeout: 60000 });
}

async function openCreatePopup(ladderPromotionsPage: any) {
  await ladderPromotionsPage.clickCreateLadderPromotion();
}

/** Fills all 4 fields with values guaranteed to pass (first-rendered Region option, a valid
 * Start/End Date range). Returns the Description used. */
async function fillMandatoryFields(ladderPromotionsPage: any): Promise<string> {
  const description = `AutoLadder_${Date.now()}`;
  await ladderPromotionsPage.fillDescription(description);
  await ladderPromotionsPage.selectFirstRegion();
  await ladderPromotionsPage.setDateRange();
  return description;
}

/** Fills every mandatory field and clicks Save, waiting for the popup to close. Returns the
 * Description used. Assumes the Create popup is already open.
 *
 * `onDescriptionReady`, when given, fires with the Description right after it's filled —
 * BEFORE the Save click. Callers use it to set their own cleanup-tracking variable immediately,
 * so a promotion still gets deleted in afterEach even if something after this point (the Save
 * click itself, or a later assertion) throws or hangs, instead of only tracking it once this
 * whole function has already returned successfully. */
async function createLadderPromotion(page: any, ladderPromotionsPage: any, onDescriptionReady?: (description: string) => void): Promise<string> {
  const description = await fillMandatoryFields(ladderPromotionsPage);
  onDescriptionReady?.(description);
  await ladderPromotionsPage.clickSave();
  await ladderPromotionsPage.descriptionInput.waitFor({ state: 'hidden', timeout: 15000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await ladderPromotionsPage.clearSearch();
  return description;
}

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LP_01 – TC_LP_02 — Page Level Tests
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Marketing - Ladder Promotions - Page Level Tests', () => {
//   test.beforeEach(async ({ page, sidebarPage, ladderPromotionsPage }) => {
//     await navigateToLadderPromotions(page, sidebarPage, ladderPromotionsPage);
//   });

//   test('TC_LP_01 Verify navigating to Ladder Promotions shows the Create Ladder Promotion button', async ({ page, ladderPromotionsPage }, testInfo) => {
//     await expect(ladderPromotionsPage.createLadderPromotionBtn, 'Expected the Create Ladder Promotion button to be visible').toBeVisible({ timeout: 20000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_01_page_loaded');
//     console.log('Ladder Promotions page loaded with Create Ladder Promotion button visible.');
//   });

//   test('TC_LP_02 Verify clicking Create Ladder Promotion opens the popup with all 4 fields, Save and Cancel visible', async ({ page, ladderPromotionsPage }, testInfo) => {
//     await openCreatePopup(ladderPromotionsPage);

//     await expect(ladderPromotionsPage.descriptionInput, 'Expected Description field to be visible').toBeVisible({ timeout: 20000 });
//     await expect(ladderPromotionsPage.regionDropdown, 'Expected Region dropdown to be visible').toBeVisible({ timeout: 20000 });
//     await expect(ladderPromotionsPage.startDateInput, 'Expected Start Date field to be visible').toBeVisible({ timeout: 20000 });
//     await expect(ladderPromotionsPage.endDateInput, 'Expected End Date field to be visible').toBeVisible({ timeout: 20000 });
//     await expect(ladderPromotionsPage.saveBtn, 'Expected Save button to be visible').toBeVisible({ timeout: 20000 });
//     await expect(ladderPromotionsPage.cancelBtn, 'Expected Cancel button to be visible').toBeVisible({ timeout: 20000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_02_popup_opened');
//     console.log('Create Ladder Promotion popup opened with all 4 fields, Save and Cancel visible.');

//     await ladderPromotionsPage.clickCancel();
//   });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_LP_03 – TC_LP_19 — Create Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Marketing - Ladder Promotions - Create Popup Tests', () => {
  // Compulsory cleanup: only the Save-flow tests actually persist a Ladder Promotion via Save, but
  // tracking it through a shared variable + a real afterEach (rather than inline try/finally in
  // each test) guarantees deletion runs whether the test passes or fails.
  let descriptionToCleanup: string | null = null;
  // Same idea, for tests that can end up with MORE than one real promotion to delete (e.g. Clone,
  // which can leave both the original and the clone behind) — kept separate from
  // descriptionToCleanup above rather than replacing it, so existing single-description tests
  // don't need to change.
  let descriptionsToCleanup: string[] = [];

  test.beforeEach(async ({ page, sidebarPage, ladderPromotionsPage }) => {
    descriptionToCleanup = null;
    descriptionsToCleanup = [];
    await navigateToLadderPromotions(page, sidebarPage, ladderPromotionsPage);
    await openCreatePopup(ladderPromotionsPage);
  });

  test.afterEach(async ({ ladderPromotionsPage }) => {
    if (descriptionToCleanup) {
      await ladderPromotionsPage.deleteLadderPromotionIfPresent(descriptionToCleanup);
      descriptionToCleanup = null;
    }
    for (const description of descriptionsToCleanup) {
      await ladderPromotionsPage.deleteLadderPromotionIfPresent(description);
    }
    descriptionsToCleanup = [];
  });

  // ─── Description field ──────────────────────────────────────────────────────

  // test('TC_LP_03 Verify Description field accepts valid input', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = `AutoLadder_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(description);
  //   expect(await ladderPromotionsPage.getDescriptionValue(), 'Expected Description value to be accepted').toBe(description);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_03_description');
  //   console.log('Description field accepts valid input.');

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_04 Verify Description is required', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   await ladderPromotionsPage.selectFirstRegion();
  //   await ladderPromotionsPage.setDateRange();
  //   await ladderPromotionsPage.clickSave();

  //   const stillOpen = await ladderPromotionsPage.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false);
  //   const hasErrors = await ladderPromotionsPage.hasValidationErrors();
  //   expect(stillOpen || hasErrors, 'Expected Save to be blocked or flagged invalid when Description is left empty').toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_04_description_required');
  //   console.log(`Description required check — popup still open: ${stillOpen}, validation errors present: ${hasErrors}.`);

  //   if (stillOpen) {
  //     await ladderPromotionsPage.clickCancel();
  //   }
  //   // Deliberately no cleanup-by-search here — with Description left blank there is no safe,
  //   // distinctive value to search by if Save unexpectedly succeeded anyway (see file header note).
  // });

  // test('TC_LP_05 Verify Description enforces a 255 character maximum', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const oversizedValue = 'A'.repeat(300);
  //   await ladderPromotionsPage.fillDescription(oversizedValue);

  //   // Confirmed live by the user: the max-length error only renders after attempting Save (even
  //   // though Save itself stays disabled) — the same deferred-validation-display behavior already
  //   // confirmed for every other required field in this popup (TC_LP_04/07/10). Checking
  //   // immediately after fill(), with no Save attempt, never gave the validator a chance to run.
  //   await ladderPromotionsPage.clickSave();

  //   const typedValue = await ladderPromotionsPage.getDescriptionValue();
  //   const errorText = await ladderPromotionsPage.getDescriptionErrorText();
  //   expect(typedValue.length <= 255 || errorText.length > 0, `Expected Description to be capped at 255 characters or flagged invalid after attempting Save, but got length ${typedValue.length} with no validation error ("${errorText}")`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_05_description_max_length');
  //   console.log(`Description max-length check — typed length: ${typedValue.length}, error text: "${errorText}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // ─── Region field ───────────────────────────────────────────────────────────

  // test('TC_LP_06 Verify Region dropdown opens and an option can be selected', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const selectedRegion = await ladderPromotionsPage.selectFirstRegion();
  //   expect(selectedRegion.length, 'Expected a non-empty Region option to be selected').toBeGreaterThan(0);
  //   expect(await ladderPromotionsPage.getRegionValue(), 'Expected Region dropdown to display the selected value').toBe(selectedRegion);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_06_region_selected');
  //   console.log(`Region dropdown selected option: "${selectedRegion}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_07 Verify Region is required', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = `AutoLadder_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(description);
  //   await ladderPromotionsPage.setDateRange();
  //   await ladderPromotionsPage.clickSave();

  //   const stillOpen = await ladderPromotionsPage.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false);
  //   const hasErrors = await ladderPromotionsPage.hasValidationErrors();
  //   expect(stillOpen || hasErrors, 'Expected Save to be blocked or flagged invalid when Region is not selected').toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_07_region_required');
  //   console.log(`Region required check — popup still open: ${stillOpen}, validation errors present: ${hasErrors}.`);

  //   if (stillOpen) {
  //     await ladderPromotionsPage.clickCancel();
  //   } else {
  //     // Save unexpectedly succeeded despite no Region selected — track for cleanup via the
  //     // distinctive Description that was filled in for this test.
  //     descriptionToCleanup = description;
  //   }
  // });

  // // ─── Start Date / End Date fields ───────────────────────────────────────────

  // test('TC_LP_08 Verify Start Date can be selected via the calendar panel', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.startDateInput);
  //   const startPanel = page.locator('#startDate_panel');
  //   await startPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first(), { force: true });
  //   await page.waitForTimeout(300);
  //   // The Calendar also shows a time picker, so picking a day alone doesn't close its "Choose
  //   // Date" overlay — force-click Save (per the confirmed fix) just to dismiss it so Start Date's
  //   // own input (scoped off the Create popup's dialog) resolves correctly again.
  //   await ladderPromotionsPage.dismissDatePicker();

  //   expect((await ladderPromotionsPage.getStartDateValue()).length, 'Expected Start Date to be populated after selecting a day').toBeGreaterThan(0);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_08_start_date');
  //   console.log(`Start Date field accepts a calendar selection: "${await ladderPromotionsPage.getStartDateValue()}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_09 Verify End Date can be selected via the calendar panel', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.endDateInput);
  //   const endPanel = page.locator('#endDate_panel');
  //   await endPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last(), { force: true });
  //   await page.waitForTimeout(300);
  //   // Same still-open-calendar-overlay issue as Start Date — dismiss it so End Date's own input
  //   // (scoped off the Create popup's dialog) resolves correctly again.
  //   await ladderPromotionsPage.dismissDatePicker();

  //   expect((await ladderPromotionsPage.getEndDateValue()).length, 'Expected End Date to be populated after selecting a day').toBeGreaterThan(0);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_09_end_date');
  //   console.log(`End Date field accepts a calendar selection: "${await ladderPromotionsPage.getEndDateValue()}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_10 Verify Start Date is required', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = `AutoLadder_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(description);
  //   await ladderPromotionsPage.selectFirstRegion();

  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.endDateInput);
  //   const endPanel = page.locator('#endDate_panel');
  //   await endPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last(), { force: true });
  //   await page.waitForTimeout(300);
  //   // Dismiss the still-open "Choose Date" calendar overlay before touching anything else scoped
  //   // off the Create popup's own dialog (including clickSave()'s Save button below).
  //   await ladderPromotionsPage.dismissDatePicker();

  //   await ladderPromotionsPage.clickSave();

  //   const stillOpen = await ladderPromotionsPage.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false);
  //   const hasErrors = await ladderPromotionsPage.hasValidationErrors();
  //   expect(stillOpen || hasErrors, 'Expected Save to be blocked or flagged invalid when Start Date is not selected').toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_10_start_date_required');
  //   console.log(`Start Date required check — popup still open: ${stillOpen}, validation errors present: ${hasErrors}.`);

  //   if (stillOpen) {
  //     await ladderPromotionsPage.clickCancel();
  //   } else {
  //     descriptionToCleanup = description;
  //   }
  // });

  // test('TC_LP_11 Verify End Date is required', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = `AutoLadder_${Date.now()}`;
  //   // Tracked for cleanup BEFORE the Save attempt below — per the standing rule, a promotion must
  //   // get deleted in afterEach regardless of whether this test passes, fails, or hangs partway
  //   // through, not only once this test body has already finished successfully.
  //   descriptionToCleanup = description;
  //   await ladderPromotionsPage.fillDescription(description);
  //   await ladderPromotionsPage.selectFirstRegion();

  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.startDateInput);
  //   const startPanel = page.locator('#startDate_panel');
  //   await startPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first(), { force: true });
  //   await page.waitForTimeout(300);
  //   // Dismiss the still-open "Choose Date" calendar overlay before touching anything else scoped
  //   // off the Create popup's own dialog (including clickSave()'s Save button below) — Save is
  //   // still genuinely disabled here (End Date not yet set), so this is the safe force-click path.
  //   await ladderPromotionsPage.dismissDatePicker();

  //   await ladderPromotionsPage.clickSave();

  //   const stillOpen = await ladderPromotionsPage.descriptionInput.isVisible({ timeout: 5000 }).catch(() => false);
  //   const hasErrors = await ladderPromotionsPage.hasValidationErrors();
  //   expect(stillOpen || hasErrors, 'Expected Save to be blocked or flagged invalid when End Date is not selected').toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_11_end_date_required');
  //   console.log(`End Date required check — popup still open: ${stillOpen}, validation errors present: ${hasErrors}.`);

  //   if (stillOpen) {
  //     await ladderPromotionsPage.clickCancel();
  //   }
  // });

  // // ─── Is Premium checkbox ────────────────────────────────────────────────────

  // test('TC_LP_12 Verify Is Premium checkbox renders disabled and unchecked by default', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   await expect(ladderPromotionsPage.isPremiumCheckbox, 'Expected Is Premium checkbox to be visible').toBeVisible({ timeout: 20000 });
  //   await expect(ladderPromotionsPage.isPremiumCheckbox, 'Expected Is Premium checkbox to be disabled').toBeDisabled();
  //   expect(await ladderPromotionsPage.isPremiumCheckbox.isChecked(), 'Expected Is Premium checkbox to be unchecked by default').toBe(false);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_12_is_premium_disabled');
  //   console.log('Is Premium checkbox confirmed disabled and unchecked by default.');

  //   await ladderPromotionsPage.clickCancel();
  // });

  // // ─── Cancel flow ─────────────────────────────────────────────────────────────

  // test('TC_LP_13 Verify Cancel closes the popup without creating a promotion', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = `AutoLadder_${Date.now()}`;
  //   await fillMandatoryFields(ladderPromotionsPage);
  //   await ladderPromotionsPage.fillDescription(description);
  //   await ladderPromotionsPage.clickCancel();

  //   await expect(ladderPromotionsPage.descriptionInput, 'Expected the popup to close after Cancel').toBeHidden({ timeout: 10000 });
  //   await page.waitForLoadState('networkidle').catch(() => {});
  //   const isPresent = await ladderPromotionsPage.isRowVisibleByDescription(description, 5000);
  //   expect(isPresent, `Expected "${description}" NOT to appear in the table after Cancel`).toBe(false);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_13_cancel_discards');
  //   console.log('Cancel closed the popup without creating a Ladder Promotion.');
  // });

  // test('TC_LP_14 Verify reopening Create Ladder Promotion after Cancel starts with all fields empty', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   await fillMandatoryFields(ladderPromotionsPage);
  //   await ladderPromotionsPage.clickCancel();
  //   await expect(ladderPromotionsPage.descriptionInput, 'Expected the popup to close after Cancel').toBeHidden({ timeout: 10000 });

  //   await openCreatePopup(ladderPromotionsPage);
  //   expect(await ladderPromotionsPage.getDescriptionValue(), 'Expected Description to be empty on reopen').toBe('');
  //   expect(await ladderPromotionsPage.getStartDateValue(), 'Expected Start Date to be empty on reopen').toBe('');
  //   expect(await ladderPromotionsPage.getEndDateValue(), 'Expected End Date to be empty on reopen').toBe('');

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_14_reopen_fields_empty');
  //   console.log('Reopening Create Ladder Promotion after Cancel starts with all fields empty.');

  //   await ladderPromotionsPage.clickCancel();
  // });

  // // ─── Save flow ───────────────────────────────────────────────────────────────

  // test('TC_LP_15 Verify filling all mandatory fields and clicking Save successfully creates a Ladder Promotion', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   const isPresent = await ladderPromotionsPage.isRowVisibleByDescription(description, 15000);
  //   expect(isPresent, `Expected "${description}" to appear in the table after Save`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_15_created');
  //   console.log(`Ladder Promotion "${description}" created successfully.`);
  // });

  // test('TC_LP_16 Verify a successfully created Ladder Promotion appears in the list with the correct Description', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.searchFor(description);
  //   const row = ladderPromotionsPage.getRowByDescription(description);
  //   await expect(row, `Expected row for "${description}" to be visible after searching`).toBeVisible({ timeout: 15000 });
  //   await expect(row, `Expected the row text to include the exact Description "${description}"`).toContainText(description);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_16_row_description');
  //   console.log(`Row for "${description}" shows the correct Description.`);
  // });

  // test('TC_LP_17 Verify searching by Description returns the created Ladder Promotion', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.searchFor(description);
  //   const isPresent = await ladderPromotionsPage.isRowVisibleByDescription(description, 15000);
  //   expect(isPresent, `Expected search for "${description}" to return the created Ladder Promotion`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_17_search_found');
  //   console.log(`Search for "${description}" returned the created Ladder Promotion.`);
  // });

  // // ─── Delete flow ─────────────────────────────────────────────────────────────

  // test('TC_LP_18 Verify clicking Delete on a created Ladder Promotion then Yes removes it from the list', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.deleteLadderPromotionIfPresent(description);
  //   const isPresentAfterDelete = await ladderPromotionsPage.isRowVisibleByDescription(description, 5000);
  //   expect(isPresentAfterDelete, `Expected "${description}" to be removed from the table after confirming Delete`).toBe(false);
  //   descriptionToCleanup = null; // already deleted — nothing left for afterEach to clean up

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_18_deleted');
  //   console.log(`Ladder Promotion "${description}" deleted successfully via kebab menu -> Delete -> Yes.`);
  // });

  // test('TC_LP_19 Verify clicking Delete then No leaves the Ladder Promotion in the list', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.searchFor(description);
  //   const row = ladderPromotionsPage.getRowByDescription(description);
  //   await row.waitFor({ state: 'visible', timeout: 15000 });
  //   await row.locator('button.pure__table-menu-trigger').first().click();
  //   const menu = page.locator('.p-menu-overlay, .p-menu, .p-tieredmenu').last();
  //   await menu.waitFor({ state: 'visible', timeout: 10000 });
  //   await menu.locator('.p-menuitem-text').getByText('Delete', { exact: true }).click();
  //   await ladderPromotionsPage.confirmNoBtn.waitFor({ state: 'visible', timeout: 10000 });
  //   await ladderPromotionsPage.confirmNoBtn.click();
  //   await page.waitForLoadState('networkidle').catch(() => {});

  //   const isPresentAfterNo = await ladderPromotionsPage.isRowVisibleByDescription(description, 10000);
  //   expect(isPresentAfterNo, `Expected "${description}" to remain in the table after clicking No on the Delete confirmation`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_19_delete_cancelled');
  //   console.log(`Ladder Promotion "${description}" remained after clicking No on Delete confirmation.`);
  // });

  // // ─── Edit flow ───────────────────────────────────────────────────────────────

  // test('TC_LP_20 Verify editing a Ladder Promotion via the kebab menu updates its Description and End Date', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const originalDescription = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(originalDescription);

  //   // Deliberately NOT a superstring of originalDescription (e.g. "<original>_Edited" would still
  //   // substring-match the old row via getRowByDescription's hasText filter) — a wholly distinct
  //   // value so the "original is gone" check below can't produce a false positive.
  //   const updatedDescription = `AutoLadderEdited_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(updatedDescription);

  //   // Change End Date too (pick the FIRST available day instead of the LAST one setDateRange used
  //   // when this promotion was created), so the edit touches more than just Description.
  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.endDateInput);
  //   const endPanel = page.locator('#endDate_panel');
  //   await endPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first(), { force: true });
  //   await page.waitForTimeout(300);
  //   await ladderPromotionsPage.dismissDatePicker();

  //   await ladderPromotionsPage.clickSave();
  //   await ladderPromotionsPage.descriptionInput.waitFor({ state: 'hidden', timeout: 15000 });
  //   await page.waitForLoadState('networkidle').catch(() => {});

  //   // Track the UPDATED description for cleanup from here on — the original Description no longer
  //   // identifies any row once the edit has saved (it was renamed, not duplicated), so afterEach
  //   // must search by the new value instead.
  //   descriptionToCleanup = updatedDescription;

  //   await ladderPromotionsPage.clearSearch();
  //   const updatedIsPresent = await ladderPromotionsPage.isRowVisibleByDescription(updatedDescription, 15000);
  //   expect(updatedIsPresent, `Expected the updated Description "${updatedDescription}" to appear in the table after saving the edit`).toBe(true);

  //   const originalIsPresent = await ladderPromotionsPage.isRowVisibleByDescription(originalDescription, 5000);
  //   expect(originalIsPresent, `Expected the original Description "${originalDescription}" to no longer appear — it should have been renamed, not duplicated`).toBe(false);

  //   // Re-open Edit on the renamed row to confirm the change actually persisted (a fresh search +
  //   // re-fetch from the server), not just reflected optimistically in the table after Save.
  //   await ladderPromotionsPage.openEditForPromotion(updatedDescription);
  //   expect(await ladderPromotionsPage.getDescriptionValue(), 'Expected the renamed Description to still be there on reopening Edit').toBe(updatedDescription);
  //   await ladderPromotionsPage.clickCancel();

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_20_edited');
  //   console.log(`Ladder Promotion "${originalDescription}" edited to "${updatedDescription}" (Description + End Date) successfully.`);
  // });

  // test('TC_LP_21 Verify the Edit popup opens prefilled with the promotion\'s current field values', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   // openEditForPromotion() already asserts Description is prefilled with the exact value —
  //   // this additionally confirms Region/Start Date/End Date aren't left blank in Edit mode either.
  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   expect((await ladderPromotionsPage.getRegionValue()).length, 'Expected Region to be prefilled on Edit').toBeGreaterThan(0);
  //   expect((await ladderPromotionsPage.getStartDateValue()).length, 'Expected Start Date to be prefilled on Edit').toBeGreaterThan(0);
  //   expect((await ladderPromotionsPage.getEndDateValue()).length, 'Expected End Date to be prefilled on Edit').toBeGreaterThan(0);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_21_edit_prefilled');
  //   console.log(`Edit popup for "${description}" opened with Description, Region, Start Date and End Date all prefilled.`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_22 Verify clearing Description during Edit disables Save', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   await ladderPromotionsPage.fillDescription('');

  //   // Checking Save's disabled state directly (no click at all) — unlike the max-length check
  //   // below, the required-field rule doesn't need a Save attempt to take effect: Save's disabled
  //   // binding is confirmed live to update immediately as the field's own validity changes (only
  //   // the inline error TEXT is deferred until a Save attempt). Avoiding the click here also avoids
  //   // any risk of leaving this promotion's Description blank server-side with no description left
  //   // to search by for cleanup.
  //   expect(await ladderPromotionsPage.saveBtn.isDisabled(), 'Expected Save to be disabled when Description is cleared during Edit').toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_22_edit_description_required');
  //   console.log(`Save correctly disabled after clearing Description on "${description}" during Edit.`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_23 Verify Description\'s 255 character maximum is still enforced during Edit', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   const oversizedValue = 'B'.repeat(300);
  //   await ladderPromotionsPage.fillDescription(oversizedValue);

  //   // Confirmed live (TC_LP_05): the max-length error only renders after an attempted Save, even
  //   // though Save itself stays disabled throughout — force-clicking it here is the same confirmed-
  //   // safe "disabled Save never actually submits" case, so this promotion's real Description is
  //   // never at risk of being saved as the oversized value.
  //   await ladderPromotionsPage.clickSave();

  //   const typedValue = await ladderPromotionsPage.getDescriptionValue();
  //   const errorText = await ladderPromotionsPage.getDescriptionErrorText();
  //   expect(typedValue.length <= 255 || errorText.length > 0, `Expected Description to be capped at 255 characters or flagged invalid during Edit, but got length ${typedValue.length} with no validation error ("${errorText}")`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_23_edit_description_max_length');
  //   console.log(`Description max-length check during Edit — typed length: ${typedValue.length}, error text: "${errorText}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_24 Verify editing Region and saving persists the new value', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   const originalRegion = await ladderPromotionsPage.getRegionValue();
  //   const newRegion = await ladderPromotionsPage.selectDifferentRegion(originalRegion);
  //   test.skip(newRegion === null, 'No alternate Region option was available to switch to — cannot exercise a real value change.');

  //   await ladderPromotionsPage.clickSave();
  //   await ladderPromotionsPage.descriptionInput.waitFor({ state: 'hidden', timeout: 15000 });
  //   await page.waitForLoadState('networkidle').catch(() => {});

  //   // Re-open Edit to confirm the new Region actually persisted, not just reflected in the popup.
  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   expect(await ladderPromotionsPage.getRegionValue(), 'Expected the new Region to have persisted after Save').toBe(newRegion);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_24_edit_region');
  //   console.log(`Region for "${description}" changed from "${originalRegion}" to "${newRegion}" and persisted.`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_25 Verify editing Start Date and saving persists the new value', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   const originalStartDate = await ladderPromotionsPage.getStartDateValue();

  //   // setDateRange() picked the FIRST available day for Start Date when this promotion was
  //   // created — pick the LAST available day instead, so this is a genuinely different value.
  //   await ladderPromotionsPage.clickElement(ladderPromotionsPage.startDateInput);
  //   const startPanel = page.locator('#startDate_panel');
  //   await startPanel.waitFor({ state: 'visible' });
  //   await ladderPromotionsPage.clickElement(startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last(), { force: true });
  //   await page.waitForTimeout(300);
  //   await ladderPromotionsPage.dismissDatePicker();

  //   const newStartDate = await ladderPromotionsPage.getStartDateValue();
  //   expect(newStartDate, 'Expected Start Date to actually change before attempting to save it').not.toBe(originalStartDate);

  //   await ladderPromotionsPage.clickSave();
  //   await ladderPromotionsPage.descriptionInput.waitFor({ state: 'hidden', timeout: 15000 });
  //   await page.waitForLoadState('networkidle').catch(() => {});

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   expect(await ladderPromotionsPage.getStartDateValue(), 'Expected the new Start Date to have persisted after Save').toBe(newStartDate);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_25_edit_start_date');
  //   console.log(`Start Date for "${description}" changed from "${originalStartDate}" to "${newStartDate}" and persisted.`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // test('TC_LP_26 Verify Cancel during Edit discards changes without saving them', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   const discardedDraft = `AutoLadderDiscarded_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(discardedDraft);
  //   await ladderPromotionsPage.clickCancel();
  //   await expect(ladderPromotionsPage.descriptionInput, 'Expected the Edit popup to close after Cancel').toBeHidden({ timeout: 10000 });

  //   await ladderPromotionsPage.clearSearch();
  //   const draftIsPresent = await ladderPromotionsPage.isRowVisibleByDescription(discardedDraft, 5000);
  //   expect(draftIsPresent, `Expected the discarded draft Description "${discardedDraft}" NOT to appear in the table`).toBe(false);

  //   // Re-open Edit on the ORIGINAL (unchanged) Description to confirm Cancel truly discarded the
  //   // draft server-side too, not just closed the popup without saving.
  //   await ladderPromotionsPage.openEditForPromotion(description);
  //   expect(await ladderPromotionsPage.getDescriptionValue(), 'Expected Description to still be the original value, not the discarded draft').toBe(description);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_26_edit_cancel_discards');
  //   console.log(`Cancel during Edit correctly discarded the draft Description "${discardedDraft}" for "${description}".`);

  //   await ladderPromotionsPage.clickCancel();
  // });

  // // ─── Clone flow ──────────────────────────────────────────────────────────────

  // test('TC_LP_27 Verify cloning a Ladder Promotion and clicking Save creates a second, independent promotion', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const originalDescription = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionsToCleanup.push(d); });

  //   const prefilledDescription = await ladderPromotionsPage.openCloneForPromotion(originalDescription);
  //   console.log(`Clone popup prefilled Description as: "${prefilledDescription}" (original was "${originalDescription}").`);

  //   // Not relying on whatever Clone prefilled — give the clone a distinctive Description of its
  //   // own so it can be told apart from the original by search/cleanup regardless of whether Clone
  //   // prefilled an exact copy, a modified copy, or nothing at all.
  //   const cloneDescription = `AutoLadderClone_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(cloneDescription);
  //   // Tracked for cleanup BEFORE the Save attempt, same standing rule as every other Save flow —
  //   // if Save hangs or the test fails right after, afterEach can still find and delete the clone.
  //   descriptionsToCleanup.push(cloneDescription);

  //   await ladderPromotionsPage.clickSave();
  //   await ladderPromotionsPage.descriptionInput.waitFor({ state: 'hidden', timeout: 15000 });
  //   await page.waitForLoadState('networkidle').catch(() => {});
  //   await ladderPromotionsPage.clearSearch();

  //   const cloneIsPresent = await ladderPromotionsPage.isRowVisibleByDescription(cloneDescription, 15000);
  //   expect(cloneIsPresent, `Expected the clone "${cloneDescription}" to appear in the table after Save`).toBe(true);

  //   // The original must still exist too — Clone is a duplicate, not a rename (unlike Edit).
  //   const originalIsStillPresent = await ladderPromotionsPage.isRowVisibleByDescription(originalDescription, 5000);
  //   expect(originalIsStillPresent, `Expected the original "${originalDescription}" to remain untouched after cloning it`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_27_cloned');
  //   console.log(`Cloned "${originalDescription}" -> "${cloneDescription}"; both now exist independently.`);
  // });

  // test('TC_LP_28 Verify clicking Cancel after Clone does not create a second promotion', async ({ page, ladderPromotionsPage }, testInfo) => {
  //   const originalDescription = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionsToCleanup.push(d); });

  //   await ladderPromotionsPage.openCloneForPromotion(originalDescription);

  //   const discardedCloneDescription = `AutoLadderCloneDiscarded_${Date.now()}`;
  //   await ladderPromotionsPage.fillDescription(discardedCloneDescription);
  //   await ladderPromotionsPage.clickCancel();
  //   await expect(ladderPromotionsPage.descriptionInput, 'Expected the Clone popup to close after Cancel').toBeHidden({ timeout: 10000 });

  //   await ladderPromotionsPage.clearSearch();
  //   const discardedIsPresent = await ladderPromotionsPage.isRowVisibleByDescription(discardedCloneDescription, 5000);
  //   expect(discardedIsPresent, `Expected the cancelled clone "${discardedCloneDescription}" NOT to appear in the table`).toBe(false);

  //   // The original must still exist, untouched by the cancelled clone attempt.
  //   const originalIsStillPresent = await ladderPromotionsPage.isRowVisibleByDescription(originalDescription, 5000);
  //   expect(originalIsStillPresent, `Expected the original "${originalDescription}" to remain after cancelling its clone`).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_28_clone_cancelled');
  //   console.log(`Cancel after Clone correctly discarded "${discardedCloneDescription}" — only "${originalDescription}" remains.`);
  // });

  // ─── Mark Premium / Unmark Premium flow ─────────────────────────────────────

  test('TC_LP_29 Verify Mark Premium then Yes sets Is Premium, confirmed via toast and Edit', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    await ladderPromotionsPage.openMarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickYesOnConfirmDialog();
    await expect(ladderPromotionsPage.verifyToast(), 'Expected a success toast after confirming Mark Premium').resolves.toBe(true);

    await ladderPromotionsPage.openEditForPromotion(description);
    expect(await ladderPromotionsPage.isPremiumCheckbox.isChecked(), 'Expected Is Premium to be checked after Mark Premium -> Yes').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_29_marked_premium');
    console.log(`"${description}" marked Premium successfully (toast + Is Premium checkbox both confirm it).`);

    await ladderPromotionsPage.clickCancel();
  });

  test('TC_LP_30 Verify Mark Premium then No leaves Is Premium unchecked', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    await ladderPromotionsPage.openMarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickNoOnConfirmDialog();

    await ladderPromotionsPage.openEditForPromotion(description);
    expect(await ladderPromotionsPage.isPremiumCheckbox.isChecked(), 'Expected Is Premium to remain unchecked after Mark Premium -> No').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_30_mark_premium_cancelled');
    console.log(`"${description}" remained un-Premium after Mark Premium -> No.`);

    await ladderPromotionsPage.clickCancel();
  });

  test('TC_LP_31 Verify Unmark Premium then Yes clears Is Premium, confirmed via toast and Edit', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    // Precondition per the app's own rule ("you can unmark only when the promotion is marked as
    // premium") — mark it Premium first so Unmark Premium is actually meaningful to exercise.
    await ladderPromotionsPage.openMarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickYesOnConfirmDialog();

    await ladderPromotionsPage.openUnmarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickYesOnConfirmDialog();
    await expect(ladderPromotionsPage.verifyToast(), 'Expected a success toast after confirming Unmark Premium').resolves.toBe(true);

    await ladderPromotionsPage.openEditForPromotion(description);
    expect(await ladderPromotionsPage.isPremiumCheckbox.isChecked(), 'Expected Is Premium to be unchecked after Unmark Premium -> Yes').toBe(false);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_31_unmarked_premium');
    console.log(`"${description}" unmarked Premium successfully (toast + Is Premium checkbox both confirm it).`);

    await ladderPromotionsPage.clickCancel();
  });

  test('TC_LP_32 Verify Unmark Premium then No leaves Is Premium checked', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    await ladderPromotionsPage.openMarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickYesOnConfirmDialog();

    await ladderPromotionsPage.openUnmarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickNoOnConfirmDialog();

    await ladderPromotionsPage.openEditForPromotion(description);
    expect(await ladderPromotionsPage.isPremiumCheckbox.isChecked(), 'Expected Is Premium to remain checked after Unmark Premium -> No').toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_32_unmark_premium_cancelled');
    console.log(`"${description}" remained Premium after Unmark Premium -> No.`);

    await ladderPromotionsPage.clickCancel();
  });

  test('TC_LP_33 Verify the kebab menu offers Mark Premium (not Unmark Premium) while a promotion is not yet Premium', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    const menu = await ladderPromotionsPage.openKebabMenuForPromotion(description);
    await expect(menu.getByText('Mark Premium', { exact: true }), 'Expected "Mark Premium" to be offered for a non-Premium promotion').toBeVisible({ timeout: 10000 });
    await expect(menu.getByText('Unmark Premium', { exact: true }), 'Expected "Unmark Premium" NOT to be offered for a non-Premium promotion').toBeHidden({ timeout: 5000 });
    await page.keyboard.press('Escape').catch(() => {});

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_33_menu_offers_mark');
    console.log(`Kebab menu for non-Premium "${description}" correctly offers Mark Premium only.`);
  });

  test('TC_LP_34 Verify the kebab menu offers Unmark Premium (not Mark Premium) once a promotion is Premium', async ({ page, ladderPromotionsPage }, testInfo) => {
    const description = await createLadderPromotion(page, ladderPromotionsPage, d => { descriptionToCleanup = d; });

    await ladderPromotionsPage.openMarkPremiumConfirmDialog(description);
    await ladderPromotionsPage.clickYesOnConfirmDialog();

    const menu = await ladderPromotionsPage.openKebabMenuForPromotion(description);
    await expect(menu.getByText('Unmark Premium', { exact: true }), 'Expected "Unmark Premium" to be offered for a Premium promotion').toBeVisible({ timeout: 10000 });
    await expect(menu.getByText('Mark Premium', { exact: true }), 'Expected "Mark Premium" NOT to be offered for a Premium promotion').toBeHidden({ timeout: 5000 });
    await page.keyboard.press('Escape').catch(() => {});

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LP_34_menu_offers_unmark');
    console.log(`Kebab menu for Premium "${description}" correctly offers Unmark Premium only.`);
  });
});
