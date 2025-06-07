// src/routes/advertisementRoutes.js
const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');
const advertisementManager = require('../controllers/advertisementManageController'); // для POST, DELETE

// Публичные маршруты
router.get('/', advertisementController.getAll);
router.get('/:id', advertisementController.getById);

// Приватные маршруты (создание/удаление)
router.post('/', ensureAuthenticated, advertisementManager.createAd);
router.delete('/:id', ensureAuthenticated, advertisementManager.deleteAd);

module.exports = router;
