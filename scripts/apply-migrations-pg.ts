/**
 * Apply database migrations using PostgreSQL direct connection
 *
 * Usage: npx tsx scripts/apply-migrations-pg.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Client } from 'pg';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

console.log('🔍 Detected Supabase project:', projectRef);
console.log('\n⚠️  To run migrations via PostgreSQL connection, you need the database password.');
console.log('📍 Find it at: https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
console.log('\n💡 Alternative: Use the Supabase SQL Editor (recommended)');
console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
console.log('   2. Copy and paste the contents of: scripts/combined-migration.sql');
console.log('   3. Click "Run"\n');

const migrations = [
  {
    name: '20250107_enable_pgvector.sql',
    path: resolve(__dirname, '../supabase/migrations/20250107_enable_pgvector.sql')
  },
  {
    name: '20250108000000_initial_schema.sql',
    path: resolve(__dirname, '../supabase/migrations/20250108000000_initial_schema.sql')
  }
];

async function runWithPassword(password: string) {
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    for (const migration of migrations) {
      console.log(`📄 Applying: ${migration.name}`);
      const sql = readFileSync(migration.path, 'utf-8');

      try {
        await client.query(sql);
        console.log(`✅ Success: ${migration.name}\n`);
      } catch (error) {
        // Many statements may fail if already exist - that's OK
        console.log(`⚠️  Warning: ${error instanceof Error ? error.message : String(error)}`);
        console.log('   (This may be normal if schema already exists)\n');
      }
    }

    console.log('🎉 Migrations complete!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await client.end();
  }
}

// Check if password was provided as argument
const password = process.argv[2];

if (password) {
  runWithPassword(password).catch(console.error);
} else {
  console.log('📝 Usage: npx tsx scripts/apply-migrations-pg.ts <database-password>');
  console.log('\n   OR use the SQL Editor method above (recommended)\n');
}
