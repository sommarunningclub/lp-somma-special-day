export type Aspect = 'original' | '4:5' | '1:1'

// Comprime + (opcional) recorta no centro pra proporção; saída WEBP leve. Client-only (usa canvas).
export async function compressImage(file: File, aspect: Aspect = '4:5'): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height
  if (aspect !== 'original') {
    const alvo = aspect === '1:1' ? 1 : 4 / 5
    const atual = img.width / img.height
    if (atual > alvo) {
      sw = Math.round(img.height * alvo)
      sx = Math.round((img.width - sw) / 2)
    } else {
      sh = Math.round(img.width / alvo)
      sy = Math.round((img.height - sh) / 2)
    }
  }
  const max = 1000
  let tw = sw,
    th = sh
  if (tw >= th && tw > max) {
    th = Math.round((th * max) / tw)
    tw = max
  } else if (th > max) {
    tw = Math.round((tw * max) / th)
    th = max
  }
  const canvas = document.createElement('canvas')
  canvas.width = tw
  canvas.height = th
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, tw, th)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th)
  return canvas.toDataURL('image/webp', 0.85)
}
