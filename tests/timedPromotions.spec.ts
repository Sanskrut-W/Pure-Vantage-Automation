import { verify } from 'crypto';
import { test, expect } from '../fixtures/baseFixture';
import { TimedPromotionsPage } from '../pages/TimedPromotionsPage';
import { CommonUtils } from '../utils/commonUtils';

test.describe("Timed Promotions test suite", () => {
    let globalPromoName: string = '';

    test.beforeEach("Navigate to Timed Promotions page from sidebar", async ({ page, sidebarPage }) => {
        await page.goto('/main/component-display/stencil-marketing/timed-promotions');
        await page.reload();
        await sidebarPage.waitForPageLoad();
    });

    test("TC-1 Verify presence of Create Timed Promotion button", async ({ timedPromotionsPage }, testInfo) => {
        await expect(timedPromotionsPage.createTimedPromotionBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(timedPromotionsPage.createTimedPromotionBtn);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-1 Verify presence of Create Timed Promotion button');
    });

    test("TC-2 Verify presence of Edit Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const editOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Edit', { exact: true });
        await expect(editOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(editOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-2 Verify presence of Edit Option');
    });

    test("TC-3 Verify presence of Activate Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const activateOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Activate', { exact: true });
        await expect(activateOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(activateOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-3 Verify presence of Activate Option');
    });

    test("TC-4 Verify presence of Approve Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const approveOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Approve', { exact: true });
        await expect(approveOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(approveOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-4 Verify presence of Approve Option');
    });

    test("TC-5 Verify presence of Opt In Triggers Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const optInOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Opt In Triggers', { exact: true });
        await expect(optInOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(optInOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-5 Verify presence of Opt In Triggers Option');
    });

    test("TC-6 Verify presence of Hourly Configuration Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const hourlyOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Hourly Configuration', { exact: true });
        await expect(hourlyOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(hourlyOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-6 Verify presence of Hourly Configuration Option');
    });

    test("TC-7 Verify presence of Delete Option in Ellipsis Menu", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickEllipsisMenuForRow(0);
        const deleteOption = page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText('Delete', { exact: true });
        await expect(deleteOption).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(deleteOption);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-7 Verify presence of Delete Option');
    });

    test("TC-8 Verify Create Timed Promotion functionality", async ({ timedPromotionsPage }, testInfo) => {
        const promoName = 'test-timed-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoName, 'Automation created timed promotion');
        await expect(timedPromotionsPage.page.getByText(promoName).first()).toBeVisible({ timeout: 20000 });
        globalPromoName = promoName;
        await CommonUtils.highlightElement(timedPromotionsPage.page.getByText(promoName).first());
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-8 Verify Create Timed Promotion functionality');
    });

    test("TC-9 Verify Delete option click displays confirmation dialog", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.clickEllipsisMenuForPromo(targetPromo);
        await timedPromotionsPage.clickEllipsisOption('Delete');
        const confirmDialog = timedPromotionsPage.container.getByText('Are you sure you want to delete this timed promotion?');
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(confirmDialog);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-9 Verify Delete option click displays confirmation dialog');
    });

    test("TC-10 Verify delete functionality by clicking 'Yes'", async ({ timedPromotionsPage }, testInfo) => {
        const promoToDelete = 'delete-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToDelete, 'To be deleted');
        await timedPromotionsPage.DeleteFirstTimedPromotion(promoToDelete);
        await expect(timedPromotionsPage.page.getByText(promoToDelete)).not.toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-10 Verify delete functionality by clicking Yes');
    });

    test("TC-11 Verify delete confirmation cancel by clicking 'No'", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToKeep = 'keep-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToKeep, 'Should not be deleted');

        await timedPromotionsPage.clickEllipsisMenuForPromo(promoToKeep);
        await timedPromotionsPage.clickEllipsisOption('Delete');

        const confirmDialog = page.getByText('Are you sure you want to delete this timed promotion?');
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        const noButton = confirmDialog.locator('..').locator('..').getByRole('button').filter({ hasText: 'No' });
        await timedPromotionsPage.clickElement(noButton);
        await expect(timedPromotionsPage.page.getByText(promoToKeep).first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(timedPromotionsPage.page.getByText(promoToKeep).first());
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-11 Verify delete confirmation cancel by clicking No');
    });

    test("TC-12 Verify Edit option click navigates to edit page URL", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToEdit = 'edit-url-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToEdit, 'To test edit URL');

        await timedPromotionsPage.clickEllipsisMenuForPromo(promoToEdit);
        await timedPromotionsPage.clickEllipsisOption('Edit');
        await expect(timedPromotionsPage.dialog.getByText('Update Timed Promotion')).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(timedPromotionsPage.dialog.getByText('Update Timed Promotion'));
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-12 Verify Edit option navigates to edit page URL');
    });

    test("TC-13 Edit details and navigate back without saving", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToEdit = 'edit-back-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToEdit, 'To test edit back');

        await timedPromotionsPage.clickEllipsisMenuForPromo(promoToEdit);
        await timedPromotionsPage.clickEllipsisOption('Edit');

        await timedPromotionsPage.clickCancelBtn();
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-13 Edit details and navigate back');
    });

    test("TC-14 Edit details and save successfully", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToEdit = 'edit-save-test-' + CommonUtils.generateRandomString(6);
        const editedName = 'edited-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToEdit, 'To test edit save');

        await timedPromotionsPage.editTimedPromotion(promoToEdit, editedName);

        await expect(page.getByText(editedName).first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(page.getByText(editedName).first());
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-14 Edit details and save successfully');
    });

    test("TC-15 Verify Edit page content/fields", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToVerify = 'edit-fields-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToVerify, 'To test edit fields');

        await timedPromotionsPage.clickEllipsisMenuForPromo(promoToVerify);
        await timedPromotionsPage.clickEllipsisOption('Edit');
        await page.waitForLoadState('networkidle');

        await timedPromotionsPage.verifyEditPageContent();
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-15 Verify Edit page content');
    });

    // Activate Tests
    test("TC-16 Verify Activate option click displays confirmation dialog", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.clickEllipsisMenuForPromo(targetPromo);
        await timedPromotionsPage.clickEllipsisOption('Activate');
        const confirmDialog = timedPromotionsPage.container.getByText('Activate Timed Promotion').or(timedPromotionsPage.container.getByText('Are you sure you want to activate')).first();
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(confirmDialog);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-16 Verify Activate option click displays dialog');
    });

    test("TC-17 Verify activate functionality by clicking 'Yes'", async ({ timedPromotionsPage }, testInfo) => {
        const promoToActivate = 'act-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToActivate, 'To be activated');
        await timedPromotionsPage.activateTimedPromotion(promoToActivate, true);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-17 Verify activate functionality clicking Yes');
    });

    test("TC-18 Verify activate confirmation cancel by clicking 'No'", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToKeepInact = 'act-cancel-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToKeepInact, 'Should not be activated');
        await timedPromotionsPage.activateTimedPromotion(promoToKeepInact, false);

        await expect(timedPromotionsPage.page.getByText(promoToKeepInact).first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-18 Verify activate confirmation cancel clicking No');
    });

    // Approve Tests
    test("TC-19 Verify Approve option click displays confirmation dialog", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.clickEllipsisMenuForPromo(targetPromo);
        await timedPromotionsPage.clickEllipsisOption('Approve');
        const confirmDialog = timedPromotionsPage.container.getByText('Approve Timed Promotion').or(timedPromotionsPage.container.getByText('Are you sure you want to approve this promotion?')).first();
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(confirmDialog);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-19 Verify Approve option click displays dialog');
    });

    test("TC-20 Verify approve functionality by clicking 'Yes' and checking Approved By column", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToApprove = 'appr-test-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToApprove, 'To be approved');
        await timedPromotionsPage.approveTimedPromotion(promoToApprove, true);

        // Reload page and check Approved By column
        await page.reload();
        await timedPromotionsPage.waitForPageLoad();

        const approvedBy = await timedPromotionsPage.getApprovedByValue(promoToApprove);
        expect(approvedBy).toContain('Rashmi.Aundhkar@supergroup.com');

        const cell = timedPromotionsPage.tableRows.filter({ hasText: promoToApprove }).locator('td').nth(8);
        await CommonUtils.highlightElement(cell);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-20 Verify approve functionality checking Approved By column');
    });

    test("TC-21 Verify approve confirmation cancel by clicking 'No'", async ({ page, timedPromotionsPage }, testInfo) => {
        const promoToCancelApprove = 'appr-cancel-' + CommonUtils.generateRandomString(6);
        await timedPromotionsPage.createTimedPromotion(promoToCancelApprove, 'Approve to be cancelled');
        await timedPromotionsPage.approveTimedPromotion(promoToCancelApprove, false);

        // Reload page and verify Approved By remains empty
        await page.reload();
        await timedPromotionsPage.waitForPageLoad();
        const approvedBy = await timedPromotionsPage.getApprovedByValue(promoToCancelApprove);
        expect(approvedBy).not.toContain('Rashmi.Aundhkar@supergroup.com');

        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-21 Verify approve confirmation cancel clicking No');
    });

    // Opt In Triggers Tests
    test("TC-22 Verify Opt In Triggers option click displays dialog", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.openOptInTriggers(targetPromo);
        await timedPromotionsPage.page.waitForLoadState('networkidle')
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-22 Verify Opt In Triggers option click displays dialog');
    });

    test("TC-23 Verify Opt In Triggers dialog close functionality", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.openOptInTriggers(targetPromo);
        await timedPromotionsPage.page.waitForTimeout(2000);
        await timedPromotionsPage.page.locator('#component-container').getByRole('button').first().click();
        await expect(timedPromotionsPage.page).toHaveURL(/.*timed-promotions/)
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-23 Verify Opt In Triggers dialog close functionality');
    });

    test("TC-24 Create Opt In for a particular Promotion", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = 'Automation Test';
        const optInValue = await timedPromotionsPage.openOptInTriggers(targetPromo);
        await timedPromotionsPage.page.waitForTimeout(2000);
        const optInValueafter = await timedPromotionsPage.createOptIn(optInValue);
        await timedPromotionsPage.verifyOptInValues(optInValueafter, targetPromo);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-23 Verify Opt In Triggers dialog close functionality');
    });


    // Hourly Configuration Tests
    test("TC-25 Verify Hourly Configuration option click displays dialog", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.openHourlyConfiguration(targetPromo);
        await timedPromotionsPage.page.waitForLoadState('networkidle')
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-24 Verify Hourly Configuration option click displays dialog');
    });

    test("TC-26 Verify Hourly Configuration dialog close functionality", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        await timedPromotionsPage.openHourlyConfiguration(targetPromo);
        await page.waitForTimeout(2000);
        await timedPromotionsPage.page.locator('#component-container').getByRole('button').first().click();
        await expect(timedPromotionsPage.page).toHaveURL(/.*timed-promotions/)
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-25 Verify Hourly Configuration dialog close functionality');
    });


    test("TC-27 Create Hourly Config for a particular Promotion ", async ({ page, timedPromotionsPage }, testInfo) => {
        const targetPromo = globalPromoName || 'Automation Test';
        const hourlyConfigValue = await timedPromotionsPage.openHourlyConfiguration(targetPromo);
        await page.waitForTimeout(2000);
        const hourlyConfigAfter = await timedPromotionsPage.createHourlyConfig(hourlyConfigValue);
        await page.waitForTimeout(2000);
        await timedPromotionsPage.verifyHourlyConfigValues(hourlyConfigAfter, targetPromo);
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-26 Create Hourly Config');
    });



    test("TC-26 Testing Search functionality", async ({ page, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.searchTimedPromo();
        await CommonUtils.captureScreenshot(timedPromotionsPage.page, testInfo, 'reports/screenshots', 'TC-26 Search the timed promotion');
    })


});
