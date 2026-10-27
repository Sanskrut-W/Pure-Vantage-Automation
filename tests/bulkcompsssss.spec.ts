// npx playwright test tests/bulkcompsssss.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { compsBulkLocators } from '../locators/compsBulkLocators';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// COMP BULK — generated from recordings/20261022-1015-01-4819699-20261026090433.mp4
// (steps: recordings/work/20261022-1015-01-4819699-20261026090433/steps.md)
//
// Flagged assumptions:
//  - The recording is a bug reproduction: Edit -> tick Send SMS -> pick an SMS template -> Save
//    showed "Error saving bulk comp" (POST /compsapi/api/v1/Bulk/Edit -> 400). This test asserts
//    the expected behaviour (success), so it fails while that bug exists.
//  - The recording edited a shared row ("Mane", status Starting). This test creates its own
//    AutoBulkComp_ row (CSV route) and edits that instead, then deletes it. If the 400 only
//    happens for rows in "Starting" status, the fresh row may not reproduce it.
//  - The success toast text was never shown in the recording — asserted by success severity,
//    plus the specific "Error saving bulk comp" toast must not appear.
//  - SMS template: the recording picked the first option; the test does the same.
// ═══════════════════════════════════════════════════════════════════════════════

// Disposable made-up accounts only (same file as tests/compbulk.spec.ts).
const BULK_COMP_CSV = path.join(__dirname, '../test-data/bulk_comp.csv');

async function navigateToCompsBulk(page: any, sidebarPage: any, compsBulkPage: any) {
  await page.goto('/main/home');
  await page.waitForLoadState('networkidle').catch(() => {});
  await sidebarPage.waitForAppReady();
  await sidebarPage.navigateToCompsBulk();

  // The component doesn't always hydrate on the first sidebar navigation — reload once if
  // nothing rendered (same fallback as tests/compbulk.spec.ts).
  const loaded = await compsBulkPage.createBulkCompBtn
    .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (!loaded) {
    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});
    await compsBulkPage.createBulkCompBtn.waitFor({ state: 'visible', timeout: 60000 });
  }
}

test.describe('Marketing Comps - Comp Bulk - Edit Bulk Comp Tests', () => {
  let bulkCompNamesToCleanup: string[] = [];

  test.beforeEach(async ({ page, sidebarPage, compsBulkPage }) => {
    bulkCompNamesToCleanup = [];
    await navigateToCompsBulk(page, sidebarPage, compsBulkPage);
  });

  test.afterEach(async ({ compsBulkPage }) => {
    for (const name of bulkCompNamesToCleanup) {
      await compsBulkPage.deleteBulkCompIfPresent(name);
    }
    bulkCompNamesToCleanup = [];
  });

  test('TC-1 Verify editing a bulk comp to enable Send SMS with an SMS template saves successfully', async ({ page, compsBulkPage }, testInfo) => {
    const description = `AutoBulkComp_${Date.now()}`;
    const updatedDescription = `${description}_Sms`;
    bulkCompNamesToCleanup.push(description, updatedDescription);
    const successToast = page.locator(compsBulkLocators.toastSuccess).first();
    const errorSavingToast = page.locator('.p-toast-message').filter({ hasText: compsBulkLocators.toastErrorSavingText });

    // Setup — the test's own disposable bulk comp (never edit a shared row).
    await compsBulkPage.clickCreateBulkComp();
    const createDialog = compsBulkPage.getDialog();
    await expect(createDialog, 'Expected the Create Bulk Comp dialog to open').toBeVisible({ timeout: 15000 });
    await compsBulkPage.fillDescription(createDialog, description);
    await compsBulkPage.selectCompCode(createDialog);
    await compsBulkPage.selectRegionCode(createDialog);
    await compsBulkPage.chooseCsvFile(createDialog, BULK_COMP_CSV);
    expect(await compsBulkPage.isSaveEnabled(createDialog), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
    await compsBulkPage.clickSave(createDialog);
    await expect(successToast, 'Expected a success toast after creating the bulk comp').toBeVisible({ timeout: 15000 });
    await expect(createDialog, 'Expected the Create dialog to close after saving').not.toBeVisible({ timeout: 15000 });
    // Let the create toast clear so it can't be mistaken for the edit's toast below.
    await expect(successToast).toBeHidden({ timeout: 20000 }).catch(() => {});

    // Row "⋮" -> Edit
    await compsBulkPage.searchBulkComp(description);
    await compsBulkPage.clickEditOnRow(description);
    const dialog = compsBulkPage.getDialog();
    await expect(dialog, 'Expected the Edit Bulk Comp dialog to open').toBeVisible({ timeout: 15000 });
    await expect(dialog.getByText('Edit Bulk Comp'), 'Expected the dialog title to be "Edit Bulk Comp"').toBeVisible();
    await compsBulkPage.waitForEditDialogLoaded(dialog);
    expect(await compsBulkPage.getDescriptionValue(dialog), 'Expected Edit to pre-fill the existing Description').toBe(description);

    // Change Description, tick Send SMS, pick an SMS template
    await compsBulkPage.fillDescription(dialog, updatedDescription);
    await compsBulkPage.toggleSendSms();
    expect(await compsBulkPage.isCheckboxChecked(compsBulkLocators.checkboxSendSms), 'Expected Send SMS to be checked').toBe(true);
    await expect(dialog.locator(`label:text-is("${compsBulkLocators.fieldSmsMessageTemplate}")`), 'Expected SMS Message Template to appear once Send SMS is ticked')
      .toBeVisible({ timeout: 5000 });
    const smsTemplate = await compsBulkPage.selectSmsMessageTemplate(dialog);
    expect(smsTemplate, 'Expected an SMS template to be selected').not.toBe('');
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_edit_send_sms_filled');

    // Save — the recording got "Error saving bulk comp" (400 from /Bulk/Edit) here.
    expect(await compsBulkPage.isSaveEnabled(dialog), 'Expected Save to be enabled after editing').toBe(true);
    await compsBulkPage.clickSave(dialog);

    // Wait for the save's toast first — otherwise the "no error toast" check below could pass
    // simply because no toast has rendered yet.
    await expect(page.locator('.p-toast-message').first(), 'Expected a toast after saving the edit').toBeVisible({ timeout: 15000 });
    await expect(errorSavingToast, `Expected no "${compsBulkLocators.toastErrorSavingText}" toast after saving the edit (seen in the recording: POST /Bulk/Edit -> 400)`)
      .not.toBeVisible({ timeout: 5000 });
    await expect(successToast, 'Expected a success toast after saving the edit').toBeVisible({ timeout: 15000 });
    await expect(dialog, 'Expected the Edit dialog to close after saving').not.toBeVisible({ timeout: 15000 });

    await compsBulkPage.searchBulkComp(updatedDescription);
    await expect(compsBulkPage.getRowByDescription(updatedDescription), 'Expected the updated Description to appear in the table')
      .toBeVisible({ timeout: 15000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_edit_send_sms_saved');
    console.log(`Verified bulk comp "${description}" was edited to "${updatedDescription}" with Send SMS ("${smsTemplate}") and saved.`);
  });
});
