import dotenv from "dotenv";

dotenv.config();

const config = {
	TELEGRAM_BOT_TOKEN: process.env.BOT_TOKEN || "",
	API_BASE_URL: "https://income-api.copperx.io/api",
	PUSHER_KEY: process.env.PUSHER_KEY || "e089376087cac1a62785",
	PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || "ap1",
};

if (!config.TELEGRAM_BOT_TOKEN) {
	throw new Error("BOT_TOKEN is missing from environment variables");
}

export default config;
