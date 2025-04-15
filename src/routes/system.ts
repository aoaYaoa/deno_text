// 系统路由
import { Router } from "oak";
import { Context } from "oak";
import mongoDBService from "../services/mongodb.service.ts";

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

// 数据库诊断端点
router.get("/api/system/db-info", async (ctx: Context) => {
  try {
    // 连接到MongoDB
    await mongoDBService.connect();
    
    // 获取MongoDB连接信息
    const dbInfo = {
      // 数据库配置信息
      uri: Deno.env.get("MONGODB_URI")?.substring(0, 20) + "..." || "未设置",
      database: Deno.env.get("MONGODB_DATABASE") || Deno.env.get("MONGODB_NAME") || "未设置",
      
      // 环境信息
      node_env: Deno.env.get("NODE_ENV") || "未设置",
      deno_env: Deno.env.get("DENO_ENV") || "未设置",
      
      // 检查集合
      collections: [],
      timestamp: new Date().toISOString()
    };
    
    // 检查MBTI集合是否存在
    try {
      const mbtiCollections = ["mbti_questions", "mbti_types", "mbti_roles", "mbti_test_results"];
      const collectionInfo = [];
      
      for (const name of mbtiCollections) {
        try {
          const collection = mongoDBService.getCollection(name);
          const count = await collection.countDocuments({});
          collectionInfo.push({
            name,
            exists: true,
            count
          });
        } catch (e) {
          collectionInfo.push({
            name,
            exists: false,
            error: String(e).substring(0, 100)
          });
        }
      }
      
      // @ts-ignore
      dbInfo.collections = collectionInfo;
    } catch (collError) {
      // @ts-ignore
      dbInfo.collection_error = String(collError);
    }
    
    ctx.response.body = {
      success: true,
      code: 200,
      data: dbInfo
    };
  } catch (error) {
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取数据库信息失败",
      error: String(error)
    };
  } finally {
    // 关闭连接
    try {
      await mongoDBService.close();
    } catch (e) {
      // 忽略关闭错误
    }
  }
});

// 环境变量检查路由 (安全版本)
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