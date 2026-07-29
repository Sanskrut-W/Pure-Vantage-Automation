export const compsBulkLocators = {
    createBulkCompBtn: 'button[aria-label="Create Bulk Comp"]',

    // Create Bulk Comp dialog — none of the text/number fields or dropdowns carry a matching
    // id on their actual input element (their <label for="..."> targets an id that isn't
    // present anywhere in the rendered markup — confirmed live, the same quirk already seen in
    // this app's Simulate Bet page). Every field below is instead scoped by its adjacent
    // <label> text, which IS reliably present.
    fieldDescription: 'Bulk Comp Description *',
    csvFileInput: 'input[type="file"][accept=".csv"]',

    fieldCompCode: 'Comp Code *',
    fieldRegionCode: 'Region Code *',

    // Checkboxes DO carry stable, confirmed ids — targeted directly.
    checkboxSendPush: 'sendPush',
    checkboxSendSms: 'sendSms',
    checkboxTagUser: 'tagUser',
    checkboxIsSegment: 'isSegment',
    checkboxIsTagComp: 'isTagComp',
    checkboxIsRecurring: 'isRecurring',
    checkboxUseSegmentSuggestedCompAmount: 'useSegmentSuggestedCompAmount',
    checkboxRandomiseOrder: 'randomiseOrder',

    // Conditional fields — appear once their owning checkbox is ticked.
    fieldPushMessageTemplate: 'Push Message Template',
    fieldSmsMessageTemplate: 'SMS Message Template',
    fieldTagName: 'Tag Name',
    fieldTagValue: 'Tag Value',
    fieldSegmentationGroup: 'Segmentation Group',
    fieldPercentagePlayersToProcess: 'Percentage of Players to Process',
    fieldCompPlayerTagName: 'Comp Player Tag Name',

    // Comp Budget / Comp Value * / Comp Freebet Value are shared by label text between the "Is
    // Segment Based" and "Comp Tagged Players" sections — only one of those two sections is ever
    // rendered at a time (mutually exclusive checkboxes), so label-text scoping resolves correctly
    // regardless of which one is currently showing.
    fieldCompBudget: 'Comp Budget',
    fieldCompValue: 'Comp Value *',
    fieldCompFreebetValue: 'Comp Freebet Value',
    fieldCronExpression: 'Cron Expression',
    fieldStartDate: 'Start Date',
    fieldEndDate: 'End Date',

    // Dialog footer — confirmed live. Save starts disabled (p-disabled) until every
    // mandatory field (Description, Comp Code, Region Code, CSV) is filled.
    buttonSave: 'button[aria-label="Save"]',
    buttonCancel: 'button[aria-label="Cancel"]',

    toastSuccess: '.p-toast-message-success, [data-p-severity="success"]',
    toastError: '.p-toast-message-error, [data-p-severity="error"]',

    // Row-level kebab menu (each table row's "⋮" trigger) and its Edit/Review items — the items
    // render in a PrimeNG overlay appended elsewhere in the DOM, not nested inside the row, so
    // they're matched globally by their confirmed aria-label rather than scoped to the row.
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    editMenuItem: 'a.p-menuitem-link[aria-label="Edit"]',
    reviewMenuItem: 'a.p-menuitem-link[aria-label="Review"]',
    configurationsMenuItem: 'a.p-menuitem-link[aria-label="Configurations"]',
    payoutsMenuItem: 'a.p-menuitem-link[aria-label="Payouts"]',
    deleteMenuItem: 'a.p-menuitem-link[aria-label="Delete"]',

    // Review dialog footer — every field in this dialog is disabled (read-only); Approve is the
    // only mutating action available.
    buttonApprove: 'button[aria-label="Approve"]',

    // Confirms successful navigation to the Payouts page — this button is specific to that page
    // (not the persistent app-wide topbar), unlike the "Comp Payouts" breadcrumb text.
    payoutsPageGenerateReportBtn: 'button[aria-label="Generate Report"]',
};
