export const formatBalance = (balance: string, decimals: number): string => {
	const formatted = (parseFloat(balance) / 10 ** decimals).toFixed(6);
	return formatted;
};