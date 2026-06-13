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

async function debug() {
  console.log('--- DÉBUT DU DEBUG ---');
  
  // 1. Récupérer les événements
  const { data: events, error: evErr } = await supabase.from('events').select('id, name, registered_count');
  console.log('\n📅 Événements:', events || evErr);

  // 2. Récupérer le nombre de réservations
  const { data: reservations, error: resErr } = await supabase.from('reservations').select('*');
  console.log('\n🎫 Nombre total de réservations:', reservations?.length, resErr || '');

  // 3. Essayer de décrémenter le compteur via RPC
  if (events && events.length > 0) {
    const { error: rpcErr } = await supabase.rpc('decrement_registered_count', {
      event_id_param: events[0].id,
      amount: 1
    });
    console.log('\n🔧 Erreur RPC decrement_registered_count:', rpcErr || 'Pas d\'erreur (Succès)');
  }

  // 4. Essayer de supprimer une réservation
  if (reservations && reservations.length > 0) {
    const id = reservations[0].id;
    console.log('\n🗑️ Tentative de suppression de la réservation ID:', id);
    const { data: delData, error: delErr } = await supabase.from('reservations').delete().eq('id', id).select();
    console.log('Résultat de la suppression:', delData, 'Erreur:', delErr);
  }
}

debug();
