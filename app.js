const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

let books = [];

app.get('/', (req, res) => res.redirect('/books'));

app.get('/books', (req, res) => res.render('index', { books }));

app.get('/books/create', (req, res) => res.render('create'));

app.post('/books/create', upload.single('fileBook'), (req, res) => {
  const { title = '', description = '', authors = '', favorite = false, fileCover = '', fileName = '' } = req.body;
  const fileBook = req.file ? req.file.filename : '';
  books.push({
    id: uuidv4(),
    title,
    description,
    authors,
    favorite: favorite === 'true' || favorite === true,
    fileCover,
    fileName,
    fileBook
  });
  res.redirect('/books');
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('view', { book });
});

app.get('/books/:id/update', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Book not found');
  res.render('update', { book });
});

app.post('/books/:id/update', upload.single('fileBook'), (req, res) => {
  const index = books.findIndex(b => b.id === req.params.id);
  if (index === -1) return res.status(404).send('Book not found');
  const book = books[index];
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  const fileBook = req.file ? req.file.filename : book.fileBook;
  books[index] = {
    id: book.id,
    title: title ?? book.title,
    description: description ?? book.description,
    authors: authors ?? book.authors,
    favorite: favorite !== undefined ? (favorite === 'true' || favorite === true) : book.favorite,
    fileCover: fileCover ?? book.fileCover,
    fileName: fileName ?? book.fileName,
    fileBook
  };
  res.redirect('/books');
});

app.post('/books/:id/delete', (req, res) => {
  books = books.filter(b => b.id !== req.params.id);
  res.redirect('/books');
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
