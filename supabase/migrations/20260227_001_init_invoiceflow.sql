-- InvoiceFlow baseline schema + security setup
-- Apply in Supabase SQL Editor or via Supabase CLI migrations.

begin;

create extension if not exists "pgcrypto";

-- ---------- Types ----------
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'invoice_status'
      and n.nspname = 'public'
  ) then
    create type public.invoice_status as enum ('draft', 'sent', 'open', 'overdue', 'paid');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'subscription_plan'
      and n.nspname = 'public'
  ) then
    create type public.subscription_plan as enum ('free', 'starter', 'professional', 'business');
  end if;
end $$;

-- ---------- Tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  company_name text,
  company_address text,
  company_city text,
  company_zip text,
  company_country text,
  company_tax_id text,
  logo_url text,
  plan public.subscription_plan not null default 'free',
  stripe_customer_id text unique,
  default_tax_rate numeric(5,2),
  default_payment_days integer,
  default_payment_terms integer,
  default_notes text,
  invoice_counter integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  company text,
  address text,
  city text,
  zip text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  invoice_number text not null,
  status public.invoice_status not null default 'draft',
  issue_date date not null,
  due_date date not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  tax_rate numeric(5,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'manual',
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_customers_user_id on public.customers(user_id);
create index if not exists idx_customers_user_email on public.customers(user_id, email);

create unique index if not exists idx_invoices_user_invoice_number
  on public.invoices(user_id, invoice_number);
create index if not exists idx_invoices_user_id on public.invoices(user_id);
create index if not exists idx_invoices_customer_id on public.invoices(customer_id);
create index if not exists idx_invoices_status_due_date on public.invoices(status, due_date);
create index if not exists idx_invoices_issue_date on public.invoices(issue_date);

create index if not exists idx_reminders_invoice_id on public.reminders(invoice_id);
create index if not exists idx_reminders_user_id on public.reminders(user_id);
create index if not exists idx_reminders_invoice_created_at
  on public.reminders(invoice_id, created_at desc);

-- ---------- Utility functions ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists trg_invoices_updated_at on public.invoices;
create trigger trg_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

-- increment_invoice_counter RPC used by invoice creation flow
create or replace function public.increment_invoice_counter(user_id_input uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_counter integer;
begin
  update public.profiles
    set invoice_counter = invoice_counter + 1
  where id = user_id_input
  returning invoice_counter into next_counter;

  if next_counter is null then
    insert into public.profiles (id, email, full_name, plan, invoice_counter)
    values (user_id_input, '', '', 'free', 2)
    on conflict (id) do update
      set invoice_counter = public.profiles.invoice_counter + 1
    returning invoice_counter into next_counter;
  end if;

  return next_counter;
end;
$$;

grant execute on function public.increment_invoice_counter(uuid) to authenticated;

-- ---------- Auth trigger: create profile on sign-up ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    plan,
    invoice_counter
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'free',
    1
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "customers_select_own" on public.customers;
create policy "customers_select_own"
on public.customers for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "customers_insert_own" on public.customers;
create policy "customers_insert_own"
on public.customers for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own"
on public.customers for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "customers_delete_own" on public.customers;
create policy "customers_delete_own"
on public.customers for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
on public.invoices for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
on public.invoices for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
on public.invoices for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own"
on public.invoices for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own"
on public.reminders for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own"
on public.reminders for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own"
on public.reminders for delete
to authenticated
using (user_id = auth.uid());

commit;
