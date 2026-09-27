create table public.study_session_migration_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  migration_id uuid not null,
  imported_at timestamp with time zone not null default now(),
  primary key (user_id, migration_id)
);

alter table public.study_session_migration_receipts enable row level security;

create policy study_session_migration_receipts_select_own
  on public.study_session_migration_receipts
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy study_session_migration_receipts_insert_own
  on public.study_session_migration_receipts
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.study_session_migration_receipts from public, anon, authenticated;
grant select, insert on table public.study_session_migration_receipts to authenticated;

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

  insert into public.study_session_migration_receipts (user_id, migration_id)
  values (v_authenticated_user_id, p_migration_id)
  on conflict (user_id, migration_id) do nothing
  returning user_id into v_claimed_user_id;

  if v_claimed_user_id is null then
    return 0;
  end if;

  insert into public.study_sessions (
    user_id,
    subject_name,
    timer_mode,
    duration_seconds,
    completed,
    completed_at
  )
  select
    v_authenticated_user_id,
    btrim(item.value ->> 'subjectName'),
    item.value ->> 'timerMode',
    (item.value ->> 'durationSeconds')::integer,
    (item.value ->> 'completed')::boolean,
    (item.value ->> 'completedAt')::timestamp with time zone
  from jsonb_array_elements(p_sessions) as item(value);

  get diagnostics v_imported_count = row_count;
  return v_imported_count;
end;
$function$;

revoke all on function public.import_legacy_study_sessions(uuid, uuid, jsonb) from public, anon;
grant execute on function public.import_legacy_study_sessions(uuid, uuid, jsonb) to authenticated;

create or replace function public.replace_user_subjects(
  p_user_id uuid,
  p_previous_subjects jsonb,
  p_next_subjects jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_previous_names text[];
  v_next_names text[];
  v_removed_names text[] := array[]::text[];
  v_added_names text[] := array[]::text[];
  v_renamed_old_names text[] := array[]::text[];
  v_renamed_new_names text[] := array[]::text[];
  v_name text;
  v_index integer;
  v_updated_count integer;
  v_result jsonb;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested subject owner does not match the signed-in user.';
  end if;

  if jsonb_typeof(p_previous_subjects) is distinct from 'array'
    or jsonb_typeof(p_next_subjects) is distinct from 'array'
  then
    raise exception using errcode = '22023', message = 'Subject lists must be supplied as arrays.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_previous_subjects) as item(value)
    where jsonb_typeof(item.value) is distinct from 'string'
      or char_length(btrim(item.value #>> '{}')) not between 1 and 60
  ) or exists (
    select 1
    from jsonb_array_elements(p_next_subjects) as item(value)
    where jsonb_typeof(item.value) is distinct from 'string'
      or char_length(btrim(item.value #>> '{}')) not between 1 and 60
  ) then
    raise exception using errcode = '22023', message = 'Subject names must contain 1 to 60 characters.';
  end if;

  if exists (
    select 1
    from (
      select lower(btrim(item.value #>> '{}')) as normalized_name
      from jsonb_array_elements(p_previous_subjects) as item(value)
    ) as previous_names
    group by normalized_name
    having count(*) > 1
  ) or exists (
    select 1
    from (
      select lower(btrim(item.value #>> '{}')) as normalized_name
      from jsonb_array_elements(p_next_subjects) as item(value)
    ) as next_names
    group by normalized_name
    having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'Subject names must be unique.';
  end if;

  select coalesce(array_agg(btrim(item.value) order by item.ordinality), array[]::text[])
  into v_previous_names
  from jsonb_array_elements_text(p_previous_subjects) with ordinality as item(value, ordinality);

  select coalesce(array_agg(btrim(item.value) order by item.ordinality), array[]::text[])
  into v_next_names
  from jsonb_array_elements_text(p_next_subjects) with ordinality as item(value, ordinality);

  select coalesce(array_agg(previous_name), array[]::text[])
  into v_removed_names
  from unnest(v_previous_names) as previous(previous_name)
  where not (previous_name = any(v_next_names));

  select coalesce(array_agg(next_name), array[]::text[])
  into v_added_names
  from unnest(v_next_names) as next_item(next_name)
  where not (next_name = any(v_previous_names));

  for v_index in 1..least(
    coalesce(array_length(v_previous_names, 1), 0),
    coalesce(array_length(v_next_names, 1), 0)
  ) loop
    if v_previous_names[v_index] <> v_next_names[v_index]
      and v_previous_names[v_index] = any(v_removed_names)
      and v_next_names[v_index] = any(v_added_names)
    then
      update public.subjects as existing_subject
      set name = v_next_names[v_index],
          updated_at = now()
      where existing_subject.user_id = v_authenticated_user_id
        and existing_subject.name = v_previous_names[v_index]
        and not exists (
          select 1
          from public.subjects as target_subject
          where target_subject.user_id = v_authenticated_user_id
            and lower(target_subject.name) = lower(v_next_names[v_index])
            and target_subject.name <> v_previous_names[v_index]
        );

      get diagnostics v_updated_count = row_count;
      if v_updated_count > 0 then
        v_renamed_old_names := array_append(v_renamed_old_names, v_previous_names[v_index]);
        v_renamed_new_names := array_append(v_renamed_new_names, v_next_names[v_index]);
      end if;
    end if;
  end loop;

  foreach v_name in array v_added_names loop
    if v_name <> all(v_renamed_new_names)
      and not exists (
        select 1
        from public.subjects as existing_subject
        where existing_subject.user_id = v_authenticated_user_id
          and lower(existing_subject.name) = lower(v_name)
      )
    then
      insert into public.subjects (user_id, name)
      values (v_authenticated_user_id, v_name)
      on conflict do nothing;
    end if;
  end loop;

  foreach v_name in array v_removed_names loop
    if v_name <> all(v_renamed_old_names) then
      delete from public.subjects as existing_subject
      where existing_subject.user_id = v_authenticated_user_id
        and existing_subject.name = v_name;
    end if;
  end loop;

  select coalesce(jsonb_agg(subject.name order by subject.created_at, subject.id), '[]'::jsonb)
  into v_result
  from public.subjects as subject
  where subject.user_id = v_authenticated_user_id;

  return v_result;
end;
$function$;

revoke all on function public.replace_user_subjects(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.replace_user_subjects(uuid, jsonb, jsonb) to authenticated;
