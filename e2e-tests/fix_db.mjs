import { supabase } from './helpers.mjs';

// Ce script supprime tous les sponsors de test (commençant par [TEST]) de la base de données
// pour corriger l'erreur d'image non autorisée sur l'application.
async function main() {
  console.log('Suppression des sponsors de test...');
  const { data, error } = await supabase
    .from('sponsors')
    .delete()
    .like('name', '[TEST]%');

  if (error) {
    console.error('Erreur lors de la suppression :', error.message);
    process.exit(1);
  }

  console.log('✅ Nettoyage terminé.');
}

main();
