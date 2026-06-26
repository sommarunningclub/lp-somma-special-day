# SOMMA GPS Tracking — MVP

Rastreamento de corrida ao vivo via navegador (Web Geolocation), com mapa, métricas, fila offline e painel admin em tempo real (por polling).

## Objetivo
Validar num teste individual no iPhone: pedir localização → escolher onde correr → rastrear o percurso real → ver no mapa → salvar pontos/distância/tempo/ritmo → acompanhar ao vivo no painel admin → resumo final.

## Arquitetura
- **Next.js 14 (App Router) + TS**, dentro do projeto existente (1-ano-SommaDay).
- **Captura GPS:** `navigator.geolocation.watchPosition` (núcleo). `clearWatch` ao finalizar.
- **Mapa:** Google Maps JS API via `@googlemaps/js-api-loader` (padrão já usado no `EsquentaMap`). Places (busca de local), Routes/Directions (rota planejada opcional), Geometry (encode/decode da polyline). Estilo escuro app-esportivo.
- **Geo:** `geolib` (distância/velocidade) — filtros e acúmulo só entre pontos válidos.
- **Banco:** Supabase (service role no servidor; RLS bloqueia anon). Tudo grava por API routes server-side.
- **Token:** sessão acessível só pelo token (na URL). Guardamos apenas o `sha256` do token.
- **"Realtime" do painel:** **polling** do endpoint admin (service role) a cada 2s. Supabase Realtime no browser exigiria expor as tabelas à anon key (inseguro) ou Supabase Auth — fora do padrão atual; o polling entrega o "ao vivo" com segurança.

## Rotas
| Página | Função |
|---|---|
| `/tracking/gps-somma` | Entrada: nome, “onde vai correr?”, localização atual, busca Places, rota planejada opcional, “Iniciar corre” |
| `/tracking/gps-somma/correr/[token]` | Tracking ativo (mapa ao vivo, métricas, pausar/retomar/finalizar) + tela de resumo |
| `/tracking/gps-somma/admin` | Painel ao vivo (mapa + lista de sessões, polling 2s) — protegido |
| `/tracking/gps-somma/admin/sessoes/[id]` | Detalhe: trajeto real, rota planejada, stats técnicas — protegido |

### Endpoints (`/api/tracking/gps-somma/...`)
`POST session` (criar), `POST start`, `POST point` (lote, fila offline), `POST pause`, `POST resume`, `POST finish`, `GET session/[token]` (+`?points=1`), `GET admin/sessions`, `GET admin/sessions/[id]`.

## Tabelas e migrations
Rode no **Supabase → SQL Editor**: [`supabase/migrations/0002_gps_tracking.sql`](../supabase/migrations/0002_gps_tracking.sql).
- `gps_tracking_sessions`, `gps_tracking_points` (+ índices: session_id, captured_at, status, last_point_at; unique de dedupe).
- RLS ligado, sem policies → anon negado; service role bypassa. Idempotente.

## Variáveis de ambiente (reutilizadas, sem valores)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Maps/Places/Directions/Geometry). `NEXT_PUBLIC_GOOGLE_MAP_ID` opcional (não usado; estilo JSON requer mapa sem mapId).
- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server). `ADMIN_SECRET_KEY`/`SESSION_SECRET` (login admin existente).

## APIs do Google Maps necessárias (habilitar no Cloud)
Maps JavaScript API, Places API, Directions API (rota planejada), Geometry Library (client). Geocoding não é necessária. **Roads API não é usada.**

## Pipeline de qualidade do GPS (constantes em `lib/tracking/constants.ts`)
`TRACKING_MIN_INTERVAL_MS=5000`, `TRACKING_MIN_DISTANCE_METERS=8`, `TRACKING_MAX_ACCURACY_METERS=35`, `TRACKING_MAX_SPEED_MPS=12`.
Cliente: throttle por intervalo/distância. Servidor: rejeita baixa precisão (não entra no cálculo), saltos impossíveis e duplicados; distância só entre pontos válidos consecutivos; guarda `captured_at` (device) e `received_at` (servidor); pontos inválidos são gravados com `rejection_reason`.

## Offline
Fila em `localStorage` por sessão. Sem rede: pontos ficam pendentes; ao voltar, reenvia preservando `captured_at`; dedupe por índice único no servidor. Status “Sem conexão”/“Sincronizando”.

## Como rodar localmente
```bash
vercel env pull   # baixa as envs (Maps + Supabase)
npm install
npm run dev
```
Rode a migration `0002` no Supabase. Abra `http://localhost:3000/tracking/gps-somma`.
**Simulador (somente dev):** na tela de tracking aparece o botão “+ ponto (dev)” pra injetar pontos sintéticos e validar mapa/realtime sem GPS real.

## Como testar no iPhone (Safari)
1. Acesse `https://specialday.sommaclub.com.br/tracking/gps-somma`.
2. Toque “Usar minha localização atual” e **permita localização precisa**.
3. (Opcional) busque um destino pra ver a rota planejada (cinza pontilhada).
4. “Iniciar corre” → mantenha a tela aberta e o celular desbloqueado.
5. Caminhe/corra: o trajeto real (laranja) é desenhado e as métricas atualizam.
6. Pausar/Retomar/Finalizar → resumo final.

## Como abrir o painel admin
Faça login em `/login-admin` (admin existente) e acesse `/tracking/gps-somma/admin`. Atualiza sozinho (2s).

## Limitações conhecidas
- **O tracking via navegador funciona melhor com a página aberta e o celular desbloqueado. Esta versão não é rastreamento profissional em segundo plano.** iOS Safari suspende JS com a tela bloqueada.
- “Realtime” do painel é por polling (2s), não Supabase Realtime.
- Sem Roads API: o traçado é o GPS bruto filtrado (não “snap” em ruas).
- Marcadores usam `google.maps.Marker` (clássico) p/ permitir estilo escuro sem Map ID.

## Checklist para o teste de amanhã
- [ ] Migration `0002` rodada no Supabase.
- [ ] Google Maps: Maps JS + Places + Directions habilitadas; chave liberada pro domínio.
- [ ] iPhone: permissão de localização concedida; tela aberta/desbloqueada.
- [ ] Iniciar → ver trajeto laranja desenhando.
- [ ] Painel `/tracking/gps-somma/admin` acompanhando ao vivo.
- [ ] Pausar/Retomar/Finalizar → resumo correto.

## Próximos passos (versão com múltiplos pelotões)
- Agrupar sessões por **evento/pelotão**; filtros e cores por pelotão no painel.
- Supabase Realtime de verdade (com Supabase Auth ou um canal server-broadcast) p/ escala.
- Background tracking real via app nativo / Capacitor.
- Snap-to-roads opcional; segmentos de ritmo por km; export GPX.
- Compartilhamento social do resumo (código já isolado pra isso).
