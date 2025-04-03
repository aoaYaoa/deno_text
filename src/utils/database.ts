// 数据库桥接文件
// 为了兼容旧代码，导出MongoDB服务作为默认数据库服务

import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "./logger.ts";

const logger = new Logger({ prefix: "数据库" });
const mongoDbService = new MongoDBService();

// 存储数据库连接实例
let dbInstance: MongoDBService | null = null;

/**
 * 获取数据库客户端实例
 * 如果尚未连接，会自动建立连接
 * @returns MongoDB服务实例
 */
export async function getDbClient(): Promise<MongoDBService> {
  if (!dbInstance) {
    logger.info("初始化数据库连接...");
    await mongoDbService.connect();
    dbInstance = mongoDbService;
    logger.info("数据库连接已建立");
  }
  return dbInstance;
}

/**
 * 关闭数据库连接
 */
export async function closeDbConnection(): Promise<void> {
  if (dbInstance) {
    logger.info("关闭数据库连接...");
    await dbInstance.close();
    dbInstance = null;
    logger.info("数据库连接已关闭");
  }
}

// 导出MongoDB服务供应用程序使用
export default mongoDbService;

// 如果需要保留旧接口的兼容层，可以在这里实现适配器

// 例如：导出一个兼容旧接口的查询方法
export async function query(sql: string, params?: unknown[]): Promise<unknown[]> {
  logger.warn("使用了已废弃的SQL接口，请直接使用MongoDB服务。");
  
  // 这里可以实现一个简单的SQL到MongoDB查询转换
  // 但在实际应用中，最好直接修改调用代码使用MongoDB接口
  
  return [];
}

// 导出其他兼容方法 - 为了与旧代码保持兼容
export const connect = async (): Promise<void> => {
  await getDbClient();
};

export const close = async (): Promise<void> => {
  await closeDbConnection();
}; 