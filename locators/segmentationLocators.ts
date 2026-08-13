export const segmentationLocators = {
    // Segmentation Page Locators
    buttonCreateSegment: 'Create Segment',
    buttonEdit: 'Edit',
    buttonExport: 'Export',
    buttonDelete: 'Delete',
    searchInput: 'input.pure-input[placeholder="Search"]',

    // Create Segment popup — mandatory fields (query builder widget)
    inputSegmentationName: '#segmentation-name',
    inputDescription: '#segmentation-description',
    buttonCreateQuery: 'Create Query',
    buttonPreviewQuery: 'Preview Query',
    buttonClearQuery: 'Clear',
    buttonCancelQuery: 'Cancel',
    // Edit Segment popup — same footer group as Create, with Create Query swapped for Update Query
    buttonUpdateQuery: 'Update Query',

    // Delete confirmation dialog (PrimeNG ConfirmDialog) — Yes/No are generic text so the
    // dialog's own accept/reject classes are used instead of aria-label, to avoid matching
    // some other Yes/No dialog elsewhere on the page.
    confirmDialogAccept: '.p-confirm-dialog-accept',
    confirmDialogReject: '.p-confirm-dialog-reject',

    // Create Segment popup — query builder rule row (second/editable row, index 0-1)
    // Row 0-0 is a permanently disabled, pre-filled default rule and is never interacted with.
    inputFieldSelect: '#field-0-1',
    inputOperatorSelect: '#operator-0-1',
    inputValue: '#value-0-1',
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
    dropdownNoResults: '.p-dropdown-empty-message',

    // Query builder rule row — dynamic index accessors. Rows are added via the "+" button;
    // ids follow field-0-{index} / operator-0-{index} / value-0-{index}, index starting at 1
    // for the first editable row (index 0 is the disabled default rule).
    fieldSelectId: (rowIndex: number) => `#field-0-${rowIndex}`,
    operatorSelectId: (rowIndex: number) => `#operator-0-${rowIndex}`,
    valueInputId: (rowIndex: number) => `#value-0-${rowIndex}`,

    // "+" button that appends a new rule row (icon-only, rounded — distinct from the
    // "Create Segment" button which also uses btn--success but has visible text and isn't rounded)
    buttonAddRule: '.p-button-rounded.btn--success',
    // AND/OR toggle tag rendered between consecutive rule rows
    andOrToggle: '.query-builder-tag-inner',
    // Delete button for an added rule row (no title attribute — distinguishes it from the
    // sort row's delete button, which has title="Remove sort")
    buttonDeleteRule: 'button.btn--danger.p-button-icon-only:not([title])',
    // Only the user-editable rule rows (excludes the disabled default row 0-0)
    editableRuleRow: '.rule:not(.rule--disabled)',

    // Sorting section
    buttonAddSort: 'Add Sort',
    buttonDeleteSort: 'button[title="Remove sort"]',
    sortRow: 'div.d-flex.margint-7',
    sortFieldId: (index: number) => `#sort-field-${index}`,
    sortOrderId: (index: number) => `#sort-order-${index}`,

    inputLimit: '#limit-input',

    // Export Properties popup — dynamic index accessors. Rows are added via the Add button;
    // ids follow segmentationGroup-{index} / segmentationGroupValue-{index}, starting at 0.
    segmentationGroupId: (index: number) => `#segmentationGroup-${index}`,
    segmentationGroupValueId: (index: number) => `#segmentationGroupValue-${index}`,
    // Rounded "Add" button that appends another Segmentation Group/Percentage row
    buttonAddExportRow: 'Add',
    // Delete button for an export row — only rendered once a second row exists (can't delete
    // down to zero rows)
    buttonDeleteExportRow: 'button.btn--danger.marginl-2.p-button-icon-only',
    exportTotalDisplay: '.total-display',
    buttonSave: 'Save',
    buttonCancelExport: 'Cancel'
};
