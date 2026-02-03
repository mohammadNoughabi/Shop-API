import express from "express";

import authController from "./auth.controller.ts";

const authRouter = express.Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-pass", authController.forgotPassword);
authRouter.post("/reset-pass", authController.resetPassword);

export default authRouter;
