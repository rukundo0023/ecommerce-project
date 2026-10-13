import User from "../models/user";
import { hashPassword } from "../utils/password";

const ADMIN_EMAIL = "clevisrukundo@gmail.com";
const ADMIN_NAME = "Rukundo Nshimiyimana";

export const provisionAdminAccount = async (): Promise<void> => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 8 || password.length > 128) {
    throw new Error(
      "ADMIN_PASSWORD must be configured with a password between 8 and 128 characters"
    );
  }

  const passwordHash = await hashPassword(password);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: ADMIN_NAME,
        passwordHash,
        role: "admin",
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log(`Administrator account provisioned for ${ADMIN_EMAIL}`);
};
