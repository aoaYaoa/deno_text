// API服务使用示例
import apiService, { ApiService } from "../services/api.service.ts";

/**
 * 演示API服务的使用
 */
export async function runApiServiceDemo() {
  console.log("开始API服务示例演示...\n");

  // 模拟用户操作
  await userOperationsDemo();

  // 模拟产品操作
  await productOperationsDemo();

  console.log("\nAPI服务示例演示结束");
}

/**
 * 用户操作示例
 */
async function userOperationsDemo() {
  console.log("=== 用户操作示例 ===");

  try {
    // 1. 创建用户
    console.log("\n1. 创建用户");
    const newUser = await apiService.createUser({
      name: "张三",
      email: "zhangsan@example.com"
    });
    console.log("创建的用户:", newUser);

    // 2. 获取用户列表
    console.log("\n2. 获取用户列表");
    const userList = await apiService.getUsers(1, 10);
    console.log(`共找到 ${userList.total} 个用户:`);
    userList.users.forEach(user => {
      console.log(`- ID: ${user.id}, 姓名: ${user.name}, 邮箱: ${user.email}`);
    });

    // 3. 获取单个用户
    if (newUser.id) {
      console.log(`\n3. 获取用户 (ID: ${newUser.id})`);
      const user = await apiService.getUserById(newUser.id);
      console.log("用户详情:", user);

      // 4. 更新用户
      console.log(`\n4. 更新用户 (ID: ${newUser.id})`);
      const updatedUser = await apiService.updateUser(newUser.id, {
        name: "张三 (已更新)"
      });
      console.log("更新后的用户:", updatedUser);

      // 5. 删除用户
      console.log(`\n5. 删除用户 (ID: ${newUser.id})`);
      await apiService.deleteUser(newUser.id);
      console.log("用户已删除");
    }
  } catch (error) {
    console.error("用户操作发生错误:", error);
  }
}

/**
 * 产品操作示例
 */
async function productOperationsDemo() {
  console.log("\n=== 产品操作示例 ===");

  try {
    // 1. 创建产品
    console.log("\n1. 创建产品");
    const newProduct = await apiService.createProduct({
      name: "智能手机",
      description: "最新款智能手机，配备高清摄像头和超长续航",
      price: 4999,
      stock: 100,
      category: "电子产品"
    });
    console.log("创建的产品:", newProduct);

    // 2. 获取产品列表
    console.log("\n2. 获取产品列表");
    const productList = await apiService.getProducts(1, 10);
    console.log(`共找到 ${productList.total} 个产品:`);
    productList.products.forEach(product => {
      console.log(`- ID: ${product.id}, 名称: ${product.name}, 价格: ${product.price}元`);
    });

    // 3. 获取单个产品
    if (newProduct.id) {
      console.log(`\n3. 获取产品 (ID: ${newProduct.id})`);
      const product = await apiService.getProductById(newProduct.id);
      console.log("产品详情:", product);

      // 4. 更新产品
      console.log(`\n4. 更新产品 (ID: ${newProduct.id})`);
      const updatedProduct = await apiService.updateProduct(newProduct.id, {
        price: 4799,
        stock: 95
      });
      console.log("更新后的产品:", updatedProduct);

      // 5. 删除产品
      console.log(`\n5. 删除产品 (ID: ${newProduct.id})`);
      await apiService.deleteProduct(newProduct.id);
      console.log("产品已删除");
    }

    // 6. 按分类筛选产品
    console.log("\n6. 按分类筛选产品");
    const electronicProducts = await apiService.getProducts(1, 10, "电子产品");
    console.log(`共找到 ${electronicProducts.total} 个电子产品`);
  } catch (error) {
    console.error("产品操作发生错误:", error);
  }
}

// 如果直接运行此文件，执行演示
if (import.meta.main) {
  try {
    await runApiServiceDemo();
  } catch (error) {
    console.error("Demo运行出错:", error);
  }
} 