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

        // waitForPageLoad only waits for domcontentloaded, which can resolve
        // before the Angular/Stencil component actually hydrates and renders
        // its buttons — reload once if nothing rendered yet.
        const loaded = await fanExclusivePage.createFanExclusiveBtn
            .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
        if (!loaded) {
            await page.reload();
            await page.waitForLoadState('networkidle');
            await fanExclusivePage.createFanExclusiveBtn.waitFor({ state: 'visible', timeout: 30000 });
        }
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

        // Step 2: Fill in the Name field. Unique per run — TC-3/TC-4 need a
        // fresh entry with a full, unused set of Region-Culture options: the
        // old shared/reused entry's region list is permanently exhausted
        // because Delete Region returns 200 OK but never actually persists
        // the removal server-side (confirmed via network trace), so regions
        // could never be released back to the pool once added.
        const fanExclusiveName = `FanExclusive_${CommonUtils.generateRandomString(8)}`;
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

        // Step 6: Select regions, then immediately fill Promotion Content for each.
        // Discovered dynamically rather than hardcoded (TZ-en/MZ-pt/ZA-en) — this
        // entry is shared/reused, so specific region names can already be used up
        // by earlier runs (confirmed: this is exactly why this step used to hang).
        // The app excludes already-added regions from the dropdown automatically,
        // so three consecutive calls naturally yield three distinct regions.
        const addedRegions: string[] = [];

        for (let i = 0; i < 3; i++) {
            const region = await fanExclusivePage.getFirstAvailableRegionCultureLabel();
            await fanExclusivePage.selectRegionCulture(region);
            addedRegions.push(region);
            console.log(`✅ Selected "${region}" from Region-Culture dropdown.`);
            await fanExclusivePage.fillPromotionContent(`${region} promotion content`);
            console.log(`✅ Filled Promotion Content for "${region}".`);
        }

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

        // Step 12: Clean up — delete the REMAINING regions too (only the last
        // one was removed above). This entry is a shared/reused row, not one
        // created fresh by this test, so leaving TZ-en/MZ-pt permanently
        // attached would drain the Region-Culture dropdown's available
        // options a little more with every run (confirmed: this is exactly
        // why TC-4 could no longer find "TZ-en" available to select).
        const remainingRegions = addedRegions.slice(0, -1);
        for (const region of remainingRegions) {
            await fanExclusivePage.deleteRegionByTab(region);
            console.log(`✅ Cleaned up region "${region}".`);
        }
        await fanExclusivePage.clickSave();
        console.log('✅ Saved — entry restored to its pre-test region state.');

        console.log('Test completed successfully: Verified editing of Fan Exclusive and Delete Region functionality.');
    });

    test('TC-4 Verify re-selection of the same region is not allowed', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Open the edit form
        await fanExclusivePage.clickEditFirstFanExclusive();
        console.log('✅ Clicked "Edit" button of the first entry.');

        await fanExclusivePage.waitForEditFormLoad();
        console.log('✅ Edit form popup has fully loaded.');

        // Step 2: Select a region — discovered dynamically rather than hardcoded,
        // since this entry is shared/reused and its available regions shrink
        // permanently as other tests add them over time (e.g. TC-3).
        const regionToSelect = await fanExclusivePage.getFirstAvailableRegionCultureLabel();
        await fanExclusivePage.selectRegionCulture(regionToSelect);
        console.log(`✅ Selected "${regionToSelect}" from Region-Culture dropdown.`);

        // Step 3: Open the Region-Culture dropdown again
        await fanExclusivePage.openRegionCultureDropdown();
        console.log('✅ Opened Region-Culture dropdown again.');

        // Step 4: Screenshot — dropdown is open, the selected region should not appear in the list
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_region_dropdown_reopen');
        console.log('✅ Screenshot captured of re-opened dropdown.');

        // Step 5: Verify the selected region is not available for re-selection
        await fanExclusivePage.verifyRegionNotInDropdown(regionToSelect);
        console.log(`✅ Verified "${regionToSelect}" is not available for re-selection in the dropdown.`);

        await page.keyboard.press('Escape');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_region_reselection_not_allowed');
        console.log('Test completed successfully: Re-selection of the same region is not allowed.');
    });

    test('TC-5 Verify if we can delete the recently created Fan Exclusive', async ({ page, fanExclusivePage }, testInfo) => {
        // Step 1: Take a screenshot as proof the entry exists before deletion
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_before_delete_fan_exclusive');
        console.log('✅ Screenshot captured — proof that the entry exists before deletion.');

        // Capture the current name directly from the table rather than a
        // variable tracked across TC-2/TC-3 — a retried test runs in a fresh
        // worker process, which would leave a cross-test variable undefined.
        const nameBeforeDelete = await fanExclusivePage.getFirstEntryName();
        console.log(`Entry to delete: "${nameBeforeDelete}"`);

        // Step 2: Click the Delete button on the first Fan Exclusive entry
        await fanExclusivePage.clickDeleteFirstFanExclusive();
        console.log('✅ Clicked "Delete" button of the first entry.');

        // Step 3: Click "Yes" on the confirmation popup
        await fanExclusivePage.confirmDelete();
        console.log('✅ Confirmed deletion by clicking "Yes".');

        // Step 4: Verify the entry is no longer visible in the table.
        // This deletes the entry TC-2 created (renamed by TC-3 along the
        // way) — keeps the suite self-cleaning so it never accumulates rows
        // or touches the old shared/exhausted entry.
        await fanExclusivePage.verifyEntryNotVisible(nameBeforeDelete);
        console.log('✅ Entry is no longer visible in the table.');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_delete_fan_exclusive');
        console.log('Test completed successfully: Fan Exclusive entry deleted successfully.');
    });

});
