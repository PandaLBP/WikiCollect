-- WikiCollect : sauvegarde cloud privée par compte
create table if not exists public.wc_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wc_user_data enable row level security;

create policy "wc_user_data_select_own"
on public.wc_user_data for select
to authenticated
using (auth.uid() = user_id);

create policy "wc_user_data_insert_own"
on public.wc_user_data for insert
to authenticated
with check (auth.uid() = user_id);

create policy "wc_user_data_update_own"
on public.wc_user_data for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "wc_user_data_delete_own"
on public.wc_user_data for delete
to authenticated
using (auth.uid() = user_id);
