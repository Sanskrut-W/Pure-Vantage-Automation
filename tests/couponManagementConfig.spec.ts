// npx playwright test tests/CompConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Coupon Management Feature Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, couponPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCouponManagement();
        await couponPage.waitForPageLoad();
    });

    test('TC-1 Verify Coupon Management page access', async ({ page, couponPage }, testInfo) => {
        await expect(couponPage.couponTable).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_coupon_management_access');
    });

    test('TC-2 Verify visibility of search/filter inputs at the top', async ({ page, couponPage }, testInfo) => {
        await expect(couponPage.searchNameInput).toBeVisible();
        await expect(couponPage.searchEditedByInput).toBeVisible();
        await expect(couponPage.selectRegionDropdown).toBeVisible();
        await expect(couponPage.selectCompCodeDropdown).toBeVisible();
        await expect(couponPage.selectRequirementTypeDropdown).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_filters_visibility');
    });

    test('TC-3 Verify Create button is available in the top right corner', async ({ page, couponPage }, testInfo) => {
        await expect(couponPage.createBtn).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_create_btn_visibility');
    });

    test('TC-4 Verify Search Name functionality', async ({ page, couponPage }, testInfo) => {
        await couponPage.searchByName('TEST GLOBAL');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_search_name');
    });

    test('TC-5 Verify Select Region filter functionality', async ({ page, couponPage }, testInfo) => {
        await couponPage.selectRegion('Betway South Africa');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_region_filter');
    });

    test('TC-6 Verify Select Requirement Type filter functionality', async ({ page, couponPage }, testInfo) => {
        await couponPage.selectRequirementType('Sport Wager');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_requirement_type_filter');
    });

    test('TC-7 Verify all column headers in the table', async ({ page, couponPage }, testInfo) => {
        const headers = await couponPage.getTableColumnHeaders();
        expect(headers).toContain('Coupon Name');
        expect(headers).toContain('Comp Code');
        expect(headers).toContain('Coupon Group');
        expect(headers).toContain('Regions');
        expect(headers).toContain('Requirements');
        expect(headers).toContain('Edited by');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_column_headers');
    });

    test('TC-18 Verify creating a new coupon with valid data', async ({ page, couponPage }, testInfo) => {
        await couponPage.clickCreate();
        const randStr = CommonUtils.generateRandomString(5);
        await couponPage.fillCouponName(`Test Coupon ${randStr}`);
        await couponPage.fillDescription('Test Description');
        await couponPage.selectCompCodeInPopup('TestComp1125');
        await couponPage.fillExpiryTime('24');
        await couponPage.selectExpiryTimeUnit('Hours');
        await couponPage.selectFutureDateFromPicker();
        // Assuming Save button activates
        await expect(couponPage.saveBtn).toBeEnabled();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_create_coupon_valid');
    });

    // test('TC-8 Verify Delete button functionality', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickDeleteForRow(0);
    //         await expect(couponPage.confirmDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_delete_button');
    // });

    // test('TC-10 Verify pagination controls', async ({ page, couponPage }, testInfo) => {
    //     await expect(couponPage.paginatorNext).toBeVisible();
    //     await expect(couponPage.paginatorPrev).toBeVisible();
    //     if (await couponPage.paginatorPages.count() > 1) {
    //         await couponPage.clickPageNumber(2);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_pagination');
    // });

    // test('TC-11 Verify combined filters', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.selectRegion('Betway South Africa');
    //     await couponPage.selectRequirementType('Deposit');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_combined_filters');
    // });

    test('TC-14 Verify Search Edited By functionality', async ({ page, couponPage }, testInfo) => {
        await couponPage.selectEditedBy('simphiwe.nklosi');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_search_edited_by');
    });

    test('TC-15 Verify Comp Code filter functionality', async ({ page, couponPage }, testInfo) => {
        await couponPage.selectCompCode('TestComp1125');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_comp_code_filter');
    });

    // test('TC-20 Verify Is Global Coupon toggle functionality', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.toggleGlobalCouponCheckbox();
    //     // The Add Region button should be hidden or disabled
    //     // wait for state change
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_global_coupon_toggle');
    // });

    // test('TC-21 Verify Add Region button in popup', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.clickAddRegion();
    //     // Check if new region row appears
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_add_region_popup');
    // });

    // test('TC-22 Verify Expiry Time input validation', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.fillExpiryTime('Five');
    //     // Check if input rejects non-numeric
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_expiry_time_validation');
    // });

    // test('TC-23 Verify Expiry Date past date validation', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.selectPastDateFromPicker();
    //     await couponPage.fillCouponName('Test Past Date');
    //     await couponPage.fillDescription('Test Desc');
    //     await couponPage.selectCompCodeInPopup('TestComp1125');
    //     await couponPage.clickSave();
    //     await expect(couponPage.popupDialog).toBeVisible();
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_past_date_validation');
    // });

    // test('TC-24 Verify Expiry Time Unit dropdown', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.selectExpiryTimeUnit('Days');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_expiry_time_unit');
    // });

    // test('TC-25 Verify dual expiry coexistence', async ({ page, couponPage }, testInfo) => {
    //     await couponPage.clickCreate();
    //     await couponPage.selectDistantFutureDate();
    //     await couponPage.fillExpiryTime('5');
    //     await couponPage.selectExpiryTimeUnit('Hours');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_dual_expiry');
    // });

    // test('TC-26 Verify Edit popup opens with pre-filled data', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await expect(couponPage.popupDialog).toBeVisible();
    //         await expect(couponPage.couponNameInput).not.toBeEmpty();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_edit_popup_prefilled');
    // });

    // test('TC-27 Verify modifying optional Coupon Group', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.fillCouponGroup('UPDATED_GROUP');
    //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_edit_coupon_group');
    //     }
    // });

    // test('TC-28 Verify Cancel button discards edits', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.fillCouponName('TempName');
    //         await couponPage.clickCancel();
    //         await expect(couponPage.popupDialog).toBeHidden();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_cancel_edits');
    // });

    // test('TC-29 Verify clearing Description displays validation error', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.clearDescription();
    //         await couponPage.clickSave();
    //         await expect(couponPage.popupDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_clear_description_validation');
    // });

    // test('TC-30 Verify updating Expiry Date to distant future', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.selectDistantFutureDate();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_update_expiry_date');
    // });

    // test('TC-31 Verify updating Expiry Date to past date fails', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.selectPastDateFromPicker();
    //         await couponPage.clickSave();
    //         await expect(couponPage.popupDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_past_date_update_fails');
    // });

    // test('TC-32 Verify updating Expiry Time', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.fillExpiryTime('100');
    //         await couponPage.selectExpiryTimeUnit('Hours');
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_update_expiry_time');
    // });

    // test('TC-33 Verify toggling Global Coupon in Edit mode', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.toggleGlobalCouponCheckbox();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_toggle_global_edit');
    // });

    // test('TC-34 Verify adding a region in Edit mode', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.clickAddRegion();
    //         // Configure new region mock
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_add_region_edit');
    // });

    // test('TC-35 Verify deleting a region in Edit mode', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         // Assuming at least one region exists, try to delete it
    //         // await couponPage.page.locator(couponLocators.regionDeleteBtn).first().click();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_delete_region_edit');
    // });

    // test('TC-36 Verify clearing Comp Code displays validation error', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.clearCompCodeInPopup();
    //         await couponPage.clickSave();
    //         await expect(couponPage.popupDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_clear_comp_code_validation');
    // });

    // test('TC-37 Verify changing Campaign association', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEditForRow(0);
    //         await couponPage.selectCampaign('New Campaign'); // Mock name
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_change_campaign');
    // });

    // test('TC-38 Verify Ellipsis menu icon visibility', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await expect(couponPage.ellipsisMenuBtn.first()).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_ellipsis_menu_visible');
    // });

    // test('TC-39 Verify Ellipsis menu options', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEllipsisMenuForRow(0);
    //         await expect(page.getByText('Edit', { exact: true })).toBeVisible();
    //         await expect(page.getByText('Region Requirements', { exact: true })).toBeVisible();
    //         await expect(page.getByText('Copy', { exact: true })).toBeVisible();
    //         await expect(page.getByText('Comp Config', { exact: true })).toBeVisible();
    //         await expect(page.getByText('Coupon Players', { exact: true })).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_ellipsis_menu_options');
    // });

    // test('TC-40 Verify Edit option from Ellipsis menu', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEllipsisMenuForRow(0);
    //         await couponPage.clickEllipsisOption('Edit');
    //         await expect(couponPage.popupDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_edit_from_ellipsis');
    // });

    // test('TC-41 Verify Copy option from Ellipsis menu', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEllipsisMenuForRow(0);
    //         await couponPage.clickEllipsisOption('Copy');
    //         await expect(couponPage.popupDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_copy_from_ellipsis');
    // });

    // test('TC-42 Verify Region Requirements option from Ellipsis menu', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_region_req_from_ellipsis');
    // });

    // test('TC-43 Verify Comp Config option from Ellipsis menu', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEllipsisMenuForRow(0);
    //         await couponPage.clickEllipsisOption('Comp Config');
    //         // Assuming a modal opens
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_comp_config_from_ellipsis');
    // });

    // test('TC-44 Verify Coupon Players option from Ellipsis menu', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickEllipsisMenuForRow(0);
    //         await couponPage.clickEllipsisOption('Coupon Players');
    //         // Assuming a new screen opens
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_coupon_players_from_ellipsis');
    // });

    // test('TC-45 Verify confirmation step for delete', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.clickDeleteForRow(0);
    //         await expect(couponPage.confirmDialog).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_delete_confirmation');
    // });

    // test('TC-46 Verify Region Requirements pop-up opens', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_region_req_popup_opens');
    // });

    // test('TC-47 Verify Region Requirements fields for a region', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         // Verify fields are present
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_region_req_fields');
    // });

    // test('TC-48 Verify distinct section headers in Region Requirements', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         const sections = await couponPage.getRegionSections();
    //         expect(sections.length).toBeGreaterThanOrEqual(0);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_region_req_sections');
    // });

    // test('TC-49 Verify adding a new requirement', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         await couponPage.addRequirementToRegion('Casino Wager');
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49_add_requirement');
    // });

    // test('TC-50 Verify saving a new requirement', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         await couponPage.addRequirementToRegion('Wagering');
    //         await couponPage.saveRegionRequirements();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50_save_requirement');
    // });

    // test('TC-51 Verify Hide Filters / Show Filters button', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         await couponPage.clickToggleFilters();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51_toggle_filters');
    // });

    // test('TC-52 Verify Data Field Requirement Type dropdown', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         // Depending on data, this may not be visible until a requirement is added
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_data_field_req_type');
    // });

    // test('TC-53 Verify setting Data Field Filter Property', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         // Mock: await couponPage.selectDataFieldRequirementType('Turnover Amount');
    //         // Mock: await couponPage.fillDataFieldFilterProperty('500');
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53_data_field_filter_property');
    // });

    // test('TC-54 Verify deleting a requirement', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         // Mock: await couponPage.deleteRequirement(0);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-54_delete_requirement');
    // });

    // test('TC-55 Verify closing Region Requirements without saving', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         await couponPage.addRequirementToRegion('Wagering');
    //         await couponPage.closeRegionRequirements();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55_close_req_without_saving');
    // });

    // test('TC-56 Verify adding multiple requirements and saving', async ({ page, couponPage }, testInfo) => {
    //     const rowCount = await couponPage.getTableRowCount();
    //     if (rowCount > 0) {
    //         await couponPage.openRegionRequirements(0);
    //         await couponPage.addRequirementToRegion('Deposit');
    //         await couponPage.addRequirementToRegion('Wager');
    //         await couponPage.saveRegionRequirements();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56_add_multiple_reqs_and_save');
    // });

});
