export const adminAccountsLocators = {
    // Toolbar
    searchInput:       'input.pure-input[placeholder="Search"]',
    regionDropdown:    'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a Region"])',
    refreshBtn:        'button[aria-label="Refresh"]',
    createAccountBtn:  'button[aria-label="Create Account"]',

    // Table
    dataTable:         'div.p-datatable',
    tableRows:         'div.p-datatable tbody tr',
    deleteBtn:         'button[aria-label="Delete"]',

    // Sortable column headers (Admin Name, Username, Account ID are sortable; Created At is not)
    colAdminName:      'th.p-sortable-column .p-column-title:text("Admin Name")',
    colUsername:       'th.p-sortable-column .p-column-title:text("Username")',
    colAccountId:      'th.p-sortable-column .p-column-title:text("Account ID")',
    colCreatedAt:      'th .p-column-title:text("Created At")',

    // Create Account popup
    dialog:            'div.p-dialog',
    dialogAdminName:   'div.p-dialog input[placeholder*="Admin Name"], div.p-dialog [aria-label*="Admin Name"]',
    dialogUsername:    'div.p-dialog input[placeholder*="Username"], div.p-dialog [aria-label*="Username"]',
    dialogAccountGuid: 'div.p-dialog input[placeholder*="Account Guid"], div.p-dialog [aria-label*="Account Guid"]',
    dialogSaveBtn:     'div.p-dialog button[aria-label="Save"], div.p-dialog button:has-text("Save")',
    dialogCancelBtn:   'div.p-dialog button[aria-label="Cancel"], div.p-dialog button:has-text("Cancel")',

    // Delete confirmation
    confirmDialog:     'div.p-confirmdialog, div.p-dialog',
    confirmOkBtn:      'div.p-confirmdialog button[aria-label="Yes"], div.p-dialog button:has-text("Ok"), div.p-dialog button:has-text("Yes")',

    // Pagination
    paginatorBottom:   '.p-paginator-bottom',
    pageButtons:       '.p-paginator-bottom .p-paginator-page',
    nextPageBtn:       '.p-paginator-bottom .p-paginator-next',
};
