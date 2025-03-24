export interface Transaction {
	hash: string;
	amount: string;
	tokenSymbol: string;
	fromAddress: string;
	toAddress: string;
	timestamp: string;
	network: string;
	status: string;
}

export interface TransferResponse {
	id: string;
	status: string;
	amount: string;
	fee: string;
	recipientInfo: {
		email?: string;
		address?: string;
	};
	transactionHash?: string;
	createdAt: string;
}
