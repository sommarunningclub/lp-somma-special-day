'use client'

import { logout } from '@/actions/auth'

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-full border-4 border-somma-cream/20 px-5 py-2.5 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-pink hover:bg-somma-pink/10 hover:text-somma-pink"
      >
        Sair
      </button>
    </form>
  )
}
