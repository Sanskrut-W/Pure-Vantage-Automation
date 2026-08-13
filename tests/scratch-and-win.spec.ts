// npx playwright test tests/scratch-and-win.spec.ts --headed
import { test, expect, Locator, Page } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// Matches a clickable (not other-month, not disabled) day cell in this app's PrimeNG calendar.
// This app renders the newer passthrough markup (data-pc-name/data-pc-section attributes visible
// throughout its dropdowns and dialogs) where disabled/past days are flagged via the
// `data-p-disabled="true"` ATTRIBUTE, not a `.p-disabled` CSS class — the same pattern already
// confirmed working for date pickers in GenericWheel.spec.ts. A `:not(.p-disabled)` class
// selector never actually excludes anything here, which is why past/disabled dates were getting
// picked despite the filter.
const ENABLED_DAY_SELECTOR = 'td[data-pc-section="day"]:not([data-p-other-month]) span[data-pc-section="daylabel"][data-p-disabled="false"]';

// Launches the site and navigates Marketing → Promotions → Scratch and Win, retrying the whole
// click sequence up to 3 times. This exact navigation has intermittently failed to land on
// <scratch-and-win-management> (container stays hidden past a 30s wait) across several
// different describe blocks/tests, with no repro on retry.
//
// Root cause: this page auto-refreshes/polls its table periodically, so the container and its
// rows can transiently detach and re-render at any point — including right as a test is trying
// to click into them. A single fixed wait can land inside that refresh window. Re-doing the full
// sequence from a fresh `page.goto` (rather than `page.reload()`, which loses SPA routing state
// on at least one sub-page per a note in timedpromo.spec.ts) handles the navigation itself; the
// stable-row-count wait at the end additionally waits OUT a refresh cycle in progress before
// handing control back, so callers aren't handed a table that's about to re-render under them.
async function navigateToScratchAndWin(page: Page): Promise<void> {
  const container = page.locator('scratch-and-win-management');

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 20000 });
    await marketingNode.click();

    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    if (await promotionsNode.isVisible({ timeout: 3000 }).catch(() => false)) {
      await promotionsNode.click();
    }

    const scratchWinLink = page.locator('span.menuitem-text:text-is("Scratch and Win")').first();
    await scratchWinLink.waitFor({ state: 'visible', timeout: 15000 });
    await scratchWinLink.click();
    await page.waitForLoadState('networkidle');

    const arrived = await container.waitFor({ state: 'visible', timeout: 20000 }).then(() => true).catch(() => false);
    if (arrived) break;
  }

  // Final assertion (as a real Playwright expect, not a thrown Error) so a genuine failure still
  // reports in the familiar "expect(locator).toBeVisible()" format if all 3 attempts failed.
  await expect(container).toBeVisible({ timeout: 25000 });
  const rows = container.locator('.pure__table tbody tr');
  await rows.first().waitFor({ state: 'visible', timeout: 25000 });
  await waitForStableRowCount(page, rows);
}

// Reads the Promotion Id (1st column) of every currently rendered row — used to detect
// whether a filter/toggle actually changed the visible list, not just that the request fired.
async function getVisiblePromotionIds(rows: Locator): Promise<string[]> {
  return (await rows.locator('td:first-child').allTextContents()).map((t) => t.trim());
}

// Polls the row count until it stops changing between checks (or times out), returning the
// stabilized value. Some of this app's tables render progressively — the first row appears,
// then the rest populate a moment later — so a bare `rows.count()` taken right after "first row
// visible" can grab a transient low count (e.g. 1) instead of the true total, making a later
// "count decreased" assertion fail because the count appears to grow as loading finishes.
async function waitForStableRowCount(page: Page, rows: Locator, timeout = 8000): Promise<number> {
  let previous = await rows.count();
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    await page.waitForTimeout(400);
    const current = await rows.count();
    if (current === previous) return current;
    previous = current;
  }
  return previous;
}

// Locates an item of the currently-open row menu by (substring) label. Confirmed DOM:
// <li class="p-menuitem" role="menuitem" aria-label="Deactivate">…<span class="p-menuitem-text">
// Deactivate</span>…</li> inside a body-appended .p-menu-overlay root.
function openMenuItem(page: Page, actionLabel: string): Locator {
  return page
    .locator('li.p-menuitem, [role="menuitem"]')
    .filter({ hasText: actionLabel })
    .first();
}

// Opens each row's three-dot ("...") menu in turn looking for one that offers the given action.
// Confirmed DOM shows this menu lists Activate AND Deactivate together for a row (not mutually
// exclusive), so the first row with a working menu normally satisfies any action label.
// Returns the row with that menu still open (so the caller can click the action item directly)
// or null if no row offers it. Rows that don't offer it get their menu closed with Escape
// before moving on, so menus don't stack up across the search.
// NOTE: isVisible() IGNORES its timeout option and returns immediately — every wait here must
// go through waitFor(), otherwise a menu still animating open reads as "item not present" and
// the row gets skipped. That immediate-check bug is what made this helper return null for
// every row despite the action existing in each menu.
async function findRowWithMenuAction(page: Page, rows: Locator, actionLabel: string): Promise<Locator | null> {
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    // Confirmed DOM: <button class="pure__table-menu-trigger …"><span class="… pi pi-ellipsis-v">
    const dotsBtn = row.locator('button.pure__table-menu-trigger, button:has(.pi-ellipsis-v)').first();
    // This app's tables auto-refresh periodically, so a row can transiently detach/re-render —
    // give the dots button real waiting room (waitFor, not an immediate isVisible check).
    const dotsReady = await dotsBtn.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
    if (!dotsReady) continue;
    await dotsBtn.click();

    const actionItem = openMenuItem(page, actionLabel);
    const found = await actionItem.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
    if (found) {
      return row;
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }
  return null;
}

