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
    default: Date.now,
    required: true,
  },
  isExpired: {
    type: Boolean,
    default: false,
  },
  expiredAt: {
    type: Date,
    default: null,
  },
});

const Otp = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
