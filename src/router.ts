import express from "express";
import authRouter from "./APIs/authentication/auth.routes.ts";
import userRouter from "./APIs/user/user.routes.ts";
import categoryRouter from "./APIs/category/category.routes.ts"
import productRouter from "./APIs/product/product.routes.ts"
import orderRouter from "./APIs/order/order.routes.ts";
import paymentRouter from "./APIs/payment/payment.routes.ts";
import cartRouter from "./APIs/cart/cart.routes.ts";
import commentRouter from "./APIs/comment/comment.routes.ts";
import ticketRouter from "./APIs/ticket/ticket.routes.ts";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/cart", cartRouter);
router.use("/comment", commentRouter);
router.use("/ticket", ticketRouter);

export default router;
