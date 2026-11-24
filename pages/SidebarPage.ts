import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { sidebarLocators } from '../locators/sidebarLocators';

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR — rebuilt after a full hamburger-menu UI redesign (confirmed live via full
// outerHTML dump of the sidebar container). The app switched from a PrimeNG-based sidebar
// (`span.menuitem-text`, `<a>` leaf links) to a shadcn/ui-style `Sidebar` component:
//
//  - Every level (root items like "Marketing"/"Platform" AND nested items) shares one
//    recursive shape: `<li data-slot="sidebar-menu-item"|"sidebar-menu-sub-item">` wraps a
//    `<button data-slot="sidebar-menu-button"|"sidebar-menu-sub-button">`.
//  - The label text lives two levels deep: `<span data-slot="sidebar-menu-label">`
//    wraps `<span class="truncate ...">LABEL</span>`.
//  - A button that has children carries a trailing chevron span and is immediately followed
//    (as a SIBLING, not a child) by `<div data-slot="sidebar-menu-collapse" data-state="open"|
//    "closed">` wrapping the nested `<ul data-slot="sidebar-menu-sub">`. A leaf button has
//    neither.
//  - Leaves are plain `<button>` elements now — there is no `<a>` wrapper anymore, which is
//    why the old `dispatchEvent` workarounds that specifically targeted `page.locator('a', {
//    has: leafNode })` (Tutorial Configuration/Tutorial Ordering) no longer apply structurally.
//  - `data-state` is a reliable, explicit open/closed signal (unlike the old UI, where every
//    node reported `isVisible()=true` even while its submenu was collapsed, forcing an
//    "always click unconditionally" workaround).
//
// Confirmed live: every item's label text and the overall Marketing/Platform/System Admin/
// Workflow Management/ASCII/Gamification hierarchy is otherwise IDENTICAL to the old sidebar
// (same app, new chrome) — `sidebarLocators.ts`'s plain label strings needed no changes.
//
// NOT independently re-confirmed after this rewrite (the old DOM-overlap bugs on Tutorial
// Configuration/Ordering, Segmentation, and Comp Config were about literal CSS/z-index overlap
// with a sibling element, a layout detail that may or may not still reproduce in the rebuilt
// component — flag if any of these resurface so a targeted fix can be added with real
// evidence, rather than guessing one back in preemptively).
// ═══════════════════════════════════════════════════════════════════════════════

export class SidebarPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /** Locates a sidebar item (root or nested, parent or leaf) by its exact label text.
     * Scoped to `[data-slot="sidebar-menu-label"]`, a wrapper unique to this sidebar
     * component, so there's no risk of colliding with an unrelated `.truncate` element
     * elsewhere in the app. `:text-is()` matches the span's own exact text, so "Promotions"
     * never matches "Cashback Promotions" etc. */
    private menuLabel(label: string): Locator {
        return this.page.locator(`[data-slot="sidebar-menu-label"] span.truncate:text-is("${label}")`).first();
    }

    private menuButton(label: string): Locator {
        return this.menuLabel(label).locator('xpath=ancestor::button[1]');
    }

    /** The `data-slot="sidebar-menu-collapse"` div is a SIBLING of the button (confirmed
     * live), not a descendant — its `data-state` attribute is the authoritative open/closed
     * signal for that button's submenu. */
    private collapseFor(button: Locator): Locator {
        return button.locator('xpath=following-sibling::div[@data-slot="sidebar-menu-collapse"][1]');
    }

    /**
     * Confirms the app actually finished loading after a fresh page.goto/reload — the
     * sidebar (and "Marketing" specifically) can intermittently fail to render on the
     * first load. If "Marketing" isn't visible within the timeout, reloads and checks
     * again (a few times) rather than immediately failing whatever test called this.
     */
    async waitForAppReady() {
        const marketingNode = this.menuLabel(sidebarLocators.menuMarketing);
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
            const ready = await marketingNode.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
            if (ready) return;

            console.log(`App not ready after load (attempt ${attempt}/${maxAttempts}) — reloading...`);
            await this.page.reload();
            await this.page.waitForLoadState('domcontentloaded');
        }
        // Final attempt: let the caller's own error surface if this still isn't visible.
        await marketingNode.waitFor({ state: 'visible' });
    }

    /** Clicks a parent menu item and waits for its submenu to report `data-state="open"` —
     * a no-op if it's already open. Retries the click once if the state doesn't flip, rather
     * than trusting a single click blindly (mirrors the retry spirit of the old
     * "always click, absorb any toggle mismatch" approach, but now backed by a real signal
     * instead of guessing). */
    private async expandMenu(label: string) {
        const button = this.menuButton(label);
        const collapse = this.collapseFor(button);

        const alreadyOpen = await collapse.getAttribute('data-state').catch(() => null);
        if (alreadyOpen === 'open') return;

        for (let attempt = 1; attempt <= 2; attempt++) {
            await button.scrollIntoViewIfNeeded().catch(() => {});
            await this.clickElement(button);
            const opened = await expect(collapse)
                .toHaveAttribute('data-state', 'open', { timeout: 5000 })
                .then(() => true)
                .catch(() => false);
            if (opened) return;
            console.log(`"${label}" did not report data-state="open" after click (attempt ${attempt}/2) — retrying...`);
        }
        // Let the real assertion error surface on the final attempt's own timeout context.
        await expect(collapse, `Expected "${label}" to expand (data-state="open")`).toHaveAttribute('data-state', 'open', { timeout: 5000 });
    }

    /** Expands every parent in `path` (all entries except the last) in order, then clicks the
     * final entry (the leaf) and waits for the resulting navigation to settle. Retries the
     * whole sequence up to 3 times, since a slow render or a missed click anywhere along the
     * path otherwise leaves the test stuck on the wrong page with no obvious cause. */
    private async navigateViaMenu(path: string[]) {
        let lastError: unknown;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                for (let i = 0; i < path.length - 1; i++) {
                    await this.expandMenu(path[i]);
                }
                const leafButton = this.menuButton(path[path.length - 1]);
                await leafButton.scrollIntoViewIfNeeded().catch(() => {});
                await this.clickElement(leafButton);
                await this.page.waitForLoadState('domcontentloaded');
                return;
            } catch (error) {
                lastError = error;
                console.warn(`Sidebar navigation attempt ${attempt}/3 for [${path.join(' -> ')}] failed (at ${this.page.url()}): ${error}`);
            }
        }
        throw new Error(`Sidebar navigation failed for [${path.join(' -> ')}], ended at ${this.page.url()}: ${lastError}`);
    }

    async navigateToBannerConfig() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Config');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuBannerManagement, sidebarLocators.menuBannerConfig]);
    }

    async navigateToCampaign() {
        console.log('Navigating via Sidebar: Marketing -> Campaign');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuCampaign]);
    }

    async navigateToCashbackPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Cashback Promotions');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuCashbackPromotions]);
    }

    async navigateToBannerOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Ordering');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuBannerManagement, sidebarLocators.menuBannerOrdering]);
    }

    async navigateToTutorialConfig() {
        console.log('Navigating via Sidebar: Marketing -> Tutorials -> Tutorial Configuration');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTutorial, sidebarLocators.menuTutorialConfig]);
    }

    async navigateToCouponManagement() {
        console.log('Navigating via Sidebar: Marketing -> Coupon Management');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuCouponManagement]);
    }

    async navigateToEventCalendar() {
        console.log('Navigating via Sidebar: Marketing -> Event Calendar');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuEventCalendar]);
    }

    async navigateToFanExclusive() {
        console.log('Navigating via Sidebar: Marketing -> Fan Exclusive');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuFanExclusive]);
    }

    async navigateToLeaderboard() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Leaderboard');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuLeaderboard]);
    }

    async navigateToLoyaltyPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Loyalty Promotions');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuLoyaltyPromotions]);
    }

    async navigateToSegmentSchedule() {
        console.log('Navigating via Sidebar: Marketing -> Segment Schedule');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuSegmentSchedule]);
    }

    async navigateToRecurringRewards() {
        console.log('Navigating via Sidebar: Marketing -> Recurring Rewards');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuRecurringRewards]);
    }

    async navigateToBetPromotionRules() {
        console.log('Navigating via Sidebar: Workflow Management -> Bet Promotion Rules');
        await this.navigateViaMenu([sidebarLocators.menuWorkflowManagement, sidebarLocators.menuBetPromotionRules]);
    }

    async navigateToPrizeDraw() {
        console.log('Navigating via Sidebar: Workflow Management -> Prize Draw');
        await this.navigateViaMenu([sidebarLocators.menuWorkflowManagement, sidebarLocators.menuPrizeDraw]);
    }

    async navigateToRulesEngine() {
        console.log('Navigating via Sidebar: Marketing -> Rules Engine');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuRulesEngine]);
    }

    async navigateToSegmentation() {
        console.log('Navigating via Sidebar: Marketing -> Segmentation');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuSegmentation]);
    }

    async navigateToTelegramLeaderboard() {
        console.log('Navigating via Sidebar: Marketing -> Telegram Leaderboard');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTelegramLeaderboard]);
    }

    async navigateToToastConfig() {
        console.log('Navigating via Sidebar: Marketing -> Toast Configuration');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuToastConfig]);
    }

    async navigateToInternalNotifications() {
        console.log('Navigating via Sidebar: System Admin -> Internal Notifications');
        await this.navigateViaMenu([sidebarLocators.menuSystemAdmin, sidebarLocators.menuInternalNotification]);
    }

    async navigateToGenericWheel() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Generic Wheel');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuGenericWheel]);
    }

    async navigateToGenericPredictor() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Generic Predictor');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuGenericPredictor]);
    }

    async navigateToPromotionConfig() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Promotion Config');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuPromotionConfig]);
    }

    async navigateToPromotionOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Promotion Ordering');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuPromotionOrdering]);
    }

    async navigateToScratchAndWin() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Scratch And Win Management');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuScratchAndWin]);
    }

    async navigateToTimedPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Timed Promotions');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuTimedPromotions]);
    }

    async navigateToLadderPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Ladder Promotions');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuPromotions, sidebarLocators.menuLadderPromotions]);
    }

    async navigateToPlayerTagging() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Player Tagging');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTagManagement, sidebarLocators.menuPlayerTagging]);
    }

    async navigateToPlayerTaggingLogs() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Player Tagging Logs');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTagManagement, sidebarLocators.menuPlayerTaggingLogs]);
    }

    async navigateToSegmentTagging() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Segment Tagging');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTagManagement, sidebarLocators.menuSegmentTagging]);
    }

    async navigateToTagConfig() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Tag Configuration');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTagManagement, sidebarLocators.menuTagConfig]);
    }

    async navigateToAutoOptInConfig() {
        console.log('Navigating via Sidebar: Marketing -> Opt In Configuration -> Auto Opt In Config');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuOptInConfiguration, sidebarLocators.menuAutoOptInConfig]);
    }

    async navigateToOptInExpiry() {
        console.log('Navigating via Sidebar: Marketing -> Opt In Configuration -> Opt In Expiry');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuOptInConfiguration, sidebarLocators.menuOptInExpiry]);
    }

    async navigateToTutorialOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Tutorial -> Tutorial Ordering');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuTutorial, sidebarLocators.menuTutorialOrdering]);
    }

    async navigateToCompAlerts() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Alerts');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuCompAlerts]);
    }

    async navigateToCompsBulk() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comps Bulk');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuCompsBulk]);
    }

    async navigateToCompConfig() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Config');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuCompConfig]);
    }

    async navigateToCompPayoutDetails() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Payout Details');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuCompPayoutDetails]);
    }

    async navigateToCompPayoutErrorDetails() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Payout Error Details');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuCompPayoutErrorDetails]);
    }

    async navigateToManualComps() {
        console.log('Navigating via Sidebar: Marketing Comps -> Manual Comps');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuManualComps]);
    }

    async navigateToLapseCompManagement() {
        console.log('Navigating via Sidebar: Marketing Comps -> Lapse Comp Management');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuLapseCompManagement]);
    }

    async navigateToTransactionTypes() {
        console.log('Navigating via Sidebar: Marketing Comps -> Transaction Types');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuMarketingComps, sidebarLocators.menuTransactionTypes]);
    }

    async navigateToAdminAccounts() {
        console.log('Navigating via Sidebar: Notification Management -> Admin Accounts');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuNotificationManagement, sidebarLocators.menuAdminAccounts]);
    }

    async navigateToMessageCategories() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message Categories');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuNotificationManagement, sidebarLocators.menuMessageCategories]);
    }

    async navigateToMessageTemplates() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message Templates');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuNotificationManagement, sidebarLocators.menuMessageTemplates]);
    }

    async navigateToMessageCTA() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message CTA');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuNotificationManagement, sidebarLocators.menuMessageCTA]);
    }

    async navigateToWhitelistTestAccounts() {
        console.log('Navigating via Sidebar: Marketing -> Whitelist Test Accounts');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuWhitelistTestAccounts]);
    }

    async navigateToNotificationSchedule() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Notification Schedule');
        await this.navigateViaMenu([sidebarLocators.menuMarketing, sidebarLocators.menuNotificationManagement, sidebarLocators.menuNotificationSchedule]);
    }

    async navigateToFormBuilder() {
        console.log('Navigating via Sidebar: Platform -> Form Builder Configuration -> Form Builder');
        await this.navigateViaMenu([sidebarLocators.menuPlatform, sidebarLocators.menuFormBuilderConfiguration, sidebarLocators.menuFormBuilder]);
        await this.page.waitForURL(/.*form-builder/, { timeout: 30000 });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
    }

    async navigateToStencilConfig() {
        console.log('Navigating via Sidebar: System Admin -> Stencil Configuration');
        await this.navigateViaMenu([sidebarLocators.menuSystemAdmin, sidebarLocators.menuStencilConfig]);
        await this.page.waitForURL(/.*stencil/, { timeout: 30000 });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }
}
