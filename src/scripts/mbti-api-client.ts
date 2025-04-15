/**
 * MBTI API客户端
 * 封装MBTI相关API的调用，支持本地或远程API
 */

import { ApiClient, ApiResponse } from "../utils/api-client.ts";
import { createRemoteApiClient, createLocalApiClient } from "../utils/api-client.ts";

// MBTI问题接口
export interface MBTIQuestion {
  id: number;
  question: string;
  options: Array<{
    value: string;
    text: string;
  }>;
  dimension: string;
}

// MBTI类型接口
export interface MBTIType {
  type: string;
  name: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  roles: string;
  careers: string[];
  famousPeople: string[];
}

// MBTI角色接口
export interface MBTIRole {
  role: string;
  types: string[];
  description: string;
  traits: string[];
  color: string;
}

// 测试响应接口
export interface MBTITestResponse {
  question_id: number;
  selected_value: string;
}

// 测试结果接口
export interface MBTITestResult {
  type: string;
  scores: Record<string, number>;
}

// 测试提交接口
export interface MBTITestSubmission extends Record<string, unknown> {
  user_id: string;
  nickname?: string;
  responses: MBTITestResponse[];
}

// 测试历史接口
export interface MBTITestHistory {
  user_id: string;
  nickname: string;
  test_count: number;
  latest_type: string | null;
  tests: Array<{
    test_id: string;
    test_date: string;
    completed: boolean;
    result?: MBTITestResult;
  }>;
}

/**
 * MBTI API客户端类
 */
export class MBTIApiClient {
  private client: ApiClient;
  
  /**
   * 构造函数
   * @param client API客户端
   */
  constructor(client: ApiClient) {
    this.client = client;
  }
  
  /**
   * 获取所有MBTI问题
   */
  async getQuestions(): Promise<ApiResponse<MBTIQuestion[]>> {
    return this.client.get<MBTIQuestion[]>("/mbti/questions");
  }
  
  /**
   * 获取所有MBTI类型
   */
  async getAllTypes(): Promise<ApiResponse<MBTIType[]>> {
    return this.client.get<MBTIType[]>("/mbti/types");
  }
  
  /**
   * 获取特定MBTI类型详情
   * @param type MBTI类型代码
   */
  async getTypeDetails(type: string): Promise<ApiResponse<MBTIType>> {
    return this.client.get<MBTIType>(`/mbti/types/${type}`);
  }
  
  /**
   * 获取所有MBTI角色
   */
  async getRoles(): Promise<ApiResponse<MBTIRole[]>> {
    return this.client.get<MBTIRole[]>("/mbti/roles");
  }
  
  /**
   * 提交MBTI测试
   * @param testData 测试数据
   */
  async submitTest(testData: MBTITestSubmission): Promise<ApiResponse<{
    test_id: string;
    result?: MBTITestResult;
  }>> {
    return this.client.post<{
      test_id: string;
      result?: MBTITestResult;
    }>("/mbti/test", testData);
  }
  
  /**
   * 获取用户测试历史
   * @param userId 用户ID
   * @param token 认证Token
   */
  async getUserHistory(userId: string, token: string): Promise<ApiResponse<MBTITestHistory>> {
    return this.client.get<MBTITestHistory>(
      `/mbti/user/${userId}/history`,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
  }
}

/**
 * 创建远程MBTI API客户端
 */
export function createRemoteMBTIClient(): MBTIApiClient {
  return new MBTIApiClient(createRemoteApiClient());
}

/**
 * 创建本地MBTI API客户端
 */
export function createLocalMBTIClient(): MBTIApiClient {
  return new MBTIApiClient(createLocalApiClient());
}

export default {
  createRemoteMBTIClient,
  createLocalMBTIClient
}; 