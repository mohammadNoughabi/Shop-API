import express from "express";

// import middlewares
import upload from "../../middlewares/upload.ts";
import authenticateToken from "../../middlewares/authenticateToken.ts";
import authorizeRole from "../../middlewares/authorizeRole.ts";

// import controller
import categoryController from "./category.controller.ts";

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAll);
categoryRouter.get("/:id", categoryController.getById);
categoryRouter.post(
  "/",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("thumbnail"),
  categoryController.create,
);
categoryRouter.put(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("thumbnail"),
  categoryController.update,
);
categoryRouter.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  categoryController.delete,
);

export default categoryRouter;
