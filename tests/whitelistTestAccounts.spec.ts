// // npx playwright test tests/whitelistTestAccounts.spec.ts --headed
// import { test, expect } from '../fixtures/baseFixture';
// import { CommonUtils } from '../utils/commonUtils';

// // Known existing data from the live table (used for duplicate-validation tests)
// const EXISTING_USERNAME  = 'milly';
// const EXISTING_ACCOUNTID = 'ed109449-4cda-4013-9174-bc7208e02a58';
// const EXISTING_MOBILE    = '2797101396';

// test.describe('Whitelist Test Accounts Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage }) => {
//         await page.goto('/main/home');
//         await page.reload();
//         await sidebarPage.waitForPageLoad();

//         await sidebarPage.navigateToWhitelistTestAccounts();
//         await expect(page).toHaveURL(/.*whitelist-test-accounts/, { timeout: 30000 });
//         await page.waitForLoadState('networkidle');
//     });

//     // ══════════════════════════════════════════════════════════
//     // NAVIGATION & PAGE STRUCTURE
//     // ══════════════════════════════════════════════════════════

//     test('TC_01 Verify navigation to Whitelist Test Accounts screen', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await expect(page).toHaveURL(/.*whitelist-test-accounts/);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01_whitelist_page_accessible');

//         // Click Create button — popup must open
//         await whitelistTestAccountsPage.openCreateDialog();
//         await expect(page.locator('div.p-dialog').first()).toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_01_create_popup_opens');

//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_02 Verify pop-up fields visibility', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();
//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await expect(dialog.getByLabel('Username')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Account Id')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Mobile Number')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Email Address')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.locator('.p-dropdown').first()).toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_02_popup_fields_visible');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     // ══════════════════════════════════════════════════════════
//     // CREATE FLOW
//     // ══════════════════════════════════════════════════════════

//     test('TC_03 Verify creation of Whitelist Test Account', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         const unique = `TAF-WL-${Date.now()}`;
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-${Date.now()}`,
//             mobile:    '27700000001',
//             email:     `${unique}@test.com`,
//         });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_03_create_form_filled');

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         // Popup must close on successful save
//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });

//         // Verify new account appears in listing
//         await whitelistTestAccountsPage.searchFor(unique);
//         const rows = await whitelistTestAccountsPage.getRowCount();
//         expect(rows).toBeGreaterThan(0);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_03_account_in_listing');
//     });

//     test('TC_04 Verify mandatory field validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         // Leave all fields empty and click Save
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         // Validation must block save: dialog stays open OR error visible
//         const dialogOpen  = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown  = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Mandatory field validation must block save').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_04_mandatory_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_05 Verify Account ID field accepts valid input', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         const unique = `TAF-WL-A-${Date.now()}`;
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `valid-acct-${Date.now()}`,
//             mobile:    '27700000002',
//             email:     `${unique}@test.com`,
//         });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05_accountid_valid_input');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_05_account_created');
//     });

//     test('TC_06 Verify Account ID field validation for invalid input', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-B-${Date.now()}`,
//             accountId: '@#$%^&*()!',
//             mobile:    '27700000003',
//             email:     `taf-b-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Invalid Account ID should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_06_accountid_invalid_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_07 Verify Account ID field character limit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();
//         const dialog = page.locator('div.p-dialog').first();

//         const longValue = 'A'.repeat(300);
//         await dialog.getByLabel('Account Id').fill(longValue);
//         await page.waitForTimeout(500);

//         const actualValue = await dialog.getByLabel('Account Id').inputValue();
//         // Either maxlength restricted input or validation error shown
//         const wasRestricted = actualValue.length < longValue.length;
//         const errorShown    = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(wasRestricted || errorShown, 'Character limit must be enforced on Account ID').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_07_accountid_char_limit');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_08 Verify Username field accepts valid input', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         const unique = `TAF-WL-C-${Date.now()}`;
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-c-${Date.now()}`,
//             mobile:    '27700000004',
//             email:     `${unique}@test.com`,
//         });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08_username_valid_input');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_08_account_created');
//     });

//     test('TC_09 Verify Username field validation for invalid input', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  '!!!invalid###',
//             accountId: `acct-d-${Date.now()}`,
//             mobile:    '27700000005',
//             email:     `taf-d-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Invalid Username should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_09_username_invalid_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_10 Verify Username field character limit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();
//         const dialog = page.locator('div.p-dialog').first();

