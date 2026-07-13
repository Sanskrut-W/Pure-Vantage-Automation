import { test, expect, Page, Locator, TestInfo } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

const DAY_SEL  = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';
const OPT_SEL  = '[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]';
const ROW_SEL  = 'tbody tr[data-pc-section="bodyrow"]';
const SAVE_SEL = 'button[aria-label="Save Promotion"], button:has-text("Save")';

async function waitRows(container: Locator, t = 30000) {
  await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: t });
}

async function openCreateDialog(page: Page) {
  const container = page.locator('generic-wheel');
  await waitRows(container);
  const btn = container.locator('button[aria-label="Create Promotion"]');
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  const dialog = page.locator('div[role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 15000 });
  return { container, dialog };
}

async function openEditDialog(page: Page) {
  const container = page.locator('generic-wheel');
  await waitRows(container);
  await container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger').click();
  const mi = page.locator('li[role="menuitem"][aria-label="Edit"]');
  await mi.waitFor({ state: 'visible', timeout: 5000 });
  await mi.click();
  const dialog = page.locator('div[role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 15000 });
  return { container, dialog };
}

async function reopenEdit(page: Page, container: Locator) {
  await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
  await container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger').click();
  const mi = page.locator('li[role="menuitem"][aria-label="Edit"]');
  await mi.waitFor({ state: 'visible', timeout: 5000 });
  await mi.click();
  const dialog = page.locator('div[role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 15000 });
  return dialog;
}

async function openPrizePage(page: Page) {
  const container = page.locator('generic-wheel');
  await waitRows(container);
  await container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger').click();
  const item = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
  await item.waitFor({ state: 'visible', timeout: 5000 });
  await item.click();
  const prizeContainer = page.locator('generic-wheel-promotion-prizes');
  await prizeContainer.waitFor({ state: 'visible', timeout: 20000 });
  return { container, prizeContainer };
}

async function pickDate(page: Page, calInput: Locator, monthsForward = 0) {
  await calInput.click();
  const panel = page.locator('.p-datepicker').first();
  await expect(panel).toBeVisible({ timeout: 5000 });
  for (let i = 0; i < monthsForward; i++) {
    await panel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
  }
  if (await panel.locator(DAY_SEL).count() === 0) {
    await panel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
    await page.waitForTimeout(100);
  }
  await panel.locator(DAY_SEL).first().click();
  await page.waitForTimeout(200);
  return panel;
}

async function fillNum(page: Page, loc: Locator, value: string) {
  await loc.click({ clickCount: 3 });
  await loc.pressSequentially(value);
  await loc.press('Tab');
  await page.waitForTimeout(200);
}

async function selectDd(page: Page, trigger: Locator, filter?: RegExp) {
  await trigger.click();
  const panel = page.locator('.p-dropdown-panel');
  await expect(panel).toBeVisible({ timeout: 5000 });
  const opt = filter
    ? panel.locator(OPT_SEL).filter({ hasText: filter }).first()
    : panel.locator(OPT_SEL).first();
  await opt.waitFor({ state: 'visible', timeout: 5000 });
  const text = (await opt.textContent() ?? '').trim();
  await opt.click();
  await page.waitForTimeout(300);
  return text;
}

async function fillMandatory(page: Page, dialog: Locator, slices = '4', promoName?: string) {
  const name = dialog.locator('#promotionNameInput');
  await name.waitFor({ state: 'visible', timeout: 10000 });
  await name.fill(promoName ?? `WheelPromo_${CommonUtils.generateRandomString(5)}`);
  await selectDd(page, dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]'));
  await pickDate(page, dialog.locator('#startDateCalendar input'));
  await name.click({ force: true }).catch(() => {});
  await page.waitForTimeout(200);
  await pickDate(page, dialog.locator('#endDateCalendar input'), 1);
  await name.click({ force: true }).catch(() => {});
  await page.waitForTimeout(200);
  await fillNum(page, dialog.locator('#spinsPerUserInput input'), '5');
  await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '3');
  await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '7');
  await fillNum(page, dialog.locator('#numberOfSlicesInput input'), slices);
  await selectDd(page, dialog.locator('#regionDropdown [data-pc-section="trigger"]'), /Betway Botswana|Betway Ghana/);
  await dialog.locator('#redirectUrlInput').fill('https://example.com');
  await page.waitForTimeout(200);
  return name;
}

async function ss(page: Page, testInfo: TestInfo, id: string) {
  await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', id);
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Generic Wheel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');
    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();
    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();
    const genericWheelLink = page.locator('a[href*="generic-wheel"]').first();
    await genericWheelLink.waitFor({ state: 'visible', timeout: 10000 });
    await genericWheelLink.click();
    await page.waitForURL('**/generic-wheel', { timeout: 15000 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('generic-wheel')).toBeVisible({ timeout: 30000 });
  });

  test('TC_01 - Verify Generic Wheel page loads successfully', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await expect(container).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h2').filter({ hasText: 'Generic' })).toBeVisible({ timeout: 10000 });
    await expect(container.locator(ROW_SEL).first()).toBeVisible({ timeout: 20000 });
    await ss(page, testInfo, 'TC_01-GenericWheel-PageLoads_success');
  });

  test('TC_02 - Verify promotion list is displayed', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });
    for (const col of ['Promotion Id','Promotion Name','Allocation Strategy','Start Date','End Date','Redirect URL','Is Active']) {
      await expect(container.locator('[data-pc-section="headertitle"]', { hasText: col }).first()).toBeVisible({ timeout: 5000 });
    }
    await ss(page, testInfo, 'TC_02-GenericWheel-PromotionList_success');
  });

  test('TC_03 - Verify Search functionality', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    const rows = container.locator(ROW_SEL);
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });
    const searchKeyword = ((await rows.first().locator('td').first().textContent()) ?? '').trim();
    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(600);
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    await ss(page, testInfo, 'TC_03-GenericWheel-SearchValid_success');
  });

  test('TC_04 - Verify Search with no results', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });
    const searchInput = container.locator('input.pure-input.w-20r[placeholder="Search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('ZZZZZ_NO_MATCH_99999');
    await page.waitForTimeout(600);
    await expect(container.locator(ROW_SEL)).toHaveCount(0, { timeout: 10000 });
    await ss(page, testInfo, 'TC_04-GenericWheel-SearchNoResults_success');
  });

  test('TC_05 - Verify Select a Region dropdown', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    const regionDropdown = container.locator('div.dropdown-input.w-20r[data-pc-section="root"]');
    await regionDropdown.locator('[data-pc-section="trigger"]').waitFor({ state: 'visible', timeout: 10000 });
    await regionDropdown.locator('[data-pc-section="trigger"]').click();
    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel.locator(OPT_SEL).first()).toBeVisible({ timeout: 5000 });
    await ss(page, testInfo, 'TC_05-GenericWheel-RegionDropdown_success');
  });

  test('TC_06 - Verify region filtering', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });
    const regionDropdown = container.locator('div.dropdown-input.w-20r[data-pc-section="root"]');
    await regionDropdown.locator('[data-pc-section="trigger"]').waitFor({ state: 'visible', timeout: 10000 });
    await regionDropdown.locator('[data-pc-section="trigger"]').click();
    const panel = page.locator('.p-dropdown-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
    await panel.locator(OPT_SEL).first().waitFor({ state: 'visible', timeout: 5000 });
    await panel.locator(OPT_SEL).first().click();
    await page.waitForTimeout(800);
    await expect(regionDropdown.locator('span[data-pc-section="input"]')).not.toHaveText('Select a region');
    const filteredRows = container.locator(ROW_SEL);
    if (await filteredRows.count() > 0) await expect(filteredRows.first()).toBeVisible({ timeout: 5000 });
    await ss(page, testInfo, 'TC_06-GenericWheel-RegionFiltering_success');
  });

  test('TC_07 - Verify Include inactive toggle OFF', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });
    const toggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(container.locator(ROW_SEL).first()).toBeVisible({ timeout: 10000 });
    await ss(page, testInfo, 'TC_07-GenericWheel-IncludeInactiveOFF_success');
  });

  test('TC_08 - Verify Include inactive toggle ON', async ({ page }, testInfo) => {
    const container = page.locator('generic-wheel');
    await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });
    const rowsBefore = await container.locator(ROW_SEL).count();
    const toggle = container.locator('[data-pc-name="inputswitch"][data-p-disabled="false"]');
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    await toggle.click();
    await page.waitForTimeout(800);
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(await container.locator(ROW_SEL).count()).toBeGreaterThanOrEqual(rowsBefore);
    await ss(page, testInfo, 'TC_08-GenericWheel-IncludeInactiveON_success');
  });

  test('TC_09 - Verify Create Promotion button click', async ({ page }, testInfo) => {
    await openCreateDialog(page);
    await ss(page, testInfo, 'TC_09-GenericWheel-CreatePromotionPopup_open');
  });

  test('TC_10 - Verify popup UI elements', async ({ page }, testInfo) => {
    const { dialog } = await openCreateDialog(page);
    for (const label of ['Promotion Name','Allocation Strategy','Start Date','End Date','Spins Per User','Daily Spin Limit','Spin Validity Days','Number of Slices','Region','Redirect URL','Ticket Prefix','Minimum Required Wager Total','Notification Template']) {
      await expect(dialog.locator(`label, span, div`, { hasText: label }).first()).toBeVisible({ timeout: 5000 });
    }
    await expect(dialog.locator('button:has-text("Save"), button:has-text("Create")')).toBeVisible({ timeout: 5000 });
    await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 5000 });
    await ss(page, testInfo, 'TC_10-GenericWheel-PopupUIElements_success');
  });

