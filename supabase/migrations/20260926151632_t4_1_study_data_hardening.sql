-- Keep study sets linked only to subjects owned by the same signed-in user.
alter policy study_sets_own on public.study_sets
  using (
    (select auth.uid()) = user_id
    and (
      subject_id is null
      or exists (
        select 1
        from public.subjects as subject
        where subject.id = study_sets.subject_id
          and subject.user_id = (select auth.uid())
      )
    )
  )
  with check (
    (select auth.uid()) = user_id
    and (
      subject_id is null
      or exists (
        select 1
        from public.subjects as subject
        where subject.id = study_sets.subject_id
          and subject.user_id = (select auth.uid())
      )
    )
  );

-- A quiz attempt must belong to the owner of the referenced study set.
alter policy quiz_attempts_own on public.quiz_attempts
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.study_sets as study_set
      where study_set.id = quiz_attempts.study_set_id
        and study_set.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.study_sets as study_set
      where study_set.id = quiz_attempts.study_set_id
        and study_set.user_id = (select auth.uid())
    )
  );

-- A saved answer must reference a question from the same set as its attempt.
alter policy quiz_answers_own_attempt on public.quiz_answers
  using (
    exists (
      select 1
      from public.quiz_attempts as attempt
      join public.quiz_questions as question
        on question.study_set_id = attempt.study_set_id
      join public.study_sets as study_set
        on study_set.id = attempt.study_set_id
      where attempt.id = quiz_answers.attempt_id
        and question.id = quiz_answers.question_id
        and attempt.user_id = (select auth.uid())
        and study_set.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.quiz_attempts as attempt
      join public.quiz_questions as question
        on question.study_set_id = attempt.study_set_id
      join public.study_sets as study_set
        on study_set.id = attempt.study_set_id
      where attempt.id = quiz_answers.attempt_id
        and question.id = quiz_answers.question_id
        and attempt.user_id = (select auth.uid())
        and study_set.user_id = (select auth.uid())
    )
  );

-- A flashcard review must reference a card in a set owned by the reviewer.
alter policy flashcard_reviews_own on public.flashcard_reviews
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.flashcards as flashcard
      join public.study_sets as study_set
        on study_set.id = flashcard.study_set_id
      where flashcard.id = flashcard_reviews.flashcard_id
        and study_set.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.flashcards as flashcard
      join public.study_sets as study_set
        on study_set.id = flashcard.study_set_id
      where flashcard.id = flashcard_reviews.flashcard_id
        and study_set.user_id = (select auth.uid())
    )
  );

-- A Q&A attempt must reference a question in a set owned by the same user.
alter policy qa_attempts_own on public.qa_attempts
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.qa_questions as question
      join public.study_sets as study_set
        on study_set.id = question.study_set_id
      where question.id = qa_attempts.question_id
        and study_set.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.qa_questions as question
      join public.study_sets as study_set
        on study_set.id = question.study_set_id
      where question.id = qa_attempts.question_id
        and study_set.user_id = (select auth.uid())
    )
  );

-- RLS does not filter TRUNCATE. Keep anon out of these tables entirely and
-- retain only ordinary row-level operations for authenticated users.
revoke all privileges on table
  public.study_sets,
  public.quiz_questions,
  public.quiz_options,
  public.quiz_attempts,
  public.quiz_answers,
  public.flashcards,
  public.flashcard_reviews,
  public.qa_questions,
  public.qa_attempts
from anon;

revoke truncate, trigger, references on table
  public.study_sets,
  public.quiz_questions,
  public.quiz_options,
  public.quiz_attempts,
  public.quiz_answers,
  public.flashcards,
  public.flashcard_reviews,
  public.qa_questions,
  public.qa_attempts
from authenticated;