//         const longValue = 'u'.repeat(300);
//         await dialog.getByLabel('Username').fill(longValue);
//         await page.waitForTimeout(500);

//         const actualValue = await dialog.getByLabel('Username').inputValue();
//         const wasRestricted = actualValue.length < longValue.length;
//         const errorShown    = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(wasRestricted || errorShown, 'Character limit must be enforced on Username').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_10_username_char_limit');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_11 Verify Mobile Number field accepts valid input', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         const unique = `TAF-WL-E-${Date.now()}`;
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-e-${Date.now()}`,
//             mobile:    '27700000006',
//             email:     `${unique}@test.com`,
//         });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11_mobile_valid_input');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_11_account_created');
//     });

//     test('TC_12 Verify Mobile Number field validation for alphabets/special characters', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-F-${Date.now()}`,
//             accountId: `acct-f-${Date.now()}`,
//             mobile:    'abcdef!@#',
//             email:     `taf-f-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Non-numeric Mobile Number should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_12_mobile_invalid_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_13 Verify Mobile Number field length validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         // Too short — 2 digits
//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-G-${Date.now()}`,
//             accountId: `acct-g-${Date.now()}`,
//             mobile:    '12',
//             email:     `taf-g-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Mobile length validation must block invalid length').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_13_mobile_length_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_14 Verify Email Address field accepts valid email format', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         const unique = `TAF-WL-H-${Date.now()}`;
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-h-${Date.now()}`,
//             mobile:    '27700000007',
//             email:     `${unique}@validtest.com`,
//         });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14_email_valid_input');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_14_account_created');
//     });

//     test('TC_15 Verify Email Address field validation for invalid format', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-I-${Date.now()}`,
//             accountId: `acct-i-${Date.now()}`,
//             mobile:    '27700000008',
//             email:     'notanemail',
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Invalid email format should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_15_email_invalid_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_16 Verify Email Address field character limit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();
//         const dialog = page.locator('div.p-dialog').first();

//         const longEmail = 'a'.repeat(250) + '@test.com';
//         await dialog.getByLabel('Email Address').fill(longEmail);
//         await page.waitForTimeout(500);

//         const actualValue = await dialog.getByLabel('Email Address').inputValue();
//         const wasRestricted = actualValue.length < longEmail.length;
//         const errorShown    = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(wasRestricted || errorShown, 'Character limit must be enforced on Email Address').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_16_email_char_limit');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_17 Verify duplicate Account ID validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-dup-acct-${Date.now()}`,
//             accountId: EXISTING_ACCOUNTID,
//             mobile:    '27700000009',
//             email:     `dup-acct-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen  = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown  = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Account ID should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_17_duplicate_accountid');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_18 Verify duplicate Username validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  EXISTING_USERNAME,
//             accountId: `dup-user-acct-${Date.now()}`,
//             mobile:    '27700000010',
//             email:     `dup-user-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Username should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_18_duplicate_username');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_19 Verify duplicate Mobile Number validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.openCreateDialog();

//         await whitelistTestAccountsPage.fillForm({
//             username:  `TAF-WL-dup-mob-${Date.now()}`,
//             accountId: `dup-mob-acct-${Date.now()}`,
//             mobile:    EXISTING_MOBILE,
//             email:     `dup-mob-${Date.now()}@test.com`,
//         });

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Mobile Number should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_19_duplicate_mobile');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_20 Verify duplicate Email Address validation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         // Create an account first to get a known email, then try to duplicate it
//         const unique = `TAF-WL-dup-email-${Date.now()}`;
//         const knownEmail = `${unique}@test.com`;

//         await whitelistTestAccountsPage.openCreateDialog();
//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-de-${Date.now()}`,
//             mobile:    '27700000011',
//             email:     knownEmail,
//         });
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');
//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });

