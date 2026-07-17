import type { Metadata } from 'next'
import Image from 'next/image'
import FloatingElement from '@/components/special-day/FloatingElement'
import CortesiaForm from '@/components/special-day/CortesiaForm'
import CortesiaEsgotada from '@/components/special-day/CortesiaEsgotada'
import { createServerClient } from '@/lib/supabase/server'
import { CORTESIA_LIMITE } from '@/lib/validations/cortesia'
import { isCortesiaBloqueada } from '@/lib/cortesia/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cortesia — Somma Special Day',
  description: 'Preencha seus dados e garanta sua cortesia do Somma Special Day.',
}

export default async function CortesiaPage() {
  const supabase = createServerClient()
  const [{ count }, bloqueadaManual] = await Promise.all([
    supabase.from('cortesia').select('*', { count: 'exact', head: true }),
    isCortesiaBloqueada(),
  ])
  // Formulario fecha por bloqueio manual (kill-switch do admin) OU pelo teto.
  const esgotado = bloqueadaManual || (count ?? 0) >= CORTESIA_LIMITE
  const motivo = bloqueadaManual ? 'manual' : 'limite'

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-somma-black px-4 py-10 sm:py-14 md:min-h-screen md:py-20">
      {/* Elementos decorativos flutuantes */}
      <FloatingElement
        src="/elemento-relogio.svg"
        alt=""
        speed={0.8}
        rotate={-15}
        className="top-[3%] left-[2%] w-14 opacity-20 sm:w-20 md:w-32 md:opacity-30"
      />
      <FloatingElement
        src="/elemento-tenis.svg"
        alt=""
        speed={0.9}
        rotate={-8}
        className="hidden md:block top-[8%] right-[4%] w-28 md:w-40 opacity-25"
      />
      <FloatingElement
        src="/elemento-corredor.svg"
        alt=""
        speed={1.1}
        rotate={10}
        className="bottom-[4%] left-[-6%] w-20 opacity-15 sm:left-[4%] sm:w-24 md:w-36 md:opacity-25"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center">
        <div className="mb-8 w-48 sm:w-56 md:w-64">
          <Image
            src="/logo-special-day.svg"
            alt="Somma Special Day"
            width={800}
            height={400}
            className="h-auto w-full"
            priority
          />
        </div>

        {esgotado ? <CortesiaEsgotada motivo={motivo} /> : <CortesiaForm />}
      </div>
    </main>
  )
}
