import { setupBrowser, loginAsAdmin, gotoAdminEvents } from './helpers.mjs';

async function run() {
  const { browser, page } = await setupBrowser();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  try {
    console.log('Logging in as admin...');
    await loginAsAdmin(page);
    
    console.log('Navigating to admin events...');
    await gotoAdminEvents(page);
    
    console.log('Waiting 5 seconds for page to load completely...');
    await new Promise(r => setTimeout(r, 5000));
    
    const tableHTML = await page.evaluate(() => {
      const tbody = document.querySelector('tbody');
      return tbody ? tbody.innerHTML : 'No tbody found';
    });
    console.log('Table Body HTML:');
    console.log(tableHTML);
  } catch (err) {
    console.error('Script error:', err);
  } finally {
    await browser.close();
  }
}

run();
