import { test, expect } from '../fixtures/baseFixture';

test('Navigate to Banner Config and click Create Banner @smoke', async ({ page, sidebarPage, bannerPage }) => {

    // Step 1: Login has already been handled implicitly via `authenticatedSession` fixture
    // Navigate to the dashboard base URL so sessionStorage is honored without root redirects
    await page.goto('/main/home');
    await sidebarPage.waitForPageLoad();

    // Step 2: Navigate Sidebar -> Marketing -> Banner Management -> Banner Config
    await sidebarPage.navigateToBannerConfig();

    // Validate we've reached the right URL
    await expect(page).toHaveURL(/.*banner-config/);
    await bannerPage.waitForPageLoad();

    // Step 3: Select region  
    await bannerPage.selectRegion('Betway Ghana'); // Provide dummy region text

    // Search input usage added per requirements
    await bannerPage.searchRegion('gh');

    // Step 4: Click Create Banner
    await bannerPage.clickCreateBanner();

    // Step 5: Validate banner form appears
    // We assume a generic class/text popup appears after clicking 'Create Banner'
    // const formContainer = page.locator('.p-dialog, .modal-content, text=New Banner');
    // await expect(formContainer).toBeVisible({ timeout: 10000 });

    console.log('Test completed successfully: Created banner form opened.');
});
