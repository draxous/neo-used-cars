-- Neo — database schema.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run; every statement is idempotent.
--
-- What lives here:
--   profiles         one row per account, filled in automatically at sign-up
--   quotes           one row per "Get a Quote" submission
--   order_messages   questions a customer asks about a vehicle they bought
--   user_roles       who can reach /admin, and as what
--   admin_invites    one-time links into the admin team
--   vehicles         the stock list the whole public site renders
--   orders           a customer's purchase, and its shipping stage
--   order_updates    the timeline shown under each order
--   inquiry_replies  the team's answers to quotes and order messages
--   site_settings    contact details and the announcement bar, one row
--
-- Vehicles are seeded separately, once, from supabase/seed_vehicles.sql.
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
-- same question.
--
-- Three roles. 'super_admin' additionally runs /admin/team: only they can
-- invite. 'admin' and 'staff' reach the same screens for now — is_admin()
-- lists all three, so narrowing 'staff' later is a one-line change here and
-- nowhere else.
--
-- The first super admin is seeded below by email address; everyone after is
-- invited from the web (see "Admin invitations" below).

create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users on delete cascade,
  role       text not null default 'admin',
  created_at timestamptz not null default now(),

  constraint user_roles_role check (role in ('super_admin', 'admin', 'staff'))
);

-- The create table above is a no-op on an existing deployment, so widen the
-- constraint separately for databases made before super_admin existed.
alter table public.user_roles drop constraint if exists user_roles_role;
alter table public.user_roles add constraint user_roles_role
  check (role in ('super_admin', 'admin', 'staff'));

alter table public.user_roles enable row level security;

-- Bootstrap: the one role nobody can be invited into, so it is granted here by
-- address. A no-op until that person has registered — run the schema again
-- once they have, or grant it by hand with the same statement.
--
-- Note it re-applies every time this file runs: if this address is ever
-- removed on /admin/team, the next run puts it back. Delete this block once
-- the team is managing itself.
insert into public.user_roles (user_id, role)
select u.id, 'super_admin'
  from auth.users u
 where lower(u.email) = 'rasika.sugathadasa@gmail.com'
on conflict (user_id) do update set role = 'super_admin';

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
  select exists (
    select 1 from public.user_roles
     where user_id = auth.uid()
       and role in ('super_admin', 'admin', 'staff')
  );
$$;

-- Inviting is the one thing an ordinary admin cannot do.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
     where user_id = auth.uid() and role = 'super_admin'
  );
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


-- ---------------------------------------------------------------------------
-- Admin invitations
-- ---------------------------------------------------------------------------
--
-- The separate way into /admin. A super admin issues an invitation on
-- /admin/team and passes the one-time link on; the invited person opens
-- /admin/join?token=..., where the address is fixed by the invitation and only
-- a password is asked for. Nothing here touches /register, and holding a role
-- is never something an account can give itself.
--
-- What makes the link safe to send over WhatsApp or email:
--   * the token is 32 random bytes, and only its sha256 lands in the table, so
--     a leaked row (or a policy mistake later) yields no usable invitation;
--   * accepting requires a session whose address equals the invited one, so a
--     forwarded link cannot be redeemed by whoever received it;
--   * invitations expire, and issuing a new one for an address retires the old.
--
-- Supabase → Authentication → URL Configuration must list /admin/join as a
-- redirect URL, or the confirmation email won't come back to the right page.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admin_invites (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null,
  role        text not null default 'admin',
  -- sha256 of the token, hex. The token itself is shown once and never stored.
  token_hash  text not null unique,
  invited_by  uuid references auth.users on delete set null,
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users on delete set null,
  revoked_at  timestamptz,

  constraint admin_invites_email_len check (char_length(email) between 3 and 200),
  constraint admin_invites_role check (role in ('admin', 'staff'))
);

create index if not exists admin_invites_email_idx on public.admin_invites (lower(email));
create index if not exists admin_invites_created_idx on public.admin_invites (created_at desc);

alter table public.admin_invites enable row level security;

-- Deliberately no policies at all: not even a super admin reads this table
-- through PostgREST. Every path goes through the functions below, which is
-- what keeps token_hash out of reach of the browser.


-- Issue one. Returns the raw token exactly once — it cannot be recovered
-- afterwards, so the caller has to hand it over or issue a fresh invitation.
create or replace function public.create_admin_invite(p_email text, p_role text default 'admin')
returns table (token text, expires_at timestamptz)
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_email   text := lower(trim(p_email));
  v_token   text;
  v_expires timestamptz;
