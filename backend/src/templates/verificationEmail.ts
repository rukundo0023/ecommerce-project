import { EmailContent, escapeHtml, renderEmailLayout } from "./emailLayout";

export const renderVerificationEmail = (
  email: string,
  verificationUrl: string
): EmailContent => {
  const safeEmail = escapeHtml(email);
  const safeVerificationUrl = escapeHtml(verificationUrl);

  return {
    subject: "Verify Your Email",
    text: [
      `Hello ${email},`,
      "",
      "Thank you for creating an account with us.",
      `Verify your email address using this link: ${verificationUrl}`,
      "",
      "If you did not create this account, you can safely ignore this email.",
    ].join("\n"),
    html: renderEmailLayout(
      `<p style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">One quick step</p>
       <h1 style="margin:0 0 16px;color:#172033;font-size:30px;line-height:1.25;">Verify your email</h1>
       <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.7;">Hello ${safeEmail},</p>
       <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.7;">Thanks for creating an Ecommerce account. Confirm your email address using the button below.</p>
       <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px;">
         <tr>
           <td align="center" bgcolor="#2457d6" style="border-radius:8px;background-color:#2457d6;">
             <a href="${safeVerificationUrl}" style="display:inline-block;padding:14px 24px;border:1px solid #2457d6;border-radius:8px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Verify my email</a>
           </td>
         </tr>
       </table>
       <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.7;">If you didn’t create this account, you can safely ignore this email.</p>
       <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">If the button doesn’t work, copy and paste this link into your browser:<br><a href="${safeVerificationUrl}" style="color:#2457d6;word-break:break-all;">${safeVerificationUrl}</a></p>`,
      "Confirm your email address to finish setting up your Ecommerce account."
    ),
  };
};
