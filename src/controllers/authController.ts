import { scrypt, timingSafeEqual } from "node:crypto";

import { RequestHandler } from "express";

import User from "../models/user";

import {
  assertAuthTokenConfiguration,
  createAuthToken,
} from "../middleware/requireAuth";

import { sendWelcomeEmail } from "../services/emailService";
import { hashPassword } from "../utils/password";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 100;

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
      console.error("Welcome email failed:", emailError);
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
