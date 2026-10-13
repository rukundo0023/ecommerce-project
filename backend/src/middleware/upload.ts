import { RequestHandler } from "express";
import multer from "multer";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new Error("Product image must be a JPEG, PNG, or WebP file"));
      return;
    }
    callback(null, true);
  },
});

const parseProductImage = upload.single("image");

const handleUploadError = (error: unknown, res: Parameters<RequestHandler>[1]) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "Product image must be 5 MB or smaller" });
      return;
    }

    res.status(400).json({ message: "Invalid product image upload" });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ message: error.message });
    return;
  }

  console.error("Product image upload error:", error);
  res.status(500).json({ message: "Failed to process product image upload" });
};

const uploadProductImage: RequestHandler = (req, res, next) => {
  parseProductImage(req, res, (error) => {
    if (error) {
      handleUploadError(error, res);
      return;
    }
    next();
  });
};

export default uploadProductImage;
