import { Context } from "oak";
import { AuthService } from "../services/auth.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { getConfig } from "../config/index.ts";

export class AuthController {
    private authService = new AuthService();
    
    async login(ctx: Context) {
        try {
            const body = await ctx.request.body();
            const { username, password, remember = false } = await body.value;
            
            // 直接匹配用户名和密码
            const user = await this.authService.findUserByCredentials({username, password});
            
            if (!user) {
                ctx.response.status = 401;
                ctx.response.body = { success: false, message: "用户名或密码错误" };
                return;
            }
            
            // 生成JWT令牌
            const config = await getConfig();
            const payload = {
                id: (user as any)._id?.toString() || "unknown",
                username: (user as any).username || "unknown",
                role: (user as any).role || "user",
                exp: Math.floor(Date.now() / 1000) + (remember ? 30 : 1) * 24 * 60 * 60,
            };
            
            const key = await this.getJwtKey(config.secret);
            const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);
            
            ctx.response.body = { 
                success: true, 
                token, 
                user: {
                    id: (user as any)._id?.toString() || "unknown",
                    username: (user as any).username || "unknown",
                    role: (user as any).role || "user",
                    nickname: (user as any).nickname
                } 
            };
        } catch (error) {
            ctx.response.status = 400;
            ctx.response.body = { 
                success: false, 
                message: "登录请求处理失败" 
            };
        }
    }
    
    // 生成JWT密钥
    private async getJwtKey(secret: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        
        return await crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"]
        );
    }
}
