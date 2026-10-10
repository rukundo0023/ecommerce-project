import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

import { RequestHandler } from "express";

import User from "../models/user";

import {
  assertAuthTokenConfiguration,
  createAuthToken,
} from "../middleware/requireAuth";

import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/emailService";
import { hashPassword } from "../utils/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;
const PASSWORD_RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const PASSWORD_RESET_RESPONSE = {
  message:
    "If an account with that email exists, password reset instructions have been sent",
};

const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  const [salt, hashHex] = storedHash.split(":");

  if (!salt || !hashHex || !/^[a-f0-9]{128}$/i.test(hashHex)) {
    return false;
  }

  const expectedHash = Buffer.from(hashHex, "hex");

  const actualHash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expectedHash.length, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });

  return timingSafeEqual(actualHash, expectedHash);
};

const getCredentials = (
  body: unknown
): { email: string; password: string } | null => {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const credentials = body as Record<string, unknown>;

  if (
    typeof credentials.email !== "string" ||
    typeof credentials.password !== "string"
  ) {
    return null;
  }

  const email = credentials.email.trim().toLowerCase();
  const password = credentials.password;

  if (
    email.length > 254 ||
    !EMAIL_PATTERN.test(email) ||
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return null;
  }

  return { email, password };
};

const getNormalizedEmail = (body: unknown): string | null => {
  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    typeof body.email !== "string"
  ) {
    return null;
  }

  const email = body.email.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
};

const getPasswordResetDetails = (
  body: unknown
): { token: string; password: string } | null => {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const details = body as Record<string, unknown>;
  if (
    typeof details.token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(details.token) ||
    typeof details.password !== "string" ||
    details.password.length < PASSWORD_MIN_LENGTH ||
    details.password.length > PASSWORD_MAX_LENGTH
  ) {
    return null;
  }

  return { token: details.token, password: details.password };
};

const hashPasswordResetToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const getPasswordResetUrl = (token: string): string => {
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL must be configured for password resets");
  }

  let url: URL;
  try {
    url = new URL(frontendUrl);
  } catch {
    throw new Error("FRONTEND_URL must be a valid absolute URL");
  }

  if (
    url.protocol !== "https:" &&
    !(url.protocol === "http:" && url.hostname === "localhost")
  ) {
    throw new Error("FRONTEND_URL must use HTTPS outside localhost");
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/reset-password`;
  url.search = "";
  url.hash = "";
  url.searchParams.set("token", token);
  return url.toString();
};

const getRegistrationName = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null || !("name" in body)) {
    return null;
  }

  const name = body.name;
  if (typeof name !== "string") {
    return null;
  }

  const normalizedName = name.trim();
  return normalizedName.length > 0 && normalizedName.length <= NAME_MAX_LENGTH
    ? normalizedName
    : null;
};

export const requestPasswordReset: RequestHandler = async (req, res) => {
  const email = getNormalizedEmail(req.body);
  if (!email) {
    res.status(400).json({ message: "Provide a valid email address" });
    return;
  }

  let resetUrl: string;
  const token = randomBytes(32).toString("hex");
  try {
    resetUrl = getPasswordResetUrl(token);
  } catch (error) {
    console.error("Password reset configuration error:", error);
    res.status(500).json({ message: "Password reset is not configured correctly" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_LIFETIME_MS);
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetTokenHash: hashPasswordResetToken(token),
            passwordResetExpiresAt: expiresAt,
          },
        }
      );

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailError) {
        // Keep the response identical for existing and unknown email addresses.
        const message =
          emailError instanceof Error ? emailError.message : "Unknown error";
        console.error(`Password reset email delivery failed: ${message}`);
      }
    }

    res.status(200).json(PASSWORD_RESET_RESPONSE);
  } catch (error) {
    console.error("Password reset request failed:", error);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  const details = getPasswordResetDetails(req.body);
  if (!details) {
    res.status(400).json({
      message:
        "Provide a valid reset token and a password between 8 and 128 characters",
    });
    return;
  }

  try {
    const tokenHash = hashPasswordResetToken(details.token);
    const validTokenUser = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!validTokenUser) {
      res.status(400).json({ message: "Invalid or expired password reset token" });
      return;
    }

    const passwordHash = await hashPassword(details.password);
    const user = await User.findOneAndUpdate(
      {
        _id: validTokenUser._id,
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(400).json({ message: "Invalid or expired password reset token" });
      return;
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset failed:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export const register: RequestHandler = async (req, res) => {
  const credentials = getCredentials(req.body);
  const name = getRegistrationName(req.body);

  if (!credentials || !name) {
    res.status(400).json({
      message:
        "Provide a name (up to 100 characters), valid email, and a password between 8 and 128 characters",
    });
    return;
  }

  try {
    assertAuthTokenConfiguration();

    const passwordHash = await hashPassword(credentials.password);

    const user = await User.create({
      name,
      email: credentials.email,
      passwordHash,
    });

    // Send welcome email after successful registration
    try {
      await sendWelcomeEmail(user.email);
    } catch (emailError) {
      const message =
        emailError instanceof Error ? emailError.message : "Unknown error";
      console.error(`Welcome email delivery failed: ${message}`);
    }

    res.status(201).json({
      message: "User registered successfully",
      token: createAuthToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("User registration error:", error);

    res.status(500).json({
      message: "Failed to register user",
    });
  }
};

export const login: RequestHandler = async (req, res) => {
  const credentials = getCredentials(req.body);

  if (!credentials) {
    res.status(400).json({
      message:
        "Provide a valid email and a password between 8 and 128 characters",
    });
    return;
  }

  try {
    assertAuthTokenConfiguration();

    const user = await User.findOne({
      email: credentials.email,
    }).select("+passwordHash");

    if (
      !user ||
      !(await verifyPassword(credentials.password, user.passwordHash))
    ) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      token: createAuthToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("User login error:", error);

    res.status(500).json({
      message: "Failed to log in",
    });
  }
};
