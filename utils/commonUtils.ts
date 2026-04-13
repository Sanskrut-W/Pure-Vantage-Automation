export class CommonUtils {
    /**
     * Pauses execution for a specified duration in milliseconds.
     * Note: Should only be used for debugging.
     */
    static async pause(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generates a random alphanumeric string of a given length.
     */
    static generateRandomString(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
