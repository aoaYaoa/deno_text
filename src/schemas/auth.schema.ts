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