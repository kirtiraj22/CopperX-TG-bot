import { Markup } from "telegraf";
import * as walletService from "../services/wallet.service";
import { formatApiError, isApiError } from "../utils/error.utils";
import { Wallet, WalletBalance } from "../types/wallet.types";
import { getUserToken } from "../services/redis.service";
import { formatBalance } from "../utils/wallet.utils";
import { CustomContext } from "../middleware/session.middleware";

export const handleGetWallet = async (ctx: CustomContext): Promise<void> => {
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
		await ctx.reply("Failed to fetch wallet. Please try again.");
	}
};

export const handleGetWalletBalances = async (ctx: CustomContext): Promise<void> => {
	try {
		await ctx.reply("Fetching your wallet balances...");
		const token = await getUserToken(ctx.from!.id);
		if (!token) {
			await ctx.reply("❌ Authentication required. Please log in again.");
			return;
		}

		const balances = await walletService.getWalletBalances(token);

		if (isApiError(balances)) {
			await ctx.reply(formatApiError(balances));
			return;
		}

		if (balances.length === 0) {
			await ctx.reply("You have no wallet balances.");
			return;
		}

		let message = "💰 **Your Wallet Balances:**\n\n";
		balances.forEach((wallet) => {
			message += `🔹 **Network:** ${wallet.network}\n`;
			wallet.balances.forEach((token) => {
				message += `• ${token.symbol}: ${formatBalance(
					token.balance,
					token.decimals
				)}\n`;
			});
			message += "\n";
		});

		await ctx.replyWithMarkdownV2(message);
	} catch (error) {
		console.error("Error fetching wallet balances(45): ", error);
		await ctx.reply("Failed to fetch wallet balances. Please try again");
	}
};

export const handleDefaultWallet = async (ctx: CustomContext) => {
	const token = await getUserToken(ctx.from!.id);
	if (!token) {
		await ctx.reply("❌ Authentication required. Please log in again.");
		return;
	}

	try {
		const defaultWallet = await walletService.getDefaultWallet(token);

		if (!defaultWallet) {
			return ctx.reply(
				"🚫 No default wallet found.\n\n👉 Use `/changedefaultwallet` to set one."
			);
		}

		const message =
			`🔹 **Your Default Wallet:**\n\n` +
			`🌐 **Network:** ${defaultWallet.network}\n` +
			`🆔 **Wallet ID:** \`${defaultWallet.id}\`\n` +
			`🏦 **Address:** \`${defaultWallet.walletAddress}\`\n\n` +
			`🛠 To change it, type: \`/changedefaultwallet\``;

		ctx.reply(message, {
			parse_mode: "MarkdownV2",
		});
	} catch (error) {
		console.error("Error getting default wallet(91): ", error);
		await ctx.reply("Failed to fetch default wallet. Please try again");
	}
};

export const handleChangeDefaultWallet = async (ctx: CustomContext) => {
	const token = await getUserToken(ctx.from!.id);
	if (!token) {
		await ctx.reply("❌ Authentication required. Please log in again.");
		return;
	}

	try {
		const wallets: WalletBalance[] = await walletService.getWalletBalances(
			token
		);

		if (wallets.length === 0 || !wallets) {
			return ctx.reply("🚫 No wallets found. Please add a wallet first.");
		}

		// const buttons = wallets.map((wallet) => {
		// 	Markup.button.callback(
		// 		`🌐 ${wallet.network}: ${wallet.walletId}`,
		// 		`set_default:${wallet.walletId}`
		// 	);
		// });

		const buttons = wallets
			.filter((wallet) => wallet.walletId)
			.map((wallet) =>
				Markup.button.callback(
					`🌐 ${wallet.network}: ${wallet.walletId}`,
					`set_default:${wallet.walletId}`
				)
			);

		const keyboard = Markup.inlineKeyboard(buttons, {
			columns: 1,
		});

		ctx.reply("📌 Select a wallet to set as default:", keyboard);
	} catch (error) {
		console.error("Error changing default wallet(128): ", error);
		await ctx.reply("Failed to change default wallet. Please try again");
	}
};
