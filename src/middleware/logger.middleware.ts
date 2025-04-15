// 日志中间件
import { Context, Next } from "oak";
import { randomUUID } from "node:crypto";

/**
 * 请求日志记录中间件
 */
export async function loggerMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  const requestId = randomUUID();
  
  // 为每个请求生成唯一ID
  ctx.state.requestId = requestId;
  
  // 记录请求开始
  console.log(`[${requestId}] ${new Date().toISOString()} | ${ctx.request.method} ${ctx.request.url.pathname} - 开始处理`);

  try {
    // 处理请求
    await next();
    
    // 计算处理时间
    const ms = Date.now() - start;
    const status = ctx.response.status;
    
    // 记录请求完成
    console.log(`[${requestId}] ${new Date().toISOString()} | ${ctx.request.method} ${ctx.request.url.pathname} - ${status} - ${ms}ms`);
  } catch (error) {
    // 计算处理时间
    const ms = Date.now() - start;
    
    // 记录错误
    console.error(`[${requestId}] ${new Date().toISOString()} | ${ctx.request.method} ${ctx.request.url.pathname} - 错误 - ${ms}ms`, error);
    
    // 继续抛出错误，让错误处理中间件处理
    throw error;
  }
} 