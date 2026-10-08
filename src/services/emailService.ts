
import { getMailjet } from "./mailjet";
import { renderOrderConfirmationEmail } from "../templates/emailTemplates";
import { resetPasswordEmailTemplate } from "../templates/resetPasswordEmail";
import { welcomeEmailTemplate } from "../templates/welcomeEmail";

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  const from = process.env.MJ_FROM_EMAIL || process.env.SMTP_FROM;
  if (!from) {
    throw new Error(
      "Mailjet is not configured. Set MJ_FROM_EMAIL to enable email delivery."
    );
  }

  await getMailjet().post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: from,
          Name: process.env.MJ_FROM_NAME || "Our E-commerce Platform",
        },
        To: [{ Email: to }],
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
      },
    ],
  });
};

export const sendWelcomeEmail = async (email: string) => {
  try {
    await sendEmail(
      email,
      "Welcome to Our E-commerce Platform",
      welcomeEmailTemplate(email)
    );
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    await sendEmail(
      email,
      "Reset Your Password",
      resetPasswordEmailTemplate(email, resetUrl)
    );
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (
  details: Parameters<typeof renderOrderConfirmationEmail>[0]
) => {
  try {
    const email = renderOrderConfirmationEmail(details);
    await sendEmail(details.email, email.subject, email.html, email.text);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    throw error;
  }
};
