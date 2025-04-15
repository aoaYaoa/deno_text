// ID生成工具
// 用于生成唯一标识符

/**
 * 生成全局唯一的ID
 * 采用简单的时间戳+随机数组合
 * @returns 唯一ID字符串
 */
export function createId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
}

/**
 * 生成固定长度的随机字符串ID
 * @param length ID长度，默认为10
 * @returns 随机字符串ID
 */
export function createRandomId(length = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
} 