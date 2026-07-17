export const tutorialOrderingLocators = {
    // Region dropdown — matched by either the trigger aria-label OR the visible
    // "Select a region" placeholder label (the trigger has no aria-label on this page)
    regionDropdown: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]), div.p-dropdown:has(.p-dropdown-label:text-is("Select a region"))',

    // Search input at the top of the Tutorials list
    searchInput: 'input.pure-input[placeholder="Search"]',

    // Three main data tables on the page
    tutorialsTable: 'div.p-datatable:has(.p-datatable-header:has-text("Tutorials"))',
    loggedInTable:  'div.p-datatable:has(.p-datatable-header:has-text("Logged In"))',
    loggedOutTable: 'div.p-datatable:has(.p-datatable-header:has-text("Logged Out"))',

    // Save button
    updateBtn: 'button:has-text("Update")',
};