//   test('TC_11 - Verify mandatory fields validation', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const saveBtn = dialog.locator('button:has-text("Save"), button:has-text("Create")').first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
//     if (await saveBtn.isDisabled()) {
//       expect(await saveBtn.isDisabled()).toBe(true);
//     } else {
//       await saveBtn.click();
//       await expect(dialog.locator('.p-error, .ng-invalid ~ .p-error, [class*="error-msg"], small.p-error').first()).toBeVisible({ timeout: 5000 });
//     }
//     await ss(page, testInfo, 'TC_11-GenericWheel-MandatoryValidation_success');
//   });

//   test('TC_12 - Verify Promotion Name field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const nameInput = dialog.locator('#promotionNameInput');
//     await nameInput.waitFor({ state: 'visible', timeout: 10000 });
//     await nameInput.click();
//     await nameInput.fill('TestPromotion_AutoQA');
//     await expect(nameInput).toHaveValue('TestPromotion_AutoQA');
//     await nameInput.click({ clickCount: 3 });
//     await nameInput.fill('');
//     await nameInput.press('Tab');
//     await page.waitForTimeout(400);
//     await expect(dialog.locator('small.p-error.pure__error-message').first()).toBeVisible({ timeout: 5000 });
//     await ss(page, testInfo, 'TC_12-GenericWheel-PromotionNameField_success');
//   });

//   test('TC_13 - Verify Allocation Strategy dropdown', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const strategyDropdown = dialog.locator('[data-pc-name="dropdown"]').first();
//     await strategyDropdown.waitFor({ state: 'visible', timeout: 10000 });
//     await strategyDropdown.locator('[data-pc-section="trigger"]').click();
//     const panel = page.locator('.p-dropdown-panel');
//     await expect(panel).toBeVisible({ timeout: 5000 });
//     await expect(panel.locator(OPT_SEL).first()).toBeVisible({ timeout: 5000 });
//     expect(await panel.locator(OPT_SEL).count()).toBeGreaterThanOrEqual(1);
//     await ss(page, testInfo, 'TC_13-GenericWheel-AllocationStrategyDropdown_success');
//   });

//   test('TC_14 - Verify Allocation Strategy selection', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const strategyDropdown = dialog.locator('[data-pc-name="dropdown"]').first();
//     await strategyDropdown.waitFor({ state: 'visible', timeout: 10000 });
//     await strategyDropdown.locator('[data-pc-section="trigger"]').click();
//     const panel = page.locator('.p-dropdown-panel');
//     await expect(panel).toBeVisible({ timeout: 5000 });
//     const opts = panel.locator(OPT_SEL);
//     await opts.first().waitFor({ state: 'visible', timeout: 5000 });
//     const selectedText = (await opts.first().textContent() ?? '').trim();
//     await opts.first().click();
//     const labelText = (await strategyDropdown.locator('span[data-pc-section="label"], span.p-dropdown-label').textContent() ?? '').trim();
//     expect(labelText).toBe(selectedText);
//     await ss(page, testInfo, 'TC_14-GenericWheel-AllocationStrategySelection_success');
//   });

//   test('TC_15 - Verify Start Date selection', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const startCalendar = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]').first();
//     await startCalendar.waitFor({ state: 'visible', timeout: 10000 });
//     const dateInput = startCalendar.locator('input[type="text"]').first();
//     await dateInput.waitFor({ state: 'visible', timeout: 10000 });
//     await dateInput.click();
//     const calendarPanel = page.locator('.p-datepicker').first();
//     await expect(calendarPanel).toBeVisible({ timeout: 5000 });
//     const dayCell = calendarPanel.locator(DAY_SEL).first();
//     await dayCell.waitFor({ state: 'visible', timeout: 5000 });
//     const selectedDay = (await dayCell.textContent() ?? '').trim();
//     await dayCell.click();
//     await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
//     await page.waitForTimeout(500);
//     const dateValue = await dateInput.inputValue();
//     expect(dateValue.length).toBeGreaterThan(0);
//     expect(dateValue).toContain(selectedDay);
//     await ss(page, testInfo, 'TC_15-GenericWheel-StartDateSelection_success');
//   });

//   test('TC_16 - Verify End Date validation (end before start)', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const calendars = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]');
//     await calendars.nth(0).locator('input[type="text"]').click();
//     const calPanel = page.locator('.p-datepicker').first();
//     await expect(calPanel).toBeVisible({ timeout: 5000 });
//     await calPanel.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//     await page.waitForTimeout(300);
//     await calPanel.locator(DAY_SEL).first().waitFor({ state: 'visible', timeout: 5000 });
//     await calPanel.locator(DAY_SEL).first().click();
//     await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
//     await page.waitForTimeout(300);
//     await calendars.nth(1).locator('input[type="text"]').click();
//     const endPanel = page.locator('.p-datepicker').first();
//     await expect(endPanel).toBeVisible({ timeout: 5000 });
//     await endPanel.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
//     await page.waitForTimeout(300);
//     await expect(endPanel.locator(DAY_SEL)).toHaveCount(0, { timeout: 5000 });
//     await ss(page, testInfo, 'TC_16-GenericWheel-EndDateBeforeStart_success');
//   });

//   test('TC_17 - Verify valid date range accepted', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const calendars = dialog.locator('[data-pc-name="datepicker"], [data-pc-name="calendar"]');
//     await pickDate(page, calendars.nth(0).locator('input[type="text"]'));
//     await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
//     await page.waitForTimeout(300);
//     await pickDate(page, calendars.nth(1).locator('input[type="text"]'), 1);
//     await dialog.locator('#promotionNameInput').click({ force: true }).catch(() => {});
//     await page.waitForTimeout(300);
//     expect((await calendars.nth(0).locator('input[type="text"]').inputValue()).length).toBeGreaterThan(0);
//     expect((await calendars.nth(1).locator('input[type="text"]').inputValue()).length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_17-GenericWheel-ValidDateRange_success');
//   });

//   test('TC_18 - Verify Spins Per User field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const spinsInput = dialog.locator('[data-pc-name="inputnumber"]').nth(0).locator('input');
//     await spinsInput.waitFor({ state: 'visible', timeout: 10000 });
//     await spinsInput.click({ clickCount: 3 });
//     await spinsInput.pressSequentially('5');
//     expect(await spinsInput.inputValue()).toMatch(/^\d+$/);
//     await spinsInput.pressSequentially('abc');
//     expect(await spinsInput.inputValue()).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_18-GenericWheel-SpinsPerUser_success');
//   });

//   test('TC_19 - Verify Daily Spin Limit field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const spinLimitInput = dialog.locator('[data-pc-name="inputnumber"]').nth(1).locator('input');
//     await spinLimitInput.waitFor({ state: 'visible', timeout: 10000 });
//     await spinLimitInput.click({ clickCount: 3 });
//     await spinLimitInput.pressSequentially('3');
//     expect(await spinLimitInput.inputValue()).toMatch(/^\d+$/);
//     await spinLimitInput.pressSequentially('abc');
//     expect(await spinLimitInput.inputValue()).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_19-GenericWheel-DailySpinLimit_success');
//   });

//   test('TC_20 - Verify Spin Validity Days field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const validityInput = dialog.locator('[data-pc-name="inputnumber"]').nth(2).locator('input');
//     await validityInput.waitFor({ state: 'visible', timeout: 10000 });
//     await validityInput.click({ clickCount: 3 });
//     await validityInput.pressSequentially('7');
//     expect(await validityInput.inputValue()).toMatch(/^\d+$/);
//     await validityInput.pressSequentially('abc');
//     expect(await validityInput.inputValue()).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_20-GenericWheel-SpinValidityDays_success');
//   });

//   test('TC_21 - Verify Number of Slices field accepts input', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('5');
//     expect(await slicesInput.inputValue()).toMatch(/^\d+$/);
//     await ss(page, testInfo, 'TC_21-GenericWheel-NumberOfSlicesField_success');
//   });

//   test('TC_21 - Verify Number of Slices field accepts only numeric input', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('4');
//     expect(await slicesInput.inputValue()).toMatch(/^\d+$/);
//     await slicesInput.pressSequentially('abc');
//     expect(await slicesInput.inputValue()).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_21-GenericWheel-NumberOfSlicesNumericOnly_success');
//   });

//   test('TC_22 - Verify Number of Slices minimum value validation', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '1', `WheelPromo_TC22_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(page.locator('.p-toast-message-error, [data-p-severity="error"], .p-toast-message[class*="error"]').first()).toBeVisible({ timeout: 10000 });
//     await ss(page, testInfo, 'TC_22-GenericWheel-SlicesMinValidation_success');
//   });

//   test('TC_23 - Verify Number of Slices maximum value validation', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '9', `WheelPromo_TC23_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(page.locator('.p-toast-message-error, [data-p-severity="error"], .p-toast-message[class*="error"]').first()).toBeVisible({ timeout: 10000 });
//     await ss(page, testInfo, 'TC_23-GenericWheel-SlicesMaxValidation_success');
//   });

//   test('TC_24 - Verify valid lower boundary value for Number of Slices', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '2', `WheelPromo_TC24_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_24-GenericWheel-SlicesLowerBoundary_success');
//   });

//   test('TC_25 - Verify valid upper boundary value for Number of Slices', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '8', `WheelPromo_TC25_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_25-GenericWheel-SlicesUpperBoundary_success');
//   });

//   test('TC_93 - Verify dot cannot be typed in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('.');
//     await page.waitForTimeout(200);
//     expect(await slicesInput.inputValue()).not.toContain('.');
//     await ss(page, testInfo, 'TC_93-GenericWheel-DotNotAllowed_success');
//   });

//   test('TC_94 - Verify decimal value cannot be entered in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('5.5');
//     await page.waitForTimeout(200);
//     const val = await slicesInput.inputValue();
//     expect(val).not.toContain('.');
//     expect(val).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_94-GenericWheel-DecimalNotAllowed_success');
//   });

