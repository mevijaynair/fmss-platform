# Production Deployment - Complete Command Guide

**Server IP:** `139.59.135.213`
**Domain:** `fmss.ae`
**OS:** Ubuntu 22.04 LTS (fully patched)

---

## 🚀 PHASE 1: SSH INTO SERVER

```bash
# Replace with your server's SSH details
ssh root@139.59.135.213

# Or if using a specific SSH key:
ssh -i /path/to/key.pem root@139.59.135.213
```

Once connected, you'll see: `root@your-server:~#`

---

## 📦 PHASE 2: INSTALL DEPENDENCIES

### Step 1: Update System Packages

```bash
apt update && apt upgrade -y
```

### Step 2: Install Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs
```

**Verify installation:**
```bash
node --version  # Should be v22.x.x
npm --version   # Should be 10.x.x
```

### Step 3: Install Nginx

```bash
apt install -y nginx
```

**Verify installation:**
```bash
nginx -v
```

### Step 4: Install Git

```bash
apt install -y git
```

---

## 📥 PHASE 3: CLONE YOUR CODE

### Step 1: Create Application Directory

```bash
mkdir -p /opt/fmss-platform
cd /opt/fmss-platform
```

### Step 2: Clone Repository with Submodules

```bash
git clone --recurse-submodules https://github.com/mevijaynair/fmss-platform.git .
```

**This pulls:**
- Main platform code
- SAMS submodule (apps/sams)
- FMSS Contracts submodule (apps/contracts)

### Step 3: Verify Cloned Files

```bash
ls -la
# Should show: apps/, config/, scripts/, server.js, package.json, etc.

ls -la apps/
# Should show: sams/, contracts/, main/, quiz/
```

---

## ⚙️ PHASE 4: INSTALL APPLICATION DEPENDENCIES

### Step 1: Install Root Dependencies

```bash
cd /opt/fmss-platform
npm install --omit=dev
```

### Step 2: Install SAMS Dependencies

```bash
cd apps/sams
npm install --omit=dev
cd ../..
```

### Step 3: Install Contracts Dependencies

```bash
cd apps/contracts
npm install --omit=dev
cd ../..
```

**Verify installation:**
```bash
test -d node_modules && echo "✓ Root dependencies installed"
test -d apps/sams/node_modules && echo "✓ SAMS dependencies installed"
test -d apps/contracts/node_modules && echo "✓ Contracts dependencies installed"
```

---

## 🔐 PHASE 5: CONFIGURE ENVIRONMENT

### Step 1: Create .env File

```bash
cd /opt/fmss-platform
cp .env.example .env
nano .env
```

**Edit the following:**
```
NODE_ENV=production
PORT=8000
DOMAIN=fmss.ae
SAMS_PORT=3000
CONTRACTS_PORT=3100
SAMS_JWT_SECRET=YOUR_STRONG_SECRET_KEY_HERE
```

**Generate a strong secret:**
```bash
openssl rand -base64 32
# Copy the output and paste as SAMS_JWT_SECRET
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 2: Create Data Directories

```bash
mkdir -p data/sams
mkdir -p data/contracts
chmod 755 data/
```

---

## 🌐 PHASE 6: SETUP NGINX REVERSE PROXY

### Step 1: Copy Nginx Configuration

```bash
cd /opt/fmss-platform
cp config/nginx.conf /etc/nginx/sites-available/fmss
```

### Step 2: Enable Nginx Site

```bash
ln -s /etc/nginx/sites-available/fmss /etc/nginx/sites-enabled/fmss
```

### Step 3: Remove Default Nginx Site

```bash
rm /etc/nginx/sites-enabled/default
```

### Step 4: Test Nginx Configuration

```bash
nginx -t
# Should output: "test is successful"
```

### Step 5: Start Nginx

```bash
systemctl start nginx
systemctl enable nginx
systemctl status nginx
# Should show: "active (running)"
```

---

## 🔒 PHASE 7: SETUP SSL CERTIFICATES (Let's Encrypt)

### Step 1: Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Step 2: Get Certificates

```bash
certbot certonly --standalone \
  -d fmss.ae \
  -d www.fmss.ae \
  -d sams.fmss.ae \
  -d contracts.fmss.ae \
  -d quiz.fmss.ae
```

**When prompted:**
- Email: `mevijaynair@gmail.com`
- Accept terms: `Y`
- Share email: `N` (optional)

### Step 3: Verify Certificates

```bash
certbot certificates
# Should show all 5 domains with certificates
```

### Step 4: Setup Auto-Renewal

```bash
systemctl enable certbot.timer
systemctl start certbot.timer
systemctl status certbot.timer
```

---

## 🛠️ PHASE 8: SETUP SYSTEMD SERVICES

### Service 1: Main Proxy Server

**Create file:** `/etc/systemd/system/fmss-proxy.service`

```bash
cat > /etc/systemd/system/fmss-proxy.service << 'EOF'
[Unit]
Description=FMSS Platform Proxy
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fmss-platform
Environment="NODE_ENV=production"
Environment="PORT=8000"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### Service 2: SAMS Application

**Create file:** `/etc/systemd/system/fmss-sams.service`

```bash
cat > /etc/systemd/system/fmss-sams.service << 'EOF'
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### Service 3: Contracts Application

**Create file:** `/etc/systemd/system/fmss-contracts.service`

