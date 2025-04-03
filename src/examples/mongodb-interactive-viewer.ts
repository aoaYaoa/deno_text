// MongoDB交互式查看器
// 这个脚本提供了一个交互式界面，用于查看和操作MongoDB数据库

import { MongoDBService } from "../services/mongodb.service.ts";
import { Logger } from "../utils/logger.ts";
import { Select, Input, Confirm } from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/colors.ts";
import mongoose from "mongoose";

// 自定义类型字符串类型，用于处理文档架构字段类型
type CustomTypeString = string;

const logger = new Logger({ prefix: "MongoDB交互式查看器" });
const mongoService = new MongoDBService();

// 支持的集合
const COLLECTIONS = ["users", "products", "categories", "orders"];

// 主函数
async function main() {
  try {
    // 连接到MongoDB
    await mongoService.connect();
    logger.info("MongoDB连接成功");
    
    let continueViewing = true;
    
    while (continueViewing) {
      const action = await mainMenu();
      
      if (action === "exit") {
        continueViewing = false;
        continue;
      }
      
      await handleAction(action);
      
      // 继续或退出
      continueViewing = await continuePrompt();
    }
    
  } catch (error) {
    logger.error("出现错误:", error);
  } finally {
    // 关闭数据库连接
    await mongoService.close();
    logger.info("MongoDB连接已关闭");
  }
}

// 主菜单
async function mainMenu(): Promise<string> {
  const result = await Select.prompt({
    message: colors.bold.cyan("请选择操作:"),
    options: [
      { name: colors.green("查看集合数据"), value: "view_collection" },
      { name: colors.yellow("执行聚合查询"), value: "aggregation" },
      { name: colors.blue("查看模式结构"), value: "view_schema" },
      { name: colors.red("退出"), value: "exit" }
    ],
  });
  
  return result;
}

// 处理用户选择的操作
async function handleAction(action: string): Promise<void> {
  switch (action) {
    case "view_collection":
      await viewCollectionData();
      break;
    case "aggregation":
      await executeAggregation();
      break;
    case "view_schema":
      await viewSchemaInfo();
      break;
    default:
      logger.warn("未知操作");
  }
}

// 查看集合数据
async function viewCollectionData(): Promise<void> {
  // 选择集合
  const collection = await Select.prompt({
    message: colors.bold.cyan("选择要查看的集合:"),
    options: COLLECTIONS.map(c => ({ name: c, value: c })),
  });
  
  // 查看选项
  const viewOption = await Select.prompt({
    message: colors.bold.cyan(`为 ${collection} 选择查看选项:`),
    options: [
      { name: "查看所有数据", value: "all" },
      { name: "分页查看", value: "paginated" },
      { name: "应用过滤器", value: "filtered" },
      { name: "导出为CSV", value: "export" }
    ],
  });
  
  switch (viewOption) {
    case "all":
      await viewAllDocuments(collection);
      break;
    case "paginated":
      await viewPaginatedDocuments(collection);
      break;
    case "filtered":
      await viewFilteredDocuments(collection);
      break;
    case "export":
      await exportToCSV(collection);
      break;
  }
}

// 查看集合的所有文档
async function viewAllDocuments(collection: string): Promise<void> {
  try {
    const limit = await Input.prompt({
      message: "显示多少条记录? (0表示不限制)",
      default: "50",
    });
    
    const limitNum = parseInt(limit);
    const options = limitNum > 0 ? { limit: limitNum } : {};
    
    const docs = await mongoService.find(collection, {}, options);
    
    // 处理ObjectId为字符串
    const formattedDocs = docs.map(doc => {
      const newDoc = { ...doc as Record<string, unknown> };
      if (newDoc._id) {
        newDoc._id = newDoc._id.toString();
      }
      return newDoc;
    });
    
    // 打印数据
    console.log(colors.bold.cyan(`\n${collection} 集合数据:`));
    formattedDocs.forEach((doc, index) => {
      console.log(colors.yellow(`\n--- 文档 ${index + 1} ---`));
      printDocument(doc);
    });
    
    logger.info(`显示了 ${formattedDocs.length} 条记录`);
  } catch (error) {
    logger.error(`查询 ${collection} 失败:`, error);
  }
}

