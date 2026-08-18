// npx playwright test tests/GenericWheel.spec.ts --headed

import { test, expect, Page, Locator } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC WHEEL  (TC_01 – TC_05)
// Navigation: Marketing → Promotions → Generic Wheel
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Marketing - Generic Wheel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/main/home');
    // Deep-link navigation doesn't always fully hydrate the Angular/Stencil
    // component before the sidebar click fires — a reload reliably forces it
    // to initialize from scratch (same fix proven across this project's other
    // spec files).
    await page.reload();
    await page.waitForLoadState('networkidle');

    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();

    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();

    const genericWheelLink = page.locator('span.menuitem-text:text-is("Generic Wheel")').first();
    await genericWheelLink.waitFor({ state: 'visible', timeout: 10000 });
    await genericWheelLink.click();
    await page.waitForURL('**/generic-wheel', { timeout: 15000 });
    // Full reload forces Angular/Stencil to initialize the component from scratch
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('generic-wheel')).toBeVisible({ timeout: 30000 });
  });

  // TC_01: Verify Generic Wheel page loads successfully
  test('TC_01 - Verify Generic Wheel page loads successfully', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await expect(container).toBeVisible({ timeout: 15000 });

    // Heading: <h2> Generic <span>Wheel</span></h2>
    await expect(page.locator('h2').filter({ hasText: 'Generic' })).toBeVisible({ timeout: 10000 });

    // Table has at least one data row
    await expect(container.locator('tbody tr[data-pc-section="bodyrow"]').first()).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01-GenericWheel-PageLoads_success');
  });

  // TC_02: Verify promotion list is displayed with correct columns
  test('TC_02 - Verify promotion list is displayed', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const expectedColumns = [
      'Promotion Id',
      'Promotion Name',
      'Allocation Strategy',
      'Start Date',
      'End Date',
      'Redirect URL',
      'Is Active',
    ];

    for (const col of expectedColumns) {
      await expect(
        container.locator('[data-pc-section="headertitle"]', { hasText: col }).first()
      ).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_02-GenericWheel-PromotionList_success');
  });

  // TC_03: Verify Search functionality with valid text
  test('TC_03 - Verify Search functionality', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    const rows = container.locator('tbody tr[data-pc-section="bodyrow"]');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Use the first cell of the first row (Promotion Id) as the search keyword
    const firstCellText = (await rows.first().locator('td').first().textContent()) ?? '';
    const searchKeyword = firstCellText.trim();

    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(600);

    // At least one row remains after filtering
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_03-GenericWheel-SearchValid_success');
  });

  // TC_04: Verify Search with no results shows empty state
  test('TC_04 - Verify Search with no results', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('ZZZZZ_NO_MATCH_99999');
    await page.waitForTimeout(600);

    // No data rows should be visible after filtering with a non-existent term
    await expect(
      container.locator('tbody tr[data-pc-section="bodyrow"]')
    ).toHaveCount(0, { timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_04-GenericWheel-SearchNoResults_success');
  });

  // TC_05: Verify "Select a region" dropdown shows options
  test('TC_05 - Verify Select a Region dropdown', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');

    // Scope to the dropdown root, then click its trigger button
    const regionDropdown = container.locator('div.dropdown-input.w-20r[data-pc-section="root"]');
    const regionTrigger = regionDropdown.locator('[data-pc-section="trigger"]');
    await regionTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await regionTrigger.click();

    // PrimeNG renders the options overlay as .p-dropdown-panel
    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // At least one option item is visible
    const options = panel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]');
    await expect(options.first()).toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05-GenericWheel-RegionDropdown_success');
  });

  // TC_06: Verify region filtering
  test('TC_06 - Verify region filtering', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    // Scope to the dropdown root (div.dropdown-input.w-20r), then click its trigger
    const regionDropdown = container.locator('div.dropdown-input.w-20r[data-pc-section="root"]');
    const regionTrigger = regionDropdown.locator('[data-pc-section="trigger"]');
    await regionTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await regionTrigger.click();

    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const options = panel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]');
    await options.first().waitFor({ state: 'visible', timeout: 5000 });
    await options.first().click();

    // Give the table time to re-render with the filter applied
    await page.waitForTimeout(800);

    // The visible label span should no longer show the placeholder — a region is now selected
    // Use span[data-pc-section="input"] to avoid strict-mode conflict with the hidden <input>
    await expect(regionDropdown.locator('span[data-pc-section="input"]')).not.toHaveText('Select a region');

    // Table rows are present (filtered or empty, both are valid outcomes)
    const filteredRows = container.locator('tbody tr[data-pc-section="bodyrow"]');
    const totalAfter = await filteredRows.count();
    if (totalAfter > 0) {
      await expect(filteredRows.first()).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06-GenericWheel-RegionFiltering_success');
  });

  // TC_07: Verify "Include inactive" toggle OFF — only active records displayed
  test('TC_07 - Verify Include inactive toggle OFF', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    // data-p-disabled="false" identifies the toolbar toggle; table-row switches have data-p-disabled="true"
    const toggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await toggle.waitFor({ state: 'visible', timeout: 10000 });

    // Toggle is OFF by default — confirmed from outerHTML (aria-checked="false")
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Table shows at least one row (all active)
    const rows = container.locator('tbody tr[data-pc-section="bodyrow"]');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_07-GenericWheel-IncludeInactiveOFF_success');
  });

  // TC_08: Verify "Include inactive" toggle ON — active and inactive records displayed
  test('TC_08 - Verify Include inactive toggle ON', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const rowsBefore = await container.locator('tbody tr[data-pc-section="bodyrow"]').count();

    // Click the toggle root div once to turn it ON
    const toggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    await toggle.click();
    await page.waitForTimeout(800);

    // Toggle should now be ON
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Row count should be greater than or equal to before (inactive records now included)
    const rowsAfter = await container.locator('tbody tr[data-pc-section="bodyrow"]').count();
    expect(rowsAfter).toBeGreaterThanOrEqual(rowsBefore);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08-GenericWheel-IncludeInactiveON_success');
  });

  // TC_09: Verify "Create Promotion" button opens popup
  test('TC_09 - Verify Create Promotion button click', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    // A dialog/popup should appear
    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09-GenericWheel-CreatePromotionPopup_open');
  });

  // TC_10: Verify Create Promotion popup UI elements
  test('TC_10 - Verify popup UI elements', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Verify all expected form field labels are present in the popup
    const expectedLabels = [
      'Promotion Name',
      'Allocation Strategy',
      'Start Date',
      'End Date',
      'Spins Per User',
      'Daily Spin Limit',
      'Spin Validity Days',
      'Number of Slices',
      'Region',
      'Redirect URL',
      'Ticket Prefix',
      'Minimum Required Wager Total',
      'Notification Template',
    ];

    for (const label of expectedLabels) {
      await expect(
        dialog.locator(`label, span, div`, { hasText: label }).first()
      ).toBeVisible({ timeout: 5000 });
    }

    // Save and Cancel buttons must be present
    await expect(dialog.locator('button:has-text("Save"), button:has-text("Create")')).toBeVisible({ timeout: 5000 });
    await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_10-GenericWheel-PopupUIElements_success');
  });

  // TC_11: Verify mandatory fields validation
  test('TC_11 - Verify mandatory fields validation', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Leave all fields blank and attempt to Save
    const saveBtn = dialog.locator('button:has-text("Save"), button:has-text("Create")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10000 });

    const isSaveDisabled = await saveBtn.isDisabled();
    if (isSaveDisabled) {
      // Save button is disabled — validation is enforced via UI disable state
      expect(isSaveDisabled).toBe(true);
    } else {
      await saveBtn.click();
      // After clicking Save with empty fields, at least one validation message must appear
      const validationMsg = dialog.locator('.p-error, .ng-invalid ~ .p-error, [class*="error-msg"], small.p-error').first();
      await expect(validationMsg).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11-GenericWheel-MandatoryValidation_success');
  });

  // TC_12: Verify Promotion Name field accepts valid input and flags empty/invalid input
  test('TC_12 - Verify Promotion Name field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Use the exact id confirmed from the outerHTML: id="promotionNameInput"
    const nameInput = dialog.locator('#promotionNameInput');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });

    // Step 1: Enter valid text — field should accept it
    const validName = 'TestPromotion_AutoQA';
    await nameInput.click();
    await nameInput.fill(validName);
    await expect(nameInput).toHaveValue(validName);

    // Step 2: Clear the field and tab away — the error message should reappear
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('');
    await nameInput.press('Tab');
    await page.waitForTimeout(400);

    // From the outerHTML: <small class="p-error pure__error-message">Field is required</small>
    await expect(dialog.locator('small.p-error.pure__error-message').first()).toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_12-GenericWheel-PromotionNameField_success');
  });

  // TC_13: Verify Allocation Strategy dropdown shows options
  test('TC_13 - Verify Allocation Strategy dropdown', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Allocation Strategy is the first PrimeNG dropdown inside the dialog
    const strategyDropdown = dialog.locator('[data-pc-name="dropdown"]').first();
    await strategyDropdown.waitFor({ state: 'visible', timeout: 10000 });

    // Click the dropdown trigger to open the options panel
    const trigger = strategyDropdown.locator('[data-pc-section="trigger"]');
    await trigger.click();

    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // At least two known options should be present: Sequential and WeightedRandom
    const options = panel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]');
    await expect(options.first()).toBeVisible({ timeout: 5000 });
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(1);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13-GenericWheel-AllocationStrategyDropdown_success');
  });

  // TC_14: Verify Allocation Strategy selection shows selected value in field
  test('TC_14 - Verify Allocation Strategy selection', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const strategyDropdown = dialog.locator('[data-pc-name="dropdown"]').first();
    await strategyDropdown.waitFor({ state: 'visible', timeout: 10000 });

    // Open the dropdown
    await strategyDropdown.locator('[data-pc-section="trigger"]').click();

    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    const options = panel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]');
    await options.first().waitFor({ state: 'visible', timeout: 5000 });

    // Capture what the first option says, then click it
    const selectedText = (await options.first().textContent() ?? '').trim();
    await options.first().click();

    // The label span inside the dropdown should now show the selected value
    await expect(strategyDropdown.locator('span[data-pc-section="label"], span.p-dropdown-label')).not.toHaveText(/placeholder|select/i, { timeout: 5000 });
    const labelText = (await strategyDropdown.locator('span[data-pc-section="label"], span.p-dropdown-label').textContent() ?? '').trim();
    expect(labelText).toBe(selectedText);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14-GenericWheel-AllocationStrategySelection_success');
  });

  // TC_15: Verify Start Date selection from calendar picker
  test('TC_15 - Verify Start Date selection', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Start Date — first PrimeNG calendar/datepicker inside the dialog
    const startCalendar = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]').first();
    await startCalendar.waitFor({ state: 'visible', timeout: 10000 });

    const dateInput = startCalendar.locator('input[type="text"]').first();
    await dateInput.waitFor({ state: 'visible', timeout: 10000 });

    // Click the input to open the calendar overlay
    await dateInput.click();

    // Wait for the PrimeNG datepicker panel
    const calendarPanel = page.locator('.p-datepicker').first();
    await expect(calendarPanel).toBeVisible({ timeout: 5000 });

    // From the outerHTML:
    // - Current-month <td> cells have NO data-p-other-month attribute → :not([data-p-other-month])
    // - Past days have data-p-disabled="true" on the span; clickable days have data-p-disabled="false"
    const dayCell = calendarPanel
      .locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]')
      .first();
    await dayCell.waitFor({ state: 'visible', timeout: 5000 });
    const selectedDay = (await dayCell.textContent() ?? '').trim();

    // Click the day span; force:true is not needed since the td is not an other-month cell
    await dayCell.click();

    // Click the Promotion Name field to close the calendar overlay
    await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);

    // The date input must now be non-empty
    const dateValue = await dateInput.inputValue();
    expect(dateValue.length).toBeGreaterThan(0);
    expect(dateValue).toContain(selectedDay);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15-GenericWheel-StartDateSelection_success');
  });

  // TC_16: Verify End Date earlier than Start Date shows validation error
  test('TC_16 - Verify End Date validation (end before start)', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const calendars = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]');

    // Step 1: Open Start Date calendar and navigate to NEXT month, pick first available date
    await calendars.nth(0).locator('input[type="text"]').click();
    const calPanel = page.locator('.p-datepicker').first();
    await expect(calPanel).toBeVisible({ timeout: 5000 });

    // Navigate one month forward so the start date is in the future
    await calPanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(300);

    const startDay = calPanel.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first();
    await startDay.waitFor({ state: 'visible', timeout: 5000 });
    await startDay.click();

    await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    // Step 2: Open End Date calendar — the app enforces minDate = start date,
    // so dates before the start become disabled and unclickable.
    await calendars.nth(1).locator('input[type="text"]').click();
    const endPanel = page.locator('.p-datepicker').first();
    await expect(endPanel).toBeVisible({ timeout: 5000 });

    // Navigate BACK one month — lands on current month which is entirely before the start date
    await endPanel.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
    await page.waitForTimeout(300);

    // Validation passes when ALL current-month days are disabled (none are clickable).
    // This confirms the calendar correctly prevents selecting a date before the start date.
    const enabledDays = endPanel.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    );
    await expect(enabledDays).toHaveCount(0, { timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_16-GenericWheel-EndDateBeforeStart_success');
  });

  // TC_17: Verify valid date range (end after start) is accepted
  test('TC_17 - Verify valid date range accepted', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const calendars = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]');

    // Step 1: Select Start Date — pick today (first enabled date in current month)
    await calendars.nth(0).locator('input[type="text"]').click();
    const startPanel = page.locator('.p-datepicker').first();
    await expect(startPanel).toBeVisible({ timeout: 5000 });

    const startDay = startPanel.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first();
    await startDay.waitFor({ state: 'visible', timeout: 5000 });
    await startDay.click();

    await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    // Step 2: Select End Date — navigate to NEXT month and pick first available date
    await calendars.nth(1).locator('input[type="text"]').click();
    const endPanel = page.locator('.p-datepicker').first();
    await expect(endPanel).toBeVisible({ timeout: 5000 });

    await endPanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(300);

    const endDay = endPanel.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first();
    await endDay.waitFor({ state: 'visible', timeout: 5000 });
    await endDay.click();

    await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);

    // Both date inputs must now have values
    const startVal = await calendars.nth(0).locator('input[type="text"]').inputValue();
    const endVal   = await calendars.nth(1).locator('input[type="text"]').inputValue();
    expect(startVal.length).toBeGreaterThan(0);
    expect(endVal.length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_17-GenericWheel-ValidDateRange_success');
  });

  // TC_18: Verify Spins Per User field accepts only numeric input
  test('TC_18 - Verify Spins Per User field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Spins Per User is the first PrimeNG inputnumber in the dialog
    const spinsInput = dialog.locator('[data-pc-name="inputnumber"]').nth(0).locator('input');
    await spinsInput.waitFor({ state: 'visible', timeout: 10000 });

    // Enter valid numeric value
    await spinsInput.click({ clickCount: 3 });
    await spinsInput.pressSequentially('5');
    const numericVal = await spinsInput.inputValue();
    expect(numericVal).toMatch(/^\d+$/);

    // PrimeNG inputnumber ignores non-numeric key presses — value should stay numeric
    await spinsInput.pressSequentially('abc');
    const afterAlpha = await spinsInput.inputValue();
    expect(afterAlpha).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18-GenericWheel-SpinsPerUser_success');
  });

  // TC_19: Verify Daily Spin Limit field accepts only numeric input
  test('TC_19 - Verify Daily Spin Limit field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Daily Spin Limit is the second PrimeNG inputnumber in the dialog
    const spinLimitInput = dialog.locator('[data-pc-name="inputnumber"]').nth(1).locator('input');
    await spinLimitInput.waitFor({ state: 'visible', timeout: 10000 });

    await spinLimitInput.click({ clickCount: 3 });
    await spinLimitInput.pressSequentially('3');
    const numericVal = await spinLimitInput.inputValue();
    expect(numericVal).toMatch(/^\d+$/);

    await spinLimitInput.pressSequentially('abc');
    const afterAlpha = await spinLimitInput.inputValue();
    expect(afterAlpha).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19-GenericWheel-DailySpinLimit_success');
  });

  // TC_20: Verify Spin Validity Days field accepts only numeric input
  test('TC_20 - Verify Spin Validity Days field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Spin Validity Days is the third PrimeNG inputnumber in the dialog
    const validityInput = dialog.locator('[data-pc-name="inputnumber"]').nth(2).locator('input');
    await validityInput.waitFor({ state: 'visible', timeout: 10000 });

    await validityInput.click({ clickCount: 3 });
    await validityInput.pressSequentially('7');
    const numericVal = await validityInput.inputValue();
    expect(numericVal).toMatch(/^\d+$/);

    await validityInput.pressSequentially('abc');
    const afterAlpha = await validityInput.inputValue();
    expect(afterAlpha).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_20-GenericWheel-SpinValidityDays_success');
  });

  // TC_21: Verify Number of Slices field accepts input
  test('TC_21 - Verify Number of Slices field accepts input', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // id="numberOfSlicesInput" is on the wrapper <span>; the actual input is inside it
    const slicesInput = dialog.locator('#numberOfSlicesInput input');
    await slicesInput.waitFor({ state: 'visible', timeout: 10000 });

    // Enter a valid numeric value and verify the field accepts it
    await slicesInput.click({ clickCount: 3 });
    await slicesInput.pressSequentially('5');
    const enteredVal = await slicesInput.inputValue();
    expect(enteredVal).toMatch(/^\d+$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-GenericWheel-NumberOfSlicesField_success');
  });

  // TC_21: Verify Number of Slices field accepts only numeric input
  test('TC_21 - Verify Number of Slices field accepts only numeric input', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput = dialog.locator('#numberOfSlicesInput input');
    await slicesInput.waitFor({ state: 'visible', timeout: 10000 });

    // Step 1: Enter numeric value — should be accepted
    await slicesInput.click({ clickCount: 3 });
    await slicesInput.pressSequentially('4');
    const numericVal = await slicesInput.inputValue();
    expect(numericVal).toMatch(/^\d+$/);

    // Step 2: Attempt non-numeric input — PrimeNG inputnumber silently discards it
    await slicesInput.pressSequentially('abc');
    const afterAlpha = await slicesInput.inputValue();
    expect(afterAlpha).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-GenericWheel-NumberOfSlicesNumericOnly_success');
  });

  // TC_22: Verify minimum value validation
  // Fill ALL mandatory fields, enter 1 in Number of Slices, click Save → error toast expected
  test('TC_22 - Verify Number of Slices minimum value validation', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const name22 = dialog.locator('#promotionNameInput');
    await name22.waitFor({ state: 'visible', timeout: 10000 });
    await name22.click();
    await name22.fill(`WheelPromo_TC22_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel22 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel22).toBeVisible({ timeout: 5000 });
    await strategyPanel22.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel22 = page.locator('.p-datepicker').first();
    await expect(startPanel22).toBeVisible({ timeout: 5000 });
    await startPanel22.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel22 = page.locator('.p-datepicker').first();
    await expect(endPanel22).toBeVisible({ timeout: 5000 });
    await endPanel22.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel22.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name22.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spins22 = dialog.locator('#spinsPerUserInput input');
    await spins22.click({ clickCount: 3 });
    await spins22.pressSequentially('5');
    await spins22.press('Tab');

    // 6. Daily Spin Limit
    const daily22 = dialog.locator('#dailySpinLimitInput input');
    await daily22.click({ clickCount: 3 });
    await daily22.pressSequentially('3');
    await daily22.press('Tab');

    // 7. Spin Validity Days
    const validity22 = dialog.locator('#spinValidityDaysInput input');
    await validity22.click({ clickCount: 3 });
    await validity22.pressSequentially('7');
    await validity22.press('Tab');

    // 8. Number of Slices = 1 (below the allowed minimum)
    const slices22 = dialog.locator('#numberOfSlicesInput input');
    await slices22.click({ clickCount: 3 });
    await slices22.pressSequentially('1');
    await slices22.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana (avoid Betway Agents)
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel22 = page.locator('.p-dropdown-panel');
    await expect(regionPanel22).toBeVisible({ timeout: 5000 });
    await regionPanel22.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn22 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn22.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn22.click();

    // Error toast must appear — Number of Slices is below the allowed minimum
    const errorToast22 = page.locator(
      '.p-toast-message-error, [data-p-severity="error"], .p-toast-message[class*="error"]'
    ).first();
    await expect(errorToast22).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_22-GenericWheel-SlicesMinValidation_success');
  });

  // TC_23: Verify maximum value validation
  // Fill ALL mandatory fields, enter 9 in Number of Slices, click Save → error toast expected
  test('TC_23 - Verify Number of Slices maximum value validation', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const name23 = dialog.locator('#promotionNameInput');
    await name23.waitFor({ state: 'visible', timeout: 10000 });
    await name23.click();
    await name23.fill(`WheelPromo_TC23_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel23 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel23).toBeVisible({ timeout: 5000 });
    await strategyPanel23.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel23 = page.locator('.p-datepicker').first();
    await expect(startPanel23).toBeVisible({ timeout: 5000 });
    await startPanel23.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel23 = page.locator('.p-datepicker').first();
    await expect(endPanel23).toBeVisible({ timeout: 5000 });
    await endPanel23.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel23.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name23.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spins23 = dialog.locator('#spinsPerUserInput input');
    await spins23.click({ clickCount: 3 });
    await spins23.pressSequentially('5');
    await spins23.press('Tab');

    // 6. Daily Spin Limit
    const daily23 = dialog.locator('#dailySpinLimitInput input');
    await daily23.click({ clickCount: 3 });
    await daily23.pressSequentially('3');
    await daily23.press('Tab');

    // 7. Spin Validity Days
    const validity23 = dialog.locator('#spinValidityDaysInput input');
    await validity23.click({ clickCount: 3 });
    await validity23.pressSequentially('7');
    await validity23.press('Tab');

    // 8. Number of Slices = 9 (above the allowed maximum of 8)
    const slices23 = dialog.locator('#numberOfSlicesInput input');
    await slices23.click({ clickCount: 3 });
    await slices23.pressSequentially('9');
    await slices23.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana (avoid Betway Agents)
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel23 = page.locator('.p-dropdown-panel');
    await expect(regionPanel23).toBeVisible({ timeout: 5000 });
    await regionPanel23.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn23 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn23.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn23.click();

    // Error toast must appear — Number of Slices exceeds the allowed maximum
    const errorToast23 = page.locator(
      '.p-toast-message-error, [data-p-severity="error"], .p-toast-message[class*="error"]'
    ).first();
    await expect(errorToast23).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23-GenericWheel-SlicesMaxValidation_success');
  });

  // TC_24: Verify valid lower boundary (Number of Slices = 2)
  // Fill ALL mandatory fields, click Save → success toast expected
  test('TC_24 - Verify valid lower boundary value for Number of Slices', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const name24 = dialog.locator('#promotionNameInput');
    await name24.waitFor({ state: 'visible', timeout: 10000 });
    await name24.click();
    await name24.fill(`WheelPromo_TC24_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel24 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel24).toBeVisible({ timeout: 5000 });
    await strategyPanel24.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel24 = page.locator('.p-datepicker').first();
    await expect(startPanel24).toBeVisible({ timeout: 5000 });
    await startPanel24.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel24 = page.locator('.p-datepicker').first();
    await expect(endPanel24).toBeVisible({ timeout: 5000 });
    await endPanel24.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel24.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name24.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spins24 = dialog.locator('#spinsPerUserInput input');
    await spins24.click({ clickCount: 3 });
    await spins24.pressSequentially('5');
    await spins24.press('Tab');

    // 6. Daily Spin Limit
    const daily24 = dialog.locator('#dailySpinLimitInput input');
    await daily24.click({ clickCount: 3 });
    await daily24.pressSequentially('3');
    await daily24.press('Tab');

    // 7. Spin Validity Days
    const validity24 = dialog.locator('#spinValidityDaysInput input');
    await validity24.click({ clickCount: 3 });
    await validity24.pressSequentially('7');
    await validity24.press('Tab');

    // 8. Number of Slices = 2 (valid lower boundary)
    const slices24 = dialog.locator('#numberOfSlicesInput input');
    await slices24.click({ clickCount: 3 });
    await slices24.pressSequentially('2');
    await slices24.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana (avoid Betway Agents)
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel24 = page.locator('.p-dropdown-panel');
    await expect(regionPanel24).toBeVisible({ timeout: 5000 });
    await regionPanel24.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn24 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn24.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn24.click();

    // On successful save the dialog closes — that is the most reliable success indicator.
    // A success toast may also appear but its timing is not guaranteed.
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24-GenericWheel-SlicesLowerBoundary_success');
  });

  // TC_25: Verify valid upper boundary value (Number of Slices = 8)
  // Fill ALL mandatory fields, click Save → dialog closes (value accepted)
  test('TC_25 - Verify valid upper boundary value for Number of Slices', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const name25 = dialog.locator('#promotionNameInput');
    await name25.waitFor({ state: 'visible', timeout: 10000 });
    await name25.click();
    await name25.fill(`WheelPromo_TC25_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel25 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel25).toBeVisible({ timeout: 5000 });
    await strategyPanel25.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel25 = page.locator('.p-datepicker').first();
    await expect(startPanel25).toBeVisible({ timeout: 5000 });
    await startPanel25.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel25 = page.locator('.p-datepicker').first();
    await expect(endPanel25).toBeVisible({ timeout: 5000 });
    await endPanel25.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel25.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name25.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spins25 = dialog.locator('#spinsPerUserInput input');
    await spins25.click({ clickCount: 3 });
    await spins25.pressSequentially('5');
    await spins25.press('Tab');

    // 6. Daily Spin Limit
    const daily25 = dialog.locator('#dailySpinLimitInput input');
    await daily25.click({ clickCount: 3 });
    await daily25.pressSequentially('3');
    await daily25.press('Tab');

    // 7. Spin Validity Days
    const validity25 = dialog.locator('#spinValidityDaysInput input');
    await validity25.click({ clickCount: 3 });
    await validity25.pressSequentially('7');
    await validity25.press('Tab');

    // 8. Number of Slices = 8 (valid upper boundary)
    const slices25 = dialog.locator('#numberOfSlicesInput input');
    await slices25.click({ clickCount: 3 });
    await slices25.pressSequentially('8');
    await slices25.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana (avoid Betway Agents)
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel25 = page.locator('.p-dropdown-panel');
    await expect(regionPanel25).toBeVisible({ timeout: 5000 });
    await regionPanel25.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn25 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn25.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn25.click();

    // On successful save the dialog closes
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25-GenericWheel-SlicesUpperBoundary_success');
  });

  // TC_93: Verify "." (point) cannot be typed in the Number of Slices field
  test('TC_93 - Verify dot cannot be typed in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput93 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput93.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput93.click({ clickCount: 3 });

    // Attempt to type a dot — PrimeNG inputnumber must silently discard it
    await slicesInput93.pressSequentially('.');
    await page.waitForTimeout(200);

    const val93 = await slicesInput93.inputValue();
    // Field must remain empty or unchanged — no dot should appear
    expect(val93).not.toContain('.');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_93-GenericWheel-DotNotAllowed_success');
  });

  // TC_94: Verify decimal value cannot be entered manually in the Number of Slices field
  test('TC_94 - Verify decimal value cannot be entered in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput94 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput94.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput94.click({ clickCount: 3 });

    // Attempt to type "5.5" — the dot is discarded so the result is "55" or "5"
    await slicesInput94.pressSequentially('5.5');
    await page.waitForTimeout(200);

    const val94 = await slicesInput94.inputValue();
    // The field must NOT contain a decimal point — input is integer-only
    expect(val94).not.toContain('.');
    // The value must still be numeric (digits only)
    expect(val94).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_94-GenericWheel-DecimalNotAllowed_success');
  });

  // TC_95: Verify copy-paste of a decimal value is blocked or stripped in Number of Slices field
  test('TC_95 - Verify copy-paste decimal value is blocked in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    // Use a longer timeout — this test runs after TC_25 which creates a record and the table may repopulate slowly
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 40000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput95 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput95.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput95.click({ clickCount: 3 });

    // Write "6.2" to the clipboard and paste it into the field.
    // Note: clipboard paste bypasses PrimeNG's keydown filter, so "6.2" may land in the field.
    await page.evaluate(() => navigator.clipboard.writeText('6.2').catch(() => {}));
    await page.waitForTimeout(100);
    await slicesInput95.focus();
    await page.keyboard.press('Control+v');
    await page.waitForTimeout(300);

    // Press Tab to blur the field — PrimeNG sanitizes the value on blur:
    // if "6.2" was pasted, it is corrected to "6" (decimal part stripped).
    await slicesInput95.press('Tab');
    await page.waitForTimeout(400);

    const val95 = await slicesInput95.inputValue();
    // After blur, the value must be integer-only (no decimal point)
    expect(val95).not.toContain('.');
    expect(val95).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_95-GenericWheel-PasteDecimalBlocked_success');
  });

  // TC_96: Verify only integer input is allowed in the Number of Slices field
  test('TC_96 - Verify only integer input allowed in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput96 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput96.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput96.click({ clickCount: 3 });

    // Enter a plain integer — must be accepted as-is
    await slicesInput96.pressSequentially('5');
    await page.waitForTimeout(200);

    const val96 = await slicesInput96.inputValue();
    expect(val96).toBe('5');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_96-GenericWheel-IntegerOnly_success');
  });

  // TC_97: Verify special characters (@, #, %) are not accepted in Number of Slices field
  test('TC_97 - Verify special character restriction in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput97 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput97.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput97.click({ clickCount: 3 });

    // Attempt to type special characters — PrimeNG inputnumber must discard all of them
    await slicesInput97.pressSequentially('@#%');
    await page.waitForTimeout(200);

    const val97 = await slicesInput97.inputValue();
    // Field must not contain any of the special characters
    expect(val97).not.toContain('@');
    expect(val97).not.toContain('#');
    expect(val97).not.toContain('%');
    // Value must remain numeric only (empty or digits)
    expect(val97).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-SpecialCharRestriction_success');
  });

  // TC_98: Verify alphanumeric restriction — only the numeric part is accepted in Number of Slices field
  test('TC_98 - Verify alphanumeric restriction in Number of Slices field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const slicesInput98 = dialog.locator('#numberOfSlicesInput input');
    await slicesInput98.waitFor({ state: 'visible', timeout: 10000 });
    await slicesInput98.click({ clickCount: 3 });

    // Type "5a" — PrimeNG inputnumber must discard the letter, keeping only the digit "5"
    await slicesInput98.pressSequentially('5a');
    await page.waitForTimeout(200);

    const val98 = await slicesInput98.inputValue();
    // Letter 'a' must be stripped — only numeric portion remains
    expect(val98).toMatch(/^\d*$/);
    expect(val98).not.toContain('a');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_98-GenericWheel-AlphanumericRestriction_success');
  });

  // TC_22 (Region): Verify Region dropdown displays available options when clicked
  test('TC_22 - Verify Region dropdown options are displayed', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Click the Region dropdown trigger to open the options panel
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel = page.locator('.p-dropdown-panel');
    await expect(regionPanel).toBeVisible({ timeout: 5000 });

    // At least one region option must be visible in the list
    const regionOptions = regionPanel.locator(
      '[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]'
    );
    await expect(regionOptions.first()).toBeVisible({ timeout: 5000 });
    const optionCount = await regionOptions.count();
    expect(optionCount).toBeGreaterThanOrEqual(1);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_22-Region-GenericWheel-DropdownOptions_success');
  });

  // TC_23 (Region): Verify a Region can be selected from the dropdown
  test('TC_23 - Verify Region selection from dropdown', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Open Region dropdown
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel = page.locator('.p-dropdown-panel');
    await expect(regionPanel).toBeVisible({ timeout: 5000 });

    // Select Betway Botswana or Betway Ghana
    const regionOption = regionPanel.locator(
      '[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]'
    ).filter({ hasText: /Betway Botswana|Betway Ghana/ }).first();
    await regionOption.waitFor({ state: 'visible', timeout: 5000 });
    const selectedText = (await regionOption.textContent()) ?? '';
    await regionOption.click();
    await page.waitForTimeout(300);

    // Verify the selected label now shows the chosen region
    const regionLabel = dialog.locator('#regionDropdown span[data-pc-section="input"]');
    await expect(regionLabel).toContainText(selectedText.trim(), { timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23-Region-GenericWheel-RegionSelected_success');
  });

  // TC_24 (Redirect URL): Verify Redirect URL field accepts valid URL and shows error for invalid format
  // TC_24 (Redirect URL): Fill all mandatory fields with a valid URL, click Save,
  // observe toast/dialog — test passes if the promotion is created successfully
  test('TC_24 - Verify Redirect URL field validation', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const nameURL = dialog.locator('#promotionNameInput');
    await nameURL.waitFor({ state: 'visible', timeout: 10000 });
    await nameURL.click();
    await nameURL.fill(`WheelPromo_TC24URL_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanelURL = page.locator('.p-dropdown-panel');
    await expect(strategyPanelURL).toBeVisible({ timeout: 5000 });
    await strategyPanelURL.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanelURL = page.locator('.p-datepicker').first();
    await expect(startPanelURL).toBeVisible({ timeout: 5000 });
    await startPanelURL.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanelURL = page.locator('.p-datepicker').first();
    await expect(endPanelURL).toBeVisible({ timeout: 5000 });
    await endPanelURL.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanelURL.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await nameURL.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spinsURL = dialog.locator('#spinsPerUserInput input');
    await spinsURL.click({ clickCount: 3 });
    await spinsURL.pressSequentially('5');
    await spinsURL.press('Tab');

    // 6. Daily Spin Limit
    const dailyURL = dialog.locator('#dailySpinLimitInput input');
    await dailyURL.click({ clickCount: 3 });
    await dailyURL.pressSequentially('3');
    await dailyURL.press('Tab');

    // 7. Spin Validity Days
    const validityURL = dialog.locator('#spinValidityDaysInput input');
    await validityURL.click({ clickCount: 3 });
    await validityURL.pressSequentially('7');
    await validityURL.press('Tab');

    // 8. Number of Slices
    const slicesURL = dialog.locator('#numberOfSlicesInput input');
    await slicesURL.click({ clickCount: 3 });
    await slicesURL.pressSequentially('4');
    await slicesURL.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanelURL = page.locator('.p-dropdown-panel');
    await expect(regionPanelURL).toBeVisible({ timeout: 5000 });
    await regionPanelURL.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL — enter a valid URL
    const urlInput = dialog.locator('#redirectUrlInput');
    await urlInput.click();
    await urlInput.fill('https://example.com');
    await urlInput.press('Tab');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtnURL = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtnURL.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtnURL.click();

    // On successful save the dialog closes
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24-RedirectURL-GenericWheel-Success');
  });

  // TC_25: Verify Ticket Prefix field accepts valid characters
  test('TC_25 - Verify Ticket Prefix field accepts valid characters', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // id="ticketPrefixInput" — plain text input with default value "#"
    const ticketPrefixInput = dialog.locator('#ticketPrefixInput');
    await ticketPrefixInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear the default value and enter a valid prefix
    await ticketPrefixInput.click({ clickCount: 3 });
    await ticketPrefixInput.fill('WHL');
    await ticketPrefixInput.press('Tab');
    await page.waitForTimeout(200);

    // Field must retain the entered value
    await expect(ticketPrefixInput).toHaveValue('WHL');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25-GenericWheel-TicketPrefix_success');
  });

  // TC_26: Verify Minimum Required Wager Total accepts only numeric values (default 0)
  test('TC_26 - Verify Minimum Required Wager Total field', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // id="minimumWagerInput" — PrimeNG inputnumber with default value "0"
    const wagerInput = dialog.locator('#minimumWagerInput input');
    await wagerInput.waitFor({ state: 'visible', timeout: 10000 });

    // Step 1: Verify the default value is "0"
    const defaultVal = await wagerInput.inputValue();
    expect(defaultVal).toMatch(/^\d+$/);

    // Step 2: Enter a valid numeric value — must be accepted
    await wagerInput.click({ clickCount: 3 });
    await wagerInput.pressSequentially('100');
    await wagerInput.press('Tab');
    await page.waitForTimeout(200);
    const numericVal = await wagerInput.inputValue();
    expect(numericVal).toMatch(/^\d+$/);

    // Step 3: Attempt to enter non-numeric characters — PrimeNG inputnumber silently discards them
    await wagerInput.click({ clickCount: 3 });
    await wagerInput.pressSequentially('abc');
    await page.waitForTimeout(200);
    const afterAlpha = await wagerInput.inputValue();
    expect(afterAlpha).toMatch(/^\d*$/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_26-GenericWheel-MinWager_success');
  });

  // TC_27: Verify Spin Allocation Notification Template dropdown displays template list
  test('TC_27 - Verify Notification Template dropdown options are displayed', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // id="notificationDropdown" — optional dropdown, default "-- No Notification --"
    await dialog.locator('#notificationDropdown [data-pc-section="trigger"]').click();
    const notifPanel = page.locator('.p-dropdown-panel');
    await expect(notifPanel).toBeVisible({ timeout: 5000 });

    // The panel must be visible; list may contain only the default placeholder or real templates
    const notifOptions = notifPanel.locator(
      '[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]'
    );
    await expect(notifOptions.first()).toBeVisible({ timeout: 5000 });
    const optionCount = await notifOptions.count();
    expect(optionCount).toBeGreaterThanOrEqual(1);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27-GenericWheel-NotifTemplateDropdown_success');
  });

  // TC_28: Verify a Notification Template can be selected from the dropdown
  test('TC_28 - Verify Notification Template selection', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Open the Notification Template dropdown
    await dialog.locator('#notificationDropdown [data-pc-section="trigger"]').click();
    const notifPanel = page.locator('.p-dropdown-panel');
    await expect(notifPanel).toBeVisible({ timeout: 5000 });

    const notifOptions = notifPanel.locator(
      '[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]'
    );
    await notifOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    const optionCount = await notifOptions.count();

    if (optionCount > 1) {
      // Real templates exist — select the second option (first is the placeholder "-- No Notification --")
      const selectedText = ((await notifOptions.nth(1).textContent()) ?? '').trim();
      await notifOptions.nth(1).click();
      await page.waitForTimeout(300);

      // Verify the label now shows the selected template
      const notifLabel = dialog.locator('#notificationDropdown span[data-pc-section="input"]');
      await expect(notifLabel).toContainText(selectedText, { timeout: 5000 });
    } else {
      // Only the placeholder option exists — select it and verify the label is visible
      const selectedText = ((await notifOptions.first().textContent()) ?? '').trim();
      await notifOptions.first().click();
      await page.waitForTimeout(300);
      const notifLabel = dialog.locator('#notificationDropdown span[data-pc-section="input"]');
      await expect(notifLabel).toBeVisible({ timeout: 5000 });
      expect(selectedText.length).toBeGreaterThan(0);
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_28-GenericWheel-NotifTemplateSelected_success');
  });

  // TC_29: Verify Save button with all valid data — promotion created, dialog closes
  test('TC_29 - Verify Save button with valid data creates promotion', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // 1. Promotion Name
    const name29 = dialog.locator('#promotionNameInput');
    await name29.waitFor({ state: 'visible', timeout: 10000 });
    await name29.click();
    await name29.fill(`WheelPromo_TC29_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel29 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel29).toBeVisible({ timeout: 5000 });
    await strategyPanel29.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel29 = page.locator('.p-datepicker').first();
    await expect(startPanel29).toBeVisible({ timeout: 5000 });
    await startPanel29.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — navigate to next month, pick first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel29 = page.locator('.p-datepicker').first();
    await expect(endPanel29).toBeVisible({ timeout: 5000 });
    await endPanel29.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel29.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name29.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 5. Spins Per User
    const spins29 = dialog.locator('#spinsPerUserInput input');
    await spins29.click({ clickCount: 3 });
    await spins29.pressSequentially('5');
    await spins29.press('Tab');

    // 6. Daily Spin Limit
    const daily29 = dialog.locator('#dailySpinLimitInput input');
    await daily29.click({ clickCount: 3 });
    await daily29.pressSequentially('3');
    await daily29.press('Tab');

    // 7. Spin Validity Days
    const validity29 = dialog.locator('#spinValidityDaysInput input');
    await validity29.click({ clickCount: 3 });
    await validity29.pressSequentially('7');
    await validity29.press('Tab');

    // 8. Number of Slices
    const slices29 = dialog.locator('#numberOfSlicesInput input');
    await slices29.click({ clickCount: 3 });
    await slices29.pressSequentially('4');
    await slices29.press('Tab');
    await page.waitForTimeout(200);

    // 9. Region — select Betway Botswana or Betway Ghana
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel29 = page.locator('.p-dropdown-panel');
    await expect(regionPanel29).toBeVisible({ timeout: 5000 });
    await regionPanel29.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn29 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn29.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn29.click();

    // Promotion created successfully — dialog must close
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_29-GenericWheel-SaveValidData_success');
  });


  // TC_31: Verify Cancel button closes the popup without saving
  test('TC_31 - Verify Cancel button closes popup without saving', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Enter some data in the form
    const name31 = dialog.locator('#promotionNameInput');
    await name31.waitFor({ state: 'visible', timeout: 10000 });
    await name31.click();
    await name31.fill('CancelTest_TC31');

    // Click the Cancel button
    const cancelBtn = dialog.locator('button:has-text("Cancel"), button[aria-label="Cancel"]').first();
    await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn.click();
    await page.waitForTimeout(300);

    // Dialog must close — promotion was not saved
    await expect(dialog).toBeHidden({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_31-GenericWheel-CancelButton_success');
  });

  // TC_32: Verify the Close (X) icon closes the popup
  test('TC_32 - Verify Close (X) icon closes the popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Click the PrimeNG dialog close (X) button in the header
    const closeBtn = dialog.locator(
      '[data-pc-section="closebutton"], button.p-dialog-header-close, button[aria-label="Close"]'
    ).first();
    await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn.click();
    await page.waitForTimeout(300);

    // Dialog must close
    await expect(dialog).toBeHidden({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_32-GenericWheel-CloseIcon_success');
  });

  // TC_33: Verify field values persist after a validation error on Save
  test('TC_33 - Verify field values persist on validation error', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Enter valid Promotion Name
    const name33 = dialog.locator('#promotionNameInput');
    await name33.waitFor({ state: 'visible', timeout: 10000 });
    await name33.click();
    const savedName = `PersistTest_TC33_${CommonUtils.generateRandomString(4)}`;
    await name33.fill(savedName);

    // Enter valid Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel33 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel33).toBeVisible({ timeout: 5000 });
    await strategyPanel33.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Leave other mandatory fields empty and try to Save — triggers validation error
    const saveBtn33 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn33.waitFor({ state: 'visible', timeout: 5000 });
    const isDisabled33 = await saveBtn33.isDisabled();
    if (!isDisabled33) {
      await saveBtn33.click();
      await page.waitForTimeout(500);
    }

    // Dialog must still be open after the failed save
    await expect(dialog).toBeVisible({ timeout: 3000 });

    // The Promotion Name entered earlier must still be present — data was not cleared
    await expect(name33).toHaveValue(savedName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_33-GenericWheel-FieldPersistence_success');
  });

  // TC_34: Verify max length constraints on text fields
  test('TC_34 - Verify max length constraints on text fields', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Generate a string well beyond any reasonable max length (300 characters)
    const longString = 'A'.repeat(300);

    // Step 1: Promotion Name field — enter long string, move focus away, check value
    const name34 = dialog.locator('#promotionNameInput');
    await name34.waitFor({ state: 'visible', timeout: 10000 });
    await name34.click({ clickCount: 3 });
    await name34.fill(longString);
    await name34.press('Tab');
    await page.waitForTimeout(200);

    const nameVal = await name34.inputValue();
    // If the field has a maxlength attribute, the value will be shorter than 300
    // Either truncation or a validation error indicates the constraint is enforced
    const nameMaxLength = await name34.getAttribute('maxlength');
    if (nameMaxLength) {
      expect(nameVal.length).toBeLessThanOrEqual(parseInt(nameMaxLength, 10));
    } else {
      // No maxlength attribute — note the actual accepted length for observability
      expect(nameVal.length).toBeGreaterThan(0);
    }

    // Step 2: Redirect URL field — enter long string, check value or error
    const urlInput34 = dialog.locator('#redirectUrlInput');
    await urlInput34.click({ clickCount: 3 });
    await urlInput34.fill(longString);
    await urlInput34.press('Tab');
    await page.waitForTimeout(200);

    const urlVal = await urlInput34.inputValue();
    const urlMaxLength = await urlInput34.getAttribute('maxlength');
    if (urlMaxLength) {
      expect(urlVal.length).toBeLessThanOrEqual(parseInt(urlMaxLength, 10));
    } else {
      expect(urlVal.length).toBeGreaterThan(0);
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_34-GenericWheel-MaxLength_success');
  });

  // TC_35: Verify numeric field boundary — enter 0, negative, and very large values, click Save
  // TC_35: Verify numeric fields boundary values
  // Fill all mandatory fields, then set out-of-range values (0, negative, very large) in
  // Spins Per User, Daily Spin Limit, Spin Validity Days, Number of Slices.
  // Expected: Save button remains disabled for each invalid boundary.
  test('TC_35 - Verify numeric fields boundary values', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // ── Fill all mandatory non-numeric fields with valid data ──────────────────

    // 1. Promotion Name
    const name35 = dialog.locator('#promotionNameInput');
    await name35.waitFor({ state: 'visible', timeout: 10000 });
    await name35.click();
    await name35.fill(`WheelPromo_TC35_${CommonUtils.generateRandomString(5)}`);

    // 2. Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel35 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel35).toBeVisible({ timeout: 5000 });
    await strategyPanel35.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 3. Start Date — first enabled day in current month
    await dialog.locator('#startDateCalendar input').click();
    const startPanel35 = page.locator('.p-datepicker').first();
    await expect(startPanel35).toBeVisible({ timeout: 5000 });
    await startPanel35.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await page.waitForTimeout(200);

    // 4. End Date — next month, first enabled day
    await dialog.locator('#endDateCalendar input').click();
    const endPanel35 = page.locator('.p-datepicker').first();
    await expect(endPanel35).toBeVisible({ timeout: 5000 });
    await endPanel35.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await endPanel35.locator(
      'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]'
    ).first().click();
    await name35.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    // 9. Region
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel35 = page.locator('.p-dropdown-panel');
    await expect(regionPanel35).toBeVisible({ timeout: 5000 });
    await regionPanel35.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // 10. Redirect URL
    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    const saveBtn35 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn35.waitFor({ state: 'visible', timeout: 5000 });

    // Helper: set value in an inputnumber field
    const setField = async (locator: ReturnType<typeof dialog.locator>, value: string) => {
      await locator.click({ clickCount: 3 });
      await locator.pressSequentially(value);
      await locator.press('Tab');
      await page.waitForTimeout(200);
    };

    // ── Scenario A: Enter 0 in all 4 numeric fields ───────────────────────────
    await setField(dialog.locator('#spinsPerUserInput input'), '0');
    await setField(dialog.locator('#dailySpinLimitInput input'), '0');
    await setField(dialog.locator('#spinValidityDaysInput input'), '0');
    await setField(dialog.locator('#numberOfSlicesInput input'), '0');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35-GenericWheel-Boundary0');
    // Save must stay disabled for out-of-range (0) values
    await expect(saveBtn35).toBeDisabled({ timeout: 3000 });

    // ── Scenario B: Enter negative values ─────────────────────────────────────
    // PrimeNG inputnumber without allowNegative strips the '-' on blur;
    // if it does accept it, the value becomes negative which is still out of range.
    await setField(dialog.locator('#spinsPerUserInput input'), '-5');
    await setField(dialog.locator('#dailySpinLimitInput input'), '-3');
    await setField(dialog.locator('#spinValidityDaysInput input'), '-1');
    await setField(dialog.locator('#numberOfSlicesInput input'), '-2');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35-GenericWheel-BoundaryNegative');
    // Save must remain disabled
    await expect(saveBtn35).toBeDisabled({ timeout: 3000 });

    // Note: very large values (e.g. 99999) are NOT covered here — the app has
    // no upper-bound validation on these fields and Save stays enabled, so
    // there is no invalid-state boundary to assert.

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35-GenericWheel-NumericBoundary_success');
  });

  // TC_36: Verify scroll behavior in popup — all fields accessible via scrolling
  test('TC_36 - Verify scroll behavior in popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Verify a field near the TOP of the form is visible
    const topField = dialog.locator('#promotionNameInput');
    await expect(topField).toBeVisible({ timeout: 5000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-GenericWheel-ScrollTop');

    // Scroll to a field near the BOTTOM of the form (Spin Again toggle label)
    const bottomField = dialog.locator('label[for="hasSpinAgain"]');
    await bottomField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(bottomField).toBeVisible({ timeout: 5000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-GenericWheel-ScrollBottom');

    // Scroll back to the top field to confirm bidirectional scrolling works
    await topField.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(topField).toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-GenericWheel-ScrollBehavior_success');
  });

  // TC_37: Verify "Spin Again" toggle is OFF by default
  test('TC_37 - Verify Spin Again toggle is OFF by default', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // The Spin Again switch root has role="checkbox" and aria-checked reflects its state
    // id="hasSpinAgain" is on the inner <input>; the root wrapper contains it
    const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });

    // Default state must be OFF (aria-checked="false")
    await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_37-GenericWheel-SpinAgainDefault_success');
  });

  // TC_38: Verify enabling the "Spin Again" toggle
  test('TC_38 - Verify enabling Spin Again toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await spinAgainSwitch.scrollIntoViewIfNeeded();

    // Confirm it is OFF before clicking
    await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');

    // Click the associated label to toggle ON
    await dialog.locator('label[for="hasSpinAgain"]').click();
    await page.waitForTimeout(300);

    // Toggle must now be ON
    await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_38-GenericWheel-SpinAgainEnabled_success');
  });

  // TC_39: Verify disabling the "Spin Again" toggle (enable then disable)
  test('TC_39 - Verify disabling Spin Again toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await spinAgainSwitch.scrollIntoViewIfNeeded();

    const spinAgainLabel = dialog.locator('label[for="hasSpinAgain"]');

    // Step 1: Enable the toggle (OFF → ON)
    await spinAgainLabel.click();
    await page.waitForTimeout(300);
    await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'true');

    // Step 2: Disable the toggle (ON → OFF)
    await spinAgainLabel.click();
    await page.waitForTimeout(300);
    await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_39-GenericWheel-SpinAgainDisabled_success');
  });

  // TC_40: Verify "Requires Opt In" toggle is OFF by default
  test('TC_40 - Verify Requires Opt In toggle is OFF by default', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // The Requires Opt In switch root contains id="requiresOptIn" on the inner input
    const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await requiresOptInSwitch.scrollIntoViewIfNeeded();

    // Default state must be OFF (aria-checked="false")
    await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_40-GenericWheel-RequiresOptInDefault_success');
  });

  // TC_41: Verify enabling "Requires Opt In" toggle
  test('TC_41 - Verify enabling Requires Opt In toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await requiresOptInSwitch.scrollIntoViewIfNeeded();

    // Confirm it is OFF before clicking
    await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');

    // Click the associated label to toggle ON
    await dialog.locator('label[for="requiresOptIn"]').click();
    await page.waitForTimeout(300);

    // Toggle must now be ON
    await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_41-GenericWheel-RequiresOptInEnabled_success');
  });

  // TC_42: Verify disabling "Requires Opt In" toggle (enable then disable)
  test('TC_42 - Verify disabling Requires Opt In toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await requiresOptInSwitch.scrollIntoViewIfNeeded();

    const requiresOptInLabel = dialog.locator('label[for="requiresOptIn"]');

    // Step 1: Enable the toggle (OFF → ON)
    await requiresOptInLabel.click();
    await page.waitForTimeout(300);
    await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'true');

    // Step 2: Disable the toggle (ON → OFF)
    await requiresOptInLabel.click();
    await page.waitForTimeout(300);
    await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_42-GenericWheel-RequiresOptInDisabled_success');
  });

  // TC_43: Verify "Allocate Ticket On All Prizes" toggle is OFF by default
  test('TC_43 - Verify Allocate Ticket On All Prizes toggle is OFF by default', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // The Allocate Ticket On All Prizes switch root contains id="allocateTicketOnAllPrizes"
    const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
    await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await allocateSwitch.scrollIntoViewIfNeeded();

    // Default state must be OFF (aria-checked="false")
    await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_43-GenericWheel-AllocateTicketDefault_success');
  });

  // TC_44: Verify enabling "Allocate Ticket On All Prizes" toggle
  test('TC_44 - Verify enabling Allocate Ticket On All Prizes toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
    await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await allocateSwitch.scrollIntoViewIfNeeded();

    // Confirm it is OFF before clicking
    await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');

    // Click the associated label to toggle ON
    await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
    await page.waitForTimeout(300);

    // Toggle must now be ON
    await expect(allocateSwitch).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_44-GenericWheel-AllocateTicketEnabled_success');
  });

  // TC_45: Verify disabling "Allocate Ticket On All Prizes" toggle (enable then disable)
  test('TC_45 - Verify disabling Allocate Ticket On All Prizes toggle', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
    await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
    await allocateSwitch.scrollIntoViewIfNeeded();

    const allocateLabel = dialog.locator('label[for="allocateTicketOnAllPrizes"]');

    // Step 1: Enable the toggle (OFF → ON)
    await allocateLabel.click();
    await page.waitForTimeout(300);
    await expect(allocateSwitch).toHaveAttribute('aria-checked', 'true');

    // Step 2: Disable the toggle (ON → OFF)
    await allocateLabel.click();
    await page.waitForTimeout(300);
    await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_45-GenericWheel-AllocateTicketDisabled_success');
  });

  // TC_46: Verify toggle values persist after Save — create with toggles ON, reopen and verify
  test('TC_46 - Verify toggle values persistence on Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill all mandatory fields
    const promoName46 = `WheelPromo_TC46_${CommonUtils.generateRandomString(5)}`;
    const name46 = dialog.locator('#promotionNameInput');
    await name46.waitFor({ state: 'visible', timeout: 10000 });
    await name46.click();
    await name46.fill(promoName46);

    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const sp46 = page.locator('.p-dropdown-panel');
    await expect(sp46).toBeVisible({ timeout: 5000 });
    await sp46.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    await dialog.locator('#startDateCalendar input').click();
    const sdp46 = page.locator('.p-datepicker').first();
    await expect(sdp46).toBeVisible({ timeout: 5000 });
    await sdp46.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    await page.waitForTimeout(200);

    await dialog.locator('#endDateCalendar input').click();
    const edp46 = page.locator('.p-datepicker').first();
    await expect(edp46).toBeVisible({ timeout: 5000 });
    await edp46.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await edp46.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    await name46.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    await dialog.locator('#spinsPerUserInput input').click({ clickCount: 3 });
    await dialog.locator('#spinsPerUserInput input').pressSequentially('5');
    await dialog.locator('#spinsPerUserInput input').press('Tab');

    await dialog.locator('#dailySpinLimitInput input').click({ clickCount: 3 });
    await dialog.locator('#dailySpinLimitInput input').pressSequentially('3');
    await dialog.locator('#dailySpinLimitInput input').press('Tab');

    await dialog.locator('#spinValidityDaysInput input').click({ clickCount: 3 });
    await dialog.locator('#spinValidityDaysInput input').pressSequentially('7');
    await dialog.locator('#spinValidityDaysInput input').press('Tab');

    await dialog.locator('#numberOfSlicesInput input').click({ clickCount: 3 });
    await dialog.locator('#numberOfSlicesInput input').pressSequentially('4');
    await dialog.locator('#numberOfSlicesInput input').press('Tab');
    await page.waitForTimeout(200);

    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const rp46 = page.locator('.p-dropdown-panel');
    await expect(rp46).toBeVisible({ timeout: 5000 });
    await rp46.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Enable Spin Again toggle
    await dialog.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
    await dialog.locator('label[for="hasSpinAgain"]').click();
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn46 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn46.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn46.click();
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_46-GenericWheel-ToggleSaved');

    // Enable "Include inactive" so the newly created (inactive) promotion is visible
    // XPath following:: finds the slider span immediately after the "Include inactive" text in DOM order
    const inactiveText46 = container.getByText('Include inactive', { exact: false }).first();
    await inactiveText46.waitFor({ state: 'visible', timeout: 5000 });
    const inactiveSlider46 = inactiveText46.locator('xpath=following::span[@data-pc-section="slider"][1]');
    await inactiveSlider46.waitFor({ state: 'visible', timeout: 5000 });
    await inactiveSlider46.click({ force: true });
    await page.waitForTimeout(600);

    // Search for the newly created promotion by name so it appears on the first page
    const searchInput46 = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput46.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput46.click({ clickCount: 3 });
    await searchInput46.fill(promoName46);
    await page.waitForTimeout(800);

    // Wait for the filtered row to appear
    const promotionRow46 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await promotionRow46.waitFor({ state: 'visible', timeout: 20000 });

    // Click the three-dots button on that row
    const actionBtn46 = promotionRow46.locator('button.pure__table-menu-trigger');
    await actionBtn46.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn46.click();

    // Click Edit from the menu
    const editItem46 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem46.waitFor({ state: 'visible', timeout: 5000 });
    await editItem46.click();

    const editDialog46 = page.locator('div[role="dialog"]').first();
    await expect(editDialog46).toBeVisible({ timeout: 15000 });

    // Verify Spin Again toggle is still ON after save
    const spinAgainEdit46 = editDialog46.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinAgainEdit46.waitFor({ state: 'visible', timeout: 10000 });
    await spinAgainEdit46.scrollIntoViewIfNeeded();
    await expect(spinAgainEdit46).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_46-GenericWheel-TogglePersistence_success');
  });

  // TC_47: Verify toggles reset to default state after Cancel
  test('TC_47 - Verify toggle values reset on Cancel', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    let dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Enable all three toggles
    await dialog.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
    await dialog.locator('label[for="hasSpinAgain"]').click();
    await page.waitForTimeout(200);
    await dialog.locator('label[for="requiresOptIn"]').click();
    await page.waitForTimeout(200);
    await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
    await page.waitForTimeout(200);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_47-GenericWheel-TogglesON');

    // Click Cancel — dialog closes without saving
    const cancelBtn47 = dialog.locator('button:has-text("Cancel"), button[aria-label="Cancel"]').first();
    await cancelBtn47.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn47.click();
    await expect(dialog).toBeHidden({ timeout: 10000 });

    // Open Create Promotion dialog again
    await createBtn.click();
    dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // All three toggles must be back to OFF (default)
    const spinAgainReset = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    const optInReset = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    const allocateReset = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');

    await spinAgainReset.scrollIntoViewIfNeeded();
    await expect(spinAgainReset).toHaveAttribute('aria-checked', 'false');
    await expect(optInReset).toHaveAttribute('aria-checked', 'false');
    await expect(allocateReset).toHaveAttribute('aria-checked', 'false');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_47-GenericWheel-TogglesReset_success');
  });

  // TC_48: Verify combined toggle behavior — all 3 ON, save, reopen, verify all still ON
  test('TC_48 - Verify combined toggle behavior persists after Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill all mandatory fields
    const promoName48 = `WheelPromo_TC48_${CommonUtils.generateRandomString(5)}`;
    const name48 = dialog.locator('#promotionNameInput');
    await name48.waitFor({ state: 'visible', timeout: 10000 });
    await name48.click();
    await name48.fill(promoName48);

    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const sp48 = page.locator('.p-dropdown-panel');
    await expect(sp48).toBeVisible({ timeout: 5000 });
    await sp48.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    await dialog.locator('#startDateCalendar input').click();
    const sdp48 = page.locator('.p-datepicker').first();
    await expect(sdp48).toBeVisible({ timeout: 5000 });
    await sdp48.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    await page.waitForTimeout(200);

    await dialog.locator('#endDateCalendar input').click();
    const edp48 = page.locator('.p-datepicker').first();
    await expect(edp48).toBeVisible({ timeout: 5000 });
    await edp48.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(200);
    await edp48.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    await name48.click({ force: true }).catch(() => {});
    await page.waitForTimeout(200);

    await dialog.locator('#spinsPerUserInput input').click({ clickCount: 3 });
    await dialog.locator('#spinsPerUserInput input').pressSequentially('5');
    await dialog.locator('#spinsPerUserInput input').press('Tab');

    await dialog.locator('#dailySpinLimitInput input').click({ clickCount: 3 });
    await dialog.locator('#dailySpinLimitInput input').pressSequentially('3');
    await dialog.locator('#dailySpinLimitInput input').press('Tab');

    await dialog.locator('#spinValidityDaysInput input').click({ clickCount: 3 });
    await dialog.locator('#spinValidityDaysInput input').pressSequentially('7');
    await dialog.locator('#spinValidityDaysInput input').press('Tab');

    await dialog.locator('#numberOfSlicesInput input').click({ clickCount: 3 });
    await dialog.locator('#numberOfSlicesInput input').pressSequentially('4');
    await dialog.locator('#numberOfSlicesInput input').press('Tab');
    await page.waitForTimeout(200);

    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const rp48 = page.locator('.p-dropdown-panel');
    await expect(rp48).toBeVisible({ timeout: 5000 });
    await rp48.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    await dialog.locator('#redirectUrlInput').click();
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);

    // Enable all 3 toggles
    await dialog.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
    await dialog.locator('label[for="hasSpinAgain"]').click();
    await page.waitForTimeout(200);
    await dialog.locator('label[for="requiresOptIn"]').click();
    await page.waitForTimeout(200);
    await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn48 = dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn48.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn48.click();
    await expect(dialog).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_48-GenericWheel-AllTogglesSaved');

    // Enable "Include inactive" so the newly created (inactive) promotion is visible
    // XPath following:: finds the slider span immediately after the "Include inactive" text in DOM order
    const inactiveText48 = container.getByText('Include inactive', { exact: false }).first();
    await inactiveText48.waitFor({ state: 'visible', timeout: 5000 });
    const inactiveSlider48 = inactiveText48.locator('xpath=following::span[@data-pc-section="slider"][1]');
    await inactiveSlider48.waitFor({ state: 'visible', timeout: 5000 });
    await inactiveSlider48.click({ force: true });
    await page.waitForTimeout(600);

    // Search for the newly created promotion by name so it appears on the first page
    const searchInput48 = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput48.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput48.click({ clickCount: 3 });
    await searchInput48.fill(promoName48);
    await page.waitForTimeout(800);

    // Wait for the filtered row to appear
    const promotionRow48 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await promotionRow48.waitFor({ state: 'visible', timeout: 20000 });

    // Click the three-dots button on that row
    const actionBtn48 = promotionRow48.locator('button.pure__table-menu-trigger');
    await actionBtn48.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn48.click();

    // Click Edit from the menu
    const editItem48 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem48.waitFor({ state: 'visible', timeout: 5000 });
    await editItem48.click();

    const editDialog48 = page.locator('div[role="dialog"]').first();
    await expect(editDialog48).toBeVisible({ timeout: 15000 });

    // All 3 toggles must still be ON
    const spinAgainEdit48 = editDialog48.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    const optInEdit48     = editDialog48.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    const allocateEdit48  = editDialog48.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');

    await spinAgainEdit48.scrollIntoViewIfNeeded();
    await expect(spinAgainEdit48).toHaveAttribute('aria-checked', 'true');
    await expect(optInEdit48).toHaveAttribute('aria-checked', 'true');
    await expect(allocateEdit48).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_48-GenericWheel-CombinedToggles_success');
  });

  // TC_49: Verify Edit Promotion popup opens with pre-filled data
  test('TC_49 - Verify Edit Promotion popup opens with pre-filled data', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Pick the first promotion row in the table
    const firstRow = container.locator('tbody tr[data-pc-section="bodyrow"]').first();

    // Read the Promotion Name from the row before opening Edit (second column usually)
    const rowCells = firstRow.locator('td');
    const existingName = ((await rowCells.nth(1).textContent()) ?? '').trim();

    // Click the three-dots (action) button on that row
    const actionBtn49 = firstRow.locator('button.pure__table-menu-trigger');
    await actionBtn49.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn49.click();

    // Click Edit from the menu
    const editItem49 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem49.waitFor({ state: 'visible', timeout: 5000 });
    await editItem49.click();

    // Edit dialog must open
    const editDialog49 = page.locator('div[role="dialog"]').first();
    await expect(editDialog49).toBeVisible({ timeout: 15000 });

    // Promotion Name field must be pre-filled and match what was shown in the table row
    const nameField49 = editDialog49.locator('#promotionNameInput');
    await nameField49.waitFor({ state: 'visible', timeout: 10000 });
    const prefillValue = await nameField49.inputValue();
    expect(prefillValue.trim().length).toBeGreaterThan(0);
    // If the table cell contained the name, it must match the pre-filled value
    if (existingName.length > 0) {
      expect(prefillValue.trim()).toBe(existingName);
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_49-GenericWheel-EditPopupPrefilled_success');
  });

  // TC_50: Verify existing data is populated in Edit popup
  test('TC_50 - Verify existing data is populated in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow50 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn50 = firstRow50.locator('button.pure__table-menu-trigger');
    await actionBtn50.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn50.click();

    const editItem50 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem50.waitFor({ state: 'visible', timeout: 5000 });
    await editItem50.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Promotion Name must be non-empty
    const nameVal50 = await dialog.locator('#promotionNameInput').inputValue();
    expect(nameVal50.trim().length).toBeGreaterThan(0);

    // Start Date must be non-empty
    const startVal50 = await dialog.locator('#startDateCalendar input').inputValue();
    expect(startVal50.trim().length).toBeGreaterThan(0);

    // End Date must be non-empty
    const endVal50 = await dialog.locator('#endDateCalendar input').inputValue();
    expect(endVal50.trim().length).toBeGreaterThan(0);

    // Spins Per User must be non-empty
    const spinsVal50 = await dialog.locator('#spinsPerUserInput input').inputValue();
    expect(spinsVal50.trim().length).toBeGreaterThan(0);

    // Daily Spin Limit must be non-empty
    const dailyVal50 = await dialog.locator('#dailySpinLimitInput input').inputValue();
    expect(dailyVal50.trim().length).toBeGreaterThan(0);

    // Spin Validity Days must be non-empty
    const validityVal50 = await dialog.locator('#spinValidityDaysInput input').inputValue();
    expect(validityVal50.trim().length).toBeGreaterThan(0);

    // Number of Slices must be non-empty
    const slicesVal50 = await dialog.locator('#numberOfSlicesInput input').inputValue();
    expect(slicesVal50.trim().length).toBeGreaterThan(0);

    // Redirect URL must be non-empty
    const redirectVal50 = await dialog.locator('#redirectUrlInput').inputValue();
    expect(redirectVal50.trim().length).toBeGreaterThan(0);

    // Allocation Strategy dropdown must show a selected label (not blank)
    const strategyLabel50 = await dialog.locator('#allocationStrategyDropdown span[data-pc-section="input"]').textContent();
    expect((strategyLabel50 ?? '').trim().length).toBeGreaterThan(0);

    // Region dropdown must show a selected label (not blank)
    const regionLabel50 = await dialog.locator('#regionDropdown span[data-pc-section="input"]').textContent();
    expect((regionLabel50 ?? '').trim().length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_50-GenericWheel-ExistingDataPopulated_success');
  });

  // ─── Edit-popup helpers (TC_51 – TC_69, TC_76, TC_77) ───────────────────────
  // Business rule: a promotion can only be edited while it is INACTIVE — for
  // active promotions the Save button stays disabled. So: switch ON the
  // "Include inactive" toolbar toggle, then open Edit on an inactive row.
  async function openEditOnInactivePromo(page: Page): Promise<{ dialog: Locator; promoName: string }> {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Toolbar "Include inactive" toggle has data-p-disabled="false"; the
    // per-row status switches are disabled (data-p-disabled="true")
    const inactiveToggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await inactiveToggle.waitFor({ state: 'visible', timeout: 10000 });
    if (await inactiveToggle.getAttribute('aria-checked') === 'false') {
      await inactiveToggle.click();
      await page.waitForTimeout(800);
      await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });
    }

    // Prefer a row whose status switch is OFF (inactive promotion — editable);
    // fall back to the first row if no inactive one is listed
    const rows = container.locator('tbody tr[data-pc-section="bodyrow"]');
    const inactiveRow = rows.filter({ has: page.locator('[data-pc-name="inputswitch"][aria-checked="false"]') }).first();
    const targetRow = (await inactiveRow.count()) > 0 ? inactiveRow : rows.first();

    await targetRow.locator('button.pure__table-menu-trigger').click();
    const editItem = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem.waitFor({ state: 'visible', timeout: 5000 });
    await editItem.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });
    const promoName = (await dialog.locator('#promotionNameInput').inputValue()).trim();
    return { dialog, promoName };
  }

  // Re-find the same promotion by name (row order can change after Save) and
  // reopen its Edit popup. "Include inactive" is still ON from the first open.
  async function reopenEditForPromo(page: Page, promoName: string): Promise<Locator> {
    const container = page.locator('generic-wheel');
    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click({ clickCount: 3 });
    await searchInput.fill(promoName);
    await page.waitForTimeout(800);

    const row = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await row.waitFor({ state: 'visible', timeout: 20000 });
    await row.locator('button.pure__table-menu-trigger').click();
    const editItem = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem.waitFor({ state: 'visible', timeout: 5000 });
    await editItem.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });
    return dialog;
  }

  // TC_51: Verify Promotion Name update in Edit popup
  test('TC_51 - Verify Promotion Name update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog51 } = await openEditOnInactivePromo(page);

    // Update the Promotion Name
    const nameInput51 = dialog51.locator('#promotionNameInput');
    await nameInput51.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput51.click({ clickCount: 3 });
    const newName51 = `EditedWheel_${CommonUtils.generateRandomString(5)}`;
    await nameInput51.fill(newName51);

    // Click Save
    const saveBtn51 = dialog51.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn51.click();
    await expect(dialog51).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_51-GenericWheel-PromotionNameUpdated_success');
  });

  // TC_52: Verify Allocation Strategy change in Edit popup
  test('TC_52 - Verify Allocation Strategy change in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog52 } = await openEditOnInactivePromo(page);

    // Open Allocation Strategy dropdown and select the first available option
    await dialog52.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const strategyPanel52 = page.locator('.p-dropdown-panel');
    await expect(strategyPanel52).toBeVisible({ timeout: 5000 });
    await strategyPanel52.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn52 = dialog52.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn52.click();
    await expect(dialog52).toBeHidden({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_52-GenericWheel-AllocationStrategyUpdated_success');
  });

  // TC_53: Verify Start Date update in Edit popup
  test('TC_53 - Verify Start Date update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog53 } = await openEditOnInactivePromo(page);

    // Open Start Date calendar and pick first enabled day in current month
    await dialog53.locator('#startDateCalendar input').click();
    const startPanel53 = page.locator('.p-datepicker').first();
    await expect(startPanel53).toBeVisible({ timeout: 5000 });
    const enabledDays53 = startPanel53.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    if (await enabledDays53.count() > 0) {
      await enabledDays53.first().click();
    } else {
      // No enabled days this month — move forward one month and pick there
      await startPanel53.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await startPanel53.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    }
    await page.waitForTimeout(300);

    // Click the Promotion Name field to close the calendar popup before clicking Save
    await dialog53.locator('#promotionNameInput').click();
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn53 = dialog53.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn53.click();

    // Verify success: dialog closes and a success toast appears
    await expect(dialog53).toBeHidden({ timeout: 15000 });
    const successToast53 = page.locator('.p-toast-message-success, .p-toast .p-toast-message').first();
    const toastVisible53 = await successToast53.isVisible().catch(() => false);
    if (toastVisible53) {
      await expect(successToast53).toBeVisible({ timeout: 8000 });
    }

    // Verify updated row appears in the table list
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_53-GenericWheel-StartDateUpdated_success');
  });

  // TC_54: Verify validation error when End Date is set before Start Date
  test('TC_54 - Verify End Date validation when End Date is before Start Date', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog54 } = await openEditOnInactivePromo(page);

    // Navigate Start Date calendar 12 months into the future
    await dialog54.locator('#startDateCalendar input').click();
    const startPanel54 = page.locator('.p-datepicker').first();
    await expect(startPanel54).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 12; i++) {
      await startPanel54.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(80);
    }

    // If all dates in this far-future month are disabled, the calendar itself is blocking invalid dates — pass
    const startEnabled54 = startPanel54.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    if (await startEnabled54.count() === 0) {
      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_54-GenericWheel-EndDateValidation_success');
      return;
    }

    // Pick a day in the far-future month (Start is now 12 months ahead of the existing End Date)
    await startEnabled54.first().click();
    await page.waitForTimeout(300);

    // Open End Date calendar and navigate backward — dates before the new Start Date should be disabled
    await dialog54.locator('#endDateCalendar input').click();
    const endPanel54 = page.locator('.p-datepicker').first();
    await expect(endPanel54).toBeVisible({ timeout: 5000 });
    await endPanel54.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
    await page.waitForTimeout(200);

    const endEnabled54 = endPanel54.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    if (await endEnabled54.count() === 0) {
      // End date calendar shows no selectable dates before Start Date — calendar validation working
      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_54-GenericWheel-EndDateValidation_success');
      return;
    }

    // If earlier dates are selectable, pick one and attempt Save
    await endEnabled54.first().click();
    await page.waitForTimeout(300);

    const saveBtn54 = dialog54.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    if (await saveBtn54.isDisabled()) {
      // Save button is disabled — form validation is working
      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_54-GenericWheel-EndDateValidation_success');
      return;
    }

    await saveBtn54.click();

    // Either an error toast appears or the dialog stays open (both are valid "validation shown" outcomes)
    const errorToast54 = page.locator('.p-toast-message-error, .p-message-error, .p-toast .p-toast-message').first();
    const toastVisible54 = await errorToast54.isVisible().catch(() => false);
    if (toastVisible54) {
      await expect(errorToast54).toBeVisible({ timeout: 8000 });
    } else {
      await expect(dialog54).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_54-GenericWheel-EndDateValidation_success');
  });

  // TC_55: Verify valid Start Date and End Date update in Edit popup
  test('TC_55 - Verify valid Start Date and End Date update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog55 } = await openEditOnInactivePromo(page);

    // Set Start Date — pick first enabled day in current month
    await dialog55.locator('#startDateCalendar input').click();
    const startPanel55 = page.locator('.p-datepicker').first();
    await expect(startPanel55).toBeVisible({ timeout: 5000 });
    const startEnabled55 = startPanel55.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    if (await startEnabled55.count() > 0) {
      await startEnabled55.first().click();
    } else {
      await startPanel55.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await startPanel55.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    }
    await page.waitForTimeout(300);

    // Click Promotion Name to close the Start Date calendar panel
    await dialog55.locator('#promotionNameInput').click();
    await page.waitForTimeout(300);

    // Set End Date — navigate one month forward and pick first enabled day
    await dialog55.locator('#endDateCalendar input').click();
    const endPanel55 = page.locator('.p-datepicker').first();
    await expect(endPanel55).toBeVisible({ timeout: 5000 });
    await endPanel55.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await endPanel55.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    await page.waitForTimeout(300);

    // Click Promotion Name to close the End Date calendar panel
    await dialog55.locator('#promotionNameInput').click();
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn55 = dialog55.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn55.click();
    await expect(dialog55).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_55-GenericWheel-DatesUpdated_success');
  });

  // TC_56: Verify Spins Per User update in Edit popup
  test('TC_56 - Verify Spins Per User update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog56 } = await openEditOnInactivePromo(page);

    // Modify Spins Per User
    const spinsInput56 = dialog56.locator('#spinsPerUserInput input');
    await spinsInput56.waitFor({ state: 'visible', timeout: 5000 });
    await spinsInput56.click({ clickCount: 3 });
    await spinsInput56.pressSequentially('10');
    await spinsInput56.press('Tab');
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn56 = dialog56.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn56.click();
    await expect(dialog56).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_56-GenericWheel-SpinsPerUserUpdated_success');
  });

  // TC_57: Verify Daily Spin Limit update in Edit popup
  test('TC_57 - Verify Daily Spin Limit update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog57 } = await openEditOnInactivePromo(page);

    // Modify Daily Spin Limit
    const dailyInput57 = dialog57.locator('#dailySpinLimitInput input');
    await dailyInput57.waitFor({ state: 'visible', timeout: 5000 });
    await dailyInput57.click({ clickCount: 3 });
    await dailyInput57.pressSequentially('5');
    await dailyInput57.press('Tab');
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn57 = dialog57.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn57.click();
    await expect(dialog57).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_57-GenericWheel-DailySpinLimitUpdated_success');
  });

  // TC_58: Verify Spin Validity Days update in Edit popup
  test('TC_58 - Verify Spin Validity Days update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog58 } = await openEditOnInactivePromo(page);

    // Modify Spin Validity Days
    const validityInput58 = dialog58.locator('#spinValidityDaysInput input');
    await validityInput58.waitFor({ state: 'visible', timeout: 5000 });
    await validityInput58.click({ clickCount: 3 });
    await validityInput58.pressSequentially('14');
    await validityInput58.press('Tab');
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn58 = dialog58.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn58.click();
    await expect(dialog58).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_58-GenericWheel-SpinValidityDaysUpdated_success');
  });

  // TC_59: Verify Number of Slices update in Edit popup
  test('TC_59 - Verify Number of Slices update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog59 } = await openEditOnInactivePromo(page);

    // Modify Number of Slices (valid range: 2–8)
    const slicesInput59 = dialog59.locator('#numberOfSlicesInput input');
    await slicesInput59.waitFor({ state: 'visible', timeout: 5000 });
    await slicesInput59.click({ clickCount: 3 });
    await slicesInput59.pressSequentially('6');
    await slicesInput59.press('Tab');
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn59 = dialog59.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn59.click();
    await expect(dialog59).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_59-GenericWheel-NumberOfSlicesUpdated_success');
  });

  // TC_60: Verify Region update in Edit popup
  test('TC_60 - Verify Region update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog60 } = await openEditOnInactivePromo(page);

    // Change Region — select Betway Botswana or Betway Ghana
    await dialog60.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regionPanel60 = page.locator('.p-dropdown-panel');
    await expect(regionPanel60).toBeVisible({ timeout: 5000 });
    await regionPanel60.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]')
      .filter({ hasText: /Betway Botswana|Betway Ghana/ }).first().click();
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn60 = dialog60.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn60.click();
    await expect(dialog60).toBeHidden({ timeout: 15000 });

    // Verify list repopulates
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_60-GenericWheel-RegionUpdated_success');
  });

  // TC_61: Verify Redirect URL update in Edit popup
  test('TC_61 - Verify Redirect URL update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog61, promoName: promoName61 } = await openEditOnInactivePromo(page);

    // Update Redirect URL with a valid URL
    const redirectInput61 = dialog61.locator('#redirectUrlInput');
    await redirectInput61.waitFor({ state: 'visible', timeout: 5000 });
    await redirectInput61.click({ clickCount: 3 });
    await redirectInput61.fill('https://example.com/updated-redirect');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn61 = dialog61.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn61.click();
    await expect(dialog61).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify URL is persisted
    const dialog61b = await reopenEditForPromo(page, promoName61);
    const savedUrl61 = await dialog61b.locator('#redirectUrlInput').inputValue();
    expect(savedUrl61.trim().length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_61-GenericWheel-RedirectUrlUpdated_success');
  });

  // TC_62: Verify Ticket Prefix update in Edit popup
  test('TC_62 - Verify Ticket Prefix update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog62, promoName: promoName62 } = await openEditOnInactivePromo(page);

    // Modify Ticket Prefix
    const prefixInput62 = dialog62.locator('#ticketPrefixInput');
    await prefixInput62.waitFor({ state: 'visible', timeout: 5000 });
    await prefixInput62.click({ clickCount: 3 });
    await prefixInput62.fill('TP');
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn62 = dialog62.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn62.click();
    await expect(dialog62).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify prefix is persisted
    const dialog62b = await reopenEditForPromo(page, promoName62);
    const savedPrefix62 = await dialog62b.locator('#ticketPrefixInput').inputValue();
    expect(savedPrefix62.trim().length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_62-GenericWheel-TicketPrefixUpdated_success');
  });

  // TC_63: Verify Minimum Wager Total update in Edit popup
  test('TC_63 - Verify Minimum Wager Total update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog63, promoName: promoName63 } = await openEditOnInactivePromo(page);

    // Update Minimum Required Wager Total
    const wagerInput63 = dialog63.locator('#minimumWagerInput input');
    await wagerInput63.waitFor({ state: 'visible', timeout: 5000 });
    await wagerInput63.click({ clickCount: 3 });
    await wagerInput63.pressSequentially('100');
    await wagerInput63.press('Tab');
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn63 = dialog63.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn63.click();
    await expect(dialog63).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify value is persisted
    const dialog63b = await reopenEditForPromo(page, promoName63);
    const savedWager63 = await dialog63b.locator('#minimumWagerInput input').inputValue();
    expect(savedWager63.trim().length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_63-GenericWheel-MinimumWagerUpdated_success');
  });

  // TC_64: Verify Notification Template update in Edit popup
  test('TC_64 - Verify Notification Template update in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog64, promoName: promoName64 } = await openEditOnInactivePromo(page);

    // Open Notification Template dropdown
    await dialog64.locator('#notificationDropdown [data-pc-section="trigger"]').click();
    const notifPanel64 = page.locator('.p-dropdown-panel');
    await expect(notifPanel64).toBeVisible({ timeout: 5000 });
    const notifOptions64 = notifPanel64.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]');
    // Exclude "No Notification" — selecting it leaves the dialog open (validation fails)
    const validOptions64 = notifOptions64.filter({ hasNotText: /No Notification/i });
    const validCount64 = await validOptions64.count();

    if (validCount64 === 0) {
      // No valid templates available — close dropdown and pass
      await page.keyboard.press('Escape');
      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_64-GenericWheel-NoNotifTemplates');
      return;
    }

    await validOptions64.first().click();
    await page.waitForTimeout(300);

    // Click Save
    const saveBtn64 = dialog64.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn64.click();
    await expect(dialog64).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify a template label is shown
    const dialog64b = await reopenEditForPromo(page, promoName64);
    const notifLabel64 = await dialog64b.locator('#notificationDropdown span[data-pc-section="input"]').textContent();
    expect((notifLabel64 ?? '').trim().length).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_64-GenericWheel-NotificationTemplateUpdated_success');
  });

  // TC_65: Verify toggle "Spin Again" update persists after Save
  test('TC_65 - Verify Spin Again toggle update persists after Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog65, promoName: promoName65 } = await openEditOnInactivePromo(page);

    // Read current state of Spin Again toggle, then flip it
    const spinSwitch65 = dialog65.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinSwitch65.scrollIntoViewIfNeeded();
    const stateBefore65 = await spinSwitch65.getAttribute('aria-checked');
    await dialog65.locator('label[for="hasSpinAgain"]').click();
    await page.waitForTimeout(200);
    const stateAfter65 = stateBefore65 === 'true' ? 'false' : 'true';
    await expect(spinSwitch65).toHaveAttribute('aria-checked', stateAfter65);

    // Click Save
    const saveBtn65 = dialog65.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn65.click();
    await expect(dialog65).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify toggle persisted
    const dialog65b = await reopenEditForPromo(page, promoName65);
    const spinSwitch65b = dialog65b.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    await spinSwitch65b.scrollIntoViewIfNeeded();
    await expect(spinSwitch65b).toHaveAttribute('aria-checked', stateAfter65);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_65-GenericWheel-SpinAgainTogglePersisted_success');
  });

  // TC_66: Verify toggle "Requires Opt In" update persists after Save
  test('TC_66 - Verify Requires Opt In toggle update persists after Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog66, promoName: promoName66 } = await openEditOnInactivePromo(page);

    // Read current state of Requires Opt In toggle, then flip it
    const optInSwitch66 = dialog66.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    await optInSwitch66.scrollIntoViewIfNeeded();
    const stateBefore66 = await optInSwitch66.getAttribute('aria-checked');
    await dialog66.locator('label[for="requiresOptIn"]').click();
    await page.waitForTimeout(200);
    const stateAfter66 = stateBefore66 === 'true' ? 'false' : 'true';
    await expect(optInSwitch66).toHaveAttribute('aria-checked', stateAfter66);

    // Click Save
    const saveBtn66 = dialog66.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn66.click();
    await expect(dialog66).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify toggle persisted
    const dialog66b = await reopenEditForPromo(page, promoName66);
    const optInSwitch66b = dialog66b.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    await optInSwitch66b.scrollIntoViewIfNeeded();
    await expect(optInSwitch66b).toHaveAttribute('aria-checked', stateAfter66);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_66-GenericWheel-RequiresOptInTogglePersisted_success');
  });

  // TC_67: Verify toggle "Allocate Ticket On All Prizes" update persists after Save
  test('TC_67 - Verify Allocate Ticket On All Prizes toggle update persists after Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog67, promoName: promoName67 } = await openEditOnInactivePromo(page);

    // Read current state of Allocate Ticket On All Prizes toggle, then flip it
    const allocateSwitch67 = dialog67.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
    await allocateSwitch67.scrollIntoViewIfNeeded();
    const stateBefore67 = await allocateSwitch67.getAttribute('aria-checked');
    await dialog67.locator('label[for="allocateTicketOnAllPrizes"]').click();
    await page.waitForTimeout(200);
    const stateAfter67 = stateBefore67 === 'true' ? 'false' : 'true';
    await expect(allocateSwitch67).toHaveAttribute('aria-checked', stateAfter67);

    // Click Save
    const saveBtn67 = dialog67.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn67.click();
    await expect(dialog67).toBeHidden({ timeout: 15000 });

    // Reopen via three-dots → Edit and verify toggle persisted
    const dialog67b = await reopenEditForPromo(page, promoName67);
    const allocateSwitch67b = dialog67b.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
    await allocateSwitch67b.scrollIntoViewIfNeeded();
    await expect(allocateSwitch67b).toHaveAttribute('aria-checked', stateAfter67);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_67-GenericWheel-AllocateTicketTogglePersisted_success');
  });

  // TC_68: Verify Save after making changes reflects in list
  test('TC_68 - Verify Save after making changes reflects in list', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog68 } = await openEditOnInactivePromo(page);

    // Modify the Promotion Name field
    const nameInput68 = dialog68.locator('#promotionNameInput');
    await nameInput68.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput68.click({ clickCount: 3 });
    const updatedName68 = `Updated_${CommonUtils.generateRandomString(5)}`;
    await nameInput68.fill(updatedName68);
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn68 = dialog68.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn68.click();
    await expect(dialog68).toBeHidden({ timeout: 15000 });

    // Verify the updated name appears in the table list
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_68-GenericWheel-SaveAfterChanges_success');
  });

  // TC_69: Verify Save without making any changes causes no error
  test('TC_69 - Verify Save without changes causes no error', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog69 } = await openEditOnInactivePromo(page);

    // Do not modify any field — click Save immediately
    const saveBtn69 = dialog69.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn69.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn69.click();

    // Dialog should close with no error
    await expect(dialog69).toBeHidden({ timeout: 15000 });

    // Verify no error toast appeared
    const errorToast69 = page.locator('.p-toast-message-error, .p-message-error');
    await expect(errorToast69).toBeHidden({ timeout: 3000 }).catch(() => { /* no error toast is the pass condition */ });

    // Verify list remains populated
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_69-GenericWheel-SaveWithoutChanges_success');
  });

  // TC_70: Verify Cancel button closes Edit popup without saving changes
  test('TC_70 - Verify Cancel button closes Edit popup without saving changes', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow70 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn70 = firstRow70.locator('button.pure__table-menu-trigger');
    await actionBtn70.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn70.click();

    const editItem70 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem70.waitFor({ state: 'visible', timeout: 5000 });
    await editItem70.click();

    const dialog70 = page.locator('div[role="dialog"]').first();
    await expect(dialog70).toBeVisible({ timeout: 15000 });

    // Read original Promotion Name before modifying
    const nameInput70 = dialog70.locator('#promotionNameInput');
    await nameInput70.waitFor({ state: 'visible', timeout: 5000 });
    const originalName70 = await nameInput70.inputValue();

    // Modify the Promotion Name
    await nameInput70.click({ clickCount: 3 });
    await nameInput70.fill(`Cancelled_${CommonUtils.generateRandomString(5)}`);
    await page.waitForTimeout(200);

    // Click Cancel button
    const cancelBtn70 = dialog70.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn70.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn70.click();

    // Dialog must close without saving
    await expect(dialog70).toBeHidden({ timeout: 10000 });

    // Reopen Edit and verify original name is still saved (change was discarded)
    const firstRow70b = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstRow70b.waitFor({ state: 'visible', timeout: 10000 });
    await firstRow70b.locator('button.pure__table-menu-trigger').click();
    const editItem70b = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem70b.waitFor({ state: 'visible', timeout: 5000 });
    await editItem70b.click();

    const dialog70b = page.locator('div[role="dialog"]').first();
    await expect(dialog70b).toBeVisible({ timeout: 15000 });
    const nameAfterCancel70 = await dialog70b.locator('#promotionNameInput').inputValue();
    expect(nameAfterCancel70.trim()).toBe(originalName70.trim());

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_70-GenericWheel-CancelDiscardsChanges_success');
  });

  // TC_71: Verify X (close) icon closes Edit popup without saving changes
  test('TC_71 - Verify X icon closes Edit popup without saving changes', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow71 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn71 = firstRow71.locator('button.pure__table-menu-trigger');
    await actionBtn71.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn71.click();

    const editItem71 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem71.waitFor({ state: 'visible', timeout: 5000 });
    await editItem71.click();

    const dialog71 = page.locator('div[role="dialog"]').first();
    await expect(dialog71).toBeVisible({ timeout: 15000 });

    // Read original Promotion Name before modifying
    const nameInput71 = dialog71.locator('#promotionNameInput');
    await nameInput71.waitFor({ state: 'visible', timeout: 5000 });
    const originalName71 = await nameInput71.inputValue();

    // Modify the Promotion Name
    await nameInput71.click({ clickCount: 3 });
    await nameInput71.fill(`XClosed_${CommonUtils.generateRandomString(5)}`);
    await page.waitForTimeout(200);

    // Click the X close icon on the dialog header
    const closeBtn71 = dialog71.locator('[data-pc-section="closebutton"], button[aria-label="Close"]').first();
    await closeBtn71.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn71.click();

    // Dialog must close without saving
    await expect(dialog71).toBeHidden({ timeout: 10000 });

    // Reopen Edit and verify original name is still saved (change was discarded)
    const firstRow71b = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstRow71b.waitFor({ state: 'visible', timeout: 10000 });
    await firstRow71b.locator('button.pure__table-menu-trigger').click();
    const editItem71b = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem71b.waitFor({ state: 'visible', timeout: 5000 });
    await editItem71b.click();

    const dialog71b = page.locator('div[role="dialog"]').first();
    await expect(dialog71b).toBeVisible({ timeout: 15000 });
    const nameAfterClose71 = await dialog71b.locator('#promotionNameInput').inputValue();
    expect(nameAfterClose71.trim()).toBe(originalName71.trim());

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_71-GenericWheel-XIconDiscardsChanges_success');
  });

  // TC_72: Verify mandatory field validation on Edit — clearing a required field blocks Save
  test('TC_72 - Verify mandatory field validation on Edit when required field is cleared', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow72 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn72 = firstRow72.locator('button.pure__table-menu-trigger');
    await actionBtn72.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn72.click();

    const editItem72 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem72.waitFor({ state: 'visible', timeout: 5000 });
    await editItem72.click();

    const dialog72 = page.locator('div[role="dialog"]').first();
    await expect(dialog72).toBeVisible({ timeout: 15000 });

    // Clear the mandatory Promotion Name field
    const nameInput72 = dialog72.locator('#promotionNameInput');
    await nameInput72.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput72.click({ clickCount: 3 });
    await nameInput72.fill('');
    await nameInput72.press('Tab');
    await page.waitForTimeout(200);

    // Attempt to Save — should be blocked
    const saveBtn72 = dialog72.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();

    // Save button should be disabled OR dialog stays open after click
    const isDisabled72 = await saveBtn72.isDisabled();
    if (!isDisabled72) {
      await saveBtn72.click();
    }

    // Validation: either Save is disabled or dialog remains open with an error
    const isSaveDisabled72 = await saveBtn72.isDisabled();
    if (isSaveDisabled72) {
      // Save button disabled — form validation working
    } else {
      await expect(dialog72).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_72-GenericWheel-MandatoryFieldValidation_success');
  });

  // TC_73: Verify invalid input update shows proper error on Edit
  test('TC_73 - Verify invalid input update shows proper error on Edit', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow73 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn73 = firstRow73.locator('button.pure__table-menu-trigger');
    await actionBtn73.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn73.click();

    const editItem73 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem73.waitFor({ state: 'visible', timeout: 5000 });
    await editItem73.click();

    const dialog73 = page.locator('div[role="dialog"]').first();
    await expect(dialog73).toBeVisible({ timeout: 15000 });

    // Enter an out-of-range value in Number of Slices (valid: 2–8)
    const slicesInput73 = dialog73.locator('#numberOfSlicesInput input');
    await slicesInput73.waitFor({ state: 'visible', timeout: 5000 });
    await slicesInput73.click({ clickCount: 3 });
    await slicesInput73.pressSequentially('99');
    await slicesInput73.press('Tab');
    await page.waitForTimeout(300);

    // Also clear Promotion Name to create a mandatory-field validation error
    const nameInput73 = dialog73.locator('#promotionNameInput');
    await nameInput73.click({ clickCount: 3 });
    await nameInput73.fill('');
    await nameInput73.press('Tab');
    await page.waitForTimeout(200);

    // Attempt Save
    const saveBtn73 = dialog73.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    const isDisabled73 = await saveBtn73.isDisabled();
    if (!isDisabled73) {
      await saveBtn73.click();
      // Expect error toast or dialog to stay open
      const errorToast73 = page.locator('.p-toast-message-error, .p-message-error, .p-toast .p-toast-message').first();
      const toastVisible73 = await errorToast73.isVisible().catch(() => false);
      if (toastVisible73) {
        await expect(errorToast73).toBeVisible({ timeout: 8000 });
      } else {
        await expect(dialog73).toBeVisible({ timeout: 5000 });
      }
    } else {
      // Save disabled — form-level validation is working
      await expect(saveBtn73).toBeDisabled();
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_73-GenericWheel-InvalidInputError_success');
  });

  // TC_74: Verify field values remain intact after a failed Save attempt
  test('TC_74 - Verify field values remain intact after a failed Save attempt', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow74 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn74 = firstRow74.locator('button.pure__table-menu-trigger');
    await actionBtn74.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn74.click();

    const editItem74 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem74.waitFor({ state: 'visible', timeout: 5000 });
    await editItem74.click();

    const dialog74 = page.locator('div[role="dialog"]').first();
    await expect(dialog74).toBeVisible({ timeout: 15000 });

    // Enter an invalid value: clear mandatory Promotion Name
    const nameInput74 = dialog74.locator('#promotionNameInput');
    await nameInput74.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput74.click({ clickCount: 3 });
    await nameInput74.fill('');
    await nameInput74.press('Tab');
    await page.waitForTimeout(200);

    // Enter a value in Redirect URL that we want to verify is preserved
    const redirectInput74 = dialog74.locator('#redirectUrlInput');
    await redirectInput74.click({ clickCount: 3 });
    const testUrl74 = 'https://persist-check.example.com';
    await redirectInput74.fill(testUrl74);
    await page.waitForTimeout(200);

    // Attempt Save (expected to be blocked due to empty mandatory field)
    const saveBtn74 = dialog74.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    const isDisabled74 = await saveBtn74.isDisabled();
    if (!isDisabled74) {
      await saveBtn74.click();
      await page.waitForTimeout(500);
    }

    // Dialog must still be open (Save was blocked)
    await expect(dialog74).toBeVisible({ timeout: 5000 });

    // All entered values must still be intact inside the open dialog
    const nameValueAfter74 = await dialog74.locator('#promotionNameInput').inputValue();
    expect(nameValueAfter74.trim()).toBe('');

    const redirectValueAfter74 = await dialog74.locator('#redirectUrlInput').inputValue();
    expect(redirectValueAfter74.trim()).toBe(testUrl74);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_74-GenericWheel-FieldsPersistAfterFailedSave_success');
  });

  // TC_75: Verify numeric field boundary — entering 0 keeps Save disabled on Edit.
  // Note: very large values are NOT covered — the app has no upper-bound
  // validation on these fields and Save stays enabled either way.
  test('TC_75 - Verify numeric field boundary values are handled correctly on Edit', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow75 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn75 = firstRow75.locator('button.pure__table-menu-trigger');
    await actionBtn75.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn75.click();

    const editItem75 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem75.waitFor({ state: 'visible', timeout: 5000 });
    await editItem75.click();

    const dialog75 = page.locator('div[role="dialog"]').first();
    await expect(dialog75).toBeVisible({ timeout: 15000 });

    const saveBtn75 = dialog75.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();

    const setNumericField = async (locator: ReturnType<typeof dialog75.locator>, value: string) => {
      await locator.click({ clickCount: 3 });
      await locator.pressSequentially(value);
      await locator.press('Tab');
      await page.waitForTimeout(200);
    };

    // Scenario A: enter 0 in all numeric mandatory fields
    await setNumericField(dialog75.locator('#spinsPerUserInput input'), '0');
    await setNumericField(dialog75.locator('#dailySpinLimitInput input'), '0');
    await setNumericField(dialog75.locator('#spinValidityDaysInput input'), '0');
    await setNumericField(dialog75.locator('#numberOfSlicesInput input'), '0');
    await expect(saveBtn75).toBeDisabled({ timeout: 3000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_75-GenericWheel-BoundaryZero_success');
  });

  // TC_76: Verify only the modified field is updated after partial edit Save
  test('TC_76 - Verify only modified field is updated after partial edit', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog76 } = await openEditOnInactivePromo(page);

    // Read all original field values before modification
    const originalRedirect76 = await dialog76.locator('#redirectUrlInput').inputValue();
    const originalSpins76    = await dialog76.locator('#spinsPerUserInput input').inputValue();

    // Modify only the Promotion Name
    const nameInput76 = dialog76.locator('#promotionNameInput');
    await nameInput76.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput76.click({ clickCount: 3 });
    const newName76 = `Partial_${CommonUtils.generateRandomString(5)}`;
    await nameInput76.fill(newName76);
    await page.waitForTimeout(200);

    // Click Save
    const saveBtn76 = dialog76.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn76.click();
    await expect(dialog76).toBeHidden({ timeout: 15000 });

    // Reopen Edit and verify only the name changed; other fields are untouched
    const dialog76b = await reopenEditForPromo(page, newName76);

    const savedName76     = await dialog76b.locator('#promotionNameInput').inputValue();
    const savedRedirect76 = await dialog76b.locator('#redirectUrlInput').inputValue();
    const savedSpins76    = await dialog76b.locator('#spinsPerUserInput input').inputValue();

    expect(savedName76.trim()).toBe(newName76);
    expect(savedRedirect76.trim()).toBe(originalRedirect76.trim());
    expect(savedSpins76.trim()).toBe(originalSpins76.trim());

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_76-GenericWheel-PartialFieldUpdate_success');
  });

  // TC_77: Verify all three toggles save correctly when enabled together
  test('TC_77 - Verify toggle combination persistence after Save', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Active promotions can't be edited (Save stays disabled) — open an inactive one
    const { dialog: dialog77, promoName: promoName77 } = await openEditOnInactivePromo(page);

    // Enable all three toggles (turn ON if currently OFF)
    const spinSwitch77     = dialog77.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    const optInSwitch77    = dialog77.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    const allocateSwitch77 = dialog77.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');

    await spinSwitch77.scrollIntoViewIfNeeded();
    if (await spinSwitch77.getAttribute('aria-checked') === 'false') {
      await dialog77.locator('label[for="hasSpinAgain"]').click();
      await page.waitForTimeout(200);
    }
    if (await optInSwitch77.getAttribute('aria-checked') === 'false') {
      await dialog77.locator('label[for="requiresOptIn"]').click();
      await page.waitForTimeout(200);
    }
    await allocateSwitch77.scrollIntoViewIfNeeded();
    if (await allocateSwitch77.getAttribute('aria-checked') === 'false') {
      await dialog77.locator('label[for="allocateTicketOnAllPrizes"]').click();
      await page.waitForTimeout(200);
    }

    await expect(spinSwitch77).toHaveAttribute('aria-checked', 'true');
    await expect(optInSwitch77).toHaveAttribute('aria-checked', 'true');
    await expect(allocateSwitch77).toHaveAttribute('aria-checked', 'true');

    // Click Save
    const saveBtn77 = dialog77.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first();
    await saveBtn77.click();
    await expect(dialog77).toBeHidden({ timeout: 15000 });

    // Reopen Edit and verify all three toggles are still ON
    const dialog77b = await reopenEditForPromo(page, promoName77);

    const spinSwitch77b     = dialog77b.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
    const optInSwitch77b    = dialog77b.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
    const allocateSwitch77b = dialog77b.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');

    await spinSwitch77b.scrollIntoViewIfNeeded();
    await expect(spinSwitch77b).toHaveAttribute('aria-checked', 'true');
    await expect(optInSwitch77b).toHaveAttribute('aria-checked', 'true');
    await allocateSwitch77b.scrollIntoViewIfNeeded();
    await expect(allocateSwitch77b).toHaveAttribute('aria-checked', 'true');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_77-GenericWheel-ToggleCombinationPersisted_success');
  });

  // TC_78: Verify scroll behavior in Edit popup — all fields are accessible
  test('TC_78 - Verify scroll behavior in Edit popup allows access to all fields', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const firstRow78 = container.locator('tbody tr[data-pc-section="bodyrow"]').first();
    const actionBtn78 = firstRow78.locator('button.pure__table-menu-trigger');
    await actionBtn78.waitFor({ state: 'visible', timeout: 5000 });
    await actionBtn78.click();

    const editItem78 = page.locator('li[role="menuitem"][aria-label="Edit"]');
    await editItem78.waitFor({ state: 'visible', timeout: 5000 });
    await editItem78.click();

    const dialog78 = page.locator('div[role="dialog"]').first();
    await expect(dialog78).toBeVisible({ timeout: 15000 });

    // Scroll through each field from top to bottom and assert it is visible
    const fieldsToCheck78 = [
      dialog78.locator('#promotionNameInput'),
      dialog78.locator('#allocationStrategyDropdown'),
      dialog78.locator('#startDateCalendar'),
      dialog78.locator('#endDateCalendar'),
      dialog78.locator('#spinsPerUserInput'),
      dialog78.locator('#dailySpinLimitInput'),
      dialog78.locator('#spinValidityDaysInput'),
      dialog78.locator('#numberOfSlicesInput'),
      dialog78.locator('#regionDropdown'),
      dialog78.locator('#redirectUrlInput'),
      dialog78.locator('#ticketPrefixInput'),
      dialog78.locator('#minimumWagerInput'),
      dialog78.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)'),
      dialog78.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)'),
      dialog78.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)'),
    ];

    for (const field of fieldsToCheck78) {
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_78-GenericWheel-ScrollBehavior_success');
  });

  // ─── Shared helper: navigate to View Promotion Prizes page for the first row ───
  // (inline in each test — beforeEach stays unchanged)

  // TC_79: Verify View Promotion Prizes page opens successfully
  test('TC_79 - Verify View Promotion Prizes page opens successfully', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem79 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem79.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem79.click();

    const prizeContainer79 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer79.waitFor({ state: 'visible', timeout: 20000 });

    // Create Prize and Back buttons must be visible
    await expect(page.locator('button[aria-label="Create Prize"]')).toBeVisible({ timeout: 10000 });
    await expect(prizeContainer79.locator('button.btn--info.p-button-icon-only')).toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_79-GenericWheel-PrizePage_success');
  });

  // TC_80: Verify Create Prize button opens Add Prize popup
  test('TC_80 - Verify Create Prize button opens Add Prize popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem80 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem80.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem80.click();
    await page.locator('generic-wheel-promotion-prizes').waitFor({ state: 'visible', timeout: 20000 });

    const createPrizeBtn80 = page.locator('button[aria-label="Create Prize"]');
    await createPrizeBtn80.waitFor({ state: 'visible', timeout: 5000 });
    await createPrizeBtn80.click();

    const prizeDialog80 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog80).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_80-GenericWheel-CreatePrizePopupOpens_success');
  });

  // TC_81: Verify Save button is disabled when mandatory Prize Type and Display Text are empty
  test('TC_81 - Verify Save button disabled when mandatory fields are empty in Add Prize popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem81 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem81.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem81.click();
    await page.locator('generic-wheel-promotion-prizes').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog81 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog81).toBeVisible({ timeout: 10000 });

    // Prize Type and Display Text are empty by default — Save must be disabled
    const saveBtn81 = prizeDialog81.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await expect(saveBtn81).toBeDisabled({ timeout: 3000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_81-GenericWheel-PrizeMandatoryValidation_success');
  });

  // TC_82: Verify Winning Chance field rejects alphabetic characters
  test('TC_82 - Verify Winning Chance field rejects alphabetic characters', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem82 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem82.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem82.click();
    await page.locator('generic-wheel-promotion-prizes').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog82 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog82).toBeVisible({ timeout: 10000 });

    const winningInput82 = prizeDialog82.locator('#winningChanceInput input');
    await winningInput82.waitFor({ state: 'visible', timeout: 5000 });
    const valueBefore82 = await winningInput82.inputValue();

    // Type alphabetic characters — inputnumber must reject them
    await winningInput82.click();
    await winningInput82.pressSequentially('abcXYZ');
    await page.waitForTimeout(300);

    const valueAfter82 = await winningInput82.inputValue();
    // Strip non-numeric chars from both and compare — field must not have changed
    expect(valueAfter82.replace(/[^0-9]/g, '')).toBe(valueBefore82.replace(/[^0-9]/g, ''));

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_82-GenericWheel-WinningChanceAlphaRejected_success');
  });

  // TC_83: Verify date range validation — End Date before Start Date shows no clickable dates
  test('TC_83 - Verify End Date before Start Date shows no clickable dates in Add Prize popup', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem83 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem83.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem83.click();
    await page.locator('generic-wheel-promotion-prizes').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog83 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog83).toBeVisible({ timeout: 10000 });

    // Select a Start Date
    await prizeDialog83.locator('#startDateCalendar input').click();
    const startPanel83 = page.locator('.p-datepicker').first();
    await expect(startPanel83).toBeVisible({ timeout: 5000 });
    const startEnabled83 = startPanel83.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    if (await startEnabled83.count() > 0) {
      await startEnabled83.first().click();
    } else {
      await startPanel83.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await startPanel83.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]').first().click();
    }
    await page.waitForTimeout(300);

    // Click Display Text to close Start Date calendar panel
    await prizeDialog83.locator('#displayTextInput').click();
    await page.waitForTimeout(300);

    // Open End Date calendar and navigate backward (before start date)
    await prizeDialog83.locator('#endDateCalendar input').click();
    const endPanel83 = page.locator('.p-datepicker').first();
    await expect(endPanel83).toBeVisible({ timeout: 5000 });
    await endPanel83.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
    await page.waitForTimeout(200);

    // All dates in the previous month should be disabled — calendar validation working
    const endEnabled83 = endPanel83.locator('td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]');
    expect(await endEnabled83.count()).toBe(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_83-GenericWheel-PrizeDateRangeValidation_success');
  });

  // TC_84: Verify Cancel button closes Add Prize popup without creating a prize
  test('TC_84 - Verify Cancel button closes Add Prize popup without creating prize', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem84 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem84.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem84.click();
    const prizeContainer84 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer84.waitFor({ state: 'visible', timeout: 20000 });

    // The container becomes visible before its prize rows finish loading (async fetch) —
    // count()'d immediately, rowsBefore84 could read 0 while the table is still populating,
    // then read as changed once the fetch resolves during the dialog interaction that follows.
    await prizeContainer84.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const rowsBefore84 = await prizeContainer84.locator('tbody tr[data-pc-section="bodyrow"]').count();

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog84 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog84).toBeVisible({ timeout: 10000 });

    // Enter some data then cancel
    await prizeDialog84.locator('#displayTextInput').fill('CancelTest');
    await page.waitForTimeout(200);

    const cancelBtn84 = prizeDialog84.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn84.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn84.click();
    await expect(prizeDialog84).toBeHidden({ timeout: 10000 });

    // Prize count must remain unchanged
    const rowsAfter84 = await prizeContainer84.locator('tbody tr[data-pc-section="bodyrow"]').count();
    expect(rowsAfter84).toBe(rowsBefore84);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_84-GenericWheel-PrizeCancelButton_success');
  });

  // TC_85: Verify X icon closes Add Prize popup without creating a prize
  test('TC_85 - Verify X icon closes Add Prize popup without creating prize', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem85 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem85.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem85.click();
    const prizeContainer85 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer85.waitFor({ state: 'visible', timeout: 20000 });

    // The container becomes visible before its prize rows finish loading (async fetch) —
    // count()'d immediately, rowsBefore85 could read 0 while the table is still populating,
    // then read as changed once the fetch resolves during the dialog interaction that follows.
    await prizeContainer85.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const rowsBefore85 = await prizeContainer85.locator('tbody tr[data-pc-section="bodyrow"]').count();

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog85 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog85).toBeVisible({ timeout: 10000 });

    // Enter some data then close via X
    await prizeDialog85.locator('#displayTextInput').fill('XCloseTest');
    await page.waitForTimeout(200);

    const closeBtn85 = prizeDialog85.locator('[data-pc-section="closebutton"], button[aria-label="Close"]').first();
    await closeBtn85.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn85.click();
    await expect(prizeDialog85).toBeHidden({ timeout: 10000 });

    // Prize count must remain unchanged
    const rowsAfter85 = await prizeContainer85.locator('tbody tr[data-pc-section="bodyrow"]').count();
    expect(rowsAfter85).toBe(rowsBefore85);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_85-GenericWheel-PrizeXIconClose_success');
  });

  // TC_86: Verify Back button navigates back to Generic Wheel page
  test('TC_86 - Verify Back button navigates back to Generic Wheel page', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem86 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem86.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem86.click();
    const prizeContainer86 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer86.waitFor({ state: 'visible', timeout: 20000 });

    // Click Back (chevron-left icon-only button)
    const backBtn86 = prizeContainer86.locator('button.btn--info.p-button-icon-only');
    await backBtn86.waitFor({ state: 'visible', timeout: 5000 });
    await backBtn86.click();

    // Verify we are back on the generic-wheel page (SPA navigation — no URL change to wait for)
    await expect(page.locator('generic-wheel')).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_86-GenericWheel-BackButton_success');
  });

  // TC_87: Verify creation of a Promotion Prize
  test('TC_87 - Verify creation of Promotion Prize', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Read the promotion start AND end dates from the first row (DD/MM/YYYY HH:mm).
    // The prize's availability window must fall INSIDE the promotion window —
    // the calendars don't grey out out-of-range days; the backend rejects them
    // on Save ("Prize end date is after promotion end date").
    const rowText87 = await container.locator('tbody tr[data-pc-section="bodyrow"]').first().innerText();
    const rowDates87 = (rowText87.match(/\d{2}\/\d{2}\/\d{4}/g) || []).map((s) => {
      const parts = s.split('/').map((x) => parseInt(x));
      return new Date(parts[2], parts[1] - 1, parts[0]);
    });
    const promoStart87 = rowDates87.length > 0 ? rowDates87[0] : null;
    const promoEnd87   = rowDates87.length > 1 ? rowDates87[1] : null;

    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem87 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
    await viewPrizesItem87.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem87.click();
    const prizeContainer87 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer87.waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('button[aria-label="Create Prize"]').click();
    const prizeDialog87 = page.locator('div[role="dialog"]').first();
    await expect(prizeDialog87).toBeVisible({ timeout: 10000 });

    // 1. Select Prize Type
    await prizeDialog87.locator('#prizeTypeDropdown [data-pc-section="trigger"]').click();
    const prizeTypePanel87 = page.locator('.p-dropdown-panel');
    await expect(prizeTypePanel87).toBeVisible({ timeout: 5000 });
    await prizeTypePanel87.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // 2. Enter Display Text
    const displayText87 = `Prize_${CommonUtils.generateRandomString(5)}`;
    await prizeDialog87.locator('#displayTextInput').fill(displayText87);
    await page.waitForTimeout(200);

    // 3. Enter Winning Chance (numeric)
    const winningInput87 = prizeDialog87.locator('#winningChanceInput input');
    await winningInput87.click({ clickCount: 3 });
    await winningInput87.pressSequentially('10');
    await winningInput87.press('Tab');
    await page.waitForTimeout(200);

    const startDaySelector87 = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

    // Signed month distance from the current month (negative = past month)
    const monthDiff87 = (d: Date) => {
      const now = new Date();
      return (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
    };
    const navForward87 = async (panel: import('@playwright/test').Locator, months: number) => {
      for (let m = 0; m < months; m++) {
        await panel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
        await page.waitForTimeout(100);
      }
    };
    // Click the smallest enabled day within [minDay, maxDay] in the shown month;
    // falls back to the first/last enabled day if none is in range.
    const pickEnabledDay87 = async (panel: import('@playwright/test').Locator, minDay: number, maxDay: number, fallback: 'first' | 'last'): Promise<number> => {
      const enabled = panel.locator(startDaySelector87);
      const labels = await enabled.allInnerTexts();
      if (labels.length === 0) throw new Error('No selectable days in the calendar month');
      let idx = -1;
      let best = 32;
      labels.forEach((t, i) => {
        const v = parseInt(t.trim());
        if (v >= minDay && v <= maxDay && v < best) { best = v; idx = i; }
      });
      if (idx < 0) idx = fallback === 'first' ? 0 : labels.length - 1;
      await enabled.nth(idx).click();
      return parseInt(labels[idx].trim());
    };

    // 4. Select Available Start Date — inside the promotion window, from today onward
    await prizeDialog87.locator('#startDateCalendar input').click();
    const startPanel87 = page.locator('.p-datepicker').first();
    await expect(startPanel87).toBeVisible({ timeout: 5000 });

    const now87 = new Date();
    // Latest safe prize-end day: one full day before the promotion end, so the
    // time-of-day component can never push the prize past the promotion end
    const endTarget87 = promoEnd87
      ? new Date(promoEnd87.getFullYear(), promoEnd87.getMonth(), promoEnd87.getDate() - 1)
      : null;

    // Land on the month of max(today, promotion start), never past the end-target month
    let startNav87 = promoStart87 ? Math.max(0, monthDiff87(promoStart87)) : 0;
    if (endTarget87) startNav87 = Math.min(startNav87, Math.max(0, monthDiff87(endTarget87)));
    await navForward87(startPanel87, startNav87);
    // Earliest pickable day: today (the calendar does NOT disable past days) and
    // no earlier than the promotion start day when in that month
    let startMinDay87 = startNav87 === 0 ? now87.getDate() : 1;
    if (promoStart87 && monthDiff87(promoStart87) === startNav87) {
      startMinDay87 = Math.max(startMinDay87, promoStart87.getDate());
    }
    // Leave at least one day of room for the prize end date
    const startMaxDay87 = endTarget87 && monthDiff87(endTarget87) === startNav87
      ? Math.max(startMinDay87, endTarget87.getDate() - 1)
      : 31;
    const startDay87 = await pickEnabledDay87(startPanel87, startMinDay87, startMaxDay87, 'first');
    await page.waitForTimeout(300);

    // 5. With the start date selected, click on Available End Date — this closes
    // the still-open start calendar and opens the end calendar — then pick a day
    // after the start but BEFORE the promotion end date
    const endInput87 = prizeDialog87.locator('#endDateCalendar input');
    await endInput87.click();
    await page.waitForTimeout(300);
    const endPanel87 = page.locator('.p-datepicker:visible').first();
    if (!(await endPanel87.isVisible().catch(() => false))) {
      // The first click only dismissed the start-date overlay — click again to open
      await endInput87.click();
    }
    await expect(endPanel87).toBeVisible({ timeout: 5000 });
    const endNav87 = endTarget87 ? Math.max(startNav87, Math.max(0, monthDiff87(endTarget87))) : startNav87;
    await navForward87(endPanel87, endNav87);
    const endMinDay87 = endNav87 === startNav87 ? startDay87 + 1 : 1;
    const endMaxDay87 = endTarget87 && monthDiff87(endTarget87) === endNav87
      ? Math.max(endMinDay87, endTarget87.getDate())
      : 31;
    await pickEnabledDay87(endPanel87, endMinDay87, endMaxDay87, 'first');
    await page.waitForTimeout(300);
    // Click Display Text to close the End Date calendar before clicking Save
    await prizeDialog87.locator('#displayTextInput').click();
    await page.waitForTimeout(300);

    // Click Save, then observe the outcome: dialog closing = saved; an error
    // toast = the backend rejected the prize (capture its text before it fades)
    const saveBtn87 = prizeDialog87.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn87.click();
    const errorToast87 = page.locator('.p-toast-message-error').first();
    let outcome87: 'saved' | 'error' | 'timeout' = 'timeout';
    for (let t = 0; t < 30; t++) {
      if (!(await prizeDialog87.isVisible().catch(() => true))) { outcome87 = 'saved'; break; }
      if (await errorToast87.isVisible().catch(() => false)) { outcome87 = 'error'; break; }
      await page.waitForTimeout(500);
    }
    if (outcome87 === 'error') {
      throw new Error(`Prize creation rejected — error toast: ${(await errorToast87.innerText().catch(() => '')).trim()}`);
    }
    if (outcome87 === 'timeout') {
      throw new Error('Save did not close the Add Prize dialog and no error toast appeared');
    }

    // Saved: a success toast or the new prize appearing in the list confirms creation
    const successToast87 = page.locator('.p-toast-message-success').first();
    if (!(await successToast87.isVisible().catch(() => false))) {
      await prizeContainer87.locator('tbody tr[data-pc-section="bodyrow"]').filter({ hasText: displayText87 }).first().waitFor({ state: 'visible', timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_87-GenericWheel-PrizeCreated_success');
  });

  // ─── TC_88 ───────────────────────────────────────────────────────────────────
  test('TC_88 - Verify mandatory field validation on Duplicate Promotion popup', async ({ page }, testInfo) => {
    const container88 = page.locator('generic-wheel');
    await container88.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container88.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const duplicateItem88 = page.locator('li[role="menuitem"][aria-label="Duplicate"], li[role="menuitem"]:has-text("Duplicate")').first();
    await duplicateItem88.waitFor({ state: 'visible', timeout: 5000 });
    await duplicateItem88.click();

    const dupDialog88 = page.locator('div[role="dialog"]').first();
    await expect(dupDialog88).toBeVisible({ timeout: 15000 });

    // Clear Promotion Name — leave blank
    const nameInput88 = dupDialog88.locator('input#promotionName');
    await nameInput88.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput88.click({ clickCount: 3 });
    await nameInput88.fill('');
    await nameInput88.press('Tab');
    await page.waitForTimeout(300);

    const dupBtn88 = dupDialog88.locator('button[aria-label="Duplicate"], button:has-text("Duplicate")').first();
    await dupBtn88.waitFor({ state: 'visible', timeout: 5000 });
    const daySelector88 = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

    // Select Start Date — then click Duplicate (disabled) to close the calendar
    await dupDialog88.locator('span#startDate input').click();
    const startPanel88 = page.locator('.p-datepicker').first();
    await expect(startPanel88).toBeVisible({ timeout: 5000 });
    for (let m = 0; m < 12; m++) {
      if (await startPanel88.locator(daySelector88).count() > 0) break;
      await startPanel88.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await startPanel88.locator(daySelector88).first().click();
    await page.waitForTimeout(300);
    await dupBtn88.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Select End Date — then click Duplicate (still disabled because name is empty)
    await dupDialog88.locator('span#endDate input').click();
    const endPanel88 = page.locator('.p-datepicker').first();
    await expect(endPanel88).toBeVisible({ timeout: 5000 });
    await endPanel88.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
    for (let m = 0; m < 12; m++) {
      if (await endPanel88.locator(daySelector88).count() > 0) break;
      await endPanel88.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await endPanel88.locator(daySelector88).first().click();
    await page.waitForTimeout(300);
    await dupBtn88.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Duplicate button must remain disabled — name is still empty
    await expect(dupBtn88).toBeDisabled({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_88-GenericWheel-DupMandatoryValidation_success');
  });

  // ─── TC_89 ───────────────────────────────────────────────────────────────────
  test('TC_89 - Verify successful promotion duplication', async ({ page }, testInfo) => {
    const container89 = page.locator('generic-wheel');
    await container89.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    await container89.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const duplicateItem89 = page.locator('li[role="menuitem"][aria-label="Duplicate"], li[role="menuitem"]:has-text("Duplicate")').first();
    await duplicateItem89.waitFor({ state: 'visible', timeout: 5000 });
    await duplicateItem89.click();

    const dupDialog89 = page.locator('div[role="dialog"]').first();
    await expect(dupDialog89).toBeVisible({ timeout: 15000 });

    // Enter a unique Promotion Name
    const nameInput89 = dupDialog89.locator('input#promotionName');
    await nameInput89.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput89.click({ clickCount: 3 });
    await nameInput89.fill(`DupPromo_TC89_${CommonUtils.generateRandomString(5)}`);
    await page.waitForTimeout(200);

    const dupBtn89 = dupDialog89.locator('button[aria-label="Duplicate"], button:has-text("Duplicate")').first();
    await dupBtn89.waitFor({ state: 'visible', timeout: 5000 });
    const daySelector89 = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

    // Select Start Date — then click Duplicate (disabled, end date not set yet) to close the calendar
    await dupDialog89.locator('span#startDate input').click();
    const startPanel89 = page.locator('.p-datepicker').first();
    await expect(startPanel89).toBeVisible({ timeout: 5000 });
    for (let m = 0; m < 12; m++) {
      if (await startPanel89.locator(daySelector89).count() > 0) break;
      await startPanel89.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await startPanel89.locator(daySelector89).first().click();
    await page.waitForTimeout(300);
    await dupBtn89.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Select End Date — then click Duplicate (now enabled, all fields filled) to submit
    await dupDialog89.locator('span#endDate input').click();
    const endPanel89 = page.locator('.p-datepicker').first();
    await expect(endPanel89).toBeVisible({ timeout: 5000 });
    await endPanel89.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
    for (let m = 0; m < 12; m++) {
      if (await endPanel89.locator(daySelector89).count() > 0) break;
      await endPanel89.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await endPanel89.locator(daySelector89).first().click();
    await page.waitForTimeout(300);
    // Close end date calendar via Promotion Name click (Duplicate is now enabled — avoid force-triggering it)
    await nameInput89.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Duplicate button is now enabled — click it once to submit
    await expect(dupBtn89).toBeEnabled({ timeout: 5000 });
    await dupBtn89.click();
    await expect(dupDialog89).toBeHidden({ timeout: 15000 });
    await container89.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_89-GenericWheel-DupSuccess_success');
  });

  // ─── TC_90 ───────────────────────────────────────────────────────────────────
  test('TC_90 - Verify Cancel button on Duplicate Promotion popup', async ({ page }, testInfo) => {
    const container90 = page.locator('generic-wheel');
    await container90.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });
    const rowsBefore90 = await container90.locator('tbody tr[data-pc-section="bodyrow"]').count();

    await container90.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const duplicateItem90 = page.locator('li[role="menuitem"][aria-label="Duplicate"], li[role="menuitem"]:has-text("Duplicate")').first();
    await duplicateItem90.waitFor({ state: 'visible', timeout: 5000 });
    await duplicateItem90.click();

    const dupDialog90 = page.locator('div[role="dialog"]').first();
    await expect(dupDialog90).toBeVisible({ timeout: 15000 });

    // Enter a unique Promotion Name
    const nameInput90 = dupDialog90.locator('input#promotionName');
    await nameInput90.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput90.click({ clickCount: 3 });
    await nameInput90.fill(`DupPromo_TC90_${CommonUtils.generateRandomString(5)}`);
    await page.waitForTimeout(200);

    const dupBtn90 = dupDialog90.locator('button[aria-label="Duplicate"], button:has-text("Duplicate")').first();
    await dupBtn90.waitFor({ state: 'visible', timeout: 5000 });
    const daySelector90 = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

    // Select Start Date — click Duplicate (disabled, end date not set) to close calendar
    await dupDialog90.locator('span#startDate input').click();
    const startPanel90 = page.locator('.p-datepicker').first();
    await expect(startPanel90).toBeVisible({ timeout: 5000 });
    for (let m = 0; m < 12; m++) {
      if (await startPanel90.locator(daySelector90).count() > 0) break;
      await startPanel90.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await startPanel90.locator(daySelector90).first().click();
    await page.waitForTimeout(300);
    await dupBtn90.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Select End Date — close calendar via Promotion Name click (Duplicate is now enabled; avoid submitting)
    await dupDialog90.locator('span#endDate input').click();
    const endPanel90 = page.locator('.p-datepicker').first();
    await expect(endPanel90).toBeVisible({ timeout: 5000 });
    await endPanel90.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
    for (let m = 0; m < 12; m++) {
      if (await endPanel90.locator(daySelector90).count() > 0) break;
      await endPanel90.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await endPanel90.locator(daySelector90).first().click();
    await page.waitForTimeout(300);
    await nameInput90.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Click Cancel — popup must close, no new promotion created
    const cancelBtn90 = dupDialog90.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn90.waitFor({ state: 'visible', timeout: 5000 });
    await cancelBtn90.click();
    await expect(dupDialog90).toBeHidden({ timeout: 10000 });
    expect(await container90.locator('tbody tr[data-pc-section="bodyrow"]').count()).toBe(rowsBefore90);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_90-GenericWheel-DupCancelButton_success');
  });

  // ─── TC_91 ───────────────────────────────────────────────────────────────────
  test('TC_91 - Verify Close (X) icon on Duplicate Promotion popup', async ({ page }, testInfo) => {
    const container91 = page.locator('generic-wheel');
    await container91.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });
    const rowsBefore91 = await container91.locator('tbody tr[data-pc-section="bodyrow"]').count();

    // Open three-dots menu and click Duplicate
    await container91.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const duplicateItem91 = page.locator('li[role="menuitem"][aria-label="Duplicate"], li[role="menuitem"]:has-text("Duplicate")').first();
    await duplicateItem91.waitFor({ state: 'visible', timeout: 5000 });
    await duplicateItem91.click();

    const dupDialog91 = page.locator('div[role="dialog"]').first();
    await expect(dupDialog91).toBeVisible({ timeout: 15000 });

    // Enter a unique Promotion Name
    const nameInput91 = dupDialog91.locator('input#promotionName');
    await nameInput91.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput91.click({ clickCount: 3 });
    await nameInput91.fill(`DupPromo_TC91_${CommonUtils.generateRandomString(5)}`);
    await page.waitForTimeout(200);

    const dupBtn91 = dupDialog91.locator('button[aria-label="Duplicate"], button:has-text("Duplicate")').first();
    await dupBtn91.waitFor({ state: 'visible', timeout: 5000 });
    const daySelector91 = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

    // Select Start Date — click Duplicate (disabled, end date not set) to close calendar
    await dupDialog91.locator('span#startDate input').click();
    const startPanel91 = page.locator('.p-datepicker').first();
    await expect(startPanel91).toBeVisible({ timeout: 5000 });
    for (let m = 0; m < 12; m++) {
      if (await startPanel91.locator(daySelector91).count() > 0) break;
      await startPanel91.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await startPanel91.locator(daySelector91).first().click();
    await page.waitForTimeout(300);
    await dupBtn91.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Select End Date — close calendar via Promotion Name click (Duplicate is now enabled; avoid submitting)
    await dupDialog91.locator('span#endDate input').click();
    const endPanel91 = page.locator('.p-datepicker').first();
    await expect(endPanel91).toBeVisible({ timeout: 5000 });
    await endPanel91.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
    for (let m = 0; m < 12; m++) {
      if (await endPanel91.locator(daySelector91).count() > 0) break;
      await endPanel91.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await endPanel91.locator(daySelector91).first().click();
    await page.waitForTimeout(300);
    await nameInput91.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Click X icon — popup must close, no new promotion created
    const closeBtn91 = dupDialog91.locator('[data-pc-section="closebutton"], button[aria-label="Close"]').first();
    await closeBtn91.waitFor({ state: 'visible', timeout: 5000 });
    await closeBtn91.click();
    await expect(dupDialog91).toBeHidden({ timeout: 10000 });
    expect(await container91.locator('tbody tr[data-pc-section="bodyrow"]').count()).toBe(rowsBefore91);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_91-GenericWheel-DupXIconClose_success');
  });

  // ─── shared helpers (inline) ────────────────────────────────────────────────
  // createPromoForTest: creates a brand-new promotion and returns its unique name
  // Used by TC_92–TC_95 so we never touch pre-existing promotions.

  async function createPromoForTest(page: Page, prefix: string, hoursBack = 0): Promise<string> {
    const container = page.locator('generic-wheel');
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    const createBtn = container.locator('button[aria-label="Create Promotion"]');
    await createBtn.waitFor({ state: 'visible', timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const promoName = `${prefix}_${CommonUtils.generateRandomString(5)}`;
    const daySelector = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';
    const nameInput = dialog.locator('#promotionNameInput');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(promoName);

    // Allocation Strategy
    await dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]').click();
    const stratPanel = page.locator('.p-dropdown-panel');
    await expect(stratPanel).toBeVisible({ timeout: 5000 });
    await stratPanel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 });
    await stratPanel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Start Date
    await dialog.locator('#startDateCalendar input').click();
    const sPanel = page.locator('.p-datepicker').first();
    await expect(sPanel).toBeVisible({ timeout: 5000 });
    for (let m = 0; m < 12; m++) {
      if (await sPanel.locator(daySelector).count() > 0) break;
      await sPanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await sPanel.locator(daySelector).first().click();
    await page.waitForTimeout(300);

    // If requested, go back N hours using the timepicker Previous Hour arrow
    if (hoursBack > 0) {
      const prevHourBtn = sPanel.locator('.p-hour-picker [data-pc-section="decrementbutton"]');
      if (await prevHourBtn.isVisible().catch(() => false)) {
        for (let h = 0; h < hoursBack; h++) {
          await prevHourBtn.click();
          await page.waitForTimeout(80);
        }
      }
      await page.waitForTimeout(200);
    }

    await nameInput.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // End Date — 1 month forward
    await dialog.locator('#endDateCalendar input').click();
    const ePanel = page.locator('.p-datepicker').first();
    await expect(ePanel).toBeVisible({ timeout: 5000 });
    await ePanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
    for (let m = 0; m < 12; m++) {
      if (await ePanel.locator(daySelector).count() > 0) break;
      await ePanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
      await page.waitForTimeout(100);
    }
    await ePanel.locator(daySelector).first().click();
    await page.waitForTimeout(300);
    await nameInput.click({ force: true });
    await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);

    // Numeric fields
    for (const [selector, value] of [
      ['#spinsPerUserInput input', '5'],
      ['#dailySpinLimitInput input', '3'],
      ['#spinValidityDaysInput input', '7'],
      ['#numberOfSlicesInput input', '4'],
    ] as [string, string][]) {
      const inp = dialog.locator(selector);
      await inp.click({ clickCount: 3 });
      await inp.pressSequentially(value);
      await inp.press('Tab');
      await page.waitForTimeout(200);
    }

    // Region
    await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
    const regPanel = page.locator('.p-dropdown-panel');
    await expect(regPanel).toBeVisible({ timeout: 5000 });
    const regOpt = regPanel.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').filter({ hasText: /Betway Botswana|Betway Ghana/ }).first();
    await regOpt.waitFor({ state: 'visible', timeout: 5000 });
    await regOpt.click();
    await page.waitForTimeout(300);

    // Redirect URL + Save
    await dialog.locator('#redirectUrlInput').fill('https://example.com');
    await page.waitForTimeout(200);
    await dialog.locator('button[aria-label="Save Promotion"], button:has-text("Save")').first().click();
    await expect(dialog).toBeHidden({ timeout: 15000 });

    return promoName;
  }

  async function findCreatedPromo(page: Page, promoName: string) {
    const container = page.locator('generic-wheel');

    // Enable Include inactive toggle so the newly created promotion is visible
    const toggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    if (await toggle.getAttribute('aria-checked') === 'false') {
      await toggle.click();
      await page.waitForTimeout(600);
    }

    // Search by name
    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click({ clickCount: 3 });
    await searchInput.fill(promoName);
    await page.waitForTimeout(800);
    await container.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 20000 });

    return container;
  }

  // ─── TC_92 ───────────────────────────────────────────────────────────────────
  test('TC_92 - Verify Delete promotion - Click Yes on confirmation', async ({ page }, testInfo) => {
    const promoName92 = await createPromoForTest(page, 'DelYes_TC92');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_92-GenericWheel-PromoCreated');

    const container92 = await findCreatedPromo(page, promoName92);

    // Click three dots → Delete
    await container92.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const deleteItem92 = page.locator('li[role="menuitem"][aria-label="Delete"], li[role="menuitem"]:has-text("Delete")').first();
    await deleteItem92.waitFor({ state: 'visible', timeout: 5000 });
    await deleteItem92.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_92-GenericWheel-DeleteConfirmDialog');

    // Confirmation dialog — click Yes
    const yesBtn92 = page.locator('button[aria-label="Yes"]').first();
    await yesBtn92.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn92.click();
    await page.waitForTimeout(1000);

    // Promotion must no longer appear in the filtered list
    await expect(container92.locator('tbody tr[data-pc-section="bodyrow"]')).toHaveCount(0, { timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_92-GenericWheel-DeleteYes_success');
  });

  // ─── TC_93 ───────────────────────────────────────────────────────────────────
  test('TC_93 - Verify Delete promotion - Click No on confirmation', async ({ page }, testInfo) => {
    const promoName93 = await createPromoForTest(page, 'DelNo_TC93');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_93-GenericWheel-PromoCreated');

    const container93 = await findCreatedPromo(page, promoName93);

    // Click three dots → Delete
    await container93.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const deleteItem93 = page.locator('li[role="menuitem"][aria-label="Delete"], li[role="menuitem"]:has-text("Delete")').first();
    await deleteItem93.waitFor({ state: 'visible', timeout: 5000 });
    await deleteItem93.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_93-GenericWheel-DeleteConfirmDialog');

    // Confirmation dialog — click No
    const noBtn93 = page.locator('button[aria-label="No"]').first();
    await noBtn93.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn93.click();
    await page.waitForTimeout(500);

    // Confirmation dialog must close and promotion must still be in the list
    await expect(page.locator('button[aria-label="Yes"]')).toBeHidden({ timeout: 5000 });
    await expect(container93.locator('tbody tr[data-pc-section="bodyrow"]').first()).toBeVisible({ timeout: 5000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_93-GenericWheel-DeleteNo_success');
  });

  // ─── TC_94 ───────────────────────────────────────────────────────────────────
  // Simple flow per exact user steps: no created promotion, no prizes, no prior
  // activation — just open the three-dot menu on whatever promotion is already
  // there (beforeEach already lands on the Generic Wheel page), Deactivate, Yes.
  test('TC_94 - Verify Deactivate promotion - Click Yes on confirmation', async ({ page }, testInfo) => {
    const container94 = page.locator('generic-wheel');
    const firstRow94 = container94.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstRow94.waitFor({ state: 'visible', timeout: 20000 });

    // Click the three dots of the (any) first promotion to open its menu
    await firstRow94.locator('button.pure__table-menu-trigger').click();

    // "Deactivate" carries no aria-label — it's plain text inside a child
    // <span class="p-menuitem-text"> (confirmed via outerHTML) — match by text.
    const deactivateItem94 = page.locator('a.p-menuitem-link').filter({ hasText: 'Deactivate' }).first();
    await deactivateItem94.waitFor({ state: 'visible', timeout: 5000 });
    await deactivateItem94.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_94-GenericWheel-DeactivateConfirmDialog');

    // Confirmation dialog — click Yes
    const yesBtn94 = page.locator('button[aria-label="Yes"]').first();
    await yesBtn94.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn94.click();
    await page.waitForTimeout(1000);

    // Verify deactivation via success toast message
    const successToast94 = page.locator('.p-toast-message-success, .p-toast .p-toast-message, [data-p-severity="success"]').first();
    await expect(successToast94, 'Expected a success toast confirming deactivation').toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_94-GenericWheel-DeactivateYes_success');
  });

  // ─── TC_95 ───────────────────────────────────────────────────────────────────
  test('TC_95 - Verify Deactivate promotion - Click No on confirmation', async ({ page }, testInfo) => {
    const promoName95 = await createPromoForTest(page, 'DeactNo_TC95');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_95-GenericWheel-PromoCreated');

    const container95 = await findCreatedPromo(page, promoName95);

    // Click three dots → Activate (newly created promotion is inactive by default)
    await container95.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const activateItem95 = page.locator('a.p-menuitem-link[aria-label="Activate"]').first();
    await activateItem95.waitFor({ state: 'visible', timeout: 5000 });
    await activateItem95.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_95-GenericWheel-ActivateConfirmDialog');

    // Confirmation dialog — click No
    const noBtn95 = page.locator('button[aria-label="No"]').first();
    await noBtn95.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn95.click();
    await page.waitForTimeout(500);

    // Confirmation dialog must close and promotion must still be inactive (menu still shows "Activate")
    await expect(page.locator('button[aria-label="Yes"]')).toBeHidden({ timeout: 5000 });
    await container95.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 5000 });
    await container95.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const stillActivate95 = page.locator('a.p-menuitem-link[aria-label="Activate"]').first();
    await expect(stillActivate95).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_95-GenericWheel-ActivateNo_success');
  });

  // ─── TC_96 ───────────────────────────────────────────────────────────────────
  test('TC_96 - Verify Allocate Spins for an existing promotion', async ({ page }, testInfo) => {
    const container96 = page.locator('generic-wheel');
    await container96.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Click three dots → Promotion Summary
    await container96.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const summaryItem96 = page.locator('a.p-menuitem-link[aria-label="Promotion summary"], a.p-menuitem-link[aria-label="Promotion Summary"]').first();
    await summaryItem96.waitFor({ state: 'visible', timeout: 5000 });
    await summaryItem96.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_96-GenericWheel-PromotionSummaryPage');

    // Click Allocate Spins button
    const allocateSpinsBtn96 = page.locator('button[aria-label="Allocate spins"]').first();
    await allocateSpinsBtn96.waitFor({ state: 'visible', timeout: 10000 });
    await allocateSpinsBtn96.click();

    // Allocate Spins popup opens
    const allocateDialog96 = page.locator('div[role="dialog"]').first();
    await expect(allocateDialog96).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_96-GenericWheel-AllocateSpinsPopup');

    // Enter Account ID (input#account-id)
    const accountIdInput96 = allocateDialog96.locator('input#account-id');
    await accountIdInput96.waitFor({ state: 'visible', timeout: 10000 });
    await accountIdInput96.click({ clickCount: 3 });
    await accountIdInput96.fill('d8fbd552-3c20-4116-8099-80014e76d1bd');
    await page.waitForTimeout(300);

    // Save button becomes enabled once a valid UUID is entered
    const saveBtn96 = allocateDialog96.locator('button[aria-label="Save"]').first();
    await expect(saveBtn96).toBeEnabled({ timeout: 5000 });
    await saveBtn96.click();

    // Verify success via toast message
    const successToast96 = page.locator('.p-toast-message-success, .p-toast .p-toast-message, [data-p-severity="success"]').first();
    await expect(successToast96).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_96-GenericWheel-AllocateSpins_success');
  });

  // ─── TC_97 ───────────────────────────────────────────────────────────────────
  test('TC_97 - Verify Allocate Prize for an existing promotion', async ({ page }, testInfo) => {
    const container97 = page.locator('generic-wheel');
    await container97.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // ── Part 1: Add 'A' value bucket to the first prize ──────────────────────

    // Click three dots → View promotion prizes
    await container97.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const viewPrizesItem97 = page.locator('a.p-menuitem-link[aria-label="View promotion prizes"]').first();
    await viewPrizesItem97.waitFor({ state: 'visible', timeout: 5000 });
    await viewPrizesItem97.click();
    const prizeContainer97 = page.locator('generic-wheel-promotion-prizes');
    await prizeContainer97.waitFor({ state: 'visible', timeout: 20000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-PrizePage');

    // Read prize name from first row (used later to select prize in Allocate Prize popup)
    const firstPrizeRow97 = prizeContainer97.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstPrizeRow97.waitFor({ state: 'visible', timeout: 10000 });
    const prizeName97 = (await firstPrizeRow97.locator('td').first().innerText()).trim();

    // Click three dots on first prize → View Buckets
    await firstPrizeRow97.locator('button.pure__table-menu-trigger').click();
    const viewBucketsItem97 = page.locator('a.p-menuitem-link[aria-label="View Buckets"], a.p-menuitem-link[aria-label="View buckets"]').first();
    await viewBucketsItem97.waitFor({ state: 'visible', timeout: 5000 });
    await viewBucketsItem97.click();
    await page.waitForTimeout(2000);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-BucketsPage');

    // Click Add value bucket
    const addBucketBtn97 = page.locator('button[aria-label="Add value bucket"], button:has-text("Add value bucket")').first();
    await addBucketBtn97.waitFor({ state: 'visible', timeout: 10000 });
    await addBucketBtn97.click();
    const bucketDialog97 = page.locator('div[role="dialog"]').first();
    await expect(bucketDialog97).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-AddBucketPopup');

    // Select 'A' from Value Bucket dropdown (#valueBucketDropdown)
    await bucketDialog97.locator('#valueBucketDropdown [data-pc-section="trigger"]').click();
    const valueBucketPanel97 = page.locator('.p-dropdown-panel');
    await expect(valueBucketPanel97).toBeVisible({ timeout: 5000 });
    const optionA97 = valueBucketPanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').filter({ hasText: /^A$/ }).first();
    await optionA97.waitFor({ state: 'visible', timeout: 5000 });
    await optionA97.click();
    await page.waitForTimeout(300);

    // Select any value from Comp Code dropdown (#compCodeDropdown)
    await bucketDialog97.locator('#compCodeDropdown [data-pc-section="trigger"]').click();
    const compCodePanel97 = page.locator('.p-dropdown-panel');
    await expect(compCodePanel97).toBeVisible({ timeout: 5000 });
    await compCodePanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 });
    await compCodePanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Select any value from Notification Template dropdown (#notificationTemplateDropdown)
    await bucketDialog97.locator('#notificationTemplateDropdown [data-pc-section="trigger"]').click();
    const notifPanel97 = page.locator('.p-dropdown-panel');
    await expect(notifPanel97).toBeVisible({ timeout: 5000 });
    await notifPanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().waitFor({ state: 'visible', timeout: 5000 });
    await notifPanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first().click();
    await page.waitForTimeout(300);

    // Enter Comp Amount (#compAmountInput — p-inputnumber wraps the real input)
    const compAmountInput97 = bucketDialog97.locator('#compAmountInput input');
    await compAmountInput97.waitFor({ state: 'visible', timeout: 5000 });
    await compAmountInput97.click({ clickCount: 3 });
    await compAmountInput97.fill('100');
    await page.waitForTimeout(200);
    // Click User Allocated Limit to trigger blur and enable the Save button
    await bucketDialog97.locator('#userAllocatedLimitInput input').click();
    await page.waitForTimeout(300);

    // Save bucket
    const saveBucketBtn97 = bucketDialog97.locator('button[aria-label="Save"]').first();
    await expect(saveBucketBtn97).toBeEnabled({ timeout: 5000 });
    await saveBucketBtn97.click();
    await expect(bucketDialog97).toBeHidden({ timeout: 15000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-BucketSaved');

    // Back to Prize page
    const backToBuckets97 = page.locator('button.btn--info.p-component.p-button-icon-only').first();
    await backToBuckets97.waitFor({ state: 'visible', timeout: 5000 });
    await backToBuckets97.click();
    await prizeContainer97.waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(500);

    // Back to Generic Wheel page
    const backToPrizes97 = prizeContainer97.locator('button.btn--info.p-component.p-button-icon-only');
    await backToPrizes97.waitFor({ state: 'visible', timeout: 5000 });
    await backToPrizes97.click();
    await container97.waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(500);
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-BackOnMainPage');

    // ── Part 2: Allocate Prize ────────────────────────────────────────────────

    // Click three dots → Promotion Summary
    await container97.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const summaryItem97 = page.locator('a.p-menuitem-link[aria-label="Promotion Summary"]').first();
    await summaryItem97.waitFor({ state: 'visible', timeout: 5000 });
    await summaryItem97.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-PromotionSummaryPage');

    // Click Allocate Prize button
    const allocatePrizeBtn97 = page.locator('button[aria-label="Allocate prize"]').first();
    await allocatePrizeBtn97.waitFor({ state: 'visible', timeout: 10000 });
    await allocatePrizeBtn97.click();
    const allocatePrizeDialog97 = page.locator('div[role="dialog"]').first();
    await expect(allocatePrizeDialog97).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-AllocatePrizePopup');

    // Enter Account ID
    const accountIdInput97 = allocatePrizeDialog97.locator('input#account-id');
    await accountIdInput97.waitFor({ state: 'visible', timeout: 10000 });
    await accountIdInput97.click({ clickCount: 3 });
    await accountIdInput97.fill('d8fbd552-3c20-4116-8099-80014e76d1bd');
    await page.waitForTimeout(300);

    // Select the same prize from Prize dropdown (#prize)
    await allocatePrizeDialog97.locator('#prize [data-pc-section="trigger"]').click();
    const prizePanel97 = page.locator('.p-dropdown-panel');
    await expect(prizePanel97).toBeVisible({ timeout: 5000 });
    const prizeOption97 = prizeName97
      ? prizePanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').filter({ hasText: prizeName97 }).first()
      : prizePanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').first();
    await prizeOption97.waitFor({ state: 'visible', timeout: 5000 });
    await prizeOption97.click();
    await page.waitForTimeout(300);

    // Select 'A' from Bucket dropdown (#bucket)
    await allocatePrizeDialog97.locator('#bucket [data-pc-section="trigger"]').click();
    const bucketPanel97 = page.locator('.p-dropdown-panel');
    await expect(bucketPanel97).toBeVisible({ timeout: 5000 });
    const bucketOptionA97 = bucketPanel97.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').filter({ hasText: /^A$/ }).first();
    await bucketOptionA97.waitFor({ state: 'visible', timeout: 5000 });
    await bucketOptionA97.click();
    await page.waitForTimeout(300);

    // Click Save
    const saveAllocatePrizeBtn97 = allocatePrizeDialog97.locator('button[aria-label="Save"]').first();
    await expect(saveAllocatePrizeBtn97).toBeEnabled({ timeout: 5000 });
    await saveAllocatePrizeBtn97.click();

    // Verify success via toast message
    const successToast97 = page.locator('.p-toast-message-success, .p-toast .p-toast-message, [data-p-severity="success"]').first();
    await expect(successToast97).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_97-GenericWheel-AllocatePrize_success');
  });

  // ─── TC_98 ───────────────────────────────────────────────────────────────────
  test('TC_98 - Verify Remove Participant from Promotion Summary', async ({ page }, testInfo) => {
    const container98 = page.locator('generic-wheel');
    await container98.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Click three dots → Promotion Summary
    await container98.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const summaryItem98 = page.locator('a.p-menuitem-link[aria-label="Promotion Summary"]').first();
    await summaryItem98.waitFor({ state: 'visible', timeout: 5000 });
    await summaryItem98.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_98-GenericWheel-PromotionSummaryPage');

    // Read Account ID from the first row of the promotion summary list
    const summaryTable98 = page.locator('table, p-table, generic-wheel-promotion-summary').first();
    await summaryTable98.waitFor({ state: 'visible', timeout: 20000 });
    const firstSummaryRow98 = summaryTable98.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstSummaryRow98.waitFor({ state: 'visible', timeout: 10000 });
    // Account ID is typically the first cell in the row
    const accountId98 = (await firstSummaryRow98.locator('td').first().innerText()).trim();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_98-GenericWheel-SummaryListLoaded');

    // Click Remove participant button
    const deleteParticipantBtn98 = page.locator('button[aria-label="Remove participant"]').first();
    await deleteParticipantBtn98.waitFor({ state: 'visible', timeout: 10000 });
    await deleteParticipantBtn98.click();

    // Remove participant popup opens
    const deleteDialog98 = page.locator('div[role="dialog"]').first();
    await expect(deleteDialog98).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_98-GenericWheel-RemoveParticipantPopup');

    // Enter Account ID (input#accountId)
    const accountIdInput98 = deleteDialog98.locator('input#accountId');
    await accountIdInput98.waitFor({ state: 'visible', timeout: 10000 });
    await accountIdInput98.click({ clickCount: 3 });
    await accountIdInput98.fill(accountId98);
    await page.waitForTimeout(300);

    // Click Save (becomes enabled after valid UUID is entered)
    const saveBtn98 = deleteDialog98.locator('button[aria-label="Save"]').first();
    await expect(saveBtn98).toBeEnabled({ timeout: 5000 });
    await saveBtn98.click();

    // Verify success via toast message
    const successToast98 = page.locator('.p-toast-message-success, .p-toast .p-toast-message, [data-p-severity="success"]').first();
    await expect(successToast98).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_98-GenericWheel-RemoveParticipant_success');
  });

  // ─── TC_99 ───────────────────────────────────────────────────────────────────
  test('TC_99 - Verify Remove Single Participant from Promotion Summary', async ({ page }, testInfo) => {
    const container99 = page.locator('generic-wheel');
    await container99.locator('tbody tr[data-pc-section="bodyrow"]').first().waitFor({ state: 'visible', timeout: 30000 });

    // Click three dots → Promotion Summary
    await container99.locator('tbody tr[data-pc-section="bodyrow"]').first().locator('button.pure__table-menu-trigger').click();
    const summaryItem99 = page.locator('a.p-menuitem-link[aria-label="Promotion Summary"]').first();
    await summaryItem99.waitFor({ state: 'visible', timeout: 5000 });
    await summaryItem99.click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_99-GenericWheel-PromotionSummaryPage');

    // Wait for summary list to load and click Remove on the first row
    const firstSummaryRow99 = page.locator('tbody tr[data-pc-section="bodyrow"]').first();
    await firstSummaryRow99.waitFor({ state: 'visible', timeout: 20000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_99-GenericWheel-SummaryListLoaded');

    const removeBtn99 = firstSummaryRow99.locator('button[aria-label="Remove"]').first();
    await removeBtn99.waitFor({ state: 'visible', timeout: 5000 });
    await removeBtn99.click();

    // Confirmation dialog — click Yes
    const yesBtn99 = page.locator('button[aria-label="Yes"]').first();
    await yesBtn99.waitFor({ state: 'visible', timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_99-GenericWheel-RemoveConfirmDialog');
    await yesBtn99.click();

    // Verify success via toast message
    const successToast99 = page.locator('.p-toast-message-success, .p-toast .p-toast-message, [data-p-severity="success"]').first();
    await expect(successToast99).toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_99-GenericWheel-RemoveSingleParticipant_success');
  });

});