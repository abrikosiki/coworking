-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor: Supabase → SQL → New query → paste → Run

alter table public.profiles
  add column if not exists bio text,
  add column if not exists specialization text,
  add column if not exists linkedin text,
  add column if not exists telegram text,
  add column if not exists skills text[] default '{}'::text[],
  add column if not exists checkin_at timestamptz,
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz not null default now();
