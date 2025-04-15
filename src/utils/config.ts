// 配置工具类 - 用于管理应用程序配置
// 支持从环境变量和配置文件中读取配置

import type { Config, ServerConfig, ApiConfig, LogConfig, MongoDBConfig, CorsConfig } from "../config/types.ts";
import { getConfig as getEnvConfig } from "../config/index.ts";
import { load } from "https://deno.land/std@0.202.0/dotenv/mod.ts";

/**
 * 配置管理类
 */
class ConfigManager {
  private envPrefix: string = "DENO_APP_";
  private _config: Partial<Config> = {};
  private _isInitialized: boolean = false;

  /**
   * 初始化配置
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) return;
    
    try {
      // 1. 加载.env文件(如果存在)
      try {
        const env = await load({ export: true });
        console.log(`[配置] 已加载.env文件，包含${Object.keys(env).length}个变量`);
      } catch (error) {
        console.log("[配置] .env文件不存在或无法读取");
      }
      
      // 2. 加载环境相关的基础配置
      const envConfig = await getEnvConfig();
      this._config = { ...envConfig }; 
      
      // 3. 从环境变量填充配置
      this.loadFromEnv();
      
      // 4. 确保所有必要的配置都有值
      this.ensureRequiredConfig();
      
      this._isInitialized = true;
      console.log(`[配置] 当前环境: ${this.get("env")}`);
    } catch (error) {
      console.error("[配置] 初始化配置失败:", error);
    }
  }

  /**
   * 从环境变量加载配置
   */
  private loadFromEnv(): void {
    try {
      // 获取所有环境变量
      const env = Deno.env.toObject();
      
      // 服务器配置
      if (env.PORT) this.setNestedValue("server.port", parseInt(env.PORT, 10));
      if (env.HOST) this.setNestedValue("server.host", env.HOST);
      
      // API配置
      if (env.API_PREFIX) this.setNestedValue("api.prefix", env.API_PREFIX);
      if (env.API_VERSION) this.setNestedValue("api.version", env.API_VERSION);
      if (env.API_BASE_URL) this.setNestedValue("api.baseUrl", env.API_BASE_URL);
      
      // MongoDB配置
      if (env.MONGODB_URI) this.setNestedValue("mongodb.uri", env.MONGODB_URI);
      if (env.MONGODB_DATABASE) this.setNestedValue("mongodb.dbName", env.MONGODB_DATABASE);
      
      // 日志配置
      if (env.LOG_LEVEL) this.setNestedValue("log.level", env.LOG_LEVEL as any);
      if (env.LOG_FORMAT) this.setNestedValue("log.format", env.LOG_FORMAT as any);
      
      // JWT配置
      if (env.JWT_SECRET) this.setNestedValue("secret", env.JWT_SECRET);
      if (env.JWT_EXPIRES) this.setNestedValue("jwtExpiresIn", env.JWT_EXPIRES);
      
      // CORS配置
      if (env.ALLOWED_ORIGINS) {
        const origins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
        this.setNestedValue("cors.enabled", true);
        this.setNestedValue("cors.options.origin", origins);
      }
      
      // 环境设置
      if (env.NODE_ENV) this.setNestedValue("env", env.NODE_ENV);
    } catch (error) {
      console.warn("[配置] 无法完全加载环境变量:", error);
    }
  }

  /**
   * 确保所有必要的配置都有值
   */
  private ensureRequiredConfig(): void {
    // 确保必要的配置结构存在
    if (!this._config.server) this._config.server = {} as ServerConfig;
    if (!this._config.api) this._config.api = {} as ApiConfig;
    if (!this._config.log) this._config.log = {} as LogConfig;
    if (!this._config.mongodb) this._config.mongodb = {} as MongoDBConfig;
    if (!this._config.cors) this._config.cors = {} as CorsConfig;
    
    // 服务器默认配置
    if (!this._config.server.port) this._config.server.port = 8000;
    if (!this._config.server.host) this._config.server.host = "0.0.0.0";
    
    // API默认配置
    if (!this._config.api.prefix) this._config.api.prefix = "/api";
    if (!this._config.api.version) this._config.api.version = "v1";
    
    // API基础URL (非ApiConfig类型的一部分，存储为外部变量)
    const apiBaseUrl = Deno.env.get("API_BASE_URL") || (this.isProduction() 
      ? "https://elpis-deno-elpis.deno.dev/api"
      : `http://${this._config.server.host}:${this._config.server.port}/api`);
    
    // 确保API配置中的md5Key和rateLimit属性存在
    if (!this._config.api.md5Key) this._config.api.md5Key = "default-md5-key";
    if (!this._config.api.rateLimit) {
      this._config.api.rateLimit = {
        enabled: false,
        max: 100,
        windowMs: 60000 // 1分钟
      };
    }
    
    // 日志默认配置
    if (!this._config.log.level) this._config.log.level = this.isProduction() ? "info" : "debug";
    if (!this._config.log.format) this._config.log.format = "json";
    
    // MongoDB默认配置
    if (!this._config.mongodb.dbName) this._config.mongodb.dbName = "elpis-beta";
    
    // 其他必要配置
    if (!this._config.env) this._config.env = this.isProduction() ? "production" : "development";
    if (!this._config.appName) this._config.appName = "Elpis MBTI";
    if (!this._config.secret) this._config.secret = "default-secret-key-for-development";
    if (!this._config.jwtExpiresIn) this._config.jwtExpiresIn = "7d";
  }

  /**
   * 设置嵌套属性的值
   */
  private setNestedValue(path: string, value: any): void {
    const parts = path.split('.');
    let current: any = this._config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * 获取配置值
   */
  get<T = any>(path: string, defaultValue?: T): T {
    const parts = path.split('.');
    let current: any = this._config;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return defaultValue as T;
      }
      current = current[part];
    }
    
    return (current !== undefined ? current : defaultValue) as T;
  }

  /**
   * 检查当前是否为生产环境
   */
  isProduction(): boolean {
    // 先检查显式设置
    if (this._config.env) {
      return this._config.env === "production";
    }
    
    // 检查环境变量
    const envSetting = Deno.env.get("NODE_ENV") || Deno.env.get("DENO_ENV");
    if (envSetting) {
      return envSetting.toLowerCase() === "production";
    }
    
    // 检查是否运行在Deno Deploy
    return !!Deno.env.get("DENO_DEPLOYMENT_ID");
  }

  /**
   * 获取完整配置
   */
  getConfig(): Partial<Config> {
    return { ...this._config };
  }
}

// 创建单例实例
const configManager = new ConfigManager();

// 初始化配置
await configManager.initialize();

// 导出配置管理器
export const config = configManager;
export default configManager; 