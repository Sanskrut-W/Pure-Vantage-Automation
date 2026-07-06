export const whitelistTestAccountsLocators = {
    // Toolbar
    searchInput: 'input.pure-input[placeholder="Search"]',
    // Note: "Whitlelist" is a typo in the actual HTML aria-label — must match exactly
    createBtn:   'button[aria-label="Create Whitlelist Account"]',

    // Table
    dataTable:   'div.p-datatable',
    editBtn:     'button[aria-label="Edit"]',
    deleteBtn:   'button[aria-label="Delete"]',

    // Dialog
    dialog:           'div.p-dialog',
    dialogSaveBtn:    'div.p-dialog button:has-text("Save"), div.p-dialog button:has-text("Create")',
    dialogCancelBtn:  'div.p-dialog button:has-text("Cancel")',

    // Confirmation dialog
    confirmDialog:    'div.p-confirmdialog, div.p-dialog',
    confirmYesBtn:    'div.p-confirmdialog button:has-text("Yes"), div.p-dialog button:has-text("Confirm"), div.p-dialog button:has-text("Delete")',

    // Validation
    validationError:  '.p-error, .p-invalid',

    // Pagination
    paginatorBottom:  '.p-paginator-bottom',
    pageButtons:      '.p-paginator-bottom .p-paginator-page',
};
