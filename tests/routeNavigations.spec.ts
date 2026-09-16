// // npx playwright test tests/routeNavigations.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';


// ═══════════════════════════════════════════════════════════
//  Banner Config — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════
test.describe('Banner Config - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage, bannerPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToBannerConfig();
        await expect(page).toHaveURL(/stencil-marketing\/banner-config/);
        await bannerPage.waitForPageLoad();
    });

    test('TC-1 Navigate to Banner Config and verify URL persists after reload', async ({ page, sidebarPage, bannerPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_step1_on_banner_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 5000 });
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
        // Stencil components re-hydrate slowly after history Forward — 20s matches the
        // budget the (passing) tutorial-page equivalents of this assertion already use.
        await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await expect(bannerPage.createBannerBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1b_step3_after_forward_on_banner_config');
    });

    test('TC-2 Select region and Create Banner, then verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
        await bannerPage.selectRegion('Betway Ghana');
        await bannerPage.clickCreateBanner();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_step1_before_refresh');

        await bannerPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(bannerPage.regionDropdown).toBeVisible({ timeout: 5000 });
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
        await expect(page).toHaveURL(/banner-ordering/);
        await bannerPage.waitForPageLoad();
    });

    test('TC-4 Navigate to Banner Ordering and verify URL persists after reload', async ({ page, bannerPage }, testInfo) => {
        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_step1_on_banner_ordering');

        await bannerPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 10000 });
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
        // Stencil components re-hydrate slowly after history Forward — 20s matches the
        // budget the (passing) tutorial-page equivalents of this assertion already use.
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
        await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 10000 });
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
        await expect(bannerPage.orderingRegionDropdown).toBeVisible({ timeout: 10000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5b_step3_after_forward_on_ordering');
    });
});

// ═══════════════════════════════════════════════════════════
//  Campaign Management — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Campaign Management - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCampaign();
        await expect(page).toHaveURL(/campaign-management/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-6 Navigate to Campaign Management and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step1_on_campaign');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step2_after_refresh');
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
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickEditFirstCampaign();
        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_step2_after_refresh');
    });

    test('TC-8b Click Edit Campaign, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.editBtn.first()).toBeVisible({ timeout: 20000 });
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
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickLinkWorkflowFirstCampaign();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_step2_after_refresh');
    });

    test('TC-9b Click Link Workflow, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.linkWorkflowBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickLinkWorkflowFirstCampaign();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9b_step1_after_actions');
        await sidebarPage.browserBack();
        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
    });

    test('TC-10 Click Details, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickDetailsFirstCampaign();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_step2_after_refresh');
    });

    test('TC-10b Click Details, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.detailsBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickDetailsFirstCampaign();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10b_step1_after_actions');
        await sidebarPage.browserBack();
        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
    });

    test('TC-11 Click Delete, then verify URL persists after reload', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 20000 });
        await campaignPage.clickDeleteFirstCampaign();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_step2_after_refresh');
    });

    test('TC-11b Click Delete, then verify URL persists after Back and Forward', async ({ page, sidebarPage, campaignPage }, testInfo) => {
        await campaignPage.selectRegion('Betway Ghana');
        await expect(campaignPage.deleteBtn.first()).toBeVisible({ timeout: 20000 });
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
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCashbackPromotions();
        await expect(page).toHaveURL(/cashback-promotions/);
        await sidebarPage.waitForPageLoad();
    });

    test('TC-12 Navigate to Cashback Promotions and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step1_on_campaign');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_step2_after_refresh');
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
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCouponManagement();
        await expect(page).toHaveURL(/coupon-management/);
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

});

// ═══════════════════════════════════════════════════════════
//  Event Calendar — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Event Calendar - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToEventCalendar();
        await expect(page).toHaveURL(/event-calender/);
        await sidebarPage.waitForPageLoad();
    });

    test('TC-18 Navigate to Event Calendar and verify URL persists after reload', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_step1_on_event_calendar');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(eventCalendarPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_step2_after_refresh');
    });

    test('TC-18b Navigate to Event Calendar and verify URL persists after Back and Forward', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18b_step1_on_event_calendar');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(eventCalendarPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18b_step3_after_forward');
    });

    test('TC-19 Select Region dropdown, then verify URL persists after reload', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(eventCalendarPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_step2_after_refresh');
    });

    test('TC-19b Select Region dropdown, then verify URL persists after Back and Forward', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19b_step3_after_forward');
    });

    test('TC-20 Select View dropdown, then verify URL persists after reload', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectView('Calender View');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(eventCalendarPage.viewDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_step2_after_refresh');
    });

    test('TC-20b Select View dropdown, then verify URL persists after Back and Forward', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectView('Calender View');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20b_step3_after_forward');
    });

    test('TC-21 Select Region and View, then verify URL persists after reload', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectRegionAndView('Betway Ghana', 'Calender View');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(eventCalendarPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_step2_after_refresh');
    });

    test('TC-21b Select Region and View, then verify URL persists after Back and Forward', async ({ page, sidebarPage, eventCalendarPage }, testInfo) => {
        await eventCalendarPage.selectRegionAndView('Betway Ghana', 'Calender View');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Fan Exclusive — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Fan Exclusive - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToFanExclusive();
        await expect(page).toHaveURL(/fan-exclusive/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-22 Navigate to Fan Exclusive and verify URL persists after reload', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_step1_on_fan_exclusive');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(fanExclusivePage.createFanExclusiveBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_step2_after_refresh');
    });

    test('TC-22b Navigate to Fan Exclusive and verify URL persists after Back and Forward', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22b_step1_on_fan_exclusive');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(fanExclusivePage.createFanExclusiveBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22b_step3_after_forward');
    });

    test('TC-23 Click Create Fan Exclusive, then verify URL persists after reload', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await fanExclusivePage.clickCreateFanExclusive();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_step2_after_refresh');
    });

    test('TC-23b Click Create Fan Exclusive, then verify URL persists after Back and Forward', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await fanExclusivePage.clickCreateFanExclusive();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23b_step3_after_forward');
    });

    test('TC-24 Click Edit Fan Exclusive, then verify URL persists after reload', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await expect(fanExclusivePage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await fanExclusivePage.clickEditFirstFanExclusive();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_step2_after_refresh');
    });

    test('TC-24b Click Edit Fan Exclusive, then verify URL persists after Back and Forward', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await expect(fanExclusivePage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await fanExclusivePage.clickEditFirstFanExclusive();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24b_step3_after_forward');
    });

    test('TC-25 Click Delete Fan Exclusive, then verify URL persists after reload', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await expect(fanExclusivePage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await fanExclusivePage.clickDeleteFirstFanExclusive();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_step2_after_refresh');
    });

    test('TC-25b Click Delete Fan Exclusive, then verify URL persists after Back and Forward', async ({ page, sidebarPage, fanExclusivePage }, testInfo) => {
        await expect(fanExclusivePage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await fanExclusivePage.clickDeleteFirstFanExclusive();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25b_step1_after_actions');
        await sidebarPage.browserBack();
        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
    });
});

