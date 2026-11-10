import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const distPath = path.join(__dirname, 'dist');

// Disable etag caching issues during fast deployments
app.disable('x-powered-by');

// Health check endpoint for Cloud Run and monitoring
app.get('/_health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from dist folder
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    index: 'index.html',
  }));

  // SPA fallback: any route serves index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send('<h1>PoemPlay</h1><p>Starting up...</p>');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PoemPlay server running on http://0.0.0.0:${PORT}`);
});
