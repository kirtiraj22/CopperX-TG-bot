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