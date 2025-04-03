// 文件处理工具
// 提供文件读写的常用函数

/**
 * 读取文件内容为字符串
 * @param path 文件路径
 * @returns 文件内容
 */
export async function readFileStr(path: string): Promise<string> {
  try {
    return await Deno.readTextFile(path);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`无法读取文件 ${path}: ${errorMessage}`);
  }
}

/**
 * 将内容写入文件
 * @param path 文件路径
 * @param content 内容
 */
export async function writeFileStr(path: string, content: string): Promise<void> {
  try {
    await Deno.writeTextFile(path, content);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`无法写入文件 ${path}: ${errorMessage}`);
  }
}

/**
 * 判断文件是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error: unknown) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`检查文件是否存在失败 ${path}: ${errorMessage}`);
  }
}

/**
 * 创建目录（如果不存在）
 * @param path 目录路径
 * @param recursive 是否递归创建
 */
export async function ensureDir(path: string, recursive = true): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive });
  } catch (error: unknown) {
    if (error instanceof Deno.errors.AlreadyExists) {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`创建目录失败 ${path}: ${errorMessage}`);
  }
}

/**
 * 删除文件
 * @param path 文件路径
 */
export async function removeFile(path: string): Promise<void> {
  try {
    await Deno.remove(path);
  } catch (error: unknown) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`删除文件失败 ${path}: ${errorMessage}`);
  }
}

/**
 * 读取文件为JSON对象
 * @param path 文件路径
 * @returns 解析后的JSON对象
 */
export async function readJsonFile<T>(path: string): Promise<T> {
  try {
    const content = await readFileStr(path);
    return JSON.parse(content) as T;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`无法读取或解析JSON文件 ${path}: ${errorMessage}`);
  }
}

/**
 * 将对象写入JSON文件
 * @param path 文件路径
 * @param data 数据对象
 * @param pretty 是否美化格式
 */
export async function writeJsonFile(
  path: string,
  data: unknown,
  pretty = true
): Promise<void> {
  try {
    const content = pretty
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    await writeFileStr(path, content);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`无法写入JSON文件 ${path}: ${errorMessage}`);
  }
} 