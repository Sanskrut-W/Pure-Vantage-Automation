// npx playwright test tests/simulatebet.spec.ts --headed
import { test, expect, Locator, Page } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// The global loading overlay (pure-page-loader / .pure__loader-container) intercepts pointer
// events for whatever is underneath it while a page transition is still settling. BasePage.clickElement
// already waits this out, but the navigation helpers below click raw locators directly (they run before
// any page object exists), so they need the same wait or their clicks silently land on the overlay
// instead of the intended element.
async function waitForLoaderHidden(page: Page): Promise<void> {
  await page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
}

// Confirmed live: the overlay can still be absent at this wait check and reappear before the
// click's mousedown fires (there's no atomicity between a separate wait and a separate click),
// and once it reappears it can stay up well past the point where re-waiting once more helps —
// a single click attempt burned the full 120s action timeout retrying against it. Rather than
// wait indefinitely on a single stuck attempt, this bounds each click attempt and reports
// success/failure so the caller's outer retry loop can abandon it and try the whole navigation
// again from a fresh `goto`, instead of the whole test dying on one TimeoutError.
async function clickTolerant(page: Page, locator: Locator, timeoutMs = 30000): Promise<boolean> {
  await waitForLoaderHidden(page);
  return locator.click({ timeout: timeoutMs }).then(() => true).catch(() => false);
}

// Launches the site and navigates Workflow Management → Simulate Bet → Settlements tab.
//
// The Simulate Bet page is noticeably slower to render its actual content than
// `networkidle` accounts for — networkidle resolves once network activity settles, which can
// happen before Angular finishes rendering this specific page's fields. Waiting only on
// networkidle then immediately asserting on a field was failing before the page caught up.
//
// The Settlement fields and the <simulate-bets-table> component load as two independently-timed
// chunks, not one — waiting only for the Settlement content marker let tests proceed into the
// Bets section before it had actually rendered, timing out on the very first dropdown
// (`selectFirstDropdownOption` looking for "Feeds") even though the page had "opened" by every
// other measure. Both markers are now waited for before this function returns, and the whole
// navigation retries from scratch up to 3 times if either never shows up.
async function navigateToSimulateBetSettlements(page: Page): Promise<void> {
  const settlementMarker = page.locator('text=Enter Player Account Id (Guid) *');
  const betsTableMarker = page.locator('simulate-bets-table .dropdown-input').first();

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const workflowNode = page.locator('span.menuitem-text:text-is("Workflow Management")').first();
    const workflowReady = await workflowNode.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!workflowReady) continue;
    if (!(await clickTolerant(page, workflowNode))) continue;

    const simulateBetLink = page.locator('span.menuitem-text:text-is("Simulate Bet")').first();
    const simulateBetLinkReady = await simulateBetLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!simulateBetLinkReady) continue;
    if (!(await clickTolerant(page, simulateBetLink))) continue;
    await page.waitForLoadState('networkidle');

    // The sibling tab is confirmed as "Bets Placed" (see navigateToSimulateBetBetsPlaced below).
    const settlementsTab = page.locator('.p-menuitem-text:text-is("Settlements")').first();
    const tabReady = await settlementsTab.waitFor({ state: 'visible', timeout: 25000 }).then(() => true).catch(() => false);
    if (!tabReady) continue;
    if (!(await clickTolerant(page, settlementsTab))) continue;
    await page.waitForLoadState('networkidle');

    const settlementReady = await settlementMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (!settlementReady) continue;

    const betsTableReady = await betsTableMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (betsTableReady) return;
  }

  // Final assertions (as real Playwright expects, not thrown Errors) so a genuine failure still
  // reports in the familiar "expect(locator).toBeVisible()" format if all 3 attempts failed.
  await expect(settlementMarker).toBeVisible({ timeout: 20000 });
  await expect(betsTableMarker).toBeVisible({ timeout: 20000 });
}

// Locates a Settlement field's `.pure__input-group` container by its adjacent <label> text —
// none of these fields have an id/name, so the label text is the only stable handle.
function fieldGroupByLabel(scope: Locator, labelText: string): Locator {
  return scope.locator('.pure__input-group').filter({ hasText: labelText }).first();
}

// Text/number input within a field group (both plain text inputs and PrimeNG InputNumber inputs
// share the "p-inputtext" class in this app).
function textInputByLabel(scope: Locator, labelText: string): Locator {
  return fieldGroupByLabel(scope, labelText).locator('input.p-inputtext').first();
}

// Locates a dropdown by the static aria-label on its trigger — unlike the dropdown's visible
// label text (which changes to show the selected value once one is picked), this aria-label
// stays constant regardless of selection state.
function dropdownByAriaLabel(scope: Locator, ariaLabelText: string): Locator {
  return scope.locator('.dropdown-input').filter({ has: scope.page().locator(`[aria-label="${ariaLabelText}"]`) }).first();
}

async function isDropdownDisabled(dropdown: Locator): Promise<boolean> {
  return (await dropdown.getAttribute('data-p-disabled')) === 'true';
}

// Opens a PrimeNG dropdown and clicks its first option, returning the selected option's text.
async function selectFirstDropdownOption(page: Page, dropdown: Locator): Promise<string> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});

  // :visible matters here — confirmed live: a real dropdown (Region Code, 23
  // items) had its DOM-first matching <li> not visible, so a plain .first()
  // grabbed that one, .isVisible() correctly said false, and the whole
  // function gave up even though later options (e.g. "BW") were genuinely
  // visible and selectable. Filtering to :visible up front picks the first
  // one actually usable, regardless of its position in the raw DOM order.
  const optionSelector = '[data-pc-section="option"]:not(option):visible, .p-dropdown-item:visible, li[role="option"]:visible';

  // Candidates in priority order. [data-pc-section="trigger"] first — NOT combined with
  // [aria-haspopup=listbox], because the field also contains a visually-hidden accessibility
  // input carrying that attribute which sits earlier in the DOM and swallows clicks.
  // The visible label span and the root itself are fallbacks for dropdown variants (other
  // tabs) that don't render a data-pc-section trigger. Short per-click timeouts keep a
  // missing candidate from burning the full 120s action timeout before the next is tried.
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

  // Keyboard fallback — focus the field and open the listbox with Alt+ArrowDown
  await dropdown.locator('.p-dropdown-label, [data-pc-section="input"]').first().click({ timeout: 2000 }).catch(() => dropdown.focus().catch(() => {}));
  await page.keyboard.press('Alt+ArrowDown').catch(() => {});
  const firstOption = page.locator(optionSelector).first();
  if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    const text = (await firstOption.textContent())?.trim() ?? '';
    await firstOption.click();
    return text;
  }

  throw new Error('selectFirstDropdownOption: dropdown panel never opened or had no options.');
}

