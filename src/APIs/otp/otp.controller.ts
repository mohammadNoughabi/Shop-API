// import types
import type { Request, Response } from 'express';

// import service
import otpService from './otp.service.ts';

class OtpController {
  async generate(req: Request, res: Response) {
    try {
      const email: string = req.body.email;
      if (!email || !email.trim()) {
        return res
          .status(400)
          .json({ success: false, message: 'Email is required' });
      }

      const otpData = await otpService.generateOtp(email);
      req.session.otp = otpData.code;

      return res.status(201).json({
        success: true,
        message: 'OTP generated successfully',
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async send(req: Request, res: Response) {
    try {
      const email: string = req.body.email;
      if (!email || !email.trim()) {
        return res
          .status(400)
          .json({ success: false, message: 'Email is required' });
      }
      // Call the service to send OTP
      const result = await otpService.sendOtp(email);
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { result },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const otp: string = req.body.otp;
      const email: string = req.body.email;
      const cachedOtp = req.session.otp;

      if (!otp || !email) {
        return res.status(400).json({
          success: false,
          message: 'OTP and email are required',
        });
      }

      if (otp !== cachedOtp) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid or expired OTP' });
      }

      const isVerified = await otpService.verifyOtp(email, otp);
      if (!isVerified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new OtpController();