//         // Now try to create another account with the same email
//         await whitelistTestAccountsPage.openCreateDialog();
//         await whitelistTestAccountsPage.fillForm({
//             username:  `${unique}-dup`,
//             accountId: `acct-de2-${Date.now()}`,
//             mobile:    '27700000012',
//             email:     knownEmail,
//         });
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Email Address should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_20_duplicate_email');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     // ══════════════════════════════════════════════════════════
//     // EDIT FLOW
//     // ══════════════════════════════════════════════════════════

//     test('TC_21 Verify Edit pop-up opens successfully', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.clickEditFirst();
//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         // Required fields must be visible
//         await expect(dialog.getByLabel('Username')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Account Id')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Mobile Number')).toBeVisible({ timeout: 5000 });
//         await expect(dialog.getByLabel('Email Address')).toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_21_edit_popup_opens');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_22 Verify existing data is prefilled in Edit pop-up', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.clickEditFirst();
//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         // All editable fields must have non-empty values (prefilled from existing record)
//         const usernameVal  = await dialog.getByLabel('Username').inputValue();
//         const accountIdVal = await dialog.getByLabel('Account Id').inputValue();
//         const mobileVal    = await dialog.getByLabel('Mobile Number').inputValue();

//         expect(usernameVal.length,  'Username must be prefilled').toBeGreaterThan(0);
//         expect(accountIdVal.length, 'Account Id must be prefilled').toBeGreaterThan(0);
//         expect(mobileVal.length,    'Mobile Number must be prefilled').toBeGreaterThan(0);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_22_edit_prefilled');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_23 Verify Account ID field can be edited', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         const updatedId = `TAF-edit-acct-${Date.now()}`;
//         await dialog.getByLabel('Account Id').clear();
//         await dialog.getByLabel('Account Id').fill(updatedId);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23_accountid_edited');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(dialog).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_23_save_success');
//     });

//     test('TC_24 Verify Username field can be edited', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         const updatedName = `TAF-edit-user-${Date.now()}`;
//         await dialog.getByLabel('Username').clear();
//         await dialog.getByLabel('Username').fill(updatedName);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24_username_edited');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(dialog).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_24_save_success');
//     });

//     test('TC_25 Verify Mobile Number field can be edited', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Mobile Number').clear();
//         await dialog.getByLabel('Mobile Number').fill('27600000099');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25_mobile_edited');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(dialog).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_25_save_success');
//     });

//     test('TC_26 Verify Email Address field can be edited', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         const updatedEmail = `TAF-edit-email-${Date.now()}@test.com`;
//         await dialog.getByLabel('Email Address').clear();
//         await dialog.getByLabel('Email Address').fill(updatedEmail);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_26_email_edited');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(dialog).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_26_save_success');
//     });

//     test('TC_27 Verify Region dropdown can be updated', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         // Open region dropdown and select first available option
//         const regionDropdown = dialog.locator('.p-dropdown').first();
//         await regionDropdown.click();
//         await page.waitForTimeout(300);

//         const firstOption = page.locator('.p-dropdown-panel .p-dropdown-item').first();
//         await firstOption.waitFor({ state: 'visible', timeout: 5000 });
//         await firstOption.click();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27_region_selected');
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');

//         await expect(dialog).not.toBeVisible({ timeout: 10000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_27_save_success');
//     });

//     test('TC_28 Verify mandatory field validation in Edit pop-up', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         // Clear mandatory fields
//         await dialog.getByLabel('Username').clear();
//         await dialog.getByLabel('Mobile Number').clear();

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Mandatory field validation must block edit save').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_28_edit_mandatory_validation');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_29 Verify invalid Mobile Number validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Mobile Number').clear();
//         await dialog.getByLabel('Mobile Number').fill('abc!@#xyz');

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Invalid Mobile in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_29_edit_mobile_invalid');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_30 Verify invalid Email Address validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         await whitelistTestAccountsPage.clickEditFirst();

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Email Address').clear();
//         await dialog.getByLabel('Email Address').fill('invalidemail@@');

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1000);

