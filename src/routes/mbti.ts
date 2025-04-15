// MBTI路由
import { Router } from "oak";
import * as mbtiController from "../controllers/mbti.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

const router = new Router();

// MBTI测试相关路由
router.get("/api/mbti/questions", mbtiController.getQuestions);
router.get("/api/mbti/types", mbtiController.getAllTypes);
router.get("/api/mbti/types/:type", mbtiController.getTypeDetails);
router.get("/api/mbti/roles", mbtiController.getRoles);
router.post("/api/mbti/test", mbtiController.submitTest);
router.get("/api/mbti/user/:userId/history", authMiddleware, mbtiController.getUserTestHistory);

export default router; 