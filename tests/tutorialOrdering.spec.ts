// // npx playwright test tests/tutorialOrdering.spec.ts --headed
// import { test, expect } from '../fixtures/baseFixture';
// import { CommonUtils } from '../utils/commonUtils';

// const REGION = 'Betway Ghana';

// test.describe('Tutorial Ordering Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, tutorialOrderingPage }) => {
//         await page.goto('/main/home');
//         await page.reload();
//         await sidebarPage.waitForPageLoad();

//         await sidebarPage.navigateToTutorialOrdering();
//         await expect(page).toHaveURL(/.*tutorial-ordering/);
//         await tutorialOrderingPage.waitForPageLoad();
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Page Verification Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-1 Verify Tutorial Ordering Page is accessible', async ({ page }) => {
//         await expect(page).toHaveURL(/.*tutorial-ordering/);
//     });

//     test('TC-2 Verify Search bar and Region Filter are available', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await expect(tutorialOrderingPage.searchInput).toBeVisible();
//         await expect(tutorialOrderingPage.regionDropdown).toBeVisible();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_tutorial_ordering_controls');
//     });

//     test('TC-3 Verify Region Filter Functionality', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);
//         await expect(tutorialOrderingPage.regionDropdown).toContainText(REGION);
//         await expect(tutorialOrderingPage.tutorialsTable).toBeVisible();
//         await expect(tutorialOrderingPage.loggedInTable).toBeVisible();
//         await expect(tutorialOrderingPage.loggedOutTable).toBeVisible();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_tutorial_ordering_region_filter');
//     });

//     test('TC-4 Verify Structure: Tutorials and Ordering Lists', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         await expect(tutorialOrderingPage.tutorialsTable).toBeVisible();
//         await expect(tutorialOrderingPage.loggedInTable).toBeVisible();
//         await expect(tutorialOrderingPage.loggedOutTable).toBeVisible();

//         // Logged In and Logged Out tables must have Order and Tutorial Name columns
//         await expect(tutorialOrderingPage.loggedInTable.locator('th').nth(1)).toContainText('Order');
//         await expect(tutorialOrderingPage.loggedInTable.locator('th').nth(2)).toContainText('Tutorial Name');

//         await expect(tutorialOrderingPage.loggedOutTable.locator('th').nth(1)).toContainText('Order');
//         await expect(tutorialOrderingPage.loggedOutTable.locator('th').nth(2)).toContainText('Tutorial Name');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_tutorial_ordering_structure');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Toggle Tests (Serial — toggle mutations affect shared state)
//     // ═══════════════════════════════════════════════════════════

//     test.describe.serial('Toggle Tests', () => {

//         test('TC-5 Verify Logged In Toggle functionality (Disappear)', async ({ page, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const activeTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedIn');
//             expect(activeTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(activeTutorial, 'LoggedIn', false);

//             const isStillVisible = await tutorialOrderingPage.isTutorialInList(activeTutorial, 'LoggedIn');
//             expect(isStillVisible).toBe(false);

//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_toggle_off_loggedin');
//         });

//         test('TC-6 Verify Logged Out Toggle functionality (Disappear)', async ({ page, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const activeTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedOut');
//             expect(activeTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(activeTutorial, 'LoggedOut', false);

//             const isStillVisible = await tutorialOrderingPage.isTutorialInList(activeTutorial, 'LoggedOut');
//             expect(isStillVisible).toBe(false);

//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_toggle_off_loggedout');
//         });

//         test('TC-7 Verify Logged In Toggle functionality (Reappear)', async ({ page, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             let inactiveTutorial = await tutorialOrderingPage.getFirstInactiveTutorial('LoggedIn');
//             if (!inactiveTutorial) {
//                 // No inactive tutorial found — turn one off first
//                 inactiveTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedIn');
//                 await tutorialOrderingPage.setTutorialToggleStatus(inactiveTutorial, 'LoggedIn', false);
//             }
//             expect(inactiveTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(inactiveTutorial!, 'LoggedIn', true);

//             const isNowVisible = await tutorialOrderingPage.isTutorialInList(inactiveTutorial!, 'LoggedIn');
//             expect(isNowVisible).toBe(true);

//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_toggle_on_loggedin');
//         });

