import { supabase } from './helpers.mjs';

// Ce script récupère absolument tous les sponsors de la base de données
// en utilisant le client Supabase avec la clé de service (outrepassant RLS).
async function main() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*');

  if (error) {
    console.error('Erreur lors de la récupération :', error.message);
    process.exit(1);
  }

  console.log('--- TOUS LES SPONSORS DANS LA TABLE ---');
  console.log(JSON.stringify(data, null, 2));
}

main();
