// npx playwright test tests/compbulk.spec.ts
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import path from 'path';

// Columns confirmed by the user: CompValue,AccountId,BrandId,MobileNumber,CompFreeBets — every
// AccountId in this file is a disposable, made-up GUID, never a real/pre-existing account.
const BULK_COMP_CSV = path.join(__dirname, '../test-data/bulk_comp.csv');

// ─── Shared navigation helper ─────────────────────────────────────────────────
async function navigateToCompsBulk(page: any, sidebarPage: any, compsBulkPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();
    await sidebarPage.navigateToCompsBulk();
    await page.waitForLoadState('networkidle');

    // Deep-link navigation via sidebar clicks doesn't always fully hydrate the
    // Angular/Stencil component on first load — reload once if nothing
    // rendered yet (established pattern proven across this project's other
    // spec files).
    const loaded = await compsBulkPage.createBulkCompBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await compsBulkPage.createBulkCompBtn.waitFor({ state: 'visible', timeout: 30000 });
    }
}

// Picks the first row this automation created earlier (Description prefixed "AutoBulkComp_")
// rather than creating a fresh one — shared by Edit and Review tests, both of which operate on
// an already-existing bulk comp, never a pre-existing/original row.
async function pickExistingAutomationRow(compsBulkPage: any): Promise<string> {
    const row = compsBulkPage.getFirstAutomationRow();
    await expect(row, 'Expected at least one automation-created bulk comp already in the table').toBeVisible({ timeout: 15000 });
    return compsBulkPage.getRowDescriptionText(row);
}

// Navigates Comp Bulk -> (kebab menu on an existing automation row) -> Configurations. The
// Configurations page itself isn't tied to which row you opened it from — any existing row works.
async function navigateToCompBulkConfigurations(page: any, sidebarPage: any, compsBulkPage: any, compBulkConfigurationsPage: any) {
    await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
    const description = await pickExistingAutomationRow(compsBulkPage);
    await compsBulkPage.clickConfigurationsOnRow(description);
    await page.waitForLoadState('networkidle');

    const loaded = await compBulkConfigurationsPage.createConfigurationBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await compBulkConfigurationsPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
    }
}

// Fills every mandatory Configuration field with valid values that satisfy both budget rules
// (Minimum < Maximum < Campaign Budget) — shared by every describe block that creates one.
async function fillMandatoryConfigurationFields(compBulkConfigurationsPage: any, dialog: any, description: string) {
    await compBulkConfigurationsPage.fillDescription(dialog, description);
    await compBulkConfigurationsPage.selectRegionCode(dialog);
    await compBulkConfigurationsPage.selectTransactionType(dialog);
    await compBulkConfigurationsPage.fillMinimumPayout(dialog, '10');
    await compBulkConfigurationsPage.fillMaximumPayout(dialog, '50');
    await compBulkConfigurationsPage.fillCampaignBudget(dialog, '100');
}

// Creates a fresh, disposable Configuration and returns its Description — used by Edit tests so
// they only ever touch a Configuration this automation itself created, never a pre-existing one.
async function createDisposableConfiguration(page: any, compBulkConfigurationsPage: any, namePrefix: string): Promise<string> {
    const description = `${namePrefix}_${CommonUtils.generateRandomString(6)}`;

    await compBulkConfigurationsPage.clickCreateConfiguration();
    const dialog = compBulkConfigurationsPage.getDialog();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await fillMandatoryConfigurationFields(compBulkConfigurationsPage, dialog, description);

    await compBulkConfigurationsPage.clickSave(dialog);
    await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
        .toBeVisible({ timeout: 15000 });
    await expect(dialog).not.toBeVisible({ timeout: 15000 });

    return description;
}

// Picks the first existing configuration card, whichever it is — used by tests that only need
// to reach a card (e.g. to check navigation), never modify it, so no new one needs creating.
async function pickExistingConfiguration(compBulkConfigurationsPage: any): Promise<string> {
    const card = compBulkConfigurationsPage.getFirstConfigurationCard();
    await expect(card, 'Expected at least one configuration already on the page').toBeVisible({ timeout: 15000 });
    return compBulkConfigurationsPage.getCardDescriptionText(card);
}

// test.describe('Comp Bulk - Page Level Tests', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-1 Verify Comp Bulk page is accessible and Create Bulk Comp button is visible', async ({ page, compsBulkPage }, testInfo) => {
//         await expect(compsBulkPage.createBulkCompBtn).toBeVisible({ timeout: 20000 });
//         await CommonUtils.highlightElementBorder(compsBulkPage.createBulkCompBtn);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_comp_bulk_page_accessible');
//         console.log('Comp Bulk page is accessible and Create Bulk Comp button is visible.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Create Bulk Comp — Dialog Structure
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Comp Bulk - Create Bulk Comp Dialog', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-2 Verify Create Bulk Comp dialog opens with mandatory fields and all 8 checkboxes', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await expect(dialog.locator('label:text-is("Bulk Comp Description *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Comp Code *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Region Code *")')).toBeVisible();
//         await expect(dialog.locator('input[type="file"][accept=".csv"]')).toBeAttached();

//         const checkboxLabels = [
//             'Send Push Notification',
//             'Send SMS',
//             'Tag User',
//             'Is Segment Based',
//             'Comp Tagged Players',
//             'Is Recurring',
//             'Use Segment Suggested Comp Amount',
//             'Randomise Order',
//         ];
//         for (const label of checkboxLabels) {
//             await expect(dialog.locator('label.cursor-pointer', { hasText: label }).first()).toBeVisible();
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_bulk_comp_dialog_structure');
//         console.log('Create Bulk Comp dialog shows every mandatory field and all 8 checkboxes.');
//     });

//     test('TC-3 Verify Region Code is disabled until Comp Code is selected', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compsBulkPage.isRegionCodeDisabled(dialog), 'Expected Region Code to start disabled').toBe(true);

//         await compsBulkPage.selectCompCode(dialog);

