/**
 * Helpers para integração com o produto Agenda Somma Club
 * (deployado em https://agenda.sommaclub.com.br).
 *
 * Em vez de duplicar a UX de assinatura aqui, mandamos o usuário pra landing
 * pública da agenda, que já tem botões Apple/Google/Outlook prontos e
 * tracking próprio. Adicionamos `?ref=` para conseguir cruzar origem se
 * precisar mais tarde.
 */

export const AGENDA_BASE_URL = 'https://agenda.sommaclub.com.br/agenda'

export function agendaUrl(ref: 'home' | 'thank-you' | 'email-nutricao' | 'email-countdown' | 'email-ticket'): string {
  return `${AGENDA_BASE_URL}?ref=specialday-${ref}`
}
