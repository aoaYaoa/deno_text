// src/config/types.ts
// 配置类型定义

// 数据库配置类型 (MySQL)
export interface DbConfig {

  hostname: string;
  username: string;
  password: string;
  db: string;
  port: number;
  poolSize: number;
  tls?: {
    mode: string;
    caCerts?: string[];
  };
}

// MongoDB 配置类型
export interface MongoDBConfig {
  //解码密钥
  uri: string;
  dbName: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    maxPoolSize?: number;
    authSource?: string;
    ssl?: boolean;
    tls?: boolean;
    tlsAllowInvalidCertificates?: boolean;
    retryWrites?: boolean;
  };
}

// 应用服务器配置类型
export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    options?: {
      origin: string | string[];
      methods?: string[];
      allowedHeaders?: string[];
    };
  };
}

// API配置类型
export interface ApiConfig {
  prefix: string;
  md5Key: string;
  version: string;
  rateLimit: {
    enabled: boolean;
    max: number;
    windowMs: number;
  };
}

// 日志配置类型
export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file';
  logFile?: string;
}

// 跨域配置类型
export interface CorsConfig {
  enabled: boolean; //是否启用跨域
  options?: {
    origin: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
    maxAge?: number;
  };
}
// 完整配置类型
export interface Config {
  env: string;
  appName: string;
  server: ServerConfig;
  db: DbConfig;
  mongodb?: MongoDBConfig; // 添加MongoDB配置，设为可选以保持向后兼容
  api: ApiConfig;
  log: LogConfig;
  secret: string;
  jwtExpiresIn: string;
  whiteList: string[];
  cors: CorsConfig; //跨域配置
} 