-- Stores submitted album sessions (client + event + drive folder link)
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  event_name text not null,
  folder_link text not null,
  folder_id text not null,
  photo_count integer default 0,
  selections text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.albums enable row level security;

create policy "insert_albums" on public.albums for insert
  to anon with check (true);

create policy "select_albums" on public.albums for select
  to anon using (true);

create index if not exists albums_created_at_idx on public.albums (created_at desc);