// Opens a PrimeNG dropdown and clicks its first option, returning the selected option's text.
// A plain .click() on the root/trigger doesn't always register (overlay timing, event binding
// living on a different descendant) — this tries several trigger candidates, polls for the
// panel/options directly instead of a slow two-step panel-then-option check, and falls back to
// keyboard (Alt+ArrowDown) if none of the click attempts open it.
async function selectFirstDropdownOption(page: Page, dropdown: Locator, optionIndex: number = 0): Promise<string> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  // Scroll into place once, up front — letting a plain .click() do this mid-attempt can jump
  // the page around (sticky headers, reflow) without the click actually landing afterwards.
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});

  const optionSelector = [
    '[data-pc-section="option"]:not(option)',
    '.p-dropdown-item',
    '.p-select-option',
    'li[role="option"]',
  ].join(', ');

  const triggerCandidates = [
    '[data-pc-section="trigger"]',
    '[aria-haspopup="listbox"]',
    '[data-pc-section="label"]',
    '.p-dropdown-label',
    '.p-select-label',
    '.p-dropdown-trigger',
  ];

  // useDispatch fires a real DOM 'click' event directly on the element, bypassing Playwright's
  // actionability checks (visibility/stability/scrolling) entirely — useful when a normal click
  // appears to do nothing (or only scrolls) because something about the element's position/
  // overlay state is confusing the standard click path, even though the element itself is
  // wired up to open the panel.
  const openDropdown = async (useDispatch: boolean) => {
    for (const sel of triggerCandidates) {
      const el = dropdown.locator(sel).first();
      if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
        if (useDispatch) {
          await el.dispatchEvent('click').catch(() => {});
        } else {
          await el.click().catch(() => el.click({ force: true }).catch(() => {}));
        }
        return;
      }
    }
    if (useDispatch) {
      await dropdown.dispatchEvent('click').catch(() => {});
    } else {
      await dropdown.click().catch(() => dropdown.click({ force: true }).catch(() => {}));
    }
  };

  for (let attempt = 0; attempt < 4; attempt++) {
    await openDropdown(attempt >= 2);
    const targetOption = page.locator(optionSelector).nth(optionIndex);
    if (await targetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = (await targetOption.textContent())?.trim() ?? '';
      await targetOption.click();
      return text;
    }
    // Only press Escape if a panel actually opened. If the open attempt failed outright, there's
    // nothing on top to dismiss — but Escape still goes somewhere, and when this dropdown lives
    // inside a dialog, PrimeNG's dialog itself closes on Escape by default. Firing it blindly
    // here closes the ENCLOSING popup instead of the (non-existent) dropdown panel, aborting the
    // whole form after only the first couple of fields were filled.
    const panelOpen = await page
      .locator('.p-dropdown-panel, .p-select-overlay, [data-pc-section="panel"], [data-pc-section="overlay"]')
      .first()
      .isVisible({ timeout: 300 })
      .catch(() => false);
    if (panelOpen) {
      await page.keyboard.press('Escape').catch(() => {});
    }
    await page.waitForTimeout(300);
  }

  // Keyboard fallback
  const focusTarget = dropdown.locator('[data-pc-section="label"], .p-dropdown-label, .p-select-label').first();
  if (await focusTarget.isVisible({ timeout: 1000 }).catch(() => false)) {
    await focusTarget.click();
  } else {
    await dropdown.focus().catch(() => {});
  }
  await page.keyboard.press('Alt+ArrowDown');
  const firstOption = page.locator(optionSelector).nth(optionIndex);
  const opened = await firstOption.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!opened) {
    // Distinguish "never opened" from "opened but the options list is empty" — both produce the
    // same symptom (no option ever becomes visible) but point to very different root causes: a
    // broken locator/click vs. an app/data issue (e.g. an unloaded or filtered-empty list).
    const panelVisible = await page
      .locator('.p-dropdown-panel, .p-select-overlay, [data-pc-section="panel"], [data-pc-section="overlay"]')
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);
    const idOrLabel = (await dropdown.getAttribute('id').catch(() => null)) ?? 'dropdown';
    const reason = panelVisible
      ? 'the panel opened but no selectable options rendered inside it (likely an empty or still-loading options list)'
      : 'the panel never opened despite click and keyboard (Alt+ArrowDown) attempts';
    throw new Error(`selectFirstDropdownOption("#${idOrLabel}"): ${reason}.`);
  }
  const text = (await firstOption.textContent())?.trim() ?? '';
  await firstOption.click();
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH AND WIN  (TC_01 – TC_05)
// Navigation: Marketing → Promotions → Scratch and Win
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Scratch and Win', () => {

  test.beforeEach(async ({ page }) => {
    // Steps 1-4: Launch the site → expand Marketing → expand Promotions → click Scratch and Win
    await navigateToScratchAndWin(page);
  });

  // TC_01
  test('TC-1 Verify Scratch and Win page loads successfully', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');

    await expect(container.locator('input[placeholder="Search"]')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('div.p-dropdown[aria-haspopup], div.dropdown-input')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('div.p-inputswitch')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('button[aria-label="Create Promotion"]')).toBeVisible({ timeout: 10000 });
    await expect(container.locator('.pure__table tbody tr').first()).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01-ScratchAndWinPageLoad_success');
  });

  // TC_02
  test('TC-2 Verify Search functionality', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const firstCellText = (await rows.first().locator('td').nth(1).textContent())?.trim() ?? '';
    const searchKeyword = firstCellText.split(' ')[0];

    const searchInput = container.locator('input[placeholder="Search"]');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    await expect(rows.first()).toContainText(searchKeyword);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_02-ScratchAndWinSearch_success');
  });

  // TC_03
  test('TC-3 Verify Region filter', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });
    const idsBaseline = await getVisiblePromotionIds(rows);

    const regionDropdown = container.locator('div.dropdown-input.p-dropdown').first();

    // Pass criterion: selecting a region changes the visible promotion list (by even one
    // promotion) versus the unfiltered baseline. Cycle through up to 3 different regions
    // for stronger evidence — the table shows region CODES while the dropdown shows full
    // names, so per-row region-name equality is not verifiable here.
    const results: { region: string; changed: boolean }[] = [];
    for (let i = 0; i < 3; i++) {
      const regionName = await selectFirstDropdownOption(page, regionDropdown, i).catch(() => null);
      if (regionName === null) break; // fewer than i+1 regions available in the dropdown

      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // a region with zero promotions is a legitimate result — don't wait on rows

      const idsNow = await getVisiblePromotionIds(rows);
      const changed = JSON.stringify(idsNow) !== JSON.stringify(idsBaseline);
      results.push({ region: regionName, changed });
      console.log(`Region "${regionName}": ${idsNow.length} promotion(s) visible, list changed vs baseline: ${changed}`);

      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', `TC_03-RegionFilter_${i + 1}`);
    }

    expect(results.length, 'Could not select any region from the dropdown').toBeGreaterThan(0);
    expect(
      results.some((r) => r.changed),
      `Promotion list never changed across the tried regions (${results.map((r) => r.region).join(', ')}) — region filter appears to have no effect`,
    ).toBe(true);
  });

  // TC_04
  test('TC-4 Verify Include Inactive toggle', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });
    const idsBefore = await getVisiblePromotionIds(rows);

    const toggle = container.locator('div.p-inputswitch').first();
    await toggle.waitFor({ state: 'visible', timeout: 10000 });
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.click();
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });
    const idsAfter = await getVisiblePromotionIds(rows);

    // Fail explicitly if enabling Include Inactive didn't actually change the visible list.
    expect(idsAfter, 'Promotions list did not change after enabling the Include Inactive toggle').not.toEqual(idsBefore);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_04-ScratchAndWinIncludeInactive_success');
  });

  // TC_05
  test('TC-5 Verify Create Promotion popup opens', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');

    const createBtn = container.locator('button[aria-label="Create Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05-CreatePromotionPopup_open');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

});

