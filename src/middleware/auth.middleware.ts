import { Context, Middleware } from 'telegraf';
import { getUserToken } from '../services/redis.service';
import { setAuthToken } from '../services/api.service';

export const authMiddleware = (): Middleware<Context> => async (ctx, next) => {
    if (!ctx.from?.id) return next();

    const token = await getUserToken(ctx.from.id);
    if (token && !token.startsWith('temp_email:')) {
        setAuthToken(token);
    }

    return next();
}; 