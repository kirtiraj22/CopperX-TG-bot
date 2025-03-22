import { CustomContext } from "../middleware/session.middleware";
import { getUserToken } from "../services/redis.service";
import * as transactionServices from "../services/transaction.service";
import { formatApiError, isApiError } from "../utils/error.utils";
export const handleTransactionHistory = async (
	ctx: CustomContext
): Promise<void> => {
	try {
		ctx.session.state = "FETCHING_TRANSACTIONS";
		await ctx.reply("📊 Fetching your transaction history...");

		const token = await getUserToken(ctx.from!.id);
		if (!token) {
			ctx.session.state = "IDLE";
			await ctx.reply("❌ Authentication required. Please log in again.");
			return;
		}

		const transactions = await transactionServices.getTransactionHistory(
			token
		);

		if (isApiError(transactions)) {
			ctx.session.state = "IDLE";
			await ctx.reply(formatApiError(transactions));

			return;
		}

		if (transactions.length === 0) {
			ctx.session.state = "IDLE";
			await ctx.reply("🔍 No transactions found.");
			return;
		}

		let message = "📜 **Your Recent Transactions:**\n\n";

		transactions.forEach((tx, index) => {
			message += `🔹 **Transaction ${index + 1}**\n`;
			message += `📌 Txn Hash: \`${tx.hash}\`\n`;
			message += `💰 Amount: ${tx.amount} ${tx.tokenSymbol}\n`;
			message += `🆔 From: \`${tx.fromAddress}\`\n`;
			message += `📍 To: \`${tx.toAddress}\`\n`;
			message += `📅 Date: ${tx.timestamp}\n`;
			message += `🌐 Network: ${tx.network}\n`;
			message += `⚡ Status: ${tx.status}\n\n`;
		});

		await ctx.replyWithMarkdownV2(message);
		ctx.session.state = "IDLE";
	} catch (error) {
		console.error("Error fetching transaction history(45): ", error);
		ctx.session.state = "IDLE";
		await ctx.reply("⚠️ Failed to fetch transactions. Please try again.");
	}
};