//         test('TC-8 Verify Logged Out Toggle functionality (Reappear)', async ({ page, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             let inactiveTutorial = await tutorialOrderingPage.getFirstInactiveTutorial('LoggedOut');
//             if (!inactiveTutorial) {
//                 inactiveTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedOut');
//                 await tutorialOrderingPage.setTutorialToggleStatus(inactiveTutorial, 'LoggedOut', false);
//             }
//             expect(inactiveTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(inactiveTutorial!, 'LoggedOut', true);

//             const isNowVisible = await tutorialOrderingPage.isTutorialInList(inactiveTutorial!, 'LoggedOut');
//             expect(isNowVisible).toBe(true);

//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_toggle_on_loggedout');
//         });
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Drag-and-Drop Tests (Independent — each starts fresh)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-9 Verify Logged In List: Drag-and-Drop to adjacent position', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Betway Ghana LoggedIn has ${rowCount} row(s) — need at least 2 for drag-and-drop`).toBeGreaterThanOrEqual(2);

//         const name0 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         const name1 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 1);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_before_drag_loggedin');

//         await tutorialOrderingPage.dragRowToRow('LoggedIn', 0, 1);

//         const afterName0 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         const afterName1 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 1);

//         expect(afterName0).toBe(name1);
//         expect(afterName1).toBe(name0);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_after_drag_loggedin');
//     });

//     test('TC-10 Verify Logged Out List: Drag-and-Drop to adjacent position', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Betway Ghana LoggedOut has ${rowCount} row(s) — need at least 2 for drag-and-drop`).toBeGreaterThanOrEqual(2);

//         const name0 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         const name1 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 1);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_before_drag_loggedout');

//         await tutorialOrderingPage.dragRowToRow('LoggedOut', 0, 1);

//         const afterName0 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         const afterName1 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 1);

//         expect(afterName0).toBe(name1);
//         expect(afterName1).toBe(name0);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_after_drag_loggedout');
//     });

//     test('TC-11 Verify Logged In List: Drag-and-Drop to first position', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Betway Ghana LoggedIn has ${rowCount} row(s) — need at least 2 for drag-and-drop`).toBeGreaterThanOrEqual(2);

//         const sourceIndex = rowCount > 5 ? 5 : rowCount - 1;
//         const nameAtSource = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', sourceIndex);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_before_drag_to_first');

//         await tutorialOrderingPage.dragRowToRow('LoggedIn', sourceIndex, 0);

//         const nameAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(nameAtFirst).toBe(nameAtSource);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_after_drag_to_first');
//     });

//     test('TC-12 Verify Logged Out List: Drag-and-Drop to last position', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Betway Ghana LoggedOut has ${rowCount} row(s) — need at least 2 for drag-and-drop`).toBeGreaterThanOrEqual(2);

//         const nameAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_before_drag_to_last');

//         await tutorialOrderingPage.dragRowToRow('LoggedOut', 0, rowCount - 1);

//         const nameAtLast = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', rowCount - 1);
//         expect(nameAtLast).toBe(nameAtFirst);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_after_drag_to_last');
//     });

//     test('TC-13 Verify Drag-and-Drop does not affect the other list', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const outCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         const inCount  = await tutorialOrderingPage.getRowCount('LoggedIn');

//         expect(outCount, `Betway Ghana LoggedOut has ${outCount} row(s) — need at least 3`).toBeGreaterThanOrEqual(3);
//         expect(inCount,  `Betway Ghana LoggedIn has ${inCount} row(s) — need at least 2`).toBeGreaterThanOrEqual(2);

//         const loggedOutRef = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 2);

//         await tutorialOrderingPage.dragRowToRow('LoggedIn', 1, 0);

//         const loggedOutAfter = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 2);
//         expect(loggedOutAfter).toBe(loggedOutRef);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_drag_isolation');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Persistence Tests (Serial — save mutations affect server data)
//     // ═══════════════════════════════════════════════════════════

//     test.describe.serial('Persistence Tests', () => {

//         test('TC-14 Verify Logged In Reordering Persistence (Save Check)', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//             expect(rowCount, `Betway Ghana LoggedIn has ${rowCount} row(s) — need at least 2 to reorder`).toBeGreaterThanOrEqual(2);

