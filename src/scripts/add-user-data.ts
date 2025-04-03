import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";

const logger = new Logger({ prefix: "Add-User-Data" });

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
  create_time: Date;
  update_time: Date;
  [key: string]: unknown; // 添加索引签名以满足Record<string, unknown>
}

// 设置正确的集合名称
const COLLECTION_NAME = "user";
// 确保环境变量 MONGODB_NAME 设置为 elpis-beta

async function addUsers() {
  // 创建MongoDB服务实例
  const mongoService = new MongoDBService();
  
  try {
    // 连接到数据库
    logger.info("正在连接到MongoDB...");
    await mongoService.connect();
    logger.info("MongoDB连接成功!");
    
    // 打印当前连接的数据库名，确认是否为elpis-beta
    const dbName = Deno.env.get("MONGODB_NAME") || "";
    logger.info(`当前连接到的数据库: ${dbName}`);
    
    // 示例用户数据
    const sampleUsers: User[] = [
      {
        user_id: "user_001",
        username: "admin",
        password: "123456", // 实际应用中应该加密存储
        nickname: "测试用户1",
        sex: 1,
        desc: "这是一个测试账号",
        status: 1, // 1=活跃, 0=禁用
        create_time: new Date(),
        update_time: new Date()
      },
      {
        user_id: "user_002",
        username: "test",
        password: "123456",
        nickname: "测试用户2",
        sex: 2,
        desc: "另一个测试账号",
        status: 1,
        create_time: new Date(),
        update_time: new Date()
      }
    ];
    
    // 向集合添加用户
    logger.info(`正在添加用户数据到${dbName}数据库的${COLLECTION_NAME}集合...`);
    
    // 单个添加用户
    for (const user of sampleUsers) {
      const result = await mongoService.insertOne(COLLECTION_NAME, user);
      logger.info(`用户添加成功: ${user.username}, ID: ${result.id}`);
    }
    
    // 也可以批量添加
    // const result = await mongoService.insertMany(COLLECTION_NAME, sampleUsers);
    // logger.info(`批量添加用户成功, 添加了 ${result.insertedCount} 条记录`);
    
    // 查询确认添加成功
    const users = await mongoService.find(COLLECTION_NAME, {});
    logger.info(`当前${COLLECTION_NAME}集合中有 ${users.length} 条数据`);
    
    if (users.length > 0) {
      logger.info("用户数据示例:");
      console.log(JSON.stringify(users[0], null, 2));
    }
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`添加用户数据失败: ${error.message}`);
    } else {
      logger.error("添加用户数据失败");
    }
  } finally {
    // 关闭连接
    await mongoService.close();
    logger.info("MongoDB连接已关闭");
  }
}

// 运行函数
addUsers(); 