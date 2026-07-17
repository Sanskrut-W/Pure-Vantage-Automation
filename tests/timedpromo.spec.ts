import { test, expect, Page } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// ─── Setup helpers ────────────────────────────────────────────────────────────

async function selectFirstDropdownOption(page: Page, dropdown: ReturnType<Page['locator']>): Promise<void> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });

  // :not(option) is critical — PrimeNG renders a hidden native <select> alongside its visual
  // dropdown, and [data-pc-section="option"] matches both. Native <option> elements are never
  // "visible" in Playwright, so without :not(option) the wait loops forever on them.
  const optionSelector = [
    '[data-pc-section="option"]:not(option)',
    '.p-dropdown-item',
    '.p-select-option',
    'li[role="option"]',
  ].join(', ');

  const openDropdown = async () => {
    const triggerCandidates = [
      '[data-pc-section="label"]',
      '[data-pc-section="trigger"]',
      '[data-pc-section="dropdownicon"]',
      '.p-dropdown-label',
      '.p-select-label',
      '.p-dropdown-trigger',
    ];
    for (const sel of triggerCandidates) {
      const el = dropdown.locator(sel).first();
      if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
        await el.click().catch(() => el.click({ force: true }));
        return;
      }
    }
    await dropdown.click().catch(() => dropdown.click({ force: true }));
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    await openDropdown();
    // Poll options directly — avoids a slow two-step panel→option check that lets the panel close
    const firstOption = page.locator(optionSelector).first();
    if (await firstOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstOption.click();
      return;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  // Keyboard fallback
  const focusTarget = dropdown.locator('[data-pc-section="label"], .p-dropdown-label, .p-select-label').first();
  if (await focusTarget.isVisible({ timeout: 1000 }).catch(() => false)) {
    await focusTarget.click();
  } else {
    await page.keyboard.press('Alt+ArrowDown');
  }
  const firstOption = page.locator(optionSelector).first();
  await firstOption.waitFor({ state: 'visible', timeout: 10000 });
  await firstOption.click();
}

async function clickSelectTypeIfShown(dialog: ReturnType<Page['locator']>): Promise<void> {
  const selectTypeBtn = dialog.locator('button:has-text("Select Type")').first();
  if (await selectTypeBtn.isVisible().catch(() => false)) {
    await selectTypeBtn.click();
  }
}