// Opens a dropdown and selects an option different from whatever it currently shows — used to
// verify that CHANGING a field (not clearing it) still cascades the same downstream clearing.
// Picking the same value again wouldn't trigger a change, so this scans past the current label.
async function selectDifferentDropdownOption(page: Page, dropdown: Locator): Promise<string> {
  const currentLabel = (await dropdown.locator('.p-dropdown-label').first().textContent())?.trim() ?? '';

  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});
  const trigger = dropdown.locator('[data-pc-section="trigger"]').first();
  // :visible matters here too — see the note in selectFirstDropdownOption
  // above: the DOM-first matching option isn't always the first visible one.
  const optionSelector = '[data-pc-section="option"]:not(option):visible, .p-dropdown-item:visible, li[role="option"]:visible';

  for (let attempt = 0; attempt < 3; attempt++) {
    await waitForLoaderHidden(page);
    await trigger.click().catch(() => dropdown.click({ force: true }).catch(() => {}));
    const options = page.locator(optionSelector);
    if (await options.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const count = await options.count();
      for (let i = 0; i < count; i++) {
        const text = (await options.nth(i).textContent())?.trim() ?? '';
        if (text && text !== currentLabel) {
          await options.nth(i).click();
          return text;
        }
      }
      // Only one option exists — nothing different to pick.
      await page.keyboard.press('Escape').catch(() => {});
      return currentLabel;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }

  throw new Error('selectDifferentDropdownOption: dropdown panel never opened or had no options.');
}

// Switches the Simulate Bet page from Single to Bulk settlement mode via the toggle button.
// NOTE: assumes switching tabs fully replaces the Single-mode fields in the DOM rather than
// leaving them mounted-but-hidden — unconfirmed. If Single-mode fields stay in the DOM, locators
// scoped only by aria-label (e.g. "Settlement Status *", which both modes share verbatim) could
// match the wrong, stale element.
async function switchToBulkTab(page: Page): Promise<void> {
  const bulkTab = page.locator('[role="button"][aria-label="Bulk"]').first();
  await bulkTab.waitFor({ state: 'visible', timeout: 15000 });
  await bulkTab.click();
  await page.waitForLoadState('networkidle');

  const amountField = page.locator('text=Amount To Simulate *');
  await amountField.waitFor({ state: 'visible', timeout: 15000 });
}

// UNCONFIRMED — no filled-dropdown HTML was available to see how clearing actually works here.
// Tries a PrimeNG clear-icon first (shown once a value is selected); falls back to reopening the
// dropdown and picking the blank/placeholder option if no clear icon is found.
async function clearDropdown(page: Page, dropdown: Locator): Promise<void> {
  const clearIcon = dropdown.locator('[data-pc-section="clearicon"], .p-dropdown-clear-icon').first();
  if (await clearIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
    await clearIcon.click();
    return;
  }

  // [data-pc-section="trigger"] only — see the note in selectFirstDropdownOption above about
  // the hidden accessibility input collision.
  const trigger = dropdown.locator('[data-pc-section="trigger"]').first();
  await waitForLoaderHidden(page);
  await trigger.click().catch(() => dropdown.click({ force: true }).catch(() => {}));
  const blankOption = page.locator('[data-pc-section="option"]:not(option), .p-dropdown-item, li[role="option"]').filter({ hasText: '' }).first();
  if (await blankOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    await blankOption.click();
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
}

// Clears and types a value into a PrimeNG InputNumber field, verifying it actually landed —
// mirrors the fix already proven in the other spec files in this suite.
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

// Fills every mandatory Settlement field with valid data (excluding the Bets section), so tests
// that need the rest of the form valid can focus purely on the Bets-table requirement.
async function fillMandatorySettlementFields(page: Page, scope: Locator): Promise<void> {
  const playerAccountId = textInputByLabel(scope, 'Enter Player Account Id (Guid) *');
  await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');

  await selectFirstDropdownOption(page, dropdownByAriaLabel(scope, 'Region Code *'));

  await fillNumberField(fieldGroupByLabel(scope, 'Payout Amount *').locator('input.p-inputtext').first(), '100');
  await fillNumberField(fieldGroupByLabel(scope, 'Cash Out Amount *').locator('input.p-inputtext').first(), '50');

  const betslipId = textInputByLabel(scope, 'Betslip Id *');
  await betslipId.fill(`BS-${CommonUtils.generateRandomString(8)}`);

  await selectFirstDropdownOption(page, dropdownByAriaLabel(scope, 'Settlement Status *'));
}

// Launches the site and navigates Workflow Management → Simulate Bet → Bets Placed tab.
// Same retry-hardened approach as navigateToSimulateBetSettlements, for the same reason: this
// page's sections load as independently-timed chunks. "Wager Amount *" is used as the
// Bets-Placed-specific content marker since "Enter Player Account Id (Guid) *" is shared with
// the Settlements tab and wouldn't distinguish which one actually loaded.
async function navigateToSimulateBetBetsPlaced(page: Page): Promise<void> {
  const betsPlacedMarker = page.locator('text=Wager Amount *');
  const betsTableMarker = page.locator('simulate-bets-table .dropdown-input').first();

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const workflowNode = page.locator('span.menuitem-text:text-is("Workflow Management")').first();
    const workflowReady = await workflowNode.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!workflowReady) continue;
    if (!(await clickTolerant(page, workflowNode))) continue;

    const simulateBetLink = page.locator('span.menuitem-text:text-is("Simulate Bet")').first();
    const simulateBetLinkReady = await simulateBetLink.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (!simulateBetLinkReady) continue;
    if (!(await clickTolerant(page, simulateBetLink))) continue;
    await page.waitForLoadState('networkidle');

    const betsPlacedTab = page.locator('.p-menuitem-text:text-is("Bets Placed")').first();
    const tabReady = await betsPlacedTab.waitFor({ state: 'visible', timeout: 25000 }).then(() => true).catch(() => false);
    if (!tabReady) continue;
    if (!(await clickTolerant(page, betsPlacedTab))) continue;
    await page.waitForLoadState('networkidle');

    const fieldsReady = await betsPlacedMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (!fieldsReady) continue;

    const betsTableReady = await betsTableMarker.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
    if (betsTableReady) return;
  }

  await expect(betsPlacedMarker).toBeVisible({ timeout: 20000 });
  await expect(betsTableMarker).toBeVisible({ timeout: 20000 });
}

// Fills every mandatory Bets Placed field with valid data (excluding the Bets section) — mirrors
// fillMandatorySettlementFields, adapted to this tab's field set (Wager Amount instead of
// separate Payout/Cash Out Amount, no Settlement Status).
async function fillMandatoryBetsPlacedFields(page: Page, scope: Locator): Promise<void> {
  const playerAccountId = textInputByLabel(scope, 'Enter Player Account Id (Guid) *');
  await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');

  await selectFirstDropdownOption(page, dropdownByAriaLabel(scope, 'Region Code *'));

  await fillNumberField(fieldGroupByLabel(scope, 'Wager Amount *').locator('input.p-inputtext').first(), '100');

  const betslipId = textInputByLabel(scope, 'Betslip Id *');
  await betslipId.fill(`BS-${CommonUtils.generateRandomString(8)}`);
}

// // ─────────────────────────────────────────────────────────────────────────────
// // SIMULATE BET — SETTLEMENTS — MANDATORY FIELDS & VALIDATION
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Simulate Bet - Settlements - Mandatory Fields', () => {

//   test.beforeEach(async ({ page }) => {
//     await navigateToSimulateBetSettlements(page);
//   });

