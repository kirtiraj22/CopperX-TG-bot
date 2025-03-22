import { environment } from "../config/environment";
import { ApiErrorResponse } from "../types/api.types";
import { Transaction } from "../types/transaction.types";
import api from "./api.service";

export const getTransactionHistory = async (token: string): Promise<Transaction[] | ApiErrorResponse> => {
    console.log(`Fetching transaction history from ${environment.api.endpoints.handleTransactionHistory}`)

    try{
        const response = await api.get<Transaction[] | ApiErrorResponse>(
            environment.api.endpoints.handleTransactionHistory,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        
        console.log("Transaction history(19) : ", response.data);

        return response.data;
    }catch(error: any){
        console.error("API error: ", {
			message: error.message,
			code: error.code,
			response: error.response?.data,
		});
		throw error;
    }
}