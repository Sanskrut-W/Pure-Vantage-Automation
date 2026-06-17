/**
 * componentUrlConfig.ts
 *
 * Central configuration for every sub-component / page in the PureVantage app.
 * Used by tests/directUrlCheck.spec.ts to verify that pasting a URL directly
 * in the browser tab opens the correct page.
 *
 * Fields:
 *   name            – Human-readable component name (shown in test report)
 *   url             – Absolute path to paste directly in the browser
 *   urlPattern      – RegExp the final URL must match (redirect-safe check)
 *   verificationLocator – CSS / text selector for the primary element that
 *                        should be visible once the page has loaded correctly.
 *                        Leave empty string '' to skip the element check
 *                        (URL check only).
 *   urlStatus       – 'confirmed'  → URL verified from automated tests
 *                     'estimated'  → Best-guess based on naming pattern;
 *                                    test result will confirm or disprove it
 *   notes           – Optional context (e.g. typos in original routes)
 */

export interface ComponentUrlConfig {
    name: string;
    url: string;
    urlPattern: RegExp;
    verificationLocator: string;
    urlStatus: 'confirmed' | 'estimated';
    notes?: string;
}

export const componentUrlConfigs: ComponentUrlConfig[] = [

    // ──────────────────────────────────────────────────────────────────────
    //  BANNER MANAGEMENT
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Banner Config',
        url: '/main/component-display/stencil-marketing/banner-config',
        urlPattern: /stencil-marketing\/banner-config/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
    },
    {
        name: 'Banner Ordering',
        url: '/main/component-display/stencil-marketing/banner-ordering',
        urlPattern: /stencil-marketing\/banner-ordering/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  CAMPAIGN MANAGEMENT
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Campaign Management',
        url: '/main/component-display/stencil-marketing/campaign-management',
        urlPattern: /stencil-marketing\/campaign-management/,
        verificationLocator: '',   // No universal element without region selection
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  CASHBACK PROMOTIONS
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Cashback Promotions',
        url: '/main/component-display/stencil-marketing/cashback-promotions',
        urlPattern: /stencil-marketing\/cashback-promotions/,
        verificationLocator: 'button:has-text("Create Cashback Promotion")',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  COMPENSATION — COUPON MANAGEMENT
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Coupon Management',
        url: '/main/component-display/stencil-marketing/coupon-management',
        urlPattern: /stencil-marketing\/coupon-management/,
        verificationLocator: '',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  EVENT CALENDAR   (note: original route has typo "calender")
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Event Calendar',
        url: '/main/component-display/stencil-marketing/event-calender',
        urlPattern: /stencil-marketing\/event-calender/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
        notes: 'Route intentionally uses "calender" (typo) to match the app routing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  FAN EXCLUSIVE
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Fan Exclusive',
        url: '/main/component-display/stencil-marketing/fan-exclusive',
        urlPattern: /stencil-marketing\/fan-exclusive/,
        verificationLocator: 'button:has-text("Create Fan Exclusive")',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  LEADERBOARD
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Leaderboard',
        url: '/main/component-display/stencil-marketing/leaderboard-component',
        urlPattern: /stencil-marketing\/leaderboard/,
        verificationLocator: 'button:has-text("Create Leaderboard")',
        urlStatus: 'confirmed',
        notes: 'URL slug is leaderboard-component (not leaderboard)',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  LOYALTY PROMOTIONS
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Loyalty Promotions',
        url: '/main/component-display/stencil-marketing/loyalty-promotions',
        urlPattern: /stencil-marketing\/loyalty-promotions/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  SEGMENT SCHEDULE
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Segment Schedule',
        url: '/main/component-display/stencil-marketing/segment-schedule',
        urlPattern: /stencil-marketing\/segment-schedule/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  SEGMENTATION  (uses stencil-SEGMENTATION prefix, not stencil-marketing)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Segmentation',
        url: '/main/component-display/stencil-segmentation/segmentation',
        urlPattern: /stencil-segmentation\/segmentation/,
        verificationLocator: 'button:has-text("Create Segment")',
        urlStatus: 'confirmed',
        notes: 'Uses stencil-segmentation prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TELEGRAM LEADERBOARD
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Telegram Leaderboard',
        url: '/main/component-display/stencil-marketing/telegram-leaderboard',
        urlPattern: /stencil-marketing\/telegram-leaderboard/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TOAST CONFIGURATION
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Toast Configuration',
        url: '/main/component-display/stencil-marketing/toast-configuration',
        urlPattern: /stencil-marketing\/toast-configuration/,
        verificationLocator: 'button:has-text("Create Toast Config")',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PROMOTIONS — GENERIC WHEEL
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Generic Wheel',
        url: '/main/component-display/stencil-marketing/generic-wheel',
        urlPattern: /stencil-marketing\/generic-wheel/,
        verificationLocator: 'button[aria-label="Create Promotion"]',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PROMOTIONS — PROMOTION CONFIG
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Promotion Config',
        url: '/main/component-display/stencil-marketing/promotion-config',
        urlPattern: /stencil-marketing\/promotion-config/,
        verificationLocator: 'button[aria-label="Create Promotion"]',
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PROMOTIONS — PROMOTION ORDERING
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Promotion Ordering',
        url: '/main/component-display/stencil-marketing/promotion-ordering',
        urlPattern: /stencil-marketing\/promotion-ordering/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PROMOTIONS — SCRATCH AND WIN
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Scratch and Win',
        url: '/main/component-display/stencil-marketing/scratch-and-win-management',
        urlPattern: /stencil-marketing\/scratch-and-win-management/,
        verificationLocator: 'button[aria-label="Create Promotion"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PROMOTIONS — TIMED PROMOTIONS
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Timed Promotions',
        url: '/main/component-display/stencil-marketing/timed-promotions',
        urlPattern: /stencil-marketing\/timed-promotions/,
        verificationLocator: 'button[aria-label="Create Timed Promotion"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TAG MANAGEMENT — PLAYER TAGGING
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Player Tagging',
        url: '/main/component-display/stencil-marketing/tag-player',
        urlPattern: /stencil-marketing\/tag-player/,
        verificationLocator: 'button[aria-label="Tag Player"]',
        urlStatus: 'confirmed',
        notes: 'URL slug is tag-player (not player-tagging)',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TAG MANAGEMENT — PLAYER TAGGING LOGS
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Player Tagging Logs',
        url: '/main/component-display/stencil-marketing/player-tagging-logs',
        urlPattern: /stencil-marketing\/player-tagging-logs/,
        verificationLocator: '',   // No buttons on this page (logs only)
        urlStatus: 'confirmed',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TAG MANAGEMENT — SEGMENT TAGGING
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Segment Tagging',
        url: '/main/component-display/stencil-marketing/segment-tagging',
        urlPattern: /stencil-marketing\/segment-tagging/,
        verificationLocator: 'button[aria-label="Create Segmentation Tag"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TAG MANAGEMENT — TAG CONFIGURATION
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Tag Configuration',
        url: '/main/component-display/stencil-marketing/tag-configuration',
        urlPattern: /stencil-marketing\/tag-config/,
        verificationLocator: 'button[aria-label="Create Tag"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TUTORIALS — TUTORIAL CONFIGURATION
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Tutorial Configuration',
        url: '/main/component-display/stencil-marketing/tutorial-configuration',
        urlPattern: /stencil-marketing\/tutorial-configuration/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  TUTORIALS — TUTORIAL ORDERING
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Tutorial Ordering',
        url: '/main/component-display/stencil-marketing/tutorial-ordering',
        urlPattern: /stencil-marketing\/tutorial-ordering/,
        verificationLocator: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  MARKETING COMPS — COMP ALERTS  (uses stencil-comps prefix)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Comp Alerts',
        url: '/main/component-display/stencil-comps/alerts-management',
        urlPattern: /stencil-comps\/alerts-management/,
        verificationLocator: 'button[aria-label="Create Alert"]',
        urlStatus: 'estimated',
        notes: 'Uses stencil-comps prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  MARKETING COMPS — COMPS BULK  (uses stencil-comps prefix)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Comps Bulk',
        url: '/main/component-display/stencil-comps/comp-bulk',
        urlPattern: /stencil-comps\/comp-bulk/,
        verificationLocator: '',   // Button only visible after region selection — URL check is sufficient
        urlStatus: 'confirmed',
        notes: 'Uses stencil-comps prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  MARKETING COMPS — COMP CONFIG  (uses stencil-comps prefix)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Comp Config',
        url: '/main/component-display/stencil-comps/comp-management',
        urlPattern: /stencil-comps\/comp-management/,
        verificationLocator: 'button[aria-label="Create Comp"]',
        urlStatus: 'estimated',
        notes: 'Uses stencil-comps prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  MARKETING COMPS — MANUAL COMPS  (uses stencil-comps prefix)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Manual Comps',
        url: '/main/component-display/stencil-comps/manual-comps',
        urlPattern: /stencil-comps\/manual-comps/,
        verificationLocator: 'button[aria-label="Create Manual Comp"]',
        urlStatus: 'estimated',
        notes: 'Uses stencil-comps prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  MARKETING COMPS — TRANSACTION TYPES  (uses stencil-comps prefix)
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Transaction Types',
        url: '/main/component-display/stencil-comps/transaction-types',
        urlPattern: /stencil-comps\/transaction-types/,
        verificationLocator: 'button[aria-label="Create Transaction Type"]',
        urlStatus: 'estimated',
        notes: 'Uses stencil-comps prefix, NOT stencil-marketing',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  NOTIFICATION MANAGEMENT — ADMIN ACCOUNTS
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Admin Accounts',
        url: '/main/component-display/notifications-management/admin-accounts',
        urlPattern: /notifications-management\/admin-accounts/,
        verificationLocator: 'button[aria-label="Create Account"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  NOTIFICATION MANAGEMENT — MESSAGE CATEGORIES
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Message Categories',
        url: '/main/component-display/notifications-management/message-categories',
        urlPattern: /notifications-management\/message-categories/,
        verificationLocator: 'button[aria-label="Create Category"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  NOTIFICATION MANAGEMENT — MESSAGE CTA
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Message CTA',
        url: '/main/component-display/notifications-management/message-cta',
        urlPattern: /notifications-management\/message-cta/,
        verificationLocator: 'button[aria-label="Create CTA"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PLATFORM — FORM BUILDER CONFIGURATION
    // ──────────────────────────────────────────────────────────────────────

    {
        name: 'Form Builder Configuration',
        url: '/main/component-display/stencil-platform/form-field-builder',
        urlPattern: /form-field-builder/,
        verificationLocator: 'Create Field',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  PLATFORM — FORM BUILDER
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Form Builder',
        url: '/main/component-display/stencil-marketing/form-builder',
        urlPattern: /form-builder/,
        verificationLocator: 'button[aria-label="Create Form"]',
        urlStatus: 'estimated',
    },

    // ──────────────────────────────────────────────────────────────────────
    //  SYSTEM ADMIN — STENCIL CONFIGURATION
    // ──────────────────────────────────────────────────────────────────────
    {
        name: 'Stencil Configuration',
        url: '/main/management/stencil',
        urlPattern: /stencil/,
        verificationLocator: 'input.pure-input[placeholder="Search"]',
        urlStatus: 'estimated',
    },
];
