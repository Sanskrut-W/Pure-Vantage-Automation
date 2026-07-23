export const cashbackLocators = {
    // ── Main page ─────────────────────────────────────────────────────────────
    buttonCreateCashbackPromotion: 'Create Cashback Promotion',
    inputSearch: 'Search',
    buttonEdit: 'Edit',
    buttonApprove: 'Approve',
    buttonDelete: 'Delete',
    cashbackTable: '#component-container',
    tableBody: 'tbody tr',

    // Table column header titles
    columnDescription: 'Description',
    columnComp: 'Comp',
    columnCreatedBy: 'Created By',
    columnCreatedDate: 'Created Date',
    columnExecutionFrequency: 'Execution Frequency',
    columnNextExecutionDate: 'Next Execution Date',
    columnStartDate: 'Start Date',
    columnEndDate: 'End Date',
    columnApprovedBy: 'Approved By',
    columnLastRunNote: 'Last Run Note',
    columnLastRunDate: 'Last Run Date',

    // ── Create / Update dialog ─────────────────────────────────────────────
    dialogTitleCreate: 'New Cashback Promotion',
    dialogTitleUpdate: 'Update Cashback Promotion',
    // Dialog container (scoped by title text presence)
    dialogContainer: '.p-dialog',

    // Form field labels (used with getByLabel inside the dialog)
    fieldDescription: 'Description *',
    fieldRegion: 'Region *',
    fieldGameType: 'Game Type',
    fieldGameName: 'Game Name',
    fieldProviderName: 'Provider Name',
    fieldTrigger: 'Trigger *',
    fieldCompCode: 'Comp Code',
    fieldMinCompAmount: 'Minimum Comp Amount',
    fieldCompPercentage: 'Comp Percentage',
    fieldExecutionFrequency: 'Execution Frequency *',
    fieldExecutionTime: 'Execution Time',
    fieldUseSegments: 'Use Segments?',
    fieldSegment: 'Segment',

    // Date picker calendar inputs within dialog (positional - 0=Start, 1=End, 2=NextExec)
    dialogCalendarInputs: '.p-dialog .p-calendar input',

    // Save / Cancel buttons inside the form dialog
    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // ── Approve confirmation dialog ────────────────────────────────────────
    approveDialogText: 'Are you sure you want to approve this promotion?',
    buttonYes: 'Yes',
    buttonNo: 'No',

    // ── Delete confirmation dialog ─────────────────────────────────────────
    deleteDialogText: 'Are you sure you want to delete',

    // ── PrimeVue confirm dialog selectors ─────────────────────────────────
    confirmDialogMessage: '.p-confirm-dialog-message',
    confirmAcceptBtn: '.p-confirm-dialog-accept',
    confirmRejectBtn: '.p-confirm-dialog-reject',

    // The Approve confirmation is NOT a PrimeVue dialog — it's a custom
    // component (<div class="action-modal">...</div>) with its own header/body
    // text classes and plain "Yes"/"No" buttons (aria-label matches those still
    // work via getByRole). Confirmed via live outerHTML from the app.
    actionModal: '.action-modal',
    actionModalMessage: '.action-modal .body-text',

    // ── Validation errors ──────────────────────────────────────────────────
    validationError: '.p-error',
    invalidField: '.p-invalid',
};
