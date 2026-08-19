export const tagConfigLocators = {
    // Page-level
    createTagBtn: 'button[aria-label="Create Tag"]',
    editBtn: 'td.action-col-right button[aria-label="Edit"]',
    searchInput: 'input.pure-input[placeholder="Search"]',
    showNonActiveToggle: '.p-inputswitch',

    // Create/Edit Tag popup — mandatory + optional fields
    inputTagName: '#tagName',
    inputDescription: '#description',
    inputUserExpiryDays: '#userExpiryDays input',
    calendarTagExpiryDate: '#expiry input',
    dropdownExpiryType: '#expiryType',
    dropdownCampaign: '#campaign',
    checkboxIsInternalTag: '#isInternalOnly',
    // Edit-popup-only field — not present when creating a new tag (new tags are always active
    // by default).
    checkboxIsActive: '#active',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
};
