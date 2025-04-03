// 认证中间件
import { Context, Next } from "oak";

/**
 * 验证用户是否已登录的中间件
 */
export async function authMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
    
    // 模拟从 token 中获取用户 ID
    const userId = 1; // 在实际应用中，这应该从 token 解码得到
    
    // 将用户信息附加到上下文中
    ctx.state.userId = userId;
    
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      message: "无效的认证令牌" 
    };
  }
} 