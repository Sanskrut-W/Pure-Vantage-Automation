export const compAlertsLocators = {
    createAlertBtn: 'button[aria-label="Create Alert"]',

    // New/Edit Alert dialog — field ids taken directly from the app's DOM
    fieldAlertName: '#name',
    fieldNextCheckDate: '#nextCheckDate',
    fieldScheduleAt: '#scheduleAt',
    fieldEndDate: '#endDate',
    fieldEveryDayAt: '#everyDayAt',
    fieldAlertEmails: '#alertEmails',
    fieldForceAlert: '#forceAlert',
    fieldAlertFrequency: '#alertFrequency',
    fieldGroupResults: '#groupResults',
    fieldRegionCode: '#regionCode',

    // Conditional fields shown per Schedule At value — ids confirmed live.
    fieldEveryXMinutes: '#everyXMinutes',   // Schedule At = Minutely
    fieldEveryXHours: '#everyXHours',       // Schedule At = Hourly (label is "Every X Hours *", not "Hourly")
    fieldDaySelect: '#daySelect',           // Schedule At = Weekly
    fieldAtTime: '#atTime',                 // Schedule At = Weekly

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',
    toastError: '.p-toast-message-error, [data-p-severity="error"]',

    // ── Comp Alert Settings (reached via the per-row "Config" button) ────────
    configBtn: 'button[aria-label="Config"]',
    createCompAlertBtn: 'button[aria-label="Create Comp Alert"]',
    deleteCompAlertBtn: 'button[aria-label="Delete"]',
    refreshBtn: 'button[aria-label="Refresh"]',
    // Back is icon-only with no aria-label — matched by its chevron-left icon.
    backBtnIcon: 'button:has(.pi-chevron-left)',

    // Configure Comp Alert dialog — only field is "Select Comp". Targeted by
    // id rather than its placeholder/label text, which varies by region
    // (e.g. "Select a comp that has configurations in the Region GH").
    fieldCompCode: '#compCode',
};
