// src/sockets/chatSocket.js
const chatService = require('../services/chatService');

module.exports = function (io) {
  // Map, чтобы хранить соответствие socket.id ↔ userId (или же обратное)
  // Зависит от того, как клиент аутентифицируется через Socket.IO.
  // Предположим, что мы будем передавать с клиента идентификатор сессии или cookie,
  // и через middleware Socket.IO будем определять текущего пользователя (req.user).
  // Для простоты: в этом примере мы не разбираем cookie и session через Socket.IO,
  // а вынуждаем клиент при подключении передать userId в query.

  io.on('connection', (socket) => {
    console.log('New client connected, socket.id =', socket.id);

    // Предполагаем, что при подключении клиент передаёт userId:
    const { userId } = socket.handshake.query;
    if (!userId) {
      console.warn('No userId provided, disconnecting socket', socket.id);
      socket.disconnect(true);
      return;
    }

    // Сохраняем userId в сессии сокета
    socket.userId = userId;

    // Подписываем сокет на новые сообщения: когда любой объект chatService.emitter излучит newMessage,
    // мы проверим, нужно ли отправлять сообщение этому конкретному сокету (если он участник).
    const onNewMessage = ({ chatId, message }) => {
      // Проверяем, что текущий пользователь socket.userId участвует в чате
      // Для этого нужно получить сам чат (лучше один раз его закешировать, но здесь — простота):
      // Но поскольку в message хранится только author, а нам нужно знать, кому слать,
      // проще при отправке смотреть: если message.author == socket.userId, значит это мы отправили,
      // а если НЕ равно, и мы — второй участник чата, то слать.
      // Однако гораздо надёжнее получить чат целиком и проверить.
      chatService
        .find([message.author.toString(), socket.userId.toString()])
        .then((chat) => {
          if (!chat) return;
          // Если чат._id совпадает с chatId, и socket.userId есть в chat.users, шлём ему событие
          if (chat._id.toString() === chatId.toString()) {
            socket.emit('newMessage', {
              chatId,
              message
            });
          }
        })
        .catch((err) => {
          console.error('Error in onNewMessage find chat:', err);
        });
    };

    // Подписка на новые сообщения в ChatService
    const unsubscribe = chatService.subscribe(onNewMessage);

    // Обрабатываем события от клиента:

    // 1) getHistory: клиент присылает ID собеседника => мы возвращаем chatHistory
    socket.on('getHistory', async (data) => {
      try {
        const { receiver } = data; // ID собеседника
        if (!receiver) {
          socket.emit('error', { error: 'Не указан ID получателя' });
          return;
        }
        // Находим чат между текущим (socket.userId) и receiver
        let chat = await chatService.find([socket.userId, receiver]);

        if (!chat) {
          // Если чата нет, возвращаем пустой массив
          socket.emit('chatHistory', { chatId: null, messages: [] });
        } else {
          // Иначе получаем историю
          const messages = await chatService.getHistory(chat._id);
          socket.emit('chatHistory', { chatId: chat._id, messages });
        }
      } catch (err) {
        console.error('Error getHistory:', err);
        socket.emit('error', { error: 'Ошибка при получении истории' });
      }
    });

    // 2) sendMessage: { receiver, text }
    socket.on('sendMessage', async (data) => {
      try {
        const { receiver, text } = data;
        if (!receiver || !text) {
          socket.emit('error', { error: 'Не указаны параметры для sendMessage' });
          return;
        }
        // Отправляем сообщение через сервис (sendMessage сам создаёт чат, если нужно)
        const newMsg = await chatService.sendMessage({
          author: socket.userId,
          receiver,
          text
        });
        // Можно подтвердить отправку текущему отправителю:
        socket.emit('messageSent', { message: newMsg });
        // Дальше событие newMessage (из chatService.emit) автоматически дойдёт до другого участника (напрямую через onNewMessage)
      } catch (err) {
        console.error('Error sendMessage:', err);
        socket.emit('error', { error: 'Ошибка при отправке сообщения' });
      }
    });

    // Обрабатываем отключение клиента
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      unsubscribe(); // отменяем подписку на newMessage для этого сокета
    });
  });
};
