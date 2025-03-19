import { Context, Middleware } from 'telegraf';
import { getUserToken } from '../services/redis.service';
import { setAuthToken } from '../services/api.service';

export const authMiddleware = (): Middleware<Context> => async (ctx, next) => {
    console.log("Inside middleware...")
    if (!ctx.from?.id) {
        await next();
        return;
    }

    const token = await getUserToken(ctx.from.id);
    if (token && !token.startsWith('temp_email:')) {
        setAuthToken(token);
    }else{
        setAuthToken("")
    }

    return next();
}; 