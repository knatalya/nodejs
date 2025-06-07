// src/middlewares/authMiddleware.js
module.exports = {
  /**
   * Проверка аутентификации.
   * Если пользователь в req.user существует, вызываем next(), иначе 401.
   */
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: 'Необходима авторизация', status: 'error' });
  }
};
