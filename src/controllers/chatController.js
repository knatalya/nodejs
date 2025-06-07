// src/controllers/chatController.js

const chatService = require('../services/chatService');

/**
 * Получить историю сообщений чата по его ID.
 * Используется в HTTP-роутинге: GET /api/chat/history/:chatId
 */
async function getHistory(req, res) {
  try {
    const { chatId } = req.params;
    // Дополнительно можно проверить, что текущий пользователь участвует в этом чате.
    // Например:
    // const currentUserId = req.user._id.toString();
    // const chat = await chatService.findById(chatId);
    // if (!chat || !chat.users.map(u => u.toString()).includes(currentUserId)) {
    //   return res.status(403).json({ error: 'Доступ запрещён', status: 'error' });
    // }

    // Получаем историю сообщений
    const messages = await chatService.getHistory(chatId || null);
    
    // Возвращаем массив сообщений (можно сразу вернуть Message-субдокументы)
    return res.json({ data: messages, status: 'ok' });
  } catch (err) {
    console.error('Ошибка при получении истории чата:', err);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера', status: 'error' });
  }
}

module.exports = {
  getHistory
};
