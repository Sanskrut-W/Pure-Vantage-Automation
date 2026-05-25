// npx playwright test tests/stencilConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Stencil Configuration test suite', () => {

    test.beforeEach('Navigate to Stencil Configuration page from sidebar', async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToStencilConfig();
        await expect(page).toHaveURL(/.*stencil/, { timeout: 30000 });

        await page.waitForLoadState('networkidle');
    });

    test('TC-1 Verify Stencil Configuration page is accessible', async ({ page, stencilConfigPage }, testInfo) => {
        await expect(page).toHaveURL(/.*stencil/);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-1 Stencil Config page accessible');
    });

    test('TC-2 Verify Search input is available', async ({ stencilConfigPage }, testInfo) => {
        await expect(stencilConfigPage.searchInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(stencilConfigPage.searchInput);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-2 Search input visible');
    });

    test('TC-3 Verify Search input filters the table', async ({ page, stencilConfigPage }, testInfo) => {
        await stencilConfigPage.fillInput(stencilConfigPage.searchInput, 'stencil');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        const searchValue = await stencilConfigPage.searchInput.inputValue();
        expect(searchValue).toBe('stencil');
        await CommonUtils.highlightElementBorder(stencilConfigPage.searchInput);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-3 Search input filters table');
    });

    test('TC-4 Verify Create Stencil Config button is available', async ({ stencilConfigPage }, testInfo) => {
        await expect(stencilConfigPage.createStencilBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(stencilConfigPage.createStencilBtn);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-4 Create Stencil Config button visible');
    });

    test('TC-5 Verify Create Stencil Config button opens popup', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.clickElement(stencilConfigPage.createStencilBtn);
        await expect(stencilConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(stencilConfigPage.dialog);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-5 Create Stencil Config popup opens');
    });

    test('TC-6 Verify table column headers', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.verifyColumnHeaders();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-6 Table column headers');
    });

    test('TC-7 Verify row action buttons (Edit/Delete)', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.verifyRowActionButtons();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-7 Row action buttons');
    });

    test('TC-8 Verify Edit button opens popup', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.editBtn.first().click();
        await expect(stencilConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(stencilConfigPage.dialog);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-8 Edit button popup');
    });

    test('TC-9 Verify Delete button opens confirmation popup', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.deleteBtn.first().click();
        await stencilConfigPage.page.waitForTimeout(3000);
        await CommonUtils.highlightElement(stencilConfigPage.confirmDialog);
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-9 Delete confirmation popup');
    });

    test('TC-10 Verify sort icons are present on all sortable columns', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.verifySortIcons();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-10 Sort icons on columns');
    });

    test('TC-11 Verify pagination controls are present', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.verifyPaginationControls();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-11 Pagination controls visible');
    });

    test('TC-12 Verify Create popup fields', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.clickElement(stencilConfigPage.createStencilBtn);
        await expect(stencilConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await stencilConfigPage.verifyCreatePopupFields();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-12 Create popup fields');
    });

    test('TC-13 Verify Cancel closes Create popup without saving', async ({ stencilConfigPage }, testInfo) => {
        await stencilConfigPage.clickElement(stencilConfigPage.createStencilBtn);
        await expect(stencilConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await stencilConfigPage.cancelCreateStencilConfig();
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-13 Cancel closes Create popup');
    });

    test('TC-14 Verify Create, Edit and Delete stencil config lifecycle', async ({ stencilConfigPage }, testInfo) => {
        // Create
        const stencilName = 'TAF-' + Date.now();
        await stencilConfigPage.createStencilConfig(stencilName, 'taf-tag', 'https://taf-stencil.example.com');
        await stencilConfigPage.fillInput(stencilConfigPage.searchInput, stencilName);
        await stencilConfigPage.page.waitForLoadState('networkidle');
        await stencilConfigPage.page.waitForTimeout(5000);
        await expect(stencilConfigPage.page.getByText(stencilName)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(stencilConfigPage.page.getByText(stencilName));
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-14 Create Stencil Config saves successfully');

        // Edit
        const updatedName = 'TAF-Updated-' + Date.now();
        await stencilConfigPage.editBtn.first().click();
        await expect(stencilConfigPage.dialog).toBeVisible({ timeout: 20000 });
        await stencilConfigPage.editStencilConfig(updatedName);
        await stencilConfigPage.fillInput(stencilConfigPage.searchInput, updatedName);
        await stencilConfigPage.page.waitForLoadState('networkidle');
        await stencilConfigPage.page.waitForTimeout(5000);
        await expect(stencilConfigPage.page.getByText(updatedName)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(stencilConfigPage.page.getByText(updatedName));
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-14 Edit Stencil Config saves successfully');

        // Delete
        await stencilConfigPage.deleteBtn.first().click();
        await stencilConfigPage.page.waitForTimeout(3000);
        await CommonUtils.highlightElement(stencilConfigPage.confirmDialog);
        await stencilConfigPage.page.getByRole('button', { name: 'Yes' }).click();
        await stencilConfigPage.page.waitForLoadState('networkidle');
        await stencilConfigPage.page.waitForTimeout(5000);
        await stencilConfigPage.fillInput(stencilConfigPage.searchInput, updatedName);
        await stencilConfigPage.page.waitForLoadState('networkidle');
        await stencilConfigPage.page.waitForTimeout(5000);
        await expect(stencilConfigPage.page.getByText(updatedName)).not.toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(stencilConfigPage.page, testInfo, 'reports/screenshots', 'TC-14 Delete Stencil Config removes successfully');
    });

});
