export const autoOptinLocators = {
    // Page-level
    createBtn: 'button[aria-label="Create Auto Opt-In"]',
    searchInput: 'input.pure-input[placeholder="Search"]',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',

    // Core popup fields — always present
    inputName: '#autoOptInName',
    dropdownRegion: '#region',
    dropdownAction: '#autoOptInAction',
    dropdownCampaign: '#campaign',
    calendarStartDate: '#promotionStartDate',
    calendarEndDate: '#promotionEndDate',
    dropdownTrigger: '#autoOptInTrigger',

    // Trigger Comp Account action — extra fields
    inputCompCode: '#compCode',
    inputCompValue: '#compValue',

    // Sport Wager trigger — extra fields (all ids confirmed live)
    inputMinRequiredAmount: '#minRequiredAmount',
    inputOdds: '#odds',
    inputNumberOfLegs: '#numberOfLegs',
    dropdownFeed: '#feedId',
    dropdownSport: '#sportId',
    dropdownLeague: '#leagueId',
    dropdownEvent: '#eventId',
    dropdownMarket: '#marketId',
    // Confirmed live: this field's own id is "outcomeId", not "marketOutcomeId".
    dropdownMarketOutcome: '#outcomeId',

    // Casino Wager / Casino Settlement triggers — extra fields (shared shape). Confirmed live:
    // the amount field REUSES Sport Wager's exact "#minRequiredAmount" id/label ("Minimum
    // Required Amount *") rather than being a separate "Maximum Required Amount" field.
    dropdownProviderName: '#providerName',
    dropdownGameName: '#gameName',

    // 5 toggles
    toggleEnableDailyDeletion: '#isExpiryEnabled',
    toggleEnableTestingMode: '#isTesting',
    toggleApplyToAllBets: '#applyRuleToAllBets',
    toggleRequiresSingleBet: '#requiresSingleBet',
    toggleIsActive: '#isActive',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
    dropdownClearIcon: '.p-dropdown-clear-icon',

    // Delete confirmation dialog (PrimeNG ConfirmDialog) — same accept/reject convention as
    // every other module in this suite (Segment Tagging, Toast Configuration, Message Templates).
    confirmDialogAccept: '.p-confirm-dialog-accept',
    confirmDialogReject: '.p-confirm-dialog-reject',
};