// 分页查看集合文档
async function viewPaginatedDocuments(collection: string): Promise<void> {
  try {
    // 获取页面大小
    const pageSize = await Input.prompt({
      message: "每页显示多少行?",
      default: "10",
      validate: (input: string) => {
        const number = parseInt(input);
        if (isNaN(number) || number <= 0) {
          return "请输入一个有效的正整数";
        }
        return true;
      }
    });
    
    const page = await Input.prompt({
      message: "查看第几页?",
      default: "1",
      validate: (input: string) => {
        const number = parseInt(input);
        if (isNaN(number) || number <= 0) {
          return "请输入一个有效的正整数";
        }
        return true;
      }
    });
    
    // 获取分页数据
    const result = await mongoService.paginate(
      collection, 
      parseInt(page), 
      parseInt(pageSize)
    );
    
    // 处理ObjectId为字符串
    const formattedData = result.data.map(doc => {
      const newDoc = { ...doc as Record<string, unknown> };
      if (newDoc._id) {
        newDoc._id = newDoc._id.toString();
      }
      return newDoc;
    });
    
    // 打印数据
    console.log(colors.bold.cyan(`\n${collection} 集合数据 (第 ${page} 页):`));
    formattedData.forEach((doc, index) => {
      console.log(colors.yellow(`\n--- 文档 ${index + 1} ---`));
      printDocument(doc);
    });
    
    // 显示分页信息
    console.log(colors.cyan(`\n页码: ${result.page}/${result.pageCount}`));
    console.log(colors.cyan(`每页行数: ${result.limit}`));
    console.log(colors.cyan(`总记录数: ${result.total}`));
  } catch (error) {
    logger.error(`分页查询 ${collection} 失败:`, error);
  }
}

// 应用过滤器查看文档
async function viewFilteredDocuments(collection: string): Promise<void> {
  try {
    console.log(colors.yellow("过滤条件示例:"));
    console.log(colors.gray('{"active": true} - 查找活动状态为true的文档'));
    console.log(colors.gray('{"price": {"$gt": 100}} - 查找价格大于100的文档'));
    console.log(colors.gray('{"name": {"$regex": "^T"}} - 查找名称以T开头的文档'));
    
    const filterStr = await Input.prompt({
      message: "输入MongoDB过滤条件 (JSON格式):",
      default: "{}",
    });
    
    let filter: Record<string, unknown>;
    try {
      filter = JSON.parse(filterStr);
    } catch (e) {
      logger.error("无效的JSON格式:", e);
      return;
    }
    
    // 转换字符串ID为ObjectId
    if (filter._id && typeof filter._id === "string") {
      try {
        filter._id = new mongoose.Types.ObjectId(filter._id as string);
      } catch (e) {
        logger.warn("无效的ObjectId格式，将使用原始字符串");
      }
    }
    
    const docs = await mongoService.find(collection, filter);
    
    // 处理ObjectId为字符串
    const formattedDocs = docs.map(doc => {
      const newDoc = { ...doc as Record<string, unknown> };
      if (newDoc._id) {
        newDoc._id = newDoc._id.toString();
      }
      return newDoc;
    });
    
    // 打印数据
    console.log(colors.bold.cyan(`\n${collection} 过滤结果:`));
    formattedDocs.forEach((doc, index) => {
      console.log(colors.yellow(`\n--- 文档 ${index + 1} ---`));
      printDocument(doc);
    });
    
    logger.info(`显示了 ${formattedDocs.length} 条记录`);
  } catch (error) {
    logger.error(`过滤查询失败:`, error);
  }
}

