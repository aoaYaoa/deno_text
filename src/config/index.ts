// src/config/index.ts
// 配置管理模块

// 定义所有支持的环境
export type Environment = 'development' | 'test' | 'production';

// 获取当前环境，默认为开发环境
export function getEnvironment(): Environment {
  const env = Deno.env.get('DENO_ENV') as Environment;
  return env || 'development';
}

// 导入对应环境的配置
export async function getConfig() {
  const env = getEnvironment();
  const configModule = await import(`./${env}.ts`);
  return configModule.default;
}

// 为直接导入提供默认配置
export { default } from './development.ts';

// 为方便起见，直接导出环境变量
export const ENV = getEnvironment();
export const IS_DEV = ENV === 'development';
export const IS_TEST = ENV === 'test';
export const IS_PROD = ENV === 'production'; 