//         expect(await compsBulkPage.isRegionCodeDisabled(dialog), 'Expected Region Code to enable once a Comp Code is selected').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_region_code_enabled_after_comp_code');
//         console.log('Region Code correctly stays disabled until a Comp Code is selected.');
//     });

//     test('TC-4 Verify each conditional field appears when its owning checkbox is checked', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compsBulkPage.toggleSendPushNotification();
//         await expect(dialog.locator('label:text-is("Push Message Template")'), 'Expected Push Message Template to appear').toBeVisible({ timeout: 5000 });
//         // Send Push and Send SMS are mutually exclusive.
//         await compsBulkPage.toggleSendPushNotification();

//         await compsBulkPage.toggleSendSms();
//         await expect(dialog.locator('label:text-is("SMS Message Template")'), 'Expected SMS Message Template to appear').toBeVisible({ timeout: 5000 });
//         await compsBulkPage.toggleSendSms();

//         await compsBulkPage.toggleTagUser();
//         await expect(dialog.locator('label:text-is("Tag Name")'), 'Expected Tag Name to appear').toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('label:text-is("Tag Value")'), 'Expected Tag Value to appear').toBeVisible({ timeout: 5000 });
//         await compsBulkPage.toggleTagUser();

//         await compsBulkPage.toggleIsSegmentBased();
//         await expect(dialog.locator('label:text-is("Segmentation Group")'), 'Expected Segmentation Group to appear').toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('label:text-is("Percentage of Players to Process")'), 'Expected Percentage of Players to Process to appear').toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('label:text-is("Comp Value *")'), 'Expected Comp Value * to appear').toBeVisible({ timeout: 5000 });
//         // Is Segment Based and Comp Tagged Players are mutually exclusive.
//         await compsBulkPage.toggleIsSegmentBased();

//         await compsBulkPage.toggleCompTaggedPlayers();
//         await expect(dialog.locator('label:text-is("Comp Value *")'), 'Expected Comp Value * to appear').toBeVisible({ timeout: 5000 });
//         await compsBulkPage.toggleCompTaggedPlayers();

//         await compsBulkPage.toggleIsRecurring();
//         await expect(dialog.locator('label:text-is("Cron Expression")'), 'Expected Cron Expression to appear').toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('label:text-is("Start Date")'), 'Expected Start Date to appear').toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('label:text-is("End Date")'), 'Expected End Date to appear').toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_conditional_fields_appear');
//         console.log('Every conditional field appears when its owning checkbox is checked.');
//     });

//     test('TC-5 Verify Save stays disabled until every mandatory field is filled', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to start disabled').toBe(false);

//         const description = `AutoBulkComp_${CommonUtils.generateRandomString(6)}`;
//         await compsBulkPage.fillDescription(dialog, description);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Comp Code/Region Code/CSV').toBe(false);

//         await compsBulkPage.selectCompCode(dialog);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Region Code/CSV').toBe(false);

//         await compsBulkPage.selectRegionCode(dialog);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without CSV').toBe(false);

//         await compsBulkPage.chooseCsvFile(dialog, BULK_COMP_CSV);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to enable once every mandatory field is filled').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_save_enabled_after_mandatory_fields');
//         console.log('Save correctly stays disabled until Description, Comp Code, Region Code and CSV are all filled.');
//     });

//     // CSV upload isn't the only way to satisfy Save — checking "Is Segment Based" or "Comp
//     // Tagged Players" and filling their own Comp Value * is an alternative to it (confirmed by
//     // the user). Only Comp Value * is actually required within either section; every other
//     // field there (Segmentation Group / Comp Player Tag Name, Percentage, Budget, Freebet) is
//     // optional.
//     test('TC-5b Verify Save enables via Is Segment Based + Segmentation Group + Comp Value *, without uploading a CSV', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         const description = `AutoBulkComp_${CommonUtils.generateRandomString(6)}`;
//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without CSV or a segment/tag route').toBe(false);

//         await compsBulkPage.toggleIsSegmentBased();
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled before Segmentation Group / Comp Value * are filled').toBe(false);

//         await compsBulkPage.fillCompValue(dialog, '10');
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Segmentation Group').toBe(false);

//         await compsBulkPage.selectSegmentationGroup(dialog);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to enable via Is Segment Based + Segmentation Group + Comp Value *, without a CSV').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5b_save_enabled_via_segment_based');
//         console.log('Save correctly enables via Is Segment Based + Segmentation Group + Comp Value *, without needing a CSV upload.');
//     });

//     test('TC-5c Verify Save enables via Comp Tagged Players + Comp Value *, without uploading a CSV', async ({ page, compsBulkPage }, testInfo) => {
//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         const description = `AutoBulkComp_${CommonUtils.generateRandomString(6)}`;
//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without CSV or a segment/tag route').toBe(false);

//         await compsBulkPage.toggleCompTaggedPlayers();
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to still be disabled before Comp Value * is filled').toBe(false);

//         await compsBulkPage.fillCompValue(dialog, '10');
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to enable via Comp Tagged Players + Comp Value *, without a CSV').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5c_save_enabled_via_tagged_players');
//         console.log('Save correctly enables via Comp Tagged Players + Comp Value *, without needing a CSV upload.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Create Bulk Comp — Positive Scenarios
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Comp Bulk - Create Bulk Comp (Positive)', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-6 Create a bulk comp with only mandatory fields', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         await compsBulkPage.chooseCsvFile(dialog, BULK_COMP_CSV);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_mandatory_fields_filled');

//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
//         await compsBulkPage.clickSave(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_bulk_comp_created_success');
//         console.log(`✅ TC-6 PASSED — Bulk comp "${description}" created with only mandatory fields.`);
//     });

//     test('TC-7 Create a bulk comp via Is Segment Based instead of uploading a CSV', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_Segment_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         await compsBulkPage.toggleIsSegmentBased();
//         await compsBulkPage.selectSegmentationGroup(dialog);
//         await compsBulkPage.fillCompValue(dialog, '10');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_segment_based_fields_filled');

