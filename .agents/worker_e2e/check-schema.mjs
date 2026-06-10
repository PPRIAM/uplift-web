import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Manually parse .env.local
const envPath = path.resolve('../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking Supabase events table columns...");

  // Let's do a direct select on events to see what fields are returned
  const { data, error } = await supabase.from('events').select('*').limit(1);

  if (error) {
    console.error('Error fetching events:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    const event = data[0];
    console.log('Sample event keys:', Object.keys(event));
    console.log('is_featured exists:', 'is_featured' in event, 'type:', typeof event.is_featured);
    console.log('is_live exists:', 'is_live' in event, 'type:', typeof event.is_live);
  } else {
    // If table is empty, we can try to insert or do something else to check schema, 
    // or query postgrest to see OpenAPI schema
    console.log('No events found, fetching PostgREST API schema description...');
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/events?limit=0`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      });
      console.log('Response status:', res.status);
      console.log('Headers keys:', [...res.headers.keys()]);
      // If we can inspect schema, or we can just insert a test event
      const testName = `temp-schema-check-${Date.now()}`;
      const { data: insData, error: insError } = await supabase.from('events').insert({
        name: testName,
        description: 'Temp check',
        date_time: new Date().toISOString(),
        location_name: 'Temp'
      }).select();
      if (insError) {
        console.error('Error inserting test event:', insError);
      } else {
        console.log('Successfully inserted test event:', insData[0]);
        console.log('is_featured in inserted event:', 'is_featured' in insData[0]);
        console.log('is_live in inserted event:', 'is_live' in insData[0]);
        
        // Clean up
        const { error: delError } = await supabase.from('events').delete().eq('id', insData[0].id);
        if (delError) {
          console.error('Error cleaning up test event:', delError);
        } else {
          console.log('Cleaned up test event.');
        }
      }
    } catch (e) {
      console.error('Error querying rest endpoint:', e);
    }
  }
}

checkSchema();
