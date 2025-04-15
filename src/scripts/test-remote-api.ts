// 远程API测试脚本
// 用于测试远程部署的MBTI API接口

import { Logger } from "../utils/logger.ts";

const logger = new Logger({ prefix: "API-Test" });

// 远程API基础URL
const remoteApiUrl = "https://elpis-deno-elpis-tsezb5b24tqt.deno.dev/api";

/**
 * 发送GET请求到远程API
 */
async function fetchFromRemoteApi(endpoint: string) {
  try {
    logger.info(`正在请求远程API: ${remoteApiUrl}${endpoint}`);
    const response = await fetch(`${remoteApiUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`请求远程API失败: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 测试MBTI类型API
 */
async function testMbtiTypesApi() {
    console.log("-----",JSON.stringify(Deno.env.get("MONGODB_URI")));
    console.log("-----",JSON.stringify(Deno.env.get("MONGODB_DATABASE")));
  try {
    logger.info("测试 MBTI 类型API...");
    const result = await fetchFromRemoteApi("/mbti/types");
    logger.info(`成功获取 ${result.data.length} 个MBTI类型`);
    
    if (result.data.length > 0) {
      logger.info(`第一个类型: ${result.data[0].type} - ${result.data[0].name}`);
    } else {
      logger.info(`返回的数据为空数组，API工作正常但数据库中没有MBTI类型数据`);
    }
    
    return result;
  } catch (error) {
    logger.error("测试MBTI类型API失败:", error);
    throw error;
  }
}

/**
 * 测试MBTI问题API
 */
async function testMbtiQuestionsApi() {
  try {
    logger.info("测试 MBTI 问题API...");
    const result = await fetchFromRemoteApi("/mbti/questions");
    logger.info(`成功获取 ${result.data.length} 个MBTI问题`);
    
    if (result.data.length > 0) {
      logger.info(`第一个问题: ${result.data[0].question}`);
    } else {
      logger.info(`返回的数据为空数组，API工作正常但数据库中没有MBTI问题数据`);
    }
    
    return result;
  } catch (error) {
    logger.error("测试MBTI问题API失败:", error);
    throw error;
  }
}

/**
 * 测试MBTI角色API
 */
async function testMbtiRolesApi() {
  try {
    logger.info("测试 MBTI 角色API...");
    const result = await fetchFromRemoteApi("/mbti/roles");
    logger.info(`成功获取 ${result.data.length} 个MBTI角色`);
    
    if (result.data.length > 0) {
      logger.info(`第一个角色: ${result.data[0].role}`);
    } else {
      logger.info(`返回的数据为空数组，API工作正常但数据库中没有MBTI角色数据`);
    }
    
    return result;
  } catch (error) {
    logger.error("测试MBTI角色API失败:", error);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("======== 远程MBTI API测试 ========");
  console.log(`远程API: ${remoteApiUrl}`);
  console.log("====================================");

  try {
    // 测试MBTI类型API
    const types = await testMbtiTypesApi();
    console.log(`\n获取到 ${types.data.length} 个MBTI类型`);
    
    // 测试MBTI问题API
    const questions = await testMbtiQuestionsApi();
    console.log(`\n获取到 ${questions.data.length} 个MBTI问题`);
    
    // 测试MBTI角色API
    const roles = await testMbtiRolesApi();
    console.log(`\n获取到 ${roles.data.length} 个MBTI角色`);
    
    console.log("\n✅ 所有API测试通过!");
  } catch (error) {
    console.error("\n❌ API测试失败:", error);
  }
}

// 运行主函数
await main(); 