//             // Note the name currently at position 2 (index 1); we'll move it to position 1
//             const nameToMoveToFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 1);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_before_reorder');

//             await tutorialOrderingPage.dragRowToRow('LoggedIn', 1, 0);
//             await tutorialOrderingPage.clickUpdate();
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_after_save');

//             await sidebarPage.browserRefresh();
//             await tutorialOrderingPage.selectRegion(REGION);

//             const nameAfterRefresh = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//             expect(nameAfterRefresh).toBe(nameToMoveToFirst);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_after_refresh');
//         });

//         test('TC-15 Verify Logged Out Reordering Persistence (Save Check)', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//             expect(rowCount, `Betway Ghana LoggedOut has ${rowCount} row(s) — need at least 4 to move to position 3`).toBeGreaterThanOrEqual(4);

//             // Note name at index 3 (position 4); drag it to index 2 (position 3)
//             const nameToMoveToThird = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 3);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_before_reorder');

//             await tutorialOrderingPage.dragRowToRow('LoggedOut', 3, 2);
//             await tutorialOrderingPage.clickUpdate();
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_after_save');

//             await sidebarPage.browserRefresh();
//             await tutorialOrderingPage.selectRegion(REGION);

//             const nameAfterRefresh = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 2);
//             expect(nameAfterRefresh).toBe(nameToMoveToThird);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_after_refresh');
//         });

//         test('TC-17 Verify Toggle off status persists across sessions', async ({ page, sidebarPage, tutorialOrderingPage, tutorialConfigPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const activeTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedIn');
//             expect(activeTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(activeTutorial, 'LoggedIn', false);
//             await tutorialOrderingPage.clickUpdate();
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_after_toggle_off_and_save');

//             // Navigate away to Tutorial Config, then return
//             await sidebarPage.navigateToTutorialConfig();
//             await page.waitForLoadState('networkidle');
//             await sidebarPage.navigateToTutorialOrdering();
//             await page.waitForLoadState('networkidle');

//             await tutorialOrderingPage.selectRegion(REGION);

//             const isToggleOn = await tutorialOrderingPage.isTutorialToggleOn(activeTutorial, 'LoggedIn');
//             expect(isToggleOn).toBe(false);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_after_return');
//         });

//         test('TC-18 Verify Toggle on status persists across sessions', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             // Ensure we have an inactive tutorial to turn on
//             let targetTutorial = await tutorialOrderingPage.getFirstInactiveTutorial('LoggedOut');
//             if (!targetTutorial) {
//                 // All are already on — turn one off first so we can test turning it back on
//                 targetTutorial = await tutorialOrderingPage.getFirstActiveTutorial('LoggedOut');
//                 await tutorialOrderingPage.setTutorialToggleStatus(targetTutorial, 'LoggedOut', false);
//             }
//             expect(targetTutorial).toBeTruthy();

//             await tutorialOrderingPage.setTutorialToggleStatus(targetTutorial!, 'LoggedOut', true);
//             await tutorialOrderingPage.clickUpdate();
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_after_toggle_on_and_save');

//             // Navigate away and return
//             await page.goto('/main/home');
//             await page.waitForLoadState('networkidle');
//             await sidebarPage.navigateToTutorialOrdering();
//             await page.waitForLoadState('networkidle');

//             await tutorialOrderingPage.selectRegion(REGION);

//             const isToggleOn = await tutorialOrderingPage.isTutorialToggleOn(targetTutorial!, 'LoggedOut');
//             expect(isToggleOn).toBe(true);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_after_return');
//         });

//         test('TC-32 Verify simultaneous reordering in both lists', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
//             await tutorialOrderingPage.selectRegion(REGION);

//             const inCount  = await tutorialOrderingPage.getRowCount('LoggedIn');
//             const outCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//             expect(inCount,  `Betway Ghana LoggedIn has ${inCount} row(s) — need at least 2`).toBeGreaterThanOrEqual(2);
//             expect(outCount, `Betway Ghana LoggedOut has ${outCount} row(s) — need at least 2`).toBeGreaterThanOrEqual(2);

