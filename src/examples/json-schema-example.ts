// JSON Schema 验证示例
import { validateSchema } from "../utils/json-schema.ts";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.ts";

// 打印验证结果的函数
function printValidationResult(label: string, result: { valid: boolean; data: any; errors: any[] }) {
  console.log(`\n=== ${label} ===`);
  console.log(`验证结果: ${result.valid ? '通过 ✅' : '失败 ❌'}`);
  
  if (!result.valid) {
    console.log('验证错误:');
    result.errors.forEach((err, index) => {
      console.log(`  ${index + 1}. 字段: ${err.instancePath || err.params.missingProperty || '(root)'}`);
      console.log(`     消息: ${err.message}`);
    });
  } else {
    console.log('验证后数据:');
    console.log(result.data);
  }
}

// ==================== 示例1: 有效的产品数据 ====================
const validProduct = {
  name: "iPhone 14 Pro",
  description: "苹果最新旗舰手机",
  price: 7999,
  stock: 100,
  category: "电子产品",
  isActive: true,
  tags: ["手机", "苹果", "高端"],
  attributes: {
    color: "深空黑",
    storage: "256GB",
    screen: "6.1英寸"
  },
  images: [
    "https://example.com/iphone14-1.jpg",
    "https://example.com/iphone14-2.jpg"
  ],
  createdAt: new Date().toISOString()
};

// ==================== 示例2: 无效的产品数据(缺少必填字段和格式错误) ====================
const invalidProduct = {
  name: "a", // 太短
  description: 123, // 应该是字符串
  price: -100, // 价格不能为负数
  stock: -5, // 库存不能为负数
  // 缺少必填的category字段
  isActive: "yes", // 应该是布尔值
  tags: ["tag1", "tag1"], // 重复的标签
  images: ["not-a-valid-url"] // 不是有效的URL
};

// ==================== 示例3: 有效的产品更新数据 ====================
const validProductUpdate = {
  name: "iPhone 14 Pro Max",
  price: 8999,
  stock: 50
};

// ==================== 示例4: 无效的产品更新数据 ====================
const invalidProductUpdate = {
  name: "", // 名称太短
  price: 0, // 价格太低
  category: "不存在的分类" // 分类不在枚举列表中
};

// ==================== 示例5: 空的更新数据 ====================
const emptyUpdate = {};

// 运行验证并打印结果
function runDemo() {
  console.log("======= JSON Schema 验证示例 =======");
  
  // 验证有效的产品数据
  const validResult = validateSchema(createProductSchema, validProduct);
  printValidationResult("有效的产品数据", validResult);
  
  // 验证无效的产品数据
  const invalidResult = validateSchema(createProductSchema, invalidProduct);
  printValidationResult("无效的产品数据", invalidResult);
  
  // 验证有效的产品更新数据
  const validUpdateResult = validateSchema(updateProductSchema, validProductUpdate);
  printValidationResult("有效的产品更新数据", validUpdateResult);
  
  // 验证无效的产品更新数据
  const invalidUpdateResult = validateSchema(updateProductSchema, invalidProductUpdate);
  printValidationResult("无效的产品更新数据", invalidUpdateResult);
  
  // 验证空的更新数据 (应该失败，因为至少需要一个属性)
  const emptyUpdateResult = validateSchema(updateProductSchema, emptyUpdate);
  printValidationResult("空的更新数据", emptyUpdateResult);
}

// 如果直接运行此文件，则执行演示
if (import.meta.main) {
  runDemo();
}

// 导出供其他模块使用
export { runDemo }; 