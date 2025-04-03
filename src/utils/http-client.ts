// HTTP客户端 - 类似Axios的HTTP请求封装
// 基于Deno内置的fetch API实现

// 请求配置类型
export interface RequestConfig {
  baseURL?: string;
  url?: string;
  method?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: any;
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  validateStatus?: (status: number) => boolean;
}

// 请求拦截器
export interface RequestInterceptor {
  onFulfilled: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
  onRejected?: (error: unknown) => Promise<unknown> | unknown;
}

// 响应拦截器
export interface ResponseInterceptor {
  onFulfilled: (response: Response) => Promise<any> | any;
  onRejected?: (error: unknown) => Promise<unknown> | unknown;
}

// HTTP错误类
export class HttpError extends Error {
  status: number;
  data: any;
  config: RequestConfig;
  response?: Response;

  constructor(message: string, status: number, data: any, config: RequestConfig, response?: Response) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.config = config;
    this.response = response;
  }
}

/**
 * HttpClient - 类似Axios的HTTP客户端
 */
export class HttpClient {
  // 默认配置
  private defaultConfig: RequestConfig = {
    baseURL: '',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'json',
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  // 拦截器
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  /**
   * 构造函数
   * @param config 初始配置
   */
  constructor(config: RequestConfig = {}) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * 添加请求拦截器
   * @param interceptor 请求拦截器
   * @returns 拦截器ID，用于移除拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): number {
    this.requestInterceptors.push(interceptor);
    return this.requestInterceptors.length - 1;
  }

  /**
   * 添加响应拦截器
   * @param interceptor 响应拦截器
   * @returns 拦截器ID，用于移除拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): number {
    this.responseInterceptors.push(interceptor);
    return this.responseInterceptors.length - 1;
  }

  /**
   * 移除请求拦截器
   * @param id 拦截器ID
   */
  removeRequestInterceptor(id: number): void {
    this.requestInterceptors[id] = {
      onFulfilled: (config) => config,
    };
  }

  /**
   * 移除响应拦截器
   * @param id 拦截器ID
   */
  removeResponseInterceptor(id: number): void {
    this.responseInterceptors[id] = {
      onFulfilled: (response) => response,
    };
  }

  /**
   * 执行请求
   * @param config 请求配置
   * @returns 响应数据
   */
  private async request<T = any>(config: RequestConfig): Promise<T> {
    // 合并配置
    let mergedConfig = { ...this.defaultConfig, ...config };

    // 应用请求拦截器
    try {
      for (const interceptor of this.requestInterceptors) {
        mergedConfig = await interceptor.onFulfilled(mergedConfig);
      }
    } catch (error) {
      for (const interceptor of this.requestInterceptors) {
        if (interceptor.onRejected) {
          try {
            await interceptor.onRejected(error);
          } catch (innerError) {
            throw innerError;
          }
        }
      }
      throw error;
    }

    // 构建URL（处理baseURL和params）
    let url = mergedConfig.baseURL || '';
    
    // 确保URL路径正确连接
    if (mergedConfig.url) {
      if (!url.endsWith('/') && !mergedConfig.url.startsWith('/')) {
        url += '/';
      }
      url += mergedConfig.url;
    }

    // 处理查询参数
    if (mergedConfig.params) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(mergedConfig.params)) {
        queryParams.append(key, String(value));
      }
      url += (url.includes('?') ? '&' : '?') + queryParams.toString();
    }

    // 准备请求选项
    const options: RequestInit = {
      method: mergedConfig.method || 'GET',
      headers: { ...mergedConfig.headers },
    };

    // 处理请求体
    if (mergedConfig.data !== undefined) {
      if (typeof mergedConfig.data === 'object' && !(mergedConfig.data instanceof FormData)) {
        options.body = JSON.stringify(mergedConfig.data);
      } else {
        options.body = mergedConfig.data;
      }
    }

    // 执行请求（带超时）
    let controller: AbortController | undefined;
    let timeoutId: number | undefined;

    if (mergedConfig.timeout) {
      controller = new AbortController();
      options.signal = controller.signal;
      timeoutId = setTimeout(() => controller?.abort(), mergedConfig.timeout);
    }

    try {
      // 发送请求
      const response = await fetch(url, options);

      // 清除超时
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      // 应用响应拦截器
      let processedResponse = response;
      try {
        for (const interceptor of this.responseInterceptors) {
          processedResponse = await interceptor.onFulfilled(processedResponse);
        }
      } catch (error) {
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onRejected) {
            try {
              await interceptor.onRejected(error);
            } catch (innerError) {
              throw innerError;
            }
          }
        }
        throw error;
      }

      // 验证响应状态
      if (!mergedConfig.validateStatus || mergedConfig.validateStatus(response.status)) {
        // 处理响应数据
        let data: any;
        switch (mergedConfig.responseType) {
          case 'text':
            data = await response.text();
            break;
          case 'blob':
            data = await response.blob();
            break;
          case 'arrayBuffer':
            data = await response.arrayBuffer();
            break;
          case 'json':
          default:
            // 尝试解析JSON，如果失败返回原始文本
            try {
              data = await response.json();
            } catch (e) {
              data = await response.text();
            }
            break;
        }

        return data as T;
      } else {
        // 错误响应
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }

        throw new HttpError(
          `请求失败，状态码: ${response.status}`,
          response.status,
          errorData,
          mergedConfig,
          response
        );
      }
    } catch (error) {
      // 清除超时
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError(
          `请求超时: ${mergedConfig.timeout}ms`,
          0,
          null,
          mergedConfig
        );
      }

      // 重新抛出其他错误
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(
        error instanceof Error ? error.message : '请求失败',
        0,
        null,
        mergedConfig
      );
    }
  }

  /**
   * 发送GET请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * 发送POST请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  /**
   * 发送PUT请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  /**
   * 发送DELETE请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * 发送PATCH请求
   * @param url 请求URL
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  /**
   * 发送HEAD请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async head<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  /**
   * 发送OPTIONS请求
   * @param url 请求URL
   * @param config 请求配置
   * @returns 响应数据
   */
  async options<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }
}

// 创建一个默认实例
const defaultClient = new HttpClient();

// 导出默认实例和类
export default defaultClient; 