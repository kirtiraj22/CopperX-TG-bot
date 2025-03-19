export interface EmailOtpRequest {
    email: string;
}

export interface EmailOtpResponse {
    success: boolean;
    otp_sent: boolean;
    sid: string
}

export interface EmailOtpAuthenticate {
    email: string;
    otp: string;
    sid: string;
}

export interface AuthResponse {
    token: string;
    user_id: string;
}

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    organizationId: string;
    role: string;
    status: string;
    type: string;
    relayerAddress: string;
    flags: string[];
    walletAddress: string;
    walletId: string;
    walletAccountType: string;
}

export interface ErrorResponse {
    message: Record<string, unknown>;
    statusCode: number;
    error: string;
} 