/**
 * 远程环境变量检查工具
 * 尝试通过API获取远程服务器的环境配置信息
 */

// 远程API基础URL
const remoteApiUrl = "https://elpis-deno-elpis-jpgztwr9g611.deno.dev";

/**
 * 调用环境检查API
 */
async function checkRemoteEnv() {
  const endpoint = "/api/system/env";
  const url = `${remoteApiUrl}${endpoint}`;
  
  console.log(`尝试获取远程环境信息: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    console.log(`状态码: ${response.status} (${response.statusText})`);
    
    // 尝试获取响应内容
    try {
      const text = await response.text();
      console.log(`响应体大小: ${text.length} 字节`);
      
      if (text) {
        try {
          const data = JSON.parse(text);
          console.log("响应内容:");
          console.log(JSON.stringify(data, null, 2));
        } catch (jsonError) {
          console.log("响应不是JSON格式:", text);
        }
      } else {
        console.log("响应体为空");
      }
    } catch (bodyError) {
      console.error(`读取响应体失败: ${bodyError}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error(`请求失败: ${error}`);
    return false;
  }
}

/**
 * 创建特定的用于测试的系统路由
 */
async function createTestSystemEndpoint() {
  // 这个功能应当在本地临时添加一个测试路由，用于检查远程服务器
  console.log("\n要获取更详细的环境信息，请临时将以下代码添加到src/routes/system.ts文件中:");
  
  console.log(`
// 系统路由
import { Router } from "oak";
import { Context } from "oak";

const router = new Router();

// 系统状态路由
router.get("/api/system/status", (ctx: Context) => {
  ctx.response.body = {
    success: true,
    code: 200,
    message: "系统正常运行",
    timestamp: new Date().toISOString()
  };
});

// 环境变量检查路由 (仅在开发环境中使用)
router.get("/api/system/env", (ctx: Context) => {
  // 检查是否为生产环境
  const isProduction = Deno.env.get("NODE_ENV") === "production";
  
  // 安全返回环境变量信息，不泄露敏感数据
  const envInfo = {
    NODE_ENV: Deno.env.get("NODE_ENV") || "未设置",
    PORT: Deno.env.get("PORT") || "未设置",
    // 数据库信息 (仅显示是否配置，不显示完整值)
    MONGODB_URI: Deno.env.has("MONGODB_URI") ? "已配置" : "未配置",
    MONGODB_DATABASE: Deno.env.get("MONGODB_DATABASE") || Deno.env.get("MONGODB_NAME") || "未设置",
    // 连接测试信息
    database_type: isProduction ? "远程数据库" : "本地数据库",
    is_local_db: Deno.env.get("MONGODB_URI")?.includes("localhost") || Deno.env.get("MONGODB_URI")?.includes("127.0.0.1") || false,
    // 部署信息
    DENO_DEPLOYMENT_ID: Deno.env.get("DENO_DEPLOYMENT_ID") || "未设置",
    timestamp: new Date().toISOString()
  };
  
  ctx.response.body = {
    success: true,
    code: 200,
    data: envInfo
  };
});

export default router;
  `);
  
  console.log("\n然后将该路由添加到app.ts文件中");
  console.log(`
// 添加系统路由
import systemRouter from "./routes/system.ts";
app.use(systemRouter.routes());
app.use(systemRouter.allowedMethods());
  `);
}

/**
 * 主函数
 */
async function main() {
  console.log("========== 远程环境检查 ==========\n");
  
  // 尝试调用环境检查API
  const success = await checkRemoteEnv();
  
  if (!success) {
    console.log("\n远程服务器未提供环境信息API，需要添加相关路由");
    await createTestSystemEndpoint();
  }
  
  console.log("\n===================================");
}

// 运行主函数
await main(); 