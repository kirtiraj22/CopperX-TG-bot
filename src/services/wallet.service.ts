import { environment } from "../config/environment";
import { ApiErrorResponse } from "../types/api.types";
import {
	DefaultWalletResponse,
	Wallet,
	WalletBalance,
} from "../types/wallet.types";
import api from "./api.service";

export const getWallets = async () => {
	console.log(
		`Fetching wallets from ${environment.api.endpoints.getWallets}`
	);

	try {
		const response = await api.get<Wallet[] | ApiErrorResponse>(
			environment.api.endpoints.getWallets
		);

		console.log("Fetched wallets(13): ", response.data);

		return response.data;
	} catch (error: any) {
		console.error("API error: ", {
			message: error.message,
			code: error.code,
			response: error.response?.data,
		});
		throw error;
	}
};

export const getWalletBalances = async (token: string): Promise<WalletBalance[]> => {
	console.log(
		`Fetching wallet balances from ${environment.api.endpoints.getWalletBalances}`
	);

	try {
		const response = await api.get<WalletBalance[]>(
			environment.api.endpoints.getWalletBalances,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		console.log("Fetched wallet balances: ", response.data);

		return response.data;
	} catch (error: any) {
		console.error("API Error: ", {
			message: error.message,
			code: error.code,
			response: error.response?.data,
		});
		throw error;
	}
};

export const getDefaultWallet = async (
	token: string
): Promise<DefaultWalletResponse | null> => {
	try {
		const response = await api.get<DefaultWalletResponse>(
			environment.api.endpoints.getDefaultWallet,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		console.log("getDefaultWallet success(73):", response.data);
		return response.data;
	} catch (error) {
		console.error("Error getting default wallet(52): ", error);
		return null;
	}
};

export const setDefaultWallet = async (
	token: string,
	walletId: string
): Promise<DefaultWalletResponse> => {
	try {
		const response = await api.post<DefaultWalletResponse>(
			environment.api.endpoints.setDefaultWallet,
			{ walletId },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		console.log("set wallet success(92): ", response.data);
		return response.data;
	} catch (error: any) {
		console.log("Error setting default wallet(84) :", error);
		throw new Error(error);
	}
};
