export const welcomeEmailTemplate = (email: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome</title>
      </head>

      <body>
        <h1>Welcome to Our E-commerce Platform!</h1>

        <p>Hello ${email},</p>

        <p>
          Your account has been successfully created.
        </p>

        <p>
          Thank you for joining us!
        </p>

        <p>
          We look forward to serving you.
        </p>
      </body>
    </html>
  `;
};