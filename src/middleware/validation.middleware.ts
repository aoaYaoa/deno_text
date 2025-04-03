// 验证中间件 - 用于验证请求参数、查询参数和请求体
import { Context, Next } from "oak";
import { AnyZodObject, z, ZodError } from "zod";

// 扩展 Context 类型以支持参数
declare module "oak" {
  interface Context {
    params: Record<string, string>;
  }
}

/**
 * 创建请求体验证中间件
 * @param schema 用于验证的Zod模式
 */
export function validateBody(schema: AnyZodObject | z.ZodEffects<any>) {
  return async (ctx: Context, next: Next) => {
    try {
      const body = ctx.request.body();
      
      if (body.type !== "json") {
        ctx.throw(400, "请求体必须是JSON格式");
        return;
      }
      
      const data = await body.value;
      const validatedData = schema.parse(data);
      
      // 将验证后的数据存储在ctx.state中
      ctx.state.validatedBody = validatedData;
      
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "请求数据验证失败",
          errors: error.errors
        };
        return;
      }
      throw error;
    }
  };
}

/**
 * 创建路径参数验证中间件
 * @param schema 用于验证的Zod模式
 */
export function validateParams(schema: AnyZodObject) {
  return async (ctx: Context, next: Next) => {
    try {
      const validatedParams = schema.parse(ctx.params);
      
      // 将验证后的参数存储在ctx.state中
      ctx.state.validatedParams = validatedParams;
      
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "路径参数验证失败",
          errors: error.errors
        };
        return;
      }
      throw error;
    }
  };
}

/**
 * 创建查询参数验证中间件
 * @param schema 用于验证的Zod模式
 */
export function validateQuery(schema: AnyZodObject) {
  return async (ctx: Context, next: Next) => {
    try {
      // 获取查询参数
      const queryParams: Record<string, string> = {};
      for (const [key, value] of ctx.request.url.searchParams.entries()) {
        queryParams[key] = value;
      }
      
      const validatedQuery = schema.parse(queryParams);
      
      // 将验证后的查询参数存储在ctx.state中
      ctx.state.validatedQuery = validatedQuery;
      
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "查询参数验证失败",
          errors: error.errors
        };
        return;
      }
      throw error;
    }
  };
} 