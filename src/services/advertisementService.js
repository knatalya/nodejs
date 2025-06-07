// src/services/advertisementService.js
const Advertisement = require('../models/Advertisement');
const mongoose = require('mongoose');

const advertisementService = {
  /**
   * Поиск объявлений по параметрам.
   * @param {{shortText?: string, description?: string, userId?: string|ObjectId, tags?: string[]}} params
   * @returns {Promise<Advertisement[]>}
   */
  async find(params) {
    // Формируем MongoDB-запрос (filter)
    const filter = { isDeleted: false };

    if (params.shortText) {
      filter.shortText = { $regex: params.shortText, $options: 'i' };
    }
    if (params.description) {
      filter.description = { $regex: params.description, $options: 'i' };
    }
    if (params.userId) {
      // Убедимся, что передан ObjectId либо строка
      filter.userId = mongoose.Types.ObjectId(params.userId);
    }
    if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      // В базе массив tags должен содержать все искомые теги: $all
      filter.tags = { $all: params.tags };
    }

    return Advertisement.find(filter).sort({ createdAt: -1 }).exec();
  },

  /**
   * Создание нового объявления.
   * @param {{shortText: string, description?: string, images?: string[], userId: string|ObjectId, tags?: string[]}} data
   * @returns {Promise<Advertisement>}
   */
  async create(data) {
    const ad = new Advertisement({
      shortText: data.shortText,
      description: data.description || '',
      images: data.images || [],
      userId: mongoose.Types.ObjectId(data.userId),
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    });
    await ad.save();
    return ad;
  },

  /**
   * «Мягкое удаление» объявления: пометить isDeleted = true
   * @param {string|ObjectId} id
   * @returns {Promise<Advertisement|null>} возвращает обновленный документ или null, если не найден
   */
  async remove(id) {
    const objectId = mongoose.Types.ObjectId(id);
    return Advertisement.findByIdAndUpdate(
      objectId,
      { isDeleted: true },
      { new: true }
    ).exec();
  },

  /**
   * Найти объявление по ID (и убедиться, что не удалено)
   * @param {string|ObjectId} id
   * @returns {Promise<Advertisement|null>}
   */
  async findById(id) {
    const objectId = mongoose.Types.ObjectId(id);
    return Advertisement.findOne({ _id: objectId, isDeleted: false }).exec();
  }
};

module.exports = advertisementService;
