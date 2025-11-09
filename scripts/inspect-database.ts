/**
 * Inspect existing Supabase database schema and data
 *
 * Usage: npx tsx scripts/inspect-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 INSPECTING SUPABASE DATABASE');
console.log('═'.repeat(70));
console.log(`📍 Project: ${supabaseUrl}\n`);

async function inspectTable(tableName: string) {
  try {
    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log(`   ❌ Error: ${countError.message}`);
      return null;
    }

    // Get sample data
    const { data, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    if (dataError) {
      console.log(`   ⚠️  Count: ${count} rows, but couldn't fetch sample data`);
      return { count, sample: null };
    }

    console.log(`   ✅ ${count || 0} rows`);

    if (data && data.length > 0) {
      console.log(`   📊 Sample columns: ${Object.keys(data[0]).join(', ')}`);
      if (count && count > 0) {
        console.log(`   📝 First record preview:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
    }

    return { count, sample: data };
  } catch (error) {
    console.log(`   ❌ Exception: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function main() {
  // Tables we expect based on the schema
  const expectedTables = [
    'users',
    'profiles',
    'cases',
    'plans',
    'tasks',
    'artifacts',
    'messages',
    'events',
    'embeddings',
    'path_templates',
    'artifact_templates',
    'subscriptions',
    'ai_costs',
    'documents' // From pgvector migration
  ];

  console.log('📋 CHECKING TABLES:\n');

  const existingTables = [];
  const missingTables = [];

  for (const table of expectedTables) {
    console.log(`🔍 Table: ${table}`);
    const result = await inspectTable(table);

    if (result !== null) {
      existingTables.push({ table, count: result.count || 0 });
    } else {
      missingTables.push(table);
    }
    console.log('');
  }

  // Summary
  console.log('═'.repeat(70));
  console.log('📊 DATABASE SUMMARY\n');

  console.log(`✅ Existing tables (${existingTables.length}):`);
  existingTables.forEach(({ table, count }) => {
    console.log(`   - ${table}: ${count} rows`);
  });

  if (missingTables.length > 0) {
    console.log(`\n❌ Missing tables (${missingTables.length}):`);
    missingTables.forEach(table => {
      console.log(`   - ${table}`);
    });
  }

  console.log('\n' + '═'.repeat(70));

  // Check for vector extension
  console.log('\n🔧 CHECKING EXTENSIONS:\n');

  try {
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (!error) {
      console.log('   ✅ pgvector extension appears to be enabled (documents table exists)');
    } else {
      console.log('   ℹ️  pgvector status unclear:', error.message);
    }
  } catch (e) {
    console.log('   ⚠️  Could not check pgvector extension');
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n✨ Inspection complete!\n');
}

main().catch(console.error);
