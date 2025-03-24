import * as authService from "../services/auth.service";
import {
	getUserToken,
	setUserToken,
	removeUserToken,
} from "../services/redis.service";
import { setAuthToken } from "../services/api.service";
import { isApiError, formatApiError } from "../utils/error.utils";
import { isValidEmail, isValidOtp } from "../utils/validation.utils";
import { UserProfile } from "../types/auth.types";
import { CustomContext } from "../middleware/session.middleware";
import { Markup } from "telegraf";
import * as notificationService from "../services/notification.service";

export const handleStart = async (ctx: CustomContext): Promise<void> => {
	console.log("User session: ", ctx.session);
	await ctx.reply(
		"Welcome to CopperX Telegram Bot! Choose an option:",
		Markup.inlineKeyboard([
			[Markup.button.callback("🔑 Login", "start_login")],
			[Markup.button.callback("📝 Verify OTP", "start_verify")],
			[Markup.button.callback("👤 View Profile", "view_profile")],
			[Markup.button.callback("✅ Check KYC", "check_kyc")],
			[Markup.button.callback("💳 Wallets", "view_wallets")],
			[Markup.button.callback("💰 Balances", "check_balance")],
			[Markup.button.callback("💸 Send Funds", "start_transfer")],
			[
				Markup.button.callback(
					"🏦 Withdraw to Bank",
					"start_bank_withdrawal"
				),
			],
			[Markup.button.callback("🔐 Logout", "logout")],
		])
	);
};

export const handleLoginStart = async (ctx: CustomContext): Promise<void> => {
	ctx.session.state = "awaiting_email";
	await ctx.reply("Please enter your email to login:", {
		reply_markup: { force_reply: true },
	});
};

export const handleEmailInput = async (ctx: CustomContext): Promise<void> => {
	if (ctx.session.state !== "awaiting_email") return;

	const message = ctx.message as any;
	const email = message?.text?.trim();

	if (!email || !isValidEmail(email)) {
		await ctx.reply("Invalid email. Please enter a valid email:", {
			reply_markup: { force_reply: true },
		});
		return;
	}

	ctx.session.state = null;
	await processLogin(ctx, email);
};

const processLogin = async (
	ctx: CustomContext,
	email: string
): Promise<void> => {
	try {
		await ctx.reply(`Sending OTP to ${email}...`);

		const response = await authService.requestEmailOtp(email);
		const data = response.data;

		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		await setUserToken(
			ctx.from!.id,
			JSON.stringify({ email, sid: data.sid })
		);

		ctx.session.state = "awaiting_otp";
		await ctx.reply(
			"✅ OTP sent to your email. Please enter it to verify:",
			{
				reply_markup: { force_reply: true },
			}
		);
	} catch (error) {
		await ctx.reply("Failed to send OTP. Try again later.");
	}
};

export const handleOtpInput = async (ctx: CustomContext): Promise<void> => {
	if (ctx.session.state !== "awaiting_otp") return;

	const message = ctx.message as any;
	const otp = message?.text?.trim();

	if (!otp || !isValidOtp(otp)) {
		await ctx.reply("Invalid OTP. Please enter only numbers:", {
			reply_markup: { force_reply: true },
		});
		return;
	}

	const storedData = await getUserToken(ctx.from!.id);

	if (!storedData) {
		await ctx.reply(
			"Session expired. Please start the login process again."
		);
		return;
	}

	const { email, sid } = JSON.parse(storedData);

	try {
		await ctx.reply("Verifying OTP...");

		const response = await authService.authenticateWithOtp(email, otp, sid);
		const data = response.data;

		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		const authData = data as any;
		await setUserToken(ctx.from!.id, authData.accessToken);
		setAuthToken(authData.accessToken);

		await ctx.reply(
			"🎉 Successfully authenticated!\n\nWhat would you like to do next?",
			Markup.inlineKeyboard([
				[Markup.button.callback("👤 View Profile", "view_profile")],
				[Markup.button.callback("💳 View Wallets", "view_wallets")],
				[Markup.button.callback("💰 Check Balances", "check_balance")],
			])
		);

		const profileResponse = await authService.getUserProfile(
			authData.accessToken
		);
		if (!isApiError(profileResponse.data)) {
			const profile = profileResponse.data as UserProfile;

			if (profile.organizationId) {
				await notificationService.initializePusher(
					authData.accessToken,
					profile.organizationId,
					ctx.telegram,
					ctx.from!.id
				);
			}
		}

		ctx.session.state = "IDLE";
	} catch (error) {
		await ctx.reply("Invalid OTP. Please try again.");
	}
};

