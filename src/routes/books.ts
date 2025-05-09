// src/routes/books.ts
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import BookModel from '../models/book';

const router = Router();

// GET /api/books — получить все книги
router.get('/', async (_req: Request, res: Response) => {
  try {
    const books = await BookModel.find().lean();
    return res.json(books);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books/:id — получить книгу по ID
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const book = await BookModel.findById(id).lean();
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/books — создать книгу
router.post('/', async (req: Request, res: Response) => {
  try {
    const book = new BookModel(req.body);
    await book.save();
    return res.status(201).json(book.toObject());
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/books/:id — редактировать книгу по ID
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const updated = await BookModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: 'query',
    }).lean();
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    return res.json(updated);
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/books/:id — удалить книгу по ID
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  try {
    const result = await BookModel.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Book not found' });
    return res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
