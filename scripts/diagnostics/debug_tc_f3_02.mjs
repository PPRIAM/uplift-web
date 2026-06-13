import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents, setToggleState, APP_URL } from '../../e2e-tests/helpers.mjs';

async function main() {
  const prefix = `[TEST] debug_tc_f3_02-${Date.now()}`;
  console.log('Resetting featured events...');
  await supabase.from('events').update({ is_featured: false }).eq('is_featured', true);

  console.log('Seeding Event A (featured)...');
  const { data: eventA, error: errA } = await supabase.from('events').insert({
    name: `${prefix} Event A`, description: 'Test A', capacity: 100, registered_count: 0,
    date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true
  }).select().single();
  if (errA) {
    console.error('Error seeding A:', errA);
    return;
  }
  console.log('Event A seeded:', eventA.id, eventA.name);

  console.log('Seeding Event B (unfeatured)...');
  const { data: eventB, error: errB } = await supabase.from('events').insert({
    name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
    date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false
  }).select().single();
  if (errB) {
    console.error('Error seeding B:', errB);
    return;
  }
  console.log('Event B seeded:', eventB.id, eventB.name);

  const { browser, page } = await setupBrowser();
  try {
    console.log('Logging in as admin...');
    await loginAsAdmin(page);
    console.log('Navigating to admin events...');
    await gotoAdminEvents(page);

    console.log('Filtering and clicking edit on B...');
    // Type search query
    await page.waitForSelector('input[placeholder*="Filtrer"]');
    await page.click('input[placeholder*="Filtrer"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[placeholder*="Filtrer"]', `${prefix} Event B`);
    
    // Wait for row
    await page.waitForFunction((name) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      return rows.some(r => r.textContent.includes(name));
    }, { timeout: 10000 }, `${prefix} Event B`);

    // Click edit
    const clicked = await page.evaluate((name) => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const targetRow = rows.find(r => r.textContent.includes(name));
      if (!targetRow) return false;
      const editBtn = targetRow.querySelector('button[title="Modifier"]');
      if (!editBtn) return false;
      editBtn.click();
      return true;
    }, `${prefix} Event B`);
    if (!clicked) throw new Error('Could not click edit button');

    console.log('Waiting for modal...');
    await page.waitForSelector('.modal-overlay', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Toggling Featured on for B...');
    await setToggleState(page, 'vedette', true);

    console.log('Saving B...');
    const saveBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
      return btns.find(b => b.textContent.includes('Enregistrer'));
    });
    await saveBtn.click();

    console.log('Waiting for modal to close...');
    await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });
    console.log('Modal closed. Querying DB...');

    const resA = await supabase.from('events').select('*').eq('id', eventA.id);
    const resB = await supabase.from('events').select('*').eq('id', eventB.id);

    console.log('DB query results:');
    console.log('Event A:', resA.data ? resA.data[0] : null, 'Error:', resA.error);
    console.log('Event B:', resB.data ? resB.data[0] : null, 'Error:', resB.error);

  } catch (err) {
    console.error('E2E steps failed:', err);
  } finally {
    console.log('Cleaning up events...');
    await supabase.from('events').delete().like('name', `${prefix}%`);
    await browser.close();
  }
}

main();
