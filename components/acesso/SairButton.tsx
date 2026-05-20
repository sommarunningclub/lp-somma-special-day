'use client'

import { sairInsider } from '@/actions/insider'

export default function SairButton() {
  return (
    <form action={sairInsider} className="fixed right-4 top-4 z-50">
      <button
        type="submit"
        className="rounded-full border-2 border-somma-black bg-somma-cream/90 px-4 py-1.5 font-bebas text-xs tracking-widest text-somma-black shadow-[3px_3px_0_#0a0a0a] backdrop-blur transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-somma-orange hover:text-somma-cream hover:shadow-[2px_2px_0_#0a0a0a]"
      >
        Sair
      </button>
    </form>
  )
}