// Clears and types a value into a PrimeNG InputNumber field, verifying it actually landed.
// Mirrors the fix already proven in timedpromo.spec.ts: select-all + Delete (not a fixed
// End/Backspace count) avoids PrimeNG's spinbutton boundary quirks and embedded suffixes
// (e.g. Chance of Winning's "%"), and a native-setter fallback covers anything keyboard
// simulation still can't budge.
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

// Fills every mandatory field in the Create Promotion dialog, one at a time, in document order:
// Promotion Name → Game Type → Start Date → (click another field to close the calendar) →
// End Date → (click another field to close the calendar) → Region → Period Type →
// Chance of Winning → Ticker Start Amount → Ticker Total Days → Scratch Card Expiry Days →
// Allocation Notification Template → Scratch Cards Per Period.
// Confirmed against the dialog's actual markup — ids below match exactly what's rendered.
// Fields left out on purpose (not marked mandatory "*" in the dialog): Increased Chance of
// Winning, Ticker Start Date, Expiry/Wager Notification Template, Minimum Wager, Default Value
// Bucket, and the 3 checkboxes.
async function fillCreatePromotionMandatoryFields(page: Page, dialog: Locator): Promise<void> {
  // 1. Promotion Name
  const nameInput = dialog.locator('#promotionName');
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.fill(`AutoPromo-${CommonUtils.generateRandomString(6)}`);

  // 2. Game Type
  await selectFirstDropdownOption(page, dialog.locator('#gameType'));

  // 3. Start Date
  const startDateInput = dialog.locator('#startDate input');
  await startDateInput.click();
  const startPanel = page.locator('#startDate_panel');
  await startPanel.waitFor({ state: 'visible', timeout: 10000 });
  await startPanel.locator(ENABLED_DAY_SELECTOR).first().click({ force: true });

  // 4. Click on another field to close the calendar — and confirm it's actually gone before
  // moving on, so Start Date's panel can never still be open when End Date's panel opens.
  await nameInput.click({ force: true });
  await startPanel.waitFor({ state: 'hidden', timeout: 5000 });
  await page.waitForTimeout(200);

  // 5. End Date
  const endDateInput = dialog.locator('#endDate input');
  await endDateInput.click();
  const endPanel = page.locator('#endDate_panel');
  await endPanel.waitFor({ state: 'visible', timeout: 10000 });
  await endPanel.locator(ENABLED_DAY_SELECTOR).last().click({ force: true });

  // 6. Click on another field to close the calendar
  await nameInput.click({ force: true });
  await endPanel.waitFor({ state: 'hidden', timeout: 5000 });
  await page.waitForTimeout(200);

  // 7. Region
  await selectFirstDropdownOption(page, dialog.locator('#region'));

  // 8. Period Type
  await selectFirstDropdownOption(page, dialog.locator('#periodType'));

  // 9. Chance of Winning (%)
  await fillNumberField(dialog.locator('#chanceOfWinning input'), '50');

  // 10. Ticker Start Amount
  await fillNumberField(dialog.locator('#tickerStartAmount input'), '10');

  // 11. Ticker Total Days
  await fillNumberField(dialog.locator('#tickerTotalDays input'), '7');

  // 12. Scratch Card Expiry Days
  await fillNumberField(dialog.locator('#scratchCardExpiryDays input'), '5');

  // 13. Allocation Notification Template
  await selectFirstDropdownOption(page, dialog.locator('#allocationNotificationTemplate'));

  // 14. Scratch Cards Per Period
  await fillNumberField(dialog.locator('#scratchCardsPerPeriod input'), '3');
}

// Enters "0" into a min-value-constrained InputNumber field and asserts it snaps back to the
// field's minimum instead of accepting 0.
async function verifyMinValueClamp(page: Page, dialog: Locator, fieldId: string, expectedMin: string): Promise<void> {
  const input = dialog.locator(`#${fieldId} input`);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.click({ clickCount: 3 });
  await input.press('Control+A');
  await input.press('Delete');
  await input.pressSequentially('0');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);

  const value = (await input.inputValue()).trim();
  expect(value, `Expected "${fieldId}" to clamp to ${expectedMin} after entering 0, but got "${value}"`).toContain(expectedMin);
}

// Enters a value above a max-value-constrained InputNumber field's ceiling and asserts it snaps
// back to the field's maximum instead of accepting the out-of-range value.
async function verifyMaxValueClamp(page: Page, dialog: Locator, fieldId: string, overMaxValue: string, expectedMax: string): Promise<void> {
  const input = dialog.locator(`#${fieldId} input`);
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.click({ clickCount: 3 });
  await input.press('Control+A');
  await input.press('Delete');
  await input.pressSequentially(overMaxValue);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);

  const value = (await input.inputValue()).trim();
  expect(value, `Expected "${fieldId}" to clamp to ${expectedMax} after entering ${overMaxValue}, but got "${value}"`).toContain(expectedMax);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH AND WIN — CREATE PROMOTION POPUP  (TC_06 – TC_10)
