// src/config/development.ts
// 开发环境配置

import { Config } from './types.ts';
import { WHITE_LIST } from './whitelist.ts';

const config: Config = {
  env: 'development',
  appName: 'deno-api',
  server: {
    port: 8000,
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
    db: 'testdb',
    port: 3306,
    poolSize: 5,
  },
  mongodb: {
    uri: 'mongodb+srv://ac-hznwyxh.tf0eviu.mongodb.net/?retryWrites=true&w=majority',
    dbName: 'sample_mflix',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      retryWrites: true,
      authSource: 'admin'
    }
  },
  api: {
    md5Key: 'E807F1FCF82D132F9BB018CA6738A19F',
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      enabled: false,
      max: 100,
      windowMs: 60000,
    },
  },
  log: {
    level: 'debug',
    format: 'text',
    output: 'console',
  },
  secret: 'dev-secret-key-change-in-production',
  jwtExpiresIn: '1d',
  whiteList: WHITE_LIST,
  cors: {
    enabled: true,
    options: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 's_t', 's_sign', 'userid'],
      credentials: true,
      maxAge: 86400
    },
  },
};

export default config; 