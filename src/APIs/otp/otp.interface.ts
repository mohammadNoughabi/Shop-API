import type { Result } from '../../types/serviceResult';

export interface IOtp {
  email: string;
  code: string;
}

export type GenerateOtpResult = Result<{ code: string }>;
export type SendOtpResult = Result<{ email: string; code: string }>;
export type VerifyOtpResult = Result<{ email: string; code: string }>;
