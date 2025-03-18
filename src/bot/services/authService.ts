import axios from "axios";
import {
	AuthRequestResponse,
	AuthVerifyResponse,
	UserProfileResponse,
} from "../../types/auth.types";
import config from "../../config";

export class AuthService {
	public static sessionToken: string | null = null;
    public static sid: string | null = null;
	static async requestOTP(email: string): Promise<AuthRequestResponse> {
		try {
			const response = await axios.post<AuthRequestResponse>(
				`${config.API_BASE_URL}/auth/email-otp/request`,
				{ email }
			);
            this.sid = response.data.sid;
			return response.data;
		} catch (error: any) {
			console.error(
				"Error requesting OTP: ",
				error.response?.data || error.message
			);
			throw new Error("Failed to request OTP");
		}
	}

	static async verifyOTP(email: string, otp: string): Promise<boolean> {
        if(!this.sid){
            throw new Error("Session ID is missing, request OTP first")
        }
		try {
			const response = await axios.post<AuthVerifyResponse>(
				`${config.API_BASE_URL}/auth/email-otp/authenticate`,
				{
					email,
					otp,
                    sid: this.sid,
				}
			);

			if (response.data.accessToken) {
				this.sessionToken = response.data.accessToken;
				return true;
			}

			return false;
		} catch (error: any) {
			console.error(
				"Error verifying OTP: ",
				error.response?.data || error.message
			);
			throw new Error("OTP verification failed.");
		}
	}

	static async getUserProfile(): Promise<UserProfileResponse> {
		try {
			const response = await axios.get<UserProfileResponse>(
				`${config.API_BASE_URL}/auth/me`,
				{
					headers: {
						Authorization: `Bearer ${this.sessionToken}`,
					},
				}
			);
			return response.data;
		} catch (error: any) {
			console.error(
				"Error fetching user profile: ",
				error.response?.data || error.message
			);
			throw new Error("Failed to fetch user profile.");
		}
	}

	static isAuthenticated(): boolean {
		return !!this.sessionToken;
	}
}
