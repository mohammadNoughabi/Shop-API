// otp.controller.ts
import otpService from './otp.service.ts';

import type { Request, Response } from 'express';

class OtpController {
  async generate(req: Request, res: Response): Promise<Response> {
    const email = req.body.email as string;
    const result = await otpService.generateOtp(email);
    if (!result.success) {
      return res.status(500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async send(req: Request, res: Response): Promise<Response> {
    const email = req.body.email as string;
    const result = await otpService.sendOtp(email);

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async verify(req: Request, res: Response): Promise<Response> {
    const email = req.body.email as string;
    const code = req.body.code as string;
    const result = await otpService.verifyOtp({ email, code });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new OtpController();
