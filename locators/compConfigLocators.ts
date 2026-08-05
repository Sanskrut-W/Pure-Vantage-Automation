export const compConfigLocators = {
    payoutReportBtn: 'button[aria-label="Payout Report"]',
    createCompBtn: 'button[aria-label="Create Comp"]',

    dialog: '.p-dialog, [role="dialog"]',
    titleInput: '#title',
    multiCompBlockDaysInput: '#multi-comp-block-period-days input',
    startDateInput: '#startDate input',
    startDatePanel: '#startDate_panel',
    endDateInput: '#endDate input',
    endDatePanel: '#endDate_panel',
    compCodeInput: '#comp-code',
    campaignDropdown: '#campaign',
    tagDropdown: '#tag',
    alertEmailsInput: '#alert-emails',
    isActiveCheckbox: '#isActive',
    isActiveCheckboxInput: '#isActive input[type="checkbox"]',

    // Is Gift — unlike Is Active, the id sits on the native <input> itself, not the wrapper
    // (confirmed live). Its clickable overlay box is a sibling of that input inside the same
    // wrapper div, so it's targeted via a :has() scope the same way Comp Bulk's own Is
    // Percentage Amount checkbox is (see CompBulkConfigurationsPage).
    isGiftCheckboxInput: '#isGiftComp',
    isGiftCheckboxBox: 'div.p-checkbox:has(#isGiftComp) .p-checkbox-box',

    // Only appears once Is Gift is checked. No id/name at all on this field (confirmed live) —
    // matched via its sibling label text inside the shared p-float-label wrapper instead.
    giftDescriptionInput: 'span.p-float-label:has(label:text-is("Gift Description *")) input',

    closeIconBtn: '.p-dialog-header-close',
    toastMessage: '.p-toast-message-text',

    // Comp Config's own row-level "Configurations" screen (kebab -> Configurations, confirmed
    // live by CM_024) is the SAME shared Configurations page already confirmed live for Comp
    // Bulk (see compBulkConfigurationsLocators and CompBulkConfigurationsPage) — same field
    // ids, same ".configuration-card" markup — just reached from a Comp Config row instead of
    // a Comp Bulk row.
    createConfigurationBtn: 'button[aria-label="Create Configuration"]',
    configDialog: '.p-dialog, [role="dialog"]',
    configDescriptionInput: '#description',
    configRegionCodeDropdown: '#regionCode',
    configTransactionTypeDropdown: '#transactionType',
    configCasinoBonusTemplateDropdown: '#casinoBonusTemplateId',
    configMinimumPayoutInput: '#minimumPayout input',
    configMaximumPayoutInput: '#maximumPayout input',
    configPushNotificationTemplateDropdown: '#pushNotificationTemplateId',
    configSmsNotificationTemplateDropdown: '#smsNotificationTemplateId',
    configCampaignBudgetInput: '#campaignBudget input',
    configBannerDropdown: '#bannerId',
    configDailyBudgetInput: '#dailyBudgetAmount input',

    // Checkboxes — id is on the wrapper <div class="p-checkbox">, not the inner <input>
    // (confirmed live on the Comp Bulk side of this same shared dialog).
    configCheckboxSendPush: 'sendPush',
    configCheckboxSendSms: 'sendSms',
    configCheckboxCompValueProvided: 'isCompValueProvided',
    configCheckboxAllowMultipleComp: 'allowMultipleCompPerUser',

    configSaveBtn: 'button[aria-label="Save"]',
    configCancelBtn: 'button[aria-label="Cancel"]',

    configurationCard: '.configuration-card',
};
