import bot from './bot';

process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());

bot.launch(); 