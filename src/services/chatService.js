// src/services/chatService.js
const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const EventEmitter = require('eventemitter3');

class ChatService {
  constructor() {
    // emitter для новых сообщений
    this.emitter = new EventEmitter();
  }

  /**
   * Находит чат между двумя пользователями.
   * @param {[string|ObjectId, string|ObjectId]} usersArr
   * @returns {Promise<Chat|null>}
   */
  async find(usersArr) {
    // Приведем к ObjectId и отсортируем, чтобы избежать дублирования [A,B] vs [B,A]
    const uids = usersArr.map((u) => mongoose.Types.ObjectId(u).toString());
    uids.sort();
    const objectIds = uids.map((u) => mongoose.Types.ObjectId(u));

    // Ищем документ, где поле users (массив) точно совпадает с этим массивом
    return Chat.findOne({ users: objectIds }).exec();
  }

  /**
   * Отправляет сообщение (create chat, если не существует; добавляет сообщение).
   * @param {{author: string|ObjectId, receiver: string|ObjectId, text: string}} data
   * @returns {Promise<Object>} возвращает объект Message (subdocument)
   */
  async sendMessage(data) {
    const authorId = mongoose.Types.ObjectId(data.author).toString();
    const receiverId = mongoose.Types.ObjectId(data.receiver).toString();
    const users = [authorId, receiverId].sort();
    const objectIds = users.map((u) => mongoose.Types.ObjectId(u));

    // Попробуем найти чат
    let chat = await Chat.findOne({ users: objectIds }).exec();

    // Если нет — создаём новый чат
    if (!chat) {
      chat = new Chat({ users: objectIds, createdAt: new Date(), messages: [] });
    }

    // Создаём новый объект сообщения в виде subdocument
    const msg = {
      author: mongoose.Types.ObjectId(authorId),
      sentAt: new Date(),
      text: data.text,
      readAt: null
    };
    chat.messages.push(msg);
    await chat.save();

    // Последнее добавленное сообщение
    const newMessage = chat.messages[chat.messages.length - 1];

    // Генерируем событие newMessage: параметры — id чата и само сообщение
    this.emitter.emit('newMessage', {
      chatId: chat._id,
      message: newMessage
    });

    return newMessage;
  }

  /**
   * Подписаться на новые сообщения в чате.
   * @param {(data: {chatId: ObjectId, message: Message}) => void} callback
   * @returns {Function} возвращает функцию-отписку
   */
  subscribe(callback) {
    // Подписываемся на событие 'newMessage'
    this.emitter.on('newMessage', callback);
    // Возвращаем функцию, чтобы можно было отписаться
    return () => {
      this.emitter.off('newMessage', callback);
    };
  }

  /**
   * Возвращает историю сообщений чата по его ID.
   * @param {string|ObjectId} chatId
   * @returns {Promise<Message[]>}
   */
  async getHistory(chatId) {
    const objectId = mongoose.Types.ObjectId(chatId);
    const chat = await Chat.findById(objectId)
      .select('messages')
      .populate('messages.author', 'name email')
      .exec();
    if (!chat) {
      return [];
    }
    return chat.messages;
  }
}

// Экспортируем единственный экземпляр ChatService
module.exports = new ChatService();
