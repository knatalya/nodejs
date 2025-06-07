// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const userService = require('../services/userService');
const passport = require('passport');

const authController = {
  /**
   * Регистрация нового пользователя
   */
  async signup(req, res) {
    try {
      const { email, password, name, contactPhone } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Некорректные данные', status: 'error' });
      }

      // Проверим, не занят ли email
      const existing = await userService.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'email занят', status: 'error' });
      }

      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Создаём пользователя
      const user = await userService.create({ email, passwordHash, name, contactPhone });

      return res.status(201).json({
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          contactPhone: user.contactPhone
        },
        status: 'ok'
      });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
    }
  },

  /**
   * Вход пользователя (Passport Local)
   */
  signin(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
      }
      if (!user) {
        // info содержит сообщение, например, "Неверный логин или пароль"
        return res.status(401).json({ error: info.message || 'Неверный логин или пароль', status: 'error' });
      }
      // Логиним пользователя в сессию
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка при авторизации', status: 'error' });
        }
        // Успешная авторизация — возвращаем данные
        return res.json({
          data: {
            id: user._id,
            email: user.email,
            name: user.name,
            contactPhone: user.contactPhone
          },
          status: 'ok'
        });
      });
    })(req, res, next);
  },

  /**
   * Выход (logout) (опционально)
   */
  logout(req, res) {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.json({ status: 'ok' });
    });
  }
};

module.exports = authController;
