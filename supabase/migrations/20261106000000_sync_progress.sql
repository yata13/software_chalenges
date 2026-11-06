-- Tech Blueprint: sync progress between your devices.
-- One row per sync code. Only a SHA-256 hash of the code is stored.
-- Nobody can read or write the table directly: only through the two
-- functions below, and each one needs the private sync code.

create table if not exists public.sync_progress (
  key_hash   text primary key check (length(key_hash) = 64),
  data       jsonb not null,
  version    bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.sync_progress enable row level security;
-- No policies on purpose: direct table access is denied to anon/authenticated.
revoke all on table public.sync_progress from anon, authenticated;

-- Read the copy for a sync code (empty result if none).
create or replace function public.sync_pull(p_key text)
returns table (data jsonb, version bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select s.data, s.version
  from public.sync_progress s
  where length(p_key) between 32 and 128
    and s.key_hash = encode(sha256(convert_to(p_key, 'UTF8')), 'hex');
$$;

-- Save a copy. p_version = the version you pulled (0 = create new).
-- Returns the new version, or -1 if another device saved first
-- (then the app pulls again, merges, and retries).
create or replace function public.sync_push(p_key text, p_data jsonb, p_version bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  h text;
  v bigint;
begin
  if p_key is null or length(p_key) not between 32 and 128 then
    raise exception 'invalid sync code';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 262144 then
    raise exception 'invalid data';
  end if;
  h := encode(sha256(convert_to(p_key, 'UTF8')), 'hex');

  if p_version = 0 then
    -- Small single-user app: cap the number of sync codes to stop abuse.
    if (select count(*) from public.sync_progress) >= 20 then
      raise exception 'sync is full';
    end if;
    insert into public.sync_progress (key_hash, data) values (h, p_data)
    on conflict (key_hash) do nothing
    returning version into v;
    return coalesce(v, -1);
  end if;

  update public.sync_progress
     set data = p_data, version = version + 1, updated_at = now()
   where key_hash = h and version = p_version
  returning version into v;
  return coalesce(v, -1);
end;
$$;

revoke all on function public.sync_pull(text) from public;
revoke all on function public.sync_push(text, jsonb, bigint) from public;
grant execute on function public.sync_pull(text) to anon, authenticated;
grant execute on function public.sync_push(text, jsonb, bigint) to anon, authenticated;
