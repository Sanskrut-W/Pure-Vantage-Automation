import { test, expect } from '../fixtures/baseFixture';
import { PromotionConfigPage } from '../pages/PromotionConfigPage';
import { CommonUtils } from '../utils/commonUtils';

test.describe("Ladder Promotion Test Suite", () => {
    test("Navigate to Promotion config page from sidebar", async ({ page, sidebarPage, promotionConfigPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad()

        await sidebarPage.navigateToPromotionConfig();
        await expect(page).toHaveURL(/.*la/)

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(400000);
    })




})