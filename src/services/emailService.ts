
import { getMailjet } from "./mailjet";
import type { SendEmailV3_1 } from "node-mailjet";
import {
  renderOrderConfirmationEmail,
  renderWelcomeEmail,
} from "../templates/emailTemplates";
import { renderPasswordResetEmail } from "../templates/resetPasswordEmail";

const sendEmail = async (
  type: "welcome" | "password reset" | "order confirmation",
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  const from = process.env.MJ_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error(
      "Mailjet is not configured. Set MJ_FROM_EMAIL to a verified sender address."
    );
  }

  try {
    const { body } = await getMailjet()
      .post("send", { version: "v3.1" })
      .request<SendEmailV3_1.Response>({
        Messages: [
          {
            From: {
              Email: from,
              Name: process.env.MJ_FROM_NAME?.trim() || "Our E-commerce Platform",
            },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
            HTMLPart: html,
          },
        ],
      });

    const result = body.Messages?.[0];
    if (result?.Status !== "success") {
      const errors = result?.Errors?.map(
        ({ ErrorCode, ErrorMessage }) => `${ErrorCode}: ${ErrorMessage}`
      ).join("; ");
      throw new Error(
        errors
          ? `Mailjet rejected the ${type} email: ${errors}`
          : `Mailjet returned no successful result for the ${type} email`
      );
    }

    console.info(`Mailjet accepted ${type} email`, {
      messageUUID: result.To?.[0]?.MessageUUID,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Mailjet error";
    console.error(`Mailjet failed to send ${type} email: ${message}`);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string) => {
  const content = renderWelcomeEmail(email);
  await sendEmail(
    "welcome",
    email,
    content.subject,
    content.html,
    content.text
  );
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  const content = renderPasswordResetEmail(email, resetUrl);
  await sendEmail(
    "password reset",
    email,
    content.subject,
    content.html,
    content.text
  );
};

export const sendOrderConfirmationEmail = async (
  details: Parameters<typeof renderOrderConfirmationEmail>[0]
) => {
  const email = renderOrderConfirmationEmail(details);
  await sendEmail(
    "order confirmation",
    details.email,
    email.subject,
    email.html,
    email.text
  );
};
