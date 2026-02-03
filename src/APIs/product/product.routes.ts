import express from "express";

// import middelwares
import upload from "../../middlewares/upload.ts";
import authenticateToken from "../../middlewares/authenticateToken.ts";
import authorizeRole from "../../middlewares/authorizeRole.ts";

import productController from "./product.controller.ts";

const productRouter = express.Router();

productRouter.get("/", productController.getAll);
productRouter.get("/:id", productController.getById);
productRouter.post(
  "/",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery" }]),
  productController.create,
);
productRouter.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  productController.update,
);
productRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  productController.delete,
);

export default productRouter;
