create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  city text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  location text not null default '',
  years_together integer not null default 0 check (years_together >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create table if not exists public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  expires_at timestamptz,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.experience_status (
  couple_id uuid not null references public.couples(id) on delete cascade,
  experience_id integer not null,
  saved boolean not null default false,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (couple_id, experience_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null,
  description text not null default '',
  progress integer not null default 0 check (progress >= 0),
  total integer not null default 1 check (total > 0),
  accent text not null default 'coral',
  next_step text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  label text not null,
  points integer not null default 0 check (points >= 0),
  visible_to_friends boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.friendships (
  requester_couple_id uuid not null references public.couples(id) on delete cascade,
  addressee_couple_id uuid not null references public.couples(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  primary key (requester_couple_id, addressee_couple_id),
  check (requester_couple_id <> addressee_couple_id)
);

create index if not exists couple_members_user_idx on public.couple_members(user_id);
create index if not exists activities_couple_created_idx on public.activities(couple_id, created_at desc);
create index if not exists goals_couple_idx on public.goals(couple_id);

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.couple_members
    where couple_id = target_couple_id and user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.experience_status enable row level security;
alter table public.goals enable row level security;
alter table public.activities enable row level security;
alter table public.friendships enable row level security;

create policy "profiles are visible to their owner" on public.profiles for select using (id = auth.uid());
create policy "profiles are editable by their owner" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles can be inserted by their owner" on public.profiles for insert with check (id = auth.uid());

create policy "members can read their couple" on public.couples for select using (public.is_couple_member(id));
create policy "authenticated users can create couples" on public.couples for insert with check (created_by = auth.uid());
create policy "members can update their couple" on public.couples for update using (public.is_couple_member(id));

create policy "members can read membership" on public.couple_members for select using (user_id = auth.uid() or public.is_couple_member(couple_id));
create policy "users can join a couple" on public.couple_members for insert with check (user_id = auth.uid());
create policy "users can leave a couple" on public.couple_members for delete using (user_id = auth.uid());

create policy "couple members can read invites" on public.couple_invites for select using (invited_by = auth.uid() or public.is_couple_member(couple_id));
create policy "members can create invites" on public.couple_invites for insert with check (invited_by = auth.uid() and public.is_couple_member(couple_id));

create policy "members can read experience status" on public.experience_status for select using (public.is_couple_member(couple_id));
create policy "members can write experience status" on public.experience_status for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

create policy "members can read goals" on public.goals for select using (public.is_couple_member(couple_id));
create policy "members can write goals" on public.goals for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

create policy "members can read visible activities" on public.activities for select using (public.is_couple_member(couple_id) or visible_to_friends = true);
create policy "members can create activities" on public.activities for insert with check (actor_id = auth.uid() and public.is_couple_member(couple_id));

create policy "couples can read friendships" on public.friendships for select using (public.is_couple_member(requester_couple_id) or public.is_couple_member(addressee_couple_id));
create policy "couples can create friendships" on public.friendships for insert with check (public.is_couple_member(requester_couple_id));
create policy "couples can update friendships" on public.friendships for update using (public.is_couple_member(requester_couple_id) or public.is_couple_member(addressee_couple_id));