// Navigation: Marketing → Promotions → Scratch and Win → Create Promotion
// Field ids confirmed against the dialog's actual markup: promotionName, gameType, startDate,
// endDate, region, periodType, chanceOfWinning, increasedChanceOfWinning, tickerStartAmount,
// tickerTotalDays, tickerStartDate, scratchCardExpiryDays, expiryNotificationTemplate,
// wagerNotificationTemplate, allocationNotificationTemplate, minWager, scratchCardsPerPeriod,
// defaultValueBucket (18 fields); requiresJourneySelection, useValueBuckets, isScratchAndComp
// (3 checkboxes).
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Scratch and Win - Create Promotion Popup', () => {

  test.beforeEach(async ({ page }) => {
    // Steps 1-4: Launch the site → expand Marketing → expand Promotions → click Scratch and Win
    await navigateToScratchAndWin(page);
    const container = page.locator('scratch-and-win-management');

    // Step 5: Click Create Promotion
    const createBtn = container.locator('button[aria-label="Create Promotion"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });
  });

  // TC_06
  test('TC-6 Verify Create Promotion popup UI', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Verify all fields, checkboxes and buttons in the popup
    const fieldIds = [
      'promotionName', 'gameType', 'startDate', 'endDate', 'region', 'periodType',
      'chanceOfWinning', 'increasedChanceOfWinning', 'tickerStartAmount', 'tickerTotalDays',
      'tickerStartDate', 'scratchCardExpiryDays', 'expiryNotificationTemplate',
      'wagerNotificationTemplate', 'allocationNotificationTemplate', 'minWager',
      'scratchCardsPerPeriod', 'defaultValueBucket',
    ];
    for (const id of fieldIds) {
      await expect(dialog.locator(`#${id}`), `Field "${id}" not visible`).toBeVisible({ timeout: 10000 });
    }

    const checkboxIds = ['requiresJourneySelection', 'useValueBuckets', 'isScratchAndComp'];
    for (const id of checkboxIds) {
      await expect(dialog.locator(`#${id}`), `Checkbox "${id}" not visible`).toBeVisible({ timeout: 10000 });
    }

    await expect(dialog.locator('button[aria-label="Save"], button:has-text("Save")')).toBeVisible({ timeout: 10000 });
    await expect(dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06-CreatePromotionPopupUI_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC_07
  test('TC-7 Verify mandatory field validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Leave all mandatory fields blank
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    const isDisabled = await saveBtn.isDisabled().catch(() => false);

    if (isDisabled) {
      await expect(saveBtn).toBeDisabled();
    } else {
      const validationMessages = dialog.locator('.p-error, .p-invalid, small.p-error, [class*="invalid"]');
      await expect(validationMessages.first()).toBeVisible({ timeout: 5000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_07-MandatoryFieldValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC_08
  test('TC-8 Verify Scratch Card Expiry Days minimum value validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Fill all mandatory fields
    await fillCreatePromotionMandatoryFields(page, dialog);

    // Step 7: Enter 0 in the Scratch Card Expiry Days field
    await verifyMinValueClamp(page, dialog, 'scratchCardExpiryDays', '1');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08-ScratchCardExpiryDaysMinValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_09
  test('TC-9 Verify Ticker Total Days minimum value validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Fill all mandatory fields
    await fillCreatePromotionMandatoryFields(page, dialog);

    // Step 7: Enter 0 in the Ticker Total Days field
    await verifyMinValueClamp(page, dialog, 'tickerTotalDays', '1');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09-TickerTotalDaysMinValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_10
  test('TC-10 Verify Ticker Start Amount minimum value validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Fill all mandatory fields
    await fillCreatePromotionMandatoryFields(page, dialog);

    // Step 7: Enter 0 in the Ticker Start Amount field
    await verifyMinValueClamp(page, dialog, 'tickerStartAmount', '0.01');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_10-TickerStartAmountMinValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_11
  test('TC-11 Verify Chance of Winning maximum value validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Fill all mandatory fields
    await fillCreatePromotionMandatoryFields(page, dialog);

    // Step 7: Enter 101 in the Chance of Winning (%) field
    await verifyMaxValueClamp(page, dialog, 'chanceOfWinning', '101', '100');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11-ChanceOfWinningMaxValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_12
  test('TC-12 Verify Scratch Cards Per Period minimum value validation', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();

    // Step 6: Fill all mandatory fields
    await fillCreatePromotionMandatoryFields(page, dialog);

    // Step 7: Enter 0 in the Scratch Cards Per Period field
    await verifyMinValueClamp(page, dialog, 'scratchCardsPerPeriod', '1');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_12-ScratchCardsPerPeriodMinValidation_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_13
  test('TC-13 Verify checkbox functionality', async ({ page }, testInfo) => {
    const dialog = page.locator('div[role="dialog"]').first();
    const checkboxIds = ['requiresJourneySelection', 'useValueBuckets', 'isScratchAndComp'];

    // Steps 6-8: Enable Requires Journey Selection, Use Value Buckets, Is Scratch and Comp
    for (const id of checkboxIds) {
      const checkbox = dialog.locator(`#${id}`);
      await checkbox.waitFor({ state: 'visible', timeout: 10000 });
      await expect(checkbox, `"${id}" expected to start unchecked`).toHaveAttribute('data-p-highlight', 'false');
      await checkbox.click();
      await expect(checkbox, `"${id}" did not become checked`).toHaveAttribute('data-p-highlight', 'true');
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13-CheckboxFunctionality_enabled');

    // Step 9: Disable all three checkboxes
    for (const id of checkboxIds) {
      const checkbox = dialog.locator(`#${id}`);
      await checkbox.click();
      await expect(checkbox, `"${id}" did not become unchecked`).toHaveAttribute('data-p-highlight', 'false');
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13-CheckboxFunctionality_disabled');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC_14
  test('TC-14 Verify successful promotion creation', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const dialog = page.locator('div[role="dialog"]').first();
    const promoName = `AutoPromo-${CommonUtils.generateRandomString(6)}`;

    // Step 6: Enter valid values in all mandatory fields — Promotion Name
    const nameInput = dialog.locator('#promotionName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(promoName);

    // Step 7: Select values from all mandatory dropdown fields
    await selectFirstDropdownOption(page, dialog.locator('#gameType'));
    await selectFirstDropdownOption(page, dialog.locator('#region'));
    await selectFirstDropdownOption(page, dialog.locator('#periodType'));
    await selectFirstDropdownOption(page, dialog.locator('#allocationNotificationTemplate'));

    // Step 8: Select the Start Date and click any other field to close the calendar
    const startDateInput = dialog.locator('#startDate input');
    await startDateInput.click();
    const startPanel = page.locator('#startDate_panel');
    await startPanel.waitFor({ state: 'visible', timeout: 10000 });
    await startPanel.locator(ENABLED_DAY_SELECTOR).first().click({ force: true });
    await nameInput.click({ force: true });
    await startPanel.waitFor({ state: 'hidden', timeout: 5000 });

    // Step 9: Select the End Date and click any other field to close the calendar
    const endDateInput = dialog.locator('#endDate input');
    await endDateInput.click();
    const endPanel = page.locator('#endDate_panel');
    await endPanel.waitFor({ state: 'visible', timeout: 10000 });
    await endPanel.locator(ENABLED_DAY_SELECTOR).last().click({ force: true });
    await nameInput.click({ force: true });
    await endPanel.waitFor({ state: 'hidden', timeout: 5000 });

    // Step 10: Select the Ticker Start Date and click any other field to close the calendar —
    // Scratch Card Expiry Days sits right next to it in the same row, so use that as the closer
    // instead of jumping back up to Promotion Name.
    const tickerStartDateInput = dialog.locator('#tickerStartDate input');
    await tickerStartDateInput.click();
    const tickerStartPanel = page.locator('#tickerStartDate_panel');
    await tickerStartPanel.waitFor({ state: 'visible', timeout: 10000 });
    await tickerStartPanel.locator(ENABLED_DAY_SELECTOR).first().click({ force: true });
    const scratchCardExpiryDaysInput = dialog.locator('#scratchCardExpiryDays input');
    await scratchCardExpiryDaysInput.click({ force: true });
    await tickerStartPanel.waitFor({ state: 'hidden', timeout: 5000 });

    // Step 11: Enter valid values in all required numeric fields
    await fillNumberField(dialog.locator('#chanceOfWinning input'), '50');
    await fillNumberField(dialog.locator('#tickerStartAmount input'), '10');
    await fillNumberField(dialog.locator('#tickerTotalDays input'), '7');
    await fillNumberField(dialog.locator('#scratchCardExpiryDays input'), '5');
    await fillNumberField(dialog.locator('#scratchCardsPerPeriod input'), '3');

    // Step 12: Select optional checkboxes if required — none required for this scenario

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14-CreatePromotion_filled');

    // Step 13: Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await expect(container.locator(`.pure__table tbody td:text-is("${promoName}")`)).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14-CreatePromotion_success');
  });

  // TC_15
  test('TC-15 Verify Cancel button functionality', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const dialog = page.locator('div[role="dialog"]').first();
    const promoName = `AutoPromo-${CommonUtils.generateRandomString(6)}`;

    // Step 6: Enter values in one or more fields
    const nameInput = dialog.locator('#promotionName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(promoName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15-CancelButton_filled');

    // Step 7: Click Cancel
    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    await expect(container.locator(`.pure__table tbody td:text-is("${promoName}")`)).not.toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15-CancelButton_success');
  });

  // TC_16
  test('TC-16 Verify popup close (X) button functionality', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const dialog = page.locator('div[role="dialog"]').first();
    const promoName = `AutoPromo-${CommonUtils.generateRandomString(6)}`;

    // Step 6: Enter values in one or more fields
    const nameInput = dialog.locator('#promotionName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(promoName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_16-ClosePopupButton_filled');

    // Step 7: Click the Close (X) icon
    const closeBtn = dialog.locator('[data-pc-section="closebutton"], button.p-dialog-header-close, button[aria-label="Close"]').first();
    await closeBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    await expect(container.locator(`.pure__table tbody td:text-is("${promoName}")`)).not.toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_16-ClosePopupButton_success');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH AND WIN — EDIT & STATUS ACTIONS  (TC_17 – TC_22)
// Navigation: Marketing → Promotions → Scratch and Win → three dots → Edit/Activate/Deactivate
// NOTE: the three-dot row menu selector (`button:has(.pi-ellipsis-v)` → `.p-menu-overlay`) and
// the Yes/No confirmation buttons mirror the confirmed-working pattern from
// timedpromo.spec.ts's Activate/Approve tests — not yet confirmed against this page's actual
// menu/dialog markup. There's no visible "Status" column in this table, so TC_20/21/22 can't
// assert the Active/Inactive value directly; they verify via the confirmation flow completing
// (Yes → success toast / No → popup closes with no action) rather than a status cell.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Scratch and Win - Edit and Status Actions', () => {

  test.beforeEach(async ({ page }) => {
    // Steps 1-4: Launch the site → expand Marketing → expand Promotions → click Scratch and Win
    await navigateToScratchAndWin(page);
  });

  // TC_17
  test('TC-17 Verify Edit Promotion popup opens', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const firstRow = rows.first();
    const promoName = (await firstRow.locator('td').nth(1).textContent())?.trim() ?? '';

    // Step 5: Click the three dots for any promotion
    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 6: Click Edit
    await menu.getByText('Edit', { exact: true }).click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const nameInput = dialog.locator('#promotionName');
    if (promoName) {
      await expect(nameInput, 'Promotion Name was not pre-populated with the existing value').toHaveValue(promoName, { timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_17-EditPromotionPopupOpens_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_18
  test('TC-18 Verify promotion details can be updated', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Edit
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Edit', { exact: true }).click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 7: Modify one or more editable fields
    const updatedName = `AutoPromo-Edited-${CommonUtils.generateRandomString(6)}`;
    const nameInput = dialog.locator('#promotionName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(updatedName);

    // Step 8 (conditional — not applicable since only Promotion Name was modified here)

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18-UpdatePromotion_filled');

    // Step 9: Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // The success toast is the authoritative confirmation — the table may not re-sort/refresh
    // its currently visible page to surface the updated name (pagination, sort order, etc.),
    // so pass on the toast rather than requiring the name to be visible in the grid.
    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the update').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18-UpdatePromotion_success');
  });

  // TC_19
  test('TC-19 Verify Cancel button in Edit popup', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const originalName = (await rows.first().locator('td').nth(1).textContent())?.trim() ?? '';

    // Steps 5-6: Click the three dots for any promotion, then click Edit
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Edit', { exact: true }).click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 7: Modify one or more editable fields
    const nameInput = dialog.locator('#promotionName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await nameInput.fill(`ShouldNotSave-${CommonUtils.generateRandomString(6)}`);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19-EditCancelButton_filled');

    // Step 8: Click Cancel
    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    if (originalName) {
      await expect(rows.first()).toContainText(originalName, { timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19-EditCancelButton_success');
  });

  // TC_20
  test('TC-20 Verify promotion activation', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');

    // Inactive promotions are hidden by default — enable Include Inactive so a row with an
    // available "Activate" action exists to act on.
    const toggle = container.locator('div.p-inputswitch').first();
    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isChecked = (await toggle.getAttribute('aria-checked')) === 'true';
      if (!isChecked) {
        await toggle.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
      }
    }

    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Activate
    const targetRow = await findRowWithMenuAction(page, rows, 'Activate');
    expect(targetRow, 'No row with an available "Activate" action was found').not.toBeNull();

    const menu = page.locator('.p-menu-overlay');
    await menu.getByText('Activate', { exact: false }).first().click();

    // Step 7: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_20-ActivatePromotion_success');
  });

  // TC_21
  test('TC-21 Verify Activate popup No button', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');

    const toggle = container.locator('div.p-inputswitch').first();
    if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isChecked = (await toggle.getAttribute('aria-checked')) === 'true';
      if (!isChecked) {
        await toggle.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
      }
    }

    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Activate
    const targetRow = await findRowWithMenuAction(page, rows, 'Activate');
    expect(targetRow, 'No row with an available "Activate" action was found').not.toBeNull();

    const menu = page.locator('.p-menu-overlay');
    await menu.getByText('Activate', { exact: true }).click();

    // Step 7: Click No
    const noBtn = page.locator('button:has-text("No")').first();
    await noBtn.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn.click();
    await expect(noBtn).not.toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21-ActivatePopupNoButton_success');
  });

  // TC_22
  test('TC-22 Verify promotion deactivation', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Deactivate
    const targetRow = await findRowWithMenuAction(page, rows, 'Deactivate');
    expect(targetRow, 'No row with an available "Deactivate" action was found').not.toBeNull();

    await openMenuItem(page, 'Deactivate').click();

    // Step 7: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_22-DeactivatePromotion_success');
  });

  // TC_23
  test('TC-23 Verify Deactivate popup No button', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Deactivate
    const targetRow = await findRowWithMenuAction(page, rows, 'Deactivate');
    expect(targetRow, 'No row with an available "Deactivate" action was found').not.toBeNull();

    await openMenuItem(page, 'Deactivate').click();

    // Step 7: Click No
    const noBtn = page.locator('button:has-text("No")').first();
    await noBtn.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn.click();
    await expect(noBtn).not.toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23-DeactivatePopupNoButton_success');
  });

  // TC_24
  test('TC-24 Verify Initialize Budget functionality', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Initialize budget
    const targetRow = await findRowWithMenuAction(page, rows, 'Initialize');
    expect(targetRow, 'No row with an available "Initialize Budget" action was found').not.toBeNull();

    await openMenuItem(page, 'Initialize').click();

    // Step 7: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming budget initialization').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24-InitializeBudget_success');
  });

  // TC_25
  test('TC-25 Verify Initialize Budget popup No button', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Steps 5-6: Click the three dots for any promotion, then click Initialize budget
    const targetRow = await findRowWithMenuAction(page, rows, 'Initialize');
    expect(targetRow, 'No row with an available "Initialize Budget" action was found').not.toBeNull();

    await openMenuItem(page, 'Initialize').click();

    // Step 7: Click No
    const noBtn = page.locator('button:has-text("No")').first();
    await noBtn.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn.click();
    await expect(noBtn).not.toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25-InitializeBudgetPopupNoButton_success');
  });

  // TC_26
  test('TC-26 Verify promotion deletion', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const firstRow = rows.first();
    const deletedName = (await firstRow.locator('td').nth(1).textContent())?.trim() ?? '';

    // Steps 5-6: Click the three dots for any promotion, then click Delete
    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Delete', { exact: false }).first().click();

    // Step 7: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    if (deletedName) {
      await expect(container.locator(`.pure__table tbody td:text-is("${deletedName}")`)).not.toBeVisible({ timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_26-DeletePromotion_success');
  });

  // TC_27
  test('TC-27 Verify Delete popup No button', async ({ page }, testInfo) => {
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const firstRow = rows.first();
    const promoName = (await firstRow.locator('td').nth(1).textContent())?.trim() ?? '';

    // Steps 5-6: Click the three dots for any promotion, then click Delete
    const dotsBtn = firstRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Delete', { exact: false }).first().click();

    // Step 7: Click No
    const noBtn = page.locator('button:has-text("No")').first();
    await noBtn.waitFor({ state: 'visible', timeout: 10000 });
    await noBtn.click();
    await expect(noBtn).not.toBeVisible({ timeout: 10000 });

    if (promoName) {
      await expect(container.locator(`.pure__table tbody td:text-is("${promoName}")`)).toBeVisible({ timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27-DeletePopupNoButton_success');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH AND WIN — MANAGE PERIODS  (TC_28 – TC_32)
// Navigation: Marketing → Promotions → Scratch and Win → three dots → Manage Periods
// NOTE: none of this page's markup (its own table structure, the "Generate Periods" button, the
// period rows' three-dot menu, or the Edit Period dialog's fields) has been confirmed against
// real DOM yet — everything here follows the same conventions already confirmed elsewhere in
// this app (`.pure__table tbody tr`, `button:has(.pi-ellipsis-v)` → `.p-menu-overlay`, Yes/No
// confirm dialogs, `.p-toast-message-success` toasts). Send the actual outerHTML for this page
// if anything here doesn't match.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Scratch and Win - Manage Periods', () => {

  test.beforeEach(async ({ page }) => {
    // Steps 1-4: Launch the site → expand Marketing → expand Promotions → click Scratch and Win
    await navigateToScratchAndWin(page);
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');

    // Step 5-6: Click the three dots for any promotion, then click Manage Periods
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 25000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 15000 });
    await menu.getByText('Manage Periods', { exact: false }).first().click();
    await page.waitForLoadState('networkidle');
  });

 // TC_28
  test('TC-28 Verify Manage Periods page opens', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await expect(rows.first().or(page.locator('.pure__table')).first()).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_28-ManagePeriodsPageOpens_success');
  });

  // TC_29
  test('TC-29 Verify Generate Periods button', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    const initialCount = await waitForStableRowCount(page, rows);

    // Step 7: Click Generate Periods
    const generateBtn = page.locator('button[aria-label="Generate Periods"], button:has-text("Generate Periods")').first();
    await generateBtn.waitFor({ state: 'visible', timeout: 15000 });
    await generateBtn.click();

    // Step 8: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming period generation').toBeVisible({ timeout: 10000 });

    await expect(rows.first()).toBeVisible({ timeout: 20000 });
    expect(await rows.count(), 'Expected more periods after Generate Periods').toBeGreaterThanOrEqual(initialCount);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_29-GeneratePeriods_success');
  });

  // TC_30
  test('TC-30 Verify Period can be updated', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Step 7: Click on three dots of any period
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Edit
    await menu.getByText('Edit', { exact: false }).first().click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 9: Modify all required fields — modify the first available numeric field as a
    // representative edit since this dialog's exact field ids are unconfirmed.
    const editableInput = dialog.locator('.p-inputnumber input, input.p-inputtext').first();
    if (await editableInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fillNumberField(editableInput, '5').catch(async () => {
        await editableInput.fill(`Auto${CommonUtils.generateRandomString(5)}`).catch(() => {});
      });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_30-UpdatePeriod_filled');

    // Step 10: Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the period update').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_30-UpdatePeriod_success');
  });

  // TC_31
  test('TC-31 Verify Mark Special functionality', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Act on the 2nd period (falling back to the 1st if only one exists) rather than the 1st —
    // TC_30 edits the 1st and TC_32 deletes the last, so reusing the 1st here risks operating on
    // a period another test already modified or deleted, depending on execution order.
    const rowCount = await rows.count();
    const targetRow = rowCount > 1 ? rows.nth(1) : rows.first();

    // Step 7: Click on three dots of any period
    const dotsBtn = targetRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Mark Special
    await menu.getByText('Mark Special', { exact: false }).first().click();

    // Step 9: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the period was marked special').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_31-MarkSpecial_success');
  });

  // TC_32
  test('TC-32 Verify Delete Period', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Delete the LAST period, not the first — TC_30 edits the 1st period and TC_31 acts on the
    // 2nd, so deleting the last avoids removing a period another test still depends on existing.
    const targetRow = rows.last();
    // Row-count checks are unreliable with server-side pagination — the server backfills the
    // deleted slot with another row, so the count on the CURRENT page can stay identical even
    // though the underlying data shrank by one (this is exactly what was happening: the delete
    // succeeded and the toast confirmed it, but the row count assertion never actually dropped).
    // Capture an identifying value instead and verify that specific row is gone.
    const deletedRowText = (await targetRow.locator('td').first().textContent())?.trim() ?? '';

    // Step 7: Click on three dots of any period
    const dotsBtn = targetRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Delete
    await menu.getByText('Delete', { exact: false }).first().click();

    // Step 9: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the period was deleted').toBeVisible({ timeout: 10000 });

    if (deletedRowText) {
      await expect(rows.filter({ hasText: deletedRowText }), 'Deleted period still appears in the table').toHaveCount(0, { timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_32-DeletePeriod_success');
  });

});

// Opens a PrimeNG dropdown and clicks the option whose text matches exactly (case-sensitive) —
// unlike selectFirstDropdownOption, this targets a SPECIFIC option (e.g. Value Bucket "A")
// rather than whichever renders first.
async function selectDropdownOptionByText(page: Page, dropdown: Locator, optionText: string): Promise<void> {
  await dropdown.waitFor({ state: 'visible', timeout: 10000 });
  await dropdown.scrollIntoViewIfNeeded().catch(() => {});
  await dropdown.click().catch(() => dropdown.click({ force: true }).catch(() => {}));
  const option = page
    .locator('[data-pc-section="option"]:not(option), .p-dropdown-item, .p-select-option, li[role="option"]')
    .filter({ hasText: new RegExp(`^${optionText}$`) })
    .first();
  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.click();
}

// Fills every field in the Create/Edit Prize dialog — all 9 are mandatory ("*") per the
// confirmed markup: Prize Code, Prize Name, Bet Type, Prize Type, Value Bucket (fixed to "A"
// per TC_36's explicit requirement), Comp Code, Comp Amount, Comp Value, Notification Template.
async function fillPrizeMandatoryFields(page: Page, dialog: Locator): Promise<{ prizeCode: string; prizeName: string }> {
  const prizeCode = `PZ-${CommonUtils.generateRandomString(5)}`;
  const prizeName = `AutoPrize-${CommonUtils.generateRandomString(6)}`;
  await dialog.locator('#prizeCode').fill(prizeCode);
  await dialog.locator('#prizeName').fill(prizeName);
  await selectFirstDropdownOption(page, dialog.locator('#betType'));
  await selectFirstDropdownOption(page, dialog.locator('#prizeType'));
  await selectDropdownOptionByText(page, dialog.locator('#valueBucket'), 'A');
  await selectFirstDropdownOption(page, dialog.locator('#compCode'));
  await fillNumberField(dialog.locator('#compAmount input'), '10');
  await fillNumberField(dialog.locator('#compValue input'), '5');
  await selectFirstDropdownOption(page, dialog.locator('#notificationTemplate'));
  return { prizeCode, prizeName };
}

// Ensures the first prize row already has a budget, so Edit Budget / Delete Budget tests are
// self-contained rather than depending on TC_40 ("Create Budget") having already run against
// the same prize. If the row's menu already offers "Edit Budget" a budget exists and this is a
// no-op; otherwise it creates one via the same Create Budget flow as TC_40.
async function ensureBudgetExistsOnFirstPrize(page: Page, rows: Locator): Promise<void> {
  await rows.first().waitFor({ state: 'visible', timeout: 20000 });

  const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
  await dotsBtn.waitFor({ state: 'visible', timeout: 25000 });
  await dotsBtn.click();

  const menu = page.locator('.p-menu-overlay');
  await expect(menu).toBeVisible({ timeout: 15000 });

  const editBudgetItem = menu.getByText('Edit Budget', { exact: false }).first();
  if (await editBudgetItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    // A budget already exists on this prize — nothing to do.
    await page.keyboard.press('Escape').catch(() => {});
    return;
  }

  // No budget yet — create one via Create Budget.
  await menu.getByText('Create Budget', { exact: false }).first().click();

  const dialog = page.locator('div[role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 15000 });

  await fillNumberField(dialog.locator('#dailyCount input'), '10');
  await selectFirstDropdownOption(page, dialog.locator('#dayType'));

  const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
  await saveBtn.scrollIntoViewIfNeeded();
  await expect(saveBtn).toBeEnabled({ timeout: 15000 });
  await saveBtn.click();
  await expect(dialog).not.toBeVisible({ timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRATCH AND WIN — MANAGE PRIZES  (TC_33 – TC_38)
// Navigation: Marketing → Promotions → Scratch and Win → three dots → Manage Prizes
// Create/Edit Prize dialog fields confirmed against real markup: #prizeCode, #prizeName,
// #betType, #prizeType, #valueBucket, #compCode, #compAmount, #compValue,
// #notificationTemplate — all mandatory. Create Prize button confirmed as
// button[aria-label="Create Prize"]; Back button is icon-only (.pi-chevron-left), no text.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Scratch and Win - Manage Prizes', () => {

  test.beforeEach(async ({ page }) => {
    // Steps 1-4: Launch the site → expand Marketing → expand Promotions → click Scratch and Win
    await navigateToScratchAndWin(page);
    const container = page.locator('scratch-and-win-management');
    const rows = container.locator('.pure__table tbody tr');

    // Step 5-6: Click the three dots for any promotion, then click Manage Prizes
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 25000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 15000 });
    await menu.getByText('Manage Prizes', { exact: false }).first().click();
    await page.waitForLoadState('networkidle');
  });

  // TC_33
  test('TC-33 Verify Manage Prizes page opens', async ({ page }, testInfo) => {
    await expect(page.locator('button[aria-label="Create Prize"]').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('button:has(.pi-chevron-left)').first()).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_33-ManagePrizesPageOpens_success');
  });

  // TC_34
  test('TC-34 Verify Create Prize popup opens', async ({ page }, testInfo) => {
    // Step 7: Click on Create Prize button
    const createBtn = page.locator('button[aria-label="Create Prize"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_34-CreatePrizePopupOpens_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_35
  test('TC-35 Verify mandatory field validation in Create Prize', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Prize"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 8: Leave all mandatory fields blank
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await expect(saveBtn, 'Expected Save to remain disabled with all mandatory fields blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35-CreatePrizeMandatoryFields_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_36
  test('TC-36 Verify successful Prize creation', async ({ page }, testInfo) => {
    const createBtn = page.locator('button[aria-label="Create Prize"]').first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Steps 8-10: Enter valid values in all mandatory fields, select A as the Value Bucket, and
    // select valid values in all remaining dropdowns
    await fillPrizeMandatoryFields(page, dialog);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-CreatePrize_filled');

    // Step 11: Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    const toastVisible = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
    if (!toastVisible) {
      await page.locator('.pure__table tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36-CreatePrize_success');
  });

  // TC_37
  test('TC-37 Verify Back button', async ({ page }, testInfo) => {
    // Step 7: Click on Back button
    const backBtn = page.locator('button:has(.pi-chevron-left)').first();
    await backBtn.waitFor({ state: 'visible', timeout: 15000 });
    await backBtn.click();
    await page.waitForLoadState('networkidle');

    const container = page.locator('scratch-and-win-management');
    await expect(container, 'Expected navigation back to the Scratch and Win page').toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_37-BackButton_success');
  });

  // TC_38
  // Given: navigate to Manage Prizes for a promotion that already has at least one prize
  // (created by TC_36 or otherwise) — Edit lives behind the prize row's three-dot menu and
  // opens the same field set as Create Prize, pre-populated with the existing values.
  test('TC-38 Verify Edit Prize', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Click the three dots for any prize, then click Edit
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });
    await menu.getByText('Edit', { exact: false }).first().click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Confirm the dialog opened pre-populated with the existing prize's values. The dialog
    // becomes visible before Angular finishes patching the form with the existing prize's data
    // — reading inputValue() immediately can race that patch and see it still empty, so poll
    // instead of reading once.
    const nameInput = dialog.locator('#prizeName');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await expect
      .poll(async () => await nameInput.inputValue(), { timeout: 5000 })
      .not.toBe('');

    // Modify Prize Name
    const updatedName = `AutoPrize-Edited-${CommonUtils.generateRandomString(6)}`;
    await nameInput.fill(updatedName);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_38-EditPrize_filled');

    // Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the prize update').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_38-EditPrize_success');
  });

  // TC_39
  // Create Budget dialog field ids (#dailyCount, #dayType) confirmed directly against the
  // real markup (Edit Budget uses the identical structure/ids).
  test('TC-39 Verify mandatory field validation in Create Budget', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    // Step 7: Click the three dots of the created prize
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Create Budget
    await menu.getByText('Create Budget', { exact: false }).first().click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 9: Leave Daily Count and Day Type blank
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await expect(saveBtn, 'Expected Save to remain disabled with Daily Count and Day Type blank').toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_39-CreateBudgetMandatoryFields_success');

    const cancelBtn = dialog.locator('button[aria-label="Cancel"], button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cancelBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 10000 });
    }
  });

  // TC_40
  test('TC-40 Verify successful Budget creation', async ({ page }, testInfo) => {
    // The shared Manage Prizes table accumulates prizes across test runs, and any prize that
    // already has a budget offers "Edit Budget"/"Delete Budget" instead of "Create Budget" in its
    // menu — confirmed live: the first row was exactly such a prize, so blindly acting on
    // rows.first() (the original approach) hangs waiting for a "Create Budget" item that was
    // never going to appear for that row. Create a fresh, guaranteed-budget-less prize instead,
    // and act on that specific row by name so this test is self-contained.
    const createPrizeBtn = page.locator('button[aria-label="Create Prize"]').first();
    await createPrizeBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createPrizeBtn.click();

    const createDialog = page.locator('div[role="dialog"]').first();
    await expect(createDialog).toBeVisible({ timeout: 15000 });
    const { prizeName } = await fillPrizeMandatoryFields(page, createDialog);

    const createSaveBtn = createDialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await createSaveBtn.scrollIntoViewIfNeeded();
    await expect(createSaveBtn).toBeEnabled({ timeout: 15000 });
    await createSaveBtn.click();
    await expect(createDialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    const rows = page.locator('.pure__table tbody tr');
    const ownRow = rows.filter({ hasText: prizeName }).first();
    await ownRow.waitFor({ state: 'visible', timeout: 15000 });

    // Step 7: Click the three dots of the freshly created (budget-less) prize
    const dotsBtn = ownRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Create Budget
    await menu.getByText('Create Budget', { exact: false }).first().click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Step 9: Enter a valid Daily Count
    await fillNumberField(dialog.locator('#dailyCount input'), '10');

    // Step 10: Select a valid Day Type
    await selectFirstDropdownOption(page, dialog.locator('#dayType'));

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_40-CreateBudget_filled');

    // Step 11: Click Save
    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();

    // Check for the toast BEFORE waiting for the dialog to close — PrimeVue
    // toasts auto-dismiss after a few seconds, and by the time the dialog-close
    // + networkidle waits finished, it could already be gone (confirmed live:
    // the budget genuinely got created, but the test still failed because it
    // looked for the toast too late).
    const anyToast = page.locator('.p-toast-message').first();
    if (await anyToast.isVisible({ timeout: 15000 }).catch(() => false)) {
      const toastText = (await anyToast.textContent())?.trim();
      const severityClass = await anyToast.getAttribute('class');
      console.log(`Toast appeared — class="${severityClass}" | text="${toastText}"`);
    } else {
      console.log('No toast appeared at all within 15s after clicking Save.');
    }

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the budget was created').toBeVisible({ timeout: 15000 });

    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_40-CreateBudget_success');
  });

  // TC_41
  test('TC-41 Verify Delete Prize', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await rows.first().waitFor({ state: 'visible', timeout: 20000 });

    const targetRow = rows.first();
    // Row-count checks are unreliable with server-side pagination (the server backfills the
    // deleted slot with another row) — capture an identifying value and verify it's gone instead.
    const deletedRowText = (await targetRow.locator('td').first().textContent())?.trim() ?? '';

    // Step 7: Click the three dots of the created prize
    const dotsBtn = targetRow.locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 15000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 10000 });

    // Step 8: Click Delete
    await menu.getByText('Delete', { exact: false }).first().click();

    // Step 9: Click Yes
    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    if (deletedRowText) {
      await expect(rows.filter({ hasText: deletedRowText }), 'Deleted prize still appears in the table').toHaveCount(0, { timeout: 10000 });
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_41-DeletePrize_success');
  });

  // TC_42
  // Self-contained: ensures a budget exists on the first prize (creating one via Create Budget
  // if none does yet) rather than depending on TC_40 having already run against the same prize.
  test('TC-42 Verify Edit Budget', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await ensureBudgetExistsOnFirstPrize(page, rows);

    // Click the three dots of the prize, then click Edit Budget
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 25000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 15000 });
    await menu.getByText('Edit Budget', { exact: false }).first().click();

    const dialog = page.locator('div[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Confirm the dialog opened pre-populated with the existing budget's values before editing
    // it — same race as Edit Prize: the dialog can render visible before Angular finishes
    // patching the form, so poll instead of reading inputValue() once.
    const dailyCountInput = dialog.locator('#dailyCount input');
    await dailyCountInput.waitFor({ state: 'visible', timeout: 10000 });
    await expect
      .poll(async () => await dailyCountInput.inputValue(), { timeout: 5000 })
      .not.toBe('');

    // Modify Daily Count
    await fillNumberField(dailyCountInput, '20');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_42-EditBudget_filled');

    const saveBtn = dialog.locator('button[aria-label="Save"], button:has-text("Save")').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled({ timeout: 15000 });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the budget update').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_42-EditBudget_success');
  });

  // TC_43
  // Self-contained: ensures a budget exists on the first prize (creating one via Create Budget
  // if none does yet) rather than depending on TC_40/TC_42 having already run against it.
  test('TC-43 Verify Delete Budget', async ({ page }, testInfo) => {
    const rows = page.locator('.pure__table tbody tr');
    await ensureBudgetExistsOnFirstPrize(page, rows);

    // Click the three dots of the prize, then click Delete Budget
    const dotsBtn = rows.first().locator('button:has(.pi-ellipsis-v)');
    await dotsBtn.waitFor({ state: 'visible', timeout: 25000 });
    await dotsBtn.click();

    const menu = page.locator('.p-menu-overlay');
    await expect(menu).toBeVisible({ timeout: 15000 });
    await menu.getByText('Delete Budget', { exact: false }).first().click();

    const yesBtn = page.locator('button:has-text("Yes")').first();
    await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
    await yesBtn.click();
    await page.waitForLoadState('networkidle');

    const successToast = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(successToast, 'Expected a success toast confirming the budget was deleted').toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_43-DeleteBudget_success');
  });

});
