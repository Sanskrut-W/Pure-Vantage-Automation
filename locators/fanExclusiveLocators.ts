export const fanExclusiveLocators = {
    // Fan Exclusive Page Locators — Action Buttons
    buttonCreateFanExclusive: 'Create Fan Exclusive',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',

    // Create Fan Exclusive Form — Field Locators
    nameInput: '#name',
    tagDropdown: '#tagName',
    startDateInput: '#startDate input',
    endDateInput: '#endDate input',

    // Calendar — Today's date cell (PrimeVue)
    calendarTodayCell: '.p-datepicker-today span',

    // Dropdown list item (by visible text, PrimeVue renders li.p-dropdown-item)
    dropdownItem: (label: string) => `.p-dropdown-item:has-text("${label}")`,

    // Region-Culture dropdown trigger (matched by accessible name, not aria-label attribute)
    regionCultureDropdown: 'Add Region-Culture',

    // Region-Culture dropdown option (options carry aria-label on the li)
    regionCultureItem: (label: string) => `.p-dropdown-item[aria-label="${label}"]`,

    // Save button in the New Fan Exclusive dialog
    saveButton: 'button[aria-label="Save"]',

    // Confirm Delete — "Yes" button on the confirmation popup
    confirmDeleteBtn: 'button[aria-label="Yes"]',

    // Table row cell matching a Fan Exclusive entry by name text
    tableRowByName: (name: string) => `td:has-text("${name}")`,

    // Region Tabs (PrimeVue TabMenu inside the edit dialog)
    regionTabMenu: '.p-tabmenu',
    regionTab: (label: string) => `li.p-tabmenuitem a[aria-label="${label}"]`,
    activeRegionTab: (label: string) => `li.p-tabmenuitem[data-p-highlight="true"] a[aria-label="${label}"]`,

    // Region Configuration Elements
    isLiveCheckbox: 'input.p-checkbox-input',
    deleteRegionButton: 'Delete Region',
    promotionContentEditor: '#promotionContent',
    termsContentEditor: '#termsContent',
    bannerImageUrlInput: '#bannerImageUrl',
    mobileBannerImageUrlInput: '#mobileBannerImageUrlUrl',
};
