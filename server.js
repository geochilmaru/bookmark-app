const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'bookmarks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readBookmarks() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeBookmarks(bookmarks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookmarks, null, 2), 'utf-8');
}

app.get('/api/bookmarks', (req, res) => {
  const { category, q } = req.query;
  let bookmarks = readBookmarks();
  if (category && category !== '전체') {
    bookmarks = bookmarks.filter(b => b.category === category);
  }
  if (q) {
    const lower = q.toLowerCase();
    bookmarks = bookmarks.filter(b =>
      b.title.toLowerCase().includes(lower) ||
      b.url.toLowerCase().includes(lower)
    );
  }
  res.json(bookmarks);
});

app.get('/api/bookmarks/check', (req, res) => {
  const { url } = req.query;
  if (!url) return res.json(null);
  const bookmarks = readBookmarks();
  const found = bookmarks.find(b => b.url.toLowerCase() === url.toLowerCase());
  res.json(found || null);
});

app.get('/api/categories', (req, res) => {
  const bookmarks = readBookmarks();
  const categories = [...new Set(bookmarks.map(b => b.category).filter(Boolean))];
  res.json(categories);
});

app.post('/api/bookmarks', (req, res) => {
  const { url, title, category } = req.body;
  if (!url || !title) {
    return res.status(400).json({ error: 'URL과 제목은 필수입니다.' });
  }
  const bookmarks = readBookmarks();
  const bookmark = {
    id: randomUUID(),
    url,
    title,
    category: category || '미분류',
    createdAt: new Date().toISOString(),
  };
  bookmarks.push(bookmark);
  writeBookmarks(bookmarks);
  res.status(201).json(bookmark);
});

app.put('/api/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const { url, title, category } = req.body;
  const bookmarks = readBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '북마크를 찾을 수 없습니다.' });
  }
  bookmarks[index] = { ...bookmarks[index], url, title, category };
  writeBookmarks(bookmarks);
  res.json(bookmarks[index]);
});

app.delete('/api/bookmarks/:id', (req, res) => {
  const { id } = req.params;
  const bookmarks = readBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  if (filtered.length === bookmarks.length) {
    return res.status(404).json({ error: '북마크를 찾을 수 없습니다.' });
  }
  writeBookmarks(filtered);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`북마크 앱 실행 중: http://localhost:${PORT}`);
});
