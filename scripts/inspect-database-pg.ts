/**
 * Inspect existing Supabase database using PostgreSQL connection
 *
 * Usage: npx tsx scripts/inspect-database-pg.ts <password>
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const password = process.argv[2];

if (!supabaseUrl || !password) {
  console.error('❌ Usage: npx tsx scripts/inspect-database-pg.ts <password>');
  process.exit(1);
}

// Extract project ref from Supabase URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔍 INSPECTING SUPABASE DATABASE');
    console.log('═'.repeat(70));
    console.log(`📍 Project: ${projectRef}\n`);
    console.log('🔌 Connecting...');

    await client.connect();
    console.log('✅ Connected!\n');

    // Get all tables in public schema
    console.log('📋 DISCOVERING TABLES:\n');

    const tablesQuery = `
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const { rows: tables } = await client.query(tablesQuery);

    if (tables.length === 0) {
      console.log('⚠️  No tables found in public schema\n');
    } else {
      console.log(`Found ${tables.length} tables:\n`);

      for (const table of tables) {
        console.log(`📊 Table: ${table.table_name}`);

        // Get row count
        const countQuery = `SELECT COUNT(*) as count FROM "${table.table_name}";`;
        const { rows: countRows } = await client.query(countQuery);
        const count = parseInt(countRows[0].count);

        console.log(`   Rows: ${count}`);

        // Get columns
        const columnsQuery = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position;
        `;
        const { rows: columns } = await client.query(columnsQuery, [table.table_name]);

        console.log(`   Columns (${columns.length}):`);
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          console.log(`      - ${col.column_name}: ${col.data_type} (${nullable})`);
        });

        // Get sample data if any rows exist
        if (count > 0 && count < 1000) {
          const sampleQuery = `SELECT * FROM "${table.table_name}" LIMIT 2;`;
          const { rows: samples } = await client.query(sampleQuery);

          if (samples.length > 0) {
            console.log(`   Sample data (first row):`);
            const firstRow = samples[0];
            Object.keys(firstRow).forEach(key => {
              let value = firstRow[key];
              if (typeof value === 'string' && value.length > 50) {
                value = value.substring(0, 50) + '...';
              }
              console.log(`      ${key}: ${JSON.stringify(value)}`);
            });
          }
        }

        console.log('');
      }
    }

    // Check for extensions
    console.log('═'.repeat(70));
    console.log('🔧 CHECKING EXTENSIONS:\n');

    const extQuery = `
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname IN ('vector', 'uuid-ossp', 'pg_stat_statements');
    `;

    const { rows: extensions } = await client.query(extQuery);

    if (extensions.length > 0) {
      extensions.forEach(ext => {
        console.log(`   ✅ ${ext.extname} (v${ext.extversion})`);
      });
    } else {
      console.log('   ℹ️  No relevant extensions found');
    }

    // Check for vector columns
    console.log('\n🔍 CHECKING FOR VECTOR COLUMNS:\n');

    const vectorQuery = `
      SELECT table_name, column_name, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND udt_name = 'vector';
    `;

    const { rows: vectorCols } = await client.query(vectorQuery);

    if (vectorCols.length > 0) {
      vectorCols.forEach(col => {
        console.log(`   ✅ ${col.table_name}.${col.column_name} (vector)`);
      });
    } else {
      console.log('   ℹ️  No vector columns found');
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n✨ Inspection complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
