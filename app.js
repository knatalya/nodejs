// app.js
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');

// Подключение к MongoDB через Mongoose
const mongoose = require('./db');
// Mongoose-модель книги
const Book = require('./models/book');
// API-маршруты для CRUD через Mongoose
const booksApiRouter = require('./routes/books');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Настройка view-движка и статики
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Сессии и Passport
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Монтируем API-маршруты
app.use('/api/books', booksApiRouter);

// Файловые загрузки для книг
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// In-memory users store (заменить на БД в продакшене)
const users = [];

// Хранилище комментариев (можно тоже перенести в БД)
let comments = {}; // { bookId: [ {id, author, text, createdAt}, ... ] }

// Passport-local стратегия
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) return done(null, false, { message: 'Invalid username or password' });
    try {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return done(null, false, { message: 'Invalid username or password' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/user/login');
}

// UI-маршруты
// Главная — редирект на список книг
app.get('/', (req, res) => res.redirect('/books'));

// Список книг
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find().lean();
    res.render('index', { books });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при загрузке списка книг');
  }
});

// Форма создания
app.get('/books/create', (req, res) => res.render('create'));

// Создание книги
app.post('/books/create', upload.single('fileBook'), async (req, res) => {
  try {
    const { title = '', description = '', authors = '', favorite = false, fileCover = '', fileName = '' } = req.body;
    const fileBook = req.file ? req.file.filename : '';
    const book = new Book({ title, description, authors, favorite: favorite === 'true', fileCover, fileName, fileBook });
    await book.save();
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(400).send('Не удалось создать книгу');
  }
});

// Просмотр одной книги
app.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).send('Книга не найдена');
    res.render('view', { book, comments: comments[book.id] || [] });
  } catch (err) {
    res.status(400).send('Неверный ID книги');
  }
});

// Форма редактирования
app.get('/books/:id/update', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).send('Книга не найдена');
    res.render('update', { book });
  } catch (err) {
    res.status(400).send('Неверный ID книги');
  }
});

// Обновление книги
app.post('/books/:id/update', upload.single('fileBook'), async (req, res) => {
  try {
    const updates = {};
    [ 'title','description','authors','fileCover','fileName' ].forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (req.body.favorite !== undefined) {
      updates.favorite = req.body.favorite === 'true';
    }
    if (req.file) {
      updates.fileBook = req.file.filename;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!book) return res.status(404).send('Книга не найдена');
    res.redirect('/books');
  } catch (err) {
    console.error(err);
    res.status(400).send('Не удалось обновить книгу');
  }
});

// Удаление книги
app.post('/books/:id/delete', async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send('Книга не найдена');
    delete comments[req.params.id];
    res.redirect('/books');
  } catch (err) {
    res.status(400).send('Неверный ID книги');
  }
});

// Маршруты авторизации
app.get('/api/user/login', (req, res) => res.render('login', { user: req.user, message: null }));
app.post('/api/user/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.render('login', { user: null, message: 'Username already taken' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, passwordHash };
  users.push(newUser);
  req.login(newUser, err => {
    if (err) return res.redirect('/api/user/login');
    res.redirect('/api/user/me');
  });
});
app.post('/api/user/login', passport.authenticate('local', {
  successRedirect: '/api/user/me',
  failureRedirect: '/api/user/login'
}));
app.get('/api/user/me', ensureAuthenticated, (req, res) => res.render('me', { user: req.user }));

// Socket.IO для комментариев
io.on('connection', socket => {
  socket.on('joinRoom', bookId => socket.join(`book_${bookId}`));
  socket.on('newComment', data => {
    const { bookId, author, text } = data;
    const comment = { id: uuidv4(), author, text, createdAt: new Date().toISOString() };
    comments[bookId] = comments[bookId] || [];
    comments[bookId].push(comment);
    io.to(`book_${bookId}`).emit('commentAdded', comment);
  });
});

// Запуск сервера
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
