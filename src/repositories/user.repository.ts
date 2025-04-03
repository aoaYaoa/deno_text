// 用户仓库
// 处理用户相关的数据库操作

import { BaseRepository } from "./base.repository.ts";
import dbService from "../services/database.service.ts";
import { logger } from "../utils/logger.ts";

// 用户实体类型
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
  is_active?: boolean;
  last_login?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * 用户仓库类
 * 提供用户相关的数据库操作
 */
export class UserRepository extends BaseRepository<User> {
  /**
   * 构造函数
   */
  constructor() {
    super("users", "id");
  }

  /**
   * 根据电子邮件查找用户
   * @param email 电子邮件
   * @returns 用户对象或null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.findBy({ email });
      return users.length > 0 ? users[0] : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`根据电子邮件查找用户失败: ${email}`, errorMessage);
      throw error;
    }
  }

  /**
   * 创建新用户
   * @param user 用户数据
   * @returns 新创建的用户ID
   */
  async createUser(user: Omit<User, "id">): Promise<number> {
    try {
      // 检查邮箱是否已存在
      const existingUser = await this.findByEmail(user.email);
      if (existingUser) {
        throw new Error(`邮箱 ${user.email} 已被使用`);
      }

      return await this.create(user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`创建用户失败`, errorMessage);
      throw error;
    }
  }

  /**
   * 更新用户登录时间
   * @param userId 用户ID
   * @returns 是否更新成功
   */
  async updateLastLogin(userId: number): Promise<boolean> {
    try {
      const result = await this.update(userId, {
        last_login: new Date(),
      });
      return result > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`更新用户登录时间失败: ${userId}`, errorMessage);
      return false;
    }
  }

  /**
   * 激活或停用用户
   * @param userId 用户ID
   * @param isActive 是否激活
   * @returns 是否更新成功
   */
  async setActive(userId: number, isActive: boolean): Promise<boolean> {
    try {
      const result = await this.update(userId, { is_active: isActive });
      return result > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`修改用户状态失败: ${userId}`, errorMessage);
      return false;
    }
  }

  /**
   * 修改用户角色
   * @param userId 用户ID
   * @param role 新角色
   * @returns 是否更新成功
   */
  async changeRole(userId: number, role: string): Promise<boolean> {
    try {
      const result = await this.update(userId, { role });
      return result > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`修改用户角色失败: ${userId}`, errorMessage);
      return false;
    }
  }

  /**
   * 搜索用户
   * @param query 搜索关键词
   * @param page 页码
   * @param limit 每页记录数
   * @returns 分页结果
   */
  async searchUsers(query: string, page = 1, limit = 10): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  }> {
    try {
      return await this.paginate(page, limit, {}, {
        search: { fields: ["name", "email"], query },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`搜索用户失败: ${query}`, errorMessage);
      throw error;
    }
  }

  /**
   * 统计用户总数
   * @returns 用户总数
   */
  async countUsers(): Promise<number> {
    try {
      const result = await dbService.raw<{ total: number }>(
        "SELECT COUNT(*) as total FROM users"
      );
      return Number(result.rows[0]?.total) || 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("统计用户总数失败", errorMessage);
      return 0;
    }
  }

  /**
   * 统计各角色用户数量
   * @returns 各角色用户数量
   */
  async countByRole(): Promise<Array<{ role: string; count: number }>> {
    try {
      const result = await dbService.raw<{ role: string; count: number }>(
        "SELECT role, COUNT(*) as count FROM users GROUP BY role"
      );
      return result.rows;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("统计各角色用户数量失败", errorMessage);
      return [];
    }
  }
} 