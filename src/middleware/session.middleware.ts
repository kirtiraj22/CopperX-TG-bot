import { Context, Middleware } from "telegraf";
import { getUserSession } from "../services/redis.service";

export interface sessionData {
    state: string | null;
    data?: any;
}

export interface CustomContext extends Context {
    session: sessionData;
}

export const sessionMiddleware = (): Middleware<CustomContext> => async (ctx, next) => {
    if(!ctx.from?.id)   return next();

    ctx.session = await getUserSession(ctx.from.id)
    return next();
}