begin
  if not public.is_super_admin() then
    raise exception 'Only a super admin can invite people' using errcode = '42501';
  end if;

  if p_role not in ('admin', 'staff') then
    raise exception 'Role must be admin or staff' using errcode = '22023';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'That does not look like an email address' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.user_roles r
      join auth.users u on u.id = r.user_id
     where lower(u.email) = v_email
  ) then
    raise exception 'That address is already on the team' using errcode = '23505';
  end if;

  -- One live invitation per address: issuing a new one retires the old.
  update public.admin_invites
     set revoked_at = now()
   where lower(email) = v_email
     and accepted_at is null
     and revoked_at is null;

  v_token := encode(gen_random_bytes(32), 'hex');

  insert into public.admin_invites (email, role, token_hash, invited_by)
  values (v_email, p_role, encode(digest(v_token, 'sha256'), 'hex'), auth.uid())
  returning admin_invites.expires_at into v_expires;

  return query select v_token, v_expires;
end;
$$;


-- What the join page shows before anyone has signed in, so this one is open to
-- anon. It reveals nothing without the token, and the token is unguessable.
create or replace function public.admin_invite_details(p_token text)
returns table (email text, role text, expires_at timestamptz)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select i.email, i.role, i.expires_at
    from public.admin_invites i
   where i.token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and i.accepted_at is null
     and i.revoked_at is null
     and i.expires_at > now();
$$;


-- Redeem it. This is the only code path in the database that writes a role.
create or replace function public.accept_admin_invite(p_token text)
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  v_invite public.admin_invites;
  v_email  text;
begin
  if auth.uid() is null then
    raise exception 'Sign in before accepting an invitation' using errcode = '42501';
  end if;

  -- Read the address off the account rather than the JWT, and insist it has
  -- been confirmed: an unverified address proves nothing about who is here.
  select lower(u.email) into v_email
    from auth.users u
   where u.id = auth.uid() and u.email_confirmed_at is not null;

  if v_email is null then
    raise exception 'Confirm your email address first' using errcode = '42501';
  end if;

  select * into v_invite
    from public.admin_invites
   where token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and accepted_at is null
     and revoked_at is null
     and expires_at > now()
     for update;

  if not found then
    raise exception 'That invitation has expired or has already been used'
      using errcode = '22023';
  end if;

  -- The lock that makes a forwarded link useless.
  if v_email is distinct from v_invite.email then
    raise exception 'This invitation was issued to a different email address'
      using errcode = '42501';
  end if;

  insert into public.user_roles (user_id, role)
  values (auth.uid(), v_invite.role)
  on conflict (user_id) do update set role = excluded.role;

  update public.admin_invites
     set accepted_at = now(), accepted_by = auth.uid()
   where id = v_invite.id;

  return v_invite.role;
end;
$$;


