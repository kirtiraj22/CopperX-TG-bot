export interface KycResponse {
	page: number;
	limit: number;
	count: number;
	hasMore: boolean;
	data: Array<{
		id: string;
		status: string;
		kycDetail?: KycDetail;
		kybDetail?: KybDetail;
	}>;
}

export interface KycDetail {
	id: string;
	kycUrl: string;
	currentVerification?: {
		status: string;
	};
}

export interface KybDetail {
	id: string;
	currentVerification?: {
		status: string;
	};
}
