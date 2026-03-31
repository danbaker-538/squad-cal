-- Squad Cal Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  display_name text not null,
  xp integer default 0 not null,
  recovery_code text unique not null,
  push_subscription jsonb,
  joined_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  created_by uuid references members(id) on delete set null,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  created_at timestamptz default now()
);

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  status text check (status in ('going', 'maybe', 'not_going')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (event_id, member_id)
);

create table xp_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade,
  amount integer not null,
  reason text check (reason in ('created_event', 'rsvped', 'attended')) not null,
  created_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_members_group on members(group_id);
create index idx_events_group on events(group_id);
create index idx_events_start on events(start_time);
create index idx_rsvps_event on rsvps(event_id);
create index idx_rsvps_member on rsvps(member_id);
create index idx_xp_log_member on xp_log(member_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table groups enable row level security;
alter table members enable row level security;
alter table events enable row level security;
alter table rsvps enable row level security;
alter table xp_log enable row level security;

-- For our cookie-based auth, we pass the member_id via a custom header.
-- Since we're using anon key with no Supabase Auth, we'll use permissive
-- policies and rely on our server-side code for access control.
-- The RLS policies below allow all operations via the anon key,
-- with actual authorization handled in server actions.

create policy "Allow all on groups" on groups for all using (true) with check (true);
create policy "Allow all on members" on members for all using (true) with check (true);
create policy "Allow all on events" on events for all using (true) with check (true);
create policy "Allow all on rsvps" on rsvps for all using (true) with check (true);
create policy "Allow all on xp_log" on xp_log for all using (true) with check (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to award XP and update member total
create or replace function award_xp(
  p_member_id uuid,
  p_event_id uuid,
  p_reason text,
  p_amount integer
) returns void as $$
begin
  insert into xp_log (member_id, event_id, reason, amount)
  values (p_member_id, p_event_id, p_reason, p_amount);

  update members
  set xp = xp + p_amount
  where id = p_member_id;
end;
$$ language plpgsql;
