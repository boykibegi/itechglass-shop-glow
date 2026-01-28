-- Add 'driver' to the app_role enum (needs to be committed separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';