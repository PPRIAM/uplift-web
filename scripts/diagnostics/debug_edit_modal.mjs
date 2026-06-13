import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents } from '../../e2e-tests/helpers.mjs';

async function main() {
  const tempName = `[TEST] debug_edit_modal-${Date.now()}`;
  
  // Seed the test event
  console.log('Seeding test event...');
  const { data: event, error } = await supabase.from('events').insert({
    name: tempName,
    description: 'Test event description',
    date_time: new Date(Date.now() + 86400000).toISOString(),
    location_name: 'Virtual Location',
    capacity: 123,
    registered_count: 0,
    published: true,
    is_featured: true,
    is_live: false
  }).select().single();

  if (error) {
    console.error('Seeding failed:', error);
    return;
  }
  console.log('Seeded event:', JSON.stringify(event, null, 2));

  const { browser, page } = await setupBrowser();
  
  // Capture page console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  try {
    console.log('Logging in as admin...');
    await loginAsAdmin(page);
    console.log('Navigating to admin events page...');
    await gotoAdminEvents(page);

    console.log('Waiting for loader to disappear...');
    await page.waitForFunction(() => !document.querySelector('.animate-spin'), { timeout: 10000 });
    console.log('Loader gone, waiting for filter input...');
    await page.waitForSelector('input[placeholder*="Filtrer"]');
    
    console.log('Filtering events for:', tempName);
    await page.type('input[placeholder*="Filtrer"]', tempName);
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

    console.log('Finding modifier button...');
    const rows = await page.$$('tr');
    console.log(`Found ${rows.length} rows in the table.`);
    for (let i = 0; i < rows.length; i++) {
      const text = await page.evaluate(el => el.textContent, rows[i]);
      console.log(`Row ${i}:`, text.trim());
    }

    let editBtn = null;
    for (const row of rows) {
      const text = await page.evaluate(el => el.textContent, row);
      if (text && text.includes(tempName)) {
        editBtn = await row.$('button[title="Modifier"]');
        break;
      }
    }

    if (!editBtn) {
      console.error('Could not find edit button!');
      return;
    }

    console.log('Clicking edit button...');
    await editBtn.click();

    console.log('Waiting for modal...');
    await page.waitForSelector('.modal-overlay', { timeout: 5000 });

    console.log('Getting checkboxes info...');
    const checks = await page.evaluate(() => {
      const results = [];
      const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
      checkboxes.forEach((cb, idx) => {
        const parentLabel = cb.closest('label');
        const labelText = parentLabel ? parentLabel.textContent.trim() : '';
        results.push({
          index: idx,
          label: labelText,
          checked: cb.checked,
          html: cb.outerHTML,
          parentHtml: parentLabel ? parentLabel.outerHTML : null
        });
      });
      return results;
    });

    console.log('Checkboxes found:', JSON.stringify(checks, null, 2));

    console.log('Getting modal buttons...');
    const buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
      return btns.map(b => ({
        text: b.textContent.trim(),
        html: b.outerHTML
      }));
    });
    console.log('Buttons found:', JSON.stringify(buttons, null, 2));

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    // Cleanup
    console.log('Cleaning up event...');
    await supabase.from('events').delete().eq('id', event.id);
    await browser.close();
  }
}

main();
