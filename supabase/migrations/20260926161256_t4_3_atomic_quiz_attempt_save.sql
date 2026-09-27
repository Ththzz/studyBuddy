create or replace function public.save_quiz_attempt(
  p_user_id uuid,
  p_study_set_id uuid,
  p_started_at timestamp with time zone,
  p_completed_at timestamp with time zone,
  p_answers jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_requested_count smallint;
  v_answer_count integer;
  v_distinct_question_count integer;
  v_correct_count integer;
  v_attempt_id uuid;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested quiz-attempt owner does not match the signed-in user.';
  end if;

  if p_study_set_id is null or p_started_at is null or p_completed_at is null then
    raise exception using errcode = '22023', message = 'A saved study set and quiz start and completion times are required.';
  end if;

  if p_completed_at < p_started_at then
    raise exception using errcode = '22023', message = 'Quiz completion time cannot be before its start time.';
  end if;

  if pg_catalog.jsonb_typeof(p_answers) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Quiz answers must be supplied as an array.';
  end if;

  select study_set.requested_count
  into v_requested_count
  from public.study_sets as study_set
  where study_set.id = p_study_set_id
    and study_set.user_id = v_authenticated_user_id
    and study_set.set_type = 'multiple_choice';

  if not found then
    raise exception using errcode = '42501', message = 'The saved multiple-choice quiz does not belong to the signed-in user.';
  end if;

  select pg_catalog.count(*)
  into v_answer_count
  from pg_catalog.jsonb_array_elements(p_answers) as answer(value);

  if v_answer_count <> v_requested_count then
    raise exception using errcode = '22023', message = 'Quiz answers must include every question in the saved set.';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
    where pg_catalog.jsonb_typeof(answer.value) is distinct from 'object'
      or pg_catalog.jsonb_typeof(answer.value -> 'question_id') is distinct from 'string'
      or (answer.value ->> 'question_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or pg_catalog.jsonb_typeof(answer.value -> 'selected_option_key') is distinct from 'string'
      or answer.value ->> 'selected_option_key' not in ('A', 'B', 'C', 'D')
      or pg_catalog.jsonb_typeof(answer.value -> 'answered_at') is distinct from 'string'
      or pg_catalog.btrim(answer.value ->> 'answered_at') = ''
  ) then
    raise exception using errcode = '22023', message = 'A quiz answer has invalid fields.';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
    where not pg_catalog.pg_input_is_valid(answer.value ->> 'answered_at', 'timestamp with time zone')
  ) then
    raise exception using errcode = '22023', message = 'Quiz answer times must be valid timestamps.';
  end if;

  select pg_catalog.count(distinct answer.value ->> 'question_id')
  into v_distinct_question_count
  from pg_catalog.jsonb_array_elements(p_answers) as answer(value);

  if v_distinct_question_count <> v_answer_count then
    raise exception using errcode = '22023', message = 'A quiz question can only be answered once per attempt.';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
    where not exists (
      select 1
      from public.quiz_questions as question
      where question.id = (answer.value ->> 'question_id')::uuid
        and question.study_set_id = p_study_set_id
    )
  ) then
    raise exception using errcode = '22023', message = 'Every answer must reference a question in the saved quiz.';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
    where not exists (
      select 1
      from public.quiz_options as option_value
      where option_value.question_id = (answer.value ->> 'question_id')::uuid
        and option_value.option_key::text = answer.value ->> 'selected_option_key'
    )
  ) then
    raise exception using errcode = '22023', message = 'A selected option does not belong to its quiz question.';
  end if;

  select pg_catalog.count(*)
  into v_correct_count
  from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
  join public.quiz_questions as question
    on question.id = (answer.value ->> 'question_id')::uuid
   and question.study_set_id = p_study_set_id
  where answer.value ->> 'selected_option_key' = question.correct_option_key::text;

  insert into public.quiz_attempts (
    user_id,
    study_set_id,
    score,
    started_at,
    completed_at
  ) values (
    v_authenticated_user_id,
    p_study_set_id,
    pg_catalog.round(v_correct_count::numeric * 100 / v_requested_count, 2),
    p_started_at,
    p_completed_at
  )
  returning id into v_attempt_id;

  insert into public.quiz_answers (
    attempt_id,
    question_id,
    selected_option_key,
    is_correct,
    answered_at
  )
  select
    v_attempt_id,
    question.id,
    answer.value ->> 'selected_option_key',
    answer.value ->> 'selected_option_key' = question.correct_option_key::text,
    (answer.value ->> 'answered_at')::timestamp with time zone
  from pg_catalog.jsonb_array_elements(p_answers) as answer(value)
  join public.quiz_questions as question
    on question.id = (answer.value ->> 'question_id')::uuid
   and question.study_set_id = p_study_set_id;

  return v_attempt_id;
end;
$function$;

revoke all on function public.save_quiz_attempt(uuid, uuid, timestamp with time zone, timestamp with time zone, jsonb) from public, anon;
grant execute on function public.save_quiz_attempt(uuid, uuid, timestamp with time zone, timestamp with time zone, jsonb) to authenticated;
