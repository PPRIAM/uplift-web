import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger .env.local
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
  // Nous supprimons les événements dont le nom commence par '[TEST]'
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
  const isWindows = process.platform === 'win32';
  const options = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: isWindows 
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : 'chrome/linux-149.0.7827.55/chrome-linux64/chrome'
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  // Définir la taille de la fenêtre d'affichage standard
  await page.setViewport({ width: 1280, height: 800 });
  return { browser, page };
}

export async function loginAsAdmin(page) {
  // Classic login via UI
  await page.goto(`${APP_URL}/auth/login`, { waitUntil: 'domcontentloaded' });
  
  // Attendre que l'hydratation React soit complète
  await new Promise(r => setTimeout(r, 2000));
  
  // Attendre la saisie de l'e-mail
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@uplift.io');
  
  // Attendre la saisie du mot de passe
  await page.waitForSelector('input[type="password"]');
  await page.type('input[type="password"]', 'PasswordAdmin123!');
  
  // Cliquer sur soumettre et attendre la redirection vers /admin (avec un timeout de 30s pour la compilation de dev)
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname.includes('/admin'), { timeout: 30000 });
}

export async function gotoAdminEvents(page) {
  const isAlreadyAdmin = await page.evaluate(() => window.location.pathname.includes('/admin'));
  if (isAlreadyAdmin) {
    // Client-side sidebar link click (extremely fast, preserves session memory)
    await page.waitForSelector('a[href="/admin/events"]');
    await page.click('a[href="/admin/events"]');
  } else {
    // Fallback full navigation
    await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'load' });
  }
  // Wait for the admin events page heading to verify successful load & hydration
  await page.waitForFunction(() => {
    const h1s = Array.from(document.querySelectorAll('h1'));
    return h1s.some(h1 => h1.textContent.includes('Gestion des événements'));
  }, { timeout: 15000 });
}

export async function clickCreateEvent(page) {
  // Wait for table loader to disappear
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 });
  
  // Find and click the button
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const createBtn = btns.find(b => b.textContent.includes('Créer un événement'));
    if (!createBtn) return false;
    createBtn.click();
    return true;
  });
  if (!clicked) {
    throw new Error('Could not find or click "Créer un événement" button');
  }
  
  // Wait for modal to open
  await page.waitForSelector('.modal-overlay', { timeout: 10000 });
}

export async function filterAndClickEdit(page, eventName) {
  // 1. Wait for table loader to disappear
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 });
  
  // 2. Type search query
  await page.waitForSelector('input[placeholder*="Filtrer"]');
  await page.click('input[placeholder*="Filtrer"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder*="Filtrer"]', eventName);
  
  // 3. Wait for the row to appear in the table
  await page.waitForFunction((name) => {
    const rows = Array.from(document.querySelectorAll('tr'));
    return rows.some(r => r.textContent.includes(name));
  }, { timeout: 20000 }, eventName);
  
  // 4. Click the edit button for this row
  const clicked = await page.evaluate((name) => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const targetRow = rows.find(r => r.textContent.includes(name));
    if (!targetRow) return false;
    const editBtn = targetRow.querySelector('button[title="Modifier"]');
    if (!editBtn) return false;
    editBtn.click();
    return true;
  }, eventName);
  
  if (!clicked) {
    throw new Error(`Could not click Modifier button for event: ${eventName}`);
  }
  
  // 5. Wait for the modal overlay to appear
  await page.waitForSelector('.modal-overlay', { timeout: 10000 });
}

export async function setToggleState(page, labelText, targetState) {
  await page.evaluate((text, state) => {
    const labels = Array.from(document.querySelectorAll('.modal-overlay label'));
    const label = labels.find(l => l.textContent.toLowerCase().includes(text.toLowerCase()));
    if (!label) throw new Error(`Toggle label containing "${text}" not found`);
    const cb = label.querySelector('input[type="checkbox"]');
    if (!cb) throw new Error(`Checkbox inside label containing "${text}" not found`);
    if (cb.checked !== state) {
      cb.click();
    }
  }, labelText, targetState);
}

export async function filterTable(page, eventName) {
  // 1. Wait for table loader to disappear
  await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 20000 });
  
  // 2. Clear search input and type query
  await page.waitForSelector('input[placeholder*="Filtrer"]');
  await page.click('input[placeholder*="Filtrer"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder*="Filtrer"]', eventName);
  
  // 3. Wait for the row to appear in the table
  await page.waitForFunction((name) => {
    const rows = Array.from(document.querySelectorAll('tr'));
    return rows.some(r => r.textContent.includes(name));
  }, { timeout: 20000 }, eventName);
}