//   // TC_01
//   test('TC-1 Verify Simulate Bet Settlements screen opens with all fields', async ({ page }, testInfo) => {
//     await expect(page.locator('text=Enter Player Account Id (Guid) *')).toBeVisible({ timeout: 15000 });
//     await expect(dropdownByAriaLabel(page.locator('body'), 'Region Code *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('text=Payout Amount *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('text=Cash Out Amount *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('text=Betslip Id *')).toBeVisible({ timeout: 10000 });
//     await expect(dropdownByAriaLabel(page.locator('body'), 'Settlement Status *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('button[aria-label="Reset"]')).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01-SettlementsScreenOpens_success');
//   });

//   // TC_02
//   test('TC-2 Verify Simulate button stays disabled with all mandatory fields blank', async ({ page }, testInfo) => {
//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn, 'Expected Simulate to remain disabled with all fields blank').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_02-MandatoryFieldsBlank_success');
//   });

//   // TC_03
//   test('TC-3 Verify Player Account Id requires a valid UUID', async ({ page }, testInfo) => {
//     const playerAccountId = textInputByLabel(page.locator('body'), 'Enter Player Account Id (Guid) *');

//     await playerAccountId.fill('not-a-valid-uuid');
//     await expect(page.locator('small.p-error:has-text("valid UUID")'), 'Expected UUID validation error for an invalid value').toBeVisible({ timeout: 5000 });

//     await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');
//     await expect(page.locator('small.p-error:has-text("valid UUID")'), 'Expected UUID validation error to clear for a valid UUID').not.toBeVisible({ timeout: 5000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_03-PlayerAccountIdUuidValidation_success');
//   });

//   // TC_04
//   test('TC-4 Verify Payout Amount only accepts integers', async ({ page }, testInfo) => {
//     const payoutAmount = fieldGroupByLabel(page.locator('body'), 'Payout Amount *').locator('input.p-inputtext').first();

//     await payoutAmount.click({ clickCount: 3 });
//     await payoutAmount.pressSequentially('abc123xyz');
//     const value = await payoutAmount.inputValue();
//     expect(value, 'Expected letters to be rejected, leaving only digits').not.toMatch(/[a-zA-Z]/);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_04-PayoutAmountIntegerOnly_success');
//   });

//   // TC_05
//   test('TC-5 Verify Cash Out Amount only accepts integers', async ({ page }, testInfo) => {
//     const cashOutAmount = fieldGroupByLabel(page.locator('body'), 'Cash Out Amount *').locator('input.p-inputtext').first();

//     await cashOutAmount.click({ clickCount: 3 });
//     await cashOutAmount.pressSequentially('abc456xyz');
//     const value = await cashOutAmount.inputValue();
//     expect(value, 'Expected letters to be rejected, leaving only digits').not.toMatch(/[a-zA-Z]/);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05-CashOutAmountIntegerOnly_success');
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // SIMULATE BET — SETTLEMENTS — BETS FIELD DEPENDENCIES
// // Feed → Sport → (League & Event) → Market → Outcome cascade, per the confirmed markup:
// // Sport/League/Event/Market/Outcome all start disabled (data-p-disabled="true") except Feeds.
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Simulate Bet - Settlements - Bets Field Dependencies', () => {

//   test.beforeEach(async ({ page }) => {
//     await navigateToSimulateBetSettlements(page);
//   });

//   // TC_06
//   test('TC-6 Verify Sport is disabled until Feed is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     expect(await isDropdownDisabled(sportDropdown), 'Expected Sport to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));

//     expect(await isDropdownDisabled(sportDropdown), 'Expected Sport to become enabled after selecting Feed').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06-SportEnabledAfterFeed_success');
//   });

//   // TC_07
//   test('TC-7 Verify League and Event are disabled until both Feed and Sport are selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');

//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to start disabled').toBe(true);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     expect(await isDropdownDisabled(leagueDropdown), 'League should stay disabled with only Feed selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to become enabled once Feed and Sport are both selected').toBe(false);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to become enabled once Feed and Sport are both selected').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_07-LeagueEventEnabledAfterFeedAndSport_success');
//   });

//   // TC_08
//   // Fields must be selected line-wise, in full chain order (Feed → Sport → League → Event →
//   // Market → Outcome) — skipping League before Event leaves Event's option list unpopulated
//   // (it's scoped by the selected League), so the enable/disable check needs the full preceding
//   // chain walked in order, not just the immediately-preceding field.
//   test('TC-8 Verify Market is disabled until Event is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     expect(await isDropdownDisabled(marketDropdown), 'Market should stay disabled before Event is selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become enabled after selecting Event').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08-MarketEnabledAfterEvent_success');
//   });

//   // TC_09
//   test('TC-9 Verify Outcome is disabled until Market is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     expect(await isDropdownDisabled(outcomeDropdown), 'Outcome should stay disabled before Market is selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Market'));
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become enabled after selecting Market').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09-OutcomeEnabledAfterMarket_success');
//   });

//   // TC_10
//   // NOTE: relies on the unconfirmed clearDropdown() helper — see the file-level comment on it.
//   test('TC-10 Verify clearing Market also clears Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, marketDropdown);

//     await expect(outcomeDropdown.locator('.p-dropdown-label'), 'Expected Outcome to clear back to its placeholder').toHaveText('Outcome', { timeout: 5000 });
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after Market is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_10-ClearingMarketClearsOutcome_success');
//   });

//   // TC_11
//   test('TC-11 Verify clearing Event also clears Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, eventDropdown);

//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after Event is cleared').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after Event is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11-ClearingEventClearsMarketAndOutcome_success');
//   });

//   // TC_12
//   test('TC-12 Verify clearing League also clears Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, leagueDropdown);

//     await expect(eventDropdown.locator('.p-dropdown-label'), 'Expected Event to clear').toHaveText('Event', { timeout: 5000 });
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after League is cleared').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after League is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_12-ClearingLeagueClearsDependents_success');
//   });

//   // TC_13
//   test('TC-13 Verify clearing Sport clears League, Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     await selectFirstDropdownOption(page, sportDropdown);
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);

//     await clearDropdown(page, sportDropdown);

//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to become disabled again after Sport is cleared').toBe(true);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to become disabled again after Sport is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13-ClearingSportClearsDependents_success');
//   });

//   // TC_14
//   // Selects the full chain (Feed → Sport → League → Event → Market → Outcome), then CHANGES
//   // Feed to a different value (rather than clearing it) and verifies League, Event, Market and
//   // Outcome all clear as a result — a Feed change invalidates the same downstream selections a
//   // Feed clear would, since they were populated based on the old Feed.
//   test('TC-14 Verify changing Feed clears League, Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const feedDropdown = dropdownByAriaLabel(betsTable, 'Feeds *');
//     await selectFirstDropdownOption(page, feedDropdown);
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     await selectFirstDropdownOption(page, sportDropdown);
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await selectDifferentDropdownOption(page, feedDropdown);

