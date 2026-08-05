// npx playwright test tests/lapsecomp.spec.ts
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { lapseCompLocators } from '../locators/lapseCompLocators';

async function navigateToLapseCompManagement(page: any, sidebarPage: any, lapseCompPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToLapseCompManagement();
    await page.waitForLoadState('networkidle');

    // Deep-link navigation via sidebar clicks doesn't always fully hydrate the
    // Angular component on first load — reload once if nothing rendered yet
    // (established pattern proven across this project's other spec files).
    const loaded = await lapseCompPage.createConfigurationBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await lapseCompPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
    }
}

// Creates a fresh, disposable Lapse Comp Configuration and returns its Description — used by
// search tests so they operate on data this automation itself created, never pre-existing rows.
async function createDisposableLapseComp(page: any, lapseCompPage: any): Promise<string> {
    await lapseCompPage.clickCreateConfiguration();
    await lapseCompPage.waitForPopupLoad();

    const description = await lapseCompPage.fillMandatoryFields();

    await lapseCompPage.clickSave();
    await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 15000 });
    await expect(lapseCompPage.dialog).not.toBeVisible({ timeout: 15000 });

    return description;
}

// test.describe('Lapse Comp Management', () => {
//     test.beforeEach(async ({ page, sidebarPage, lapseCompPage }) => {
//         await navigateToLapseCompManagement(page, sidebarPage, lapseCompPage);
//     });

//     test('TC-1 Verify Lapse Comp Management page is accessible', async ({ page, lapseCompPage }, testInfo) => {
//         await expect(lapseCompPage.searchByCompIdInput).toBeVisible();
//         await expect(lapseCompPage.searchByCompCodeInput).toBeVisible();
//         await expect(lapseCompPage.searchByDescriptionInput).toBeVisible();
//         await expect(lapseCompPage.table).toBeVisible();
//         await expect(lapseCompPage.createConfigurationBtn).toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_lapse_comp_page_accessible');
//         console.log('✅ TC-1 PASSED — Lapse Comp Management page is accessible with its 3 search bars and table.');
//     });

//     test('TC-2 Verify all table columns are displayed', async ({ page }, testInfo) => {
//         for (const columnName of lapseCompLocators.columnTitles) {
//             await expect(page.locator('.p-column-title', { hasText: columnName }).first(), `Expected column "${columnName}" to be visible`)
//                 .toBeVisible();
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_all_columns_displayed');
//         console.log(`✅ TC-2 PASSED — All ${lapseCompLocators.columnTitles.length} expected columns are displayed.`);
//     });

//     test('TC-3 Verify Create Configuration popup opens with all 5 fields', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         await expect(lapseCompPage.dialog.locator('label:text-is("Description *")')).toBeVisible();
//         await expect(lapseCompPage.dialog.locator('label:text-is("Comp Code *")')).toBeVisible();
//         await expect(lapseCompPage.dialog.locator('label:text-is("Every Day At: (GMT+2)")')).toBeVisible();
//         await expect(lapseCompPage.dialog.locator('label:text-is("End Date")')).toBeVisible();
//         await expect(lapseCompPage.dialog.locator('label:text-is("Notify Email Csv")')).toBeVisible();
//         await expect(lapseCompPage.saveBtn).toBeVisible();
//         await expect(lapseCompPage.cancelBtn).toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_create_configuration_popup_structure');
//         console.log('✅ TC-3 PASSED — Create Configuration popup shows all 5 fields.');
//     });

//     test('TC-4 Verify Save stays disabled until every mandatory field is filled', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to start disabled').toBe(false);

//         await lapseCompPage.fillDescription(`AutoLapseComp_${CommonUtils.generateRandomString(6)}`);
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to still be disabled without Comp Code').toBe(false);

//         await lapseCompPage.selectFirstAvailableCompCode();
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to enable once Description and Comp Code are filled').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_save_enabled_after_mandatory_fields');
//         console.log('✅ TC-4 PASSED — Save correctly stays disabled until every mandatory field is filled.');
//     });

