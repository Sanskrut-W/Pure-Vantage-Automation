export const compBulkConfigurationsLocators = {
    createConfigurationBtn: 'button[aria-label="Create Configuration"]',

    // Every field in this dialog carries a real, stable id — confirmed live, unlike Comp Bulk's
    // own Create/Edit dialog (which has none). Targeted directly, no label-text scoping needed.
    fieldDescription: '#description',
    fieldRegionCode: '#regionCode',
    fieldTransactionType: '#transactionType',
    fieldCasinoBonusTemplate: '#casinoBonusTemplateId',
    fieldMinimumPayout: '#minimumPayout input',
    fieldMaximumPayout: '#maximumPayout input',
    fieldPushNotificationTemplate: '#pushNotificationTemplateId',
    fieldSmsNotificationTemplate: '#smsNotificationTemplateId',
    fieldCampaignBudget: '#campaignBudget input',
    fieldBanner: '#bannerId',
    fieldDailyBudget: '#dailyBudgetAmount input',

    // Checkboxes — the id is on the wrapper <div class="p-checkbox">, not the inner <input>
    // (confirmed live) — the opposite of Comp Bulk's own checkboxes, where the id is on the input.
    checkboxSendPush: 'sendPush',
    checkboxSendSms: 'sendSms',
    checkboxCompValueProvided: 'isCompValueProvided',
    checkboxAllowMultipleComp: 'allowMultipleCompPerUser',

    // Dialog footer — confirmed live. Save starts disabled until every mandatory field
    // (Description, Region Code, Transaction Type, Minimum/Maximum Comp Awarded, Campaign
    // Budget) is filled, and also stays disabled if Maximum Comp Awarded is less than Minimum
    // Comp Awarded, or Campaign Budget is less than Maximum Comp Awarded — equal values are
    // allowed (confirmed live: only strictly-less-than triggers the disable, not <=).
    buttonSave: 'button[aria-label="Save"]',
    buttonCancel: 'button[aria-label="Cancel"]',

    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',
    toastError: '.p-toast-message-error, [data-p-severity="error"]',

    // Each existing configuration renders as a ".configuration-card" (its name in an <h5>) with
    // its own kebab ("⋮") menu -> Edit/Payouts/Payout Errors — the menu items render in a
    // PrimeNG overlay appended elsewhere in the DOM (not nested inside the card), so they're
    // matched globally.
    cardMenuTrigger: 'button.p-button-icon-only:has(.pi-ellipsis-v)',
    editMenuItem: 'a.p-menuitem-link[aria-label="Edit"]',
    payoutsMenuItem: 'a.p-menuitem-link[aria-label="Payouts"]',
    payoutErrorsMenuItem: 'a.p-menuitem-link[aria-label="Payout Errors"]',
    addBandMenuItem: 'a.p-menuitem-link[aria-label="Add Band"]',

    // Add Band dialog — reached via a configuration card's kebab menu -> Add Band. Confirmed
    // live: all 3 amount fields are inputmode="numeric" (not "decimal", unlike this same dialog
    // family's own Minimum/Maximum Comp Awarded), and Transaction Type here happens to reuse the
    // id "transactionType" too — safe since it's scoped through a dialog-local locator, same as
    // every other field in this file.
    bandFieldMinimumAmount: '#minimumBandAmount input',
    bandFieldMaximumAmount: '#maximumBandAmount input',
    bandFieldBoostAmount: '#boostAmount input',
    bandFieldTransactionType: '#transactionType',

    // Is Percentage Amount — unlike this file's own 4 checkboxes (id on the wrapper), this one's
    // id sits on the native <input> itself, confirmed live — the same convention Comp Bulk's own
    // Create/Edit dialog checkboxes use.
    bandCheckboxIsPercentageAmount: 'isPercentageAmount',
};
