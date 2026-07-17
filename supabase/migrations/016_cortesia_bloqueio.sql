-- Kill-switch manual do formulario de cortesia (pagina /cortesia).
-- Acionado pelo botao em /cortesia/admin. Reaproveita a tabela app_settings.
--
-- OPCIONAL rodar: a chave e criada automaticamente (via upsert) no primeiro
-- clique do botao. Este INSERT apenas semeia o valor padrao 'false' (formulario
-- aberto) para deixar o estado explicito no banco desde o inicio.
INSERT INTO public.app_settings (key, value)
VALUES ('cortesia_bloqueada', 'false')
ON CONFLICT (key) DO NOTHING;