//         const dialogOpen   = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown   = await whitelistTestAccountsPage.isValidationErrorVisible();
//         const saveDisabled = await whitelistTestAccountsPage.isSaveButtonDisabled();
//         expect(dialogOpen || errorShown || saveDisabled, 'Invalid Email in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_30_edit_email_invalid');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_31 Verify duplicate Account ID validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         // Edit the second row and set its Account ID to match the first row's
//         await whitelistTestAccountsPage.editBtn.nth(1).waitFor({ state: 'visible', timeout: 10000 });
//         await whitelistTestAccountsPage.editBtn.nth(1).click();
//         await page.waitForTimeout(500);

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Account Id').clear();
//         await dialog.getByLabel('Account Id').fill(EXISTING_ACCOUNTID);

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Account ID in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_31_edit_dup_accountid');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_32 Verify duplicate Username validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.editBtn.nth(1).waitFor({ state: 'visible', timeout: 10000 });
//         await whitelistTestAccountsPage.editBtn.nth(1).click();
//         await page.waitForTimeout(500);

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Username').clear();
//         await dialog.getByLabel('Username').fill(EXISTING_USERNAME);

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Username in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_32_edit_dup_username');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_33 Verify duplicate Mobile Number validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.editBtn.nth(1).waitFor({ state: 'visible', timeout: 10000 });
//         await whitelistTestAccountsPage.editBtn.nth(1).click();
//         await page.waitForTimeout(500);

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Mobile Number').clear();
//         await dialog.getByLabel('Mobile Number').fill(EXISTING_MOBILE);

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Mobile in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_33_edit_dup_mobile');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_34 Verify duplicate Email Address validation during edit', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         // Use email created fresh so it's a guaranteed duplicate
//         const unique = `TAF-WL-dup-em2-${Date.now()}`;
//         const knownEmail = `${unique}@test.com`;

//         // Create a reference account
//         await whitelistTestAccountsPage.openCreateDialog();
//         await whitelistTestAccountsPage.fillForm({
//             username:  unique,
//             accountId: `acct-dup-em2-${Date.now()}`,
//             mobile:    '27700000013',
//             email:     knownEmail,
//         });
//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForLoadState('networkidle');
//         await expect(page.locator('div.p-dialog').first()).not.toBeVisible({ timeout: 10000 });

//         // Edit another row and try to use the same email
//         await whitelistTestAccountsPage.editBtn.nth(1).waitFor({ state: 'visible', timeout: 10000 });
//         await whitelistTestAccountsPage.editBtn.nth(1).click();
//         await page.waitForTimeout(500);

//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         await dialog.getByLabel('Email Address').clear();
//         await dialog.getByLabel('Email Address').fill(knownEmail);

//         await whitelistTestAccountsPage.clickSave();
//         await page.waitForTimeout(1500);

//         const dialogOpen = await whitelistTestAccountsPage.isDialogOpen();
//         const errorShown = await whitelistTestAccountsPage.isValidationErrorVisible();
//         expect(dialogOpen || errorShown, 'Duplicate Email in edit should be rejected').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_34_edit_dup_email');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_35 Verify Cancel button functionality in Edit pop-up', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.clickEditFirst();
//         const dialog = page.locator('div.p-dialog').first();
//         await expect(dialog).toBeVisible({ timeout: 10000 });

//         // Read original username before modifying
//         const originalUsername = await dialog.getByLabel('Username').inputValue();

//         // Make a change
//         await dialog.getByLabel('Username').fill('TEMP-CHANGED-VALUE');
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35_edit_changed');

//         // Cancel — popup must close
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//         await expect(dialog).not.toBeVisible({ timeout: 5000 });

//         // Reopen and verify original value is unchanged
//         await whitelistTestAccountsPage.clickEditFirst();
//         await expect(dialog).toBeVisible({ timeout: 10000 });
//         const valueAfterCancel = await dialog.getByLabel('Username').inputValue();
//         expect(valueAfterCancel).toBe(originalUsername);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_35_cancel_no_change');
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     // ══════════════════════════════════════════════════════════
//     // DELETE FLOW — popup verified, NO actual deletion
//     // ══════════════════════════════════════════════════════════

//     test('TC_36 Verify Delete button visibility', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         const rowCount       = await whitelistTestAccountsPage.getRowCount();
//         const deleteBtnCount = await whitelistTestAccountsPage.deleteBtn.count();

