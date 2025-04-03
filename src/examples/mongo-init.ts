// MongoDB初始化脚本
// 用于设置数据库和填充示例数据

import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";
import mongoose from "mongoose";
import { colors } from "cliffy/ansi/colors.ts";
import { Confirm } from "cliffy/prompt/mod.ts";

const logger = new Logger({ prefix: "MongoDB初始化" });
const mongoService = new MongoDBService();

// 用户模型模式
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ["admin", "user", "guest"], default: "user" },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 产品模型模式
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  tags: [String],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 分类模型模式
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  level: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// 订单模型模式
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"], 
    default: "pending" 
  },
  shipping_address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  payment_method: { type: String, default: "credit_card" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 示例用户数据
const usersData = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "hashed_password_123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    active: true,
  },
  {
    username: "user1",
    email: "user1@example.com",
    password: "hashed_password_456",
    firstName: "Regular",
    lastName: "User",
    role: "user",
    active: true,
  },
  {
    username: "guest",
    email: "guest@example.com",
    password: "hashed_password_789",
    firstName: "Guest",
    lastName: "User",
    role: "guest",
    active: true,
  },
  {
    username: "inactive",
    email: "inactive@example.com",
    password: "hashed_password_101",
    firstName: "Inactive",
    lastName: "User",
    role: "user",
    active: false,
  },
];

// 示例分类数据
const categoriesData = [
  {
    name: "电子产品",
    description: "所有电子设备和配件",
    level: 1,
    active: true,
  },
  {
    name: "服装",
    description: "服装和配饰",
    level: 1,
    active: true,
  },
  {
    name: "书籍",
    description: "各类图书",
    level: 1,
    active: true,
  },
  {
    name: "手机",
    description: "智能手机和传统手机",
    level: 2,
    active: true,
  },
  {
    name: "电脑",
    description: "笔记本和台式机",
    level: 2,
    active: true,
  },
];

