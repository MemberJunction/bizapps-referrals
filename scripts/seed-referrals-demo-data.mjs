/**
 * Idempotent runner for `scripts/seed-referrals-demo-data.sql`.
 * Reads DB_* connection settings from environment or `../MJ/.env`.
 * Pass `--wave3` to additionally seed `scripts/seed-referrals-wave3-data.sql`
 * (SLA escalation, outcomes, availability windows, and reciprocity snapshots).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sqlFile = path.join(__dirname, 'seed-referrals-demo-data.sql');
const wave3SqlFile = path.join(__dirname, 'seed-referrals-wave3-data.sql');
const includeWave3 = process.argv.includes('--wave3');

function loadEnvFromMj() {
  const candidates = [
    path.resolve(repoRoot, '.env'),
    path.resolve(repoRoot, '../MJ/.env'),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    const get = (k) => {
      const m = text.match(new RegExp(`^${k}=['"]?([^'"\n]+)`, 'm'));
      return m ? m[1] : '';
    };
    return {
      host: process.env.DB_HOST || get('DB_HOST') || 'localhost',
      port: process.env.DB_PORT || get('DB_PORT') || '1433',
      user: process.env.DB_USERNAME || get('DB_USERNAME') || 'sa',
      pass: process.env.DB_PASSWORD || get('DB_PASSWORD'),
      db: process.env.DB_DATABASE || get('DB_DATABASE') || 'MJ_Factory_20261110',
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '1433',
    user: process.env.DB_USERNAME || 'sa',
    pass: process.env.DB_PASSWORD || '',
    db: process.env.DB_DATABASE || 'MJ_Factory_20261110',
  };
}

const cfg = loadEnvFromMj();
if (!cfg.pass) {
  console.error('DB_PASSWORD not found in environment or ../MJ/.env');
  process.exit(1);
}

console.log(`Seeding Referrals demo data into ${cfg.db} on ${cfg.host}:${cfg.port}...`);
const out = execFileSync(
  'sqlcmd',
  ['-S', `${cfg.host},${cfg.port}`, '-U', cfg.user, '-d', cfg.db, '-C', '-i', sqlFile],
  { encoding: 'utf8', env: { ...process.env, SQLCMDPASSWORD: cfg.pass } },
);
console.log(out);

if (includeWave3) {
  console.log(`Seeding Referrals Wave 3 demo data (SLA escalation, outcomes, readiness) into ${cfg.db}...`);
  const wave3Out = execFileSync(
    'sqlcmd',
    ['-S', `${cfg.host},${cfg.port}`, '-U', cfg.user, '-d', cfg.db, '-C', '-i', wave3SqlFile],
    { encoding: 'utf8', env: { ...process.env, SQLCMDPASSWORD: cfg.pass } },
  );
  console.log(wave3Out);
}
