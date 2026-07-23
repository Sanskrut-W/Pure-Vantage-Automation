// npx playwright test tests/messageTemplates.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

const REGION = 'Betway Ghana';

test.describe('Message Templates Tests', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToMessageTemplates();
        await expect(page).toHaveURL(/.*message-templates/);
        await page.waitForLoadState('networkidle');
    });

    // test('TC-1 Verify Message Templates Page is accessible', async ({ page }) => {
    //     await expect(page).toHaveURL(/.*message-templates/);
    // });

    // test('TC-2 Verify search bar is available on Message Templates Page', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await expect(messageTemplatesPage.searchInput).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_msg_tmpl_search_bar');
    // });

    // test('TC-3 Verify search bar functionality on Message Templates Page', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const totalRows = await messageTemplatesPage.getRowCount();
    //     expect(totalRows).toBeGreaterThan(0);

    //     await messageTemplatesPage.searchFor('RashmiTest27May');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_msg_tmpl_search_results');

    //     const filteredRows = await messageTemplatesPage.getRowCount();
    //     expect(filteredRows).toBe(1);

    //     await messageTemplatesPage.clearSearch();
    //     const rowsAfterClear = await messageTemplatesPage.getRowCount();
    //     expect(rowsAfterClear).toBeGreaterThanOrEqual(1);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_msg_tmpl_search_cleared');
    // });

    // test('TC-4 Verify Create Template button is available', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await expect(messageTemplatesPage.createTemplateBtn).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_msg_tmpl_create_btn');
    // });

    // test('TC-5 Verify Create Template button opens a popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.clickCreateTemplate();

    //     await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_msg_tmpl_create_popup');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-6 Verify all required columns are available in the table', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const columnTitles = await messageTemplatesPage.getColumnTitles();

    //     expect(columnTitles).toContain('Template Name');
    //     expect(columnTitles).toContain('Type');
    //     expect(columnTitles).toContain('Style');
    //     expect(columnTitles).toContain('Region Code');
    //     expect(columnTitles).toContain('Cultures');
    //     expect(columnTitles).toContain('Modified By');
    //     expect(columnTitles).toContain('Modified Date');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_msg_tmpl_columns');
    // });

    // test('TC-7 Verify Edit, Config, Duplicate and Delete buttons are available for each row', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to verify action buttons').toBeGreaterThan(0);

    //     await expect(messageTemplatesPage.editBtn.first()).toBeVisible();
    //     await expect(messageTemplatesPage.configBtn.first()).toBeVisible();
    //     await expect(messageTemplatesPage.duplicateBtn.first()).toBeVisible();
    //     await expect(messageTemplatesPage.deleteBtn.first()).toBeVisible();

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_msg_tmpl_action_buttons');
    // });

    // test('TC-8 Verify Edit button opens the edit popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Edit').toBeGreaterThan(0);

    //     await messageTemplatesPage.clickEditFirst();

    //     await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_msg_tmpl_edit_popup');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-9 Verify Config button opens the configure popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Config').toBeGreaterThan(0);

    //     await messageTemplatesPage.clickConfigFirst();

    //     await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_msg_tmpl_config_popup');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-10 Verify Duplicate button opens a confirmation popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount, 'Must have at least 1 row to test Duplicate').toBeGreaterThan(0);

    //     await messageTemplatesPage.clickDuplicateFirst();

    //     await expect(page.locator('div.p-dialog, div.p-confirmdialog').first()).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_msg_tmpl_duplicate_popup');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-11 Verify Delete button opens confirmation popup — cancel to preserve data', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowsBefore = await messageTemplatesPage.getRowCount();
    //     expect(rowsBefore, 'Need at least 1 row to test Delete').toBeGreaterThan(0);

    //     await messageTemplatesPage.clickDeleteFirst();

    //     const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
    //     await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_msg_tmpl_delete_confirm');

    //     // Cancel — do NOT confirm deletion to preserve test data
    //     await messageTemplatesPage.closeDialogWithCancel();

    //     const rowsAfter = await messageTemplatesPage.getRowCount();
    //     expect(rowsAfter).toBe(rowsBefore);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_msg_tmpl_after_cancel');
    // });

    // test('TC-12 Verify sort buttons are available for key columns', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const sortableCols = await messageTemplatesPage.getSortableColumnTitles();

    //     expect(sortableCols).toContain('Template Name');
    //     expect(sortableCols).toContain('Type');
    //     expect(sortableCols).toContain('Style');
    //     expect(sortableCols).toContain('Region Code');
    //     expect(sortableCols).toContain('Cultures');
    //     expect(sortableCols).toContain('Modified By');

    //     // Modified Date must NOT be sortable
    //     expect(sortableCols).not.toContain('Modified Date');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_msg_tmpl_sort_buttons');
    // });

    // test('TC-13 Verify pagination is available and functional', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     await expect(messageTemplatesPage.paginatorBottom).toBeVisible({ timeout: 15000 });

    //     const firstPageBtn = messageTemplatesPage.pageButtons.first();
    //     await expect(firstPageBtn).toBeVisible({ timeout: 10000 });

    //     const pageCount = await messageTemplatesPage.pageButtons.count();
    //     expect(pageCount, 'At least one page button must be visible').toBeGreaterThan(0);

    //     if (pageCount > 1) {
    //         await messageTemplatesPage.pageButtons.nth(1).click();
    //         await page.waitForLoadState('networkidle');
    //         await expect(messageTemplatesPage.pageButtons.nth(1)).toHaveClass(/p-highlight/);
    //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_msg_tmpl_page2');

    //         await firstPageBtn.click();
    //         await page.waitForLoadState('networkidle');
    //         await expect(firstPageBtn).toHaveClass(/p-highlight/);
    //     } else {
    //         await expect(firstPageBtn).toHaveClass(/p-highlight/);
    //         console.log('TC-13: Only 1 page available — verified page 1 is active');
    //     }

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_msg_tmpl_pagination_nav');
    // });

    // test('TC-14 Verify fields on the Update Message Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_msg_tmpl_update_fields');

    //     // Save and Cancel buttons must be present
    //     await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
    //     await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

    //     // At least one input or dropdown field must be visible (pre-filled)
    //     const inputCount = await dialog.locator('input, div.p-dropdown').count();
    //     expect(inputCount, 'Update popup must have at least one editable field').toBeGreaterThan(0);

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-15 Verify Cancel button on Update Message Template popup discards changes', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_msg_tmpl_edit_open');

    //     await messageTemplatesPage.closeDialogWithCancel();

    //     // Dialog must close
    //     await expect(dialog).not.toBeVisible({ timeout: 5000 });

    //     // Row count unchanged
    //     const rowsAfter = await messageTemplatesPage.getRowCount();
    //     expect(rowsAfter).toBe(rowCount);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_msg_tmpl_after_cancel');
    // });

    // test('TC-16 Verify Save button on Update Message Template popup saves changes', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     const saveBtn = dialog.locator('button:has-text("Save")').first();
    //     await expect(saveBtn).toBeVisible({ timeout: 5000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_msg_tmpl_before_save');

    //     // Click Save with existing pre-filled data
    //     await saveBtn.click();
    //     await page.waitForLoadState('networkidle');

    //     await expect(dialog).not.toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_msg_tmpl_after_save');
    // });

    // test('TC-17 Verify mandatory field validation on Update Message Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickEditFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     // Clear the Template Name field (editable text input, NOT the readonly dropdown inputs)
    //     const nameInput = dialog.locator('input#templateName');
    //     await nameInput.clear();

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_msg_tmpl_field_cleared');

    //     // Save button must become disabled when mandatory field is empty
    //     const saveBtn = dialog.locator('button[aria-label="Save"]');
    //     await expect(saveBtn).toBeDisabled({ timeout: 3000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_msg_tmpl_validation_error');
    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-18 Verify fields on the New Message Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.clickCreateTemplate();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_msg_tmpl_create_fields');

    //     // Save and Cancel buttons must be present
    //     await expect(dialog.locator('button:has-text("Save")').first()).toBeVisible();
    //     await expect(dialog.locator('button:has-text("Cancel")').first()).toBeVisible();

    //     // At least one input or dropdown must be available
    //     const inputCount = await dialog.locator('input, div.p-dropdown').count();
    //     expect(inputCount, 'Create popup must have at least one field').toBeGreaterThan(0);

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-19 Verify Cancel button on New Message Template popup closes without creating', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);
    //     const rowsBefore = await messageTemplatesPage.getRowCount();

    //     await messageTemplatesPage.clickCreateTemplate();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     // Type something into the Template Name input
    //     const nameInput = dialog.locator('input#templateName');
    //     if (await nameInput.isVisible()) {
    //         await nameInput.fill('CancelTestTemplate');
    //     }

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_msg_tmpl_create_open');

    //     await messageTemplatesPage.closeDialogWithCancel();

    //     await expect(dialog).not.toBeVisible({ timeout: 5000 });

    //     // Row count must not have increased
    //     const rowsAfter = await messageTemplatesPage.getRowCount();
    //     expect(rowsAfter).toBe(rowsBefore);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_msg_tmpl_after_cancel');
    // });

    // test('TC-20 Verify Save button creates a new Message Template', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     await messageTemplatesPage.clickCreateTemplate();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     const NEW_TEMPLATE_NAME = 'AutoTest_TC20_Template';
    //     // PrimeVue renders visible options as li.p-dropdown-item in an overlay panel
    //     const dropdownItem = page.locator('.p-dropdown-panel .p-dropdown-item').first();

    //     // 1. Notification Type dropdown (#notificationType)
    //     await dialog.locator('#notificationType').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     // 2. Template Name (the editable text input)
    //     await dialog.locator('input#templateName').fill(NEW_TEMPLATE_NAME);

    //     // 3. Region Code dropdown (#regionCode)
    //     await dialog.locator('#regionCode').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     // 4. Notification Delivery dropdown (#notigicationDelivery)
    //     await dialog.locator('#notigicationDelivery').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     // 5. Notification Campaign dropdown (#notificationCampaign)
    //     await dialog.locator('#notificationCampaign').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     // 6. Notification Style dropdown (#notificationStyle)
    //     await dialog.locator('#notificationStyle').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     // 7. Notification Category dropdown (#notificationCategory)
    //     await dialog.locator('#notificationCategory').click();
    //     await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    //     await dropdownItem.click();
    //     await page.waitForTimeout(300);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_msg_tmpl_filled');

    //     const saveBtn = dialog.locator('button[aria-label="Save"]');
    //     await expect(saveBtn).not.toBeDisabled({ timeout: 5000 });
    //     await saveBtn.click();
    //     await page.waitForLoadState('networkidle');

    //     await expect(dialog).not.toBeVisible({ timeout: 10000 });

    //     // Verify the new template appears in the table
    //     await messageTemplatesPage.searchFor(NEW_TEMPLATE_NAME);
    //     const rowsAfterCreate = await messageTemplatesPage.getRowCount();
    //     expect(rowsAfterCreate).toBeGreaterThanOrEqual(1);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_msg_tmpl_created');

    //     await messageTemplatesPage.clearSearch();
    // });

    // test('TC-21 Verify mandatory field validation on New Message Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.clickCreateTemplate();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_msg_tmpl_create_empty');

    //     // With empty mandatory fields the Save button must be disabled (PrimeVue validation pattern)
    //     const saveBtn = dialog.locator('button:has-text("Save")').first();
    //     await expect(saveBtn).toBeDisabled({ timeout: 3000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_msg_tmpl_create_validation');
    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-22 Verify fields and controls on the Configure Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickConfigFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_msg_tmpl_config_controls');

    //     // Must have Save and Cancel buttons in the footer
    //     await expect(dialog.locator('button[aria-label="Save"]')).toBeVisible();
    //     await expect(dialog.locator('button[aria-label="Cancel"]')).toBeVisible();

    //     // Culture dropdown
    //     await expect(dialog.locator('#cultureDropdown')).toBeVisible();

    //     // Rich text editor (Quill)
    //     await expect(dialog.locator('.ql-editor')).toBeVisible();

    //     // Inline Preview section renders automatically
    //     await expect(dialog.locator('h2').filter({ hasText: 'Preview' })).toBeVisible();

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    test('TC-23 Verify Rich Text Editor is available and accepts input', async ({ page, messageTemplatesPage }, testInfo) => {
        await messageTemplatesPage.selectRegion(REGION);

        const rowCount = await messageTemplatesPage.getRowCount();
        expect(rowCount).toBeGreaterThan(0);

        await messageTemplatesPage.clickConfigFirst();

        const dialog = page.locator('div.p-dialog').first();
        await expect(dialog).toBeVisible({ timeout: 10000 });

        // Quill mounts asynchronously — the toolbar starts as plain
        // unconverted <select>/<button> markup and only gains the
        // "ql-toolbar" class (and the editor its "ql-editor"/contenteditable
        // div) once Quill.js finishes initializing. Wait for that signal
        // before looking for the editor, instead of a fixed short timeout.
        await expect(dialog.locator('.ql-toolbar')).toBeVisible({ timeout: 20000 });

        // Rich text editor (Quill or contenteditable)
        const editor = dialog.locator('.ql-editor, [contenteditable="true"]').first();
        await expect(editor).toBeVisible({ timeout: 20000 });

        await editor.click();
        await editor.fill('Sample test content');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_msg_tmpl_rich_text_input');

        await messageTemplatesPage.closeDialogWithCancel();
    });

    // test('TC-24 Verify Placeholder section is available in Configure Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickConfigFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     // Placeholders are btn--info buttons inside a flex-wrap div
    //     const placeholderSection = dialog.locator('button.btn--info').first();
    //     await expect(placeholderSection).toBeVisible({ timeout: 5000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_msg_tmpl_placeholders');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    // test('TC-25 Verify Cancel button on Configure Template popup discards changes', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickConfigFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_msg_tmpl_config_open');

    //     // Click Cancel
    //     await messageTemplatesPage.closeDialogWithCancel();

    //     await expect(dialog).not.toBeVisible({ timeout: 5000 });
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_msg_tmpl_config_cancelled');
    // });

    // test('TC-26 Verify Preview section is rendered in Configure Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
    //     await messageTemplatesPage.selectRegion(REGION);

    //     const rowCount = await messageTemplatesPage.getRowCount();
    //     expect(rowCount).toBeGreaterThan(0);

    //     await messageTemplatesPage.clickConfigFirst();

    //     const dialog = page.locator('div.p-dialog').first();
    //     await expect(dialog).toBeVisible({ timeout: 10000 });

    //     // Preview is rendered inline (no button) — a Preview heading and notification card are always shown
    //     await expect(dialog.locator('h2').filter({ hasText: 'Preview' })).toBeVisible({ timeout: 5000 });
    //     await expect(dialog.locator('.noti-card--windows')).toBeVisible({ timeout: 5000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_msg_tmpl_preview');

    //     await messageTemplatesPage.closeDialogWithCancel();
    // });

    test('TC-27 Verify Culture dropdown in Configure Template popup', async ({ page, messageTemplatesPage }, testInfo) => {
        await messageTemplatesPage.selectRegion(REGION);

        const rowCount = await messageTemplatesPage.getRowCount();
        expect(rowCount).toBeGreaterThan(0);

        await messageTemplatesPage.clickConfigFirst();

        const dialog = page.locator('div.p-dialog').first();
        await expect(dialog).toBeVisible({ timeout: 10000 });

        // Quill mounts asynchronously — wait for it to finish initializing
        // (toolbar gains the "ql-toolbar" class) before interacting further
        await expect(dialog.locator('.ql-toolbar')).toBeVisible({ timeout: 20000 });

        // Culture dropdown (#cultureDropdown)
        const cultureDropdown = dialog.locator('#cultureDropdown');
        await expect(cultureDropdown).toBeVisible({ timeout: 5000 });

        // Open the dropdown — PrimeVue renders visible options as li.p-dropdown-item in an overlay panel
        await cultureDropdown.click();
        const dropdownItem = page.locator('.p-dropdown-panel .p-dropdown-item').first();
        await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_msg_tmpl_culture_options');

        await dropdownItem.click();
        await page.waitForTimeout(300);

        // Editor area should still be visible after culture change — Quill
        // may re-initialize for the new culture's content, so allow the
        // same generous startup window as the initial load
        const editor = dialog.locator('.ql-editor');
        await expect(editor).toBeVisible({ timeout: 20000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_msg_tmpl_culture_selected');

        await messageTemplatesPage.closeDialogWithCancel();
    });

});