//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to be enabled via Is Segment Based + Segmentation Group + Comp Value *').toBe(true);
//         await compsBulkPage.clickSave(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_bulk_comp_created_success');
//         console.log(`✅ TC-7 PASSED — Bulk comp "${description}" created via Is Segment Based, no CSV.`);
//     });

//     test('TC-8 Create a bulk comp via Comp Tagged Players instead of uploading a CSV', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_TaggedPlayers_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         await compsBulkPage.toggleCompTaggedPlayers();
//         await compsBulkPage.fillCompValue(dialog, '10');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_tagged_players_fields_filled');

//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to be enabled via Comp Tagged Players + Comp Value *').toBe(true);
//         await compsBulkPage.clickSave(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_bulk_comp_created_success');
//         console.log(`✅ TC-8 PASSED — Bulk comp "${description}" created via Comp Tagged Players, no CSV.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Create Bulk Comp — Every checkbox tried individually
// // ═══════════════════════════════════════════════════════════════════════════════
// // Is Segment Based and Comp Tagged Players are already covered above (TC-7, TC-8) since they
// // double as alternatives to CSV upload for satisfying Save. The remaining 6 checkboxes are
// // additive options layered on top of the same CSV-upload mandatory-fields baseline, so each
// // test below isolates exactly one checkbox's own behavior.
// test.describe('Comp Bulk - Create Bulk Comp (Every Checkbox Individually)', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     // Satisfies Save's mandatory-field gate via Is Segment Based + Comp Value * instead of a
//     // CSV upload — used by every test below so each test's own checkbox is exercised without
//     // depending on a file upload.
//     async function fillMandatoryFieldsWithSegment(compsBulkPage: any, dialog: any, description: string) {
//         await compsBulkPage.fillDescription(dialog, description);
//         await compsBulkPage.selectCompCode(dialog);
//         await compsBulkPage.selectRegionCode(dialog);
//         await compsBulkPage.toggleIsSegmentBased();
//         // Segmentation Group is now required alongside Comp Value * for Save to enable via this
//         // route — confirmed by the user.
//         await compsBulkPage.selectSegmentationGroup(dialog);
//         await compsBulkPage.fillCompValue(dialog, '10');
//     }

//     async function saveAndVerifySuccess(page: any, compsBulkPage: any, dialog: any, testInfo: any, screenshotPrefix: string) {
//         expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to be enabled').toBe(true);
//         await compsBulkPage.clickSave(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', `${screenshotPrefix}_bulk_comp_created_success`);
//     }

//     test('TC-9 Create a bulk comp with Send Push Notification checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_SendPush_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleSendPushNotification();
//         expect(await compsBulkPage.isCheckboxChecked('sendPush'), 'Expected Send Push Notification to be checked').toBe(true);
//         await compsBulkPage.selectPushMessageTemplate(dialog);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_send_push_fields_filled');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-9');
//         console.log(`✅ TC-9 PASSED — Bulk comp "${description}" created with Send Push Notification checked.`);
//     });

//     test('TC-10 Create a bulk comp with Send SMS checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_SendSms_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleSendSms();
//         expect(await compsBulkPage.isCheckboxChecked('sendSms'), 'Expected Send SMS to be checked').toBe(true);
//         await compsBulkPage.selectSmsMessageTemplate(dialog);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_send_sms_fields_filled');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-10');
//         console.log(`✅ TC-10 PASSED — Bulk comp "${description}" created with Send SMS checked.`);
//     });

//     test('TC-11 Create a bulk comp with Tag User checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_TagUser_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleTagUser();
//         expect(await compsBulkPage.isCheckboxChecked('tagUser'), 'Expected Tag User to be checked').toBe(true);
//         await compsBulkPage.selectTagName(dialog);
//         await compsBulkPage.fillTagValue(dialog, 'AutoTagValue');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_tag_user_fields_filled');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-11');
//         console.log(`✅ TC-11 PASSED — Bulk comp "${description}" created with Tag User checked.`);
//     });

//     test('TC-12 Create a bulk comp with Is Recurring checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_Recurring_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleIsRecurring();
//         expect(await compsBulkPage.isCheckboxChecked('isRecurring'), 'Expected Is Recurring to be checked').toBe(true);
//         await compsBulkPage.fillCronExpression(dialog, '0 0 12 * * ?');
//         // Picking the Start Date day opens End Date's own calendar as a side effect (per the
//         // app's own UX); picking a day there leaves it open until dismissed below.
//         await compsBulkPage.setStartDate(dialog);
//         await compsBulkPage.setEndDate(dialog);
//         await compsBulkPage.dismissCalendarOverlay(dialog);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_is_recurring_fields_filled');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-12');
//         console.log(`✅ TC-12 PASSED — Bulk comp "${description}" created with Is Recurring checked.`);
//     });

//     test('TC-13 Create a bulk comp with Use Segment Suggested Comp Amount checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_SuggestedAmount_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleUseSegmentSuggestedCompAmount();
//         expect(await compsBulkPage.isCheckboxChecked('useSegmentSuggestedCompAmount'), 'Expected Use Segment Suggested Comp Amount to be checked').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_use_segment_suggested_comp_amount_checked');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-13');
//         console.log(`✅ TC-13 PASSED — Bulk comp "${description}" created with Use Segment Suggested Comp Amount checked.`);
//     });

//     test('TC-14 Create a bulk comp with Randomise Order checked', async ({ page, compsBulkPage }, testInfo) => {
//         const description = `AutoBulkComp_RandomiseOrder_${CommonUtils.generateRandomString(6)}`;

//         await compsBulkPage.clickCreateBulkComp();
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryFieldsWithSegment(compsBulkPage, dialog, description);

