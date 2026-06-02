-- Remove public read access to audits table (contains emails, financial data, payment status).
-- The table is only written/read server-side via the edge function using the service role,
-- which bypasses RLS. No client-side reads exist.
DROP POLICY IF EXISTS "Anyone can read audits by id" ON public.audits;

-- Revoke direct Data API access from anon/authenticated to be safe.
REVOKE ALL ON public.audits FROM anon;
REVOKE ALL ON public.audits FROM authenticated;
GRANT ALL ON public.audits TO service_role;