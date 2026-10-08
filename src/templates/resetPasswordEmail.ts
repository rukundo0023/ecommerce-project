const escapeHtml = (value: string): string =>
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

export const resetPasswordEmailTemplate = (
  email: string,
  resetUrl: string
) => {
  const safeEmail = escapeHtml(email);
  const safeResetUrl = escapeHtml(resetUrl);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
      </head>

      <body>
        <h1>Reset Your Password</h1>

        <p>Hello ${safeEmail},</p>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a href="${safeResetUrl}">
            Reset My Password
          </a>
        </p>

        <p>
          This link will expire after 30 minutes and can only be used once.
        </p>

        <p>
          If you did not request a password reset, you can safely ignore this email.
        </p>

        <p>
          Thank you!
        </p>
      </body>
    </html>
  `;
};