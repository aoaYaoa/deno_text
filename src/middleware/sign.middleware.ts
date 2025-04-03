//验证签名加密 md5+时间戳
import { Context } from "https://deno.land/x/oak@v12.5.0/mod.ts";
import { md5 } from "npm:md5";
import { getConfig } from "../config/index.ts";

export async function signMiddleware(ctx: Context, next: () => Promise<void>) {
    const config = await getConfig();
    const whiteList = config.api.whiteList;
    //白名单
    if (whiteList.includes(ctx.request.url)) {
        await next();
        return;
    }
    //解码密钥
    const  md5Key= 'E807F1FCF82D132F9BB018CA6738A19F' 
    const timestamp = ctx.request.headers.get("timestamp");
    const s_sign = ctx.request.headers.get("sign");
    const s_t = ctx.request.headers.get("st");
    //和当前时间比较，如果超过10分钟，则返回401
    if (timestamp && s_t && s_t < timestamp) {
        ctx.response.status = 401;
        ctx.response.body = { message: "签名已过期" };
        return;
    }
    //验证签名
    const sign = md5(`${md5Key}${timestamp}`);
    if (sign !== s_sign) {
        ctx.response.status = 401;
        ctx.response.body = { message: "签名错误" };
        return;
    }
}
