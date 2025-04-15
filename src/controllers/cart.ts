import { Context } from "oak";
import { CartService } from "../services/cart.service.ts";

export class CartController {
    private cartService = new CartService();

    async createCart(ctx: Context) {
        const userId = ctx.request.headers.get("userid") || "guest";
        const { foodId, foodName, number, price } = await ctx.request.body().value;
        const cart = await this.cartService.createOrUpdateCart({ userId, foodId, foodName, number, price });
        ctx.response.body = { success: true, data: cart };
    }
    async getCartList(ctx: Context) {
        const userId = ctx.request.headers.get("userid") || "guest";
        const cart = await this.cartService.getCartList(userId);
        ctx.response.body = { success: true, data: cart };
    }
}
