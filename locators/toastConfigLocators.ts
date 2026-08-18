export const toastConfigLocators = {
    // Toast Configuration Page Locators
    dropdownSelectRegion: 'Select a region',
    buttonCreateToastConfig: 'Create Toast Config',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',
    buttonSchedule: 'Schedule',
    searchInput: 'input.pure-input.w-20r[placeholder="Search"]',

    // Create/Edit Toast Configuration popup — mandatory + optional fields.
    // Unlike the page-level Region filter (no stable id, only aria-label), every popup field
    // has a real, stable DOM id — using those directly instead of aria-label/text matching.
    inputName: '#name',
    dialogRegionDropdown: '#regionId',
    calendarStartDateTime: '#startDateTime',
    calendarEndDateTime: '#endDateTime',
    dialogStateDropdown: '#state',
    dialogOccurrenceDropdown: '#occurance', // verbatim app typo — matches the real DOM id
    inputPath: '#path',
    dialogContentDropdown: '#contentPath',
    inputAvailableCountries: '#availableCountries',
    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // Included/Excluded Account Tags — repeatable rows inside a <banner-tags> custom element.
    // Each row: a "Select A Tag" p-dropdown, a "Tag Value" text input, and Add(+)/Delete buttons.
    includedTagsContainer: 'banner-tags[data-object-key="includedAccountTags"]',
    excludedTagsContainer: 'banner-tags[data-object-key="excludedAccountTags"]',
    tagRow: '.banner-tags-list > div.row',
    tagSelectDropdown: 'div.dropdown-input.p-dropdown',
    tagValueInput: 'input[placeholder="Tag Value"]',
    buttonAddTagRow: 'button.btn--success.p-button-icon-only:has(.pi-plus)',
    buttonDeleteTagRow: 'button.btn--danger.p-button-icon-only:has(.pi-trash)',

    // Delete confirmation dialog (PrimeNG ConfirmDialog) — same accept/reject convention as
    // Segmentation and Lapse Comp's Yes/No dialogs.
    confirmDialogAccept: '.p-confirm-dialog-accept',
    confirmDialogReject: '.p-confirm-dialog-reject',

    // Schedule popup — 7 mandatory fields + 1 optional (End Date). Multiselect fields
    // (p-multiselect, chip display mode) allow selecting more than one option at once, unlike
    // the plain p-dropdown fields used elsewhere in this app.
    scheduleActiveMonths: '#activeMonths',
    scheduleActiveDays: '#activeDays',
    scheduleActiveDaysOfMonth: '#activeDaysOfMonth',
    scheduleExecuteAtMinute: '#startingMin',
    scheduleExecuteAtHour: '#startingHours',
    scheduleDuration: '#duration',
    scheduleStartDate: '#startDate',
    scheduleEndDate: '#endDate',
    multiSelectItem: '.p-multiselect-item, [role="option"]',
    multiSelectChip: '.p-multiselect-token, .p-multiselect-chip-item'
};
