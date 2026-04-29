import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Campaign Management Action Buttons Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, campaignPage }) => {
        // Shared navigation setup for these tests
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/.*campaign-management/);
        
        // Wait for page to load completely (Assuming there's a table to load campaigns)
        await page.waitForLoadState('domcontentloaded');
        await campaignPage.clickSelectRegion(); // Make sure campaigns populate by triggering region selection if needed
    });

    test('TC-1 Verify Edit Campaign Button Functionality', async ({ page, campaignPage }, testInfo) => {
        // Ensure there is at least one edit button available to click
        await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 15000 });
        
        await campaignPage.clickEditFirstCampaign();

        // Taking screenshot after clicking to capture the Edit modal/state
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_campaign_edit_clicked');
        
        // Typically clicking Edit would open a dialog or redirect. 
        // Adding a basic assertion if a dialog or specific state is known can be done here.
        console.log('Successfully clicked Edit button on Campaign Management.');
    });

    test('TC-2 Verify Link Workflow Button Functionality', async ({ page, campaignPage }, testInfo) => {
        await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 15000 });
        
        await campaignPage.clickLinkWorkflowFirstCampaign();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_campaign_link_workflow_clicked');
        console.log('Successfully clicked Link Workflow button on Campaign Management.');
    });

    test('TC-3 Verify Details Button Functionality', async ({ page, campaignPage }, testInfo) => {
        await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 15000 });
        
        await campaignPage.clickDetailsFirstCampaign();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_campaign_details_clicked');
        console.log('Successfully clicked Details button on Campaign Management.');
    });

    test('TC-4 Verify Delete Campaign Button Functionality', async ({ page, campaignPage }, testInfo) => {
        await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 15000 });
        
        await campaignPage.clickDeleteFirstCampaign();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_campaign_delete_clicked');
        console.log('Successfully clicked Delete button on Campaign Management.');
    });
});
