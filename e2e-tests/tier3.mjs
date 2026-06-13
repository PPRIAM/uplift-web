import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents, APP_URL, filterAndClickEdit, setToggleState, filterTable } from './helpers.mjs';

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
      await gotoAdminEvents(page);
      
      // Filter list for B and click edit
      await filterAndClickEdit(page, `${prefix} Event B`);

      // Toggle Featured on B
      await setToggleState(page, 'vedette', true);

      // Save
      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Nav to home
      await page.goto(APP_URL, { waitUntil: 'load' });
      
      // Wait for React hydration
      await new Promise(r => setTimeout(r, 2000));

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
      await page.goto(APP_URL, { waitUntil: 'load' });
      
      // Wait to ensure hydration check runs
      await new Promise(r => setTimeout(r, 2000));
      
      let hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) throw new Error('Live tab is shown when no event is live.');

      // Step 2: Login in a separate navigation or context, set is_live = true
      await loginAsAdmin(page);
      await gotoAdminEvents(page);
      
      await filterAndClickEdit(page, `${prefix} Event A`);

      // Toggle Live on
      await setToggleState(page, 'live', true);

      // Save
      let saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Step 3: Check navbar
      await page.goto(APP_URL, { waitUntil: 'load' });
      
      // Wait for Live link to render via hydration
      await page.waitForSelector('a[href="/live"]', { timeout: 10000 });
      
      hasLive = await page.$('a[href="/live"]') !== null;
      if (!hasLive) throw new Error('Live tab did not appear after setting event to live.');

      // Step 4: Toggle Live off
      await gotoAdminEvents(page);
      await filterAndClickEdit(page, `${prefix} Event A`);

      await setToggleState(page, 'live', false);

      saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Step 5: Check navbar again
      await page.goto(APP_URL, { waitUntil: 'load' });
      
      // Wait for Live link to disappear
      await page.waitForFunction(() => !document.querySelector('a[href="/live"]'), { timeout: 10000 });

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
      await gotoAdminEvents(page);
      await filterAndClickEdit(page, `${prefix} Event B`);

      await setToggleState(page, 'vedette', true);

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Nav to home page
      await page.goto(APP_URL, { waitUntil: 'load' });

      // Wait for Live link to render
      await page.waitForSelector('a[href="/live"]', { timeout: 10000 });

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

    // Event B is next upcoming published event (set very soon to guarantee it is earliest)
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Event B`, description: 'Test B', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 300000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await gotoAdminEvents(page);
      
      // Filter table for Event A
      await filterTable(page, `${prefix} Event A`);

      // Click the delete button for this row
      const clicked = await page.evaluate((name) => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent.includes(name));
        if (!targetRow) return false;
        const btn = targetRow.querySelector('button[title="Supprimer"]');
        if (!btn) return false;
        btn.click();
        return true;
      }, `${prefix} Event A`);
      if (!clicked) throw new Error('Could not click delete button');
      
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
      await page.goto(APP_URL, { waitUntil: 'load' });

      // Verify Hero shows Event B
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Hero did not fallback to upcoming Event B after deleting Event A. Hero text: ' + heroText);
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
      date_time: new Date(Date.now() + 300000).toISOString(), location_name: 'Loc', published: true, is_featured: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    // Mock Event A's time to be in the past
    await supabase.from('events').update({ date_time: new Date(Date.now() - 3600000).toISOString() }).eq('id', eventA.id);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await gotoAdminEvents(page);
      await filterAndClickEdit(page, `${prefix} Event A`);

      await setToggleState(page, 'vedette', false);

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Navigate to homepage
      await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });

      // Wait for React hydration
      await new Promise(r => setTimeout(r, 2000));

      // Hero should fallback to upcoming Event B
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Event B`)) {
        throw new Error('Hero did not showcase next upcoming Event B after unfeaturing past Event A. Hero text: ' + heroText);
      }
    } finally {
      await browser.close();
    }
  }
};
