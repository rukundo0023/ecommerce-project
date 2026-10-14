type MomoConfiguration = {
  apiUser: string;
  apiKey: string;
  subscriptionKey: string;
  targetEnvironment: string;
  baseUrl: "https://ericssondeveloperapi.azure-api.net";
};

type MomoPaymentStatus = "SUCCESSFUL" | "FAILED" | "PENDING";

type MomoStatusResponse = {
  status?: string;
};

class MomoApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "MomoApiError";
  }
}

let cachedAccessToken: { value: string; expiresAt: number } | undefined;

const getConfiguration = (): MomoConfiguration => {
  const apiUser = process.env.ERICSSON_COLLECTION_API_USER?.trim();
  const apiKey = process.env.ERICSSON_COLLECTION_API_KEY?.trim();
  const subscriptionKey =
    process.env.ERICSSON_COLLECTION_SUBSCRIPTION_KEY?.trim() ||
    process.env.MOMO_SUBSCRIPTION_KEY?.trim();
  const targetEnvironment = process.env.ERICSSON_COLLECTION_TARGET_ENV?.trim();

  if (!apiUser || !apiKey || !subscriptionKey || !targetEnvironment) {
    throw new Error(
      "Ericsson Collection is not configured. Set ERICSSON_COLLECTION_API_USER, ERICSSON_COLLECTION_API_KEY, ERICSSON_COLLECTION_SUBSCRIPTION_KEY, and ERICSSON_COLLECTION_TARGET_ENV using the values issued for your Collection product."
    );
  }

  if (!/^[a-z0-9_-]+$/i.test(targetEnvironment)) {
    throw new Error("ERICSSON_COLLECTION_TARGET_ENV contains an invalid value.");
  }

  return {
    apiUser,
    apiKey,
    subscriptionKey,
    targetEnvironment,
    baseUrl: "https://ericssondeveloperapi.azure-api.net",
  };
};

export const assertMomoConfiguration = (): void => {
  getConfiguration();
};

const getAccessToken = async (
  configuration: MomoConfiguration
): Promise<string> => {
  if (
    cachedAccessToken &&
    cachedAccessToken.expiresAt > Date.now() + 30_000
  ) {
    return cachedAccessToken.value;
  }

  let response: Response;
  try {
    response = await fetch(`${configuration.baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${configuration.apiUser}:${configuration.apiKey}`
        ).toString("base64")}`,
        "Ocp-Apim-Subscription-Key": configuration.subscriptionKey,
      },
    });
  } catch {
    throw new Error(
      "Could not reach Ericsson Collection to obtain an access token."
    );
  }

  if (!response.ok) {
    throw new MomoApiError(
      `Ericsson Collection token request failed (${response.status}).`,
      response.status
    );
  }

  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("access_token" in body) ||
    typeof body.access_token !== "string" ||
    ("expires_in" in body &&
      body.expires_in !== undefined &&
      typeof body.expires_in !== "number")
  ) {
    throw new Error(
      "Ericsson Collection returned an invalid access-token response."
    );
  }

  if ("expires_in" in body && typeof body.expires_in === "number") {
    cachedAccessToken = {
      value: body.access_token,
      expiresAt: Date.now() + body.expires_in * 1000,
    };
  } else {
    cachedAccessToken = undefined;
  }
  return body.access_token;
};

const createHeaders = (
  configuration: MomoConfiguration,
  accessToken: string
): Headers => {
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    "Ocp-Apim-Subscription-Key": configuration.subscriptionKey,
    "X-Target-Environment": configuration.targetEnvironment,
    "Content-Type": "application/json",
  });
  return headers;
};

export const requestToPay = async (payment: {
  reference: string;
  amount: number;
  currency: string;
  payerPhone: string;
}): Promise<void> => {
  const configuration = getConfiguration();
  const accessToken = await getAccessToken(configuration);
  const headers = createHeaders(configuration, accessToken);
  headers.set("X-Reference-Id", payment.reference);

  let response: Response;
  try {
    response = await fetch(
      `${configuration.baseUrl}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: String(payment.amount),
          currency: payment.currency,
          externalId: payment.reference,
          payer: {
            partyIdType: "MSISDN",
            partyId: payment.payerPhone,
          },
          payerMessage: "ShopEase order payment",
          payeeNote: "ShopEase order",
        }),
      }
    );
  } catch {
    throw new Error(
      "Could not confirm whether MTN MoMo accepted the payment request."
    );
  }

  if (response.status !== 202) {
    throw new MomoApiError(
      `MTN MoMo rejected the payment request (${response.status}).`,
      response.status
    );
  }
};

export const getRequestToPayStatus = async (
  reference: string
): Promise<MomoPaymentStatus> => {
  const configuration = getConfiguration();
  const accessToken = await getAccessToken(configuration);
  const headers = createHeaders(configuration, accessToken);

  let response: Response;
  try {
    response = await fetch(
      `${configuration.baseUrl}/collection/v1_0/requesttopay/${encodeURIComponent(reference)}`,
      { headers }
    );
  } catch {
    throw new Error(
      "Could not reach Ericsson Collection to check payment status."
    );
  }

  if (!response.ok) {
    throw new MomoApiError(
      `Ericsson Collection status request failed (${response.status}).`,
      response.status
    );
  }

  const body = (await response.json().catch(() => null)) as
    | MomoStatusResponse
    | null;
  if (typeof body?.status !== "string") {
    throw new Error("Ericsson Collection returned an invalid payment status.");
  }
  if (body?.status === "SUCCESSFUL") {
    return "SUCCESSFUL";
  }
  if (
    body?.status === "FAILED" ||
    body?.status === "REJECTED" ||
    body?.status === "EXPIRED" ||
    body?.status === "TIMEOUT"
  ) {
    return "FAILED";
  }
  if (body.status !== "PENDING") {
    throw new Error(
      `Ericsson Collection returned an unrecognized payment status: ${body.status}.`
    );
  }
  return "PENDING";
};

export const isDefinitiveMomoRejection = (error: unknown): boolean =>
  error instanceof MomoApiError &&
  error.statusCode >= 400 &&
  error.statusCode < 500 &&
  error.statusCode !== 409;
