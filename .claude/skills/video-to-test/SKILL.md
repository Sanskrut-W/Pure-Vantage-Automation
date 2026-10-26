---
name: video-to-test
description: Turn a screen recording (MP4) of a manual PureVantage test into Playwright + TypeScript code in this framework's format (locators file → page object → baseFixture → spec with TC_ ids). Use when the user drops a recording in recordings/ or points at one and wants test code from it.
argument-hint: "recordings/<file>.mp4 [module name] [TC prefix]"
---

# Recording → PureVantage Playwright test

Turn the recording into code that follows **this repo's** conventions exactly and passes when run.
Read one existing module before writing anything (e.g. `locators/recurringRewardsLocators.ts`,
`pages/RecurringRewardsPage.ts`, `tests/recurringrewards.spec.ts`) and match it.

## 1. Inputs

`$ARGUMENTS` = recording path, optionally followed by the module name and TC prefix.
No path → newest `.mp4` in `recordings/`. `<name>` = file name without extension.

## 2. Extract key frames

```bash
npm run frames -- recordings/<file>.mp4
```

Writes `recordings/work/<name>/frames/frame_NNNN.jpg` + `manifest.json` (timestamps).
If a quick action seems missing between two frames, re-run with `--fps 4`.

## 3. Watch the recording

Read `manifest.json`, then **view every frame in order** with the Read tool (several in parallel per
message). Note for each step:

- **Navigation**: the sidebar path clicked (e.g. Marketing → Recurring Rewards), page heading, URL if visible
- **Actions**: button clicked, field typed into (and the text), dropdown opened + option picked,
  date/time picker used, checkbox/switch toggled, row "⋯" menu → Edit / Clone / Delete, Yes/No modal
- **Results the tester checks**: toast text, validation message, Save enabled/disabled, a row
  appearing in the table, a field's value, a column/sort/pagination change. Pauses and hovers mean "checking this".

## 4. Write the step list

`recordings/work/<name>/steps.md`:

```markdown
# <Test case title>
Module: <Sidebar parent> → <Module>   (existing: pages/XPage.ts | NEW)
TC prefix: TC_XX

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|

## Uncertainties
- anything guessed (unreadable text, ambiguous click, which row, masked value)
```

If the recording clearly contains several separate checks, split them into separate test cases (one `test()` each).

## 5. Existing module or new one?

Check `locators/sidebarLocators.ts`, `pages/`, `fixtures/baseFixture.ts` and `tests/` for the module.

- **Existing** → reuse its page object methods and locators. Only add what's missing (new locator
  keys, new methods). Add the new tests to its existing spec file.
- **New** → create all of: `locators/<camel>Locators.ts`, `pages/<Pascal>Page.ts`, the fixture entry in
  `fixtures/baseFixture.ts` (import + type + `// Instantiate and provide <Pascal>Page` block), the
  sidebar entry (`menu<Pascal>` in `sidebarLocators.ts`, `readonly <camel>Node` + `menu(...)` and
  `navigateTo<Pascal>()` in `SidebarPage.ts`, same pattern as `navigateToRecurringRewards`),
  `tests/<camel>.spec.ts`, and a `config/componentUrlConfig.ts` entry if the URL is known.

## 6. Get real locators from the live app

Don't guess selectors from pixels and don't ask the user for outerHTML when you can look yourself:

```bash
npm run snapshot -- "<Module name from componentUrlConfig>"
npm run snapshot -- "<Module name>" --click "Create Configuration" --scope dialog
npm run snapshot -- /main/component-display/<path>
```

It uses the saved SSO session (`auth.json` + `session.json`) and prints the accessibility tree plus
every visible element's id / aria-label / placeholder / PrimeNG class. `--click` is read-only (it
refuses Save/Delete/Yes/…), so use it only to open popups, tabs and menus.

- "Can't reach … connect to the VPN" → ask the user to connect, or continue with locators read from
  the frames and mark each one `// UNCONFIRMED (from recording) — verify live`.
- "session has expired" → ask the user to run `npm run auth` (Microsoft SSO, they must do it themselves).

Locator preferences, in this repo's style:
- Field ids from the DOM: `'#promotionName'`, `'#startDate input'`, `'#wagerAmountRequirement input'`
- Buttons by visible text in the locators file + `getByRole('button', { name: locators.x, exact: true })` in the page
- Popup fields scoped to `page.locator('div[role="dialog"]').first()`
- Sidebar: `span.menuitem-text:text-is("<label>")` via the existing `menu()` helper
- PrimeNG: `.p-dropdown-panel`, `.p-dropdown-item`, `.p-toast-message`, `button.pure__table-menu-trigger`,
  `button[aria-label="Yes"]`, `.pure__table tbody tr`
