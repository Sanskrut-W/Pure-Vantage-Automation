export const notificationScheduleLocators = {
    // Toolbar
    searchInput:            'input#searchValue',
    communicationTypeDropdown: 'div#communicationType',
    refreshBtn:             'button.btn--info',

    // Table
    dataTable:              'div.p-datatable',
    tableRows:              'div.p-datatable tbody tr',

    // Sortable columns: Template Name, Region, Campaign, Sent to Region, Scheduled Date, Created Date
    // NOT sortable: Dry Run, Processed, Actions
    colTemplateName:        'th.p-sortable-column .p-column-title:text("Template Name")',
    colRegion:              'th.p-sortable-column .p-column-title:text("Region")',
    colCampaign:            'th.p-sortable-column .p-column-title:text("Campaign")',
    colSentToRegion:        'th.p-sortable-column .p-column-title:text("Sent to Region")',
    colScheduledDate:       'th.p-sortable-column .p-column-title:text("Scheduled Date")',
    colCreatedDate:         'th.p-sortable-column .p-column-title:text("Created Date")',
    colDryRun:              'th .p-column-title:text("Dry Run")',
    colProcessed:           'th .p-column-title:text("Processed")',

    // Pagination
    paginatorBottom:        '.p-paginator-bottom',
    pageButtons:            '.p-paginator-bottom .p-paginator-page',
};
