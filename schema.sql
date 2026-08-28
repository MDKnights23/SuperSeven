create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null references public.users(email) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_hash_idx on public.sessions(token_hash);
create index if not exists sessions_expires_at_idx on public.sessions(expires_at);

alter table public.users enable row level security;
alter table public.sessions enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.sessions from anon, authenticated;
