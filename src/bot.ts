import { Telegraf, Context } from "telegraf";
import { environment } from "./config/environment";
import { authMiddleware } from "./middleware/auth.middleware";

import * as authCommands from "./commands/auth.commands";
import * as kycCommands from "./commands/kyc.commands";
import * as walletCommands from "./commands/wallet.commands"
import { CustomContext, sessionMiddleware } from "./middleware/session.middleware";

const bot = new Telegraf<CustomContext>(environment.telegram.botToken);

bot.use(sessionMiddleware())
bot.use(authMiddleware());

bot.command("start", authCommands.handleStart);
bot.command("login", authCommands.handleLogin);
bot.command("verify", authCommands.handleVerify);
bot.command("profile", authCommands.handleProfile);
bot.command("logout", authCommands.handleLogout);
bot.command("check_kyc", kycCommands.handleCheckKyc);
bot.command("wallet", walletCommands.handleGetWallet);
bot.command("balances", walletCommands.handleGetWalletBalances)

bot.catch((err: any, ctx: Context) => {
	console.error("Bot error:", err);
	ctx.reply("An error occurred. Please try again later.");
});

export const launch = (): void => {
	bot.launch();
	console.log("Bot is running...");
};

export const stop = (): void => {
	bot.stop();
};

export default { launch, stop };
