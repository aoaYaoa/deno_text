# HTTP客户端和API服务使用文档

## 目录

1. [简介](#简介)
2. [HTTP客户端](#http客户端)
   - [基本用法](#基本用法)
   - [请求配置](#请求配置)
   - [拦截器](#拦截器)
   - [错误处理](#错误处理)
3. [API服务](#api服务)
   - [服务配置](#服务配置)
   - [令牌存储](#令牌存储)
   - [用户API](#用户api)
   - [产品API](#产品api)
4. [示例代码](#示例代码)

## 简介

本文档介绍了Deno应用程序中HTTP客户端和API服务的使用方法。HTTP客户端是基于Deno内置`fetch` API封装的类似Axios的HTTP请求库，而API服务则是基于HTTP客户端的更高级封装，提供了更方便的API调用方法。

## HTTP客户端

HTTP客户端提供了与Axios类似的接口，支持常见的HTTP方法、请求/响应拦截器、错误处理等功能。

### 基本用法

```typescript
import httpClient from "../utils/http-client.ts";

// GET请求
const users = await httpClient.get("https://api.example.com/users");

// POST请求
const newUser = await httpClient.post("https://api.example.com/users", {
  name: "张三",
  email: "zhangsan@example.com"
});

// PUT请求
const updatedUser = await httpClient.put("https://api.example.com/users/1", {
  name: "李四"
});

// DELETE请求
await httpClient.delete("https://api.example.com/users/1");
```

### 请求配置

可以通过配置对象自定义请求行为：

```typescript
// 创建自定义实例
import { HttpClient } from "../utils/http-client.ts";

const client = new HttpClient({
  baseURL: "https://api.example.com",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-token"
  }
});

// 使用自定义实例发送请求
const response = await client.get("/users", {
  params: {
    page: 1,
    limit: 10,
    search: "张三"
  }
});
```

### 拦截器

可以使用拦截器在请求发送前或响应接收后执行自定义逻辑：

```typescript
// 添加请求拦截器
const requestInterceptorId = client.addRequestInterceptor({
  onFulfilled: (config) => {
    console.log("请求发送前:", config);
    // 修改配置
    return {
      ...config,
      headers: {
        ...config.headers,
        "X-Custom-Header": "CustomValue"
      }
    };
  },
  onRejected: (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
});

// 添加响应拦截器
const responseInterceptorId = client.addResponseInterceptor({
  onFulfilled: (response) => {
    console.log("响应接收后:", response);
    return response;
  },
  onRejected: (error) => {
    console.error("响应错误:", error);
    return Promise.reject(error);
  }
});

// 移除拦截器
client.removeRequestInterceptor(requestInterceptorId);
client.removeResponseInterceptor(responseInterceptorId);
```

### 错误处理

HTTP客户端会将错误包装为`HttpError`对象，包含状态码、响应数据等信息：

```typescript
import { HttpError } from "../utils/http-client.ts";

try {
  const response = await client.get("/not-exist");
} catch (error) {
  if (error instanceof HttpError) {
    console.error(`HTTP错误: ${error.message}`);
    console.error(`状态码: ${error.status}`);
    console.error("响应数据:", error.data);
  } else {
    console.error("其他错误:", error);
  }
}
```

## API服务

API服务是对HTTP客户端的进一步封装，提供了更直观的API调用方法，支持用户、产品等资源的CRUD操作。

### 服务配置

API服务在初始化时会自动从配置中读取API基础URL和超时时间：

```typescript
import apiService, { ApiService } from "../services/api.service.ts";

// 使用默认实例
const users = await apiService.getUsers();

// 创建自定义实例
const customService = new ApiService(
  "https://custom-api.example.com",
  customTokenStorage
);
```

### 令牌存储

API服务使用令牌存储接口保存认证令牌，默认使用内存存储：

```typescript
import { TokenStorage } from "../services/api.service.ts";

// 自定义令牌存储
class CustomTokenStorage implements TokenStorage {
  getToken(): string | null {
    return Deno.env.get("API_TOKEN") || null;
  }

  setToken(token: string): void {
    // 在实际应用中，可能需要将token持久化
    console.log("Token set:", token);
  }

  removeToken(): void {
    console.log("Token removed");
  }
}

// 使用自定义令牌存储
const apiService = new ApiService(
  "https://api.example.com",
  new CustomTokenStorage()
);
```

### 用户API

用户相关API方法：

```typescript
// 获取用户列表
const { users, total } = await apiService.getUsers(1, 10, "搜索关键词");

// 获取单个用户
const user = await apiService.getUserById(1);

// 创建用户
const newUser = await apiService.createUser({
  name: "张三",
  email: "zhangsan@example.com"
});

// 更新用户
const updatedUser = await apiService.updateUser(1, {
  name: "李四"
});

// 删除用户
await apiService.deleteUser(1);

// 用户认证
const { token, user } = await apiService.login("user@example.com", "password");
await apiService.logout();
```

### 产品API

产品相关API方法：

```typescript
// 获取产品列表
const { products, total } = await apiService.getProducts(1, 10, "电子产品");

// 获取单个产品
const product = await apiService.getProductById(1);

// 创建产品
const newProduct = await apiService.createProduct({
  name: "智能手机",
  description: "最新款智能手机",
  price: 4999,
  stock: 100,
  category: "电子产品"
});

// 更新产品
const updatedProduct = await apiService.updateProduct(1, {
  price: 4799,
  stock: 95
});

// 删除产品
await apiService.deleteProduct(1);
```

## 示例代码

可以通过运行以下命令查看HTTP客户端和API服务的示例：

```bash
# 运行HTTP客户端示例
deno task http-client

# 运行API服务示例
deno task api-service
```

示例代码位于以下文件：

- `src/examples/http-client-example.ts`: HTTP客户端示例
- `src/examples/api-service-example.ts`: API服务示例 