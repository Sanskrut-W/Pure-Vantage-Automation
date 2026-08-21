// npx playwright test tests/formBuilder.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

const TEST_REGION = 'Betway Agents';

test.describe('Form Builder test suite', () => {

    test.beforeEach('Navigate to Form Builder page from sidebar', async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToFormBuilder();
        await expect(page).toHaveURL(/.*form-builder/, {timeout:30000});

        await page.waitForLoadState('networkidle');
    });

    // test('TC-1 Verify Form Builder page is accessible', async ({ page, formBuilderPage }, testInfo) => {
    //     await expect(page).toHaveURL(/.*form-builder/);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-1 Form Builder page accessible');
    // });

    test('TC-2 Verify Search input is available', async ({ formBuilderPage }, testInfo) => {
        await expect(formBuilderPage.searchInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(formBuilderPage.searchInput);
        await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-2 Search input visible');
    });

    // test('TC-3 Verify Search input filters the table', async ({ page, formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.fillInput(formBuilderPage.searchInput, 'Betway');
    //     await page.waitForLoadState('networkidle');
    //     await page.waitForTimeout(5000);
    //     const searchValue = await formBuilderPage.searchInput.inputValue();
    //     expect(searchValue).toBe('Betway');
    //     await CommonUtils.highlightElementBorder(formBuilderPage.searchInput);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-3 Search input filters table');
    // });

    // test('TC-4 Verify Create Form button is available', async ({ formBuilderPage }, testInfo) => {
    //     await expect(formBuilderPage.createFormBtn).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElementBorder(formBuilderPage.createFormBtn);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-4 Create Form button visible');
    // });

    // test('TC-5 Verify Create Form button opens popup', async ({ formBuilderPage }, testInfo) => {
    //     // Button is disabled without a region — select one first
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.clickElement(formBuilderPage.createFormBtn);
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-5 Create Form popup opens');
    // });

    // test('TC-6 Verify table column headers', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.verifyColumnHeaders();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-6 Table column headers');
    // });

    // test('TC-7 Verify row action buttons (Edit/Config/Duplicate/Delete)', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.verifyRowActionButtons();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-7 Row action buttons');
    // });

    // test('TC-8 Verify Edit button opens popup or new page', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.editBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-8 Edit button popup');
    // });

    // test('TC-9 Verify Config button opens popup', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.configBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-9 Config button popup');
    // });

    // test('TC-10 Verify Duplicate button opens popup', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.duplicateBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-10 Duplicate button popup');
    // });

    // test('TC-11 Verify Delete button opens confirmation popup', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.deleteBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-11 Delete confirmation popup');
    // });

    // test('TC-12 Verify sort icons are present on all sortable columns', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.verifySortIcons();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-12 Sort icons on columns');
    // });

    // test('TC-13 Verify pagination controls are present', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.verifyPaginationControls();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-13 Pagination controls visible');
    // });

    // test('TC-14 Verify Create Form popup fields', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.clickElement(formBuilderPage.createFormBtn);
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await formBuilderPage.verifyCreateFormPopupFields();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-14 Create Form popup fields');
    // });

    // test('TC-15 Verify Cancel closes Create Form popup without saving', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.clickElement(formBuilderPage.createFormBtn);
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await formBuilderPage.cancelCreateForm();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-15 Cancel closes Create Form popup');
    // });

    // test('TC-16 Verify Create, Edit and Delete form lifecycle', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);

    //     // Create
    //     const formTitle = 'TAF-' + Date.now();
    //     await formBuilderPage.createForm(TEST_REGION, formTitle, 'TAF', 'Test Sub Title');
    //     await formBuilderPage.fillInput(formBuilderPage.searchInput, formTitle);
    //     await formBuilderPage.page.waitForLoadState('networkidle');
    //     await formBuilderPage.page.waitForTimeout(5000);
    //     await expect(formBuilderPage.page.getByText(formTitle)).toBeVisible({timeout:20000});
    //     await CommonUtils.highlightElement(formBuilderPage.page.getByText(formTitle));
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-16 Create Form saves successfully');

    //     // Edit
    //     const updatedTitle = 'TAF-Updated-' + Date.now();
    //     await formBuilderPage.editBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({timeout:20000});
    //     await formBuilderPage.editForm(updatedTitle);
    //     await formBuilderPage.fillInput(formBuilderPage.searchInput, updatedTitle);
    //     await formBuilderPage.page.waitForLoadState('networkidle');
    //     await formBuilderPage.page.waitForTimeout(5000);
    //     await expect(formBuilderPage.page.getByText(updatedTitle)).toBeVisible({timeout:20000});
    //     await CommonUtils.highlightElement(formBuilderPage.page.getByText(updatedTitle));
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-16 Edit Form saves successfully');

    //     // Delete
    //     await formBuilderPage.deleteBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({timeout:20000});
    //     await CommonUtils.highlightElement(formBuilderPage.dialog);
    //     await formBuilderPage.page.getByRole('button', {name: 'Yes'}).click();
    //     await formBuilderPage.page.waitForLoadState('networkidle');
    //     await formBuilderPage.page.waitForTimeout(5000);
    //     await formBuilderPage.fillInput(formBuilderPage.searchInput, updatedTitle);
    //     await formBuilderPage.page.waitForLoadState('networkidle');
    //     await formBuilderPage.page.waitForTimeout(5000);
    //     await expect(formBuilderPage.page.getByText(updatedTitle)).not.toBeVisible({timeout:20000});
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-16 Delete Form removes successfully');
    // });

    // test('TC-17 Verify missing mandatory field shows error on Save', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.clickElement(formBuilderPage.createFormBtn);
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await expect(formBuilderPage.popupTitleInput).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-17 Missing mandatory field error');
    // });

    // test('TC-18 Verify Edit popup fields are available and populated', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.editBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await formBuilderPage.verifyEditFormPopupFields();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-18 Edit popup fields');
    // });

    // test('TC-19 Verify Edit Cancel leaves table unchanged', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.editBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await formBuilderPage.cancelEditForm();
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-19 Edit Cancel unchanged');
    // });

    // test('TC-20 Verify empty mandatory field shows error on Edit Save', async ({ formBuilderPage }, testInfo) => {
    //     await formBuilderPage.selectRegion(TEST_REGION);
    //     await formBuilderPage.editBtn.first().click();
    //     await expect(formBuilderPage.dialog).toBeVisible({ timeout: 20000 });
    //     await expect(formBuilderPage.popupTitleInput).toBeVisible({ timeout: 20000 });
    //     await CommonUtils.captureScreenshot(formBuilderPage.page, testInfo, 'reports/screenshots', 'TC-20 Empty mandatory field error on Edit');
    // });

});