//     await expect(leagueDropdown.locator('.p-dropdown-label'), 'Expected League to clear after changing Feed').toHaveText('League', { timeout: 5000 });
//     await expect(eventDropdown.locator('.p-dropdown-label'), 'Expected Event to clear after changing Feed').toHaveText('Event', { timeout: 5000 });
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after changing Feed').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after changing Feed').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14-ChangingFeedClearsDependents_success');
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // SIMULATE BET — SETTLEMENTS — BETS TABLE, RESET & SIMULATION
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Simulate Bet - Settlements - Bets Table and Simulation', () => {

//   test.beforeEach(async ({ page }) => {
//     await navigateToSimulateBetSettlements(page);
//   });

//   // TC_15
//   test('TC-15 Verify the Bets table is displayed on the Settlements screen', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await expect(betsTable).toBeVisible({ timeout: 15000 });
//     await expect(betsTable.locator('text=Bets')).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15-BetsTableDisplayed_success');
//   });


//   // TC_17
//   test('TC-16 Verify a bet requires at least one of League, Event, Market or Outcome to be added', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));

//     // Feed + Sport alone (no League/Event/Market/Outcome) should not be a valid, addable bet.
//     const addBtn = betsTable.locator('button:has(.pi-plus)').first();
//     await addBtn.click();

//     await fillMandatorySettlementFields(page, page.locator('body'));
//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn, 'Expected Simulate to stay disabled without a valid bet added').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_17-BetRequiresOneOfFourFields_success');
//   });

//   // TC_18
//   test('TC-17 Verify a valid bet can be added and enables Simulate once the form is otherwise complete', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

//     const addBtn = betsTable.locator('button:has(.pi-plus)').first();
//     await addBtn.click();
//     await page.waitForTimeout(300);

//     await fillMandatorySettlementFields(page, page.locator('body'));

//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn, 'Expected Simulate to enable once a valid bet is added and the form is complete').toBeEnabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18-ValidBetEnablesSimulate_success');
//   });

//   // TC_19
//   test('TC-18 Verify the Delete button removes a bet from the Bets table', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

//     const addBtn = betsTable.locator('button:has(.pi-plus)').first();
//     await addBtn.click();

//     await fillMandatorySettlementFields(page, page.locator('body'));
//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

//     const deleteBtn = betsTable.locator('button:has(.pi-trash)').first();
//     await deleteBtn.click();

//     await expect(simulateBtn, 'Expected Simulate to disable again once the only bet is removed').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19-DeleteBetRemovesFromTable_success');
//   });

//   // TC_20
//   // Checks every field on the page, not just a sample — a prior version only asserted on
//   // Player Account Id, Betslip Id, Feeds and the Simulate button, so Reset silently leaving
//   // Settlement Status (and others) unclear went undetected and the test still passed.
//   test('TC-19 Verify Reset clears every field', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await fillMandatorySettlementFields(page, page.locator('body'));
//     const feedDropdown = dropdownByAriaLabel(betsTable, 'Feeds *');
//     await selectFirstDropdownOption(page, feedDropdown);
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     await selectFirstDropdownOption(page, sportDropdown);
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);

//     const resetBtn = page.locator('button[aria-label="Reset"]').first();
//     await resetBtn.click();
//     await page.waitForTimeout(300);

//     // Settlement fields
//     const playerAccountId = textInputByLabel(page.locator('body'), 'Enter Player Account Id (Guid) *');
//     await expect(playerAccountId, 'Expected Player Account Id to clear').toHaveValue('', { timeout: 5000 });

//     const regionCodeDropdown = dropdownByAriaLabel(page.locator('body'), 'Region Code *');
//     await expect(regionCodeDropdown.locator('.p-dropdown-label'), 'Expected Region Code to clear back to its placeholder').toHaveText('Region Code *', { timeout: 5000 });

//     // Payout/Cash Out Amount default to "0" even in the pristine, never-touched state (confirmed
//     // from the initial page markup) — Reset should revert to that default, not to an empty string.
//     const payoutAmount = fieldGroupByLabel(page.locator('body'), 'Payout Amount *').locator('input.p-inputtext').first();
//     await expect(payoutAmount, 'Expected Payout Amount to reset to its default of 0').toHaveValue('0', { timeout: 5000 });

//     const cashOutAmount = fieldGroupByLabel(page.locator('body'), 'Cash Out Amount *').locator('input.p-inputtext').first();
//     await expect(cashOutAmount, 'Expected Cash Out Amount to reset to its default of 0').toHaveValue('0', { timeout: 5000 });

//     const betslipId = textInputByLabel(page.locator('body'), 'Betslip Id *');
//     await expect(betslipId, 'Expected Betslip Id to clear').toHaveValue('', { timeout: 5000 });

//     const settlementStatusDropdown = dropdownByAriaLabel(page.locator('body'), 'Settlement Status *');
//     await expect(settlementStatusDropdown.locator('.p-dropdown-label'), 'Expected Settlement Status to clear back to its placeholder').toHaveText('Settlement Status *', { timeout: 5000 });

//     // Bets fields
//     await expect(feedDropdown.locator('.p-dropdown-label'), 'Expected Feeds to clear back to its placeholder').toHaveText('Feeds *', { timeout: 5000 });
//     await expect(sportDropdown.locator('.p-dropdown-label'), 'Expected Sport to clear back to its placeholder').toHaveText('Sport *', { timeout: 5000 });
//     expect(await isDropdownDisabled(sportDropdown), 'Expected Sport to become disabled again after Reset').toBe(true);
//     await expect(leagueDropdown.locator('.p-dropdown-label'), 'Expected League to clear back to its placeholder').toHaveText('League', { timeout: 5000 });
//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to become disabled again after Reset').toBe(true);

//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn, 'Expected Simulate to be disabled again after Reset').toBeDisabled({ timeout: 5000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_20-ResetClearsAllFields_success');
//   });

//   // TC_21
//   test('TC-20 Verify a successful simulation shows a confirmation toast', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

//     const addBtn = betsTable.locator('button:has(.pi-plus)').first();
//     await addBtn.click();

//     await fillMandatorySettlementFields(page, page.locator('body'));

//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-Simulate_filled');

//     await simulateBtn.click();
//     await page.waitForLoadState('networkidle');

//     const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//     await expect(successToast, 'Expected a success toast confirming the simulation ran').toBeVisible({ timeout: 15000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-Simulate_success');
//   });

