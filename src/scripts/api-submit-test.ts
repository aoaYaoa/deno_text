/**
 * API 提交测试工具
 * 专门测试POST提交功能，使用低级别实现来诊断问题
 */

// 远程API基础URL
const remoteApiUrl = "https://elpis-deno-elpis.deno.dev/api";

/**
 * 发送POST请求测试提交功能
 */
async function testSubmitEndpoint() {
  const endpoint = "/mbti/test";
  const url = `${remoteApiUrl}${endpoint}`;
  
  console.log(`\n测试提交端点: ${endpoint}`);
  console.log(`完整URL: ${url}`);
  
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
      { question_id: 16, selected_value: "J" }
    ]
  };
  
  console.log("请求数据:");
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    // 使用直接的fetch API
    console.log("\n发送请求...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testData)
    });
    
    // 输出响应状态
    console.log(`\n状态码: ${response.status} (${response.statusText})`);
    console.log("响应头:");
    
    // 输出响应头
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // 获取响应体
    try {
      const text = await response.text();
      console.log(`\n响应体大小: ${text.length} 字节`);
      
      if (text) {
        // 尝试解析为JSON
        try {
          const json = JSON.parse(text);
          console.log("响应JSON:");
          console.log(JSON.stringify(json, null, 2));
        } catch (jsonError) {
          console.log("响应不是JSON格式:");
          console.log(text);
        }
      } else {
        console.log("响应体为空");
      }
    } catch (bodyError) {
      console.error(`读取响应体失败: ${bodyError}`);
    }
    
    return response.ok;
  } catch (error) {
    console.error(`\n请求失败: ${error}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("============= API提交测试工具 =============");
  console.log(`远程API: ${remoteApiUrl}`);
  console.log("==========================================");
  
  // 测试提交功能
  const success = await testSubmitEndpoint();
  
  console.log("\n==========================================");
  console.log(`测试${success ? '通过' : '失败'}`);
}

// 运行主函数
await main(); 