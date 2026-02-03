import "express-session";

declare module "express-session" {
  export interface SessionData {
    otp?: string;
    email?: string;
  }
}
