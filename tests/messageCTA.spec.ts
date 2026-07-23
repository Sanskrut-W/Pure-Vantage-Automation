// npx playwright test tests/messageCTA.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

const REGION = 'Betway Ghana';

test.describe('Message CTA Tests', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToMessageCTA();
        await expect(page).toHaveURL(/.*message-cta/);
        await page.waitForLoadState('networkidle');
    });

    // test('TC-1 Verify Message CTA Page is accessible', async ({ page }) => {
    //     await expect(page).toHaveURL(/.*message-cta/);
    // });

    // test('TC-2 Verify search bar is available on Message CTA Page', async ({ page, messageCTAPage }, testInfo) => {
    //     await expect(messageCTAPage.searchInput).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_msg_cta_search_bar');
    // });

    // test('TC-3 Verify search bar functionality on Message CTA Page', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const totalRows = await messageCTAPage.getRowCount();
    //     expect(totalRows).toBeGreaterThan(0);

    //     await messageCTAPage.searchFor('LaunchGame');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_msg_cta_search_results');

    //     // Results may be 0 if no match — just verify search runs without error
    //     const filteredRows = await messageCTAPage.getRowCount();
    //     expect(filteredRows).toBeGreaterThanOrEqual(0);

    //     await messageCTAPage.clearSearch();
    //     const rowsAfterClear = await messageCTAPage.getRowCount();
    //     expect(rowsAfterClear).toBeGreaterThanOrEqual(1);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_msg_cta_search_cleared');
    // });

    // test('TC-4 Verify region dropdown filter is available on Message CTA Page', async ({ page, messageCTAPage }, testInfo) => {
    //     await expect(messageCTAPage.regionDropdown).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_msg_cta_region_dropdown');
    // });

    // test('TC-5 Verify region dropdown filter functionality', async ({ page, messageCTAPage }, testInfo) => {
    //     // Open the dropdown
    //     await messageCTAPage.clickRegionDropdown();
    //     await page.waitForTimeout(500);

    //     // Verify options are displayed (use PrimeVue overlay panel — getByRole('option') hits hidden native <select>)
    //     const options = page.locator('.p-dropdown-panel .p-dropdown-item');
    //     await options.first().waitFor({ state: 'visible', timeout: 5000 });
    //     const optionCount = await options.count();
    //     expect(optionCount, 'Region dropdown must have at least one option').toBeGreaterThan(0);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_msg_cta_dropdown_open');

    //     // Select the first visible overlay option
    //     await options.first().click();
    //     await page.waitForLoadState('networkidle');

    //     // Table must update (data rows or empty-region message)
    //     await expect(messageCTAPage.dataTable).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_msg_cta_region_selected');
    // });

    // test('TC-6 Verify Create CTA button is available after selecting a region', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);
    //     await expect(messageCTAPage.createCTABtn).toBeVisible();
    //     // Button must be enabled after region selection (it is disabled before selecting)
    //     await expect(messageCTAPage.createCTABtn).not.toHaveAttribute('disabled');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_msg_cta_create_btn');
    // });

    // test('TC-7 Verify Create CTA button opens a popup', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);
    //     await messageCTAPage.clickCreateCTA();

    //     await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_msg_cta_create_popup');

    //     await messageCTAPage.closeDialogWithCancel();
    // });

    test('TC-8 Verify existing CTA data is available in table format', async ({ page, messageCTAPage }, testInfo) => {
        await messageCTAPage.selectRegion(REGION);

        await expect(messageCTAPage.dataTable).toBeVisible();
        const rowCount = await messageCTAPage.getRowCount();
        expect(rowCount, 'CTA table must have at least 1 row').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_msg_cta_table_data');
    });

    // test('TC-9 Verify all required columns are available in the CTA table', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const columnTitles = await messageCTAPage.getColumnTitles();

    //     expect(columnTitles).toContain('Action');
    //     expect(columnTitles).toContain('Name');
    //     expect(columnTitles).toContain('Color');
    //     expect(columnTitles).toContain('Value');
    //     expect(columnTitles).toContain('Text');
    //     expect(columnTitles).toContain('Region');
    //     expect(columnTitles).toContain('Culture');
    //     expect(columnTitles).toContain('Modified By');
    //     expect(columnTitles).toContain('Modified Date');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_msg_cta_columns');
    // });

    // test('TC-10 Verify sort button is available for key columns', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const sortableCols = await messageCTAPage.getSortableColumnTitles();

    //     expect(sortableCols).toContain('Action');
    //     expect(sortableCols).toContain('Name');
    //     expect(sortableCols).toContain('Color');
    //     expect(sortableCols).toContain('Value');
    //     expect(sortableCols).toContain('Text');
    //     expect(sortableCols).toContain('Region');
    //     expect(sortableCols).toContain('Culture');
    //     expect(sortableCols).toContain('Modified By');

    //     // Modified Date must NOT be sortable
    //     expect(sortableCols).not.toContain('Modified Date');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_msg_cta_sort_buttons');
    // });

    // test('TC-11 Verify Edit and Delete buttons are available for each CTA row', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowCount = await messageCTAPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to verify row buttons').toBeGreaterThan(0);

    //     const editBtnCount   = await messageCTAPage.editBtn.count();
    //     const deleteBtnCount = await messageCTAPage.deleteBtn.count();

    //     expect(editBtnCount).toBe(rowCount);
    //     expect(deleteBtnCount).toBe(rowCount);

    //     await expect(messageCTAPage.editBtn.first()).toBeVisible();
    //     await expect(messageCTAPage.deleteBtn.first()).toBeVisible();

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_msg_cta_row_buttons');
    // });

    // test('TC-12 Verify Edit button opens Update CTA popup pre-filled with data', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowCount = await messageCTAPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Edit button').toBeGreaterThan(0);

    //     await messageCTAPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_msg_cta_edit_popup');

    //     await messageCTAPage.closeDialogWithCancel();
    // });

    // test('TC-13 Verify fields and controls on the Update CTA popup', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowCount = await messageCTAPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to open Update CTA popup').toBeGreaterThan(0);

    //     await messageCTAPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_msg_cta_update_popup');

    //     // Popup must have Save and Cancel buttons
    //     await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
    //     await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

    //     await messageCTAPage.closeDialogWithCancel();
    // });

    // test('TC-14 Verify Cancel button on Update CTA popup discards changes', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowCount = await messageCTAPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Cancel').toBeGreaterThan(0);

    //     await messageCTAPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_msg_cta_edit_open');

    //     // Click Cancel — popup must close without saving
    //     await messageCTAPage.closeDialogWithCancel();

    //     await expect(dialog).not.toBeVisible({ timeout: 5000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_msg_cta_after_cancel');

    //     // Row count must remain unchanged
    //     const rowsAfter = await messageCTAPage.getRowCount();
    //     expect(rowsAfter).toBe(rowCount);
    // });

    // test('TC-15 Verify Save button on Update CTA popup saves changes', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowCount = await messageCTAPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Save').toBeGreaterThan(0);

    //     await messageCTAPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     // Verify Save button is present and enabled
    //     const saveBtn = dialog.locator('button:has-text("Save")').first();
    //     await expect(saveBtn).toBeVisible({ timeout: 5000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_msg_cta_before_save');

    //     // Click Save with existing (unchanged) data — verifies Save closes the popup successfully
    //     await saveBtn.click();
    //     await page.waitForLoadState('networkidle');

    //     // Popup must close
    //     await expect(dialog).not.toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_msg_cta_after_save');
    // });

    // test('TC-16 Verify Delete button opens confirmation popup — cancel to preserve data', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     const rowsBefore = await messageCTAPage.getRowCount();
    //     expect(rowsBefore, 'Need at least 1 row to test Delete').toBeGreaterThan(0);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_before_delete');

    //     await messageCTAPage.clickDeleteFirst();

    //     const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
    //     await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_delete_confirm_popup');

    //     // Cancel — do NOT confirm deletion to preserve test data
    //     await messageCTAPage.closeDialogWithCancel();

    //     const rowsAfter = await messageCTAPage.getRowCount();
    //     expect(rowsAfter).toBe(rowsBefore);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_after_cancel');
    // });

    // test('TC-17 Verify pagination is available and functional', async ({ page, messageCTAPage }, testInfo) => {
    //     await messageCTAPage.selectRegion(REGION);

    //     await expect(messageCTAPage.paginatorBottom).toBeVisible({ timeout: 15000 });

    //     const firstPageBtn = messageCTAPage.pageButtons.first();
    //     await expect(firstPageBtn).toBeVisible({ timeout: 10000 });

    //     const pageCount = await messageCTAPage.pageButtons.count();
    //     expect(pageCount, 'At least one page button must be visible').toBeGreaterThan(0);

    //     if (pageCount > 1) {
    //         await messageCTAPage.pageButtons.nth(1).click();
    //         await page.waitForLoadState('networkidle');
    //         await expect(messageCTAPage.pageButtons.nth(1)).toHaveClass(/p-highlight/);
    //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_msg_cta_page2');

    //         await firstPageBtn.click();
    //         await page.waitForLoadState('networkidle');
    //         await expect(firstPageBtn).toHaveClass(/p-highlight/);
    //     } else {
    //         await expect(firstPageBtn).toHaveClass(/p-highlight/);
    //         console.log('TC-17: Only 1 page available — verified page 1 is active');
    //     }

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_msg_cta_pagination_nav');
    // });

});
