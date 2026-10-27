// npx playwright test tests/SimulateRegisteration.spec.ts --headed
import { test, expect, Locator, Page } from '@playwright/test';
import { randomUUID } from 'crypto';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATE REGISTRATION — generated from recordings/simulate-registration-20261026092441.mp4
// (steps: recordings/work/simulate-registration-20261026092441/steps.md)
//
// Same self-contained style as tests/SimulateOpt-in.spec.ts (sibling "Simulate X" page in
// Workflow Management). Confirmed live (probe): 7 label-only text inputs (no id/name) inside
// `.pure__input-group`, a Region dropdown (aria-label="Region *"), Simulate
// (aria-label="Simulate", starts disabled) and Reset Form (aria-label="Reset Form").
//
// Flagged assumptions:
//  - The tester's email "hgbfv@g,ail.com" (comma) was accepted as valid — the test uses a
//    well-formed email instead. Possible validation gap worth a separate check.
//  - The external GUID generator used in the recording is replaced by crypto.randomUUID().
//  - Inline error selector `small.p-error` is reused from SimulateOpt-in (confirmed live there).
// ═══════════════════════════════════════════════════════════════════════════════

// Values seen in the recording that matter for the flow.
const REGION = 'Betway Botswana';
const MOBILE = '987654333';
const REFERRAL_CODE = '12345fdsa';
const SIGN_UP_CODE = 'dsfdgfgr321';
const SUCCESS_TOAST_TEXT = 'Registration simulated successfully';

const FIELD_LABELS = [
  'Player Account ID *',
  'First Name *',
  'Last Name *',
  'Mobile *',
  'Email *',
  'Referral Code *',
  'Sign Up Code *',
];

// The global loading overlay intercepts pointer events while a page transition is settling.
async function waitForLoaderHidden(page: Page): Promise<void> {
  await page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
}

async function clickTolerant(page: Page, locator: Locator, timeoutMs = 30000): Promise<boolean> {
  await waitForLoaderHidden(page);
  return locator.click({ timeout: timeoutMs }).then(() => true).catch(() => false);
}

// Confirmed live: none of the inputs have an id/name, so the float-label text is the only stable handle.
function fieldGroupByLabel(page: Page, labelText: string): Locator {
  return page.locator('.pure__input-group').filter({ hasText: labelText }).first();
}

function textInputByLabel(page: Page, labelText: string): Locator {
  return fieldGroupByLabel(page, labelText).locator('input.p-inputtext').first();
}

// Confirmed live: aria-label="Region *" on the dropdown stays constant whatever is selected.
function regionDropdown(page: Page): Locator {
  return page.locator('.dropdown-input').filter({ has: page.locator('[aria-label="Region *"]') }).first();
}

// Opens a PrimeNG dropdown, filters on the first word, then clicks the exact option.
async function selectDropdownOptionByText(page: Page, dropdown: Locator, optionText: string): Promise<void> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});

  const option = page.locator('li[role="option"]:visible, .p-dropdown-item:visible').filter({ hasText: new RegExp(`^\\s*${optionText}\\s*$`) }).first();

  for (let attempt = 0; attempt < 3; attempt++) {
    await waitForLoaderHidden(page);
    await dropdown.locator('[data-pc-section="trigger"], .p-dropdown-trigger').first().click({ timeout: 5000 })
      .catch(() => dropdown.click({ force: true, timeout: 3000 }).catch(() => {}));

    const filterInput = page.locator('.p-dropdown-panel input.p-dropdown-filter').first();
    if (await filterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filterInput.fill(optionText.split(' ')[0]);
    }

    if (await option.isVisible({ timeout: 5000 }).catch(() => false)) {
      await option.click();
      return;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  throw new Error(`selectDropdownOptionByText: option "${optionText}" never appeared in the dropdown.`);
}

// Launches the site and navigates Workflow Management → Simulate Registration.
async function navigateToSimulateRegistration(page: Page): Promise<void> {
  const pageMarker = page.locator('text=Player Account ID *');

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const workflowNode = page.locator('span.menuitem-text:text-is("Workflow Management")').first();
    const workflowReady = await workflowNode.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!workflowReady) continue;
    if (!(await clickTolerant(page, workflowNode))) continue;

    const simulateRegistrationLink = page.locator('span.menuitem-text:text-is("Simulate Registration")').first();
    const linkReady = await simulateRegistrationLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!linkReady) continue;
    if (!(await clickTolerant(page, simulateRegistrationLink))) continue;
    await page.waitForLoadState('networkidle');

    const markerReady = await pageMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (markerReady) return;
  }

  await expect(pageMarker).toBeVisible({ timeout: 20000 });
}