// ═══════════════════════════════════════════════════════════
//  Leaderboard — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Leaderboard - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToLeaderboard();
        await expect(page).toHaveURL(/leaderboard/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-26 Navigate to Leaderboard and verify URL persists after reload', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step1_on_leaderboard');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(leaderboardPage.createLeaderboardBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_step2_after_refresh');
    });

    test('TC-26b Navigate to Leaderboard and verify URL persists after Back and Forward', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26b_step1_on_leaderboard');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(leaderboardPage.createLeaderboardBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26b_step3_after_forward');
    });

    test('TC-27 Click Create Leaderboard, then verify URL persists after reload', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await leaderboardPage.clickCreateLeaderboard();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_step2_after_refresh');
    });

    test('TC-27b Click Create Leaderboard, then verify URL persists after Back and Forward', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await leaderboardPage.clickCreateLeaderboard();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27b_step3_after_forward');
    });

    test('TC-28 Click Edit Leaderboard, then verify URL persists after reload', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await expect(leaderboardPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await leaderboardPage.clickEditFirstLeaderboard();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step2_after_refresh');
    });

    test('TC-28b Click Edit Leaderboard, then verify URL persists after Back and Forward', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await expect(leaderboardPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await leaderboardPage.clickEditFirstLeaderboard();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28b_step3_after_forward');
    });

    test('TC-29 Click Delete Leaderboard, then verify URL persists after reload', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await expect(leaderboardPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await leaderboardPage.clickDeleteFirstLeaderboard();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_step2_after_refresh');
    });

    test('TC-29b Click Delete Leaderboard, then verify URL persists after Back and Forward', async ({ page, sidebarPage, leaderboardPage }, testInfo) => {
        await expect(leaderboardPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await leaderboardPage.clickDeleteFirstLeaderboard();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29b_step1_after_actions');
        await sidebarPage.browserBack();
        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
    });
});

// ═══════════════════════════════════════════════════════════
//  Loyalty Promotions — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Loyalty Promotions - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToLoyaltyPromotions();
        await expect(page).toHaveURL(/loyalty-promotions/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-30 Navigate to Loyalty Promotions and verify URL persists after reload', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step1_on_loyalty_promotions');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(loyaltyPromotionsPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_step2_after_refresh');
    });

    test('TC-30b Navigate to Loyalty Promotions and verify URL persists after Back and Forward', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30b_step1_on_loyalty_promotions');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(loyaltyPromotionsPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30b_step3_after_forward');
    });

    test('TC-31 Select Region dropdown, then verify URL persists after reload', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(loyaltyPromotionsPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step2_after_refresh');
    });

    test('TC-31b Select Region dropdown, then verify URL persists after Back and Forward', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31b_step3_after_forward');
    });

    test('TC-32 Click Create Loyalty Promotion, then verify URL persists after reload', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegion('Betway Ghana');
        await expect(loyaltyPromotionsPage.createLoyaltyPromotionBtn).toBeVisible({ timeout: 30000 });
        await loyaltyPromotionsPage.clickCreateLoyaltyPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_step2_after_refresh');
    });

    test('TC-32b Click Create Loyalty Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegion('Betway Ghana');
        await expect(loyaltyPromotionsPage.createLoyaltyPromotionBtn).toBeVisible({ timeout: 30000 });
        await loyaltyPromotionsPage.clickCreateLoyaltyPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32b_step3_after_forward');
    });

    test('TC-33 Select Region and Create, then verify URL persists after reload', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegionAndCreate('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_step2_after_refresh');
    });

    test('TC-33b Select Region and Create, then verify URL persists after Back and Forward', async ({ page, sidebarPage, loyaltyPromotionsPage }, testInfo) => {
        await loyaltyPromotionsPage.selectRegionAndCreate('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Segment Schedule — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Segment Schedule - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToSegmentSchedule();
        await expect(page).toHaveURL(/segment-schedule/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-34 Navigate to Segment Schedule and verify URL persists after reload', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_step1_on_segment_schedule');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(segmentSchedulePage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_step2_after_refresh');
    });

    test('TC-34b Navigate to Segment Schedule and verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34b_step1_on_segment_schedule');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(segmentSchedulePage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34b_step3_after_forward');
    });

    test('TC-35 Select Region dropdown, then verify URL persists after reload', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(segmentSchedulePage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_step2_after_refresh');
    });

    test('TC-35b Select Region dropdown, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35b_step3_after_forward');
    });

    test('TC-36 Click Schedule Segment, then verify URL persists after reload', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegion('Betway Ghana');
        await expect(segmentSchedulePage.scheduleSegmentBtn).toBeVisible({ timeout: 30000 });
        await segmentSchedulePage.clickScheduleSegment();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_step2_after_refresh');
    });

    test('TC-36b Click Schedule Segment, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegion('Betway Ghana');
        await expect(segmentSchedulePage.scheduleSegmentBtn).toBeVisible({ timeout: 30000 });
        await segmentSchedulePage.clickScheduleSegment();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36b_step3_after_forward');
    });

    test('TC-37 Select Region and Schedule, then verify URL persists after reload', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegionAndSchedule('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_step2_after_refresh');
    });

    test('TC-37b Select Region and Schedule, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.selectRegionAndSchedule('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Segmentation — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Segmentation - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToSegmentation();
        await expect(page).toHaveURL(/segmentation/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-38 Navigate to Segmentation and verify URL persists after reload', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_step1_on_segmentation');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(segmentationPage.createSegmentBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_step2_after_refresh');
    });

    test('TC-38b Navigate to Segmentation and verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38b_step1_on_segmentation');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(segmentationPage.createSegmentBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38b_step3_after_forward');
    });

    test('TC-39 Click Create Segment, then verify URL persists after reload', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_step2_after_refresh');
    });

    test('TC-39b Click Create Segment, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await segmentationPage.clickCreateSegment();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39b_step3_after_forward');
    });

    test('TC-40 Click Edit Segment, then verify URL persists after reload', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickEditFirstSegment();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_step2_after_refresh');
    });

    test('TC-40b Click Edit Segment, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickEditFirstSegment();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40b_step3_after_forward');
    });

    test('TC-41 Click Export Segment, then verify URL persists after reload', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.exportBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickExportFirstSegment();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_step2_after_refresh');
    });

    test('TC-41b Click Export Segment, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.exportBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickExportFirstSegment();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41b_step3_after_forward');
    });

    test('TC-42 Click Delete Segment, then verify URL persists after reload', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickDeleteFirstSegment();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_step2_after_refresh');
    });

    test('TC-42b Click Delete Segment, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentationPage }, testInfo) => {
        await expect(segmentationPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await segmentationPage.clickDeleteFirstSegment();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42b_step3_after_forward');
    });
});


