# Separate Development Workflow

Keep developing SAMS and FMSS Contracts separately, but automatically sync into the platform.

---

## 🎯 Setup Overview

You have **3 separate projects**:

```
H:\Football_ai\
├── SAMS/                    ← Continue developing here
│   ├── server/
│   ├── public/
│   └── package.json
├── FMSS/                    ← Continue developing here  
│   ├── server/
│   ├── public/
│   └── package.json
└── fmss-platform/           ← Integration point
    └── apps/
        ├── sams/            ← Git submodule link to SAMS
        ├── contracts/       ← Git submodule link to FMSS
        └── ...
```

**Goal:** Changes in SAMS/ and FMSS/ automatically appear in fmss-platform/apps/

---

## 🔗 OPTION 1: Git Submodules (RECOMMENDED)

Most professional way to link repos together.

### How It Works:
```
Original repos stay as-is:
  • H:\Football_ai\SAMS         (your main development)
  • H:\Football_ai\FMSS         (your main development)

Platform links to them:
  • fmss-platform/apps/sams     → Git submodule pointing to SAMS
  • fmss-platform/apps/contracts → Git submodule pointing to FMSS
```

When you commit changes to SAMS or FMSS, they automatically show in the platform.

### Setup Steps (15 minutes)

#### Step 1: Initialize SAMS as its own repo (if not already)

```bash
cd H:\Football_ai\SAMS

# Check if already a git repo
git status

# If NOT a repo, initialize it:
git init
git add .
git commit -m "Initial commit: SAMS"
git remote add origin https://github.com/YOUR_USERNAME/sams.git
git branch -M main
git push -u origin main
```

#### Step 2: Initialize FMSS as its own repo (if not already)

```bash
cd H:\Football_ai\FMSS

# Check if already a git repo
git status

# If NOT a repo, initialize it:
git init
git add .
git commit -m "Initial commit: FMSS Contracts"
git remote add origin https://github.com/YOUR_USERNAME/fmss-contracts.git
git branch -M main
git push -u origin main
```

#### Step 3: Remove old copies from platform

```bash
cd H:\Football_ai\fmss-platform

# Remove the copied directories
rm -rf apps/sams
rm -rf apps/contracts

# Commit this cleanup
git add .
git commit -m "Remove copied SAMS/Contracts, will use submodules"
git push
```

#### Step 4: Add submodules to platform

```bash
cd H:\Football_ai\fmss-platform

# Add SAMS as submodule
git submodule add https://github.com/YOUR_USERNAME/sams.git apps/sams

# Add FMSS as submodule
git submodule add https://github.com/YOUR_USERNAME/fmss-contracts.git apps/contracts

# Commit submodule links
git add .
git commit -m "Add SAMS and FMSS as git submodules"
git push
```

#### Step 5: Verify setup

```bash
cd H:\Football_ai\fmss-platform

# Check submodules are linked
cat .gitmodules

# Should show:
# [submodule "apps/sams"]
#     path = apps/sams
#     url = https://github.com/YOUR_USERNAME/sams.git
# [submodule "apps/contracts"]
#     path = apps/contracts
#     url = https://github.com/YOUR_USERNAME/fmss-contracts.git
```

### How to Use Submodules

**Develop in original repos:**
```bash
# Make changes in SAMS
cd H:\Football_ai\SAMS
# ... edit files ...
git add .
git commit -m "Add new feature"
git push

# Changes are automatically in SAMS repo on GitHub
```

**Update platform to latest changes:**
```bash
cd H:\Football_ai\fmss-platform

# Get latest SAMS/FMSS changes
git submodule update --remote

# Commit the update
git add .
git commit -m "Update SAMS and FMSS to latest"
git push
```

**Deploy platform with latest code:**
```bash
cd H:\Football_ai\fmss-platform

# When deploying to DigitalOcean, include submodules
git clone --recurse-submodules https://github.com/YOUR_USERNAME/fmss-platform.git

# This automatically pulls SAMS and FMSS at their committed versions
```

### Submodule Workflow Summary

```
Day 1: Develop SAMS feature
  cd H:\Football_ai\SAMS
  git add .
  git commit -m "Add feature X"
  git push

Day 2: Develop FMSS feature
  cd H:\Football_ai\FMSS
  git add .
  git commit -m "Add feature Y"
  git push

Day 3: Update platform with both changes
  cd H:\Football_ai\fmss-platform
  git submodule update --remote
  git add .
  git commit -m "Update SAMS and FMSS"
  git push

Day 4: Deploy to DigitalOcean
  DigitalOcean pulls fmss-platform
  Submodules pull SAMS and FMSS automatically
  Everything up to date! ✓
```