test.describe('Workflow Management - Simulate Registration - Single Tests', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateRegistration(page);
  });

  // test('TC-1 Verify a Single registration simulation succeeds with all mandatory fields filled', async ({ page }, testInfo) => {
  //   const stamp = Date.now();
  //   const playerAccountId = randomUUID();
  //   const firstName = `AutoFirst${stamp}`;
  //   const lastName = `AutoLast${stamp}`;
  //   const email = `auto.registration.${stamp}@example.com`;

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   const resetBtn = page.locator('button[aria-label="Reset Form"]').first();

  //   // Step 1 — screen opens with every field and both buttons
  //   for (const label of FIELD_LABELS) {
  //     await expect(textInputByLabel(page, label), `Expected the "${label}" field to be visible`).toBeVisible({ timeout: 10000 });
  //   }
  //   await expect(regionDropdown(page), 'Expected the Region dropdown to be visible').toBeVisible({ timeout: 10000 });
  //   await expect(resetBtn, 'Expected Reset Form to be visible').toBeVisible({ timeout: 10000 });
  //   await expect(simulateBtn, 'Expected Simulate to be disabled before any field is filled').toBeDisabled({ timeout: 10000 });

  //   // Step 2 — Player Account ID requires a valid UUID
  //   // Confirmed live: clicking into the empty field alone never shows the error (the page
  //   // snapshot at the moment of failure had no "small.p-error" anywhere on the page) — this
  //   // form validates on BLUR, not on focus, so the field must actually lose focus first.
  //   const playerAccountIdInput = textInputByLabel(page, 'Player Account ID *');
  //   await playerAccountIdInput.click();
  //   await playerAccountIdInput.press('Tab');
  //   const playerAccountIdError = fieldGroupByLabel(page, 'Player Account ID *').locator('small.p-error');
  //   await expect(playerAccountIdError, 'Expected "Field must be a valid UUID" for an empty Player Account ID').toHaveText('Field must be a valid UUID', { timeout: 5000 });
  //   await playerAccountIdInput.fill(playerAccountId);
  //   await playerAccountIdInput.press('Tab');
  //   await expect(playerAccountIdError, 'Expected the UUID error to clear once a valid UUID is entered').toBeHidden({ timeout: 5000 });

  //   // Step 3 — name and mobile fields
  //   await textInputByLabel(page, 'First Name *').fill(firstName);
  //   await textInputByLabel(page, 'Last Name *').fill(lastName);
  //   await textInputByLabel(page, 'Mobile *').fill(MOBILE);

  //   // Step 4 — Email requires a valid email
  //   // Same validate-on-blur behavior confirmed for Player Account ID above — applied here too
  //   // since this field uses the identical fill-then-check pattern with no blur in between.
  //   const emailInput = textInputByLabel(page, 'Email *');
  //   const emailError = fieldGroupByLabel(page, 'Email *').locator('small.p-error');
  //   await emailInput.fill('auto.registration@');
  //   await emailInput.press('Tab');
  //   await expect(emailError, 'Expected "Field must be a valid email" for a partial email').toHaveText('Field must be a valid email', { timeout: 5000 });
  //   await emailInput.fill(email);
  //   await emailInput.press('Tab');
  //   await expect(emailError, 'Expected the email error to clear once a valid email is entered').toBeHidden({ timeout: 5000 });

  //   // Step 5 — Region, Referral Code, Sign Up Code
  //   await selectDropdownOptionByText(page, regionDropdown(page), REGION);
  //   await expect(regionDropdown(page).locator('.p-dropdown-label'), `Expected Region to show "${REGION}"`).toHaveText(REGION, { timeout: 5000 });
  //   await textInputByLabel(page, 'Referral Code *').fill(REFERRAL_CODE);
  //   await textInputByLabel(page, 'Sign Up Code *').fill(SIGN_UP_CODE);

  //   await expect(simulateBtn, 'Expected Simulate to enable once all mandatory fields are valid').toBeEnabled({ timeout: 10000 });
  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_simulate_registration_filled');

  //   // Step 6 — Simulate and check the success toast
  //   await simulateBtn.click();
  //   const successToast = page.locator('.p-toast-message').filter({ hasText: SUCCESS_TOAST_TEXT });
  //   await expect(successToast, `Expected a "${SUCCESS_TOAST_TEXT}" success toast`).toBeVisible({ timeout: 20000 });
  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_simulate_registration_success');

  //   // Step 7 — form clears after a successful simulation
  //   for (const label of FIELD_LABELS) {
  //     await expect(textInputByLabel(page, label), `Expected "${label}" to be cleared after a successful simulation`).toHaveValue('', { timeout: 10000 });
  //   }
  //   await expect(regionDropdown(page).locator('.p-dropdown-label'), 'Expected Region to reset to its placeholder').toHaveText('Region *', { timeout: 5000 });
  //   await expect(simulateBtn, 'Expected Simulate to be disabled again after the form clears').toBeDisabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_simulate_registration_form_cleared');
  //   console.log(`Simulated registration for player ${playerAccountId} in ${REGION}; success toast shown and form cleared.`);
  // });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE REGISTRATION — BULK
