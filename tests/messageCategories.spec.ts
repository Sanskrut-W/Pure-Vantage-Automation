// npx playwright test tests/messageCategories.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Message Categories Tests', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToMessageCategories();
        await expect(page).toHaveURL(/.*message-categories/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-1 Verify Message Categories Page is accessible', async ({ page }) => {
        await expect(page).toHaveURL(/.*message-categories/);
    });

    test('TC-2 Verify search bar is available on Message Categories Page', async ({ page, messageCategoriesPage }, testInfo) => {
        await expect(messageCategoriesPage.searchInput).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_msg_cat_search_bar');
    });

    test('TC-4 Verify search bar functionality on Message Categories Page', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const totalRows = await messageCategoriesPage.getRowCount();
        expect(totalRows).toBeGreaterThan(0);

        await messageCategoriesPage.searchFor('test');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_msg_cat_search_results');

        const filteredRows = await messageCategoriesPage.getRowCount();
        expect(filteredRows).toBeGreaterThan(0);

        await messageCategoriesPage.clearSearch();
        const rowsAfterClear = await messageCategoriesPage.getRowCount();
        expect(rowsAfterClear).toBeGreaterThanOrEqual(1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_msg_cat_search_cleared');
    });

    test('TC-5 Verify Create Category button is available on Message Categories Page', async ({ page, messageCategoriesPage }, testInfo) => {
        await expect(messageCategoriesPage.createCategoryBtn).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_msg_cat_create_btn');
    });

    test('TC-6 Verify Create Category button opens a popup', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.clickCreateCategory();

        await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_msg_cat_create_popup');

        await messageCategoriesPage.closeDialogWithCancel();
    });

    test('TC-7 Verify available fields on Create Category popup', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.clickCreateCategory();

        const dialog = page.locator('div.p-dialog').first();
        await expect(dialog).toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_msg_cat_create_fields');

        await expect(dialog.getByLabel('Category Name')).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByLabel('Category Icon')).toBeVisible({ timeout: 5000 });
        await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
        await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

        await messageCategoriesPage.closeDialogWithCancel();
    });

    test('TC-8 Verify existing category data is available in table format', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        await expect(messageCategoriesPage.dataTable).toBeVisible();

        const rowCount = await messageCategoriesPage.getRowCount();
        expect(rowCount, 'Message Categories table must have at least 1 row').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_msg_cat_table_data');
    });

    test('TC-9 Verify required columns are available in the table', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const columnTitles = await messageCategoriesPage.getColumnTitles();

        expect(columnTitles).toContain('Category Name');
        expect(columnTitles).toContain('Category Icon');
        expect(columnTitles).toContain('Modified By');
        expect(columnTitles).toContain('Modified Date');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_msg_cat_columns');
    });

    test('TC-10 Verify Edit and Delete buttons are available for each category row', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const rowCount = await messageCategoriesPage.getRowCount();
        expect(rowCount, 'Must have at least 1 row to verify row buttons').toBeGreaterThan(0);

        const editBtnCount  = await messageCategoriesPage.editBtn.count();
        const deleteBtnCount = await messageCategoriesPage.deleteBtn.count();

        expect(editBtnCount).toBe(rowCount);
        expect(deleteBtnCount).toBe(rowCount);

        await expect(messageCategoriesPage.editBtn.first()).toBeVisible();
        await expect(messageCategoriesPage.deleteBtn.first()).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_msg_cat_row_buttons');
    });

    test('TC-11 Verify sort button is available for Category Name, Category Icon, and Modified By columns', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const sortableCols = await messageCategoriesPage.getSortableColumnTitles();

        expect(sortableCols).toContain('Category Name');
        expect(sortableCols).toContain('Category Icon');
        expect(sortableCols).toContain('Modified By');

        // Modified Date must NOT be sortable per the HTML
        expect(sortableCols).not.toContain('Modified Date');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_msg_cat_sort_buttons');
    });

    test('TC-12 Verify Edit button opens a popup', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const rowCount = await messageCategoriesPage.getRowCount();
        expect(rowCount, 'Must have at least 1 row to test Edit button').toBeGreaterThan(0);

        await messageCategoriesPage.clickEditFirst();

        await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_msg_cat_edit_popup');

        await messageCategoriesPage.closeDialogWithCancel();
    });

    test('TC-13 Verify Delete button functionality — confirmation popup appears', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const rowsBefore = await messageCategoriesPage.getRowCount();
        expect(rowsBefore, 'Need at least 1 row to test Delete').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_before_delete');

        await messageCategoriesPage.clickDeleteFirst();

        const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
        await expect(confirmDialog).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_delete_confirm_popup');

        // Cancel — do NOT confirm deletion to preserve test data
        await messageCategoriesPage.closeDialogWithCancel();

        const rowsAfter = await messageCategoriesPage.getRowCount();
        expect(rowsAfter).toBe(rowsBefore);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_after_cancel');
    });

    test('TC-14 Verify available fields on Edit Category popup', async ({ page, messageCategoriesPage }, testInfo) => {
        await messageCategoriesPage.waitForTableLoad();

        const rowCount = await messageCategoriesPage.getRowCount();
        expect(rowCount, 'Must have at least 1 row to open Edit popup').toBeGreaterThan(0);

        await messageCategoriesPage.clickEditFirst();

        const dialog = page.locator('div.p-dialog').first();
        await expect(dialog).toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_msg_cat_edit_fields');

        await expect(dialog.getByLabel('Category Name')).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByLabel('Category Icon')).toBeVisible({ timeout: 5000 });
        await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
        await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

        await messageCategoriesPage.closeDialogWithCancel();
    });

    test('TC-15 Verify pagination is available on Message Categories Page', async ({ page, messageCategoriesPage }, testInfo) => {
        await expect(messageCategoriesPage.paginatorBottom).toBeVisible({ timeout: 15000 });

        const page1Btn = messageCategoriesPage.pageButtons.first();
        await expect(page1Btn).toBeVisible({ timeout: 10000 });

        const pageCount = await messageCategoriesPage.pageButtons.count();
        expect(pageCount, 'At least one page button must be visible').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_msg_cat_pagination');
    });

    test('TC-16 Verify pagination functionality on Message Categories Page', async ({ page, messageCategoriesPage }, testInfo) => {
        await expect(messageCategoriesPage.paginatorBottom).toBeVisible({ timeout: 15000 });

        const firstPageBtn = messageCategoriesPage.pageButtons.first();
        await expect(firstPageBtn).toBeVisible({ timeout: 10000 });

        const pageCount = await messageCategoriesPage.pageButtons.count();

        if (pageCount > 1) {
            await messageCategoriesPage.pageButtons.nth(1).click();
            await page.waitForLoadState('networkidle');
            await expect(messageCategoriesPage.pageButtons.nth(1)).toHaveClass(/p-highlight/);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_msg_cat_page2');

            await firstPageBtn.click();
            await page.waitForLoadState('networkidle');
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
        } else {
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
            console.log('TC-16: Only 1 page available — verified page 1 is active');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_msg_cat_pagination_nav');
    });

});
