// Identidade anonima do dispositivo pra deduplicar reacoes/comentarios.
// uuid persistido em localStorage. Sem PII.

const KEY = 'correio_fp_v1'

export function getCorreioFingerprint(): string {
  if (typeof window === 'undefined') return ''
  try {
    const cached = window.localStorage.getItem(KEY)
    if (cached) return cached
    const fresh = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) + '-' + Date.now().toString(36)
    window.localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    return 'no-storage-' + Math.random().toString(36).slice(2)
  }
}

// Emojis fixos disponiveis pras reacoes (igual Instagram).
export const REACAO_EMOJIS = ['🧡', '🔥', '😂', '👏', '💯', '💌'] as const
export type ReacaoEmoji = (typeof REACAO_EMOJIS)[number]
