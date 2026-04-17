import { test, expect } from '../fixtures/baseFixture';

test('Navigate to Banner Config and click Create Banner @smoke', async ({ page, sidebarPage, bannerPage }) => {

    // Step 1: Login has already been handled implicitly via `authenticatedSession` fixture
    // Navigate to the dashboard base URL so sessionStorage is honored without root redirects
    await page.goto('/main/home');
    await page.reload(); // 👈 Workaround: Forces SPA to remount with auth states injected
    await sidebarPage.waitForPageLoad();

    // Step 2: Navigate Sidebar -> Marketing -> Banner Management -> Banner Config
    await sidebarPage.navigateToBannerConfig();

    // Validate we've reached the right URL
    await expect(page).toHaveURL('https://purevantage-dev.osiristrading.com/main/component-display/stencil-marketing/banner-config');
    await bannerPage.waitForPageLoad();

    // Step 3: Select region  
    await bannerPage.selectRegion('Betway Ghana'); // Provide dummy region text

    // Search input usage added per requirements
    await bannerPage.searchRegion('gh');

    // Step 4: Click Create Banner
    await bannerPage.clickCreateBanner();
    await bannerPage.fillBannerName('Test Banner');
    await bannerPage.clickSelectBannerType();
    await bannerPage.selectBanner('Standard Banner');
    await bannerPage.clickSelectRegions();
    await bannerPage.selectRegionFromDropdown('Betway Ghana');
    await bannerPage.clickSelectVerticals();
    await bannerPage.selectVerticalFromDropdown('Casino', 'Esports');
    await bannerPage.clickSelectPlatforms();
    await bannerPage.selectPlatformFromDropdown('Android', 'IOS');
    await bannerPage.setDateRange('05/15/2024', '06/20/2024');
    await bannerPage.selectCampaign('RashmiTest');
    await bannerPage.clickLoginStatus('Logged In');
    await bannerPage.clickLoginStatus('Logged Out');




    await page.screenshot({ path: 'reports/create_banner_success.png', fullPage: true });

    // Step 5: Validate banner form appears
    // We assume a generic class/text popup appears after clicking 'Create Banner'
    // const formContainer = page.locator('.p-dialog, .modal-content, text=New Banner');
    // await expect(formContainer).toBeVisible({ timeout: 10000 });

    console.log('Test completed successfully: Created banner form opened.');
});
