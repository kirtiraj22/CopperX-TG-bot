import { environment } from "../config/environment";
import { ApiErrorResponse } from "../types/api.types";
import { TransferResponse } from "../types/transaction.types";
import api from "./api.service";

export const sendEmailTransfer = async (
    token: string,
    recipientEmail: string,
    amount: number
): Promise<TransferResponse | ApiErrorResponse> => {
    console.log(`Sending email transfer to ${recipientEmail}`);

    try {
        const response = await api.post<TransferResponse | ApiErrorResponse>(
            environment.api.endpoints.emailTransfer,
            {
                recipientEmail,
                amount: amount.toString(),
                note: "Transfer via Telegram Bot"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log("Email transfer response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("API Error:", {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        throw error;
    }
};

export const sendWalletTransfer = async (
    token: string,
    recipientWallet: string,
    amount: number,
    network: string
): Promise<TransferResponse | ApiErrorResponse> => {
    console.log(`Sending wallet transfer to ${recipientWallet} on ${network}`);

    try {
        const response = await api.post<TransferResponse | ApiErrorResponse>(
            environment.api.endpoints.walletTransfer,
            {
                recipientAddress: recipientWallet,
                amount: amount.toString(),
                network: network.toLowerCase(),
                note: "Transfer via Telegram Bot"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log("Wallet transfer response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("API Error:", {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        throw error;
    }
};

export const sendBankWithdrawal = async (
    token: string,
    amount: number
): Promise<TransferResponse | ApiErrorResponse> => {
    console.log(`Initiating bank withdrawal of ${amount} USDC`);

    try {
        const response = await api.post<TransferResponse | ApiErrorResponse>(
            environment.api.endpoints.bankWithdrawal,
            {
                amount: amount.toString(),
                note: "Withdrawal via Telegram Bot"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log("Bank withdrawal response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("API Error:", {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        throw error;
    }
};