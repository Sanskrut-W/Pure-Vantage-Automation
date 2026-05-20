import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Generic wheel Feature Tests', () => {

    test.beforeEach(async ({ page, genericWheelPage, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToGenericWheel();
        await genericWheelPage.waitForPageLoad();
    });


    test("TC-1 Verify Generic Wheel Page is accessible", async ({ page }, testInfo) => {
        await expect(page).toHaveURL(/.*generic-wheel/)
    })

    test('TC-2 Verify all the elements on generic wheel landing page', async ({ page, genericWheelPage }, testInfo) => {
        await expect(genericWheelPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(genericWheelPage.regionDropdown);
        await expect(genericWheelPage.createPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(genericWheelPage.createPromotionBtn);
        await expect(genericWheelPage.editBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(genericWheelPage.editBtn);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_generic_wheel_page');
    });

    test('TC-3 Verify Region Filter Functionality', async ({ genericWheelPage, page }, testInfo) => {
        await genericWheelPage.selectRegion('Betway Ghana');
        await expect(genericWheelPage.regionDropdown).toHaveText('Betway Ghana');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_region_filter');
    });

    test("TC-4 Verify Create promotion functionality", async ({ page, genericWheelPage }, testInfo) => {
        await genericWheelPage.clickCreatePromotion()
        await genericWheelPage.promotionNameInput.waitFor({ state: 'visible', timeout: 20000 })
        await genericWheelPage.promotionNameInput.fill("test promotion")
        await genericWheelPage.selectAllocationStrategy('Sequential');
        await genericWheelPage.spinsPerUserInput.fill('100');
        await genericWheelPage.dailySpinLimitInput.fill('10');
        await genericWheelPage.spinValidityDaysInput.fill('10');
        await genericWheelPage.numberOfSlicesInput.fill('5');
        // await genericWheelPage.selectRegionInPopup('Betway Ghana');
        await genericWheelPage.redirectUrlInput.fill('https://www.example.com');
        await genericWheelPage.ticketPrefixInput.fill('TEST');
        await genericWheelPage.minimumWagerInput.fill('10');
        await genericWheelPage.page.waitForTimeout(5000);
        await genericWheelPage.cancelButton.click();
        await genericWheelPage.page.waitForTimeout(5000);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_create_promotion');
    })
});