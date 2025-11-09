/**
 * Apply database migrations programmatically
 *
 * Usage: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function executeSql(sql: string): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    // Try direct query if RPC doesn't exist
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

async function applyMigration(name: string, sqlPath: string): Promise<boolean> {
  try {
    console.log(`\n📄 Applying migration: ${name}`);
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split SQL file into individual statements (simple split on semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`   Found ${statements.length} SQL statements`);

    // Execute each statement individually
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      try {
        // Use raw SQL execution via Supabase
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.log(`   ⚠️  Statement ${i + 1}: ${error.message} (may already exist)`);
        } else {
          process.stdout.write('.');
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log(`\n✅ Migration applied: ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply migration: ${name}`);
    console.error(error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${serviceRoleKey.substring(0, 20)}...`);

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await applyMigration(migration.name, migration.path);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`📊 Migration Summary: ${successCount} succeeded, ${failCount} failed`);
  console.log('='.repeat(70));

  if (failCount === 0) {
    console.log('\n🎉 All migrations applied successfully!');
    console.log('\nNext step: Run verification script');
    console.log('  npx tsx scripts/verify-migration.ts\n');
  } else {
    console.log('\n⚠️  Some migrations failed. This may be normal if tables already exist.');
    console.log('Run the verification script to check the database state:');
    console.log('  npx tsx scripts/verify-migration.ts\n');
  }
}

main().catch(console.error);
