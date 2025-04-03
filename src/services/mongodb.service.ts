// MongoDB数据库服务
// 提供MongoDB数据库连接和基本操作

import { Logger } from "../utils/logger.ts";
import mongoose from "mongoose";

// 日志实例
const logger = new Logger({ prefix: "MongoDB" });

// 连接配置接口
export interface MongoDBConfig {
  uri: string;
  dbName?: string;
  options?: mongoose.ConnectOptions;
}

/**
 * MongoDB数据库服务类
 * 提供MongoDB连接和基本CRUD操作
 */
export class MongoDBService {
  private connection: mongoose.Connection | null = null;
  private config: MongoDBConfig;
  
  /**
   * 构造函数
   * @param config MongoDB连接配置
   */
  constructor(config?: MongoDBConfig) {
    this.config = config || {
      uri: Deno.env.get("MONGODB_URI") || "mongodb://localhost:27017",
      dbName: Deno.env.get("MONGODB_NAME") || "denoapp",
      options: {} as mongoose.ConnectOptions
    };
    
    // 确保options对象已初始化
    if (!this.config.options) {
      this.config.options = {} as mongoose.ConnectOptions;
    }
    
    // 如果设置了MongoDB的最大连接池大小环境变量，则使用它
    const maxPoolSize = Deno.env.get("MONGODB_MAX_POOL_SIZE");
    if (maxPoolSize && !isNaN(Number(maxPoolSize))) {
      this.config.options.maxPoolSize = Number(maxPoolSize);
    }
  }
  
  /**
   * 连接到MongoDB
   */
  async connect(): Promise<void> {
    try {
      if (this.connection) {
        logger.info("已有MongoDB连接");
        return;
      }
      
      logger.info(`正在连接到MongoDB: ${this.config.uri}`);
      
      // 连接到MongoDB
      await mongoose.connect(this.config.uri, {
        dbName: this.config.dbName,
        ...this.config.options,
      } as mongoose.ConnectOptions);
      
      this.connection = mongoose.connection;
      
      // 设置连接事件
      // @ts-ignore: mongoose类型定义不完整
      this.connection.on("error", (err: Error) => {
        logger.error("MongoDB连接错误:", err);
      });
      
      // @ts-ignore: mongoose类型定义不完整
      this.connection.on("disconnected", () => {
        logger.warn("MongoDB连接断开");
      });
      
      logger.info("MongoDB连接成功");
    } catch (error) {
      logger.error("MongoDB连接失败:", error);
      throw error;
    }
  }
  
