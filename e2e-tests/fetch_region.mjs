// Ce script effectue une requête HTTP HEAD sur l'URL Supabase pour inspecter les en-têtes
// et essayer de déterminer la localisation/région du serveur.
async function main() {
  try {
    const res = await fetch('https://nmkwhseqfbhrbzqldvcm.supabase.co');
    console.log('Statut :', res.status);
    console.log('En-têtes :');
    res.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
  } catch (err) {
    console.error('Erreur lors du fetch :', err.message);
  }
}

main();
