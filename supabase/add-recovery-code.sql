-- Run this in Supabase SQL Editor to add recovery codes
-- This is safe to run on a live database with existing data

-- Add recovery_code column
alter table members add column if not exists recovery_code text unique;

-- Generate recovery codes for existing members that don't have one
update members
set recovery_code = 'PDA-' || upper(substr(md5(random()::text), 1, 4))
where recovery_code is null;

-- Make recovery_code not null going forward
alter table members alter column recovery_code set not null;

-- Index for fast lookups
create index if not exists idx_members_recovery_code on members(recovery_code);