//     test('TC-5 Verify Notify Email Csv must be a valid email format', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         await lapseCompPage.fillMandatoryFields();
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to be enabled with just the mandatory fields filled').toBe(true);

//         await lapseCompPage.fillNotifyEmailCsv('not-a-valid-email');
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to disable with an invalid email in Notify Email Csv').toBe(false);

//         await lapseCompPage.fillNotifyEmailCsv('qa.automation@osiristrading.com');
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to re-enable once Notify Email Csv is a valid email').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_notify_email_csv_validation');
//         console.log('✅ TC-5 PASSED — Notify Email Csv correctly requires a valid email format.');
//     });

//     test('TC-6 Verify Cancel button discards data', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         const discardedDescription = `Should Not Be Saved ${Date.now()}`;
//         await lapseCompPage.fillMandatoryFields({ description: discardedDescription });
//         await lapseCompPage.clickCancel();

//         await expect(lapseCompPage.dialog).toBeHidden();
//         await expect(page.getByText(discardedDescription)).toHaveCount(0);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_cancel_discards_data');
//         console.log('✅ TC-6 PASSED — Cancel correctly discarded the entered data.');
//     });

//     test('TC-7 Verify creating a Configuration with only mandatory fields shows a success toast', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         const description = await lapseCompPage.fillMandatoryFields();
//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
//         await lapseCompPage.clickSave();

//         const toastText = await lapseCompPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 15000 });
//         await expect(lapseCompPage.dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_mandatory_fields_created_success');
//         console.log(`✅ TC-7 PASSED — Configuration "${description}" created with only mandatory fields.`);
//     });

//     test('TC-8 Verify creating a Configuration with every field populated shows a success toast', async ({ page, lapseCompPage }, testInfo) => {
//         await lapseCompPage.clickCreateConfiguration();
//         await lapseCompPage.waitForPopupLoad();

//         const description = await lapseCompPage.fillMandatoryFields();
//         await lapseCompPage.setEveryDayAtTime(2, 15);
//         await lapseCompPage.fillEndDate();
//         await lapseCompPage.fillNotifyEmailCsv('qa.automation@osiristrading.com');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_all_fields_filled');

//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to be enabled with every field filled').toBe(true);
//         await lapseCompPage.clickSave();

//         const toastText = await lapseCompPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 15000 });
//         await expect(lapseCompPage.dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_all_fields_created_success');
//         console.log(`✅ TC-8 PASSED — Configuration "${description}" created with every field populated.`);
//     });

//     test('TC-9 Verify searching by an existing Description filters the table', async ({ page, lapseCompPage }, testInfo) => {
//         const description = await createDisposableLapseComp(page, lapseCompPage);

//         await lapseCompPage.searchByDescription(description);

//         const row = lapseCompPage.getRowByIndex(0);
//         await expect(row, 'Expected the created Configuration to appear after searching by its Description').toBeVisible({ timeout: 15000 });
//         expect(await lapseCompPage.getRowCellValue(row, 'Description')).toBe(description);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_search_by_description');
//         console.log(`✅ TC-9 PASSED — Searching by Description "${description}" correctly filtered the table.`);
//     });

//     test('TC-10 Verify searching by an existing Comp Code filters the table', async ({ page, lapseCompPage }, testInfo) => {
//         const description = await createDisposableLapseComp(page, lapseCompPage);

//         // Find the row we just created (by its unique Description) to read the Comp Code it
//         // actually ended up with, then search by that value.
//         await lapseCompPage.searchByDescription(description);
//         const createdRow = lapseCompPage.getRowByIndex(0);
//         await expect(createdRow, 'Expected the created Configuration to appear after searching by its Description').toBeVisible({ timeout: 15000 });
//         const compCode = await lapseCompPage.getRowCellValue(createdRow, 'Comp Code');

//         await lapseCompPage.searchByDescription('');
//         await lapseCompPage.searchByCompCode(compCode);

//         const row = lapseCompPage.getRowByIndex(0);
//         await expect(row, 'Expected at least one Configuration to appear after searching by Comp Code').toBeVisible({ timeout: 15000 });
//         expect(await lapseCompPage.getRowCellValue(row, 'Comp Code')).toBe(compCode);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_search_by_comp_code');
//         console.log(`✅ TC-10 PASSED — Searching by Comp Code "${compCode}" correctly filtered the table.`);
//     });

