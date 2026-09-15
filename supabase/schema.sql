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
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  -- Stored with the dial code already prefixed, e.g. "+81 3 1234 5678".
  phone       text not null,
  country     text not null,
  make        text not null,
  model       text not null,
  year_range  text not null,
  budget      text not null,
  message     text,
  -- Set when a signed-in customer submits; null for anonymous visitors.
  user_id     uuid references auth.users on delete set null,
  -- Triage for the admin panel.
  status      text not null default 'new',

  -- The insert policy below lets the public write to this table, so the
  -- length limits are enforced here too and not only in the browser.
  constraint quotes_first_name_len check (char_length(first_name) between 1 and 80),
  constraint quotes_last_name_len  check (char_length(last_name)  between 1 and 80),
  constraint quotes_email_len      check (char_length(email)   between 3 and 200),
  constraint quotes_phone_len      check (char_length(phone)   between 4 and 40),
  constraint quotes_country_len    check (char_length(country) between 1 and 80),
  constraint quotes_make_len       check (char_length(make)    between 1 and 80),
  constraint quotes_model_len      check (char_length(model)   between 1 and 80),
  constraint quotes_year_len       check (char_length(year_range) between 1 and 40),
  constraint quotes_budget_len     check (char_length(budget)  between 1 and 80),
  constraint quotes_message_len    check (message is null or char_length(message) <= 1000),
  constraint quotes_status         check (status in ('new', 'open', 'quoted', 'closed'))
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


-- ---------------------------------------------------------------------------
-- order_messages
-- ---------------------------------------------------------------------------
--
-- "Ask about this order" from My Vehicles. Only signed-in customers can write
-- here, so unlike quotes there is no anonymous path.
--
-- The vehicle is recorded three ways on purpose: order_id and car_id are the
-- keys an admin panel will join on, and car_label is a plain-text snapshot so
-- a question still reads correctly if the listing is later edited or removed.
-- Who is asking comes from user_id — join public.profiles for their name and
-- auth.users for their email rather than copying either here.

create table if not exists public.order_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid not null references auth.users on delete cascade,
  order_id   text not null,
  car_id     text,
  car_label  text,
  topic      text not null,
  message    text not null,
  -- Triage for the future admin panel.
  status     text not null default 'new',

  constraint order_messages_order_len   check (char_length(order_id) between 1 and 60),
  constraint order_messages_car_len     check (car_id is null or char_length(car_id) <= 60),
  constraint order_messages_label_len   check (car_label is null or char_length(car_label) <= 160),
  constraint order_messages_topic_len   check (char_length(topic) between 1 and 60),
  constraint order_messages_message_len check (char_length(message) between 1 and 2000),
  constraint order_messages_status      check (status in ('new', 'open', 'answered', 'closed'))
);

create index if not exists order_messages_user_idx on public.order_messages (user_id, created_at desc);
create index if not exists order_messages_order_idx on public.order_messages (order_id);

alter table public.order_messages enable row level security;

-- A customer may only ever write as themselves...
drop policy if exists "Customers can ask about their own orders" on public.order_messages;
create policy "Customers can ask about their own orders"
  on public.order_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ...and only ever read their own thread back.
drop policy if exists "Customers can read their own messages" on public.order_messages;
create policy "Customers can read their own messages"
  on public.order_messages for select
  to authenticated
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Admin access
-- ---------------------------------------------------------------------------
--
-- Being an admin is a row in user_roles, not a flag on the account: it can be
-- granted and revoked without touching auth, and every policy below asks the
-- same question. Grant the first one by hand:
--
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'you@example.com';

create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz not null default now(),

  constraint user_roles_role check (role in ('admin', 'staff'))
);

alter table public.user_roles enable row level security;

-- SECURITY DEFINER so it reads user_roles without RLS. A policy on user_roles
-- that called a function which itself queried user_roles under RLS would
-- recurse forever.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid());
$$;

-- Everyone may check their own role — that's how the app knows to show /admin.
drop policy if exists "Can read own role" on public.user_roles;
create policy "Can read own role"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins see the whole team. Granting a role stays a manual database action:
-- there is no insert or update policy, deliberately.
drop policy if exists "Admins can read all roles" on public.user_roles;
create policy "Admins can read all roles"
  on public.user_roles for select
  to authenticated
  using (public.is_admin());


-- Admin reach over the customer-facing tables --------------------------------

drop policy if exists "Admins can read every quote" on public.quotes;
create policy "Admins can read every quote"
  on public.quotes for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can triage quotes" on public.quotes;
create policy "Admins can triage quotes"
  on public.quotes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read every message" on public.order_messages;
create policy "Admins can read every message"
  on public.order_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can triage messages" on public.order_messages;
create policy "Admins can triage messages"
  on public.order_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can read every profile" on public.profiles;
create policy "Admins can read every profile"
  on public.profiles for select
  to authenticated
  using (public.is_admin());


-- Order messages with the customer attached ----------------------------------
--
-- PostgREST cannot read auth.users, and copying the email into profiles would
-- leave the panel showing a stale address after someone changes it. This joins
-- it live instead. SECURITY DEFINER to reach auth.users, with the admin check
-- inside the query, so a non-admin calling it simply gets nothing back.

create or replace function public.admin_order_messages()
returns table (
  id             uuid,
  created_at     timestamptz,
  order_id       text,
  car_id         text,
  car_label      text,
  topic          text,
  message        text,
  status         text,
  customer_name  text,
  customer_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id, m.created_at, m.order_id, m.car_id, m.car_label,
    m.topic, m.message, m.status,
    coalesce(p.name, '') as customer_name,
    u.email::text       as customer_email
  from public.order_messages m
  left join public.profiles p on p.id = m.user_id
  left join auth.users     u on u.id = m.user_id
  where public.is_admin()
  order by m.created_at desc;
$$;

revoke all on function public.admin_order_messages() from anon;