//         await compsBulkPage.toggleRandomiseOrder();
//         expect(await compsBulkPage.isCheckboxChecked('randomiseOrder'), 'Expected Randomise Order to be checked').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_randomise_order_checked');
//         await saveAndVerifySuccess(page, compsBulkPage, dialog, testInfo, 'TC-14');
//         console.log(`✅ TC-14 PASSED — Bulk comp "${description}" created with Randomise Order checked.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Edit Bulk Comp
// // ═══════════════════════════════════════════════════════════════════════════════
// // The Edit dialog is reached via a row's kebab ("⋮") menu -> Edit, and reuses the same dialog
// // markup as Create. Every test here edits an already-existing row this automation created
// // earlier (Description prefixed "AutoBulkComp_") rather than creating a fresh one each time —
// // still never a pre-existing/original row, per the user's instruction.
// test.describe('Comp Bulk - Edit Bulk Comp', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-15 Verify Edit dialog opens pre-filled with the bulk comp\'s existing values', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickEditOnRow(description);
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compsBulkPage.getDescriptionValue(dialog)).toBe(description);
//         expect(await compsBulkPage.getCompCodeValue(dialog)).not.toBe('');
//         expect(await compsBulkPage.getRegionCodeValue(dialog)).not.toBe('');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_edit_dialog_prefilled');
//         console.log(`Edit dialog correctly pre-filled with "${description}"'s existing values.`);
//     });

//     test('TC-16 Verify Comp Code and Region Code are disabled while editing', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickEditOnRow(description);
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compsBulkPage.isCompCodeDisabled(dialog), 'Expected Comp Code to be disabled while editing').toBe(true);
//         expect(await compsBulkPage.isRegionCodeDisabled(dialog), 'Expected Region Code to be disabled while editing').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_comp_region_code_disabled_on_edit');
//         console.log('Comp Code and Region Code are correctly disabled while editing.');
//     });

//     test('TC-17 Verify editing the Description and saving updates the bulk comp', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);
//         const updatedDescription = `${description}_Updated`;

//         await compsBulkPage.clickEditOnRow(description);
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compsBulkPage.fillDescription(dialog, updatedDescription);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_description_edited');

//         await compsBulkPage.clickSave(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await expect(compsBulkPage.getRowByDescription(updatedDescription), 'Expected the updated description to appear in the table')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_bulk_comp_updated_success');
//         console.log(`✅ TC-17 PASSED — Bulk comp updated from "${description}" to "${updatedDescription}".`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Review Bulk Comp
// // ═══════════════════════════════════════════════════════════════════════════════
// // The Review dialog is reached via a row's kebab ("⋮") menu -> Review. It reuses the same
// // dialog markup as Create/Edit, but every field is read-only (confirmed live) plus a handful of
// // Review-only read-only fields (Created By, Created On, Total Records, etc.). Approve is the
// // only mutating action. Every test here operates on an already-existing automation-created row,
// // never a pre-existing/original one.
// test.describe('Comp Bulk - Review Bulk Comp', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-18 Verify every field is disabled when the Review popup opens', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickReviewOnRow(description);
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compsBulkPage.isDescriptionDisabled(dialog), 'Expected Bulk Comp Description to be disabled in Review').toBe(true);
//         expect(await compsBulkPage.isCompCodeDisabled(dialog), 'Expected Comp Code to be disabled in Review').toBe(true);
//         expect(await compsBulkPage.isRegionCodeDisabled(dialog), 'Expected Region Code to be disabled in Review').toBe(true);

//         const checkboxIds = [
//             'sendPush', 'sendSms', 'tagUser', 'isSegment',
//             'isTagComp', 'isRecurring', 'useSegmentSuggestedCompAmount', 'randomiseOrder',
//         ];
//         for (const id of checkboxIds) {
//             expect(await compsBulkPage.isCheckboxDisabled(id), `Expected checkbox #${id} to be disabled in Review`).toBe(true);
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_review_fields_disabled');
//         console.log(`Every field is correctly disabled in the Review popup for "${description}".`);
//     });

//     test('TC-19 Verify clicking Approve from the Review popup shows a toast message', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickReviewOnRow(description);
//         const dialog = compsBulkPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_before_approve');
//         await compsBulkPage.clickApprove(dialog);

//         const toastText = await compsBulkPage.getToastText();
//         console.log(`Toast after Approve: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, .p-toast-message-error, [data-p-severity]').first(),
//             'Expected some toast message (success or error) after clicking Approve')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_after_approve');
//         console.log(`✅ TC-19 PASSED — Approve on "${description}" produced toast: "${toastText}"`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Bulk Comp Configurations
// // ═══════════════════════════════════════════════════════════════════════════════
// // Reached via an existing row's kebab ("⋮") menu -> Configurations — a separate management page
// // (not row-specific data) with its own "Create Configuration" dialog. Unlike Comp Bulk's own
// // Create/Edit dialog, every field here carries a real, stable id (confirmed live).
// test.describe('Comp Bulk - Configurations', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage, compBulkConfigurationsPage }) => {
//         await navigateToCompBulkConfigurations(page, sidebarPage, compsBulkPage, compBulkConfigurationsPage);
//     });

//     test('TC-20 Verify Configurations page is accessible and Create Configuration button is visible', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         await expect(compBulkConfigurationsPage.createConfigurationBtn).toBeVisible({ timeout: 20000 });
//         await CommonUtils.highlightElementBorder(compBulkConfigurationsPage.createConfigurationBtn);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_configurations_page_accessible');
//         console.log('Configurations page is accessible and Create Configuration button is visible.');
//     });

//     test('TC-21 Verify Create Configuration dialog opens with all 11 fields and 4 checkboxes', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await expect(dialog.locator('label:text-is("Description *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Region Code *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Transaction Type *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Casino Bonus Template")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Minimum Comp Awarded *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Maximum Comp Awarded *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Push Notification Template")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("SMS Notification Template")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Campaign Budget *")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Banner")')).toBeVisible();
//         await expect(dialog.locator('label:text-is("Daily Budget")')).toBeVisible();

