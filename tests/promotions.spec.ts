import { test, expect } from '../fixtures/baseFixture';
import { PromotionConfigPage } from '../pages/PromotionConfigPage';
import { CommonUtils } from '../utils/commonUtils';

test.describe("Promotion config test suite", () => {
    var globalpromotionName: string;
    test.beforeEach("Navigate to Promotion config page from sidebar", async ({ page, sidebarPage, promotionConfigPage }) => {
        await page.goto('/main/component-display/stencil-marketing/promotion-config');
        await page.waitForLoadState('networkidle');
    })
    // test("TC-0 : Navigate to Promotion config page from sidebar", async ({ page, sidebarPage, promotionConfigPage }) => {
    //     await page.goto('/main/home');
    //     await page.reload();
    //     await sidebarPage.waitForPageLoad()

    //     await sidebarPage.navigateToPromotionConfig();
    //     await expect(page).toHaveURL(/.*promotion-config/)

    //     await page.waitForLoadState('networkidle');
    // })

    test("TC-1 Verify presence of Create Promotion button", async ({ page, promotionConfigPage }, testInfo) => {
        await expect(promotionConfigPage.createPromotionBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(promotionConfigPage.createPromotionBtn);
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-1 Verify presence of Create Promotion button');

    });

    test("TC-2 Verify presence of Edit Promotion button", async ({ page, promotionConfigPage }, testInfo) => {
        await expect(promotionConfigPage.editBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(promotionConfigPage.editBtn.first());
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-1 Verify presence of Edit Promotion button');
    });

    test("TC-3 Verify presence of Schedule Promotion button", async ({ page, promotionConfigPage }, testInfo) => {
        await expect(promotionConfigPage.scheduleBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(promotionConfigPage.scheduleBtn.first());
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-1 Verify presence of Schedule Promotion button');
    });

    test("TC-4 Verify presence of Delete Promotion button", async ({ page, promotionConfigPage }, testInfo) => {
        await expect(promotionConfigPage.deleteBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(promotionConfigPage.deleteBtn.first());
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-2 Verify presence of Delete Promotion button');
    });

    test("TC-5 Verify Create promotion button functionality", async ({ page, promotionConfigPage }, testInfo) => {
        const promoName = 'Create->' + CommonUtils.generateRandomString(6)
        await promotionConfigPage.createPromotion(promoName);
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-5 Verify functionality of Create Promotion button');
    });
    test("TC-6 Verify copy promotion button", async ({ page, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.copyBtn.first().click();
        await expect(promotionConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(promotionConfigPage.dialog);
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-6 Verify functionality of Create Promotion button');
    });
    test("TC-7 Verify copy promotion button functionality", async ({ page, promotionConfigPage }, testInfo) => {
        const copyName = await promotionConfigPage.clonePromotion();
        await expect(promotionConfigPage.page.getByText(copyName)).toBeVisible({ timeout: 20000 });
        globalpromotionName = copyName;
        await CommonUtils.highlightElement(promotionConfigPage.page.getByText(copyName));
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-7 Verify functionality of Create Promotion button');
    });


    test("TC-8 Verify delete promotion button functionality", async ({ page, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.deleteBtn.first().click();
        await expect(promotionConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(promotionConfigPage.dialog);
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-8 Verify functionality of Create Promotion button');
    });


    test("TC-9 Verify delete promotion button functionality and tapping 'Yes'", async ({ page, promotionConfigPage }, testInfo) => {
        const promoname = 'Delete Promo through automation ->YES-' + CommonUtils.generateRandomString(6)
        await promotionConfigPage.createPromotion(promoname);
        globalpromotionName = promoname;
        await promotionConfigPage.DeleteFirstPromotion(globalpromotionName, true);
        await expect(promotionConfigPage.page.getByText(globalpromotionName)).not.toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-10 Verify functionality of Create Promotion button');
    });


    test("TC-10 Verify delete promotion button and then tapping 'NO' ", async ({ page, promotionConfigPage }, testInfo) => {
        const promoname = 'Delete promo through automation->No-' + CommonUtils.generateRandomString(6)
        await promotionConfigPage.createPromotion(promoname);
        globalpromotionName = promoname;
        await promotionConfigPage.DeleteFirstPromotion(globalpromotionName, false);
        await expect(promotionConfigPage.page.getByText(globalpromotionName)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(promotionConfigPage.page.getByText(globalpromotionName));
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-10 Verify functionality of Create Promotion button');
    });

    test("TC-11 Verify edit promotion button functionality", async ({ page, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.editBtn.first().waitFor({ state: 'visible', timeout: 30000 });
        await promotionConfigPage.editBtn.first().click();
        await expect(promotionConfigPage.page).toHaveURL(/.*promotion-config-edit/);
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-11 Verify functionality of Edit Promotion button');
    });

    test("TC-12 Edit promotion details and navigating back", async ({ promotionConfigPage }, testInfo) => {
        await promotionConfigPage.editBtn.first().waitFor({ state: 'visible', timeout: 30000 });
        await promotionConfigPage.editBtn.first().click();
        await promotionConfigPage.page.waitForLoadState('networkidle');
        await CommonUtils.highlightElement(promotionConfigPage.page.getByRole('button', { name: "Update Promotion Details" }).locator('..').getByRole('button').first());
        await promotionConfigPage.page.getByRole('button', { name: "Update Promotion Details" }).locator('..').getByRole('button').first().click();
        await expect(promotionConfigPage.page).toHaveURL(/.*promotion-config/);
        await promotionConfigPage.page.waitForLoadState('networkidle');
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-12 Edit promotion details');
    });

    test("TC-13 Edit promotion details", async ({ promotionConfigPage }, testInfo) => {
        let editedName = await promotionConfigPage.editPromotion(globalpromotionName);
        await promotionConfigPage.page.getByRole('button', { name: "Update Promotion Details" }).locator('..').getByRole('button').first().click();
        await promotionConfigPage.page.waitForLoadState('networkidle');
        await expect(promotionConfigPage.page.getByText(editedName)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(promotionConfigPage.page.getByText(editedName));
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-13 Edit promotion details form submit');
    });
    test("TC-14 Verify Edit Page Content", async ({ promotionConfigPage }, testInfo) => {
        await promotionConfigPage.editBtn.first().click();
        await promotionConfigPage.page.waitForLoadState('networkidle');
        await promotionConfigPage.VerifyEditPageContent();
        await CommonUtils.captureScreenshot(promotionConfigPage.page, testInfo, 'reports/screenshots', 'TC-14 Verify Edit Promotion page content');
    });







})