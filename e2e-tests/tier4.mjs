import { supabase, setupBrowser, loginAsAdmin, APP_URL } from './helpers.mjs';

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
      await loginAsAdmin(page);

      // 1. Admin publishes the event & enables Live
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Scenario Event`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Toggle published
      const publishBtn = await page.evaluateHandle((pfx) => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent.includes(pfx));
        return targetRow ? targetRow.querySelector('button') : null;
      }, prefix);
      if (!publishBtn) throw new Error('Could not find publish button in admin row.');
      await publishBtn.click();
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Click Edit to toggle live
      const rows = await page.$$('tr');
      let editBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Scenario Event`)) {
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

      const saveBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // 2. Public users see "En direct" tab, click it, and go to /live
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      const liveLink = await page.$('a[href="/live"]');
      if (!liveLink) throw new Error('"En direct" tab not found in navbar.');
      await liveLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Assert redirected to /live or showing streaming player interface
      const currentUrl = page.url();
      if (!currentUrl.includes('/live')) {
        throw new Error('User was not navigated to /live upon clicking the tab. Current URL: ' + currentUrl);
      }

      // 3. Event ends; Admin toggles Live off
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Scenario Event`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      const rows2 = await page.$$('tr');
      let editBtn2 = null;
      for (const row of rows2) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Scenario Event`)) {
          editBtn2 = await row.$('button[title="Modifier"]');
          break;
        }
      }
      await editBtn2.click();
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

      const saveBtn2 = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Enregistrer'));
      });
      await saveBtn2.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // 4. Public users see live tab gone
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      const liveLink2 = await page.$('a[href="/live"]');
      if (liveLink2) {
        throw new Error('"En direct" tab is still present after live status ended.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-SCEN-02': async () => {
    const prefix = `[TEST] TC-SCEN-02-${Date.now()}`;
    const { data: event, error: err_event } = await supabase.from('events').insert({
      name: `${prefix} Event A`, description: 'Promo flow', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: false
    }).select().single();
    if (err_event) throw new Error('Insert failed: ' + err_event.message);

    const { browser, page } = await setupBrowser();
    try {
      // 1. Visit homepage, view Event A, check registration page
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
      let heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(prefix)) {
        throw new Error('Hero does not display promo event details.');
      }

      // Click register
      const ctaBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('a, button'));
        return btns.find(b => b.textContent.includes('Réserver') || b.textContent.includes('S\'inscrire') || b.textContent.includes('S’inscrire'));
      });
      await ctaBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      if (!page.url().includes(`/events/${event.id}`)) {
        throw new Error('Redirection to event registration page failed.');
      }

      // 2. Admin sets is_live = true
      await supabase.from('events').update({ is_live: true }).eq('id', event.id);

      // 3. User visits homepage. Hero still shows A, shows Pulsing Live badge, navbar shows live link
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });
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
      const hasLiveTab = await page.$('a[href="/live"]') !== null;
      if (!hasLiveTab) {
        throw new Error('Navbar is missing "En direct" tab when event goes live.');
      }
    } finally {
      await browser.close();
    }
  },

  'TC-SCEN-03': async () => {
    const prefix = `[TEST] TC-SCEN-03-${Date.now()}`;
    const { data: eventA, error: err_eventA } = await supabase.from('events').insert({
      name: `${prefix} Live Featured`, description: 'Promo live', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 86400000).toISOString(), location_name: 'Loc', published: true, is_featured: true, is_live: true
    }).select().single();
    if (err_eventA) throw new Error('Insert failed: ' + err_eventA.message);
    const { data: eventB, error: err_eventB } = await supabase.from('events').insert({
      name: `${prefix} Upcoming Fallback`, description: 'Upcoming', capacity: 100, registered_count: 0,
      date_time: new Date(Date.now() + 172800000).toISOString(), location_name: 'Loc', published: true, is_featured: false, is_live: false
    }).select().single();
    if (err_eventB) throw new Error('Insert failed: ' + err_eventB.message);

    const { browser, page } = await setupBrowser();
    try {
      await loginAsAdmin(page);
      await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[placeholder*="Filtrer"]');
      await page.type('input[placeholder*="Filtrer"]', `${prefix} Live Featured`);
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

      // Delete Event A
      const rows = await page.$$('tr');
      let deleteBtn = null;
      for (const row of rows) {
        if ((await page.evaluate(el => el.textContent, row)).includes(`${prefix} Live Featured`)) {
          deleteBtn = await row.$('button[title="Supprimer"]');
          break;
        }
      }
      await deleteBtn.click();
      await page.waitForSelector('.modal-overlay', { timeout: 3000 });

      const confirmBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('.modal-overlay button'));
        return btns.find(b => b.textContent.includes('Supprimer'));
      });
      await confirmBtn.click();
      await page.waitForFunction(() => !document.querySelector('.modal-overlay'), { timeout: 5000 });

      // Navigate to homepage immediately
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });

      // Page shouldn't crash, should fallback gracefully
      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      if (!heroText.includes(`${prefix} Upcoming Fallback`)) {
        throw new Error('Homepage layout crashed or failed to fallback to upcoming Event B upon accidental deletion.');
      }

      // Live tab should disappear
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
      await page.goto(APP_URL, { waitUntil: 'networkidle2' });

      const heroText = await page.evaluate(() => document.querySelector('section')?.textContent || '');
      // Expect default branding text in Hero
      if (!heroText.includes('La voix de la nouvelle génération') && !heroText.includes('nouvelle génération')) {
        throw new Error('Hero did not default to standard brand text when no events exist. Text: ' + heroText);
      }

      // "Aucun événement trouvé" should be shown in upcoming list
      const upcomingText = await page.evaluate(() => {
        const lists = Array.from(document.querySelectorAll('div, section'));
        const evList = lists.find(l => l.textContent.includes('événements à venir') || l.textContent.includes('Événements à venir'));
        return evList ? evList.textContent : '';
      });
      if (!upcomingText.toLowerCase().includes('aucun événement') && !upcomingText.toLowerCase().includes('pas d\'événement')) {
        throw new Error('Upcoming events grid did not display fallback drought text. Got: ' + upcomingText);
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
