import { supabase, setupBrowser, loginAsAdmin, gotoAdminEvents, APP_URL, filterAndClickEdit, setToggleState, filterTable } from './helpers.mjs';

export const tests = {
  'TC-SCEN-01': async () => {
    const prefix = `[TEST] TC-SCEN-01-${Date.now()}`;
    // Seed a draft event (published = false)
    const { data: event, error: err_event } = await supabase.from('events').insert({
      name: `${prefix} Scenario Event`, description: 'E2E Lifecycle', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: false, is_featured: false, is_live: false
    }).select().single();
    if (err_event) throw new Error('Insert failed: ' + err_event.message);

    const { browser, page } = await setupBrowser();
    try {
      console.log('SCEN-01: Logging in as admin...');
      await loginAsAdmin(page);

      console.log('SCEN-01: Navigating to admin events page...');
      await gotoAdminEvents(page);
      
      // 1-3. Filter table
      try {
        await filterTable(page, `${prefix} Scenario Event`);
      } catch (e) {
        throw new Error('Timeout filtering table: ' + e.message);
      }

      console.log('SCEN-01: Clicking publish toggle button...');
      const publishedClicked = await page.evaluate((name) => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent.includes(name));
        if (!targetRow) return false;
        const btns = Array.from(targetRow.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes('En ligne') || b.textContent.includes('Brouillon'));
        if (!btn) return false;
        btn.click();
        return true;
      }, `${prefix} Scenario Event`);
      if (!publishedClicked) throw new Error('Could not click publish button.');
      
      console.log('SCEN-01: Waiting for table to update...');
      await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));
      
      console.log('SCEN-01: Clicking Edit using helper...');
      try {
        await filterAndClickEdit(page, `${prefix} Scenario Event`);
      } catch (e) {
        throw new Error('Timeout during filterAndClickEdit: ' + e.message);
      }

      console.log('SCEN-01: Toggling Live on...');
      await setToggleState(page, 'live', true);

      console.log('SCEN-01: Clicking Save button...');
      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      console.log('SCEN-01: Waiting for modal overlay to disappear...');
      try {
        await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });
      } catch (e) {
        throw new Error('Timeout waiting for modal-overlay to disappear after Save');
      }

      console.log('SCEN-01: Navigating to homepage...');
      await page.goto(APP_URL, { waitUntil: 'load' });
      console.log('SCEN-01: Waiting for live tab in navbar...');
      try {
        await page.waitForSelector('a[href="/live"]', { timeout: 10000 });
      } catch (e) {
        throw new Error('"En direct" tab not found in navbar.');
      }
      console.log('SCEN-01: Clicking live tab...');
      await page.click('a[href="/live"]');
      console.log('SCEN-01: Waiting for redirect to /live...');
      try {
        await page.waitForFunction(() => window.location.pathname.includes('/live'), { timeout: 10000 });
      } catch (e) {
        throw new Error('Timeout waiting for window.location to redirect to /live');
      }

      const currentUrl = page.url();
      if (!currentUrl.includes('/live')) {
        throw new Error('User was not navigated to /live upon clicking the tab. Current URL: ' + currentUrl);
      }

      console.log('SCEN-01: Navigating back to admin events page...');
      await gotoAdminEvents(page);
      console.log('SCEN-01: Clicking Edit using helper to toggle off...');
      try {
        await filterAndClickEdit(page, `${prefix} Scenario Event`);
      } catch (e) {
        throw new Error('Timeout during filterAndClickEdit to toggle off: ' + e.message);
      }

      console.log('SCEN-01: Toggling Live off...');
      await setToggleState(page, 'live', false);

      console.log('SCEN-01: Clicking Save button (live off)...');
      const saveBtn2 = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn2.click();
      console.log('SCEN-01: Waiting for modal overlay to disappear...');
      try {
        await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });
      } catch (e) {
        throw new Error('Timeout waiting for modal-overlay to disappear after Save toggling live off');
      }

      console.log('SCEN-01: Navigating back to homepage...');
      await page.goto(APP_URL, { waitUntil: 'load' });
      console.log('SCEN-01: Verifying live tab is gone...');
      const liveLink2 = await page.$('a[href="/live"]');
      if (liveLink2) {
        throw new Error('"En direct" tab is still present after live status ended.');
      }
      console.log('SCEN-01: Complete!');
    } finally {
      await browser.close();
    }
  },

  'TC-SCEN-02': async () => {
    // Unfeature all events
    await supabase.from('events').update({ is_featured: false }).neq('name', 'SomeNonExistentEvent');

    const prefix = `[TEST] TC-SCEN-02-${Date.now()}`;
    const { data: event, error: err_event } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Promo flow', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: false
    }).select().single();
    if (err_event) throw new Error('Insert failed: ' + err_event.message);

    const { browser, page } = await setupBrowser();
    try {
      // 1. Visit homepage, view Event A, check registration page
      await page.goto(APP_URL, { waitUntil: 'load' });
      let heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(prefix)) {
        throw new Error('Hero does not display promo event details.');
      }

      // Click register
      const ctaBtn = await page.evaluateHandle(() => {
        const hero = document.querySelector('section');
        if (!hero) return null;
        const btns = Array.from(hero.querySelectorAll('a, button'));
        return btns.find(b => b.textContent.includes('Réserver') || b.textContent.includes('S\'inscrire') || b.textContent.includes('S’inscrire') || b.textContent.includes('Rejoindre'));
      });
      await ctaBtn.click();
      await page.waitForFunction((id) => window.location.pathname.includes(id), { timeout: 10000 }, event.id);
      if (!page.url().includes(`/events/${event.id}`)) {
        throw new Error('Redirection to event registration page failed.');
      }

      // 2. Admin sets is_live = true
      await supabase.from('events').update({ is_live: true }).eq('id', event.id);

      // 3. User visits homepage. Hero still shows A, shows Pulsing Live badge, navbar shows live link
      await page.goto(APP_URL, { waitUntil: 'load' });
      heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(prefix)) {
        throw new Error('Hero no longer showcases Event A after it went live.');
      }

      // Check pulsing badge/live label in hero
      const heroHasLiveBadge = await page.evaluate(() => {
        const section = document.querySelector('section');
        return section ? (section.textContent.toLowerCase().includes('en direct') || section.textContent.toLowerCase().includes('live now') || section.textContent.toLowerCase().includes('direct')) : false;
      });
      if (!heroHasLiveBadge) {
        throw new Error('Hero section lacks a pulsing Live/En direct badge when the showcased event is live.');
      }

      // Check navbar has live link
      try {
        await page.waitForSelector('a[href="/live"]', { timeout: 10000 });
      } catch (e) {
        throw new Error('Navbar is missing "En direct" tab when event goes live.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-SCEN-03': async () => {
    // Unfeature all events
    await supabase.from('events').update({ is_featured: false }).neq('name', 'SomeNonExistentEvent');

    const prefix = `[TEST] TC-SCEN-03-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Live Featured`, description: 'Promo live', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Upcoming Fallback`, description: 'Upcoming', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 300000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await gotoAdminEvents(page);
      
      // Filter table for Event A
      await filterTable(page, `${prefix} Live Featured`);

      // Delete Event A
      const clicked = await page.evaluate((name) => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent.includes(name));
        if (!targetRow) return false;
        const btn = targetRow.querySelector('button[title="Supprimer"]');
        if (!btn) return false;
        btn.click();
        return true;
      }, `${prefix} Live Featured`);
      if (!clicked) throw new Error('Could not click delete button');
      
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      const confirmBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Supprimer'));
      });
      await confirmBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Navigate to homepage immediately
      await page.goto(APP_URL, { waitUntil: 'load' });

      // Page shouldn't crash, should fallback gracefully to the next upcoming event
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(prefix)) {
        throw new Error('Homepage layout crashed or failed to fallback to the next upcoming event details upon accidental deletion of the featured event. Hero text: ' + heroText);
      }

      // Live tab should disappear
      await page.waitForFunction(() => !document.querySelector('a[href="/live"]'), { timeout: 5000 });
      const hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) {
        throw new Error('Live tab remains after deleting the live event.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-SCEN-04': async () => {
    // Concurrent saves test simulating multiple administrators editing two events
    const prefix = `[TEST] TC-SCEN-04-${Date.now()}`;
    const { data: event1, error: err_event1 } = await supabase.from('events').insert({
      name: `${prefix} Event 1`, description: 'Test 1', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: false
    }).select().single();
    if (err_event1) throw new Error('Insert failed: ' + err_event1.message);
    const { data: event2, error: err_event2 } = await supabase.from('events').insert({
      name: `${prefix} Event 2`, description: 'Test 2', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false
    }).select().single();
    if (err_event2) throw new Error('Insert failed: ' + err_event2.message);

    // Trigger parallel updates to set both to featured: true
    const results = await Promise.allSettled([
      supabase.from('events').update({ is_featured: true }).eq('id', event1.id),
      supabase.from('events').update({ is_featured: true }).eq('id', event2.id)
    ]);

    // Inspect database state
    const { data: events } = await supabase.from('events').select('id, name, is_featured').in('id', [event1.id, event2.id]);
    const featuredCount = events.filter(e => e.is_featured).length;

    if (featuredCount > 1) {
      throw new Error(`Database transaction integrity failed. More than one event remains featured under concurrent updates. Featured count: ${featuredCount}`);
    }
  },

  'TC-SCEN-05': async () => {
    // Off-season maintenance: no upcoming/featured events
    // We unpublish/delete or set all dates in the past and unfeature them
    await supabase.from('events').update({ is_featured: false, published: false }).neq('name', 'SomeNonExistentEvent');

    const { browser, page } = await setupBrowser();
    try {
      await page.goto(APP_URL, { waitUntil: 'load' });

      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      // Expect default branding text in Hero
      if (!heroText.includes('Uplift Platform') && !heroText.includes('Leve ansanm')) {
        throw new Error('Hero did not default to standard brand text when no events exist. Text: ' + heroText);
      }

      // "Aucun événement trouvé" should be shown in upcoming list on the events page
      await page.goto(`${APP_URL}/events`, { waitUntil: 'load' });
      const upcomingText = await page.evaluate(() => {
        const lists = Array.from(document.querySelectorAll('div, section, h3'));
        const evList = lists.find(l => l.textContent.includes('Aucun événement') || l.textContent.includes('pas d\'événement'));
        return evList ? evList.textContent : '';
      });
      if (!upcomingText.toLowerCase().includes('aucun événement') && !upcomingText.toLowerCase().includes('pas d\'événement')) {
        throw new Error('Upcoming events grid on /events did not display fallback drought text. Got: ' + upcomingText);
      }

      // Navbar live tab should be hidden
      const hasLive = await page.$('a[href="/live"]') !== null;
      if (hasLive) {
        throw new Error('Live link is visible when all events are in past / unpublished.');
      }
    } finally {
      await browser.close();
    }
  }
};