- Comment each locator `// Confirmed live (snapshot)` or `// UNCONFIRMED (from recording)` like the existing files do.

## 7. Code format (must match the repo)

**Locators** (`locators/<camel>Locators.ts`, 4-space indent):
```ts
export const <camel>Locators = {
    // Confirmed live (snapshot)
    buttonCreate<X>: 'Create <X>',
    input<Field>: '#<id>',
    dropdown<Field>: '#<id>',
    buttonSave: 'Save',
    buttonCancel: 'Cancel',
    searchInput: '#search-input',
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    confirmYesBtn: 'button[aria-label="Yes"]',
};
```

**Page object** (`pages/<Pascal>Page.ts`, 4-space indent): `extends BasePage`, `import { <camel>Locators as locators }`,
`readonly` `Locator` fields assigned in the constructor, `═══` section banners, one method per user
action that logs first (`console.log('Clicking Save...')`) and uses `this.clickElement` / `this.fillInput`
/ `this.selectDropdown`. Include `getToastText()` and a `delete<X>IfPresent(name)` cleanup method
that swallows errors (copy the RecurringRewardsPage pattern).

**Spec** (`tests/<camel>.spec.ts`, 2-space indent):
```ts
// npx playwright test tests/<camel>.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ═══════════════════════════════════════════════════════════════════════════════
// <MODULE> — generated from recordings/<file>.mp4 (steps: recordings/work/<name>/steps.md)
//
// Flagged assumptions:
//  - <each uncertainty from steps.md>
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateTo<Pascal>(page: any, sidebarPage: any, <camel>Page: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();
  await sidebarPage.navigateTo<Pascal>();
  await <camel>Page.<keyElement>.waitFor({ state: 'visible', timeout: 60000 });
}

test.describe('<Sidebar parent> - <Module> - <Group> Tests', () => {
  let <x>NameToCleanup: string | null = null;

  test.beforeEach(async ({ page, sidebarPage, <camel>Page }) => {
    <x>NameToCleanup = null;
    await navigateTo<Pascal>(page, sidebarPage, <camel>Page);
  });

  test.afterEach(async ({ <camel>Page }) => {
    if (<x>NameToCleanup) {
      await <camel>Page.delete<X>IfPresent(<x>NameToCleanup);
      <x>NameToCleanup = null;
    }
  });

  test('TC_XX_01 Verify <what the recording proves>', async ({ page, <camel>Page }, testInfo) => {
    const name = `Auto<Module>_${Date.now()}`;
    // …steps from steps.md, each check as:
    await expect(<camel>Page.saveBtn, 'Expected Save to be enabled once all fields are filled').toBeEnabled();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_XX_01_<short_slug>');
    console.log('<one sentence: what was verified>.');
  });
});
```

Rules:
- Never hardcode the host: navigation is `page.goto('/main/home')` + sidebar; `baseURL` comes from `config/envConfig.ts` (ENV=dev|staging|prod).
- Test ids: reuse the spec's existing prefix (`grep -o "TC_[A-Z]*_" tests/<spec>`) and continue from the
  highest number; never renumber or edit existing (or commented-out) tests. New module → prefix from
  its initials, confirm with the user if it could clash.
- Every `expect` has a message string. Every check the tester made becomes an `expect`.
- Any data the test creates gets a `Auto<Module>_${Date.now()}` name and is deleted in `afterEach`.
- Popup-only tests end with `clickCancel()` so nothing is saved.
- Fixed values seen in the recording that matter (amounts, frequencies, options) go in constants or
  `test-data/app-data.json`; "pick any" choices use `selectFirstOption`-style helpers.
- Never put credentials or tokens in code; auth comes from the fixture.

## 8. Run and fix

```bash
npx tsc --noEmit -p .
npx playwright test tests/<spec>.spec.ts -g "TC_XX_NN" --retries 0 --workers 1
```

On failure, read the error, `test-results/**/error-context.md` (page snapshot at failure) and the
screenshot; fix the locator or wait and re-run (up to 5 attempts). Use `npm run snapshot` to check
the DOM again. Fix **how** the test finds things, never **what** it checks. Don't delete or weaken an
assertion to get a pass. If the app behaves differently from the recording, stop and report it as a
possible bug.

This runs against the shared dev environment: don't run flows that send real notifications or
approve/pay out to real players without asking the user first.

## 9. Report

- Files created/changed (spec, page, locators, fixture, sidebar)
- Test ids + titles and pass/fail
- Every UNCONFIRMED locator and uncertainty, plus anything the user must do (VPN, `npm run auth`)
