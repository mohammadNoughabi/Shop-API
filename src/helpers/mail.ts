import nodemailer from 'nodemailer';
import logger from './logger.ts';

interface SendEmailInput {
  reciever: string;
  subject: string;
  htmlContent: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  reciever: string;
  timestamp: string;
}

import { getErrorMessage } from '../utils/getErrorMessage.ts';

const sendEmail = async (input: SendEmailInput): Promise<SendEmailResponse> => {
  const { reciever, subject, htmlContent } = input;
  try {
    // Validate input
    if (!reciever || !subject || !htmlContent) {
      throw new Error('reciever, subject and htmlContent are required');
    }

    // Validate Email User and Pass from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error('Email credentials are not set');
    }

    // Create transporter with improved configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    await transporter.verify();

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Shop App',
        address: emailUser,
      },
      to: reciever,
      subject: subject,
      html: htmlContent,
      // Optional text version for non-HTML clients
      text: htmlContent.replace(/<[^>]*>/g, ''),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully to', reciever);
    return {
      success: true,
      messageId: info.messageId,
      reciever,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    logger.error('Email send error:', error);

    return {
      success: false,
      error: getErrorMessage(error),
      reciever,
      timestamp: new Date().toISOString(),
    };
  }
};

export default sendEmail;