// });

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE BET — BULK SETTLEMENTS
// Toggle button confirmed: [role="button"][aria-label="Bulk"]. Fields confirmed: Amount To
// Simulate (InputNumber, defaults to "0"), Region (dropdown), Settlement Status (dropdown) — all
// 3 mandatory. Max for Amount To Simulate confirmed as 100,000,000,000,000,000,000. Reset/
// Simulate buttons share the exact same aria-label as Single mode's — see the note on
// switchToBulkTab() about the (unconfirmed) assumption that Single-mode fields fully unmount.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Simulate Bet - Bulk Settlements', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateBetSettlements(page);
    await switchToBulkTab(page);
  });

  // // TC_23
  // test('TC-21 Verify Bulk Settlements screen opens with all fields', async ({ page }, testInfo) => {
  //   await expect(page.locator('text=Amount To Simulate *')).toBeVisible({ timeout: 15000 });
  //   await expect(dropdownByAriaLabel(page.locator('body'), 'Region *')).toBeVisible({ timeout: 10000 });
  //   await expect(dropdownByAriaLabel(page.locator('body'), 'Settlement Status *')).toBeVisible({ timeout: 10000 });
  //   await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
  //   await expect(page.locator('button[aria-label="Reset"]')).toBeVisible({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23-BulkScreenOpens_success');
  // });

  // // TC_24
  // test('TC-22 Verify Simulate button stays disabled with all Bulk mandatory fields blank', async ({ page }, testInfo) => {
  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn, 'Expected Simulate to remain disabled with all Bulk fields blank').toBeDisabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24-BulkMandatoryFieldsBlank_success');
  // });

  // // TC_25
  // // The field itself does NOT clamp or reject a value above the stated max — it accepts
  // // whatever's typed. The app instead blocks the over-max value from actually simulating: either
  // // the Simulate button stays disabled, or a red inline error appears just below the field. Fill
  // // every other mandatory field too, so the over-max Amount is the only thing that could still be
  // // wrong — isolating that this specific field is what's blocking things, not something else.
  // test('TC-23 Verify Amount To Simulate rejects a value above its maximum limit', async ({ page }, testInfo) => {
  //   const overMax = '1000000000000000000000'; // one digit beyond the documented max of 100,000,000,000,000,000,000

  //   const amountGroup = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *');
  //   const amountInput = amountGroup.locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, overMax);
  //   await page.keyboard.press('Tab');

  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Settlement Status *'));

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25-AmountToSimulateOverMax_filled');

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   const simulateDisabled = await simulateBtn.isDisabled().catch(() => false);
  //   const inlineError = amountGroup.locator('small.p-error');
  //   const errorVisible = await inlineError.isVisible({ timeout: 5000 }).catch(() => false);

  //   expect(
  //     simulateDisabled || errorVisible,
  //     'Expected either Simulate to stay disabled or a red validation message below Amount To Simulate when the value exceeds the max'
  //   ).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25-AmountToSimulateMaxValidation_success');
  // });

  // // TC_26
  // test('TC-24 Verify Amount To Simulate accepts its maximum limit exactly', async ({ page }, testInfo) => {
  //   const maxValue = '100000000000000000000';

  //   const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, maxValue);

  //   const value = (await amountInput.inputValue()).replace(/[^\d]/g, '');
  //   expect(value, `Expected Amount To Simulate to accept exactly ${maxValue}`).toBe(maxValue);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_26-AmountToSimulateAcceptsMax_success');
  // });

  // // TC_27
  // test('TC-25 Verify a successful Bulk simulation shows a confirmation toast', async ({ page }, testInfo) => {
  //   const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, '1000');

  //   const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
  //   const statusDropdown = dropdownByAriaLabel(page.locator('body'), 'Settlement Status *');

  //   const regionSelected = await selectFirstDropdownOption(page, regionDropdown);
  //   const statusSelected = await selectFirstDropdownOption(page, statusDropdown);
  //   console.log(`selectFirstDropdownOption reported picking Region="${regionSelected}", Settlement Status="${statusSelected}"`);

  //   // Diagnostic: confirm the selection actually landed on the VISIBLE field's own
  //   // label, not just on whatever element dropdownByAriaLabel's `.first()` matched.
  //   // switchToBulkTab's comment above flags this as an unconfirmed risk — if
  //   // Single-mode's same-aria-label dropdown stays mounted-but-hidden in the DOM,
  //   // `.first()` could silently select in the wrong (inactive) instance while this
  //   // visible one stays stuck on its placeholder.
  //   const regionLabelText = (await regionDropdown.locator('.p-dropdown-label, [data-pc-section="input"]').first().textContent())?.trim();
  //   const statusLabelText = (await statusDropdown.locator('.p-dropdown-label, [data-pc-section="input"]').first().textContent())?.trim();
  //   console.log(`Region dropdown's own visible label after selection: "${regionLabelText}"`);
  //   console.log(`Settlement Status dropdown's own visible label after selection: "${statusLabelText}"`);

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27-BulkSimulate_filled');

  //   await simulateBtn.click();
  //   await page.waitForLoadState('networkidle');

  //   // Bulk simulation is a slower server-side operation than networkidle alone
  //   // accounts for — confirmed live: the toast hadn't appeared yet by the old
  //   // 15s timeout, still mid-flight on the app's own loading overlay. Wait for
  //   // that overlay to actually clear before checking for a toast at all.
  //   await page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

  //   // Diagnostic: log WHATEVER toast appears (success or error) so a validation
  //   // rejection caused by an unselected Region/Settlement Status shows up here
  //   // instead of just timing out silently on the success-only assertion below.
  //   const anyToast = page.locator('.p-toast-message').first();
  //   if (await anyToast.isVisible({ timeout: 45000 }).catch(() => false)) {
  //     const toastText = (await anyToast.textContent())?.trim();
  //     const severityClass = await anyToast.getAttribute('class');
  //     console.log(`Toast appeared — class="${severityClass}" | text="${toastText}"`);
  //   } else {
  //     console.log('No toast appeared at all within 45s after clicking Simulate.');
  //   }

  //   const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
  //   await expect(successToast, 'Expected a success toast confirming the bulk simulation ran').toBeVisible({ timeout: 45000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27-BulkSimulate_success');
  // });

  // TC_28
  test('TC-26 Verify Reset clears every Bulk field', async ({ page }, testInfo) => {
    const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
    await fillNumberField(amountInput, '1000');
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Settlement Status *'));

    const resetBtn = page.locator('button[aria-label="Reset"]').first();
    await resetBtn.click();
    await page.waitForTimeout(300);

    // Pass criterion: every field falls back to its ORIGINAL state (default/placeholder title),
    // no longer holding the entered/selected values. Confirmed by the user: Amount To Simulate's
    // own default (both here and on Bets Placed - Bulk) is "1", not "0"/empty — Reset restores
    // that default rather than clearing the field outright.
    await expect(amountInput, 'Expected Amount To Simulate to clear back to its default value of 1').toHaveValue('1', { timeout: 5000 });

    const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
    await expect(regionDropdown.locator('.p-dropdown-label'), 'Expected Region to clear back to its placeholder title').toHaveText('Region *', { timeout: 5000 });

    // Settlement Status must show its placeholder title again — specifically NOT a selected
    // value like "Win"/"Loss".
    const settlementStatusDropdown = dropdownByAriaLabel(page.locator('body'), 'Settlement Status *');
    const statusLabel = settlementStatusDropdown.locator('.p-dropdown-label');
    await expect(statusLabel, 'Expected Settlement Status to clear back to its placeholder title').toHaveText('Settlement Status *', { timeout: 5000 });
    await expect(statusLabel, 'Settlement Status must not show Win/Loss after Reset').not.toHaveText(/win|loss/i);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_28-BulkResetClearsAllFields_success');
  });

});