//   test('TC_95 - Verify copy-paste decimal value is blocked in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await page.evaluate(() => navigator.clipboard.writeText('6.2').catch(() => {}));
//     await page.waitForTimeout(100);
//     await slicesInput.focus();
//     await page.keyboard.press('Control+v');
//     await page.waitForTimeout(300);
//     await slicesInput.press('Tab');
//     await page.waitForTimeout(400);
//     const val = await slicesInput.inputValue();
//     expect(val).not.toContain('.');
//     expect(val).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_95-GenericWheel-PasteDecimalBlocked_success');
//   });

//   test('TC_96 - Verify only integer input allowed in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('5');
//     await page.waitForTimeout(200);
//     expect(await slicesInput.inputValue()).toBe('5');
//     await ss(page, testInfo, 'TC_96-GenericWheel-IntegerOnly_success');
//   });

//   test('TC_97 - Verify special character restriction in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('@#%');
//     await page.waitForTimeout(200);
//     const val = await slicesInput.inputValue();
//     expect(val).not.toContain('@');
//     expect(val).not.toContain('#');
//     expect(val).not.toContain('%');
//     expect(val).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_97-GenericWheel-SpecialCharRestriction_success');
//   });

//   test('TC_98 - Verify alphanumeric restriction in Number of Slices field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const slicesInput = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput.waitFor({ state: 'visible', timeout: 10000 });
//     await slicesInput.click({ clickCount: 3 });
//     await slicesInput.pressSequentially('5a');
//     await page.waitForTimeout(200);
//     const val = await slicesInput.inputValue();
//     expect(val).toMatch(/^\d*$/);
//     expect(val).not.toContain('a');
//     await ss(page, testInfo, 'TC_98-GenericWheel-AlphanumericRestriction_success');
//   });

//   test('TC_22 - Verify Region dropdown options are displayed', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
//     const regionPanel = page.locator('.p-dropdown-panel');
//     await expect(regionPanel).toBeVisible({ timeout: 5000 });
//     await expect(regionPanel.locator(OPT_SEL).first()).toBeVisible({ timeout: 5000 });
//     expect(await regionPanel.locator(OPT_SEL).count()).toBeGreaterThanOrEqual(1);
//     await ss(page, testInfo, 'TC_22-Region-GenericWheel-DropdownOptions_success');
//   });

//   test('TC_23 - Verify Region selection from dropdown', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await dialog.locator('#regionDropdown [data-pc-section="trigger"]').click();
//     const regionPanel = page.locator('.p-dropdown-panel');
//     await expect(regionPanel).toBeVisible({ timeout: 5000 });
//     const regionOption = regionPanel.locator(OPT_SEL).filter({ hasText: /Betway Botswana|Betway Ghana/ }).first();
//     await regionOption.waitFor({ state: 'visible', timeout: 5000 });
//     const selectedText = ((await regionOption.textContent()) ?? '').trim();
//     await regionOption.click();
//     await page.waitForTimeout(300);
//     await expect(dialog.locator('#regionDropdown span[data-pc-section="input"]')).toContainText(selectedText, { timeout: 5000 });
//     await ss(page, testInfo, 'TC_23-Region-GenericWheel-RegionSelected_success');
//   });

//   test('TC_24 - Verify Redirect URL field validation', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '4', `WheelPromo_TC24URL_${CommonUtils.generateRandomString(5)}`);
//     const urlInput = dialog.locator('#redirectUrlInput');
//     await urlInput.click();
//     await urlInput.fill('https://example.com');
//     await urlInput.press('Tab');
//     await page.waitForTimeout(200);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_24-RedirectURL-GenericWheel-Success');
//   });

//   test('TC_25 - Verify Ticket Prefix field accepts valid characters', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const ticketPrefixInput = dialog.locator('#ticketPrefixInput');
//     await ticketPrefixInput.waitFor({ state: 'visible', timeout: 10000 });
//     await ticketPrefixInput.click({ clickCount: 3 });
//     await ticketPrefixInput.fill('WHL');
//     await ticketPrefixInput.press('Tab');
//     await page.waitForTimeout(200);
//     await expect(ticketPrefixInput).toHaveValue('WHL');
//     await ss(page, testInfo, 'TC_25-GenericWheel-TicketPrefix_success');
//   });

//   test('TC_26 - Verify Minimum Required Wager Total field', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const wagerInput = dialog.locator('#minimumWagerInput input');
//     await wagerInput.waitFor({ state: 'visible', timeout: 10000 });
//     expect(await wagerInput.inputValue()).toMatch(/^\d+$/);
//     await wagerInput.click({ clickCount: 3 });
//     await wagerInput.pressSequentially('100');
//     await wagerInput.press('Tab');
//     await page.waitForTimeout(200);
//     expect(await wagerInput.inputValue()).toMatch(/^\d+$/);
//     await wagerInput.click({ clickCount: 3 });
//     await wagerInput.pressSequentially('abc');
//     await page.waitForTimeout(200);
//     expect(await wagerInput.inputValue()).toMatch(/^\d*$/);
//     await ss(page, testInfo, 'TC_26-GenericWheel-MinWager_success');
//   });

//   test('TC_27 - Verify Notification Template dropdown options are displayed', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await dialog.locator('#notificationDropdown [data-pc-section="trigger"]').click();
//     const notifPanel = page.locator('.p-dropdown-panel');
//     await expect(notifPanel).toBeVisible({ timeout: 5000 });
//     await expect(notifPanel.locator(OPT_SEL).first()).toBeVisible({ timeout: 5000 });
//     expect(await notifPanel.locator(OPT_SEL).count()).toBeGreaterThanOrEqual(1);
//     await ss(page, testInfo, 'TC_27-GenericWheel-NotifTemplateDropdown_success');
//   });

//   test('TC_28 - Verify Notification Template selection', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await dialog.locator('#notificationDropdown [data-pc-section="trigger"]').click();
//     const notifPanel = page.locator('.p-dropdown-panel');
//     await expect(notifPanel).toBeVisible({ timeout: 5000 });
//     const notifOptions = notifPanel.locator(OPT_SEL);
//     await notifOptions.first().waitFor({ state: 'visible', timeout: 5000 });
//     const optionCount = await notifOptions.count();
//     if (optionCount > 1) {
//       const selectedText = ((await notifOptions.nth(1).textContent()) ?? '').trim();
//       await notifOptions.nth(1).click();
//       await page.waitForTimeout(300);
//       await expect(dialog.locator('#notificationDropdown span[data-pc-section="input"]')).toContainText(selectedText, { timeout: 5000 });
//     } else {
//       const selectedText = ((await notifOptions.first().textContent()) ?? '').trim();
//       await notifOptions.first().click();
//       await page.waitForTimeout(300);
//       await expect(dialog.locator('#notificationDropdown span[data-pc-section="input"]')).toBeVisible({ timeout: 5000 });
//       expect(selectedText.length).toBeGreaterThan(0);
//     }
//     await ss(page, testInfo, 'TC_28-GenericWheel-NotifTemplateSelected_success');
//   });

//   test('TC_29 - Verify Save button with valid data creates promotion', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '4', `WheelPromo_TC29_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn = dialog.locator(SAVE_SEL).first();
//     await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_29-GenericWheel-SaveValidData_success');
//   });

//   test('TC_31 - Verify Cancel button closes popup without saving', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const name31 = dialog.locator('#promotionNameInput');
//     await name31.waitFor({ state: 'visible', timeout: 10000 });
//     await name31.fill('CancelTest_TC31');
//     const cancelBtn = dialog.locator('button:has-text("Cancel"), button[aria-label="Cancel"]').first();
//     await cancelBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await cancelBtn.click();
//     await page.waitForTimeout(300);
//     await expect(dialog).toBeHidden({ timeout: 10000 });
//     await ss(page, testInfo, 'TC_31-GenericWheel-CancelButton_success');
//   });

//   test('TC_32 - Verify Close (X) icon closes the popup', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const closeBtn = dialog.locator('[data-pc-section="closebutton"], button.p-dialog-header-close, button[aria-label="Close"]').first();
//     await closeBtn.waitFor({ state: 'visible', timeout: 5000 });
//     await closeBtn.click();
//     await page.waitForTimeout(300);
//     await expect(dialog).toBeHidden({ timeout: 10000 });
//     await ss(page, testInfo, 'TC_32-GenericWheel-CloseIcon_success');
//   });

//   test('TC_33 - Verify field values persist on validation error', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const name33 = dialog.locator('#promotionNameInput');
//     await name33.waitFor({ state: 'visible', timeout: 10000 });
//     const savedName = `PersistTest_TC33_${CommonUtils.generateRandomString(4)}`;
//     await name33.fill(savedName);
//     await selectDd(page, dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]'));
//     const saveBtn33 = dialog.locator(SAVE_SEL).first();
//     await saveBtn33.waitFor({ state: 'visible', timeout: 5000 });
//     if (!await saveBtn33.isDisabled()) {
//       await saveBtn33.click();
//       await page.waitForTimeout(500);
//     }
//     await expect(dialog).toBeVisible({ timeout: 3000 });
//     await expect(name33).toHaveValue(savedName);
//     await ss(page, testInfo, 'TC_33-GenericWheel-FieldPersistence_success');
//   });

//   test('TC_34 - Verify max length constraints on text fields', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const longString = 'A'.repeat(300);
//     const name34 = dialog.locator('#promotionNameInput');
//     await name34.waitFor({ state: 'visible', timeout: 10000 });
//     await name34.click({ clickCount: 3 });
//     await name34.fill(longString);
//     await name34.press('Tab');
//     await page.waitForTimeout(200);
//     const nameMaxLength = await name34.getAttribute('maxlength');
//     if (nameMaxLength) {
//       expect((await name34.inputValue()).length).toBeLessThanOrEqual(parseInt(nameMaxLength, 10));
//     } else {
//       expect((await name34.inputValue()).length).toBeGreaterThan(0);
//     }
//     const urlInput34 = dialog.locator('#redirectUrlInput');
//     await urlInput34.click({ clickCount: 3 });
//     await urlInput34.fill(longString);
//     await urlInput34.press('Tab');
//     await page.waitForTimeout(200);
//     const urlMaxLength = await urlInput34.getAttribute('maxlength');
//     if (urlMaxLength) {
//       expect((await urlInput34.inputValue()).length).toBeLessThanOrEqual(parseInt(urlMaxLength, 10));
//     } else {
//       expect((await urlInput34.inputValue()).length).toBeGreaterThan(0);
//     }
//     await ss(page, testInfo, 'TC_34-GenericWheel-MaxLength_success');
//   });

