// transfer.ts
// Run:  ts-node transfer.ts server --port 3000
//       ts-node transfer.ts send ./path/to/file.zip --url http://localhost:3000/upload

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

//#region helpers
// ---------- shared utils ----------
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
const isZipPath = (p: string) => path.extname(p).toLowerCase() === '.zip';
const UPLOAD_DIR = path.resolve(process.cwd(), 'files_received');

function parseArgs(argv: string[]) {
  // simple flag parser: --key=value -> { key: value }
  const flags: Record<string, string | boolean> = {};
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      flags[k] = v ?? true;
    }
  }
  return flags;
}
//#endregion

// ---------- [1] Express server ----------
async function startServer(port: number) {
  ensureDir(UPLOAD_DIR);
  // multer

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path
        .basename(file.originalname, ext)
        .replace(/[^\w.-]/g, '_');
      const uniq = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      cb(null, `${base}-${uniq}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GiB cap; tweak as needed
    fileFilter: (_req, file, cb) => {
      // accept only .zip by filename extension
      if (path.extname(file.originalname).toLowerCase() !== '.zip') {
        return cb(new Error('Only .zip files are allowed'));
      }
      cb(null, true);
    },
  });

  const app = express();

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
    const f = req.file;
    if (!f) return res.status(400).json({ error: 'No file received' });

    // Response info
    const savedAbs = path.resolve(f.path);
    const savedRel = path.relative(process.cwd(), savedAbs);
    return res.json({
      ok: true,
      originalName: f.originalname,
      savedAs: path.basename(savedAbs),
      // savedPath: savedRel,
      size: f.size,
      mimetype: f.mimetype,
    });
  });

  // Multer / general error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[upload error]', err?.message || err);
    res.status(400).json({ ok: false, error: String(err?.message || err) });
  });

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`POST .zip to /upload, field name: "file"`);
    console.log(`Files will be saved to: ${UPLOAD_DIR}`);
  });
}

// ---------- [2] Sender using axios ----------
async function sendZip(filePath: string, url = 'http://localhost:3000/upload') {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);
  if (!isZipPath(abs)) throw new Error(`Not a .zip file: ${abs}`);

  const stat = fs.statSync(abs);
  const stream = fs.createReadStream(abs);

  const form = new FormData();
  form.append('file', stream, {
    filename: path.basename(abs),
    knownLength: stat.size,
  });

  const headers = form.getHeaders();

  // Note: onUploadProgress is browser-only for axios; we’ll just log start/finish.
  console.log(`Uploading ${path.basename(abs)} (${stat.size} bytes) -> ${url}`);
  const resp = await axios.post(url, form, {
    headers,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  console.log('Server response:', resp.data);
}

// ---------- CLI entry ----------
(async () => {
  const [, , cmd, ...rest] = process.argv;

  if (cmd === 'server') {
    const flags = parseArgs(rest);
    const portRaw = (flags.port as string) || process.env.PORT || '3000';
    const port = Number(portRaw);
    if (!Number.isFinite(port)) throw new Error(`Invalid --port: ${portRaw}`);
    await startServer(port);
    return;
  }

  if (cmd === 'send') {
    // first non-flag arg is file path
    const nonFlags = rest.filter(a => !a.startsWith('--'));
    const filePath = nonFlags[0];
    if (!filePath)
      throw new Error(
        'Usage: ts-node transfer.ts send <path-to-zip> [--url=http://host:port/upload]',
      );
    const flags = parseArgs(rest);
    const url = (flags.url as string) || 'http://localhost:3000/upload';
    await sendZip(filePath, url);
    return;
  }

  // Help
  console.log(`
Usage:
  # Start server (default port 3000)
  ts-node transfer.ts server --port=3000

  # Send a zip to the server
  ts-node transfer.ts send ./archive.zip --url=http://localhost:3000/upload
`);
})();
