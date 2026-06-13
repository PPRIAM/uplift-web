import puppeteer from 'puppeteer';
import { setupBrowser, loginAsAdmin, APP_URL } from '../../e2e-tests/helpers.mjs';

async function run() {
  console.log('Starting debug login test...');
  const { browser, page } = await setupBrowser();
  
  page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));
  
  try {
    console.log('Logging in...');
    await loginAsAdmin(page);
    console.log('Logged in successfully. Current URL:', page.url());
    
    console.log('Waiting for cookies/session to persist...');
    await new Promise(r => setTimeout(r, 1500));
    
    console.log('Navigating to /admin/events...');
    await page.goto(`${APP_URL}/admin/events`, { waitUntil: 'domcontentloaded' });
    console.log('Navigated. Current URL:', page.url());
    
    console.log('Waiting for header...');
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent.includes('Gestion des événements');
    }, { timeout: 5000 });
    
    console.log('Header found!');
  } catch (err) {
    console.error('Test failed with error:', err.message);
    console.log('Final URL when failed:', page.url());
    const textContent = await page.evaluate(() => document.body.innerText);
    console.log('Page inner text content:\n', textContent);
  } finally {
    await browser.close();
  }
}

run();
