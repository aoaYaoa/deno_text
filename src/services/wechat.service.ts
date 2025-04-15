import { BaseService } from "./base.ts";
import { createHash } from "node:crypto";

interface WechatLoginResult {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;

}

interface WechatUserInfo {
  openId: string;
  nickName: string;
  gender: number;
  city: string;
  province: string;
  country: string;
  avatarUrl: string;
  unionId?: string;
}

export class WechatService extends BaseService {
  private appId: string;
  private appSecret: string;
  private collectionName = "wechat_users";

  constructor() {
    super();
    // 从环境变量获取微信小程序的AppID和AppSecret
    this.appId = Deno.env.get("WECHAT_APPID") || "";
    this.appSecret = Deno.env.get("WECHAT_SECRET") || "";
    
    if (!this.appId || !this.appSecret) {
      console.warn("[WechatService] 微信AppID或AppSecret未配置，请在环境变量中设置WECHAT_APPID和WECHAT_SECRET");
    }
  }

  /**
   * 微信登录 - 获取用户OpenID和会话密钥
   * @param code 小程序登录时获取的临时code
   */
  async login(code: string): Promise<{
    success: boolean;
    code?: number;
    data?: {
      openid: string;
      sessionKey: string;
      token?: string;
    };
    message?: string;
  }> {
    try {
      // 调用微信接口，获取openid和session_key
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;
      const response = await fetch(url);
      const data = await response.json() as WechatLoginResult;

      if (data.errcode) {
        return {
          success: false,
          message: `微信登录失败: ${data.errmsg} (${data.errcode})`
        };
      }

      // 查询或创建用户
      await this.mongoDBService.connect();
      
      try {
        const users = await this.mongoDBService.find(this.collectionName, { openid: data.openid });
        
        // 如果用户不存在，创建新用户
        if (users.length === 0) {
          await this.mongoDBService.insertOne(this.collectionName, {
            openid: data.openid,
            unionid: data.unionid,
            created_at: new Date(),
            last_login: new Date()
          });
        } else {
          // 更新最后登录时间
          await this.mongoDBService.updateOne(
            this.collectionName, 
            { openid: data.openid }, 
            { $set: { last_login: new Date() } }
          );
        }
      } finally {
        await this.mongoDBService.close();
      }

      // 生成登录令牌
      const token = this.generateToken(data.openid, data.session_key);

      return {
        success: true,
        code: 200,
        data: {
          openid: data.openid,
          sessionKey: data.session_key,
          token
        }
      };
    } catch (error) {
      console.error("[WechatService] 登录失败:", error);
      return {
        success: false,
        message: "微信登录处理失败"
      };
    }
  }

  /**
   * 解密微信加密的用户数据
   * @param encryptedData 加密数据
   * @param iv 加密初始向量
   * @param sessionKey 会话密钥
   */
  async decryptUserInfo(encryptedData: string, iv: string, sessionKey: string): Promise<{
    success: boolean;
    data?: WechatUserInfo;
    message?: string;
  }> {
    try {
      // 实现微信数据解密
      // 注意：实际实现需要使用适当的解密库
      // 这里提供一个简化的示例

      // 使用web-crypto来解密数据
      const key = this.base64ToArrayBuffer(sessionKey);
      const ivBuffer = this.base64ToArrayBuffer(iv);
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
      
      // 解密逻辑略 (需要实现)
      // 这里仅为示例
      
      console.log("[WechatService] 解密用户数据");
      
      return {
        success: false,
        message: "解密功能尚未实现，请使用第三方微信解密库"
      };
    } catch (error) {
      console.error("[WechatService] 解密用户数据失败:", error);
      return {
        success: false,
        message: "解密微信用户数据失败"
      };
    }
  }

  /**
   * 生成简单的令牌
   * @param openid 用户OpenID
   * @param sessionKey 会话密钥
   */
  private generateToken(openid: string, sessionKey: string): string {
    const timestamp = Date.now().toString();
    const rawToken = `${openid}:${sessionKey}:${timestamp}`;
    
    // 使用SHA-256生成令牌
    const hash = createHash("sha256");
    hash.update(rawToken);
    return hash.digest("hex");
  }

  /**
   * Base64字符串转ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
} 