//         expect(deleteBtnCount, 'Delete button must appear for each row').toBe(rowCount);
//         await expect(whitelistTestAccountsPage.deleteBtn.first()).toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_36_delete_btn_visible');
//     });

//     test('TC_37 Verify delete confirmation pop-up opens', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.clickDeleteFirst();

//         const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
//         await expect(confirmDialog).toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_37_delete_confirm_popup');

//         // Cancel — do NOT delete data
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//     });

//     test('TC_38 Verify delete confirmation pop-up has confirm and cancel buttons', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         const rowsBefore = await whitelistTestAccountsPage.getRowCount();

//         await whitelistTestAccountsPage.clickDeleteFirst();

//         const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
//         await expect(confirmDialog).toBeVisible({ timeout: 10000 });

//         // Confirm/Delete button must be present
//         const confirmBtn = confirmDialog.locator('button:has-text("Yes"), button:has-text("Confirm"), button:has-text("Delete")').first();
//         await expect(confirmBtn).toBeVisible({ timeout: 5000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_38_delete_confirm_buttons');

//         // Cancel — preserve test data
//         await whitelistTestAccountsPage.closeDialogWithCancel();

//         const rowsAfter = await whitelistTestAccountsPage.getRowCount();
//         expect(rowsAfter).toBe(rowsBefore);
//     });

//     test('TC_39 Verify Cancel button functionality in delete confirmation', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         const rowsBefore = await whitelistTestAccountsPage.getRowCount();

//         await whitelistTestAccountsPage.clickDeleteFirst();

//         const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
//         await expect(confirmDialog).toBeVisible({ timeout: 10000 });

//         // Click Cancel
//         await whitelistTestAccountsPage.closeDialogWithCancel();
//         await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });

//         // Row count must be unchanged
//         const rowsAfter = await whitelistTestAccountsPage.getRowCount();
//         expect(rowsAfter).toBe(rowsBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_39_delete_cancelled');
//     });

//     test('TC_40 Verify close icon functionality in delete confirmation pop-up', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.clickDeleteFirst();

//         const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
//         await expect(confirmDialog).toBeVisible({ timeout: 10000 });

//         // Close via X icon
//         const closeIcon = confirmDialog.locator('button.p-dialog-close-button, button[aria-label="Close"]').first();
//         if (await closeIcon.isVisible()) {
//             await closeIcon.click();
//         } else {
//             await whitelistTestAccountsPage.closeDialogWithCancel();
//         }

//         await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_40_delete_closed_via_x');
//     });

//     test('TC_41 Verify search for non-existent account returns no results', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();

//         await whitelistTestAccountsPage.searchFor('NONEXISTENT-ACCOUNT-XYZ-00000');
//         await page.waitForTimeout(500);

//         const rows = await whitelistTestAccountsPage.getRowCount();
//         expect(rows, 'Non-existent account must return 0 results').toBe(0);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_41_no_results_found');

//         await whitelistTestAccountsPage.clearSearch();
//     });

//     test('TC_42 Verify multiple delete buttons open confirmation pop-up each time', async ({ page, whitelistTestAccountsPage }, testInfo) => {
//         await whitelistTestAccountsPage.waitForTableLoad();
//         const rowCount = await whitelistTestAccountsPage.getRowCount();

//         const checks = Math.min(rowCount, 3);

//         for (let i = 0; i < checks; i++) {
//             await whitelistTestAccountsPage.clickDeleteFirst();

//             const confirmDialog = page.locator('div.p-confirmdialog, div.p-dialog').first();
//             await expect(confirmDialog).toBeVisible({ timeout: 10000 });

//             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', `TC_42_delete_popup_${i + 1}`);

//             // Cancel each time — do NOT delete data
//             await whitelistTestAccountsPage.closeDialogWithCancel();
//             await expect(confirmDialog).not.toBeVisible({ timeout: 5000 });
//         }

//         // All rows must remain after multiple cancelled deletes
//         const rowsAfter = await whitelistTestAccountsPage.getRowCount();
//         expect(rowsAfter).toBe(rowCount);
//     });

// });
