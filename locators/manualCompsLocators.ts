export const manualCompsLocators = {
    createManualCompBtn: 'button[aria-label="Create Manual Comp"]',
    dialog: '.p-dialog, [role="dialog"]',

    fieldCompCode: '#compCode',
    fieldRegionCode: '#regionCode',
    fieldAccountId: '#accountId',
    fieldMobileNumber: '#mobileNumber',
    fieldCompValue: '#compValue input',
    fieldCompFreeBets: '#compFreeBets input',

    buttonSave: 'button[aria-label="Save"]',
    buttonCancel: 'button[aria-label="Cancel"]',

    // Approve/Decline render directly in a row's own action area (no kebab menu) — the same
    // pattern already confirmed live for Comp Bulk's Process/Cancel buttons.
    approveBtn: 'button[aria-label="Approve"]',
    declineBtn: 'button[aria-label="Decline"]',

    // Confirmation modal shared with Delete/Process/Cancel elsewhere in this suite.
    buttonYes: 'button[aria-label="Yes"]',
    buttonNo: 'button[aria-label="No"]',

    toastMessage: '.p-toast-message-text',
    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',
};
