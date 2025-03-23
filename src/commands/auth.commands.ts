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
			[Markup.button.callback("🔐 Logout", "logout")],
		])
	);
};

export const handleLoginStart = async (ctx: CustomContext): Promise<void> => {
	ctx.session.state = "awaiting_email";
	await ctx.reply("Please enter your email to login:");
};

export const handleEmailInput = async (ctx: CustomContext): Promise<void> => {
	if (ctx.session.state !== "awaiting_email") return;
	// const email = ctx.message?.text?.trim();
	const message = ctx.message as any;
	const email = message?.text?.trim();
	if (!email || !isValidEmail(email)) {
		await ctx.reply("Invalid email. Please enter a valid email:");
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
		await ctx.reply(
			"OTP sent to your email. Please enter it to verify:",
			Markup.inlineKeyboard([
				[Markup.button.callback("📝 Enter OTP", "start_verify")],
			])
		);
	} catch (error) {
		await ctx.reply("Failed to send OTP. Try again later.");
	}
};

export const handleLogin = async (ctx: CustomContext): Promise<void> => {
	const message =
		ctx.message && "text" in ctx.message ? ctx.message.text : "";
	const args = message.split(" ");

	if (args.length !== 2) {
		await ctx.reply("Please use the format: /login <email>");
		return;
	}

	const email = args[1];
	if (!isValidEmail(email)) {
		await ctx.reply("Please enter a valid email address.");
		return;
	}

	try {
		const response = await authService.requestEmailOtp(email);
		const data = response.data;
		console.log("Email otp response(43): ", data);

		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		await setUserToken(
			ctx.from!.id,
			JSON.stringify({ email, sid: data.sid })
		);
		await ctx.reply(
			"OTP has been sent to your email. Please verify using /verify <otp>"
		);
	} catch (error: any) {
		console.error("OTP Error: ", error);
		await ctx.reply("Failed to send OTP. Please try again.");
	}
};

export const handleVerify = async (ctx: CustomContext): Promise<void> => {
	const message =
		ctx.message && "text" in ctx.message ? ctx.message.text : "";
	const args = message.split(" ");

	if (args.length !== 2) {
		await ctx.reply("Please use the format: /verify <otp>");
		return;
	}

	const otp = args[1];
	if (!isValidOtp(otp)) {
		await ctx.reply("OTP should contain only numbers.");
		return;
	}

	const storedData = await getUserToken(ctx.from!.id);
	console.log("Token from Redis(67): ", storedData);

	if (!storedData) {
		await ctx.reply("Please start the login process using /login <email>");
		return;
	}

	const { email, sid } = JSON.parse(storedData);

	try {
		const response = await authService.authenticateWithOtp(email, otp, sid);
		const data = response.data;
		console.log("Auth services response(89): ", data);
		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		const authData = data as any;
		await setUserToken(ctx.from!.id, authData.accessToken);
		await setAuthToken(authData.accessToken);
		console.log("Auth Data(88): ", authData);
		await ctx.reply(
			"Successfully authenticated! Use /profile to view your profile."
		);
	} catch (error) {
		await ctx.reply("Invalid OTP. Please try again.");
	}
};

export const handleProfile = async (ctx: CustomContext): Promise<void> => {
	try {
		const token = await getUserToken(ctx.from!.id);
		if (!token) {
			await ctx.reply(
				"You are not logged in. Please use /login <email>."
			);
			return;
		}
		// console.log("Token stored(120): ", token)

		const response = await authService.getUserProfile(token);
		const data = response.data;
		console.log("User profile response(116): ", data);
		if (isApiError(data)) {
			await ctx.reply(formatApiError(data));
			return;
		}

		const profile = data as UserProfile;
		console.log("Fetched profile(123) : ", profile);
		await ctx.reply(
			`Profile Information:\n\n` +
				`Name: ${profile.firstName} ${profile.lastName}\n` +
				`Email: ${profile.email}\n` +
				`Role: ${profile.role}\n` +
				`Status: ${profile.status}\n` +
				`Type: ${profile.type}\n` +
				`Wallet Address: ${profile.walletAddress || "Not set"}`
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
	console.log("Token before loggin out:(151)", token);
	if (!token) {
		await ctx.reply("You are already logged out.");
		return;
	}

	await removeUserToken(ctx.from!.id);
	setAuthToken("");
	await ctx.reply("Successfully logged out.");
};
