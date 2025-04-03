import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";

const logger = new Logger({ prefix: "Query-User-Data" });

// 用户数据结构
interface User {
  id?: string;
  user_id: string;
  username: string;
  password: string;
  nickname: string;
  sex: 1 | 2; // 1=男, 2=女
  desc?: string;
  status: number;
  create_time: Date | string;
  update_time: Date | string;
  [key: string]: unknown;
}

// 设置集合名称
const COLLECTION_NAME = "user";

async function queryUsers() {
  // 创建MongoDB服务实例
  const mongoService = new MongoDBService();
  
  try {
    // 连接到数据库
    logger.info("正在连接到MongoDB...");
    await mongoService.connect();
    logger.info("MongoDB连接成功!");
    
    // 打印当前连接的数据库名
    const dbName = Deno.env.get("MONGODB_NAME") || "";
    logger.info(`当前连接到的数据库: ${dbName}`);
    
    // 查询所有用户数据
    logger.info(`正在查询${COLLECTION_NAME}集合中的数据...`);
    const users = await mongoService.find(COLLECTION_NAME, {});
    
    // 显示查询结果
    logger.info(`查询结果: 共找到 ${users.length} 条记录`);
    
    if (users.length === 0) {
      logger.info("集合中没有数据");
    } else {
      // 显示所有用户的基本信息
      logger.info("用户列表:");
      users.forEach((user, index) => {
        const userData = user as unknown as User;
        console.log(`\n--- 用户 ${index + 1} ---`);
        console.log(`ID: ${userData.id || "N/A"}`);
        console.log(`用户ID: ${userData.user_id || "N/A"}`);
        console.log(`用户名: ${userData.username || "N/A"}`);
        console.log(`昵称: ${userData.nickname || "N/A"}`);
        console.log(`性别: ${userData.sex === 1 ? "男" : userData.sex === 2 ? "女" : "未知"}`);
        console.log(`状态: ${userData.status === 1 ? "活跃" : "禁用"}`);
        console.log(`描述: ${userData.desc || "无"}`);
        console.log(`创建时间: ${userData.create_time ? new Date(userData.create_time).toLocaleString() : "N/A"}`);
        console.log(`更新时间: ${userData.update_time ? new Date(userData.update_time).toLocaleString() : "N/A"}`);
      });
      
      // 如果需要查看完整的JSON数据，可以取消下面的注释
      // console.log("\n完整数据:");
      // console.log(JSON.stringify(users, null, 2));
    }
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`查询用户数据失败: ${error.message}`);
    } else {
      logger.error("查询用户数据失败");
    }
  } finally {
    // 关闭连接
    await mongoService.close();
    logger.info("MongoDB连接已关闭");
  }
}

// 运行函数
queryUsers(); 