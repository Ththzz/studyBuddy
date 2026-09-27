alter table public.study_sets
  add column if not exists idempotency_key uuid;

create unique index if not exists study_sets_user_id_idempotency_key_key
  on public.study_sets (user_id, idempotency_key)
  where idempotency_key is not null;

create or replace function public.save_study_set_idempotent(
  p_user_id uuid,
  p_study_set jsonb,
  p_idempotency_key uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_study_set_id uuid;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested study-set owner does not match the signed-in user.';
  end if;

  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'An idempotency key is required.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_authenticated_user_id::text || ':' || p_idempotency_key::text, 0)
  );

  select id
  into v_study_set_id
  from public.study_sets
  where user_id = v_authenticated_user_id
    and idempotency_key = p_idempotency_key;

  if found then
    return v_study_set_id;
  end if;

  v_study_set_id := public.save_study_set(p_user_id, p_study_set);

  update public.study_sets
  set idempotency_key = p_idempotency_key
  where id = v_study_set_id
    and user_id = v_authenticated_user_id;

  return v_study_set_id;
end;
$function$;

revoke all on function public.save_study_set_idempotent(uuid, jsonb, uuid) from public, anon;
grant execute on function public.save_study_set_idempotent(uuid, jsonb, uuid) to authenticated;
