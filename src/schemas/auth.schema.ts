// 用户登录请求
export interface LoginRequest {
  username: string;
  password: string;
}
export const loginSchema= {
    type: "object",
    properties: {
        username: {
            type: "string",
            minLength: 3,
            maxLength: 20   
        },
        password: {
            type: "string",
            minLength: 8,
            maxLength: 20
        }
    }, 
    required: ["username", "password"]
}
// 用户注册请求
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
}
export const registerSchema = {
  username: true,  // 必填
  password: true,  // 必填
  email: true      // 必填
};