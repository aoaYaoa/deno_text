import { BaseService } from "./base.ts";
export class AuthService extends BaseService {
  /**
   * 根据用户名和密码查询用户
   * @param param0 包含username和password的对象
   * @returns 找到的用户信息
   * 
   */
  
  async findUserByCredentials({username, password}: {username: string, password: string}) {
   
    
    try {
      // 连接数据库
      await this.mongoDBService.connect();
      
      // 简单直接的查询
      const users = await this.mongoDBService.find("user", { username, password });
      
      return users[0] || null;
    } catch (error) {
      console.error("查询用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await this.mongoDBService.close();
    }
  }
  
  /**
   * 获取所有用户信息（仅用于调试）
   * @returns 所有用户记录
   */
  async findAllUsers() {

    try {
      // 连接数据库
      await this.mongoDBService.connect();
      console.log("[AuthService] 正在获取所有用户数据");
      
      // 获取所有用户
      const users = await this.mongoDBService.find("user", {});
      console.log(`[AuthService] 找到 ${users.length} 个用户`);
      
      return users;
    } catch (error) {
      console.error("[AuthService] 获取所有用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await this.mongoDBService.close();
    }
  }
  
  /**
   * 根据ID查询用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findUserById(id: string) {

    try {
      // 连接数据库
      await this.mongoDBService.connect();
      
      // 查询用户
      return await this.mongoDBService.findById("user", id);
    } catch (error) {
      console.error("根据ID查询用户失败:", error);
      throw error;
    } finally {
      // 关闭数据库连接
      await this.mongoDBService.close();
    }
  }

  /**
   * 根据用户名查询用户
   * @param username 用户名
   * @returns 用户信息  
   */
  async findUserByUsername(username: string) {
    
    try {
      // 连接数据库 
      await this.mongoDBService.connect();
      console.log(`[AuthService] 正在查询用户名: ${username}`);
      
      // 查询用户
      const users = await this.mongoDBService.find("user", { username });
      console.log(`[AuthService] 查询结果:`, users);
      
      // 返回第一个匹配的用户
      return users[0] || null;
    } catch (error) {
      console.error("根据用户名查询用户失败:", error);  
      throw error;
    } finally {
      // 关闭数据库连接
      await this.mongoDBService.close();
    }
  }
  /**
   * 创建新用户
   * @param userData 用户数据
   * @returns 创建的用户信息
   */
  async register({username, password, email}: {username: string, password: string, email: string}) {

    try {
      // 连接数据库
      await this.mongoDBService.connect();
      console.log(`[AuthService] 正在注册用户: ${username}`);
      
      // 创建新用户 
      const newUser = await this.mongoDBService.insertOne("user", {username, password, email});
      console.log(`[AuthService] 用户创建成功:`, newUser);
      
      return newUser;
    } catch (error) {
      console.error("创建用户失败:", error);
      throw error;  
    } finally {
      // 关闭数据库连接
      await this.mongoDBService.close();
    }
  }
}   