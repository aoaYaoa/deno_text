// cors.middleware.ts
// CORS (跨域资源共享) 中间件

import { Context, Next } from "oak";
import { getConfig } from "../config/index.ts";

/**
 * CORS中间件 - 处理跨域资源共享
 * 根据配置设置适当的CORS头
 */
export async function corsMiddleware(ctx: Context, next: Next) {
  const config = await getConfig();
  
  if (config.cors?.enabled) {
    const corsOptions = config.cors.options || {};
    
    // 设置允许的来源
    ctx.response.headers.set("Access-Control-Allow-Origin", corsOptions.origin || "*");
    
    // 设置允许的HTTP方法
    ctx.response.headers.set(
      "Access-Control-Allow-Methods",
      corsOptions.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS"
    );
    
    // 设置默认允许的头
    let allowHeaders = "Origin, X-Requested-With, Content-Type, Accept, Authorization, s_t";
    
    // 如果配置了自定义头，则使用这些头
    if (corsOptions.headers && corsOptions.headers.length > 0) {
      // 确保s_t头也被包含在内
      if (!corsOptions.headers.includes("s_t") && !corsOptions.headers.includes("s_sign")) {
        corsOptions.headers.push("s_t");
        corsOptions.headers.push("s_sign");
      }
      allowHeaders = corsOptions.headers.join(", ");
    }
    
    ctx.response.headers.set("Access-Control-Allow-Headers", allowHeaders);
    
    // 添加凭证支持
    if (corsOptions.credentials) {
      ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    
    // 设置预检请求缓存时间
    if (corsOptions.maxAge) {
      ctx.response.headers.set("Access-Control-Max-Age", String(corsOptions.maxAge));
    }
    
    // 设置允许暴露的头
    if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length > 0) {
      ctx.response.headers.set(
        "Access-Control-Expose-Headers", 
        corsOptions.exposedHeaders.join(", ")
      );
    }
    
    console.log(`[CORS] 已启用，允许来源: ${ctx.response.headers.get("Access-Control-Allow-Origin")}`);
    console.log(`[CORS] 允许的头: ${ctx.response.headers.get("Access-Control-Allow-Headers")}`);
  } else {
    console.log("[CORS] 已禁用");
  }
  
  // 处理预检请求
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    return;
  }
  
  await next();
} 