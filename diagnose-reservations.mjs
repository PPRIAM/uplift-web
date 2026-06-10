import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const SUPABASE_URL = 'https://nmkwhseqfbhrbzqldvcm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_quKA2sUvLiryhd4jr4y_LQ_aOMHEOGZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
