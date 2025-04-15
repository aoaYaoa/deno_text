/**
 * API 诊断工具
 * 用于调试和诊断API连接问题
 */

// 远程API基础URL
const remoteApiUrl = "https://elpis-deno-elpis-tsezb5b24tqt.deno.dev/api";

/**
 * 发送低级别GET请求
 */
async function testEndpoint(endpoint: string) {
  console.log(`\n测试端点: ${endpoint}`);
  console.log(`完整URL: ${remoteApiUrl}${endpoint}`);
  
  try {
    // 直接使用基础fetch API
    console.log("发送请求...");
    const response = await fetch(`${remoteApiUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    // 输出完整响应信息
    console.log(`状态码: ${response.status} (${response.statusText})`);
    console.log("响应头:");
    
    // 输出所有响应头
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    try {
      // 尝试获取响应内容
      const text = await response.text();
      console.log(`响应体大小: ${text.length} 字节`);
      
      // 尝试解析为JSON
      try {
        if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
          const json = JSON.parse(text);
          console.log("JSON解析成功:");
          console.log(JSON.stringify(json, null, 2).substring(0, 500));
          
          if (json.data && Array.isArray(json.data)) {
            console.log(`数据项数量: ${json.data.length}`);
          }
        } else {
          console.log("响应不是JSON格式:");
          console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
        }
      } catch (jsonError) {
        console.log("无法解析为JSON:");
        console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
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
 * 测试特定MBTI类型端点
 */
async function testMbtiTypeEndpoint(type: string) {
  return testEndpoint(`/mbti/types/${type}`);
}

/**
 * 主函数
 */
async function main() {
  console.log("============= API诊断工具 =============");
  console.log(`远程API: ${remoteApiUrl}`);
  console.log("=======================================");
  
  // 测试服务器根路径
  await testEndpoint("/");
  
  // 测试各个MBTI端点
  console.log("\n---------- 测试MBTI端点 ----------");
  
  // 1. 测试types端点
  const typesOk = await testEndpoint("/mbti/types");
  
  // 2. 测试questions端点
  await testEndpoint("/mbti/questions");
  
  // 3. 测试roles端点
  await testEndpoint("/mbti/roles");
  
  // 4. 测试特定类型端点
  if (typesOk) {
    await testMbtiTypeEndpoint("INTJ-A");
  }
  
  console.log("\n=======================================");
  console.log("诊断完成");
}

// 运行主函数
await main(); 