//         const checkboxLabels = ['Push Notification', 'SMS Notification', 'Comp Value Provided', 'Allow Multiple Comp'];
//         for (const label of checkboxLabels) {
//             await expect(dialog.locator('label.cursor-pointer', { hasText: label }).first()).toBeVisible();
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_create_configuration_dialog_structure');
//         console.log('Create Configuration dialog shows all 11 fields and 4 checkboxes.');
//     });

//     test('TC-22 Verify Save stays disabled until every mandatory field is filled', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = `AutoConfig_${CommonUtils.generateRandomString(6)}`;

//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to start disabled').toBe(false);

//         await compBulkConfigurationsPage.fillDescription(dialog, description);
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Region Code/Transaction Type/Min/Max/Campaign Budget').toBe(false);

//         await compBulkConfigurationsPage.selectRegionCode(dialog);
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Transaction Type/Min/Max/Campaign Budget').toBe(false);

//         await compBulkConfigurationsPage.selectTransactionType(dialog);
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Min/Max/Campaign Budget').toBe(false);

//         await compBulkConfigurationsPage.fillMinimumPayout(dialog, '10');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Max/Campaign Budget').toBe(false);

//         await compBulkConfigurationsPage.fillMaximumPayout(dialog, '50');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Campaign Budget').toBe(false);

//         await compBulkConfigurationsPage.fillCampaignBudget(dialog, '100');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to enable once every mandatory field is filled').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_save_enabled_after_mandatory_fields');
//         console.log('Save correctly stays disabled until every mandatory field is filled.');
//     });

//     test('TC-23 Verify Save stays disabled only when Maximum Comp Awarded is less than Minimum Comp Awarded', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = `AutoConfig_${CommonUtils.generateRandomString(6)}`;

//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compBulkConfigurationsPage.fillDescription(dialog, description);
//         await compBulkConfigurationsPage.selectRegionCode(dialog);
//         await compBulkConfigurationsPage.selectTransactionType(dialog);
//         await compBulkConfigurationsPage.fillCampaignBudget(dialog, '100');
//         await compBulkConfigurationsPage.fillMinimumPayout(dialog, '50');

//         await compBulkConfigurationsPage.fillMaximumPayout(dialog, '40');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay disabled when Maximum is less than Minimum').toBe(false);

//         await compBulkConfigurationsPage.fillMaximumPayout(dialog, '50');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to enable when Maximum equals Minimum').toBe(true);

//         await compBulkConfigurationsPage.fillMaximumPayout(dialog, '60');
//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay enabled when Maximum exceeds Minimum').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_max_must_not_be_less_than_min');
//         console.log('Save correctly stays disabled only when Maximum Comp Awarded is less than Minimum Comp Awarded.');
//     });

//     test('TC-24 Verify Save stays disabled when Campaign Budget is less than Maximum Comp Awarded', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = `AutoConfig_${CommonUtils.generateRandomString(6)}`;

//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compBulkConfigurationsPage.fillDescription(dialog, description);
//         await compBulkConfigurationsPage.selectRegionCode(dialog);
//         await compBulkConfigurationsPage.selectTransactionType(dialog);
//         await compBulkConfigurationsPage.fillMinimumPayout(dialog, '10');
//         await compBulkConfigurationsPage.fillMaximumPayout(dialog, '50');
//         await compBulkConfigurationsPage.fillCampaignBudget(dialog, '40');

//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay disabled when Campaign Budget is less than Maximum Comp Awarded').toBe(false);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_campaign_budget_less_than_max');
//         console.log('Save correctly stays disabled when Campaign Budget is less than Maximum Comp Awarded.');
//     });

//     test('TC-25 Create a Configuration with only mandatory fields', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = `AutoConfig_${CommonUtils.generateRandomString(6)}`;

//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryConfigurationFields(compBulkConfigurationsPage, dialog, description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_mandatory_fields_filled');

//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
//         await compBulkConfigurationsPage.clickSave(dialog);

//         const toastText = await compBulkConfigurationsPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_configuration_created_success');
//         console.log(`✅ TC-25 PASSED — Configuration "${description}" created with only mandatory fields.`);
//     });

//     test('TC-26 Create a Configuration with every optional field and checkbox also filled', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = `AutoConfig_${CommonUtils.generateRandomString(6)}`;

//         await compBulkConfigurationsPage.clickCreateConfiguration();
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await fillMandatoryConfigurationFields(compBulkConfigurationsPage, dialog, description);
//         await compBulkConfigurationsPage.selectCasinoBonusTemplate(dialog);
//         await compBulkConfigurationsPage.selectPushNotificationTemplate(dialog);
//         await compBulkConfigurationsPage.selectSmsNotificationTemplate(dialog);
//         await compBulkConfigurationsPage.selectBanner(dialog);
//         await compBulkConfigurationsPage.fillDailyBudget(dialog, '20');

//         await compBulkConfigurationsPage.toggleSendPushNotification();
//         expect(await compBulkConfigurationsPage.isCheckboxChecked('sendPush'), 'Expected Push Notification to be checked').toBe(true);
//         await compBulkConfigurationsPage.toggleSendSmsNotification();
//         expect(await compBulkConfigurationsPage.isCheckboxChecked('sendSms'), 'Expected SMS Notification to be checked').toBe(true);
//         await compBulkConfigurationsPage.toggleCompValueProvided();
//         expect(await compBulkConfigurationsPage.isCheckboxChecked('isCompValueProvided'), 'Expected Comp Value Provided to be checked').toBe(true);
//         await compBulkConfigurationsPage.toggleAllowMultipleComp();
//         expect(await compBulkConfigurationsPage.isCheckboxChecked('allowMultipleCompPerUser'), 'Expected Allow Multiple Comp to be checked').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_all_fields_filled');

//         expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to be enabled').toBe(true);
//         await compBulkConfigurationsPage.clickSave(dialog);