-- The /admin/team list. Never returns token_hash.
create or replace function public.list_admin_invites()
returns table (
  id          uuid,
  created_at  timestamptz,
  email       text,
  role        text,
  expires_at  timestamptz,
  accepted_at timestamptz,
  revoked_at  timestamptz,
  invited_by  text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id, i.created_at, i.email, i.role, i.expires_at,
    i.accepted_at, i.revoked_at,
    coalesce(u.email::text, '') as invited_by
  from public.admin_invites i
  left join auth.users u on u.id = i.invited_by
  where public.is_super_admin()
  order by i.created_at desc;
$$;


create or replace function public.revoke_admin_invite(p_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only a super admin can revoke invitations' using errcode = '42501';
  end if;

  update public.admin_invites
     set revoked_at = now()
   where id = p_id and accepted_at is null and revoked_at is null;
end;
$$;


-- Who currently holds a role, with the live address joined in.
create or replace function public.list_admin_team()
returns table (
  user_id    uuid,
  email      text,
  name       text,
  role       text,
  granted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.user_id,
    u.email::text        as email,
    coalesce(p.name, '') as name,
    r.role,
    r.created_at         as granted_at
  from public.user_roles r
  join auth.users u on u.id = r.user_id
  left join public.profiles p on p.id = r.user_id
  where public.is_super_admin()
  order by r.created_at;
$$;


-- Revoking leaves the account intact; it just stops being staff. Removing
-- yourself is blocked so a project cannot end up with no super admin.
create or replace function public.revoke_admin_role(p_user_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only a super admin can remove someone' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot remove your own access' using errcode = '42501';
  end if;

  delete from public.user_roles where user_id = p_user_id;
end;
$$;


-- anon needs exactly one of these: the lookup the join page does before the
-- invited person has an account. Everything else is for a signed-in caller,
-- and each checks the role again inside.
revoke all on function public.create_admin_invite(text, text) from anon;
revoke all on function public.accept_admin_invite(text)       from anon;
revoke all on function public.list_admin_invites()            from anon;
revoke all on function public.revoke_admin_invite(uuid)       from anon;
revoke all on function public.list_admin_team()               from anon;
revoke all on function public.revoke_admin_role(uuid)         from anon;


-- ---------------------------------------------------------------------------
-- Admin tiers
-- ---------------------------------------------------------------------------
--
-- is_admin() is "anyone on the team". A few things are one step up — deleting
-- stock or orders, clearing spam, editing the site's contact details — and
-- those ask is_manager() instead, which leaves 'staff' out. Staff can still
-- list cars, move orders along and answer customers.

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
     where user_id = auth.uid()
       and role in ('super_admin', 'admin')
  );
$$;

-- Keeps updated_at honest without every caller remembering to send it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- Changing a role ------------------------------------------------------------
--
-- Promotions and demotions within the team. Adding someone new still goes
-- through an invitation; this only touches people who already hold a role.
-- Changing your own is blocked for the same reason removing yourself is.

create or replace function public.set_admin_role(p_user_id uuid, p_role text)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only a super admin can change roles' using errcode = '42501';
  end if;

  if p_role not in ('super_admin', 'admin', 'staff') then
    raise exception 'Unknown role' using errcode = '22023';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own role' using errcode = '42501';
  end if;

  update public.user_roles set role = p_role where user_id = p_user_id;

  if not found then
    raise exception 'That person is not on the team' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.set_admin_role(uuid, text) from anon;


-- Clearing spam --------------------------------------------------------------
--
-- The quote form is open to the public, so junk arrives. Managers can delete.

drop policy if exists "Managers can delete quotes" on public.quotes;
create policy "Managers can delete quotes"
  on public.quotes for delete
  to authenticated
  using (public.is_manager());

drop policy if exists "Managers can delete messages" on public.order_messages;
create policy "Managers can delete messages"
  on public.order_messages for delete
  to authenticated
  using (public.is_manager());


-- ---------------------------------------------------------------------------
-- vehicles
-- ---------------------------------------------------------------------------
--
-- The stock list. Mirrors the `Car` type in src/data/cars.ts column for column;
-- src/lib/inventory.ts is the one place that maps between the two.
--
-- `published` decides whether the public can see a row at all. `status` is
-- the sales state: sold units stay readable (a customer's order still links to
-- its photos) but drop out of every listing.
--
-- The id is the stock number and doubles as the URL segment, so the admin
-- panel fixes it once a car is saved.

create table if not exists public.vehicles (
  id            text primary key,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  make          text not null,
  model         text not null,
  grade         text,
  year          integer not null,
  price_usd     integer not null,
  mileage_km    integer not null,
  fuel          text not null,
  transmission  text not null,
  drive         text not null,
  engine_cc     integer not null,
  body_type     text not null,
  color         text not null,
  doors         integer not null,
  seats         integer not null,
  steering      text not null default 'Right',
  condition     text,
  chassis_code  text,
  location      text not null,
  images        text[] not null default '{}',
  collections   text[] not null default '{}',
  featured      boolean not null default false,
  arrived_at    date not null default current_date,
  status        text not null default 'available',
  published     boolean not null default true,
  -- Present only on auction lots; all five travel together.
  auction_house         text,
  auction_lot_number    text,
  auction_date          date,
  auction_estimate_low  integer,
  auction_estimate_high integer,

  constraint vehicles_id_format   check (id ~ '^[A-Za-z0-9-]{2,40}$'),
  constraint vehicles_make_len    check (char_length(make)  between 1 and 60),
  constraint vehicles_model_len   check (char_length(model) between 1 and 80),
  constraint vehicles_year        check (year between 1950 and 2100),
  constraint vehicles_price       check (price_usd >= 0),
  constraint vehicles_mileage     check (mileage_km >= 0),
  constraint vehicles_engine      check (engine_cc >= 0),
  constraint vehicles_doors       check (doors between 0 and 10),
  constraint vehicles_seats       check (seats between 0 and 60),
  constraint vehicles_fuel         check (fuel in ('Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG')),
  constraint vehicles_transmission check (transmission in ('Automatic', 'Manual', 'CVT')),
  constraint vehicles_drive        check (drive in ('2WD', '4WD', 'AWD')),
  constraint vehicles_steering     check (steering in ('Right', 'Left')),
  constraint vehicles_status       check (status in ('available', 'reserved', 'sold')),
  constraint vehicles_images_count check (cardinality(images) <= 30),
  constraint vehicles_auction_whole check (
    (auction_house is null and auction_lot_number is null and auction_date is null
      and auction_estimate_low is null and auction_estimate_high is null)
    or
    (auction_house is not null and auction_lot_number is not null and auction_date is not null
      and auction_estimate_low is not null and auction_estimate_high is not null)
  )
);

create index if not exists vehicles_arrived_idx on public.vehicles (arrived_at desc);

drop trigger if exists vehicles_touch on public.vehicles;
create trigger vehicles_touch
  before update on public.vehicles
  for each row execute function public.touch_updated_at();

alter table public.vehicles enable row level security;

drop policy if exists "Anyone can read published vehicles" on public.vehicles;
create policy "Anyone can read published vehicles"
  on public.vehicles for select
  to anon, authenticated
  using (published);

-- Hidden drafts too, so the team can preview before publishing.
drop policy if exists "Admins can read every vehicle" on public.vehicles;
create policy "Admins can read every vehicle"
  on public.vehicles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can add vehicles" on public.vehicles;
create policy "Admins can add vehicles"
  on public.vehicles for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can edit vehicles" on public.vehicles;
create policy "Admins can edit vehicles"
  on public.vehicles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Managers can delete vehicles" on public.vehicles;
create policy "Managers can delete vehicles"
  on public.vehicles for delete
  to authenticated
  using (public.is_manager());


-- Vehicle photos --------------------------------------------------------------
--
-- A public bucket: listing photos are meant to be seen, and a public URL keeps
-- them cacheable. Only the team can write. The browser shrinks photos before
-- upload (src/lib/inventory.ts), so the 5 MB cap is a backstop.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-images', 'vehicle-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Admins can upload vehicle images" on storage.objects;
create policy "Admins can upload vehicle images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehicle-images' and public.is_admin());

drop policy if exists "Admins can replace vehicle images" on storage.objects;
create policy "Admins can replace vehicle images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vehicle-images' and public.is_admin());

drop policy if exists "Admins can delete vehicle images" on storage.objects;
create policy "Admins can delete vehicle images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicle-images' and public.is_admin());


-- ---------------------------------------------------------------------------
-- orders and order_updates
-- ---------------------------------------------------------------------------
--
-- What a customer sees on My Vehicles. The team creates the order once
-- payment lands and moves it through the five stages; each move writes a line
-- to order_updates, which is the timeline under the tracker.
--
-- car_label is a snapshot for the same reason as on order_messages. car_id
-- refuses deletion of a car that has been sold: hide it instead.

create sequence if not exists public.order_number_seq start 3001;

create table if not exists public.orders (
  id             text primary key default ('NEO-ORD-' || nextval('public.order_number_seq')::text),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  user_id        uuid not null references auth.users on delete cascade,
  car_id         text references public.vehicles on update cascade on delete restrict,
  car_label      text not null,
  purchased_at   timestamptz not null default now(),
  price_paid_usd integer not null,
  stage          text not null default 'purchased',
  destination    text not null default '',
  vessel         text,
  eta_date       date,

  constraint orders_label_len  check (char_length(car_label) between 1 and 160),
  constraint orders_price      check (price_paid_usd >= 0),
  constraint orders_stage      check (stage in ('purchased', 'inspected', 'booked', 'shipped', 'arrived')),
  constraint orders_dest_len   check (char_length(destination) <= 120),
  constraint orders_vessel_len check (vessel is null or char_length(vessel) <= 120)
);

create index if not exists orders_user_idx on public.orders (user_id, purchased_at desc);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
  before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins can read every order" on public.orders;
create policy "Admins can read every order"
  on public.orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can create orders" on public.orders;
create policy "Admins can create orders"
  on public.orders for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can edit orders" on public.orders;
create policy "Admins can edit orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Managers can delete orders" on public.orders;
create policy "Managers can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_manager());


create table if not exists public.order_updates (
  id         uuid primary key default gen_random_uuid(),
  order_id   text not null references public.orders on delete cascade,
  at         timestamptz not null default now(),
  label      text not null,
  -- Set when this line recorded a stage change; null for a free-text note.
  stage      text,
  created_by uuid references auth.users on delete set null default auth.uid(),

  constraint order_updates_label_len check (char_length(label) between 1 and 200),
  constraint order_updates_stage check (
    stage is null or stage in ('purchased', 'inspected', 'booked', 'shipped', 'arrived')
  )
);

create index if not exists order_updates_order_idx on public.order_updates (order_id, at desc);

alter table public.order_updates enable row level security;

drop policy if exists "Customers can read updates on their orders" on public.order_updates;
create policy "Customers can read updates on their orders"
  on public.order_updates for select
  to authenticated
  using (exists (
    select 1 from public.orders o
     where o.id = order_updates.order_id and o.user_id = auth.uid()
  ));

drop policy if exists "Admins can read every update" on public.order_updates;
create policy "Admins can read every update"
  on public.order_updates for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can post updates" on public.order_updates;
create policy "Admins can post updates"
  on public.order_updates for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can remove updates" on public.order_updates;
create policy "Admins can remove updates"
  on public.order_updates for delete
  to authenticated
  using (public.is_admin());


-- The wording a customer sees when a stage changes and nobody typed anything.
create or replace function public.order_stage_label(p_stage text)
returns text
language sql
immutable
as $$
  select case p_stage
    when 'purchased' then 'Payment received — unit secured'
    when 'inspected' then 'Pre-export inspection passed'
    when 'booked'    then 'Space booked on a vessel'
    when 'shipped'   then 'Departed Japan'
    when 'arrived'   then 'Arrived at destination port'
  end;
$$;

-- Creates the order, its first timeline line, and (optionally) marks the car
-- sold, all or nothing. SECURITY INVOKER: the RLS above does the gatekeeping.
create or replace function public.admin_create_order(
  p_user_id     uuid,
  p_car_id      text,
  p_car_label   text,
  p_price       integer,
  p_destination text,
  p_purchased   timestamptz default now(),
  p_mark_sold   boolean default true
)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_id text;
begin
  if not public.is_admin() then
    raise exception 'Only the team can create orders' using errcode = '42501';
  end if;

  insert into public.orders (user_id, car_id, car_label, price_paid_usd, destination, purchased_at)
  values (p_user_id, nullif(p_car_id, ''), p_car_label, p_price, coalesce(p_destination, ''),
          coalesce(p_purchased, now()))
  returning id into v_id;

  insert into public.order_updates (order_id, at, label, stage)
  values (v_id, coalesce(p_purchased, now()), public.order_stage_label('purchased'), 'purchased');

  if p_mark_sold and nullif(p_car_id, '') is not null then
    update public.vehicles set status = 'sold' where id = p_car_id;
  end if;

  return v_id;
end;
$$;

-- Moves an order to a stage and writes the timeline line in the same step, so
-- the tracker and the history can never disagree.
create or replace function public.admin_set_order_stage(
  p_order_id text,
  p_stage    text,
  p_label    text default null
)
returns void
language plpgsql
volatile
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the team can update orders' using errcode = '42501';
  end if;

  update public.orders set stage = p_stage where id = p_order_id;
  if not found then
    raise exception 'No such order' using errcode = '22023';
  end if;

  insert into public.order_updates (order_id, label, stage)
  values (
    p_order_id,
    coalesce(nullif(trim(p_label), ''), public.order_stage_label(p_stage)),
    p_stage
  );
end;
$$;

-- The /admin/orders list, with the customer's live name and address.
create or replace function public.admin_list_orders()
returns table (
  id             text,
  created_at     timestamptz,
  user_id        uuid,
  car_id         text,
  car_label      text,
  purchased_at   timestamptz,
  price_paid_usd integer,
  stage          text,
  destination    text,
  vessel         text,
  eta_date       date,
  customer_name  text,
  customer_email text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    o.id, o.created_at, o.user_id, o.car_id, o.car_label, o.purchased_at,
    o.price_paid_usd, o.stage, o.destination, o.vessel, o.eta_date,
    coalesce(p.name, '') as customer_name,
    u.email::text        as customer_email
  from public.orders o
  left join public.profiles p on p.id = o.user_id
  left join auth.users     u on u.id = o.user_id
  where public.is_admin()
  order by o.purchased_at desc;
$$;

revoke all on function public.admin_create_order(uuid, text, text, integer, text, timestamptz, boolean) from anon;
revoke all on function public.admin_set_order_stage(text, text, text) from anon;
revoke all on function public.admin_list_orders() from anon;


-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
--
-- Everyone with an account, for /admin/customers and for picking who an order
-- belongs to. Reaches auth.users for the address and last sign-in.

create or replace function public.admin_list_customers()
returns table (
  user_id        uuid,
  email          text,
  name           text,
  country        text,
  phone          text,
  company        text,
  created_at     timestamptz,
  last_sign_in   timestamptz,
  email_verified boolean,
  order_count    integer,
  quote_count    integer,
  team_role      text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    u.email::text,
    coalesce(p.name, ''),
    coalesce(p.country, ''),
    p.phone,
    p.company,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at is not null,
    (select count(*)::int from public.orders o where o.user_id = u.id),
    (select count(*)::int from public.quotes q where q.user_id = u.id),
    r.role
  from auth.users u
  left join public.profiles   p on p.id = u.id
  left join public.user_roles r on r.user_id = u.id
  where public.is_admin()
  order by u.created_at desc;
$$;

revoke all on function public.admin_list_customers() from anon;


-- ---------------------------------------------------------------------------
-- inquiry_replies
-- ---------------------------------------------------------------------------
--
-- The team's answers, attached to exactly one quote or one order message.
-- Account holders read them in their dashboard; anyone else gets the same
-- words by email, which the admin panel drafts from here.

create table if not exists public.inquiry_replies (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quote_id   uuid references public.quotes on delete cascade,
  message_id uuid references public.order_messages on delete cascade,
  author_id  uuid references auth.users on delete set null default auth.uid(),
  body       text not null,

  constraint inquiry_replies_one_parent check (num_nonnulls(quote_id, message_id) = 1),
  constraint inquiry_replies_body_len   check (char_length(body) between 1 and 4000)
);

create index if not exists inquiry_replies_quote_idx   on public.inquiry_replies (quote_id);
create index if not exists inquiry_replies_message_idx on public.inquiry_replies (message_id);

alter table public.inquiry_replies enable row level security;

drop policy if exists "Admins can read replies" on public.inquiry_replies;
create policy "Admins can read replies"
  on public.inquiry_replies for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can reply" on public.inquiry_replies;
create policy "Admins can reply"
  on public.inquiry_replies for insert
  to authenticated
  with check (public.is_admin() and author_id = auth.uid());

drop policy if exists "Customers can read replies to them" on public.inquiry_replies;
create policy "Customers can read replies to them"
  on public.inquiry_replies for select
  to authenticated
  using (
    exists (select 1 from public.quotes q
             where q.id = inquiry_replies.quote_id and q.user_id = auth.uid())
    or
    exists (select 1 from public.order_messages m
             where m.id = inquiry_replies.message_id and m.user_id = auth.uid())
  );

-- Answering moves the thread along: a message becomes 'answered', a brand-new
-- quote becomes 'open'. A quote is only 'quoted' when someone says so.
create or replace function public.after_inquiry_reply()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.message_id is not null then
    update public.order_messages set status = 'answered'
     where id = new.message_id and status in ('new', 'open');
  end if;

  if new.quote_id is not null then
    update public.quotes set status = 'open'
     where id = new.quote_id and status = 'new';
  end if;

  return new;
end;
$$;

drop trigger if exists inquiry_replies_after on public.inquiry_replies;
create trigger inquiry_replies_after
  after insert on public.inquiry_replies
  for each row execute function public.after_inquiry_reply();

-- The admin view, with who wrote each reply.
create or replace function public.admin_inquiry_replies()
returns table (
  id          uuid,
  created_at  timestamptz,
  quote_id    uuid,
  message_id  uuid,
  body        text,
  author_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id, r.created_at, r.quote_id, r.message_id, r.body,
    coalesce(nullif(p.name, ''), u.email::text, 'Former team member')
  from public.inquiry_replies r
  left join public.profiles p on p.id = r.author_id
  left join auth.users     u on u.id = r.author_id
  where public.is_admin()
  order by r.created_at;
$$;

revoke all on function public.admin_inquiry_replies() from anon;


-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
--
-- A single row the public site reads at start-up: the contact details shown
-- in the header, footer and inquiry page, and an optional announcement bar.
-- Anything left blank falls back to src/config/site.ts.

create table if not exists public.site_settings (
  id                   integer primary key default 1,
  updated_at           timestamptz not null default now(),
  updated_by           uuid references auth.users on delete set null,
  contact_email        text not null default '',
  phone                text not null default '',
  -- Digits only, with the country code: used for tel: and WhatsApp links.
  phone_raw            text not null default '',
  address              text not null default '',
  announcement         text not null default '',
  announcement_enabled boolean not null default false,

  constraint site_settings_single      check (id = 1),
  constraint site_settings_email_len   check (char_length(contact_email) <= 200),
  constraint site_settings_phone_len   check (char_length(phone) <= 40),
  constraint site_settings_phone_raw   check (phone_raw ~ '^[0-9]{0,20}$'),
  constraint site_settings_address_len check (char_length(address) <= 300),
  constraint site_settings_banner_len  check (char_length(announcement) <= 240)
);

insert into public.site_settings (id, contact_email, phone, phone_raw, address)
values (1, 'neollcjp@gmail.com', '+81-80-9718-5080', '818097185080',
        'Neo LLC, Higashikomatsugawa 1-12-1, Edogawa, Tokyo')
on conflict (id) do nothing;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Managers can edit site settings" on public.site_settings;
create policy "Managers can edit site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());


-- ---------------------------------------------------------------------------
-- Data API grants
-- ---------------------------------------------------------------------------
--
-- Row-level security decides WHICH rows a role may touch, but a role first
-- needs permission on the table at all. Older Supabase projects granted that
-- to anon and authenticated automatically; this one doesn't, and without these
-- lines every request fails with "permission denied for table ...".
--
-- Each grant is only as wide as the policies above make use of, so the
-- policies stay the thing that decides what anyone actually sees. admin_invites
-- is left out on purpose: it is reached only through its functions.

grant usage on schema public to anon, authenticated;

grant select, update                 on public.profiles        to authenticated;
grant insert                         on public.quotes          to anon;
grant select, insert, update, delete on public.quotes          to authenticated;
grant select, insert, update, delete on public.order_messages  to authenticated;
grant select                         on public.user_roles      to authenticated;
grant select                         on public.vehicles        to anon;
grant select, insert, update, delete on public.vehicles        to authenticated;
grant select, insert, update, delete on public.orders          to authenticated;
grant select, insert, delete         on public.order_updates   to authenticated;
grant select, insert                 on public.inquiry_replies to authenticated;
grant select                         on public.site_settings   to anon;
grant select, update                 on public.site_settings   to authenticated;

-- New orders draw their number from this sequence.
grant usage on sequence public.order_number_seq to authenticated;

-- Functions are callable by default, but say so explicitly for the ones the
-- site relies on, in case that default is ever tightened too. Each re-checks
-- the caller's role inside.
grant execute on function public.is_admin()                  to anon, authenticated;
grant execute on function public.is_super_admin()            to anon, authenticated;
grant execute on function public.is_manager()                to anon, authenticated;
grant execute on function public.admin_invite_details(text)  to anon, authenticated;
grant execute on function public.admin_order_messages()      to authenticated;
grant execute on function public.create_admin_invite(text, text) to authenticated;
grant execute on function public.accept_admin_invite(text)   to authenticated;
grant execute on function public.list_admin_invites()        to authenticated;
grant execute on function public.revoke_admin_invite(uuid)   to authenticated;
grant execute on function public.list_admin_team()           to authenticated;
grant execute on function public.revoke_admin_role(uuid)     to authenticated;
grant execute on function public.set_admin_role(uuid, text)  to authenticated;
grant execute on function public.admin_create_order(uuid, text, text, integer, text, timestamptz, boolean) to authenticated;
grant execute on function public.admin_set_order_stage(text, text, text) to authenticated;
grant execute on function public.admin_list_orders()         to authenticated;
grant execute on function public.admin_list_customers()      to authenticated;
grant execute on function public.admin_inquiry_replies()     to authenticated;
