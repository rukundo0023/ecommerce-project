import { randomBytes, scrypt } from "node:crypto";

export const hashPassword = async (password: string): Promise<string> => {
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