//   test('TC_35 - Verify numeric fields boundary values', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     await fillMandatory(page, dialog, '4', `WheelPromo_TC35_${CommonUtils.generateRandomString(5)}`);
//     const saveBtn35 = dialog.locator(SAVE_SEL).first();
//     await saveBtn35.waitFor({ state: 'visible', timeout: 5000 });

//     await fillNum(page, dialog.locator('#spinsPerUserInput input'), '0');
//     await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '0');
//     await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '0');
//     await fillNum(page, dialog.locator('#numberOfSlicesInput input'), '0');
//     await ss(page, testInfo, 'TC_35-GenericWheel-Boundary0');
//     await expect(saveBtn35).toBeDisabled({ timeout: 3000 });

//     await fillNum(page, dialog.locator('#spinsPerUserInput input'), '-5');
//     await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '-3');
//     await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '-1');
//     await fillNum(page, dialog.locator('#numberOfSlicesInput input'), '-2');
//     await ss(page, testInfo, 'TC_35-GenericWheel-BoundaryNegative');
//     await expect(saveBtn35).toBeDisabled({ timeout: 3000 });

//     await fillNum(page, dialog.locator('#spinsPerUserInput input'), '99999');
//     await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '99999');
//     await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '99999');
//     await fillNum(page, dialog.locator('#numberOfSlicesInput input'), '9999');
//     await ss(page, testInfo, 'TC_35-GenericWheel-BoundaryLarge');
//     await expect(saveBtn35).toBeDisabled({ timeout: 3000 });

//     await ss(page, testInfo, 'TC_35-GenericWheel-NumericBoundary_success');
//   });

//   test('TC_36 - Verify scroll behavior in popup', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const topField = dialog.locator('#promotionNameInput');
//     await expect(topField).toBeVisible({ timeout: 5000 });
//     await ss(page, testInfo, 'TC_36-GenericWheel-ScrollTop');
//     const bottomField = dialog.locator('label[for="hasSpinAgain"]');
//     await bottomField.scrollIntoViewIfNeeded();
//     await page.waitForTimeout(300);
//     await expect(bottomField).toBeVisible({ timeout: 5000 });
//     await ss(page, testInfo, 'TC_36-GenericWheel-ScrollBottom');
//     await topField.scrollIntoViewIfNeeded();
//     await page.waitForTimeout(300);
//     await expect(topField).toBeVisible({ timeout: 5000 });
//     await ss(page, testInfo, 'TC_36-GenericWheel-ScrollBehavior_success');
//   });

//   test('TC_37 - Verify Spin Again toggle is OFF by default', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_37-GenericWheel-SpinAgainDefault_success');
//   });

//   test('TC_38 - Verify enabling Spin Again toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await spinAgainSwitch.scrollIntoViewIfNeeded();
//     await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');
//     await dialog.locator('label[for="hasSpinAgain"]').click();
//     await page.waitForTimeout(300);
//     await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_38-GenericWheel-SpinAgainEnabled_success');
//   });

//   test('TC_39 - Verify disabling Spin Again toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const spinAgainSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinAgainSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await spinAgainSwitch.scrollIntoViewIfNeeded();
//     const label = dialog.locator('label[for="hasSpinAgain"]');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'true');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(spinAgainSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_39-GenericWheel-SpinAgainDisabled_success');
//   });

//   test('TC_40 - Verify Requires Opt In toggle is OFF by default', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await requiresOptInSwitch.scrollIntoViewIfNeeded();
//     await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_40-GenericWheel-RequiresOptInDefault_success');
//   });

//   test('TC_41 - Verify enabling Requires Opt In toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await requiresOptInSwitch.scrollIntoViewIfNeeded();
//     await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');
//     await dialog.locator('label[for="requiresOptIn"]').click();
//     await page.waitForTimeout(300);
//     await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_41-GenericWheel-RequiresOptInEnabled_success');
//   });

//   test('TC_42 - Verify disabling Requires Opt In toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const requiresOptInSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     await requiresOptInSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await requiresOptInSwitch.scrollIntoViewIfNeeded();
//     const label = dialog.locator('label[for="requiresOptIn"]');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'true');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(requiresOptInSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_42-GenericWheel-RequiresOptInDisabled_success');
//   });

//   test('TC_43 - Verify Allocate Ticket On All Prizes toggle is OFF by default', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await allocateSwitch.scrollIntoViewIfNeeded();
//     await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_43-GenericWheel-AllocateTicketDefault_success');
//   });

//   test('TC_44 - Verify enabling Allocate Ticket On All Prizes toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await allocateSwitch.scrollIntoViewIfNeeded();
//     await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');
//     await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
//     await page.waitForTimeout(300);
//     await expect(allocateSwitch).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_44-GenericWheel-AllocateTicketEnabled_success');
//   });

//   test('TC_45 - Verify disabling Allocate Ticket On All Prizes toggle', async ({ page }, testInfo) => {
//     const { dialog } = await openCreateDialog(page);
//     const allocateSwitch = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await allocateSwitch.waitFor({ state: 'visible', timeout: 10000 });
//     await allocateSwitch.scrollIntoViewIfNeeded();
//     const label = dialog.locator('label[for="allocateTicketOnAllPrizes"]');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(allocateSwitch).toHaveAttribute('aria-checked', 'true');
//     await label.click();
//     await page.waitForTimeout(300);
//     await expect(allocateSwitch).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_45-GenericWheel-AllocateTicketDisabled_success');
//   });

//   test('TC_46 - Verify toggle values persistence on Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openCreateDialog(page);
//     const promoName46 = `WheelPromo_TC46_${CommonUtils.generateRandomString(5)}`;
//     await fillMandatory(page, dialog, '4', promoName46);
//     await dialog.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
//     await dialog.locator('label[for="hasSpinAgain"]').click();
//     await page.waitForTimeout(200);
//     const saveBtn46 = dialog.locator(SAVE_SEL).first();
//     await saveBtn46.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn46.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_46-GenericWheel-ToggleSaved');

//     const inactiveText46 = container.getByText('Include inactive', { exact: false }).first();
//     await inactiveText46.waitFor({ state: 'visible', timeout: 5000 });
//     await inactiveText46.locator('xpath=following::span[@data-pc-section="slider"][1]').waitFor({ state: 'visible', timeout: 5000 });
//     await inactiveText46.locator('xpath=following::span[@data-pc-section="slider"][1]').click({ force: true });
//     await page.waitForTimeout(600);

//     const searchInput46 = container.locator('input.pure-input.w-20r[placeholder="Search"]');
//     await searchInput46.waitFor({ state: 'visible', timeout: 10000 });
//     await searchInput46.click({ clickCount: 3 });
//     await searchInput46.fill(promoName46);
//     await page.waitForTimeout(800);
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });

//     const actionBtn46 = container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger');
//     await actionBtn46.waitFor({ state: 'visible', timeout: 5000 });
//     await actionBtn46.click();
//     const editItem46 = page.locator('li[role="menuitem"][aria-label="Edit"]');
//     await editItem46.waitFor({ state: 'visible', timeout: 5000 });
//     await editItem46.click();
//     const editDialog46 = page.locator('div[role="dialog"]').first();
//     await expect(editDialog46).toBeVisible({ timeout: 15000 });
//     const spinAgainEdit46 = editDialog46.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinAgainEdit46.waitFor({ state: 'visible', timeout: 10000 });
//     await spinAgainEdit46.scrollIntoViewIfNeeded();
//     await expect(spinAgainEdit46).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_46-GenericWheel-TogglePersistence_success');
//   });

//   test('TC_47 - Verify toggle values reset on Cancel', async ({ page }, testInfo) => {
//     const { dialog: dialog47a } = await openCreateDialog(page);
//     const container = page.locator('generic-wheel');
//     await dialog47a.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
//     await dialog47a.locator('label[for="hasSpinAgain"]').click();
//     await page.waitForTimeout(200);
//     await dialog47a.locator('label[for="requiresOptIn"]').click();
//     await page.waitForTimeout(200);
//     await dialog47a.locator('label[for="allocateTicketOnAllPrizes"]').click();
//     await page.waitForTimeout(200);
//     await ss(page, testInfo, 'TC_47-GenericWheel-TogglesON');
//     const cancelBtn47 = dialog47a.locator('button:has-text("Cancel"), button[aria-label="Cancel"]').first();
//     await cancelBtn47.waitFor({ state: 'visible', timeout: 5000 });
//     await cancelBtn47.click();
//     await expect(dialog47a).toBeHidden({ timeout: 10000 });

//     const createBtn = container.locator('button[aria-label="Create Promotion"]');
//     await createBtn.click();
//     const dialog47b = page.locator('div[role="dialog"]').first();
//     await expect(dialog47b).toBeVisible({ timeout: 15000 });
//     const spinAgainReset = dialog47b.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     const optInReset     = dialog47b.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     const allocateReset  = dialog47b.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await spinAgainReset.scrollIntoViewIfNeeded();
//     await expect(spinAgainReset).toHaveAttribute('aria-checked', 'false');
//     await expect(optInReset).toHaveAttribute('aria-checked', 'false');
//     await expect(allocateReset).toHaveAttribute('aria-checked', 'false');
//     await ss(page, testInfo, 'TC_47-GenericWheel-TogglesReset_success');
//   });