//     test('TC-11 Verify searching by an existing #ID filters the table', async ({ page, lapseCompPage }, testInfo) => {
//         const description = await createDisposableLapseComp(page, lapseCompPage);

//         await lapseCompPage.searchByDescription(description);
//         const createdRow = lapseCompPage.getRowByIndex(0);
//         await expect(createdRow, 'Expected the created Configuration to appear after searching by its Description').toBeVisible({ timeout: 15000 });
//         const id = await lapseCompPage.getRowCellValue(createdRow, '#ID');

//         await lapseCompPage.searchByDescription('');
//         await lapseCompPage.searchByCompId(id);

//         const row = lapseCompPage.getRowByIndex(0);
//         await expect(row, 'Expected the Configuration to appear after searching by its #ID').toBeVisible({ timeout: 15000 });
//         expect(await lapseCompPage.getRowCellValue(row, '#ID')).toBe(id);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_search_by_id');
//         console.log(`✅ TC-11 PASSED — Searching by #ID "${id}" correctly filtered the table.`);
//     });

//     // Edits a disposable Configuration this automation itself just created — never an existing/
//     // original row. Reached via the row's kebab ("⋮") menu -> Edit, per the user's instruction.
//     test('TC-12 Verify editing a Configuration\'s Description and saving updates it', async ({ page, lapseCompPage }, testInfo) => {
//         const originalDescription = await createDisposableLapseComp(page, lapseCompPage);

//         await lapseCompPage.clickEditOnRow(originalDescription);
//         await lapseCompPage.waitForPopupLoad();

//         await expect(lapseCompPage.descriptionInput, 'Expected the Edit popup to open pre-filled with the existing Description')
//             .toHaveValue(originalDescription);

//         const updatedDescription = `${originalDescription}_Updated`;
//         await lapseCompPage.fillDescription(updatedDescription);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_description_edited');

//         expect(await lapseCompPage.isSaveEnabled(), 'Expected Save to be enabled after editing').toBe(true);
//         await lapseCompPage.clickSave();

//         // This toast has been slow to appear in practice — wait generously (60s) rather than
//         // this suite's usual 15s, to avoid a false failure on a toast that's merely running
//         // late, not actually missing.
//         const toastText = await lapseCompPage.getToastText(60000);
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 60000 });
//         await expect(lapseCompPage.dialog).not.toBeVisible({ timeout: 60000 });

//         await lapseCompPage.searchByDescription(updatedDescription);
//         const updatedRow = lapseCompPage.getRowByIndex(0);
//         await expect(updatedRow, 'Expected the updated Description to appear in the table').toBeVisible({ timeout: 15000 });
//         expect(await lapseCompPage.getRowCellValue(updatedRow, 'Description')).toBe(updatedDescription);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_edit_success');
//         console.log(`✅ TC-12 PASSED — Configuration "${originalDescription}" edited to "${updatedDescription}" successfully.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Lapse Comp Region
// // ═══════════════════════════════════════════════════════════════════════════════
// // Reached via a Lapse Comp row's kebab ("⋮") menu -> Regions. Each test creates its own
// // disposable Lapse Comp Configuration first (never touching an existing/original one), so its
// // Region list starts empty — the one Region Configuration a test then creates is unambiguously
// // "mine" at index 0, with no need to search/filter by exact Region Code.
// async function navigateToLapseCompRegions(page: any, sidebarPage: any, lapseCompPage: any, lapseCompRegionPage: any): Promise<string> {
//     await navigateToLapseCompManagement(page, sidebarPage, lapseCompPage);
//     const description = await createDisposableLapseComp(page, lapseCompPage);
//     await lapseCompPage.clickRegionsOnRow(description);
//     await page.waitForLoadState('networkidle');

//     const loaded = await lapseCompRegionPage.createRegionConfigBtn
//         .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
//     if (!loaded) {
//         await page.reload();
//         await page.waitForLoadState('networkidle');
//         await lapseCompRegionPage.createRegionConfigBtn.waitFor({ state: 'visible', timeout: 30000 });
//     }