// ═══════════════════════════════════════════════════════════
//  Telegram Leaderboard — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Telegram Leaderboard - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTelegramLeaderboard();
        await expect(page).toHaveURL(/telegram-leaderboard/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-43 Navigate to Telegram Leaderboard and verify URL persists after reload', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_step1_on_telegram_leaderboard');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(telegramLeaderboardPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_step2_after_refresh');
    });

    test('TC-43b Navigate to Telegram Leaderboard and verify URL persists after Back and Forward', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43b_step1_on_telegram_leaderboard');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(telegramLeaderboardPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43b_step3_after_forward');
    });

    test('TC-44 Select Region, then verify URL persists after reload', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        await telegramLeaderboardPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_step2_after_refresh');
    });

    test('TC-44b Select Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        await telegramLeaderboardPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44b_step3_after_forward');
    });

    test('TC-45 Click Edit Telegram Leaderboard, then verify URL persists after reload', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        await expect(telegramLeaderboardPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await telegramLeaderboardPage.selectRegion('Betway Ghana');
        await expect(telegramLeaderboardPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await telegramLeaderboardPage.clickEditFirstTelegramLeaderboard();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_step2_after_refresh');
    });

    test('TC-45b Click Edit Telegram Leaderboard, then verify URL persists after Back and Forward', async ({ page, sidebarPage, telegramLeaderboardPage }, testInfo) => {
        await expect(telegramLeaderboardPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await telegramLeaderboardPage.selectRegion('Betway Ghana');
        await expect(telegramLeaderboardPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await telegramLeaderboardPage.clickEditFirstTelegramLeaderboard();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Toast Configuration — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Toast Configuration - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToToastConfig();
        await expect(page).toHaveURL(/toast-config/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-46 Navigate to Toast Configuration and verify URL persists after reload', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_step1_on_toast_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(toastConfigPage.createToastConfigBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_step2_after_refresh');
    });

    test('TC-46b Navigate to Toast Configuration and verify URL persists after Back and Forward', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46b_step1_on_toast_config');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(toastConfigPage.createToastConfigBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46b_step3_after_forward');
    });

    test('TC-47 Select Region, then verify URL persists after reload', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await toastConfigPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_step2_after_refresh');
    });

    test('TC-47b Select Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await toastConfigPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47b_step3_after_forward');
    });

    test('TC-48 Click Create Toast Config, then verify URL persists after reload', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await toastConfigPage.clickCreateToastConfig();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_step2_after_refresh');
    });

    test('TC-48b Click Create Toast Config, then verify URL persists after Back and Forward', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await toastConfigPage.clickCreateToastConfig();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48b_step3_after_forward');
    });

    test('TC-49 Click Edit Toast Config, then verify URL persists after reload', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await toastConfigPage.selectRegion('Betway Ghana');
        await expect(toastConfigPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await toastConfigPage.clickEditFirstToastConfig();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49_step2_after_refresh');
    });

    test('TC-49b Click Edit Toast Config, then verify URL persists after Back and Forward', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await toastConfigPage.selectRegion('Betway Ghana');
        await expect(toastConfigPage.editBtn.first()).toBeVisible({ timeout: 30000 });
        await toastConfigPage.clickEditFirstToastConfig();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49b_step3_after_forward');
    });

    test('TC-50 Click Delete Toast Config, then verify URL persists after reload', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await toastConfigPage.selectRegion('Betway Ghana');
        await expect(toastConfigPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await toastConfigPage.clickDeleteFirstToastConfig();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50_step2_after_refresh');
    });

    test('TC-50b Click Delete Toast Config, then verify URL persists after Back and Forward', async ({ page, sidebarPage, toastConfigPage }, testInfo) => {
        await expect(toastConfigPage.regionDropdown).toBeVisible({ timeout: 30000 });
        await toastConfigPage.selectRegion('Betway Ghana');
        await expect(toastConfigPage.deleteBtn.first()).toBeVisible({ timeout: 30000 });
        await toastConfigPage.clickDeleteFirstToastConfig();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Generic Wheel — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Generic Wheel - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToGenericWheel();
        await expect(page).toHaveURL(/generic-wheel/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-51 Navigate to Generic Wheel and verify URL persists after reload', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51_step1_on_generic_wheel');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(genericWheelPage.createPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51_step2_after_refresh');
    });

    test('TC-51b Navigate to Generic Wheel and verify URL persists after Back and Forward', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51b_step1_on_generic_wheel');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(genericWheelPage.createPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51b_step3_after_forward');
    });

    test('TC-52 Select Region, then verify URL persists after reload', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        await genericWheelPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_step2_after_refresh');
    });

    test('TC-52b Select Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        await genericWheelPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52b_step3_after_forward');
    });

    test('TC-53 Click Create Promotion, then verify URL persists after reload', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        await genericWheelPage.clickCreatePromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53_step2_after_refresh');
    });

    test('TC-53b Click Create Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, genericWheelPage }, testInfo) => {
        await genericWheelPage.clickCreatePromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Promotion Config — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Promotion Config - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToPromotionConfig();
        await expect(page).toHaveURL(/promotion-config/);
        await page.waitForLoadState('networkidle');
    });

    test('TC-55 Navigate to Promotion Config and verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55_step1_on_promotion_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(promotionConfigPage.createPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55_step2_after_refresh');
    });

    test('TC-55b Navigate to Promotion Config and verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55b_step1_on_promotion_config');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(promotionConfigPage.createPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-55b_step3_after_forward');
    });

    test('TC-56 Click Create Promotion, then verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickCreatePromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56_step2_after_refresh');
    });

    test('TC-56b Click Create Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickCreatePromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-56b_step3_after_forward');
    });
    test('TC-57 Click Edit Promotion, then verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickEditFirstPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57_step2_after_refresh');
    });

    test('TC-57b Click Edit Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickEditFirstPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-57b_step3_after_forward');
    });

    test('TC-58 Click Copy Promotion, then verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickCopyFirstPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58_step2_after_refresh');
    });

    test('TC-58b Click Copy Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickCopyFirstPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-58b_step3_after_forward');
    });

    test('TC-59 Click Schedule Promotion, then verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickScheduleFirstPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-59_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-59_step2_after_refresh');
    });

    test('TC-59b Click Schedule Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickScheduleFirstPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-59b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-59b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-59b_step3_after_forward');
    });

    test('TC-60 Click Delete Promotion, then verify URL persists after reload', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickDeleteFirstPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-60_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-60_step2_after_refresh');
    });

    test('TC-60b Click Delete Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionConfigPage }, testInfo) => {
        await promotionConfigPage.clickDeleteFirstPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-60b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-60b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-60b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Promotion Ordering — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Promotion Ordering - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToPromotionOrdering();
        await page.waitForLoadState('networkidle');
    });

    test('TC-61 Navigate to Promotion Ordering and verify URL persists after reload', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-61_step1_on_promotion_ordering');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-61_step2_after_refresh');
    });

    test('TC-61b Navigate to Promotion Ordering and verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-61b_step1_on_promotion_ordering');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-61b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-61b_step3_after_forward');
    });

    test('TC-62 Select Promo Type, then verify URL persists after reload', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-62_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-62_step2_after_refresh');
    });

    test('TC-62b Select Promo Type, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-62b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-62b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-62b_step3_after_forward');
    });

    test('TC-63 Select Promo Type and Region, then verify URL persists after reload', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');
        await promotionOrderingPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-63_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-63_step2_after_refresh');
    });

    test('TC-63b Select Promo Type and Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');
        await promotionOrderingPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-63b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-63b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await expect(promotionOrderingPage.promoTypeDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-63b_step3_after_forward');
    });

    test('TC-64 Click Add Promotion To Vertical, then verify URL persists after reload', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');
        await promotionOrderingPage.selectRegion('Betway Ghana');
        await promotionOrderingPage.clickAddPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-64_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-64_step2_after_refresh');
    });

    test('TC-64b Click Add Promotion To Vertical, then verify URL persists after Back and Forward', async ({ page, sidebarPage, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.selectPromoType('Standard');
        await promotionOrderingPage.selectRegion('Betway Ghana');
        await promotionOrderingPage.clickAddPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-64b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-64b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-64b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Scratch And Win Management — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Scratch And Win Management - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToScratchAndWin();
        await page.waitForLoadState('networkidle');
    });

    test('TC-65 Navigate to Scratch And Win Management and verify URL persists after reload', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-65_step1_on_scratch_and_win');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(scratchAndWinPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-65_step2_after_refresh');
    });

    test('TC-65b Navigate to Scratch And Win Management and verify URL persists after Back and Forward', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-65b_step1_on_scratch_and_win');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-65b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(scratchAndWinPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-65b_step3_after_forward');
    });

    test('TC-66 Select Region, then verify URL persists after reload', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        await scratchAndWinPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-66_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(scratchAndWinPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-66_step2_after_refresh');
    });

    test('TC-66b Select Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        await scratchAndWinPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-66b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-66b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await expect(scratchAndWinPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-66b_step3_after_forward');
    });

    test('TC-67 Click Create Promotion, then verify URL persists after reload', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        await scratchAndWinPage.selectRegion('Betway Ghana');
        await scratchAndWinPage.clickCreatePromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-67_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-67_step2_after_refresh');
    });

    test('TC-67b Click Create Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, scratchAndWinPage }, testInfo) => {
        await scratchAndWinPage.selectRegion('Betway Ghana');
        await scratchAndWinPage.clickCreatePromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-67b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-67b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-67b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Timed Promotions — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Timed Promotions - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTimedPromotions();
        await page.waitForLoadState('networkidle');
    });

    test('TC-68 Navigate to Timed Promotions and verify URL persists after reload', async ({ page, sidebarPage, timedPromotionsPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-68_step1_on_timed_promotions');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(timedPromotionsPage.createTimedPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-68_step2_after_refresh');
    });

    test('TC-68b Navigate to Timed Promotions and verify URL persists after Back and Forward', async ({ page, sidebarPage, timedPromotionsPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-68b_step1_on_timed_promotions');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-68b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(timedPromotionsPage.createTimedPromotionBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-68b_step3_after_forward');
    });

    test('TC-69 Click Create Timed Promotion, then verify URL persists after reload', async ({ page, sidebarPage, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickCreateTimedPromotion();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-69_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-69_step2_after_refresh');
    });

    test('TC-69b Click Create Timed Promotion, then verify URL persists after Back and Forward', async ({ page, sidebarPage, timedPromotionsPage }, testInfo) => {
        await timedPromotionsPage.clickCreateTimedPromotion();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-69b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-69b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-69b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Player Tagging — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Player Tagging - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToPlayerTagging();
        await page.waitForLoadState('networkidle');
    });

    test('TC-70 Navigate to Player Tagging and verify URL persists after reload', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-70_step1_on_player_tagging');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(playerTaggingPage.tagPlayerBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-70_step2_after_refresh');
    });

    test('TC-70b Navigate to Player Tagging and verify URL persists after Back and Forward', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-70b_step1_on_player_tagging');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-70b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(playerTaggingPage.tagPlayerBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-70b_step3_after_forward');
    });

    test('TC-71 Click Tag Player, then verify URL persists after reload', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        await playerTaggingPage.clickTagPlayer();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-71_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-71_step2_after_refresh');
    });

    test('TC-71b Click Tag Player, then verify URL persists after Back and Forward', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        await playerTaggingPage.clickTagPlayer();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-71b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-71b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-71b_step3_after_forward');
    });

    test('TC-72 Click Tag List, then verify URL persists after reload', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        await playerTaggingPage.clickTagList();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-72_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-72_step2_after_refresh');
    });

    test('TC-72b Click Tag List, then verify URL persists after Back and Forward', async ({ page, sidebarPage, playerTaggingPage }, testInfo) => {
        await playerTaggingPage.clickTagList();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-72b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-72b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-72b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Player Tagging Logs — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Player Tagging Logs - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToPlayerTaggingLogs();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/player-tagging-logs/);
    });

    test('TC-73 Navigate to Player Tagging Logs and verify URL persists after reload', async ({ page, sidebarPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-73_step1_on_player_tagging_logs');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-73_step2_after_refresh');
    });

    test('TC-73b Navigate to Player Tagging Logs and verify URL persists after Back and Forward', async ({ page, sidebarPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-73b_step1_on_player_tagging_logs');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-73b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-73b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Segment Tagging — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Segment Tagging - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToSegmentTagging();
        await page.waitForLoadState('networkidle');
    });

    test('TC-74 Navigate to Segment Tagging and verify URL persists after reload', async ({ page, sidebarPage, segmentTaggingPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-74_step1_on_segment_tagging');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(segmentTaggingPage.createSegmentationTagBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-74_step2_after_refresh');
    });

    test('TC-74b Navigate to Segment Tagging and verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentTaggingPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-74b_step1_on_segment_tagging');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-74b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(segmentTaggingPage.createSegmentationTagBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-74b_step3_after_forward');
    });

    test('TC-75 Click Create Segmentation Tag, then verify URL persists after reload', async ({ page, sidebarPage, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickCreateSegmentationTag();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-75_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-75_step2_after_refresh');
    });

    test('TC-75b Click Create Segmentation Tag, then verify URL persists after Back and Forward', async ({ page, sidebarPage, segmentTaggingPage }, testInfo) => {
        await segmentTaggingPage.clickCreateSegmentationTag();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-75b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-75b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-75b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Tag Configuration — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Tag Configuration - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTagConfig();
        await page.waitForLoadState('networkidle');
    });

    test('TC-76 Navigate to Tag Configuration and verify URL persists after reload', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-76_step1_on_tag_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(tagConfigPage.createTagBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-76_step2_after_refresh');
    });

    test('TC-76b Navigate to Tag Configuration and verify URL persists after Back and Forward', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-76b_step1_on_tag_config');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-76b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(tagConfigPage.createTagBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-76b_step3_after_forward');
    });

    test('TC-77 Click Create Tag, then verify URL persists after reload', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        await tagConfigPage.clickCreateTag();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-77_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-77_step2_after_refresh');
    });

    test('TC-77b Click Create Tag, then verify URL persists after Back and Forward', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        await tagConfigPage.clickCreateTag();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-77b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-77b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-77b_step3_after_forward');
    });

    test('TC-78 Click Edit, then verify URL persists after reload', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        await tagConfigPage.clickEdit();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-78_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-78_step2_after_refresh');
    });

    test('TC-78b Click Edit, then verify URL persists after Back and Forward', async ({ page, sidebarPage, tagConfigPage }, testInfo) => {
        await tagConfigPage.clickEdit();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-78b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-78b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-78b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Tutorial Configuration — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Tutorial Configuration - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTutorialConfig();
        await page.waitForLoadState('networkidle');
    });

    test('TC-79 Navigate to Tutorial Configuration and verify URL persists after reload', async ({ page, sidebarPage, tutorialConfigPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-79_step1_on_tutorial_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(tutorialConfigPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-79_step2_after_refresh');
    });

    test('TC-79b Navigate to Tutorial Configuration and verify URL persists after Back and Forward', async ({ page, sidebarPage, tutorialConfigPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-79b_step1_on_tutorial_config');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-79b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(tutorialConfigPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-79b_step3_after_forward');
    });

    test('TC-80 Click Create Config, then verify URL persists after reload', async ({ page, sidebarPage, tutorialConfigPage }, testInfo) => {
        await tutorialConfigPage.selectRegion('Betway Ghana');
        await tutorialConfigPage.clickCreateConfig();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-80_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-80_step2_after_refresh');
    });

    test('TC-80b Click Create Config, then verify URL persists after Back and Forward', async ({ page, sidebarPage, tutorialConfigPage }, testInfo) => {
        await tutorialConfigPage.selectRegion('Betway Ghana');
        await tutorialConfigPage.clickCreateConfig();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-80b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-80b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-80b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Tutorial Ordering — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Tutorial Ordering - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTutorialOrdering();
        await page.waitForLoadState('networkidle');
    });

    test('TC-81 Navigate to Tutorial Ordering and verify URL persists after reload', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-81_step1_on_tutorial_ordering');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(tutorialOrderingPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-81_step2_after_refresh');
    });

    test('TC-81b Navigate to Tutorial Ordering and verify URL persists after Back and Forward', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-81b_step1_on_tutorial_ordering');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-81b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(tutorialOrderingPage.regionDropdown).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-81b_step3_after_forward');
    });

    test('TC-82 Select Region, then verify URL persists after reload', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
        await tutorialOrderingPage.selectRegion('Betway Ghana');

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-82_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-82_step2_after_refresh');
    });

    test('TC-82b Select Region, then verify URL persists after Back and Forward', async ({ page, sidebarPage, tutorialOrderingPage }, testInfo) => {
        await tutorialOrderingPage.selectRegion('Betway Ghana');
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-82b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-82b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-82b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Comp Alerts — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Comp Alerts - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCompAlerts();
        await page.waitForLoadState('networkidle');
    });

    test('TC-83 Navigate to Comp Alerts and verify URL persists after reload', async ({ page, sidebarPage, compAlertsPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-83_step1_on_comp_alerts');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(compAlertsPage.createAlertBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-83_step2_after_refresh');
    });

    test('TC-83b Navigate to Comp Alerts and verify URL persists after Back and Forward', async ({ page, sidebarPage, compAlertsPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-83b_step1_on_comp_alerts');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-83b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(compAlertsPage.createAlertBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-83b_step3_after_forward');
    });

    test('TC-84 Click Create Alert, then verify URL persists after reload', async ({ page, sidebarPage, compAlertsPage }, testInfo) => {
        await compAlertsPage.clickCreateAlert();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-84_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-84_step2_after_refresh');
    });

    test('TC-84b Click Create Alert, then verify URL persists after Back and Forward', async ({ page, sidebarPage, compAlertsPage }, testInfo) => {
        await compAlertsPage.clickCreateAlert();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-84b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-84b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-84b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Comps Bulk — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Comps Bulk - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCompsBulk();
        await page.waitForLoadState('networkidle');
    });

    test('TC-85 Navigate to Comps Bulk and verify URL persists after reload', async ({ page, sidebarPage, compsBulkPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-85_step1_on_comps_bulk');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(compsBulkPage.createBulkCompBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-85_step2_after_refresh');
    });

    test('TC-85b Navigate to Comps Bulk and verify URL persists after Back and Forward', async ({ page, sidebarPage, compsBulkPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-85b_step1_on_comps_bulk');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-85b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(compsBulkPage.createBulkCompBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-85b_step3_after_forward');
    });

    test('TC-86 Click Setup Bulk Comp, then verify URL persists after reload', async ({ page, sidebarPage, compsBulkPage }, testInfo) => {
        await compsBulkPage.clickCreateBulkComp();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-86_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-86_step2_after_refresh');
    });

    test('TC-86b Click Setup Bulk Comp, then verify URL persists after Back and Forward', async ({ page, sidebarPage, compsBulkPage }, testInfo) => {
        await compsBulkPage.clickCreateBulkComp();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-86b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-86b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-86b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Comp Config — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Comp Config - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToCompConfig();
        await page.waitForLoadState('networkidle');
    });

    test('TC-87 Navigate to Comp Config and verify URL persists after reload', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-87_step1_on_comp_config');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(compConfigPage.payoutReportBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-87_step2_after_refresh');
    });

    test('TC-87b Navigate to Comp Config and verify URL persists after Back and Forward', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-87b_step1_on_comp_config');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-87b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(compConfigPage.payoutReportBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-87b_step3_after_forward');
    });

    test('TC-88 Click Payout Report, then verify URL persists after reload', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        await compConfigPage.clickPayoutReport();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-88_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-88_step2_after_refresh');
    });

    test('TC-88b Click Payout Report, then verify URL persists after Back and Forward', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        await compConfigPage.clickPayoutReport();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-88b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-88b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-88b_step3_after_forward');
    });

    test('TC-89 Click Create Comp, then verify URL persists after reload', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        await compConfigPage.clickCreateComp();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-89_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-89_step2_after_refresh');
    });

    test('TC-89b Click Create Comp, then verify URL persists after Back and Forward', async ({ page, sidebarPage, compConfigPage }, testInfo) => {
        await compConfigPage.clickCreateComp();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-89b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-89b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-89b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Manual Comps — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Manual Comps - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToManualComps();
        await page.waitForLoadState('networkidle');
    });

    test('TC-90 Navigate to Manual Comps and verify URL persists after reload', async ({ page, sidebarPage, manualCompsPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-90_step1_on_manual_comps');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(manualCompsPage.createManualCompBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-90_step2_after_refresh');
    });

    test('TC-90b Navigate to Manual Comps and verify URL persists after Back and Forward', async ({ page, sidebarPage, manualCompsPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-90b_step1_on_manual_comps');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-90b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(manualCompsPage.createManualCompBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-90b_step3_after_forward');
    });

    test('TC-91 Click Create Manual Comp, then verify URL persists after reload', async ({ page, sidebarPage, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-91_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-91_step2_after_refresh');
    });

    test('TC-91b Click Create Manual Comp, then verify URL persists after Back and Forward', async ({ page, sidebarPage, manualCompsPage }, testInfo) => {
        await manualCompsPage.clickCreateManualComp();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-91b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-91b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-91b_step3_after_forward');
    });
});

