create table if not exists profiles (
  id text primary key,
  user_id text not null,
  type text not null,
  title text,
  bio text,
  company text,
  role text,
  location text,
  links jsonb default '[]'::jsonb,
  ctas jsonb default '[]'::jsonb,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists cards (
  id text primary key,
  user_id text not null,
  slug text unique not null,
  label text,
  created_at timestamp with time zone default now()
);

create table if not exists taps (
  id text primary key,
  card_id text not null,
  profile_id text not null,
  source text,
  event text,
  location text,
  user_agent text,
  ip text,
  created_at timestamp with time zone default now()
);

create table if not exists leads (
  id text primary key,
  profile_id text not null,
  name text not null,
  email text not null,
  company text,
  role text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists consents (
  id text primary key,
  lead_id text not null,
  scope text not null,
  text text not null,
  ip text,
  created_at timestamp with time zone default now()
);

create table if not exists followups (
  id text primary key,
  lead_id text not null,
  status text not null,
  channel text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists idx_cards_slug on cards (slug);
create index if not exists idx_profiles_user on profiles (user_id);
create index if not exists idx_taps_card on taps (card_id);
create index if not exists idx_leads_profile on leads (profile_id);
