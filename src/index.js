// src/index.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

// Роуты
const authRoutes = require('./routes/authRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Socket.IO-обработчики
const initChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);

// Настройка Socket.IO поверх уже созданного HTTP-сервера
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Применяем CORS (если фронтенд будет на другом домене)
// app.use(cors({ origin: 'http://localhost:8080', credentials: true }));

app.use(cors()); // для простоты разрешаем всё

// Парсинг JSON и FormData
app.use(express.json());

// Статическая папка для раздачи загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка сессий
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat', // обязательна собственная строка
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // в продакшене: true при https
  })
);

// Настройка Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport); // инициализируем стратегию

// Подключение роутов
app.use('/api', authRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/chat', chatRoutes);

// 404 для прочих путей
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', status: 'error' });
});

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
    // Запускаем сервер после успешного подключения
    const PORT = process.env.HTTP_PORT || 3000;
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

    // Инициализация Socket.IO-модуля чата
    initChatSocket(io);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
