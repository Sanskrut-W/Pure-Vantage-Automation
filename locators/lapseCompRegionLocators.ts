export const lapseCompRegionLocators = {
    createRegionConfigBtn: 'button[aria-label="Create Region Config"]',
    dialog: '.p-dialog, [role="dialog"]',

    // Only Region Code carries a real id (confirmed live) — the other 3 dropdowns and the
    // Tag Value text input have none, so they're scoped via their sibling label text inside
    // the shared p-float-label wrapper, the same pattern already used elsewhere in this suite
    // (e.g. Gift Description on Comp Config's own Create Comp dialog).
    fieldRegionCode: '#regionCode',
    fieldPushNotificationTemplate: 'span.p-float-label:has(label:text-is("Push Notification Template")) .p-dropdown',
    fieldSmsTemplate: 'span.p-float-label:has(label:text-is("SMS Template")) .p-dropdown',
    fieldTagName: 'span.p-float-label:has(label:text-is("Tag Name")) .p-dropdown',
    fieldTagValue: 'span.p-float-label:has(label:text-is("Tag Value")) input',

    buttonSave: 'button[aria-label="Save"]',
    buttonCancel: 'button[aria-label="Cancel"]',

    // Edit/Delete render directly per row (no kebab) — confirmed live via the standalone
    // buttons given, mirroring Manual Comps' Approve/Decline and Comp Bulk's Process/Cancel.
    editBtn: 'button[aria-label="Edit"]',
    deleteBtn: 'button[aria-label="Delete"]',
    buttonYes: 'button[aria-label="Yes"]',
    buttonNo: 'button[aria-label="No"]',

    backButton: 'button.btn--info.p-button-icon-only:has(.pi-chevron-left)',

    toastMessage: '.p-toast-message-text',
    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',
};
