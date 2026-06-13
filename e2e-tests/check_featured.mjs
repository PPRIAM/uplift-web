import { supabase } from './helpers.mjs';

async function run() {
  const { data, error } = await supabase.from('events').select('id, name, is_featured');
  if (error) {
    console.error('Error fetching events:', error);
    return;
  }
  console.log('All events:', data);
  const featured = data.filter(e => e.is_featured);
  console.log('Featured events:', featured);
}

run();
