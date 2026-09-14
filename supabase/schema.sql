-- Neo — database schema.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run; every statement is idempotent.
--
-- Two tables, holding only what the site actually collects:
--   profiles  one row per account, filled in automatically at sign-up
--   quotes    one row per "Get a Quote" submission
--
-- Passwords, sessions and email confirmation stay in auth.users, managed by
-- Supabase. Nothing here duplicates them.


-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text not null default '',
  country    text not null default '',
  phone      text,
  company    text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A profile is visible and editable only to the account that owns it.
drop policy if exists "Owner can read own profile" on public.profiles;
create policy "Owner can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Owner can update own profile" on public.profiles;
create policy "Owner can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Copies the sign-up details out of the auth record.
-- SECURITY DEFINER because the new user has no session yet: with email
-- confirmation on, the row must be written before they can ever sign in.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, country, phone, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'company', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who registered before this schema existed.
insert into public.profiles (id, name, country, phone, company, created_at)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'name', ''),
  coalesce(u.raw_user_meta_data ->> 'country', ''),
  nullif(u.raw_user_meta_data ->> 'phone', ''),
  nullif(u.raw_user_meta_data ->> 'company', ''),
  u.created_at
from auth.users u
on conflict (id) do nothing;


-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------

create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  email      text not null,
  country    text not null,
  vehicle    text,
  budget     text,
  message    text,
  -- Set when a signed-in customer submits; null for anonymous visitors.
  user_id    uuid references auth.users on delete set null,

  -- The insert policy below lets the public write to this table, so the
  -- length limits are enforced here too and not only in the browser.
  constraint quotes_name_len    check (char_length(name) between 1 and 120),
  constraint quotes_email_len   check (char_length(email) between 3 and 200),
  constraint quotes_country_len check (char_length(country) between 1 and 80),
  constraint quotes_vehicle_len check (vehicle is null or char_length(vehicle) <= 200),
  constraint quotes_budget_len  check (budget  is null or char_length(budget)  <= 80),
  constraint quotes_message_len check (message is null or char_length(message) <= 2000)
);

create index if not exists quotes_created_at_idx on public.quotes (created_at desc);
create index if not exists quotes_user_id_idx on public.quotes (user_id);

alter table public.quotes enable row level security;

-- Anyone may submit a request, signed in or not. A visitor cannot attach
-- someone else's account to it: anon has no auth.uid(), so user_id must be null.
drop policy if exists "Anyone can submit a quote request" on public.quotes;
create policy "Anyone can submit a quote request"
  on public.quotes for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

-- Deliberately no general read policy: submissions are not readable through
-- the public API. Read them in the dashboard (Table editor), which bypasses
-- RLS. Signed-in customers can see only the ones they sent themselves.
drop policy if exists "Customers can read their own requests" on public.quotes;
create policy "Customers can read their own requests"
  on public.quotes for select
  to authenticated
  using (auth.uid() = user_id);
