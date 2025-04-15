/**
 * API客户端工具类
 * 提供与API服务通信的功能
 */

import { Logger } from "./logger.ts";

// HTTP请求选项
interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

// 响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * API客户端类
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private logger: Logger;

  /**
   * 构造函数
   * @param baseUrl API基础URL
   * @param options 选项
   */
  constructor(
    baseUrl: string,
    options: {
      headers?: Record<string, string>;
      logPrefix?: string;
    } = {}
  ) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    
    this.defaultHeaders = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...options.headers
    };
    
    this.logger = new Logger({ prefix: options.logPrefix || "API-Client" });
  }

  /**
   * 发送GET请求
   * @param endpoint 请求路径
   * @param options 请求选项
   * @returns 响应数据
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * 发送POST请求
   * @param endpoint 请求路径
   * @param data 请求数据
   * @param options 请求选项
   * @returns 响应数据
   */
  async post<T = any>(
    endpoint: string,
    data: Record<string, unknown>,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data
    });
  }

  /**
   * 发送PUT请求
   * @param endpoint 请求路径
   * @param data 请求数据
   * @param options 请求选项
   * @returns 响应数据
   */
  async put<T = any>(
    endpoint: string,
    data: Record<string, unknown>,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data
    });
  }

  /**
   * 发送DELETE请求
   * @param endpoint 请求路径
   * @param options 请求选项
   * @returns 响应数据
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * 发送请求
   * @param endpoint 请求路径
   * @param options 请求选项
   * @returns 响应数据
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const method = options.method || "GET";
    
    // 构建请求选项
    const fetchOptions: RequestInit = {
      method,
      headers: { ...this.defaultHeaders, ...options.headers }
    };
    
    // 添加请求体
    if (options.body && ["POST", "PUT", "PATCH"].includes(method)) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    
    try {
      this.logger.debug(`${method} ${url}`);
      
      // 发送请求
      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get("content-type") || "";
      
      // 解析响应
      let data: any;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // 检查响应状态
      if (!response.ok) {
        const error = typeof data === 'object' && data.message
          ? data.message
          : `HTTP错误 ${response.status}: ${response.statusText}`;
        
        this.logger.error(`请求失败: ${error}`);
        
        return {
          success: false,
          code: response.status,
          message: error,
          error
        };
      }
      
      return data as ApiResponse<T>;
    } catch (error) {
      this.logger.error(`请求异常: ${error}`);
      
      return {
        success: false,
        code: 500,
        message: `请求失败: ${error}`,
        error: String(error)
      };
    }
  }
}

/**
 * 创建远程API客户端
 */
export function createRemoteApiClient(apiBaseUrl?: string): ApiClient {
  // 优先使用传入的URL，其次使用环境变量，最后使用默认值
  const baseUrl = apiBaseUrl || 
    Deno.env.get("API_BASE_URL") || 
    "https://elpis-deno-elpis.deno.dev/api";
  
  return new ApiClient(baseUrl, { logPrefix: "Remote-API" });
}

/**
 * 创建本地API客户端
 */
export function createLocalApiClient(port?: number): ApiClient {
  const apiPort = port || Deno.env.get("PORT") || 8000;
  const baseUrl = `http://localhost:${apiPort}/api`;
  
  return new ApiClient(baseUrl, { logPrefix: "Local-API" });
}

export default {
  createRemoteApiClient,
  createLocalApiClient
}; 