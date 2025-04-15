//获取pexels外部food图片资源 100条
import { MongoDBService } from "../services/mongodb.service.ts";

const pexelsApiKey = '8s9hewFDf1glzLQkgqTrlciTJRvrJWLL5m04yPj0lgwYrJdawaM7Wb5x';

interface Food {
  _id: string;
  imgUrl: string;
  [key: string]: any;
}

export const getImages = async () => {
  const url = `https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=100&page=1`;
  const response = await fetch(url, { headers: { Authorization: pexelsApiKey } });
  const data = await response.json();
  
  //获取到的数据存到数据库
  const images = data.photos;
  const mongoDBService = new MongoDBService();
  
  try {
    await mongoDBService.connect();
    
    // 更新 foods 集合中的所有文档的 imgUrl
    const foods = await mongoDBService.find("foods", {}) as Food[];
    const updatePromises = foods.map((food, index) => {
      const image = images[index % images.length];
      return mongoDBService.updateOne(
        "foods",
        { _id: food._id },
        { $set: { imgUrl: image.src.medium } }
      );
    });
    
    await Promise.all(updatePromises);
    console.log("[GetImages] 图片数据已更新");
  } catch (error) {
    console.error("[GetImages] 错误:", error);
  } finally {
    await mongoDBService.close();
  }
};