//         const toastText = await compBulkConfigurationsPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_configuration_created_success');
//         console.log(`✅ TC-26 PASSED — Configuration "${description}" created with every optional field and checkbox filled.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Bulk Comp Payouts
// // ═══════════════════════════════════════════════════════════════════════════════
// // Reached via an existing row's kebab ("⋮") menu -> Payouts. Per the user: this test only needs
// // to confirm the navigation itself succeeds.
// test.describe('Comp Bulk - Payouts', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-27 Verify clicking Payouts from the kebab menu navigates to the Payouts page', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickPayoutsOnRow(description);

//         expect(await compsBulkPage.isOnPayoutsPage(), 'Expected navigation to the Payouts page to succeed').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_payouts_page_accessible');
//         console.log(`✅ TC-27 PASSED — Payouts page reached successfully from "${description}".`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Delete Bulk Comp
// // ═══════════════════════════════════════════════════════════════════════════════
// // Reached via a row's kebab ("⋮") menu -> Delete -> Yes/No confirmation (the same custom
// // "modal-buttons-container" already proven in CompAlertsPage). Operates on an already-existing
// // automation-created row rather than creating a fresh one each time.
// test.describe('Comp Bulk - Delete Bulk Comp', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-28 Verify confirming Delete (Yes) removes the bulk comp from the table', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickDeleteOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_before_confirming_delete');
//         await compsBulkPage.clickYesOnDeleteDialog();

//         await expect(compsBulkPage.getRowByDescription(description), 'Expected the bulk comp to no longer appear in the table after confirming Delete')
//             .not.toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_after_confirmed_delete');
//         console.log(`✅ TC-28 PASSED — Bulk comp "${description}" deleted after confirming Yes.`);
//     });

//     test('TC-29 Verify cancelling Delete (No) leaves the bulk comp in the table', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickDeleteOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_before_cancelling_delete');
//         await compsBulkPage.clickNoOnDeleteDialog();

//         await expect(compsBulkPage.getRowByDescription(description), 'Expected the bulk comp to remain in the table after cancelling Delete')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_after_cancelled_delete');
//         console.log(`✅ TC-29 PASSED — Bulk comp "${description}" remained after cancelling Delete (No).`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Process / Cancel Bulk Comp
// // ═══════════════════════════════════════════════════════════════════════════════
// // Process and Cancel are direct buttons in each row's Actions cell (not behind the kebab menu),
// // each opening the same Yes/No confirmation modal already proven for Delete. Operates on an
// // already-existing automation-created row rather than creating a fresh one each time.
// test.describe('Comp Bulk - Process / Cancel Bulk Comp', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
//         await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
//     });

//     test('TC-30 Verify confirming Process (Yes) updates the bulk comp\'s Status', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);
//         const row = compsBulkPage.getRowByDescription(description);
//         const statusBefore = await compsBulkPage.getRowStatusText(row);

//         // Process requires the bulk comp to already be reviewed and approved — confirmed by the
//         // user: attempting Process beforehand produces an error toast, not success.
//         await compsBulkPage.clickReviewOnRow(description);
//         const reviewDialog = compsBulkPage.getDialog();
//         await expect(reviewDialog).toBeVisible({ timeout: 15000 });
//         await compsBulkPage.clickApprove(reviewDialog);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_after_approve');

//         await compsBulkPage.clickProcessOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_before_confirming_process');
//         await compsBulkPage.clickYesOnConfirmDialog();

//         // Confirmed live: this action doesn't reliably show a toast (came back empty even after
//         // a full 15s wait) — the real success signal is the row's own Status column updating
//         // (e.g. AwaitingApproval -> Starting), so poll that instead of a toast.
//         await expect(async () => {
//             const statusAfter = await compsBulkPage.getRowStatusText(row);
//             expect(statusAfter, `Expected Status to change from "${statusBefore}" after confirming Process`).not.toBe(statusBefore);
//         }).toPass({ timeout: 15000 });

//         const statusAfter = await compsBulkPage.getRowStatusText(row);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_after_confirmed_process');
//         console.log(`✅ TC-30 PASSED — Process on "${description}" changed Status from "${statusBefore}" to "${statusAfter}".`);
//     });

//     test('TC-31 Verify cancelling the Process confirmation (No) leaves the bulk comp unaffected', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickProcessOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_before_cancelling_process');
//         await compsBulkPage.clickNoOnConfirmDialog();

//         await expect(compsBulkPage.getRowByDescription(description), 'Expected the bulk comp to remain in the table after cancelling the Process confirmation')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_after_cancelled_process');
//         console.log(`✅ TC-31 PASSED — Bulk comp "${description}" unaffected after cancelling Process (No).`);
//     });

//     test('TC-32 Verify confirming Cancel (Yes) updates the bulk comp\'s Status', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);
//         const row = compsBulkPage.getRowByDescription(description);
//         const statusBefore = await compsBulkPage.getRowStatusText(row);

//         await compsBulkPage.clickCancelOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_before_confirming_cancel');
//         await compsBulkPage.clickYesOnConfirmDialog();

//         // Same as Process (TC-30): this action doesn't reliably show a toast — the row's own
//         // Status column updating is the real success signal, so poll that instead.
//         await expect(async () => {
//             const statusAfter = await compsBulkPage.getRowStatusText(row);
//             expect(statusAfter, `Expected Status to change from "${statusBefore}" after confirming Cancel`).not.toBe(statusBefore);
//         }).toPass({ timeout: 15000 });

//         const statusAfter = await compsBulkPage.getRowStatusText(row);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_after_confirmed_cancel');
//         console.log(`✅ TC-32 PASSED — Cancel on "${description}" changed Status from "${statusBefore}" to "${statusAfter}".`);
//     });

//     test('TC-33 Verify cancelling the Cancel confirmation (No) leaves the bulk comp unaffected', async ({ page, compsBulkPage }, testInfo) => {
//         const description = await pickExistingAutomationRow(compsBulkPage);

