// src/config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Создаёт дирректорию, если её нет.
 * @param {string} dirPath
 */
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Настройка хранилища (diskStorage), куда сохраняются файлы
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Сохраняем в папку uploads/<userId>/
    const userId = req.user._id.toString();
    const uploadDir = path.join(__dirname, '..', 'uploads', userId);
    ensureDirExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Сохраняем под уникальным именем: timestamp-оригинальноеимя
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const filename = `${timestamp}-${baseName}${ext}`;
    cb(null, filename);
  }
});

// Фильтр по типу файла (только изображения)
const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла'), false);
  }
};

// Ограничение размера: например, до 5 MB
const limits = {
  fileSize: 5 * 1024 * 1024
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
