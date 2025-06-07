// src/controllers/advertisementController.js
const advertisementService = require('../services/advertisementService');
const userService = require('../services/userService');

const advertisementController = {
  /**
   * GET /api/advertisements
   * Query-параметры (необязательные): shortText, description, userId, tags (через запятую или массив)
   */
  async getAll(req, res) {
    try {
      const { shortText, description, userId, tags } = req.query;

      // tags можно передать как строку "tag1,tag2", либо как массив tags[]=tag1&tags[]=tag2
      let tagsArr = [];
      if (tags) {
        if (Array.isArray(tags)) {
          tagsArr = tags;
        } else if (typeof tags === 'string') {
          tagsArr = tags.split(',').map((t) => t.trim());
        }
      }

      const params = { shortText, description, userId, tags: tagsArr };
      const ads = await advertisementService.find(params);

      // Для каждого объявления надо вернуть данные автора (id, name). Лучше «дополнительно» получить имя
      // Используем populate, но поскольку в сервисе мы не делали populate, подкрутим вручную:
      const result = await Promise.all(
        ads.map(async (ad) => {
          const user = await userService.findById(ad.userId);
          return {
            id: ad._id,
            shortTitle: ad.shortText,
            description: ad.description,
            images: ad.images,
            user: {
              id: user._id,
              name: user.name
            },
            createdAt: ad.createdAt
          };
        })
      );

      return res.json({ data: result, status: 'ok' });
    } catch (err) {
      console.error('Error getAll ads:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
    }
  },

  /**
   * GET /api/advertisements/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const ad = await advertisementService.findById(id);
      if (!ad) {
        return res.status(404).json({ error: 'Объявление не найдено', status: 'error' });
      }
      const user = await userService.findById(ad.userId);
      return res.json({
        data: {
          id: ad._id,
          shortTitle: ad.shortText,
          description: ad.description,
          images: ad.images,
          user: {
            id: user._id,
            name: user.name
          },
          createdAt: ad.createdAt
        },
        status: 'ok'
      });
    } catch (err) {
      console.error('Error getById ad:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
    }
  }
};

module.exports = advertisementController;