async function fillInputNumber(input: ReturnType<Page['locator']>, value: string): Promise<void> {
  await input.waitFor({ state: 'visible', timeout: 5000 });

  // PrimeNG's InputNumber intercepts Backspace/End itself and, at its min-value boundary
  // (e.g. a field sitting at "0%"), a lone boundary Backspace can be swallowed instead of
  // clearing the field — collapsing the caret to a bare position never actually empties it.
  // Selecting the full text first and deleting the *selection* takes a different internal
  // code path (replace, not decrement-at-boundary) and reliably empties the field first.
  for (let attempt = 0; attempt < 3; attempt++) {
    await input.click({ clickCount: 3 });
    await input.press('Control+A');
    await input.press('Delete');
    await input.pressSequentially(value);

    const digitsOnly = (await input.inputValue()).replace(/[^\d.-]/g, '');
    if (digitsOnly === value) return;
  }

  // Last resort: bypass keyboard simulation entirely by setting the underlying value via the
  // native setter and firing the 'input'/'change' events PrimeNG's onInput handler listens for.
  await input.evaluate((el: HTMLInputElement, val: string) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function clickPrimeButtonByLabel(scope: Page | ReturnType<Page['locator']>, label: string): Promise<void> {
  // Target the button directly via aria-label — matches the actual DOM attribute exactly.
  const button = scope.locator(`button[aria-label="${label}"]`).first();
  await button.waitFor({ state: 'visible', timeout: 15000 });
  await button.scrollIntoViewIfNeeded();
  await button.click();
}

async function selectTimeUsingClockArrows(
  page: Page,
  input: ReturnType<Page['locator']>,
  panelSelector: string,
  hourClicks: number,
  minuteClicks: number,
  fallbackValue: string
): Promise<void> {
  const panel = page.locator(panelSelector).first();
  const panelOpened = await panel.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

  const hourUpArrow = panel
    .locator('.p-hour-picker [data-pc-section="incrementbutton"], .p-hour-picker button:has(.pi-chevron-up), .p-hour-picker a.p-link:has(.pi-chevron-up)')
    .first();
  const arrowsAvailable = panelOpened && (await hourUpArrow.isVisible({ timeout: 2000 }).catch(() => false));

  if (arrowsAvailable) {
    for (let i = 0; i < hourClicks; i++) {
      await hourUpArrow.click();
      await page.waitForTimeout(150);
    }

    const minuteUpArrow = panel
      .locator('.p-minute-picker [data-pc-section="incrementbutton"], .p-minute-picker button:has(.pi-chevron-up), .p-minute-picker a.p-link:has(.pi-chevron-up)')
      .first();
    for (let i = 0; i < minuteClicks; i++) {
      await minuteUpArrow.click();
      await page.waitForTimeout(150);
    }
    return;
  }

  // The clock panel/arrows weren't found (combobox popup rendered differently) — type the
  // time directly into the field so the field still ends up populated and Save can enable.
  await input.click();
  await input.fill(fallbackValue);
  await page.keyboard.press('Escape').catch(() => {});
}

async function confirmIfShown(page: Page): Promise<void> {
  // Target the PrimeNG confirm-dialog accept button directly via aria-label and class
  const confirmBtn = page
    .locator('button[aria-label="Yes"], button.p-confirm-dialog-accept, button[aria-label="Confirm"], button[aria-label="OK"]')
    .first();

  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
}

async function setupOptInTrigger(page: Page): Promise<void> {
  await clickPrimeButtonByLabel(page, 'Create Opt-In Trigger');
  const d = page.locator('div[role="dialog"]').first();
  await expect(d).toBeVisible({ timeout: 15000 });
  await selectFirstDropdownOption(page, d.locator('#type'));
  await clickSelectTypeIfShown(d);
  await page.waitForTimeout(300);
  await fillInputNumber(d.locator('#minWagerAmount input'), '5');
  await fillInputNumber(d.locator('#minimumOdds input'), '1');
  await d.locator('button:has-text("Save")').first().click();
  await expect(d).not.toBeVisible({ timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

async function setupPrizeConfig(page: Page): Promise<void> {
  const createBtn = page.locator('button:has-text("Create Prize Configuration")').first();
  await createBtn.waitFor({ state: 'visible', timeout: 15000 });
  await createBtn.click();
  const d = page.locator('div[role="dialog"]').first();
  await expect(d).toBeVisible({ timeout: 15000 });
  await d.locator('.p-dropdown').nth(0).click();
  await page.waitForTimeout(500);
  await page.locator('.p-dropdown-panel .p-dropdown-item').first().click();
  await page.waitForTimeout(300);
  await d.locator('input[type="number"]').first().fill('3');
  await d.locator('.p-dropdown').nth(1).click();
  await page.waitForTimeout(500);
  await page.locator('.p-dropdown-panel .p-dropdown-item').first().click();
  await page.waitForTimeout(300);
  await d.locator('button:has-text("Save")').first().click();
  await expect(d).not.toBeVisible({ timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMED PROMOTIONS  (TC1 – TC11, TC36)
// Navigation: Marketing → Promotions → Timed Promotions
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Timed Promotions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();

    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();

    const timedPromotionsLink = page.locator('a[href*="timed-promotions"]').first();
    await timedPromotionsLink.waitFor({ state: 'visible', timeout: 10000 });
    await timedPromotionsLink.click();
    await page.waitForURL('**/timed-promotions', { timeout: 15000 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('timed-promotions')).toBeVisible({ timeout: 30000 });
  });

  // TC1
  test('Verify navigation to Timed Promotions page', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    await expect(container.locator('input[placeholder="Search"]')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('div.p-inputswitch')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('button[aria-label="Create Timed Promotion"]')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC1-TimedPromotionsNavigation_success');
  });

  // TC2
  test('Verify Create Timed Promotion popup', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await expect(dialog.locator('#name')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#region')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#description')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#startDate')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#endDate')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#multiCompFrequency')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#isGlobal')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('#isTesting')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('button:has-text("Save")')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC2-CreateTimedPromoPopup_open');

    await dialog.locator('button:has-text("Cancel")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC3
  test('Verify mandatory field validation', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const saveBtn = dialog.locator('button:has-text("Save")').first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC3-TimedPromoMandatoryFields_success');

    await dialog.locator('button:has-text("Cancel")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC4
  test('Verify Timed Promotion creation', async ({ page }, testInfo) => {
    const promoName = `AutoPromo-${CommonUtils.generateRandomString(6)}`;

    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#name').fill(promoName);
    await dialog.locator('#description').fill('Automated test promotion');

    // Region
    await dialog.locator('#region').click();
    await page.waitForTimeout(500);
    await page.locator('.p-dropdown-panel .p-dropdown-item').first().click();
    await page.waitForTimeout(300);

    // Start Date — click first available day in panel
    await dialog.locator('#startDate').click();
    const startPanel = page.locator('#startDate_panel');
    await startPanel.waitFor({ state: 'visible', timeout: 10000 });
    await startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click({ force: true });
    await page.waitForTimeout(500);

    // End Date — click last available day in panel
    await dialog.locator('#endDate').click();
    const endPanel = page.locator('#endDate_panel');
    await endPanel.waitFor({ state: 'visible', timeout: 10000 });
    await endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last().click({ force: true });
    await page.waitForTimeout(500);

    // Multi Comp Frequency — select Daily and fill value
    await dialog.locator('#multiCompFrequency').click();
    await page.waitForTimeout(300);
    await page.locator('.p-dropdown-panel').locator('.p-dropdown-item').filter({ hasText: 'Daily' }).click();
    await page.waitForTimeout(300);
    await dialog.locator('#multiCompFrequencyValue input').fill('1');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC4-CreateTimedPromo_filled');

    await dialog.locator('button:has-text("Save")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator(`text=${promoName}`)).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC4-CreateTimedPromo_success');
  });

  // TC5
  test('Verify Daily frequency behavior', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#multiCompFrequency').click();
    await page.waitForTimeout(300);
    await page.locator('.p-dropdown-panel').locator('.p-dropdown-item').filter({ hasText: 'Daily' }).click();
    await page.waitForTimeout(300);

    await expect(dialog.locator('#multiCompFrequencyValue')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC5-DailyFrequencyBehavior_success');

    await dialog.locator('button:has-text("Cancel")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC6
  test('Verify Weekly frequency behavior', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#multiCompFrequency').click();
    const freqPanel = page.locator('.p-dropdown-panel');
    await freqPanel.waitFor({ state: 'visible', timeout: 10000 });
    await freqPanel.locator('.p-dropdown-item').filter({ hasText: 'Weekly' }).click();
    await page.waitForTimeout(300);

    await expect(dialog.locator('#multiCompFrequencyValue')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC6-WeeklyFrequencyBehavior_success');

    await dialog.locator('button:has-text("Cancel")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC7
  test('Verify Multi Comp Frequency Value integer validation', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Timed Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#multiCompFrequency').click();
    await page.waitForTimeout(300);
    await page.locator('.p-dropdown-panel').locator('.p-dropdown-item').filter({ hasText: 'Daily' }).click();
    await page.waitForTimeout(300);

    const freqValueInput = dialog.locator('#multiCompFrequencyValue input');
    await freqValueInput.fill('abcABC');
    await page.waitForTimeout(300);

    const inputValue = await freqValueInput.inputValue();
    expect(inputValue).not.toMatch(/[a-zA-Z]/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC7-FrequencyValueIntegerValidation_success');

    await dialog.locator('button:has-text("Cancel")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC8
  test('Verify Edit Timed Promotion', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    const firstRow = container.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15000 });

    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Edit', { exact: true }).click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const nameInput = dialog.locator('#name');
    await nameInput.clear();
    await nameInput.fill(`AutoPromo-Edited-${CommonUtils.generateRandomString(4)}`);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC8-EditTimedPromo_filled');

    await dialog.locator('button:has-text("Save")').first().click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC8-EditTimedPromo_success');
  });

  // TC9
  test('Verify Activate functionality', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    const firstRow = container.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15000 });

    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Activate', { exact: true }).click();

    await page.locator('button:has-text("Yes")').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('button:has-text("Yes")').first().click();
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC9-ActivateTimedPromo_success');
  });

  // TC10
  test('Verify Approve functionality', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    const firstRow = container.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: 15000 });

    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Approve', { exact: true }).click();

    await page.locator('button:has-text("Yes")').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('button:has-text("Yes")').first().click();
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC10-ApproveTimedPromo_success');
  });

  // TC11
  test('Verify Delete functionality', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    const rows = container.locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 15000 });

    const lastRow = rows.last();
    // Capture name before deletion to verify removal (row-count check is unreliable
    // with server-side pagination — the server backfills deleted slots with new rows)
    const deletedName = (await lastRow.locator('td').first().textContent())?.trim() ?? '';

    const dotsBtn = lastRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Delete', { exact: true }).click();

    await page.locator('button:has-text("Yes")').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('button:has-text("Yes")').first().click();

    await page.waitForLoadState('networkidle');
    if (deletedName) {
      await expect(container.locator(`tbody td:text-is("${deletedName}")`)).not.toBeVisible({ timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC11-DeleteTimedPromo_success');
  });

  // TC36
  test('Verify Search functionality on Timed Promotions page', async ({ page }, testInfo) => {
    const container = page.locator('timed-promotions');
    const rows = container.locator('tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const firstCellText = (await rows.first().locator('td').first().textContent())?.trim() ?? '';
    const searchKeyword = firstCellText.split(' ')[0];

    const searchInput = container.locator('input[placeholder="Search"]');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(500);

    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    await expect(rows.first()).toContainText(searchKeyword);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC36-TimedPromoSearch_success');
  });

});


// // ─────────────────────────────────────────────────────────────────────────────
// // OPT-IN TRIGGERS  (TC12 – TC16, TC24, TC35)
// // Navigation: Timed Promotions → three dots → Opt In Triggers
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Marketing - Timed Promotions Opt-in Triggers', () => {

//   test.beforeEach(async ({ page }) => {
//     await page.goto('/main/home');
//     await page.waitForLoadState('networkidle');

//     const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
//     await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
//     await marketingNode.click();

//     const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
//     await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
//     await promotionsNode.click();

//     const timedPromotionsLink = page.locator('a[href*="timed-promotions"]').first();
//     await timedPromotionsLink.waitFor({ state: 'visible', timeout: 10000 });
//     await timedPromotionsLink.click();
//     await page.waitForURL('**/timed-promotions', { timeout: 15000 });
//     await page.reload();
//     await page.waitForLoadState('networkidle');
//     await expect(page.locator('timed-promotions')).toBeVisible({ timeout: 30000 });

//     const container = page.locator('timed-promotions');
//     const firstRow = container.locator('tbody tr').first();
//     await firstRow.waitFor({ state: 'visible', timeout: 20000 });

//     const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
//     await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await dotsBtn.click();

//     const menu = page.locator('.p-menu-overlay');
//     await expect(menu).toBeVisible({ timeout: 10000 });
//     await menu.getByText('Opt In Triggers', { exact: true }).click();
//     await expect(page).toHaveURL(/.*opt-in-triggers/, { timeout: 15000 });
//     await page.waitForLoadState('networkidle');
//   });

//   // TC12
//   test('Verify Create Opt In Trigger popup', async ({ page }, testInfo) => {
//     await clickPrimeButtonByLabel(page, 'Create Opt-In Trigger');

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     await expect(dialog.locator('#type')).toBeVisible({ timeout: 10000 });
//     await expect(dialog.locator('#minWagerAmount input')).toBeVisible({ timeout: 10000 });
//     await expect(dialog.locator('#minimumOdds input')).toBeVisible({ timeout: 10000 });
//     await expect(dialog.locator('button:has-text("Save")')).toBeVisible({ timeout: 10000 });
//     await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC12-CreateOptInTriggerPopup_open');

//     await dialog.locator('button:has-text("Cancel")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   });

//   // TC13
//   test('Verify mandatory field validation in Opt In Trigger', async ({ page }, testInfo) => {
//     await clickPrimeButtonByLabel(page, 'Create Opt-In Trigger');

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     const saveBtn = dialog.locator('button:has-text("Save")').first();
//     await expect(saveBtn).toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC13-OptInTriggerMandatoryFields_success');

//     await dialog.locator('button:has-text("Cancel")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   });

//   // TC14
//   test('Verify Opt In Trigger creation', async ({ page }, testInfo) => {
//     await clickPrimeButtonByLabel(page, 'Create Opt-In Trigger');

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     await selectFirstDropdownOption(page, dialog.locator('#type'));
//     await clickSelectTypeIfShown(dialog);
//     await page.waitForTimeout(500);

//     await fillInputNumber(dialog.locator('#minWagerAmount input'), '10');
//     await page.keyboard.press('Tab');
//     await page.waitForTimeout(200);

//     await fillInputNumber(dialog.locator('#minimumOdds input'), '2');
//     await page.keyboard.press('Tab');
//     await page.waitForTimeout(200);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC14-CreateOptInTrigger_filled');

//     await dialog.locator('button:has-text("Save")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC14-CreateOptInTrigger_success');
//   });

//   // TC15
//   test('Verify Edit Opt-in Trigger', async ({ page }, testInfo) => {
//     await setupOptInTrigger(page);

//     const rowToEdit = page.locator('tbody tr').first();
//     await rowToEdit.waitFor({ state: 'visible', timeout: 15000 });
//     await clickPrimeButtonByLabel(rowToEdit, 'Edit');

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     await fillInputNumber(dialog.locator('#minWagerAmount input'), '20');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC15-EditOptInTrigger_filled');

//     await dialog.locator('button:has-text("Save")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC15-EditOptInTrigger_success');
//   });

//   // TC16
//   test('Verify Delete Opt-in Trigger', async ({ page }, testInfo) => {
//     await setupOptInTrigger(page);

//     const rows = page.locator('tbody tr');
//     await rows.first().waitFor({ state: 'visible', timeout: 15000 });
//     await page.waitForLoadState('networkidle');

//     const lastRow = rows.last();
//     const deletedName = (await lastRow.locator('td').first().textContent())?.trim() ?? '';
//     const matchingRows = deletedName
//       ? page.locator('tbody tr').filter({ has: page.locator(`td:text-is("${deletedName}")`) })
//       : page.locator('tbody tr').filter({ hasText: '__no_deleted_name__' });
//     const matchingCountBeforeDelete = deletedName ? await matchingRows.count() : 0;

//     await clickPrimeButtonByLabel(lastRow, 'Delete');
//     await confirmIfShown(page);

//     // Some pages require an explicit Save after row deletion
//     const saveCommitBtn = page.locator('button:has-text("Save")').first();
//     if (await saveCommitBtn.isVisible()) {
//       await saveCommitBtn.click();
//       await page.waitForLoadState('networkidle');
//     }

//     if (deletedName) {
//       await expect.poll(
//         async () => matchingRows.count(),
//         { timeout: 10000 }
//       ).toBeLessThan(matchingCountBeforeDelete);
//     }

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC16-DeleteOptInTrigger_success');
//   });

//   // TC24
//   test('Verify Back button navigation from Opt-in Triggers page', async ({ page }, testInfo) => {
//     const backBtn = page.locator('button:has(.pi-chevron-left)').first();
//     await backBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await backBtn.click();

//     await expect(page).toHaveURL(/.*timed-promotions/, { timeout: 15000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC24-OptInTriggersBackNavigation_success');
//   });

//   // TC35
//   test('Verify Search functionality in Opt-in Triggers', async ({ page }, testInfo) => {
//     const rows = page.locator('tbody tr');
//     await rows.first().waitFor({ state: 'visible', timeout: 20000 });

//     const firstCellText = (await rows.first().locator('td').first().textContent())?.trim() ?? '';
//     const searchKeyword = firstCellText.split(' ')[0];

//     const searchInput = page.locator('input.pure-input.w-20r[placeholder="Search"]').first();
//     await searchInput.waitFor({ state: 'visible', timeout: 10000 });
//     await searchInput.fill(searchKeyword);
//     await page.waitForTimeout(500);

//     await expect(rows.first()).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC35-OptInTriggersSearch_success');
//   });

// });


// // ─────────────────────────────────────────────────────────────────────────────
// // HOURLY CONFIGURATION  (TC17 – TC23, TC25, TC34)
// // Navigation: Timed Promotions → three dots → Hourly Configuration
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Marketing - Timed Promotions Hourly Configuration', () => {

//   test.beforeEach(async ({ page }) => {
//     await page.goto('/main/home');
//     await page.waitForLoadState('networkidle');

//     const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
//     await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
//     await marketingNode.click();

//     const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
//     if (await promotionsNode.isVisible({ timeout: 3000 }).catch(() => false)) {
//       await promotionsNode.click();
//     }

//     const timedPromotionsLink = page.locator('span.menuitem-text:text-is("Timed Promotions")').first();
//     await timedPromotionsLink.waitFor({ state: 'visible', timeout: 10000 });
//     await timedPromotionsLink.click();
//     await page.waitForURL('**/timed-promotions', { timeout: 15000 });
//     await page.reload();
//     await page.waitForLoadState('networkidle');
//     await expect(page.locator('timed-promotions')).toBeVisible({ timeout: 30000 });

//     const container = page.locator('timed-promotions');
//     const firstRow = container.locator('tbody tr').first();
//     await firstRow.waitFor({ state: 'visible', timeout: 20000 });

//     const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
//     await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await dotsBtn.click();

//     const hourlyConfigLink = page.locator('a.p-menuitem-link[aria-label="Hourly Configuration"]').first();
//     await hourlyConfigLink.waitFor({ state: 'visible', timeout: 5000 });
//     await hourlyConfigLink.click();
//     // The page uses stencil-promotions SPA routing with an encoded promotionId param —
//     // reloading loses that state and Angular redirects to dashboard. Just wait for the component.
//     await page.locator('button[aria-label="Create Hourly Configuration"]').waitFor({ state: 'visible', timeout: 30000 });
//   });

//   // // TC17
//   // test('Verify Create Hourly Configuration popup', async ({ page }, testInfo) => {
//   //   const createBtn = page.locator('button[aria-label="Create Hourly Configuration"]').first();
//   //   await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await createBtn.click();

//   //   const dialog = page.locator('div[role="dialog"]').first();
//   //   await expect(dialog).toBeVisible({ timeout: 15000 });

//   //   await expect(dialog.locator('#startTime input')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('#endTime input')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('#activeDays')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('#chanceToWinStart input')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('#chanceToWinEnd input')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('button:has-text("Save")')).toBeVisible({ timeout: 10000 });
//   //   await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 10000 });

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC17-CreateHourlyConfigPopup_open');

//   //   await dialog.locator('button:has-text("Cancel")').first().click();
//   //   await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   // });

//   // TC18
//   // Steps 1-6 (Launch site → expand Marketing → expand Promotions → Timed Promotions →
//   // three dots → Hourly Configuration) are handled by the beforeEach hook above.
//   test('Verify Active Days multi-selection', async ({ page }, testInfo) => {
//     // Step 7: Click on 'Create Hourly Configuration' button
//     const createBtn = page.locator('button[aria-label="Create Hourly Configuration"]').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     // Fill Start Time / End Time using the clock arrows (mandatory fields for a valid Save)
//     const startTimeInput = dialog.locator('#startTime input');
//     await startTimeInput.click();
//     await selectTimeUsingClockArrows(page, startTimeInput, '#startTime_panel', 2, 3, '02:00 AM');

//     const endTimeInput = dialog.locator('#endTime input');
//     await endTimeInput.click();
//     await selectTimeUsingClockArrows(page, endTimeInput, '#endTime_panel', 2, 3, '10:00 PM');

//     // Step 8: Open Active Days dropdown
//     await dialog.locator('#activeDays').click();

//     // Step 9: Select multiple days
//     const items = page.locator('.p-multiselect-panel .p-multiselect-item');
//     await items.first().waitFor({ state: 'visible', timeout: 5000 });
//     await items.first().click();
//     await items.nth(1).click();
//     await page.waitForTimeout(300);
//     await page.locator('button.p-multiselect-close, [data-pc-section="closebutton"]').first().click();
//     await page.waitForTimeout(300);

//     const selectedTokens = dialog.locator('#activeDays .p-multiselect-token');
//     await expect(selectedTokens.first()).toBeVisible({ timeout: 5000 });
//     expect(await selectedTokens.count()).toBeGreaterThanOrEqual(2);

//     // Fill Chance To Win Start / End (mandatory fields for a valid Save)
//     await fillInputNumber(dialog.locator('#chanceToWinStart input'), '1');
//     await page.keyboard.press('Tab');
//     await fillInputNumber(dialog.locator('#chanceToWinEnd input'), '100');
//     await page.keyboard.press('Tab');
//     await page.waitForTimeout(200);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC18-ActiveDaysMultiSelection_filled');

//     const saveBtn18 = dialog.locator('button[aria-label="Save"]').first();
//     await saveBtn18.scrollIntoViewIfNeeded();
//     await expect(saveBtn18).toBeEnabled({ timeout: 15000 });
//     await saveBtn18.click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC18-ActiveDaysMultiSelection_success');
//   });

//   // // TC19
//   // test('Verify Chance To Win Start integer validation', async ({ page }, testInfo) => {
//   //   const createBtn = page.locator('button[aria-label="Create Hourly Configuration"]').first();
//   //   await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await createBtn.click();

//   //   const dialog = page.locator('div[role="dialog"]').first();
//   //   await expect(dialog).toBeVisible({ timeout: 15000 });

//   //   const chanceInput = dialog.locator('#chanceToWinStart input');
//   //   await chanceInput.fill('abcABC');
//   //   await page.waitForTimeout(300);

//   //   const inputValue = await chanceInput.inputValue();
//   //   expect(inputValue).not.toMatch(/[a-zA-Z]/);

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC19-ChanceToWinStartValidation_success');

//   //   await dialog.locator('button:has-text("Cancel")').first().click();
//   //   await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   // });

//   // TC20
//   test('Verify Hourly Configuration creation', async ({ page }, testInfo) => {
//     // Step 7: Click on 'Create Hourly Configuration' button
//     const createBtn = page.locator('button[aria-label="Create Hourly Configuration"]').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     // Step 8: Select 'Start Time' using the arrows on the clock
//     const startTimeInput = dialog.locator('#startTime input');
//     await startTimeInput.click();
//     await selectTimeUsingClockArrows(page, startTimeInput, '#startTime_panel', 2, 3, '02:00 AM');

//     // Step 9: Click on another field to close the clock (also opens the End Time clock)
//     const endTimeInput = dialog.locator('#endTime input');
//     await endTimeInput.click();

//     // Step 10: Select 'End Time' using the arrows on the clock
//     await selectTimeUsingClockArrows(page, endTimeInput, '#endTime_panel', 2, 3, '10:00 PM');

//     // Step 11: Click on another field to close the clock
//     await dialog.locator('#activeDays').click();
//     await page.waitForTimeout(300);

//     // Step 12: Select 'Active Days'
//     await page.locator('.p-multiselect-panel .p-multiselect-item').first().waitFor({ state: 'visible', timeout: 5000 });
//     await page.locator('.p-multiselect-panel .p-multiselect-item').first().click();
//     await page.locator('button.p-multiselect-close, [data-pc-section="closebutton"]').first().click();
//     await page.waitForTimeout(300);
//     await expect(dialog.locator('#activeDays .p-multiselect-token').first()).toBeVisible({ timeout: 5000 });

//     // Step 13: Enter any integer in 'Chance To Win Start' field
//     await fillInputNumber(dialog.locator('#chanceToWinStart input'), '1');
//     await page.keyboard.press('Tab');

//     // Step 14: Enter any integer in 'Chance To Win End' field
//     await fillInputNumber(dialog.locator('#chanceToWinEnd input'), '100');
//     await page.keyboard.press('Tab');
//     await page.waitForTimeout(200);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC20-CreateHourlyConfig_filled');

//     // Step 15: Click 'Save' button
//     const saveBtn20 = dialog.locator('button[aria-label="Save"]').first();
//     await saveBtn20.scrollIntoViewIfNeeded();
//     await expect(saveBtn20).toBeEnabled({ timeout: 15000 });
//     await saveBtn20.click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     const successToast20 = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//     const toastVisible20 = await successToast20.isVisible({ timeout: 5000 }).catch(() => false);
//     if (!toastVisible20) {
//       await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
//     }

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC20-CreateHourlyConfig_success');
//   });

//   // // TC21
//   // test('Verify Edit Hourly Configuration', async ({ page }, testInfo) => {
//   //   const rows = page.locator('tbody tr');
//   //   await rows.first().waitFor({ state: 'visible', timeout: 20000 });

//   //   // Step 7: Click on 'Edit' button of any existing Hourly Configuration
//   //   const editBtn = rows.first().locator('button[aria-label="Edit"]').first();
//   //   await editBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await editBtn.click();

//   //   const dialog = page.locator('div[role="dialog"]').first();
//   //   await expect(dialog).toBeVisible({ timeout: 15000 });

//   //   // Step 8: Modify Hourly Configuration details
//   //   const chanceToWinStart = dialog.locator('#chanceToWinStart input');
//   //   await fillInputNumber(chanceToWinStart, '5');
//   //   await page.keyboard.press('Tab');

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC21-EditHourlyConfig_filled');

//   //   // Step 9: Click on 'Save' button
//   //   const saveBtn21 = dialog.locator('button[aria-label="Save"]').first();
//   //   await saveBtn21.scrollIntoViewIfNeeded();
//   //   await expect(saveBtn21).toBeEnabled({ timeout: 15000 });
//   //   await saveBtn21.click();
//   //   await expect(dialog).not.toBeVisible({ timeout: 20000 });
//   //   await page.waitForLoadState('networkidle');

//   //   const successToast21 = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//   //   const toastVisible21 = await successToast21.isVisible({ timeout: 5000 }).catch(() => false);
//   //   if (!toastVisible21) {
//   //     await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
//   //   }

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC21-EditHourlyConfig_success');
//   // });

//   // // TC22
//   // test('Verify Delete Hourly Configuration', async ({ page }, testInfo) => {
//   //   const rows = page.locator('tbody tr');
//   //   await rows.first().waitFor({ state: 'visible', timeout: 20000 });

//   //   // Step 7: Click on 'Delete' button of any existing Hourly Configuration
//   //   const deleteBtn = rows.first().locator('button[aria-label="Delete"]').first();
//   //   await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await deleteBtn.click();

//   //   // Step 8: Click on 'Yes' button
//   //   await page.locator('button:has-text("Yes")').first().waitFor({ state: 'visible', timeout: 10000 });
//   //   await page.locator('button:has-text("Yes")').first().click();

//   //   const successToast22 = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//   //   await expect(successToast22).toBeVisible({ timeout: 10000 });

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC22-DeleteHourlyConfig_success');
//   // });

//   // // TC23
//   // test('Verify mandatory fields in Hourly Configuration', async ({ page }, testInfo) => {
//   //   const createBtn = page.locator('button[aria-label="Create Hourly Configuration"]').first();
//   //   await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await createBtn.click();

//   //   const dialog = page.locator('div[role="dialog"]').first();
//   //   await expect(dialog).toBeVisible({ timeout: 15000 });

//   //   const saveBtn = dialog.locator('button:has-text("Save")').first();
//   //   await expect(saveBtn).toBeDisabled({ timeout: 10000 });

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC23-HourlyConfigMandatoryFields_success');

//   //   await dialog.locator('button:has-text("Cancel")').first().click();
//   //   await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   // });

//   // // TC25
//   // test('Verify Back button navigation from Hourly Configuration page', async ({ page }, testInfo) => {
//   //   const backBtn = page.locator('button.btn--info, button:has(.pi-chevron-left), button:has(.pi-arrow-left)').first();
//   //   await backBtn.waitFor({ state: 'visible', timeout: 15000 });
//   //   await backBtn.click();

//   //   await expect(page).toHaveURL(/.*timed-promotions/, { timeout: 15000 });
//   //   await page.waitForLoadState('networkidle');

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC25-HourlyConfigBackNavigation_success');
//   // });

//   // // TC34
//   // test('Verify Search functionality in Hourly Configuration', async ({ page }, testInfo) => {
//   //   const rows = page.locator('tbody tr');
//   //   await rows.first().waitFor({ state: 'visible', timeout: 20000 });

//   //   const firstCellText = (await rows.first().locator('td').first().textContent())?.trim() ?? '';
//   //   const searchKeyword = firstCellText.split(' ')[0];

//   //   await page.locator('input.pure-input.w-20r[placeholder="Search"]').fill(searchKeyword);
//   //   await page.waitForTimeout(500);

//   //   await expect(rows.first()).toBeVisible({ timeout: 10000 });

//   //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC34-HourlyConfigSearch_success');
//   // });

// });


// // // ─────────────────────────────────────────────────────────────────────────────
// // // PRIZE CONFIGURATION  (TC26 – TC33)
// // // Navigation: Timed Promotions → three dots → Hourly Configuration → Prize Config
// // // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Marketing - Timed Promotions Prize Configuration', () => {

//   test.beforeEach(async ({ page }) => {
//     await page.goto('/main/home');
//     await page.waitForLoadState('networkidle');

//     const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
//     await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
//     await marketingNode.click();

//     const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
//     await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
//     await promotionsNode.click();

//     const timedPromotionsLink = page.locator('a[href*="timed-promotions"]').first();
//     await timedPromotionsLink.waitFor({ state: 'visible', timeout: 10000 });
//     await timedPromotionsLink.click();
//     await page.waitForURL('**/timed-promotions', { timeout: 15000 });
//     await page.reload();
//     await page.waitForLoadState('networkidle');
//     await expect(page.locator('timed-promotions')).toBeVisible({ timeout: 30000 });

//     const container = page.locator('timed-promotions');
//     const firstRow = container.locator('tbody tr').first();
//     await firstRow.waitFor({ state: 'visible', timeout: 20000 });

//     const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
//     await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await dotsBtn.click();

//     const menu = page.locator('.p-menu-overlay');
//     await expect(menu).toBeVisible({ timeout: 10000 });
//     await menu.getByText('Hourly Configuration', { exact: true }).click();
//     await expect(page).toHaveURL(/.*hourly-configuration/, { timeout: 15000 });
//     await page.waitForLoadState('networkidle');

//     // Click Prize Config for the first hourly configuration row
//     const prizeConfigBtn = page.locator('button:has-text("Prize Config")').first();
//     await prizeConfigBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await prizeConfigBtn.click();
//     await page.waitForLoadState('networkidle');
//   });

//   // TC26
//   test('Verify Back button navigation from Prize Configuration page', async ({ page }, testInfo) => {
//     const backBtn = page.locator('button:has(.pi-chevron-left)').first();
//     await backBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await backBtn.click();

//     await expect(page).toHaveURL(/.*hourly-configuration/, { timeout: 15000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC26-PrizeConfigBackNavigation_success');
//   });

//   // TC27
//   test('Verify Create Prize Configuration popup', async ({ page }, testInfo) => {
//     const createBtn = page.locator('button:has-text("Create Prize Configuration")').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     await expect(dialog.locator('.p-dropdown').nth(0)).toBeVisible({ timeout: 10000 }); // Comp Code
//     await expect(dialog.locator('input[type="number"]').first()).toBeVisible({ timeout: 10000 }); // Number Of Prizes
//     await expect(dialog.locator('.p-dropdown').nth(1)).toBeVisible({ timeout: 10000 }); // Bucket
//     await expect(dialog.locator('button:has-text("Save")')).toBeVisible({ timeout: 10000 });
//     await expect(dialog.locator('button:has-text("Cancel")')).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC27-CreatePrizeConfigPopup_open');

//     await dialog.locator('button:has-text("Cancel")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   });

//   // TC28
//   test('Verify mandatory fields in Prize Configuration', async ({ page }, testInfo) => {
//     const createBtn = page.locator('button:has-text("Create Prize Configuration")').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     const saveBtn = dialog.locator('button:has-text("Save")').first();
//     await expect(saveBtn).toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC28-PrizeConfigMandatoryFields_success');

//     await dialog.locator('button:has-text("Cancel")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   });

//   // TC29
//   test('Verify Prize Configuration creation', async ({ page }, testInfo) => {
//     const createBtn = page.locator('button:has-text("Create Prize Configuration")').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     // Comp Code
//     await dialog.locator('.p-dropdown').nth(0).click();
//     await page.waitForTimeout(500);
//     await page.locator('.p-dropdown-panel .p-dropdown-item').first().click();
//     await page.waitForTimeout(300);

//     // Number Of Prizes
//     await dialog.locator('input[type="number"]').first().fill('5');

//     // Bucket
//     await dialog.locator('.p-dropdown').nth(1).click();
//     await page.waitForTimeout(500);
//     await page.locator('.p-dropdown-panel .p-dropdown-item').first().click();
//     await page.waitForTimeout(300);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC29-CreatePrizeConfig_filled');

//     await dialog.locator('button:has-text("Save")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC29-CreatePrizeConfig_success');
//   });

//   // TC30
//   test('Verify Number Of Prizes integer validation', async ({ page }, testInfo) => {
//     const createBtn = page.locator('button:has-text("Create Prize Configuration")').first();
//     await createBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await createBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     const prizesInput = dialog.locator('input[type="number"]').first();
//     await prizesInput.fill('abcABC');
//     await page.waitForTimeout(300);

//     const inputValue = await prizesInput.inputValue();
//     expect(inputValue).not.toMatch(/[a-zA-Z]/);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC30-NumberOfPrizesValidation_success');

//     await dialog.locator('button:has-text("Cancel")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 10000 });
//   });

//   // TC31
//   test('Verify Edit Prize Configuration', async ({ page }, testInfo) => {
//     await setupPrizeConfig(page);

//     const editBtn = page.locator('button:has-text("Edit")').first();
//     await editBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await editBtn.click();

//     const dialog = page.locator('div[role="dialog"]').first();
//     await expect(dialog).toBeVisible({ timeout: 15000 });

//     const prizesInput = dialog.locator('input[type="number"]').first();
//     await prizesInput.clear();
//     await prizesInput.fill('10');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC31-EditPrizeConfig_filled');

//     await dialog.locator('button:has-text("Save")').first().click();
//     await expect(dialog).not.toBeVisible({ timeout: 20000 });
//     await page.waitForLoadState('networkidle');

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC31-EditPrizeConfig_success');
//   });

//   // TC32
//   test('Verify Delete Prize Configuration', async ({ page }, testInfo) => {
//     await setupPrizeConfig(page);

//     const rows = page.locator('tbody tr');
//     await rows.first().waitFor({ state: 'visible', timeout: 15000 });
//     const initialCount = await rows.count();

//     const lastRow = rows.last();
//     const deleteBtn = lastRow.locator('button:has-text("Delete")');
//     await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
//     await deleteBtn.click();

//     await page.locator('button:has-text("Yes")').first().waitFor({ state: 'visible', timeout: 10000 });
//     await page.locator('button:has-text("Yes")').first().click();

//     await page.waitForLoadState('networkidle');
//     await expect(rows).toHaveCount(initialCount - 1, { timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC32-DeletePrizeConfig_success');
//   });

//   // TC33
//   test('Verify Search functionality in Prize Configuration', async ({ page }, testInfo) => {
//     const rows = page.locator('tbody tr');
//     await rows.first().waitFor({ state: 'visible', timeout: 20000 });

//     const firstCellText = (await rows.first().locator('td').first().textContent())?.trim() ?? '';
//     const searchKeyword = firstCellText.split(' ')[0];

//     await page.locator('input[placeholder="Search"]').fill(searchKeyword);
//     await page.waitForTimeout(500);

//     await expect(rows.first()).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC33-PrizeConfigSearch_success');
//   });

// });
