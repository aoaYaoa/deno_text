// 认证中间件
import { Context, Next } from "oak";
import { getConfig } from "../config/index.ts";
const config = await getConfig();
const whiteList: string[] = config.api?.whiteList || [
  "/api/auth/login",
  "/api/auth/register",
  "/api/login",
  "/api/register",
  "/login",
  "/register"
];

// 记录白名单
console.log("[Auth中间件] 白名单路径:", whiteList);

/**
 * 验证用户是否已登录的中间件
 */
export async function authMiddleware(ctx: Context, next: Next) {
  const path = ctx.request.url.pathname;
  
  console.log(`[Auth中间件] 处理请求: ${path}, 方法: ${ctx.request.method}`);
  
  // OPTIONS请求总是放行（处理CORS预检请求）
  if (ctx.request.method === "OPTIONS") {
    return await next();
  }
  
  // 如果是公开路径，直接放行
  // 使用endsWith或includes来匹配路径结尾部分
  if (whiteList.some((publicPath: string) => 
      path === publicPath || 
      path.endsWith(publicPath))) {
    console.log(`[Auth中间件] 白名单路径，不需要验证: ${path}`);
    return await next();
  }
  
  console.log(`[Auth中间件] 需要验证的路径: ${path}`);
  
  const authHeader = ctx.request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log(`[Auth中间件] 未提供Authorization头或不正确`);
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      message: "未授权，请登录" 
    };
    return;
  }

  const token = authHeader.split(" ")[1];
  
  try {
    // 这里应该有验证 token 的逻辑
    // 为演示目的，我们使用简化版本
    if (token === "invalid_token") {
      throw new Error("无效的令牌");
    }
    
    console.log(`[Auth中间件] 令牌验证成功`);
    
    // 模拟从 token 中获取用户 ID
    const userId = 1; // 在实际应用中，这应该从 token 解码得到
    
    // 将用户信息附加到上下文中
    ctx.state.userId = userId;
    
    await next();
  } catch (err) {
    const error = err as Error;
    console.log(`[Auth中间件] 令牌验证失败: ${error.message}`);
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      message: "无效的认证令牌" 
    };
  }
} 