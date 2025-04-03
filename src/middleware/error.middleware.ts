// 错误处理中间件
import { Context, Next } from "oak";
import { ZodError } from "zod";

/**
 * 全局错误处理中间件
 */
export async function errorMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error: unknown) {
    let status = 500;
    let message = "服务器内部错误";
    let details = undefined;

    // 处理 Oak 的 HTTP 错误
    if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
      status = error.status;
      if ('message' in error && typeof error.message === 'string') {
        message = error.message;
      }
    } 
    // 处理 Zod 验证错误
    else if (error instanceof ZodError) {
      status = 400;
      message = "请求数据验证失败";
      details = error.errors;
    } 
    // 处理自定义错误
    else if (error instanceof Error) {
      message = error.message;
    }

    // 记录错误
    console.error(`[错误] ${status} - ${message}`, error);

    // 设置响应
    ctx.response.status = status;
    ctx.response.body = {
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }
} 