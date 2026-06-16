// server.js — Root reverse proxy that routes subdomains to microservices
// Real server deployment:
//   - Set NODE_ENV=production
//   - Update DOMAIN env var to actual domain (fmss.ae)
//   - Apps run internally on configured ports
//   - Reverse proxy routes subdomain requests

import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { request } from 'node:http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuration
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DOMAIN = process.env.DOMAIN || 'localhost';

// Microservice ports (update based on your deployment)
const PORTS = {
  sams: process.env.SAMS_PORT || 3000,
  contracts: process.env.CONTRACTS_PORT || 3100,
};

// Simple proxy middleware
function proxyRequest(targetPort) {
  return (req, res) => {
    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        'X-Forwarded-For': req.ip,
        'X-Forwarded-Proto': req.protocol,
      },
    };

    const proxyReq = request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[PROXY ERROR] ${err.message}`);
      res.status(502).json({ error: 'Bad Gateway', message: 'Service unavailable' });
    });

    req.pipe(proxyReq);
  };
}

// Middleware
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    environment: NODE_ENV,
    domain: DOMAIN,
    timestamp: new Date().toISOString()
  });
});

// Subdomain routing based on Host header
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];

  // Log requests in development
  if (NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${subdomain} ${req.url}`);
  }

  // Route based on subdomain or main domain
  if (subdomain === 'sams') {
    return proxyRequest(PORTS.sams)(req, res);
  }

  if (subdomain === 'contracts') {
    return proxyRequest(PORTS.contracts)(req, res);
  }

  if (subdomain === 'quiz') {
    return res.sendFile(join(__dirname, 'apps/quiz/index.html'));
  }

  // Default to main site (fmss.ae or localhost)
  next();
});

// Main site routes
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'apps/main/index.html'));
});

app.use(express.static(join(__dirname, 'apps/main/public')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`
╭────────────────────────────────────────╮
│   FMSS Platform Running                │
├────────────────────────────────────────┤
│   Main:      http://${DOMAIN.padEnd(24)}│
│   SAMS:      http://sams.${DOMAIN.padEnd(18)}│
│   Contracts: http://contracts.${DOMAIN.padEnd(13)}│
│   Quiz:      http://quiz.${DOMAIN.padEnd(19)}│
├────────────────────────────────────────┤
│   Port: ${String(PORT).padEnd(28)}│
│   Env:  ${NODE_ENV.padEnd(29)}│
╰────────────────────────────────────────╯
  `);
});
