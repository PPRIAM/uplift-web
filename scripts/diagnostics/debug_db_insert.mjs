import { supabase } from '../../e2e-tests/helpers.mjs';

async function main() {
  const prefix = `[TEST] debug_db_insert-${Date.now()}`;

  console.log('1. Resetting featured status of all events...');
  const { data: resetData, error: resetErr } = await supabase
    .from('events')
    .update({ is_featured: false })
    .eq('is_featured', true)
    .select();
  
  if (resetErr) {
    console.error('Reset error:', resetErr);
  } else {
    console.log('Reset success, updated rows:', resetData?.length);
  }

  console.log('2. Inserting Event A with is_featured = true...');
  const { data: eventA, error: errA } = await supabase.from('events').insert({
    name: `${prefix} Event A`,
    description: 'Test A',
    capacity: 100,
    registered_count: 0,
    date_time: new Date(Date.now() + 86400000).toISOString(),
    location_name: 'Loc',
    published: true,
    is_featured: true
  }).select().single();

  if (errA) {
    console.error('Event A Insert error:', errA);
  } else {
    console.log('Event A Insert success:', eventA);
  }

  // Cleanup if successful
  if (eventA) {
    console.log('Cleaning up event...');
    await supabase.from('events').delete().eq('id', eventA.id);
  }
}

main();
