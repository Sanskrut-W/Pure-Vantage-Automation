export const envConfig = {
    get current() {
        return process.env.ENV || 'dev';
    },

    get baseURL() {
        switch (this.current) {
            case 'prod': return 'https://purevantage-dev.osiristrading.com/main/home';
            case 'staging': return 'https://purevantage-dev.osiristrading.com/main/home';
            case 'dev':
            default: return 'https://purevantage-dev.osiristrading.com/main/home';
        }
    }
};
