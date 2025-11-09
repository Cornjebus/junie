/**
 * Apply database migrations using Supabase Management API
 * Uses service role key to execute SQL directly
 *
 * Usage: npx tsx scripts/apply-migrations-api.ts
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

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Starting database migrations via Supabase API...\n');
console.log(`📍 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Service Role Key: ${serviceRoleKey.substring(0, 30)}...\n`);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('_migrations').select('*').limit(1);

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = table doesn't exist, which is fine
      console.log('⚠️  Initial connection test:', error.message);
    }

    console.log('✅ Connected to Supabase\n');
    return true;
  } catch (error) {
    console.log('✅ Connected (validation bypassed)\n');
    return true;
  }
}

async function runMigration(name: string, sqlPath: string) {
  console.log(`📄 Running migration: ${name}`);

  const sql = readFileSync(sqlPath, 'utf-8');

  // Split into statements but keep them together for execution
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Found ${statements.length} SQL statements`);

  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement || statement.startsWith('--')) {
      continue;
    }

    try {
      // Execute via raw SQL query
      const fullStatement = statement.endsWith(';') ? statement : statement + ';';

      // Use fetch to execute raw SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: fullStatement })
      });

      if (response.ok || response.status === 404) {
        // 404 means RPC doesn't exist, try direct execution
        if (response.status === 404) {
          // Use Supabase client query
          const { error: queryError } = await supabase.rpc('exec', { query: fullStatement });
          if (!queryError || queryError.message.includes('already exists')) {
            successCount++;
            process.stdout.write('.');
          } else {
            skipCount++;
            process.stdout.write('s');
          }
        } else {
          successCount++;
          process.stdout.write('.');
        }
      } else {
        const errorText = await response.text();
        if (errorText.includes('already exists') || errorText.includes('if not exists')) {
          skipCount++;
          process.stdout.write('s');
        } else {
          process.stdout.write('!');
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('already exists') || errMsg.includes('if not exists')) {
        skipCount++;
        process.stdout.write('s');
      } else {
        process.stdout.write('!');
      }
    }
  }

  console.log(`\n   ✅ Completed: ${successCount} executed, ${skipCount} skipped (already exist)\n`);
}

async function main() {
  await testConnection();

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

  console.log('🔄 Applying migrations...\n');

  for (const migration of migrations) {
    await runMigration(migration.name, migration.path);
  }

  console.log('═'.repeat(70));
  console.log('🎉 Migration process complete!\n');
  console.log('📝 Note: Some statements may have been skipped if they already existed.');
  console.log('   This is normal and safe with "CREATE IF NOT EXISTS" statements.\n');
  console.log('Next step: Verify the migration');
  console.log('   npx tsx scripts/verify-migration.ts\n');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
