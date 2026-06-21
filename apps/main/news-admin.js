// news-admin.js — News store + hidden, password-protected admin portal.
//
// Mounted on the main-site Express app (after the subdomain router, so it only
// answers on the main domain). Data and uploads live under data/ (gitignored),
// so a `git pull` deploy never overwrites them.
//
// Required env (set in .env on the server — see .env.example):
//   ADMIN_PASSWORD_HASH  bcrypt hash of the admin password (admin disabled if unset)
//   SESSION_SECRET       long random string for signing the session cookie
//   ADMIN_PATH           the hidden admin route, e.g. /admin-9f3k2 (default /admin)

import express from 'express';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { randomUUID, randomBytes } from 'node:crypto';
import { join, extname } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export function mountNewsAdmin(app, { rootDir }) {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const ADMIN_PATH = process.env.ADMIN_PATH || '/admin';
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
  const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

  if (!ADMIN_PASSWORD_HASH) {
    console.warn('[news-admin] ADMIN_PASSWORD_HASH not set — admin login is DISABLED. Run: node scripts/hash-password.js');
  }
  if (!process.env.SESSION_SECRET) {
    console.warn('[news-admin] SESSION_SECRET not set — using an ephemeral secret (admins must re-login after every restart).');
  }

  // ---- Storage paths (gitignored) ----
  const dataDir = join(rootDir, 'data');
  const uploadsDir = join(dataDir, 'uploads');
  const newsFile = join(dataDir, 'news.json');
  for (const dir of [dataDir, uploadsDir]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }
  if (!existsSync(newsFile)) {
    // Seed with the existing Times Clothing announcement so nothing is lost.
    const seed = [{
      id: randomUUID(),
      title: 'FMSS x Times Clothing Partnership',
      body: "We're thrilled to announce our official jersey partnership with Times Clothing! They've crafted the perfect blend of style, comfort, and brotherhood into every piece. Every jersey tells our story — from the pitch to the streets.",
      date: '2026-06-01',
      badge: 'Official Sponsor',
      image: '/gallery/Jersey/IMG-20250831-WA0086.jpg',
      instagram: '',
      facebook: '',
      published: true,
      createdAt: new Date().toISOString(),
    }];
    writeFileSync(newsFile, JSON.stringify(seed, null, 2));
  }

  const readNews = () => {
    try { return JSON.parse(readFileSync(newsFile, 'utf8')); }
    catch { return []; }
  };
  const writeNews = (items) => writeFileSync(newsFile, JSON.stringify(items, null, 2));
  const byDateDesc = (a, b) => String(b.date || b.createdAt).localeCompare(String(a.date || a.createdAt));

  // ---- Sessions (cookie is httpOnly + sameSite strict; secure in prod) ----
  app.set('trust proxy', 1); // behind nginx
  app.use(session({
    name: 'fmss.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }));

  // ---- Helpers ----
  const requireAuth = (req, res, next) => {
    if (req.session && req.session.authed) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  };
  // Lightweight CSRF defence: state-changing calls must come from our own fetch
  // (cross-site HTML forms cannot set a custom header), on top of sameSite=strict.
  const requireXhr = (req, res, next) => {
    if (req.get('x-fmss-admin') === '1') return next();
    return res.status(403).json({ error: 'Forbidden' });
  };

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again later.' },
  });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = (extname(file.originalname) || '.jpg').toLowerCase();
        cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
      cb(ok ? null : new Error('Only image files are allowed'), ok);
    },
  });

  const sanitizeItem = (raw, existing = {}) => ({
    id: existing.id || randomUUID(),
    title: String(raw.title || '').slice(0, 200),
    body: String(raw.body || '').slice(0, 4000),
    date: String(raw.date || '').slice(0, 30) || new Date().toISOString().slice(0, 10),
    badge: String(raw.badge || '').slice(0, 60),
    image: String(raw.image || '').slice(0, 500),
    instagram: String(raw.instagram || '').slice(0, 500),
    facebook: String(raw.facebook || '').slice(0, 500),
    published: raw.published !== false,
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // ---- Serve uploaded images ----
  app.use('/uploads', express.static(uploadsDir));

  // ---- Public API ----
  app.get('/api/news', (_req, res) => {
    res.json(readNews().filter(n => n.published).sort(byDateDesc));
  });

  // ---- Admin: portal page (hidden route) ----
  app.get(ADMIN_PATH, (_req, res) => {
    res.sendFile(join(rootDir, 'apps/main/admin/index.html'));
  });

  // ---- Admin: auth ----
  app.post(`${ADMIN_PATH}/login`, loginLimiter, express.json(), async (req, res) => {
    const password = (req.body && req.body.password) || '';
    if (!ADMIN_PASSWORD_HASH) return res.status(503).json({ error: 'Admin not configured' });
    const ok = await bcrypt.compare(String(password), ADMIN_PASSWORD_HASH);
    if (!ok) return res.status(401).json({ error: 'Wrong password' });
    req.session.authed = true;
    res.json({ ok: true });
  });

  app.post(`${ADMIN_PATH}/logout`, (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  app.get('/api/admin/session', (req, res) => {
    res.json({ authed: !!(req.session && req.session.authed), configured: !!ADMIN_PASSWORD_HASH });
  });

  // ---- Admin: news CRUD (auth + xhr-guard) ----
  app.get('/api/admin/news', requireAuth, (_req, res) => {
    res.json(readNews().sort(byDateDesc));
  });

  app.post('/api/admin/news', requireAuth, requireXhr, express.json(), (req, res) => {
    const items = readNews();
    const item = sanitizeItem(req.body);
    items.push(item);
    writeNews(items);
    res.json(item);
  });

  app.put('/api/admin/news/:id', requireAuth, requireXhr, express.json(), (req, res) => {
    const items = readNews();
    const idx = items.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx] = sanitizeItem(req.body, items[idx]);
    writeNews(items);
    res.json(items[idx]);
  });

  app.delete('/api/admin/news/:id', requireAuth, requireXhr, (req, res) => {
    const items = readNews();
    const next = items.filter(n => n.id !== req.params.id);
    if (next.length === items.length) return res.status(404).json({ error: 'Not found' });
    writeNews(next);
    res.json({ ok: true });
  });

  // ---- Admin: image upload ----
  app.post('/api/admin/upload', requireAuth, requireXhr, (req, res) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file' });
      res.json({ url: `/uploads/${req.file.filename}` });
    });
  });

  console.log(`[news-admin] mounted — admin portal at ${ADMIN_PATH} (env: ${NODE_ENV})`);
}
