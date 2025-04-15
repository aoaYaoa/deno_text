export const wechatLoginSchema = {
  type: "object",
  properties: {
    code: {
      type: "string",
      description: "微信授权登录后返回的临时code"
    }
  },
  required: ["code"]
};

export const wechatUserInfoSchema = {
  type: "object",
  properties: {
    encryptedData: {
      type: "string",
      description: "包括敏感数据在内的完整用户信息的加密数据"
    },
    iv: {
      type: "string",
      description: "加密算法的初始向量"
    },
    sessionKey: {
      type: "string",
      description: "微信登录获取的会话密钥"
    }
  },
  required: ["encryptedData", "iv", "sessionKey"]
}; 