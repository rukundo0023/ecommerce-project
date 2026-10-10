
import { getMailjet } from "./mailjet";
import {
  renderOrderConfirmationEmail,
  renderWelcomeEmail,
} from "../templates/emailTemplates";
import { renderPasswordResetEmail } from "../templates/resetPasswordEmail";

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  const from = process.env.MJ_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "Mailjet is not configured. Set MJ_FROM_EMAIL to a verified sender address."
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
    const content = renderWelcomeEmail(email);
    await sendEmail(email, content.subject, content.html, content.text);
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
    const content = renderPasswordResetEmail(email, resetUrl);
    await sendEmail(email, content.subject, content.html, content.text);
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
