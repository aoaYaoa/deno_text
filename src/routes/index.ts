// 路由集合和统一导出
import { Router } from "oak";
import authRouter from "./auth.ts";
import homeRouter from "./home.ts";
import cartRouter from "./cart.ts";
import wechatRouter from "./wechat.ts";
import mbtiRouter from "./mbti.ts";
import systemRouter from "./system.ts";

// 统一导出所有路由
export default {
  routes: [
    authRouter,
    homeRouter,
    cartRouter,
    wechatRouter,
    mbtiRouter,
    systemRouter,
    // 在这里添加更多路由
  ]
}; 