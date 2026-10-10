export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

export const renderEmailLayout = (
  content: string,
  preheader: string
): string => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Ecommerce</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f5f9;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td bgcolor="#172554" style="padding:28px 36px;background-color:#172554;">
                <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.4px;">Ecommerce</p>
                <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">A little something, just for you</p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px;background-color:#f8fafc;border-top:1px solid #e8edf4;">
                <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">This is an automated email about your Ecommerce account. Please do not reply directly to this message.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