// ═══════════════════════════════════════════════════════════
//  Transaction Types — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Transaction Types - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToTransactionTypes();
        await page.waitForLoadState('networkidle');
    });

    test('TC-92 Navigate to Transaction Types and verify URL persists after reload', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-92_step1_on_transaction_types');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(transactionTypesPage.createTransactionTypeBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-92_step2_after_refresh');
    });

    test('TC-92b Navigate to Transaction Types and verify URL persists after Back and Forward', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-92b_step1_on_transaction_types');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-92b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(transactionTypesPage.createTransactionTypeBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-92b_step3_after_forward');
    });

    test('TC-93 Click Create Transaction Type, then verify URL persists after reload', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        await transactionTypesPage.clickCreateTransactionType();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-93_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-93_step2_after_refresh');
    });

    test('TC-93b Click Create Transaction Type, then verify URL persists after Back and Forward', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        await transactionTypesPage.clickCreateTransactionType();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-93b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-93b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-93b_step3_after_forward');
    });

    test('TC-94 Click Edit, then verify URL persists after reload', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        // Checking if Edit is visible, might need data to be present
        if (await transactionTypesPage.editBtn.isVisible()) {
            await transactionTypesPage.clickEdit();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-94_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-94_step2_after_refresh');
        } else {
            console.log("Edit button not visible, skipping TC-94 core logic");
        }
    });

    test('TC-95 Click Delete, then verify URL persists after reload', async ({ page, sidebarPage, transactionTypesPage }, testInfo) => {
        if (await transactionTypesPage.deleteBtn.isVisible()) {
            await transactionTypesPage.clickDelete();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-95_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-95_step2_after_refresh');
        } else {
            console.log("Delete button not visible, skipping TC-95 core logic");
        }
    });
});

