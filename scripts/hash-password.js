// hash-password.js — generate a bcrypt hash for the admin password.
//
// Usage:
//   node scripts/hash-password.js "your-strong-password"
// then copy the printed line into your .env file.

import bcrypt from 'bcryptjs';

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: node scripts/hash-password.js "your-strong-password"');
  process.exit(1);
}
if (pw.length < 8) {
  console.error('Please use at least 8 characters.');
  process.exit(1);
}

const hash = bcrypt.hashSync(pw, 12);
console.log('\nAdd this to your .env file:\n');
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
