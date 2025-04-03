// main.ts - 应用程序入口文件

import { Application } from "oak";
import { getConfig, getEnvironment } from "./src/config/index.ts";
import routes from "./src/routes/index.ts";
import { middlewares } from './src/middleware/index.ts';

// 简单的求和函数，用于测试（保留用于兼容性）
export function sum(a: number, b: number): number {
  return a + b;
}

// 初始化
async function bootstrap() {
  // 加载当前环境配置
  const config = await getConfig();
  const env = getEnvironment();
  
  console.log(`启动应用 (${env} 环境)...`);
  
  // 创建应用程序
  const app = new Application();
  
  // 中间件：记录请求
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const reqInfo = `${ctx.request.method} ${ctx.request.url.pathname}`;
    console.log(`${reqInfo} - ${ms}ms`);
  });
  
  // 错误处理中间件
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      console.error("服务器错误:", error);
      ctx.response.status = 500;
      ctx.response.body = { 
        success: false, 
        message: "服务器内部错误",
        error: config.env === 'development' ? 
          error instanceof Error ? error.message : String(error) 
          : undefined 
      };
    }
  });
  
  //注册所有中间件
  for (const middleware of middlewares) {
    app.use(middleware);
    console.log(`注册中间件: ${middleware.name}`);
  }
  
  // 注册所有路由
  for (const router of routes.routes) {
    app.use(router.routes());
    app.use(router.allowedMethods());
  }
  
  // 优雅关闭
  app.addEventListener("close", async () => {
    console.log("正在关闭数据库连接...");
  });
  
  // 启动服务器
  const { port, host } = config.server;
  console.log(`服务器启动在 http://${host}:${port}`);
  
  app.addEventListener("listen", () => {
    console.log(`🚀 服务器运行在 http://${host}:${port} (${env}环境)`);
  });
  
  // 启动服务器
  await app.listen({ port, hostname: host });
}

// 启动应用
if (import.meta.main) {
  bootstrap().catch((error: unknown) => {
    console.error("应用启动失败:", error);
    Deno.exit(1);
  });
}
