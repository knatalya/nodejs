"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/books.ts
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const book_1 = __importDefault(require("../models/book"));
const router = (0, express_1.Router)();
// GET /api/books — получить все книги
router.get('/', async (_req, res) => {
    try {
        const books = await book_1.default.find().lean();
        return res.json(books);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/books/:id — получить книгу по ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
        const book = await book_1.default.findById(id).lean();
        if (!book)
            return res.status(404).json({ error: 'Book not found' });
        return res.json(book);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/books — создать книгу
router.post('/', async (req, res) => {
    try {
        const book = new book_1.default(req.body);
        await book.save();
        return res.status(201).json(book.toObject());
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
});
// PUT /api/books/:id — редактировать книгу по ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
        const updated = await book_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
            context: 'query',
        }).lean();
        if (!updated)
            return res.status(404).json({ error: 'Book not found' });
        return res.json(updated);
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ error: err.message });
    }
});
// DELETE /api/books/:id — удалить книгу по ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
        const result = await book_1.default.findByIdAndDelete(id);
        if (!result)
            return res.status(404).json({ error: 'Book not found' });
        return res.json({ status: 'ok' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