  /**
   * 关闭MongoDB连接
   */
  async close(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info("MongoDB连接已关闭");
      }
    } catch (error) {
      logger.error("关闭MongoDB连接失败:", error);
      throw error;
    }
  }
  
  /**
   * 获取集合
   * @param name 集合名称
   * @returns 集合对象
   */
  getCollection(name: string): mongoose.Collection {
    if (!this.connection) {
      throw new Error("MongoDB未连接");
    }
    return this.connection.collection(name);
  }
  
  /**
   * 获取模型
   * @param name 模型名称
   * @param schema 模型架构
   * @returns 模型对象
   */
  getModel<T>(name: string, schema: mongoose.Schema): mongoose.Model<T> {
    try {
      // 检查模型是否已存在
      return mongoose.model<T>(name);
    } catch {
      // 模型不存在，创建新模型
      return mongoose.model<T>(name, schema);
    }
  }
  
  /**
   * 查询文档
   * @param collection 集合名称
   * @param filter 查询条件
   * @param options 查询选项
   * @returns 查询结果
   */
  async find(
    collection: string,
    filter: Record<string, unknown> = {},
    options: { 
      limit?: number; 
      skip?: number; 
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<unknown[]> {
    try {
      const coll = this.getCollection(collection);
      
      const cursor = coll.find(filter, {
        limit: options.limit,
        skip: options.skip,
        sort: options.sort,
        projection: options.projection,
      });
      
      return await cursor.toArray();
    } catch (error) {
      logger.error(`查询集合 ${collection} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 分页查询
   * @param collection 集合名称
   * @param page 页码
   * @param limit 每页记录数
   * @param filter 查询条件
   * @param options 查询选项
   * @returns 分页结果
   */
  async paginate(
    collection: string,
    page = 1,
    limit = 10,
    filter: Record<string, unknown> = {},
    options: {
      sort?: Record<string, 1 | -1>;
      projection?: Record<string, 0 | 1>;
    } = {}
  ): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    try {
      const coll = this.getCollection(collection);
      const skip = (page - 1) * limit;
      
      // 获取总记录数
      const total = await coll.countDocuments(filter);
      
      // 获取当前页数据
      const cursor = coll.find(filter, {
        limit,
        skip,
        sort: options.sort,
        projection: options.projection,
      });
      
      const data = await cursor.toArray();
      
      // 计算总页数
      const pageCount = Math.ceil(total / limit);
      
      return {
        data,
        total,
        page,
        limit,
        pageCount,
      };
    } catch (error) {
      logger.error(`分页查询集合 ${collection} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 根据ID查找文档
   * @param collection 集合名称
   * @param id 文档ID
   * @returns 文档对象
   */
  async findById(collection: string, id: string): Promise<unknown | null> {
    try {
      const coll = this.getCollection(collection);
      return await coll.findOne({ _id: new mongoose.Types.ObjectId(id) });
    } catch (error) {
      logger.error(`查找文档 ${id} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 插入文档
   * @param collection 集合名称
   * @param document 文档对象
   * @returns 插入结果
   */
  async insertOne(collection: string, document: Record<string, unknown>): Promise<{ id: string }> {
    try {
      const coll = this.getCollection(collection);
      const result = await coll.insertOne(document);
      return { id: result.insertedId.toString() };
    } catch (error) {
      logger.error(`插入文档失败:`, error);
      throw error;
    }
  }
  
  /**
   * 批量插入文档
   * @param collection 集合名称
   * @param documents 文档对象数组
   * @returns 插入结果
   */
  async insertMany(collection: string, documents: Record<string, unknown>[]): Promise<{ count: number }> {
    try {
      const coll = this.getCollection(collection);
      const result = await coll.insertMany(documents);
      return { count: result.insertedCount };
    } catch (error) {
      logger.error(`批量插入文档失败:`, error);
      throw error;
    }
  }
  
  /**
   * 更新文档
   * @param collection 集合名称
   * @param filter 查询条件
   * @param update 更新内容
   * @returns 更新结果
   */
  async updateOne(
    collection: string,
    filter: Record<string, unknown>,
    update: Record<string, unknown>
  ): Promise<{ matched: number; modified: number }> {
    try {
      const coll = this.getCollection(collection);
      
      // 构建更新对象
      const updateObj = {};
      if (Object.keys(update).some(key => key.startsWith("$"))) {
        // 已经是更新操作符格式
        Object.assign(updateObj, update);
      } else {
        // 转换为$set格式
        Object.assign(updateObj, { $set: update });
      }
      
      const result = await coll.updateOne(filter, updateObj);
      
      return {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      };
    } catch (error) {
      logger.error(`更新文档失败:`, error);
      throw error;
    }
  }
  
  /**
   * 根据ID更新文档
   * @param collection 集合名称
   * @param id 文档ID
   * @param update 更新内容
   * @returns 更新结果
   */
  async updateById(
    collection: string,
    id: string,
    update: Record<string, unknown>
  ): Promise<{ matched: number; modified: number }> {
    try {
      const filter = { _id: new mongoose.Types.ObjectId(id) };
      return await this.updateOne(collection, filter, update);
    } catch (error) {
      logger.error(`更新文档 ${id} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 删除文档
   * @param collection 集合名称
   * @param filter 查询条件
   * @returns 删除结果
   */
  async deleteOne(
    collection: string,
    filter: Record<string, unknown>
  ): Promise<{ deleted: number }> {
    try {
      const coll = this.getCollection(collection);
      const result = await coll.deleteOne(filter);
      return { deleted: result.deletedCount || 0 };
    } catch (error) {
      logger.error(`删除文档失败:`, error);
      throw error;
    }
  }
  
  /**
   * 根据ID删除文档
   * @param collection 集合名称
   * @param id 文档ID
   * @returns 删除结果
   */
  async deleteById(collection: string, id: string): Promise<{ deleted: number }> {
    try {
      const filter = { _id: new mongoose.Types.ObjectId(id) };
      return await this.deleteOne(collection, filter);
    } catch (error) {
      logger.error(`删除文档 ${id} 失败:`, error);
      throw error;
    }
  }
  
  /**
   * 执行聚合管道
   * @param collection 集合名称
   * @param pipeline 聚合管道
   * @returns 聚合结果
   */
  async aggregate(collection: string, pipeline: unknown[]): Promise<unknown[]> {
    try {
      const coll = this.getCollection(collection);
      const cursor = coll.aggregate(pipeline as mongoose.PipelineStage[]);
      return await cursor.toArray();
    } catch (error) {
      logger.error(`执行聚合操作失败:`, error);
      throw error;
    }
  }
}

// 导出默认实例
export default new MongoDBService(); 