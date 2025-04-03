// src/config/test.ts
// 测试环境配置

import { Config } from './types.ts';

const config: Config = {
  env: 'test',
  appName: 'deno-api',
  server: {
    port: 8001,
    host: '0.0.0.0',
    cors: {
      enabled: true,
      options: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    },
  },
  db: {
    hostname: '127.0.0.1',
    username: 'root',
    password: 'password',
    db: 'testdb_test',
    port: 3306,
    poolSize: 3,
  },
  mongodb: {
    uri: 'mongodb://localhost:27017',
    dbName: 'denoapp_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 5,
    }
  },
  api: {
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      enabled: false,
      max: 100,
      windowMs: 60000,
    },
  },
  log: {
    level: 'info',
    format: 'text',
    output: 'console',
  },
  secret: 'test-secret-key',
  jwtExpiresIn: '1d',
};

export default config; 