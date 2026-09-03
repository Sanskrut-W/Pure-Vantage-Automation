// npx playwright test tests/SimulateOpt-in.spec.ts --headed
import { test, expect, Locator, Page } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — same proven patterns as tests/simulatebet.spec.ts (sibling "Simulate X" feature
// in the same Workflow Management area), adapted to Simulate Opt-in's 3-field form.
// ─────────────────────────────────────────────────────────────────────────────

// The global loading overlay (pure-page-loader / .pure__loader-container) intercepts pointer
// events for whatever is underneath it while a page transition is still settling.
async function waitForLoaderHidden(page: Page): Promise<void> {
  await page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
}

async function clickTolerant(page: Page, locator: Locator, timeoutMs = 30000): Promise<boolean> {
  await waitForLoaderHidden(page);
  return locator.click({ timeout: timeoutMs }).then(() => true).catch(() => false);
}

// Locates a field's `.pure__input-group` container by its adjacent <label> text — none of these
// fields have an id/name, so the label text is the only stable handle.
function fieldGroupByLabel(scope: Locator, labelText: string): Locator {
  return scope.locator('.pure__input-group').filter({ hasText: labelText }).first();
}

function textInputByLabel(scope: Locator, labelText: string): Locator {
  return fieldGroupByLabel(scope, labelText).locator('input.p-inputtext').first();
}

// Locates a dropdown by the static aria-label on its trigger — unlike the dropdown's visible
// label text (which changes to show the selected value once one is picked), this aria-label
// stays constant regardless of selection state.
function dropdownByAriaLabel(scope: Locator, ariaLabelText: string): Locator {
  return scope.locator('.dropdown-input').filter({ has: scope.page().locator(`[aria-label="${ariaLabelText}"]`) }).first();
}

// Opens a PrimeNG dropdown and clicks its first option, returning the selected option's text.
async function selectFirstDropdownOption(page: Page, dropdown: Locator): Promise<string> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});

  const optionSelector = '[data-pc-section="option"]:not(option):visible, .p-dropdown-item:visible, li[role="option"]:visible';

  const openOnce = async () => {
    await waitForLoaderHidden(page);
    const candidates = [
      dropdown.locator('[data-pc-section="trigger"]').first(),
      dropdown.locator('.p-dropdown-trigger').first(),
      dropdown.locator('.p-dropdown-label, [data-pc-section="input"]').first(),
      dropdown,
    ];
    for (const candidate of candidates) {
      if (!(await candidate.isVisible({ timeout: 300 }).catch(() => false))) continue;
      await candidate.click({ timeout: 3000 }).catch(() => candidate.click({ force: true, timeout: 3000 }).catch(() => {}));
      return;
    }
    await dropdown.click({ force: true, timeout: 3000 }).catch(() => {});
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    await openOnce();
    const firstOption = page.locator(optionSelector).first();
    if (await firstOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = (await firstOption.textContent())?.trim() ?? '';
      await firstOption.click();
      return text;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  throw new Error('selectFirstDropdownOption: dropdown panel never opened or had no options.');
}

// Launches the site and navigates Workflow Management → Simulate Opt In. Same retry-hardened
// approach as simulatebet.spec.ts's navigation helpers — the page can take a moment longer to
// render its fields than `networkidle` alone accounts for.
async function navigateToSimulateOptIn(page: Page): Promise<void> {
  const pageMarker = page.locator('text=Player Account ID *');

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const workflowNode = page.locator('span.menuitem-text:text-is("Workflow Management")').first();
    const workflowReady = await workflowNode.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!workflowReady) continue;
    if (!(await clickTolerant(page, workflowNode))) continue;

    const simulateOptInLink = page.locator('span.menuitem-text:text-is("Simulate Opt In")').first();
    const linkReady = await simulateOptInLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!linkReady) continue;
    if (!(await clickTolerant(page, simulateOptInLink))) continue;
    await page.waitForLoadState('networkidle');

    const markerReady = await pageMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (markerReady) return;
  }

  // Final assertion (as a real Playwright expect, not a thrown Error) so a genuine failure
  // still reports in the familiar "expect(locator).toBeVisible()" format if all 3 attempts failed.
  await expect(pageMarker).toBeVisible({ timeout: 20000 });
}

