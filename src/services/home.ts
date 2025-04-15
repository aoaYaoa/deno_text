import { BaseService } from "./base.ts";

interface SearchParams {
  searchInfo: string;
  pageNumber: number;
  pageSize: number;
}

interface Food {
  _id: string;
  imgUrl: string;
  [key: string]: any;
}

export class HomeService extends BaseService {
  async search({ searchInfo, pageNumber, pageSize }: SearchParams) {
    try {
      await this.mongoDBService.connect();
      
      // 构建查询条件
      const query = searchInfo ? {
        $or: [
          { title: { $regex: searchInfo, $options: 'i' } },
          { content: { $regex: searchInfo, $options: 'i' } }
        ]
      } : {};

      // 计算分页
      const skip = (pageNumber - 1) * pageSize;

      // 并行查询
      const [information, foods] = await Promise.all([
        // 只查询一条 information
        this.mongoDBService.find("information", query, { limit: 1 }),
        // foods 分页查询
        this.mongoDBService.find("foods", query, { skip, limit: pageSize })
      ]) as [any[], Food[]];

      return {
        success: true,
        data: {
          information: information && information.length > 0 ? information[0] : null,
          items: foods || [],
          pageNumber,
          pageSize
        }
      };
    } catch (error) {
      console.error("[HomeService] 搜索错误:", error);
      return {
        success: false,
        message: "搜索失败"
      };
    } finally {
      await this.mongoDBService.close();
    }
  }
}