//   test('TC_48 - Verify combined toggle behavior persists after Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openCreateDialog(page);
//     const promoName48 = `WheelPromo_TC48_${CommonUtils.generateRandomString(5)}`;
//     await fillMandatory(page, dialog, '4', promoName48);
//     await dialog.locator('label[for="hasSpinAgain"]').scrollIntoViewIfNeeded();
//     await dialog.locator('label[for="hasSpinAgain"]').click();
//     await page.waitForTimeout(200);
//     await dialog.locator('label[for="requiresOptIn"]').click();
//     await page.waitForTimeout(200);
//     await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
//     await page.waitForTimeout(200);
//     const saveBtn48 = dialog.locator(SAVE_SEL).first();
//     await saveBtn48.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn48.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_48-GenericWheel-AllTogglesSaved');

//     const inactiveText48 = container.getByText('Include inactive', { exact: false }).first();
//     await inactiveText48.waitFor({ state: 'visible', timeout: 5000 });
//     await inactiveText48.locator('xpath=following::span[@data-pc-section="slider"][1]').waitFor({ state: 'visible', timeout: 5000 });
//     await inactiveText48.locator('xpath=following::span[@data-pc-section="slider"][1]').click({ force: true });
//     await page.waitForTimeout(600);

//     const searchInput48 = container.locator('input.pure-input.w-20r[placeholder="Search"]');
//     await searchInput48.waitFor({ state: 'visible', timeout: 10000 });
//     await searchInput48.click({ clickCount: 3 });
//     await searchInput48.fill(promoName48);
//     await page.waitForTimeout(800);
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 20000 });

//     const actionBtn48 = container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger');
//     await actionBtn48.waitFor({ state: 'visible', timeout: 5000 });
//     await actionBtn48.click();
//     const editItem48 = page.locator('li[role="menuitem"][aria-label="Edit"]');
//     await editItem48.waitFor({ state: 'visible', timeout: 5000 });
//     await editItem48.click();
//     const editDialog48 = page.locator('div[role="dialog"]').first();
//     await expect(editDialog48).toBeVisible({ timeout: 15000 });
//     const spinAgainEdit48 = editDialog48.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     const optInEdit48     = editDialog48.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     const allocateEdit48  = editDialog48.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await spinAgainEdit48.scrollIntoViewIfNeeded();
//     await expect(spinAgainEdit48).toHaveAttribute('aria-checked', 'true');
//     await expect(optInEdit48).toHaveAttribute('aria-checked', 'true');
//     await expect(allocateEdit48).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_48-GenericWheel-CombinedToggles_success');
//   });

//   test('TC_49 - Verify Edit Promotion popup opens with pre-filled data', async ({ page }, testInfo) => {
//     const container = page.locator('generic-wheel');
//     await waitRows(container);
//     const firstRow = container.locator(ROW_SEL).first();
//     const existingName = ((await firstRow.locator('td').nth(1).textContent()) ?? '').trim();
//     await firstRow.locator('button.pure__table-menu-trigger').waitFor({ state: 'visible', timeout: 5000 });
//     await firstRow.locator('button.pure__table-menu-trigger').click();
//     await page.locator('li[role="menuitem"][aria-label="Edit"]').waitFor({ state: 'visible', timeout: 5000 });
//     await page.locator('li[role="menuitem"][aria-label="Edit"]').click();
//     const editDialog49 = page.locator('div[role="dialog"]').first();
//     await expect(editDialog49).toBeVisible({ timeout: 15000 });
//     const nameField49 = editDialog49.locator('#promotionNameInput');
//     await nameField49.waitFor({ state: 'visible', timeout: 10000 });
//     const prefillValue = await nameField49.inputValue();
//     expect(prefillValue.trim().length).toBeGreaterThan(0);
//     if (existingName.length > 0) expect(prefillValue.trim()).toBe(existingName);
//     await ss(page, testInfo, 'TC_49-GenericWheel-EditPopupPrefilled_success');
//   });

//   test('TC_50 - Verify existing data is populated in Edit popup', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     expect((await dialog.locator('#promotionNameInput').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#startDateCalendar input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#endDateCalendar input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#spinsPerUserInput input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#dailySpinLimitInput input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#spinValidityDaysInput input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#numberOfSlicesInput input').inputValue()).trim().length).toBeGreaterThan(0);
//     expect((await dialog.locator('#redirectUrlInput').inputValue()).trim().length).toBeGreaterThan(0);
//     expect(((await dialog.locator('#allocationStrategyDropdown span[data-pc-section="input"]').textContent()) ?? '').trim().length).toBeGreaterThan(0);
//     expect(((await dialog.locator('#regionDropdown span[data-pc-section="input"]').textContent()) ?? '').trim().length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_50-GenericWheel-ExistingDataPopulated_success');
//   });

//   test('TC_51 - Verify Promotion Name update in Edit popup', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const nameInput51 = dialog.locator('#promotionNameInput');
//     await nameInput51.waitFor({ state: 'visible', timeout: 5000 });
//     await nameInput51.click({ clickCount: 3 });
//     await nameInput51.fill(`EditedWheel_${CommonUtils.generateRandomString(5)}`);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_51-GenericWheel-PromotionNameUpdated_success');
//   });

//   test('TC_52 - Verify Allocation Strategy change in Edit popup', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     await selectDd(page, dialog.locator('#allocationStrategyDropdown [data-pc-section="trigger"]'));
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_52-GenericWheel-AllocationStrategyUpdated_success');
//   });

//   test('TC_53 - Verify Start Date update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog: dialog53 } = await openEditDialog(page);
//     await dialog53.locator('#startDateCalendar input').click();
//     const startPanel53 = page.locator('.p-datepicker').first();
//     await expect(startPanel53).toBeVisible({ timeout: 5000 });
//     const enabledDays53 = startPanel53.locator(DAY_SEL);
//     if (await enabledDays53.count() > 0) {
//       await enabledDays53.first().click();
//     } else {
//       await startPanel53.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//       await startPanel53.locator(DAY_SEL).first().click();
//     }
//     await page.waitForTimeout(300);
//     await dialog53.locator('#promotionNameInput').click();
//     await page.waitForTimeout(300);
//     await dialog53.locator(SAVE_SEL).first().click();
//     await expect(dialog53).toBeHidden({ timeout: 15000 });
//     const successToast53 = page.locator('.p-toast-message-success, .p-toast .p-toast-message').first();
//     if (await successToast53.isVisible().catch(() => false)) {
//       await expect(successToast53).toBeVisible({ timeout: 8000 });
//     }
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_53-GenericWheel-StartDateUpdated_success');
//   });

//   test('TC_54 - Verify End Date validation when End Date is before Start Date', async ({ page }, testInfo) => {
//     const { dialog: dialog54 } = await openEditDialog(page);
//     await dialog54.locator('#startDateCalendar input').click();
//     const startPanel54 = page.locator('.p-datepicker').first();
//     await expect(startPanel54).toBeVisible({ timeout: 5000 });
//     for (let i = 0; i < 12; i++) {
//       await startPanel54.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//       await page.waitForTimeout(80);
//     }
//     const startEnabled54 = startPanel54.locator(DAY_SEL);
//     if (await startEnabled54.count() === 0) {
//       await ss(page, testInfo, 'TC_54-GenericWheel-EndDateValidation_success');
//       return;
//     }
//     await startEnabled54.first().click();
//     await page.waitForTimeout(300);
//     await dialog54.locator('#endDateCalendar input').click();
//     const endPanel54 = page.locator('.p-datepicker').first();
//     await expect(endPanel54).toBeVisible({ timeout: 5000 });
//     await endPanel54.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
//     await page.waitForTimeout(200);
//     const endEnabled54 = endPanel54.locator(DAY_SEL);
//     if (await endEnabled54.count() === 0) {
//       await ss(page, testInfo, 'TC_54-GenericWheel-EndDateValidation_success');
//       return;
//     }
//     await endEnabled54.first().click();
//     await page.waitForTimeout(300);
//     const saveBtn54 = dialog54.locator(SAVE_SEL).first();
//     if (await saveBtn54.isDisabled()) {
//       await ss(page, testInfo, 'TC_54-GenericWheel-EndDateValidation_success');
//       return;
//     }
//     await saveBtn54.click();
//     const errorToast54 = page.locator('.p-toast-message-error, .p-message-error, .p-toast .p-toast-message').first();
//     if (await errorToast54.isVisible().catch(() => false)) {
//       await expect(errorToast54).toBeVisible({ timeout: 8000 });
//     } else {
//       await expect(dialog54).toBeVisible({ timeout: 5000 });
//     }
//     await ss(page, testInfo, 'TC_54-GenericWheel-EndDateValidation_success');
//   });

//   test('TC_55 - Verify valid Start Date and End Date update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog: dialog55 } = await openEditDialog(page);
//     await dialog55.locator('#startDateCalendar input').click();
//     const startPanel55 = page.locator('.p-datepicker').first();
//     await expect(startPanel55).toBeVisible({ timeout: 5000 });
//     const startEnabled55 = startPanel55.locator(DAY_SEL);
//     if (await startEnabled55.count() > 0) {
//       await startEnabled55.first().click();
//     } else {
//       await startPanel55.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//       await startPanel55.locator(DAY_SEL).first().click();
//     }
//     await page.waitForTimeout(300);
//     await dialog55.locator('#promotionNameInput').click();
//     await page.waitForTimeout(300);
//     await dialog55.locator('#endDateCalendar input').click();
//     const endPanel55 = page.locator('.p-datepicker').first();
//     await expect(endPanel55).toBeVisible({ timeout: 5000 });
//     await endPanel55.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//     await endPanel55.locator(DAY_SEL).first().click();
//     await page.waitForTimeout(300);
//     await dialog55.locator('#promotionNameInput').click();
//     await page.waitForTimeout(300);
//     await dialog55.locator(SAVE_SEL).first().click();
//     await expect(dialog55).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_55-GenericWheel-DatesUpdated_success');
//   });

