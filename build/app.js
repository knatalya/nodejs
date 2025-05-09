"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
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
const book_1 = __importDefault(require("./models/book"));
const books_1 = __importDefault(require("./routes/books"));
const users = [];
const comments = {};
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const PORT = Number(process.env.PORT || 3000);
// View engine & static
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Сессии + Passport
app.use((0, express_session_1.default)({ secret: 'your_secret_key', resave: false, saveUninitialized: false }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// API-маршруты
app.use('/api/books', books_1.default);
// Настройка multer
const UPLOAD_DIR = path_1.default.join(__dirname, 'uploads');
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`),
});
const upload = (0, multer_1.default)({ storage });
// Защита маршрутов
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/api/user/login');
}
// Passport-local
passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
    const u = users.find((u) => u.username === username);
    if (!u)
        return done(null, false, { message: 'Invalid username or password' });
    const ok = await bcrypt_1.default.compare(password, u.passwordHash);
    if (!ok)
        return done(null, false, { message: 'Invalid username or password' });
    return done(null, u);
}));
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser((id, done) => {
    const u = users.find((u) => u.id === id);
    done(null, u || false);
});
// UI-маршруты
app.get('/', (_req, res) => res.redirect('/books'));
app.get('/books', async (_req, res) => {
    const books = await book_1.default.find().lean();
    res.render('index', { books });
});
app.get('/books/create', (_req, res) => res.render('create'));
app.post('/books/create', upload.single('fileBook'), async (req, res) => {
    const { title = '', description = '', authors = '', favorite = 'false', fileCover = '', fileName = '' } = req.body;
    const fileBook = req.file?.filename ?? '';
    await new book_1.default({ title, description, authors, favorite: favorite === 'true', fileCover, fileName, fileBook }).save();
    res.redirect('/books');
});
app.get('/books/:id', async (req, res) => {
    const book = await book_1.default.findById(req.params.id).lean();
    if (!book)
        return res.status(404).send('Книга не найдена');
    res.render('view', { book, comments: comments[book._id.toString()] || [] });
});
app.get('/books/:id/update', async (req, res) => {
    const book = await book_1.default.findById(req.params.id).lean();
    if (!book)
        return res.status(404).send('Книга не найдена');
    res.render('update', { book });
});
app.post('/books/:id/update', upload.single('fileBook'), async (req, res) => {
    const updates = {};
    for (const k of ['title', 'description', 'authors', 'fileCover', 'fileName']) {
        if (req.body[k] !== undefined)
            updates[k] = req.body[k];
    }
    if (req.body.favorite !== undefined)
        updates.favorite = req.body.favorite === 'true';
    if (req.file)
        updates.fileBook = req.file.filename;
    await book_1.default.findByIdAndUpdate(req.params.id, updates);
    res.redirect('/books');
});
app.post('/books/:id/delete', async (req, res) => {
    await book_1.default.findByIdAndDelete(req.params.id);
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
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const newUser = { id: (0, uuid_1.v4)(), username, passwordHash };
    users.push(newUser);
    req.login(newUser, (err) => (err ? next(err) : res.redirect('/api/user/me')));
});
app.post('/api/user/login', passport_1.default.authenticate('local', {
    successRedirect: '/api/user/me',
    failureRedirect: '/api/user/login',
}));
app.get('/api/user/me', ensureAuthenticated, (req, res) => res.render('me', { user: req.user }));
// Socket.IO для комментариев
io.on('connection', (socket) => {
    socket.on('joinRoom', (bookId) => socket.join(`book_${bookId}`));
    socket.on('newComment', (data) => {
        const { bookId, author, text } = data;
        const c = { id: (0, uuid_1.v4)(), author, text, createdAt: new Date().toISOString() };
        comments[bookId] = comments[bookId] || [];
        comments[bookId].push(c);
        io.to(`book_${bookId}`).emit('commentAdded', c);
    });
});
// Запуск
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
