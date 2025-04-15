import { Context } from "oak";
import { AuthService } from "../services/auth.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { getConfig } from "../config/index.ts";
import { validate } from "../utils/validator.ts";
import { registerSchema } from "../schemas/auth.schema.ts";

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
    async register(ctx: Context) {
        try {
            const body = await ctx.request.body();
            const { username, password, email } = await body.value;

            // 验证请求体
            const validationResult = validate({ username, password, email }, registerSchema);
            if (!validationResult.valid) {
                ctx.response.status = 400;
                ctx.response.body = { success: false, message: "请求体验证失败", errors: validationResult.errors };
                return; 
            }

            // 检查用户是否已存在
            const existingUser = await this.authService.findUserByUsername(username);
            if (existingUser) {
                ctx.response.status = 400;
                ctx.response.body = { success: false, message: "用户已存在" };
                return;
            }

            // 创建新用户
            const newUser = await this.authService.register({ username, password, email });
    
            ctx.response.body = { success: true, message: "用户注册成功", user: newUser };
        } catch (error: unknown) {
            ctx.response.status = 400;
            ctx.response.body = { 
                success: false, 
                message: "用户注册失败", 
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
