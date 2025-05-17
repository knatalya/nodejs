"use strict";
// src/app.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var uuid_1 = require("uuid");
var multer_1 = require("multer");
var path_1 = require("path");
var express_session_1 = require("express-session");
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var bcrypt_1 = require("bcrypt");
var socket_io_1 = require("socket.io");
// Mongoose-коннектор (просто выполняет подключение)
require("./db");
// Mongoose-модель и её интерфейс (предполагается, что в models/book.ts есть
// export interface IBook и export default mongoose.model<IBook>(...))
var book_1 = require("./models/book");
// API-маршруты (предполагается, что routes/books.ts экспортирует default Router)
var books_1 = require("./routes/books");
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server);
var PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
// Настройка view-движка и директорий
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Сессии + Passport
app.use((0, express_session_1.default)({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Подключаем CRUD-роутер для API
app.use('/api/books', books_1.default);
// Настройка multer для загрузки файлов
var UPLOAD_DIR = path_1.default.join(__dirname, 'uploads');
var storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) { return cb(null, UPLOAD_DIR); },
    filename: function (_req, file, cb) { return cb(null, "".concat((0, uuid_1.v4)()).concat(path_1.default.extname(file.originalname))); },
});
var upload = (0, multer_1.default)({ storage: storage });
// In-memory хранилища для пользователей и комментариев
var users = [];
var comments = {};
/**
 * Защищённый маршрут
 */
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/api/user/login');
}
/** Настройка стратегии локальной аутентификации */
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'username', passwordField: 'password' }, function (username, password, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, match;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = users.find(function (u) { return u.username === username; });
                if (!user)
                    return [2 /*return*/, done(null, false, { message: 'Invalid username or password' })];
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.passwordHash)];
            case 1:
                match = _a.sent();
                if (!match)
                    return [2 /*return*/, done(null, false, { message: 'Invalid username or password' })];
                return [2 /*return*/, done(null, user)];
        }
    });
}); }));
passport_1.default.serializeUser(function (user, done) { return done(null, user.id); });
passport_1.default.deserializeUser(function (id, done) {
    var user = users.find(function (u) { return u.id === id; });
    done(null, user || false);
});
// UI-маршруты
app.get('/', function (_req, res) {
    res.redirect('/books');
});
app.get('/books', function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var books, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, book_1.default.find().lean()];
            case 1:
                books = _a.sent();
                res.render('index', { books: books });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).send('Ошибка при загрузке списка книг');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/books/create', function (_req, res) {
    res.render('create');
});
app.post('/books/create', upload.single('fileBook'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, title, _c, description, _d, authors, _e, favorite, _f, fileCover, _g, fileName, fileBook, book, err_2;
    var _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 2, , 3]);
                _a = req.body, _b = _a.title, title = _b === void 0 ? '' : _b, _c = _a.description, description = _c === void 0 ? '' : _c, _d = _a.authors, authors = _d === void 0 ? '' : _d, _e = _a.favorite, favorite = _e === void 0 ? 'false' : _e, _f = _a.fileCover, fileCover = _f === void 0 ? '' : _f, _g = _a.fileName, fileName = _g === void 0 ? '' : _g;
                fileBook = (_j = (_h = req.file) === null || _h === void 0 ? void 0 : _h.filename) !== null && _j !== void 0 ? _j : '';
                book = new book_1.default({
                    title: title,
                    description: description,
                    authors: authors,
                    favorite: favorite === 'true',
                    fileCover: fileCover,
                    fileName: fileName,
                    fileBook: fileBook,
                });
                return [4 /*yield*/, book.save()];
            case 1:
                _k.sent();
                res.redirect('/books');
                return [3 /*break*/, 3];
            case 2:
                err_2 = _k.sent();
                console.error(err_2);
                res.status(400).send('Не удалось создать книгу');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/books/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var book, bookComments, err_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, book_1.default.findById(req.params.id).lean()];
            case 1:
                book = _b.sent();
                if (!book)
                    return [2 /*return*/, res.status(404).send('Книга не найдена')];
                bookComments = (_a = comments[book.id]) !== null && _a !== void 0 ? _a : [];
                res.render('view', { book: book, comments: bookComments });
                return [3 /*break*/, 3];
            case 2:
                err_3 = _b.sent();
                console.error(err_3);
                res.status(400).send('Неверный ID книги');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/books/:id/update', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var book, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, book_1.default.findById(req.params.id).lean()];
            case 1:
                book = _a.sent();
                if (!book)
                    return [2 /*return*/, res.status(404).send('Книга не найдена')];
                res.render('update', { book: book });
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                console.error(err_4);
                res.status(400).send('Неверный ID книги');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/books/:id/update', upload.single('fileBook'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var updates, _i, _a, key, book, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                updates = {};
                for (_i = 0, _a = ['title', 'description', 'authors', 'fileCover', 'fileName']; _i < _a.length; _i++) {
                    key = _a[_i];
                    if (req.body[key] !== undefined)
                        updates[key] = req.body[key];
                }
                if (req.body.favorite !== undefined) {
                    updates.favorite = req.body.favorite === 'true';
                }
                if (req.file) {
                    updates.fileBook = req.file.filename;
                }
                return [4 /*yield*/, book_1.default.findByIdAndUpdate(req.params.id, updates, { new: true })];
            case 1:
                book = _b.sent();
                if (!book)
                    return [2 /*return*/, res.status(404).send('Книга не найдена')];
                res.redirect('/books');
                return [3 /*break*/, 3];
            case 2:
                err_5 = _b.sent();
                console.error(err_5);
                res.status(400).send('Не удалось обновить книгу');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/books/:id/delete', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, book_1.default.findByIdAndDelete(req.params.id)];
            case 1:
                result = _a.sent();
                if (!result)
                    return [2 /*return*/, res.status(404).send('Книга не найдена')];
                delete comments[req.params.id];
                res.redirect('/books');
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                console.error(err_6);
                res.status(400).send('Неверный ID книги');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Маршруты аутентификации
app.get('/api/user/login', function (req, res) {
    res.render('login', { user: req.user, message: null });
});
app.post('/api/user/signup', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username_1, password, passwordHash, newUser, err_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, username_1 = _a.username, password = _a.password;
                if (users.some(function (u) { return u.username === username_1; })) {
                    return [2 /*return*/, res.render('login', { user: null, message: 'Username already taken' })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 1:
                passwordHash = _b.sent();
                newUser = { id: (0, uuid_1.v4)(), username: username_1, passwordHash: passwordHash };
                users.push(newUser);
                req.login(newUser, function (err) {
                    if (err)
                        return next(err);
                    res.redirect('/api/user/me');
                });
                return [3 /*break*/, 3];
            case 2:
                err_7 = _b.sent();
                next(err_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/user/login', passport_1.default.authenticate('local', {
    successRedirect: '/api/user/me',
    failureRedirect: '/api/user/login',
}));
app.get('/api/user/me', ensureAuthenticated, function (req, res) {
    res.render('me', { user: req.user });
});
// Socket.IO для комментариев
io.on('connection', function (socket) {
    socket.on('joinRoom', function (bookId) {
        socket.join("book_".concat(bookId));
    });
    socket.on('newComment', function (data) {
        var bookId = data.bookId, author = data.author, text = data.text;
        var comment = {
            id: (0, uuid_1.v4)(),
            author: author,
            text: text,
            createdAt: new Date().toISOString(),
        };
        comments[bookId] = comments[bookId] || [];
        comments[bookId].push(comment);
        io.to("book_".concat(bookId)).emit('commentAdded', comment);
    });
});
// Запуск
server.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
