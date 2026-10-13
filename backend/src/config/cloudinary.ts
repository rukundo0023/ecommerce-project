
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

const getConfiguredCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary environment variables are missing. Check your .env file."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
};

export const uploadProductImage = (
  image: Express.Multer.File
): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const configuredCloudinary = getConfiguredCloudinary();

      const uploadStream = configuredCloudinary.uploader.upload_stream(
        {
          folder: "ecommerce-products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL"));
            return;
          }

          resolve(result.secure_url);
        }
      );

      uploadStream.end(image.buffer);
    } catch (error) {
      reject(error);
    }
  });

export const uploadProductImageFromUrl = async (
  imageUrl: string
): Promise<string> => {
  const parsedUrl = new URL(imageUrl);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Product image URL must use HTTPS");
  }

  const result = await getConfiguredCloudinary().uploader.upload(imageUrl, {
    folder: "ecommerce-products",
    resource_type: "image",
  });

  if (!result.secure_url) {
    throw new Error("Cloudinary did not return an image URL");
  }

  return result.secure_url;
};



