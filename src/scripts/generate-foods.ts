import { MongoDBService } from "../services/mongodb.service.ts";

// 定义食物类型
type FoodType = "featured" | "trending" | "regular";

// 定义配料接口
interface Topping {
  name: string;
  selected: boolean;
}

// 定义食物接口
interface Food {
  foodName: string;
  imgUrl: string;
  type: FoodType;
  price: string;
  toppings: Topping[];
}

// 生成随机食物数据
function generateFoods(count: number): Food[] {
  const types: FoodType[] = ["featured", "trending", "regular"];
  const toppings: Topping[] = [
    { name: "rice", selected: false },
    { name: "sausage", selected: true },
    { name: "cheese", selected: false },
    { name: "vegetables", selected: true }
  ];

  return Array.from({ length: count }, (_, i) => ({
    foodName: `Food ${i + 1}`,
    imgUrl: `https://source.unsplash.com/random/300x200?food&sig=${i}`,
    type: types[Math.floor(Math.random() * types.length)],
    price: (Math.random() * 50 + 10).toFixed(2),
    toppings: toppings.slice(0, Math.floor(Math.random() * toppings.length) + 1)
  }));
}

async function main() {
  let mongoDBService: MongoDBService | null = null;
  try {
    mongoDBService = new MongoDBService();
    await mongoDBService.connect();

    // 生成100条食物数据
    const foods = generateFoods(100);
    console.log(`[FoodGenerator] 生成 ${foods.length} 条食物数据`);

    // 插入数据到数据库
    const result = await mongoDBService.insertMany("foods", foods as unknown as Record<string, unknown>[]);
    console.log(`[FoodGenerator] 成功插入 ${result.count} 条数据`);

  } catch (error) {
    console.error("[FoodGenerator] 错误:", error);
  } finally {
    if (mongoDBService) {
      await mongoDBService.close();
    }
  }
}

// 运行脚本
main(); 