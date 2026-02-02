import express from "express";

import CategoryController from "./category.controller.ts";
import upload from "../../utils/upload.ts";


const categoryRouter = express.Router();

categoryRouter.get("/", CategoryController.getAll);
categoryRouter.get("/:id", CategoryController.getById);
categoryRouter.post("/", upload.single("thumbnail"), CategoryController.create);
categoryRouter.delete("/:id", CategoryController.delete);

export default categoryRouter;