// ═══════════════════════════════════════════════════════════
//  Admin Accounts — Route Persistence on Refresh / Back / Forward
// ═══════════════════════════════════════════════════════════

test.describe('Admin Accounts - Route Persistence', () => {

    test.beforeEach(async ({ page, sidebarPage }) => {
        await page.goto('/main/home');
        // Deep-link navigation via sidebar click doesn't always fully hydrate
        // the Angular/Stencil component before the click fires — a reload here
        // reliably forces it to initialize from scratch, matching the fix
        // already proven in the Banner Config/Ordering blocks above (confirmed
        // live: without it, the sidebar click silently no-ops and the URL gets
        // stuck on /main/home while a loading overlay lingers on screen).
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToAdminAccounts();
        await page.waitForLoadState('networkidle');
    });

    test('TC-96 Navigate to Admin Accounts and verify URL persists after reload', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-96_step1_on_admin_accounts');

        const urlBeforeRefresh = page.url();
        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await expect(adminAccountsPage.createAccountBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-96_step2_after_refresh');
    });

    test('TC-96b Navigate to Admin Accounts and verify URL persists after Back and Forward', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        const targetUrl = page.url();
        const homeUrl = new URL('/main/home', page.url()).href;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-96b_step1_on_admin_accounts');

        await sidebarPage.browserBack();
        expect(page.url()).toBe(homeUrl);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-96b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(targetUrl);
        await expect(adminAccountsPage.createAccountBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-96b_step3_after_forward');
    });

    test('TC-97 Click Create Account, then verify URL persists after reload', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion('Betway Ghana');
        await adminAccountsPage.clickCreateAccount();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-97_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-97_step2_after_refresh');
    });

    test('TC-97b Click Create Account, then verify URL persists after Back and Forward', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.selectRegion('Betway Ghana');
        await adminAccountsPage.clickCreateAccount();
        const urlAfterActions = page.url();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-97b_step1_after_actions');

        await sidebarPage.browserBack();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-97b_step2_after_back');

        await sidebarPage.browserForward();
        expect(page.url()).toBe(urlAfterActions);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-97b_step3_after_forward');
    });

    test('TC-98 Click Delete, then verify URL persists after reload', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        // Checking if Delete is visible, might need data to be present
        if (await adminAccountsPage.deleteBtn.first().isVisible()) {
            await adminAccountsPage.clickDeleteFirst();

            const urlBeforeRefresh = page.url();
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-98_step1_before_refresh');

            await sidebarPage.browserRefresh();

            expect(page.url()).toBe(urlBeforeRefresh);
            await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-98_step2_after_refresh');
        } else {
            console.log("Delete button not visible, skipping TC-98 core logic");
        }
    });

    test('TC-99 Click Region Dropdown, then verify URL persists after reload', async ({ page, sidebarPage, adminAccountsPage }, testInfo) => {
        await adminAccountsPage.clickRegionDropdown();

        const urlBeforeRefresh = page.url();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-99_step1_before_refresh');

        await sidebarPage.browserRefresh();

        expect(page.url()).toBe(urlBeforeRefresh);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-99_step2_after_refresh');
    });






});





























