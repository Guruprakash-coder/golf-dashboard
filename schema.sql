-- ==========================================================================
-- DIGITAL HEROES - SUPABASE DATABASE SCHEMA
-- Copy and paste this script directly into your Supabase SQL Editor.
-- ==========================================================================

-- Disable Row Level Security (RLS) for testing and evaluation ease
ALTER TABLE IF EXISTS public.charities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.draws DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.winners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;

-- 1. Charities Table
CREATE TABLE IF NOT EXISTS public.charities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    events JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    total_donations NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles (Users) Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'subscriber',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "subscriptionTier" TEXT,
    "subscriptionRenewal" TEXT,
    "charityId" TEXT REFERENCES public.charities(id),
    "charityPercentage" INTEGER DEFAULT 10,
    "walletBalance" NUMERIC DEFAULT 0,
    "createdAt" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, date) -- Constraint: Only one score entry permitted per date
);

-- 4. Draws Table
CREATE TABLE IF NOT EXISTS public.draws (
    id TEXT PRIMARY KEY,
    draw_date TEXT NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    draw_type TEXT NOT NULL,
    status TEXT NOT NULL,
    jackpot_pool NUMERIC DEFAULT 0,
    match_4_pool NUMERIC DEFAULT 0,
    match_3_pool NUMERIC DEFAULT 0,
    rolled_over BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Winners Table
CREATE TABLE IF NOT EXISTS public.winners (
    id TEXT PRIMARY KEY,
    draw_id TEXT NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_count INTEGER NOT NULL,
    prize_amount NUMERIC NOT NULL,
    proof_url TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    charity_id TEXT NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- SEED INITIAL CHARITIES (Required to prevent foreign key errors on signup)
-- ==========================================================================

INSERT INTO public.charities (id, name, description, image_url, events, is_featured, total_donations)
VALUES 
('charity-1', 'Green Fairways Foundation', 'Pioneering ecological preservation and water conservation on community golf courses. We transform golf lands into local wildlife sanctuaries while maintaining recreational integrity.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=600', '[{"name": "Eco-Golf Championship", "date": "2026-07-12", "description": "Annual tournament fundraising for local reserve maintenance."}, {"name": "Water Preservation Seminar", "date": "2026-08-05", "description": "Educating course operators on sustainable irrigation."}]'::jsonb, true, 4320.00),
('charity-2', 'Youth Golf Mentors', 'Providing golf equipment, access to courses, and professional mentoring to underprivileged youth. Our goal is to teach life skills, discipline, and community leadership through sport.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=600', '[{"name": "Kids Golf Clinic", "date": "2026-07-20", "description": "Free skills training clinic for local schools."}, {"name": "Annual Charity Gala & Auction", "date": "2026-09-01", "description": "Gala night auctioning vintage golf memorabilia."}]'::jsonb, false, 2850.00),
('charity-3', 'Hole-In-One Cancer Alliance', 'Partnering with clinical networks to directly fund local oncology research programs. We leverage local events and sport-focused campaigns to raise awareness and support families in care.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600', '[{"name": "Golfing for a Cure", "date": "2026-07-28", "description": "Charity scramble with 100% of proceeds supporting local cancer wards."}]'::jsonb, true, 8900.00),
('charity-4', 'Ocean Reef Protection', 'Restoring marine coral structures and running coastal debris cleanups. Connecting coastal communities with marine biology projects to protect marine ecosystems.', 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&q=80&w=600', '[{"name": "Beach Cleanup & Scramble", "date": "2026-08-15", "description": "Coastal cleanup followed by an 18-hole charity event."}]'::jsonb, false, 1200.00)
ON CONFLICT (id) DO NOTHING;

-- Seed default test users (matching local mock values so switcher continues working in Supabase mode)
-- Default passwords are 'admin123' and 'user123' respectively, hashed:
-- admin123 -> $2a$08$91wK3C7t3G5c6c.LpEqt/.Nl7f9.X8eN5P.jE1k9tXj.n61.W0.S6
-- user123  -> $2a$08$Kz1k1z.tXj.n61.W0.S6.Nl7f9.X8eN5P.jE1k9tXj.n61.W0.S6

INSERT INTO public.profiles (id, email, "passwordHash", "fullName", role, "subscriptionStatus", "subscriptionTier", "subscriptionRenewal", "charityId", "charityPercentage", "walletBalance", "createdAt")
VALUES 
('user-admin', 'admin@digitalheroes.co.in', '$2a$08$fYUtQSVSFkej687xkq2yeeKNnN4qmIPszP.vzaIjjcC1WlfT8lFDW', 'David Sterling', 'admin', 'active', 'yearly', '2027-03-15', 'charity-1', 15, 0.00, '2026-01-10'),
('user-sub1', 'golfguy@digitalheroes.co.in', '$2a$08$AZ2nIBBCFMDdHJCdadb.we9PQzNTTw5b6mYDQbLZqWY6j7ypiKWW2', 'Marcus Vance', 'subscriber', 'active', 'monthly', '2026-07-15', 'charity-1', 20, 250.00, '2026-03-01'),
('user-sub2', 'sarah.jones@gmail.com', '$2a$08$/N2PYXCrhbFkZh7/VJKdbuIkL1SoKTwHtyNZnSf6ghf9KtVaUVbyW', 'Sarah Jones', 'subscriber', 'active', 'yearly', '2027-02-18', 'charity-3', 10, 0.00, '2026-02-18')
ON CONFLICT (id) DO NOTHING;
