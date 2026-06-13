import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
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

async function diagnose() {
  console.log('\n🔍 DIAGNOSTIC RÉSERVATIONS UPLIFT 2.0\n' + '='.repeat(45));

  // 1. Vérifier la structure de la table reservations
  console.log('\n[1] Lecture de la table "reservations"...');
  const { data: rows, error: readError } = await supabase.from('reservations').select('*').limit(1);
  if (readError) {
    console.error('❌ Erreur lecture:', readError.message);
  } else {
    console.log('✅ Table accessible.');
    if (rows && rows.length > 0) {
      console.log('   Colonnes détectées:', Object.keys(rows[0]).join(', '));
      const hasToken = 'confirmation_token' in rows[0];
      console.log('   confirmation_token:', hasToken ? '✅ présente' : '❌ MANQUANTE → Exécutez supabase_alter.sql !');
    } else {
      console.log('   (Table vide — test d\'insertion requis)');
    }
  }

  // 2. Vérifier si un event existe
  console.log('\n[2] Récupération d\'un événement...');
  const { data: events, error: evtError } = await supabase.from('events').select('id, name').limit(1);
  if (evtError || !events?.length) {
    console.error('❌ Aucun événement trouvé:', evtError?.message || 'Table vide');
    console.log('   → Exécutez supabase_seed.sql dans Supabase !');
    return;
  }
  const event = events[0];
  console.log(`✅ Événement trouvé: "${event.name}" (${event.id})`);

  // 3. Tenter un vrai insert
  console.log('\n[3] Test d\'insertion d\'une réservation...');
  const testToken = randomUUID();
  const { error: insertError } = await supabase.from('reservations').insert({
    event_id: event.id,
    full_name: 'TEST Diagnostic',
    email: `test_${Date.now()}@uplift.test`,
    quantity: 1,
    status: 'pending',
    confirmation_token: testToken,
  });

  if (insertError) {
    console.error('❌ ÉCHEC insertion:', insertError.message);
    console.error('   Code:', insertError.code);
    if (insertError.code === '42703') {
      console.log('\n   ⚠️  SOLUTION: La colonne "confirmation_token" est manquante.');
      console.log('   → Exécutez "supabase_alter.sql" dans votre SQL Editor Supabase.');
    } else if (insertError.code === '42501') {
      console.log('\n   ⚠️  SOLUTION: Politique RLS bloque l\'insertion.');
      console.log('   → Exécutez "supabase_rls.sql" dans votre SQL Editor Supabase.');
    }
  } else {
    console.log('✅ Insertion réussie!');

    // Nettoyer l'entrée de test
    await supabase.from('reservations').delete().eq('confirmation_token', testToken);
    console.log('   (Entrée de test supprimée automatiquement)');
  }

  console.log('\n' + '='.repeat(45));
  console.log('Diagnostic terminé.');
}

diagnose();
