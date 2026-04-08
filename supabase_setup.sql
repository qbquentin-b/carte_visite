-- ==========================================
-- MVP SaaS Cartes Virtuelles - Schema Setup
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Tables Creation
-- ==========================================

-- 1.1. Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2. Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'loyalty', 'business_card'
    design_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3. Passes Table
CREATE TABLE IF NOT EXISTS public.passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    pass_slug TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4. Scans Table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    pass_id UUID REFERENCES public.passes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action_type TEXT NOT NULL,
    device_info TEXT
);

-- ==========================================
-- 2. Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 2.1. Tenants Policies
-- A user can only view and update their own tenant
CREATE POLICY "Users can view their own tenant"
    ON public.tenants FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenant"
    ON public.tenants FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenant"
    ON public.tenants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2.2. Cards Policies
-- A user can only manage cards associated with their tenant
CREATE POLICY "Users can view their own cards"
    ON public.cards FOR SELECT
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own cards"
    ON public.cards FOR INSERT
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own cards"
    ON public.cards FOR UPDATE
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own cards"
    ON public.cards FOR DELETE
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

-- 2.3. Passes Policies
-- Anyone can read active passes (for the public URLs)
CREATE POLICY "Public can view passes"
    ON public.passes FOR SELECT
    USING (status = 'active');

CREATE POLICY "Users can insert passes for their cards"
    ON public.passes FOR INSERT
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can update passes for their cards"
    ON public.passes FOR UPDATE
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

-- 2.4. Scans Policies
CREATE POLICY "Users can view their own scans"
    ON public.scans FOR SELECT
    USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert scans for their passes"
    ON public.scans FOR INSERT
    WITH CHECK (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

-- ==========================================
-- 3. Automation (Trigger for Onboarding)
-- ==========================================

-- Function to automatically create a tenant on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tenants (user_id, name)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger calling the function after insert on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2.5. Additional Policies for Public Pass View
-- Allow public read access to tenants to display the tenant name on the pass
CREATE POLICY "Public can view tenants"
    ON public.tenants FOR SELECT
    USING (true);

-- Allow public read access to cards to display the card configuration on the pass
CREATE POLICY "Public can view cards"
    ON public.cards FOR SELECT
    USING (true);
