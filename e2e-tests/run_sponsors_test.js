async (page) => {
  // Ce script de test s'exécute directement dans le navigateur Playwright.
  // Il ajoute deux sponsors de test, vérifie le comportement dynamique sur la page d'accueil
  // et nettoie proprement la base de données via l'interface utilisateur.

  const results = {};

  // 1. Ajout du premier sponsor de test [TEST] Sponsor 1
  console.log("Ajout du premier sponsor...");
  await page.click('button:has-text("Ajouter un Sponsor")');
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });
  
  await page.fill('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 1');
  await page.fill('input[placeholder*="logo.png"]', '/logo.png');
  await page.fill('input[placeholder*="orange.com"]', 'https://test-sponsor.com');
  await page.click('button:has-text("Enregistrer")');
  
  // Attendre la fermeture de la modal
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { state: 'hidden', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000)); // Laisser le temps au cache Next.js de se rafraîchir
  
  // 2. Navigation vers la page d'accueil pour valider le sponsor vedette unique
  console.log("Validation du sponsor unique sur la page d'accueil...");
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('.featured-sponsor-card', { timeout: 10000 });
  results.sponsor1_name = (await page.textContent('.featured-sponsor-card h3')).trim();
  
  // Capture d'écran avec 1 sponsor actif
  await page.screenshot({ path: '.playwright-mcp/featured_sponsor_visible.png' });
  
  // 3. Retour vers l'admin pour ajouter le second sponsor
  console.log("Navigation vers /admin/sponsors pour le second sponsor...");
  await page.goto('http://localhost:3000/admin/sponsors');
  await page.waitForSelector('h1', { timeout: 10000 });
  
  console.log("Ajout du second sponsor...");
  await page.click('button:has-text("Ajouter un Sponsor")');
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });
  
  await page.fill('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 2');
  await page.fill('input[placeholder*="logo.png"]', '/logo.png');
  await page.fill('input[placeholder*="orange.com"]', 'https://test-sponsor-2.com');
  await page.click('button:has-text("Enregistrer")');
  
  // Attendre la fermeture de la modal
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { state: 'hidden', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 4. Navigation vers la page d'accueil pour valider le Marquee
  console.log("Validation du ruban défilant (Marquee) sur la page d'accueil...");
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('.sponsor-marquee-container', { timeout: 10000 });
  
  results.has_marquee = true;
  results.has_featured_card_after_2_sponsors = await page.evaluate(() => {
    return document.querySelector('.featured-sponsor-card') !== null;
  });
  
  // Capture d'écran avec le Marquee actif
  await page.screenshot({ path: '.playwright-mcp/sponsor_marquee_visible.png' });
  
  // 5. Nettoyage final des sponsors de test via l'interface d'administration
  console.log("Nettoyage des sponsors de test...");
  await page.goto('http://localhost:3000/admin/sponsors');
  await page.waitForSelector('h1', { timeout: 10000 });
  
  let found = true;
  let deletedCount = 0;
  while (found) {
    found = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.border-4.border-black.bg-white'));
      const testCard = cards.find(c => c.textContent.includes('[TEST]'));
      if (testCard) {
        const deleteBtn = testCard.querySelector('button[title="Supprimer le sponsor"]');
        if (deleteBtn) {
          deleteBtn.click();
          return true;
        }
      }
      return false;
    });

    if (found) {
      await page.waitForSelector('button:has-text("Supprimer")', { timeout: 5000 });
      await page.click('button:has-text("Supprimer")');
      await page.waitForSelector('button:has-text("Supprimer")', { state: 'hidden', timeout: 5000 });
      deletedCount++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  results.deleted_count = deletedCount;
  results.success = true;
  return results;
}
