import { Context } from "oak";
import { WechatService } from "../services/wechat.service.ts";
import { validate } from "../utils/validator.ts";
import { wechatLoginSchema, wechatUserInfoSchema } from "../schemas/wechat.ts";

export class WechatController {
  private wechatService: WechatService;

  constructor() {
    this.wechatService = new WechatService();
  }

  /**
   * 微信登录
   * @param ctx 请求上下文
   */
  async login(ctx: Context) {
    try {
      // 验证请求参数
      const body = await ctx.request.body().value;
      const { valid, errors } = validate(body, wechatLoginSchema);
      
      if (!valid) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "请求参数错误",
          errors
        };
        return;
      }

      // 调用微信登录服务
      const result = await this.wechatService.login(body.code);
      
      ctx.response.body = result;
    } catch (error) {
      console.error("[WechatController] 登录处理失败:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "服务器内部错误"
      };
    }
  }

  /**
   * 获取用户信息
   * @param ctx 请求上下文
   */
  async getUserInfo(ctx: Context) {
    try {
      // 验证请求参数
      const body = await ctx.request.body().value;
      const { valid, errors } = validate(body, wechatUserInfoSchema);
      
      if (!valid) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "请求参数错误",
          errors
        };
        return;
      }

      // 解密用户信息
      const result = await this.wechatService.decryptUserInfo(
        body.encryptedData,
        body.iv,
        body.sessionKey
      );
      
      ctx.response.body = result;
    } catch (error) {
      console.error("[WechatController] 获取用户信息失败:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "服务器内部错误"
      };
    }
  }
} 