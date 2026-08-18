export const segmentTaggingLocators = {
    // Page-level
    createSegmentationTagBtn: 'button[aria-label="Create Segmentation Tag"]',
    searchInput: 'input.pure-input[placeholder="Search"]',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',

    // Create Segmentation Tag popup — mandatory + conditional fields
    dropdownSegmentGroup: '#segmentationGroupId',
    dropdownSelectedTag: '#selectedTagIds',
    calendarNextExecution: '#nextExecution',
    inputPercentagePlayers: '#percentagePlayersToProcess',
    dropdownFrequencyType: '#frequencyType',
    // Conditional fields — rendered only for certain Frequency Type selections
    calendarFrequencyTime: '#frequencyTime',
    dropdownFrequencyDay: '#frequencyDay',
    toggleSwitchPublishToElsa: '#publishToElsa',
    labelPublishToElsa: 'label[for="publishToElsa"]',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items + empty-state message
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
    dropdownNoResults: '.p-dropdown-empty-message',

    // Delete confirmation dialog (PrimeNG ConfirmDialog) — same accept/reject convention as
    // every other module (Segmentation, Toast Configuration, Message Templates).
    confirmDialogAccept: '.p-confirm-dialog-accept',
    confirmDialogReject: '.p-confirm-dialog-reject',
};
