import "dotenv/config"

export const environment = {
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    },
    api: {
        baseUrl: process.env.API_BASE_URL || 'https://income-api.copperx.io',
        apiKey: process.env.COPPERX_API_KEY || '',
        endpoints: {
            emailOtpRequest: '/api/auth/email-otp/request',
            emailOtpAuthenticate: '/api/auth/email-otp/authenticate',
            userProfile: '/api/auth/me',
            kycStatus: '/api/kycs',
            getWallets: '/api/wallets',
            getWalletBalances: '/api/wallets/balances',
            getDefaultWallet: '/api/wallets/default',
            setDefaultWallet: '/api/wallets/default'
        }
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        tokenExpiry: 60 * 60 * 24 * 7, // 7 days
        tokenPrefix: 'telegram_user_token:'
    }
}; 