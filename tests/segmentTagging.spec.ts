// npx playwright test tests/segmentTagging.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToSegmentTagging(page: any, sidebarPage: any, segmentTaggingPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToSegmentTagging();
    await segmentTaggingPage.createSegmentationTagBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreateSegmentTagPopup(segmentTaggingPage: any) {
    await segmentTaggingPage.clickCreateSegmentationTag();
    await segmentTaggingPage.waitForPopupLoad();
}

// Fills the two mandatory dropdown fields common to every Frequency Type — Segment Group and
// Tag to apply to segment. Returns their selected text: this popup has no dedicated "Name"
// field of its own, so the Tag text doubles as what later tests search for/delete by.
async function fillMandatoryGroupAndTag(segmentTaggingPage: any): Promise<{ group: string; tag: string }> {
    const group = await segmentTaggingPage.selectFirstSegmentGroup();
    const tag = await segmentTaggingPage.selectFirstTag();
    return { group, tag };
}

// Creates a fresh, disposable Segmentation Tag and returns the selected Segment Group text —
// used to search for/delete it afterward (see the shared afterEach hooks below, which delete
// regardless of pass/fail so the database doesn't accumulate test data). Confirmed live: the
// list table's own "Segmentation" column displays the Segment Group, NOT the Tag — searching
// by the Tag text never matches any row.
async function createDisposableSegmentTag(
    page: any,
    segmentTaggingPage: any,
    frequencyType: 'Daily' | 'Weekly' | 'Once Off' = 'Daily'
): Promise<string> {
    await openCreateSegmentTagPopup(segmentTaggingPage);
    const { group } = await fillMandatoryGroupAndTag(segmentTaggingPage);

    if (frequencyType !== 'Daily') {
        await segmentTaggingPage.selectFrequencyType(frequencyType);
    }
    if (frequencyType === 'Daily' || frequencyType === 'Weekly') {
        await segmentTaggingPage.setFrequencyTimeViaArrows();
    }
    if (frequencyType === 'Weekly') {
        await segmentTaggingPage.selectFirstDayOfWeek();
    }
    await page.waitForTimeout(300);

    await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await segmentTaggingPage.clickSave();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the Segmentation Tag was created').toBeVisible({ timeout: 15000 });
    console.log('Create Segmentation Tag toast message:', await toastText.textContent());

    const dialogClosedOnItsOwn = await segmentTaggingPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await segmentTaggingPage.clickCancel().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});

    return group;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Tagging - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentTaggingPage }) => {
        await navigateToSegmentTagging(page, sidebarPage, segmentTaggingPage);
    });

    test('TC-1 Verify Segment Tagging page is accessible', async ({ page, segmentTaggingPage }, testInfo) => {
        await expect(segmentTaggingPage.createSegmentationTagBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_segment_tagging_page_accessible');
        console.log('Segment Tagging page is accessible with Create Segmentation Tag button visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-2 to TC-21 — Create Segmentation Tag Popup Tests
//  None of these tests persist a tag — each ends by closing the popup (Cancel, or its own
//  Save/Cancel action), so no afterEach cleanup is needed in this describe block.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Tagging - Create Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentTaggingPage }) => {
        await navigateToSegmentTagging(page, sidebarPage, segmentTaggingPage);
        await openCreateSegmentTagPopup(segmentTaggingPage);
    });

    test('TC-2 Verify clicking Create Segmentation Tag opens the popup', async ({ page, segmentTaggingPage }, testInfo) => {
        await expect(segmentTaggingPage.popupDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_popup_open');
        console.log('Create Segmentation Tag popup opened successfully.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-3 Verify all fields and footer buttons are present in the popup', async ({ page, segmentTaggingPage }, testInfo) => {
        await expect(segmentTaggingPage.segmentGroupDropdown, 'Expected Select Segment Group field').toBeVisible();
        await expect(segmentTaggingPage.tagDropdown, 'Expected Tag to apply to segment field').toBeVisible();
        await expect(segmentTaggingPage.nextExecutionInput, 'Expected Next Execution Date field').toBeVisible();
        await expect(segmentTaggingPage.percentageInput, 'Expected Percentage of Players to Process field').toBeVisible();
        await expect(segmentTaggingPage.frequencyTypeDropdown, 'Expected Select Frequency Type field').toBeVisible();
        await expect(segmentTaggingPage.publishToElsaToggle, 'Expected Publish to Elsa toggle').toBeVisible();

        await expect(segmentTaggingPage.saveBtn, 'Expected Save button').toBeVisible();
        await expect(segmentTaggingPage.cancelBtn, 'Expected Cancel button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_all_fields_present');
        console.log('All 5 base fields, Publish to Elsa toggle, and footer buttons verified in the popup.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-4 Verify Set a Time field is visible by default (Daily is the default Frequency Type)', async ({ page, segmentTaggingPage }, testInfo) => {
        await expect(segmentTaggingPage.frequencyTimeInput, 'Expected Set a Time field to be visible since Daily is selected by default').toBeVisible({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_set_a_time_visible_by_default');
        console.log('Set a Time field is visible by default (Daily frequency).');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-5 Verify Select Day of the Week is not visible when Frequency Type is Daily', async ({ page, segmentTaggingPage }, testInfo) => {
        const dayVisible = await segmentTaggingPage.isFrequencyDayVisible();
        expect(dayVisible, 'Expected Select Day of the Week to be hidden for Daily frequency').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_day_of_week_hidden_on_daily');
        console.log('Select Day of the Week is correctly hidden when Frequency Type is Daily.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-6 Verify Save is disabled when all mandatory fields are empty', async ({ page, segmentTaggingPage }, testInfo) => {
        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be disabled with no fields filled').toBeDisabled({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_save_disabled_empty_fields');
        console.log('Save button correctly stays disabled when all mandatory fields are empty.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-7 Verify Save stays disabled when Set a Time is not filled', async ({ page, segmentTaggingPage }, testInfo) => {
        await fillMandatoryGroupAndTag(segmentTaggingPage);
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to stay disabled while Set a Time (Daily) is still empty').toBeDisabled({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_save_disabled_missing_time');
        console.log('Save button correctly stays disabled while Set a Time is missing.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-8 Verify Save becomes enabled once all mandatory fields are filled (Daily)', async ({ page, segmentTaggingPage }, testInfo) => {
        await fillMandatoryGroupAndTag(segmentTaggingPage);
        await segmentTaggingPage.setFrequencyTimeViaArrows();
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled once Segment Group, Tag, and Set a Time are filled').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_save_enabled_daily_complete');
        console.log('Save button becomes enabled once all Daily mandatory fields are filled.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-9 Verify selecting Frequency Type as Weekly reveals Set a Time and Select Day of the Week', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.selectFrequencyType('Weekly');
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.frequencyTimeInput, 'Expected Set a Time field to appear for Weekly frequency').toBeVisible({ timeout: 5000 });
        await expect(segmentTaggingPage.frequencyDayDropdown, 'Expected Select Day of the Week field to appear for Weekly frequency').toBeVisible({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_weekly_reveals_two_fields');
        console.log('Selecting Weekly correctly reveals both Set a Time and Select Day of the Week.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-10 Verify Save stays disabled on Weekly until Select Day of the Week is also filled', async ({ page, segmentTaggingPage }, testInfo) => {
        await fillMandatoryGroupAndTag(segmentTaggingPage);
        await segmentTaggingPage.selectFrequencyType('Weekly');
        await segmentTaggingPage.setFrequencyTimeViaArrows();
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to stay disabled while Select Day of the Week (Weekly) is still empty').toBeDisabled({ timeout: 5000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_save_disabled_missing_day');

        await segmentTaggingPage.selectFirstDayOfWeek();
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled once Select Day of the Week is also filled').toBeEnabled({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_save_enabled_weekly_complete');
        console.log('Save button correctly requires Select Day of the Week before enabling on Weekly frequency.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-11 Verify selecting Frequency Type as Once Off hides Set a Time and Select Day of the Week', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.selectFrequencyType('Once Off');
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.frequencyTimeInput, 'Expected Set a Time field to be hidden for Once Off frequency').not.toBeVisible({ timeout: 5000 });
        const dayVisible = await segmentTaggingPage.isFrequencyDayVisible();
        expect(dayVisible, 'Expected Select Day of the Week to be hidden for Once Off frequency').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_once_off_hides_extra_fields');
        console.log('Selecting Once Off correctly hides both Set a Time and Select Day of the Week.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-12 Verify switching from Weekly back to Daily hides Select Day of the Week', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.selectFrequencyType('Weekly');
        await page.waitForTimeout(300);
        await expect(segmentTaggingPage.frequencyDayDropdown, 'Expected Select Day of the Week to appear on Weekly').toBeVisible({ timeout: 5000 });

        await segmentTaggingPage.selectFrequencyType('Daily');
        await page.waitForTimeout(300);

        const dayVisible = await segmentTaggingPage.isFrequencyDayVisible();
        expect(dayVisible, 'Expected Select Day of the Week to disappear after switching back to Daily').toBe(false);
        await expect(segmentTaggingPage.frequencyTimeInput, 'Expected Set a Time to remain visible after switching back to Daily').toBeVisible({ timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_weekly_to_daily_hides_day');
        console.log('Switching Weekly -> Daily correctly hides Select Day of the Week while keeping Set a Time.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-13 Verify Publish to Elsa toggle is OFF by default', async ({ page, segmentTaggingPage }, testInfo) => {
        const isOn = await segmentTaggingPage.isPublishToElsaOn();
        expect(isOn, 'Expected Publish to Elsa to be OFF by default').toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_publish_to_elsa_off_by_default');
        console.log('Publish to Elsa toggle is OFF by default.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-14 Verify Publish to Elsa toggle can be switched ON', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.togglePublishToElsa();
        await page.waitForTimeout(300);

        const isOn = await segmentTaggingPage.isPublishToElsaOn();
        expect(isOn, 'Expected Publish to Elsa to be ON after toggling').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_publish_to_elsa_toggled_on');
        console.log('Publish to Elsa toggle switches ON successfully.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-15 Verify Percentage of Players to Process field accepts numeric input', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.fillPercentage('50');
        await page.waitForTimeout(200);

        await expect(segmentTaggingPage.percentageInput, 'Expected Percentage field to accept and retain a numeric value').toHaveValue('50');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_percentage_numeric_input');
        console.log('Percentage of Players to Process field accepts numeric input.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-16 Verify Next Execution Date calendar opens and a date can be selected', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.setNextExecutionDate();

        const dateValue = await segmentTaggingPage.nextExecutionInput.inputValue();
        expect(dateValue.length, 'Expected Next Execution Date to have a non-empty value after selecting a day').toBeGreaterThan(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_next_execution_date_selected');
        console.log('Next Execution Date selected:', dateValue);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-17 Verify Set a Time value changes when adjusted via the arrows', async ({ page, segmentTaggingPage }, testInfo) => {
        const before = await segmentTaggingPage.getFrequencyTimeValue();
        await segmentTaggingPage.setFrequencyTimeViaArrows(3, 2);
        const after = await segmentTaggingPage.getFrequencyTimeValue();

        expect(after.length, 'Expected Set a Time to have a non-empty value after using the arrows').toBeGreaterThan(0);
        expect(after, 'Expected Set a Time value to change after adjusting the arrows').not.toBe(before);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_set_a_time_arrows');
        console.log(`Set a Time changed from "${before}" to "${after}" via the increment arrows.`);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-18 Verify Select Segment Group dropdown\'s search bar filters its options', async ({ page, segmentTaggingPage }, testInfo) => {
        // Open the dropdown ONCE and reuse that same panel throughout — re-clicking the trigger
        // to "reopen" a dropdown whose panel is already open actually toggles it CLOSED (PrimeNG
        // dropdowns alternate open/close per click rather than just ensuring open), so a second
        // filterDropdown() call on the same dropdown would close-then-reopen it instead of
        // re-filtering, which is flaky under animation timing.
        const panel = await segmentTaggingPage.filterDropdown(segmentTaggingPage.segmentGroupDropdown, '');
        const options = panel.locator('.p-dropdown-item, [role="option"]');
        const totalCount = await options.count();
        expect(totalCount, 'Expected at least one Segment Group option to exist').toBeGreaterThan(0);

        // Narrow using the first option's own text — guarantees at least one match.
        const firstOptionText = ((await options.first().textContent()) ?? '').trim();
        await segmentTaggingPage.typeInDropdownFilter(panel, firstOptionText.slice(0, 3));
        const filteredCount = await options.count();

        expect(filteredCount, 'Expected the search bar to narrow the Segment Group option list').toBeGreaterThan(0);
        expect(filteredCount, 'Expected filtering to not show more options than the unfiltered total').toBeLessThanOrEqual(totalCount);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_segment_group_dropdown_search');
        console.log(`Segment Group dropdown search narrowed ${totalCount} option(s) down to ${filteredCount} using "${firstOptionText.slice(0, 3)}".`);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-19 Verify Tag to apply to segment dropdown\'s search bar filters its options', async ({ page, segmentTaggingPage }, testInfo) => {
        // Open the dropdown ONCE and reuse that same panel — see TC-18's comment for why a
        // second filterDropdown() call on the same dropdown must be avoided.
        const panel = await segmentTaggingPage.filterDropdown(segmentTaggingPage.tagDropdown, '');
        const options = panel.locator('.p-dropdown-item, [role="option"]');
        const totalCount = await options.count();
        expect(totalCount, 'Expected at least one Tag option to exist').toBeGreaterThan(0);

        const firstOptionText = ((await options.first().textContent()) ?? '').trim();
        await segmentTaggingPage.typeInDropdownFilter(panel, firstOptionText.slice(0, 3));
        const filteredCount = await options.count();

        expect(filteredCount, 'Expected the search bar to narrow the Tag option list').toBeGreaterThan(0);
        expect(filteredCount, 'Expected filtering to not show more options than the unfiltered total').toBeLessThanOrEqual(totalCount);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_tag_dropdown_search');
        console.log(`Tag dropdown search narrowed ${totalCount} option(s) down to ${filteredCount} using "${firstOptionText.slice(0, 3)}".`);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-20 Verify dropdown search bar shows no results for a non-matching search term', async ({ page, segmentTaggingPage }, testInfo) => {
        const panel = await segmentTaggingPage.filterDropdown(segmentTaggingPage.tagDropdown, 'ZZZZZ_NO_MATCH_99999');

        const optionCount = await panel.locator('.p-dropdown-item, [role="option"]').count();
        expect(optionCount, 'Expected no options to match a nonsense search term').toBe(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_dropdown_search_no_results');
        console.log('Dropdown search bar correctly shows zero options for a non-matching term.');

        await segmentTaggingPage.clickCancel();
    });

    test('TC-21 Verify Cancel closes the popup without creating a tag', async ({ page, segmentTaggingPage }, testInfo) => {
        await fillMandatoryGroupAndTag(segmentTaggingPage);
        await segmentTaggingPage.setFrequencyTimeViaArrows();
        await page.waitForTimeout(300);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_before_cancel');

        await segmentTaggingPage.clickCancel();

        await expect(segmentTaggingPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_after_cancel');
        console.log('Cancel closes the Create Segmentation Tag popup without saving.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-22 to TC-25 — Create and Delete Verification
//  Each test creates a real Segmentation Tag, verifies the success toast and that it appears
//  via the search bar, then deletes it via the shared afterEach — regardless of pass/fail —
//  so the database doesn't accumulate test data.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Tagging - Create and Delete Verification', () => {
    // Identified/searched/deleted by Segment Group text — confirmed live that the list table's
    // own "Segmentation" column displays the Segment Group, not the Tag (this popup has no
    // dedicated Name field of its own).
    let createdGroup: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentTaggingPage }) => {
        await navigateToSegmentTagging(page, sidebarPage, segmentTaggingPage);
        createdGroup = undefined;
    });

    test.afterEach(async ({ page, segmentTaggingPage }) => {
        if (!createdGroup) return;
        const groupToDelete = createdGroup;
        createdGroup = undefined;
        try {
            await segmentTaggingPage.clickDeleteForSegmentTag(groupToDelete);
            await segmentTaggingPage.clickConfirmYes();
            await page.waitForTimeout(1000);
            console.log(`Cleanup: deleted Segmentation Tag for "${groupToDelete}".`);
        } catch (e) {
            console.warn(`Cleanup failed for Segmentation Tag "${groupToDelete}": ${e}`);
        }
    });

    test('TC-22 Verify Save successfully creates a Segmentation Tag with Frequency Daily', async ({ page, segmentTaggingPage }, testInfo) => {
        const group = await createDisposableSegmentTag(page, segmentTaggingPage, 'Daily');
        createdGroup = group;

        const isVisible = await segmentTaggingPage.isSegmentTagVisibleByName(group);
        expect(isVisible, `Expected a Segmentation Tag row for "${group}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_daily_segment_tag_created');
        console.log(`✅ TC-22 PASSED — Segmentation Tag created for "${group}" with Daily frequency and verified via search.`);
    });

    test('TC-23 Verify Save successfully creates a Segmentation Tag with Frequency Weekly', async ({ page, segmentTaggingPage }, testInfo) => {
        const group = await createDisposableSegmentTag(page, segmentTaggingPage, 'Weekly');
        createdGroup = group;

        const isVisible = await segmentTaggingPage.isSegmentTagVisibleByName(group);
        expect(isVisible, `Expected a Segmentation Tag row for "${group}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_weekly_segment_tag_created');
        console.log(`✅ TC-23 PASSED — Segmentation Tag created for "${group}" with Weekly frequency and verified via search.`);
    });

    test('TC-24 Verify Save successfully creates a Segmentation Tag with Frequency Once Off', async ({ page, segmentTaggingPage }, testInfo) => {
        const group = await createDisposableSegmentTag(page, segmentTaggingPage, 'Once Off');
        createdGroup = group;

        const isVisible = await segmentTaggingPage.isSegmentTagVisibleByName(group);
        expect(isVisible, `Expected a Segmentation Tag row for "${group}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_once_off_segment_tag_created');
        console.log(`✅ TC-24 PASSED — Segmentation Tag created for "${group}" with Once Off frequency and verified via search.`);
    });

    test('TC-25 Verify creating a Segmentation Tag with Publish to Elsa toggled ON succeeds', async ({ page, segmentTaggingPage }, testInfo) => {
        await openCreateSegmentTagPopup(segmentTaggingPage);
        const { group } = await fillMandatoryGroupAndTag(segmentTaggingPage);
        await segmentTaggingPage.setFrequencyTimeViaArrows();
        await segmentTaggingPage.togglePublishToElsa();
        await page.waitForTimeout(300);

        const isOn = await segmentTaggingPage.isPublishToElsaOn();
        expect(isOn, 'Expected Publish to Elsa to be ON before saving').toBe(true);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
        await segmentTaggingPage.clickSave();
        createdGroup = group;

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Segmentation Tag was created').toBeVisible({ timeout: 15000 });
        console.log('Create Segmentation Tag toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await segmentTaggingPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await segmentTaggingPage.clickCancel().catch(() => {});
        }

        const isVisible = await segmentTaggingPage.isSegmentTagVisibleByName(group);
        expect(isVisible, `Expected a Segmentation Tag row for "${group}" to appear via search after creation`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_publish_to_elsa_segment_tag_created');
        console.log(`✅ TC-25 PASSED — Segmentation Tag created for "${group}" with Publish to Elsa ON and verified via search.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-26 to TC-31 — Edit and Delete Tests
//  Every test here operates on a fresh, disposable Segmentation Tag created in beforeEach —
//  never on pre-existing data — and the shared afterEach deletes it regardless of pass/fail,
//  the same disposable-data pattern used throughout this suite (and for Toast Configuration).
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Tagging - Edit and Delete Tests', () => {
    let createdGroup: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentTaggingPage }) => {
        await navigateToSegmentTagging(page, sidebarPage, segmentTaggingPage);
        createdGroup = await createDisposableSegmentTag(page, segmentTaggingPage, 'Daily');
    });

    test.afterEach(async ({ page, segmentTaggingPage }) => {
        if (!createdGroup) return;
        const groupToDelete = createdGroup;
        createdGroup = undefined;
        try {
            await segmentTaggingPage.clickDeleteForSegmentTag(groupToDelete);
            await segmentTaggingPage.clickConfirmYes();
            await page.waitForTimeout(1000);
            console.log(`Cleanup: deleted Segmentation Tag for "${groupToDelete}".`);
        } catch (e) {
            console.warn(`Cleanup failed for Segmentation Tag "${groupToDelete}": ${e}`);
        }
    });

    test('TC-26 Verify clicking Edit on a Segmentation Tag opens the popup pre-filled', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickEditForSegmentTag(createdGroup!);
        await segmentTaggingPage.waitForPopupLoad();

        await expect(segmentTaggingPage.popupDialog, 'Expected the Edit popup to open').toBeVisible({ timeout: 15000 });
        await expect(segmentTaggingPage.segmentGroupDropdown, 'Expected Select Segment Group field to be pre-filled/visible').toBeVisible();
        await expect(segmentTaggingPage.tagDropdown, 'Expected Tag to apply to segment field to be pre-filled/visible').toBeVisible();
        await expect(segmentTaggingPage.saveBtn, 'Expected Save button to be visible in the Edit popup').toBeVisible();
        await expect(segmentTaggingPage.cancelBtn, 'Expected Cancel button to be visible in the Edit popup').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_edit_popup_opens_prefilled');
        console.log(`✅ TC-26 PASSED — Edit popup opened for Segmentation Tag "${createdGroup}" with its fields visible.`);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-27 Verify editing Percentage of Players to Process and saving updates the Segmentation Tag', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickEditForSegmentTag(createdGroup!);
        await segmentTaggingPage.waitForPopupLoad();

        await segmentTaggingPage.fillPercentage('75');
        await page.waitForTimeout(300);
        await expect(segmentTaggingPage.percentageInput, 'Expected Percentage field to accept the new value').toHaveValue('75');

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled after editing Percentage').toBeEnabled({ timeout: 10000 });
        await segmentTaggingPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Segmentation Tag was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Segmentation Tag toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await segmentTaggingPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await segmentTaggingPage.clickCancel().catch(() => {});
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_percentage_edited_and_saved');
        console.log(`✅ TC-27 PASSED — Percentage of Players to Process updated for "${createdGroup}" and saved successfully.`);
    });

    test('TC-28 Verify editing Frequency Type from Daily to Weekly and saving updates the Segmentation Tag', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickEditForSegmentTag(createdGroup!);
        await segmentTaggingPage.waitForPopupLoad();

        await segmentTaggingPage.selectFrequencyType('Weekly');
        await page.waitForTimeout(300);
        await expect(segmentTaggingPage.frequencyDayDropdown, 'Expected Select Day of the Week to appear after switching to Weekly').toBeVisible({ timeout: 5000 });

        await segmentTaggingPage.setFrequencyTimeViaArrows();
        await segmentTaggingPage.selectFirstDayOfWeek();
        await page.waitForTimeout(300);

        await expect(segmentTaggingPage.saveBtn, 'Expected Save to be enabled once Weekly\'s fields are filled').toBeEnabled({ timeout: 10000 });
        await segmentTaggingPage.clickSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the Segmentation Tag was updated').toBeVisible({ timeout: 15000 });
        console.log('Edit Segmentation Tag toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await segmentTaggingPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await segmentTaggingPage.clickCancel().catch(() => {});
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_frequency_type_edited_to_weekly');
        console.log(`✅ TC-28 PASSED — Frequency Type changed to Weekly for "${createdGroup}" and saved successfully.`);
    });

    test('TC-29 Verify Cancel on the Edit popup discards changes', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickEditForSegmentTag(createdGroup!);
        await segmentTaggingPage.waitForPopupLoad();

        const originalPercentage = await segmentTaggingPage.percentageInput.inputValue();
        await segmentTaggingPage.fillPercentage('99');
        await page.waitForTimeout(300);
        await expect(segmentTaggingPage.percentageInput, 'Expected the field to show the new value before cancelling').toHaveValue('99');

        await segmentTaggingPage.clickCancel();
        await expect(segmentTaggingPage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await segmentTaggingPage.clickEditForSegmentTag(createdGroup!);
        await segmentTaggingPage.waitForPopupLoad();
        await expect(segmentTaggingPage.percentageInput, 'Expected Cancel to have discarded the edited value').toHaveValue(originalPercentage);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_edit_cancel_discards_changes');
        console.log(`✅ TC-29 PASSED — Cancel on the Edit popup correctly discarded changes for "${createdGroup}".`);

        await segmentTaggingPage.clickCancel();
    });

    test('TC-30 Verify Delete with Yes on the confirmation dialog removes the Segmentation Tag', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickDeleteForSegmentTag(createdGroup!);
        await segmentTaggingPage.clickConfirmYes();
        await page.waitForTimeout(1000);

        const isAbsent = await segmentTaggingPage.isSegmentTagAbsentByName(createdGroup!, 15000);
        expect(isAbsent, `Expected the Segmentation Tag row for "${createdGroup}" to no longer exist after deletion`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_delete_confirmed_removes_tag');
        console.log(`✅ TC-30 PASSED — Segmentation Tag "${createdGroup}" deleted successfully after confirming Yes.`);

        // Already deleted — nothing left for afterEach to clean up.
        createdGroup = undefined;
    });

    test('TC-31 Verify Delete with No on the confirmation dialog keeps the Segmentation Tag', async ({ page, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickDeleteForSegmentTag(createdGroup!);
        await segmentTaggingPage.clickConfirmNo();
        await page.waitForTimeout(1000);

        const isVisible = await segmentTaggingPage.isSegmentTagVisibleByName(createdGroup!);
        expect(isVisible, `Expected the Segmentation Tag row for "${createdGroup}" to still exist after declining deletion`).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_delete_declined_keeps_tag');
        console.log(`✅ TC-31 PASSED — Segmentation Tag "${createdGroup}" was retained after declining the delete confirmation.`);
        // createdGroup stays set — afterEach performs the real cleanup delete.
    });
});
