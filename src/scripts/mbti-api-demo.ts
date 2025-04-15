/**
 * MBTI API 客户端演示
 * 展示如何同时使用本地和远程API
 */

import { createRemoteMBTIClient, createLocalMBTIClient } from "./mbti-api-client.ts";
import { Logger } from "../utils/logger.ts";

const logger = new Logger({ prefix: "API-Demo" });

/**
 * 同时对比本地与远程API
 */
async function compareApis() {
  console.log("======== MBTI API 本地/远程对比 ========");
  
  // 创建本地和远程客户端
  const localClient = createLocalMBTIClient();
  const remoteClient = createRemoteMBTIClient();
  
  // 比较MBTI类型数据
  try {
    console.log("\n获取MBTI类型数据...");
    
    // 获取本地数据
    console.log("从本地API获取数据...");
    const localResult = await localClient.getAllTypes();
    
    // 获取远程数据
    console.log("从远程API获取数据...");
    const remoteResult = await remoteClient.getAllTypes();
    
    // 比较结果
    if (localResult.success && remoteResult.success) {
      const localCount = localResult.data?.length || 0;
      const remoteCount = remoteResult.data?.length || 0;
      
      console.log(`本地API: ${localCount} 个类型`);
      console.log(`远程API: ${remoteCount} 个类型`);
      
      if (localCount > 0 && remoteCount > 0) {
        console.log("\n本地API第一个类型:");
        console.log(`  ${localResult.data?.[0].type}: ${localResult.data?.[0].name}`);
        
        console.log("\n远程API第一个类型:");
        console.log(`  ${remoteResult.data?.[0].type}: ${remoteResult.data?.[0].name}`);
      }
    } else {
      if (!localResult.success) {
        console.error(`本地API错误: ${localResult.message || "未知错误"}`);
      }
      
      if (!remoteResult.success) {
        console.error(`远程API错误: ${remoteResult.message || "未知错误"}`);
      }
    }
  } catch (error) {
    console.error("比较API失败:", error);
  }
}

/**
 * 提交测试数据到远程API
 */
async function submitTestDemo() {
  console.log("\n======== MBTI 测试提交演示 ========");
  
  // 创建远程客户端
  const client = createRemoteMBTIClient();
  
  // 构建测试数据
  const testData = {
    user_id: `test_user_${Date.now()}`,
    nickname: "测试用户",
    responses: [
      { question_id: 1, selected_value: "E" },
      { question_id: 2, selected_value: "N" },
      { question_id: 3, selected_value: "T" },
      { question_id: 4, selected_value: "J" },
      { question_id: 5, selected_value: "E" },
      { question_id: 6, selected_value: "N" },
      { question_id: 7, selected_value: "T" },
      { question_id: 8, selected_value: "J" },
      { question_id: 9, selected_value: "E" },
      { question_id: 10, selected_value: "N" },
      { question_id: 11, selected_value: "T" },
      { question_id: 12, selected_value: "J" },
      { question_id: 13, selected_value: "E" },
      { question_id: 14, selected_value: "N" },
      { question_id: 15, selected_value: "T" },
      { question_id: 16, selected_value: "J" },
      { question_id: 17, selected_value: "A" },
      { question_id: 18, selected_value: "A" },
      { question_id: 19, selected_value: "A" },
      { question_id: 20, selected_value: "A" }
    ]
  };
  
  try {
    console.log("提交测试数据...");
    const result = await client.submitTest(testData);
    
    if (result.success) {
      console.log("测试提交成功!");
      console.log(`测试ID: ${result.data?.test_id}`);
      console.log(`测试结果: ${result.data?.result?.type}`);
      
      if (result.data?.result) {
        console.log("\n测试分数:");
        Object.entries(result.data.result.scores).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });
      }
    } else {
      console.error(`测试提交失败: ${result.message || "未知错误"}`);
    }
  } catch (error) {
    console.error("测试提交出错:", error);
  }
}

/**
 * 主函数
 */
async function main() {
  // 选择运行模式
  const args = Deno.args;
  const mode = args[0] || "compare";
  
  switch (mode) {
    case "compare":
      await compareApis();
      break;
    case "submit":
      await submitTestDemo();
      break;
    case "all":
      await compareApis();
      await submitTestDemo();
      break;
    default:
      console.log("未知模式。使用方法: deno run --allow-net mbti-api-demo.ts [compare|submit|all]");
      break;
  }
}

// 运行主函数
await main(); 