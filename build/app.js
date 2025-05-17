"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const socket_io_1 = require("socket.io");
require("./db");
const container_1 = require("./container");
const BooksRepository_1 = require("./repositories/BooksRepository");
const books_1 = __importDefault(require("./routes/books"));
const users = [];
const comments = {};
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const PORT = Number(process.env.PORT || 3000);
// View engine & static files
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Sessions + Passport
app.use((0, express_session_1.default)({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Register API router
app.use('/api/books', books_1.default);
// Multer setup
const uploadDir = path_1.default.join(__dirname, 'uploads');
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`),
});
const upload = (0, multer_1.default)({ storage });
// Auth middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/api/user/login');
}
// Passport-local strategy
passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
    try {
        const user = users.find((u) => u.username === username);
        if (!user)
            return done(null, false, { message: 'Invalid credentials' });
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid)
            return done(null, false, { message: 'Invalid credentials' });
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser((id, done) => {
    const user = users.find((u) => u.id === id);
    done(null, user || false);
});
// DI: получаем BooksRepository
const booksRepo = container_1.container.get(BooksRepository_1.BooksRepository);
// UI routes
app.get('/', (_req, res) => res.redirect('/books'));
app.get('/books', async (_req, res, next) => {
    try {
        const books = await booksRepo.getBooks();
        res.render('index', { books });
    }
    catch (err) {
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
    }
    catch (err) {
        next(err);
    }
});
app.get('/books/:id', async (req, res, next) => {
    try {
        const book = await booksRepo.getBook(req.params.id);
        if (!book)
            return res.status(404).send('Book not found');
        res.render('view', { book, comments: comments[req.params.id] || [] });
    }
    catch (err) {
        next(err);
    }
});
app.get('/books/:id/update', ensureAuthenticated, async (req, res, next) => {
    try {
        const book = await booksRepo.getBook(req.params.id);
        if (!book)
            return res.status(404).send('Book not found');
        res.render('update', { book });
    }
    catch (err) {
        next(err);
    }
});
app.post('/books/:id/update', ensureAuthenticated, upload.single('fileBook'), async (req, res, next) => {
    try {
        const updates = {};
        ['title', 'description', 'authors', 'fileCover', 'fileName'].forEach((key) => {
            if (req.body[key] !== undefined)
                updates[key] = req.body[key];
        });
        if (req.body.favorite !== undefined)
            updates.favorite = req.body.favorite === 'true';
        if (req.file)
            updates.fileBook = req.file.filename;
        await booksRepo.updateBook(req.params.id, updates);
        res.redirect('/books');
    }
    catch (err) {
        next(err);
    }
});
app.post('/books/:id/delete', ensureAuthenticated, async (req, res, next) => {
    try {
        await booksRepo.deleteBook(req.params.id);
        delete comments[req.params.id];
        res.redirect('/books');
    }
    catch (err) {
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
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const newUser = { id: (0, uuid_1.v4)(), username, passwordHash };
        users.push(newUser);
        req.login(newUser, (err) => (err ? next(err) : res.redirect('/api/user/me')));
    }
    catch (err) {
        next(err);
    }
});
app.post('/api/user/login', passport_1.default.authenticate('local', { successRedirect: '/api/user/me', failureRedirect: '/api/user/login' }));
app.get('/api/user/me', ensureAuthenticated, (req, res) => res.render('me', { user: req.user }));
// Socket.IO comments
io.on('connection', (socket) => {
    socket.on('joinRoom', (bookId) => socket.join(`book_${bookId}`));
    socket.on('newComment', ({ bookId, author, text }) => {
        const comment = { id: (0, uuid_1.v4)(), author, text, createdAt: new Date().toISOString() };
        comments[bookId] = comments[bookId] || [];
        comments[bookId].push(comment);
        io.to(`book_${bookId}`).emit('commentAdded', comment);
    });
});
// Запуск сервера
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
