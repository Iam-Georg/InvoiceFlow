-- Add role column to profiles for server-side admin verification
alter table public.profiles
  add column if not exists role text not null default 'user';

-- Set the existing admin user
update public.profiles
  set role = 'admin'
  where id = '1f6663f2-b15c-48ad-bd30-60b434ecfba3';
