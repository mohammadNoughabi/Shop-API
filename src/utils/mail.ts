import nodemailer from "nodemailer";

const sendEmail = async (
  receiver: string,
  subject: string,
  htmlContent: string,
): Promise<any> => {
  try {
    // Validate input
    if (!receiver || !subject || !htmlContent) {
      throw new Error("Receiver, subject and htmlContent are required");
    }

    // Validate Email User and Pass from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      throw new Error("Email credentials are not set");
    }

    // Create transporter with improved configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
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
        name: "Shop App",
        address: emailUser,
      },
      to: receiver,
      subject: subject,
      html: htmlContent,
      // Optional text version for non-HTML clients
      text: htmlContent.replace(/<[^>]*>/g, ""),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to", receiver);
    return {
      success: true,
      messageId: info.messageId,
      receiver,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error.message,
      receiver,
      timestamp: new Date().toISOString(),
    };
  }
};

export default sendEmail;
