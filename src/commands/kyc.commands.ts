import { Context } from "telegraf";
import { checkKycStatus } from "../services/kyc.service";
import { getUserToken } from "../services/redis.service";

export const handleCheckKyc = async (ctx: Context) => {
	const token = await getUserToken(ctx.from!.id);
	if (!token) {
		await ctx.reply("You are not logged in. Please use /login <email>.");
		return;
	}

	const result = await checkKycStatus(token);

	if (result.success) {
		await ctx.reply(result.message);
	} else {
		if (result.kycUrl) {
			await ctx.reply(
				`Complete your KYC verification here: [Click Here](${result.kycUrl})`,
				{
					parse_mode: "Markdown",
				}
			);
		}
		await ctx.reply(result.message);
	}
};
