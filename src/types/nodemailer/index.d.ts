import 'nodemailer';

declare module 'nodemailer' {
  export interface SendEmailResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    reciever: string;
    timestamp: string;
  }
}
