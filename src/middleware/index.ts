// 中间件索引文件 - 导出所有中间件
import { authMiddleware } from "./auth.middleware.ts";
import { errorMiddleware } from "./error.middleware.ts";
import { loggerMiddleware } from "./logger.middleware.ts";

// 添加其他中间件导出 
export const middlewares = [
  authMiddleware,
  errorMiddleware,
  loggerMiddleware
];