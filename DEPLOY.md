# FMSS Platform Deployment Guide

This guide covers deploying the FMSS multi-domain platform to a production server.

## Architecture Overview

```
fmss.ae (main domain on port 80/443)
├── / → Main landing page (Node.js)
├── sams.fmss.ae → SAMS app (Node.js port 3000)
├── contracts.fmss.ae → FMSS contracts (Node.js port 3100)
└── quiz.fmss.ae → Quiz app (Node.js)
```

## Prerequisites

- Ubuntu 22.04 LTS or similar Linux distribution
- Node.js 22.5.0+
- nginx or Docker
- SSL certificates (Let's Encrypt recommended)
- Domain name pointing to your server

## Option 1: Docker Deployment (Recommended)

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Deploy Platform

```bash
# Clone/copy platform to server
cd /home/apps
git clone <your-repo> fmss-platform
cd fmss-platform

# Copy environment configuration
cp .env.example .env
nano .env  # Edit with your settings

# Create SSL certificates directory
mkdir -p config/ssl

# For Let's Encrypt (automated)
sudo certbot certonly --standalone -d fmss.ae -d sams.fmss.ae -d contracts.fmss.ae -d quiz.fmss.ae

# Copy certificates (adjust paths as needed)
sudo cp /etc/letsencrypt/live/fmss.ae/fullchain.pem config/ssl/cert.pem
sudo cp /etc/letsencrypt/live/fmss.ae/privkey.pem config/ssl/key.pem
sudo chown -R 1000:1000 config/ssl
```

### 3. Configure & Launch

```bash
# Build and start containers
docker compose up -d

# Verify services
docker compose ps

# View logs
docker compose logs -f proxy
docker compose logs -f sams
docker compose logs -f contracts
```

### 4. SSL Certificate Auto-Renewal

```bash
# Create renewal script
sudo crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * certbot renew --quiet && systemctl reload nginx
```

## Option 2: Manual Systemd Deployment

### 1. Prepare Server

```bash
# Create app user
sudo useradd -m -s /bin/bash apps

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt install -y nginx
```

### 2. Deploy Applications

```bash
# Setup directory structure
sudo mkdir -p /opt/fmss-platform
sudo chown -R apps:apps /opt/fmss-platform

# Copy code (as apps user)
sudo -u apps git clone <repo> /opt/fmss-platform
cd /opt/fmss-platform

# Install dependencies
sudo -u apps npm install
cd apps/sams && sudo -u apps npm install && cd ../..
cd apps/contracts && sudo -u apps npm install && cd ../..
```

### 3. Configure Environment

```bash
# Setup environment file
sudo -u apps cp .env.example .env
sudo -u apps nano .env

# Create data directories
sudo -u apps mkdir -p data/sams data/contracts logs
```

### 4. Create Systemd Services

Create `/etc/systemd/system/fmss-proxy.service`:
```ini
[Unit]
Description=FMSS Platform Proxy
After=network.target

[Service]
Type=simple
User=apps
WorkingDirectory=/opt/fmss-platform
Environment="NODE_ENV=production"
Environment="PORT=8000"
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
User=apps
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
User=apps
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
sudo systemctl daemon-reload
sudo systemctl enable fmss-proxy fmss-sams fmss-contracts
sudo systemctl start fmss-proxy fmss-sams fmss-contracts
sudo systemctl status fmss-proxy fmss-sams fmss-contracts
```

### 5. Configure nginx Reverse Proxy

Use the provided `config/nginx.conf` (Option 1) or create a simpler version:

```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/fmss
sudo ln -s /etc/nginx/sites-available/fmss /etc/nginx/sites-enabled/fmss
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Setup

```bash
# Get certificate from Let's Encrypt
sudo certbot certonly --standalone \
  -d fmss.ae \
  -d sams.fmss.ae \
  -d contracts.fmss.ae \
  -d quiz.fmss.ae

# Certbot will auto-configure nginx
```

## DNS Configuration

Update your DNS records:

```dns
fmss.ae              A    <your-server-ip>
www.fmss.ae          CNAME fmss.ae
sams.fmss.ae         CNAME fmss.ae
contracts.fmss.ae    CNAME fmss.ae
quiz.fmss.ae         CNAME fmss.ae
```

Wait 24-48 hours for propagation.

## Monitoring & Logs

### Docker
```bash
docker compose logs -f
docker compose logs -f service_name
```

### Systemd
```bash
journalctl -u fmss-proxy -f
journalctl -u fmss-sams -f
journalctl -u fmss-contracts -f
```

### Application Logs
```bash
tail -f /opt/fmss-platform/logs/*.log
```

## Backups

Setup automated backups for databases:

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backup/fmss"
mkdir -p $BACKUP_DIR

# Backup SQLite databases
cp /opt/fmss-platform/data/sams.db $BACKUP_DIR/sams-$(date +%Y%m%d).db
cp /opt/fmss-platform/data/contracts.db $BACKUP_DIR/contracts-$(date +%Y%m%d).db

# Keep only last 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/fmss-platform/scripts/backup.sh
```

## Troubleshooting

### Apps not responding
```bash
# Check service status
sudo systemctl status fmss-*

# View logs
journalctl -u fmss-proxy -n 50
```

### SSL certificate issues
```bash
# Check certificate validity
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Database issues
```bash
# Reset database (caution!)
rm -f /opt/fmss-platform/data/*.db*
sudo systemctl restart fmss-sams fmss-contracts
```

## Updating

```bash
cd /opt/fmss-platform
git pull origin main
npm install
cd apps/sams && npm install && cd ../..
cd apps/contracts && npm install && cd ../..
sudo systemctl restart fmss-proxy fmss-sams fmss-contracts
```

## Support

For issues or questions:
- Check logs: `journalctl -u fmss-* -f`
- Test endpoints: `curl -I https://fmss.ae`
- Review nginx config: `sudo nginx -t`
