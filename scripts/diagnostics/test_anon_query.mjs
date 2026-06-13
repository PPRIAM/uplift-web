import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env variables
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

async function run() {
  const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  
  const anonClient = createClient(supabaseUrl, supabaseKey);
  const adminClient = createClient(supabaseUrl, env['SUPABASE_SERVICE_ROLE_KEY']);
  const prefix = `[TEST] Anon Query ${Date.now()}`;
  
  console.log('Inserting test event...');
  const { data: inserted, error: insertErr } = await adminClient.from('events').insert({
    name: `${prefix} Live`,
    description: 'Live check',
    capacity: 100,
    registered_count: 0,
    date_time: new Date(Date.now() + 86400000).toISOString(),
    location_name: 'Loc',
    published: true,
    is_live: true
  }).select().single();
  
  if (insertErr) {
    console.error('Insert error:', insertErr);
    return;
  }
  
  console.log('Querying as anon client...');
  const { data, error } = await anonClient
    .from('events')
    .select('id, name, published, is_live')
    .eq('published', true)
    .eq('is_live', true);
    
  if (error) {
    console.error('Anon client fetch error:', error);
  } else {
    console.log('Anon client query returned:', data);
  }
  
  // Cleanup
  await adminClient.from('events').delete().eq('id', inserted.id);
  console.log('Cleaned up.');
}

run();