// 主函数
async function main() {
  try {
    // 连接到MongoDB
    await mongoService.connect();
    logger.info("MongoDB连接成功");
    
    // 注册模型
    const UserModel = mongoService.getModel("users", userSchema);
    const ProductModel = mongoService.getModel("products", productSchema);
    const CategoryModel = mongoService.getModel("categories", categorySchema);
    const OrderModel = mongoService.getModel("orders", orderSchema);
    
    logger.info("模型注册成功");
    
    // 确认是否初始化数据
    const shouldContinue = await Confirm.prompt({
      message: colors.yellow("这将删除现有数据并重新填充，确定要继续吗?"),
      default: false,
    });
    
    if (!shouldContinue) {
      logger.info("操作已取消");
      await mongoService.close();
      return;
    }
    
    // 清空集合
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await OrderModel.deleteMany({});
    
    logger.info("集合已清空");
    
    // 插入分类数据
    const categories = await CategoryModel.insertMany(categoriesData);
    logger.info(`已插入 ${categories.length} 个分类`);
    
    // 更新子分类的父分类ID
    const electronicsCategory = categories.find(c => (c as any).name === "电子产品");
    if (electronicsCategory) {
      const phoneCategory = categories.find(c => (c as any).name === "手机");
      const computerCategory = categories.find(c => (c as any).name === "电脑");
      
      if (phoneCategory) {
        await CategoryModel.updateOne(
          { _id: phoneCategory._id },
          { parent_id: electronicsCategory._id }
        );
      }
      
      if (computerCategory) {
        await CategoryModel.updateOne(
          { _id: computerCategory._id },
          { parent_id: electronicsCategory._id }
        );
      }
      
      logger.info("已更新子分类的父分类ID");
    }
    
    // 插入产品数据
    const phoneCategoryId = categories.find(c => (c as any).name === "手机")?._id;
    const computerCategoryId = categories.find(c => (c as any).name === "电脑")?._id;
    const clothingCategoryId = categories.find(c => (c as any).name === "服装")?._id;
    const bookCategoryId = categories.find(c => (c as any).name === "书籍")?._id;
    
    const productsData = [
      {
        name: "iPhone 15",
        description: "苹果最新款iPhone",
        price: 7999,
        stock: 100,
        category_id: phoneCategoryId,
        tags: ["苹果", "手机", "高端"],
        active: true,
      },
      {
        name: "Samsung Galaxy S23",
        description: "三星旗舰手机",
        price: 6999,
        stock: 85,
        category_id: phoneCategoryId,
        tags: ["三星", "手机", "高端"],
        active: true,
      },
      {
        name: "MacBook Pro 16",
        description: "苹果专业笔记本电脑",
        price: 18999,
        stock: 30,
        category_id: computerCategoryId,
        tags: ["苹果", "笔记本", "专业"],
        active: true,
      },
      {
        name: "男士T恤",
        description: "纯棉休闲T恤",
        price: 129,
        stock: 200,
        category_id: clothingCategoryId,
        tags: ["男装", "T恤", "休闲"],
        active: true,
      },
      {
        name: "JavaScript高级程序设计",
        description: "前端开发必读书籍",
        price: 119,
        stock: 50,
        category_id: bookCategoryId,
        tags: ["编程", "JavaScript", "前端"],
        active: true,
      },
      {
        name: "老款手机",
        description: "已停产的旧款手机",
        price: 999,
        stock: 5,
        category_id: phoneCategoryId,
        tags: ["手机", "低端"],
        active: false,
      },
    ];
    
    const products = await ProductModel.insertMany(productsData);
    logger.info(`已插入 ${products.length} 个产品`);
    
    // 插入用户数据
    const users = await UserModel.insertMany(usersData);
    logger.info(`已插入 ${users.length} 个用户`);
    
    // 插入订单数据
    const regularUserId = users.find(u => (u as any).username === "user1")?._id;
    
    if (regularUserId) {
      const iphone = products.find(p => (p as any).name === "iPhone 15");
      const tshirt = products.find(p => (p as any).name === "男士T恤");
      const book = products.find(p => (p as any).name === "JavaScript高级程序设计");
      
      const ordersData = [
        {
          user_id: regularUserId,
          items: [
            {
              product_id: iphone?._id,
              name: (iphone as any)?.name || "",
              price: (iphone as any)?.price || 0,
              quantity: 1,
            },
            {
              product_id: tshirt?._id,
              name: (tshirt as any)?.name || "",
              price: (tshirt as any)?.price || 0,
              quantity: 2,
            },
          ],
          total: ((iphone as any)?.price || 0) + ((tshirt as any)?.price || 0) * 2,
          status: "delivered",
          shipping_address: {
            street: "123 Main St",
            city: "Beijing",
            state: "Beijing",
            zipCode: "100000",
            country: "China",
          },
          payment_method: "alipay",
        },
        {
          user_id: regularUserId,
          items: [
            {
              product_id: book?._id,
              name: (book as any)?.name || "",
              price: (book as any)?.price || 0,
              quantity: 1,
            },
          ],
          total: (book as any)?.price || 0,
          status: "processing",
          shipping_address: {
            street: "123 Main St",
            city: "Beijing",
            state: "Beijing",
            zipCode: "100000",
            country: "China",
          },
          payment_method: "wechat_pay",
        },
      ];
      
      const orders = await OrderModel.insertMany(ordersData);
      logger.info(`已插入 ${orders.length} 个订单`);
    }
    
    logger.info(colors.green("MongoDB初始化成功!"));
    
  } catch (error) {
    logger.error("MongoDB初始化失败:", error);
  } finally {
    // 关闭数据库连接
    await mongoService.close();
  }
}

// 运行主函数
if (import.meta.main) {
  main().catch(error => {
    logger.error("程序出错:", error);
    Deno.exit(1);
  });
} 