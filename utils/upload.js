const multer = require("multer");

// memory storage (no local files)
const storage = multer.memoryStorage();

// file filter
const fileFilter = (req, file, cb) => {
  const allowedExt = /jpg|jpeg|png|webp/;
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  const extname = allowedExt.test(
    file.originalname.toLowerCase()
  );

  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
  }
};

// upload config
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter,
});

module.exports = upload;