// // ─────────────────────────────────────────────────────────────────────────────
// // SIMULATE BET — BETS PLACED — MANDATORY FIELDS & VALIDATION
// // Fields confirmed: Player Account Id (Guid) *, Region Code *, Wager Amount *, Betslip Id * — a
// // smaller set than Settlements (no separate Payout/Cash Out Amount, no Settlement Status). The
// // <simulate-bets-table> component and its Feed→Sport→League→Event→Market→Outcome cascade are
// // confirmed IDENTICAL to the Settlements tab's, so the whole dependency test group below mirrors
// // TC_06–14 unchanged.
// // NOTE: Player Account Id's UUID validation (TC_32) mirrors TC_03 on the assumption the same
// // shared field component is reused here since the label text is identical — the Bets Placed
// // markup sent didn't show a "p-invalid"/error state to confirm this directly.
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Simulate Bet - Bets Placed - Mandatory Fields', () => {

//   test.beforeEach(async ({ page }) => {
//     await navigateToSimulateBetBetsPlaced(page);
//   });

//   // TC_29
//   test('TC-27 Verify Bets Placed screen opens with all fields', async ({ page }, testInfo) => {
//     await expect(page.locator('text=Enter Player Account Id (Guid) *')).toBeVisible({ timeout: 15000 });
//     await expect(dropdownByAriaLabel(page.locator('body'), 'Region Code *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('text=Wager Amount *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('text=Betslip Id *')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
//     await expect(page.locator('button[aria-label="Reset"]')).toBeVisible({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_29-BetsPlacedScreenOpens_success');
//   });

//   // TC_30
//   test('TC-28 Verify Simulate button stays disabled with all Bets Placed mandatory fields blank', async ({ page }, testInfo) => {
//     const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
//     await expect(simulateBtn, 'Expected Simulate to remain disabled with all fields blank').toBeDisabled({ timeout: 10000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_30-BetsPlacedMandatoryFieldsBlank_success');
//   });

//   // TC_31
//   test('TC-29 Verify Wager Amount only accepts integers', async ({ page }, testInfo) => {
//     const wagerAmount = fieldGroupByLabel(page.locator('body'), 'Wager Amount *').locator('input.p-inputtext').first();

//     await wagerAmount.click({ clickCount: 3 });
//     await wagerAmount.pressSequentially('abc123xyz');
//     const value = await wagerAmount.inputValue();
//     expect(value, 'Expected letters to be rejected, leaving only digits').not.toMatch(/[a-zA-Z]/);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_31-WagerAmountIntegerOnly_success');
//   });

//   // TC_32
//   test('TC-30 Verify Player Account Id requires a valid UUID', async ({ page }, testInfo) => {
//     const playerAccountId = textInputByLabel(page.locator('body'), 'Enter Player Account Id (Guid) *');

//     await playerAccountId.fill('not-a-valid-uuid');
//     await expect(page.locator('small.p-error:has-text("valid UUID")'), 'Expected UUID validation error for an invalid value').toBeVisible({ timeout: 5000 });

//     await playerAccountId.fill('123e4567-e89b-12d3-a456-426614174000');
//     await expect(page.locator('small.p-error:has-text("valid UUID")'), 'Expected UUID validation error to clear for a valid UUID').not.toBeVisible({ timeout: 5000 });

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_32-PlayerAccountIdUuidValidation_success');
//   });

// });

// // ─────────────────────────────────────────────────────────────────────────────
// // SIMULATE BET — BETS PLACED — BETS FIELD DEPENDENCIES
// // Identical cascade and markup to the Settlements tab's Bets table — mirrors TC_06–14 exactly.
// // ─────────────────────────────────────────────────────────────────────────────
// test.describe('Simulate Bet - Bets Placed - Bets Field Dependencies', () => {

//   test.beforeEach(async ({ page }) => {
//     await navigateToSimulateBetBetsPlaced(page);
//   });

//   // TC_33
//   test('TC-31 Verify Sport is disabled until Feed is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     expect(await isDropdownDisabled(sportDropdown), 'Expected Sport to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));

//     expect(await isDropdownDisabled(sportDropdown), 'Expected Sport to become enabled after selecting Feed').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_33-SportEnabledAfterFeed_success');
//   });

//   // TC_34
//   test('TC-32 Verify League and Event are disabled until both Feed and Sport are selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');

//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to start disabled').toBe(true);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     expect(await isDropdownDisabled(leagueDropdown), 'League should stay disabled with only Feed selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to become enabled once Feed and Sport are both selected').toBe(false);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to become enabled once Feed and Sport are both selected').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_34-LeagueEventEnabledAfterFeedAndSport_success');
//   });

//   // TC_35
//   test('TC-33 Verify Market is disabled until Event is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     expect(await isDropdownDisabled(marketDropdown), 'Market should stay disabled before Event is selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become enabled after selecting Event').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35-MarketEnabledAfterEvent_success');
//   });

//   // TC_36
//   test('TC-34 Verify Outcome is disabled until Market is selected', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to start disabled').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     expect(await isDropdownDisabled(outcomeDropdown), 'Outcome should stay disabled before Market is selected').toBe(true);

//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Market'));
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become enabled after selecting Market').toBe(false);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-OutcomeEnabledAfterMarket_success');
//   });

//   // TC_37
//   // NOTE: relies on the unconfirmed clearDropdown() helper — see the file-level comment on it.
//   test('TC-35 Verify clearing Market also clears Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Event'));
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, marketDropdown);

//     await expect(outcomeDropdown.locator('.p-dropdown-label'), 'Expected Outcome to clear back to its placeholder').toHaveText('Outcome', { timeout: 5000 });
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after Market is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_37-ClearingMarketClearsOutcome_success');
//   });

//   // TC_38
//   test('TC-36 Verify clearing Event also clears Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, eventDropdown);

//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after Event is cleared').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after Event is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_38-ClearingEventClearsMarketAndOutcome_success');
//   });

//   // TC_39
//   test('TC-37 Verify clearing League also clears Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await clearDropdown(page, leagueDropdown);

//     await expect(eventDropdown.locator('.p-dropdown-label'), 'Expected Event to clear').toHaveText('Event', { timeout: 5000 });
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after League is cleared').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after League is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_39-ClearingLeagueClearsDependents_success');
//   });

//   // TC_40
//   test('TC-38 Verify clearing Sport clears League, Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     await selectFirstDropdownOption(page, sportDropdown);
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);

//     await clearDropdown(page, sportDropdown);

//     expect(await isDropdownDisabled(leagueDropdown), 'Expected League to become disabled again after Sport is cleared').toBe(true);
//     expect(await isDropdownDisabled(eventDropdown), 'Expected Event to become disabled again after Sport is cleared').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_40-ClearingSportClearsDependents_success');
//   });

//   // TC_41
//   // Selects the full chain (Feed → Sport → League → Event → Market → Outcome), then CHANGES
//   // Feed to a different value (rather than clearing it) and verifies League, Event, Market and
//   // Outcome all clear as a result — mirrors TC_14.
//   test('TC-39 Verify changing Feed clears League, Event, Market and Outcome', async ({ page }, testInfo) => {
//     const betsTable = page.locator('simulate-bets-table');
//     const feedDropdown = dropdownByAriaLabel(betsTable, 'Feeds *');
//     await selectFirstDropdownOption(page, feedDropdown);
//     const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
//     await selectFirstDropdownOption(page, sportDropdown);
//     const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
//     await selectFirstDropdownOption(page, leagueDropdown);
//     const eventDropdown = dropdownByAriaLabel(betsTable, 'Event');
//     await selectFirstDropdownOption(page, eventDropdown);
//     const marketDropdown = dropdownByAriaLabel(betsTable, 'Market');
//     await selectFirstDropdownOption(page, marketDropdown);
//     const outcomeDropdown = dropdownByAriaLabel(betsTable, 'Outcome');
//     await selectFirstDropdownOption(page, outcomeDropdown);

