// src/controllers/advertisementManageController.js
const advertisementService = require('../services/advertisementService');
const userService = require('../services/userService');
const path = require('path');
const fs = require('fs');

const advertisementManageController = {
  /**
   * POST /api/advertisements
   * Тип данных — FormData: поле shortTitle, description, images[]. Файлы обрабатывает multer.
   */
  async createAd(req, res) {
    try {
      // В req.body: shortTitle, description, tags (опционально)
      // В req.files: массив файлов (если настраивали upload.array('images'))
      // req.user — авторизованный пользователь (passport добавляет)
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Необходима авторизация', status: 'error' });
      }

      const { shortTitle, description, tags } = req.body;
      if (!shortTitle) {
        return res.status(400).json({ error: 'Не указан заголовок объявления', status: 'error' });
      }

      // Обрабатка тегов, если переданы
      let tagsArr = [];
      if (tags) {
        if (typeof tags === 'string') {
          tagsArr = tags.split(',').map((t) => t.trim());
        } else if (Array.isArray(tags)) {
          tagsArr = tags;
        }
      }

      // Обработка загруженных файлов: в req.files лежит массив объектов { path, filename, originalname, ... }
      const imagePaths = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          // Мы настроим multer так, чтобы сохранять файлы в папку uploads/<userId>/
          // Например: /uploads/507f.../somefile.jpg
          const relPath = `/uploads/${user._id}/${file.filename}`;
          imagePaths.push(relPath);
        });
      }

      // Создаём объявление в базе
      const ad = await advertisementService.create({
        shortText: shortTitle,
        description: description || '',
        images: imagePaths,
        userId: user._id,
        tags: tagsArr
      });

      // Формируем ответ в том же формате, что и при GET
      return res.status(201).json({
        data: [
          {
            id: ad._id,
            shortTitle: ad.shortText,
            description: ad.description,
            images: ad.images,
            user: {
              id: user._id,
              name: user.name
            },
            createdAt: ad.createdAt
          }
        ],
        status: 'ok'
      });
    } catch (err) {
      console.error('Error createAd:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
    }
  },

  /**
   * DELETE /api/advertisements/:id
   */
  async deleteAd(req, res) {
    try {
      const user = req.user;
      const { id } = req.params;
      if (!user) {
        return res.status(401).json({ error: 'Необходима авторизация', status: 'error' });
      }

      // Проверим, существует ли объявление и является ли текущий пользователь его автором
      const ad = await advertisementService.findById(id);
      if (!ad) {
        return res.status(404).json({ error: 'Объявление не найдено', status: 'error' });
      }
      if (ad.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'Нет прав на удаление', status: 'error' });
      }

      // Мягко удаляем
      const removed = await advertisementService.remove(id);
      if (!removed) {
        return res.status(500).json({ error: 'Не удалось удалить объявление', status: 'error' });
      }

      return res.json({ status: 'ok' });
    } catch (err) {
      console.error('Error deleteAd:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
    }
  }
};

module.exports = advertisementManageController;
