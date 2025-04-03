// 产品相关的 JSON Schema 定义
import { JSONSchemaTypes, JSONSchemaRules } from "../utils/json-schema.ts";

// 定义产品分类的枚举值
const PRODUCT_CATEGORIES = [
  "电子产品",
  "服装",
  "家居",
  "食品",
  "书籍",
  "玩具",
  "美妆",
  "其他"
];

/**
 * 创建产品的 JSON Schema
 */
export const createProductSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 2,
      maxLength: 100,
      description: "产品名称，2-100个字符"
    },
    description: {
      type: "string",
      maxLength: 1000,
      description: "产品描述，最多1000个字符"
    },
    price: {
      type: "number",
      minimum: 0.01,
      description: "产品价格，必须大于0"
    },
    stock: {
      type: "integer",
      minimum: 0,
      default: 0,
      description: "库存数量，默认为0"
    },
    category: {
      type: "string",
      enum: PRODUCT_CATEGORIES,
      description: "产品分类，必须是预定义的分类之一"
    },
    isActive: {
      type: "boolean",
      default: true,
      description: "产品是否上架，默认为true"
    },
    tags: {
      type: "array",
      items: {
        type: "string",
        maxLength: 20
      },
      uniqueItems: true,
      maxItems: 10,
      description: "产品标签，最多10个，每个最多20个字符"
    },
    attributes: {
      type: "object",
      additionalProperties: {
        type: "string"
      },
      maxProperties: 20,
      description: "产品属性，键值对格式，最多20个属性"
    },
    images: {
      type: "array",
      items: {
        type: "string",
        format: "uri"
      },
      maxItems: 10,
      description: "产品图片URL列表，最多10个，必须是有效的URL"
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "创建时间，ISO格式的日期时间字符串"
    }
  },
  required: ["name", "price", "category"],
  additionalProperties: false
};

/**
 * 更新产品的 JSON Schema
 * 与创建产品的Schema相似，但所有字段都是可选的
 */
export const updateProductSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 2,
      maxLength: 100
    },
    description: {
      type: "string",
      maxLength: 1000
    },
    price: {
      type: "number",
      minimum: 0.01
    },
    stock: {
      type: "integer",
      minimum: 0
    },
    category: {
      type: "string",
      enum: PRODUCT_CATEGORIES
    },
    isActive: {
      type: "boolean"
    },
    tags: {
      type: "array",
      items: {
        type: "string",
        maxLength: 20
      },
      uniqueItems: true,
      maxItems: 10
    },
    attributes: {
      type: "object",
      additionalProperties: {
        type: "string"
      },
      maxProperties: 20
    },
    images: {
      type: "array",
      items: {
        type: "string",
        format: "uri"
      },
      maxItems: 10
    }
  },
  minProperties: 1,
  additionalProperties: false
};

/**
 * 产品查询参数的 JSON Schema
 */
export const productQuerySchema = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
      description: "页码，从1开始"
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 10,
      description: "每页数量，1-100"
    },
    sort: {
      type: "string",
      enum: ["name", "price", "createdAt"],
      default: "createdAt",
      description: "排序字段"
    },
    order: {
      type: "string",
      enum: ["asc", "desc"],
      default: "desc",
      description: "排序方向"
    },
    category: {
      type: "string",
      enum: PRODUCT_CATEGORIES,
      description: "按分类筛选"
    },
    minPrice: {
      type: "number",
      minimum: 0,
      description: "最低价格"
    },
    maxPrice: {
      type: "number",
      minimum: 0,
      description: "最高价格"
    },
    search: {
      type: "string",
      description: "搜索关键词"
    },
    isActive: {
      type: "boolean",
      description: "是否只显示已上架产品"
    }
  },
  additionalProperties: false
}; 