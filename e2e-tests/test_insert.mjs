import { supabase } from './helpers.mjs';

async function run() {
  // First clean up all test events
  const { data: testEvents } = await supabase.from('events').select('id, name').like('name', '[TEST]%');
  console.log('Test events found before delete:', testEvents);
  if (testEvents && testEvents.length > 0) {
    await supabase.from('events').delete().in('id', testEvents.map(e => e.id));
    console.log('Cleaned up test events.');
  }

  // Check how many are featured
  const { data: featured } = await supabase.from('events').select('id, name, is_featured').eq('is_featured', true);
  console.log('Currently featured in DB:', featured);

  const prefix = `[TEST] Insert test ${Date.now()}`;
  console.log('Inserting event with is_featured = true...');
  const res = await supabase.from('events').insert({
    name: `${prefix} Event A`, 
    description: 'Desc A', 
    capacity: 100, 
    registered_count: 0,
    date_time: new Date(Date.now() + 86400000).toISOString(), 
    location_name: 'Loc', 
    published: true, 
    is_featured: true
  }).select();

  console.log('Insert Result:');
  console.log(JSON.stringify(res, null, 2));

  // Cleanup
  if (res.data && res.data[0]) {
    await supabase.from('events').delete().eq('id', res.data[0].id);
    console.log('Cleaned up newly created event.');
  }
}

run();
