export const messageTemplatesLocators = {
    // Toolbar
    searchInput:         'input.pure-input[placeholder="Search"]',
    regionDropdown:      'div.p-dropdown:has(div[aria-label="Select a Region"])',
    refreshBtn:          'button[aria-label="Refresh"]',
    createTemplateBtn:   'button[aria-label="Create Message Template"]',

    // Table
    dataTable:           'div.p-datatable',
    tableRows:           'div.p-datatable tbody tr',
    editBtn:             'button[aria-label="Edit"]',
    configBtn:           'button[aria-label="Config"]',
    duplicateBtn:        'button[aria-label="Duplicate"]',
    deleteBtn:           'button[aria-label="Delete"]',

    // Sortable columns: Template Name, Type, Style, Region Code, Cultures, Modified By
    // NOT sortable: Modified Date
    colTemplateName:    'th.p-sortable-column .p-column-title:text("Template Name")',
    colType:            'th.p-sortable-column .p-column-title:text("Type")',
    colStyle:           'th.p-sortable-column .p-column-title:text("Style")',
    colRegionCode:      'th.p-sortable-column .p-column-title:text("Region Code")',
    colCultures:        'th.p-sortable-column .p-column-title:text("Cultures")',
    colModifiedBy:      'th.p-sortable-column .p-column-title:text("Modified By")',
    colModifiedDate:    'th .p-column-title:text("Modified Date")',

    // Create / Update popup
    dialog:             'div.p-dialog',
    dialogSaveBtn:      'div.p-dialog button[aria-label="Save"], div.p-dialog button:has-text("Save")',
    dialogCancelBtn:    'div.p-dialog button[aria-label="Cancel"], div.p-dialog button:has-text("Cancel")',

    // Config popup extra controls
    configPreviewBtn:   'div.p-dialog button[aria-label="Preview"], div.p-dialog button:has-text("Preview")',
    richTextEditor:     'div.p-dialog .ql-editor, div.p-dialog [contenteditable="true"]',
    cultureDropdown:    'div.p-dialog div.p-dropdown',

    // Delete confirmation
    confirmDialog:      'div.p-confirmdialog, div.p-dialog',
    confirmOkBtn:       'div.p-confirmdialog button[aria-label="Yes"], div.p-dialog button:has-text("Ok"), div.p-dialog button:has-text("Yes")',

    // Pagination
    paginatorBottom:    '.p-paginator-bottom',
    pageButtons:        '.p-paginator-bottom .p-paginator-page',
};
