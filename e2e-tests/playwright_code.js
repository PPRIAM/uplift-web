async (page) => {
  // Ce script de test s'exécute directement dans le processus Playwright.
  // Il valide le flux de gestion des sponsors d'Ayibuzz.

  console.log('--- DEBUT DU SCRIPT PLAYWRIGHT INTERNE ---');

  // 1. Navigation vers la page d'authentification
  console.log('Navigation vers la page de connexion...');
  await page.goto('http://localhost:3000/auth/login');
  await new Promise(r => setTimeout(r, 2000)); // Attente de l'hydratation React

  // 2. Remplissage des identifiants admin
  console.log('Saisie des identifiants admin...');
  await page.fill('input[type="email"]', 'admin@uplift.io');
  await page.fill('input[type="password"]', 'PasswordAdmin123!');
  await page.click('button[type="submit"]');

  // 3. Attente de la redirection vers le tableau de bord
  console.log('Attente de la connexion...');
  await page.waitForURL('**/admin', { timeout: 30000 });
  console.log('Connexion réussie.');

  // 4. Navigation vers la page d'administration des sponsors
  console.log('Navigation vers /admin/sponsors...');
  await page.goto('http://localhost:3000/admin/sponsors');
  await page.waitForSelector('h1', { timeout: 10000 });

  // 5. Nettoyage des anciens sponsors de test existants via l'interface d'administration
  console.log('Nettoyage des anciens sponsors de test via l\'UI...');
  let deletedCount = 0;
  let found = true;
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
      // Attendre que la modal de confirmation s'affiche et cliquer sur le bouton de suppression
      await page.waitForSelector('button:has-text("Supprimer")', { timeout: 5000 });
      await page.click('button:has-text("Supprimer")');
      // Attendre la disparition de la modal
      await page.waitForSelector('button:has-text("Supprimer")', { state: 'hidden', timeout: 5000 });
      deletedCount++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log(`Nettoyage terminé : ${deletedCount} sponsors supprimés.`);

  // 6. Ajout du 1er sponsor de test
  console.log('Ajout du premier sponsor de test [TEST] Sponsor 1...');
  await page.click('button:has-text("Ajouter un Sponsor")');
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });
  
  await page.fill('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 1');
  await page.fill('input[placeholder*="logo.png"]', '/logo.png');
  await page.fill('input[placeholder*="orange.com"]', 'https://test-sponsor.com');
  
  await page.click('button:has-text("Enregistrer")');
  
  // Attente de la validation et fermeture de la modal
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { state: 'hidden', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Premier sponsor enregistré avec succès.');

  // 7. Navigation vers la page d'accueil pour valider le rendu du sponsor vedette unique
  console.log('Vérification du partenaire vedette unique sur la page d\'accueil...');
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('.featured-sponsor-card', { timeout: 10000 });
  
  const sponsor1Name = await page.textContent('.featured-sponsor-card h3');
  console.log(`Nom du sponsor détecté sur l'accueil : ${sponsor1Name}`);

  // 8. Retour à l'administration des sponsors pour ajouter le second sponsor de test
  console.log('Ajout du second sponsor de test [TEST] Sponsor 2...');
  await page.goto('http://localhost:3000/admin/sponsors');
  await page.waitForSelector('h1', { timeout: 10000 });

  await page.click('button:has-text("Ajouter un Sponsor")');
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { timeout: 5000 });
  
  await page.fill('input[placeholder*="Ex: Orange"]', '[TEST] Sponsor 2');
  await page.fill('input[placeholder*="logo.png"]', '/logo.png');
  await page.fill('input[placeholder*="orange.com"]', 'https://test-sponsor-2.com');
  
  await page.click('button:has-text("Enregistrer")');
  
  await page.waitForSelector('input[placeholder*="Ex: Orange"]', { state: 'hidden', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Second sponsor enregistré avec succès.');

  // 9. Navigation vers la page d'accueil pour valider le rendu du carrousel de défilement (Marquee)
  console.log('Vérification du ruban défilant (Marquee) sur la page d\'accueil...');
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('.sponsor-marquee-container', { timeout: 10000 });

  // S'assurer que le bloc vedette unique n'est plus visible
  const hasFeaturedCardAfter2Sponsors = await page.evaluate(() => {
    return document.querySelector('.featured-sponsor-card') !== null;
  });
  console.log(`Présence de la carte vedette unique après ajout du 2ème sponsor : ${hasFeaturedCardAfter2Sponsors}`);

  // 10. Nettoyage final des sponsors de test via l'interface
  console.log('Nettoyage final des sponsors de test...');
  await page.goto('http://localhost:3000/admin/sponsors');
  await page.waitForSelector('h1', { timeout: 10000 });

  found = true;
  let finalDeletedCount = 0;
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
      finalDeletedCount++;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  console.log(`Nettoyage final terminé : ${finalDeletedCount} sponsors de test supprimés.`);
  console.log('--- FIN DU SCRIPT PLAYWRIGHT INTERNE ---');

  return {
    sponsor1Name: sponsor1Name.trim(),
    hasFeaturedCardAfter2Sponsors,
    success: true
  };
}
