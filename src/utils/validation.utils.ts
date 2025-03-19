export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidOtp = (otp: string): boolean => {
    return /^\d+$/.test(otp);
}; 