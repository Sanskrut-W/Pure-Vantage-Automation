// /**
//  * directUrlCheck.spec.ts
//  *
//  * Purpose:
//  *   Simulate a user opening a new browser tab and pasting a component URL directly.
//  *   Verify that the correct page loads — i.e. the app does NOT redirect to home or
//  *   an error page, and the expected primary element is visible.
//  *
//  * How it works:
//  *   • One test is generated per entry in componentUrlConfigs (config/componentUrlConfig.ts).
//  *   • The baseFixture automatically injects session storage before the first goto(),
//  *     so auth is satisfied even though we never visit /main/home first.
//  *   • Test IDs use the DC-XX prefix (DC = Direct-url Check).
//  *   • Tests tagged [CONFIRMED] used verified URLs from routeNavigations.spec.ts.
//  *   • Tests tagged [ESTIMATED] use best-guess URLs; a pass confirms the URL,
//  *     a fail tells us the actual URL so we can update the config.
//  *
//  * Run all:
//  *   npx playwright test directUrlCheck.spec.ts
//  *
//  * Run only confirmed:
//  *   npx playwright test directUrlCheck.spec.ts --grep CONFIRMED
//  *
//  * Run only estimated:
//  *   npx playwright test directUrlCheck.spec.ts --grep ESTIMATED
//  *
//  * Run a single component by name (partial match):
//  *   npx playwright test directUrlCheck.spec.ts --grep "Cashback"
//  */

// import { test, expect } from '../fixtures/baseFixture';
// import { componentUrlConfigs } from '../config/componentUrlConfig';

// test.describe('Direct URL Check — Open tab, paste URL, verify correct page loads', () => {

//     for (const [index, config] of componentUrlConfigs.entries()) {

//         // Zero-padded test ID: DC-01, DC-02, … DC-35
//         const tcId = `DC-${String(index + 1).padStart(2, '0')}`;

//         // Badge shown in test title for quick visual scan of the report
//         const statusBadge = config.urlStatus === 'confirmed' ? '[CONFIRMED]' : '[ESTIMATED]';

//         // ──────────────────────────────────────────────────────────────────
//         test(`[${tcId}] ${statusBadge} ${config.name} — direct URL opens correct page`, async ({ page }, testInfo) => {

//             // ── Attach metadata to the Playwright HTML report ──────────────
//             testInfo.annotations.push({ type: 'TC ID',      description: tcId });
//             testInfo.annotations.push({ type: 'URL Status', description: config.urlStatus });
//             testInfo.annotations.push({ type: 'URL',        description: config.url });
//             if (config.notes) {
//                 testInfo.annotations.push({ type: 'Notes', description: config.notes });
//             }

//             // ── Step 1 ─ Navigate directly (simulates: open tab → paste URL) ──
//             // Session storage is already injected by the baseFixture's authenticatedSession,
//             // so the SPA treats this as an authenticated request even on first load.
//             await page.goto(config.url);

//             // Wait for all network requests to settle so Angular has finished routing
//             await page.waitForLoadState('networkidle');

//             // ── Step 2 ─ Verify the SPA did NOT redirect to home or an error page ──
//             // This catches: wrong URL slug (→ redirect to home), missing auth (→ login),
//             // or any other routing failure.
//             await expect(page).toHaveURL(config.urlPattern, {
//                 timeout: 15_000,
//             });

//             // ── Step 3 ─ Verify the primary page element is visible ──────────
//             // Proves the correct component rendered (not just the correct URL string).
//             // Skip element check if verificationLocator is left as empty string in the config.
//             if (config.verificationLocator) {
//                 await expect(
//                     page.locator(config.verificationLocator).first()
//                 ).toBeVisible({ timeout: 15_000 });
//             }

//         });
//         // ──────────────────────────────────────────────────────────────────
//     }

// });