---

## 🔄 OPTION 2: Symlinks (Simplest)

Create shortcuts instead of copying files.

### How It Works:
```
fmss-platform/apps/sams/     → Symlink to H:\Football_ai\SAMS
fmss-platform/apps/contracts → Symlink to H:\Football_ai\FMSS

When you edit SAMS, changes appear in platform instantly
```

### Setup (5 minutes)

**Windows PowerShell (as Admin):**

```powershell
cd H:\Football_ai\fmss-platform

# Remove the copied directories
Remove-Item -Path apps\sams -Recurse -Force
Remove-Item -Path apps\contracts -Recurse -Force

# Create symlinks
New-Item -ItemType SymbolicLink -Path "apps\sams" -Target "H:\Football_ai\SAMS"
New-Item -ItemType SymbolicLink -Path "apps\contracts" -Target "H:\Football_ai\FMSS"

# Verify
Get-ChildItem -Path apps | Select-Object Name, LinkTarget
```

**Mac/Linux:**

```bash
cd H:\Football_ai/fmss-platform

rm -rf apps/sams
rm -rf apps/contracts

ln -s /path/to/SAMS apps/sams
ln -s /path/to/FMSS apps/contracts

# Verify
ls -l apps/
```

### How to Use Symlinks

**Develop normally:**
```bash
# Edit SAMS
cd H:\Football_ai\SAMS
# Make changes
git add .
git commit -m "Feature"

# Changes appear in platform automatically!
```

**Run platform:**
```bash
cd H:\Football_ai\fmss-platform
npm run dev   # Uses symlinked SAMS and FMSS
```

**Deploy:**
```
On DigitalOcean, you'll need to:
1. Clone SAMS repo
2. Clone FMSS repo
3. Create symlinks in platform
4. Start services

(Or use git submodules instead for easier deployment)
```

### Symlink Pros/Cons

✅ Pros:
- Simplest setup (5 minutes)
- Changes appear instantly
- No submodule complexity

❌ Cons:
- Doesn't work well with deployment
- Each server needs its own symlinks
- Git doesn't track symlinks well

---

## 🏆 RECOMMENDED: Git Submodules

### Why:
✅ Works with deployment
✅ Professional version control
✅ Easy to share code
✅ Clear version tracking
✅ Works on all platforms

---

## 📋 STEP-BY-STEP SETUP (Git Submodules)

### Prerequisites:
- GitHub account (free)
- SAMS and FMSS as separate repos on GitHub
- Git installed locally

### Step 1: Create Repos on GitHub (if not done)

**For SAMS:**
```
Go to: github.com/new
Repo name: sams
Description: Sports Academy Management System
Make public
Click "Create Repository"
Copy the HTTPS URL
```

**For FMSS Contracts:**
```
Go to: github.com/new
Repo name: fmss-contracts
Description: FMSS Contract Fee Management
Make public
Click "Create Repository"
Copy the HTTPS URL
```

### Step 2: Push Original Code to GitHub

**SAMS:**
```bash
cd H:\Football_ai\SAMS

git init
git add .
git commit -m "Initial commit: SAMS"
git remote add origin https://github.com/YOUR_USERNAME/sams.git
git branch -M main
git push -u origin main
```

**FMSS:**
```bash
cd H:\Football_ai\FMSS

git init
git add .
git commit -m "Initial commit: FMSS Contracts"
git remote add origin https://github.com/YOUR_USERNAME/fmss-contracts.git
git branch -M main
git push -u origin main
```

### Step 3: Clean Platform and Add Submodules

```bash
cd H:\Football_ai\fmss-platform

# Remove old copies
rm -rf apps/sams
rm -rf apps/contracts

# Add submodules
git submodule add https://github.com/YOUR_USERNAME/sams.git apps/sams
git submodule add https://github.com/YOUR_USERNAME/fmss-contracts.git apps/contracts

# Commit
git add .
git commit -m "Add SAMS and FMSS as submodules"
git push
```

### Step 4: Test It Works

```bash
# Clone platform (fresh)
git clone --recurse-submodules https://github.com/YOUR_USERNAME/fmss-platform.git test-clone

# Check submodules pulled
cd test-clone
ls -la apps/sams/      # Should show SAMS files
ls -la apps/contracts/ # Should show FMSS files
```

Done! ✓

---

## 🔄 Daily Development Workflow

### Scenario: You want to add a feature to SAMS

