import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const distPath = path.join(__dirname, 'dist');

app.disable('x-powered-by');

// Health check endpoint for Cloud Run and monitoring
app.get('/_health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Serve static assets from dist folder
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    index: 'index.html',
  }));

  // SPA fallback: any route serves index.html
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (_req: Request, res: Response) => {
    res.status(200).send('<h1>PoemPlay</h1><p>Starting up...</p>');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PoemPlay server running on http://0.0.0.0:${PORT}`);
});
