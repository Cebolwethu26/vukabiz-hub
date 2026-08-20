
CREATE TYPE public.app_role AS ENUM ('member','mentor','trustee','admin');
CREATE TYPE public.business_stage AS ENUM ('idea','early','growth','established');
CREATE TYPE public.pathway AS ENUM ('upskilling','grant_ready');
CREATE TYPE public.verification_status AS ENUM ('pending','verified','rejected');
CREATE TYPE public.application_status AS ENUM ('draft','submitted','under_review','approved','rejected','disbursed');
CREATE TYPE public.transaction_type AS ENUM ('contribution','disbursement','overhead');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cipc_number TEXT,
  sars_tax_pin TEXT,
  stage public.business_stage NOT NULL DEFAULT 'idea',
  sector TEXT,
  province TEXT,
  city TEXT,
  employees INTEGER NOT NULL DEFAULT 0,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  verification public.verification_status NOT NULL DEFAULT 'pending',
  route public.pathway NOT NULL DEFAULT 'upskilling',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own businesses" ON public.businesses FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "trustees read businesses" ON public.businesses FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'trustee') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER businesses_updated BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grant_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT,
  vendor_name TEXT NOT NULL,
  vendor_category TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  amount_requested NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_approved NUMERIC(12,2),
  status public.application_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grant_applications TO authenticated;
GRANT ALL ON public.grant_applications TO service_role;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.grant_applications FOR ALL TO authenticated USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "trustees read applications" ON public.grant_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'trustee') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "trustees update applications" ON public.grant_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'trustee') OR public.has_role(auth.uid(),'admin')) WITH CHECK (true);
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.grant_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.trustee_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.grant_applications(id) ON DELETE CASCADE,
  trustee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trustee_name TEXT,
  approved BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, trustee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trustee_approvals TO authenticated;
GRANT SELECT ON public.trustee_approvals TO anon;
GRANT ALL ON public.trustee_approvals TO service_role;
ALTER TABLE public.trustee_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals public read" ON public.trustee_approvals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "trustee records own approval" ON public.trustee_approvals FOR INSERT TO authenticated WITH CHECK (auth.uid() = trustee_id AND (public.has_role(auth.uid(),'trustee') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "trustee updates own approval" ON public.trustee_approvals FOR UPDATE TO authenticated USING (auth.uid() = trustee_id) WITH CHECK (auth.uid() = trustee_id);

CREATE TABLE public.fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  recipient_business TEXT,
  vendor_name TEXT,
  description TEXT,
  reference TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fund_transactions TO anon, authenticated;
GRANT ALL ON public.fund_transactions TO service_role;
ALTER TABLE public.fund_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ledger public read" ON public.fund_transactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage ledger" ON public.fund_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.fund_transactions (type, amount, recipient_business, vendor_name, description, reference, occurred_at) VALUES
('contribution', 48210.00, NULL, NULL, 'Monthly R10 community micro-contributions — March', 'POOL-2026-03', now() - interval '150 days'),
('contribution', 51340.00, NULL, NULL, 'Monthly R10 community micro-contributions — April', 'POOL-2026-04', now() - interval '120 days'),
('contribution', 55980.00, NULL, NULL, 'Monthly R10 community micro-contributions — May', 'POOL-2026-05', now() - interval '90 days'),
('contribution', 61220.00, NULL, NULL, 'Monthly R10 community micro-contributions — June', 'POOL-2026-06', now() - interval '60 days'),
('contribution', 64750.00, NULL, NULL, 'Monthly R10 community micro-contributions — July', 'POOL-2026-07', now() - interval '30 days'),
('contribution', 38900.00, NULL, NULL, 'Monthly R10 community micro-contributions — August', 'POOL-2026-08', now() - interval '5 days'),
('disbursement', 24500.00, 'Thandi''s Bakery', 'Hobart Equipment SA', 'Commercial convection oven purchase', 'DIS-1041', now() - interval '112 days'),
('disbursement', 18750.00, 'Mzansi Fresh Produce', 'Cold Chain Logistics', 'Refrigerated display unit', 'DIS-1042', now() - interval '95 days'),
('disbursement', 9600.00, 'Kasi Coders', 'Adobe Africa Licensing', 'Annual design software licences', 'DIS-1043', now() - interval '81 days'),
('disbursement', 32000.00, 'Lebo Auto Repairs', 'Snap-on Tools SA', 'Diagnostic toolkit and lift', 'DIS-1044', now() - interval '66 days'),
('disbursement', 14300.00, 'Naledi Sewing Collective', 'Singer Industrial', 'Three industrial sewing machines', 'DIS-1045', now() - interval '48 days'),
('disbursement', 21200.00, 'Green Roots Farming', 'AgriSeed Supplies', 'Seed and irrigation stock', 'DIS-1046', now() - interval '33 days'),
('disbursement', 12750.00, 'Bokamoso Print Hub', 'Epson Business Partner', 'Wide-format printer', 'DIS-1047', now() - interval '18 days'),
('disbursement', 27400.00, 'Ubuntu Catering Co', 'Makro Wholesale', 'Bulk stock and serving equipment', 'DIS-1048', now() - interval '7 days'),
('overhead', 4200.00, NULL, 'Standard Bank', 'Trust account banking fees (6 months)', 'OPS-2026-01', now() - interval '30 days'),
('overhead', 6800.00, NULL, 'Moore Auditors', 'Independent audit and compliance', 'OPS-2026-02', now() - interval '20 days'),
('overhead', 3100.00, NULL, 'Vodacom Business', 'Connectivity and platform hosting', 'OPS-2026-03', now() - interval '10 days');
