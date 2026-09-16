import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { campaignLocators } from '../locators/campaignLocators';

test.describe('Campaign Management Action Buttons Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
        // Shared navigation setup for these tests
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/.*campaign-management/);
        await page.waitForLoadState('networkidle');

        // Select a region so campaign data loads and action buttons become visible
        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');
    });

//     test('TC-1 Verify Edit Campaign Button Functionality', async ({ page, campaignPage }, testInfo) => {
//         await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        
//         await campaignPage.clickEditFirstCampaign();

//         // Taking screenshot after clicking to capture the Edit modal/state
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_campaign_edit_clicked');
        
//         // Typically clicking Edit would open a dialog or redirect. 
//         // Adding a basic assertion if a dialog or specific state is known can be done here.
//         console.log('Successfully clicked Edit button on Campaign Management.');
//     });

//     test('TC-2 Verify Link Workflow Button Functionality', async ({ page, campaignPage }, testInfo) => {
//         await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 30000 });
        
//         await campaignPage.clickLinkWorkflowFirstCampaign();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_campaign_link_workflow_clicked');
//         console.log('Successfully clicked Link Workflow button on Campaign Management.');
//     });

//     test('TC-3 Verify Details Button Functionality', async ({ page, campaignPage }, testInfo) => {
//         await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 30000 });
        
//         await campaignPage.clickDetailsFirstCampaign();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_campaign_details_clicked');
//         console.log('Successfully clicked Details button on Campaign Management.');
//     });

//     test('TC-4 Verify Delete Campaign Button Functionality', async ({ page, campaignPage }, testInfo) => {
//         await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        
//         await campaignPage.clickDeleteFirstCampaign();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_campaign_delete_clicked');
//         console.log('Successfully clicked Delete button on Campaign Management.');
//     });
});

test.describe('Campaign Management - Create Campaign Tests', () => {
    let createdCampaignName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
        createdCampaignName = undefined;

        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/.*campaign-management/);
        await page.waitForLoadState('networkidle');

        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');

        await campaignPage.clickCreateCampaign();
        await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });
    });

    test.afterEach(async ({ page, campaignPage }) => {
        if (!createdCampaignName) return;
        const nameToDelete = createdCampaignName;
        createdCampaignName = undefined;

        console.log(`Cleaning up: deleting Campaign "${nameToDelete}"...`);
        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');
        await campaignPage.deleteCampaignByName(nameToDelete);
    });

//     test('TC-5 Verify mandatory field validation on Create Campaign', async ({ page, campaignPage }, testInfo) => {
//         const saveDisabledInitially = await campaignPage.saveBtn.first().isDisabled().catch(() => false);
//         if (!saveDisabledInitially) {
//             await campaignPage.clickSaveCampaign();
//         }

//         const inlineError = campaignPage.createCampaignDialog.locator(campaignLocators.validationError).first();
//         const hasInlineError = await inlineError.isVisible().catch(() => false);

//         expect(saveDisabledInitially || hasInlineError,
//             'Expected Save to be disabled, or a validation error to appear, when required fields are left blank').toBeTruthy();

//         console.log(saveDisabledInitially
//             ? 'Save stayed disabled with all required fields blank.'
//             : `Validation error shown: ${await inlineError.textContent()}`);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_create_campaign_validation');
//         await campaignPage.clickCancelCampaign().catch(() => {});
//     });

//     test('TC-6 Verify successful Campaign creation with only mandatory fields', async ({ page, campaignPage }, testInfo) => {
//         const campaignName = `Campaign_${Date.now()}`;
//         await campaignPage.fillCampaignName(campaignName);
//         await campaignPage.fillCampaignDescription('Automated mandatory-fields campaign');
//         await campaignPage.setStartDate();
//         await campaignPage.selectCampaignRegion('Betway Ghana');

//         await campaignPage.clickSaveCampaign();
//         createdCampaignName = campaignName;

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after creating the Campaign').toBeVisible({ timeout: 15000 });
//         console.log('Create Campaign toast message:', await successToast.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_create_campaign_mandatory_fields');
//     });

//     test('TC-7 Verify successful Campaign creation with all fields filled', async ({ page, campaignPage }, testInfo) => {
//         const campaignName = `Campaign_${Date.now()}`;
//         await campaignPage.fillCampaignName(campaignName);
//         await campaignPage.fillCampaignDescription('Automated all-fields campaign');
//         await campaignPage.fillObjective('Automated Objective');
//         await campaignPage.fillReportingMetrics('Automated Metrics');
//         await campaignPage.setStartDate();
//         await campaignPage.setEndDate();
//         await campaignPage.selectFirstPromotionType();
//         await campaignPage.selectCampaignRegion('Betway Ghana');

