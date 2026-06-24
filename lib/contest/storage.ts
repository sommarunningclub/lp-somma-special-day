import 'server-only'
import { randomUUID } from 'crypto'
import { contestDb } from './db'

const BUCKET = 'contest-junino'

function parseDataUrl(dataUrl: string) {
  const m = /^data:(image\/(jpeg|png|webp));base64,(.+)$/i.exec(dataUrl)
  if (!m) throw new Error('Formato de imagem inválido.')
  const mime = m[1].toLowerCase()
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const buffer = Buffer.from(m[3], 'base64')
  return { mime, ext, buffer }
}
function magicOk(mime: string, b: Buffer): boolean {
  if (b.length < 12) return false
  if (mime === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  if (mime === 'image/png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  if (mime === 'image/webp') return b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'
  return false
}

// Sobe uma foto (dataURL) e devolve o PATH no bucket privado.
export async function uploadContestPhoto(dataUrl: string, participantId: string, slot: 'main' | 'second'): Promise<string> {
  const { mime, ext, buffer } = parseDataUrl(dataUrl)
  if (buffer.byteLength > 10 * 1024 * 1024) throw new Error('Imagem muito grande (máx 10MB).')
  if (!magicOk(mime, buffer)) throw new Error('Arquivo de imagem inválido.')
  const path = `participants/${participantId}/${slot}-${randomUUID()}.${ext}`
  const { error } = await contestDb().storage.from(BUCKET).upload(path, buffer, { contentType: mime, upsert: false })
  if (error) throw new Error(`Falha no upload: ${error.message}`)
  return path
}

// Gera URLs assinadas (2h) pros paths informados.
export async function signContestPhotos(paths: (string | null | undefined)[], ttl = 60 * 60 * 2): Promise<Map<string, string>> {
  const valid = Array.from(new Set(paths.filter(Boolean) as string[]))
  const map = new Map<string, string>()
  if (!valid.length) return map
  const { data } = await contestDb().storage.from(BUCKET).createSignedUrls(valid, ttl)
  for (const s of data ?? []) if (s.signedUrl && s.path) map.set(s.path, s.signedUrl)
  return map
}

export async function removeContestPhotos(paths: (string | null | undefined)[]): Promise<void> {
  const valid = paths.filter(Boolean) as string[]
  if (valid.length) await contestDb().storage.from(BUCKET).remove(valid).catch(() => {})
}