// 导出数据为CSV
async function exportToCSV(collection: string): Promise<void> {
  try {
    const useFilter = await Confirm.prompt({ 
      message: "是否要在导出前应用过滤器?" 
    });
    
    let filter: Record<string, unknown> = {};
    
    if (useFilter) {
      const filterStr = await Input.prompt({
        message: "输入MongoDB过滤条件 (JSON格式):",
        default: "{}",
      });
      
      try {
        filter = JSON.parse(filterStr);
      } catch (e) {
        logger.error("无效的JSON格式:", e);
        return;
      }
    }
    
    const docs = await mongoService.find(collection, filter);
    
    if (docs.length === 0) {
      logger.warn("没有数据可导出");
      return;
    }
    
    // 处理ObjectId为字符串
    const formattedDocs = docs.map(doc => {
      const newDoc = { ...doc as Record<string, unknown> };
      if (newDoc._id) {
        newDoc._id = newDoc._id.toString();
      }
      return newDoc;
    });
    
    // 创建CSV内容
    const fileName = `${collection}_export_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    await saveToCSV(formattedDocs, fileName);
    
    logger.info(`已将 ${formattedDocs.length} 条记录导出到 ${fileName}`);
  } catch (error) {
    logger.error(`导出 ${collection} 失败:`, error);
  }
}

// 执行聚合查询
async function executeAggregation(): Promise<void> {
  try {
    // 选择集合
    const collection = await Select.prompt({
      message: colors.bold.cyan("选择要聚合的集合:"),
      options: COLLECTIONS.map(c => ({ name: c, value: c })),
    });
    
    console.log(colors.yellow("聚合管道示例:"));
    console.log(colors.gray('[{"$match": {"active": true}}, {"$group": {"_id": "$category_id", "count": {"$sum": 1}}}]'));
    console.log(colors.gray('[{"$match": {"price": {"$gt": 100}}}, {"$sort": {"price": -1}}]'));
    
    // 选择预定义的聚合或自定义
    const aggregationType = await Select.prompt({
      message: "选择聚合类型:",
      options: [
        { name: "预定义聚合", value: "predefined" },
        { name: "自定义聚合", value: "custom" }
      ],
    });
    
    let pipeline: unknown[] = [];
    
    if (aggregationType === "predefined") {
      const predefinedType = await Select.prompt({
        message: "选择预定义聚合:",
        options: [
          { name: "按字段分组计数", value: "group_count" },
          { name: "计算数值字段统计", value: "stats" },
          { name: "查找最大/最小值", value: "min_max" }
        ],
      });
      
      switch (predefinedType) {
        case "group_count":
          const groupField = await Input.prompt({
            message: "输入分组字段名称:",
            default: collection === "products" ? "category_id" : 
                    collection === "orders" ? "status" : "role",
          });
          
          pipeline = [
            { $group: { _id: `$${groupField}`, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ];
          break;
          
        case "stats":
          const statsField = await Input.prompt({
            message: "输入数值字段名称:",
            default: collection === "products" ? "price" : "total",
          });
          
          pipeline = [
            { 
              $group: { 
                _id: null, 
                count: { $sum: 1 },
                avg: { $avg: `$${statsField}` },
                min: { $min: `$${statsField}` },
                max: { $max: `$${statsField}` },
                sum: { $sum: `$${statsField}` }
              } 
            }
          ];
          break;
          
        case "min_max":
          const valueField = await Input.prompt({
            message: "输入要查找最值的字段名称:",
            default: collection === "products" ? "price" : "total",
          });
          
          const sortOrder = await Select.prompt({
            message: "排序方式:",
            options: [
              { name: "从高到低", value: "-1" }, // 使用字符串代替数字
              { name: "从低到高", value: "1" }
            ],
          });
          
          const limit = await Input.prompt({
            message: "显示多少条记录?",
            default: "5",
          });
          
          pipeline = [
            { $sort: { [valueField]: parseInt(sortOrder) } },
            { $limit: parseInt(limit) }
          ];
          break;
      }
    } else {
      const pipelineStr = await Input.prompt({
        message: "输入聚合管道 (JSON数组格式):",
      });
      
      try {
        pipeline = JSON.parse(pipelineStr);
        if (!Array.isArray(pipeline)) {
          throw new Error("聚合管道必须是数组");
        }
      } catch (e) {
        logger.error("无效的JSON格式:", e);
        return;
      }
    }
    
    // 执行聚合
    const result = await mongoService.aggregate(collection, pipeline);
    
    // 处理ObjectId为字符串
    const formattedResult = result.map(doc => {
      const newDoc = { ...doc as Record<string, unknown> };
      if (newDoc._id) {
        newDoc._id = typeof newDoc._id === 'object' 
          ? JSON.stringify(newDoc._id) 
          : newDoc._id.toString();
      }
      return newDoc;
    });
    
    // 打印聚合结果
    console.log(colors.bold.cyan(`\n${collection} 聚合结果:`));
    formattedResult.forEach((doc, index) => {
      console.log(colors.yellow(`\n--- 结果 ${index + 1} ---`));
      printDocument(doc);
    });
    
    logger.info(`显示了 ${formattedResult.length} 条记录`);
    
    // 提供导出选项
    const exportOption = await Confirm.prompt({ 
      message: "是否要将聚合结果导出为CSV?" 
    });
    
    if (exportOption) {
      const fileName = `${collection}_aggregate_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
      await saveToCSV(formattedResult, fileName);
      logger.info(`已将 ${formattedResult.length} 条记录导出到 ${fileName}`);
    }
  } catch (error) {
    logger.error(`执行聚合查询失败:`, error);
  }
}

