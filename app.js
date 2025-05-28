const express = require('express');
const session = require('express-session');
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;

const app = express();

const CLIENT_ID = 'ВАШ_CLIENT_ID_ЯНДЕКС';
const CLIENT_SECRET = 'ВАШ_CLIENT_SECRET_ЯНДЕКС';

// Настройка сессий
app.use(session({ secret: 'секрет', resave: false, saveUninitialized: false }));

// Инициализация passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка стратегии
passport.use(new YandexStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/yandex/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Здесь можно сохранить профиль пользователя в базу
    return done(null, profile);
  }
));

// Сериализация/десериализация пользователя для сессии
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Роуты

// Главная страница профиля (защищённый маршрут)
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.send(`<h1>Привет, ${req.user.displayName || 'Пользователь'}!</h1><a href="/logout">Выйти</a>`);
});

// Роут для логина через Яндекс
app.get('/login', passport.authenticate('yandex'));

// Callback после авторизации Яндекса
app.get('/auth/yandex/callback',
  passport.authenticate('yandex', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Выход из системы
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
