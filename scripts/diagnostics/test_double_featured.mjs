import { supabase } from '../../e2e-tests/helpers.mjs';

async function main() {
  const prefix = `[TEST] double_feat-${Date.now()}`;

  console.log('1. Resetting featured status of all events...');
  await supabase.from('events').update({ is_featured: false }).eq('is_featured', true);

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
    return;
  }
  console.log('Event A Insert success, is_featured:', eventA.is_featured);

  console.log('3. Inserting Event B with is_featured = true...');
  const { data: eventB, error: errB } = await supabase.from('events').insert({
    name: `${prefix} Event B`,
    description: 'Test B',
    capacity: 100,
    registered_count: 0,
    date_time: new Date(Date.now() + 172800000).toISOString(),
    location_name: 'Loc',
    published: true,
    is_featured: true
  }).select().single();

  if (errB) {
    console.error('Event B Insert error:', errB);
  } else {
    console.log('Event B Insert success, is_featured:', eventB.is_featured);
  }

  // Check state of both events in DB
  const { data: dbA } = await supabase.from('events').select('is_featured').eq('id', eventA.id).single();
  const { data: dbB } = eventB ? await supabase.from('events').select('is_featured').eq('id', eventB.id).single() : { data: null };

  console.log('State in DB:');
  console.log('Event A is_featured:', dbA?.is_featured);
  console.log('Event B is_featured:', dbB?.is_featured);

  // Cleanup
  console.log('Cleaning up...');
  await supabase.from('events').delete().like('name', `${prefix}%`);
}

main();
