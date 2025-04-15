import { Router } from "oak";
import { HomeController } from "../controllers/home.ts";
const homeController = new HomeController();
// 创建路由
const homeRouter = new Router();
homeRouter.post("/api/home/search", homeController.search.bind(homeController));
export default homeRouter;