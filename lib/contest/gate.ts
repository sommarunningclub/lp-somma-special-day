/**
 * Gate temporal pro mural do concurso junino e paginas dependentes
 * (mural, look individual, ranking). Libera so dia 28/06/2026 06h30 BRT.
 */

export const MURAL_RELEASE_BRT = new Date('2026-06-28T06:30:00-03:00').getTime()

export function muralFechado(): boolean {
  return Date.now() < MURAL_RELEASE_BRT
}

export function muralReleaseLabel(): string {
  return new Date(MURAL_RELEASE_BRT).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
