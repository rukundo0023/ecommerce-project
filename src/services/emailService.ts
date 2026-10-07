
import transporter from "../config/email";
import { renderOrderConfirmationEmail } from "../templates/emailTemplates";
import { welcomeEmailTemplate } from "../templates/welcomeEmail";

export const sendWelcomeEmail = async (email: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Welcome to Our E-commerce Platform",
    html: welcomeEmailTemplate(email),
  });
};

export const sendOrderConfirmationEmail = async (
  details: Parameters<typeof renderOrderConfirmationEmail>[0]
) => {
  const email = renderOrderConfirmationEmail(details);

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: details.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};
