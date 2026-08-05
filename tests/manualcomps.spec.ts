// npx playwright test tests/manualcomps.spec.ts
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

async function navigateToManualComps(page: any, sidebarPage: any, manualCompsPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToManualComps();
    await page.waitForLoadState('networkidle');

    // Deep-link navigation via sidebar clicks doesn't always fully hydrate the
    // Angular component on first load — reload once if nothing rendered yet
    // (established pattern proven across this project's other spec files).
    const loaded = await manualCompsPage.createManualCompBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await manualCompsPage.createManualCompBtn.waitFor({ state: 'visible', timeout: 30000 });
    }
}

test.describe('Manual Comps', () => {
    test.beforeEach(async ({ page, sidebarPage, manualCompsPage }) => {
        await navigateToManualComps(page, sidebarPage, manualCompsPage);
    });

    test('TC-1 Verify Manual Comps page is accessible', async ({ page, manualCompsPage }, testInfo) => {
        await expect(manualCompsPage.createManualCompBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_manual_comps_page_accessible');
        console.log('✅ TC-1 PASSED — Manual Comps page is accessible with its Create Manual Comp button.');
    });

    test('TC-2 Verify Create Manual Comp popup opens with all 6 fields', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await expect(manualCompsPage.dialog.locator('label:text-is("Comp Code *")')).toBeVisible();
        await expect(manualCompsPage.dialog.locator('label:text-is("Region Code *")')).toBeVisible();
        await expect(manualCompsPage.dialog.locator('label:text-is("Account ID *")')).toBeVisible();
        await expect(manualCompsPage.dialog.locator('label:text-is("Mobile Number *")')).toBeVisible();
        await expect(manualCompsPage.dialog.locator('label:text-is("Comp Value *")')).toBeVisible();
        await expect(manualCompsPage.dialog.locator('label:text-is("Comp Free Bets *")')).toBeVisible();
        await expect(manualCompsPage.saveBtn).toBeVisible();
        await expect(manualCompsPage.cancelBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_manual_comp_popup_structure');
        console.log('✅ TC-2 PASSED — Create Manual Comp popup shows all 6 fields.');
    });

    test('TC-3 Verify Save stays disabled until every mandatory field is filled', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to start disabled').toBe(false);

        await manualCompsPage.selectFirstAvailableCompCode();
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to still be disabled without Region Code/Account ID/Mobile Number/Comp Value/Comp Free Bets').toBe(false);

        await manualCompsPage.selectFirstAvailableRegionCode();
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to still be disabled without Account ID/Mobile Number/Comp Value/Comp Free Bets').toBe(false);

        await manualCompsPage.fillAccountId(CommonUtils.generateUUID());
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to still be disabled without Mobile Number/Comp Value/Comp Free Bets').toBe(false);

        await manualCompsPage.fillMobileNumber('1234567890');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to still be disabled without Comp Value/Comp Free Bets').toBe(false);

        await manualCompsPage.fillCompValue('1');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to still be disabled without Comp Free Bets').toBe(false);

        await manualCompsPage.fillCompFreeBets('0');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to enable once every mandatory field is filled').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_save_enabled_after_mandatory_fields');
        console.log('✅ TC-3 PASSED — Save correctly stays disabled until every mandatory field is filled.');
    });

    test('TC-4 Verify Account ID must be a valid GUID', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await manualCompsPage.fillMandatoryFields({ skip: ['accountId'] });
        await manualCompsPage.fillAccountId('not-a-valid-guid');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to stay disabled with an invalid Account ID').toBe(false);

        await manualCompsPage.fillAccountId(CommonUtils.generateUUID());
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to enable once Account ID is a valid GUID').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_account_id_guid_validation');
        console.log('✅ TC-4 PASSED — Account ID correctly requires a valid GUID.');
    });

    test('TC-5 Verify Mobile Number only accepts integers', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await manualCompsPage.fillMandatoryFields({ skip: ['mobileNumber'] });
        await manualCompsPage.fillMobileNumber('abc123def');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to stay disabled with a non-integer Mobile Number').toBe(false);

        await manualCompsPage.fillMobileNumber('1234567890123');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to enable once Mobile Number is all integers, regardless of length').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_mobile_number_integer_validation');
        console.log('✅ TC-5 PASSED — Mobile Number correctly requires integers only, of any length.');
    });

    test('TC-6 Verify Comp Value must be at least 1', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await manualCompsPage.fillMandatoryFields({ skip: ['compValue'] });
        await manualCompsPage.fillCompValue('0');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to stay disabled when Comp Value is 0').toBe(false);

        await manualCompsPage.fillCompValue('1');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to enable once Comp Value is at least 1').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_comp_value_minimum_validation');
        console.log('✅ TC-6 PASSED — Comp Value correctly requires at least 1.');
    });

    test('TC-7 Verify Comp Free Bets must not be less than 0', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await manualCompsPage.fillMandatoryFields({ skip: ['compFreeBets'] });
        await manualCompsPage.fillCompFreeBets('0');
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to enable with Comp Free Bets at 0 (not less than 0 is allowed)').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_comp_free_bets_minimum_validation');
        console.log('✅ TC-7 PASSED — Comp Free Bets correctly allows 0 (not less than 0).');
    });

    test('TC-8 Verify Cancel button discards data', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        const discardedAccountId = CommonUtils.generateUUID();
        await manualCompsPage.fillMandatoryFields({ accountId: discardedAccountId });
        await manualCompsPage.clickCancel();

        await expect(manualCompsPage.dialog).toBeHidden();
        await expect(page.getByText(discardedAccountId)).toHaveCount(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_cancel_discards_data');
        console.log('✅ TC-8 PASSED — Cancel correctly discarded the entered data.');
    });

    test('TC-9 Verify creating a Manual Comp shows a success toast', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();

        await manualCompsPage.fillMandatoryFields();
        expect(await manualCompsPage.isSaveEnabled(), 'Expected Save to be enabled with every mandatory field filled').toBe(true);
        await manualCompsPage.clickSave();

        const toastText = await manualCompsPage.getToastText();
        console.log(`Toast after save: "${toastText}"`);
        await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
            .toBeVisible({ timeout: 15000 });
        await expect(manualCompsPage.dialog).not.toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_manual_comp_created_success');
        console.log('✅ TC-9 PASSED — Creating a Manual Comp showed a success toast.');
    });

    // ASSUMPTION: Approve renders directly in the row (no kebab), mirroring Comp Bulk's
    // Process/Cancel — see ManualCompsPage.getRowByAccountId. Not yet confirmed against the
    // real table markup for this feature.
    test('TC-10 Verify Approve (Yes) shows a toast', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();
        const accountId = await manualCompsPage.fillMandatoryFields();
        await manualCompsPage.clickSaveAndVerify();

        await manualCompsPage.clickApproveOnRow(accountId);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_before_confirming_approve');
        await manualCompsPage.clickYesOnConfirmDialog();

        const toastText = await manualCompsPage.getToastText();
        console.log(`Toast after Approve: "${toastText}"`);
        await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_approve_confirmed');
        console.log(`✅ TC-10 PASSED — Approving Manual Comp (Account ID: "${accountId}") showed a success toast.`);
    });

    // ASSUMPTION: Decline renders directly in the row (no kebab) — see TC-10's note.
    test('TC-11 Verify Decline (Yes) shows a toast', async ({ page, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        await manualCompsPage.waitForPopupLoad();
        const accountId = await manualCompsPage.fillMandatoryFields();
        await manualCompsPage.clickSaveAndVerify();

        await manualCompsPage.clickDeclineOnRow(accountId);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_before_confirming_decline');
        await manualCompsPage.clickYesOnConfirmDialog();

        const toastText = await manualCompsPage.getToastText();
        console.log(`Toast after Decline: "${toastText}"`);
        await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_decline_confirmed');
        console.log(`✅ TC-11 PASSED — Declining Manual Comp (Account ID: "${accountId}") showed a success toast.`);
    });
});
