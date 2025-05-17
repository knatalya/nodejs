// src/app.ts
import 'reflect-metadata';
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
import { container } from './container';
import { BooksRepository } from './repositories/BooksRepository';
import booksApiRouter from './routes/books';

/** Локальный тип для пользователя */
interface LocalUser {
  id: string;
  username: string;
  passwordHash: string;
}

declare global {
  namespace Express { interface User extends LocalUser {} }
}

const users: LocalUser[] = [];
const comments: Record<string, Array<{ id: string; author: string; text: string; createdAt: string }>> = {};

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = Number(process.env.PORT || 3000);

// View engine & static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions + Passport
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Register API router
app.use('/api/books', booksApiRouter);

// Multer setup
const uploadDir = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Auth middleware
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/user/login');
}

// Passport-local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = users.find((u) => u.username === username);
      if (!user) return done(null, false, { message: 'Invalid credentials' });
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  })
);

passport.serializeUser((user: Express.User, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

// DI: получаем BooksRepository
const booksRepo = container.get<BooksRepository>(BooksRepository);

// UI routes
app.get('/', (_req, res) => res.redirect('/books'));

app.get('/books', async (_req, res, next) => {
  try {
    const books = await booksRepo.getBooks();
    res.render('index', { books });
  } catch (err) {
    next(err);
  }
});

app.get('/books/create', ensureAuthenticated, (_req, res) => res.render('create'));

app.post('/books/create', ensureAuthenticated, upload.single('fileBook'), async (req, res, next) => {
  try {
    const { title, description, authors, favorite, fileCover, fileName } = req.body;
    const fileBook = req.file?.filename ?? '';
    await booksRepo.createBook({
      title,
      description,
      authors,
      favorite: favorite === 'true',
      fileCover,
      fileName,
      fileBook,
    });
    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

app.get('/books/:id', async (req, res, next) => {
  try {
    const book = await booksRepo.getBook(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('view', { book, comments: comments[req.params.id] || [] });
  } catch (err) {
    next(err);
  }
});

app.get('/books/:id/update', ensureAuthenticated, async (req, res, next) => {
  try {
    const book = await booksRepo.getBook(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.render('update', { book });
  } catch (err) {
    next(err);
  }
});

app.post('/books/:id/update', ensureAuthenticated, upload.single('fileBook'), async (req, res, next) => {
  try {
    const updates: Partial<any> = {};
    ['title', 'description', 'authors', 'fileCover', 'fileName'].forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (req.body.favorite !== undefined) updates.favorite = req.body.favorite === 'true';
    if (req.file) updates.fileBook = req.file.filename;
    await booksRepo.updateBook(req.params.id, updates);
    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

app.post('/books/:id/delete', ensureAuthenticated, async (req, res, next) => {
  try {
    await booksRepo.deleteBook(req.params.id);
    delete comments[req.params.id];
    res.redirect('/books');
  } catch (err) {
    next(err);
  }
});

// Auth endpoints
app.get('/api/user/login', (req, res) => res.render('login', { user: req.user, message: null }));

app.post('/api/user/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (users.some((u) => u.username === username)) {
      return res.render('login', { user: null, message: 'Username taken' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: LocalUser = { id: uuidv4(), username, passwordHash };
    users.push(newUser);
    req.login(newUser, (err) => (err ? next(err) : res.redirect('/api/user/me')));
  } catch (err) {
    next(err);
  }
});

app.post('/api/user/login', passport.authenticate('local', { successRedirect: '/api/user/me', failureRedirect: '/api/user/login' }));
app.get('/api/user/me', ensureAuthenticated, (req, res) => res.render('me', { user: req.user }));

// Socket.IO comments
io.on('connection', (socket: Socket) => {
  socket.on('joinRoom', (bookId: string) => socket.join(`book_${bookId}`));
  socket.on('newComment', ({ bookId, author, text }) => {
    const comment = { id: uuidv4(), author, text, createdAt: new Date().toISOString() };
    comments[bookId] = comments[bookId] || [];
    comments[bookId].push(comment);
    io.to(`book_${bookId}`).emit('commentAdded', comment);
  });
});

// Запуск сервера
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));