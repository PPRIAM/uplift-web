import { supabase } from './helpers.mjs';

// Ce script met à jour tous les sponsors dont le logo contient "localhost" pour utiliser
// le chemin relatif "/logo.png", afin de lever l'erreur Next.js.
async function main() {
  console.log('Mise à jour des sponsors avec localhost dans le logo...');
  const { data, error } = await supabase
    .from('sponsors')
    .update({ logo_url: '/logo.png' })
    .ilike('logo_url', '%localhost%');

  if (error) {
    console.error('Erreur lors de la mise à jour :', error.message);
    process.exit(1);
  }

  console.log('✅ Mise à jour terminée.');
}

main();
