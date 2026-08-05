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

    // Bands render as one flat ".band-details" list further down the Configurations page
    // (confirmed live) — NOT nested inside each ".configuration-card", so a Band row is a
    // sibling section, not a child of any card. Each row's own kebab menu -> Edit/Delete uses
    // the identical trigger/menu-item CSS as Configuration cards' own kebab (must be scoped to
    // the specific band row, not queried globally, or it'll match a card's kebab too).
    bandRow: '.band-details',
    bandDetailItem: 'div.detail-item',

    // Delete confirmation — the same Yes/No modal pattern already used for Comp Bulk's own
    // Delete/Process/Cancel actions (CompsBulkPage). deleteMenuItem is shared by both a
    // Configuration card's own kebab menu and a Band row's kebab menu — same aria-label either
    // way, always scoped to whichever row/card's kebab was just opened.
    deleteMenuItem: 'a.p-menuitem-link[aria-label="Delete"]',
    buttonYes: 'button[aria-label="Yes"]',
    buttonNo: 'button[aria-label="No"]',

    // Active/Inactive toggle on a Configuration card — no id/aria-label. A card actually
    // renders 4 PrimeNG InputSwitches (Status, Allow Multiple Comp, Value Provided, Dry Run),
    // all sharing the same .p-inputswitch-slider class, so a bare class match strict-mode
    // violates (confirmed live via the real error). Only the Status one sits under its own
    // ".status-toggle" wrapper (per that same error's element paths), which is what scopes
    // this to the right one. Requires at least 1 Band already on the Configuration to
    // successfully activate (confirmed by the user).
    activeToggle: '.status-toggle .p-inputswitch-slider',

    // Back button on the Configurations page — no id/aria-label, matched by its icon + class.
    backButton: 'button.btn--info.p-button-icon-only:has(.pi-chevron-left)',
};
