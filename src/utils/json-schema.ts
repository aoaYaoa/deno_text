// JSON Schema 验证工具
import Ajv from "ajv";
import addFormats from "ajv-formats";

// 创建验证器实例
const ajv = new Ajv({
  allErrors: true,     // 返回所有错误而不是仅第一个
  removeAdditional: true,  // 移除额外的属性
  useDefaults: true,   // 使用默认值
  coerceTypes: true,   // 类型转换
});

// 添加常用格式支持 (email, date, uuid 等)
addFormats(ajv);

/**
 * 通用JSON数据验证函数
 * @param schema JSON Schema 定义
 * @param data 需要验证的数据
 * @returns 验证结果和错误信息
 */
export function validateSchema<T>(schema: object, data: unknown): { valid: boolean; data: T | null; errors: any[] } {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return {
      valid: true,
      data: data as T,
      errors: []
    };
  }

  return {
    valid: false,
    data: null,
    errors: validate.errors || []
  };
}

/**
 * 创建中间件函数用于验证请求体
 * @param schema JSON Schema 定义
 */
export function validateBody(schema: object) {
  return async (ctx: any, next: any) => {
    const body = ctx.request.body();
    
    if (body.type !== "json") {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请求必须是JSON格式"
      };
      return;
    }
    
    const data = await body.value;
    const { valid, errors } = validateSchema(schema, data);
    
    if (!valid) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "请求数据验证失败",
        errors: formatAjvErrors(errors)
      };
      return;
    }
    
    // 将验证后的数据存储在ctx.state中
    ctx.state.validatedBody = data;
    await next();
  };
}

/**
 * 格式化Ajv的错误信息为更友好的格式
 */
function formatAjvErrors(errors: any[]): any[] {
  return errors.map(error => {
    const field = error.instancePath.replace(/^\//, '') || error.params.missingProperty || '(root)';
    
    return {
      field,
      message: error.message,
      params: error.params
    };
  });
}

// 导出常用JSON Schema类型定义以供参考
export const JSONSchemaTypes = {
  STRING: { type: "string" },
  NUMBER: { type: "number" },
  INTEGER: { type: "integer" },
  BOOLEAN: { type: "boolean" },
  OBJECT: { type: "object" },
  ARRAY: { type: "array" },
  NULL: { type: "null" },
};

// 导出常用验证规则工厂函数
export const JSONSchemaRules = {
  required: (properties: string[]) => ({ required: properties }),
  minLength: (length: number) => ({ minLength: length }),
  maxLength: (length: number) => ({ maxLength: length }),
  pattern: (regex: string) => ({ pattern: regex }),
  format: (format: string) => ({ format }),
  minimum: (min: number) => ({ minimum: min }),
  maximum: (max: number) => ({ maximum: max }),
  enum: (values: any[]) => ({ enum: values }),
  const: (value: any) => ({ const: value }),
}; 