//             // Capture the name at index 1 in each list — we'll move these to position 1
//             const nameXToMoveToFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn',  1);
//             const nameYToMoveToFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 1);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_before_reorder');

//             await tutorialOrderingPage.dragRowToRow('LoggedIn',  1, 0);
//             await tutorialOrderingPage.dragRowToRow('LoggedOut', 1, 0);
//             await tutorialOrderingPage.clickUpdate();
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_after_save');

//             await sidebarPage.browserRefresh();
//             await tutorialOrderingPage.selectRegion(REGION);

//             const nameAtFirstIn  = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn',  0);
//             const nameAtFirstOut = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);

//             expect(nameAtFirstIn).toBe(nameXToMoveToFirst);
//             expect(nameAtFirstOut).toBe(nameYToMoveToFirst);
//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_after_refresh');
//         });
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Search / Filter Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-16 Verify Search bar functionality (Filtering Tutorials List)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         // Record ordering list row counts before search
//         const loggedInCountBefore  = await tutorialOrderingPage.getRowCount('LoggedIn');
//         const loggedOutCountBefore = await tutorialOrderingPage.getRowCount('LoggedOut');

//         // Search with a term that will narrow the Tutorials list
//         await tutorialOrderingPage.searchTutorials('GH_');
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_after_search');

//         // Ordering lists must be unchanged
//         const loggedInCountAfter  = await tutorialOrderingPage.getRowCount('LoggedIn');
//         const loggedOutCountAfter = await tutorialOrderingPage.getRowCount('LoggedOut');

//         expect(loggedInCountAfter).toBe(loggedInCountBefore);
//         expect(loggedOutCountAfter).toBe(loggedOutCountBefore);

//         await tutorialOrderingPage.clearSearch();
//     });

//     test('TC-27 Verify Search does not affect Logged In/Out list contents', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 row in LoggedIn`).toBeGreaterThan(0);

//         const nameAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);

//         // Search for a term that would hide nameAtFirst from the Tutorials list
//         await tutorialOrderingPage.searchTutorials('zzz_no_match_xyz');
//         await page.waitForTimeout(500);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_after_search');

//         // First item in LoggedIn list must be unaffected by the search
//         const nameAfterSearch = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(nameAfterSearch).toBe(nameAtFirst);

//         await tutorialOrderingPage.clearSearch();
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Order Number Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-21 Verify Order numbers auto-update on drag-and-drop', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 5 rows to test order-number shift`).toBeGreaterThanOrEqual(5);

//         // Drag item at position 5 (index 4) to position 2 (index 1)
//         await tutorialOrderingPage.dragRowToRow('LoggedIn', 4, 1);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_after_drag');

//         // Order numbers must still be 1, 2, 3, 4, 5, …
//         const ordersAfter = await tutorialOrderingPage.getOrderNumbers('LoggedIn');
//         for (let i = 0; i < ordersAfter.length; i++) {
//             expect(ordersAfter[i], `Row ${i} order number should be ${i + 1}`).toBe(i + 1);
//         }
//     });

//     test('TC-31 Verify Order numbers are always sequential (1, 2, 3...)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Need at least 2 rows for sequential order check`).toBeGreaterThanOrEqual(2);

//         // Perform several reorders to shake up the sequence
//         await tutorialOrderingPage.dragRowToRow('LoggedOut', 0, rowCount - 1);
//         if (rowCount >= 3) {
//             await tutorialOrderingPage.dragRowToRow('LoggedOut', 1, 0);
//         }
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_after_reorders');

//         const orders = await tutorialOrderingPage.getOrderNumbers('LoggedOut');
//         for (let i = 0; i < orders.length; i++) {
//             expect(orders[i], `Order at row ${i} should be ${i + 1} (no gaps or duplicates)`).toBe(i + 1);
//         }
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Region Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-22 Verify Region filter change updates ordering lists', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_initial_list');

//         // Pick any other available region dynamically — avoids hardcoding region names
//         const allRegions = await tutorialOrderingPage.getAvailableRegions();
//         const altRegion = allRegions.find(r => r !== REGION);
//         if (!altRegion) {
//             console.warn('TC-22: Only one region available in dropdown — skipping region-switch assertion');
//             return;
//         }

//         await tutorialOrderingPage.selectRegion(altRegion);
//         await page.waitForLoadState('networkidle');

