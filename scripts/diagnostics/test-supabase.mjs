import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement depuis .env.local de manière sécurisée
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Configuration manquante : NEXT_PUBLIC_SUPABASE_URL ou la clé Supabase anon est introuvable dans .env.local");
  process.exit(1);
}

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
