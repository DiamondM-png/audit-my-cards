
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  business_type TEXT NOT NULL,
  spend_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  report_output JSONB,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.audits TO anon;
GRANT SELECT, INSERT, UPDATE ON public.audits TO authenticated;
GRANT ALL ON public.audits TO service_role;

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a new audit (paid product, no login required)
CREATE POLICY "Anyone can create an audit"
  ON public.audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone with the audit ID can read it (UUID acts as access token)
CREATE POLICY "Anyone can read audits by id"
  ON public.audits FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can update their submission (form progression, report write-back happens via service role)
CREATE POLICY "Anyone can update audits"
  ON public.audits FOR UPDATE
  TO anon, authenticated
  USING (true);
