
DROP POLICY IF EXISTS "Anyone can update audits" ON public.audits;
REVOKE UPDATE ON public.audits FROM anon, authenticated;
