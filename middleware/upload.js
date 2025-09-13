const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the folder exists or create it
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Common file filter (only images)
const imageFileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png formats allowed!"));
  }
};

// ----------------- User Profile Image -----------------
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = "uploads/userImg";
    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadUserImg = multer({
  storage: userStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// ----------------- Financial Record Image -----------------
const recordStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = "uploads/recordImg";
    ensureFolderExists(folderPath);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadRecordImg = multer({
  storage: recordStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// ----------------- Export Both -----------------
module.exports = { uploadUserImg, uploadRecordImg };