//         await compsBulkPage.clickCancelOnRow(description);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_before_cancelling_cancel');
//         await compsBulkPage.clickNoOnConfirmDialog();

//         await expect(compsBulkPage.getRowByDescription(description), 'Expected the bulk comp to remain in the table after cancelling the Cancel confirmation')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_after_cancelled_cancel');
//         console.log(`✅ TC-33 PASSED — Bulk comp "${description}" unaffected after cancelling Cancel (No).`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Bulk Comp Configurations — Edit
// // ═══════════════════════════════════════════════════════════════════════════════
// // Each existing configuration renders as a card with its own kebab ("⋮") menu -> Edit. Every
// // test here creates its own disposable Configuration first (via createDisposableConfiguration),
// // then edits that exact one — never a pre-existing/original configuration already on the page.
// test.describe('Comp Bulk - Configurations Edit', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage, compBulkConfigurationsPage }) => {
//         await navigateToCompBulkConfigurations(page, sidebarPage, compsBulkPage, compBulkConfigurationsPage);
//     });

//     test('TC-34 Verify Edit dialog opens pre-filled with the configuration\'s existing values', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = await createDisposableConfiguration(page, compBulkConfigurationsPage, 'AutoConfig_Edit');

//         await compBulkConfigurationsPage.clickEditOnCard(description);
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compBulkConfigurationsPage.getDescriptionValue(dialog)).toBe(description);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_edit_dialog_prefilled');
//         await compBulkConfigurationsPage.clickCancel(dialog);
//         console.log(`✅ TC-34 PASSED — Edit dialog for "${description}" opened pre-filled with its existing values.`);
//     });

//     test('TC-35 Verify editing the Description and saving updates the configuration', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = await createDisposableConfiguration(page, compBulkConfigurationsPage, 'AutoConfig_Edit');
//         const updatedDescription = `${description}_Updated`;

//         await compBulkConfigurationsPage.clickEditOnCard(description);
//         const dialog = compBulkConfigurationsPage.getDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compBulkConfigurationsPage.fillDescription(dialog, updatedDescription);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_description_edited');

//         await compBulkConfigurationsPage.clickSave(dialog);

//         const toastText = await compBulkConfigurationsPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });

//         await expect(compBulkConfigurationsPage.getCardByName(updatedDescription), 'Expected the updated description to appear as a configuration card')
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_configuration_updated_success');
//         console.log(`✅ TC-35 PASSED — Configuration updated from "${description}" to "${updatedDescription}".`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Bulk Comp Configurations — Payouts / Payout Errors
// // ═══════════════════════════════════════════════════════════════════════════════
// // Reached via a configuration card's kebab ("⋮") menu -> Payouts / Payout Errors. These tests
// // only check navigation, never modify anything, so they operate on an already-existing
// // configuration card rather than creating a fresh one each time.
// test.describe('Comp Bulk - Configurations Payouts / Payout Errors', () => {
//     test.beforeEach(async ({ page, sidebarPage, compsBulkPage, compBulkConfigurationsPage }) => {
//         await navigateToCompBulkConfigurations(page, sidebarPage, compsBulkPage, compBulkConfigurationsPage);
//     });

//     test('TC-36 Verify clicking Payouts from a configuration card navigates to the Payouts page', async ({ page, compsBulkPage, compBulkConfigurationsPage }, testInfo) => {
//         const description = await pickExistingConfiguration(compBulkConfigurationsPage);

//         await compBulkConfigurationsPage.clickPayoutsOnCard(description);

//         // Reuses CompsBulkPage's check (Payouts page's own "Generate Report" button) — the same
//         // Payouts page is reached here as from a Comp Bulk row's kebab menu.
//         expect(await compsBulkPage.isOnPayoutsPage(), 'Expected navigation to the Payouts page to succeed').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_payouts_page_accessible');
//         console.log(`✅ TC-36 PASSED — Payouts page reached successfully from configuration "${description}".`);
//     });

//     test('TC-37 Verify clicking Payout Errors from a configuration card navigates away from Configurations', async ({ page, compBulkConfigurationsPage }, testInfo) => {
//         const description = await pickExistingConfiguration(compBulkConfigurationsPage);
//         const urlBefore = page.url();

//         await compBulkConfigurationsPage.clickPayoutErrorsOnCard(description);
//         await page.waitForLoadState('networkidle');