//         await expect(tutorialOrderingPage.regionDropdown).toContainText(altRegion);
//         await expect(tutorialOrderingPage.loggedInTable).toBeVisible();
//         await expect(tutorialOrderingPage.loggedOutTable).toBeVisible();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_alt_region_list');
//     });

//     test('TC-33 Verify Region filter maintains toggle state', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 row to check toggle state`).toBeGreaterThan(0);

//         const firstTutorial = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         const toggleOnBefore = await tutorialOrderingPage.isTutorialToggleOn(firstTutorial, 'LoggedIn');

//         // Pick any other region dynamically — avoids hardcoding region names
//         const allRegions = await tutorialOrderingPage.getAvailableRegions();
//         const altRegion = allRegions.find(r => r !== REGION);
//         if (!altRegion) {
//             console.warn('TC-33: Only one region available — skipping region-switch part');
//             return;
//         }

//         await tutorialOrderingPage.selectRegion(altRegion);
//         await page.waitForTimeout(500);
//         await tutorialOrderingPage.selectRegion(REGION);
//         await page.waitForTimeout(500);

//         const toggleOnAfter = await tutorialOrderingPage.isTutorialToggleOn(firstTutorial, 'LoggedIn');
//         expect(toggleOnAfter).toBe(toggleOnBefore);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_toggle_state_after_region_switch');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Bidirectional Consistency Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-23 Verify Logged In toggle reflects inclusion in the Logged In list', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 tutorial in the LoggedIn list`).toBeGreaterThan(0);

//         const tutorialInList = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         const isToggleOn = await tutorialOrderingPage.isTutorialToggleOn(tutorialInList, 'LoggedIn');
//         expect(isToggleOn).toBe(true);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_loggedin_toggle_consistency');
//     });

//     test('TC-24 Verify Logged Out toggle reflects inclusion in the Logged Out list', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Need at least 1 tutorial in the LoggedOut list`).toBeGreaterThan(0);

//         const tutorialInList = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         const isToggleOn = await tutorialOrderingPage.isTutorialToggleOn(tutorialInList, 'LoggedOut');
//         expect(isToggleOn).toBe(true);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_loggedout_toggle_consistency');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Scrolling / Large Data Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-25 Verify Logged In ordering list handles high number of items (Scrolling)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 5 rows to test scrolling drag-and-drop`).toBeGreaterThanOrEqual(5);

//         // Scroll to last item
//         const lastRow = tutorialOrderingPage.loggedInTable.locator('tbody tr').last();
//         await lastRow.scrollIntoViewIfNeeded();
//         await expect(lastRow).toBeVisible();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_scrolled_to_bottom');

//         // Drag last item to the top
//         const nameAtLast = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', rowCount - 1);
//         await tutorialOrderingPage.dragRowToRow('LoggedIn', rowCount - 1, 0);

//         const nameAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(nameAtFirst).toBe(nameAtLast);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_after_cross_scroll_drag');
//     });

//     test('TC-26 Verify Logged Out ordering list handles high number of items (Scrolling)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Need more than 5 rows to test scrolling drag-and-drop`).toBeGreaterThan(5);

//         // Note item at top, scroll to bottom
//         const nameAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         const lastRow = tutorialOrderingPage.loggedOutTable.locator('tbody tr').last();
//         await lastRow.scrollIntoViewIfNeeded();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_scrolled_to_bottom');

//         // Drag first item to last position
//         await tutorialOrderingPage.dragRowToRow('LoggedOut', 0, rowCount - 1);

//         const nameAtLast = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', rowCount - 1);
//         expect(nameAtLast).toBe(nameAtFirst);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_after_cross_scroll_drag');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Drag Behaviour / Boundary Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-19 Verify Drag-and-Drop item remains visible during drag action', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 2 rows to test drag feedback`).toBeGreaterThanOrEqual(2);

//         // Verify the PrimeVue row-reorder handle SVG exists in each ordering row
//         const dragHandle = tutorialOrderingPage.loggedInTable
//             .locator('tbody tr').first()
//             .locator('.p-datatable-reorderablerow-handle').first();
//         const handleCount = await dragHandle.count();
//         // The drag handle should be present if row reorder is enabled
//         expect(handleCount).toBeGreaterThan(0);

