import express from "express";

import userController from "./user.controller.ts";

const userRouter = express.Router();

userRouter.get("/profile", userController.getProfile);
userRouter.post("/verify-email", userController.verifyEmail);
userRouter.post("/delete-account", userController.deleteAccount);

export default userRouter;
