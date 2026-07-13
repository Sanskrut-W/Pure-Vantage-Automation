export const messageCTALocators = {
    // Toolbar
    searchInput:    'input.pure-input[placeholder="Search"]',
    regionDropdown: 'div.p-dropdown:has(div[aria-label="Select a Region"])',
    refreshBtn:     'button[aria-label="Refresh"]',
    createCTABtn:   'button[aria-label="Create CTA"]',

    // Table
    dataTable:      'div.p-datatable',
    tableRows:      'div.p-datatable tbody tr',
    editBtn:        'button[aria-label="Edit"]',
    deleteBtn:      'button[aria-label="Delete"]',

    // Column headers — Action, Name, Color, Value, Text, Region, Culture, Modified By are sortable
    // Modified Date is NOT sortable
    colAction:      'th.p-sortable-column .p-column-title:text("Action")',
    colName:        'th.p-sortable-column .p-column-title:text("Name")',
    colColor:       'th.p-sortable-column .p-column-title:text("Color")',
    colValue:       'th.p-sortable-column .p-column-title:text("Value")',
    colText:        'th.p-sortable-column .p-column-title:text("Text")',
    colRegion:      'th.p-sortable-column .p-column-title:text("Region")',
    colCulture:     'th.p-sortable-column .p-column-title:text("Culture")',
    colModifiedBy:  'th.p-sortable-column .p-column-title:text("Modified By")',
    colModifiedDate:'th .p-column-title:text("Modified Date")',

    // Create / Edit (Update CTA) popup
    dialog:         'div.p-dialog',
    dialogCancelBtn:'div.p-dialog button[aria-label="Cancel"], div.p-dialog button:has-text("Cancel")',
    dialogSaveBtn:  'div.p-dialog button[aria-label="Save"], div.p-dialog button:has-text("Save")',

    // Delete confirmation
    confirmDialog:  'div.p-confirmdialog, div.p-dialog',
    confirmOkBtn:   'div.p-confirmdialog button[aria-label="Yes"], div.p-dialog button:has-text("Ok"), div.p-dialog button:has-text("Yes")',

    // Pagination
    paginatorBottom:'.p-paginator-bottom',
    pageButtons:    '.p-paginator-bottom .p-paginator-page',
    nextPageBtn:    '.p-paginator-bottom .p-paginator-next',
};
