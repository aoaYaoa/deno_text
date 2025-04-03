// 日志工具
// 提供简单的日志记录功能，支持不同的日志级别和彩色输出

import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/colors.ts";

// 日志级别
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// 日志选项接口
export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  showTimestamp?: boolean;
}

/**
 * 日志记录器类
 * 提供不同级别的日志记录和格式化功能
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;
  private showTimestamp: boolean;

  /**
   * 创建日志记录器实例
   * @param options 日志选项
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.prefix = options.prefix ?? "";
    this.showTimestamp = options.showTimestamp ?? true;
  }

  /**
   * 获取当前时间戳字符串
   * @returns 格式化的时间戳字符串
   */
  private getTimestamp(): string {
    if (!this.showTimestamp) return "";
    
    const now = new Date();
    return colors.gray(`[${now.toISOString()}]`);
  }

  /**
   * 获取前缀字符串
   * @returns 格式化的前缀字符串
   */
  private getPrefix(): string {
    if (!this.prefix) return "";
    return colors.bold.blue(`[${this.prefix}]`);
  }

  /**
   * 记录调试级别的日志
   * @param message 日志消息
   * @param args 其他参数
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(
        `${this.getTimestamp()} ${this.getPrefix()} ${colors.gray(message)}`,
        ...args
      );
    }
  }

  /**
   * 记录信息级别的日志
   * @param message 日志消息
   * @param args 其他参数
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(
        `${this.getTimestamp()} ${this.getPrefix()} ${colors.white(message)}`,
        ...args
      );
    }
  }

  /**
   * 记录警告级别的日志
   * @param message 日志消息
   * @param args 其他参数
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(
        `${this.getTimestamp()} ${this.getPrefix()} ${colors.yellow(message)}`,
        ...args
      );
    }
  }

  /**
   * 记录错误级别的日志
   * @param message 日志消息
   * @param args 其他参数
   */
  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(
        `${this.getTimestamp()} ${this.getPrefix()} ${colors.red(message)}`,
        ...args
      );
    }
  }

  /**
   * 设置日志级别
   * @param level 日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 设置日志前缀
   * @param prefix 前缀字符串
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * 启用或禁用时间戳
   * @param show 是否显示时间戳
   */
  setShowTimestamp(show: boolean): void {
    this.showTimestamp = show;
  }
} 