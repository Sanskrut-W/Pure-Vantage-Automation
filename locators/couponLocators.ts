export const couponLocators = {
    /////// Coupon Management Landing Page Locators ///////
    // Search / Filter Inputs
    searchNameInput: 'input[placeholder="Search Name"]',
    searchEditedByInput: 'input[placeholder="Search Edited By"]',
    selectRegionDropdown: 'div.p-dropdown:has-text("Select a region")',
    selectCompCodeDropdown: 'div.p-dropdown:has-text("Select a Comp Code")',
    selectRequirementTypeDropdown: 'div.p-dropdown:has-text("Select Requirement Type")',

    // Create Button
    createBtn: 'Create',

    // Data Table
    couponTable: 'div.p-datatable',

    // Table Column Headers
    columnCouponName: 'Coupon Name',
    columnCompCode: 'Comp Code',
    columnCouponGroup: 'Coupon Group',
    columnRegions: 'Regions',
    columnRequirements: 'Requirements',
    columnEditedBy: 'Edited by',

    // Row Action Buttons
    buttonDelete: 'Delete',
    buttonEdit: 'Edit',
    buttonOptions: 'Options',

    // Ellipsis Menu Options
    menuOptionEdit: 'Edit',
    menuOptionRegionRequirements: 'Region Requirements',
    menuOptionCopy: 'Copy',
    menuOptionCompConfig: 'Comp Config',
    menuOptionCouponPlayers: 'Coupon Players',

    // Pagination
    paginatorNext: 'button.p-paginator-next',
    paginatorPrev: 'button.p-paginator-prev',
    paginatorPages: 'button.p-paginator-page',
    paginatorRowsPerPage: 'div.p-paginator .p-dropdown',

    // Confirmation Dialog
    confirmDialog: 'div.p-confirmdialog, div.p-dialog:has-text("Are you sure")',
    confirmYesBtn: 'button:has-text("Yes"), button[aria-label="Yes"]',
    confirmNoBtn: 'button:has-text("No"), button[aria-label="No"]',

    /////// New / Update Coupon Popup Locators ///////
    popupDialog: 'div[role="dialog"]',
    popupTitle: 'div[role="dialog"] .p-dialog-title',

    // Form Fields
    couponNameInput: '#couponName',
    couponGroupInput: '#couponGroup',
    descriptionTextarea: '#description',
    compCodeDropdown: '#compCode',
    campaignDropdown: '#campaign',
    isGlobalCouponCheckbox: '#isGlobal',
    expiryTimeInput: '#expiryTimeValue input.p-inputnumber-input',
    expiryTimeUnitDropdown: '#expiryTimeUnit',
    couponExpiryDatePicker: '#couponExpiryDate input',

    // Regions Section
    addRegionBtn: 'button:has-text("Add Region")',
    regionDeleteBtn: 'button.p-button-danger:has(.pi-trash)',

    // Save / Cancel
    saveBtn: 'div[role="dialog"] button:has-text("Save"), div[role="dialog"] button[aria-label="Save"]',
    cancelBtn: 'div[role="dialog"] button:has-text("Cancel"), div[role="dialog"] button[aria-label="Cancel"]',

    // Validation Error
    validationError: '.p-error, .p-invalid, small.p-error',

    // Toast
    successToast: 'div.p-toast-message-success',
    errorToast: 'div.p-toast-message-error',

    /////// Coupon Region Requirements Popup Locators ///////
    regionRequirementsDialog: 'div[role="dialog"]:has-text("Coupon Region Requirements")',
    requirementTypeDropdown: 'Requirement Type',
    dataFieldRequirementTypeDropdown: 'Data Field Requirement Type',
    dataFieldFilterPropertyInput: 'Data Field Filter Property',
    addRequirementBtn: 'button:has-text("Add Requirement")',
    hideFiltersBtn: 'button:has-text("Hide Filters"), button:has-text("Show Filters")',
    regionSaveBtn: 'button:has-text("Save")',
    regionCloseBtn: 'button.p-dialog-header-close, button[aria-label="Close"]',
};
