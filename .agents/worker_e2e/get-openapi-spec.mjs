import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const spec = await res.json();
  const eventsDef = spec.definitions.events;
  if (eventsDef) {
    console.log('Events properties:', Object.keys(eventsDef.properties));
    console.log('Required properties:', eventsDef.required);
    console.log('is_featured details:', eventsDef.properties.is_featured);
    console.log('is_live details:', eventsDef.properties.is_live);
    // Also log whole eventsDef properties for reference
    console.log('All properties details:', JSON.stringify(eventsDef.properties, null, 2));
  } else {
    console.log('events definition not found in OpenAPI spec');
  }
}

run();
