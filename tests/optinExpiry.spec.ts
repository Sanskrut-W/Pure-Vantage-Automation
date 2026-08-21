// npx playwright test tests/optinExpiry.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToOptInExpiry(page: any, sidebarPage: any, optinExpiryPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToOptInExpiry();
    await optinExpiryPage.createBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreatePopup(optinExpiryPage: any) {
    await optinExpiryPage.clickCreateOptIn();
    await optinExpiryPage.waitForPopupLoad();
}

// Fills the two confirmed-mandatory fields (Name *, Expiry Type *) — Description is optional and
// left untouched. Expiry Day of the Week / Expiry Date carry no asterisk in the live HTML, so
// they're filled separately by callers that need them, never assumed mandatory here.
async function fillMandatoryFields(optinExpiryPage: any, name: string, expiryType: 'End of Day' | 'End of Week' | 'End of Month' | 'Date Time') {
    await optinExpiryPage.fillName(name);
    await optinExpiryPage.selectExpiryType(expiryType);
}

// Creates a real Opt-In with a unique, automation-generated name — used afterward to search
// for/delete it (see the shared afterEach hooks below, which delete regardless of pass/fail so
// the database doesn't accumulate test data).
async function createOptIn(page: any, optinExpiryPage: any, name: string, expiryType: 'End of Day' | 'End of Week' | 'End of Month' | 'Date Time') {
    await openCreatePopup(optinExpiryPage);
    await fillMandatoryFields(optinExpiryPage, name, expiryType);

    if (expiryType === 'End of Week') {
        await optinExpiryPage.selectFirstExpiryDayOfWeek();
    } else if (expiryType === 'Date Time') {
        await optinExpiryPage.setExpiryDateTime();
    }
    await page.waitForTimeout(300);

    await expect(optinExpiryPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await optinExpiryPage.clickSave();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the Opt-In was created').toBeVisible({ timeout: 15000 });
    console.log('Create Opt-In toast message:', await toastText.textContent());

    const dialogClosedOnItsOwn = await optinExpiryPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await optinExpiryPage.clickCancel().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Opt In Expiry - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, optinExpiryPage }) => {
        await navigateToOptInExpiry(page, sidebarPage, optinExpiryPage);
    });

    test('TC-1 Verify Opt In Expiry page is accessible', async ({ page, optinExpiryPage }, testInfo) => {
        await expect(optinExpiryPage.createBtn, 'Expected Create Opt-In button').toBeVisible();
        await expect(optinExpiryPage.searchInput, 'Expected search bar').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_optin_expiry_page_accessible');
        console.log('Opt In Expiry page is accessible with all key elements visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-2 to TC-3 — Search Tests
//  TC-3 creates a real disposable entry to search for — deleted in this block's own afterEach
//  regardless of pass/fail.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Opt In Expiry - Search Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, optinExpiryPage }) => {
        await navigateToOptInExpiry(page, sidebarPage, optinExpiryPage);
        createdName = undefined;
    });

    test.afterEach(async ({ optinExpiryPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        await optinExpiryPage.deleteOptInIfPresent(nameToDelete);
    });

    test('TC-2 Verify search bar shows no results for a non-matching term', async ({ page, optinExpiryPage }, testInfo) => {
        await optinExpiryPage.searchOptIn('ZZZZZ_NO_MATCH_99999');

        const rowCount = await optinExpiryPage.getRowCount();
        expect(rowCount, 'Expected no rows to match a nonsense search term').toBe(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_search_no_results');
        console.log('Search bar correctly shows zero rows for a non-matching term.');
    });

    test('TC-3 Verify search bar filters the table down to a matching Opt-In name', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Day');
        createdName = name;

        const isVisible = await optinExpiryPage.isOptInVisibleByName(name);
        expect(isVisible, `Expected search for "${name}" to return the created row`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_search_filters_by_name');
        console.log(`✅ TC-3 PASSED — Search bar correctly filtered the table down to "${name}".`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-4 to TC-14 — Create Popup Tests
//  None of these tests persist an Opt-In — each ends by closing the popup (Cancel), so no
//  cleanup is needed in this describe block.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Opt In Expiry - Create Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, optinExpiryPage }) => {
        await navigateToOptInExpiry(page, sidebarPage, optinExpiryPage);
        await openCreatePopup(optinExpiryPage);
    });

    test('TC-4 Verify clicking Create Opt-In opens the popup with all 3 fields and 2 checkboxes', async ({ page, optinExpiryPage }, testInfo) => {
        await expect(optinExpiryPage.popupDialog, 'Expected the popup to open').toBeVisible({ timeout: 15000 });

        await expect(optinExpiryPage.nameInput, 'Expected Name field').toBeVisible();
        await expect(optinExpiryPage.descriptionInput, 'Expected Description field').toBeVisible();
        await expect(optinExpiryPage.expiryTypeDropdown, 'Expected Expiry Type field').toBeVisible();
        await expect(optinExpiryPage.isActiveCheckbox, 'Expected Is Active checkbox').toBeVisible();
        await expect(optinExpiryPage.isInternalOnlyCheckbox, 'Expected Is Internal Only checkbox').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_create_popup_fields');
        console.log('Create Opt-In popup opens with all 3 core fields and 2 checkboxes.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-5 Verify Save is disabled when all mandatory fields are empty', async ({ page, optinExpiryPage }, testInfo) => {
        await expect(optinExpiryPage.saveBtn, 'Expected Save to be disabled with no fields filled').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_save_disabled_empty');
        console.log('Save stays disabled while Name and Expiry Type are empty.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-6 Verify checkbox default states — Is Active defaults ON, Is Internal Only defaults OFF', async ({ page, optinExpiryPage }, testInfo) => {
        expect(await optinExpiryPage.isActiveChecked(), 'Expected Is Active to default ON').toBe(true);
        expect(await optinExpiryPage.isInternalOnlyChecked(), 'Expected Is Internal Only to default OFF').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_checkbox_defaults');
        console.log('Is Active defaults ON and Is Internal Only defaults OFF.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-7 Verify Is Active and Is Internal Only checkboxes can each be toggled on/off', async ({ page, optinExpiryPage }, testInfo) => {
        await optinExpiryPage.toggleIsActive();
        expect(await optinExpiryPage.isActiveChecked(), 'Expected Is Active to turn OFF after toggling').toBe(false);
        await optinExpiryPage.toggleIsActive();
        expect(await optinExpiryPage.isActiveChecked(), 'Expected Is Active to turn back ON after toggling again').toBe(true);

        await optinExpiryPage.toggleIsInternalOnly();
        expect(await optinExpiryPage.isInternalOnlyChecked(), 'Expected Is Internal Only to turn ON after toggling').toBe(true);
        await optinExpiryPage.toggleIsInternalOnly();
        expect(await optinExpiryPage.isInternalOnlyChecked(), 'Expected Is Internal Only to turn back OFF after toggling again').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_checkbox_toggle');
        console.log('Is Active and Is Internal Only both toggle on/off correctly.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-8 Verify Expiry Type dropdown offers End of Day, End of Week, End of Month and Date Time', async ({ page, optinExpiryPage }, testInfo) => {
        await optinExpiryPage.selectExpiryType('End of Day');
        expect(await optinExpiryPage.getExpiryTypeValue(), 'Expected Expiry Type to show "End Of Day"').toContain('Day');

        await optinExpiryPage.selectExpiryType('End of Week');
        expect(await optinExpiryPage.getExpiryTypeValue(), 'Expected Expiry Type to show "End Of Week"').toContain('Week');

        await optinExpiryPage.selectExpiryType('End of Month');
        expect(await optinExpiryPage.getExpiryTypeValue(), 'Expected Expiry Type to show "End Of Month"').toContain('Month');

        await optinExpiryPage.selectExpiryType('Date Time');
        expect(await optinExpiryPage.getExpiryTypeValue(), 'Expected Expiry Type to show "Date Time"').toContain('Date');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_expiry_type_options');
        console.log('All 4 Expiry Type options (End of Day, End of Week, End of Month, Date Time) are selectable.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-9 Verify selecting "End of Week" reveals the Expiry Day of the Week field', async ({ page, optinExpiryPage }, testInfo) => {
        await expect(optinExpiryPage.expiryDayOfWeekDropdown, 'Expected Expiry Day of the Week to be hidden before End of Week is selected').not.toBeVisible();

        await optinExpiryPage.selectExpiryType('End of Week');
        await expect(optinExpiryPage.expiryDayOfWeekDropdown, 'Expected Expiry Day of the Week field to appear').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_end_of_week_reveals_day_field');
        console.log('Selecting "End of Week" reveals the Expiry Day of the Week field.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-10 Verify selecting "Date Time" reveals the Expiry Date field', async ({ page, optinExpiryPage }, testInfo) => {
        await expect(optinExpiryPage.expiryDateTimeInput, 'Expected Expiry Date to be hidden before Date Time is selected').not.toBeVisible();

        await optinExpiryPage.selectExpiryType('Date Time');
        await expect(optinExpiryPage.expiryDateTimeInput, 'Expected Expiry Date field to appear').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_date_time_reveals_date_field');
        console.log('Selecting "Date Time" reveals the Expiry Date field.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-11 Verify Save stays disabled until Name and Expiry Type are both filled', async ({ page, optinExpiryPage }, testInfo) => {
        await optinExpiryPage.fillName(`OptInExpiry_${Date.now()}`);
        await page.waitForTimeout(200);
        await expect(optinExpiryPage.saveBtn, 'Expected Save to stay disabled with only Name filled').toBeDisabled();

        await optinExpiryPage.selectExpiryType('End of Day');
        await page.waitForTimeout(200);
        await expect(optinExpiryPage.saveBtn, 'Expected Save to become enabled once Expiry Type is also filled').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_mandatory_fields');
        console.log('Save stays disabled until both Name and Expiry Type are filled.');

        await optinExpiryPage.clickCancel();
    });

    test('TC-12 Verify Cancel closes the popup without creating an Opt-In', async ({ page, optinExpiryPage }, testInfo) => {
        await optinExpiryPage.fillName(`OptInExpiry_${Date.now()}`);
        await page.waitForTimeout(300);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_before_cancel');

        await optinExpiryPage.clickCancel();

        await expect(optinExpiryPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_after_cancel');
        console.log('Cancel closes the Create Opt-In popup without saving.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-13 to TC-16 — Create and Verify Tests
//  Each test creates a real Opt-In, verifies the success toast and that it appears via the
//  search bar, then the shared afterEach deletes it — regardless of pass/fail — so the database
//  doesn't accumulate test data.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Opt In Expiry - Create and Verify Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, optinExpiryPage }) => {
        await navigateToOptInExpiry(page, sidebarPage, optinExpiryPage);
        createdName = undefined;
    });

    test.afterEach(async ({ optinExpiryPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        await optinExpiryPage.deleteOptInIfPresent(nameToDelete);
    });

    test('TC-13 Verify Save successfully creates an Opt-In with Expiry Type "End of Day"', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Day');
        createdName = name;

        const isVisible = await optinExpiryPage.isOptInVisibleByName(name);
        expect(isVisible, `Expected an Opt-In row for "${name}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_end_of_day_created');
        console.log(`✅ TC-13 PASSED — Opt-In created for "${name}" (End of Day) and verified via search.`);
    });

    test('TC-14 Verify Save successfully creates an Opt-In with Expiry Type "End of Week"', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Week');
        createdName = name;

        const isVisible = await optinExpiryPage.isOptInVisibleByName(name);
        expect(isVisible, `Expected an Opt-In row for "${name}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_end_of_week_created');
        console.log(`✅ TC-14 PASSED — Opt-In created for "${name}" (End of Week) and verified via search.`);
    });

    test('TC-15 Verify Save successfully creates an Opt-In with Expiry Type "End of Month"', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Month');
        createdName = name;

        const isVisible = await optinExpiryPage.isOptInVisibleByName(name);
        expect(isVisible, `Expected an Opt-In row for "${name}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_end_of_month_created');
        console.log(`✅ TC-15 PASSED — Opt-In created for "${name}" (End of Month) and verified via search.`);
    });

    test('TC-16 Verify Save successfully creates an Opt-In with Expiry Type "Date Time"', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'Date Time');
        createdName = name;

        const isVisible = await optinExpiryPage.isOptInVisibleByName(name);
        expect(isVisible, `Expected an Opt-In row for "${name}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_date_time_created');
        console.log(`✅ TC-16 PASSED — Opt-In created for "${name}" (Date Time) and verified via search.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-17 to TC-18 — Edit Tests
//  Each test creates a real Opt-In, edits it, and verifies the change — then the shared afterEach
//  deletes it (by whichever name is current — renamed or original) regardless of pass/fail.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Opt In Expiry - Edit Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, optinExpiryPage }) => {
        await navigateToOptInExpiry(page, sidebarPage, optinExpiryPage);
        createdName = undefined;
    });

    test.afterEach(async ({ optinExpiryPage }) => {
        if (!createdName) return;
        const nameToDelete = createdName;
        createdName = undefined;
        await optinExpiryPage.deleteOptInIfPresent(nameToDelete);
    });

    // Confirmed live: unlike Description, the Name field is disabled in the Edit popup — an
    // Opt-In's Name can't be changed after creation, only set at create time.
    test('TC-17 Verify Name field is disabled when editing an Opt-In', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Day');
        createdName = name;

        await optinExpiryPage.clickEditForOptIn(name);
        await optinExpiryPage.waitForPopupLoad();

        await expect(optinExpiryPage.nameInput, 'Expected Name field to be disabled while editing').toBeDisabled();
        expect(await optinExpiryPage.nameInput.inputValue(), 'Expected Name field to retain its original value').toBe(name);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_name_disabled_on_edit');
        console.log(`✅ TC-17 PASSED — Name field is disabled and retains "${name}" when editing.`);

        await optinExpiryPage.clickCancel();
    });

    test('TC-18 Verify editing an Opt-In\'s Description persists the change', async ({ page, optinExpiryPage }, testInfo) => {
        const name = `OptInExpiry_${Date.now()}`;
        await createOptIn(page, optinExpiryPage, name, 'End of Day');
        createdName = name;

        await optinExpiryPage.clickEditForOptIn(name);
        await optinExpiryPage.waitForPopupLoad();

        const updatedDescription = `Updated description ${Date.now()}`;
        await optinExpiryPage.fillDescription(updatedDescription);
        await page.waitForTimeout(300);

        await expect(optinExpiryPage.saveBtn, 'Expected Save to be enabled after editing the Description').toBeEnabled({ timeout: 10000 });
        await optinExpiryPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Opt-In was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Opt-In toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await optinExpiryPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await optinExpiryPage.clickCancel().catch(() => {});
        }

        await optinExpiryPage.clickEditForOptIn(name);
        await optinExpiryPage.waitForPopupLoad();
        await expect(optinExpiryPage.descriptionInput, 'Expected Description to persist the updated value').toHaveValue(updatedDescription, { timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_edit_updates_description');
        console.log(`✅ TC-18 PASSED — Opt-In "${name}" Description updated and verified by reopening Edit.`);

        await optinExpiryPage.clickCancel();
    });
});
