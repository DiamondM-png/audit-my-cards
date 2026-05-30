
DROP POLICY IF EXISTS "Anyone can create an audit" ON public.audits;
REVOKE INSERT ON public.audits FROM anon, authenticated;
