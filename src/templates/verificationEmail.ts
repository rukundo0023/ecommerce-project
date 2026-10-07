export const verificationEmailTemplate = (
  email: string,
  verificationUrl: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Verify Your Email</title>
      </head>

      <body>
        <h1>Verify Your Email</h1>

        <p>Hello ${email},</p>

        <p>
          Thank you for creating an account with us.
        </p>

        <p>
          Please click the button below to verify your email address:
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify My Email
          </a>
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>

        <p>
          Thank you!
        </p>
      </body>
    </html>
  `;
};