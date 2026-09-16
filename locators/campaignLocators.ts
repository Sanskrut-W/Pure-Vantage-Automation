export const campaignLocators = {
    // Campaign Management Page Locators
    buttonSelectRegion: 'Select a region',
    buttonCreateCampaign: 'Create Campaign',

    // Action Buttons
    buttonEdit: 'Edit',
    buttonLinkWorkflow: 'Link Workflow',
    buttonDetails: 'Details',
    buttonDelete: 'Delete',
    // A separate global header search (inside p-iconfield) also has placeholder="Search" —
    // scope to #component-container (the page's own content) to avoid matching both.
    searchInput: '#component-container input[placeholder="Search"]',

    // Delete confirmation — a real PrimeNG ConfirmDialog (p-confirm-dialog-accept/-reject),
    // unlike Coupon Management's custom .action-modal overlay.
    confirmYesBtn: 'button.p-confirm-dialog-accept, button[aria-label="Yes"]',
    confirmNoBtn: 'button.p-confirm-dialog-reject, button[aria-label="No"]',

    /////// Create Campaign Popup Locators ///////
    popupDialog: 'div[role="dialog"]',
    inputGroup: 'div.pure__input-group',

    // Field labels — each field is a `.pure__input-group` containing the control and a
    // sibling <label> with this exact text (no id/for pairing, so getByLabel won't work).
    labelCampaignName: 'Campaign Name *',
    labelCampaignDescription: 'Campaign Description *',
    labelObjective: 'Objective',
    labelReportingMetrics: 'Reporting Metrics',
    labelStartDate: 'Start Date *',
    labelEndDate: 'End Date',
    labelPromotionType: 'Promotion Type',
    labelRegions: 'Regions *',

    // Save / Cancel
    saveBtn: 'div[role="dialog"] button:has-text("Save"), div[role="dialog"] button[aria-label="Save"]',
    cancelBtn: 'div[role="dialog"] button:has-text("Cancel"), div[role="dialog"] button[aria-label="Cancel"]',

    // Validation
    validationError: '.p-error, .p-invalid, small.p-error',

    // Toast
    successToast: 'div.p-toast-message-success, [data-p-severity="success"]',
    errorToast: 'div.p-toast-message-error, [data-p-severity="error"]',

    // Multiselect (Promotion Type / Regions) — no .p-multiselect-close footer link on this
    // variant; closed via Escape instead (see CampaignPage.closeMultiSelect).
    multiSelectPanel: '.p-multiselect-panel',
    multiSelectHeaderCheckbox: '.p-multiselect-header .p-checkbox',
    multiSelectItem: '.p-multiselect-item',

    /////// Link Workflow Popup Locators ///////
    // Stable id (not per-row generated) — the actual clickable p-dropdown container.
    workflowDropdown: '#definitionId',
    // The popup's own submit button shares the exact text "Link Workflow" with the row
    // action button — scoping to inside the dialog (like saveBtn/cancelBtn) avoids
    // matching the row button underneath.
    linkWorkflowSaveBtn: 'div[role="dialog"] button:has-text("Link Workflow"), div[role="dialog"] button[aria-label="Link Workflow"]',
};
