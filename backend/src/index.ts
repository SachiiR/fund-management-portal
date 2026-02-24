import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:4300' }));
app.use(express.json());

// Safer path (works in dev + build)
const DATA_PATH = path.resolve(process.cwd(), 'data/funds_data.json');

// ---------- Helper Functions ----------

function readData(): any[] {
  try {
    const content = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading funds_data.json:', err);
    throw err;
  }
}

function writeData(data: any[]): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing funds_data.json:', err);
    throw err;
  }
}

function findByName(data: any[], name: string): number {
  return data.findIndex(f => f.name === name);
}

// ---------- Routes ----------

// Root
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Funds API is running',
    endpoints: [
      'GET /api/funds',
      'GET /api/funds/:name',
      'PUT /api/funds/:name',
      'DELETE /api/funds/:name'
    ]
  });
});

// GET all funds
app.get('/api/funds', (_req: Request, res: Response) => {
  try {
    const data = readData();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to read funds data' });
  }
});

// GET single fund
app.get(
  '/api/funds/:name',
  (req: Request<{ name: string }>, res: Response) => {
    try {
      const name = decodeURIComponent(req.params.name);
      const data = readData();
      const idx = findByName(data, name);

      if (idx === -1) {
        return res.status(404).json({ error: `Fund "${name}" not found` });
      }

      res.json(data[idx]);
    } catch (err) {
      console.error('GET single fund error:', err);
      res.status(500).json({ error: 'Failed to read fund' });
    }
  }
);

// PUT update fund
app.put(
  '/api/funds/:name',
  (req: Request<{ name: string }>, res: Response) => {
    try {
      const name = decodeURIComponent(req.params.name);
      const data = readData();
      const idx = findByName(data, name);

      if (idx === -1) {
        return res.status(404).json({ error: `Fund "${name}" not found` });
      }

      const updated = { ...data[idx], ...req.body };
      data[idx] = updated;
      writeData(data);

      res.json(updated);
    } catch (err) {
      console.error('PUT error:', err);
      res.status(500).json({ error: 'Failed to update fund' });
    }
  }
);

// DELETE fund
app.delete(
  '/api/funds/:name',
  (req: Request<{ name: string }>, res: Response) => {
    try {
      const name = decodeURIComponent(req.params.name);
      const data = readData();
      const idx = findByName(data, name);

      if (idx === -1) {
        return res.status(404).json({ error: `Fund "${name}" not found` });
      }

      data.splice(idx, 1);
      writeData(data);

      res.json({ message: `Fund "${name}" deleted successfully` });
    } catch (err) {
      console.error('DELETE error:', err);
      res.status(500).json({ error: 'Failed to delete fund' });
    }
  }
);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});