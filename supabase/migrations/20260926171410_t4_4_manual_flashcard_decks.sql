-- Allow manually-created decks to contain any number of cards supported by
-- the smallint position column. AI-generated sets remain limited to 5, 10,
-- or 20 items by save_study_set.
alter table public.study_sets
  drop constraint if exists study_sets_requested_count_check;

alter table public.study_sets
  add constraint study_sets_requested_count_check
  check (requested_count between 1 and 32767);

create or replace function public.save_manual_flashcard_deck(
  p_user_id uuid,
  p_title text,
  p_cards jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_authenticated_user_id uuid := auth.uid();
  v_title text;
  v_card_count integer;
  v_study_set_id uuid;
begin
  if v_authenticated_user_id is null or p_user_id is distinct from v_authenticated_user_id then
    raise exception using errcode = '42501', message = 'The requested study-set owner does not match the signed-in user.';
  end if;

  if p_title is null then
    raise exception using errcode = '22023', message = 'A flashcard deck title is required.';
  end if;

  v_title := pg_catalog.btrim(p_title);
  if pg_catalog.char_length(v_title) not between 1 and 120 then
    raise exception using errcode = '22023', message = 'Flashcard deck title must contain 1 to 120 characters.';
  end if;

  if pg_catalog.jsonb_typeof(p_cards) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Flashcards must be supplied as an array.';
  end if;

  v_card_count := pg_catalog.jsonb_array_length(p_cards);
  if v_card_count < 1 or v_card_count > 32767 then
    raise exception using errcode = '22023', message = 'A flashcard deck must contain between 1 and 32767 cards.';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_cards) as card(value)
    where pg_catalog.jsonb_typeof(card.value) is distinct from 'object'
      or pg_catalog.jsonb_typeof(card.value -> 'front') is distinct from 'string'
      or pg_catalog.btrim(card.value ->> 'front') = ''
      or pg_catalog.jsonb_typeof(card.value -> 'back') is distinct from 'string'
      or pg_catalog.btrim(card.value ->> 'back') = ''
  ) then
    raise exception using errcode = '22023', message = 'Every flashcard must include a non-empty front and back.';
  end if;

  insert into public.study_sets (
    user_id,
    set_type,
    difficulty,
    requested_count,
    title
  ) values (
    v_authenticated_user_id,
    'flashcards',
    'Medium',
    v_card_count::smallint,
    v_title
  )
  returning id into v_study_set_id;

  insert into public.flashcards (study_set_id, position, front, back)
  select
    v_study_set_id,
    card.ordinality::smallint,
    pg_catalog.btrim(card.value ->> 'front'),
    pg_catalog.btrim(card.value ->> 'back')
  from pg_catalog.jsonb_array_elements(p_cards) with ordinality as card(value, ordinality);

  return v_study_set_id;
end;
$function$;

revoke all on function public.save_manual_flashcard_deck(uuid, text, jsonb) from public, anon;
grant execute on function public.save_manual_flashcard_deck(uuid, text, jsonb) to authenticated;
