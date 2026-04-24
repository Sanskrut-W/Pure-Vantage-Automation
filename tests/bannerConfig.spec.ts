// npx playwright test tests/bannerConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
test.describe('Banner Configuration Specific Feature Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, bannerPage }) => {
        // Shared navigation setup specifically for these 4 tests
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToBannerConfig();
        await expect(page).toHaveURL(/.*banner-config/);
        await bannerPage.waitForPageLoad();
    });

    test('TC-1 Navigate to Banner Config and click Create Banner @smoke', async ({ page, bannerPage }, testInfo) => {
        await bannerPage.createBanner();

        // Take a screenshot and automatically attach it to the HTML report
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_create_banner_success');

        console.log('Test completed successfully: Created banner form opened.');
    });

    test('TC-1 Verify all the elements on banner configuration landing page', async ({ page, bannerPage }, testInfo) => {
        // Verify Select Region dropdown (granting extra time for initial PrimeVue framework SPA rendering)
        await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
        // Verify Create Banner button
        await expect(bannerPage.createBannerBtn).toBeVisible();
        // Verify Search bar
        await expect(bannerPage.searchInput).toBeVisible();
        const tableContainer = bannerPage.page.locator('.p-datatable');
        if (await tableContainer.count() > 0) {
            await expect(tableContainer).toBeVisible();
        }
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_banner_config_page');
    });

    test('TC-2 Verify we are able to select required region in select region dropdown', async ({ page, bannerPage }, testInfo) => {
        await bannerPage.selectRegion('Betway Ghana');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_banner_config_page');
    });

    test('TC-3 Verify we are able to select required region (select another region) in select region dropdown', async ({ page, bannerPage }, testInfo) => {
        await bannerPage.selectRegion('Betway Ghana');
        await bannerPage.selectRegion('Betway Zambia');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_select_another_region');
    });

    test('TC-4 Verify Create Banner button functionality', async ({ page, bannerPage }, testInfo) => {
        await bannerPage.selectRegion('Betway Ghana');
        await bannerPage.clickCreateBanner();
        const dialog = bannerPage.page.locator('.p-dialog, .p-sidebar, [role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_create_banner');
    });

});
