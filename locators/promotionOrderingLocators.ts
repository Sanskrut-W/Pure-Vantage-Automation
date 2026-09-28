export const promotionOrderingLocators = {
    // Dropdown aria-labels
    dropdownPromoType: 'Select Promo Type',
    dropdownRegion: 'Select Region',

    // Buttons
    addPromotionBtn: 'button[aria-label="Add New Promotion To Vertical"]',

    /////// Add New Promotion To Vertical Popup ///////
    popupDialog: 'div[role="dialog"]',
    // Stable ids (not per-row generated) — the actual clickable p-dropdown containers.
    promoDropdown: '#promoSelect',
    verticalDropdown: '#verticalSelect',
    // Scoped inside the dialog since the page also has its own "Save"/"Cancel" controls.
    popupSaveBtn: 'div[role="dialog"] button[aria-label="Save"]',
    popupCancelBtn: 'div[role="dialog"] button[aria-label="Cancel"]',
    validationError: '.p-error, .p-invalid, small.p-error',

    /////// Vertical Table Section ///////
    // Each vertical renders as its own div.p-datatable, with a `.p-datatable-header`
    // sibling of `.p-datatable-wrapper` holding the vertical's name (e.g. "Sport").
    verticalTableWrapper: 'div.p-datatable',
    verticalSectionHeader: '.p-datatable-header',
    deleteRowBtn: 'button:has(.pi-times)',
    // Deleting an already-saved (persisted) Promo shows a real PrimeNG ConfirmDialog —
    // clicking × on one only just added in the current session is a no-op with no dialog.
    confirmYesBtn: 'button.p-confirm-dialog-accept, button[aria-label="Yes"]',

    /////// Context Menu (right-click on a row already in a vertical) ///////
    contextMenu: 'ul.p-contextmenu-root-list',
    moveUpOption: 'Move Up',
    moveDownOption: 'Move Down',

    // Toast
    successToast: 'div.p-toast-message-success, [data-p-severity="success"]',
    errorToast: 'div.p-toast-message-error, [data-p-severity="error"]',
};
