// scripts/setup.js — Initialize the platform
// Creates necessary directories, copies configs, and guides initial setup

import { promises as fs } from 'fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

async function setup() {
  console.log('\n╭─────────────────────────────────────╮');
  console.log('│  FMSS Platform Setup                │');
  console.log('╰─────────────────────────────────────╯\n');

  try {
    // Create data directories
    const dirs = [
      'data/sams',
      'data/contracts',
      'logs',
      'config/ssl',
    ];

    for (const dir of dirs) {
      const path = join(ROOT, dir);
      await fs.mkdir(path, { recursive: true });
      console.log(`✓ Created ${dir}`);
    }

    // Copy .env if not exists
    const envPath = join(ROOT, '.env');
    const envExamplePath = join(ROOT, '.env.example');

    try {
      await fs.access(envPath);
      console.log('✓ .env already exists');
    } catch {
      await fs.copyFile(envExamplePath, envPath);
      console.log('✓ Created .env from .env.example');
    }

    console.log('\n╭─────────────────────────────────────╮');
    console.log('│  Setup Complete!                    │');
    console.log('╰─────────────────────────────────────╯');
    console.log('\nNext steps:');
    console.log('  1. Configure .env with your settings');
    console.log('  2. Run: npm run sams:install');
    console.log('  3. Run: npm run contracts:install');
    console.log('  4. Run: npm run dev');
    console.log('\nFor production deployment:');
    console.log('  • See DEPLOY.md for detailed instructions');
    console.log('  • Update DNS to point subdomains to your server');
    console.log('  • Configure SSL certificates in config/ssl/\n');

  } catch (err) {
    console.error('✗ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
