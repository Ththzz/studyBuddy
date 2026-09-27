create or replace function public.save_study_set(
  p_user_id uuid,
  p_study_set jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_subject_id uuid;
  v_source_file_name text;
  v_set_type text;
  v_difficulty text;
  v_requested_count smallint;
  v_title text;
  v_content jsonb;
  v_study_set_id uuid;
  v_question_id uuid;
  v_position smallint;
  v_item jsonb;
  v_row record;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested study-set owner does not match the signed-in user.';
  end if;

  if pg_catalog.jsonb_typeof(p_study_set) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'Study-set data must be supplied as an object.';
  end if;

  if pg_catalog.jsonb_typeof(p_study_set -> 'set_type') is distinct from 'string' then
    raise exception using errcode = '22023', message = 'A study-set type is required.';
  end if;
  v_set_type := p_study_set ->> 'set_type';
  if v_set_type not in ('multiple_choice', 'flashcards', 'qa') then
    raise exception using errcode = '22023', message = 'The study-set type is invalid.';
  end if;

  if pg_catalog.jsonb_typeof(p_study_set -> 'difficulty') is distinct from 'string' then
    raise exception using errcode = '22023', message = 'A study-set difficulty is required.';
  end if;
  v_difficulty := p_study_set ->> 'difficulty';
  if v_difficulty not in ('Easy', 'Medium', 'Hard') then
    raise exception using errcode = '22023', message = 'The study-set difficulty is invalid.';
  end if;

  if pg_catalog.jsonb_typeof(p_study_set -> 'requested_count') is distinct from 'number'
    or (p_study_set ->> 'requested_count') !~ '^(5|10|20)$'
  then
    raise exception using errcode = '22023', message = 'Study-set count must be 5, 10, or 20.';
  end if;
  v_requested_count := (p_study_set ->> 'requested_count')::smallint;

  if pg_catalog.jsonb_typeof(p_study_set -> 'title') is distinct from 'string' then
    raise exception using errcode = '22023', message = 'A study-set title is required.';
  end if;
  v_title := pg_catalog.btrim(p_study_set ->> 'title');
  if pg_catalog.char_length(v_title) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'Study-set title must contain 1 to 120 characters.';
  end if;

  if p_study_set -> 'source_file_name' is not null
    and pg_catalog.jsonb_typeof(p_study_set -> 'source_file_name') not in ('string', 'null')
  then
    raise exception using errcode = '22023', message = 'Source file name must be a string or null.';
  end if;
  v_source_file_name := nullif(btrim(p_study_set ->> 'source_file_name'), '');

  if p_study_set -> 'subject_id' is not null then
    if pg_catalog.jsonb_typeof(p_study_set -> 'subject_id') not in ('string', 'null') then
      raise exception using errcode = '22023', message = 'Subject ID must be a UUID string or null.';
    end if;

    if pg_catalog.jsonb_typeof(p_study_set -> 'subject_id') = 'string' then
      if (p_study_set ->> 'subject_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise exception using errcode = '22023', message = 'Subject ID must be a valid UUID.';
      end if;
      v_subject_id := (p_study_set ->> 'subject_id')::uuid;
    end if;
  end if;

  if pg_catalog.jsonb_typeof(p_study_set -> 'content') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Study-set content must be supplied as an array.';
  end if;
  v_content := p_study_set -> 'content';
  if pg_catalog.jsonb_array_length(v_content) <> v_requested_count then
    raise exception using errcode = '22023', message = 'Study-set content must match the requested item count.';
  end if;

  if v_set_type = 'multiple_choice' then
    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      where pg_catalog.jsonb_typeof(item.value) is distinct from 'object'
        or pg_catalog.jsonb_typeof(item.value -> 'prompt') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'prompt') = ''
        or pg_catalog.jsonb_typeof(item.value -> 'correct_option_key') is distinct from 'string'
        or item.value ->> 'correct_option_key' not in ('A', 'B', 'C', 'D')
        or pg_catalog.jsonb_typeof(item.value -> 'explanation') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'explanation') = ''
        or pg_catalog.jsonb_typeof(item.value -> 'options') is distinct from 'array'
    ) then
      raise exception using errcode = '22023', message = 'A multiple-choice question has invalid fields.';
    end if;

    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      where pg_catalog.jsonb_array_length(item.value -> 'options') <> 4
    ) then
      raise exception using errcode = '22023', message = 'Each multiple-choice question must have exactly four options.';
    end if;

    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      where exists (
        select 1
        from pg_catalog.jsonb_array_elements(item.value -> 'options') as option_value(value)
        where pg_catalog.jsonb_typeof(option_value.value) is distinct from 'object'
          or pg_catalog.jsonb_typeof(option_value.value -> 'option_key') is distinct from 'string'
          or option_value.value ->> 'option_key' not in ('A', 'B', 'C', 'D')
          or pg_catalog.jsonb_typeof(option_value.value -> 'option_text') is distinct from 'string'
          or pg_catalog.btrim(option_value.value ->> 'option_text') = ''
      )
      or not exists (
        select 1
        from pg_catalog.jsonb_array_elements(item.value -> 'options') as option_value(value)
        where option_value.value ->> 'option_key' = item.value ->> 'correct_option_key'
      )
    ) or exists (
      select item.ordinality, option_value.value ->> 'option_key'
      from pg_catalog.jsonb_array_elements(v_content) with ordinality as item(value, ordinality)
      cross join lateral pg_catalog.jsonb_array_elements(item.value -> 'options') as option_value(value)
      group by item.ordinality, option_value.value ->> 'option_key'
      having pg_catalog.count(*) > 1
    ) then
      raise exception using errcode = '22023', message = 'Multiple-choice options must use distinct A-D keys and include the correct answer.';
    end if;
  elsif v_set_type = 'flashcards' then
    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      where pg_catalog.jsonb_typeof(item.value) is distinct from 'object'
        or pg_catalog.jsonb_typeof(item.value -> 'front') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'front') = ''
        or pg_catalog.jsonb_typeof(item.value -> 'back') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'back') = ''
    ) then
      raise exception using errcode = '22023', message = 'A flashcard has invalid fields.';
    end if;
  else
    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      where pg_catalog.jsonb_typeof(item.value) is distinct from 'object'
        or pg_catalog.jsonb_typeof(item.value -> 'prompt') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'prompt') = ''
        or pg_catalog.jsonb_typeof(item.value -> 'sample_answer') is distinct from 'string'
        or pg_catalog.btrim(item.value ->> 'sample_answer') = ''
        or pg_catalog.jsonb_typeof(item.value -> 'key_points') is distinct from 'array'
    ) then
      raise exception using errcode = '22023', message = 'A Q&A question has invalid fields.';
    end if;

    if exists (
      select 1
      from pg_catalog.jsonb_array_elements(v_content) as item(value)
      cross join lateral pg_catalog.jsonb_array_elements(item.value -> 'key_points') as point(value)
      where pg_catalog.jsonb_typeof(point.value) is distinct from 'string'
        or pg_catalog.btrim(point.value #>> '{}') = ''
    ) then
      raise exception using errcode = '22023', message = 'Q&A key points must be non-empty strings.';
    end if;
  end if;

  insert into public.study_sets (
    user_id,
    subject_id,
    source_file_name,
    set_type,
    difficulty,
    requested_count,
    title
  ) values (
    v_authenticated_user_id,
    v_subject_id,
    v_source_file_name,
    v_set_type,
    v_difficulty,
    v_requested_count,
    v_title
  )
  returning id into v_study_set_id;

  v_position := 0;
  for v_row in
    select item.value, item.ordinality
    from pg_catalog.jsonb_array_elements(v_content) with ordinality as item(value, ordinality)
  loop
    v_position := v_row.ordinality::smallint;
    v_item := v_row.value;

    if v_set_type = 'multiple_choice' then
      insert into public.quiz_questions (
        study_set_id,
        position,
        prompt,
        correct_option_key,
        explanation
      ) values (
        v_study_set_id,
        v_position,
        pg_catalog.btrim(v_item ->> 'prompt'),
        v_item ->> 'correct_option_key',
        pg_catalog.btrim(v_item ->> 'explanation')
      )
      returning id into v_question_id;

      insert into public.quiz_options (question_id, option_key, position, option_text)
      select
        v_question_id,
        option_value.value ->> 'option_key',
        option_value.ordinality::smallint,
        pg_catalog.btrim(option_value.value ->> 'option_text')
      from pg_catalog.jsonb_array_elements(v_item -> 'options') with ordinality as option_value(value, ordinality);
    elsif v_set_type = 'flashcards' then
      insert into public.flashcards (study_set_id, position, front, back)
      values (
        v_study_set_id,
        v_position,
        pg_catalog.btrim(v_item ->> 'front'),
        pg_catalog.btrim(v_item ->> 'back')
      );
    else
      insert into public.qa_questions (study_set_id, position, prompt, sample_answer, key_points)
      values (
        v_study_set_id,
        v_position,
        pg_catalog.btrim(v_item ->> 'prompt'),
        pg_catalog.btrim(v_item ->> 'sample_answer'),
        v_item -> 'key_points'
      );
    end if;
  end loop;

  return v_study_set_id;
end;
$function$;

revoke all on function public.save_study_set(uuid, jsonb) from public, anon;
grant execute on function public.save_study_set(uuid, jsonb) to authenticated;
