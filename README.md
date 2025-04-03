# Deno MongoDB 集成

这个项目演示了如何在Deno应用中集成和使用MongoDB数据库。

## 功能

- 基于Mongoose的MongoDB服务，提供完整的CRUD操作
- 支持聚合查询和高级过滤
- 交互式MongoDB数据查看器
- 数据导出为CSV功能
- 多环境配置支持(开发、测试、生产)
- 完整的测试覆盖

## 安装

确保已安装Deno运行时环境和MongoDB服务器。

```bash
# 克隆仓库
git clone <仓库地址>
cd <项目目录>

# 设置环境变量或创建.env文件
# 示例见.env.example
```

## 使用方法

### 启动应用

```bash
# 开发环境
deno task start:dev

# 测试环境
deno task start:test

# 生产环境
deno task start:prod
```

### 初始化MongoDB数据

```bash
deno task mongo:init
```

这将创建示例用户、产品、分类和订单数据。

### 使用交互式查看器

```bash
deno task mongo:view
```

交互式查看器提供以下功能：
- 查看各个集合的数据
- 分页浏览大量数据
- 应用筛选条件查询
- 执行聚合查询
- 导出数据为CSV格式

### 运行测试

```bash
# 运行所有测试
deno task test

# 只运行MongoDB测试
deno task test:mongodb
```

## 目录结构

```
├── src/
│   ├── services/
│   │   └── mongodb.service.ts  # MongoDB服务类
│   ├── utils/
│   │   └── database.ts         # 数据库连接桥接
│   │   └── logger.ts           # 日志工具
│   ├── examples/
│   │   └── mongodb-interactive-viewer.ts  # 交互式查看器
│   │   └── mongo-init.ts       # 数据库初始化脚本
│   ├── tests/
│   │   └── mongodb.test.ts     # MongoDB测试
│   └── config/
│       ├── development.ts      # 开发环境配置
│       ├── test.ts             # 测试环境配置
│       └── production.ts       # 生产环境配置
├── .env                        # 环境变量
└── deno.json                   # Deno配置文件
```

## 授权

MIT 