//     // Wait out the app's own page-loader overlay before letting any test proceed to click
//     // Create Region Config — the button can report as "visible" per Playwright's definition
//     // while the loader still visually sits on top of it, intercepting clicks for the full
//     // action timeout even though the element underneath is fine (same class of bug already
//     // fixed elsewhere in this suite, e.g. CompConfigPage.waitForCreateCompButtonReady).
//     await page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
//     await page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

//     return description;
// }

// // Creates a fresh, disposable Region Configuration on the current (already-disposable) Lapse
// // Comp and returns its Region Code — used by Edit/Delete tests so they only ever touch a
// // Region Configuration this automation itself created.
// async function createDisposableLapseCompRegion(page: any, lapseCompRegionPage: any): Promise<string> {
//     await lapseCompRegionPage.clickCreateRegionConfig();
//     await lapseCompRegionPage.waitForPopupLoad();

//     const regionCode = await lapseCompRegionPage.selectFirstAvailableRegionCode();

//     await lapseCompRegionPage.clickSave();
//     await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first()).toBeVisible({ timeout: 60000 });
//     await expect(lapseCompRegionPage.dialog).not.toBeVisible({ timeout: 60000 });

//     return regionCode;
// }

// test.describe('Lapse Comp Region', () => {
//     test.beforeEach(async ({ page, sidebarPage, lapseCompPage, lapseCompRegionPage }) => {
//         await navigateToLapseCompRegions(page, sidebarPage, lapseCompPage, lapseCompRegionPage);
//     });

//     test('TC-13 Verify Lapse Comp Region page is accessible', async ({ page, lapseCompRegionPage }, testInfo) => {
//         await expect(lapseCompRegionPage.createRegionConfigBtn).toBeVisible();
//         await expect(lapseCompRegionPage.backButton).toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_region_page_accessible');
//         console.log('✅ TC-13 PASSED — Lapse Comp Region page is accessible with its Create Region Config and Back buttons.');
//     });

//     test('TC-14 Verify Create Region Config popup opens with all 5 fields', async ({ page, lapseCompRegionPage }, testInfo) => {
//         await lapseCompRegionPage.clickCreateRegionConfig();
//         await lapseCompRegionPage.waitForPopupLoad();

//         await expect(lapseCompRegionPage.dialog.locator('label:text-is("Region Code *")')).toBeVisible();
//         await expect(lapseCompRegionPage.dialog.locator('label:text-is("Push Notification Template")')).toBeVisible();
//         await expect(lapseCompRegionPage.dialog.locator('label:text-is("SMS Template")')).toBeVisible();
//         await expect(lapseCompRegionPage.dialog.locator('label:text-is("Tag Name")')).toBeVisible();
//         await expect(lapseCompRegionPage.dialog.locator('label:text-is("Tag Value")')).toBeVisible();
//         await expect(lapseCompRegionPage.saveBtn).toBeVisible();
//         await expect(lapseCompRegionPage.cancelBtn).toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_create_region_config_popup_structure');
//         console.log('✅ TC-14 PASSED — Create Region Config popup shows all 5 fields.');
//     });

//     test('TC-15 Verify Save stays disabled until Region Code is selected', async ({ page, lapseCompRegionPage }, testInfo) => {
//         await lapseCompRegionPage.clickCreateRegionConfig();
//         await lapseCompRegionPage.waitForPopupLoad();

//         expect(await lapseCompRegionPage.isSaveEnabled(), 'Expected Save to start disabled').toBe(false);

//         await lapseCompRegionPage.selectFirstAvailableRegionCode();
//         expect(await lapseCompRegionPage.isSaveEnabled(), 'Expected Save to enable once Region Code is selected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_save_enabled_after_region_code');
//         console.log('✅ TC-15 PASSED — Save correctly stays disabled until Region Code is selected.');
//     });

//     test('TC-16 Verify creating a Region Configuration shows a success toast', async ({ page, lapseCompRegionPage }, testInfo) => {
//         await lapseCompRegionPage.clickCreateRegionConfig();
//         await lapseCompRegionPage.waitForPopupLoad();

