export const recurringRewardsLocators = {
    // Confirmed live (user-supplied outerHTML)
    buttonCreateConfiguration: 'Create Configuration',

    // ─── Create/Edit popup — all ids confirmed live (unlike Bet Promotion Rules, every field here
    // carries a real id, including Start Date/End Date's own calendar panels).
    inputPromotionName: '#promotionName',
    dropdownRegionCode: '#regionCode',
    calendarStartDate: '#startDate input',
    calendarStartDatePanel: 'startDate_panel',
    calendarEndDate: '#endDate input',
    calendarEndDatePanel: 'endDate_panel',
    dropdownRecurringFrequency: '#recurringFrequency',
    inputWagerAmountRequirement: '#wagerAmountRequirement input',
    checkboxFirstQualifyingBetOnly: '#isFirstQualifyingBetOnly',

    // Confirmed live: these 2 only render once Recurring Frequency = Weekly.
    dropdownWeeklyExpiryDay: '#weeklyExpiryDay',
    calendarWeeklyExpiryTime: '#weeklyExpiryTime input',
    calendarWeeklyExpiryTimePanel: 'weeklyExpiryTime_panel',

    // Confirmed live: the only 2 options for Recurring Frequency.
    recurringFrequencyDaily: 'Daily',
    recurringFrequencyWeekly: 'Weekly',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    dropdownItem: '.p-dropdown-item, [role="option"]',
    validationError: '.p-error, .p-invalid, small.p-error',

    // ─── List page — confirmed live (user-supplied outerHTML)
    searchInput: '#search-input',
    // NOTE: the user's "Select a region filter" outerHTML was byte-for-byte IDENTICAL to the
    // Search bar's own outerHTML (same id="search-input") — almost certainly a copy/paste
    // duplicate rather than the real region-filter markup. No confirmed selector exists for the
    // region filter dropdown; see RecurringRewardsPage.selectRegionFilter's own comment.

    // Confirmed live (user-supplied outerHTML): same kebab-menu + Yes/No modal convention as the
    // rest of this app.
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    menuItemDelete: 'Delete',
    confirmYesBtn: 'button[aria-label="Yes"]',
    confirmNoBtn: 'button[aria-label="No"]',
    toastMessage: '.p-toast-message',

    // ─── Sports Requirements sub-page (row ⋯ -> "Sports Requirements") — confirmed live (probe)
    menuItemSportsRequirements: 'Sports Requirements',
    buttonBackToRewards: 'main button.btn--info:has(.pi-chevron-left)',
    buttonCreateSportRequirement: 'Create Sport Requirement',
    sportRequirementTable: 'main table',

    // Confirmed live (probe): every field carries a real id. League/Country/Event/Market are
    // free-text inputs until a Sport is picked from its dropdown, then become dropdowns under the
    // SAME ids. Sport is an editable dropdown — clicking its body only focuses the text box, so
    // every dropdown here is opened via its own .p-dropdown-trigger chevron instead.
    dropdownFeedName: '#feedId',
    dropdownSport: '#sportId',
    dropdownLeague: '#leagueId',
    dropdownCountry: '#country',
    dropdownBetSlipType: '#betSlipTypeEnum',
    dropdownEvent: '#eventId',
    dropdownMarket: '#marketId',
    dropdownTrigger: '.p-dropdown-trigger',
    inputMinimumBetslipOdds: '#mininumBetslipOddsMultiplier input',
    inputMinimumLegsRequired: '#minimumLegsRequired input',
    inputMinimumLegOddsMultiplier: '#minimumLegOddsMultiplier input',
    // Confirmed live (probe): the 2 switches carry no id — 1st = Single Leg Only, 2nd = Apply Odds
    // And Multiplier To Legs In Total.
    inputSwitch: '.p-inputswitch',
};
