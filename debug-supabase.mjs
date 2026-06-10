import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmkwhseqfbhrbzqldvcm.supabase.co';
const supabaseKey = 'sb_publishable_quKA2sUvLiryhd4jr4y_LQ_aOMHEOGZ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('--- DEBUG START ---');
  
  // 1. Fetch events
  const { data: events, error: evErr } = await supabase.from('events').select('id, name, registered_count');
  console.log('\n📅 Events:', events || evErr);

  // 2. Fetch reservations count
  const { data: reservations, error: resErr } = await supabase.from('reservations').select('*');
  console.log('\n🎫 Total Reservations:', reservations?.length, resErr || '');

  // 3. Try to decrement count via RPC
  if (events && events.length > 0) {
    const { error: rpcErr } = await supabase.rpc('decrement_registered_count', {
      event_id_param: events[0].id,
      amount: 1
    });
    console.log('\n🔧 RPC decrement_registered_count error:', rpcErr || 'No error (Success)');
  }

  // 4. Try to delete a reservation
  if (reservations && reservations.length > 0) {
    const id = reservations[0].id;
    console.log('\n🗑️ Trying to delete reservation ID:', id);
    const { data: delData, error: delErr } = await supabase.from('reservations').delete().eq('id', id).select();
    console.log('Delete Result:', delData, 'Error:', delErr);
  }
}

debug();
