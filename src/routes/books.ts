import { Router } from 'express';
import { container } from '../container';
import { BooksRepository } from '../repositories/BooksRepository';

const router = Router();
const repo = container.get<BooksRepository>(BooksRepository);

// Получить все книги
router.get('/', async (_req, res, next) => {
  try {
    const books = await repo.getBooks();
    res.json(books);
  } catch (err) {
    next(err);
  }
});

// Получить книгу по ID
router.get('/:id', async (req, res, next) => {
  try {
    const book = await repo.getBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// Создать новую книгу
router.post('/', async (req, res, next) => {
  try {
    const created = await repo.createBook(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Обновить книгу
router.put('/:id', async (req, res, next) => {
  try {
    await repo.updateBook(req.params.id, req.body);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// Удалить книгу
router.delete('/:id', async (req, res, next) => {
  try {
    await repo.deleteBook(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
