// import models
import Otp from './otp.model';

// import types
import type { IOtp } from './otp.interface';

// import utils
import generateRandomCode from '../../utils/generateRandomCode';
import sendEmail from '../../utils/mail';

class OtpService {
  async generateOtp(email: string): Promise<Partial<IOtp>> {
    const code = generateRandomCode();
    const otp = await Otp.create({
      email,
      code,
      createdAt: new Date(),
      expiredAt: new Date(Date.now() + 3 * 60 * 1000), // expires in 3 minutes
    });
    return otp;
  }

  async sendOtp(email: string) {
    const otpRecord = await Otp.findOne({ email, isExpired: false }).sort({
      createdAt: -1,
    });
    if (!otpRecord) {
      throw new Error('No valid OTP found for this email');
    }
    if (otpRecord.expiredAt < new Date()) {
      otpRecord.isExpired = true;
      await otpRecord.save();
    }
    const subject = 'Your OTP Code';
    const htmlContent = `<div>
                            <h1>Verification code </h1>
                            <p>Your OTP code is: ${otpRecord.code} It will expire soon.</p>
                         </div>`;
    const result = await sendEmail(email, subject, htmlContent);
    return result;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await Otp.findOne({ email, code: otp, isExpired: false });
    if (!otpRecord) {
      return false;
    }
    return true;
  }
}

export default new OtpService();
