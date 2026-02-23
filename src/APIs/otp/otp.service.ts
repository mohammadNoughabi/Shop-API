// import models
import client from '../../helpers/redis.client.ts';

// import types
import type {
  GenerateOtpResult,
  SendOtpResult,
  VerifyOtpResult,
} from './otp.interface.ts';

// import utils
import generateRandomCode from '../../utils/generateRandomCode.ts';
import sendEmail from '../../helpers/mail.ts';

const OTP_TTL_SECONDS = 3 * 60; // 180s = 3 minutes
const OTP_KEY_PREFIX = 'otp:';

class OtpService {
  private getKey(email: string): string {
    return `${OTP_KEY_PREFIX}${email.toLowerCase().trim()}`;
  }

  async generateOtp(email: string): Promise<GenerateOtpResult> {
    const code = generateRandomCode(6);
    if (!code || code.length !== 6) {
      return {
        success: false,
        message: 'Failed to generate OTP code',
        statusCode: 500,
      };
    }
    const key = this.getKey(email);
    // SET with expiration (overwrites if exists → new OTP request invalidates old one)
    await client.set(key, code, { EX: OTP_TTL_SECONDS });

    return {
      success: true,
      message: 'OTP generated',
      statusCode: 201,
      data: { code },
    };
  }

  async sendOtp(email: string): Promise<SendOtpResult> {
    const key = this.getKey(email);
    const code = await client.get(key);
    if (!code) {
      return {
        success: false,
        message:
          'No valid OTP found for this email (expired or never generated)',
        statusCode: 404,
      };
    }

    const subject = 'Your Verification Code';
    const html = `
      <div>
        <h1>Verification Code</h1>
        <p>Your OTP is: <strong>${code}</strong></p>
        <p>It expires in 3 minutes.</p>
      </div>
    `;

    const mailResult = await sendEmail(email, subject, html);
    if (!mailResult.success) {
      return {
        success: false,
        message: 'Failed to send OTP email',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully',
      statusCode: 200,
      data: { email, code },
    };
  }

  async verifyOtp({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<VerifyOtpResult> {
    const key = this.getKey(email);
    const storedCode = await client.get(key);

    if (!storedCode) {
      return {
        success: false,
        message: 'OTP expired or does not exist',
        statusCode: 400,
      };
    }

    if (storedCode !== code) {
      return {
        success: false,
        message: 'Invalid OTP',
        statusCode: 400,
      };
    }

    // Success → delete to prevent reuse
    await client.del(key);

    return {
      success: true,
      message: 'OTP verified successfully',
      statusCode: 200,
      data: { email, code },
    };
  }
}

export default new OtpService();
