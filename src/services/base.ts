// 基础服务类
import { MongoDBService } from "./mongodb.service.ts";

export class BaseService {
    protected mongoDBService: MongoDBService;
    constructor() {
        this.mongoDBService = new MongoDBService();
    }
}


