-- Fix coworkings table: add missing columns
-- Run this in Supabase SQL Editor: Supabase → SQL → New query → paste → Run

alter table public.coworkings
  add column if not exists name text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists admin_id uuid references public.profiles(id);