//         const regionCode = await lapseCompRegionPage.selectFirstAvailableRegionCode();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_all_fields_filled');

//         expect(await lapseCompRegionPage.isSaveEnabled(), 'Expected Save to be enabled with Region Code selected').toBe(true);
//         await lapseCompRegionPage.clickSave();

//         // This toast has been slow to appear in practice — wait generously (60s) rather than
//         // this suite's usual 15s, to avoid a false failure on a toast that's merely running
//         // late, not actually missing.
//         const toastText = await lapseCompRegionPage.getToastText(60000);
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first()).toBeVisible({ timeout: 60000 });
//         await expect(lapseCompRegionPage.dialog).not.toBeVisible({ timeout: 60000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_region_created_success');
//         console.log(`✅ TC-16 PASSED — Region Configuration "${regionCode}" created successfully.`);
//     });

//     test('TC-17 Verify Back button navigates to the Lapse Comp Management page', async ({ page, lapseCompPage, lapseCompRegionPage }, testInfo) => {
//         await lapseCompRegionPage.clickBackButton();
//         await page.waitForLoadState('networkidle');

//         await expect(lapseCompPage.createConfigurationBtn, 'Expected Back to navigate to the Lapse Comp Management page').toBeVisible({ timeout: 20000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_back_button_navigation');
//         console.log('✅ TC-17 PASSED — Back button navigated to the Lapse Comp Management page.');
//     });

//     test('TC-18 Verify editing a Region Configuration and saving updates it', async ({ page, lapseCompRegionPage }, testInfo) => {
//         const regionCode = await createDisposableLapseCompRegion(page, lapseCompRegionPage);

//         await lapseCompRegionPage.clickEditOnRow();
//         await lapseCompRegionPage.waitForPopupLoad();

//         const updatedTagValue = `AutoTagValue_Updated_${CommonUtils.generateRandomString(6)}`;
//         await lapseCompRegionPage.fillTagValue(updatedTagValue);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_tag_value_edited');

//         expect(await lapseCompRegionPage.isSaveEnabled(), 'Expected Save to be enabled after editing').toBe(true);
//         await lapseCompRegionPage.clickSave();

//         const toastText = await lapseCompRegionPage.getToastText(60000);
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first()).toBeVisible({ timeout: 60000 });
//         await expect(lapseCompRegionPage.dialog).not.toBeVisible({ timeout: 60000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_edit_success');
//         console.log(`✅ TC-18 PASSED — Region Configuration "${regionCode}" edited successfully.`);
//     });

//     test('TC-19 Verify confirming Delete (Yes) removes the Region Configuration', async ({ page, lapseCompRegionPage }, testInfo) => {
//         const regionCode = await createDisposableLapseCompRegion(page, lapseCompRegionPage);

//         await lapseCompRegionPage.clickDeleteOnRow();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_before_confirming_delete');
//         await lapseCompRegionPage.clickYesOnConfirmDialog();

//         const toastText = await lapseCompRegionPage.getToastText(60000);
//         console.log(`Toast after Delete (Yes): "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first()).toBeVisible({ timeout: 60000 });

//         // The table's own empty state is itself a real <tr> ("No available options"), not an
//         // absence of rows — confirmed live: a naive getRows().toHaveCount(0) never passes even
//         // on a genuinely successful delete, since that placeholder row is always present once
//         // the list is empty.
//         await expect(page.getByText('No available options'), 'Expected the table to show its empty state after confirming Delete')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_region_deleted');
//         console.log(`✅ TC-19 PASSED — Region Configuration "${regionCode}" deleted successfully.`);
//     });

//     test('TC-20 Verify cancelling Delete (No) leaves the Region Configuration', async ({ page, lapseCompRegionPage }, testInfo) => {
//         const regionCode = await createDisposableLapseCompRegion(page, lapseCompRegionPage);

//         await lapseCompRegionPage.clickDeleteOnRow();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_before_cancelling_delete');
//         await lapseCompRegionPage.clickNoOnConfirmDialog();

