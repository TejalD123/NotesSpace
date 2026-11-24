const multer = require('multer');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage: multer.memoryStorage(), // file RAM madhe, disk var save nahi
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed'));
  },
});

module.exports = upload;
