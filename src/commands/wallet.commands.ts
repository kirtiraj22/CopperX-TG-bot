import { Context } from "telegraf";
import * as walletService from "../services/wallet.service";
import { formatApiError, isApiError } from "../utils/error.utils";
import { Wallet } from "../types/wallet.types";


export const handleGetWallet = async (ctx: Context): Promise<void> => {
	try {
		await ctx.reply("Fetching your wallets...");

		const wallets = await walletService.getWallets();

		if (isApiError(wallets)) {
			await ctx.reply(formatApiError(wallets));
			return;
		}

		if (wallets.length === 0) {
			await ctx.reply("You have no wallet linked.");
			return;
		}

		let message = "Your wallets: \n\n";

		wallets.forEach((wallet: Wallet, index: number) => {
			message += `🔹 **Wallet ${index + 1}**\n`;
			message += `📌 Address: \`${wallet.walletAddress}\`\n`;
			message += `🌐 Network: ${wallet.network}\n`;
			message += `🆔 Type: ${wallet.walletType}\n`;
			message += `⭐ Default: ${wallet.isDefault ? "Yes" : "No"}\n\n`;
		});

        await ctx.replyWithMarkdownV2(message);
	} catch (error) {
		console.error("Wallet fetch error: ", error);
        await ctx.reply("Failed to fetch wallet. Please try again.")
	}
};


export const handleGetWalletBalances = async (ctx: Context): Promise<void> => {
    try{
        await ctx.reply("Fetching your wallet balances...");

        const balances = await walletService.getWalletBalances();

        if(isApiError(balances)){
            await ctx.reply(formatApiError(balances))
            return;
        }

        if(balances.length === 0){
            await ctx.reply("You have no wallet balances.")
            return;
        }

        let message = "💰 **Your Wallet Balances:**\n\n";
        balances.forEach((wallet) => {
            message += `🔹 **Network:** ${wallet.network}\n`;
            wallet.balances.forEach((token) => {
                message += `• ${token.symbol}: ${formatBalance(token.balance, token.decimals)}\n`;
            });
            message += "\n";
        });

        await ctx.replyWithMarkdownV2(message);
    }catch(error){
        console.error("Error fetching wallet balances(45): ", error);
        await ctx.reply("Failed to fetch wallet balances. Please try again")
    }
}

const formatBalance = (balance: string, decimals: number): string => {
    const formatted = (parseFloat(balance) / 10 ** decimals).toFixed(6);
    return formatted;
}