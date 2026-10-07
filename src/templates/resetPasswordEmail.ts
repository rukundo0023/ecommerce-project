export const resetPasswordEmailTemplate = (
  email: string,
  resetUrl: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
      </head>

      <body>
        <h1>Reset Your Password</h1>

        <p>Hello ${email},</p>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a href="${resetUrl}">
            Reset My Password
          </a>
        </p>

        <p>
          This link will expire after a limited amount of time.
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