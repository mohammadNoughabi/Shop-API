import express from "express";

import orderController from "./order.controller.ts";

const orderRouter = express.Router();

orderRouter.get("/", orderController.getAll);
orderRouter.get("/get-by-tracking-number", orderController.getByTrackingNumber);
orderRouter.get("/get-by-status" , orderController.getByStatus)
orderRouter.post("/", orderController.create);
orderRouter.put("/:id", orderController.update);
orderRouter.put("/update-status/:id" , orderController.updateStatus)
orderRouter.delete("/:id", orderController.delete);

export default orderRouter;
