import { BaseService } from "./base.ts";


interface CartItem {
  foodId: string;
  foodName: string;
  number: number;
  price: number;
  addedAt?: Date;
}

interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

interface CartParams {
  userId: string;
  foodId: string;
  foodName: string;
  number: number;
  price: number;
}

export class CartService extends BaseService {
  private collectionName = "carts";
//创建/更新购物车 userId 在header中

async createOrUpdateCart({userId, foodId, foodName, number, price}: CartParams) {
  await this.mongoDBService.connect();
  try {
    //根据userId查询购物车
    const carts = await this.mongoDBService.find(this.collectionName, { userId });
    const cart = carts.length > 0 ? carts[0] as Cart : null;
    
    if (cart) {
      //如果购物车存在，则更新购物车
      const newItem = { 
        foodId, 
        foodName, 
        number, 
        price, 
        addedAt: new Date() 
      };
      
      // 检查是否已存在相同的商品
      const existingItemIndex = cart.items.findIndex(item => item.foodId === foodId);
      
      let updateQuery;
      if (existingItemIndex >= 0) {
        // 已存在，更新数量
        updateQuery = {
          $set: {
            [`items.${existingItemIndex}.number`]: number,
            [`items.${existingItemIndex}.price`]: price,
            updatedAt: new Date()
          }
        };
      } else {
        // 不存在，添加新商品
        updateQuery = {
          $push: { items: newItem },
          $set: { updatedAt: new Date() }
        };
      }
      
      // 更新数据库中的购物车
      await this.mongoDBService.updateOne(this.collectionName, { userId }, updateQuery);
      
    } else {
      //如果购物车不存在，则创建购物车
      const newCart: Cart = {
        userId,
        items: [{ foodId, foodName, number, price, addedAt: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await this.mongoDBService.insertOne(this.collectionName, newCart);
    }
    
    // 返回更新后的购物车
    const updatedCarts = await this.mongoDBService.find(this.collectionName, { userId });
    return updatedCarts.length > 0 ? updatedCarts[0] : null;
    
  } finally {
    await this.mongoDBService.close();
  }

 
}
//获取购物车列表
async getCartList(userId: string) {
  await this.mongoDBService.connect();
  const carts = await this.mongoDBService.find(this.collectionName, { userId });
  return carts.length > 0 ? carts[0] : null;
}
} 