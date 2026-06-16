# Getting Started with FMSS Platform

Welcome! This guide helps you get the FMSS multi-domain platform up and running.

## 📋 What is This?

A consolidated platform with multiple applications:

- **Main Site** (fmss.ae) — Landing page & navigation hub
- **SAMS** (sams.fmss.ae) — Sports Academy Management System
- **Contracts** (contracts.fmss.ae) — Contract fee management
- **Quiz** (quiz.fmss.ae) — Annual day quiz (coming soon)

All served from a single infrastructure with subdomain-based routing.

## ⚡ Quick Start (5 minutes)

### Windows

```batch
# 1. Open PowerShell or Command Prompt in the platform directory
cd C:\path\to\fmss-platform

# 2. Run the startup script
start-dev.bat

# Three terminal windows will open automatically
```

### Mac/Linux

```bash
# 1. Navigate to platform directory
cd /path/to/fmss-platform

# 2. Make script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### Manual Startup (All Platforms)

Open three separate terminal windows in the project root:

**Terminal 1 - Main Proxy:**
```bash
npm install      # First time only
npm run dev
```

**Terminal 2 - SAMS:**
```bash
npm run sams:install   # First time only
npm run sams:dev
```

**Terminal 3 - Contracts:**
```bash
npm run contracts:install   # First time only
npm run contracts:dev
```

## 🌐 Access Your Services

Once all services are running:

| Service | URL | Port |
|---------|-----|------|
| **Landing Page** | http://localhost:8000 | 8000 |
| **SAMS** | http://localhost:3000 | 3000 |
| **Contracts** | http://localhost:3100 | 3100 |

Or via subdomain (if configured in `/etc/hosts`):
- http://fmss.localhost:8000
- http://sams.fmss.localhost:8000
- http://contracts.fmss.localhost:8000
- http://quiz.fmss.localhost:8000

## ✅ Verify Everything Works

### Check Health Endpoints

```bash
# Main proxy health
curl http://localhost:8000/health

# SAMS health
curl http://localhost:3000/api/health

# Contracts health
curl http://localhost:3100/api/health
```

Expected response:
```json
{ "ok": true, ... }
```

## 📁 Project Structure

```
fmss-platform/
├── server.js              # Main reverse proxy
├── package.json           # Root dependencies
├── .env.example           # Configuration template
├── start-dev.bat/.sh      # Quick start scripts
│
├── apps/
│   ├── main/              # Landing page
│   ├── sams/              # Academy management
│   ├── contracts/         # Contract fee tracking
│   └── quiz/              # Quiz (coming soon)
│
├── config/
│   ├── nginx.conf         # Production nginx config
│   └── ssl/               # SSL certs (production)
│
├── scripts/
│   └── setup.js           # Platform initialization
│
└── docs/
    ├── DEPLOY.md          # Production deployment
    ├── README.md          # Full documentation
    └── GETTING_STARTED.md # This file
```

## 🔧 Common Tasks

### Install Dependencies

```bash
# Root dependencies
npm install

# Individual app dependencies
npm run sams:install
npm run contracts:install

# Or all at once
npm run setup
```

### Update Configuration

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env    # or use your editor
```

### Create Demo Data

Each app automatically seeds with demo data on first run. To reset:

```bash
# Delete and recreate databases
rm data/*.db*

# Restart services (they'll recreate on startup)
```

### Reset Everything

```bash
# Warning: This deletes all local data!
rm -rf node_modules data *.db*
npm run setup
npm run sams:install
npm run contracts:install
npm run dev
```

## 🧪 Testing the Routing

### Via Direct Ports (Easiest)

Development: Just use direct ports
- SAMS: http://localhost:3000
- Contracts: http://localhost:3100

### Via Subdomains (Optional)

To test subdomain routing locally:

**Windows** - Edit `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 fmss.localhost
127.0.0.1 sams.fmss.localhost
127.0.0.1 contracts.fmss.localhost
127.0.0.1 quiz.fmss.localhost
```

**Mac/Linux** - Edit `/etc/hosts`:
```
127.0.0.1 fmss.localhost
127.0.0.1 sams.fmss.localhost
127.0.0.1 contracts.fmss.localhost
127.0.0.1 quiz.fmss.localhost
```

Then access:
- http://fmss.localhost:8000
- http://sams.fmss.localhost:8000
- http://contracts.fmss.localhost:8000

## 📊 Monitoring

### View Logs in Development

Logs appear directly in each terminal window. Look for:

```
[timestamp] METHOD subdomain /path/to/endpoint
```

### Troubleshooting Common Issues

**Port already in use:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>
```

**Services not responding:**
```bash
# Restart all services
# (Close and reopen terminal windows)

# Or check if Node crashed
ps aux | grep node
```

**Database errors:**
```bash
# Reset specific app's database
rm data/sams.db*
npm run sams:dev   # Will recreate on startup
```

## 🚀 Next Steps

### For Development

1. **Explore the code:**
   - SAMS: `apps/sams/` — Full multi-tenant academy system
   - Contracts: `apps/contracts/` — Contract fee tracking
   - Main: `apps/main/` — Landing page

2. **Make changes:**
   - Edit files in each app
   - Changes auto-reload (watch mode)
   - Refresh browser to see updates

3. **Test thoroughly:**
   - Use the UI in each app
   - Check browser console for errors
   - Review server logs

### For Production

When ready to deploy:

1. **Read**: `DEPLOY.md` — Full deployment guide
2. **Setup**: Configure DNS, SSL, environment
3. **Deploy**: Use Docker or systemd as documented
4. **Monitor**: Setup logging and backups

## ❓ FAQ

**Q: Can I run services on different machines?**
A: Yes! Update environment variables (SAMS_PORT, CONTRACTS_PORT) to point to different IPs.

**Q: How do I add a new microservice?**
A: Follow the same pattern - add to `apps/`, register in `server.js` proxy rules, update `.env`.

**Q: What databases does it use?**
A: SQLite (`data/*.db`) - perfect for development, can upgrade to PostgreSQL for production.

**Q: Is this production-ready?**
A: Development: Yes. Production: See DEPLOY.md for hardening steps (SSL, backups, monitoring).

## 📞 Need Help?

1. Check logs in terminal windows
2. Verify health endpoints: `/health` or `/api/health`
3. See DEPLOY.md for production issues
4. Review service-specific READMEs in `apps/*/`

## 🎓 Learning Resources

- **Node.js/Express**: https://expressjs.com/
- **Modern JavaScript**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- **Deployment**: See DEPLOY.md in this repo

---

**Happy coding!** 🚀

For detailed information, see [README.md](./README.md)