```bash
cat > /etc/systemd/system/fmss-contracts.service << 'EOF'
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

---

## ✅ PHASE 9: START SERVICES

### Step 1: Reload Systemd

```bash
systemctl daemon-reload
```

### Step 2: Enable Services (Auto-start on Boot)

```bash
systemctl enable fmss-proxy
systemctl enable fmss-sams
systemctl enable fmss-contracts
```

### Step 3: Start Services

```bash
systemctl start fmss-proxy
systemctl start fmss-sams
systemctl start fmss-contracts
```

### Step 4: Verify All Running

```bash
systemctl status fmss-proxy
systemctl status fmss-sams
systemctl status fmss-contracts
```

**All should show:** `Active: active (running)`

---

## 🧪 PHASE 10: TEST EVERYTHING

### Step 1: Test Health Endpoints

```bash
# Main proxy
curl http://localhost:8000/health

# SAMS
curl http://localhost:3000/api/health

# Contracts
curl http://localhost:3100/api/health
```

**Expected response:** `{"ok":true,...}`

### Step 2: Test Main Server

```bash
curl http://139.59.135.213
# Should get HTML of landing page
```

### Step 3: Test via Browser (once DNS propagates)

```
https://fmss.ae              → Should load landing page
https://sams.fmss.ae        → Should load SAMS login
https://contracts.fmss.ae   → Should load Contracts dashboard
https://quiz.fmss.ae        → Should load quiz page
```

All should show **green lock** (HTTPS working) ✓

---

## 📋 PHASE 11: VIEW LOGS

### Real-time Logs

```bash
# All services
journalctl -u fmss-* -f

# Specific service
journalctl -u fmss-proxy -f
journalctl -u fmss-sams -f
journalctl -u fmss-contracts -f
```

### Check for Errors

```bash
# Last 50 lines
journalctl -u fmss-proxy -n 50

# Last hour
journalctl -u fmss-proxy --since "1 hour ago"

# Full errors
journalctl -u fmss-proxy -p err
```

---

## 🔄 PHASE 12: SETUP BACKUPS

### Create Backup Script

```bash
cat > /opt/fmss-platform/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backup/fmss"
mkdir -p $BACKUP_DIR

# Backup databases
cp /opt/fmss-platform/data/sams.db $BACKUP_DIR/sams-$(date +%Y%m%d-%H%M%S).db
cp /opt/fmss-platform/data/contracts.db $BACKUP_DIR/contracts-$(date +%Y%m%d-%H%M%S).db

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completed: $(date)"
EOF
```

### Make Executable

```bash
chmod +x /opt/fmss-platform/backup.sh
```

### Schedule Daily Backup (2 AM)

```bash
crontab -e
```

Add this line:
```
0 2 * * * /opt/fmss-platform/backup.sh >> /var/log/fmss-backup.log 2>&1
```

Save: `Ctrl+X`, `Y`, `Enter`

---

## 🎯 QUICK DEPLOYMENT SUMMARY

Copy-paste these in order:

```bash
# 1. SSH into server
ssh root@139.59.135.213

# 2. Install dependencies
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt install -y nodejs nginx git certbot python3-certbot-nginx

# 3. Clone code
mkdir -p /opt/fmss-platform
cd /opt/fmss-platform
git clone --recurse-submodules https://github.com/mevijaynair/fmss-platform.git .

# 4. Install npm dependencies
npm install --omit=dev
cd apps/sams && npm install --omit=dev && cd ../..
cd apps/contracts && npm install --omit=dev && cd ../..

# 5. Configure environment
cp .env.example .env
nano .env
# Edit: NODE_ENV=production, DOMAIN=fmss.ae, SAMS_JWT_SECRET=YOUR_SECRET

# 6. Setup directories
mkdir -p data/sams data/contracts

# 7. Setup nginx
cp config/nginx.conf /etc/nginx/sites-available/fmss
ln -s /etc/nginx/sites-available/fmss /etc/nginx/sites-enabled/fmss
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl start nginx && systemctl enable nginx

# 8. Get SSL certificates
certbot certonly --standalone -d fmss.ae -d www.fmss.ae -d sams.fmss.ae -d contracts.fmss.ae -d quiz.fmss.ae

# 9. Create systemd services
# (Use the full service files above)

# 10. Start services
systemctl daemon-reload
systemctl enable fmss-proxy fmss-sams fmss-contracts
systemctl start fmss-proxy fmss-sams fmss-contracts

# 11. Verify
curl http://localhost:8000/health
curl http://localhost:3000/api/health
curl http://localhost:3100/api/health
```

---

## ✅ FINAL CHECKLIST

- [ ] SSH into server
- [ ] Install Node.js, nginx, git, certbot
- [ ] Clone repository with submodules
- [ ] Install npm dependencies (root + apps)
- [ ] Create and configure .env file
- [ ] Create data directories
- [ ] Setup nginx reverse proxy
- [ ] Get SSL certificates
- [ ] Create 3 systemd service files
- [ ] Start all services
- [ ] Test health endpoints
- [ ] Verify via browser (once DNS propagates)
- [ ] View logs to confirm running
- [ ] Setup backup script
- [ ] LIVE! 🎉

---

## 🆘 TROUBLESHOOTING

### Services won't start?
```bash
journalctl -u fmss-proxy -n 50  # Check logs
```

### Port already in use?
```bash
lsof -i :8000
lsof -i :3000
lsof -i :3100
```

### Nginx config error?
```bash
nginx -t  # Shows error details
```

### Database missing?
Services will auto-create on startup. Check logs.

### Need to restart?
```bash
systemctl restart fmss-proxy fmss-sams fmss-contracts
```

---

## 📞 NEXT STEPS

1. **SSH into server** with commands above
2. **Follow deployment phases 1-12**
3. **Verify everything working**
4. **Wait for DNS to propagate** (1-24 hours)
5. **Test in browser**
6. **YOU'RE LIVE!** 🚀

---

**Your domain will be live at:**
- https://fmss.ae
- https://sams.fmss.ae
- https://contracts.fmss.ae
- https://quiz.fmss.ae

**All running on:** `139.59.135.213`
