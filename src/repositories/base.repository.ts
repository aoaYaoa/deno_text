// 基础仓库类
// 提供数据库操作的通用抽象层

import dbService from "../services/database.service.ts";
import { logger } from "../utils/logger.ts";

/**
 * 通用仓库基类
 * 为特定实体提供CRUD和查询操作
 */
export class BaseRepository<T extends Record<string, unknown>> {
  protected tableName: string;
  protected primaryKey: string;
  
  /**
   * 构造函数
   * @param tableName 表名
   * @param primaryKey 主键名，默认为"id"
   */
  constructor(tableName: string, primaryKey = "id") {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * 根据ID查找实体
   * @param id 实体ID
   * @returns 实体对象或null
   */
  async findById(id: number | string): Promise<T | null> {
    try {
      return await dbService.findById<T>(this.tableName, id, this.primaryKey);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`查询 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 创建实体
   * @param data 实体数据
   * @returns 新创建的实体ID
   */
  async create(data: Omit<T, 'id'>): Promise<number> {
    try {
      // 添加创建和更新时间
      const now = new Date();
      const dataWithTimestamps = {
        ...data,
        created_at: data.created_at || now,
        updated_at: data.updated_at || now,
      };
      
      return await dbService.insert(this.tableName, dataWithTimestamps);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`创建 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 更新实体
   * @param id 实体ID
   * @param data 实体数据
   * @returns 更新的记录数
   */
  async update(id: number | string, data: Partial<T>): Promise<number> {
    try {
      // 添加更新时间
      const dataWithTimestamp = {
        ...data,
        updated_at: new Date(),
      };
      
      return await dbService.update(
        this.tableName, 
        dataWithTimestamp, 
        { [this.primaryKey]: id }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`更新 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 删除实体
   * @param id 实体ID
   * @returns 删除的记录数
   */
  async delete(id: number | string): Promise<number> {
    try {
      return await dbService.delete(this.tableName, { [this.primaryKey]: id });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`删除 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 查找所有实体
   * @returns 实体数组
   */
  async findAll(): Promise<T[]> {
    try {
      return await dbService.find<T>(this.tableName);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`查询所有 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 根据条件查找实体
   * @param conditions 查询条件
   * @returns 实体数组
   */
  async findBy(conditions: Partial<T>): Promise<T[]> {
    try {
      return await dbService.find<T>(this.tableName, conditions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`条件查询 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 分页查询
   * @param page 页码
   * @param limit 每页记录数
   * @param conditions 查询条件
   * @param options 查询选项
   * @returns 分页结果
   */
  async paginate(
    page = 1,
    limit = 10,
    conditions: Partial<T> = {},
    options: {
      fields?: string[];
      orderBy?: string;
      orderDir?: "ASC" | "DESC";
      search?: { fields: string[]; query: string };
    } = {}
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    try {
      return await dbService.paginate<T>(
        this.tableName,
        page,
        limit,
        conditions,
        options
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`分页查询 ${this.tableName} 失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 执行原始SQL
   * @param sql SQL语句
   * @param params 参数
   * @returns 查询结果
   */
  async raw<R = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<R[]> {
    try {
      const result = await dbService.raw<R>(sql, params);
      return result.rows;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`执行原始SQL失败: ${sql}`, errorMessage);
      throw error;
    }
  }
} 