// // // ═══════════════════════════════════════════════════════════
// // //  Message Categories — Route Persistence on Refresh / Back / Forward
// // // ═══════════════════════════════════════════════════════════

// // test.describe('Message Categories - Route Persistence', () => {

// //     test.beforeEach(async ({ page, sidebarPage }) => {
// //         await page.goto('/main/home');
// //         await sidebarPage.waitForPageLoad();
// //         await sidebarPage.navigateToMessageCategories();
// //         await page.waitForLoadState('networkidle');
// //     });

// //     test('TC-100 Navigate to Message Categories and verify URL persists after reload', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-100_step1_on_message_categories');

// //         const urlBeforeRefresh = page.url();
// //         await sidebarPage.browserRefresh();

// //         expect(page.url()).toBe(urlBeforeRefresh);
// //         await expect(messageCategoriesPage.createCategoryBtn).toBeVisible({ timeout: 20000 });
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-100_step2_after_refresh');
// //     });

// //     test('TC-100b Navigate to Message Categories and verify URL persists after Back and Forward', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         const targetUrl = page.url();
// //         const homeUrl = new URL('/main/home', page.url()).href;

// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-100b_step1_on_message_categories');

// //         await sidebarPage.browserBack();
// //         expect(page.url()).toBe(homeUrl);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-100b_step2_after_back');

