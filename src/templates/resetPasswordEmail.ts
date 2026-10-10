import { EmailContent, escapeHtml, renderEmailLayout } from "./emailLayout";

export const renderPasswordResetEmail = (
  email: string,
  resetUrl: string
): EmailContent => {
  const safeEmail = escapeHtml(email);
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset Your Password",
    text: [
      `Hello ${email},`,
      "",
      "We received a request to reset your password.",
      `Reset your password using this link: ${resetUrl}`,
      "",
      "This link expires after 30 minutes and can only be used once.",
      "If you did not request a password reset, you can safely ignore this email.",
    ].join("\n"),
    html: renderEmailLayout(
      `<p style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Account security</p>
       <h1 style="margin:0 0 16px;color:#172033;font-size:30px;line-height:1.25;">Reset your password</h1>
       <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.7;">Hello ${safeEmail},</p>
       <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.7;">We received a request to reset the password for your Ecommerce account. Use the button below to choose a new password.</p>
       <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
         <tr>
           <td align="center" bgcolor="#2457d6" style="border-radius:8px;background-color:#2457d6;">
             <a href="${safeResetUrl}" style="display:inline-block;padding:14px 24px;border:1px solid #2457d6;border-radius:8px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Reset my password</a>
           </td>
         </tr>
       </table>
       <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.7;">This link expires in 30 minutes and can only be used once. If you didn’t request this, you can safely ignore this email.</p>
       <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">If the button doesn’t work, copy and paste this link into your browser:<br><a href="${safeResetUrl}" style="color:#2457d6;word-break:break-all;">${safeResetUrl}</a></p>`,
      "Use the secure link in this email to reset your password. It expires in 30 minutes."
    ),
  };
};
