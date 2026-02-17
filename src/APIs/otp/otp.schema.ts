import { z } from 'zod';

const emailSchema = z.string().email();

const codeSchema = z.string().length(6);

export const generateOtpSchema = z.object({
  email: emailSchema,
});

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: codeSchema,
});
