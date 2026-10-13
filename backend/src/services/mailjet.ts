import Mailjet from "node-mailjet";

export const getMailjet = () => {
  const apiKey = process.env.MJ_APIKEY_PUBLIC;
  const apiSecret = process.env.MJ_APIKEY_PRIVATE;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Mailjet is not configured. Set MJ_APIKEY_PUBLIC and MJ_APIKEY_PRIVATE to your Mailjet API key and secret."
    );
  }

  return new Mailjet({ apiKey, apiSecret });
};