//         await campaignPage.clickSaveCampaign();
//         createdCampaignName = campaignName;

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after creating the Campaign').toBeVisible({ timeout: 15000 });
//         console.log('Create Campaign toast message:', await successToast.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_create_campaign_all_fields');
//     });

//     test('TC-8 Verify Campaign creation by selecting all Promotion Types via Select All', async ({ page, campaignPage }, testInfo) => {
//         const campaignName = `Campaign_${Date.now()}`;
//         await campaignPage.fillCampaignName(campaignName);
//         await campaignPage.fillCampaignDescription('Automated select-all Promotion Types campaign');
//         await campaignPage.setStartDate();
//         await campaignPage.selectAllPromotionTypes();
//         await campaignPage.selectCampaignRegion('Betway Ghana');

//         await campaignPage.clickSaveCampaign();
//         createdCampaignName = campaignName;

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after creating the Campaign with all Promotion Types selected').toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_create_campaign_select_all_promotion_types');
//     });

//     test('TC-9 Verify Campaign creation by selecting all Regions via Select All', async ({ page, campaignPage }, testInfo) => {
//         const campaignName = `Campaign_${Date.now()}`;
//         await campaignPage.fillCampaignName(campaignName);
//         await campaignPage.fillCampaignDescription('Automated select-all Regions campaign');
//         await campaignPage.setStartDate();
//         await campaignPage.selectAllCampaignRegions();

//         await campaignPage.clickSaveCampaign();
//         createdCampaignName = campaignName;

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after creating the Campaign with all Regions selected').toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_create_campaign_select_all_regions');
//     });

//     test('TC-10 Verify closing Create Campaign popup without saving', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.fillCampaignName(`Campaign_${Date.now()}`);
//         await campaignPage.clickCancelCampaign();

//         await expect(campaignPage.createCampaignDialog,
//             'Expected the Create Campaign popup to close without saving').toBeHidden({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_create_campaign_cancel');
//     });
});

test.describe('Campaign Management - Edit Campaign Tests', () => {
    let createdCampaignName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
        createdCampaignName = undefined;

        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/.*campaign-management/);
        await page.waitForLoadState('networkidle');

        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');

        // Create a fresh Campaign for each Edit test rather than relying on whichever
        // Campaign happens to be first in the table.
        const campaignName = `Campaign_${Date.now()}`;
        await campaignPage.clickCreateCampaign();
        await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });
        await campaignPage.fillCampaignName(campaignName);
        await campaignPage.fillCampaignDescription('Automated campaign for Edit tests');
        await campaignPage.setStartDate();
        await campaignPage.selectCampaignRegion('Betway Ghana');
        await campaignPage.clickSaveCampaign();
        createdCampaignName = campaignName;

        const setupToast = page.locator(campaignLocators.successToast).first();
        await expect(setupToast, 'Expected the setup Campaign to be created successfully').toBeVisible({ timeout: 15000 });

        await campaignPage.searchCampaign(campaignName);
        await expect(campaignPage.editBtn.first(), 'Expected the newly created Campaign to appear in the table').toBeVisible({ timeout: 10000 });
    });

    test.afterEach(async ({ page, campaignPage }) => {
        if (!createdCampaignName) return;
        const nameToDelete = createdCampaignName;
        createdCampaignName = undefined;

        console.log(`Cleaning up: deleting Campaign "${nameToDelete}"...`);
        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');
        await campaignPage.deleteCampaignByName(nameToDelete);
    });

//     test('TC-11 Verify editing a Campaign\'s Name persists the change', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickEditFirstCampaign();
//         await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });

//         const updatedName = `${createdCampaignName}_Edited`;
//         await campaignPage.fillCampaignName(updatedName);
//         await campaignPage.clickSaveCampaign();
//         // From here on the record only exists under its NEW name — clean up that one.
//         createdCampaignName = updatedName;

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after updating the Campaign').toBeVisible({ timeout: 15000 });
//         console.log('Edit Campaign toast message:', await successToast.textContent());

//         await campaignPage.searchCampaign(updatedName);
//         await expect(campaignPage.editBtn.first(), 'Expected the renamed Campaign to appear in the table').toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_edit_campaign_name');
//     });

