-- UPLIFT 2.0 - Admin Session & Schema Diagnostics
-- Run this in the Supabase SQL Editor to check why data might be missing

-- 1. Check your current identity and if 'is_admin()' recognizes you
SELECT 
    auth.uid() as user_id,
    auth.jwt() ->> 'email' as jwt_email,
    auth.jwt() -> 'user_metadata' ->> 'role' as jwt_role,
    public.is_admin() as is_admin_recognized,
    (SELECT COUNT(*) FROM public.reservations) as total_reservations_in_db;

-- 2. Verify that the necessary columns exist in rotations
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name IN ('ticket_id', 'confirmed_at', 'payment_method', 'status');

-- 3. Verify that the tickets table exists and has the expected columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
AND column_name IN ('name', 'allocation_mode', 'pricing_tiers');

-- 4. Check if there are any reservations at all
-- If this returns rows but the dashboard is empty, it's definitely RLS.
SELECT id, full_name, email, status, created_at 
FROM public.reservations 
LIMIT 5;

-- 5. Test if you can see tickets
SELECT id, name, price 
FROM public.tickets 
LIMIT 5;

-- 6. EMERGENCY FIX: If you are SURE you are an admin but can't see data, 
-- you can run this to temporarily bypass RLS for a few minutes to confirm.
-- (Uncomment to use - NOT RECOMMENDED FOR PRODUCTION LONG-TERM)
-- DROP POLICY IF EXISTS "TEMP_BYPASS_RLS" ON public.reservations;
-- CREATE POLICY "TEMP_BYPASS_RLS" ON public.reservations FOR SELECT USING (true);
