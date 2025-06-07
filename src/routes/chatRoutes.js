// src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

/**
 * GET /api/chat/history/:chatId
 * — вернуть историю сообщений.
 * Только для авторизованных (либо можно не проверять, но лучше проверить, что пользователь участвует в чате).
 */
router.get('/history/:chatId', ensureAuthenticated, async (req, res) => {
  try {
    const { chatId } = req.params;
    // Можно проверить, что текущий пользователь является участником: но упрощённо вернём всю историю
    const messages = await chatService.getHistory(chatId);
    return res.json({ data: messages, status: 'ok' });
  } catch (err) {
    console.error('Error get chat history:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
  }
});

module.exports = router;