//     test('TC-12 Verify editing a Campaign\'s Description persists the change', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickEditFirstCampaign();
//         await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });

//         await campaignPage.fillCampaignDescription('Updated description via automated Edit test');
//         await campaignPage.clickSaveCampaign();

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after updating the Campaign').toBeVisible({ timeout: 15000 });
//         console.log('Edit Campaign toast message:', await successToast.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_edit_campaign_description');
//     });

//     test('TC-13 Verify Cancel during Edit does not persist changes', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickEditFirstCampaign();
//         await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });

//         await campaignPage.fillCampaignName(`${createdCampaignName}_ShouldNotSave`);
//         await campaignPage.clickCancelCampaign();

//         await expect(campaignPage.createCampaignDialog,
//             'Expected the Edit Campaign popup to close without saving').toBeHidden({ timeout: 10000 });

//         await campaignPage.searchCampaign(createdCampaignName!);
//         await expect(campaignPage.editBtn.first(),
//             'Expected the original Campaign name to still be present after Cancel').toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_edit_campaign_cancel');
//     });
});

// test.describe('Campaign Management - Link Workflow Tests', () => {
//     let createdCampaignName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
//         createdCampaignName = undefined;

//         await page.goto('/main/home');
//         await page.reload();
//         await sidebarPage.waitForPageLoad();

//         await sidebarPage.navigateToCampaign();
//         await expect(page).toHaveURL(/.*campaign-management/);
//         await page.waitForLoadState('networkidle');

//         await campaignPage.selectRegion('Betway Ghana');
//         await page.waitForLoadState('networkidle');

//         // Create a fresh Campaign for each Link Workflow test rather than relying on
//         // whichever Campaign happens to be first in the table.
//         const campaignName = `Campaign_${Date.now()}`;
//         await campaignPage.clickCreateCampaign();
//         await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });
//         await campaignPage.fillCampaignName(campaignName);
//         await campaignPage.fillCampaignDescription('Automated campaign for Link Workflow tests');
//         await campaignPage.setStartDate();
//         await campaignPage.selectCampaignRegion('Betway Ghana');
//         await campaignPage.clickSaveCampaign();
//         createdCampaignName = campaignName;

//         const setupToast = page.locator(campaignLocators.successToast).first();
//         await expect(setupToast, 'Expected the setup Campaign to be created successfully').toBeVisible({ timeout: 15000 });

//         await campaignPage.searchCampaign(campaignName);
//         await expect(campaignPage.linkWorkflowBtn.first(), 'Expected the newly created Campaign to appear in the table').toBeVisible({ timeout: 10000 });
//     });

//     test.afterEach(async ({ page, campaignPage }) => {
//         if (!createdCampaignName) return;
//         const nameToDelete = createdCampaignName;
//         createdCampaignName = undefined;

//         console.log(`Cleaning up: deleting Campaign "${nameToDelete}"...`);
//         await campaignPage.selectRegion('Betway Ghana');
//         await page.waitForLoadState('networkidle');
//         await campaignPage.deleteCampaignByName(nameToDelete);
//     });

//     test('TC-14 Verify mandatory Workflow field validation on Link Workflow popup', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickLinkWorkflowFirstCampaign();
//         await campaignPage.linkWorkflowDialog.waitFor({ state: 'visible', timeout: 10000 });

//         const saveDisabledInitially = await campaignPage.linkWorkflowSaveBtn.first().isDisabled().catch(() => false);
//         if (!saveDisabledInitially) {
//             await campaignPage.clickLinkWorkflowSave();
//         }

//         const inlineError = campaignPage.linkWorkflowDialog.locator(campaignLocators.validationError).first();
//         const hasInlineError = await inlineError.isVisible().catch(() => false);

//         expect(saveDisabledInitially || hasInlineError,
//             'Expected Link Workflow to be disabled, or a validation error to appear, when no Workflow is selected').toBeTruthy();

//         console.log(saveDisabledInitially
//             ? 'Link Workflow stayed disabled with no Workflow selected.'
//             : `Validation error shown: ${await inlineError.textContent()}`);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_link_workflow_validation');
//         await campaignPage.clickCancelCampaign().catch(() => {});
//     });

//     test('TC-15 Verify successfully linking a Workflow to a Campaign', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickLinkWorkflowFirstCampaign();
//         await campaignPage.linkWorkflowDialog.waitFor({ state: 'visible', timeout: 10000 });

