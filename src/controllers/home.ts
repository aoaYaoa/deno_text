import { Context } from "oak";
import { HomeService } from "../services/home.ts";

export class HomeController {
    private homeService = new HomeService();
    async search(ctx: Context) {
        const { searchInfo, pageNumber, pageSize } = await ctx.request.body().value;
        const result = await this.homeService.search({searchInfo, pageNumber, pageSize});
        ctx.response.body = result;
    }
}