//         await expect(lapseCompRegionPage.getRowByIndex(0), 'Expected the Region Configuration to remain after cancelling Delete')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_region_not_deleted');
//         console.log(`✅ TC-20 PASSED — Region Configuration "${regionCode}" remained after cancelling Delete (No).`);
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  Lapse Comp Logs
// ═══════════════════════════════════════════════════════════════════════════════
// Reached via a Lapse Comp row's kebab ("⋮") menu -> Logs — a purely read-only navigation
// feature, so unlike Region these tests reuse whatever row the Management table already shows
// instead of creating a fresh disposable Configuration first.
test.describe('Lapse Comp Logs', () => {
    test.beforeEach(async ({ page, sidebarPage, lapseCompPage }) => {
        await navigateToLapseCompManagement(page, sidebarPage, lapseCompPage);
    });

    // test('TC-21 Verify Logs navigates to the Lapse Comp Logs page for the same Comp Code', async ({ page, lapseCompPage, lapseCompLogsPage }, testInfo) => {
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected at least one Lapse Comp row to be visible').toBeVisible({ timeout: 15000 });
    //     const compCode = await lapseCompPage.getRowCellValue(row, 'Comp Code');

    //     await lapseCompPage.clickLogsOnRow(row);
    //     await page.waitForLoadState('networkidle');

    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Lapse Comp Logs page to show a Comp Code').toBeVisible({ timeout: 15000 });
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Lapse Comp Logs page to show the SAME Comp Code as the selected row').toHaveText(compCode);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_logs_same_comp_code');
    //     console.log(`✅ TC-21 PASSED — Logs opened the Lapse Comp Logs page for the same Comp Code "${compCode}".`);
    // });

    // test('TC-22 Verify View Comp navigates to the Comp Configuration page for the same Comp Code', async ({ page, lapseCompPage, lapseCompLogsPage }, testInfo) => {
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected at least one Lapse Comp row to be visible').toBeVisible({ timeout: 15000 });
    //     const compCode = await lapseCompPage.getRowCellValue(row, 'Comp Code');

    //     await lapseCompPage.clickLogsOnRow(row);
    //     await page.waitForLoadState('networkidle');
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Lapse Comp Logs page to show a Comp Code').toBeVisible({ timeout: 15000 });

    //     await lapseCompLogsPage.clickViewComp();
    //     await page.waitForLoadState('networkidle');

    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Comp Configuration page to show a Comp Code').toBeVisible({ timeout: 15000 });
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Comp Configuration page to show the SAME Comp Code as the Lapse Comp Logs page').toHaveText(compCode);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_view_comp_same_comp_code');
    //     console.log(`✅ TC-22 PASSED — View Comp opened the Comp Configuration page for the same Comp Code "${compCode}".`);
    // });

    // test('TC-23 Verify Back button navigates back to the Lapse Comp Management page', async ({ page, lapseCompPage, lapseCompLogsPage }, testInfo) => {
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected at least one Lapse Comp row to be visible').toBeVisible({ timeout: 15000 });

    //     await lapseCompPage.clickLogsOnRow(row);
    //     await page.waitForLoadState('networkidle');
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Lapse Comp Logs page to show a Comp Code').toBeVisible({ timeout: 15000 });

    //     await lapseCompLogsPage.clickBackButton();
    //     await page.waitForLoadState('networkidle');

    //     await expect(lapseCompPage.createConfigurationBtn, 'Expected Back to navigate to the Lapse Comp Management page').toBeVisible({ timeout: 20000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_back_button_navigation');
    //     console.log('✅ TC-23 PASSED — Back button navigated to the Lapse Comp Management page.');
    // });

    // test('TC-24 Verify Comps navigates to the Comp Configuration page for the same Comp Code', async ({ page, lapseCompPage, lapseCompLogsPage }, testInfo) => {
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected at least one Lapse Comp row to be visible').toBeVisible({ timeout: 15000 });
    //     const compCode = await lapseCompPage.getRowCellValue(row, 'Comp Code');

    //     await lapseCompPage.clickCompsOnRow(row);
    //     await page.waitForLoadState('networkidle');

    //     // Comps navigates straight to the Comp Configuration page (no intermediate Logs page),
    //     // which renders the exact same <pure-header-details-component> — reusing
    //     // lapseCompLogsPage.compCodeValue here is the same selector, just scoped to this page.
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Comp Configuration page to show a Comp Code').toBeVisible({ timeout: 15000 });
    //     await expect(lapseCompLogsPage.compCodeValue, 'Expected the Comp Configuration page to show the SAME Comp Code as the selected row').toHaveText(compCode);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_comps_same_comp_code');
    //     console.log(`✅ TC-24 PASSED — Comps opened the Comp Configuration page for the same Comp Code "${compCode}".`);
    // });
});

