const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let books = [];

app.post('/api/user/login', (req, res) => {
  res.status(201).json({ id: 1, mail: 'test@mail.ru' });
});

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  const newBook = {
    id: uuidv4(),
    title: title || '',
    description: description || '',
    authors: authors || '',
    favorite: favorite || '',
    fileCover: fileCover || '',
    fileName: fileName || ''
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  books[index] = {
    id,
    title: title || books[index].title,
    description: description || books[index].description,
    authors: authors || books[index].authors,
    favorite: favorite || books[index].favorite,
    fileCover: fileCover || books[index].fileCover,
    fileName: fileName || books[index].fileName
  };
  res.json(books[index]);
});

app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }
  books.splice(index, 1);
  res.json({ result: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
