/**
 * 带授权的API测试脚本
 * 测试远程API是否因授权问题返回空结果
 */

// 远程API基础URL
const remoteApiUrl = "https://elpis-deno-elpis-tsezb5b24tqt.deno.dev/api";

// 示例授权令牌 (需要替换为有效的)
const TOKEN = "test_token";

/**
 * 登录并获取token
 */
async function login(username: string, password: string): Promise<string | null> {
  try {
    console.log(`尝试登录用户: ${username}`);
    
    const response = await fetch(`${remoteApiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      console.error(`登录失败: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`响应内容: ${text}`);
      return null;
    }
    
    const data = await response.json();
    if (data.success && data.data?.token) {
      console.log("登录成功，获取到token");
      return data.data.token;
    } else {
      console.error("登录响应中没有找到token");
      console.error(JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error(`登录请求失败: ${error}`);
    return null;
  }
}

/**
 * 用授权头测试API
 */
async function testApiWithAuth(endpoint: string, token: string) {
  try {
    console.log(`\n测试端点 ${endpoint} (带授权)`);
    const url = `${remoteApiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    console.log(`状态码: ${response.status} ${response.statusText}`);
    
    const content = await response.text();
    console.log(`响应大小: ${content.length} 字节`);
    
    try {
      const data = JSON.parse(content);
      console.log("响应内容:");
      console.log(JSON.stringify(data, null, 2));
      
      if (data.data && Array.isArray(data.data)) {
        console.log(`数据项数量: ${data.data.length}`);
      }
      
      return data;
    } catch (e) {
      console.log("响应不是有效的JSON:");
      console.log(content);
      return null;
    }
  } catch (error) {
    console.error(`请求失败: ${error}`);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log("========== 带授权的API测试 ==========\n");
  
  // 1. 尝试登录获取token
  // const token = await login("admin", "password"); // 替换为实际的用户名密码
  // if (!token) {
  //   console.error("无法获取授权令牌，测试终止");
  //   return;
  // }
  
  // 使用示例token (如果登录功能不可用)
  const token = TOKEN;
  
  // 2. 测试MBTI接口
  await testApiWithAuth("/mbti/types", token);
  await testApiWithAuth("/mbti/questions", token);
  await testApiWithAuth("/mbti/roles", token);
  
  console.log("\n测试完成");
}

// 执行主函数
if (import.meta.main) {
  main().catch(console.error);
} 