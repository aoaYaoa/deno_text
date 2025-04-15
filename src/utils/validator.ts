// 验证工具函数
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export function validate(data: Record<string, unknown>, schema: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  
  // 检查必填字段
  for (const [key, value] of Object.entries(schema)) {
    if (value === true && !(key in data)) {
      errors.push(`缺少必填字段: ${key}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
} 