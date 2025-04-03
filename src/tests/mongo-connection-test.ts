// MongoDB 连接测试脚本
// 用于测试 MongoDB 连接配置是否正确

import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";

// 创建日志实例
const logger = new Logger({ prefix: "MongoDB-Test" });

console.log("=== MongoDB Connection Test ===");

// 打印当前环境变量
console.log("当前环境：", Deno.env.get("DENO_ENV") || "default");
console.log("MongoDB URI：", Deno.env.get("MONGODB_URI") || "未配置");
console.log("MongoDB 数据库名：", Deno.env.get("MONGODB_NAME") || "未配置");

// 创建MongoDBService实例
const mongoService = new MongoDBService();

try {
  console.log("尝试连接到MongoDB...");
  await mongoService.connect();
  console.log("✅ MongoDB连接成功!");
  
  // 获取连接对象和尝试列出集合
  const connection = mongoService["connection"];
  if (connection && connection.db) {
    // 尝试列出所有集合
    console.log("正在获取数据库中的集合...");
    const collections = await connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log("数据库中没有集合");
    } else {
      console.log(`找到${collections.length}个集合：`);
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // 尝试在指定集合中查询数据
    const testCollection = Deno.args[0] || "movies"; // 可以通过命令行参数指定集合
    console.log(`尝试在${testCollection}集合中查询数据...`);
    
    try {
      const result = await mongoService.find(testCollection, {}, { limit: 5 });
      console.log(`查询结果：找到${result.length}条数据`);
      if (result.length > 0) {
        console.log("第一条数据示例：");
        console.log(JSON.stringify(result[0], null, 2));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(`查询${testCollection}集合时出错：${error.message}`);
      } else {
        console.log(`查询${testCollection}集合时出错`);
      }
      console.log(`请确认${testCollection}集合存在并包含数据`);
    }
  } else {
    console.log("无法获取数据库连接对象或数据库实例");
  }
  
} catch (error) {
  if (error instanceof Error) {
    console.error("❌ MongoDB连接失败:", error.message);
  } else {
    console.error("❌ MongoDB连接失败");
  }
  
  console.log("\n可能的解决方案：");
  console.log("1. 确认MongoDB服务器是否正在运行");
  console.log("2. 验证连接URI是否正确，特别是主机名、端口、用户名和密码");
  console.log("3. 检查网络设置，确保可以访问MongoDB服务器");
  console.log("4. 如果使用Atlas，确认IP地址已添加到访问白名单");
  console.log("5. 确认数据库用户有适当的权限");
  
  const uri = Deno.env.get("MONGODB_URI");
  if (uri) {
    if (!uri.includes("@") && !uri.includes("localhost")) {
      console.log("\n注意：您的连接字符串似乎没有包含认证信息。Atlas连接需要用户名和密码。");
      console.log("格式应该是: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>");
    }
    
    if (uri.includes("mongodb+srv") && !uri.includes("?retryWrites=true&w=majority")) {
      console.log("\n提示：Atlas连接字符串通常包含额外参数，尝试添加: ?retryWrites=true&w=majority");
    }
  }
} finally {
  // 关闭连接
  await mongoService.close();
  console.log("MongoDB连接已关闭");
} 