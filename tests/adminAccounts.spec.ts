// npx playwright test tests/adminAccounts.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

const REGION = 'Betway Ghana';

test.describe('Admin Accounts Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, adminAccountsPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToAdminAccounts();
        await expect(page).toHaveURL(/.*admin-accounts/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-1 Verify Admin Accounts Page is accessible', async ({ page }) => {
        await expect(page).toHaveURL(/.*admin-accounts/);
    });

    test('TC-2 Verify search bar is available on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await expect(adminAccountsPage.searchInput).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_admin_search_bar');
    });

    test('TC-3 Verify search bar functionality on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        const totalRows = await adminAccountsPage.getRowCount();
        expect(totalRows).toBeGreaterThan(0);

        // Search by a term that exists in the data
        await adminAccountsPage.searchFor('test');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_admin_search_results');

        // Table should show filtered results
        const filteredRows = await adminAccountsPage.getRowCount();
        expect(filteredRows).toBeGreaterThan(0);

        // Clear search and verify all rows return
        await adminAccountsPage.clearSearch();
        const rowsAfterClear = await adminAccountsPage.getRowCount();
        expect(rowsAfterClear).toBeGreaterThanOrEqual(1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_admin_search_cleared');
    });

    test('TC-4 Verify Create Account button is available on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);
        await expect(adminAccountsPage.createAccountBtn).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_admin_create_account_btn');
    });

    test('TC-5 Verify Create Account button functionality on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);
        await adminAccountsPage.clickCreateAccount();

        // A popup/dialog must open
        await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_admin_create_account_popup');

        // Close the dialog
        await adminAccountsPage.closeDialogWithCancel();
    });

    test('TC-6 Verify available fields on Create Account popup', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);
        await adminAccountsPage.clickCreateAccount();

        const dialog = page.locator('div.p-dialog').first();
        await expect(dialog).toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_admin_popup_fields');

        // Verify required input fields are visible
        await expect(dialog.getByLabel('Admin Name')).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByLabel('Username')).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByLabel('Account Guid')).toBeVisible({ timeout: 5000 });

        // Verify Save and Cancel buttons
        await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
        await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

        await adminAccountsPage.closeDialogWithCancel();
    });

    test('TC-7 Verify existing admin data is available in table format', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        await expect(adminAccountsPage.dataTable).toBeVisible();

        const rowCount = await adminAccountsPage.getRowCount();
        expect(rowCount, 'Admin Accounts table must have at least 1 row').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_admin_table_data');
    });

    test('TC-8 Verify required columns are available in the Admin Accounts table', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        const columnTitles = await adminAccountsPage.getColumnTitles();

        expect(columnTitles).toContain('Admin Name');
        expect(columnTitles).toContain('Username');
        expect(columnTitles).toContain('Account ID');
        expect(columnTitles).toContain('Created At');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_admin_table_columns');
    });

    test('TC-9 Verify Delete button is available for each Admin record', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        const rowCount = await adminAccountsPage.getRowCount();
        expect(rowCount, 'Must have at least 1 row to verify Delete button').toBeGreaterThan(0);

        const deleteButtons = adminAccountsPage.deleteBtn;
        const deleteBtnCount = await deleteButtons.count();

        // Each row must have exactly one Delete button
        expect(deleteBtnCount).toBe(rowCount);
        await expect(deleteButtons.first()).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_admin_delete_buttons');
    });

    test('TC-10 Verify Delete button functionality', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        const rowsBefore = await adminAccountsPage.getRowCount();
        expect(rowsBefore, 'Need at least 1 row to test Delete').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_before_delete');

        // Click Delete on the first row
        await adminAccountsPage.clickDeleteFirst();

        // A confirmation popup must appear
        const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
        await expect(confirmDialog).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_delete_confirm_popup');

        // Cancel — do NOT confirm deletion to preserve test data
        await adminAccountsPage.closeDialogWithCancel();

        // Row count must be unchanged
        const rowsAfter = await adminAccountsPage.getRowCount();
        expect(rowsAfter).toBe(rowsBefore);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_after_cancel');
    });

    test('TC-11 Verify sort button availability for Admin Name, Username and Account ID columns', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        const sortableCols = await adminAccountsPage.getSortableColumnTitles();

        expect(sortableCols).toContain('Admin Name');
        expect(sortableCols).toContain('Username');
        expect(sortableCols).toContain('Account ID');

        // Created At must NOT be sortable per the HTML
        expect(sortableCols).not.toContain('Created At');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_admin_sort_buttons');
    });

    test('TC-12 Verify pagination is available on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        // Wait for paginator to fully render after data load
        await expect(adminAccountsPage.paginatorBottom).toBeVisible({ timeout: 15000 });

        // Page 1 button must be visible and active
        const page1Btn = page.locator('.p-paginator-bottom .p-paginator-page').first();
        await expect(page1Btn).toBeVisible({ timeout: 10000 });

        const pageCount = await adminAccountsPage.pageButtons.count();
        expect(pageCount, 'At least one page button must be visible').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_admin_pagination');
    });

    test('TC-13 Verify pagination functionality on Admin Accounts Page', async ({ page, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion(REGION);

        await expect(adminAccountsPage.paginatorBottom).toBeVisible();

        const pageCount = await adminAccountsPage.pageButtons.count();

        const firstPageBtn = adminAccountsPage.pageButtons.first();
        await expect(firstPageBtn).toBeVisible({ timeout: 10000 });

        if (pageCount > 1) {
            // Navigate to page 2 if it exists
            await adminAccountsPage.pageButtons.nth(1).click();
            await page.waitForLoadState('networkidle');
            await expect(adminAccountsPage.pageButtons.nth(1)).toHaveClass(/p-highlight/);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_admin_pagination_page2');

            // Navigate back to page 1
            await firstPageBtn.click();
            await page.waitForLoadState('networkidle');
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
        } else {
            // Only 1 page — verify it is active
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
            console.log('TC-13: Only 1 page available — verified page 1 is active');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_admin_pagination_nav');
    });

});
