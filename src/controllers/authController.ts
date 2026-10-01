import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { RequestHandler } from "express";
import User from "../models/user";
import {
  assertAuthTokenConfiguration,
  createAuthToken,
} from "../middleware/requireAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

  return `${salt}:${hash.toString("hex")}`;
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

export const register: RequestHandler = async (req, res) => {
  const credentials = getCredentials(req.body);
  if (!credentials) {
    res.status(400).json({
      message: "Provide a valid email and a password between 8 and 128 characters",
    });
    return;
  }

  try {
    assertAuthTokenConfiguration();
    const passwordHash = await hashPassword(credentials.password);
    const user = await User.create({
      email: credentials.email,
      passwordHash,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: createAuthToken(user.id),
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res
        .status(409)
        .json({ message: "An account with this email already exists" });
      return;
    }

    console.error("User registration error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};

export const login: RequestHandler = async (req, res) => {
  const credentials = getCredentials(req.body);
  if (!credentials) {
    res.status(400).json({
      message: "Provide a valid email and a password between 8 and 128 characters",
    });
    return;
  }

  try {
    assertAuthTokenConfiguration();
    const user = await User.findOne({ email: credentials.email }).select(
      "+passwordHash"
    );
    if (
      !user ||
      !(await verifyPassword(credentials.password, user.passwordHash))
    ) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      token: createAuthToken(user.id),
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
};
