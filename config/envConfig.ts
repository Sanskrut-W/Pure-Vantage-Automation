export const envConfig = {
    get current() {
        return process.env.ENV || 'dev';
    },

    get baseURL() {
        switch (this.current) {
            case 'prod': return 'https://wms-nxt.osiristrading.net';
            case 'staging': return 'https://wms-nxt-staging.osiristrading.net';
            case 'dev':
            default: return 'https://wms-nxt-dev.osiristrading.net';
        }
    }
};