export const handleVerifyStart = async (ctx: CustomContext): Promise<void> => {
	const storedData = await getUserToken(ctx.from!.id);

	if (!storedData) {
		await ctx.reply(
			"Please start the login process first:",
			Markup.inlineKeyboard([
				[Markup.button.callback("🔑 Login", "start_login")],
			])
		);
		return;
	}

	try {
		const { email } = JSON.parse(storedData);

		ctx.session.state = "awaiting_otp";
		await ctx.reply(`Please enter the OTP sent to ${email}:`, {
			reply_markup: { force_reply: true },
		});
	} catch (error) {
		await ctx.reply("Please start the login process again.");
	}
};

export const handleLogin = async (ctx: CustomContext): Promise<void> => {
	ctx.session.state = "awaiting_email";
	await ctx.reply("Please enter your email to login:", {
		reply_markup: { force_reply: true },
	});
};

export const handleVerify = async (ctx: CustomContext): Promise<void> => {
	const storedData = await getUserToken(ctx.from!.id);

	if (!storedData) {
		await ctx.reply(
			"Please start the login process first:",
			Markup.inlineKeyboard([
				[Markup.button.callback("🔑 Login", "start_login")],
			])
		);
		return;
	}

	try {
		const { email } = JSON.parse(storedData);

		ctx.session.state = "awaiting_otp";
		await ctx.reply(`Please enter the OTP sent to ${email}:`, {
			reply_markup: { force_reply: true },
		});
	} catch (error) {
		await ctx.reply("Please start the login process again.");
	}
};

export const handleProfile = async (ctx: CustomContext): Promise<void> => {
	try {
		await ctx.reply("Fetching your profile...");

		const token = await getUserToken(ctx.from!.id);
		if (!token) {
			await ctx.reply(
				"You are not logged in. Please log in first:",
				Markup.inlineKeyboard([
					[Markup.button.callback("🔑 Login", "start_login")],
				])
			);
			return;
		}

		const response = await authService.getUserProfile(token);
		const data = response.data;

		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		const profile = data as UserProfile;

		await ctx.reply(
			`👤 *Profile Information*\n\n` +
				`Name: ${profile.firstName} ${profile.lastName}\n` +
				`Email: ${profile.email}\n` +
				`Role: ${profile.role}\n` +
				`Status: ${profile.status}\n` +
				`Type: ${profile.type}\n` +
				`Wallet Address: \`${profile.walletAddress || "Not set"}\``,
			{
				parse_mode: "Markdown",
				reply_markup: Markup.inlineKeyboard([
					[Markup.button.callback("💳 View Wallets", "view_wallets")],
					[
						Markup.button.callback(
							"💰 Check Balances",
							"check_balance"
						),
					],
					[
						Markup.button.callback(
							"✅ Check KYC Status",
							"check_kyc"
						),
					],
				]).reply_markup,
			}
		);
	} catch (error) {
		await ctx.reply(
			"Failed to fetch profile. Please make sure you are logged in."
		);
	}
};

export const handleLogout = async (ctx: CustomContext): Promise<void> => {
	console.log("Logging out...");
	const token = await getUserToken(ctx.from!.id);

	if (!token) {
		await ctx.reply("You are already logged out.");
		return;
	}

	await removeUserToken(ctx.from!.id);
	setAuthToken("");
	await ctx.reply("Successfully logged out.");
};
