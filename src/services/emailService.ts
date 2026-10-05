import nodemailer from "nodemailer";
import {
  renderOrderConfirmationEmail,
  renderWelcomeEmail,
} from "../templates/emailTemplates";

interface OrderConfirmationDetails {
  orderId: string;
  customerName: string;
  email: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const getEmailTransport = () => {
  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const port = Number(portValue);

  if (!host || !portValue || !user || !pass || !from) {
    throw new Error(
      "SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM must be configured"
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number");
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    from,
  };
};

export const sendWelcomeEmail = async (email: string): Promise<void> => {
  const { transporter, from } = getEmailTransport();
  const content = renderWelcomeEmail();

  await transporter.sendMail({
    from,
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
};

export const sendOrderConfirmationEmail = async (
  details: OrderConfirmationDetails
): Promise<void> => {
  const { transporter, from } = getEmailTransport();
  const content = renderOrderConfirmationEmail(details);

  await transporter.sendMail({
    from,
    to: details.email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
};