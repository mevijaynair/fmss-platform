# FMSS Multi-Domain Platform

Complete academy management system with contract fee tracking, SAMS (Sports Academy Management System), and interactive quiz.

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 22.5.0+
- npm 10+

### Setup

```bash
# 1. Install root dependencies
npm install

# 2. Setup platform (creates directories, copies config)
npm run setup

# 3. Install app dependencies
npm run sams:install
npm run contracts:install

# 4. Start development servers
# Terminal 1 - Proxy (main site)
npm run dev

# Terminal 2 - SAMS
npm run sams:dev

# Terminal 3 - Contracts
npm run contracts:dev
```

### Access

```
Main Site:     http://localhost:8000
SAMS:          http://sams.localhost:8000 (or direct http://localhost:3000)
Contracts:     http://contracts.localhost:8000 (or direct http://localhost:3100)
Quiz:          http://quiz.localhost:8000
```

## 📋 Project Structure

```
fmss-platform/
├── server.js                    # Main reverse proxy/router
├── package.json
├── .env.example
├── docker-compose.yml
├── DEPLOY.md                    # Production deployment guide
│
├── apps/
│   ├── main/                    # Landing page
│   │   └── index.html
│   ├── sams/                    # Sports Academy Management System
│   │   ├── server/
│   │   ├── public/
│   │   └── package.json
│   ├── contracts/               # FMSS Contract Fee Management
│   │   ├── server/
│   │   ├── public/
│   │   └── package.json
│   └── quiz/                    # Annual Day Quiz (coming soon)
│       └── index.html
│
├── config/
│   ├── nginx.conf               # Production nginx config
│   └── ssl/                     # SSL certificates (production)
│
└── scripts/
    └── setup.js                 # Platform initialization
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Server
NODE_ENV=development              # development|production
PORT=8000                         # Main proxy port
DOMAIN=localhost                  # Your domain (localhost|fmss.ae|etc)

# Microservice Ports
SAMS_PORT=3000
CONTRACTS_PORT=3100

# SAMS Settings
SAMS_JWT_SECRET=your-secret-key  # Change this in production!
SAMS_EMAIL_ENABLED=false

# Database Paths
SAMS_DB_PATH=./data/sams.db
CONTRACTS_DB_PATH=./data/contracts.db
```

## 🌐 Architecture

### Subdomain Routing

The reverse proxy routes based on Host header:

| Domain | Service | Port | Purpose |
|--------|---------|------|---------|
| `fmss.ae` | Main | 8000 | Landing page |
| `sams.fmss.ae` | SAMS | 3000 | Academy management |
| `contracts.fmss.ae` | Contracts | 3100 | Fee management |
| `quiz.fmss.ae` | Quiz | (main) | Annual day quiz |

### Microservices

Each app runs independently:
- **SAMS**: Full academy management with students, billing, attendance
- **Contracts**: Contract and fee tracking with WhatsApp integration
- **Main**: Landing page with navigation
- **Quiz**: Coming soon - interactive team quiz

## 🚢 Production Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed instructions.

### Quick Deploy (Docker)

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f

# Scale specific service
docker compose up -d --scale sams=2
```

### Quick Deploy (Systemd)

```bash
# See DEPLOY.md for full setup
sudo systemctl start fmss-proxy fmss-sams fmss-contracts
sudo systemctl status fmss-*
```

## 📦 Commands

### Development
```bash
npm run dev                 # Start proxy in watch mode
npm run sams:dev           # Start SAMS in watch mode
npm run contracts:dev      # Start Contracts in watch mode
```

### Production
```bash
npm start                  # Start proxy
npm run sams:start         # Start SAMS
npm run contracts:start    # Start Contracts
```

### Setup & Installation
```bash
npm run setup              # Initialize platform
npm run sams:install       # Install SAMS dependencies
npm run contracts:install  # Install Contracts dependencies
```

## 🧪 Testing

### Health Checks

```bash
# Main proxy
curl http://localhost:8000/health

# SAMS (direct)
curl http://localhost:3000/api/health

# Contracts (direct)
curl http://localhost:3100/api/health
```

### Subdomain Testing (Local)

Add to `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 fmss.localhost
127.0.0.1 sams.fmss.localhost
127.0.0.1 contracts.fmss.localhost
127.0.0.1 quiz.fmss.localhost
```

Then:
```bash
curl http://fmss.localhost:8000        # Main
curl http://sams.fmss.localhost:8000   # SAMS
curl http://contracts.fmss.localhost:8000  # Contracts
```

## 📊 Monitoring

### Logs (Development)
Each service logs to console - check terminal output

### Logs (Docker)
```bash
docker compose logs -f [service_name]
docker compose logs --tail=100 sams
```

### Logs (Systemd)
```bash
journalctl -u fmss-proxy -f
journalctl -u fmss-sams -n 50
journalctl -u fmss-contracts --since "10 minutes ago"
```

## 🔒 Security Considerations

- **JWT Secret**: Change `SAMS_JWT_SECRET` in production
- **Database**: Use strong credentials, regular backups
- **SSL**: Deploy with HTTPS (Let's Encrypt recommended)
- **CORS**: Configure for your domain
- **Rate Limiting**: Implement for production APIs
- **Environment Variables**: Use `.env.local` for secrets (never commit)

## 🐛 Troubleshooting

### Apps won't start
```bash
# Check if ports are in use
lsof -i :8000  # Check port 8000
lsof -i :3000  # Check port 3000

# Kill process on port
kill -9 $(lsof -t -i :8000)
```

### Database errors
```bash
# Reset databases (caution - deletes all data!)
rm -f data/*.db*
npm run sams:start   # This will recreate with seed data
```

### Subdomain not routing
```bash
# Check your /etc/hosts file (development)
# Check DNS records (production)
# Verify nginx/proxy config is correct
```

## 📈 Next Steps

- [ ] Configure SAMS JWT secret in `.env`
- [ ] Test all subdomains
- [ ] Setup email notifications (SAMS)
- [ ] Configure database backups
- [ ] Setup SSL certificates (production)
- [ ] Deploy to production server
- [ ] Complete Quiz implementation
- [ ] Add analytics dashboard

## 📝 License

FMSS Football Club © 2025

## 👥 Support

For issues or questions, check:
1. Service logs: `docker compose logs -f` or `journalctl -u fmss-*`
2. Health endpoints: `/api/health` on each service
3. Deployment guide: [DEPLOY.md](./DEPLOY.md)
