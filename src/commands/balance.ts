import { Context } from "telegraf";
import { getUserBalance } from "../services/copperx";

export const balanceCommand = async (ctx: Context) => {
	try {
        const balance = await getUserBalance();
        await ctx.reply(`Your balance: ${balance} USDC`)
	} catch (error) {
		await ctx.reply(`Failed to fetch balance.Try again later`);
	}
};
