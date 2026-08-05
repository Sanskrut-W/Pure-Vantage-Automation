export const compPayoutErrorsLocators = {
    searchInput: 'input[placeholder="Enter Account ID..."]',
    viewBtn: 'button[aria-label="View"]',

    // Confirmed live, in table column order — one column short of Comp Payout Details
    // (no Configuration Bonus Amount / Casino Bonus Template Id) but with its own "Note".
    columnTitles: [
        'Account Id',
        'Brand Id',
        'Comp Code',
        'Transaction Type',
        'Mobile Number',
        'Actual Comp Value',
        'Amount Supplied',
        'Created',
        'Region',
        'Is Dry Run',
        'Reference',
        'Comp Free Bets',
        'Transaction',
        'Note',
    ],

    // The Comp Configuration page's header (<pure-header-details-component>) renders several
    // "Comp Title" / "Comp Code" / "Start Date" / "End Date" pairs sharing the same value
    // class — confirmed live (same shared destination page as Comp Payout Details' own "View
    // Config", just reached here via "View"). Scoped to the container whose OWN label reads
    // "Comp Code" specifically, not just the first value on the page.
    compConfigCodeValue: '.leaderboard__item-container:has(.marginb-1:text-is("Comp Code")) .leaderboard__item-container-text',
};
