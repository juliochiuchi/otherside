-- ============================================================================
-- iBusquei — gerenciador de listas de compras (offline-first)
-- Execute este arquivo manualmente no SQL Editor do Supabase.
--
-- ATENÇÃO: o app usa o recurso SEM autenticação (dados globais). Por isso as
-- políticas de RLS abaixo liberam acesso aos papéis `anon` e `authenticated`.
-- Qualquer pessoa que tenha a chave pública pode ler e escrever. Adequado
-- apenas para uso pessoal/interno. Para isolar por usuário, adicione uma coluna
-- user_id e troque as políticas por `auth.uid() = user_id`.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

-- Listas de compras (reutilizáveis entre rodadas).
create table if not exists public.ibusquei_lists (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Setores de cada lista (ex.: Hortifruti, Carnes, Limpeza...).
create table if not exists public.ibusquei_sectors (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.ibusquei_lists (id) on delete cascade,
  name       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ibusquei_sectors_list_id_idx on public.ibusquei_sectors (list_id);

-- Rodadas: cada ida ao mercado com a mesma lista.
create table if not exists public.ibusquei_rounds (
  id           uuid primary key default gen_random_uuid(),
  list_id      uuid not null references public.ibusquei_lists (id) on delete cascade,
  status       text not null default 'active' check (status in ('active', 'completed')),
  started_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists ibusquei_rounds_list_id_idx on public.ibusquei_rounds (list_id);

-- Itens da lista. `is_checked` representa o estado da rodada ativa.
create table if not exists public.ibusquei_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.ibusquei_lists (id) on delete cascade,
  sector_id  uuid references public.ibusquei_sectors (id) on delete set null,
  name       text not null,
  quantity   numeric(10, 2) not null default 1,
  unit       text not null default 'un',
  is_checked boolean not null default false,
  checked_at timestamptz,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ibusquei_items_list_id_idx on public.ibusquei_items (list_id);
create index if not exists ibusquei_items_sector_id_idx on public.ibusquei_items (sector_id);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.ibusquei_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ibusquei_lists_set_updated_at on public.ibusquei_lists;
create trigger ibusquei_lists_set_updated_at
  before update on public.ibusquei_lists
  for each row execute function public.ibusquei_set_updated_at();

drop trigger if exists ibusquei_items_set_updated_at on public.ibusquei_items;
create trigger ibusquei_items_set_updated_at
  before update on public.ibusquei_items
  for each row execute function public.ibusquei_set_updated_at();

-- ---------------------------------------------------------------------------
-- Finalizar rodada (atômico)
-- Conclui a rodada ativa, desmarca os itens e abre uma nova rodada com o id
-- informado pelo cliente (mantém os ids consistentes com o cache offline).
-- ---------------------------------------------------------------------------
create or replace function public.ibusquei_finish_round(p_list uuid, p_new_round uuid)
returns uuid
language plpgsql
as $$
begin
  update public.ibusquei_rounds
     set status = 'completed', completed_at = now()
   where list_id = p_list and status = 'active';

  update public.ibusquei_items
     set is_checked = false, checked_at = null
   where list_id = p_list;

  insert into public.ibusquei_rounds (id, list_id, status)
  values (p_new_round, p_list, 'active');

  return p_new_round;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.ibusquei_lists   enable row level security;
alter table public.ibusquei_sectors enable row level security;
alter table public.ibusquei_rounds  enable row level security;
alter table public.ibusquei_items   enable row level security;

drop policy if exists ibusquei_lists_all on public.ibusquei_lists;
create policy ibusquei_lists_all on public.ibusquei_lists
  for all to anon, authenticated using (true) with check (true);

drop policy if exists ibusquei_sectors_all on public.ibusquei_sectors;
create policy ibusquei_sectors_all on public.ibusquei_sectors
  for all to anon, authenticated using (true) with check (true);

drop policy if exists ibusquei_rounds_all on public.ibusquei_rounds;
create policy ibusquei_rounds_all on public.ibusquei_rounds
  for all to anon, authenticated using (true) with check (true);

drop policy if exists ibusquei_items_all on public.ibusquei_items;
create policy ibusquei_items_all on public.ibusquei_items
  for all to anon, authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Permissões (garante acesso via chave pública)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.ibusquei_lists   to anon, authenticated;
grant select, insert, update, delete on public.ibusquei_sectors to anon, authenticated;
grant select, insert, update, delete on public.ibusquei_rounds  to anon, authenticated;
grant select, insert, update, delete on public.ibusquei_items   to anon, authenticated;
grant execute on function public.ibusquei_finish_round(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (opcional) — permite sincronizar mudanças entre dispositivos abertos.
-- Bloco idempotente: pode ser executado mais de uma vez sem erro.
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'public.ibusquei_lists',
    'public.ibusquei_sectors',
    'public.ibusquei_rounds',
    'public.ibusquei_items'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table %s', tbl);
    exception
      when duplicate_object then null;  -- já é membro da publicação
      when undefined_object then null;  -- publicação supabase_realtime inexistente
    end;
  end loop;
end $$;
