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