// Generated from recordings/simulate-registration-2-20261026094734.mp4
// (steps: recordings/work/simulate-registration-2-20261026094734/steps.md)
//
// Confirmed live (probe): toggle [role="button"][aria-label="Bulk"]; Number of Simulations is a
// p-inputnumber (min="1" max="10000", defaults to "10,000") whose label uses an en dash
// "Number of Simulations (1–10000) *"; Region (aria-label="Region *"), Referral Code * and
// Sign Up Code * are label-only inputs like Single mode. Simulate starts disabled.
//
// Flagged assumptions:
//  - Referral/Sign Up codes typed in the recording ("sdfgn", "nhfd") were throwaway text —
//    fixed constants of the same shape are used instead.
//  - Toast text read from a small, partly blurred frame: "Bulk registrations simulated successfully".
//  - Each run really submits BULK_COUNT simulated registrations to the shared environment,
//    exactly as the recording did.
// ─────────────────────────────────────────────────────────────────────────────

const BULK_COUNT = '100';
const BULK_DEFAULT_COUNT = '10,000';
const BULK_REGION = 'Betway Agents';
const BULK_REFERRAL_CODE = 'sdfgn';
const BULK_SIGN_UP_CODE = 'nhfd';
const BULK_SUCCESS_TOAST_TEXT = 'Bulk registrations simulated successfully';

// Confirmed live: the label is "Number of Simulations (1–10000) *", so match on the stable prefix only.
function numberOfSimulationsInput(page: Page): Locator {
  return fieldGroupByLabel(page, 'Number of Simulations').locator('input.p-inputnumber-input').first();
}

// Switches the Simulate Registration page from Single to Bulk mode via the toggle button.
async function switchToBulkTab(page: Page): Promise<void> {
  const bulkTab = page.locator('[role="button"][aria-label="Bulk"]').first();
  await bulkTab.waitFor({ state: 'visible', timeout: 15000 });
  await clickTolerant(page, bulkTab);
  await numberOfSimulationsInput(page).waitFor({ state: 'visible', timeout: 15000 });
}

