export const internalNotificationLocators = {
    // Internal Notification Page Locators
    buttonCreateNotification: 'p-button[label="Create Notification"] button',
    inputSearch: 'input[placeholder="Search"].pure-input.w-20r',

    // Action Buttons
    buttonEdit: 'p-button[label="Edit"] button',
    buttonDisable: 'p-button[label="Disable"] button',
    buttonDelete: 'p-button[label="Delete"] button',

    // Form Fields
    inputTitle: 'Title',
    inputMessage: '#message',
    dropdownTypeTrigger: 'p-select#messageType div.p-select-dropdown',
    dropdownIconTrigger: 'p-select#icon div.p-select-dropdown',
    dropdownOption: (label: string) => `li.p-select-option:has-text("${label}")`,
    dropdownOptionFirst: 'li.p-select-option',
    startDateInput: '#startDate input',
    endDateInput: '#endDate input',
    calendarTodayCell: '.p-datepicker-today span',
    buttonSave: 'button:has(span.pi-save)',

    // Toggles
    activeToggleInput: 'div[data-pc-name="toggleswitch"] input.p-toggleswitch-input',

    // Confirmation Dialog
    buttonYes: 'Yes',
    buttonNo: 'No',
};
