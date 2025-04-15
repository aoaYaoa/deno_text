import { MongoDBService } from "../services/mongodb.service.ts";

// 定义信息类型
interface Information {
  title: string;
  content: string;
  type: "announcement" | "news" | "notice";
  priority: "high" | "medium" | "low";
  status: "active" | "inactive";
  quantity: number;
  distance: number;
  location: string;
  price: number;
  rating: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 生成随机信息数据
function generateInformation(count: number): Information[] {
  const types = ["announcement", "news", "notice"] as const;
  const priorities = ["high", "medium", "low"] as const;
  const statuses = ["active", "inactive"] as const;
  const locations = ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "武汉", "南京", "西安"];
  const tags = ["热门", "新品", "限时", "特价", "推荐", "必吃", "网红", "经典", "特色", "优惠"];

  const titles = [
    "系统维护通知",
    "新功能上线",
    "重要更新",
    "用户指南",
    "常见问题解答",
    "使用说明",
    "安全提示",
    "服务条款更新",
    "隐私政策变更",
    "节日活动通知"
  ];

  const contents = [
    "系统将于本周六凌晨2点进行维护升级，预计持续2小时。",
    "我们很高兴地宣布，新版本已经上线，包含多项改进和新功能。",
    "请及时更新您的个人信息，以确保服务正常使用。",
    "查看我们的用户指南，了解如何使用新功能。",
    "如果您遇到任何问题，请查看常见问题解答。",
    "详细的使用说明已更新，请查看最新版本。",
    "为了您的账户安全，请定期更改密码。",
    "我们的服务条款已更新，请查看最新版本。",
    "隐私政策已更新，请查看最新变更。",
    "节日期间，我们将推出特别活动，敬请期待。"
  ];

  return Array.from({ length: count }, (_, i) => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
    
    // 生成随机标签（1-3个）
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      content: contents[Math.floor(Math.random() * contents.length)],
      type: types[Math.floor(Math.random() * types.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      quantity: Math.floor(Math.random() * 1000), // 0-999的随机数量
      distance: Number((Math.random() * 50).toFixed(2)), // 0-50公里的随机距离
      location: locations[Math.floor(Math.random() * locations.length)],
      price: Number((Math.random() * 1000).toFixed(2)), // 0-1000的随机价格
      rating: Number((Math.random() * 5).toFixed(1)), // 0-5的随机评分
      tags: randomTags,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000))
    };
  });
}

async function main() {
  let mongoDBService: MongoDBService | null = null;
  try {
    mongoDBService = new MongoDBService();
    await mongoDBService.connect();

    // 生成20条信息数据
    const informations = generateInformation(20);
    console.log(`[InformationGenerator] 生成 ${informations.length} 条信息数据`);

    // 插入数据到数据库
    const result = await mongoDBService.insertMany("information", informations as unknown as Record<string, unknown>[]);
    console.log(`[InformationGenerator] 成功插入 ${result.count} 条数据`);

  } catch (error) {
    console.error("[InformationGenerator] 错误:", error);
  } finally {
    if (mongoDBService) {
      await mongoDBService.close();
    }
  }
}

// 运行脚本
main(); 