// Creates a fresh, disposable Lapse Comp Configuration and approves it (Yes), returning its
// Description — Mark For Processing only succeeds on an already-approved comp (confirmed live:
// TC-27 failed with an unapproved comp), so every Mark For Processing test must go through this
// instead of createDisposableLapseComp directly.
async function createDisposableApprovedLapseComp(page: any, lapseCompPage: any): Promise<string> {
    const description = await createDisposableLapseComp(page, lapseCompPage);
    await lapseCompPage.searchByDescription(description);
    const row = lapseCompPage.getRowByIndex(0);
    await row.waitFor({ state: 'visible', timeout: 15000 });

    await lapseCompPage.clickApproveOnRow(row);
    await lapseCompPage.clickYesOnConfirmDialog();
    await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 30000 });

    return description;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Lapse Comp — Approve / Mark For Processing
// ═══════════════════════════════════════════════════════════════════════════════
// Both reached via a Lapse Comp row's kebab ("⋮") menu, each opening the same Yes/No
// confirmation modal. Approve can only be performed once per comp, so every test here creates
// its own fresh disposable Configuration first — never a shared/reused row.
test.describe('Lapse Comp - Approve / Mark For Processing', () => {
    test.beforeEach(async ({ page, sidebarPage, lapseCompPage }) => {
        await navigateToLapseCompManagement(page, sidebarPage, lapseCompPage);
    });

    // test('TC-25 Verify Approve with Yes shows a success toast', async ({ page, lapseCompPage }, testInfo) => {
    //     const description = await createDisposableLapseComp(page, lapseCompPage);
    //     await lapseCompPage.searchByDescription(description);
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

    //     await lapseCompPage.clickApproveOnRow(row);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_before_confirming_approve');
    //     await lapseCompPage.clickYesOnConfirmDialog();

    //     const toastText = await lapseCompPage.getToastText(30000);
    //     console.log(`Toast after Approve (Yes): "${toastText}"`);
    //     await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 30000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_approve_success');
    //     console.log(`✅ TC-25 PASSED — Configuration "${description}" approved successfully.`);
    // });

    // test('TC-26 Verify Approve with No cancels without approving', async ({ page, lapseCompPage }, testInfo) => {
    //     const description = await createDisposableLapseComp(page, lapseCompPage);
    //     await lapseCompPage.searchByDescription(description);
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

    //     await lapseCompPage.clickApproveOnRow(row);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_before_cancelling_approve');
    //     await lapseCompPage.clickNoOnConfirmDialog();

    //     await expect(page.getByRole('button', { name: 'Yes', exact: true }), 'Expected the confirmation dialog to close after clicking No')
    //         .not.toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_approve_cancelled');
    //     console.log(`✅ TC-26 PASSED — Configuration "${description}" was not approved after cancelling with No.`);
    // });

    // test('TC-27 Verify Mark For Processing with Yes shows a success toast', async ({ page, lapseCompPage }, testInfo) => {
    //     const description = await createDisposableApprovedLapseComp(page, lapseCompPage);
    //     await lapseCompPage.searchByDescription(description);
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

    //     await lapseCompPage.clickMarkForProcessingOnRow(row);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_before_confirming_mark_for_processing');
    //     await lapseCompPage.clickYesOnConfirmDialog();

    //     const toastText = await lapseCompPage.getToastText(30000);
    //     console.log(`Toast after Mark For Processing (Yes): "${toastText}"`);
    //     await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 30000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_mark_for_processing_success');
    //     console.log(`✅ TC-27 PASSED — Configuration "${description}" marked for processing successfully.`);
    // });

    // test('TC-28 Verify Mark For Processing with No cancels without processing', async ({ page, lapseCompPage }, testInfo) => {
    //     const description = await createDisposableApprovedLapseComp(page, lapseCompPage);
    //     await lapseCompPage.searchByDescription(description);
    //     const row = lapseCompPage.getRowByIndex(0);
    //     await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

    //     await lapseCompPage.clickMarkForProcessingOnRow(row);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_before_cancelling_mark_for_processing');
    //     await lapseCompPage.clickNoOnConfirmDialog();

    //     await expect(page.getByRole('button', { name: 'Yes', exact: true }), 'Expected the confirmation dialog to close after clicking No')
    //         .not.toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_mark_for_processing_cancelled');
    //     console.log(`✅ TC-28 PASSED — Configuration "${description}" was not marked for processing after cancelling with No.`);
    // });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Lapse Comp — Delete
// ═══════════════════════════════════════════════════════════════════════════════
// Reached via a Lapse Comp row's kebab ("⋮") menu -> Delete, opening the same Yes/No
// confirmation modal used by Approve/Mark For Processing. Each test creates its own fresh
// disposable Configuration first, so Delete only ever removes automation's own data.
test.describe('Lapse Comp - Delete', () => {
    test.beforeEach(async ({ page, sidebarPage, lapseCompPage }) => {
        await navigateToLapseCompManagement(page, sidebarPage, lapseCompPage);
    });

    test('TC-29 Verify Delete with Yes removes the Configuration', async ({ page, lapseCompPage }, testInfo) => {
        const description = await createDisposableLapseComp(page, lapseCompPage);
        await lapseCompPage.searchByDescription(description);
        const row = lapseCompPage.getRowByIndex(0);
        await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

        await lapseCompPage.clickDeleteOnRow(row);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_before_confirming_delete');
        await lapseCompPage.clickYesOnConfirmDialog();

        const toastText = await lapseCompPage.getToastText(30000);
        console.log(`Toast after Delete (Yes): "${toastText}"`);
        await expect(page.locator(lapseCompLocators.toastSuccess).first()).toBeVisible({ timeout: 30000 });

        // Unlike Lapse Comp Region (an isolated, otherwise-empty list per test), this table
        // holds many pre-existing rows — searching the now-deleted Description won't
        // necessarily render a "No available options" empty-state, so check directly that no
        // row with that Description remains, rather than depending on placeholder text/markup
        // that may not even apply to a filtered (rather than genuinely empty) result set.
        await lapseCompPage.searchByDescription(description);
        await expect(page.locator('table tbody tr, .p-datatable-tbody tr', { hasText: description }),
            'Expected no row with the deleted Description to remain after confirming Delete').toHaveCount(0, { timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_configuration_deleted');
        console.log(`✅ TC-29 PASSED — Configuration "${description}" deleted successfully.`);
    });

    test('TC-30 Verify Delete with No leaves the Configuration', async ({ page, lapseCompPage }, testInfo) => {
        const description = await createDisposableLapseComp(page, lapseCompPage);
        await lapseCompPage.searchByDescription(description);
        const row = lapseCompPage.getRowByIndex(0);
        await expect(row, 'Expected the newly created Configuration row to be visible').toBeVisible({ timeout: 15000 });

        await lapseCompPage.clickDeleteOnRow(row);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_before_cancelling_delete');
        await lapseCompPage.clickNoOnConfirmDialog();

        await expect(page.getByRole('button', { name: 'Yes', exact: true }), 'Expected the confirmation dialog to close after clicking No')
            .not.toBeVisible({ timeout: 10000 });

        await lapseCompPage.searchByDescription(description);
        await expect(lapseCompPage.getRowByIndex(0), 'Expected the Configuration to remain after cancelling Delete')
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_configuration_not_deleted');
        console.log(`✅ TC-30 PASSED — Configuration "${description}" remained after cancelling Delete (No).`);
    });
});
