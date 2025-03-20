export interface Wallet{
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    walletType: string;
    network: string;
    walletAddress: string;
    isDefault: boolean | null;
}

export interface WalletBalance{
    walletId: string;
    isDefault: boolean | null;
    network: string;
    balances: TokenBalance[]
}

export interface TokenBalance{
    symbol: string;
    balance: string;
    decimals: number;
    address: string;
}