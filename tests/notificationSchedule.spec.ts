// npx playwright test tests/notificationSchedule.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Notification Schedule Tests', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToNotificationSchedule();
        await expect(page).toHaveURL(/.*notification-schedule/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-1 Verify Notification Schedule Page is accessible', async ({ page }) => {
        await expect(page).toHaveURL(/.*notification-schedule/);
    });

    test('TC-2 Verify search bar is available on Notification Schedule Page', async ({ page, notificationSchedulePage }, testInfo) => {
        await expect(notificationSchedulePage.searchInput).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_notif_schedule_search_bar');
    });

    test('TC-3 Verify search bar functionality on Notification Schedule Page', async ({ page, notificationSchedulePage }, testInfo) => {
        await notificationSchedulePage.selectFirstCommunicationType();

        // Email data takes a while to load after selecting the type — wait for
        // rows to appear before searching
        const hasRows = await notificationSchedulePage.waitForRows(30000);
        expect(hasRows, 'Schedule rows must load after selecting the communication type').toBe(true);

        await notificationSchedulePage.searchFor('Test Email 6 Offer');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_notif_schedule_search_results');

        // The table refresh can lag behind the typed search term — poll until
        // the filter is applied
        await expect
            .poll(async () => notificationSchedulePage.getRowCount(), { timeout: 15000 })
            .toBe(1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_notif_schedule_search_exact');
    });

    test('TC-4 Verify Notification Type dropdown filter is available on Notification Schedule Page', async ({ page, notificationSchedulePage }, testInfo) => {
        await expect(notificationSchedulePage.communicationTypeDropdown).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_notif_schedule_comm_type_dropdown');
    });

    test('TC-5 Verify Notification Type dropdown filter functionality', async ({ page, notificationSchedulePage }, testInfo) => {
        // Open the Communication Type dropdown
        await notificationSchedulePage.communicationTypeDropdown.click();
        await page.waitForTimeout(500);

        // Verify options panel appears
        const panel = page.locator('.p-dropdown-panel');
        await expect(panel).toBeVisible({ timeout: 5000 });

        const options = panel.locator('.p-dropdown-item');
        const optionCount = await options.count();
        expect(optionCount, 'Communication Type dropdown must have at least one option').toBeGreaterThan(0);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_notif_schedule_dropdown_open');

        // Select the first option via PrimeVue overlay (NOT getByRole which matches hidden native select)
        const firstOption = options.first();
        await firstOption.waitFor({ state: 'visible', timeout: 5000 });
        await firstOption.click();
        await page.waitForLoadState('networkidle');

        // Table must update (data rows or empty-schedule message)
        await expect(notificationSchedulePage.dataTable).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_notif_schedule_type_selected');
    });

    test('TC-6 Verify all required columns are available in the Notification Schedule table', async ({ page, notificationSchedulePage }, testInfo) => {
        await notificationSchedulePage.selectFirstCommunicationType();

        const columnTitles = await notificationSchedulePage.getColumnTitles();

        expect(columnTitles).toContain('Template Name');
        expect(columnTitles).toContain('Region');
        expect(columnTitles).toContain('Campaign');
        expect(columnTitles).toContain('Dry Run');
        expect(columnTitles).toContain('Processed');
        expect(columnTitles).toContain('Scheduled Date');
        expect(columnTitles).toContain('Created Date');
        expect(columnTitles).toContain('Actions');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_notif_schedule_columns');
    });

    test('TC-7 Verify Processing Complete (Processed) status is available in the table', async ({ page, notificationSchedulePage }, testInfo) => {
        // Some communication types have no scheduled rows and data loads slowly —
        // walk through the types until one shows data
        const dropdown = notificationSchedulePage.communicationTypeDropdown;
        const panel = page.locator('.p-dropdown-panel');
        await dropdown.click();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const typeCount = await panel.locator('.p-dropdown-item').count();
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        let hasRows = false;
        for (let i = 0; i < typeCount && !hasRows; i++) {
            await dropdown.click();
            await panel.waitFor({ state: 'visible', timeout: 5000 });
            await panel.locator('.p-dropdown-item').nth(i).click();
            await page.waitForLoadState('networkidle');
            // First type gets the longest wait; later ones a shorter one
            hasRows = await notificationSchedulePage.waitForRows(i === 0 ? 30000 : 15000);
        }
        expect(hasRows, 'No communication type shows any scheduled rows').toBe(true);

        // Processed column header must be visible
        const processedHeader = page.locator('th .p-column-title:text-is("Processed")');
        await expect(processedHeader).toBeVisible();

        // Processed column contains p-inputswitch toggle in data rows
        const processedToggle = page.locator('td p-inputswitch, td .p-inputswitch').first();
        await expect(processedToggle).toBeVisible({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_notif_schedule_processed_status');
    });

    test('TC-8 Verify sorting is available for key columns', async ({ page, notificationSchedulePage }, testInfo) => {
        await notificationSchedulePage.selectFirstCommunicationType();

        const sortableCols = await notificationSchedulePage.getSortableColumnTitles();

        // Sortable columns per current HTML (sort icon present)
        expect(sortableCols).toContain('Template Name');
        expect(sortableCols).toContain('Region');
        expect(sortableCols).toContain('Campaign');
        expect(sortableCols).toContain('Scheduled Date');
        expect(sortableCols).toContain('Created Date');

        // NOT sortable per current HTML
        expect(sortableCols).not.toContain('Dry Run');
        expect(sortableCols).not.toContain('Processed');
        expect(sortableCols).not.toContain('Actions');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_notif_schedule_sort_buttons');
    });

    test('TC-9 Verify pagination is available and functional on Notification Schedule Page', async ({ page, notificationSchedulePage }, testInfo) => {
        await notificationSchedulePage.selectFirstCommunicationType();

        await expect(notificationSchedulePage.paginatorBottom).toBeVisible({ timeout: 15000 });

        const firstPageBtn = notificationSchedulePage.pageButtons.first();
        await expect(firstPageBtn).toBeVisible({ timeout: 10000 });

        const pageCount = await notificationSchedulePage.pageButtons.count();
        expect(pageCount, 'At least one page button must be visible').toBeGreaterThan(0);

        if (pageCount > 1) {
            await notificationSchedulePage.pageButtons.nth(1).click();
            await page.waitForLoadState('networkidle');
            await expect(notificationSchedulePage.pageButtons.nth(1)).toHaveClass(/p-highlight/);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_notif_schedule_page2');

            await firstPageBtn.click();
            await page.waitForLoadState('networkidle');
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
        } else {
            await expect(firstPageBtn).toHaveClass(/p-highlight/);
            console.log('TC-9: Only 1 page available — verified page 1 is active');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_notif_schedule_pagination_nav');
    });

});
