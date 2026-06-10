import { supabase, setupBrowser, loginAsAdmin, APP_URL } from './helpers.mjs';

export const tests = {
  'TC-COMB-01': async () => {
    const prefix = `[TEST] TC-COMB-01-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Desc A', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Event B`, description: 'Desc B', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      
      // Filter list for B
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event B`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Click Edit
      const rows = await page.$$('tr');
      let editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event B`)) {
          editBtn = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      // Toggle Featured on B
      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
        checkboxes.forEach(cb => {
          const text = cb.closest('div').textContent.toLowerCase();
          if (text.includes('featured') || text.includes('avant') || text.includes('vedette')) {
            if (!cb.checked) cb.click();
          }
        });
      });

      // Save
      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Nav to home
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');

      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Hero did not update to B after saving it as featured.');
      }
      if (heroText.includes(`${prefix} Event A`)) {
        throw new Error('Hero still showcases A after B became featured.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-COMB-02': async () => {
    // Ensure no live events
    await supabase.from('events').update({ is_live: false }).neq('name', 'SomeNonExistentEvent');

    const prefix = `[TEST] TC-COMB-02-${Date.now()}`;
    const { data: event, error: err_event } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Desc A', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_live: false
    }).select().single();
    if (err_event) throw new Error('Insert failed: ' + err_event.message);

    const { browser, page } = await setupBrowser();
    try {
      // Step 1: Nav to home as public user
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      let hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) throw new Error('Live tab is shown when no event is live.');

      // Step 2: Login in a separate navigation or context, set is_live = true
      await loginAsAdmin(page);
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event A`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Click Edit
      let rows = await page.$$('tr');
      let editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event A`)) {
          editBtn = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      // Toggle Live on
      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
        checkboxes.forEach(cb => {
          const text = cb.closest('div').textContent.toLowerCase();
          if (text.includes('live') || text.includes('direct')) {
            if (!cb.checked) cb.click();
          }
        });
      });

      // Save
      let saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Step 3: Check navbar
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      hasLive = await page.$('a[href="/live"]') !== null;
      if (!hasLive) throw new Error('Live tab did not appear after setting event to live.');

      // Step 4: Toggle Live off
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event A`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      rows = await page.$$('tr');
      editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event A`)) {
          editBtn = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
        checkboxes.forEach(cb => {
          const text = cb.closest('div').textContent.toLowerCase();
          if (text.includes('live') || text.includes('direct')) {
            if (cb.checked) cb.click();
          }
        });
      });

      saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Step 5: Check navbar again
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) throw new Error('Live tab is still shown after setting event to unlive.');
    } finally {
      await browser.close();
    }
  },

  'TC-COMB-03': async () => {
    // Event A is featured and live. Event B is unfeatured and unlive.
    const prefix = `[TEST] TC-COMB-03-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Test A', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      
      // Admin makes Event B featured
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event B`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      const rows = await page.$$('tr');
      let editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event B`)) {
          editBtn = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
        checkboxes.forEach(cb => {
          const text = cb.closest('div').textContent.toLowerCase();
          if (text.includes('featured') || text.includes('avant') || text.includes('vedette')) {
            if (!cb.checked) cb.click();
          }
        });
      });

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Nav to home page
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });

      // Event B showcased in Hero
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Event B not showcased in Hero after transition.');
      }

      // Live tab remains visible (since A is still live in DB)
      const hasLive = await page.$('a[href="/live"]') !== null;
      if (!hasLive) {
        throw new Error('Live tab disappeared when featured status was changed away from the live event.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-COMB-04': async () => {
    // Event A is published, featured, and live
    const prefix = `[TEST] TC-COMB-04-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Test A', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);

    // Event B is next upcoming published event
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event A`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Delete Event A via admin page
      const rows = await page.$$('tr');
      let deleteBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event A`)) {
          deleteBtn = await row.$('button[title="Supprimer"]');
          break;
        }
      }
      await deleteBtn.click();
      
      // Confirm deletion in dialog
      await page.waitForFunction(() => {
        const modal = document.querySelector('.modal-overlay');
        return modal && modal.textContent.includes('Supprimer');
      }, { timeout: 3000 });

      const confirmBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Supprimer'));
      });
      await confirmBtn.click();

      // Wait for delete modal to close
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Navigate to home page
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });

      // Verify Hero shows Event B
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Hero did not fallback to upcoming Event B after deleting Event A.');
      }

      // Verify Live tab is gone
      const hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) {
        throw new Error('Live tab remains in navbar after deleting the only live event.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-COMB-05': async () => {
    // Event A is upcoming featured, Event B is upcoming unfeatured
    const prefix = `[TEST] TC-COMB-05-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Test A', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    // Mock Event A's time to be in the past
    await supabase.from('events').update({ date_time: new Date(Date.now() - 3600000).toISOString() }).eq('id', eventA.id);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Event A`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Disable featured status on past Event A
      const rows = await page.$$('tr');
      let editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Event A`)) {
          editBtn = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      await page.evaluate(() => {
        const checkboxes = document.querySelectorAll('.modal-overlay input[type="checkbox"]');
        checkboxes.forEach(cb => {
          const text = cb.closest('div').textContent.toLowerCase();
          if (text.includes('featured') || text.includes('avant') || text.includes('vedette')) {
            if (cb.checked) cb.click();
          }
        });
      });

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Navigate to homepage
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });

      // Hero should fallback to upcoming Event B
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Hero did not showcase next upcoming Event B after unfeaturing past Event A.');
      }
    } finally {
      await browser.close();
    }
  }
};