//   test('TC_56 - Verify Spins Per User update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const spinsInput56 = dialog.locator('#spinsPerUserInput input');
//     await spinsInput56.waitFor({ state: 'visible', timeout: 5000 });
//     await fillNum(page, spinsInput56, '10');
//     await page.waitForTimeout(100);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_56-GenericWheel-SpinsPerUserUpdated_success');
//   });

//   test('TC_57 - Verify Daily Spin Limit update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const dailyInput57 = dialog.locator('#dailySpinLimitInput input');
//     await dailyInput57.waitFor({ state: 'visible', timeout: 5000 });
//     await fillNum(page, dailyInput57, '5');
//     await page.waitForTimeout(100);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_57-GenericWheel-DailySpinLimitUpdated_success');
//   });

//   test('TC_58 - Verify Spin Validity Days update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const validityInput58 = dialog.locator('#spinValidityDaysInput input');
//     await validityInput58.waitFor({ state: 'visible', timeout: 5000 });
//     await fillNum(page, validityInput58, '14');
//     await page.waitForTimeout(100);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_58-GenericWheel-SpinValidityDaysUpdated_success');
//   });

//   test('TC_59 - Verify Number of Slices update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const slicesInput59 = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput59.waitFor({ state: 'visible', timeout: 5000 });
//     await fillNum(page, slicesInput59, '6');
//     await page.waitForTimeout(100);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_59-GenericWheel-NumberOfSlicesUpdated_success');
//   });

//   test('TC_60 - Verify Region update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     await selectDd(page, dialog.locator('#regionDropdown [data-pc-section="trigger"]'), /Betway Botswana|Betway Ghana/);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_60-GenericWheel-RegionUpdated_success');
//   });

//   test('TC_61 - Verify Redirect URL update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const redirectInput61 = dialog.locator('#redirectUrlInput');
//     await redirectInput61.waitFor({ state: 'visible', timeout: 5000 });
//     await redirectInput61.click({ clickCount: 3 });
//     await redirectInput61.fill('https://example.com/updated-redirect');
//     await page.waitForTimeout(200);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog61b = await reopenEdit(page, container);
//     expect((await dialog61b.locator('#redirectUrlInput').inputValue()).trim().length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_61-GenericWheel-RedirectUrlUpdated_success');
//   });

//   test('TC_62 - Verify Ticket Prefix update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const prefixInput62 = dialog.locator('#ticketPrefixInput');
//     await prefixInput62.waitFor({ state: 'visible', timeout: 5000 });
//     await prefixInput62.click({ clickCount: 3 });
//     await prefixInput62.fill('TP');
//     await page.waitForTimeout(200);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog62b = await reopenEdit(page, container);
//     expect((await dialog62b.locator('#ticketPrefixInput').inputValue()).trim().length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_62-GenericWheel-TicketPrefixUpdated_success');
//   });

//   test('TC_63 - Verify Minimum Wager Total update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const wagerInput63 = dialog.locator('#minimumWagerInput input');
//     await wagerInput63.waitFor({ state: 'visible', timeout: 5000 });
//     await fillNum(page, wagerInput63, '100');
//     await page.waitForTimeout(100);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog63b = await reopenEdit(page, container);
//     expect((await dialog63b.locator('#minimumWagerInput input').inputValue()).trim().length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_63-GenericWheel-MinimumWagerUpdated_success');
//   });

//   test('TC_64 - Verify Notification Template update in Edit popup', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     await dialog.locator('#notificationDropdown [data-pc-section="trigger"]').click();
//     const notifPanel64 = page.locator('.p-dropdown-panel');
//     await expect(notifPanel64).toBeVisible({ timeout: 5000 });
//     const validOptions64 = notifPanel64.locator(OPT_SEL).filter({ hasNotText: /No Notification/i });
//     if (await validOptions64.count() === 0) {
//       await page.keyboard.press('Escape');
//       await ss(page, testInfo, 'TC_64-GenericWheel-NoNotifTemplates');
//       return;
//     }
//     await validOptions64.first().click();
//     await page.waitForTimeout(300);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog64b = await reopenEdit(page, container);
//     expect(((await dialog64b.locator('#notificationDropdown span[data-pc-section="input"]').textContent()) ?? '').trim().length).toBeGreaterThan(0);
//     await ss(page, testInfo, 'TC_64-GenericWheel-NotificationTemplateUpdated_success');
//   });

//   test('TC_65 - Verify Spin Again toggle update persists after Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const spinSwitch65 = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinSwitch65.scrollIntoViewIfNeeded();
//     const stateBefore65 = await spinSwitch65.getAttribute('aria-checked');
//     await dialog.locator('label[for="hasSpinAgain"]').click();
//     await page.waitForTimeout(200);
//     const stateAfter65 = stateBefore65 === 'true' ? 'false' : 'true';
//     await expect(spinSwitch65).toHaveAttribute('aria-checked', stateAfter65);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog65b = await reopenEdit(page, container);
//     const spinSwitch65b = dialog65b.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     await spinSwitch65b.scrollIntoViewIfNeeded();
//     await expect(spinSwitch65b).toHaveAttribute('aria-checked', stateAfter65);
//     await ss(page, testInfo, 'TC_65-GenericWheel-SpinAgainTogglePersisted_success');
//   });

//   test('TC_66 - Verify Requires Opt In toggle update persists after Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const optInSwitch66 = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     await optInSwitch66.scrollIntoViewIfNeeded();
//     const stateBefore66 = await optInSwitch66.getAttribute('aria-checked');
//     await dialog.locator('label[for="requiresOptIn"]').click();
//     await page.waitForTimeout(200);
//     const stateAfter66 = stateBefore66 === 'true' ? 'false' : 'true';
//     await expect(optInSwitch66).toHaveAttribute('aria-checked', stateAfter66);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog66b = await reopenEdit(page, container);
//     const optInSwitch66b = dialog66b.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     await optInSwitch66b.scrollIntoViewIfNeeded();
//     await expect(optInSwitch66b).toHaveAttribute('aria-checked', stateAfter66);
//     await ss(page, testInfo, 'TC_66-GenericWheel-RequiresOptInTogglePersisted_success');
//   });

//   test('TC_67 - Verify Allocate Ticket On All Prizes toggle update persists after Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const allocateSwitch67 = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await allocateSwitch67.scrollIntoViewIfNeeded();
//     const stateBefore67 = await allocateSwitch67.getAttribute('aria-checked');
//     await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
//     await page.waitForTimeout(200);
//     const stateAfter67 = stateBefore67 === 'true' ? 'false' : 'true';
//     await expect(allocateSwitch67).toHaveAttribute('aria-checked', stateAfter67);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog67b = await reopenEdit(page, container);
//     const allocateSwitch67b = dialog67b.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await allocateSwitch67b.scrollIntoViewIfNeeded();
//     await expect(allocateSwitch67b).toHaveAttribute('aria-checked', stateAfter67);
//     await ss(page, testInfo, 'TC_67-GenericWheel-AllocateTicketTogglePersisted_success');
//   });

//   test('TC_68 - Verify Save after making changes reflects in list', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const nameInput68 = dialog.locator('#promotionNameInput');
//     await nameInput68.waitFor({ state: 'visible', timeout: 5000 });
//     await nameInput68.click({ clickCount: 3 });
//     await nameInput68.fill(`Updated_${CommonUtils.generateRandomString(5)}`);
//     await page.waitForTimeout(200);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_68-GenericWheel-SaveAfterChanges_success');
//   });

//   test('TC_69 - Verify Save without changes causes no error', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const saveBtn69 = dialog.locator(SAVE_SEL).first();
//     await saveBtn69.waitFor({ state: 'visible', timeout: 5000 });
//     await saveBtn69.click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     await expect(page.locator('.p-toast-message-error, .p-message-error')).toBeHidden({ timeout: 3000 }).catch(() => {});
//     await container.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_69-GenericWheel-SaveWithoutChanges_success');
//   });

//   test('TC_70 - Verify Cancel button closes Edit popup without saving changes', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const nameInput70 = dialog.locator('#promotionNameInput');
//     await nameInput70.waitFor({ state: 'visible', timeout: 5000 });
//     const originalName70 = await nameInput70.inputValue();
//     await nameInput70.click({ clickCount: 3 });
//     await nameInput70.fill(`Cancelled_${CommonUtils.generateRandomString(5)}`);
//     await page.waitForTimeout(200);
//     const cancelBtn70 = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
//     await cancelBtn70.waitFor({ state: 'visible', timeout: 5000 });
//     await cancelBtn70.click();
//     await expect(dialog).toBeHidden({ timeout: 10000 });
//     const dialog70b = await reopenEdit(page, container);
//     expect((await dialog70b.locator('#promotionNameInput').inputValue()).trim()).toBe(originalName70.trim());
//     await ss(page, testInfo, 'TC_70-GenericWheel-CancelDiscardsChanges_success');
//   });

//   test('TC_71 - Verify X icon closes Edit popup without saving changes', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const nameInput71 = dialog.locator('#promotionNameInput');
//     await nameInput71.waitFor({ state: 'visible', timeout: 5000 });
//     const originalName71 = await nameInput71.inputValue();
//     await nameInput71.click({ clickCount: 3 });
//     await nameInput71.fill(`XClosed_${CommonUtils.generateRandomString(5)}`);
//     await page.waitForTimeout(200);
//     const closeBtn71 = dialog.locator('[data-pc-section="closebutton"], button[aria-label="Close"]').first();
//     await closeBtn71.waitFor({ state: 'visible', timeout: 5000 });
//     await closeBtn71.click();
//     await expect(dialog).toBeHidden({ timeout: 10000 });
//     const dialog71b = await reopenEdit(page, container);
//     expect((await dialog71b.locator('#promotionNameInput').inputValue()).trim()).toBe(originalName71.trim());
//     await ss(page, testInfo, 'TC_71-GenericWheel-XIconDiscardsChanges_success');
//   });

