import { environment } from "../config/environment";
import { ApiErrorResponse } from "../types/api.types";
import { KycResponse } from "../types/kyc.types";
import api from "./api.service";

export const checkKycStatus = async (token: string) => {
	if (!token) {
		throw new Error("User is not authenticated!");
	}

	console.log(
		`Fetching KYC status from ${environment.api.endpoints.kycStatus}`
	);

	try {
		const response = await api.get<KycResponse | ApiErrorResponse>(
			environment.api.endpoints.kycStatus,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				params: {
					page: 1,
					limit: 1,
				},
			}
		);
        console.log("KYC response(28) : ", response)
		const { data }: any = response.data;
        console.log("KYC data(30): ", data);

		if (!data || data.length === 0) {
			return {
				success: false,
				message: "No KYC record found.",
			};
		}

		const kycStatus = data[0].status;
		const kybStatus =
			data[0]?.kybDetail?.currentKybVerification?.status || null;
		const kycUrl = data[0]?.kycDetail?.kycUrl || null;

		if (kycStatus === "approved" || kybStatus === "approved") {
			return {
				success: true,
				message: "Your KYC/KYB is approved.",
			};
		}

		return {
			success: false,
			message: "KYC/KYB not approved. Complete verification here: ",
			kycUrl,
		};
	} catch (error: any) {
		console.error("API Error Details:", {
			message: error.message,
			code: error.code,
			response: error.response?.data,
		});
		throw error;
	}
};
