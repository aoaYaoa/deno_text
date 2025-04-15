import { Router } from "oak";
import { CartController } from "../controllers/cart.ts";
const router = new Router();
const cartController = new CartController();
router.post("/api/cart/add",cartController.createCart.bind(cartController));
router.get("/api/cart/list",cartController.getCartList.bind(cartController));
export default router;