import "dotenv/config"

export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const API_BASE_URL = process.env.API_BASE_URL || 'https://income-api.copperx.io';
export const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
};

export const API_ENDPOINTS = {
    EMAIL_OTP_REQUEST: '/api/auth/email-otp/request',
    EMAIL_OTP_AUTHENTICATE: '/api/auth/email-otp/authenticate',
    USER_PROFILE: '/api/auth/me'
} as const; 