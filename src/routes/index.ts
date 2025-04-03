// 路由集合和统一导出
import { Router } from "oak";
import authRouter from "./auth.ts";

// 创建一个主路由
const router = new Router();

// 统一导出所有路由
export default {
  routes: [
    router,
    authRouter,
    // 在这里添加更多路由
  ]
}; 