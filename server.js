// server.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch'); // HTTP-клиент для обращения к счётчику

const app = express();
const PORT = process.env.PORT || 3000;

// URL микросервиса счётчика (в docker-compose — service name)
const COUNTER_BASE = process.env.COUNTER_URL || 'http://counter-service:4000';

// In-memory users store (для продакшена — вместо этого БД)
const users = [];

/* ===== Passport Configuration ===== */
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) return done(null, false, { message: 'Неверный логин или пароль' });
    try {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return done(null, false, { message: 'Неверный логин или пароль' });
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

/* ===== Middleware ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/* ===== Настройка загрузки файлов ===== */
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });
let books = [];

/* ===== Хелпер для защиты маршрутов ===== */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/user/login');
}

/* ===== Маршруты для книг ===== */
app.get('/',                 (req, res) => res.redirect('/books'));
app.get('/books',            (req, res) => res.render('index', { books }));

app.get('/books/create',     (req, res) => res.render('create'));
app.post('/books/create', upload.single('fileBook'), (req, res) => {
  const { title = '', description = '', authors = '', favorite = false, fileCover = '', fileName = '' } = req.body;
  const fileBook = req.file ? req.file.filename : '';
  books.push({
    id: uuidv4(),
    title,
    description,
    authors,
    favorite: favorite === 'true' || favorite === true,
    fileCover,
    fileName,
    fileBook
  });
  res.redirect('/books');
});

// Просмотр книги + интеграция счётчика
app.get('/books/:id', ensureAuthenticated, async (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');

  // 1) Увеличиваем счётчик
  await fetch(`${COUNTER_BASE}/counter/${book.id}/incr`, { method: 'POST' });

  // 2) Получаем текущее значение
  const counterRes = await fetch(`${COUNTER_BASE}/counter/${book.id}`);
  const { count: viewCount } = await counterRes.json();

  res.render('view', { book, viewCount });
});

app.get('/books/:id/update', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('update', { book });
});
app.post('/books/:id/update', upload.single('fileBook'), (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).send('Book not found');
  const book = books[idx];
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  const fileBook = req.file ? req.file.filename : book.fileBook;
  books[idx] = {
    id: book.id,
    title:      title ?? book.title,
    description:description ?? book.description,
    authors:    authors ?? book.authors,
    favorite:   favorite !== undefined ? (favorite === 'true' || favorite === true) : book.favorite,
    fileCover:  fileCover ?? book.fileCover,
    fileName:   fileName ?? book.fileName,
    fileBook
  };
  res.redirect('/books');
});
app.post('/books/:id/delete', (req, res) => {
  books = books.filter(b => b.id !== req.params.id);
  res.redirect('/books');
});

/* ===== Маршруты авторизации ===== */
// Страница логина/регистрации
app.get('/api/user/login', (req, res) => {
  res.render('login', { user: req.user, message: null });
});

// Регистрация
app.post('/api/user/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.render('login', { user: null, message: 'Пользователь уже существует' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username, passwordHash };
  users.push(newUser);
  req.login(newUser, err => {
    if (err) return res.redirect('/api/user/login');
    return res.redirect('/api/user/me');
  });
});

// Логин
app.post('/api/user/login', passport.authenticate('local', {
  successRedirect: '/api/user/me',
  failureRedirect: '/api/user/login'
}));

// Профиль
app.get('/api/user/me', ensureAuthenticated, (req, res) => {
  res.render('me', { user: req.user });
});

/* ===== Запуск сервера ===== */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
