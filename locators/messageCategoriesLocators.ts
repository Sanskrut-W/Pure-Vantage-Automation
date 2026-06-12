export const messageCategoriesLocators = {
    // Toolbar
    searchInput:        'input.primary-input[placeholder="Search"]',
    refreshBtn:         'button[aria-label="Refresh"]',
    createCategoryBtn:  'button[aria-label="Create Category"]',

    // Table
    dataTable:          'div.p-datatable',
    tableRows:          'div.p-datatable tbody tr',
    editBtn:            'button[aria-label="Edit"]',
    deleteBtn:          'button[aria-label="Delete"]',

    // Column headers — Category Name, Category Icon, Modified By are sortable; Modified Date is not
    colCategoryName:    'th.p-sortable-column .p-column-title:text("Category Name")',
    colCategoryIcon:    'th.p-sortable-column .p-column-title:text("Category Icon")',
    colModifiedBy:      'th.p-sortable-column .p-column-title:text("Modified By")',
    colModifiedDate:    'th .p-column-title:text("Modified Date")',

    // Create / Edit popup
    dialog:             'div.p-dialog',
    dialogCategoryName: 'div.p-dialog input[placeholder*="Category Name"], div.p-dialog [aria-label*="Category Name"]',
    dialogCategoryIcon: 'div.p-dialog input[placeholder*="Category Icon"], div.p-dialog [aria-label*="Category Icon"]',
    dialogSaveBtn:      'div.p-dialog button[aria-label="Save"], div.p-dialog button:has-text("Save")',
    dialogCancelBtn:    'div.p-dialog button[aria-label="Cancel"], div.p-dialog button:has-text("Cancel")',

    // Delete confirmation
    confirmDialog:      'div.p-confirmdialog, div.p-dialog',
    confirmOkBtn:       'div.p-confirmdialog button[aria-label="Yes"], div.p-dialog button:has-text("Ok"), div.p-dialog button:has-text("Yes")',

    // Pagination
    paginatorBottom:    '.p-paginator-bottom',
    pageButtons:        '.p-paginator-bottom .p-paginator-page',
    nextPageBtn:        '.p-paginator-bottom .p-paginator-next',
};
