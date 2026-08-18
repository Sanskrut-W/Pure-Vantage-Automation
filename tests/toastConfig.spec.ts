// npx playwright test tests/testConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

const REGION = 'Betway Ghana';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToToastConfig(page: any, sidebarPage: any, toastConfigPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToToastConfig();
    await toastConfigPage.createToastConfigBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreateToastConfigPopup(toastConfigPage: any) {
    await toastConfigPage.clickCreateToastConfig();
    await toastConfigPage.waitForPopupLoad();
}

// Fills all 7 mandatory fields (Name, Region, Start Date, End Date, State, Occurrence, Content)
// in the exact sequence the app's UX requires: each of Start Date → End Date → State also
// dismisses the previously-open calendar/dropdown, so they must run in this order.
async function fillMandatoryToastConfigFields(page: any, toastConfigPage: any, name: string, region: string) {
    await toastConfigPage.fillName(name);
    await toastConfigPage.selectRegionInDialog(region);
    await toastConfigPage.setStartDateTimeToTodayMinusFourHours();
    await toastConfigPage.setEndDateTimeToLastAvailableDay();
    await toastConfigPage.selectFirstState();
    await toastConfigPage.selectFirstOccurrence();
    await toastConfigPage.selectFirstContent();
    await page.waitForTimeout(500);
}

// Creates a fresh, disposable Toast Configuration and returns its Name. Used only by the one
// test that actually needs a persisted record (TC-16) — its own afterEach deletes it again
// regardless of pass/fail, so this suite never leaves rows behind in the database.
async function createDisposableToastConfig(page: any, toastConfigPage: any): Promise<string> {
    const name = `ToastCfg_${CommonUtils.generateRandomString(8)}`;

    await openCreateToastConfigPopup(toastConfigPage);
    await fillMandatoryToastConfigFields(page, toastConfigPage, name, REGION);
    await expect(toastConfigPage.saveBtn, 'Expected Save to enable once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await toastConfigPage.clickSave();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the Toast Configuration was created').toBeVisible({ timeout: 15000 });
    console.log('Create Toast Config toast message:', await toastText.textContent());

    const dialogClosedOnItsOwn = await toastConfigPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await toastConfigPage.clickCancel().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});

    return name;
}

// Selects the given Toast Configuration's row and clicks Schedule.
async function openScheduleForToastConfig(toastConfigPage: any, region: string, name: string) {
    await toastConfigPage.selectRegion(region);
    await toastConfigPage.clickScheduleForToastConfig(name);
    await toastConfigPage.waitForPopupLoad();
}

