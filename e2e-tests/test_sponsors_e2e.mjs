import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupBrowser, loginAsAdmin, supabase, APP_URL } from './helpers.mjs';

// Ce script de test E2E gère l'ajout des sponsors en capturant les alertes et les captures d'écran en cas d'erreur.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('==================================================');
  console.log('     DEBUT DU TEST E2E DU SYSTEME DES SPONSORS    ');
  console.log('==================================================');

  console.log('🔄 Nettoyage des anciens sponsors de test...');
  const { error: deleteError } = await supabase
    .from('sponsors')
    .delete()
    .like('name', '[TEST]%');

  if (deleteError) {
    console.error('❌ Erreur lors du nettoyage initial :', deleteError.message);
    process.exit(1);
  }
  console.log('✅ Nettoyage initial réussi.');

  await new Promise(r => setTimeout(r, 1000));

  const screenshotDir = path.resolve(__dirname, '../public/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('🚀 Démarrage du navigateur Chrome...');
  const { browser, page } = await setupBrowser();
  
  // Ecouter les dialogues d'alerte pour ne pas bloquer l'exécution et afficher les erreurs
  page.on('dialog', async dialog => {
    console.log(`🚨 [DIALOGUE ALERTE] Détecté : "${dialog.message()}"`);
    await dialog.dismiss();
  });

  const browserLogs = [];
  page.on('console', msg => {
    browserLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    if (msg.type() === 'error') {
      console.log(`[CONSOLE BROWSER ERROR] : ${msg.text()}`);
    }
  });

  try {
    console.log('🔑 Connexion en tant qu\'administrateur...');
    await loginAsAdmin(page);
    console.log('✅ Connexion admin réussie.');

    console.log('📅 Navigation vers /admin/sponsors...');
    await page.goto(`${APP_URL}/admin/sponsors`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 10000 });

    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log(`Page chargée : ${pageTitle}`);

    console.log('➕ Ajout du premier sponsor de test : [TEST] Sponsor 1...');
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Cliquer sur "Ajouter un Sponsor"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent.includes('Ajouter un Sponsor'));
      if (addBtn) addBtn.click();
    });

    // Attendre que la modal soit affichée
    await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });

    // Remplir les champs
    await page.type('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 1');
    await page.type('input[placeholder*="logo.png"]', '/logo.png');
    await page.type('input[placeholder*="orange.com"]', 'https://test-sponsor.com');

    // Cliquer sur Enregistrer
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
      const saveBtn = btns.find(b => b.textContent.includes('Enregistrer'));
      if (saveBtn) saveBtn.click();
    });

    // Attendre que la modal disparaisse
    await page.waitForFunction(() => !document.querySelector('input[placeholder*="Ex: Orange"]'), { timeout: 10000 });
    console.log('✅ Premier sponsor enregistré.');

    await new Promise(r => setTimeout(r, 2000));

    console.log('🌍 Navigation vers la page d\'accueil...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.featured-sponsor-card', { timeout: 10000 });
    
    const sponsorNameText = await page.$eval('.featured-sponsor-card h3', el => el.textContent);
    console.log(`Sponsor affiché sur la page d'accueil : ${sponsorNameText}`);

    if (sponsorNameText.trim() !== '[TEST] Sponsor 1') {
      throw new Error(`Le sponsor affiché n'est pas le bon : attendu '[TEST] Sponsor 1', obtenu '${sponsorNameText}'`);
    }
    console.log('✅ Validation réussie : partenaire vedette unique affiché.');

    const featuredScreenshot = path.join(screenshotDir, 'featured_sponsor_visible.png');
    await page.screenshot({ path: featuredScreenshot, fullPage: false });
    console.log(`📸 Capture d'écran enregistrée : ${featuredScreenshot}`);

    console.log('📅 Retour vers /admin/sponsors...');
    await page.goto(`${APP_URL}/admin/sponsors`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('➕ Ajout du second sponsor de test : [TEST] Sponsor 2...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent.includes('Ajouter un Sponsor'));
      if (addBtn) addBtn.click();
    });

    await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });

    await page.type('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 2');
    await page.type('input[placeholder*="logo.png"]', '/logo.png');
    await page.type('input[placeholder*="orange.com"]', 'https://test-sponsor-2.com');

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
      const saveBtn = btns.find(b => b.textContent.includes('Enregistrer'));
      if (saveBtn) saveBtn.click();
    });

    await page.waitForFunction(() => !document.querySelector('input[placeholder*="Ex: Orange"]'), { timeout: 10000 });
    console.log('✅ Second sponsor enregistré.');

    await new Promise(r => setTimeout(r, 2000));

    console.log('🌍 Navigation vers la page d\'accueil...');
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.sponsor-marquee-container', { timeout: 10000 });

    const hasFeaturedCard = await page.evaluate(() => {
      return document.querySelector('.featured-sponsor-card') !== null;
    });

    if (hasFeaturedCard) {
      throw new Error('Erreur : La carte du sponsor vedette unique est encore visible alors qu\'il y a plusieurs sponsors.');
    }
    console.log('✅ Validation réussie : carrousel actif.');

    const marqueeScreenshot = path.join(screenshotDir, 'sponsor_marquee_visible.png');
    await page.screenshot({ path: marqueeScreenshot, fullPage: false });
    console.log(`📸 Capture d'écran enregistrée : ${marqueeScreenshot}`);

    console.log('🧹 Suppression des sponsors de test créés...');
    const { error: cleanError } = await supabase
      .from('sponsors')
      .delete()
      .like('name', '[TEST]%');

    if (cleanError) {
      console.error('❌ Erreur lors du nettoyage final :', cleanError.message);
    } else {
      console.log('✅ Nettoyage final réussi.');
    }

    console.log('\n==================================================');
    console.log('     🎉 TOUS LES TESTS E2E ONT REUSSI AVEC SUCCES ');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ UNE ERREUR EST SURVENUE DURANT LE TEST :');
    console.error(error.message);
    
    // Capture d'écran en cas d'erreur
    try {
      const errScreenshot = path.join(screenshotDir, 'error_screenshot.png');
      await page.screenshot({ path: errScreenshot, fullPage: true });
      console.log(`📸 Capture d'écran de l'erreur enregistrée : ${errScreenshot}`);
    } catch (e) {
      console.error('Impossible de prendre une capture d\'écran de l\'erreur :', e.message);
    }

    try {
      await browser.close();
    } catch (e) {}
    
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
}

run();
