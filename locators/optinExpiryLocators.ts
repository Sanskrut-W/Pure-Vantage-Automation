export const optinExpiryLocators = {
    // Page-level
    createBtn: 'button[aria-label="Create Opt-In"]',
    searchInput: 'input.pure-input[placeholder="Search"]',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',

    // Create/Edit Opt-In popup — core fields
    inputName: '#name',
    inputDescription: '#description',
    dropdownExpiryType: '#expiryType',

    // Extra field — appears only when Expiry Type is "End Of Week"
    dropdownExpiryDayOfWeek: '#expiryDayOfTheWeek',

    // Extra field — appears only when Expiry Type is "Date Time"
    calendarExpiryDateTime: '#expiryDateTime input',

    // 2 checkboxes
    checkboxIsActive: '#isActive',
    checkboxIsInternalOnly: '#isInternalOnly',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',

    // Delete confirmation dialog (PrimeNG ConfirmDialog) — same accept/reject convention used
    // throughout this suite (Segment Tagging, Toast Configuration, Auto Opt-In Config, etc.)
    confirmDialogAccept: '.p-confirm-dialog-accept',
    confirmDialogReject: '.p-confirm-dialog-reject',
};
