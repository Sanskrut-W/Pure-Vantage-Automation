export const TutorialLocators = {
    // Landing Page
    landingRegionDropdown: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"])',
    createTutorialBtn: 'button:has-text("Create Config"), button:has-text("New Tutorial")',
    searchBar: 'input[placeholder="Search"]',
    tutorialTable: 'div.p-datatable',
    nextPageBtn: 'button.p-paginator-next',
    prevPageBtn: 'button.p-paginator-prev',
    pageNumbers: 'button.p-paginator-page',
    editBtn: 'button.p-button-rounded.p-button-success:has(.pi-pencil), button[aria-label="Edit"]',
    deleteBtn: 'button.p-button-rounded.p-button-danger:has(.pi-trash), button[aria-label="Delete"]',

    // Create / Edit Tutorial Popup
    dialogContainer: 'div[role="dialog"]',
    tutorialNameInput: 'input#tutorialName',

    // Dropdowns / Multiselects inside Popup
    popupRegionsDropdown: 'div#selectedRegions',
    popupVerticalsDropdown: 'div#selectedVerticals',
    popupPlatformsDropdown: 'div#selectedChannels',
    tutorialTypeDropdown: 'div.p-dropdown:has-text("Tutorial type"), div#tutorialType', // Fallback assumptions based on TC
    kenticoUrlDropdown: 'div#kenticoUrl',

    // Dates
    startDateInput: 'span#startDateTime input',
    endDateInput: 'span#endDateTime input',

    // Checkboxes
    loggedInCheckbox: 'input#isLoggedIn',
    loggedOutCheckbox: 'input#isLoggedOut',

    // Tags (Assumptions based on TC 5)
    includedTagsInput: 'input#includedTags, div:has-text("Included Account Tags") input',
    excludedTagsInput: 'input#excludedTags, div:has-text("Excluded Account Tags") input',

    // Actions
    saveBtn: 'div[role="dialog"] button[aria-label="Save"]',
    cancelBtn: 'div[role="dialog"] button[aria-label="Cancel"]',

    // Toast
    successToast: 'div.p-toast-message-success',
};
