// MBTI控制器
// 提供MBTI测试相关的API接口

import { Context } from "oak";
import mbtiService, { MBTITestSubmission } from "../services/mbti.service.ts";
import { Logger } from "../utils/logger.ts";

// 创建日志记录器
const logger = new Logger({ prefix: "MBTI-API" });

/**
 * 获取所有MBTI测试问题
 */
export async function getQuestions(ctx: Context) {
  try {
    const questions = await mbtiService.getQuestions();
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 200,
      data: questions
    };
  } catch (error) {
    logger.error("获取MBTI问题失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取MBTI问题失败"
    };
  }
}

/**
 * 获取MBTI类型详情
 */
export async function getTypeDetails(ctx: Context) {
  try {
    const type = ctx.params.type;
    if (!type) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        code: 400,
        message: "缺少类型参数"
      };
      return;
    }

    const typeDetails = await mbtiService.getTypeDetails(type);
    if (!typeDetails) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        code: 404,
        message: "未找到指定的MBTI类型"
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 200,
      data: typeDetails
    };
  } catch (error) {
    logger.error("获取MBTI类型详情失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取MBTI类型详情失败"
    };
  }
}

/**
 * 获取所有MBTI类型
 */
export async function getAllTypes(ctx: Context) {
  try {
    const types = await mbtiService.getAllTypes();
    
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 200,
      data: types
    };
  } catch (error) {
    logger.error("获取所有MBTI类型失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取所有MBTI类型失败"
    };
  }
}

/**
 * 获取所有MBTI角色
 */
export async function getRoles(ctx: Context) {
  try {
    const roles = await mbtiService.getRoles();
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      code: 200,
      data: roles
    };
  } catch (error) {
    logger.error("获取MBTI角色失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取MBTI角色失败"
    };
  }
}

/**
 * 提交MBTI测试
 */
export async function submitTest(ctx: Context) {
  try {
    // 获取请求体
    const body = ctx.request.body();
    if (body.type !== "json") {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        code: 400,
        message: "请求内容必须是JSON格式"
      };
      return;
    }

    const testData: MBTITestSubmission = await body.value;
    
    // 验证必要的字段
    if (!testData.user_id) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        code: 400,
        message: "缺少用户ID"
      };
      return;
    }
    
    if (!testData.responses || !Array.isArray(testData.responses) || testData.responses.length === 0) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        code: 400,
        message: "缺少测试答案"
      };
      return;
    }

    // 提交测试
    const result = await mbtiService.submitTest(testData);
    
    if (result.success) {
      ctx.response.status = 200;
      ctx.response.body = {
        ...result,
        code: 200
      };
    } else {
      ctx.response.status = 400;
      ctx.response.body = {
        ...result,
        code: 400
      };
    }
  } catch (error) {
    logger.error("提交MBTI测试失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "提交MBTI测试失败"
    };
  }
}

/**
 * 获取用户的MBTI测试历史
 */
export async function getUserTestHistory(ctx: Context) {
  try {
    const userId = ctx.params.userId;
    if (!userId) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        code: 400,
        message: "缺少用户ID"
      };
      return;
    }

    const result = await mbtiService.getUserTestHistory(userId);
    
    if (result.success) {
      ctx.response.status = 200;
      ctx.response.body = {
        ...result,
        code: 200
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        ...result,
        code: 404
      };
    }
  } catch (error) {
    logger.error("获取用户MBTI测试历史失败:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      code: 500,
      message: "获取用户MBTI测试历史失败"
    };
  }
} 