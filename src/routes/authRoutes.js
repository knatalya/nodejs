// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/signup
router.post('/signup', authController.signup);

// POST /api/signin
router.post('/signin', authController.signin);

// (Не обязательно, но можно реализовать) GET /api/logout
router.get('/logout', authController.logout);

module.exports = router;