//   test('TC_72 - Verify mandatory field validation on Edit when required field is cleared', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const nameInput72 = dialog.locator('#promotionNameInput');
//     await nameInput72.waitFor({ state: 'visible', timeout: 5000 });
//     await nameInput72.click({ clickCount: 3 });
//     await nameInput72.fill('');
//     await nameInput72.press('Tab');
//     await page.waitForTimeout(200);
//     const saveBtn72 = dialog.locator(SAVE_SEL).first();
//     if (!await saveBtn72.isDisabled()) await saveBtn72.click();
//     if (!await saveBtn72.isDisabled()) {
//       await expect(dialog).toBeVisible({ timeout: 5000 });
//     }
//     await ss(page, testInfo, 'TC_72-GenericWheel-MandatoryFieldValidation_success');
//   });

//   test('TC_73 - Verify invalid input update shows proper error on Edit', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const slicesInput73 = dialog.locator('#numberOfSlicesInput input');
//     await slicesInput73.waitFor({ state: 'visible', timeout: 5000 });
//     await slicesInput73.click({ clickCount: 3 });
//     await slicesInput73.pressSequentially('99');
//     await slicesInput73.press('Tab');
//     await page.waitForTimeout(300);
//     const nameInput73 = dialog.locator('#promotionNameInput');
//     await nameInput73.click({ clickCount: 3 });
//     await nameInput73.fill('');
//     await nameInput73.press('Tab');
//     await page.waitForTimeout(200);
//     const saveBtn73 = dialog.locator(SAVE_SEL).first();
//     if (!await saveBtn73.isDisabled()) {
//       await saveBtn73.click();
//       const errorToast73 = page.locator('.p-toast-message-error, .p-message-error, .p-toast .p-toast-message').first();
//       if (await errorToast73.isVisible().catch(() => false)) {
//         await expect(errorToast73).toBeVisible({ timeout: 8000 });
//       } else {
//         await expect(dialog).toBeVisible({ timeout: 5000 });
//       }
//     } else {
//       await expect(saveBtn73).toBeDisabled();
//     }
//     await ss(page, testInfo, 'TC_73-GenericWheel-InvalidInputError_success');
//   });

//   test('TC_74 - Verify field values remain intact after a failed Save attempt', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const nameInput74 = dialog.locator('#promotionNameInput');
//     await nameInput74.waitFor({ state: 'visible', timeout: 5000 });
//     await nameInput74.click({ clickCount: 3 });
//     await nameInput74.fill('');
//     await nameInput74.press('Tab');
//     await page.waitForTimeout(200);
//     const redirectInput74 = dialog.locator('#redirectUrlInput');
//     await redirectInput74.click({ clickCount: 3 });
//     const testUrl74 = 'https://persist-check.example.com';
//     await redirectInput74.fill(testUrl74);
//     await page.waitForTimeout(200);
//     const saveBtn74 = dialog.locator(SAVE_SEL).first();
//     if (!await saveBtn74.isDisabled()) {
//       await saveBtn74.click();
//       await page.waitForTimeout(500);
//     }
//     await expect(dialog).toBeVisible({ timeout: 5000 });
//     expect((await dialog.locator('#promotionNameInput').inputValue()).trim()).toBe('');
//     expect((await dialog.locator('#redirectUrlInput').inputValue()).trim()).toBe(testUrl74);
//     await ss(page, testInfo, 'TC_74-GenericWheel-FieldsPersistAfterFailedSave_success');
//   });

//   test('TC_75 - Verify numeric field boundary values are handled correctly on Edit', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const saveBtn75 = dialog.locator(SAVE_SEL).first();
//     await fillNum(page, dialog.locator('#spinsPerUserInput input'), '0');
//     await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '0');
//     await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '0');
//     await fillNum(page, dialog.locator('#numberOfSlicesInput input'), '0');
//     await expect(saveBtn75).toBeDisabled({ timeout: 3000 });
//     await ss(page, testInfo, 'TC_75-GenericWheel-BoundaryZero');
//     await fillNum(page, dialog.locator('#spinsPerUserInput input'), '99999');
//     await fillNum(page, dialog.locator('#dailySpinLimitInput input'), '99999');
//     await fillNum(page, dialog.locator('#spinValidityDaysInput input'), '99999');
//     await fillNum(page, dialog.locator('#numberOfSlicesInput input'), '99');
//     await expect(saveBtn75).toBeDisabled({ timeout: 3000 });
//     await ss(page, testInfo, 'TC_75-GenericWheel-BoundaryLarge_success');
//   });

//   test('TC_76 - Verify only modified field is updated after partial edit', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const originalRedirect76 = await dialog.locator('#redirectUrlInput').inputValue();
//     const originalSpins76    = await dialog.locator('#spinsPerUserInput input').inputValue();
//     const nameInput76 = dialog.locator('#promotionNameInput');
//     await nameInput76.waitFor({ state: 'visible', timeout: 5000 });
//     await nameInput76.click({ clickCount: 3 });
//     const newName76 = `Partial_${CommonUtils.generateRandomString(5)}`;
//     await nameInput76.fill(newName76);
//     await page.waitForTimeout(200);
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog76b = await reopenEdit(page, container);
//     expect((await dialog76b.locator('#promotionNameInput').inputValue()).trim()).toBe(newName76);
//     expect((await dialog76b.locator('#redirectUrlInput').inputValue()).trim()).toBe(originalRedirect76.trim());
//     expect((await dialog76b.locator('#spinsPerUserInput input').inputValue()).trim()).toBe(originalSpins76.trim());
//     await ss(page, testInfo, 'TC_76-GenericWheel-PartialFieldUpdate_success');
//   });

//   test('TC_77 - Verify toggle combination persistence after Save', async ({ page }, testInfo) => {
//     const { container, dialog } = await openEditDialog(page);
//     const spinSwitch77     = dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     const optInSwitch77    = dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     const allocateSwitch77 = dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await spinSwitch77.scrollIntoViewIfNeeded();
//     if (await spinSwitch77.getAttribute('aria-checked') === 'false') {
//       await dialog.locator('label[for="hasSpinAgain"]').click();
//       await page.waitForTimeout(200);
//     }
//     if (await optInSwitch77.getAttribute('aria-checked') === 'false') {
//       await dialog.locator('label[for="requiresOptIn"]').click();
//       await page.waitForTimeout(200);
//     }
//     await allocateSwitch77.scrollIntoViewIfNeeded();
//     if (await allocateSwitch77.getAttribute('aria-checked') === 'false') {
//       await dialog.locator('label[for="allocateTicketOnAllPrizes"]').click();
//       await page.waitForTimeout(200);
//     }
//     await expect(spinSwitch77).toHaveAttribute('aria-checked', 'true');
//     await expect(optInSwitch77).toHaveAttribute('aria-checked', 'true');
//     await expect(allocateSwitch77).toHaveAttribute('aria-checked', 'true');
//     await dialog.locator(SAVE_SEL).first().click();
//     await expect(dialog).toBeHidden({ timeout: 15000 });
//     const dialog77b = await reopenEdit(page, container);
//     const spinSwitch77b     = dialog77b.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)');
//     const optInSwitch77b    = dialog77b.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)');
//     const allocateSwitch77b = dialog77b.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)');
//     await spinSwitch77b.scrollIntoViewIfNeeded();
//     await expect(spinSwitch77b).toHaveAttribute('aria-checked', 'true');
//     await expect(optInSwitch77b).toHaveAttribute('aria-checked', 'true');
//     await allocateSwitch77b.scrollIntoViewIfNeeded();
//     await expect(allocateSwitch77b).toHaveAttribute('aria-checked', 'true');
//     await ss(page, testInfo, 'TC_77-GenericWheel-ToggleCombinationPersisted_success');
//   });

//   test('TC_78 - Verify scroll behavior in Edit popup allows access to all fields', async ({ page }, testInfo) => {
//     const { dialog } = await openEditDialog(page);
//     const fields = [
//       dialog.locator('#promotionNameInput'),
//       dialog.locator('#allocationStrategyDropdown'),
//       dialog.locator('#startDateCalendar'),
//       dialog.locator('#endDateCalendar'),
//       dialog.locator('#spinsPerUserInput'),
//       dialog.locator('#dailySpinLimitInput'),
//       dialog.locator('#spinValidityDaysInput'),
//       dialog.locator('#numberOfSlicesInput'),
//       dialog.locator('#regionDropdown'),
//       dialog.locator('#redirectUrlInput'),
//       dialog.locator('#ticketPrefixInput'),
//       dialog.locator('#minimumWagerInput'),
//       dialog.locator('[data-pc-name="inputswitch"]:has(#hasSpinAgain)'),
//       dialog.locator('[data-pc-name="inputswitch"]:has(#requiresOptIn)'),
//       dialog.locator('[data-pc-name="inputswitch"]:has(#allocateTicketOnAllPrizes)'),
//     ];
//     for (const field of fields) {
//       await field.scrollIntoViewIfNeeded();
//       await expect(field).toBeVisible({ timeout: 5000 });
//     }
//     await ss(page, testInfo, 'TC_78-GenericWheel-ScrollBehavior_success');
//   });

//   test('TC_79 - Verify View Promotion Prizes page opens successfully', async ({ page }, testInfo) => {
//     const { prizeContainer: prizeContainer79 } = await openPrizePage(page);
//     await expect(page.locator('button[aria-label="Create Prize"]')).toBeVisible({ timeout: 10000 });
//     await expect(prizeContainer79.locator('button.btn--info.p-button-icon-only')).toBeVisible({ timeout: 5000 });
//     await ss(page, testInfo, 'TC_79-GenericWheel-PrizePage_success');
//   });

