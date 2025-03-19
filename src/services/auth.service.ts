import api from './api.service';
import { environment } from '../config/environment';
import { 
    EmailOtpRequest, 
    EmailOtpResponse, 
    EmailOtpAuthenticate, 
    AuthResponse,
    UserProfile
} from '../types/auth.types';
import { ApiErrorResponse } from '../types/api.types';

export const requestEmailOtp = async (email: string) => {
    const payload: EmailOtpRequest = { email };
    console.log(`Sending OTP request to ${environment.api.endpoints.emailOtpRequest} for ${email}`);
    console.log('Headers:', api.defaults.headers);
    
    try {
        const response = await api.post<EmailOtpResponse | ApiErrorResponse>(
            environment.api.endpoints.emailOtpRequest, 
            payload
        );
        console.log('Response status:', response.status);
        return response;
    } catch (error: any) {
        console.error('API Error Details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        throw error;
    }
};

export const authenticateWithOtp = async (email: string, otp: string, sid: string) => {
    const payload: EmailOtpAuthenticate = { email, otp , sid};
    return api.post<AuthResponse | ApiErrorResponse>(
        environment.api.endpoints.emailOtpAuthenticate, 
        payload
    );
};

export const getUserProfile = async (token: string) => {
    
    if(!token){
        throw new Error("User is not authenticated")
    }
    return api.get<UserProfile | ApiErrorResponse>(
        environment.api.endpoints.userProfile, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
}; 