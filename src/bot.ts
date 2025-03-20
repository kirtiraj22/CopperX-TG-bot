import { Telegraf, Context } from "telegraf";
import { environment } from "./config/environment";
import * as authCommands from "./commands/auth.commands";
import { authMiddleware } from "./middleware/auth.middleware";
import { handleCheckKyc } from "./commands/kyc.commands";

const bot = new Telegraf<Context>(environment.telegram.botToken);

bot.use(authMiddleware());

bot.command("start", authCommands.handleStart);
bot.command("login", authCommands.handleLogin);
bot.command("verify", authCommands.handleVerify);
bot.command("profile", authCommands.handleProfile);
bot.command("logout", authCommands.handleLogout);
bot.command("check_kyc", handleCheckKyc);

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
