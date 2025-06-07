// src/services/userService.js
const User = require('../models/User');

/**
 * Сервис для работы с пользователями
 */
const userService = {
  /**
   * Создаёт нового пользователя
   * @param {{email, passwordHash, name, contactPhone}} data
   */
  async create(data) {
    const user = new User({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      contactPhone: data.contactPhone || null
    });
    await user.save();
    return user;
  },

  /**
   * Находит пользователя по email
   * @param {string} email
   */
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  },

  /**
   * Находит пользователя по ID
   * @param {string|ObjectId} id
   */
  async findById(id) {
    return User.findById(id).exec();
  }
};

module.exports = userService;
