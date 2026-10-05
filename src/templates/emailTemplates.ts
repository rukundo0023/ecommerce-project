interface OrderConfirmationEmailDetails {
  orderId: string;
  customerName?: string;
  email: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

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

const formatAmount = (amount: number): string => amount.toFixed(2);

const emailLayout = (content: string, preheader: string): string => `
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

export const renderWelcomeEmail = (): EmailContent => ({
  subject: "Welcome to Ecommerce",
  text: [
    "Welcome to Ecommerce!",
    "",
    "Your account has been created successfully. You can now sign in and start exploring.",
    "",
    "Thanks for joining us.",
  ].join("\n"),
  html: emailLayout(
    `<p style="margin:0 0 12px;color:#64748b;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Welcome aboard</p>
     <h1 style="margin:0 0 16px;color:#172033;font-size:30px;line-height:1.25;">We’re glad you’re here.</h1>
     <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.7;">Your account has been created successfully. You can now sign in, explore the store, and find something you love.</p>
     <p style="margin:0;color:#172033;font-size:15px;line-height:1.7;">Thanks for joining us. We can’t wait to help you find your next favorite thing.</p>`,
    "Your Ecommerce account is ready. Welcome aboard!"
  ),
});

export const renderOrderConfirmationEmail = (
  details: OrderConfirmationEmailDetails
): EmailContent => {
  const savedName =
    typeof details.customerName === "string" ? details.customerName.trim() : "";
  const customerName =
    savedName || details.email.split("@")[0]?.trim() || "there";
  const escapedCustomerName = escapeHtml(customerName);
  const productName = escapeHtml(details.productName);
  const orderId = escapeHtml(details.orderId);
  const unitPrice = formatAmount(details.unitPrice);
  const totalPrice = formatAmount(details.totalPrice);

  return {
    subject: `Your order is confirmed - ${details.orderId}`,
    text: [
      `Hello ${customerName},`,
      "",
      "Good news — your order is confirmed!",
      `Order ID: ${details.orderId}`,
      "",
      "ORDER SUMMARY",
      `Product: ${details.productName}`,
      `Quantity: ${details.quantity}`,
      `Unit price: ${unitPrice}`,
      `Total: ${totalPrice}`,
      "",
      "Thank you for shopping with us. We appreciate your order.",
    ].join("\n"),
    html: emailLayout(
      `<p style="margin:0 0 12px;color:#15803d;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Order confirmed</p>
       <h1 style="margin:0 0 12px;color:#172033;font-size:30px;line-height:1.25;">Thanks for your order, ${escapedCustomerName}!</h1>
       <p style="margin:0 0 28px;color:#475569;font-size:16px;line-height:1.7;">We’ve received your order and are getting it ready.</p>
       <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:10px;">
         <tr>
           <td style="padding:18px 20px;border-bottom:1px solid #e2e8f0;">
             <p style="margin:0 0 5px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.7px;">Order number</p>
             <p style="margin:0;color:#172033;font-size:14px;font-weight:700;word-break:break-all;">${orderId}</p>
           </td>
         </tr>
         <tr>
           <td style="padding:18px 20px;">
             <p style="margin:0 0 6px;color:#172033;font-size:16px;font-weight:700;">${productName}</p>
             <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">Quantity: ${details.quantity} &nbsp;·&nbsp; Unit price: ${unitPrice}</p>
           </td>
         </tr>
         <tr>
           <td style="padding:16px 20px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
             <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
               <tr>
                 <td style="color:#475569;font-size:15px;">Order total</td>
                 <td align="right" style="color:#172033;font-size:18px;font-weight:700;">${totalPrice}</td>
               </tr>
             </table>
           </td>
         </tr>
       </table>
       <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">Thank you for shopping with us. We appreciate your order!</p>`,
      `Your order ${details.orderId} is confirmed.`
    ),
  };
};
