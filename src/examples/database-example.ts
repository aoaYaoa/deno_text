// 数据库服务示例
// 展示如何使用数据库服务执行常见操作

import dbService from "../services/database.service.ts";
import { logger } from "../utils/logger.ts";

// 用户类型定义
interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

// 产品类型定义
interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * 用户数据库操作示例
 */
async function userExamples() {
  logger.info("===== 用户数据库操作示例 =====");

  // 1. 插入用户
  const userId = await dbService.insert("users", {
    name: "测试用户",
    email: "test@example.com",
    password: "hashed_password_here",
    role: "user",
    created_at: new Date(),
    updated_at: new Date(),
  });
  logger.info(`插入用户成功，ID: ${userId}`);

  // 2. 根据ID查询用户
  const user = await dbService.findById<User>("users", userId);
  logger.info(`查询用户: ${JSON.stringify(user)}`);

  // 3. 更新用户
  const updatedRows = await dbService.update(
    "users",
    { name: "已更新的测试用户", updated_at: new Date() },
    { id: userId }
  );
  logger.info(`更新用户成功，影响行数: ${updatedRows}`);

  // 4. 查询所有用户
  const allUsers = await dbService.find<User>("users");
  logger.info(`查询所有用户，共 ${allUsers.length} 条记录`);

  // 5. 分页查询用户
  const userPage = await dbService.paginate<User>("users", 1, 10, {
    role: "user",
  });
  logger.info(`分页查询用户: ${JSON.stringify({
    total: userPage.total,
    page: userPage.page,
    pageCount: userPage.pageCount,
    recordCount: userPage.data.length,
  })}`);

  // 6. 执行原始SQL
  const result = await dbService.raw(
    "SELECT COUNT(*) as user_count FROM users WHERE role = ?",
    ["user"]
  );
  logger.info(`执行原始SQL: 用户数量 = ${result.rows[0].user_count}`);

  return userId;
}

/**
 * 产品数据库操作示例
 */
async function productExamples() {
  logger.info("===== 产品数据库操作示例 =====");

  // 确保有一个产品分类
  const categoryId = await dbService.insert("categories", {
    name: "测试分类",
    description: "用于测试的产品分类",
    created_at: new Date(),
  });
  logger.info(`插入产品分类成功，ID: ${categoryId}`);

  // 1. 批量插入产品
  const products = [
    {
      name: "产品1",
      description: "测试产品1的描述",
      price: 99.99,
      stock: 100,
      category_id: categoryId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "产品2",
      description: "测试产品2的描述",
      price: 199.99,
      stock: 50,
      category_id: categoryId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const insertedCount = await dbService.batchInsert("products", products);
  logger.info(`批量插入产品成功，插入数量: ${insertedCount}`);

  // 2. 查询活跃产品
  const activeProducts = await dbService.find<Product>("products", {
    is_active: true,
  });
  logger.info(`查询活跃产品，共 ${activeProducts.length} 条记录`);

  // 3. 分页查询产品并排序
  const productPage = await dbService.paginate<Product>(
    "products",
    1,
    10,
    { category_id: categoryId },
    { orderBy: "price", orderDir: "DESC" }
  );
  logger.info(`分页查询产品: ${JSON.stringify({
    total: productPage.total,
    page: productPage.page,
    pageCount: productPage.pageCount,
    recordCount: productPage.data.length,
  })}`);

  // 4. 带搜索条件的查询
  const searchResults = await dbService.paginate<Product>(
    "products",
    1,
    10,
    {},
    {
      search: { fields: ["name", "description"], query: "测试" },
    }
  );
  logger.info(`搜索产品，结果数量: ${searchResults.data.length}`);

  // 5. 使用事务更新产品库存
  await dbService.transaction(async (execute) => {
    // 先查询产品
    const result = await execute(
      "SELECT id, stock FROM products WHERE name = ? LIMIT 1",
      ["产品1"]
    );
    
    if (result.rows.length === 0) {
      throw new Error("产品不存在");
    }
    
    const product = result.rows[0];
    const newStock = product.stock - 10;
    
    if (newStock < 0) {
      throw new Error("库存不足");
    }
    
    // 更新库存
    await execute(
      "UPDATE products SET stock = ?, updated_at = ? WHERE id = ?",
      [newStock, new Date(), product.id]
    );
    
    logger.info(`在事务中更新产品库存成功，新库存: ${newStock}`);
    
    return true;
  });

  // 过滤掉可能的undefined值，确保只返回有效的ID
  return activeProducts
    .filter(p => p.id !== undefined)
    .map(p => p.id as number);
}

/**
 * 清理测试数据
 */
async function cleanupExamples(userId: number, productIds: number[]) {
  logger.info("===== 清理测试数据 =====");

  // 删除产品
  if (productIds.length > 0) {
    const productsDeleted = await dbService.delete("products", {
      id: productIds[0],
    });
    logger.info(`删除产品成功，影响行数: ${productsDeleted}`);
  }

  // 删除用户
  const usersDeleted = await dbService.delete("users", { id: userId });
  logger.info(`删除用户成功，影响行数: ${usersDeleted}`);
}

/**
 * 运行数据库示例
 */
export async function runDatabaseExamples() {
  try {
    logger.info("开始运行数据库示例...");
    
    // 连接数据库
    await dbService.connect();
    
    // 运行用户示例
    const userId = await userExamples();
    
    // 运行产品示例
    const productIds = await productExamples();
    
    // 清理示例数据
    await cleanupExamples(userId, productIds);
    
    // 关闭数据库连接
    await dbService.close();
    
    logger.info("数据库示例运行完成");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("数据库示例运行失败", errorMessage);
  }
}

// 如果直接运行此文件，则执行示例
if (import.meta.main) {
  await runDatabaseExamples();
} 