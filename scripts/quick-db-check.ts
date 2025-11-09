import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listTables() {
  console.log('🔍 Checking database:', supabaseUrl);
  console.log('');

  // Try common table names
  const tablesToCheck = ['users', 'profiles', 'documents', 'path_templates', 'tasks', 'cases', 'plans', 'artifacts', 'messages', 'events', 'embeddings'];

  for (const table of tablesToCheck) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✅ ${table}: ${count} rows`);
    } else if (error.code === '42P01') {
      console.log(`❌ ${table}: table does not exist`);
    } else {
      console.log(`⚠️  ${table}: ${error.message} (${error.code})`);
    }
  }
}

listTables().catch(console.error);
