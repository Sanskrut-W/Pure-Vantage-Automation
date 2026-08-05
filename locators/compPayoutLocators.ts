export const compPayoutLocators = {
    searchInput: 'input[placeholder="Enter Account ID..."]',
    viewConfigBtn: 'button[aria-label="View Config"]',

    // Confirmed live, in table column order.
    columnTitles: [
        'Account Id',
        'Brand Id',
        'Comp Code',
        'Transaction Type',
        'Mobile Number',
        'Actual Comp Value',
        'Amount Supplied',
        'Configuration Bonus Amount',
        'Created',
        'Region',
        'Is Dry Run',
        'Reference',
        'Casino Bonus Template Id',
        'Comp Free Bets',
        'Transaction',
    ],

    // The Comp Configuration page's header (<pure-header-details-component>) renders several
    // "Comp Title" / "Comp Code" / "Start Date" / "End Date" pairs, each a
    // ".leaderboard__item-container" with a ".marginb-1" label and a sibling
    // ".leaderboard__item-container-text" value — confirmed live. A bare
    // ".leaderboard__item-container-text" match is ambiguous (it hit "Comp Title" first, not
    // "Comp Code" — real failure), so this scopes to the container whose OWN label reads
    // "Comp Code" specifically.
    compConfigCodeValue: '.leaderboard__item-container:has(.marginb-1:text-is("Comp Code")) .leaderboard__item-container-text',
};
