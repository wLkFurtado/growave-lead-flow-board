
  -- 1) Tabela de histórico de mudanças de status
create table if not exists public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  status_anterior text,
  status_novo text,
  valor_venda_anterior numeric,
  valor_venda_novo numeric,
  data_fechamento date,
  observacoes text,
  changed_by uuid not null references public.profiles(id) on delete restrict,
  changed_at timestamptz not null default now()
);

-- Índices úteis
create index if not exists lead_status_history_contact_id_idx on public.lead_status_history(contact_id);
create index if not exists lead_status_history_changed_at_idx on public.lead_status_history(changed_at);

-- Ativar RLS
alter table public.lead_status_history enable row level security;

-- 2) Função para checar acesso do usuário ao contato (reusa as regras atuais por cliente)
create or replace function public.can_access_contact(_contact_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.whatsapp_anuncio w
    where w.contact_id = _contact_id
      and (
        public.is_admin(auth.uid())
        or w.cliente_nome in (select public.get_user_clients(auth.uid()))
      )
  );
$$;

-- 3) Policies na tabela de histórico
-- Visualizar histórico de contatos que o usuário pode acessar
create policy if not exists "Users can view history for accessible contacts"
  on public.lead_status_history
  for select
  using (public.can_access_contact(contact_id));

-- Inserir histórico somente para contatos acessíveis e carimbando o próprio usuário
create policy if not exists "Users can insert history for accessible contacts"
  on public.lead_status_history
  for insert
  with check (public.can_access_contact(contact_id) and changed_by = auth.uid());

-- (Sem UPDATE/DELETE para manter o histórico imutável)

-- 4) Permitir UPDATE em whatsapp_anuncio (ex.: status/valor_venda) para usuários com acesso
create policy if not exists "Users can update accessible leads (status/sale)"
  on public.whatsapp_anuncio
  for update
  using (public.can_access_contact(contact_id))
  with check (public.can_access_contact(contact_id));

-- 5) Trigger para registrar mudanças automaticamente no histórico
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if coalesce(old.status,'') is distinct from coalesce(new.status,'')
     or coalesce(old.valor_venda, -1) is distinct from coalesce(new.valor_venda, -1) then
    insert into public.lead_status_history (
      contact_id,
      status_anterior,
      status_novo,
      valor_venda_anterior,
      valor_venda_novo,
      changed_by,
      changed_at
    )
    values (
      coalesce(new.contact_id, old.contact_id),
      old.status,
      new.status,
      old.valor_venda,
      new.valor_venda,
      auth.uid(),
      now()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_lead_status_change on public.whatsapp_anuncio;
create trigger trg_log_lead_status_change
after update of status, valor_venda on public.whatsapp_anuncio
for each row execute function public.log_lead_status_change();
  