//         await campaignPage.selectFirstWorkflow();
//         await campaignPage.clickLinkWorkflowSave();

//         const successToast = page.locator(campaignLocators.successToast).first();
//         await expect(successToast, 'Expected a success toast after linking a Workflow').toBeVisible({ timeout: 15000 });
//         console.log('Link Workflow toast message:', await successToast.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_link_workflow_success');
//     });

//     test('TC-16 Verify Cancel on Link Workflow popup closes without linking', async ({ page, campaignPage }, testInfo) => {
//         await campaignPage.clickLinkWorkflowFirstCampaign();
//         await campaignPage.linkWorkflowDialog.waitFor({ state: 'visible', timeout: 10000 });

//         await campaignPage.selectFirstWorkflow();
//         await campaignPage.clickCancelCampaign();

//         await expect(campaignPage.linkWorkflowDialog,
//             'Expected the Link Workflow popup to close without saving').toBeHidden({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_link_workflow_cancel');
//     });
// });

test.describe('Campaign Management - Delete Campaign Tests', () => {
    let createdCampaignName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
        createdCampaignName = undefined;

        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/.*campaign-management/);
        await page.waitForLoadState('networkidle');

        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');

        // Create a fresh Campaign for each Delete test rather than relying on whichever
        // Campaign happens to be first in the table.
        const campaignName = `Campaign_${Date.now()}`;
        await campaignPage.clickCreateCampaign();
        await campaignPage.createCampaignDialog.waitFor({ state: 'visible', timeout: 10000 });
        await campaignPage.fillCampaignName(campaignName);
        await campaignPage.fillCampaignDescription('Automated campaign for Delete tests');
        await campaignPage.setStartDate();
        await campaignPage.selectCampaignRegion('Betway Ghana');
        await campaignPage.clickSaveCampaign();
        createdCampaignName = campaignName;

        const setupToast = page.locator(campaignLocators.successToast).first();
        await expect(setupToast, 'Expected the setup Campaign to be created successfully').toBeVisible({ timeout: 15000 });

        await campaignPage.searchCampaign(campaignName);
        await expect(campaignPage.deleteBtn.first(), 'Expected the newly created Campaign to appear in the table').toBeVisible({ timeout: 10000 });
    });

    test.afterEach(async ({ page, campaignPage }) => {
        // No-ops for TC-19, since a successful delete already clears createdCampaignName.
        if (!createdCampaignName) return;
        const nameToDelete = createdCampaignName;
        createdCampaignName = undefined;

        console.log(`Cleaning up: deleting Campaign "${nameToDelete}"...`);
        await campaignPage.selectRegion('Betway Ghana');
        await page.waitForLoadState('networkidle');
        await campaignPage.deleteCampaignByName(nameToDelete);
    });

    test('TC-19 Verify clicking Delete then Yes removes the Campaign', async ({ page, campaignPage }, testInfo) => {
        const nameBeingDeleted = createdCampaignName!;

        await campaignPage.clickDeleteFirstCampaign();
        await expect(campaignPage.confirmYesBtn, 'Expected the delete confirmation popup to appear').toBeVisible({ timeout: 10000 });

        await campaignPage.clickConfirmYes();

        const successToast = page.locator(campaignLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after deleting the Campaign').toBeVisible({ timeout: 15000 });
        console.log('Delete Campaign toast message:', await successToast.textContent());

        // The Campaign is gone now — nothing left for afterEach to clean up.
        createdCampaignName = undefined;

        await campaignPage.searchCampaign(nameBeingDeleted);
        await expect(campaignPage.deleteBtn, 'Expected the deleted Campaign to no longer appear in the table').toHaveCount(0, { timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_delete_campaign_yes');
    });

    // test('TC-20 Verify clicking Delete then No keeps the Campaign', async ({ page, campaignPage }, testInfo) => {
    //     await campaignPage.clickDeleteFirstCampaign();
    //     await expect(campaignPage.confirmNoBtn, 'Expected the delete confirmation popup to appear').toBeVisible({ timeout: 10000 });

    //     await campaignPage.clickConfirmNo();

    //     await expect(campaignPage.confirmNoBtn, 'Expected the confirmation popup to close after clicking No').toBeHidden({ timeout: 10000 });

    //     await campaignPage.searchCampaign(createdCampaignName!);
    //     await expect(campaignPage.deleteBtn.first(), 'Expected the Campaign to still be present after declining the delete').toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_delete_campaign_no');
    // });
});
