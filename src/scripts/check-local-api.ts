/**
 * 本地API服务检查工具
 * 验证本地API服务是否正在运行，以便与远程API比较
 */

const PORT = Deno.env.get("PORT") || 8000;
const LOCAL_API_URL = `http://localhost:${PORT}/api`;

/**
 * 测试本地API连接
 */
async function checkLocalApi() {
  console.log(`检查本地API服务: ${LOCAL_API_URL}`);
  
  try {
    // 简单测试连接
    const response = await fetch(LOCAL_API_URL, {
      method: "GET",
      headers: { "Accept": "application/json" },
      // 设置较短的超时时间
      signal: AbortSignal.timeout(3000) // 3秒超时
    });
    
    if (response.ok) {
      console.log("✓ 本地API服务正在运行");
      return true;
    } else {
      console.error(`✗ 本地API服务返回错误: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ 无法连接到本地API服务: ${error}`);
    
    if (String(error).includes("Failed to fetch") || 
        String(error).includes("ECONNREFUSED") ||
        String(error).includes("timeout")) {
      console.log("\n本地服务可能未启动，请运行以下命令启动服务:");
      console.log("\n  deno task dev");
      console.log("\n然后再次尝试API测试。");
    }
    
    return false;
  }
}

/**
 * 检查MBTI服务是否可用
 */
async function checkMbtiService() {
  console.log("\n检查MBTI服务...");
  
  try {
    const response = await fetch(`${LOCAL_API_URL}/mbti/types`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(3000) // 3秒超时
    });
    
    if (response.ok) {
      const data = await response.json();
      const count = data.data?.length || 0;
      
      console.log(`✓ MBTI服务正常，返回了 ${count} 个类型`);
      return true;
    } else {
      console.error(`✗ MBTI服务返回错误: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ 检查MBTI服务失败: ${error}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("========== 本地API服务检查 ==========\n");
  
  // 检查本地API服务
  const apiRunning = await checkLocalApi();
  
  // 如果API服务运行，检查MBTI服务
  let mbtiRunning = false;
  if (apiRunning) {
    mbtiRunning = await checkMbtiService();
  }
  
  // 输出总结
  console.log("\n===================================");
  if (apiRunning && mbtiRunning) {
    console.log("✓ 本地服务运行正常，可以进行API测试");
  } else {
    console.log("✗ 本地服务存在问题，API测试可能会失败");
  }
}

// 运行主函数
await main(); 