// //         await sidebarPage.browserForward();
// //         expect(page.url()).toBe(targetUrl);
// //         await expect(messageCategoriesPage.createCategoryBtn).toBeVisible({ timeout: 20000 });
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-100b_step3_after_forward');
// //     });

// //     test('TC-101 Click Create Category, then verify URL persists after reload', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         await messageCategoriesPage.clickCreateCategory();

// //         const urlBeforeRefresh = page.url();
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-101_step1_before_refresh');

// //         await sidebarPage.browserRefresh();

// //         expect(page.url()).toBe(urlBeforeRefresh);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-101_step2_after_refresh');
// //     });

// //     test('TC-101b Click Create Category, then verify URL persists after Back and Forward', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         await messageCategoriesPage.clickCreateCategory();
// //         const urlAfterActions = page.url();

// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-101b_step1_after_actions');

// //         await sidebarPage.browserBack();
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-101b_step2_after_back');

// //         await sidebarPage.browserForward();
// //         expect(page.url()).toBe(urlAfterActions);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-101b_step3_after_forward');
// //     });

// //     test('TC-102 Click Edit, then verify URL persists after reload', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         // Checking if Edit is visible, might need data to be present
// //         if (await messageCategoriesPage.editBtn.isVisible()) {
// //             await messageCategoriesPage.clickEdit();

