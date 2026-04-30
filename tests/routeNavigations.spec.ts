// npx playwright test tests/routeNavigations.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Marketing > Banner Management - Route Persistence Tests', () => {

    // ═══════════════════════════════════════════════════════════
    //  Banner Config — Route Persistence on Refresh / Back / Forward
    // ═══════════════════════════════════════════════════════════

    test.describe('Banner Config - Route Persistence', () => {

        test.beforeEach(async ({ page, sidebarPage, bannerPage }) => {
            await page.goto('/main/home');
            await page.reload();
            await sidebarPage.waitForPageLoad();
            await sidebarPage.navigateToBannerConfig();
            await expect(page).toHaveURL(/.*banner-config/);
            await bannerPage.waitForPageLoad();
        });

        test('TC-1 Navigate to Banner Config and verify URL persists after reload', async ({ page, sidebarPage, bannerPage }, testInfo) => {
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_step1_on_banner_config');

            const urlBeforeRefresh = page.url();
            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
            await expect(bannerPage.createBannerBtn).toBeVisible();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_step2_after_refresh');
        });

        test('TC-1b Navigate to Banner Config and verify URL persists after browser Back and Forward', async ({ page, sidebarPage, bannerPage }, testInfo) => {
            const bannerConfigUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1b_step1_on_banner_config');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1b_step2_after_back_on_home');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(bannerConfigUrl);
            await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
            await expect(bannerPage.createBannerBtn).toBeVisible();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1b_step3_after_forward_on_banner_config');
        });

        test('TC-2 Select region and Create Banner, then verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectRegion('Betway Ghana');
            await bannerPage.clickCreateBanner();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_step1_before_refresh');

            await bannerPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
            await expect(bannerPage.createBannerBtn).toBeVisible();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_step2_after_refresh');
        });

        test('TC-2b Select region and Create Banner, then verify URL persists after Back and Forward', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectRegion('Betway Ghana');
            await bannerPage.clickCreateBanner();
            const urlAfterAction = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2b_step1_on_create_banner');

            await bannerPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2b_step2_after_back');

            await bannerPage.browserForward();
            expect(page.url()).toBe(urlAfterAction);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2b_step3_after_forward');
        });

        test('TC-3 Select region, Edit a banner, then verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectRegion('Betway Ghana');
            await bannerPage.clickEditFirstBanner();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_step1_edit_before_refresh');

            await bannerPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_step2_edit_after_refresh');
        });

        test('TC-3b Select region, Edit a banner, then verify URL persists after Back and Forward', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectRegion('Betway Ghana');
            await bannerPage.clickEditFirstBanner();
            const urlAfterEdit = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3b_step1_on_edit_page');

            await bannerPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3b_step2_after_back');

            await bannerPage.browserForward();
            expect(page.url()).toBe(urlAfterEdit);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3b_step3_after_forward_on_edit');
        });
    });

    // ═══════════════════════════════════════════════════════════
    //  Banner Ordering — Route Persistence on Refresh / Back / Forward
    // ═══════════════════════════════════════════════════════════

    test.describe('Banner Ordering - Route Persistence', () => {

        test.beforeEach(async ({ page, sidebarPage, bannerPage }) => {
            await page.goto('/main/home');
            await page.reload();
            await sidebarPage.waitForPageLoad();
            await sidebarPage.navigateToBannerOrdering();
            await expect(page).toHaveURL(/.*banner-ordering/);
            await bannerPage.waitForPageLoad();
        });

        test('TC-4 Navigate to Banner Ordering and verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_step1_on_banner_ordering');

            await bannerPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 20000 });
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_step2_after_refresh');
        });

        test('TC-4b Navigate to Banner Ordering and verify URL persists after Back and Forward', async ({ page, sidebarPage, bannerPage }, testInfo) => {
            const bannerOrderingUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4b_step1_on_banner_ordering');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4b_step2_after_back_on_home');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(bannerOrderingUrl);
            await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 20000 });
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4b_step3_after_forward_on_banner_ordering');
        });

        test('TC-5 Select Region and Channel, then verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectOrderingRegion('Betway Ghana');
            await bannerPage.selectOrderingChannel('WebDesktop');

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_step1_before_refresh');

            await bannerPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 20000 });
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_step2_after_refresh');
        });

        test('TC-5b Select Region and Channel, then verify URL persists after Back and Forward', async ({ page, bannerPage }, testInfo) => {
            await bannerPage.selectOrderingRegion('Betway Ghana');
            await bannerPage.selectOrderingChannel('WebDesktop');
            const urlAfterSelections = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5b_step1_on_ordering_with_selections');

            await bannerPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5b_step2_after_back');

            await bannerPage.browserForward();
            expect(page.url()).toBe(urlAfterSelections);
            await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 20000 });
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5b_step3_after_forward_on_ordering');
        });
    });

    // ═══════════════════════════════════════════════════════════
    //  Campaign Management — Route Persistence on Refresh / Back / Forward
    // ═══════════════════════════════════════════════════════════

    test.describe('Campaign Management - Route Persistence', () => {

        test.beforeEach(async ({ page, sidebarPage }) => {
            await page.goto('/main/home');
            await sidebarPage.waitForPageLoad();
            await sidebarPage.navigateToCampaign();
            await expect(page).toHaveURL(/.*campaign-management/);
            await sidebarPage.waitForPageLoad();
        });

        test('TC-6 Navigate to Campaign Management and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
            const campaignUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step1_on_campaign');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(campaignUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step3_after_forward');
        });

        test('TC-6b Navigate to Campaign and verify URL persists after Back and Forward', async ({ page, sidebarPage }, testInfo) => {
            const campaignUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6b_step1_on_campaign');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(campaignUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6b_step3_after_forward');
        });

        test('TC-7 Click Select Region and Create Campaign, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await campaignPage.selectRegionAndCreateCampaign();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_step2_after_refresh');
        });

        test('TC-7b Click Select Region and Create Campaign, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await campaignPage.selectRegionAndCreateCampaign();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7b_step1_after_actions');

            await sidebarPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7b_step3_after_forward');
        });

        test('TC-8 Click Edit Campaign, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickEditFirstCampaign();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step2_after_refresh');
        });

        test('TC-8b Click Edit Campaign, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickEditFirstCampaign();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8b_step1_after_actions');

            await sidebarPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8b_step3_after_forward');
        });

        test('TC-9 Click Link Workflow, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickLinkWorkflowFirstCampaign();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step2_after_refresh');
        });

        test('TC-9b Click Link Workflow, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickLinkWorkflowFirstCampaign();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9b_step1_after_actions');
            await sidebarPage.browserBack();
            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
        });

        test('TC-10 Click Details, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickDetailsFirstCampaign();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_step2_after_refresh');
        });

        test('TC-10b Click Details, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickDetailsFirstCampaign();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10b_step1_after_actions');
            await sidebarPage.browserBack();
            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
        });

        test('TC-11 Click Delete, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickDeleteFirstCampaign();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_step2_after_refresh');
        });

        test('TC-11b Click Delete, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
            await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 15000 });
            await campaignPage.clickDeleteFirstCampaign();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11b_step1_after_actions');
            await sidebarPage.browserBack();
            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
        });
    });

    // ═══════════════════════════════════════════════════════════
    //  Cashback Promotions — Route Persistence on Refresh / Back / Forward
    // ═══════════════════════════════════════════════════════════

    test.describe('Cashback Promotions - Route Persistence', () => {

        test.beforeEach(async ({ page, sidebarPage }) => {
            await page.goto('/main/home');
            await sidebarPage.waitForPageLoad();
            await sidebarPage.navigateToCashbackPromotions();
            await expect(page).toHaveURL(/.*cashback-promotions/);
            await sidebarPage.waitForPageLoad();
        });

        test('TC-12 Navigate to Cashback Promotions and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_step1_on_cashback');

            const urlBeforeRefresh = page.url();
            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_step2_after_refresh');
        });

        test('TC-12b Navigate to Cashback Promotions and verify URL persists after Back and Forward', async ({ page, sidebarPage }, testInfo) => {
            const targetUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12b_step1_on_cashback');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(targetUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12b_step3_after_forward');
        });

        test('TC-13 Click Create Cashback Promotion, then verify URL persists after reload', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
            await cashbackPage.clickCreateCashbackPromotion();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step2_after_refresh');
        });

        test('TC-13b Click Create Cashback Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, cashbackPage }, testInfo) => {
            await cashbackPage.clickCreateCashbackPromotion();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13b_step1_after_actions');

            await sidebarPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13b_step3_after_forward');
        });
    });

    // ═══════════════════════════════════════════════════════════
    //  Coupon Management — Route Persistence on Refresh / Back / Forward
    // ═══════════════════════════════════════════════════════════

    test.describe('Coupon Management - Route Persistence', () => {

        test.beforeEach(async ({ page, sidebarPage }) => {
            await page.goto('/main/home');
            await sidebarPage.waitForPageLoad();
            await sidebarPage.navigateToCouponManagement();
            await expect(page).toHaveURL(/.*coupon-management/);
            await sidebarPage.waitForPageLoad();
        });

        test('TC-14 Navigate to Coupon Management and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_step1_on_coupon');

            const urlBeforeRefresh = page.url();
            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_step2_after_refresh');
        });

        test('TC-14b Navigate to Coupon Management and verify URL persists after Back and Forward', async ({ page, sidebarPage }, testInfo) => {
            const targetUrl = page.url();
            const homeUrl = new URL('/main/home', page.url()).href;

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14b_step1_on_coupon');

            await sidebarPage.browserBack();
            expect(page.url()).toBe(homeUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(targetUrl);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14b_step3_after_forward');
        });

        test('TC-15 Click Create Coupon, then verify URL persists after reload', async ({ page, sidebarPage, couponPage }, testInfo) => {
            await couponPage.clickCreate();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_step2_after_refresh');
        });

        test('TC-15b Click Create Coupon, then verify URL persists after Back and Forward', async ({ page, sidebarPage, couponPage }, testInfo) => {
            await couponPage.clickCreate();
            const urlAfterActions = page.url();

            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15b_step1_after_actions');

            await sidebarPage.browserBack();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15b_step2_after_back');

            await sidebarPage.browserForward();
            expect(page.url()).toBe(urlAfterActions);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15b_step3_after_forward');
        });

        test('TC-16 Click Edit Coupon, then verify URL persists after reload', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickEditForRow(0);
                const urlBeforeRefresh = page.url();
                await sidebarPage.browserRefresh();
                expect(page.url()).toBe(urlBeforeRefresh);
            } else {
                console.log('Skipping TC-16: No rows available to edit.');
            }
        });

        test('TC-16b Click Edit Coupon, then verify URL persists after Back and Forward', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickEditForRow(0);
                const urlAfterActions = page.url();
                await sidebarPage.browserBack();
                await sidebarPage.browserForward();
                expect(page.url()).toBe(urlAfterActions);
            }
        });

        test('TC-17 Click Delete Coupon, then verify URL persists after reload', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickDeleteForRow(0);
                const urlBeforeRefresh = page.url();
                await sidebarPage.browserRefresh();
                expect(page.url()).toBe(urlBeforeRefresh);
            }
        });

        test('TC-17b Click Delete Coupon, then verify URL persists after Back and Forward', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickDeleteForRow(0);
                const urlAfterActions = page.url();
                await sidebarPage.browserBack();
                await sidebarPage.browserForward();
                expect(page.url()).toBe(urlAfterActions);
            }
        });

        test('TC-18 Click Ellipsis Menu, then verify URL persists after reload', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickEllipsisMenuForRow(0);
                const urlBeforeRefresh = page.url();
                await sidebarPage.browserRefresh();
                expect(page.url()).toBe(urlBeforeRefresh);
            }
        });

        test('TC-18b Click Ellipsis Menu, then verify URL persists after Back and Forward', async ({ page, sidebarPage, couponPage }, testInfo) => {
            if (await couponPage.getTableRowCount() > 0) {
                await couponPage.clickEllipsisMenuForRow(0);
                const urlAfterActions = page.url();
                await sidebarPage.browserBack();
                await sidebarPage.browserForward();
                expect(page.url()).toBe(urlAfterActions);
            }
        });
    });

});
