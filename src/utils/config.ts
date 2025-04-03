// 配置工具类 - 用于管理应用程序配置
// 支持从环境变量和配置文件中读取配置

/**
 * 配置管理类
 */
class Config {
  private configMap: Map<string, string> = new Map();
  private envPrefix: string = "DENO_APP_";

  /**
   * 构造函数
   * 初始化默认配置
   */
  constructor() {
    // 初始化默认配置
    this.setDefaults({
      "API_BASE_URL": "http://localhost:8000/api",
      "API_TIMEOUT": "10000",
      "LOG_LEVEL": "info"
    });

    // 从环境变量加载配置
    this.loadFromEnv();
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
    // 获取所有环境变量
    const env = Deno.env.toObject();

    // 过滤带前缀的环境变量并加载到配置中
    for (const [key, value] of Object.entries(env)) {
      if (key.startsWith(this.envPrefix)) {
        const configKey = key.replace(this.envPrefix, "");
        this.configMap.set(configKey, value);
      }
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
    return this.configMap.get(key) || defaultValue;
  }

  /**
   * 获取数字配置项
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 数字配置值或默认值
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.configMap.get(key);
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
    const value = this.configMap.get(key);
    if (value === undefined) {
      return defaultValue;
    }
    
    return value.toLowerCase() === "true" || 
           value === "1" || 
           value.toLowerCase() === "yes" || 
           value.toLowerCase() === "y";
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
    return this.configMap.has(key);
  }

  /**
   * 获取所有配置
   * @returns 所有配置的对象
   */
  getAll(): Record<string, string> {
    return Object.fromEntries(this.configMap.entries());
  }
}

// 创建单例实例
export const config = new Config();

// 默认导出配置实例
export default config; 