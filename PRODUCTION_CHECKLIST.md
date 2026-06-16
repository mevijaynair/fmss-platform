# FMSS Platform - Production Deployment Checklist

## 📋 Complete Production Deployment Guide for fmss.ae

---

## PHASE 1: DOMAIN & HOSTING (Week 1)

### 1.1 Domain Registration

**What to buy:**
- Primary domain: `fmss.ae` (register with any registrar)

**Where to buy:**
- Namecheap.com (reliable, cheap)
- GoDaddy.com (popular)
- Domain.com
- Local UAE registrar (Emirates domains - `.ae`)

**Cost:** ~$10-15/year (depending on registrar)

**When purchasing, you'll get:**
- Domain nameservers (usually the registrar's)
- Access to DNS management
- Email forwarding options

**Important settings to note:**
```
Domain: fmss.ae
Registrar: [Your choice]
Nameservers: [Registrar default or custom]
Auto-renew: Enable (so it doesn't expire)
```

### 1.2 Server/Hosting Options

Choose one based on your needs:

#### **Option A: Docker on Cloud (RECOMMENDED for simplicity)**
- **Provider:** DigitalOcean, AWS, Heroku, Render
- **Cost:** $5-20/month
- **Setup time:** 30 min
- **Pros:** Easy deployment, auto-scaling, managed
- **Cons:** Slightly more expensive

**Recommended: DigitalOcean App Platform**
```
Cost: $12/month (minimal) to $50+/month (scaled)
Time to deploy: 15 minutes
Complexity: Low (Docker ready)
Database: Managed PostgreSQL (optional upgrade)
```

#### **Option B: VPS (RECOMMENDED for control)**
- **Provider:** DigitalOcean, Linode, Vultr, AWS EC2
- **Cost:** $5-15/month
- **Setup time:** 1-2 hours
- **Pros:** Full control, cheaper at scale
- **Cons:** You manage everything

**Recommended: DigitalOcean Droplet**
```
Ubuntu 22.04 LTS ($6/month)
2GB RAM, 50GB SSD
Cost: $6/month basic → $12/month recommended
Time to deploy: 60-90 minutes
```

#### **Option C: PaaS (Heroku, Render)**
- **Cost:** $7-50/month
- **Setup time:** 20 minutes
- **Pros:** Push and deploy (git)
- **Cons:** Less control, logs in platform

---

## PHASE 2: INFRASTRUCTURE SETUP (Week 1-2)

### 2.1 Choose Your Deployment Path

#### **Path 1: DigitalOcean App Platform (Easiest)**

```
1. Create account at DigitalOcean.com
2. Create "App" (free tier available)
3. Connect your GitHub repo
4. Select docker-compose.yml
5. Deploy!
Cost: Free tier → Pay as you scale
Time: 15 minutes
```

#### **Path 2: DigitalOcean Droplet + Manual (Most Control)**

```
1. Create Droplet (Ubuntu 22.04)
2. SSH into server
3. Install Node.js, nginx, Docker
4. Clone repo & deploy
5. Setup systemd services
Cost: $6-12/month
Time: 90 minutes
```

### 2.2 Required Infrastructure Components

```
┌─────────────────────────────────────┐
│     Your Local Development PC       │
│  (H:\Football_ai\fmss-platform)    │
└──────────────┬──────────────────────┘
               │ git push
               ▼
┌─────────────────────────────────────┐
│    Git Repository (GitHub/GitLab)   │
│  (optional, needed if auto-deploy)  │
└──────────────┬──────────────────────┘
               │ clone
               ▼
┌─────────────────────────────────────┐
│   Cloud Server (DigitalOcean/AWS)   │
│  • Node.js 22.5.0+                  │
│  • Docker (optional)                │
│  • nginx (reverse proxy)            │
│  • SSL certificates (Let's Encrypt) │
│  • SQLite databases (or PostgreSQL) │
└──────────────┬──────────────────────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
    ┌──────┬──────┬──────────┐
    │ Main │ SAMS │ Contracts│
    │ :8000│:3000 │ :3100    │
    └──────┴──────┴──────────┘
       │
       ▼
    ┌──────────────┐
    │ nginx (80/443)
    │ (proxy)
    └──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│     Internet Users                  │
│  fmss.ae → 78.46.123.45 (your IP)  │
└─────────────────────────────────────┘
```

---

## PHASE 3: DNS CONFIGURATION (Week 1-2)

### 3.1 Update Nameservers (if using cloud DNS)

**In your domain registrar:**

1. Login to registrar (where you bought fmss.ae)
2. Find "Nameservers" or "DNS Settings"
3. Change from registrar defaults to:
   - If DigitalOcean: `ns1.digitalocean.com`, `ns2.digitalocean.com`, `ns3.digitalocean.com`
   - If AWS Route 53: AWS nameservers provided
   - Otherwise: Keep registrar default

### 3.2 Create DNS Records

**In your DNS provider (DigitalOcean, Route 53, registrar, etc.):**

```
Type    Name           Value                TTL
────────────────────────────────────────────────
A       fmss.ae        your-server-ip       3600
A       www            your-server-ip       3600
CNAME   sams           fmss.ae              3600
CNAME   contracts      fmss.ae              3600
CNAME   quiz           fmss.ae              3600
```

**Example:**
```
A Record:    fmss.ae        → 78.46.123.45
CNAME:       www            → fmss.ae
CNAME:       sams.fmss.ae   → fmss.ae
CNAME:       contracts      → fmss.ae
CNAME:       quiz           → fmss.ae
```

**Propagation time:** 24-48 hours (sometimes instant)

**Verify with:**
```bash
nslookup fmss.ae
nslookup sams.fmss.ae
```

---

## PHASE 4: SSL CERTIFICATES (Week 2)

### 4.1 Get Free SSL with Let's Encrypt

**Automatic (Recommended):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone \
  -d fmss.ae \
  -d www.fmss.ae \
  -d sams.fmss.ae \
  -d contracts.fmss.ae \
  -d quiz.fmss.ae
```

**Cost:** FREE ✓
**Valid for:** 90 days (auto-renews)
**Time:** 5 minutes

### 4.2 Auto-Renewal Setup

```bash
# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Or manual cron job
sudo crontab -e
# Add: 0 2 * * * certbot renew --quiet
```

---

## PHASE 5: DEPLOYMENT (Week 2)

### 5.1 Setup Git Repository

```bash
# On your local machine
cd H:\Football_ai\fmss-platform

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: FMSS platform ready for production"

# Push to GitHub/GitLab
git remote add origin https://github.com/yourusername/fmss-platform.git
git branch -M main
git push -u origin main
```

### 5.2 Deploy to Server (DigitalOcean Droplet Example)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Update system
apt update && apt upgrade -y

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs

# 4. Install nginx
apt install -y nginx

# 5. Clone your repo
cd /opt
git clone https://github.com/yourusername/fmss-platform.git
cd fmss-platform

# 6. Create .env file
cp .env.example .env
nano .env  # Edit with your settings:
#   NODE_ENV=production
#   DOMAIN=fmss.ae
#   SAMS_JWT_SECRET=<generate-strong-secret>

# 7. Install dependencies
npm install
npm run sams:install
npm run contracts:install

# 8. Copy nginx config
cp config/nginx.conf /etc/nginx/sites-available/fmss
ln -s /etc/nginx/sites-available/fmss /etc/nginx/sites-enabled/fmss
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### 5.3 Setup Systemd Services (for persistent running)

Create `/etc/systemd/system/fmss-proxy.service`:
```ini
[Unit]
Description=FMSS Platform Proxy
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fmss-platform
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/fmss-sams.service`:
```ini
[Unit]
Description=FMSS SAMS Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fmss-platform/apps/sams
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/fmss-contracts.service`:
```ini
[Unit]
Description=FMSS Contracts Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fmss-platform/apps/contracts
Environment="NODE_ENV=production"
Environment="PORT=3100"
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl daemon-reload
systemctl enable fmss-proxy fmss-sams fmss-contracts
systemctl start fmss-proxy fmss-sams fmss-contracts
systemctl status fmss-proxy fmss-sams fmss-contracts
```

---

## PHASE 6: VERIFY & TEST (Week 2)

### 6.1 Health Checks

```bash
# Test main proxy
curl https://fmss.ae/health

# Test SAMS
curl https://sams.fmss.ae/api/health

# Test Contracts
curl https://contracts.fmss.ae/api/health
```

### 6.2 SSL Certificate Verification

```bash
# Check certificate validity
curl -I https://fmss.ae

# Should show: SSL certificate OK
# Should NOT show: certificate errors
```

### 6.3 Live Website Test

Open browser:
- https://fmss.ae → Should show landing page
- https://sams.fmss.ae → Should show SAMS login
- https://contracts.fmss.ae → Should show Contracts dashboard
- https://quiz.fmss.ae → Should show quiz placeholder

### 6.4 Performance Test

```bash
# Simple load test
ab -n 100 -c 10 https://fmss.ae/

# Or use: https://tools.pingdom.com
```

---

## PHASE 7: MAINTENANCE & MONITORING (Ongoing)

### 7.1 Backup Strategy

**Daily database backups:**
```bash
#!/bin/bash
# /opt/fmss-platform/scripts/backup.sh
BACKUP_DIR="/backup/fmss"
mkdir -p $BACKUP_DIR

# Backup SQLite databases
cp /opt/fmss-platform/data/sams.db $BACKUP_DIR/sams-$(date +%Y%m%d-%H%M%S).db
cp /opt/fmss-platform/data/contracts.db $BACKUP_DIR/contracts-$(date +%Y%m%d-%H%M%S).db

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /opt/fmss-platform/scripts/backup.sh
```

### 7.2 Monitoring & Alerts

**Simple health check cron:**
```bash
*/5 * * * * curl -f https://fmss.ae/health || mail -s "FMSS Down" admin@fmss.ae
```

**Better: Use external monitoring**
- UptimeRobot.com (free)
- Pingdom.com
- New Relic
- DataDog

### 7.3 Log Management

```bash
# View live logs
tail -f /var/log/nginx/access.log
journalctl -u fmss-proxy -f
journalctl -u fmss-sams -f

# Archive old logs
logrotate -f /etc/logrotate.conf
```

### 7.4 SSL Certificate Auto-Renewal

Already enabled:
```bash
sudo systemctl status certbot.timer
# Should show: active (running)
```

---

## COMPLETE COST BREAKDOWN

### Minimal Setup (Recommended for starting)
```
Domain (fmss.ae):           $10-15/year
Server (DigitalOcean):      $6/month
SSL (Let's Encrypt):        FREE
Database (SQLite):          FREE
Email/Monitoring:           FREE tier options
─────────────────────────────────────
Total monthly:              ~$6-10
Total yearly:               ~$80-130
```

### Scaled Setup (for 1000+ users)
```
Domain:                     $15/year
Server (2GB RAM):           $12/month
Database (PostgreSQL):      $15/month
CDN (Cloudflare):           FREE tier or $20+/month
Monitoring (DataDog):       $15+/month
─────────────────────────────────────
Total monthly:              ~$42-62
Total yearly:               ~$560-780
```

---

## TIMELINE

| Phase | Task | Time | Cost |
|-------|------|------|------|
| Week 1 | Buy domain | 30 min | $15 |
| Week 1 | Choose hosting | 30 min | - |
| Week 1 | Setup DNS | 1 hour | - |
| Week 2 | Get SSL cert | 30 min | FREE |
| Week 2 | Deploy app | 2 hours | - |
| Week 2 | Test & verify | 1 hour | - |
| Week 3 | Live! | - | - |
| Ongoing | Monitor & backup | 1 hour/week | - |

**Total setup time: 5-6 hours**
**Total cost to launch: $15-25 one-time + $6-12/month**

---

## MIGRATION PATH: Local → Live

### Step 1: Finalize & Test Locally (Day 1)
```bash
cd H:\Football_ai\fmss-platform
start-dev-clean.bat
# Test all features
# Make any final changes
```

### Step 2: Push to Git (Day 2)
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 3: Buy Domain & Setup Hosting (Day 2-3)
```
1. Register fmss.ae
2. Create DigitalOcean Droplet (or your choice)
3. Note your server IP (e.g., 78.46.123.45)
```

### Step 4: Deploy to Server (Day 3)
```bash
# SSH into server and follow Phase 5 above
```

### Step 5: Configure DNS (Day 3-4)
```
Update DNS records in registrar
Wait 24-48 hours for propagation
```

### Step 6: Setup SSL & Test (Day 4)
```bash
# Install certbot
# Create certificates
# Test all endpoints
```

### Step 7: Go Live! (Day 5)
```
Share: https://fmss.ae with users
Monitor logs
Track performance
```

---

## TROUBLESHOOTING DEPLOYMENT

### Domain not resolving
```bash
# Check DNS propagation
nslookup fmss.ae
# or online: https://mxtoolbox.com/
```

### SSL certificate errors
```bash
# Renew manually
sudo certbot renew --force-renewal

# Check status
sudo certbot certificates
```

### Services not starting
```bash
# Check logs
journalctl -u fmss-proxy -n 50
journalctl -u fmss-sams -n 50

# Restart
systemctl restart fmss-proxy fmss-sams fmss-contracts
```

### Database corruption
```bash
# Check & repair
sudo sqlite3 /opt/fmss-platform/data/sams.db ".integrity_check"

# Or backup & restore
cp /backup/fmss/sams-latest.db /opt/fmss-platform/data/sams.db
systemctl restart fmss-sams
```

---

## NEXT: ADVANCED SETUP (Optional)

### Upgrade to PostgreSQL
Instead of SQLite for better performance:
```bash
# On server
sudo apt install postgresql
# Update connection strings in .env
# Migrate data (script provided)
```

### Add Email Service
For user notifications:
```bash
# Configure SendGrid or similar in SAMS
SENDGRID_API_KEY=...
```

### Setup CDN (Cloudflare)
For faster content delivery:
```bash
# Point DNS to Cloudflare
# Get free HTTPS + caching
# Free SSL included
```

### Auto-deploy with GitHub Actions
```yaml
# On push to main → auto-deploy to server
```

---

## FINAL CHECKLIST ✓

Before going live:
- [ ] Domain registered (fmss.ae)
- [ ] Server setup (DigitalOcean or choice)
- [ ] DNS records created
- [ ] SSL certificate installed
- [ ] .env file configured
- [ ] All services running
- [ ] Health checks passing
- [ ] UI tests completed
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Team trained on updates/maintenance

**You're ready to launch!** 🚀

---

## SUPPORT RESOURCES

- **DEPLOY.md** — Original deployment guide
- **README.md** — Architecture & troubleshooting
- **GETTING_STARTED.md** — Development guide

## Questions?

- Check logs first: `journalctl -u fmss-* -f`
- Test health endpoints
- Review this checklist
- Check DEPLOY.md for more details
