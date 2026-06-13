import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents } from './helpers.mjs';

async function run() {
  const prefix = `[TEST] DebugFilter-${Date.now()}`;
  console.log('1. Seeding test event:', `${prefix} Event B`);
  const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
    name: `${prefix} Event B`, description: 'Desc B', capacity: 100, registered_count: 0,
    date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false
  }).select().single();
  if (err_eventB) {
    console.error('Seed failed:', err_eventB);
    return;
  }

  // Double check directly from DB
  const { data: dbEvents } = await supabase.from('events').select('name').like('name', '[TEST]%');
  console.log('2. Test events currently in DB:', dbEvents);

  const { browser, page } = await setupBrowser();
  try {
    console.log('3. Logging in as admin...');
    await loginAsAdmin(page);

    console.log('4. Navigating to admin events...');
    await gotoAdminEvents(page);

    console.log('5. Waiting for spin loader to disappear...');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 10000 });

    const initialRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      return rows.map(r => r.textContent.trim());
    });
    console.log('6. Initial table rows:', initialRows);

    console.log('7. Finding filter input...');
    await page.waitForSelector('input[placeholder*="Filtrer"]');
    
    console.log('8. Typing filter...');
    await page.click('input[placeholder*="Filtrer"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[placeholder*="Filtrer"]', `${prefix} Event B`);
    
    // Wait a moment for filter to apply
    await new Promise(r => setTimeout(r, 2000));

    const filterVal = await page.$eval('input[placeholder*="Filtrer"]', el => el.value);
    console.log('9. Filter input value is now:', filterVal);

    const filteredRows = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      return rows.map(r => r.textContent.trim());
    });
    console.log('10. Filtered table rows:', filteredRows);

  } catch (err) {
    console.error('Error during run:', err);
  } finally {
    await browser.close();
    console.log('11. Cleaning up...');
    await supabase.from('events').delete().eq('id', eventB.id);
  }
}

run();
