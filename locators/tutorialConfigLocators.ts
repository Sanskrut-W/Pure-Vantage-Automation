export const tutorialConfigLocators = {
    // Dropdowns — matched by trigger aria-label OR the visible placeholder label, mirroring
    // the tutorialOrdering pattern (the bare :has-text span match is fragile: it dies the
    // moment a region is selected and can match leftover dropdowns from other components)
    regionDropdown: 'div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) span.p-dropdown-label, span.p-dropdown-label:text-is("Select a region")',
    regionOptions: 'li.p-dropdown-item',

    // Buttons
    createConfigBtn: 'button[aria-label="Create Config"]'
};
