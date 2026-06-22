import { supabase } from './helpers.mjs';

// Ce script récupère et affiche la liste de tous les sponsors présents dans la base de données.
async function main() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*');

  if (error) {
    console.error('Erreur lors de la récupération des sponsors :', error.message);
    process.exit(1);
  }

  console.log('Sponsors actuels dans la base de données :');
  console.log(JSON.stringify(data, null, 2));
}

main();
