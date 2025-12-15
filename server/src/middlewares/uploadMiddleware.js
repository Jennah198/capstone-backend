import multer from "multer";
import path from "path";

// Absolute path to your src/uploads folder
const uploadsDir = path.join(path.resolve(), "src/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // <- use absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/avif"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, JPEG, WEBP, AVIF allowed"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
