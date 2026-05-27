export const timedPromotionsLocators = {
    // Landing Page (Scoped under timed-promotions container)
    createTimedPromotionBtn: 'button[aria-label="Create Timed Promotion"]',
    searchInput: 'input[placeholder="Search"]',
    hideInactiveSwitch: 'div.p-inputswitch',
    ellipsisBtn: 'button:has(.pi-ellipsis-v)',

    // Dialog / Popup Form (Create / Clone / Delete)
    dialog: 'div[role="dialog"]',
    name: '#name',
    description: '#description',
    regionsId: '#region',
    startDate: '#startDate',
    endDate: '#endDate',
    saveBtn: 'button[aria-label="Save"], button:has-text("Save")',
    cancelBtn: 'button[aria-label="Cancel"], button:has-text("Cancel")',
    multiCompFrequency: "#multiCompFrequency",
    multiCompFrequencyValue: '#multiCompFrequencyValue',
    isManual: "#isGlobal",
    isTesting: "#isTesting",

    // Edit Page Form
    editName: '#name',
    editDescription: '#description',
    editStartDate: '#startDate',
    editEndDate: '#endDate',
    editRegionId: '#regionsId',
    updateBtn: 'button:has-text("Update Promotion Details")',

    // Horly-config
    startTime: '#startTime input',
    endTime: '#endTime input',
    activeDays: '#activeDays',
    chanceToWinStart: "#chanceToWinStart input",
    chanceToWinEnd: "#chanceToWinEnd input",

    // Opt in Triggers
    type: '#type',
    minWager: "#minWagerAmount input",
    minOdds: "#minimumOdds input",

    createOptInBtn: 'button[aria-label="Create Opt In Trigger"]',
    createHorlyConfigBtn: 'button[aria-label="Create Hourly Configuration"]',

};
