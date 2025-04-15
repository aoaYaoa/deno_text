// 配置工具类 - 用于管理应用程序配置
// 支持从环境变量和配置文件中读取配置

/**
 * 配置管理类
 */
class Config {
  private configMap: Map<string, string> = new Map();
  private envPrefix: string = "DENO_APP_";
  private isEnvLoaded: boolean = false;

  /**
   * 构造函数
   * 初始化默认配置
   */
  constructor() {
    // 设置基本默认值
    this.setDefaults({
      "API_TIMEOUT": "10000",
      "LOG_LEVEL": "info",
      "ENV": "development"
    });
    
    // 从环境变量加载配置
    this.loadFromEnv();
  }

  /**
   * 配置类初始化
   * 加载环境变量和设置派生配置
   */
  async initialize(): Promise<void> {
    try {
      // 尝试加载.env文件
      try {
        await this.loadEnvFile();
      } catch (error) {
        console.log("[配置] .env文件不存在或无法读取，使用环境变量");
      }

      // 检测环境
      const isProduction = this.isProductionEnvironment();
      this.set("ENV", isProduction ? "production" : "development");
      this.set("LOG_LEVEL", this.get("LOG_LEVEL") || (isProduction ? "info" : "debug"));
      
      // 设置API基础URL
      if (!this.has("API_BASE_URL")) {
        this.set("API_BASE_URL", isProduction 
          ? "https://elpis-deno-elpis.deno.dev/api"
          : "http://localhost:8000/api");
      }
      
      console.log(`[配置] 当前环境: ${this.get("ENV")}`);
      console.log(`[配置] API基础URL: ${this.get("API_BASE_URL")}`);
      console.log(`[配置] 日志级别: ${this.get("LOG_LEVEL")}`);
    } catch (error) {
      console.error("[配置] 初始化配置失败:", error);
    }
  }

  /**
   * 加载.env文件
   */
  async loadEnvFile(path: string = ".env"): Promise<void> {
    try {
      const text = await Deno.readTextFile(path);
      const lines = text.split("\n");
      
      for (const line of lines) {
        // 跳过空行和注释
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) {
          continue;
        }
        
        // 解析键值对
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          
          // 去掉引号（如果有）
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          
          // 只在环境变量未设置时使用.env中的值
          if (!Deno.env.get(key)) {
            Deno.env.set(key, value);
          }
        }
      }
      console.log(`[配置] 已加载.env文件`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`无法加载.env文件: ${errorMessage}`);
    }
  }

  /**
   * 检测是否为生产环境
   * @returns 是否为生产环境
   */
  private isProductionEnvironment(): boolean {
    // 先检查是否有显式配置
    const envSetting = Deno.env.get("NODE_ENV") || Deno.env.get("DENO_ENV");
    if (envSetting) {
      return envSetting.toLowerCase() === "production";
    }
    
    try {
      // 检查是否运行在Deno Deploy环境
      const deployId = Deno.env.get("DENO_DEPLOYMENT_ID");
      if (deployId) {
        return true;
      }
      
      // 检查主机名是否为localhost
      const hostname = Deno.hostname();
      if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
        return true;
      }
      
      return false;
    } catch (_) {
      // 如果无法获取环境信息，默认为开发环境
      return false;
    }
  }

  /**
   * 设置默认配置
   * @param defaults 默认配置对象
   */
  setDefaults(defaults: Record<string, string>): void {
    for (const [key, value] of Object.entries(defaults)) {
      if (!this.configMap.has(key)) {
        this.configMap.set(key, value);
      }
    }
  }

  /**
   * 从环境变量加载配置
   * 环境变量需要以DENO_APP_前缀开头
   */
  loadFromEnv(): void {
    if (this.isEnvLoaded) {
      return;
    }
    
    // 获取所有环境变量
    try {
      const env = Deno.env.toObject();

      // 导入所有环境变量（带前缀的特殊处理）
      for (const [key, value] of Object.entries(env)) {
        if (key.startsWith(this.envPrefix)) {
          const configKey = key.replace(this.envPrefix, "");
          this.configMap.set(configKey, value);
        } else {
          // 一些重要配置直接导入，不需要前缀
          switch (key) {
            case "PORT":
            case "HOST":
            case "NODE_ENV":
            case "DENO_ENV":
            case "API_BASE_URL":
            case "MONGODB_URI":
            case "MONGODB_USER":
            case "MONGODB_PASSWORD":
            case "MONGODB_DATABASE":
            case "JWT_SECRET":
            case "ALLOWED_ORIGINS":
              this.configMap.set(key, value);
              break;
          }
        }
      }
      
      this.isEnvLoaded = true;
    } catch (error) {
      console.warn("[配置] 无法加载环境变量:", error);
    }
  }

  /**
   * 从配置文件加载配置
   * @param filePath 配置文件路径
   */
  async loadFromFile(filePath: string): Promise<void> {
    try {
      const content = await Deno.readTextFile(filePath);
      const configData = JSON.parse(content);

      for (const [key, value] of Object.entries(configData)) {
        if (typeof value === "string") {
          this.configMap.set(key, value);
        } else {
          this.configMap.set(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error(`加载配置文件失败: ${filePath}`, error);
    }
  }

  /**
   * 获取配置项
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  get(key: string, defaultValue?: string): string | undefined {
    // 始终优先检查环境变量
    const envValue = Deno.env.get(key) || Deno.env.get(`${this.envPrefix}${key}`);
    if (envValue !== undefined) {
      return envValue;
    }
    
    return this.configMap.get(key) || defaultValue;
  }

  /**
   * 获取数字配置项
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 数字配置值或默认值
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key);
    if (value === undefined) {
      return defaultValue;
    }
    const numValue = Number(value);
    return isNaN(numValue) ? defaultValue : numValue;
  }

  /**
   * 获取布尔配置项
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 布尔配置值或默认值
   */
  getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.get(key);
    if (value === undefined) {
      return defaultValue;
    }
    
    return value.toLowerCase() === "true" || 
           value === "1" || 
           value.toLowerCase() === "yes" || 
           value.toLowerCase() === "y";
  }

  /**
   * 获取数组配置项（逗号分隔的字符串）
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 字符串数组
   */
  getArray(key: string, defaultValue: string[] = []): string[] {
    const value = this.get(key);
    if (!value) {
      return defaultValue;
    }
    
    return value.split(",").map(item => item.trim()).filter(Boolean);
  }

  /**
   * 设置配置项
   * @param key 配置键
   * @param value 配置值
   */
  set(key: string, value: string): void {
    this.configMap.set(key, value);
  }

  /**
   * 检查配置项是否存在
   * @param key 配置键
   * @returns 是否存在
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 获取所有配置
   * @returns 所有配置的对象
   */
  getAll(): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};
    
    // 添加所有内部配置
    for (const [key, value] of this.configMap.entries()) {
      result[key] = value;
    }
    
    // 添加重要环境变量
    const importantKeys = [
      "PORT", "HOST", "NODE_ENV", "DENO_ENV", "API_BASE_URL",
      "MONGODB_URI", "MONGODB_USER", "MONGODB_PASSWORD", "MONGODB_DATABASE",
      "JWT_SECRET", "ALLOWED_ORIGINS"
    ];
    
    for (const key of importantKeys) {
      if (!result[key]) {
        result[key] = this.get(key);
      }
    }
    
    return result;
  }
}

// 创建单例实例
export const config = new Config();

// 初始化配置
await config.initialize();

// 默认导出配置实例
export default config; 