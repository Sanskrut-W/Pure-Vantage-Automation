export const leaderboardLocators = {
    // Leaderboard Page Locators — Action Buttons
    buttonCreateLeaderboard: 'Create Leaderboard',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',
    // Confirmed live — the list is paginated (10 rows/page) and a newly-created row can land on
    // a later page where it's not in the DOM at all; searching by name first (same convention as
    // Generic Predictor's Participants search) filters it down to page 1 regardless.
    inputSearch: 'input[placeholder="Search"]',

    // Create/Edit Leaderboard popup — all ids confirmed live.
    inputPromotionName: '#promotionNameInput',
    dropdownRegion: '#regionDropdown',
    calendarStartDate: '#startDateCalendar input',
    calendarEndDate: '#endDateCalendar input',
    dropdownPushNotification: '#pushNotificationDropdown',
    toggleIsActive: '#isActive',
    toggleIsTesting: '#isTesting',

    // Save/Cancel not confirmed live in the captured popup HTML (only up to the toggles was
    // captured) — following this app's dialog-wide convention (aria-label="Save"/"Cancel" text),
    // same as Generic Predictor/Coupon/etc. Verify against a real run and correct if different.
    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items (same convention as elsewhere).
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',

    // Validation error messages (mandatory-field / format errors) — same convention as elsewhere.
    validationError: '.p-error, .p-invalid, small.p-error',

    // Row-level "..." kebab menu (opens a floating PrimeNG Menu with Manage Configurations /
    // Manage Streaks / Periods) — confirmed live, same .pure__table-menu-trigger structure as
    // Generic Predictor's row menu. Distinct from the per-row Edit/Delete buttons, which are
    // their OWN separate buttons on this page (not menu items).
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    menuItemManageConfigurations: 'Manage Configurations',
    menuItemManageStreaks: 'Manage Streaks',
    menuItemPeriods: 'Periods',

    // Delete confirmation — confirmed live for BOTH the Leaderboard row (standard PrimeNG
    // ConfirmDialog) and the Configuration row (a different, custom Yes/No modal wrapper) — same
    // aria-label="Yes"/"No" buttons either way, so these text-based locators work for both.
    buttonConfirmYes: 'Yes',
    buttonConfirmNo: 'No',

    // ─── Manage Streaks page — Create/Edit Streak popup, all confirmed live ────
    buttonCreateStreak: 'Create Streak',
    // PrimeNG InputNumber — the id lives on the OUTER <span>, the actual <input> is a descendant
    // with no id of its own (same wrapper shape as the Min Wager/Min Legs/Min Odds fields above).
    inputStreakValue: '#streakValue input',
    inputStreakMultiplier: '#streakMultiplier input',

    // ─── Periods page — Create/Edit Period popup, all confirmed live ───────────
    buttonCreatePeriod: 'Create Period',
    inputPeriodName: '#promotion-name',
    calendarPeriodStartDate: '#start-date-calendar input',
    calendarPeriodEndDate: '#end-date-calendar input',
    // Scheduled Date has no asterisk in its label — not a mandatory field (confirmed live).
    calendarPeriodScheduledDate: '#scheduled-date-calendar input',

    // ─── Manage Configurations page ─────────────────────────────────────────────
    buttonCreateConfiguration: 'Create Configuration',
    // Active filter toggle has no stable id/aria-label confirmed live (same situation as Generic
    // Predictor's own page-level Active/Inactive toggle) — scoped to <main> and the first match.

    // Populated Configurations render as CARDS, NOT a table (confirmed live) — one
    // .leaderboard__configuration-card per Configuration inside this container, each titled
    // "Leaderboard Configuration: {name}" in its own <h5>. With zero Configurations, this
    // container doesn't render at all — a "No configurations found" heading/paragraph shows
    // instead (also confirmed live).
    configurationsContainer: '.leaderboard__configurations-container',
    configurationCard: '.leaderboard__configuration-card',

    // ─── Create/Edit Configuration popup — all ids confirmed live ──────────────
    inputLeaderboardName: '#leaderboardNameInput',
    inputDescription: '#descriptionInput',
    dropdownLeaderboardType: '#leaderboardTypeDropdown',
    inputLeagueCountry: '#leagueCountryInput',
    // Game Type is a PrimeNG MultiSelect (chip display), NOT a plain dropdown — confirmed live.
    multiselectGameType: '#gameTypeMultiSelect',
    dropdownPointSource: '#pointSourceDropdown',
    inputMinWager: '#wagerAmountInput input',
    inputMinLegs: '#numberOfLegsInput input',
    inputMinOdds: '#oddsInput input',
    inputLeagueName: '#leagueNameInput',
    inputBannerUrl: '#bannerUrlInput',
    inputMaxPoints: '#maxPointsInput input',
    toggleAmountModifier: '#amountModifierToggle',
    toggleConfigIsTesting: '#isTesting',
    toggleAllowFeedAllocations: '#allowFeedAllocations',

    // PrimeNG MultiSelect overlay — same convention as the dropdown overlay, different root/item
    // classes. Not yet confirmed live (only the closed control was captured) — standard PrimeNG
    // class names, consistent with this app's confirmed .p-dropdown-panel/.p-dropdown-item pair.
    multiselectPanel: '.p-multiselect-panel',
    multiselectItem: '.p-multiselect-item',

    // Configuration row's "..." kebab menu — confirmed live. Plain PrimeNG icon-only button, NO
    // .pure__table-menu-trigger class this time (unlike the Leaderboard row's own kebab) —
    // targeted via its ellipsis icon instead.
    configRowMenuTrigger: 'button:has(.pi-ellipsis-v)',
    menuItemConfigEdit: 'Edit',
    menuItemConfigPlayerInfo: 'Player Info',
    menuItemConfigPrizeConfiguration: 'Prize Configuration',
    menuItemConfigDelete: 'Delete',
};
