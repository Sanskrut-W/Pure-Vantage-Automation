export const formBuilderLocators = {
    // Form Builder page UI
    searchInput: 'input.pure-input[placeholder="Search"]',

    // Container for region select (user-provided XPath points to this div)
    regionContainerXPath: '/html/body/app-root/app-base-layout/div/div/div[2]/app-component-display/div/stencil-platform/div/main/form-builder/div/div[1]/div/div/div/div',

    // Create Form button
    createFormButton: 'button[aria-label="Create Form"]',
    // Toolbar elements (confirmed from page HTML)
    regionDropdown: 'div.dropdown-input',
    createFormBtn: 'button[aria-label="Create Form"]',

    // Pagination controls (confirmed from page HTML)
    firstPageBtn: 'button[aria-label="First Page"]',
    prevPageBtn: 'button[aria-label="Previous Page"]',
    nextPageBtn: 'button[aria-label="Next Page"]',
    lastPageBtn: 'button[aria-label="Last Page"]',

    // Row action buttons (confirmed from app HTML)
    editBtn: 'button[aria-label="Edit"]',
    configBtn: 'button[aria-label="Config"]',
    duplicateBtn: 'button[aria-label="Duplicate"]',
    deleteBtn: 'button[aria-label="Delete"]',

    // Create/Edit Form popup fields (confirmed from popup HTML)
    popupRegionDropdown: '[data-pc-name="dropdown"]',
    popupTitleInput: '#title',
    popupCodeNameInput: '#codeName',
    popupSubTitleInput: '#subTitle',
    popupSaveBtn: 'button[aria-label="Save"]',
    popupCancelBtn: 'button[aria-label="Cancel"]',
};
