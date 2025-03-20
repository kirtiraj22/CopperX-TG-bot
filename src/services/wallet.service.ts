import { environment } from "../config/environment";
import { ApiErrorResponse } from "../types/api.types";
import { Wallet, WalletBalance } from "../types/wallet.types";
import api from "./api.service";

export const getWallets = async ()=> {
    console.log(`Fetching wallets from ${environment.api.endpoints.getWallets}`)

    try{
        const response = await api.get<Wallet[] | ApiErrorResponse>(
            environment.api.endpoints.getWallets
        )

        console.log("Fetched wallets(13): ", response.data);

        return response.data;
    }catch(error: any){
        console.error("API error: ", {
            message: error.message,
            code: error.code,
            response: error.response?.data
        })
        throw error;
    }
}
