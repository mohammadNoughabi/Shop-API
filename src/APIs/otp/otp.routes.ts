import express from "express";

import otpController from "./otp.controller.ts";

const otpRouter = express.Router();

otpRouter.post("/generate", otpController.generate);
otpRouter.post("/send", otpController.send);    
otpRouter.post("/verify", otpController.verify);

export default otpRouter;