// //             const urlBeforeRefresh = page.url();
// //             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-102_step1_before_refresh');

// //             await sidebarPage.browserRefresh();

// //             expect(page.url()).toBe(urlBeforeRefresh);
// //             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-102_step2_after_refresh');
// //         } else {
// //             console.log("Edit button not visible, skipping TC-102 core logic");
// //         }
// //     });

// //     test('TC-103 Click Delete, then verify URL persists after reload', async ({ page, sidebarPage, messageCategoriesPage }, testInfo) => {
// //         if (await messageCategoriesPage.deleteBtn.isVisible()) {
// //             await messageCategoriesPage.clickDelete();

// //             const urlBeforeRefresh = page.url();
// //             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-103_step1_before_refresh');

// //             await sidebarPage.browserRefresh();

// //             expect(page.url()).toBe(urlBeforeRefresh);
// //             await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-103_step2_after_refresh');
// //         } else {
// //             console.log("Delete button not visible, skipping TC-103 core logic");
// //         }
// //     });
// // });

// // // ═══════════════════════════════════════════════════════════
// // //  Message CTA — Route Persistence on Refresh / Back / Forward
// // // ═══════════════════════════════════════════════════════════

// // test.describe('Message CTA - Route Persistence', () => {

// //     test.beforeEach(async ({ page, sidebarPage }) => {
// //         await page.goto('/main/home');
// //         await sidebarPage.waitForPageLoad();
// //         await sidebarPage.navigateToMessageCTA();
// //         await page.waitForLoadState('networkidle');
// //     });

// //     test('TC-104 Navigate to Message CTA and verify URL persists after reload', async ({ page, sidebarPage, messageCTAPage }, testInfo) => {
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-104_step1_on_message_cta');

// //         const urlBeforeRefresh = page.url();
// //         await sidebarPage.browserRefresh();

// //         expect(page.url()).toBe(urlBeforeRefresh);
// //         await expect(messageCTAPage.createCTABtn).toBeVisible({ timeout: 20000 });
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-104_step2_after_refresh');
// //     });

// //     test('TC-104b Navigate to Message CTA and verify URL persists after Back and Forward', async ({ page, sidebarPage, messageCTAPage }, testInfo) => {
// //         const targetUrl = page.url();
// //         const homeUrl = new URL('/main/home', page.url()).href;

// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-104b_step1_on_message_cta');

// //         await sidebarPage.browserBack();
// //         expect(page.url()).toBe(homeUrl);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-104b_step2_after_back');

// //         await sidebarPage.browserForward();
// //         expect(page.url()).toBe(targetUrl);
// //         await expect(messageCTAPage.createCTABtn).toBeVisible({ timeout: 20000 });
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-104b_step3_after_forward');
// //     });

// //     test('TC-105 Click Create CTA, then verify URL persists after reload', async ({ page, sidebarPage, messageCTAPage }, testInfo) => {
// //         await messageCTAPage.clickCreateCTA();

// //         const urlBeforeRefresh = page.url();
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-105_step1_before_refresh');

// //         await sidebarPage.browserRefresh();

// //         expect(page.url()).toBe(urlBeforeRefresh);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-105_step2_after_refresh');
// //     });

// //     test('TC-105b Click Create CTA, then verify URL persists after Back and Forward', async ({ page, sidebarPage, messageCTAPage }, testInfo) => {
// //         await messageCTAPage.clickCreateCTA();
// //         const urlAfterActions = page.url();

// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-105b_step1_after_actions');

// //         await sidebarPage.browserBack();
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-105b_step2_after_back');

// //         await sidebarPage.browserForward();
// //         expect(page.url()).toBe(urlAfterActions);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-105b_step3_after_forward');
// //     });

// //     test('TC-106 Click Region Dropdown, then verify URL persists after reload', async ({ page, sidebarPage, messageCTAPage }, testInfo) => {
// //         await messageCTAPage.clickRegionDropdown();

// //         const urlBeforeRefresh = page.url();
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-106_step1_before_refresh');

// //         await sidebarPage.browserRefresh();

// //         expect(page.url()).toBe(urlBeforeRefresh);
// //         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-106_step2_after_refresh');
// //     });
// });