// Fills all 7 mandatory Schedule fields (Active Months, Active Days, Days Of Month, Execute At
// Minute, Execute At Hour, Duration, Start Date). End Date is intentionally left blank — it's
// the one optional field in this popup.
async function fillMandatoryScheduleFields(page: any, toastConfigPage: any) {
    await toastConfigPage.selectActiveMonths(2);
    await toastConfigPage.selectActiveDays(2);
    await toastConfigPage.selectActiveDaysOfMonth(2);
    await toastConfigPage.fillExecuteAtMinute('30');
    await toastConfigPage.selectExecuteAtHours(2);
    await toastConfigPage.fillDuration('2');
    await toastConfigPage.setScheduleStartDate();
    await page.waitForTimeout(500);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
    });

    test('TC-1 Verify Toast Configuration page is accessible', async ({ page, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.createToastConfigBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_toast_config_page_accessible');
        console.log('Toast Configuration page is accessible with Create Toast Config button visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-2 to TC-7 — Create Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Create Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
        await openCreateToastConfigPopup(toastConfigPage);
    });

    test('TC-2 Verify clicking Create Toast Config opens the popup', async ({ page, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.popupDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_popup_open');
        console.log('Create Toast Configuration popup opened successfully.');
    });

    test('TC-3 Verify all fields and footer buttons are present in the popup', async ({ page, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.nameInput, 'Expected Name field').toBeVisible();
        await expect(toastConfigPage.dialogRegionDropdown, 'Expected Region field').toBeVisible();
        await expect(page.locator('#startDateTime input'), 'Expected Start Date field').toBeVisible();
        await expect(page.locator('#endDateTime input'), 'Expected End Date field').toBeVisible();
        await expect(page.locator('#state'), 'Expected State field').toBeVisible();
        await expect(page.locator('#occurance'), 'Expected Occurrence field').toBeVisible();
        await expect(toastConfigPage.pathInput, 'Expected Path field').toBeVisible();
        await expect(page.locator('#contentPath'), 'Expected Content field').toBeVisible();
        await expect(toastConfigPage.availableCountriesInput, 'Expected Available Country Codes field').toBeVisible();

        await expect(toastConfigPage.includedTagsContainer, 'Expected Included Account Tags section').toBeVisible();
        await expect(toastConfigPage.excludedTagsContainer, 'Expected Excluded Account Tags section').toBeVisible();

        await expect(toastConfigPage.saveBtn, 'Expected Save button').toBeVisible();
        await expect(toastConfigPage.cancelBtn, 'Expected Cancel button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_all_fields_present');
        console.log('All 9 fields, both Account Tags sections, and footer buttons verified in the Create Toast Config popup.');
    });

    test('TC-4 Verify Save button is disabled when all fields are empty', async ({ page, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.saveBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_save_disabled_empty');
        console.log('Save button confirmed disabled with all fields empty.');
    });

    test('TC-5 Verify Save button stays disabled when only Name is filled', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.fillName(`ToastCfg_${CommonUtils.generateRandomString(6)}`);
        await page.waitForTimeout(300);

        await expect(toastConfigPage.saveBtn, 'Expected Save to stay disabled with only Name filled').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_save_disabled_name_only');
        console.log('Save button stayed disabled with only Name filled.');
    });

    test('TC-6 Verify Save button becomes enabled once all mandatory fields are filled', async ({ page, toastConfigPage }, testInfo) => {
        const name = `ToastCfg_${CommonUtils.generateRandomString(8)}`;
        await fillMandatoryToastConfigFields(page, toastConfigPage, name, REGION);

        await expect(toastConfigPage.saveBtn, 'Expected Save to enable once all mandatory fields are valid').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_save_enabled_all_mandatory_filled');
        console.log('Save button became enabled once Name, Region, Start Date, End Date, State, Occurrence and Content were all filled.');
        // Deliberately does not click Save — TC-16 is the dedicated end-to-end create test, so
        // this one never creates a persisted record and needs no cleanup.
        await toastConfigPage.clickCancel();
    });

    test('TC-7 Verify Cancel closes the popup without creating a Toast Configuration', async ({ page, toastConfigPage }, testInfo) => {
        const draftName = `Draft_${CommonUtils.generateRandomString(8)}`;
        await toastConfigPage.fillName(draftName);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_step1_draft_filled');

        await toastConfigPage.clickCancel();
        await expect(toastConfigPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_step2_popup_closed');
        console.log(`✅ TC-7 PASSED — Cancel closed the popup; draft "${draftName}" was never created.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-8 to TC-15 — Included/Excluded Account Tags Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Account Tags Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
        await openCreateToastConfigPopup(toastConfigPage);
    });

    test('TC-8 Verify Included Account Tags shows a Select A Tag dropdown and a Tag Value input', async ({ page, toastConfigPage }, testInfo) => {
        const row = toastConfigPage.tagRowAt(toastConfigPage.includedTagsContainer, 0);
        await expect(row, 'Expected an initial Included Account Tags row').toBeVisible();
        await expect(toastConfigPage.getTagValueInputAt(toastConfigPage.includedTagsContainer, 0), 'Expected a Tag Value input').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_included_tags_fields');
        console.log('Included Account Tags row shows a tag dropdown and a Tag Value input.');
    });

    test('TC-9 Verify Excluded Account Tags shows a Select A Tag dropdown and a Tag Value input', async ({ page, toastConfigPage }, testInfo) => {
        const row = toastConfigPage.tagRowAt(toastConfigPage.excludedTagsContainer, 0);
        await expect(row, 'Expected an initial Excluded Account Tags row').toBeVisible();
        await expect(toastConfigPage.getTagValueInputAt(toastConfigPage.excludedTagsContainer, 0), 'Expected a Tag Value input').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_excluded_tags_fields');
        console.log('Excluded Account Tags row shows a tag dropdown and a Tag Value input.');
    });

    test('TC-10 Verify clicking Add on Included Account Tags adds a new row', async ({ page, toastConfigPage }, testInfo) => {
        const countBefore = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);
        await toastConfigPage.clickAddTagRow(toastConfigPage.includedTagsContainer);
        await page.waitForTimeout(300);
        const countAfter = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);

        expect(countAfter, 'Expected row count to increase by 1 after clicking Add').toBe(countBefore + 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_included_tags_row_added');
        console.log(`Included Account Tags row count increased from ${countBefore} to ${countAfter}.`);
    });

    test('TC-11 Verify Delete on Included Account Tags removes the row when multiple rows exist', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.clickAddTagRow(toastConfigPage.includedTagsContainer);
        await page.waitForTimeout(300);
        const countAfterAdd = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);
        expect(countAfterAdd).toBeGreaterThan(1);

        await toastConfigPage.clickDeleteTagRow(toastConfigPage.includedTagsContainer, countAfterAdd - 1);
        await page.waitForTimeout(300);
        const countAfterDelete = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);

        expect(countAfterDelete, 'Expected row count to decrease by 1 after Delete with multiple rows present').toBe(countAfterAdd - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_included_tags_row_removed');
        console.log(`Included Account Tags row count decreased from ${countAfterAdd} to ${countAfterDelete} after Delete.`);
    });

    test('TC-12 Verify Delete on Included Account Tags clears the fields when only one row exists', async ({ page, toastConfigPage }, testInfo) => {
        const countBefore = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);
        expect(countBefore, 'Expected exactly one row before this test').toBe(1);

        await toastConfigPage.fillTagValue(toastConfigPage.includedTagsContainer, 0, 'SomeTagValue');
        await page.waitForTimeout(300);

        await toastConfigPage.clickDeleteTagRow(toastConfigPage.includedTagsContainer, 0);
        await page.waitForTimeout(300);

        const countAfter = await toastConfigPage.getTagRowCount(toastConfigPage.includedTagsContainer);
        expect(countAfter, 'Expected the single row to remain (not be removed) when it is the only row').toBe(1);
        await expect(toastConfigPage.getTagValueInputAt(toastConfigPage.includedTagsContainer, 0), 'Expected Tag Value to be cleared').toHaveValue('');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_included_tags_single_row_cleared');
        console.log('Deleting the only Included Account Tags row cleared its fields instead of removing it.');
    });

    test('TC-13 Verify clicking Add on Excluded Account Tags adds a new row', async ({ page, toastConfigPage }, testInfo) => {
        const countBefore = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);
        await toastConfigPage.clickAddTagRow(toastConfigPage.excludedTagsContainer);
        await page.waitForTimeout(300);
        const countAfter = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);

        expect(countAfter, 'Expected row count to increase by 1 after clicking Add').toBe(countBefore + 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_excluded_tags_row_added');
        console.log(`Excluded Account Tags row count increased from ${countBefore} to ${countAfter}.`);
    });

    test('TC-14 Verify Delete on Excluded Account Tags removes the row when multiple rows exist', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.clickAddTagRow(toastConfigPage.excludedTagsContainer);
        await page.waitForTimeout(300);
        const countAfterAdd = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);
        expect(countAfterAdd).toBeGreaterThan(1);

        await toastConfigPage.clickDeleteTagRow(toastConfigPage.excludedTagsContainer, countAfterAdd - 1);
        await page.waitForTimeout(300);
        const countAfterDelete = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);

        expect(countAfterDelete, 'Expected row count to decrease by 1 after Delete with multiple rows present').toBe(countAfterAdd - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_excluded_tags_row_removed');
        console.log(`Excluded Account Tags row count decreased from ${countAfterAdd} to ${countAfterDelete} after Delete.`);
    });

    test('TC-15 Verify Delete on Excluded Account Tags clears the fields when only one row exists', async ({ page, toastConfigPage }, testInfo) => {
        const countBefore = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);
        expect(countBefore, 'Expected exactly one row before this test').toBe(1);

        await toastConfigPage.fillTagValue(toastConfigPage.excludedTagsContainer, 0, 'SomeTagValue');
        await page.waitForTimeout(300);

        await toastConfigPage.clickDeleteTagRow(toastConfigPage.excludedTagsContainer, 0);
        await page.waitForTimeout(300);

        const countAfter = await toastConfigPage.getTagRowCount(toastConfigPage.excludedTagsContainer);
        expect(countAfter, 'Expected the single row to remain (not be removed) when it is the only row').toBe(1);
        await expect(toastConfigPage.getTagValueInputAt(toastConfigPage.excludedTagsContainer, 0), 'Expected Tag Value to be cleared').toHaveValue('');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_excluded_tags_single_row_cleared');
        console.log('Deleting the only Excluded Account Tags row cleared its fields instead of removing it.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-16 — Create and Search Verification
//  The only test in this file that persists a real record — its own afterEach deletes that
//  record again immediately, WHETHER THE TEST PASSED OR FAILED (Playwright's afterEach always
//  runs), so this suite never accumulates entries in the database across runs.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Create and Search Verification', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
    });

    test.afterEach(async ({ page, toastConfigPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        try {
            await toastConfigPage.selectRegion(REGION).catch(() => {});
            await toastConfigPage.clickDeleteForToastConfig(nameToDelete);
            await toastConfigPage.clickConfirmYes();
            await page.waitForTimeout(1000);
            console.log(`Cleanup: deleted Toast Configuration "${nameToDelete}".`);
        } catch (e) {
            console.warn(`Cleanup failed for Toast Configuration "${nameToDelete}": ${e}`);
        }
    });

    test('TC-16 Verify a Toast Configuration can be created and found by selecting its Region and searching by Name', async ({ page, toastConfigPage }, testInfo) => {
        const name = await createDisposableToastConfig(page, toastConfigPage);
        createdName = name; // mark for cleanup regardless of what happens below

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_step1_created');

        // Per the app's UX, the search bar only returns meaningful results once a Region is
        // selected in the page-level Region filter first.
        await toastConfigPage.selectRegion(REGION);
        await toastConfigPage.searchToastConfig(name);

        await expect(toastConfigPage.getRowByName(name), 'Expected the created Toast Configuration to be found after selecting its Region and searching by Name')
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_step2_found_via_search');
        console.log(`✅ TC-16 PASSED — Toast Configuration "${name}" created and found via Region + Search.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-17 to TC-19 — Edit Tests
//  Each test creates its own disposable Toast Configuration first, so Edit only ever acts on
//  automation's own data. The afterEach below deletes that same record again immediately —
//  WHETHER THE TEST PASSED OR FAILED (Playwright's afterEach always runs regardless of
//  outcome) — so this suite never accumulates entries in the database across runs.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Edit Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
        createdName = await createDisposableToastConfig(page, toastConfigPage);
    });

    test.afterEach(async ({ page, toastConfigPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        try {
            await toastConfigPage.selectRegion(REGION).catch(() => {});
            await toastConfigPage.clickDeleteForToastConfig(nameToDelete);
            await toastConfigPage.clickConfirmYes();
            await page.waitForTimeout(1000);
            console.log(`Cleanup: deleted Toast Configuration "${nameToDelete}".`);
        } catch (e) {
            console.warn(`Cleanup failed for Toast Configuration "${nameToDelete}": ${e}`);
        }
    });

    test('TC-17 Verify clicking Edit opens the Edit popup pre-filled with the existing Name', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.selectRegion(REGION);
        await toastConfigPage.clickEditForToastConfig(createdName!);
        await toastConfigPage.waitForPopupLoad();

        await expect(toastConfigPage.nameInput, 'Expected Name to be pre-filled with the existing value').toHaveValue(createdName!);
        await expect(toastConfigPage.saveBtn, 'Expected a Save button on the Edit popup').toBeVisible();
        await expect(toastConfigPage.cancelBtn, 'Expected a Cancel button on the Edit popup').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_edit_popup_prefilled');
        console.log(`Edit popup opened pre-filled for Toast Configuration "${createdName}".`);

        await toastConfigPage.clickCancel();
    });

    test('TC-18 Verify Cancel on the Edit popup closes it without changing the entry', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.selectRegion(REGION);
        await toastConfigPage.clickEditForToastConfig(createdName!);
        await toastConfigPage.waitForPopupLoad();

        const draftPath = `Draft_${CommonUtils.generateRandomString(6)}`;
        await toastConfigPage.fillPath(draftPath);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_step1_draft_edited');

        await toastConfigPage.clickCancel();
        await expect(toastConfigPage.popupDialog, 'Expected the Edit popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await toastConfigPage.searchToastConfig(createdName!);
        await expect(toastConfigPage.getRowByName(createdName!), 'Expected the entry to still exist after cancelling Edit')
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_step2_unchanged');
        console.log(`✅ TC-18 PASSED — Cancel discarded the draft edit for "${createdName}".`);
    });

    test('TC-19 Verify updating a field and clicking Save updates the Toast Configuration successfully', async ({ page, toastConfigPage }, testInfo) => {
        await toastConfigPage.selectRegion(REGION);
        await toastConfigPage.clickEditForToastConfig(createdName!);
        await toastConfigPage.waitForPopupLoad();

        const updatedPath = `Updated_${CommonUtils.generateRandomString(6)}`;
        await toastConfigPage.fillPath(updatedPath);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step1_path_updated');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid edited form').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the update').toBeVisible({ timeout: 15000 });
        console.log('Update toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await toastConfigPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await toastConfigPage.clickCancel().catch(() => {});
        }
        await page.waitForLoadState('networkidle').catch(() => {});

        await toastConfigPage.searchToastConfig(createdName!);
        await expect(toastConfigPage.getRowByName(createdName!), 'Expected the Toast Configuration to still be listed after the update')
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step2_saved');
        console.log(`✅ TC-19 PASSED — "${createdName}" updated (Path -> "${updatedPath}") and saved successfully.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-20 to TC-27 — Schedule Tests
//  Each test creates its own disposable Toast Configuration first, so Schedule only ever acts
//  on automation's own data. The afterEach below deletes that same record again immediately —
//  WHETHER THE TEST PASSED OR FAILED (Playwright's afterEach always runs regardless of
//  outcome) — so this suite never accumulates entries in the database across runs. Deleting
//  the parent Toast Configuration is assumed to also remove any schedule created against it;
//  there's no separate "delete schedule" action given in this feature's UI.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Toast Configuration - Schedule Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, toastConfigPage }) => {
        await navigateToToastConfig(page, sidebarPage, toastConfigPage);
        createdName = await createDisposableToastConfig(page, toastConfigPage);
    });

    test.afterEach(async ({ page, toastConfigPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        try {
            await toastConfigPage.selectRegion(REGION).catch(() => {});
            await toastConfigPage.clickDeleteForToastConfig(nameToDelete);
            await toastConfigPage.clickConfirmYes();
            await page.waitForTimeout(1000);
            console.log(`Cleanup: deleted Toast Configuration "${nameToDelete}".`);
        } catch (e) {
            console.warn(`Cleanup failed for Toast Configuration "${nameToDelete}": ${e}`);
        }
    });

    test('TC-20 Verify clicking Schedule opens the Schedule popup', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await expect(toastConfigPage.popupDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_schedule_popup_open');
        console.log(`Schedule popup opened successfully for "${createdName}".`);

        // Must close the popup before the test ends — afterEach deletes createdName on the
        // list page right after this, and it can't reliably select Region/search/click Delete
        // while this modal is still covering the page underneath it.
        await toastConfigPage.clickCancel();
    });

    test('TC-21 Verify all fields and footer buttons are present in the Schedule popup', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await expect(page.locator('#activeMonths'), 'Expected Active Months field').toBeVisible();
        await expect(page.locator('#activeDays'), 'Expected Active Days field').toBeVisible();
        await expect(page.locator('#activeDaysOfMonth'), 'Expected Days Of Month field').toBeVisible();
        await expect(page.locator('#startingMin input'), 'Expected Execute At Minute field').toBeVisible();
        await expect(page.locator('#startingHours'), 'Expected Execute At Hour field').toBeVisible();
        await expect(page.locator('#duration input'), 'Expected Duration In Hours field').toBeVisible();
        await expect(page.locator('#startDate input'), 'Expected Start Date field').toBeVisible();
        await expect(page.locator('#endDate input'), 'Expected End Date field').toBeVisible();

        await expect(toastConfigPage.saveBtn, 'Expected Save button').toBeVisible();
        await expect(toastConfigPage.cancelBtn, 'Expected Cancel button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_all_fields_present');
        console.log('All 8 fields and footer buttons verified in the Schedule popup.');

        // Must close the popup before the test ends — see TC-20's comment for why.
        await toastConfigPage.clickCancel();
    });

    test('TC-22 Verify Save is disabled when all fields are empty', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await expect(toastConfigPage.saveBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_save_disabled_empty');
        console.log('Save button confirmed disabled with all Schedule fields empty.');

        // Must close the popup before the test ends — see TC-20's comment for why.
        await toastConfigPage.clickCancel();
    });

    test('TC-23 Verify Save stays disabled when Duration is missing', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await toastConfigPage.selectActiveMonths(2);
        await toastConfigPage.selectActiveDays(2);
        await toastConfigPage.selectActiveDaysOfMonth(2);
        await toastConfigPage.fillExecuteAtMinute('30');
        await toastConfigPage.selectExecuteAtHours(2);
        // Duration deliberately left empty
        await toastConfigPage.setScheduleStartDate();
        await page.waitForTimeout(300);

        await expect(toastConfigPage.saveBtn, 'Expected Save to stay disabled without Duration filled').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_save_disabled_duration_missing');
        console.log('Save button stayed disabled with Duration In Hours left empty.');

        // Must close the popup before the test ends — see TC-20's comment for why.
        await toastConfigPage.clickCancel();
    });

    test('TC-24 Verify Save becomes enabled once all mandatory fields are filled', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await fillMandatoryScheduleFields(page, toastConfigPage);

        await expect(toastConfigPage.saveBtn, 'Expected Save to enable once all mandatory fields are valid (End Date left blank, it is optional)')
            .toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_save_enabled_all_mandatory_filled');
        console.log('Save button became enabled with all 7 mandatory Schedule fields filled and End Date left blank.');
        await toastConfigPage.clickCancel();
    });

    test('TC-25 Verify multiple Active Months selections save successfully', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        const activeMonths = page.locator('#activeMonths');
        const selected = await toastConfigPage.selectMultiSelectOptionsByCount(activeMonths, 3);
        expect(selected.length, 'Expected at least one Active Months option to be selectable').toBeGreaterThan(0);

        const chipCount = await toastConfigPage.getMultiSelectChipCount(activeMonths);
        expect(chipCount, 'Expected a chip for each selected Active Months option').toBe(selected.length);
        console.log(`Selected ${selected.length} Active Months option(s): ${selected.join(', ')} — ${chipCount} chip(s) shown.`);

        // Fill the rest of the mandatory fields so the schedule can actually be saved —
        // clicking Active Days dismisses the still-open Active Months panel first.
        await toastConfigPage.selectActiveDays(2);
        await toastConfigPage.selectActiveDaysOfMonth(2);
        await toastConfigPage.fillExecuteAtMinute('30');
        await toastConfigPage.selectExecuteAtHours(2);
        await toastConfigPage.fillDuration('2');
        await toastConfigPage.setScheduleStartDate();
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step1_form_filled');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid schedule').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the schedule was saved').toBeVisible({ timeout: 15000 });
        console.log('Schedule Save toast message:', await toastText.textContent());

        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Save').not.toBeVisible({ timeout: 20000 }).catch(() => {});

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step2_saved');
        console.log(`✅ TC-25 PASSED — ${selected.length} Active Months option(s) selected and schedule saved successfully.`);
    });

    test('TC-26 Verify Cancel closes the Schedule popup without saving', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await toastConfigPage.fillDuration('2');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step1_draft_filled');

        await toastConfigPage.clickCancel();
        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step2_popup_closed');
        console.log('Cancel closed the Schedule popup without saving.');
    });

    test('TC-27 Verify Save successfully creates the schedule', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await fillMandatoryScheduleFields(page, toastConfigPage);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step1_form_filled');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid schedule').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the schedule was saved').toBeVisible({ timeout: 15000 });
        console.log('Schedule Save toast message:', await toastText.textContent());

        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Save').not.toBeVisible({ timeout: 20000 }).catch(() => {});

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step2_saved');
        console.log(`✅ TC-27 PASSED — Schedule created successfully for "${createdName}".`);
    });

    test('TC-28 Verify multiple Active Days selections save successfully', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await toastConfigPage.selectActiveMonths(2);

        const activeDays = page.locator('#activeDays');
        const selected = await toastConfigPage.selectMultiSelectOptionsByCount(activeDays, 3);
        expect(selected.length, 'Expected at least one Active Days option to be selectable').toBeGreaterThan(0);

        const chipCount = await toastConfigPage.getMultiSelectChipCount(activeDays);
        expect(chipCount, 'Expected a chip for each selected Active Days option').toBe(selected.length);
        console.log(`Selected ${selected.length} Active Days option(s): ${selected.join(', ')} — ${chipCount} chip(s) shown.`);

        // Fill the rest of the mandatory fields so the schedule can actually be saved —
        // clicking Days Of Month dismisses the still-open Active Days panel first.
        await toastConfigPage.selectActiveDaysOfMonth(2);
        await toastConfigPage.fillExecuteAtMinute('30');
        await toastConfigPage.selectExecuteAtHours(2);
        await toastConfigPage.fillDuration('2');
        await toastConfigPage.setScheduleStartDate();
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step1_form_filled');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid schedule').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the schedule was saved').toBeVisible({ timeout: 15000 });
        console.log('Schedule Save toast message:', await toastText.textContent());

        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Save').not.toBeVisible({ timeout: 20000 }).catch(() => {});

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step2_saved');
        console.log(`✅ TC-28 PASSED — ${selected.length} Active Days option(s) selected and schedule saved successfully.`);
    });

    test('TC-29 Verify multiple Days Of Month selections save successfully', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await toastConfigPage.selectActiveMonths(2);
        await toastConfigPage.selectActiveDays(2);

        const daysOfMonth = page.locator('#activeDaysOfMonth');
        const selected = await toastConfigPage.selectMultiSelectOptionsByCount(daysOfMonth, 3);
        expect(selected.length, 'Expected at least one Days Of Month option to be selectable').toBeGreaterThan(0);

        const chipCount = await toastConfigPage.getMultiSelectChipCount(daysOfMonth);
        expect(chipCount, 'Expected a chip for each selected Days Of Month option').toBe(selected.length);
        console.log(`Selected ${selected.length} Days Of Month option(s): ${selected.join(', ')} — ${chipCount} chip(s) shown.`);

        // Fill the rest of the mandatory fields so the schedule can actually be saved —
        // clicking Execute At Minute dismisses the still-open Days Of Month panel first.
        await toastConfigPage.fillExecuteAtMinute('30');
        await toastConfigPage.selectExecuteAtHours(2);
        await toastConfigPage.fillDuration('2');
        await toastConfigPage.setScheduleStartDate();
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step1_form_filled');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid schedule').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the schedule was saved').toBeVisible({ timeout: 15000 });
        console.log('Schedule Save toast message:', await toastText.textContent());

        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Save').not.toBeVisible({ timeout: 20000 }).catch(() => {});

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step2_saved');
        console.log(`✅ TC-29 PASSED — ${selected.length} Days Of Month option(s) selected and schedule saved successfully.`);
    });

    test('TC-30 Verify multiple Execute At Hour selections save successfully', async ({ page, toastConfigPage }, testInfo) => {
        await openScheduleForToastConfig(toastConfigPage, REGION, createdName!);

        await toastConfigPage.selectActiveMonths(2);
        await toastConfigPage.selectActiveDays(2);
        await toastConfigPage.selectActiveDaysOfMonth(2);
        await toastConfigPage.fillExecuteAtMinute('30');

        const executeAtHour = page.locator('#startingHours');
        const selected = await toastConfigPage.selectMultiSelectOptionsByCount(executeAtHour, 3);
        expect(selected.length, 'Expected at least one Execute At Hour option to be selectable').toBeGreaterThan(0);

        // Click Duration In Hours to close the Execute At Hour dropdown, per explicit instruction —
        // this also fills the rest of the mandatory fields so the schedule can be saved.
        await toastConfigPage.fillDuration('2');

        const chipCount = await toastConfigPage.getMultiSelectChipCount(executeAtHour);
        expect(chipCount, 'Expected a chip for each selected Execute At Hour option').toBe(selected.length);
        console.log(`Selected ${selected.length} Execute At Hour option(s): ${selected.join(', ')} — ${chipCount} chip(s) shown.`);

        await toastConfigPage.setScheduleStartDate();
        await page.waitForTimeout(500);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step1_form_filled');

        await expect(toastConfigPage.saveBtn, 'Expected Save to be enabled with a valid schedule').toBeEnabled({ timeout: 10000 });
        await toastConfigPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the schedule was saved').toBeVisible({ timeout: 15000 });
        console.log('Schedule Save toast message:', await toastText.textContent());

        await expect(toastConfigPage.popupDialog, 'Expected the Schedule popup to close after Save').not.toBeVisible({ timeout: 20000 }).catch(() => {});

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step2_saved');
        console.log(`✅ TC-30 PASSED — ${selected.length} Execute At Hour option(s) selected and schedule saved successfully.`);
    });
});
