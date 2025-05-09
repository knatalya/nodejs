// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { Server, Socket } from 'socket.io';

import './db';
import BookModel from './models/book';
import booksApiRouter from './routes/books';

/**
 * Локальный тип для пользователя
 */
interface LocalUser {
  id: string;
  username: string;
  passwordHash: string;
}

/**
 * Расширяем Express.User нашими полями
 */
declare global {
  namespace Express {
    interface User extends LocalUser {}
  }
}

const users: LocalUser[] = [];
const comments: Record<string, Array<{ id: string; author: string; text: string; createdAt: string }>> = {};

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT || 3000);

// View engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Сессии + Passport
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// API-маршруты
app.use('/api/books', booksApiRouter);

// Настройка multer
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Защита маршрутов
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/user/login');
}

// Passport-local
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const u = users.find((u) => u.username === username);
    if (!u) return done(null, false, { message: 'Invalid username or password' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return done(null, false, { message: 'Invalid username or password' });
    return done(null, u);
  })
);

passport.serializeUser((user: Express.User, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const u = users.find((u) => u.id === id);
  done(null, u || false);
});

// UI-маршруты
app.get('/', (_req, res) => res.redirect('/books'));

app.get('/books', async (_req, res) => {
  const books = await BookModel.find().lean();
  res.render('index', { books });
});

app.get('/books/create', (_req, res) => res.render('create'));

app.post('/books/create', upload.single('fileBook'), async (req, res) => {
  const { title = '', description = '', authors = '', favorite = 'false', fileCover = '', fileName = '' } =
    req.body;
  const fileBook = req.file?.filename ?? '';
  await new BookModel({ title, description, authors, favorite: favorite === 'true', fileCover, fileName, fileBook }).save();
  res.redirect('/books');
});

app.get('/books/:id', async (req, res) => {
  const book = await BookModel.findById(req.params.id).lean();
  if (!book) return res.status(404).send('Книга не найдена');
  res.render('view', { book, comments: comments[book._id.toString()] || [] });
});

app.get('/books/:id/update', async (req, res) => {
  const book = await BookModel.findById(req.params.id).lean();
  if (!book) return res.status(404).send('Книга не найдена');
  res.render('update', { book });
});

app.post('/books/:id/update', upload.single('fileBook'), async (req, res) => {
  const updates: any = {};
  for (const k of ['title', 'description', 'authors', 'fileCover', 'fileName'] as const) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (req.body.favorite !== undefined) updates.favorite = req.body.favorite === 'true';
  if (req.file) updates.fileBook = req.file.filename;
  await BookModel.findByIdAndUpdate(req.params.id, updates);
  res.redirect('/books');
});

app.post('/books/:id/delete', async (req, res) => {
  await BookModel.findByIdAndDelete(req.params.id);
  delete comments[req.params.id];
  res.redirect('/books');
});

// Аутентификация
app.get('/api/user/login', (req, res) => res.render('login', { user: req.user, message: null }));

app.post('/api/user/signup', async (req, res, next) => {
  const { username, password } = req.body;
  if (users.some((u) => u.username === username)) {
    return res.render('login', { user: null, message: 'Username already taken' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: LocalUser = { id: uuidv4(), username, passwordHash };
  users.push(newUser);
  req.login(newUser, (err) => (err ? next(err) : res.redirect('/api/user/me')));
});

app.post(
  '/api/user/login',
  passport.authenticate('local', {
    successRedirect: '/api/user/me',
    failureRedirect: '/api/user/login',
  })
);

app.get('/api/user/me', ensureAuthenticated, (req, res) => res.render('me', { user: req.user }));

// Socket.IO для комментариев
io.on('connection', (socket: Socket) => {
  socket.on('joinRoom', (bookId: string) => socket.join(`book_${bookId}`));
  socket.on('newComment', (data: { bookId: string; author: string; text: string }) => {
    const { bookId, author, text } = data;
    const c = { id: uuidv4(), author, text, createdAt: new Date().toISOString() };
    comments[bookId] = comments[bookId] || [];
    comments[bookId].push(c);
    io.to(`book_${bookId}`).emit('commentAdded', c);
  });
});

// Запуск
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
