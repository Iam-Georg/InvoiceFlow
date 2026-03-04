-- 002-recurring-schedules.sql
-- Run this in Supabase SQL Editor

create table if not exists public.recurring_schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  template_invoice_id uuid references public.invoices(id) on delete set null,
  interval text not null check (interval in ('monthly', 'quarterly', 'yearly')),
  next_run_date date not null,
  active boolean not null default true,
  created_at timestamptz default now() not null
);

alter table public.recurring_schedules enable row level security;

create policy "Users can view own schedules"
  on public.recurring_schedules for select
  using (auth.uid() = user_id);

create policy "Users can insert own schedules"
  on public.recurring_schedules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own schedules"
  on public.recurring_schedules for update
  using (auth.uid() = user_id);

create policy "Users can delete own schedules"
  on public.recurring_schedules for delete
  using (auth.uid() = user_id);
