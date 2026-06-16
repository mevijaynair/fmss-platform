# DNS Configuration for fmss.ae

**Server IP Address:** `139.59.135.213`

---

## 📋 DNS Records to Create

Create these A Records in your domain registrar (Namecheap, GoDaddy, etc.):

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| A | @ (or fmss.ae) | 139.59.135.213 | 3600 |
| A | www | 139.59.135.213 | 3600 |
| CNAME | sams | fmss.ae | 3600 |
| CNAME | contracts | fmss.ae | 3600 |
| CNAME | quiz | fmss.ae | 3600 |

---

## 🔧 Step-by-Step Setup

### Step 1: Login to Your Registrar

Go to: **https://www.namecheap.com** (or your registrar)

Login with your account credentials.

### Step 2: Find DNS Settings

Navigate to: **Domain List** → **fmss.ae** → **Manage**

Look for a section called:
- "DNS Records" or
- "Advanced DNS" or
- "Nameservers"

### Step 3: Create A Records

**Record 1: Main Domain**
```
Type:     A Record
Name:     @ (or leave blank, or fmss.ae)
Value:    139.59.135.213
TTL:      3600
```
Click "Save" or "Add"

**Record 2: www subdomain**
```
Type:     A Record
Name:     www
Value:    139.59.135.213
TTL:      3600
```
Click "Save" or "Add"

### Step 4: Create CNAME Records

**Record 3: SAMS subdomain**
```
Type:     CNAME Record
Name:     sams
Value:    fmss.ae
TTL:      3600
```
Click "Save" or "Add"

**Record 4: Contracts subdomain**
```
Type:     CNAME Record
Name:     contracts
Value:    fmss.ae
TTL:      3600
```
Click "Save" or "Add"

**Record 5: Quiz subdomain**
```
Type:     CNAME Record
Name:     quiz
Value:    fmss.ae
TTL:      3600
```
Click "Save" or "Add"

---

## ✅ Verify DNS Records

After creating the records, verify they're correct:

### Option 1: Using MXToolbox (Easiest)

Go to: **https://mxtoolbox.com/dnslooku**

Search for: `fmss.ae`

You should see:
```
fmss.ae          A    139.59.135.213
www.fmss.ae      A    139.59.135.213
sams.fmss.ae     CNAME fmss.ae
contracts.fmss.ae CNAME fmss.ae
quiz.fmss.ae     CNAME fmss.ae
```

### Option 2: Using Command Line

```bash
# Windows PowerShell
nslookup fmss.ae
nslookup sams.fmss.ae
nslookup contracts.fmss.ae
nslookup quiz.fmss.ae

# Should all return: 139.59.135.213
```

### Option 3: Using Online Checker

Visit: **https://whatsmydns.net/**

Enter: `fmss.ae`

Check that all global nameservers resolve to `139.59.135.213`

---

## ⏱️ Propagation Timeline

**DNS changes can take:**
- ⚡ **Instant to 5 minutes** (usually)
- ⏳ **Up to 24 hours** (worst case)

**Typical timeline:**
- Immediately: Your local machine might resolve
- 1-4 hours: Most users' ISPs will show the new DNS
- 24 hours: Guaranteed global propagation

**Check progress:**
- Use MXToolbox or whatsmydns.net every hour
- When all servers show your IP, you're good!

---

## 🌐 After DNS Propagates

Once DNS is live, you can access:

```
https://fmss.ae              → Main landing page
https://www.fmss.ae         → Same as above
https://sams.fmss.ae        → SAMS academy system
https://contracts.fmss.ae   → Contract fee management
https://quiz.fmss.ae        → Quiz (coming soon)
```

All will route to your server at **139.59.135.213**

---

## 🔒 SSL Certificates

Your nginx config will:
1. Detect requests to fmss.ae, sams.fmss.ae, contracts.fmss.ae, quiz.fmss.ae
2. Use Let's Encrypt to auto-generate SSL certificates
3. Serve HTTPS with green locks ✓

Setup command (once DNS is live):
```bash
sudo certbot certonly --standalone \
  -d fmss.ae \
  -d www.fmss.ae \
  -d sams.fmss.ae \
  -d contracts.fmss.ae \
  -d quiz.fmss.ae
```

---

## 📊 Final DNS Configuration

Your DNS will look like this:

```
Domain: fmss.ae
Server IP: 139.59.135.213

DNS Records:
  ├─ fmss.ae (A)              → 139.59.135.213
  ├─ www.fmss.ae (A)          → 139.59.135.213
  ├─ sams.fmss.ae (CNAME)     → fmss.ae → 139.59.135.213
  ├─ contracts.fmss.ae (CNAME) → fmss.ae → 139.59.135.213
  └─ quiz.fmss.ae (CNAME)     → fmss.ae → 139.59.135.213

Result:
  All subdomains resolve to 139.59.135.213
  Nginx reverse proxy routes them to correct apps
  Users access clean URLs (no port numbers) ✓
```

---

## 🎯 Quick Checklist

- [ ] Login to domain registrar
- [ ] Navigate to DNS/Advanced DNS settings
- [ ] Create A record for @ (fmss.ae) → 139.59.135.213
- [ ] Create A record for www → 139.59.135.213
- [ ] Create CNAME for sams → fmss.ae
- [ ] Create CNAME for contracts → fmss.ae
- [ ] Create CNAME for quiz → fmss.ae
- [ ] Save all changes
- [ ] Wait for DNS propagation (check every hour)
- [ ] Verify with MXToolbox or nslookup
- [ ] Test: Open https://fmss.ae in browser
- [ ] Test: Open https://sams.fmss.ae in browser
- [ ] Setup SSL certificates once DNS is live

---

## 🆘 Troubleshooting

### DNS not resolving?
```bash
# Clear DNS cache (Windows)
ipconfig /flushdns

# Check status
nslookup fmss.ae
# Should return: 139.59.135.213
```

### Still says "can't reach server" after DNS works?
- Check nginx is running on server
- Check firewall allows port 80/443
- Check server is accessible: `curl http://139.59.135.213`

### CNAME not working?
- CNAME must point to domain name (fmss.ae), not IP
- Can't use CNAME for root domain (@)
- Use A records for root, CNAME for subdomains

### How long for SSL certificate?
- Once DNS is live, run certbot
- Takes 2-5 minutes to generate
- Auto-renews every 90 days

---

## 📞 Need Help?

**To check if DNS is working:**
```bash
# PowerShell
nslookup fmss.ae
nslookup sams.fmss.ae
```

**Should all return:** `139.59.135.213`

**To check if server is accessible:**
```bash
curl http://139.59.135.213
# Or open in browser: http://139.59.135.213
```

---

## 🚀 Next Steps

1. **Create DNS records** (above)
2. **Wait for propagation** (1-24 hours)
3. **Verify with nslookup or MXToolbox**
4. **Setup SSL certificates**
5. **Test in browser**
6. **Go live!**

Your platform will be accessible at:
- https://fmss.ae ✓
- https://sams.fmss.ae ✓
- https://contracts.fmss.ae ✓
- https://quiz.fmss.ae ✓

All automatically routed to your server! 🎉
