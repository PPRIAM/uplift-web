import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envContent = fs.readFileSync('D:/UPLIFT20/uplift-web/.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const anonKey = env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const serviceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

async function run() {
  console.log('--- DIAGNOSTIC START ---');
  
  // 1. Check with Service Role Client (Bypasses RLS)
  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: adminData, error: adminErr } = await adminClient.from('reservations').select('*');
  if (adminErr) {
    console.error('❌ Admin client fetch error:', adminErr);
  } else {
    console.log(`✅ Admin client found ${adminData ? adminData.length : 0} reservations in database.`);
    if (adminData && adminData.length > 0) {
      console.log('Sample reservation:', adminData[0]);
    }
  }

  // 2. Check with Anon Client (Subject to RLS)
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: anonData, error: anonErr } = await anonClient.from('reservations').select('*');
  if (anonErr) {
    console.error('❌ Anon client fetch error:', anonErr);
  } else {
    console.log(`✅ Anon client found ${anonData ? anonData.length : 0} reservations.`);
  }

  // 3. Query RLS policies through SQL via RPC if possible, or just print active keys
  console.log('supabaseUrl:', supabaseUrl);
  console.log('Has serviceKey:', !!serviceKey);
  console.log('Has anonKey:', !!anonKey);
  
  console.log('--- DIAGNOSTIC END ---');
}

run().catch(console.error);
