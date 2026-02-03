import mongoose from "mongoose";

import type { IOtp } from "./otp.interface.ts";

const otpSchema = new mongoose.Schema<IOtp>({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
