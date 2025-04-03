// 路由集合和统一导出
import { Router } from "oak";
// 创建一个主路由
const router = new Router();
// 统一导出所有路由
export default {
  routes: [
    router,
    // 在这里添加更多路由
  ]
}; 