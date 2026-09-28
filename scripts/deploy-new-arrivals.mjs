import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export function validateMigrationHistory(history, columns, known) {
  const applied = new Set();
  for (const row of history) {
    if (row.rolled_back) continue;
    const migration = known.find(item => item.name === row.migration_name);
    if (!migration) throw new Error(`unknown migration: ${row.migration_name}`);
    if (!row.finished) throw new Error(`unfinished migration: ${row.migration_name}`);
    if (!migration.checksums.includes(row.checksum)) throw new Error(`checksum mismatch: ${row.migration_name}`);
    if (applied.has(row.migration_name)) throw new Error(`duplicate migration: ${row.migration_name}`);
    applied.add(row.migration_name);
  }
  for (const migration of known.slice(0, -1)) {
    if (!applied.has(migration.name)) throw new Error(`missing baseline migration: ${migration.name}`);
  }
  if (applied.has(known.at(-1).name)) {
    if (columns.length !== 1 || columns[0].data_type !== 'boolean' || columns[0].is_nullable !== 'NO' || columns[0].column_default !== 'false') {
      throw new Error('Unexpected isNewArrival column definition');
    }
    return 'already-applied';
  }
  if (columns.length) throw new Error('untracked isNewArrival column; inspect before proceeding');
  return 'apply';
}

async function main() {
  if (process.argv.includes('--if-requested') && process.env.GS_NEW_ARRIVALS_ROLLOUT !== '1') {
    console.log('New arrivals database migration not requested; continuing normal build.');
    return;
  }
  if (process.env.VERCEL_ENV !== 'production') throw new Error('This rollout requires the verified Vercel production environment');
  if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID !== 'prj_tjdfAeSDOUOOfpxXpru1dhmd7tGP') throw new Error('Wrong Vercel project');
  const names = ['20260902000000_add_admin_content_management', '20260908000000_add_dynamic_product_catalog', '20260928000000_add_product_new_arrival'];
  const directories = readdirSync('prisma/migrations', {withFileTypes:true}).filter(item => item.isDirectory()).map(item => item.name).sort();
  if (JSON.stringify(directories) !== JSON.stringify(names)) throw new Error('Unreviewed migration files; refusing automatic rollout');
  const known = names.map(name => {
    const sql = readFileSync(`prisma/migrations/${name}/migration.sql`, 'utf8');
    return { name, checksums: [sql, sql.replace(/\r\n/g, '\n'), sql.replace(/\r?\n/g, '\r\n')].map(value => createHash('sha256').update(value).digest('hex')) };
  });
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient({log:[]});
  try {
    async function inspect() {
      const history = await db.$queryRawUnsafe('SELECT migration_name,checksum,finished_at IS NOT NULL AS finished,rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at');
      const columns = await db.$queryRawUnsafe("SELECT data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='content_products' AND column_name='isNewArrival'");
      return { history, columns, action: validateMigrationHistory(history, columns, known) };
    }
    const before = await inspect();
    console.log(JSON.stringify({migrationCheck:before.action,history:before.history.map(row=>({name:row.migration_name,finished:row.finished,rolledBack:row.rolled_back}))}));
    if (before.action === 'apply') {
      const connection = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
      const result = spawnSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { encoding:'utf8', env:{...process.env,DATABASE_URL:connection} });
      const output = `${result.stdout || ''}\n${result.stderr || ''}`.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED DATABASE URL]');
      console.log(output);
      if (result.status !== 0) throw new Error('Prisma migration failed; production alias remains unchanged');
    }
    const after = await inspect();
    if (after.action !== 'already-applied') throw new Error('Migration verification failed');
    const counts = await db.$queryRawUnsafe('SELECT (SELECT COUNT(*)::int FROM content_products) AS products,(SELECT COUNT(*)::int FROM content_product_variants) AS variants,(SELECT COUNT(*)::int FROM content_product_images) AS images,(SELECT COUNT(*)::int FROM content_promotions) AS promotions');
    console.log(JSON.stringify({migrationVerified:true,column:after.columns[0],counts:counts[0]}));
  } finally { await db.$disconnect(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('New arrivals rollout stopped:', error.code || error.message.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[REDACTED DATABASE URL]'));
    process.exitCode = 1;
  });
}
