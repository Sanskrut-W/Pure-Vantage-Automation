export const lapseCompLocators = {
    searchByCompId: 'input[placeholder="Search by compId..."]',
    searchByCompCode: 'input[placeholder="Search by CompCode..."]',
    searchByDescription: 'input[placeholder="Search by description..."]',

    // Confirmed live, in table column order.
    columnTitles: [
        '#ID',
        'Comp Code',
        'Description',
        'Approved',
        'Schedule',
        'Next Execution Date',
        'End Date',
        'Created By',
        'Created At',
        'Approved By',
        'Approved At',
        'Updated At',
    ],

    createConfigurationBtn: 'button[aria-label="Create Configuration"]',
    dialog: '.p-dialog, [role="dialog"]',

    fieldDescription: '#description',
    fieldCompCode: '#compCode',
    fieldEveryDayAtTime: '#atXTime input',
    fieldEndDate: '#endDate input',
    fieldNotifyEmailCsv: '#notifyEmailCsv',

    buttonSave: 'button[aria-label="Save"]',
    buttonCancel: 'button[aria-label="Cancel"]',

    // Every Day At's time-only picker (#atXTime_panel) — adjusted via increment/decrement
    // buttons, not typed. Confirmed live.
    timePickerNextHour: 'button[aria-label="Next Hour"]',
    timePickerNextMinute: 'button[aria-label="Next Minute"]',

    toastMessage: '.p-toast-message-text',
    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',

    // Row kebab ("⋮") menu -> Edit / Regions / Logs — confirmed live. The overlay menu renders
    // detached from the row (appended elsewhere in the DOM), so its items are matched
    // globally, same as every other row-kebab menu in this app.
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    editMenuItem: 'a.p-menuitem-link[aria-label="Edit"]',
    regionsMenuItem: 'a.p-menuitem-link[aria-label="Regions"]',
    logsMenuItem: 'a.p-menuitem-link[aria-label="Logs"]',
    compsMenuItem: 'a.p-menuitem-link[aria-label="Comps"]',
    approveMenuItem: 'a.p-menuitem-link[aria-label="Approve"]',
    markForProcessingMenuItem: 'a.p-menuitem-link[aria-label="Mark For Processing"]',
    deleteMenuItem: 'a.p-menuitem-link[aria-label="Delete"]',
};
