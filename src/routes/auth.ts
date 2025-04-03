import { Router } from "oak";
import { AuthController } from "../controllers/auth.ts";

const authController = new AuthController();

// 创建路由
const authRouter = new Router();

authRouter.post("/api/auth/login", authController.login.bind(authController));

export default authRouter;
