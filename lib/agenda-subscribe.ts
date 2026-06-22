/**
 * URLs de assinatura da Agenda Somma Club por plataforma.
 * Espelha o helper `buildSubscribeLinks` do projeto Agenda-Somma-Club,
 * apontando para os feeds .ics ja deployados em agenda.sommaclub.com.br.
 */

const AGENDA_HOST = 'agenda.sommaclub.com.br'
const AGENDA_ORIGIN = `https://${AGENDA_HOST}`
const CALENDAR_SLUG = 'somma'
const CALENDAR_NAME = 'Agenda Somma Club'

/** Feed iCal cru — usado por Apple/Outlook e como base. */
export const icsUrl = `${AGENDA_ORIGIN}/api/calendar/${CALENDAR_SLUG}.ics`

/** iPhone, Mac e Apple Calendar — abre o app nativo. */
export const webcalUrl = `webcal://${AGENDA_HOST}/api/calendar/${CALENDAR_SLUG}.ics`

/**
 * Google Calendar (web e Android) — passamos a URL webcal:// em cid,
 * que e a forma mais confiavel pra assinatura recorrente.
 */
export const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`

/** Outlook (web) — adiciona calendario "from web". */
export const outlookUrl = `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(icsUrl)}&name=${encodeURIComponent(CALENDAR_NAME)}`

export interface PlatformLink {
  key: 'apple' | 'google' | 'android' | 'outlook'
  label: string
  hint: string
  url: string
  emoji: string
}

export const SUBSCRIBE_PLATFORMS: PlatformLink[] = [
  { key: 'apple',   label: 'iPhone / Mac',     hint: 'Abre no app Calendario nativo',     url: webcalUrl,  emoji: '' },
  { key: 'google',  label: 'Google Calendar',  hint: 'Confirme em calendar.google.com',   url: googleUrl,  emoji: '' },
  { key: 'android', label: 'Android',          hint: 'Adiciona ao Google Calendar',       url: googleUrl,  emoji: '' },
  { key: 'outlook', label: 'Outlook',          hint: 'Adiciona pela web do Outlook',      url: outlookUrl, emoji: '' },
]
