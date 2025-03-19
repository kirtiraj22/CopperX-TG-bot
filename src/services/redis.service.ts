import Redis from "ioredis";
import { environment } from "../config/environment";

// In-memory fallback for development
const inMemoryStorage = new Map<string, string>();

// Flag to track if Redis is available
let isRedisAvailable = true;
let redis: Redis | null = null;

try {
	redis = new Redis({
		host: environment.redis.host,
		port: environment.redis.port,
		password: environment.redis.password,
		connectTimeout: 5000, // 5 second timeout
		lazyConnect: true, // Don't connect immediately
	});

	// Attempt to connect
	redis.connect().catch((err) => {
		console.warn(
			"Redis connection failed, falling back to in-memory storage:",
			err.message
		);
		isRedisAvailable = false;
	});

	// Handle Redis errors without crashing
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

// User token management functions with fallback
export const setUserToken = async (
	telegramUserId: number,
	token: string
): Promise<void> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;

	if (isRedisAvailable && redis) {
		try {
			await redis.setex(key, environment.redis.tokenExpiry, token);
		} catch (error) {
			console.warn("Redis setex failed, using in-memory storage");
			isRedisAvailable = false;
			inMemoryStorage.set(key, token);

			// Set expiry for in-memory storage
			setTimeout(() => {
				inMemoryStorage.delete(key);
			}, environment.redis.tokenExpiry * 1000);
		}
	} else {
		inMemoryStorage.set(key, token);

		// Set expiry for in-memory storage
		setTimeout(() => {
			inMemoryStorage.delete(key);
		}, environment.redis.tokenExpiry * 1000);
	}
};

export const getUserToken = async (
	telegramUserId: number
): Promise<string | null> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;

	if (isRedisAvailable && redis) {
		try {
			return await redis.get(key);
		} catch (error) {
			console.warn("Redis get failed, using in-memory storage");
			isRedisAvailable = false;
			return inMemoryStorage.get(key) || null;
		}
	} else {
		return inMemoryStorage.get(key) || null;
	}
};

export const removeUserToken = async (
	telegramUserId: number
): Promise<void> => {
	const key = `${environment.redis.tokenPrefix}${telegramUserId}`;

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
