import puppeteer from 'puppeteer';
import { createAdminUserIfNeeded } from '../../e2e-tests/helpers.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target screenshots directory
const screenshotsDir = path.resolve(__dirname, './screenshots');

async function runTests() {
  console.log('--- Initialisation du test de l\'espace admin ---');
  
  // S'assurer que l'utilisateur admin existe en base
  try {
    await createAdminUserIfNeeded();
    console.log('✅ Utilisateur admin@uplift.io prêt en base de données.');
  } catch (err) {
    console.error('⚠️ Impossible de vérifier/créer l\'utilisateur admin:', err.message);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Harvest console errors and logs
  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('pageerror', error => {
    console.log(`[PAGE_ERROR] ${error.message}`);
    consoleErrors.push(error.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE_ERROR] ${msg.text()}`);
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      console.log(`[CONSOLE_WARNING] ${msg.text()}`);
      consoleWarnings.push(msg.text());
    }
  });

  // Mode Desktop 1440x900
  console.log('\n--- Test Mode Desktop (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigation et Connexion
  const startTime = Date.now();
  console.log('Navigation vers la page de login...');
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle2' });
  
  console.log('Saisie des identifiants admin...');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@uplift.io');
  await page.type('input[type="password"]', 'PasswordAdmin123!');
  
  console.log('Clic sur le bouton de connexion...');
  await page.click('button[type="submit"]');
  
  console.log('Attente de redirection vers le dashboard admin...');
  try {
    await page.waitForSelector('aside', { timeout: 15000 });
  } catch (e) {
    console.log('Timeout en attendant "aside", tentative d\'attente du chemin /admin...');
    await page.waitForFunction(() => window.location.pathname.includes('/admin'), { timeout: 10000 });
  }
  const loadTime = Date.now() - startTime;
  console.log(`✅ Redirection réussie. URL actuelle : ${page.url()}`);
  console.log(`⏱️ Temps de chargement global de la session : ${loadTime} ms`);

  // Vérifier qu'on est bien sur /admin
  if (!page.url().includes('/admin')) {
    console.error('❌ Échec de la redirection vers /admin');
    await page.screenshot({ path: path.join(screenshotsDir, 'auth_failed.png') });
    await browser.close();
    process.exit(1);
  }

  // 2. Vérification des éléments de la page
  console.log('Attente du chargement complet des données Supabase...');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Validation des composants principaux...');

  // Featured Event or Placeholder
  const hasFeatured = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return text.includes('vedette') || text.includes('selectionne');
  });
  console.log(`- Featured Event ou Placeholder présent : ${hasFeatured ? '✅ OUI' : '❌ NON'}`);

  // Bento widgets
  const widgetLabels = ['participants confirmés', 'réservations totales', 'événements à venir', 'candidatures en attente'];
  const missingWidgets = [];
  for (const label of widgetLabels) {
    const present = await page.evaluate((l) => {
      return document.body.innerText.toLowerCase().includes(l);
    }, label);
    if (!present) missingWidgets.push(label);
  }
  if (missingWidgets.length === 0) {
    console.log('- Bento widgets stats présents : ✅ OUI (tous trouvés)');
  } else {
    console.log(`- Bento widgets stats manquants : ❌ NON (${missingWidgets.join(', ')})`);
  }

  // Jauge signature
  const hasNeoGauge = await page.evaluate(() => {
    const progress = document.querySelector('.bg-\\[\\#F4A7B9\\]') || document.querySelector('.bg-\\[\\#8FAF6A\\]') || document.querySelector('[style*="repeating-linear-gradient"]');
    const hasText = document.body.innerText.toLowerCase().includes('remplissage') || document.body.innerText.toLowerCase().includes('places');
    return !!progress || hasText;
  });
  console.log(`- Signature Neo-Gauge présente : ${hasNeoGauge ? '✅ OUI' : '❌ NON'}`);

  // Capture Desktop standard
  const desktopImgPath = path.join(screenshotsDir, 'admin_desktop.png');
  await page.screenshot({ path: desktopImgPath });
  console.log(`📸 Capture d'écran Desktop enregistrée : ${desktopImgPath}`);

  // 3. Test interactions Desktop
  // Collapsing Sidebar
  console.log('Test du repli de la barre latérale...');
  const collapseButtonSelector = 'button[title="Replier la barre"]';
  const hasCollapseButton = await page.evaluate((sel) => !!document.querySelector(sel), collapseButtonSelector);
  
  if (hasCollapseButton) {
    await page.click(collapseButtonSelector);
    await new Promise(r => setTimeout(r, 600)); // Attendre l'animation de transition
    
    const isCollapsedNow = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside ? aside.className.includes('w-20') : false;
    });
    console.log(`- Sidebar repliée avec succès : ${isCollapsedNow ? '✅ OUI' : '❌ NON'}`);
    
    const collapsedImgPath = path.join(screenshotsDir, 'admin_desktop_collapsed.png');
    await page.screenshot({ path: collapsedImgPath });
    console.log(`📸 Capture d'écran Sidebar repliée enregistrée : ${collapsedImgPath}`);
    
    // Déplier à nouveau
    await page.click('button[title="Déplier la barre"]');
    await new Promise(r => setTimeout(r, 600));
  } else {
    console.log('⚠️ Bouton de collapse non trouvé.');
  }

  // Barre de recherche globale
  console.log('Test de la barre de recherche globale...');
  await page.waitForSelector('input[placeholder*="Rechercher"]');
  await page.focus('input[placeholder*="Rechercher"]');
  await page.type('input[placeholder*="Rechercher"]', 'UPLIFT');
  await new Promise(r => setTimeout(r, 1000)); // Attendre le debounce et l'appel API
  
  const searchResultsPresent = await page.evaluate(() => {
    return document.body.innerText.includes('Résultats de recherche fédérée');
  });
  console.log(`- Résultats de recherche fédérée affichés : ${searchResultsPresent ? '✅ OUI' : '❌ NON'}`);
  
  const searchImgPath = path.join(screenshotsDir, 'admin_desktop_search.png');
  await page.screenshot({ path: searchImgPath });
  
  // Effacer la recherche
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Rechercher"]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Drawer de session
  console.log('Test du Drawer de session via la Timeline...');
  const sessionCards = await page.$$('.relative .bg-white.border-2.border-black.rounded-xl');
  if (sessionCards.length > 0) {
    console.log(`Sessions trouvées dans la timeline : ${sessionCards.length}. Ouverture du Drawer...`);
    // On clique sur la première session
    await page.evaluate(() => {
      const card = document.querySelector('.relative .bg-white.border-2.border-black.rounded-xl');
      if (card) (card).click();
    });
    await new Promise(r => setTimeout(r, 800)); // Attendre l'animation du Drawer
    
    const isDrawerOpen = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('details') || text.includes('salle') || text.includes('lieu');
    });
    console.log(`- Drawer ouvert avec succès : ${isDrawerOpen ? '✅ OUI' : '❌ NON'}`);
    
    const drawerImgPath = path.join(screenshotsDir, 'admin_desktop_drawer.png');
    await page.screenshot({ path: drawerImgPath });
    console.log(`📸 Capture d'écran Drawer ouvert enregistrée : ${drawerImgPath}`);
    
    // Fermer le drawer
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const closeBtn = btns.find(b => b.innerText.includes('Fermer') || b.querySelector('svg'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
  } else {
    console.log('⚠️ Aucune session trouvée dans la timeline pour tester le Drawer.');
  }

  // Mode Mobile 375x812
  console.log('\n--- Test Mode Mobile (375x812) ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const mobileImgPath = path.join(screenshotsDir, 'admin_mobile.png');
  await page.screenshot({ path: mobileImgPath });
  console.log(`📸 Capture d'écran Mobile enregistrée : ${mobileImgPath}`);

  // Clic Menu Mobile
  console.log('Test du menu hamburger sur mobile...');
  const hamburgerSelector = 'div.md\\:hidden.fixed.top-0 button';
  const hamburgerPresent = await page.evaluate((sel) => {
    return !!document.querySelector(sel);
  }, hamburgerSelector);
  
  if (hamburgerPresent) {
    await page.click(hamburgerSelector);
    await new Promise(r => setTimeout(r, 800)); // Attendre l'apparition du menu
    
    const menuOpen = await page.evaluate(() => {
      const text = document.body.innerText.toUpperCase();
      return text.includes('GESTION') || text.includes('OUTILS') || text.includes('TABLEAU DE BORD');
    });
    console.log(`- Menu mobile déplié avec succès : ${menuOpen ? '✅ OUI' : '❌ NON'}`);
    
    const mobileMenuImgPath = path.join(screenshotsDir, 'admin_mobile_menu.png');
    await page.screenshot({ path: mobileMenuImgPath });
    console.log(`📸 Capture d'écran Menu Mobile déplié enregistrée : ${mobileMenuImgPath}`);
  } else {
    console.log('⚠️ Bouton menu mobile hamburger non trouvé.');
  }

  console.log('\n--- Résultats des Logs de Console ---');
  console.log(`Erreurs détectées : ${consoleErrors.length}`);
  consoleErrors.forEach((err, i) => console.log(`  [Erreur ${i+1}] ${err}`));
  
  console.log(`Avertissements détectés : ${consoleWarnings.length}`);
  consoleWarnings.forEach((warn, i) => console.log(`  [Avertissement ${i+1}] ${warn}`));

  await browser.close();
  
  return {
    loadTime,
    consoleErrors,
    consoleWarnings,
    hasFeatured,
    widgetsOk: missingWidgets.length === 0,
    hasNeoGauge,
    searchResultsPresent
  };
}

runTests().then((res) => {
  console.log('\n--- Test Complété ---');
  console.log(JSON.stringify(res, null, 2));
  process.exit(0).catch(() => {});
}).catch(err => {
  console.error('❌ Échec critique du script de test:', err);
  process.exit(1);
});
