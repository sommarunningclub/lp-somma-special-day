-- Cadastro do concurso fica ainda mais curto: so nome + CPF.
-- E-mail deixa de ser obrigatorio.
ALTER TABLE public.contest_participants
  ALTER COLUMN email DROP NOT NULL;
