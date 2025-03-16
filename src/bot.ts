import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { helpCommand, startCommand } from "./commands/start";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start(startCommand);
bot.help(helpCommand);
bot.launch().then(() => console.log("CopperX BOT is running..."));
