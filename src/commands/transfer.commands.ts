import { Markup } from "telegraf";
import { CustomContext } from "../middleware/session.middleware";
import { getUserToken } from "../services/redis.service";
import * as transferService from "../services/transfer.service";
import { formatApiError, isApiError } from "../utils/error.utils";
import { isValidEmail } from "../utils/validation.utils";

export const handleStartEmailTransfer = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }

    ctx.session.state = "awaiting_email_recipient";
    await ctx.reply("Enter the recipient's email address:", { 
        reply_markup: { force_reply: true } 
    });
};

export const handleEmailRecipientInput = async (ctx: CustomContext): Promise<void> => {
    if (ctx.session.state !== "awaiting_email_recipient") return;
    
    const message = ctx.message as any;
    const email = message?.text?.trim();
    
    if (!email || !isValidEmail(email)) {
        await ctx.reply("Invalid email. Please enter a valid email address:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    ctx.session.data = { ...ctx.session.data, recipientEmail: email };
    ctx.session.state = "awaiting_amount";
    
    await ctx.reply("Enter the amount of USDC to send:", {
        reply_markup: { force_reply: true }
    });
};

export const handleAmountInput = async (ctx: CustomContext): Promise<void> => {
    if (ctx.session.state !== "awaiting_amount") return;
    
    const message = ctx.message as any;
    const amount = message?.text?.trim();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        await ctx.reply("Invalid amount. Please enter a valid positive number:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    ctx.session.data = { ...ctx.session.data, amount: parseFloat(amount) };
    
    await ctx.reply(
        `📝 *Transfer Summary*\n\n` +
        `Recipient: ${ctx.session.data.recipientEmail}\n` +
        `Amount: ${ctx.session.data.amount} USDC\n\n` +
        `Please confirm this transfer:`,
        {
            parse_mode: "Markdown",
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback("✅ Confirm Transfer", "confirm_email_transfer")],
                [Markup.button.callback("❌ Cancel", "cancel_transfer")]
            ]).reply_markup
        }
    );
};

export const handleConfirmEmailTransfer = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }
    
    try {
        const { recipientEmail, amount } = ctx.session.data;
        
        await ctx.editMessageText("⏳ Processing your transfer...");
        
        const result = await transferService.sendEmailTransfer(token, recipientEmail, amount);
        
        if (isApiError(result)) {
            await ctx.reply(formatApiError(result));
            return;
        }
        
        await ctx.reply(
            `✅ *Transfer Successful!*\n\n` +
            `You've sent ${amount} USDC to ${recipientEmail}\n` +
            `Transaction ID: \`${result.id}\``,
            { parse_mode: "Markdown" }
        );
        
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    } catch (error) {
        console.error("Transfer error:", error);
        await ctx.reply("❌ Transfer failed. Please try again later.");
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    }
};

export const handleStartWalletTransfer = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }

    ctx.session.state = "awaiting_wallet_address";
    await ctx.reply("Enter the recipient's wallet address:", { 
        reply_markup: { force_reply: true } 
    });
};

export const handleWalletAddressInput = async (ctx: CustomContext): Promise<void> => {
    if (ctx.session.state !== "awaiting_wallet_address") return;
    
    const message = ctx.message as any;
    const walletAddress = message?.text?.trim();
    
    if (!walletAddress) {
        await ctx.reply("Please enter a valid wallet address:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    ctx.session.data = { ...ctx.session.data, walletAddress };
    ctx.session.state = "awaiting_wallet_amount";
    
    await ctx.reply("Enter the amount of USDC to send:", {
        reply_markup: { force_reply: true }
    });
};

export const handleWalletAmountInput = async (ctx: CustomContext): Promise<void> => {
    if (ctx.session.state !== "awaiting_wallet_amount") return;
    
    const message = ctx.message as any;
    const amount = message?.text?.trim();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        await ctx.reply("Invalid amount. Please enter a valid positive number:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    ctx.session.data = { ...ctx.session.data, amount: parseFloat(amount) };
    ctx.session.state = "awaiting_wallet_network";
    
    await ctx.reply(
        "Select the network for this transfer:",
        {
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback("Solana", "network_solana")],
                [Markup.button.callback("Ethereum", "network_ethereum")],
                [Markup.button.callback("Polygon", "network_polygon")]
            ]).reply_markup
        }
    );
};

