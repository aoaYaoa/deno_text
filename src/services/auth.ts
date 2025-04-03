import { MongoDBService } from "./mongodb.service.ts";
export class AuthService {
  /**
   * 根据用户名和密码查询用户
   * @param param0 包含username和password的对象
   * @returns 找到的用户信息
   */
  async findUserByCredentials({username, password}: {username: string, password: string}) {
    const mongoDBService = new MongoDBService();
    
    try {
      // 连接数据库
      await mongoDBService.connect();
      
      // 简单直接的查询
      const users = await mongoDBService.find("user", { username, password });
      
      return users[0] || null;
    } catch (error) {
      console.error("查询用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await mongoDBService.close();
    }
  }
  
  /**
   * 获取所有用户信息（仅用于调试）
   * @returns 所有用户记录
   */
  async findAllUsers() {
    const mongoDBService = new MongoDBService();
    
    try {
      // 连接数据库
      await mongoDBService.connect();
      console.log("[AuthService] 正在获取所有用户数据");
      
      // 获取所有用户
      const users = await mongoDBService.find("users", {});
      console.log(`[AuthService] 找到 ${users.length} 个用户`);
      
      return users;
    } catch (error) {
      console.error("[AuthService] 获取所有用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await mongoDBService.close();
    }
  }
  
  /**
   * 根据ID查询用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findUserById(id: string) {
    const mongoDBService = new MongoDBService();
    
    try {
      // 连接数据库
      await mongoDBService.connect();
      
      // 查询用户
      return await mongoDBService.findById("users", id);
    } catch (error) {
      console.error("根据ID查询用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await mongoDBService.close();
    }
  }
}   