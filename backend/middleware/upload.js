const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ absolute uploads path
const uploadPath = path.join(__dirname, "../uploads");

// ✅ ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // ✅ FIXED
    console.log(uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;