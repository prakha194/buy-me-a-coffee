-- Buy Me a Coffee — shared supporter wall, backed by Neon Postgres
-- Run this once in the Neon SQL Editor (your project -> SQL Editor), then enable
-- the Data API for the project and copy its endpoint URL into index.html.

create table if not exists public.supporters (
  id         bigint generated always as identity primary key,
  name       text        not null check (char_length(btrim(name)) between 1 and 40),
  amount     integer     not null check (amount > 0 and amount <= 100000),
  created_at timestamptz not null default now()
);

alter table public.supporters enable row level security;

-- The page talks to the database as Neon's "anonymous" role, so that role needs
-- exactly two things: read the wall, and add one row. No update, no delete.
grant usage on schema public to anonymous;
grant select, insert on public.supporters to anonymous;
grant usage, select on sequence public.supporters_id_seq to anonymous;

drop policy if exists "public can read supporters" on public.supporters;
create policy "public can read supporters"
  on public.supporters for select to anonymous using (true);

drop policy if exists "public can add a supporter" on public.supporters;
create policy "public can add a supporter"
  on public.supporters for insert to anonymous
  with check (
    char_length(btrim(name)) between 1 and 40
    and amount > 0
    and amount <= 100000
  );

create index if not exists supporters_created_at_idx
  on public.supporters (created_at desc);
