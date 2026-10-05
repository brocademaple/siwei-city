-- Siwei City SQL storage schema.
-- Target: PostgreSQL-compatible databases.
-- This schema normalizes the current localStorage state into queryable tables
-- while keeping JSON snapshots for forward-compatible restore and migration.

create extension if not exists pgcrypto;

create table if not exists city_clients (
  id uuid primary key default gen_random_uuid(),
  local_client_id text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists city_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  local_client_id text references city_clients(local_client_id) on delete set null,
  title text not null,
  topic text not null,
  mode text not null check (mode in ('explore', 'decide', 'act')),
  status text not null default 'current' check (status in ('current', 'archived', 'deleted')),
  schema_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  deleted_at timestamptz
);

create index if not exists city_profiles_owner_status_idx
  on city_profiles(owner_id, status, updated_at desc);

create index if not exists city_profiles_local_client_status_idx
  on city_profiles(local_client_id, status, updated_at desc);

create table if not exists city_snapshots (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  snapshot_kind text not null check (snapshot_kind in ('current', 'manual_archive', 'auto_backup', 'migration')),
  payload jsonb not null,
  schema_version integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists city_snapshots_city_created_idx
  on city_snapshots(city_id, created_at desc);

create table if not exists idea_nodes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  client_key text not null,
  title text not null,
  body text not null,
  type text not null check (type in ('question', 'hypothesis', 'evidence', 'counter', 'action')),
  district_id text not null,
  author_role text not null check (author_role in ('实践者', '研究者', '怀疑者', '执行者', '我')),
  status text not null check (status in ('open', 'linked', 'resolved')),
  x numeric(6, 3) not null,
  y numeric(6, 3) not null,
  sprite integer not null default 0,
  label_side text check (label_side in ('left', 'right', 'top', 'bottom')),
  label_offset_x numeric(6, 3),
  label_offset_y numeric(6, 3),
  prominence text check (prominence in ('primary', 'normal', 'quiet')),
  source text check (source in ('本地模板', 'AI 生成', '用户手写')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, client_key)
);

create index if not exists idea_nodes_city_type_idx
  on idea_nodes(city_id, type, created_at);

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  client_key text not null,
  from_idea_client_key text not null,
  to_idea_client_key text not null,
  relation text not null check (relation in ('支持', '冲突', '依赖', '延伸', '回流')),
  created_at timestamptz not null default now(),
  unique (city_id, client_key),
  foreign key (city_id, from_idea_client_key) references idea_nodes(city_id, client_key) on delete cascade,
  foreign key (city_id, to_idea_client_key) references idea_nodes(city_id, client_key) on delete cascade
);

create index if not exists routes_city_from_idx
  on routes(city_id, from_idea_client_key);

create index if not exists routes_city_to_idx
  on routes(city_id, to_idea_client_key);

create table if not exists roundtable_turns (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  client_key text not null,
  mode text not null check (mode in ('explore', 'decide', 'act')),
  role text not null check (role in ('实践者', '研究者', '怀疑者', '执行者')),
  title text not null,
  body text not null,
  idea_type text not null check (idea_type in ('question', 'hypothesis', 'evidence', 'counter', 'action')),
  district_id text not null,
  relation text not null check (relation in ('支持', '冲突', '依赖', '延伸', '回流')),
  target_idea_client_key text,
  accepted boolean not null default false,
  source text check (source in ('本地模板', 'AI 生成', '用户手写')),
  responds_to text,
  protocol text check (protocol in ('intent', 'elenchus', 'topics', 'analogy', 'naming')),
  argument_move text check (argument_move in ('definition', 'question', 'evidence', 'counterexample', 'analogy', 'stakes', 'action', 'rhetoric')),
  protocol_reason text,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (city_id, client_key),
  foreign key (city_id, target_idea_client_key) references idea_nodes(city_id, client_key) on delete set null
);

create index if not exists roundtable_turns_city_accepted_idx
  on roundtable_turns(city_id, accepted, created_at);

create table if not exists review_findings (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  client_key text not null,
  severity text not null check (severity in ('high', 'medium', 'low')),
  title text not null,
  detail text not null,
  target_idea_client_keys text[] not null default '{}',
  repair_action text not null,
  suggested_role text not null check (suggested_role in ('实践者', '研究者', '怀疑者', '执行者')),
  gap_type text check (gap_type in ('definition', 'evidence', 'counter', 'action_condition', 'audience_fit', 'name_reality')),
  suggested_protocol text check (suggested_protocol in ('intent', 'elenchus', 'topics', 'analogy', 'naming')),
  suggested_move text check (suggested_move in ('definition', 'question', 'evidence', 'counterexample', 'analogy', 'stakes', 'action', 'rhetoric')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (city_id, client_key)
);

create index if not exists review_findings_city_severity_idx
  on review_findings(city_id, severity, created_at desc);

create table if not exists archive_docs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references city_profiles(id) on delete cascade,
  client_key text not null,
  title text not null,
  kind text not null check (kind in ('report', 'action', 'roundtable', 'repair', 'narrative', 'case', 'mechanism', 'trace')),
  body text not null,
  created_label text,
  created_at timestamptz not null default now(),
  unique (city_id, client_key)
);

create index if not exists archive_docs_city_kind_idx
  on archive_docs(city_id, kind, created_at desc);

create table if not exists city_sync_events (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references city_profiles(id) on delete cascade,
  local_client_id text references city_clients(local_client_id) on delete set null,
  idempotency_key text not null unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists city_sync_events_city_created_idx
  on city_sync_events(city_id, created_at desc);

create or replace function touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists city_profiles_touch_updated_at on city_profiles;
create trigger city_profiles_touch_updated_at
before update on city_profiles
for each row execute function touch_updated_at();

drop trigger if exists idea_nodes_touch_updated_at on idea_nodes;
create trigger idea_nodes_touch_updated_at
before update on idea_nodes
for each row execute function touch_updated_at();