// Fills all 3 mandatory fields with valid data.
async function fillMandatoryFields(page: Page): Promise<void> {
  const playerAccountId = textInputByLabel(page.locator('body'), 'Player Account ID *');
  await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');

  await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

  const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
  await optInValue.fill('true');
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE OPT-IN
// Confirmed live: 3 mandatory fields (Player Account ID — strictly a GUID, Region — dropdown,
// Opt In Value — free text), a Simulate button (aria-label="Simulate", starts disabled and stays
// disabled until every mandatory field is valid) and a Reset Form button
// (aria-label="Reset Form" — note this is a DIFFERENT aria-label from Simulate Bet's "Reset").
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Simulate Opt-in', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateOptIn(page);
  });

  test('TC-1 Verify Simulate Opt-in screen opens with all fields and buttons', async ({ page }, testInfo) => {
    await expect(page.locator('text=Player Account ID *')).toBeVisible({ timeout: 15000 });
    await expect(dropdownByAriaLabel(page.locator('body'), 'Region *')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Opt In Value *')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[aria-label="Reset Form"]')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01-ScreenOpens_success');
  });

  test('TC-2 Verify Simulate stays disabled with all mandatory fields blank', async ({ page }, testInfo) => {
    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to remain disabled with all fields blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_02-AllFieldsBlank_success');
  });

  test('TC-3 Verify Simulate stays disabled with only Player Account ID filled', async ({ page }, testInfo) => {
    const playerAccountId = textInputByLabel(page.locator('body'), 'Player Account ID *');
    await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Region and Opt In Value blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_03-OnlyPlayerAccountIdFilled_success');
  });

  test('TC-4 Verify Simulate stays disabled with only Region selected', async ({ page }, testInfo) => {
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Player Account ID and Opt In Value blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_04-OnlyRegionSelected_success');
  });

  test('TC-5 Verify Simulate stays disabled with only Opt In Value filled', async ({ page }, testInfo) => {
    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await optInValue.fill('true');

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Player Account ID and Region blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05-OnlyOptInValueFilled_success');
  });

  // Tolerant of either validation mechanism the app might use for an invalid GUID (a red inline
  // message below the field, or simply keeping Simulate disabled) — no exact error copy was
  // confirmed for this field, unlike Opt In Value's "Field is required" (see TC-7).
  test('TC-6 Verify Player Account ID requires a valid GUID', async ({ page }, testInfo) => {
    const playerAccountId = textInputByLabel(page.locator('body'), 'Player Account ID *');
    await playerAccountId.fill('not-a-valid-guid');
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));
    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await optInValue.fill('true');
    await page.waitForTimeout(300);

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    const simulateDisabledForInvalidGuid = await simulateBtn.isDisabled().catch(() => false);
    const inlineError = fieldGroupByLabel(page.locator('body'), 'Player Account ID *').locator('small.p-error');
    const inlineErrorVisible = await inlineError.isVisible({ timeout: 3000 }).catch(() => false);
    if (inlineErrorVisible) {
      console.log('Player Account ID invalid-GUID validation message:', await inlineError.textContent());
    }
    expect(
      simulateDisabledForInvalidGuid || inlineErrorVisible,
      'Expected either Simulate to stay disabled or a red validation message below Player Account ID for an invalid GUID'
    ).toBe(true);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06-PlayerAccountIdInvalidGuid_filled');

    await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');
    await page.waitForTimeout(300);
    await expect(simulateBtn, 'Expected Simulate to enable once Player Account ID becomes a valid GUID').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06-PlayerAccountIdValidGuid_success');
  });

  // Confirmed live: this exact "Field is required" message appears for a blank Opt In Value.
  test('TC-7 Verify Opt In Value shows a required-field validation message when blank', async ({ page }, testInfo) => {
    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await optInValue.click();
    await optInValue.blur();
    await page.waitForTimeout(300);

    const inlineError = fieldGroupByLabel(page.locator('body'), 'Opt In Value *').locator('small.p-error');
    await expect(inlineError, 'Expected a "Field is required" message for blank Opt In Value').toHaveText('Field is required', { timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_07-OptInValueRequired_success');
  });

  test('TC-8 Verify Simulate becomes enabled once all mandatory fields are valid', async ({ page }, testInfo) => {
    await fillMandatoryFields(page);

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to enable once all mandatory fields are valid').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08-AllFieldsValidEnablesSimulate_success');
  });

  test('TC-9 Verify a successful simulation shows a confirmation toast', async ({ page }, testInfo) => {
    await fillMandatoryFields(page);

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09-Simulate_filled');

    await simulateBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the simulation ran').toBeVisible({ timeout: 15000 });
    console.log('Simulate Opt-in success toast message:', await successToast.textContent());

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09-Simulate_success');
  });

  test('TC-10 Verify Reset Form clears every field and disables Simulate again', async ({ page }, testInfo) => {
    await fillMandatoryFields(page);
    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

    const resetBtn = page.locator('button[aria-label="Reset Form"]').first();
    await resetBtn.click();
    await page.waitForTimeout(300);

    const playerAccountId = textInputByLabel(page.locator('body'), 'Player Account ID *');
    await expect(playerAccountId, 'Expected Player Account ID to clear').toHaveValue('', { timeout: 5000 });

    const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
    await expect(regionDropdown.locator('.p-dropdown-label'), 'Expected Region to clear back to its placeholder').toHaveText('Region *', { timeout: 5000 });

    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await expect(optInValue, 'Expected Opt In Value to clear').toHaveValue('', { timeout: 5000 });

    await expect(simulateBtn, 'Expected Simulate to be disabled again after Reset').toBeDisabled({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_10-ResetClearsAllFields_success');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE OPT-IN — BULK
// Toggle button confirmed: [role="button"][aria-label="Bulk"]. Fields confirmed: Number of
// Simulations (p-inputnumber, min="1" max="1000", defaults to "1"), Region (dropdown), Opt In
// Value (free text) — all 3 mandatory. Number of Simulations only accepts integers and clamps
// to 1000 once focus moves to another field (e.g. clicking Region) if a value above 1000 was
// entered. Simulate/Reset Form share the exact same aria-labels as Single mode's.
// ─────────────────────────────────────────────────────────────────────────────

// Switches the Simulate Opt-in page from Single to Bulk mode via the toggle button.
async function switchToBulkTab(page: Page): Promise<void> {
  const bulkTab = page.locator('[role="button"][aria-label="Bulk"]').first();
  await bulkTab.waitFor({ state: 'visible', timeout: 15000 });
  await bulkTab.click();
  await page.waitForLoadState('networkidle');

  const numberOfSimulationsMarker = page.locator('text=Number of Simulations');
  await numberOfSimulationsMarker.waitFor({ state: 'visible', timeout: 15000 });
}

function numberOfSimulationsInput(page: Page): Locator {
  return fieldGroupByLabel(page.locator('body'), 'Number of Simulations').locator('input.p-inputnumber-input').first();
}

// Clears and types a value into the Number of Simulations PrimeNG InputNumber field, verifying
// it actually landed — mirrors the fix already proven in simulatebet.spec.ts's fillNumberField.
async function fillNumberField(input: Locator, value: string): Promise<void> {
  await input.waitFor({ state: 'visible', timeout: 5000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await input.click({ clickCount: 3 });
    await input.press('Control+A');
    await input.press('Delete');
    await input.pressSequentially(value);

    const digitsOnly = (await input.inputValue()).replace(/[^\d.-]/g, '');
    if (digitsOnly === value) return;
  }

  await input.evaluate((el: HTMLInputElement, val: string) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

// Clicking the Region dropdown's trigger is the confirmed way to move focus off Number of
// Simulations and trigger its min/max clamping — opens the dropdown panel as a side effect,
// which this closes again via Escape so it doesn't interfere with whatever the test checks next.
async function moveFocusToRegionField(page: Page): Promise<void> {
  const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
  await regionDropdown.locator('[data-pc-section="trigger"]').first().click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
}

// Fills all 3 mandatory Bulk fields with valid data (Number of Simulations already defaults to
// a valid "1" and is left as-is unless a test deliberately changes it).
async function fillMandatoryBulkFields(page: Page): Promise<void> {
  await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

  const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
  await optInValue.fill('true');
}

test.describe('Simulate Opt-in - Bulk', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateOptIn(page);
    await switchToBulkTab(page);
  });

  test('TC-11 Verify Bulk simulation screen opens with all fields and buttons', async ({ page }, testInfo) => {
    await expect(page.locator('text=Number of Simulations')).toBeVisible({ timeout: 10000 });
    await expect(dropdownByAriaLabel(page.locator('body'), 'Region *')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Opt In Value *')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[aria-label="Reset Form"]')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11-BulkScreenOpens_success');
  });

  test('TC-12 Verify Number of Simulations defaults to 1', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    await expect(numberInput, 'Expected Number of Simulations to default to 1').toHaveValue('1', { timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_12-NumberOfSimulationsDefault_success');
  });

  test('TC-13 Verify Simulate stays disabled with Region and Opt In Value blank', async ({ page }, testInfo) => {
    // Number of Simulations already defaults to a valid "1" — Region and Opt In Value are the
    // only fields actually blank here, so this isolates that they're independently mandatory.
    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Region and Opt In Value blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13-BulkMandatoryFieldsBlank_success');
  });

  test('TC-14 Verify Simulate stays disabled with only Region selected', async ({ page }, testInfo) => {
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Opt In Value blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14-OnlyRegionSelected_success');
  });

  test('TC-15 Verify Simulate stays disabled with only Opt In Value filled', async ({ page }, testInfo) => {
    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await optInValue.fill('true');

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to stay disabled with Region blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15-OnlyOptInValueFilled_success');
  });

  test('TC-16 Verify Number of Simulations only accepts integers', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);

    await numberInput.click({ clickCount: 3 });
    await numberInput.pressSequentially('abc50xyz');
    const value = await numberInput.inputValue();
    expect(value, 'Expected letters to be rejected, leaving only digits').not.toMatch(/[a-zA-Z]/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_16-NumberOfSimulationsIntegerOnly_success');
  });

  test('TC-17 Verify Number of Simulations clamps to 1000 when an over-max value is entered', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    await fillNumberField(numberInput, '5000');

    // Confirmed live (per spec): the value only clamps once focus moves to the next field, e.g.
    // by clicking Region — not merely from typing the over-max value in isolation.
    await moveFocusToRegionField(page);

    const digitsOnly = (await numberInput.inputValue()).replace(/[^\d]/g, '');
    expect(digitsOnly, 'Expected Number of Simulations to clamp down to 1000 after moving focus').toBe('1000');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_17-NumberOfSimulationsClampsToMax_success');
  });

  test('TC-18 Verify Number of Simulations accepts its maximum value of 1000 exactly', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    await fillNumberField(numberInput, '1000');
    await moveFocusToRegionField(page);

    const digitsOnly = (await numberInput.inputValue()).replace(/[^\d]/g, '');
    expect(digitsOnly, 'Expected Number of Simulations to accept exactly 1000').toBe('1000');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18-NumberOfSimulationsAcceptsMax_success');
  });

  // Mirrors TC-17's confirmed max-side clamp behavior, inferred symmetrically for the min side —
  // this specific direction wasn't explicitly confirmed by the user, only the max-side clamp was.
  // "0" is used instead of a negative number since a leading "-" on a numeric-only field is a
  // separate, already-confirmed-elsewhere keystroke-filtering concern (see GenericPredictor's
  // Finish Position/Participant Score tests) that would otherwise confound this specific check.
  test('TC-19 Verify Number of Simulations clamps up to 1 when a below-minimum value is entered', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    await fillNumberField(numberInput, '0');
    await moveFocusToRegionField(page);

    const digitsOnly = (await numberInput.inputValue()).replace(/[^\d]/g, '');
    console.log(`Number of Simulations value after entering "0" and moving focus: "${digitsOnly}"`);
    expect(digitsOnly, 'Expected Number of Simulations to clamp up to 1 (the minimum)').toBe('1');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19-NumberOfSimulationsClampsToMin_success');
  });

  test('TC-20 Verify Simulate becomes enabled once all Bulk mandatory fields are valid', async ({ page }, testInfo) => {
    await fillMandatoryBulkFields(page);

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to enable once all Bulk mandatory fields are valid').toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_20-BulkAllFieldsValidEnablesSimulate_success');
  });

  test('TC-21 Verify a successful Bulk simulation shows a confirmation toast', async ({ page }, testInfo) => {
    await fillMandatoryBulkFields(page);

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-BulkSimulate_filled');

    await simulateBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the Bulk simulation ran').toBeVisible({ timeout: 15000 });
    console.log('Bulk Simulate Opt-in success toast message:', await successToast.textContent());

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-BulkSimulate_success');
  });

  test('TC-22 Verify Reset Form clears every Bulk field and disables Simulate again', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    await fillNumberField(numberInput, '250');
    await fillMandatoryBulkFields(page);
    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

    const resetBtn = page.locator('button[aria-label="Reset Form"]').first();
    await resetBtn.click();
    await page.waitForTimeout(300);

    await expect(numberInput, 'Expected Number of Simulations to reset back to its default of 1').toHaveValue('1', { timeout: 5000 });

    const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
    await expect(regionDropdown.locator('.p-dropdown-label'), 'Expected Region to clear back to its placeholder').toHaveText('Region *', { timeout: 5000 });

    const optInValue = textInputByLabel(page.locator('body'), 'Opt In Value *');
    await expect(optInValue, 'Expected Opt In Value to clear').toHaveValue('', { timeout: 5000 });

    await expect(simulateBtn, 'Expected Simulate to be disabled again after Reset').toBeDisabled({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_22-BulkResetClearsAllFields_success');
  });

});