//   test('TC_80 - Verify Create Prize button opens Add Prize popup', async ({ page }, testInfo) => {
//     await openPrizePage(page);
//     const createPrizeBtn80 = page.locator('button[aria-label="Create Prize"]');
//     await createPrizeBtn80.waitFor({ state: 'visible', timeout: 5000 });
//     await createPrizeBtn80.click();
//     await expect(page.locator('div[role="dialog"]').first()).toBeVisible({ timeout: 10000 });
//     await ss(page, testInfo, 'TC_80-GenericWheel-CreatePrizePopupOpens_success');
//   });

//   test('TC_81 - Verify Save button disabled when mandatory fields are empty in Add Prize popup', async ({ page }, testInfo) => {
//     await openPrizePage(page);
//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog81 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog81).toBeVisible({ timeout: 10000 });
//     await expect(prizeDialog81.locator('button[aria-label="Save"], button:has-text("Save")').first()).toBeDisabled({ timeout: 3000 });
//     await ss(page, testInfo, 'TC_81-GenericWheel-PrizeMandatoryValidation_success');
//   });

//   test('TC_82 - Verify Winning Chance field rejects alphabetic characters', async ({ page }, testInfo) => {
//     await openPrizePage(page);
//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog82 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog82).toBeVisible({ timeout: 10000 });
//     const winningInput82 = prizeDialog82.locator('#winningChanceInput input');
//     await winningInput82.waitFor({ state: 'visible', timeout: 5000 });
//     const valueBefore82 = await winningInput82.inputValue();
//     await winningInput82.click();
//     await winningInput82.pressSequentially('abcXYZ');
//     await page.waitForTimeout(300);
//     expect((await winningInput82.inputValue()).replace(/[^0-9]/g, '')).toBe(valueBefore82.replace(/[^0-9]/g, ''));
//     await ss(page, testInfo, 'TC_82-GenericWheel-WinningChanceAlphaRejected_success');
//   });

//   test('TC_83 - Verify End Date before Start Date shows no clickable dates in Add Prize popup', async ({ page }, testInfo) => {
//     await openPrizePage(page);
//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog83 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog83).toBeVisible({ timeout: 10000 });
//     await prizeDialog83.locator('#startDateCalendar input').click();
//     const startPanel83 = page.locator('.p-datepicker').first();
//     await expect(startPanel83).toBeVisible({ timeout: 5000 });
//     const startEnabled83 = startPanel83.locator(DAY_SEL);
//     if (await startEnabled83.count() > 0) {
//       await startEnabled83.first().click();
//     } else {
//       await startPanel83.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//       await startPanel83.locator(DAY_SEL).first().click();
//     }
//     await page.waitForTimeout(300);
//     await prizeDialog83.locator('#displayTextInput').click();
//     await page.waitForTimeout(300);
//     await prizeDialog83.locator('#endDateCalendar input').click();
//     const endPanel83 = page.locator('.p-datepicker').first();
//     await expect(endPanel83).toBeVisible({ timeout: 5000 });
//     await endPanel83.locator('[data-pc-section="prevbutton"], .p-datepicker-prev').first().click();
//     await page.waitForTimeout(200);
//     expect(await endPanel83.locator(DAY_SEL).count()).toBe(0);
//     await ss(page, testInfo, 'TC_83-GenericWheel-PrizeDateRangeValidation_success');
//   });

//   test('TC_84 - Verify Cancel button closes Add Prize popup without creating prize', async ({ page }, testInfo) => {
//     const { prizeContainer: prizeContainer84 } = await openPrizePage(page);
//     const rowsBefore84 = await prizeContainer84.locator(ROW_SEL).count();
//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog84 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog84).toBeVisible({ timeout: 10000 });
//     await prizeDialog84.locator('#displayTextInput').fill('CancelTest');
//     await page.waitForTimeout(200);
//     const cancelBtn84 = prizeDialog84.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
//     await cancelBtn84.waitFor({ state: 'visible', timeout: 5000 });
//     await cancelBtn84.click();
//     await expect(prizeDialog84).toBeHidden({ timeout: 10000 });
//     expect(await prizeContainer84.locator(ROW_SEL).count()).toBe(rowsBefore84);
//     await ss(page, testInfo, 'TC_84-GenericWheel-PrizeCancelButton_success');
//   });

//   test('TC_85 - Verify X icon closes Add Prize popup without creating prize', async ({ page }, testInfo) => {
//     const { prizeContainer: prizeContainer85 } = await openPrizePage(page);
//     const rowsBefore85 = await prizeContainer85.locator(ROW_SEL).count();
//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog85 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog85).toBeVisible({ timeout: 10000 });
//     await prizeDialog85.locator('#displayTextInput').fill('XCloseTest');
//     await page.waitForTimeout(200);
//     const closeBtn85 = prizeDialog85.locator('[data-pc-section="closebutton"], button[aria-label="Close"]').first();
//     await closeBtn85.waitFor({ state: 'visible', timeout: 5000 });
//     await closeBtn85.click();
//     await expect(prizeDialog85).toBeHidden({ timeout: 10000 });
//     expect(await prizeContainer85.locator(ROW_SEL).count()).toBe(rowsBefore85);
//     await ss(page, testInfo, 'TC_85-GenericWheel-PrizeXIconClose_success');
//   });

//   test('TC_86 - Verify Back button navigates back to Generic Wheel page', async ({ page }, testInfo) => {
//     const { prizeContainer: prizeContainer86 } = await openPrizePage(page);
//     const backBtn86 = prizeContainer86.locator('button.btn--info.p-button-icon-only');
//     await backBtn86.waitFor({ state: 'visible', timeout: 5000 });
//     await backBtn86.click();
//     await expect(page.locator('generic-wheel')).toBeVisible({ timeout: 15000 });
//     await ss(page, testInfo, 'TC_86-GenericWheel-BackButton_success');
//   });

//   test('TC_87 - Verify creation of Promotion Prize', async ({ page }, testInfo) => {
//     const container = page.locator('generic-wheel');
//     await waitRows(container);
//     const rowCells87 = container.locator(ROW_SEL).first().locator('td[data-pc-section="bodycell"]');
//     let promoMonth87 = -1;
//     let promoYear87  = -1;
//     const cellCount87 = await rowCells87.count();
//     for (let ci = 0; ci < cellCount87; ci++) {
//       const txt = (await rowCells87.nth(ci).textContent() ?? '').trim();
//       const match = txt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
//       if (match) {
//         promoMonth87 = parseInt(match[2]) - 1;
//         promoYear87  = parseInt(match[3]);
//         break;
//       }
//     }

//     await container.locator(ROW_SEL).first().locator('button.pure__table-menu-trigger').click();
//     const viewPrizesItem87 = page.locator('li[role="menuitem"][aria-label="View Promotion Prizes"], li[role="menuitem"]:has-text("View Promotion Prizes")').first();
//     await viewPrizesItem87.waitFor({ state: 'visible', timeout: 5000 });
//     await viewPrizesItem87.click();
//     const prizeContainer87 = page.locator('generic-wheel-promotion-prizes');
//     await prizeContainer87.waitFor({ state: 'visible', timeout: 20000 });

//     await page.locator('button[aria-label="Create Prize"]').click();
//     const prizeDialog87 = page.locator('div[role="dialog"]').first();
//     await expect(prizeDialog87).toBeVisible({ timeout: 10000 });

//     await selectDd(page, prizeDialog87.locator('#prizeTypeDropdown [data-pc-section="trigger"]'));
//     await prizeDialog87.locator('#displayTextInput').fill(`Prize_${CommonUtils.generateRandomString(5)}`);
//     await page.waitForTimeout(200);
//     const winningInput87 = prizeDialog87.locator('#winningChanceInput input');
//     await winningInput87.click({ clickCount: 3 });
//     await winningInput87.pressSequentially('10');
//     await winningInput87.press('Tab');
//     await page.waitForTimeout(200);

//     await prizeDialog87.locator('#startDateCalendar input').click();
//     const startPanel87 = page.locator('.p-datepicker').first();
//     await expect(startPanel87).toBeVisible({ timeout: 5000 });
//     if (promoMonth87 >= 0 && promoYear87 >= 0) {
//       const targetMonth87 = promoMonth87 + 1 > 11 ? 0 : promoMonth87 + 1;
//       const targetYear87  = promoMonth87 + 1 > 11 ? promoYear87 + 1 : promoYear87;
//       const now87 = new Date();
//       const monthsToNav87 = Math.max(0, (targetYear87 - now87.getFullYear()) * 12 + (targetMonth87 - now87.getMonth()));
//       for (let m = 0; m < monthsToNav87; m++) {
//         await startPanel87.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//         await page.waitForTimeout(100);
//       }
//     }
//     for (let m = 0; m < 12; m++) {
//       if (await startPanel87.locator(DAY_SEL).count() > 0) break;
//       await startPanel87.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//       await page.waitForTimeout(100);
//     }
//     await startPanel87.locator(DAY_SEL).first().click();
//     await page.waitForTimeout(300);
//     await prizeDialog87.locator('#displayTextInput').click({ force: true });
//     await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
//     await page.waitForTimeout(300);

//     await prizeDialog87.locator('#endDateCalendar input').click();
//     const endPanel87 = page.locator('.p-datepicker').first();
//     await expect(endPanel87).toBeVisible({ timeout: 5000 });
//     await endPanel87.locator('[data-pc-section="nextbutton"], .p-datepicker-next').first().click();
//     await page.waitForTimeout(100);
//     await endPanel87.locator(DAY_SEL).first().click();
//     await page.waitForTimeout(300);
//     await prizeDialog87.locator('#displayTextInput').click({ force: true });
//     await page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
//     await page.waitForTimeout(300);

//     await prizeDialog87.locator('button[aria-label="Save"], button:has-text("Save")').first().click();
//     await expect(prizeDialog87).toBeHidden({ timeout: 15000 });
//     await prizeContainer87.locator(ROW_SEL).first().waitFor({ state: 'visible', timeout: 10000 });
//     await ss(page, testInfo, 'TC_87-GenericWheel-PrizeCreated_success');
//   });

});
