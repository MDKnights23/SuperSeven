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

create table if not exists public.standings_users (
  email text primary key references public.users(email) on delete cascade,
  display_name text not null,
  picks jsonb not null default '[]'::jsonb,
  super_locks jsonb not null default '{}'::jsonb,
  joined_contests jsonb not null default '[]'::jsonb,
  paid boolean not null default false,
  avatar_initial text not null default 'P',
  avatar_color text not null default '#7c3aed',
  avatar_text_color text not null default '#ffffff',
  updated_at timestamptz not null default now()
);

create table if not exists public.user_entries (
  id uuid primary key default gen_random_uuid(),
  owner_email text not null references public.users(email) on delete cascade,
  display_name text not null,
  picks jsonb not null default '[]'::jsonb,
  super_locks jsonb not null default '{}'::jsonb,
  joined_contests jsonb not null default '[]'::jsonb,
  paid boolean not null default false,
  avatar_initial text not null default 'P',
  avatar_color text not null default '#7c3aed',
  avatar_text_color text not null default '#ffffff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_email, display_name)
);

create table if not exists public.smack_talk_posts (
  id uuid primary key default gen_random_uuid(),
  author_email text not null references public.users(email) on delete cascade,
  author_display_name text not null,
  message text not null check (char_length(message) between 1 and 500),
  gif_url text,
  parent_post_id uuid references public.smack_talk_posts(id) on delete cascade,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

-- Smack Talk cooldown and deletion permissions are enforced in the Node API layer.

alter table public.smack_talk_posts
  add column if not exists gif_url text;

alter table public.smack_talk_posts
  add column if not exists parent_post_id uuid references public.smack_talk_posts(id) on delete cascade;

alter table public.smack_talk_posts
  add column if not exists edited_at timestamptz;

alter table public.smack_talk_posts
  drop constraint if exists smack_talk_posts_parent_not_self_check;

alter table public.smack_talk_posts
  add constraint smack_talk_posts_parent_not_self_check
  check (parent_post_id is null or parent_post_id <> id);

alter table public.smack_talk_posts
  drop constraint if exists smack_talk_posts_gif_url_check;

alter table public.smack_talk_posts
  add constraint smack_talk_posts_gif_url_check
  check (
    gif_url is null
    or (
      char_length(gif_url) <= 1000
      and gif_url ~* '^https?://'
      and (gif_url ~* '\\.gif($|[?])' or gif_url ~* 'giphy|tenor')
    )
  );

alter table public.standings_users
  add column if not exists joined_contests jsonb not null default '[]'::jsonb;

alter table public.standings_users
  add column if not exists avatar_initial text not null default 'P';

alter table public.standings_users
  add column if not exists avatar_color text not null default '#7c3aed';

alter table public.standings_users
  add column if not exists avatar_text_color text not null default '#ffffff';

create index if not exists sessions_token_hash_idx on public.sessions(token_hash);
create index if not exists sessions_expires_at_idx on public.sessions(expires_at);
create index if not exists standings_users_updated_at_idx on public.standings_users(updated_at desc);
create index if not exists user_entries_owner_email_idx on public.user_entries(owner_email);
create index if not exists user_entries_updated_at_idx on public.user_entries(updated_at desc);
create index if not exists smack_talk_posts_created_at_idx on public.smack_talk_posts(created_at desc);
create index if not exists smack_talk_posts_parent_post_id_idx on public.smack_talk_posts(parent_post_id);

create or replace function public.enforce_user_entry_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.user_entries
    where owner_email = new.owner_email
      and (new.id is null or id <> new.id)
  ) >= 3 then
    raise exception 'Each email address may have at most 3 entries.';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_entries_limit on public.user_entries;
create trigger trg_user_entries_limit
before insert or update on public.user_entries
for each row
execute function public.enforce_user_entry_limit();

alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.standings_users enable row level security;
alter table public.user_entries enable row level security;
alter table public.smack_talk_posts enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.sessions from anon, authenticated;
revoke all on public.standings_users from anon, authenticated;
revoke all on public.user_entries from anon, authenticated;
revoke all on public.smack_talk_posts from anon, authenticated;
