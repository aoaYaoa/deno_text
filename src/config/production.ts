// src/config/production.ts
// 生产环境配置

import { Config } from './types.ts';

// 从环境变量获取敏感信息
const DB_HOST = Deno.env.get('DB_HOST') || '127.0.0.1';
const DB_USER = Deno.env.get('DB_USER') || 'root';
const DB_PASSWORD = Deno.env.get('DB_PASSWORD') || '';
const DB_NAME = Deno.env.get('DB_NAME') || 'testdb_prod';
const DB_PORT = parseInt(Deno.env.get('DB_PORT') || '3306');
const DB_POOL_SIZE = parseInt(Deno.env.get('DB_POOL_SIZE') || '10');

// MongoDB环境变量
const MONGODB_URI = Deno.env.get('MONGODB_URI') || 'mongodb://localhost:27017';
const MONGODB_NAME = Deno.env.get('MONGODB_NAME') || 'denoapp_prod';
const MONGODB_MAX_POOL_SIZE = parseInt(Deno.env.get('MONGODB_MAX_POOL_SIZE') || '20');

const APP_SECRET = Deno.env.get('APP_SECRET');
const JWT_EXPIRES = Deno.env.get('JWT_EXPIRES') || '6h';
const SERVER_PORT = parseInt(Deno.env.get('PORT') || '8080');
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || ['https://yourapp.com'];

// 确保生产环境有密钥设置
if (!APP_SECRET) {
  console.error('警告: 生产环境中未设置APP_SECRET环境变量!');
}

const config: Config = {
  env: 'production',
  appName: 'deno-api',
  server: {
    port: SERVER_PORT,
    host: '0.0.0.0',
    cors: {
      enabled: true,
      options: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    },
  },
  db: {
    hostname: DB_HOST,
    username: DB_USER,
    password: DB_PASSWORD,
    db: DB_NAME,
    port: DB_PORT,
    poolSize: DB_POOL_SIZE,
    // 生产环境推荐启用TLS
    tls: {
      mode: 'VERIFY_IDENTITY',
    },
  },
  mongodb: {
    uri: MONGODB_URI,
    dbName: MONGODB_NAME,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: MONGODB_MAX_POOL_SIZE,
      // 生产环境应该设置更多安全选项
      authSource: 'admin',
    }
  },
  api: {
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      enabled: true,
      max: 60,
      windowMs: 60000, // 1分钟
    },
  },
  log: {
    level: 'info',
    format: 'json',
    output: 'file',
    logFile: './logs/app.log',
  },
  secret: APP_SECRET || 'fallback-secret-key-please-change',
  jwtExpiresIn: JWT_EXPIRES,
};

export default config; 