// 查看模式结构
async function viewSchemaInfo(): Promise<void> {
  try {
    const collection = await Select.prompt({
      message: colors.bold.cyan("选择要查看模式的集合:"),
      options: COLLECTIONS.map(c => ({ name: c, value: c })),
    });
    
    // 获取一个文档样本
    const sampleDoc = await mongoService.find(collection, {}, { limit: 1 });
    
    if (sampleDoc.length === 0) {
      logger.warn(`集合 ${collection} 没有文档`);
      return;
    }
    
    // 分析文档结构
    const doc = sampleDoc[0] as Record<string, unknown>;
    const schema: Record<string, { type: CustomTypeString; sample: unknown }> = {};
    
    for (const [key, value] of Object.entries(doc)) {
      let type: CustomTypeString = typeof value;
      if (value === null) {
        type = "null" as CustomTypeString;
      } else if (value instanceof Date) {
        type = "date" as CustomTypeString;
      } else if (Array.isArray(value)) {
        type = "array" as CustomTypeString;
      } else if (mongoose.Types.ObjectId.isValid(String(value))) {
        type = "objectId" as CustomTypeString;
      }
      
      schema[key] = {
        type,
        sample: value instanceof mongoose.Types.ObjectId 
          ? value.toString() 
          : value
      };
    }
    
    // 打印模式结构
    console.log(colors.cyan(`\n集合 ${collection} 的模式结构:\n`));
    for (const [key, info] of Object.entries(schema)) {
      console.log(`${colors.green(key)}: ${colors.yellow(info.type)} - 样例: ${colors.gray(String(info.sample))}`);
    }
  } catch (error) {
    logger.error(`查看模式结构失败:`, error);
  }
}

// 打印文档
function printDocument(doc: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(doc)) {
    let displayValue: string;
    
    if (value === null || value === undefined) {
      displayValue = colors.gray("null");
    } else if (typeof value === "object" && !(value instanceof Date)) {
      displayValue = colors.yellow(JSON.stringify(value));
    } else if (value instanceof Date) {
      displayValue = colors.magenta(value.toISOString());
    } else if (typeof value === "boolean") {
      displayValue = value ? colors.green("true") : colors.red("false");
    } else {
      displayValue = String(value);
    }
    
    console.log(`${colors.green(key)}: ${displayValue}`);
  }
}

// 将数据保存为CSV文件
async function saveToCSV<T extends Record<string, unknown>>(
  data: T[], 
  filename: string
): Promise<string> {
  if (!data || data.length === 0) {
    throw new Error("没有数据可保存");
  }

  // 确保文件名以.csv结尾
  if (!filename.endsWith('.csv')) {
    filename += '.csv';
  }

  // 获取所有列名
  const columns = Object.keys(data[0]);

  // 创建CSV头行
  const headerRow = columns.join(',');

  // 创建数据行
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col];
      
      // 处理不同类型的值
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === "object" && !(value instanceof Date)) {
        // 引用JSON字符串并替换引号
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else if (typeof value === "string") {
        // 如果字符串包含逗号、引号或换行，需要引号括起来
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return String(value);
    }).join(',');
  });

  // 组合头行和数据行
  const csvContent = [headerRow, ...rows].join('\n');
  
  // 编码为文本
  const encoder = new TextEncoder();
  const encoded = encoder.encode(csvContent);
  
  // 写入文件
  await Deno.writeFile(filename, encoded);
  
  logger.info(`数据已保存到: ${filename}`);
  return filename;
}

// 继续提示
async function continuePrompt(): Promise<boolean> {
  return await Confirm.prompt({
    message: colors.bold.cyan("是否继续查看MongoDB数据?"),
    default: true
  });
}

// 运行主函数
if (import.meta.main) {
  main().catch(error => {
    logger.error("程序出错:", error);
    Deno.exit(1);
  });
} 