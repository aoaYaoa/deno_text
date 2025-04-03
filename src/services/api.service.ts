// API服务 - 使用HTTP客户端封装API调用
import { HttpClient } from "../utils/http-client.ts";
import { config } from "../utils/config.ts";

// 用户类型定义
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

// 产品类型定义
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
}

/**
 * 简单的令牌存储接口
 */
export interface TokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}

/**
 * 内存令牌存储实现
 */
export class MemoryTokenStorage implements TokenStorage {
  private token: string | null = null;

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
  }

  removeToken(): void {
    this.token = null;
  }
}

/**
 * API服务类 - 封装所有外部API调用
 */
export class ApiService {
  private client: HttpClient;
  private tokenStorage: TokenStorage;
  
  /**
   * 构造函数
   * @param apiBaseUrl API基础URL
   * @param tokenStorage 令牌存储实现
   */
  constructor(apiBaseUrl?: string, tokenStorage?: TokenStorage) {
    // 初始化令牌存储
    this.tokenStorage = tokenStorage || new MemoryTokenStorage();
    
    // 创建HTTP客户端实例
    this.client = new HttpClient({
      baseURL: apiBaseUrl || config.get("API_BASE_URL") || "http://localhost:8000/api",
      timeout: config.getNumber("API_TIMEOUT", 10000),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });
    
    // 添加请求拦截器 - 可以在这里添加认证token等
    this.client.addRequestInterceptor({
      onFulfilled: (config) => {
        // 从存储中获取token
        const token = this.tokenStorage.getToken();
        
        // 如果有token则添加到请求头
        if (token) {
          return {
            ...config,
            headers: {
              ...config.headers,
              "Authorization": `Bearer ${token}`
            }
          };
        }
        
        return config;
      }
    });
    
    // 添加响应拦截器 - 处理通用错误
    this.client.addResponseInterceptor({
      onFulfilled: (response) => {
        return response;
      },
      onRejected: (error) => {
        // 可以在这里处理常见错误，如认证错误
        console.error("API请求失败:", error);
        
        // 重新抛出错误，让调用者处理
        throw error;
      }
    });
  }
  
  // === 用户API ===
  
  /**
   * 获取用户列表
   * @param page 页码
   * @param limit 每页数量
   * @param search 搜索关键词
   */
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<{ users: User[], total: number }> {
    const params: Record<string, string | number> = { page, limit };
    if (search) {
      params.search = search;
    }
    
    return await this.client.get("/users", { params });
  }
  
  /**
   * 获取单个用户
   * @param id 用户ID
   */
  async getUserById(id: number): Promise<User> {
    return await this.client.get(`/users/${id}`);
  }
  
  /**
   * 创建用户
   * @param user 用户信息
   */
  async createUser(user: Omit<User, "id">): Promise<User> {
    return await this.client.post("/users", user);
  }
  
  /**
   * 更新用户
   * @param id 用户ID
   * @param updates 更新信息
   */
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    return await this.client.put(`/users/${id}`, updates);
  }
  
  /**
   * 删除用户
   * @param id 用户ID
   */
  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }
  
  // === 产品API ===
  
  /**
   * 获取产品列表
   * @param page 页码
   * @param limit 每页数量
   * @param category 分类筛选
   */
  async getProducts(page: number = 1, limit: number = 10, category?: string): Promise<{ products: Product[], total: number }> {
    const params: Record<string, string | number> = { page, limit };
    if (category) {
      params.category = category;
    }
    
    return await this.client.get("/products", { params });
  }
  
  /**
   * 获取单个产品
   * @param id 产品ID
   */
  async getProductById(id: number): Promise<Product> {
    return await this.client.get(`/products/${id}`);
  }
  
  /**
   * 创建产品
   * @param product 产品信息
   */
  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    return await this.client.post("/products", product);
  }
  
  /**
   * 更新产品
   * @param id 产品ID
   * @param updates 更新信息
   */
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    return await this.client.put(`/products/${id}`, updates);
  }
  
  /**
   * 删除产品
   * @param id 产品ID
   */
  async deleteProduct(id: number): Promise<void> {
    await this.client.delete(`/products/${id}`);
  }
  
  // === 认证API ===
  
  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   */
  async login(email: string, password: string): Promise<{ token: string, user: User }> {
    const result = await this.client.post("/auth/login", { email, password });
    
    // 保存token到存储
    if (result.token) {
      this.tokenStorage.setToken(result.token);
    }
    
    return result;
  }
  
  /**
   * 用户注册
   * @param name 姓名
   * @param email 邮箱
   * @param password 密码
   */
  async register(name: string, email: string, password: string): Promise<{ token: string, user: User }> {
    const result = await this.client.post("/auth/register", { name, email, password });
    
    // 保存token到存储
    if (result.token) {
      this.tokenStorage.setToken(result.token);
    }
    
    return result;
  }
  
  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
    
    // 清除token
    this.tokenStorage.removeToken();
  }
}

// 创建默认实例
const apiService = new ApiService();

// 导出默认实例和类
export default apiService; 