import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents, APP_URL, filterAndClickEdit, setToggleState } from './helpers.mjs';

async function run() {
  const prefix = `[TEST] DebugCOMB3-${Date.now()}`;
  console.log('1. Inserting Event A (featured & live)');
  const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
    name: `${prefix} Event A`, description: 'Test A', capacity: 100, registered_count: 0,
    date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: true
  }).select().single();
  if (err_eventA) throw err_eventA;

  console.log('2. Inserting Event B (unfeatured & unlive)');
  const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
    name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
    date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
  }).select().single();
  if (err_eventB) throw err_eventB;

  const { browser, page } = await setupBrowser();
  try {
    console.log('3. Logging in as admin...');
    await loginAsAdmin(page);

    console.log('4. Making Event B featured...');
    await gotoAdminEvents(page);
    await filterAndClickEdit(page, `${prefix} Event B`);
    await setToggleState(page, 'vedette', true);

    const saveBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
      return btns.find(b => b.textContent.includes('Enregistrer'));
    });
    await saveBtn.click();
    await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

    console.log('5. Navigating to homepage...');
    await page.goto(APP_URL, { waitUntil: 'load' });
    
    // Wait 2 seconds for hydration
    await new Promise(r => setTimeout(r, 2000));

    console.log('6. Checking database state directly...');
    const { data: events } = await supabase.from('events').select('name, is_featured, is_live').in('id', [eventA.id, eventB.id]);
    console.log('Database Events State:', events);

    const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
    console.log('7. Hero Section Text:', heroText.trim().substring(0, 300));

    const hasLive = await page.$('a[href="/live"]') !== null;
    console.log('8. Is Live tab in navbar?', hasLive);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('9. Cleaning up...');
    await supabase.from('events').delete().in('id', [eventA.id, eventB.id]);
  }
}

run();
