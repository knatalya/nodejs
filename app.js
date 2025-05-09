// server.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory users store (replace with DB in production)
const users = [];

// Passport configuration
passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async (username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) return done(null, false, { message: 'Invalid username or password' });
  try {
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return done(null, false, { message: 'Invalid username or password' });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// File uploads for books (existing code)
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });
let books = [];

// Authentication helper
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/api/user/login');
}

// Book routes (unchanged)
app.get('/', (req, res) => res.redirect('/books'));
app.get('/books', (req, res) => res.render('index', { books }));
app.get('/books/create', (req, res) => res.render('create'));
app.post('/books/create', upload.single('fileBook'), (req, res) => {
  const { title = '', description = '', authors = '', favorite = false, fileCover = '', fileName = '' } = req.body;
  const fileBook = req.file ? req.file.filename : '';
  books.push({ id: uuidv4(), title, description, authors, favorite: favorite === 'true' || favorite === true, fileCover, fileName, fileBook });
  res.redirect('/books');
});
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('view', { book });
});
app.get('/books/:id/update', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('update', { book });
});
app.post('/books/:id/update', upload.single('fileBook'), (req, res) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).send('Book not found');
  const book = books[index];
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  const fileBook = req.file ? req.file.filename : book.fileBook;
  books[index] = { id: book.id, title: title ?? book.title, description: description ?? book.description, authors: authors ?? book.authors, favorite: favorite !== undefined ? (favorite === 'true' || favorite === true) : book.favorite, fileCover: fileCover ?? book.fileCover, fileName: fileName ?? book.fileName, fileBook };
  res.redirect('/books');
});
app.post('/books/:id/delete', (req, res) => {
  books = books.filter(b => b.id !== req.params.id);
  res.redirect('/books');
});

// User auth routes
// Login & Signup page (combined)
app.get('/api/user/login', (req, res) => {
  res.render('login', { user: req.user, message: null });
});

// Handle signup
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
    return res.redirect('/api/user/me');
  });
});

// Handle login
app.post('/api/user/login', passport.authenticate('local', {
  successRedirect: '/api/user/me',
  failureRedirect: '/api/user/login'
}));

// Profile page
app.get('/api/user/me', ensureAuthenticated, (req, res) => {
  res.render('me', { user: req.user });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));