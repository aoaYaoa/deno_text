/**
 * MongoDB连接测试工具
 * 用于验证MongoDB连接配置是否正确
 */

import mongoose from "mongoose";
import { Logger } from "../utils/logger.ts";

const logger = new Logger({ prefix: "MongoDB-Test" });

/**
 * 测试MongoDB连接
 * @param customUri 可选的自定义MongoDB URI（覆盖环境变量）
 */
async function testMongoDBConnection(customUri?: string) {
  // 从环境变量获取连接信息或使用自定义URI
  const uri = customUri || Deno.env.get("MONGODB_URI");
  const dbName = Deno.env.get("MONGODB_DATABASE") || Deno.env.get("MONGODB_NAME") || "elpis-beta";
  
  if (!uri) {
    logger.error("未设置MONGODB_URI环境变量，且未提供自定义URI");
    return false;
  }
  
  logger.info(`MongoDB连接信息:`);
  logger.info(`URI: ${uri.substring(0, 20)}...`);
  logger.info(`数据库名: ${dbName}`);
  
  try {
    logger.info("尝试连接到MongoDB...");
    
    // 连接选项
    const options = {
      dbName,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    };
    
    // 尝试连接
    await mongoose.connect(uri, options);
    logger.info("✓ MongoDB连接成功");
    
    // 尝试列出所有集合
    const db = mongoose.connection.db;
    if (!db) {
      logger.error("无法获取数据库实例");
      return false;
    }
    
    const collections = await db.listCollections().toArray();
    logger.info(`找到 ${collections.length} 个集合:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      logger.info(`  - ${collection.name}: ${count} 条文档`);
    }
    
    // 特别检查MBTI相关集合
    const mbtiCollections = ["mbti_questions", "mbti_types", "mbti_roles", "mbti_test_results"];
    logger.info("\nMBTI集合状态:");
    
    for (const name of mbtiCollections) {
      const exists = collections.some((c: {name: string}) => c.name === name);
      
      if (exists) {
        const count = await db.collection(name).countDocuments();
        logger.info(`  ✓ ${name}: ${count} 条文档`);
      } else {
        logger.warn(`  ✗ ${name}: 集合不存在`);
      }
    }
    
    return true;
  } catch (error) {
    logger.error(`MongoDB连接失败:`, error);
    return false;
  } finally {
    // 关闭连接
    try {
      await mongoose.disconnect();
      logger.info("MongoDB连接已关闭");
    } catch (e) {
      // 忽略关闭错误
    }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("========== MongoDB连接测试 ==========\n");
  
  // 检查是否有命令行参数
  const args = Deno.args;
  let customUri: string | undefined;
  
  if (args.length > 0) {
    // 使用第一个参数作为MongoDB URI
    customUri = args[0];
    console.log(`使用命令行提供的MongoDB URI: ${customUri.substring(0, 20)}...`);
  }
  
  const success = await testMongoDBConnection(customUri);
  
  console.log("\n=====================================");
  console.log(`MongoDB连接测试${success ? '通过' : '失败'}`);
}

// 运行主函数
await main(); 