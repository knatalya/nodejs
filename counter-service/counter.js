// counter-service/counter.js
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const file = new JSONFile('/data/db.json');
const db   = new Low(file);

await db.read();
db.data ||= { counters: {} };
await db.write();

const app = express();
app.use(express.json());

app.post('/counter/:bookId/incr', async (req, res) => {
  const { bookId } = req.params;
  db.data.counters[bookId] = (db.data.counters[bookId] || 0) + 1;
  await db.write();
  res.json({ bookId, count: db.data.counters[bookId] });
});

app.get('/counter/:bookId', (req, res) => {
  const { bookId } = req.params;
  res.json({ bookId, count: db.data.counters[bookId] || 0 });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Counter service on port ${PORT}`));
