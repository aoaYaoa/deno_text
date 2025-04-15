// MBTI服务类
// 提供MBTI测试相关的数据操作

import { BaseService } from "./base.ts";
import { Logger } from "../utils/logger.ts";
import { createId } from "../utils/id.ts";

export interface MBTIQuestion {
  id: number;
  question: string;
  options: Array<{
    value: string;
    text: string;
  }>;
  dimension: string;
}

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

export interface MBTIRole {
  role: string;
  types: string[];
  description: string;
  traits: string[];
  color: string;
}

export interface MBTITestResponse {
  question_id: number;
  selected_value: string;
}

export interface MBTITestResult {
  type: string;
  scores: Record<string, number>;
}

export interface MBTITestSubmission {
  user_id: string;
  nickname?: string;
  responses: MBTITestResponse[];
}

export class MBTIService extends BaseService {
  private readonly questionsCollection = "mbti_questions";
  private readonly typesCollection = "mbti_types";
  private readonly rolesCollection = "mbti_roles";
  private readonly testResultsCollection = "mbti_test_results";
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger({ prefix: "MBTI" });
  }

  /**
   * 获取所有MBTI测试问题
   */
  async getQuestions(): Promise<MBTIQuestion[]> {
    try {
      await this.mongoDBService.connect();
      const questions = await this.mongoDBService.find(this.questionsCollection, {});
      return questions as unknown as MBTIQuestion[];
    } catch (error) {
      this.logger.error("获取MBTI问题失败:", error);
      throw error;
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 获取MBTI类型详情
   * @param type MBTI类型代码(如 INTJ-A)
   */
  async getTypeDetails(type: string): Promise<MBTIType | null> {
    try {
      await this.mongoDBService.connect();
      const types = await this.mongoDBService.find(this.typesCollection, { type });
      if (types.length === 0) {
        return null;
      }
      return types[0] as unknown as MBTIType;
    } catch (error) {
      this.logger.error(`获取MBTI类型详情失败 [${type}]:`, error);
      throw error;
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 获取所有MBTI类型
   */
  async getAllTypes(): Promise<MBTIType[]> {
    try {
      await this.mongoDBService.connect();
      const types = await this.mongoDBService.find(this.typesCollection, {});
      return types as unknown as MBTIType[];
    } catch (error) {
      this.logger.error("获取所有MBTI类型失败:", error);
      throw error;
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 获取所有MBTI角色
   */
  async getRoles(): Promise<MBTIRole[]> {
    try {
      await this.mongoDBService.connect();
      const roles = await this.mongoDBService.find(this.rolesCollection, {});
      return roles as unknown as MBTIRole[];
    } catch (error) {
      this.logger.error("获取MBTI角色失败:", error);
      throw error;
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 提交MBTI测试
   * @param testData 测试数据
   */
  async submitTest(testData: MBTITestSubmission): Promise<{
    success: boolean;
    code?: number;
    test_id?: string;
    result?: MBTITestResult;
    message?: string;
  }> {
    try {
      if (!testData.user_id) {
        return { success: false, code: 400, message: "缺少用户ID" };
      }

      if (!testData.responses || testData.responses.length === 0) {
        return { success: false, code: 400, message: "未提供测试答案" };
      }

      // 判断测试是否完成(至少需要回答16个问题)
      const isCompleted = testData.responses.length >= 16;
      
      // 生成测试ID
      const testId = createId();
      
      // 如果测试完成，计算结果
      let testResult: MBTITestResult | null = null;
      if (isCompleted) {
        testResult = this.calculateTestResult(testData.responses);
      }

      await this.mongoDBService.connect();
      
      // 检查用户是否存在于测试结果集合中
      const existingUsers = await this.mongoDBService.find(
        this.testResultsCollection,
        { user_id: testData.user_id }
      );

      const now = new Date();
      
      if (existingUsers.length === 0) {
        // 新用户，创建记录
        const newUserData = {
          user_id: testData.user_id,
          nickname: testData.nickname || testData.user_id,
          tests: [{
            test_id: testId,
            test_date: now,
            completed: isCompleted,
            responses: testData.responses,
            result: testResult
          }],
          test_count: 1,
          latest_type: testResult?.type || null,
          created_at: now,
          updated_at: now
        };
        
        await this.mongoDBService.insertOne(this.testResultsCollection, newUserData);
      } else {
        // 现有用户，更新记录
        const userData = existingUsers[0] as Record<string, unknown>;
        const tests = userData.tests as Array<Record<string, unknown>> || [];
        
        tests.push({
          test_id: testId,
          test_date: now,
          completed: isCompleted,
          responses: testData.responses,
          result: testResult
        });
        
        const updateData: Record<string, unknown> = {
          tests,
          test_count: tests.length,
          updated_at: now
        };
        
        // 如果测试完成，更新最新类型
        if (isCompleted && testResult) {
          updateData.latest_type = testResult.type;
        }
        
        // 如果提供了昵称且现有昵称为空，更新昵称
        if (testData.nickname && (!userData.nickname || userData.nickname === userData.user_id)) {
          updateData.nickname = testData.nickname;
        }
        
        await this.mongoDBService.updateOne(
          this.testResultsCollection,
          { user_id: testData.user_id },
          { $set: updateData }
        );
      }
      
      return {
        success: true,
        code: 200,
        test_id: testId,
        result: testResult || undefined
      };
    } catch (error) {
      this.logger.error("提交MBTI测试失败:", error);
      return { success: false, code: 500, message: "保存测试数据时出错" };
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 获取用户的MBTI测试历史
   * @param userId 用户ID
   */
  async getUserTestHistory(userId: string): Promise<{
    success: boolean;
    code?: number;
    data?: {
      user_id: string;
      nickname: string;
      test_count: number;
      latest_type: string | null;
      tests: Array<{
        test_id: string;
        test_date: Date;
        completed: boolean;
        result?: MBTITestResult;
      }>;
    };
    message?: string;
  }> {
    try {
      await this.mongoDBService.connect();
      
      const users = await this.mongoDBService.find(
        this.testResultsCollection,
        { user_id: userId }
      );
      
      if (users.length === 0) {
        return { success: false, code: 404, message: "未找到用户测试记录" };
      }
      
      const userData = users[0] as Record<string, unknown>;
      const tests = (userData.tests as Array<Record<string, unknown>>) || [];
      
      // 提取简化的测试历史
      const simplifiedTests = tests.map(test => ({
        test_id: test.test_id as string,
        test_date: test.test_date as Date,
        completed: test.completed as boolean,
        result: test.result as MBTITestResult | undefined
      }));
      
      return {
        success: true,
        code: 200,
        data: {
          user_id: userData.user_id as string,
          nickname: userData.nickname as string,
          test_count: userData.test_count as number,
          latest_type: userData.latest_type as string | null,
          tests: simplifiedTests
        }
      };
    } catch (error) {
      this.logger.error(`获取用户MBTI测试历史失败 [${userId}]:`, error);
      return { success: false, code: 500, message: "获取测试历史时出错" };
    } finally {
      await this.mongoDBService.close();
    }
  }

  /**
   * 计算MBTI测试结果
   * @param responses 用户回答
   * @returns MBTI测试结果
   */
  private calculateTestResult(responses: MBTITestResponse[]): MBTITestResult {
    // 初始化分数
    const scores = {
      EI_E: 0, EI_I: 0,
      SN_S: 0, SN_N: 0,
      TF_T: 0, TF_F: 0,
      JP_J: 0, JP_P: 0,
      AT_A: 0, AT_T: 0
    };
    
    // 累计每个维度的分数
    for (const response of responses) {
      switch (response.selected_value) {
        case 'E': scores.EI_E++; break;
        case 'I': scores.EI_I++; break;
        case 'S': scores.SN_S++; break;
        case 'N': scores.SN_N++; break;
        case 'T': scores.TF_T++; break;
        case 'F': scores.TF_F++; break;
        case 'J': scores.JP_J++; break;
        case 'P': scores.JP_P++; break;
        case 'A': scores.AT_A++; break;
        case 'T': scores.AT_T++; break;
      }
    }
    
    // 确定每个维度的主导特质
    const E_I = scores.EI_E > scores.EI_I ? 'E' : 'I';
    const S_N = scores.SN_S > scores.SN_N ? 'S' : 'N';
    const T_F = scores.TF_T > scores.TF_F ? 'T' : 'F';
    const J_P = scores.JP_J > scores.JP_P ? 'J' : 'P';
    const A_T = scores.AT_A > scores.AT_T ? 'A' : 'T';
    
    // 组合MBTI类型
    const mbtiType = `${E_I}${S_N}${T_F}${J_P}-${A_T}`;
    
    return {
      type: mbtiType,
      scores
    };
  }
}

// 导出服务实例
export default new MBTIService(); 