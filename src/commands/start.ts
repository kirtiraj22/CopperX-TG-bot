import { Context } from "telegraf";

export const startCommand = async (ctx: Context) => {
	await ctx.reply(
		`Welcome to CopperX bot! Use /help to see available commands
        `
	);
};

export const helpCommand = async (ctx: Context) => {
    await ctx.reply(`
        Available commands: 
        /start - Start the bot
        /help - Show help
        /balance - Check you wallet Balance    
    `)
}
