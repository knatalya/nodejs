const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

let books = [];

app.post('/api/user/login', (req, res) => {
  res.status(201).json({ id: 1, mail: 'test@mail.ru' });
});

const booksRouter = express.Router();

booksRouter.get('/', (req, res) => {
  res.json(books);
});

booksRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

booksRouter.post('/', upload.single('fileBook'), (req, res) => {
  const { title = '', description = '', authors = '', favorite = false, fileCover = '', fileName = '' } = req.body;
  const fileBook = req.file ? req.file.filename : '';
  const newBook = {
    id: uuidv4(),
    title,
    description,
    authors,
    favorite: favorite === 'true' || favorite === true,
    fileCover,
    fileName,
    fileBook
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

booksRouter.put('/:id', upload.single('fileBook'), (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const book = books[index];
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  const fileBook = req.file ? req.file.filename : book.fileBook;

  books[index] = {
    id,
    title: title ?? book.title,
    description: description ?? book.description,
    authors: authors ?? book.authors,
    favorite: (favorite !== undefined) ? (favorite === 'true' || favorite === true) : book.favorite,
    fileCover: fileCover ?? book.fileCover,
    fileName: fileName ?? book.fileName,
    fileBook
  };
  res.json(books[index]);
});

booksRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  books.splice(index, 1);
  res.json({ result: 'ok' });
});

booksRouter.get('/:id/download', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  if (!book || !book.fileBook) return res.status(404).json({ error: 'Book or file not found' });
  const filePath = path.join(UPLOAD_DIR, book.fileBook);
  res.download(filePath, book.fileName || book.fileBook);
});

app.use('/api/books', booksRouter);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