export const handleNetworkSelection = async (ctx: CustomContext, network: string): Promise<void> => {
    ctx.session.data = { ...ctx.session.data, network };
    
    await ctx.editMessageText(
        `📝 *Transfer Summary*\n\n` +
        `Recipient Wallet: \`${ctx.session.data.walletAddress}\`\n` +
        `Amount: ${ctx.session.data.amount} USDC\n` +
        `Network: ${ctx.session.data.network}\n\n` +
        `Please confirm this transfer:`,
        {
            parse_mode: "Markdown",
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback("✅ Confirm Transfer", "confirm_wallet_transfer")],
                [Markup.button.callback("❌ Cancel", "cancel_transfer")]
            ]).reply_markup
        }
    );
};

export const handleConfirmWalletTransfer = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }
    
    try {
        const { walletAddress, amount, network } = ctx.session.data;
        
        await ctx.editMessageText("⏳ Processing your transfer...");
        
        const result = await transferService.sendWalletTransfer(token, walletAddress, amount, network);
        
        if (isApiError(result)) {
            await ctx.reply(formatApiError(result));
            return;
        }
        
        await ctx.reply(
            `✅ *Transfer Successful!*\n\n` +
            `You've sent ${amount} USDC to ${walletAddress}\n` +
            `Network: ${network}\n` +
            `Transaction ID: \`${result.id}\``,
            { parse_mode: "Markdown" }
        );
        
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    } catch (error) {
        console.error("Transfer error:", error);
        await ctx.reply("❌ Transfer failed. Please try again later.");
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    }
};

export const handleStartBankWithdrawal = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }

    ctx.session.state = "awaiting_bank_amount";
    await ctx.reply("Enter the amount of USDC to withdraw to your bank:", { 
        reply_markup: { force_reply: true } 
    });
};

export const handleBankAmountInput = async (ctx: CustomContext): Promise<void> => {
    if (ctx.session.state !== "awaiting_bank_amount") return;
    
    const message = ctx.message as any;
    const amount = message?.text?.trim();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        await ctx.reply("Invalid amount. Please enter a valid positive number:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    if (parseFloat(amount) < 25) {
        await ctx.reply("❌ Minimum withdrawal amount is 25 USDC. Please enter a higher amount:", {
            reply_markup: { force_reply: true }
        });
        return;
    }
    
    ctx.session.data = { ...ctx.session.data, amount: parseFloat(amount) };
    
    await ctx.reply(
        `📝 *Bank Withdrawal Summary*\n\n` +
        `Amount: ${ctx.session.data.amount} USDC\n\n` +
        `Please confirm this withdrawal:`,
        {
            parse_mode: "Markdown",
            reply_markup: Markup.inlineKeyboard([
                [Markup.button.callback("✅ Confirm Withdrawal", "confirm_bank_withdrawal")],
                [Markup.button.callback("❌ Cancel", "cancel_transfer")]
            ]).reply_markup
        }
    );
};

export const handleConfirmBankWithdrawal = async (ctx: CustomContext): Promise<void> => {
    const token = await getUserToken(ctx.from!.id);
    if (!token) {
        await ctx.reply("❌ Authentication required. Please log in first.");
        return;
    }
    
    try {
        const { amount } = ctx.session.data;
        
        await ctx.editMessageText("⏳ Processing your bank withdrawal...");
        
        const result = await transferService.sendBankWithdrawal(token, amount);
        
        if (isApiError(result)) {
            await ctx.reply(formatApiError(result));
            return;
        }
        
        await ctx.reply(
            `✅ *Withdrawal Initiated!*\n\n` +
            `You've requested a withdrawal of ${amount} USDC to your bank account.\n` +
            `Transaction ID: \`${result.id}\`\n\n` +
            `This process typically takes 1-2 business days.`,
            { parse_mode: "Markdown" }
        );
        
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    } catch (error) {
        console.error("Bank withdrawal error:", error);
        await ctx.reply("❌ Withdrawal failed. Please try again later.");
        ctx.session.state = "IDLE";
        ctx.session.data = {};
    }
};

export const handleCancelTransfer = async (ctx: CustomContext): Promise<void> => {
    await ctx.editMessageText("❌ Transfer cancelled.");
    ctx.session.state = "IDLE";
    ctx.session.data = {};
};