//         // Verify the drag completes without error (item moves — proving drag-start was accepted)
//         const name0 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         await tutorialOrderingPage.dragRowToRow('LoggedIn', 0, 1);
//         const name0After = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(name0After).not.toBe(name0);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_drag_feedback');
//     });

//     test('TC-20 Verify Drag-and-Drop feedback on valid drop target', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedOut');
//         expect(rowCount, `Need at least 2 rows to test drop target feedback`).toBeGreaterThanOrEqual(2);

//         // Drag completes and item lands at the new position (implies a valid drop target was recognised)
//         const name1 = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 1);
//         await tutorialOrderingPage.dragRowToRow('LoggedOut', 1, 0);
//         const nameAfterAtFirst = await tutorialOrderingPage.getTutorialNameAtRow('LoggedOut', 0);
//         expect(nameAfterAtFirst).toBe(name1);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_drop_target_feedback');
//     });

//     test('TC-28 Verify Dragging a Tutorial out of the list boundary (Cancel drag)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 row to test out-of-boundary drag`).toBeGreaterThanOrEqual(1);

//         const name0Before = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);

//         // Use Playwright mouse API to drag and drop outside the table bounds
//         const firstRow = tutorialOrderingPage.loggedInTable.locator('tbody tr').first();
//         const box = await firstRow.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
//             await page.mouse.down();
//             await page.mouse.move(box.x + box.width / 2, box.y - 200, { steps: 10 }); // drag far above the table
//             await page.mouse.up();
//             await page.waitForTimeout(500);
//         }

//         const name0After = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(name0After).toBe(name0Before);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_cancel_drag');
//     });

//     test('TC-29 Verify Dragging item from Tutorials list (Not possible)', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 row to compare after drag attempt`).toBeGreaterThanOrEqual(1);

//         const nameAt0Before = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);

//         // Attempt to dispatch drag events from the Tutorials list (should have no effect on ordering lists)
//         const tutorialsFirstRow = tutorialOrderingPage.tutorialsTable.locator('tbody tr').first();
//         await tutorialsFirstRow.evaluate((el) => {
//             const dt = new DataTransfer();
//             el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
//             el.dispatchEvent(new DragEvent('dragend',   { bubbles: true, cancelable: true, dataTransfer: dt }));
//         });
//         await page.waitForTimeout(500);

//         // The LoggedIn ordering list must be unchanged
//         const nameAt0After = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);
//         expect(nameAt0After).toBe(nameAt0Before);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_tutorials_not_draggable');
//     });

//     // ═══════════════════════════════════════════════════════════
//     //  Data Consistency Tests (Independent)
//     // ═══════════════════════════════════════════════════════════

//     test('TC-30 Verify consistency of Tutorial Name between lists', async ({ page, tutorialOrderingPage }, testInfo) => {
//         await tutorialOrderingPage.selectRegion(REGION);

//         const rowCount = await tutorialOrderingPage.getRowCount('LoggedIn');
//         expect(rowCount, `Need at least 1 tutorial in LoggedIn list`).toBeGreaterThan(0);

//         // Get a tutorial from the LoggedIn ordering list
//         const tutorialName = await tutorialOrderingPage.getTutorialNameAtRow('LoggedIn', 0);

//         // Verify the same name appears in the Tutorials main list
//         const nameInMain = await tutorialOrderingPage.getTutorialNameInMainList(tutorialName);
//         expect(nameInMain).toBe(tutorialName);

//         // If the tutorial is also in the LoggedOut list, verify the name matches there too
//         const isInLoggedOut = await tutorialOrderingPage.isTutorialInList(tutorialName, 'LoggedOut');
//         if (isInLoggedOut) {
//             const rows = await tutorialOrderingPage.loggedOutTable.locator('tbody tr').all();
//             let foundMatch = false;
//             for (const row of rows) {
//                 const name = (await row.locator('td').nth(2).innerText()).trim();
//                 if (name === tutorialName) { foundMatch = true; break; }
//             }
//             expect(foundMatch, `'${tutorialName}' should appear identically in the LoggedOut list`).toBe(true);
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_name_consistency');
//     });

// });
