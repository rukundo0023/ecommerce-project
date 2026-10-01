import { createHmac, timingSafeEqual } from "node:crypto";
import { RequestHandler } from "express";

const TOKEN_LIFETIME_SECONDS = 60 * 60;

interface AuthTokenPayload {
  sub: string;
  exp: number;
}

const getTokenSecret = (): string => {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET must contain at least 32 characters");
  }
  return secret;
};

export const assertAuthTokenConfiguration = (): void => {
  getTokenSecret();
};

const sign = (value: string): Buffer =>
  createHmac("sha256", getTokenSecret()).update(value).digest();

export const createAuthToken = (userId: string): string => {
  const payload: AuthTokenPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = sign(encodedPayload).toString("base64url");
  return `${encodedPayload}.${signature}`;
};

const verifyAuthToken = (token: string): AuthTokenPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, encodedSignature] = parts;
  const actualSignature = Buffer.from(encodedSignature, "base64url");
  const expectedSignature = sign(encodedPayload);
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );
  } catch {
    return null;
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("sub" in payload) ||
    typeof payload.sub !== "string" ||
    !("exp" in payload) ||
    typeof payload.exp !== "number" ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return { sub: payload.sub, exp: payload.exp };
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    if (!verifyAuthToken(match[1])) {
      res.status(401).json({ message: "Invalid or expired authentication token" });
      return;
    }
  } catch (error) {
    console.error("Authentication configuration error:", error);
    res.status(500).json({ message: "Authentication is not configured correctly" });
    return;
  }

  next();
};
