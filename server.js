const fs = require('fs');
const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3003;
const LOG_FILE = path.join(__dirname, 'requests.log');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: '*/*', limit: '10mb' }));

function resolveBody(req) {
  if (req.body === undefined || req.body === null || req.body === '') {
    return undefined;
  }
  return req.body;
}

function logRequest(req) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    query: req.query,
    body: resolveBody(req),
  };

  const printable = `\n[${timestamp}] ${req.method} ${req.originalUrl}\nHeaders: ${JSON.stringify(entry.headers, null, 2)}\nQuery: ${JSON.stringify(entry.query, null, 2)}\nBody: ${JSON.stringify(entry.body, null, 2)}\n`;

  console.log(printable);
  fs.appendFile(LOG_FILE, printable + '\n', (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });

  return entry;
}

// Fake NewsroomQ success responses so the CMS's sync flow proceeds all the way through

app.post('/stories', (req, res) => {
  logRequest(req);
  res.status(200).json({
    status: 'success',
    story: { id: 123 },
  });
});

app.patch('/stories/:id', (req, res) => {
  logRequest(req);
  res.status(200).json({ status: 'success' });
});

app.get('/stories/:id/story_media', (req, res) => {
  logRequest(req);
  res.status(200).json({ status: 'success', story_media: [] });
});

app.post('/stories/:id/story_media', (req, res) => {
  logRequest(req);
  res.status(200).json({
    status: 'success',
    story_medium: { id: 789 },
  });
});

app.post('/media', (req, res) => {
  logRequest(req);
  res.status(200).json({
    status: 'success',
    medium: { id: 456, file: 'done' },
  });
});

app.get('/media/:id', (req, res) => {
  logRequest(req);
  res.status(200).json({
    medium: { id: Number(req.params.id), file: 'done', cutline: '', credit: '' },
  });
});

app.patch('/media/:id', (req, res) => {
  logRequest(req);
  res.status(200).json({ status: 'success' });
});

app.all(/.*/, (req, res) => {
  const entry = logRequest(req);
  res.status(200).json(entry);
});

app.listen(PORT, () => {
  console.log(`api-tester listening on http://localhost:${PORT}`);
  console.log(`Logging requests to console and ${LOG_FILE}`);
});