// Clears and types into the PrimeNG InputNumber, verifying the digits actually landed — same
// approach as fillNumberField in tests/SimulateOpt-in.spec.ts.
async function fillNumberField(input: Locator, value: string): Promise<void> {
  await input.waitFor({ state: 'visible', timeout: 5000 });

  for (let attempt = 0; attempt < 3; attempt++) {
    await input.click({ clickCount: 3 });
    await input.press('Control+A');
    await input.press('Delete');
    await input.pressSequentially(value);

    const digitsOnly = (await input.inputValue()).replace(/[^\d]/g, '');
    if (digitsOnly === value) return;
  }

  throw new Error(`fillNumberField: expected "${value}" but the field shows "${await input.inputValue()}".`);
}

test.describe('Workflow Management - Simulate Registration - Bulk Tests', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateRegistration(page);
    await switchToBulkTab(page);
  });

  test('TC-2 Verify a Bulk registration simulation succeeds and the form resets to its defaults', async ({ page }, testInfo) => {
    const numberInput = numberOfSimulationsInput(page);
    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    const resetBtn = page.locator('button[aria-label="Reset Form"]').first();
    const referralCodeInput = textInputByLabel(page, 'Referral Code *');
    const signUpCodeInput = textInputByLabel(page, 'Sign Up Code *');

    // Step 1 — Bulk screen opens with every field and both buttons
    await expect(numberInput, `Expected Number of Simulations to default to ${BULK_DEFAULT_COUNT}`).toHaveValue(BULK_DEFAULT_COUNT, { timeout: 10000 });
    await expect(regionDropdown(page), 'Expected the Region dropdown to be visible').toBeVisible({ timeout: 10000 });
    await expect(referralCodeInput, 'Expected the Referral Code field to be visible').toBeVisible({ timeout: 10000 });
    await expect(signUpCodeInput, 'Expected the Sign Up Code field to be visible').toBeVisible({ timeout: 10000 });
    await expect(resetBtn, 'Expected Reset Form to be visible').toBeVisible({ timeout: 10000 });
    await expect(simulateBtn, 'Expected Simulate to be disabled before Region and codes are filled').toBeDisabled({ timeout: 10000 });

    // Step 2 — Number of Simulations
    await fillNumberField(numberInput, BULK_COUNT);
    await expect(numberInput, `Expected Number of Simulations to show ${BULK_COUNT}`).toHaveValue(BULK_COUNT, { timeout: 5000 });

    // Step 3 — Region, Referral Code, Sign Up Code
    await selectDropdownOptionByText(page, regionDropdown(page), BULK_REGION);
    await expect(regionDropdown(page).locator('.p-dropdown-label'), `Expected Region to show "${BULK_REGION}"`).toHaveText(BULK_REGION, { timeout: 5000 });
    await referralCodeInput.fill(BULK_REFERRAL_CODE);
    await signUpCodeInput.fill(BULK_SIGN_UP_CODE);

    await expect(simulateBtn, 'Expected Simulate to enable once all Bulk mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_bulk_simulate_registration_filled');

    // Step 4 — Simulate and check the success toast
    await simulateBtn.click();
    const successToast = page.locator('.p-toast-message').filter({ hasText: BULK_SUCCESS_TOAST_TEXT });
    await expect(successToast, `Expected a "${BULK_SUCCESS_TOAST_TEXT}" success toast`).toBeVisible({ timeout: 30000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_bulk_simulate_registration_success');

    // Step 5 — form resets to its defaults after a successful simulation
    await expect(numberInput, `Expected Number of Simulations to reset to ${BULK_DEFAULT_COUNT}`).toHaveValue(BULK_DEFAULT_COUNT, { timeout: 10000 });
    await expect(regionDropdown(page).locator('.p-dropdown-label'), 'Expected Region to reset to its placeholder').toHaveText('Region *', { timeout: 5000 });
    await expect(referralCodeInput, 'Expected Referral Code to be cleared after a successful simulation').toHaveValue('', { timeout: 5000 });
    await expect(signUpCodeInput, 'Expected Sign Up Code to be cleared after a successful simulation').toHaveValue('', { timeout: 5000 });
    await expect(simulateBtn, 'Expected Simulate to be disabled again after the form resets').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_bulk_simulate_registration_form_reset');
    console.log(`Simulated ${BULK_COUNT} bulk registrations in ${BULK_REGION}; success toast shown and form reset to defaults.`);
  });

});
