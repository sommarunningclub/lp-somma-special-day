'use client'

import { useRef, useState } from 'react'
import { compressImage, type Aspect } from './image'

export default function PhotoUploader({ value, onChange, max = 2 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const [aspect, setAspect] = useState<Aspect>('4:5')
  const [carregando, setCarregando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function add(file: File) {
    if (value.length >= max) return
    setCarregando(true)
    try {
      const d = await compressImage(file, aspect)
      onChange([...value, d])
    } catch {
      /* ignora */
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60">Recorte</span>
        {(['4:5', '1:1', 'original'] as Aspect[]).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAspect(a)}
            className={`rounded-full border-2 px-3 py-1 font-dm text-xs font-bold transition-colors ${
              aspect === a ? 'border-somma-black bg-somma-orange text-somma-cream' : 'border-somma-black/20 bg-white text-somma-black/60'
            }`}
          >
            {a === '4:5' ? 'Vertical' : a === '1:1' ? 'Quadrado' : 'Original'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {value.map((src, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl border-4 border-somma-black shadow-[4px_4px_0_#0a0a0a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Foto ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream font-dm text-sm font-bold text-somma-black shadow-[2px_2px_0_#0a0a0a]"
              aria-label="Remover foto"
            >
              ×
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-somma-black/30 bg-white text-somma-black/50 transition-colors hover:border-somma-orange hover:text-somma-orange"
          >
            <span className="text-3xl">{carregando ? '…' : '＋'}</span>
            <span className="font-dm text-xs font-bold uppercase tracking-wide">{carregando ? 'Processando' : 'Adicionar foto'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const input = e.currentTarget
          const f = input.files?.[0]
          if (f) add(f)
          input.value = ''
        }}
      />
      <p className="mt-2 font-dm text-[11px] text-somma-black/45">JPG, PNG ou WEBP · até {max} fotos · até 10MB cada.</p>
    </div>
  )
}
