import Redis from "ioredis";
import { environment } from "../config/environment";

const inMemoryStorage = new Map<string, string>();

let isRedisAvailable = true;
let redis: Redis | null = null;

try {
	redis = new Redis({
		host: environment.redis.host,
		port: environment.redis.port,
		password: environment.redis.password,
		connectTimeout: 5000,
		lazyConnect: true,
	});

	redis.connect().catch((err) => {
		console.warn(
			"Redis connection failed, falling back to in-memory storage:",
			err.message
		);
		isRedisAvailable = false;
	});

	redis.on("error", (err) => {
		if (isRedisAvailable) {
			console.warn(
				"Redis error, falling back to in-memory storage:",
				err.message
			);
			isRedisAvailable = false;
		}
	});
} catch (error) {
	console.warn("Failed to initialize Redis, using in-memory storage");
	isRedisAvailable = false;
}

export const setUserToken = async (
	telegramUserId: number,
	token: string
): Promise<void> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;

	if (isRedisAvailable && redis) {
		try {
			await redis.setex(key, environment.redis.tokenExpiry, token);
			console.log("token Successfully stored to redis!");
		} catch (error) {
			console.warn("Redis setex failed, using in-memory storage");
			isRedisAvailable = false;
			inMemoryStorage.set(key, token);

			setTimeout(() => {
				inMemoryStorage.delete(key);
			}, environment.redis.tokenExpiry * 1000);
		}
	} else {
		console.log("Using in memory storage!");
		inMemoryStorage.set(key, token);

		setTimeout(() => {
			inMemoryStorage.delete(key);
		}, environment.redis.tokenExpiry * 1000);
	}
};

export const getUserToken = async (
	telegramUserId: number
): Promise<string | null> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;
	console.log("Redis user token key(redis.service.ts 74): ", key);
	if (isRedisAvailable && redis) {
		try {
			return await redis.get(key);
		} catch (error) {
			console.warn("Redis get failed, using in-memory storage");
			isRedisAvailable = false;
			return inMemoryStorage.get(key) || null;
		}
	} else {
		console.log("Using in-memory storage(83)");
		return inMemoryStorage.get(key) || null;
	}
};

export const removeUserToken = async (
	telegramUserId: number
): Promise<void> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;
	console.log("Removing token from redis...(92)")
	if (isRedisAvailable && redis) {
		try {
			await redis.del(key);
		} catch (error) {
			console.warn("Redis del failed, using in-memory storage");
			isRedisAvailable = false;
			inMemoryStorage.delete(key);
		}
	} else {
		inMemoryStorage.delete(key);
	}
};
