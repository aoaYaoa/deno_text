import { Router } from "oak";
import { WechatController } from "../controllers/wechat.ts";

// 创建路由
const wechatRouter = new Router();
const wechatController = new WechatController();

// 微信登录
wechatRouter.post("/api/wechat/login", wechatController.login.bind(wechatController));

// 获取用户信息
wechatRouter.post("/api/wechat/user-info", wechatController.getUserInfo.bind(wechatController));

export default wechatRouter; 