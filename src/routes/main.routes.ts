import express from "express";
import categoryRouter from "./category.routes.ts";
import productRouter from "./product.routes.ts";
import authRouter from "./auth.routes.ts";
import orderRouter from "./order.routes.ts";
import paymentRouter from "./payment.routes.ts";
import userRouter from "./user.routes.ts";
import ticketRouter from "./ticket.routes.ts";
import commentRouter from "./comment.routes.ts";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/comment", commentRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/ticket", ticketRouter);

export default router;
