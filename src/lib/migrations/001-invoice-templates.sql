-- 001-invoice-templates.sql
-- Run this in Supabase SQL Editor

create table if not exists public.invoice_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Meine Vorlage',
  is_default boolean not null default false,
  config jsonb not null default '{
    "colors": {"primary": "#1B3A6B", "secondary": "#6B7A90", "accent": "#2563eb"},
    "font": "Helvetica",
    "logoUrl": null,
    "layout": "classic",
    "showTaxId": true,
    "showPaymentInfo": true,
    "footerText": "Vielen Dank für Ihr Vertrauen!",
    "headerStyle": "split"
  }'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS policies
alter table public.invoice_templates enable row level security;

create policy "Users can view own templates"
  on public.invoice_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.invoice_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.invoice_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.invoice_templates for delete
  using (auth.uid() = user_id);

-- Ensure only one default per user
create or replace function public.ensure_single_default_template()
returns trigger as $$
begin
  if NEW.is_default = true then
    update public.invoice_templates
    set is_default = false
    where user_id = NEW.user_id and id != NEW.id and is_default = true;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger trg_single_default_template
  before insert or update on public.invoice_templates
  for each row execute function public.ensure_single_default_template();

-- Add template_id column to invoices table
alter table public.invoices add column if not exists template_id uuid references public.invoice_templates(id) on delete set null;
