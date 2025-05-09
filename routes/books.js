// routes/books.js
const express = require('express');
const Book = require('../models/book');
const router = express.Router();

// GET /api/books — получить все книги
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books/:id — получить книгу по ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// POST /api/books — создать книгу
router.post('/', async (req, res) => {
  try {
    const { title, description, authors, favorite, fileCover, fileName, fileBook } = req.body;
    const book = new Book({ title, description, authors, favorite, fileCover, fileName, fileBook });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/books/:id — редактировать книгу по ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      context: 'query'
    }).lean();
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/books/:id — удалить книгу по ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Book not found' });
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

module.exports = router;
