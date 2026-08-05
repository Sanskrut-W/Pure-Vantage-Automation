// npx playwright test tests/compPayout.spec.ts
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { compPayoutLocators } from '../locators/compPayoutLocators';

async function navigateToCompPayoutDetails(page: any, sidebarPage: any, compPayoutPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToCompPayoutDetails();
    await page.waitForLoadState('networkidle');

    // Deep-link navigation via sidebar clicks doesn't always fully hydrate the
    // Angular component on first load — reload once if nothing rendered yet
    // (established pattern proven across this project's other spec files).
    const loaded = await compPayoutPage.searchInput
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await compPayoutPage.searchInput.waitFor({ state: 'visible', timeout: 30000 });
    }
}

test.describe('Comp Payout Details', () => {
    test.beforeEach(async ({ page, sidebarPage, compPayoutPage }) => {
        await navigateToCompPayoutDetails(page, sidebarPage, compPayoutPage);
    });

    test('TC-1 Verify Comp Payout Details page is accessible', async ({ page, compPayoutPage }, testInfo) => {
        await expect(compPayoutPage.searchInput).toBeVisible();
        await expect(compPayoutPage.table).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_comp_payout_details_page_accessible');
        console.log('✅ TC-1 PASSED — Comp Payout Details page is accessible with its search bar and table.');
    });

    test('TC-2 Verify all table columns are displayed', async ({ page }, testInfo) => {
        for (const columnName of compPayoutLocators.columnTitles) {
            await expect(page.locator('.p-column-title', { hasText: columnName }).first(), `Expected column "${columnName}" to be visible`)
                .toBeVisible();
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_all_columns_displayed');
        console.log(`✅ TC-2 PASSED — All ${compPayoutLocators.columnTitles.length} expected columns are displayed.`);
    });

    // Live-verified: the table shows existing payout rows by default (no search needed to see
    // data) — this reads a real Account Id straight from whatever's already displayed rather
    // than depending on a hardcoded value, since Comp Payout rows are real backend data this
    // automation suite doesn't (and can't) create itself.
    test('TC-3 Verify searching by an existing Account Id filters the table', async ({ page, compPayoutPage }, testInfo) => {
        const firstRow = compPayoutPage.getRowByIndex(0);
        await expect(firstRow, 'Expected at least one Comp Payout row to be visible by default').toBeVisible({ timeout: 15000 });
        const accountId = await compPayoutPage.getRowCellValue(firstRow, 'Account Id');

        await compPayoutPage.searchByAccountId(accountId);

        const resultRow = compPayoutPage.getRowByIndex(0);
        await expect(resultRow, 'Expected a row to remain visible after searching by an existing Account Id').toBeVisible({ timeout: 15000 });
        expect(await compPayoutPage.getRowCellValue(resultRow, 'Account Id')).toBe(accountId);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_search_by_account_id');
        console.log(`✅ TC-3 PASSED — Searching by Account Id "${accountId}" correctly filtered the table.`);
    });

    test('TC-4 Verify View Config opens the Comp Configuration page for the same Comp Code', async ({ page, compPayoutPage }, testInfo) => {
        const row = compPayoutPage.getRowByIndex(0);
        await expect(row, 'Expected at least one Comp Payout row to be visible').toBeVisible({ timeout: 15000 });
        const compCode = await compPayoutPage.getRowCellValue(row, 'Comp Code');

        await compPayoutPage.clickViewConfigOnRow(row);
        await page.waitForLoadState('networkidle');

        await expect(compPayoutPage.compConfigCodeValue, 'Expected the Comp Configuration page to show a Comp Code').toBeVisible({ timeout: 15000 });
        await expect(compPayoutPage.compConfigCodeValue, 'Expected the Comp Configuration page to show the SAME Comp Code as the payout row').toHaveText(compCode);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_view_config_same_comp_code');
        console.log(`✅ TC-4 PASSED — View Config opened the Comp Configuration page for the same Comp Code "${compCode}".`);
    });
});
