import Mailjet from "node-mailjet";

export const getMailjet = () => {
  const apiKey = process.env.MJ_APIKEY_PUBLIC || process.env.SMTP_USER;
  const apiSecret = process.env.MJ_APIKEY_PRIVATE || process.env.SMTP_PASS;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Mailjet is not configured. Set MJ_APIKEY_PUBLIC and MJ_APIKEY_PRIVATE."
    );
  }

  return new Mailjet({ apiKey, apiSecret });
};