//         // Not yet confirmed what the Payout Errors page's own distinctive markup looks like —
//         // verifying via URL change for now (a real navigation happened), rather than a specific
//         // element. Tighten this once the page's actual structure is confirmed.
//         await expect.poll(() => page.url(), { timeout: 20000, message: 'Expected the URL to change after clicking Payout Errors' })
//             .not.toBe(urlBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_payout_errors_page_accessible');
//         console.log(`✅ TC-37 PASSED — Navigated away to Payout Errors from configuration "${description}" (URL: ${page.url()}).`);
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  Bulk Comp Configurations — Add Band
// ═══════════════════════════════════════════════════════════════════════════════
// Reached via a configuration card's kebab ("⋮") menu -> Add Band. The validation-only tests
// below (TC-38 through TC-41) never save anything, so they operate on an already-existing
// configuration card. TC-42 actually creates a Band, which mutates whichever configuration it's
// added to, so — per the same never-touch-original-data rule as everywhere else in this suite —
// it first creates its own disposable Configuration and adds the Band to that.
test.describe('Comp Bulk - Configurations Add Band', () => {
    test.beforeEach(async ({ page, sidebarPage, compsBulkPage, compBulkConfigurationsPage }) => {
        await navigateToCompBulkConfigurations(page, sidebarPage, compsBulkPage, compBulkConfigurationsPage);
    });

    test('TC-38 Verify Add Band dialog opens with all 4 fields and Save stays disabled until every mandatory field is filled', async ({ page, compBulkConfigurationsPage }, testInfo) => {
        const description = await pickExistingConfiguration(compBulkConfigurationsPage);
        await compBulkConfigurationsPage.clickAddBandOnCard(description);

        const dialog = compBulkConfigurationsPage.getDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        await expect(dialog.locator('label:text-is("Minimum Band Amount *")')).toBeVisible();
        await expect(dialog.locator('label:text-is("Maximum Band Amount *")')).toBeVisible();
        await expect(dialog.locator('label:text-is("Boost Amount *")')).toBeVisible();
        await expect(dialog.locator('label:text-is("Transaction Type")')).toBeVisible();
        await expect(dialog.locator('label.cursor-pointer', { hasText: 'Is Percentage Amount' })).toBeVisible();

        expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to start disabled').toBe(false);

        // Transaction Type is NOT mandatory (confirmed live — its label carries no "*", and Save
        // enables without it) — only Minimum/Maximum/Boost Amount gate Save.
        await compBulkConfigurationsPage.fillMinimumBandAmount(dialog, '10');
        expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Maximum/Boost Amount').toBe(false);

        await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '50');
        expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to still be disabled without Boost Amount').toBe(false);

        await compBulkConfigurationsPage.fillBoostAmount(dialog, '5');
        expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to enable once Minimum/Maximum/Boost Amount are filled, even without Transaction Type').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_add_band_dialog_structure');
        await compBulkConfigurationsPage.clickCancel(dialog);
        console.log('TC-38 PASSED — Add Band dialog shows all 4 fields, and Save correctly stays disabled until Minimum/Maximum/Boost Amount are filled.');
    });

    // test('TC-39 Verify Transaction Type dropdown can be filtered via its search bar', async ({ page, compBulkConfigurationsPage }, testInfo) => {
    //     const description = await pickExistingConfiguration(compBulkConfigurationsPage);
    //     await compBulkConfigurationsPage.clickAddBandOnCard(description);

    //     const dialog = compBulkConfigurationsPage.getDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     const selectedText = await compBulkConfigurationsPage.selectBandTransactionType(dialog, 'Spribe');
    //     expect(selectedText.toLowerCase(), `Expected the selected Transaction Type ("${selectedText}") to match the search term "Spribe"`).toContain('spribe');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_transaction_type_search');
    //     await compBulkConfigurationsPage.clickCancel(dialog);
    //     console.log(`TC-39 PASSED — Searching Transaction Type for "Spribe" correctly selected "${selectedText}".`);
    // });

    // test('TC-40 Verify Save stays disabled unless Maximum Band Amount is greater than Minimum Band Amount', async ({ page, compBulkConfigurationsPage }, testInfo) => {
    //     const description = await pickExistingConfiguration(compBulkConfigurationsPage);
    //     await compBulkConfigurationsPage.clickAddBandOnCard(description);

    //     const dialog = compBulkConfigurationsPage.getDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compBulkConfigurationsPage.fillMinimumBandAmount(dialog, '50');
    //     await compBulkConfigurationsPage.fillBoostAmount(dialog, '5');

    //     await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '40');
    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay disabled when Maximum is less than Minimum').toBe(false);

    //     await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '50');
    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay disabled when Maximum equals Minimum (must be strictly greater)').toBe(false);

    //     await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '60');
    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to enable once Maximum exceeds Minimum').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_max_must_be_greater_than_min');
    //     await compBulkConfigurationsPage.clickCancel(dialog);
    //     console.log('TC-40 PASSED — Save correctly stays disabled unless Maximum Band Amount is strictly greater than Minimum Band Amount.');
    // });

    // test('TC-41 Verify Save stays disabled unless Boost Amount is greater than 0', async ({ page, compBulkConfigurationsPage }, testInfo) => {
    //     const description = await pickExistingConfiguration(compBulkConfigurationsPage);
    //     await compBulkConfigurationsPage.clickAddBandOnCard(description);

    //     const dialog = compBulkConfigurationsPage.getDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compBulkConfigurationsPage.fillMinimumBandAmount(dialog, '10');
    //     await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '50');

    //     await compBulkConfigurationsPage.fillBoostAmount(dialog, '0');
    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to stay disabled when Boost Amount is 0').toBe(false);

    //     await compBulkConfigurationsPage.fillBoostAmount(dialog, '5');
    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to enable once Boost Amount is greater than 0').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_boost_amount_must_exceed_zero');
    //     await compBulkConfigurationsPage.clickCancel(dialog);
    //     console.log('TC-41 PASSED — Save correctly stays disabled unless Boost Amount is greater than 0.');
    // });

    // test('TC-42 Create a Band with every mandatory field and the Is Percentage Amount checkbox', async ({ page, compBulkConfigurationsPage }, testInfo) => {
    //     const description = await createDisposableConfiguration(page, compBulkConfigurationsPage, 'AutoConfig_Band');
    //     await compBulkConfigurationsPage.clickAddBandOnCard(description);

    //     const dialog = compBulkConfigurationsPage.getDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compBulkConfigurationsPage.fillMinimumBandAmount(dialog, '10');
    //     await compBulkConfigurationsPage.fillMaximumBandAmount(dialog, '50');
    //     await compBulkConfigurationsPage.fillBoostAmount(dialog, '5');
    //     await compBulkConfigurationsPage.selectBandTransactionType(dialog);

    //     await compBulkConfigurationsPage.toggleIsPercentageAmount();
    //     expect(await compBulkConfigurationsPage.isPercentageAmountChecked(), 'Expected Is Percentage Amount to be checked').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_add_band_fields_filled');

    //     expect(await compBulkConfigurationsPage.isSaveEnabled(dialog), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
    //     await compBulkConfigurationsPage.clickSave(dialog);

    //     const toastText = await compBulkConfigurationsPage.getToastText();
    //     console.log(`Toast after save: "${toastText}"`);
    //     await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
    //         .toBeVisible({ timeout: 15000 });
    //     await expect(dialog).not.toBeVisible({ timeout: 15000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_band_created_success');
    //     console.log(`✅ TC-42 PASSED — Band created successfully on configuration "${description}".`);
    // });
});
