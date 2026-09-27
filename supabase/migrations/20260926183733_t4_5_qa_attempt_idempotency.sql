alter table public.qa_attempts
  add constraint qa_attempts_user_question_answered_at_key
  unique (user_id, question_id, answered_at);
