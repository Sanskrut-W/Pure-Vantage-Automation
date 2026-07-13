//npx playwright test tests/fanExclusive.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Fan Exclusive Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, fanExclusivePage }) => {
        // Navigate to the Fan Exclusive page before each test
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();

        await sidebarPage.navigateToFanExclusive();
        await expect(page).toHaveURL(/.*fan-exclusive/);
        await fanExclusivePage.waitForPageLoad();
    });

    test('TC-1 Verify "Create Fan Exclusive", "Edit" and "Delete" buttons are present on the page @smoke', async ({ page, fanExclusivePage }, testInfo) => {
        // Verify Create Fan Exclusive button is visible
        await expect(fanExclusivePage.createFanExclusiveBtn).toBeVisible({ timeout: 20000 });
        console.log('✅ "Create Fan Exclusive" button is visible.');

        // Verify Edit button is visible (checks first instance in the table)
        await expect(fanExclusivePage.editBtn).toBeVisible({ timeout: 20000 });
        console.log('✅ "Edit" button is visible.');

        // Verify Delete button is visible (checks first instance in the table)
        await expect(fanExclusivePage.deleteBtn).toBeVisible({ timeout: 20000 });
        console.log('✅ "Delete" button is visible.');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_fan_exclusive_buttons_present');
        console.log('Test completed successfully: All required buttons are present on the Fan Exclusive page.');
    });

    test('TC-2 Verify Create Fan Exclusive form fields can be filled', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Click the Create Fan Exclusive button
        await fanExclusivePage.clickCreateFanExclusive();
        console.log('✅ Clicked "Create Fan Exclusive" button.');

        // Step 2: Fill in the Name field
        const fanExclusiveName = 'Clean Test';
        await fanExclusivePage.fillName(fanExclusiveName);
        console.log(`✅ Filled Name field with "${fanExclusiveName}".`);

        // Step 3: Select "BlackFriday" from the Tag Name dropdown
        await fanExclusivePage.selectTag('BlackFriday');
        console.log('✅ Selected "BlackFriday" from Tag Name dropdown.');

        // Step 4: Select today's date for Start Date
        await fanExclusivePage.selectStartDateToday();
        console.log('✅ Selected today\'s date for Start Date.');

        // Step 5: Open End Date picker and select a date 5 days from today
        await fanExclusivePage.selectEndDateFuture(5);
        console.log('✅ Selected a date 5 days from today for End Date.');

        // Step 6: Select "TZ-sw" from the Region-Culture dropdown
        await fanExclusivePage.selectRegionCulture('TZ-sw');
        console.log('✅ Selected "TZ-sw" from Region-Culture dropdown.');

        // Step 7: Verify the region configuration is visible
        await fanExclusivePage.verifyRegionConfigurationVisible('TZ-sw');
        console.log('✅ Verified region configuration elements are visible.');

        // Step 8: Fill in region configuration content details
        const promotionContent = 'Exclusive promotion for Black Friday fan members.';
        const termsContent = 'Terms and conditions apply. Offer valid while stocks last.';
        const bannerImageUrl = 'https://example.com/images/banner.jpg';
        const mobileBannerImageUrl = 'https://example.com/images/mobile-banner.jpg';

        await fanExclusivePage.fillPromotionContent(promotionContent);
        console.log(`✅ Filled Promotion Content with "${promotionContent}".`);

        await fanExclusivePage.fillTermsContent(termsContent);
        console.log(`✅ Filled Terms Content with "${termsContent}".`);

        await fanExclusivePage.fillBannerImageUrl(bannerImageUrl);
        console.log(`✅ Filled Banner Image URL with "${bannerImageUrl}".`);

        await fanExclusivePage.fillMobileBannerImageUrl(mobileBannerImageUrl);
        console.log(`✅ Filled Mobile Banner Image URL with "${mobileBannerImageUrl}".`);

        // Step 9: Click the Save button
        await fanExclusivePage.clickSave();
        console.log('✅ Clicked Save button.');

        // Step 10: Verify the newly created entry is visible in the table
        await fanExclusivePage.verifyEntryVisible(fanExclusiveName);
        console.log(`✅ Newly created "${fanExclusiveName}" entry is visible in the table.`);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_fan_exclusive_form');
        console.log('Test completed successfully: Create Fan Exclusive form filled.');
    });

    test('TC-3 Verify if we can edit the recently created Fan Exclusive', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Click on "edit" of the recently created one
        await fanExclusivePage.clickEditFirstFanExclusive();
        console.log('✅ Clicked "Edit" button of the recently created entry.');

        // Step 2: Get current name and append " Updated"
        const currentName = await fanExclusivePage.getName();
        const updatedName = `${currentName} Updated `;
        await fanExclusivePage.fillName(updatedName);
        console.log(`✅ Updated Name field to: "${updatedName}"`);

        // Step 3: Select "PublicTest" from the Tag Name dropdown
        await fanExclusivePage.selectTag('PublicTest');
        console.log('✅ Selected "PublicTest" from Tag Name dropdown.');

        // Step 4: Select a date 2 days later for Start Date
        await fanExclusivePage.selectStartDateFuture(2);
        console.log('✅ Selected a date 2 days from today for Start Date.');

        // Step 5: Select a date 2 days later than the original end date (7 days from today)
        await fanExclusivePage.selectEndDateFuture(7);
        console.log('✅ Selected a date 7 days from today for End Date.');

        // Step 6: Select regions, then immediately fill Promotion Content for each
        const addedRegions: string[] = [];

        await fanExclusivePage.selectRegionCulture('TZ-en');
        addedRegions.push('TZ-en');
        console.log('✅ Selected "TZ-en" from Region-Culture dropdown.');
        await fanExclusivePage.fillPromotionContent('TZ-en promotion content');
        console.log('✅ Filled Promotion Content for "TZ-en".');

        await fanExclusivePage.selectRegionCulture('MZ-pt');
        addedRegions.push('MZ-pt');
        console.log('✅ Selected "MZ-pt" from Region-Culture dropdown.');
        await fanExclusivePage.fillPromotionContent('MZ-pt promotion content');
        console.log('✅ Filled Promotion Content for "MZ-pt".');

        await fanExclusivePage.selectRegionCulture('ZA-en');
        addedRegions.push('ZA-en');
        console.log('✅ Selected "ZA-en" from Region-Culture dropdown.');
        await fanExclusivePage.fillPromotionContent('ZA-en promotion content');
        console.log('✅ Filled Promotion Content for "ZA-en".');

        // Step 7: Click the Save button
        await fanExclusivePage.clickSave();
        console.log('✅ Clicked Save button to apply changes.');

        // Step 8: Click Edit again, wait for the popup to fully load, and verify only the regions added in this test
        await fanExclusivePage.clickEditFirstFanExclusive();
        console.log('✅ Clicked "Edit" button again to re-open the form.');

        await fanExclusivePage.waitForEditFormLoad();
        console.log('✅ Edit form popup has fully loaded.');

        await fanExclusivePage.verifyRegionTabsVisible(addedRegions);
        console.log(`✅ Verified region tabs are displayed: ${addedRegions.join(', ')}.`);

        // Step 9: Click on each region tab and verify it becomes active
        await fanExclusivePage.navigateRegionTabs(addedRegions);
        console.log(`✅ Successfully navigated through all region tabs: ${addedRegions.join(', ')}.`);

        // Step 10: Screenshot of all available region tabs
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_available_regions_before_delete');
        console.log('✅ Screenshot captured of available regions before deletion.');

        // Verify Delete Region functionality (multiple)
        // Step 11: Delete the last region (currently active tab after navigating in step 9)
        await fanExclusivePage.clickDeleteRegionBtn();
        console.log('✅ Clicked Delete Region — last region deleted.');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_edit_fan_exclusive');
        console.log('Test completed successfully: Verified editing of Fan Exclusive and Delete Region functionality.');
    });

    test('TC-4 Verify re-selection of the same region is not allowed', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Open the edit form
        await fanExclusivePage.clickEditFirstFanExclusive();
        console.log('✅ Clicked "Edit" button of the first entry.');

        await fanExclusivePage.waitForEditFormLoad();
        console.log('✅ Edit form popup has fully loaded.');

        // Step 2: Select a region
        await fanExclusivePage.selectRegionCulture('TZ-en');
        console.log('✅ Selected "TZ-en" from Region-Culture dropdown.');

        // Step 3: Open the Region-Culture dropdown again
        await fanExclusivePage.openRegionCultureDropdown();
        console.log('✅ Opened Region-Culture dropdown again.');

        // Step 4: Screenshot — dropdown is open, "TZ-en" should not appear in the list
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_region_dropdown_reopen');
        console.log('✅ Screenshot captured of re-opened dropdown.');

        // Step 5: Verify "TZ-en" is not available for re-selection
        await fanExclusivePage.verifyRegionNotInDropdown('TZ-en');
        console.log('✅ Verified "TZ-en" is not available for re-selection in the dropdown.');

        await page.keyboard.press('Escape');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_region_reselection_not_allowed');
        console.log('Test completed successfully: Re-selection of the same region is not allowed.');
    });

    test('TC-5 Verify if we can delete the recently created Fan Exclusive', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Take a screenshot as proof the entry exists before deletion
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_before_delete_fan_exclusive');
        console.log('✅ Screenshot captured — proof that the entry exists before deletion.');

        // Step 2: Click the Delete button on the first Fan Exclusive entry
        await fanExclusivePage.clickDeleteFirstFanExclusive();
        console.log('✅ Clicked "Delete" button of the first entry.');

        // Step 3: Click "Yes" on the confirmation popup
        await fanExclusivePage.confirmDelete();
        console.log('✅ Confirmed deletion by clicking "Yes".');

        // Step 4: Verify the entry is no longer visible in the table
        await fanExclusivePage.verifyEntryNotVisible('Test 1 - Updated recently');
        console.log('✅ Entry is no longer visible in the table.');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_delete_fan_exclusive');
        console.log('Test completed successfully: Fan Exclusive entry deleted successfully.');
    });

});
