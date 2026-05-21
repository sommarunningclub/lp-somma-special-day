import { redirect } from 'next/navigation'
import Image from 'next/image'
import { isInsider } from '@/lib/insider'
import AcessoForm from '@/components/acesso/AcessoForm'

export const dynamic = 'force-dynamic'

export default async function AcessoPage() {
  if (await isInsider()) {
    redirect('/')
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-somma-cream px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/logo-special-day.svg" alt="Somma Special Day" width={200} height={100} className="h-16 w-auto" />
        </div>
        <AcessoForm />
        <p className="mt-6 text-center font-dm text-xs text-somma-black/50">
          Ainda não tem acesso?{' '}
          <a href="/listavip" className="inline-flex min-h-11 items-center text-somma-orange underline-offset-2 hover:underline">
            Entre na Lista VIP
          </a>
        </p>
      </div>
    </main>
  )
}