```
1. Edit SAMS code
   cd H:\Football_ai\SAMS
   # ... make changes ...

2. Commit to SAMS repo
   git add .
   git commit -m "Add student bulk import"
   git push origin main

3. Update platform submodule
   cd H:\Football_ai\fmss-platform
   git submodule update --remote

4. Commit the submodule update
   git add apps/sams
   git commit -m "Update SAMS with bulk import feature"
   git push

5. Deploy (when ready)
   git clone --recurse-submodules [platform-url]
   Your platform now has the latest SAMS code ✓
```

---

## 📱 Quick Commands Reference

### Develop in SAMS:
```bash
cd H:\Football_ai\SAMS
git add .
git commit -m "Your message"
git push
```

### Develop in FMSS:
```bash
cd H:\Football_ai\FMSS
git add .
git commit -m "Your message"
git push
```

### Update Platform with Latest:
```bash
cd H:\Football_ai\fmss-platform
git submodule update --remote
git add .
git commit -m "Update submodules"
git push
```

### Deploy:
```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/fmss-platform.git
# Everything pulls automatically!
```

---

## ⚠️ Common Submodule Issues

### Issue: "apps/sams is not a git repository"

**Solution:**
```bash
cd H:\Football_ai\fmss-platform
git submodule init
git submodule update --recursive
```

### Issue: Submodule shows wrong commit

**Solution:**
```bash
cd H:\Football_ai\fmss-platform
git submodule update --remote --merge
git add .
git commit -m "Sync submodules"
```

### Issue: Changes not showing in platform

**Solution:**
```bash
# Make sure you pushed to original repo
cd H:\Football_ai\SAMS
git push

# Then update platform
cd H:\Football_ai\fmss-platform
git submodule update --remote
```

---

## 🎯 Your New Workflow

### Before (files copied):
```
H:\Football_ai\fmss-platform\apps\sams
└─ Static copy, manual sync needed
```

### After (with submodules):
```
H:\Football_ai\SAMS ← You develop here
  └─ GitHub: sams repo
      └─ fmss-platform submodule pulls from here
         └─ DigitalOcean: pulls whole platform with submodules
            └─ Latest code automatically! ✓
```

---

## 📊 Three Repo Structure

```
Repo 1: SAMS
  Location: https://github.com/YOUR_USERNAME/sams
  Source:   H:\Football_ai\SAMS
  Purpose:  Academy management system
  Status:   Active development

Repo 2: FMSS Contracts
  Location: https://github.com/YOUR_USERNAME/fmss-contracts
  Source:   H:\Football_ai\FMSS
  Purpose:  Contract fee management
  Status:   Active development

Repo 3: FMSS Platform
  Location: https://github.com/YOUR_USERNAME/fmss-platform
  Source:   H:\Football_ai\fmss-platform
  Purpose:  Integration + reverse proxy + main site
  Contains: Submodule links to SAMS and FMSS
  Status:   Pulls latest from above 2 repos
```

---

## ✅ Setup Checklist

- [ ] Create SAMS repo on GitHub
- [ ] Create FMSS repo on GitHub
- [ ] Push SAMS to GitHub
- [ ] Push FMSS to GitHub
- [ ] Remove apps/sams from platform
- [ ] Remove apps/contracts from platform
- [ ] Add SAMS as submodule
- [ ] Add FMSS as submodule
- [ ] Commit submodule changes
- [ ] Push platform
- [ ] Test: Clone platform with --recurse-submodules
- [ ] Verify SAMS and FMSS files present

---

## 🚀 You're Ready!

Now you can:
✓ Develop SAMS separately
✓ Develop FMSS separately
✓ Keep platform in sync automatically
✓ Deploy everything together
✓ Each project is independent but linked

---

## 📞 Questions?

**"Will this work with DigitalOcean?"**
Yes! When deploying:
```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/fmss-platform.git
# Pulls platform + SAMS + FMSS automatically
```

**"Can I revert a submodule to old version?"**
Yes!
```bash
cd apps/sams
git checkout COMMIT_HASH
cd ..
git add apps/sams
git commit -m "Revert SAMS to X"
```

**"What if both repos change simultaneously?"**
Git handles it! Each change is committed separately and clearly visible in history.

**"Can I develop offline?"**
Yes! Edit locally, commit later when online.

---

## Next Steps:

1. Create GitHub repos for SAMS and FMSS
2. Push each to GitHub (steps above)
3. Remove copies from platform
4. Add submodules
5. Continue developing in original locations
6. Update platform when ready
7. Deploy!

All your development stays in SAMS/ and FMSS/, but the platform automatically gets the latest! 🎉
