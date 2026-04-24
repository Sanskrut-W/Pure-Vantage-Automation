// npx playwright test tests/tutorialConfig.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Tutorial Configuration Layout & Functionality Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, tutorialPage }) => {
        // Shared navigation setup specifically for these 4 tests
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToTutorialConfig();
        await expect(page).toHaveURL(/.*tutorial-config/);
        await tutorialPage.waitForPageLoad();
    });


    test('TC-1 Verify all the elements on Tutorial configuration landing page', async ({ page, tutorialPage }, testInfo) => {
        await expect(tutorialPage.regionDropdown).toBeVisible();
        await expect(tutorialPage.createTutorialBtn).toBeVisible();
        await expect(tutorialPage.searchInput).toBeVisible();
        await expect(tutorialPage.dataTable).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_elements_present');
    });

    test('TC-2 Verify we are able to select required region in select region dropdown', async ({ page, tutorialPage }, testInfo) => {
        await tutorialPage.selectLandingRegion('Betway Ghana');

        // Ensure data table refreshes or is visible after selection
        await expect(tutorialPage.dataTable).toBeVisible();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_region_selected');
    });

    test('TC-3 Verify we are able to select required region (select another region) in select region dropdown', async ({ page, tutorialPage }, testInfo) => {
        await tutorialPage.selectLandingRegion('Betway Ghana');
        await tutorialPage.selectLandingRegion('Betway Zambia');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_region_switched');
    });

    test('TC-4 Verify Create Tutorial button functionality', async ({ page, tutorialPage }, testInfo) => {
        await tutorialPage.clickCreateTutorial();
        await expect(tutorialPage.popupDialog).toBeVisible();
        await expect(tutorialPage.popupDialog).toContainText('Create New Tutorial');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_create_popup_opened');
    });

    test('TC-5 Verify following fields are available on the create a new Tutorial popup window', async ({ page, tutorialPage }, testInfo) => {
        await tutorialPage.clickCreateTutorial();

        // Core fields verified via HTML definitions
        await expect(tutorialPage.tutorialNameInput).toBeVisible();
        await expect(tutorialPage.popupRegionsDropdown).toBeVisible();
        await expect(tutorialPage.popupVerticalsDropdown).toBeVisible();
        await expect(tutorialPage.popupPlatformsDropdown).toBeVisible();
        await expect(tutorialPage.startDateInput).toBeVisible();
        await expect(tutorialPage.endDateInput).toBeVisible();

        await expect(tutorialPage.loggedInCheckbox).toBeVisible();
        await expect(tutorialPage.loggedOutCheckbox).toBeVisible();

        await expect(tutorialPage.saveBtn).toBeVisible();
        await expect(tutorialPage.cancelBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_popup_fields_visible');
    });

    // test('TC-6 Verify Save button functionality on create new Tutorial popup window', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     await tutorialPage.clickCreateTutorial();

    //     // This test simulates basic data entry to enable save
    //     await tutorialPage.tutorialNameInput.fill('Automation Test Tutorial PV');

    //     // Test states Save button acts appropriately (disabling logics tested deeply down)
    //     // Wait required to confirm state changes
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_save_button_flow');
    // });

    // test('TC-7 Verify Tutorial Successfully Created confirmation popup', async ({ page, tutorialPage }, testInfo) => {
    //     // Pseudo check (Requires full data insertion)
    //     console.log("Mocking TC-7 to verify success toast behavior wrapper.");
    //     test.skip();
    // });

    // // Contains sub-cases from TC-8 Validation Group
    // test.describe('TC-8 Create Tutorial Form Boundaries & Error Validations', () => {

    //     test.beforeEach(async ({ tutorialPage }) => {
    //         await tutorialPage.clickCreateTutorial();
    //     });

    //     test('Tutorial Name Empty Keeps Save Disabled', async ({ tutorialPage }) => {
    //         await tutorialPage.tutorialNameInput.fill('');
    //         await expect(tutorialPage.saveBtn).toBeDisabled();
    //     });

    //     test('Tutorial Name Only Spaces', async ({ tutorialPage }) => {
    //         await tutorialPage.tutorialNameInput.fill('     ');
    //         await expect(tutorialPage.saveBtn).toBeDisabled();
    //     });

    //     test('Cancel Discards Changes', async ({ tutorialPage }) => {
    //         await tutorialPage.tutorialNameInput.fill('Discard Me');
    //         await tutorialPage.cancelBtn.click();
    //         await expect(tutorialPage.popupDialog).toBeHidden();
    //     });
    // });

    // test('TC-9 Verify search bar functionality on landing page', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     await tutorialPage.searchForTutorial('Test Item');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_search_bar_valid');

    //     await tutorialPage.searchForTutorial('%%%__WRONG_DATA__%%%');
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_search_bar_invalid');
    // });

    // test('TC-10 Verify Prev and Next button functionality for results', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     if (await tutorialPage.nextBtn.isVisible()) {
    //         await tutorialPage.nextBtn.click();
    //         await expect(tutorialPage.prevBtn).toBeEnabled();
    //         await tutorialPage.prevBtn.click();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_prev_next_buttons');
    // });

    // test('TC-11 Verify search page numbers are clickable and related page is displayed', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     if (await tutorialPage.pageNumbersBtn.count() > 1) {
    //         await tutorialPage.pageNumbersBtn.nth(1).click(); // Click page 2
    //         await expect(tutorialPage.pageNumbersBtn.nth(1)).toHaveClass(/p-highlight/);
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_page_numbers');
    // });

    // test('TC-12 Verify Delete button functionality for results', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     if (await tutorialPage.deleteBtn.count() > 0) {
    //         await expect(tutorialPage.deleteBtn.first()).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_delete_btn_visible');
    // });

    // test('TC-13 Verify Edit button functionality for results', async ({ page, tutorialPage }, testInfo) => {
    //     await tutorialPage.selectLandingRegion('Betway Ghana');
    //     if (await tutorialPage.editBtn.count() > 0) {
    //         await tutorialPage.editBtn.first().click();
    //         await expect(tutorialPage.popupDialog).toBeVisible();
    //         await expect(tutorialPage.saveBtn).toBeVisible();
    //     }
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_edit_btn');
    // });

});