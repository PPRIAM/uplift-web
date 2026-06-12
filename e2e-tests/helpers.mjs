import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

export const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Service Role Key in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const APP_URL = 'http://localhost:3000';

export async function createAdminUserIfNeeded() {
  const adminEmail = 'admin@uplift.io';
  const adminPassword = 'PasswordAdmin123!';

  let page = 1;
  let existingAdmin = null;

  while (true) {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 100
    });
    if (listError) {
      console.error('Error listing users during setup:', listError.message);
      break;
    }
    if (!users || users.length === 0) {
      break;
    }
    existingAdmin = users.find(u => u.email?.toLowerCase() === adminEmail);
    if (existingAdmin) {
      break;
    }
    page++;
  }

  if (existingAdmin) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingAdmin.id, {
      password: adminPassword,
      user_metadata: { role: 'admin', verified: true }
    });
    if (updateError) {
      console.error('Error updating existing admin user:', updateError.message);
    }
  } else {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin', verified: true }
    });
    if (createError) {
      console.error('Error creating admin user:', createError.message);
    }
  }
}

export async function cleanupTestEvents() {
  // We delete events with names starting with '[TEST]'
  const { data: testEvents, error: fetchError } = await supabase
    .from('events')
    .select('id')
    .like('name', '[TEST]%');

  if (fetchError) {
    console.error('Error fetching test events for cleanup:', fetchError.message);
    return;
  }

  if (testEvents && testEvents.length > 0) {
    const ids = testEvents.map(e => e.id);
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('Error deleting test events:', deleteError.message);
    } else {
      console.log(`Cleaned up ${ids.length} test events.`);
    }
  }
}

export async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'chrome/linux-149.0.7827.55/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // Set standard viewport
  await page.setViewport({ width: 1280, height: 800 });
  return { browser, page };
}

export async function loginAsAdmin(page) {
  await page.goto(`${APP_URL}/auth/login`, { waitUntil: 'networkidle2' });
  
  // Wait for email input
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@uplift.io');
  
  // Wait for password input
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', 'PasswordAdmin123!');
  
  // Click submit
  await page.click('button[type="submit"]');
  
  // Wait for redirection to admin or home page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}