//     await selectDifferentDropdownOption(page, feedDropdown);

//     await expect(leagueDropdown.locator('.p-dropdown-label'), 'Expected League to clear after changing Feed').toHaveText('League', { timeout: 5000 });
//     await expect(eventDropdown.locator('.p-dropdown-label'), 'Expected Event to clear after changing Feed').toHaveText('Event', { timeout: 5000 });
//     expect(await isDropdownDisabled(marketDropdown), 'Expected Market to become disabled again after changing Feed').toBe(true);
//     expect(await isDropdownDisabled(outcomeDropdown), 'Expected Outcome to become disabled again after changing Feed').toBe(true);

//     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_41-ChangingFeedClearsDependents_success');
//   });

// });

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE BET — BETS PLACED — BETS TABLE, RESET & SIMULATION
// Mirrors TC_15/17–22 (the Settlements-specific "displayed on both screens" cross-check is
// covered from the Settlements side, so it isn't duplicated here).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Simulate Bet - Bets Placed - Bets Table and Simulation', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateBetBetsPlaced(page);
  });

  // // TC_42
  // test('TC-40 Verify the Bets table is displayed on the Bets Placed screen', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await expect(betsTable).toBeVisible({ timeout: 15000 });
  //   await expect(betsTable.locator('text=Bets')).toBeVisible({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_42-BetsTableDisplayed_success');
  // });

  // // TC_43
  // test('TC-41 Verify a bet requires at least one of League, Event, Market or Outcome to be added', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));

  //   // Feed + Sport alone (no League/Event/Market/Outcome) should not be a valid, addable bet.
  //   const addBtn = betsTable.locator('button:has(.pi-plus)').first();
  //   await addBtn.click();

  //   await fillMandatoryBetsPlacedFields(page, page.locator('body'));
  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn, 'Expected Simulate to stay disabled without a valid bet added').toBeDisabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_43-BetRequiresOneOfFourFields_success');
  // });

  // // TC_44
  // test('TC-42 Verify a valid bet can be added and enables Simulate once the form is otherwise complete', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

  //   const addBtn = betsTable.locator('button:has(.pi-plus)').first();
  //   await addBtn.click();
  //   await page.waitForTimeout(300);

  //   await fillMandatoryBetsPlacedFields(page, page.locator('body'));

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn, 'Expected Simulate to enable once a valid bet is added and the form is complete').toBeEnabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_44-ValidBetEnablesSimulate_success');
  // });

  // // TC_45
  // test('TC-43 Verify the Delete button removes a bet from the Bets table', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

  //   const addBtn = betsTable.locator('button:has(.pi-plus)').first();
  //   await addBtn.click();

  //   await fillMandatoryBetsPlacedFields(page, page.locator('body'));
  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

  //   const deleteBtn = betsTable.locator('button:has(.pi-trash)').first();
  //   await deleteBtn.click();

  //   await expect(simulateBtn, 'Expected Simulate to disable again once the only bet is removed').toBeDisabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_45-DeleteBetRemovesFromTable_success');
  // });

  // TC_46
  // Bets table selections (Feed/Sport/League) run BEFORE fillMandatoryBetsPlacedFields — the
  // reverse order was confirmed live to make the Feed dropdown's panel consistently fail to
  // open (likely still settling from the Region Code selection / Wager Amount fill triggered
  // by fillMandatoryBetsPlacedFields). Every other test in this describe block already follows
  // this same bets-table-first order.
  test('TC-44 Verify Reset clears every field', async ({ page }, testInfo) => {
    const betsTable = page.locator('simulate-bets-table');
    const feedDropdown = dropdownByAriaLabel(betsTable, 'Feeds *');
    await selectFirstDropdownOption(page, feedDropdown);
    const sportDropdown = dropdownByAriaLabel(betsTable, 'Sport *');
    await selectFirstDropdownOption(page, sportDropdown);
    const leagueDropdown = dropdownByAriaLabel(betsTable, 'League');
    await selectFirstDropdownOption(page, leagueDropdown);
    await fillMandatoryBetsPlacedFields(page, page.locator('body'));

    const resetBtn = page.locator('button[aria-label="Reset"]').first();
    await resetBtn.click();
    await page.waitForTimeout(300);

    // Pass criterion: every field falls back to its ORIGINAL state (default/placeholder title),
    // no longer holding the entered/selected values.
    const playerAccountId = textInputByLabel(page.locator('body'), 'Enter Player Account Id (Guid) *');
    await expect(playerAccountId, 'Expected Player Account Id to clear').toHaveValue('', { timeout: 5000 });

    const regionCodeDropdown = dropdownByAriaLabel(page.locator('body'), 'Region Code *');
    await expect(regionCodeDropdown.locator('.p-dropdown-label'), 'Expected Region Code to clear back to its placeholder title').toHaveText('Region Code *', { timeout: 5000 });

    // "0" and "" both count as the cleared state — only the entered value must be gone.
    const wagerAmount = fieldGroupByLabel(page.locator('body'), 'Wager Amount *').locator('input.p-inputtext').first();
    await expect(wagerAmount, 'Expected Wager Amount to clear back to its default (0 or empty)').toHaveValue(/^0?$/, { timeout: 5000 });

    const betslipId = textInputByLabel(page.locator('body'), 'Betslip Id *');
    await expect(betslipId, 'Expected Betslip Id to clear').toHaveValue('', { timeout: 5000 });

    await expect(feedDropdown.locator('.p-dropdown-label'), 'Expected Feeds to clear back to its placeholder title').toHaveText('Feeds *', { timeout: 5000 });
    await expect(sportDropdown.locator('.p-dropdown-label'), 'Expected Sport to clear back to its placeholder title').toHaveText('Sport *', { timeout: 5000 });
    await expect(leagueDropdown.locator('.p-dropdown-label'), 'Expected League to clear back to its placeholder title').toHaveText('League', { timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_46-ResetClearsAllFields_success');
  });

  // // TC_47
  // test('TC-45 Verify a successful simulation shows a confirmation toast', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

  //   const addBtn = betsTable.locator('button:has(.pi-plus)').first();
  //   await addBtn.click();

  //   await fillMandatoryBetsPlacedFields(page, page.locator('body'));

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_47-Simulate_filled');

  //   await simulateBtn.click();
  //   await page.waitForLoadState('networkidle');

  //   const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
  //   await expect(successToast, 'Expected a success toast confirming the simulation ran').toBeVisible({ timeout: 15000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_47-Simulate_success');
  // });

  // // TC_48
  // // Verifies Feed/Sport are excluded from the outgoing simulation request body — see TC_22's
  // // explanation for why this scans all POST bodies rather than targeting one known endpoint.
  // test('TC-46 Verify Feed and Sport values are not sent to the backend', async ({ page }, testInfo) => {
  //   const betsTable = page.locator('simulate-bets-table');
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Feeds *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'Sport *'));
  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(betsTable, 'League'));

  //   const addBtn = betsTable.locator('button:has(.pi-plus)').first();
  //   await addBtn.click();

  //   await fillMandatoryBetsPlacedFields(page, page.locator('body'));

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

  //   const capturedBodies: string[] = [];
  //   page.on('request', (request) => {
  //     if (request.method() === 'POST') {
  //       const body = request.postData();
  //       if (body) capturedBodies.push(body);
  //     }
  //   });

  //   await simulateBtn.click();
  //   await page.waitForLoadState('networkidle');

  //   const relevantBody = capturedBodies.find((b) => /bet|simulat/i.test(b));
  //   if (relevantBody) {
  //     expect(relevantBody, 'Expected the simulation request body not to include a "feed" key').not.toMatch(/"feed"\s*:/i);
  //     expect(relevantBody, 'Expected the simulation request body not to include a "sport" key').not.toMatch(/"sport"\s*:/i);
  //   }

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_48-FeedSportNotSentToBackend_success');
  // });

});

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATE BET — BULK BETS PLACED
// Toggle confirmed as the same [role="button"][aria-label="Bulk"] used for Bulk Settlements —
// switchToBulkTab() is reused as-is. Fields confirmed: Amount To Simulate (InputNumber — defaults
// to "1" here, the SAME default Bulk Settlements' Amount To Simulate uses (confirmed by the
// user)) and Region (dropdown) — only 2
// mandatory fields, no Settlement Status. Reset/Simulate share the same aria-labels as everywhere
// else in this app.
// NOTE: no new max limit was given for this field — TC_50/51 assume it's the same documented max
// (100,000,000,000,000,000,000) as Bulk Settlements' Amount To Simulate, since it's presumably
// the same shared field component. Unconfirmed for this specific tab.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Simulate Bet - Bulk Bets Placed', () => {

  test.beforeEach(async ({ page }) => {
    await navigateToSimulateBetBetsPlaced(page);
    await switchToBulkTab(page);
  });

  // // TC_49
  // test('TC-47 Verify Bulk Bets Placed screen opens with all fields', async ({ page }, testInfo) => {
  //   await expect(page.locator('text=Amount To Simulate *')).toBeVisible({ timeout: 15000 });
  //   await expect(dropdownByAriaLabel(page.locator('body'), 'Region *')).toBeVisible({ timeout: 10000 });
  //   await expect(page.locator('button[aria-label="Simulate"]')).toBeVisible({ timeout: 10000 });
  //   await expect(page.locator('button[aria-label="Reset"]')).toBeVisible({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_49-BulkBetsPlacedScreenOpens_success');
  // });

  // // TC_50
  // test('TC-48 Verify Simulate button stays disabled with all Bulk Bets Placed mandatory fields blank', async ({ page }, testInfo) => {
  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn, 'Expected Simulate to remain disabled with all Bulk fields blank').toBeDisabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_50-BulkBetsPlacedMandatoryFieldsBlank_success');
  // });

  // // TC_51
  // // Mirrors the corrected Bulk Settlements TC_25: the field accepts a value above the max rather
  // // than clamping it, so the app must block the over-max value some other way — either Simulate
  // // stays disabled, or a red inline error appears below the field.
  // test('TC-49 Verify Amount To Simulate rejects a value above its maximum limit', async ({ page }, testInfo) => {
  //   const overMax = '1000000000000000000000'; // one digit beyond the assumed max of 100,000,000,000,000,000,000

  //   const amountGroup = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *');
  //   const amountInput = amountGroup.locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, overMax);
  //   await page.keyboard.press('Tab');

  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_51-AmountToSimulateOverMax_filled');

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   const simulateDisabled = await simulateBtn.isDisabled().catch(() => false);
  //   const inlineError = amountGroup.locator('small.p-error');
  //   const errorVisible = await inlineError.isVisible({ timeout: 5000 }).catch(() => false);

  //   expect(
  //     simulateDisabled || errorVisible,
  //     'Expected either Simulate to stay disabled or a red validation message below Amount To Simulate when the value exceeds the max'
  //   ).toBe(true);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_51-AmountToSimulateMaxValidation_success');
  // });

  // // TC_52
  // test('TC-50 Verify Amount To Simulate accepts its maximum limit exactly', async ({ page }, testInfo) => {
  //   const maxValue = '100000000000000000000';

  //   const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, maxValue);

  //   const value = (await amountInput.inputValue()).replace(/[^\d]/g, '');
  //   expect(value, `Expected Amount To Simulate to accept exactly ${maxValue}`).toBe(maxValue);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_52-AmountToSimulateAcceptsMax_success');
  // });

  // // TC_53
  // test('TC-51 Verify a successful Bulk Bets Placed simulation shows a confirmation toast', async ({ page }, testInfo) => {
  //   const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
  //   await fillNumberField(amountInput, '1000');

  //   await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

  //   const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
  //   await expect(simulateBtn).toBeEnabled({ timeout: 10000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_53-BulkBetsPlacedSimulate_filled');

  //   // Bulk simulation processes many bets server-side and can take noticeably longer than a
  //   // single simulation — give both the network settle and the toast a much longer window.
  //   await simulateBtn.click();
  //   await page.waitForLoadState('networkidle', { timeout: 60000 });

  //   const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
  //   await expect(successToast, 'Expected a success toast confirming the bulk simulation ran').toBeVisible({ timeout: 60000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_53-BulkBetsPlacedSimulate_success');
  // });

  // TC_54
  test('TC-52 Verify Reset clears every Bulk Bets Placed field', async ({ page }, testInfo) => {
    const amountInput = fieldGroupByLabel(page.locator('body'), 'Amount To Simulate *').locator('input.p-inputtext').first();
    await fillNumberField(amountInput, '1000');
    await selectFirstDropdownOption(page, dropdownByAriaLabel(page.locator('body'), 'Region *'));

    const resetBtn = page.locator('button[aria-label="Reset"]').first();
    await resetBtn.click();
    await page.waitForTimeout(300);

    // Amount To Simulate defaults to "1" here (confirmed from the initial page markup) — unlike
    // Bulk Settlements' Amount To Simulate, which defaults to "0" — so Reset should revert to
    // "1", not "0" or an empty string.
    await expect(amountInput, 'Expected Amount To Simulate to reset to its default of 1').toHaveValue('1', { timeout: 5000 });

    const regionDropdown = dropdownByAriaLabel(page.locator('body'), 'Region *');
    await expect(regionDropdown.locator('.p-dropdown-label'), 'Expected Region to clear back to its placeholder').toHaveText('Region *', { timeout: 5000 });

    const simulateBtn = page.locator('button[aria-label="Simulate"]').first();
    await expect(simulateBtn, 'Expected Simulate to be disabled again after Reset').toBeDisabled({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_54-BulkBetsPlacedResetClearsAllFields_success');
  });

});
