// npx playwright test tests/segmentation.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Segmentation Feature Tests', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();
        // Confirms the sidebar actually rendered before navigating — reloads and
        // re-checks a few times if not, instead of failing on a half-loaded page.
        await sidebarPage.waitForAppReady();
        await sidebarPage.navigateToSegmentation();
    });

    test('TC-1 Verify Create Segment popup opens with all mandatory fields', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();

        // Mandatory fields, marked with "*" in the UI
        await expect(segmentationPage.segmentationNameInput).toBeVisible();
        await expect(segmentationPage.descriptionInput).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_create_segment_mandatory_fields');
    });

    test('TC-2 Verify Field dropdown opens successfully', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();

        await segmentationPage.openFieldDropdown();
        await expect(segmentationPage.dropdownItems.first()).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_field_dropdown_opens');
    });

    test('TC-3 Verify Field dropdown displays available fields', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();

        const fields = await segmentationPage.dropdownItems.allInnerTexts();
        for (const expectedField of ['A VG Deposit Amount LOCAL', 'Brand', 'First Name']) {
            expect(fields).toContain(expectedField);
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_field_dropdown_values');
    });

    test('TC-4 Verify Field dropdown search box narrows results', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();

        await segmentationPage.searchOpenDropdown('Deposit');
        const filtered = await segmentationPage.dropdownItems.allInnerTexts();

        expect(filtered.length).toBeGreaterThan(0);
        for (const field of filtered) {
            expect(field.toLowerCase()).toContain('deposit');
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_field_dropdown_search');
    });

    test('TC-5 Verify no results message for invalid Field search', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();

        await segmentationPage.searchOpenDropdown('zzzznonsensexyz');
        await expect(segmentationPage.dropdownNoResults).toHaveText('No results found');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_field_dropdown_no_results');
    });

    test('TC-6 Verify clearing the search restores the full Field list', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();

        const fullList = await segmentationPage.dropdownItems.allInnerTexts();
        await segmentationPage.searchOpenDropdown('Deposit');
        await segmentationPage.searchOpenDropdown('');
        const restoredList = await segmentationPage.dropdownItems.allInnerTexts();

        expect(restoredList.length).toBe(fullList.length);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_field_dropdown_clear_search');
    });

    test('TC-7 Verify selecting a Field populates the Field control', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();

        await segmentationPage.searchOpenDropdown('A VG Deposit Amount LOCAL');
        await segmentationPage.selectDropdownOption('A VG Deposit Amount LOCAL');

        await expect(segmentationPage.fieldDropdown).toContainText('A VG Deposit Amount LOCAL');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_field_selected');
    });

    test('TC-8 Verify Operator dropdown opens and displays valid operators', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();
        await segmentationPage.searchOpenDropdown('A VG Deposit Amount LOCAL');
        await segmentationPage.selectDropdownOption('A VG Deposit Amount LOCAL');

        await segmentationPage.openOperatorDropdown();
        const operators = await segmentationPage.dropdownItems.allInnerTexts();

        for (const expectedOperator of ['Equal To', 'Not Equal To', 'Contains']) {
            expect(operators).toContain(expectedOperator);
        }

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_operator_dropdown_values');
    });

    test('TC-9 Verify selecting Contains operator populates the Operator control', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();
        await segmentationPage.openFieldDropdown();
        await segmentationPage.searchOpenDropdown('A VG Deposit Amount LOCAL');
        await segmentationPage.selectDropdownOption('A VG Deposit Amount LOCAL');

        await segmentationPage.openOperatorDropdown();
        await segmentationPage.selectDropdownOption('Contains');

        await expect(segmentationPage.operatorDropdown).toContainText('Contains');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_operator_selected');
    });

    // Live-verified finding: the operator list is identical for a numeric field ("A VG Deposit
    // Amount LOCAL") and a genuinely textual one ("First Name") — both offer the same 7 operators
    // (Equal To, Not Equal To, Greater Then, Less Then, Contains, Greater/Less then or equal to).
    // This app does NOT filter operators by field type, unlike what's commonly assumed.
    test('TC-10 Verify Operator list is the same regardless of Field type', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();

        await segmentationPage.openFieldDropdown();
        await segmentationPage.searchOpenDropdown('A VG Deposit Amount LOCAL');
        await segmentationPage.selectDropdownOption('A VG Deposit Amount LOCAL');
        await segmentationPage.openOperatorDropdown();
        const numericFieldOperators = (await segmentationPage.dropdownItems.allInnerTexts()).sort();
        await page.keyboard.press('Escape');

        await segmentationPage.openFieldDropdown();
        await segmentationPage.searchOpenDropdown('First Name');
        await segmentationPage.selectDropdownOption('First Name');
        await segmentationPage.openOperatorDropdown();
        const textFieldOperators = (await segmentationPage.dropdownItems.allInnerTexts()).sort();

        expect(textFieldOperators).toEqual(numericFieldOperators);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_operators_same_across_field_types');
    });

    test('TC-11 Verify Create Query button enables only once Field, Operator and Value are set', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        await segmentationPage.waitForPopupLoad();

        // Mandatory fields alone are not enough — Create Query builds from the query rule too.
        await segmentationPage.segmentationNameInput.fill('Enable Check Segment');
        await segmentationPage.descriptionInput.fill('Checking Create Query enablement');
        await expect(segmentationPage.createQueryBtn).toBeDisabled();

        await segmentationPage.openFieldDropdown();
        await segmentationPage.searchOpenDropdown('A VG Deposit Amount LOCAL');
        await segmentationPage.selectDropdownOption('A VG Deposit Amount LOCAL');
        await expect(segmentationPage.createQueryBtn).toBeDisabled();

        await segmentationPage.openOperatorDropdown();
        await segmentationPage.selectDropdownOption('Contains');
        await expect(segmentationPage.createQueryBtn).toBeDisabled();

        await segmentationPage.fillValue('1000');
        await expect(segmentationPage.createQueryBtn).toBeEnabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_create_query_enabled');
    });

    // NOTE: A "create segment and verify it on the landing page" test is intentionally not
    // included yet. Live testing showed clicking "Create Query" with a fully valid Field/
    // Operator/Value combination returned an "Error: Something went wrong" toast rather than
    // succeeding, and the dev environment was too unstable during investigation (dropped
    // connections, unexpected redirects) to confirm whether that's a real bug or a missing step.
    // Needs a follow-up investigation once the environment is stable before this can be written
    // as a real, trustworthy test rather than one that asserts against unconfirmed behavior.

});
