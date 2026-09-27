alter table public.study_session_migration_receipts
  add column payload_hash text not null default 'legacy';

alter table public.study_session_migration_receipts
  drop constraint if exists study_session_migration_receipts_pkey;

alter table public.study_session_migration_receipts
  add constraint study_session_migration_receipts_pkey
  primary key (user_id, migration_id, payload_hash);

create or replace function public.import_legacy_study_sessions(
  p_user_id uuid,
  p_migration_id uuid,
  p_sessions jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_claimed_user_id uuid;
  v_imported_count integer := 0;
  v_snapshot_hash text;
  v_legacy_imported_at timestamp with time zone;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested study-session owner does not match the signed-in user.';
  end if;

  if p_migration_id is null then
    raise exception using errcode = '22023', message = 'A migration identifier is required.';
  end if;

  if jsonb_typeof(p_sessions) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Legacy study sessions must be supplied as an array.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_sessions) as item(value)
    where jsonb_typeof(item.value) is distinct from 'object'
      or jsonb_typeof(item.value -> 'legacyId') is distinct from 'string'
      or char_length(btrim(item.value ->> 'legacyId')) not between 1 and 256
      or jsonb_typeof(item.value -> 'subjectName') is distinct from 'string'
      or char_length(btrim(item.value ->> 'subjectName')) not between 1 and 60
      or jsonb_typeof(item.value -> 'durationSeconds') is distinct from 'number'
      or case
        when (item.value ->> 'durationSeconds') ~ '^[0-9]{1,10}$'
          then (item.value ->> 'durationSeconds')::numeric > 2147483647
        else true
      end
      or jsonb_typeof(item.value -> 'completed') is distinct from 'boolean'
      or item.value ->> 'timerMode' not in ('countdown', 'stopwatch')
      or jsonb_typeof(item.value -> 'completedAt') is distinct from 'string'
      or btrim(item.value ->> 'completedAt') = ''
  ) then
    raise exception using errcode = '22023', message = 'A legacy study session has invalid fields.';
  end if;

  v_snapshot_hash := md5(p_sessions::text);

  -- Rows written by the original one-receipt import share its transaction
  -- timestamp with the receipt. Match those rows once when adopting snapshots.
  select receipt.imported_at
  into v_legacy_imported_at
  from public.study_session_migration_receipts as receipt
  where receipt.user_id = v_authenticated_user_id
    and receipt.migration_id = p_migration_id
    and receipt.payload_hash = 'legacy';

  insert into public.study_session_migration_receipts (user_id, migration_id, payload_hash)
  values (v_authenticated_user_id, p_migration_id, v_snapshot_hash)
  on conflict (user_id, migration_id, payload_hash) do nothing
  returning user_id into v_claimed_user_id;

  if v_claimed_user_id is null then
    return 0;
  end if;

  with input_sessions as (
    select
      item.ordinality,
      btrim(item.value ->> 'subjectName') as subject_name,
      item.value ->> 'timerMode' as timer_mode,
      (item.value ->> 'durationSeconds')::integer as duration_seconds,
      (item.value ->> 'completed')::boolean as completed,
      (item.value ->> 'completedAt')::timestamp with time zone as completed_at,
      md5(
        v_authenticated_user_id::text
        || ':' || p_migration_id::text
        || ':' || (item.value ->> 'legacyId')
      ) as row_identity_hash
    from jsonb_array_elements(p_sessions) with ordinality as item(value, ordinality)
  ),
  normalized_sessions as (
    select
      input.ordinality,
      (
        substr(input.row_identity_hash, 1, 8) || '-'
        || substr(input.row_identity_hash, 9, 4) || '-4'
        || substr(input.row_identity_hash, 14, 3) || '-a'
        || substr(input.row_identity_hash, 18, 3) || '-'
        || substr(input.row_identity_hash, 21, 12)
      )::uuid as id,
      input.subject_name,
      input.timer_mode,
      input.duration_seconds,
      input.completed,
      input.completed_at,
      row_number() over (
        partition by
          input.subject_name,
          input.timer_mode,
          input.duration_seconds,
          input.completed,
          input.completed_at
        order by input.ordinality
      ) as duplicate_ordinal
    from input_sessions as input
  ),
  previous_import_counts as (
    select
      existing.subject_name,
      existing.timer_mode,
      existing.duration_seconds,
      existing.completed,
      existing.completed_at,
      count(*) as imported_count
    from public.study_sessions as existing
    where v_legacy_imported_at is not null
      and existing.user_id = v_authenticated_user_id
      and existing.created_at = v_legacy_imported_at
    group by
      existing.subject_name,
      existing.timer_mode,
      existing.duration_seconds,
      existing.completed,
      existing.completed_at
  )
  insert into public.study_sessions (
    id,
    user_id,
    subject_id,
    subject_name,
    timer_mode,
    duration_seconds,
    completed,
    completed_at
  )
  select
    current_snapshot.id,
    v_authenticated_user_id,
    null,
    current_snapshot.subject_name,
    current_snapshot.timer_mode,
    current_snapshot.duration_seconds,
    current_snapshot.completed,
    current_snapshot.completed_at
  from normalized_sessions as current_snapshot
  left join previous_import_counts as previous_snapshot
    on previous_snapshot.subject_name = current_snapshot.subject_name
    and previous_snapshot.timer_mode = current_snapshot.timer_mode
    and previous_snapshot.duration_seconds = current_snapshot.duration_seconds
    and previous_snapshot.completed = current_snapshot.completed
    and previous_snapshot.completed_at = current_snapshot.completed_at
  where current_snapshot.duplicate_ordinal > coalesce(previous_snapshot.imported_count, 0)
  on conflict (id) do update
  set subject_id = excluded.subject_id,
      subject_name = excluded.subject_name,
      timer_mode = excluded.timer_mode,
      duration_seconds = excluded.duration_seconds,
      completed = excluded.completed,
      completed_at = excluded.completed_at
  where public.study_sessions.user_id = v_authenticated_user_id;

  get diagnostics v_imported_count = row_count;
  return v_imported_count;
end;
$function$;

revoke all on function public.import_legacy_study_sessions(uuid, uuid, jsonb) from public, anon;
grant execute on function public.import_legacy_study_sessions(uuid, uuid, jsonb) to authenticated;
