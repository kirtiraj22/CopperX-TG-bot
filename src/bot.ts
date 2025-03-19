import { Telegraf, Context } from "telegraf";
import { environment } from "./config/environment";
import * as authCommands from "./commands/auth.commands";
import { authMiddleware } from "./middleware/auth.middleware";

// Create the bot instance
const bot = new Telegraf<Context>(environment.telegram.botToken);

// Setup middleware
bot.use(authMiddleware());

// Setup commands
bot.command("start", authCommands.handleStart);
bot.command("login", authCommands.handleLogin);
bot.command("verify", authCommands.handleVerify);
bot.command("profile", authCommands.handleProfile);
bot.command("logout", authCommands.handleLogout);

// Error handling
bot.catch((err: any, ctx: Context) => {
	console.error("Bot error:", err);
	ctx.reply("An error occurred. Please try again later.");
});

// Export functions to control the bot
export const launch = (): void => {
	bot.launch();
	console.log("Bot is running...");
};

export const stop = (): void => {
	bot.stop();
};

export default { launch, stop };
