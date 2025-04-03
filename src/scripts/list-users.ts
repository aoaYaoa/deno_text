// 列出所有用户脚本
import { MongoDBService } from "../services/mongodb.service.ts";

async function listAllUsers() {
  console.log("正在查询用户集合...");
  
  const mongoDBService = new MongoDBService();
  
  try {
    // 连接数据库
    await mongoDBService.connect();
    
    // 输出数据库配置信息
    console.log("数据库配置:");
    console.log(`  URI: ${Deno.env.get("MONGODB_URI") || "未设置"}`);
    console.log(`  数据库名: ${Deno.env.get("MONGODB_NAME") || "未设置"}`);
    
    // 获取所有用户 - 使用正确的集合名称 "user"
    const users = await mongoDBService.find("user", {});
    
    console.log("-------------------------------------------");
    console.log(`找到 ${users.length} 个用户:`);
    console.log("-------------------------------------------");
    
    // 格式化输出
    users.forEach((user: any, index) => {
      console.log(`用户 ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  用户ID: ${user.user_id || '未设置'}`);
      console.log(`  用户名: ${user.username || '未设置'}`);
      console.log(`  昵称: ${user.nickname || '未设置'}`);
      console.log(`  密码: ${user.password || '未设置'}`);
      console.log(`  状态: ${user.status || '未设置'}`);
      console.log("-------------------------------------------");
    });
    
  } catch (error) {
    console.error("查询用户失败:", error);
  } finally {
    // 关闭数据库连接
    await mongoDBService.close();
  }
}

// 执行脚本
listAllUsers().then(() => {
  console.log("脚本执行完成");
}); 