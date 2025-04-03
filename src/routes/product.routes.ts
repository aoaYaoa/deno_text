// 产品路由定义
import { Router } from "oak";
import { ProductController } from "../controllers/product.controller.ts";

// 创建产品控制器实例
const productController = new ProductController();

// 创建产品路由
const productRouter = new Router({ prefix: "/api/products" });

// 定义路由路径和处理器
productRouter
  // 获取所有产品 - GET /api/products
  .get(
    "/", 
    productController.getAll.bind(productController)
  )
  
  // 获取单个产品 - GET /api/products/:id
  .get(
    "/:id", 
    productController.getById.bind(productController)
  )
  
  // 创建产品 - POST /api/products
  .post(
    "/", 
    productController.create.bind(productController)
  )
  
  // 更新产品 - PUT /api/products/:id
  .put(
    "/:id", 
    productController.update.bind(productController)
  )
  
  // 删除产品 - DELETE /api/products/:id
  .delete(
    "/:id", 
    productController.delete.bind(productController)
  );

// 导出产品路由
export default productRouter; 