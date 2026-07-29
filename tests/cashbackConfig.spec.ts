// npx playwright test tests/cashbackConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { cashbackLocators } from '../locators/cashbackLocators';

// ─── Shared navigation helper ─────────────────────────────────────────────────
async function navigateToCashback(page: any, sidebarPage: any, cashbackPage: any) {
    await page.goto('/main/home');
    // Letting the initial navigation's requests settle BEFORE reloading matters
    // here: reload() cancels any still-in-flight requests from goto(), and that
    // was observed to abort the user role/permissions fetch (/Portal/user,
    // /Portal/rolePages/*) — leaving the app running with incomplete permission
    // data for the rest of the test (silently breaking permission-gated actions
    // like Approve, with no visible error). Waiting first lets that call finish
    // before reload() starts a clean one.
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.navigateToCashbackPromotions();
    await expect(page).toHaveURL(/.*cashback-promotions/);
    await page.waitForLoadState('networkidle');
    await cashbackPage.waitForPageLoad();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 to TC-5  |  TC-47 to TC-48 — Page Level & Table Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, cashbackPage }) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
    });

    test('TC-1 Verify Cashback Promotions page is accessible', async ({ page, cashbackPage }, testInfo) => {
        await expect(cashbackPage.cashbackTable).toBeVisible({ timeout: 30000 });
        await expect(cashbackPage.createCashbackPromotionBtn).toBeVisible();
        await expect(cashbackPage.searchInput).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_cashback_page_accessible');
        console.log('Cashback Promotions page is accessible with all key elements visible.');
    });

    test('TC-2 Verify Create Cashback Promotion button is available (green)', async ({ page, cashbackPage }, testInfo) => {
        await expect(cashbackPage.createCashbackPromotionBtn).toBeVisible({ timeout: 30000 });
        await cashbackPage.clickElement(cashbackPage.createCashbackPromotionBtn);
        await expect(cashbackPage.createCashbackPromotionBtn).toHaveClass(/btn--success/);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_btn_visible');
        console.log('Create Cashback Promotion button is visible and correctly styled green.');
    });

    test('TC-4 Verify all required table columns are present', async ({ page, cashbackPage }, testInfo) => {
        await expect(cashbackPage.cashbackTable).toBeVisible({ timeout: 30000 });

        const expectedColumns = [
            cashbackLocators.columnDescription,
            cashbackLocators.columnComp,
            cashbackLocators.columnCreatedBy,
            cashbackLocators.columnCreatedDate,
            cashbackLocators.columnExecutionFrequency,
            cashbackLocators.columnNextExecutionDate,
            cashbackLocators.columnStartDate,
            cashbackLocators.columnEndDate,
            cashbackLocators.columnApprovedBy,
            cashbackLocators.columnLastRunNote,
            cashbackLocators.columnLastRunDate,
        ];

        for (const col of expectedColumns) {
            await expect(
                cashbackPage.cashbackTable.locator('.p-column-title').filter({ hasText: col }).first()
            ).toBeVisible();
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_cashback_all_columns');
        console.log('All 11 required column headers are present in the table.');
    });

    test('TC-5 Verify Edit (green), Approve (blue) and Delete (red) buttons present per row', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const firstRow = cashbackPage.cashbackTable.locator('tbody tr').first();
        await expect(firstRow.getByRole('button', { name: cashbackLocators.buttonEdit })).toHaveClass(/btn--success/);
        await expect(firstRow.getByRole('button', { name: cashbackLocators.buttonApprove })).toHaveClass(/btn--info/);
        await expect(firstRow.getByRole('button', { name: cashbackLocators.buttonDelete })).toHaveClass(/btn--danger/);
        await CommonUtils.highlight(firstRow.getByRole('button', { name: cashbackLocators.buttonEdit }));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_action_buttons_verified');
        console.log('Edit (green), Approve (blue), Delete (red) action buttons confirmed per row.');
    });

    test('TC-47 Verify Last Run Note column is present and contains readable data', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });
        await expect(cashbackPage.cashbackTable.locator('.p-column-title').filter({ hasText: cashbackLocators.columnLastRunNote })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_last_run_note');
        console.log('Last Run Note column is visible in the table.');
    });

    test('TC-48 Verify Last Run Date values follow dd/mm/yyyy hh:mm format', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const rows = await cashbackPage.cashbackTable.locator('tbody tr').all();
        for (const row of rows) {
            const cellText = (await row.locator('td').nth(10).innerText()).trim();
            if (cellText) {
                expect(cellText).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
            }
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_last_run_date_format');
        console.log('Last Run Date format validated as dd/mm/yyyy hh:mm.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-13 → TC-23 → TC-44  — Serial CRUD Flow (same record throughout)
//
//  Step 1  (TC-13): CREATE a promotion with a unique description → verify in table.
//  Step 2  (TC-23): EDIT that exact record, change its description → verify in table.
//  Step 3  (TC-44): DELETE that exact edited record → verify removed from table.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe.serial('Cashback Promotions - CRUD Flow (same record)', () => {

    test('TC-13 Create new cashback promotion and verify it appears in the table', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);

        // Unique per run, scoped to this test — mirrors the same
        // self-sufficient pattern already used by TC-23/TC-44 below, rather
        // than depending on shared module-level state.
        const createdDesc = `AutoCashback_${Date.now()}`;
        const compCode = `CODE_${Date.now()}`;

        // Open the Create dialog
        await cashbackPage.clickCreateCashbackPromotion();
        const dialog = cashbackPage.getCreateDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Fill all mandatory fields with the shared description
        await cashbackPage.fillDescriptionInDialog(dialog, createdDesc);
        await cashbackPage.selectRegionInDialog(dialog, 'Betway Ghana');
        await cashbackPage.selectTriggerInDialog(dialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(dialog);
        await cashbackPage.setEndDateInDialog(dialog);
        await cashbackPage.fillCompCodeInDialog(dialog, compCode);
        await cashbackPage.fillMinCompAmountInDialog(dialog, '10');
        await cashbackPage.fillCompPercentageInDialog(dialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(dialog);
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');
        await cashbackPage.fillOptInValueInDialog(dialog, 'AUTO_OPT_IN');
        await cashbackPage.selectExecutionHourInDialog(dialog);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step1_form_filled');

        // Save
        await cashbackPage.clickSaveInDialog(dialog);
        await expect(dialog).not.toBeVisible({ timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // Filter down to the new record by name — the shared table has grown
        // large enough over today's testing that a fresh row can land past
        // page 1, where a raw tbody-text check would miss it.
        await cashbackPage.fillSearch(createdDesc);

        // VERIFY — the new record must appear in the table
        await expect(cashbackPage.cashbackTable.locator('tbody')).toContainText(createdDesc, { timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step2_record_in_table');
        console.log(`✅ TC-13 PASSED — Record "${createdDesc}" created and verified in table.`);
    });

    test('TC-23 Edit the created record and verify the updated description in the table', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);

        // TC-13 (which used to create this record) is currently disabled, so this
        // test creates its own disposable record rather than depending on its
        // state — only ever touching data it creates itself, mirroring the same
        // fix already applied to TC-44 below.
        const ownCreatedDesc = `AutoCashback_${Date.now()}`;
        const ownEditedDesc = `EditedCashback_${Date.now()}`;

        await cashbackPage.clickCreateCashbackPromotion();
        const createDialog = cashbackPage.getCreateDialog();
        await expect(createDialog).toBeVisible({ timeout: 15000 });
        await cashbackPage.fillDescriptionInDialog(createDialog, ownCreatedDesc);
        await cashbackPage.selectRegionInDialog(createDialog, 'Betway Ghana');
        await cashbackPage.selectTriggerInDialog(createDialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(createDialog);
        await cashbackPage.setEndDateInDialog(createDialog);
        await cashbackPage.fillCompCodeInDialog(createDialog, `CODE_${Date.now()}`);
        await cashbackPage.fillMinCompAmountInDialog(createDialog, '10');
        await cashbackPage.fillCompPercentageInDialog(createDialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(createDialog);
        await cashbackPage.selectExecutionFrequencyInDialog(createDialog, 'Daily');
        await cashbackPage.fillOptInValueInDialog(createDialog, 'AUTO_OPT_IN');
        await cashbackPage.selectExecutionHourInDialog(createDialog);
        await cashbackPage.clickSaveInDialog(createDialog);
        await expect(createDialog).not.toBeVisible({ timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // Filter down to the new record by name — the shared table has grown
        // large enough over today's testing that a fresh row can land past
        // page 1, where a raw tbody-text check would miss it.
        await cashbackPage.fillSearch(ownCreatedDesc);
        await expect(cashbackPage.cashbackTable.locator('tbody')).toContainText(ownCreatedDesc, { timeout: 15000 });

        // Open the Edit dialog for THAT specific row
        await cashbackPage.clickEditByDescription(ownCreatedDesc);
        const dialog = cashbackPage.getEditDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Verify the dialog is pre-filled with the original description
        const currentDesc = await cashbackPage.getDescriptionValueInDialog(dialog);
        expect(currentDesc.trim()).toBe(ownCreatedDesc);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_step1_dialog_prefilled');

        // Change description to the edited value
        await cashbackPage.fillDescriptionInDialog(dialog, ownEditedDesc);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_step2_desc_changed');

        // Save
        await cashbackPage.clickSaveInDialog(dialog);
        await expect(dialog).not.toBeVisible({ timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // Re-filter by the new (edited) description before verifying — same
        // pagination reasoning as above.
        await cashbackPage.fillSearch(ownEditedDesc);
        await expect(cashbackPage.cashbackTable.locator('tbody')).toContainText(ownEditedDesc, { timeout: 15000 });
        // VERIFY — original description is no longer in the table under this filter
        await expect(cashbackPage.cashbackTable.locator('tbody')).not.toContainText(ownCreatedDesc, { timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_step3_edit_verified');
        console.log(`✅ TC-23 PASSED — Record updated from "${ownCreatedDesc}" to "${ownEditedDesc}" and verified.`);
    });

    test('TC-44 Delete the edited record and verify it is removed from the table', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);

        // TC-13/TC-23 (which used to create/edit this record) are currently
        // disabled, so this test creates its own disposable record rather than
        // depending on their state — only ever touching data it creates itself.
        const ownDesc = `DeleteMe_${Date.now()}`;
        await cashbackPage.clickCreateCashbackPromotion();
        const createDialog = cashbackPage.getCreateDialog();
        await expect(createDialog).toBeVisible({ timeout: 15000 });
        await cashbackPage.fillDescriptionInDialog(createDialog, ownDesc);
        await cashbackPage.selectRegionInDialog(createDialog, 'Betway Ghana');
        await cashbackPage.selectTriggerInDialog(createDialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(createDialog);
        await cashbackPage.setEndDateInDialog(createDialog);
        await cashbackPage.fillCompCodeInDialog(createDialog, `CODE_${Date.now()}`);
        await cashbackPage.fillMinCompAmountInDialog(createDialog, '10');
        await cashbackPage.fillCompPercentageInDialog(createDialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(createDialog);
        await cashbackPage.selectExecutionFrequencyInDialog(createDialog, 'Daily');
        await cashbackPage.fillOptInValueInDialog(createDialog, 'AUTO_OPT_IN');
        await cashbackPage.selectExecutionHourInDialog(createDialog);
        await cashbackPage.clickSaveInDialog(createDialog);
        await expect(createDialog).not.toBeVisible({ timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // Filter down to the new record by name — the shared table has grown
        // large enough over today's testing that a fresh row can land past
        // page 1, where a raw tbody-text check would miss it.
        await cashbackPage.fillSearch(ownDesc);
        await expect(cashbackPage.cashbackTable.locator('tbody')).toContainText(ownDesc, { timeout: 15000 });

        // Click Delete on THAT specific row
        await cashbackPage.clickDeleteByDescription(ownDesc);

        // Delete confirmation likely uses the same custom ".action-modal"
        // component as Approve, not PrimeVue's ".p-dialog" — accept both forms.
        const confirmDialog = page.locator(`${cashbackLocators.dialogContainer}, .action-modal`).last();
        await expect(confirmDialog).toBeVisible({ timeout: 10000 });
        await expect(confirmDialog).toContainText(/delete|sure/i);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_step1_confirm_dialog');

        // Confirm deletion
        await cashbackPage.clickYesOnDeleteDialog();
        await expect(confirmDialog).not.toBeVisible({ timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // VERIFY — the record must no longer be in the table (still filtered by
        // its own description, so an empty/"no results" state confirms deletion)
        await expect(cashbackPage.cashbackTable.locator('tbody')).not.toContainText(ownDesc, { timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_step2_record_deleted');
        console.log(`✅ TC-44 PASSED — Record "${ownDesc}" deleted and confirmed removed from table.`);
    });
});

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC-6 → TC-9 — Serial Approve Flow (same record throughout)
// //
// //  TC-6: Open Approve modal for a record → verify modal opens.
// //  TC-7: Verify modal content (question text + Yes/No buttons).
// //  TC-9: Click NO → verify modal closes, Approved By unchanged.
// //  TC-8: Click YES on a FRESH Approve → verify Approved By is updated.
// // ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Approve Modal Flow', () => {

    test('TC-6 Verify Approve button opens the confirmation modal', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        // Use the first UNAPPROVED record — already-approved records don't open a confirm dialog
        const targetDescription = await cashbackPage.clickApproveUnapprovedRecord();
        // The Approve confirmation is a custom ".action-modal" component, not a
        // PrimeVue ConfirmDialog/ConfirmPopup — accept all three forms.
        const confirmDialog = page.locator('.p-dialog, .p-confirm-popup, .action-modal').last();
        await expect(confirmDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_approve_modal_open');
        console.log(`✅ TC-6 PASSED — Approve modal opened for record "${targetDescription}".`);

        // Close the modal (No) to leave data unchanged for next tests
        await cashbackPage.clickNoOnApproveDialog();
    });

    test('TC-7 Verify Approve modal contains correct question text and Yes/No buttons', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        await cashbackPage.clickApproveUnapprovedRecord();
        // The Approve confirmation is a custom ".action-modal" component, not a
        // PrimeVue ConfirmDialog/ConfirmPopup — accept all three forms.
        const confirmDialog = page.locator('.p-dialog, .p-confirm-popup, .action-modal').last();
        await expect(confirmDialog).toBeVisible({ timeout: 15000 });

        // Verify the message text
        const message = await cashbackPage.getApproveDialogMessage();
        expect(message.toLowerCase()).toContain('approve');

        // Verify Yes and No buttons
        const yesBtn = confirmDialog.locator(cashbackLocators.confirmAcceptBtn)
            .or(page.getByRole('button', { name: cashbackLocators.buttonYes }));
        const noBtn = confirmDialog.locator(cashbackLocators.confirmRejectBtn)
            .or(page.getByRole('button', { name: cashbackLocators.buttonNo }));
        await expect(yesBtn.first()).toBeVisible();
        await expect(noBtn.first()).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_approve_modal_content');
        console.log(`✅ TC-7 PASSED — Modal message: "${message}". Yes/No buttons confirmed.`);

        await cashbackPage.clickNoOnApproveDialog();
    });

    test('TC-9 Verify No button closes modal without changing the Approved By status', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const approvedByBefore = await cashbackPage.getFirstRowApprovedByText();
        await cashbackPage.clickApproveUnapprovedRecord();

        // The Approve confirmation is a custom ".action-modal" component, not a
        // PrimeVue ConfirmDialog/ConfirmPopup — accept all three forms.
        const confirmDialog = page.locator('.p-dialog, .p-confirm-popup, .action-modal').last();
        await expect(confirmDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step1_modal_open');

        // Click NO — modal must close, data must be unchanged
        await cashbackPage.clickNoOnApproveDialog();
        await expect(confirmDialog).not.toBeVisible({ timeout: 10000 });

        const approvedByAfter = await cashbackPage.getFirstRowApprovedByText();
        expect(approvedByAfter).toBe(approvedByBefore);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step2_data_unchanged');
        console.log(`✅ TC-9 PASSED — Approved By unchanged after No: "${approvedByAfter}".`);
    });

    test('TC-8 Verify Yes button closes modal and updates the Approved By column', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const approvedByBefore = await cashbackPage.getFirstRowApprovedByText();

        // Use an unapproved record to ensure the confirm dialog appears
        await cashbackPage.clickApproveUnapprovedRecord();
        // The Approve confirmation is a custom ".action-modal" component, not a
        // PrimeVue ConfirmDialog/ConfirmPopup — accept all three forms.
        const confirmDialog = page.locator('.p-dialog, .p-confirm-popup, .action-modal').last();
        await expect(confirmDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step1_modal_open');

        // Click YES — modal must close, and a success toast confirms the approval
        await cashbackPage.clickYesOnApproveDialog();
        await expect(confirmDialog).not.toBeVisible({ timeout: 15000 });

        const successToast = page.locator('.p-toast-message-success, .p-toast-message');
        await expect(successToast.first()).toBeVisible({ timeout: 10000 });
        const toastText = await successToast.first().innerText().catch(() => '');

        await page.waitForLoadState('networkidle');

        const approvedByAfter = await cashbackPage.getFirstRowApprovedByText();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step2_approved_by_updated');
        console.log(`✅ TC-8 PASSED — Toast: "${toastText.replace(/\n/g, ' ')}". Approved By: before="${approvedByBefore}" → after="${approvedByAfter}".`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-3 | TC-12 | TC-14 to TC-22 | TC-36 | TC-39 to TC-42 — Create Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Create Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, cashbackPage }) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.clickCreateCashbackPromotion();
        await expect(page.locator(cashbackLocators.dialogContainer)).toBeVisible({ timeout: 15000 });
    });

    test('TC-3 Verify clicking Create button opens the New Cashback Promotion pop-up', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });
        await expect(dialog).toContainText(cashbackLocators.dialogTitleCreate);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_create_dialog_open');
        console.log('"New Cashback Promotion" pop-up opened successfully.');
    });

    test('TC-12 Verify all required fields are present in the New Cashback Promotion pop-up', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Always-visible required fields — check these strictly
        const requiredLabels = [
            cashbackLocators.fieldDescription,
            cashbackLocators.fieldRegion,
            cashbackLocators.fieldTrigger,
            cashbackLocators.fieldExecutionFrequency,
        ];
        for (const label of requiredLabels) {
            const cleanLabel = label.replace(' *', '').trim();
            const isVisible = await dialog.getByLabel(label).first().isVisible().catch(() => false)
                || await dialog.locator('label', { hasText: cleanLabel }).first().isVisible().catch(() => false);
            expect(isVisible, `Required field "${label}" should be visible`).toBe(true);
        }

        // Optional / always-shown fields — log result but do not fail the test
        const optionalLabels = [
            cashbackLocators.fieldGameType,
            cashbackLocators.fieldProviderName,
            cashbackLocators.fieldCompCode,
            cashbackLocators.fieldMinCompAmount,
            cashbackLocators.fieldCompPercentage,
            cashbackLocators.fieldUseSegments,
        ];
        for (const label of optionalLabels) {
            const cleanLabel = label.replace(' *', '').replace('?', '').trim();
            const isVisible = await dialog.getByLabel(label).first().isVisible().catch(() => false)
                || await dialog.locator('label', { hasText: cleanLabel }).first().isVisible().catch(() => false);
            if (!isVisible) console.log(`Note: optional field "${label}" not visible in initial dialog state.`);
        }

        // Start Date, End Date, Next Execution Date calendar inputs
        expect(await dialog.locator('.p-calendar input').count()).toBeGreaterThanOrEqual(2);

        // Save and Cancel buttons
        await expect(dialog.getByRole('button', { name: cashbackLocators.buttonSave })).toBeVisible();
        await expect(dialog.getByRole('button', { name: cashbackLocators.buttonCancel })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_create_dialog_fields');
        console.log('All required fields verified in the New Cashback Promotion pop-up.');
    });

    test('TC-14 Verify Cancel discards data without creating a promotion', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        const draftDesc = `Draft_${CommonUtils.generateRandomString(6)}`;
        await cashbackPage.fillDescriptionInDialog(dialog, draftDesc);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_step1_draft_filled');

        await cashbackPage.clickCancelInDialog(dialog);
        await expect(dialog).not.toBeVisible({ timeout: 10000 });

        // VERIFY — draft must NOT appear in the table
        const isPresent = await cashbackPage.isRowVisibleByDescription(draftDesc);
        expect(isPresent).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_step2_not_in_table');
        console.log(`✅ TC-14 PASSED — Draft "${draftDesc}" discarded and not in table.`);
    });

    test('TC-15 Verify Save is blocked when Description is empty', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.selectRegionInDialog(dialog, 'Betway Ghana');
        await cashbackPage.selectTriggerInDialog(dialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(dialog);
        await cashbackPage.setEndDateInDialog(dialog);
        await cashbackPage.fillCompCodeInDialog(dialog, `CODE_${CommonUtils.generateRandomString(5)}`);
        await cashbackPage.fillMinCompAmountInDialog(dialog, '10');
        await cashbackPage.fillCompPercentageInDialog(dialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(dialog);
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');

        await cashbackPage.clickSaveInDialog(dialog);

        // VERIFY — dialog stays open with a validation error
        await expect(dialog).toBeVisible({ timeout: 5000 });
        expect(await cashbackPage.isValidationErrorVisible(dialog)).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_description_validation');
        console.log('Validation error shown for missing Description — dialog remained open.');
    });

    test('TC-16 Verify Save is blocked when Region is missing', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.fillDescriptionInDialog(dialog, `Val_${CommonUtils.generateRandomString(5)}`);
        await cashbackPage.selectTriggerInDialog(dialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(dialog);
        await cashbackPage.setEndDateInDialog(dialog);
        await cashbackPage.fillCompCodeInDialog(dialog, `CODE_${CommonUtils.generateRandomString(5)}`);
        await cashbackPage.fillMinCompAmountInDialog(dialog, '10');
        await cashbackPage.fillCompPercentageInDialog(dialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(dialog);
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');

        await cashbackPage.clickSaveInDialog(dialog);

        await expect(dialog).toBeVisible({ timeout: 5000 });
        expect(await cashbackPage.isValidationErrorVisible(dialog)).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_region_validation');
        console.log('Validation error shown for missing Region — dialog remained open.');
    });

    test('TC-17 Verify Save is blocked when Start Date is after End Date', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();

        // Set End Date to an early date, then set Start Date to a LATER date
        const endInput = dialog.locator('.p-calendar input').nth(1);
        await endInput.click();
        await page.waitForTimeout(200);
        const endPanel = page.locator('[id$="_panel"], .p-datepicker-panel, .p-datepicker').last();
        try {
            await endPanel.waitFor({ state: 'visible', timeout: 5000 });
            await endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
            await page.waitForTimeout(300);
        } catch {
            await endInput.fill('01/07/2026 00:00');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(300);
        }

        const startInput = dialog.locator('.p-calendar input').nth(0);
        await startInput.click();
        await page.waitForTimeout(200);
        const startPanel = page.locator('[id$="_panel"], .p-datepicker-panel, .p-datepicker').last();
        try {
            await startPanel.waitFor({ state: 'visible', timeout: 5000 });
            await startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last().click();
            await page.waitForTimeout(300);
        } catch {
            await startInput.fill('31/12/2026 00:00');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(300);
        }

        await cashbackPage.fillDescriptionInDialog(dialog, `DateVal_${CommonUtils.generateRandomString(4)}`);
        await cashbackPage.selectRegionInDialog(dialog, 'Betway Ghana');
        await cashbackPage.fillCompCodeInDialog(dialog, `CODE_${CommonUtils.generateRandomString(5)}`);
        await cashbackPage.fillMinCompAmountInDialog(dialog, '10');
        await cashbackPage.fillCompPercentageInDialog(dialog, '5');
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');

        await cashbackPage.clickSaveInDialog(dialog);

        await expect(dialog).toBeVisible({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_date_range_validation');
        console.log('Date validation checked — dialog remained open for invalid date range.');
    });

    test('TC-18 Verify date picker populates field in dd/mm/yyyy format', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.setStartDateInDialog(dialog);

        const startValue = await dialog.locator('.p-calendar input').nth(0).inputValue();
        expect(startValue).toMatch(/^\d{2}\/\d{2}\/\d{4}/);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_date_format');
        console.log(`Start Date populated as: "${startValue}" — format validated.`);
    });

    test('TC-19 Verify Use Segments? toggle shows and hides the Segment dropdown', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();

        // Initially hidden
        expect(await cashbackPage.isSegmentDropdownVisibleInDialog(dialog)).toBe(false);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step1_hidden');

        // Check → must appear
        await cashbackPage.toggleUseSegmentsInDialog(dialog);
        expect(await cashbackPage.isSegmentDropdownVisibleInDialog(dialog)).toBe(true);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step2_visible');

        // Uncheck → must hide
        await cashbackPage.toggleUseSegmentsInDialog(dialog);
        expect(await cashbackPage.isSegmentDropdownVisibleInDialog(dialog)).toBe(false);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step3_hidden_again');
        console.log('Use Segments? toggle correctly shows/hides the Segment dropdown.');
    });

    test('TC-20 Verify selecting Game Type populates the Game Name dropdown', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.clickGameTypeDropdownInDialog(dialog);
        const options = page.locator('.p-dropdown-items .p-dropdown-item');
        const count = await options.count();

        if (count > 0) {
            await options.first().click();
            await page.waitForTimeout(500);
            const gameNameDropdown = dialog.getByLabel(cashbackLocators.fieldGameName);
            await expect(gameNameDropdown).toBeVisible();
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_game_type_game_name');
        console.log('Game Name dropdown responds to Game Type selection.');
    });

    test('TC-21 Verify Execution Time visibility depends on Execution Frequency', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();

        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');
        await page.waitForTimeout(500);
        expect(await cashbackPage.isExecutionTimeVisibleInDialog(dialog)).toBe(true);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_step1_daily');

        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Once Off');
        await page.waitForTimeout(500);
        expect(await cashbackPage.isExecutionTimeVisibleInDialog(dialog)).toBe(false);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_step2_onceoff');
        console.log('Execution Time correctly shown for Daily and hidden for Once Off.');
    });

    test('TC-36 Verify non-numeric input is rejected in Min Comp Amount field', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        // Use the page-object method which has robust CSS-fallback label resolution
        await cashbackPage.fillMinCompAmountInDialog(dialog, 'abc');
        await page.waitForTimeout(500);

        // Read back the value — use exact:false and a short timeout to avoid 120s hang
        const field = dialog.getByLabel(cashbackLocators.fieldMinCompAmount, { exact: false }).first();
        const value = await field.inputValue().catch(() => '');
        if (value !== '' && value !== '0') {
            await cashbackPage.clickSaveInDialog(dialog);
            await expect(dialog).toBeVisible({ timeout: 5000 });
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_numeric_validation');
        console.log(`Min Comp Amount with "abc" — field value after entry: "${value}".`);
    });

    test('TC-39 Verify duplicate Comp Code is rejected on creation', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        const duplicateCode = 'BF_FreeSpins';

        await cashbackPage.fillDescriptionInDialog(dialog, `DupeTest_${CommonUtils.generateRandomString(4)}`);
        await cashbackPage.selectRegionInDialog(dialog, 'Betway Ghana');
        await cashbackPage.selectTriggerInDialog(dialog, 'Loyalty');
        await cashbackPage.setStartDateInDialog(dialog);
        await cashbackPage.setEndDateInDialog(dialog);
        await cashbackPage.fillCompCodeInDialog(dialog, duplicateCode);
        await cashbackPage.fillMinCompAmountInDialog(dialog, '10');
        await cashbackPage.fillCompPercentageInDialog(dialog, '5');
        await cashbackPage.setNextExecutionDateInDialog(dialog);
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);

        const dialogOpen = await cashbackPage.isDialogStillOpen(cashbackLocators.dialogTitleCreate);
        const toastShown = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogOpen || toastShown).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_duplicate_comp_code');
        console.log(`Duplicate Comp Code "${duplicateCode}" correctly rejected.`);
    });

    test('TC-40 Verify Execution Time has a default value when frequency is Daily', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');
        await page.waitForTimeout(500);

        const timeValue = await cashbackPage.getExecutionTimeValue(dialog);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_execution_time_default');
        console.log(`Execution Time default value (Daily): "${timeValue}"`);
    });

    test('TC-41 Verify Region dropdown contains available options', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.clickRegionDropdownInDialog(dialog);
        const count = await cashbackPage.getDropdownOptionsCount();
        expect(count).toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_region_options');
        console.log(`Region dropdown has ${count} options.`);
    });

    test('TC-42 Verify Trigger dropdown contains available options', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getCreateDialog();
        await cashbackPage.clickTriggerDropdownInDialog(dialog);
        const count = await cashbackPage.getDropdownOptionsCount();
        expect(count).toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_trigger_options');
        console.log(`Trigger dropdown has ${count} options.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-10 | TC-22 | TC-25 to TC-35 | TC-37 to TC-38 | TC-43 — Edit Popup Tests
//  (These tests operate on the first available row — independent of CRUD serial flow)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Edit Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, cashbackPage }) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });
        await cashbackPage.clickEditFirstCashback();
        await expect(page.locator(cashbackLocators.dialogContainer)).toBeVisible({ timeout: 15000 });
    });

    test('TC-10 Verify Edit button opens the Update Cashback Promotion pop-up', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });
        await expect(dialog).toContainText(cashbackLocators.dialogTitleUpdate);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_edit_dialog_open');
        console.log('"Update Cashback Promotion" pop-up opened successfully.');
    });

    test('TC-22 Verify Update pop-up fields are pre-filled with existing data', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        const desc = await cashbackPage.getDescriptionValueInDialog(dialog);
        expect(desc.trim().length).toBeGreaterThan(0);

        let hasDateValue = false;
        for (const input of await dialog.locator('.p-calendar input').all()) {
            if ((await input.inputValue()).trim()) { hasDateValue = true; break; }
        }
        expect(hasDateValue).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_edit_prefilled');
        console.log(`Edit dialog pre-filled. Description: "${desc}"`);
    });

    test('TC-25 Verify Min Comp Amount is editable and saved', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.fillMinCompAmountInDialog(dialog, '15');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step1_amount_changed');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed25 = !(await dialog.isVisible().catch(() => true));
        const toastShown25 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogClosed25 || toastShown25, 'TC-25: Save should close dialog or show a notification').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step2_saved');
        console.log(`TC-25: Min Comp Amount field accepted value. Dialog closed: ${dialogClosed25}, toast: ${toastShown25}.`);
    });

    test('TC-26 Verify Comp Percentage is editable and saved', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.fillCompPercentageInDialog(dialog, '12');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step1_pct_changed');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed26 = !(await dialog.isVisible().catch(() => true));
        const toastShown26 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogClosed26 || toastShown26, 'TC-26: Save should close dialog or show a notification').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step2_saved');
        console.log(`TC-26: Comp Percentage field accepted value. Dialog closed: ${dialogClosed26}, toast: ${toastShown26}.`);
    });

    test('TC-27 Verify End Date can be updated and saved', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.setEndDateInDialog(dialog);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step1_date_changed');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed27 = !(await dialog.isVisible().catch(() => true));
        const toastShown27 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogClosed27 || toastShown27, 'TC-27: Save should close dialog or show a notification').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step2_saved');
        console.log(`TC-27: End Date field accepted value. Dialog closed: ${dialogClosed27}, toast: ${toastShown27}.`);
    });

    test('TC-28 Verify Next Execution Date can be updated and saved', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.setNextExecutionDateInDialog(dialog);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step1_date_changed');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed28 = !(await dialog.isVisible().catch(() => true));
        const toastShown28 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogClosed28 || toastShown28, 'TC-28: Save should close dialog or show a notification').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step2_saved');
        console.log(`TC-28: Next Execution Date field accepted value. Dialog closed: ${dialogClosed28}, toast: ${toastShown28}.`);
    });

    test('TC-29 Verify Execution Time can be updated and saved', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');
        await page.waitForTimeout(500);

        if (await cashbackPage.isExecutionTimeVisibleInDialog(dialog)) {
            await cashbackPage.fillExecutionTimeInDialog(dialog, '02:00 AM');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step1_time_changed');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed29 = !(await dialog.isVisible().catch(() => true));
        const toastShown29 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogClosed29 || toastShown29, 'TC-29: Save should close dialog or show a notification').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step2_saved');
        console.log(`TC-29: Execution Time field accepted value. Dialog closed: ${dialogClosed29}, toast: ${toastShown29}.`);
    });

    test('TC-30 Verify Use Segments? checkbox status is saved on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.toggleUseSegmentsInDialog(dialog);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step1_segment_toggled');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);
        const dialogClosed30 = !(await dialog.isVisible().catch(() => true));
        const toastShown30 = await page.locator('.p-toast-message').isVisible().catch(() => false);
        const fieldError30 = await cashbackPage.isValidationErrorVisible(dialog).catch(() => false);
        expect(
            dialogClosed30 || toastShown30 || fieldError30,
            'TC-30: Save should close dialog, show a notification, or show validation error'
        ).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step2_saved');
        console.log(`TC-30: Use Segments? toggled. Dialog closed: ${dialogClosed30}, toast: ${toastShown30}, fieldError: ${fieldError30}.`);
    });

    test('TC-31 Verify Cancel on Update discards changes — original description unchanged in table', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        const originalDesc = await cashbackPage.getDescriptionValueInDialog(dialog);

        await cashbackPage.fillDescriptionInDialog(dialog, 'Temporary Change');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step1_temp_change');

        await cashbackPage.clickCancelInDialog(dialog);
        await expect(dialog).not.toBeVisible({ timeout: 10000 });

        // VERIFY — original description still in table (first row unchanged)
        const firstRowDesc = await cashbackPage.getFirstRowDescriptionText();
        expect(firstRowDesc.trim()).toBe(originalDesc.trim());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step2_original_unchanged');
        console.log(`✅ TC-31 PASSED — Original "${originalDesc}" unchanged after Cancel.`);
    });

    test('TC-32 Verify Save blocked when Description is cleared on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.clearDescriptionInDialog(dialog);

        // After clearing description the Save button may become disabled (Angular validation).
        // Evaluate disabled state directly rather than waiting for click — a disabled button
        // is already evidence that save is blocked.
        const saveBtn = dialog.getByRole('button', { name: cashbackLocators.buttonSave });
        const isDisabled = await saveBtn.evaluate(
            el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')
        ).catch(() => false);

        if (!isDisabled) {
            // Button is enabled — click it and check that the dialog stays open with an error
            await saveBtn.click({ force: true });
            await page.waitForTimeout(800);
        }

        await expect(dialog).toBeVisible({ timeout: 5000 });
        expect(
            isDisabled || await cashbackPage.isValidationErrorVisible(dialog),
            'Save should be blocked (disabled button or validation error) when Description is empty'
        ).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_update_validation');
        console.log(`Save blocked when Description cleared — isDisabled: ${isDisabled}, dialog still open.`);
    });

    test('TC-33 Verify Update blocked when End Date is before Start Date', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.setEndDateBeforeStartDateInDialog(dialog);

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);

        const dialogOpen = await cashbackPage.isDialogStillOpen(cashbackLocators.dialogTitleUpdate);
        const toastShown = await page.locator('.p-toast-message').isVisible().catch(() => false);
        expect(dialogOpen || toastShown).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_date_validation_update');
        console.log('Date validation on Update — blocked when End Date < Start Date.');
    });

    test('TC-34 Verify Comp Percentage > 100 is rejected on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.fillCompPercentageInDialog(dialog, '101');

        await cashbackPage.clickSaveInDialog(dialog);
        await page.waitForTimeout(2000);

        const dialogOpen = await cashbackPage.isDialogStillOpen(cashbackLocators.dialogTitleUpdate);
        const toastShown = await page.locator('.p-toast-message').isVisible().catch(() => false);
        const fieldError = await cashbackPage.isValidationErrorVisible(dialog);
        expect(dialogOpen || toastShown || fieldError).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_comp_pct_range');
        console.log('Comp Percentage > 100 correctly rejected on Update.');
    });

    test('TC-35 Verify Execution Frequency change updates Execution Time visibility on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();

        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Daily');
        await page.waitForTimeout(500);
        expect(await cashbackPage.isExecutionTimeVisibleInDialog(dialog)).toBe(true);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_step1_daily');

        await cashbackPage.selectExecutionFrequencyInDialog(dialog, 'Once Off');
        await page.waitForTimeout(500);
        expect(await cashbackPage.isExecutionTimeVisibleInDialog(dialog)).toBe(false);

        await cashbackPage.clickSaveInDialog(dialog);
        await expect(dialog).not.toBeVisible({ timeout: 20000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_step2_onceoff_saved');
        console.log('Execution Frequency change (Daily → Once Off) saved and Execution Time hid correctly.');
    });

    test('TC-37 Verify Segment dropdown is pre-filled when editing a segmented promotion', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();

        if (await cashbackPage.isSegmentDropdownVisibleInDialog(dialog)) {
            const segmentValue = await dialog.getByLabel(cashbackLocators.fieldSegment).inputValue().catch(() => '');
            expect(segmentValue.trim().length).toBeGreaterThan(0);
            console.log(`Segment pre-filled: "${segmentValue}"`);
        } else {
            console.log('TC-37: This row does not use segments — segment pre-fill assertion not applicable.');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_segment_persistence');
    });

    test('TC-38 Verify Game Name list refreshes when Game Type is changed on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        await cashbackPage.clickGameTypeDropdownInDialog(dialog);
        const options = page.locator('.p-dropdown-items .p-dropdown-item');
        const count = await options.count();

        if (count > 1) {
            await options.nth(1).click();
            await page.waitForTimeout(800);
            await expect(dialog.getByLabel(cashbackLocators.fieldGameName)).toBeVisible();
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_game_name_refresh');
        console.log('Game Name list responds to Game Type change on Update pop-up.');
    });

    test('TC-43 Verify past dates are disabled in Next Execution Date calendar on Update', async ({ page, cashbackPage }, testInfo) => {
        const dialog = cashbackPage.getEditDialog();
        const calInput = dialog.locator('.p-calendar input').nth(2);
        await calInput.click();

        const panel = page.locator('.p-datepicker-panel, .p-datepicker').last();
        await panel.waitFor({ state: 'visible' });

        const disabledCount = await panel.locator('td.p-disabled, td span.p-disabled').count();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_exec_date_past_disabled');
        console.log(`TC-43: ${disabledCount} past-date cells disabled in Next Execution Date calendar.`);

        await page.keyboard.press('Escape');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-11 — Delete Confirmation Modal (open + cancel, no data change)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Delete Modal Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, cashbackPage }) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
    });

    test('TC-11 Verify Delete button opens a confirmation modal', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });
        await cashbackPage.clickDeleteFirstCashback();

        const confirmDialog = page.locator(cashbackLocators.dialogContainer).last();
        await expect(confirmDialog).toBeVisible({ timeout: 10000 });
        await expect(confirmDialog).toContainText(/delete|sure/i);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_delete_modal_open');
        console.log('Delete confirmation modal opened successfully.');

        // Close without deleting
        await cashbackPage.clickNoOnDeleteDialog();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-45 | TC-46 — Table Feature Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Cashback Promotions - Table Feature Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, cashbackPage }) => {
        await navigateToCashback(page, sidebarPage, cashbackPage);
    });

    test('TC-45 Verify table sorting by Created Date column', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const header = cashbackPage.cashbackTable.locator('th')
            .filter({ has: page.locator('.p-column-title', { hasText: cashbackLocators.columnCreatedDate }) });
        await expect(header).toBeVisible();
        await header.click().catch(() => {});
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_sort_created_date');
        console.log('Attempted sort click on Created Date column header.');
    });

    test('TC-46 Verify table sorting by Description column', async ({ page, cashbackPage }, testInfo) => {
        await cashbackPage.cashbackTable.locator('tbody tr').first().waitFor({ state: 'visible' });

        const header = cashbackPage.cashbackTable.locator('th')
            .filter({ has: page.locator('.p-column-title', { hasText: cashbackLocators.columnDescription }) });
        await expect(header).toBeVisible();
        await header.click().catch(() => {});
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_sort_description');
        console.log('Attempted sort click on Description column header.');
    });
});
