-- Permite cadastro curto no concurso: apenas nome/email/cpf/termos.
-- Look_title e display_name viram opcionais (preenchidos depois na area /minha-inscricao).
ALTER TABLE public.contest_participants
  ALTER COLUMN look_title DROP NOT NULL,
  ALTER COLUMN display_name DROP NOT NULL;
