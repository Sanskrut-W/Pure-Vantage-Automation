export const betPromotionRulesLocators = {
    // Confirmed live (user-supplied outerHTML)
    buttonCreateBetPromotionRule: 'Create Bet Promotion Rule',

    // ─── Create/Edit popup — none of these 6 base fields carry an id (user-supplied outerHTML) —
    // each is located via this app's proven float-label structure (a control is always immediately
    // followed by its own `<label>` sibling), EXCEPT Start Date/End Date, which do have real ids.
    labelPromotionName: 'Promotion Name *',
    labelPromotionType: 'Promotion Type *',
    calendarStartDate: '#effectiveDate input',
    calendarEndDate: '#effectiveEndDate input',
    labelFeed: 'Feed',
    labelMinimumAmount: 'Minimum Amount',

    // ─── Revealed only after Feed has a value (confirmed live) — same label-sibling convention,
    // no ids captured for these either.
    labelSport: 'Sport',
    labelLeague: 'League',
    labelEvent: 'Event',
    labelMarket: 'Market',

    // ─── Shared across this app's popups — confirmed live aria-labels for this dialog specifically
    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
    validationError: '.p-error, .p-invalid, small.p-error',

    // ─── List page — confirmed live (user-supplied outerHTML)
    searchInput: 'input.pure-input.w-20r[placeholder="Search"]',
    // Confirmed live: the delete confirmation is a real PrimeVue ConfirmDialog
    // (.p-confirm-dialog-accept/.p-confirm-dialog-reject), NOT the generic ".action-modal"/plain
    // "Yes"/"No" button convention seen on some other features' delete confirmations.
    confirmDialogYesBtn: 'button[aria-label="Yes"].p-confirm-dialog-accept, button[aria-label="Yes"]',
    confirmDialogNoBtn: 'button[aria-label="No"].p-confirm-dialog-reject, button[aria-label="No"]',

    // ─── List page — Start/End Date filters (confirmed live, user-supplied outerHTML). These are
    // DIFFERENT elements from the popup's own Start Date/End Date (#effectiveDate/#effectiveEndDate,
    // no placeholder) — these filter inputs carry a placeholder instead, and their aria-controls
    // panel id (e.g. "pr_id_976_panel") is a PrimeNG auto-generated id that is NOT stable across
    // page loads, so it must be read at runtime rather than hardcoded (same caveat already noted
    // for the Create dialog's own "pr_id_1_content").
    filterStartDateInput: 'input[placeholder="Start Date"]',
    filterEndDateInput: 'input[placeholder="End Date"]',
    buttonResetFilters: 'Reset',
};
