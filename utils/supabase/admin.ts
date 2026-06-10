import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key || url.includes('dummy') || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy');
    }
    throw new Error('CONFIG_ERROR: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing/invalid.');
  }
  return createClient(url, key);
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key || url.includes('dummy') || key === 'dummy') {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return createClient(url || 'https://dummy.supabase.co', key || 'dummy');
    }
    throw new Error('CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY is missing. Admin actions (like ticket generation) will fail.');
  }
  return createClient(url, key);
}
