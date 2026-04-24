// npx playwright test tests/bannerOrdering.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Banner Ordering Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, bannerPage }) => {
        // Shared navigation setup specifically for these 3 tests
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToBannerOrdering();
        await expect(page).toHaveURL(/.*banner-ordering/);
        await bannerPage.waitForPageLoad(); // We reuse bannerPage wait logic since it abstracts generic loads
    });

    test('TC-1 Verify Banner Ordering Page is accessible', async ({ page }) => {
        // Validation that the page has loaded happens inherently in the beforeEach block
        // We ensure we logically land on the newly routed URL
        await expect(page).toHaveURL(/.*banner-ordering/);
    });

    test('TC-2 Verify Search bar and Region Filter are available', async ({ bannerPage, page }, testInfo) => {
        // SPA elements can take a while to fetch and render. We wait up to 20s for the element to appear.
        try {
            await expect(bannerPage.orderingSearchInput).toBeVisible({ timeout: 20000 });
            await expect(bannerPage.orderingRegionDropdown).toBeVisible();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_banner_ordering_page');
        } catch (e) {
            console.log('Timeout hit. Dumping HTML and taking emergency screenshot for debugging...');
            const fs = require('fs');
            fs.writeFileSync('reports/debug-ordering.html', await page.content());
            await page.screenshot({ path: 'reports/debug-ordering-screenshot.png', fullPage: true });
            throw e;
        }
    });

    test('TC-3 Verify Region Filter Functionality', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        // Assert the dropdown retained the selected value
        // Note: modify this text assertion to match how the actual app formats the selection
        await expect(bannerPage.orderingRegionDropdown).toHaveText('Betway GhanaBetway Ghana');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_region_filter');
    });

    test('TC-4 Verify Structure: Banners and Ordering Lists', async ({ bannerPage, page }, testInfo) => {
        // Table layout conditionally renders after region selection
        await bannerPage.selectOrderingRegion('Betway Ghana');

        await expect(bannerPage.bannersTable).toBeVisible();
        await expect(bannerPage.loggedInTable).toBeVisible();
        await expect(bannerPage.loggedOutTable).toBeVisible();

        // Verify Headers of Logged In table
        await expect(bannerPage.loggedInTable.locator('th').nth(1)).toHaveText('Order');
        await expect(bannerPage.loggedInTable.locator('th').nth(2)).toHaveText('Banner Name');

        // Verify Headers of Logged Out table
        await expect(bannerPage.loggedOutTable.locator('th').nth(1)).toHaveText('Order');
        await expect(bannerPage.loggedOutTable.locator('th').nth(2)).toHaveText('Banner Name');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_table_structure');
    });

    test('TC-5 Verify Logged In Toggle functionality (Disappear)', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        // 2. Identify a banner currently active in the Logged In list
        const activeBanner = await bannerPage.getFirstActiveBanner('LoggedIn');
        expect(activeBanner).toBeTruthy();

        // 3. Toggle OFF in Banners list
        await bannerPage.setBannerToggleStatus(activeBanner, 'LoggedIn', false);

        // Verify it disappeared from Logged In Ordering list
        const isStillVisible = await bannerPage.isBannerInList(activeBanner, 'LoggedIn');
        expect(isStillVisible).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_toggle_off_loggedin');
    });

    test('TC-6 Verify Logged Out Toggle functionality (Disappear)', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        const activeBanner = await bannerPage.getFirstActiveBanner('LoggedOut');
        expect(activeBanner).toBeTruthy();

        await bannerPage.setBannerToggleStatus(activeBanner, 'LoggedOut', false);

        const isStillVisible = await bannerPage.isBannerInList(activeBanner, 'LoggedOut');
        expect(isStillVisible).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_toggle_off_loggedout');
    });

    test('TC-7 Verify Logged In Toggle functionality (Reappear)', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        // Ensure there is an inactive banner by extracting one. If none exists, make one inactive.
        let inactiveBanner = await bannerPage.getFirstInactiveBanner('LoggedIn');
        if (!inactiveBanner) {
            inactiveBanner = await bannerPage.getFirstActiveBanner('LoggedIn');
            await bannerPage.setBannerToggleStatus(inactiveBanner, 'LoggedIn', false);
        }
        expect(inactiveBanner).toBeTruthy();

        // 3. Toggle ON
        await bannerPage.setBannerToggleStatus(inactiveBanner, 'LoggedIn', true);

        // Verify it reappeared in Logged In Ordering list
        const isNowVisible = await bannerPage.isBannerInList(inactiveBanner, 'LoggedIn');
        expect(isNowVisible).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_toggle_on_loggedin');
    });

    test('TC-8 Verify Logged Out Toggle functionality (Reappear)', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        let inactiveBanner = await bannerPage.getFirstInactiveBanner('LoggedOut');
        if (!inactiveBanner) {
            inactiveBanner = await bannerPage.getFirstActiveBanner('LoggedOut');
            await bannerPage.setBannerToggleStatus(inactiveBanner, 'LoggedOut', false);
        }
        expect(inactiveBanner).toBeTruthy();

        await bannerPage.setBannerToggleStatus(inactiveBanner, 'LoggedOut', true);

        const isNowVisible = await bannerPage.isBannerInList(inactiveBanner, 'LoggedOut');
        expect(isNowVisible).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_toggle_on_loggedout');
    });

    test('TC-9 Verify Logged In List: Drag-and-Drop to adjacent position', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        const rowCount = await bannerPage.getRowCount('LoggedIn');
        if (rowCount < 2) test.skip(); // Requires at least 2 items to drag and drop

        const sourceIndex = 0; // Position 1 (N)
        const targetIndex = 1; // Position 2 (N+1)

        const bannerBeforeAt1 = await bannerPage.getBannerNameAtRow('LoggedIn', sourceIndex);
        const bannerBeforeAt2 = await bannerPage.getBannerNameAtRow('LoggedIn', targetIndex);

        await bannerPage.dragRowToRow('LoggedIn', sourceIndex, targetIndex);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_drag_drop_loggedin_adjacent_before');

        // Items should be cleanly swapped at those specific immediate nodes
        const bannerAfterAt1 = await bannerPage.getBannerNameAtRow('LoggedIn', sourceIndex);
        const bannerAfterAt2 = await bannerPage.getBannerNameAtRow('LoggedIn', targetIndex);

        expect(bannerAfterAt1).toBe(bannerBeforeAt2);
        expect(bannerAfterAt2).toBe(bannerBeforeAt1);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_drag_drop_loggedin_adjacent_after');
    });

    test('TC-10 Verify Logged Out List: Drag-and-Drop to adjacent position', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        const rowCount = await bannerPage.getRowCount('LoggedOut');
        if (rowCount < 2) test.skip();

        const sourceIndex = 0;
        const targetIndex = 1;

        const bannerBeforeAt1 = await bannerPage.getBannerNameAtRow('LoggedOut', sourceIndex);
        const bannerBeforeAt2 = await bannerPage.getBannerNameAtRow('LoggedOut', targetIndex);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_drag_drop_loggedout_adjacent_before');

        await bannerPage.dragRowToRow('LoggedOut', sourceIndex, targetIndex);

        const bannerAfterAt1 = await bannerPage.getBannerNameAtRow('LoggedOut', sourceIndex);
        const bannerAfterAt2 = await bannerPage.getBannerNameAtRow('LoggedOut', targetIndex);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_drag_drop_loggedout_adjacent_after');

        expect(bannerAfterAt1).toBe(bannerBeforeAt2);
        expect(bannerAfterAt2).toBe(bannerBeforeAt1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_drag_drop_loggedout_adjacent');
    });

    test('TC-11 Verify Logged In List: Drag-and-Drop to first position', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        const rowCount = await bannerPage.getRowCount('LoggedIn');
        if (rowCount < 2) test.skip();

        // Grab item from position 6 (index 5) or lowest valid index representing 'middle/bottom'
        const sourceIndex = rowCount > 5 ? 5 : rowCount - 1;
        const targetIndex = 0; // Position 1

        const bannerBeforeAtSource = await bannerPage.getBannerNameAtRow('LoggedIn', sourceIndex);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_drag_drop_loggedin_first_before');

        await bannerPage.dragRowToRow('LoggedIn', sourceIndex, targetIndex);

        const bannerAfterAtTarget = await bannerPage.getBannerNameAtRow('LoggedIn', targetIndex);

        expect(bannerAfterAtTarget).toBe(bannerBeforeAtSource);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_drag_drop_loggedin_first');
    });

    test('TC-12 Verify Logged Out List: Drag-and-Drop to last position', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');
        const rowCount = await bannerPage.getRowCount('LoggedOut');
        if (rowCount < 2) test.skip();
        const sourceIndex = 0; // Position 1
        const targetIndex = rowCount - 1; // Last position element
        const bannerBeforeAt1 = await bannerPage.getBannerNameAtRow('LoggedOut', sourceIndex);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_drag_drop_loggedout_last_before');
        await bannerPage.dragRowToRow('LoggedOut', sourceIndex, targetIndex);
        const bannerAfterAtTarget = await bannerPage.getBannerNameAtRow('LoggedOut', targetIndex);
        expect(bannerAfterAtTarget).toBe(bannerBeforeAt1);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_drag_drop_loggedout_last');
    });

    test('TC-13 Verify Drag-and-Drop does not affect the other list', async ({ bannerPage, page }, testInfo) => {
        await bannerPage.selectOrderingRegion('Betway Ghana');

        const outCount = await bannerPage.getRowCount('LoggedOut');
        const inCount = await bannerPage.getRowCount('LoggedIn');

        if (outCount < 3 || inCount < 2) test.skip(); // Requires at least 3 to check position 3 safely

        const positionToCheck = 2; // Position 3 (0-based scale)

        // 2. Note Logged Out position 3
        const loggedOutRef = await bannerPage.getBannerNameAtRow('LoggedOut', positionToCheck);

        // 3. Significant reorder in Logged In (swap index 1 and 0 heavily)
        await bannerPage.dragRowToRow('LoggedIn', 1, 0);

        // 4. Check Logged Out position 3 remained strictly cleanly isolated and unaffected
        const loggedOutAfter = await bannerPage.getBannerNameAtRow('LoggedOut', positionToCheck);

        expect(loggedOutAfter).toBe(loggedOutRef);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_drag_drop_isolated');
    });

});