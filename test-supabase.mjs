import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmkwhseqfbhrbzqldvcm.supabase.co';
const supabaseKey = 'sb_publishable_quKA2sUvLiryhd4jr4y_LQ_aOMHEOGZ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔄 Tentative de ping sur votre projet Supabase...");
  const { data, error } = await supabase.from('events').select('id').limit(1);

  if (error) {
    if (error.code === '42P01') {
       console.log("✅ SUCCÈS : Connecté à Supabase ! (Cependant, la table 'events' n'existe pas encore. Vous devez exécuter 'supabase_schema.sql').");
    } else {
       console.error("❌ ERREUR DE CONNEXION :", error.message);
    }
  } else {
    console.log("✅ SUCCÈS TOTAL : Connecté à Supabase ET la table 'events' a été trouvée !");
  }
}

testConnection();
