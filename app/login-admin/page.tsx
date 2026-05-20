import { redirect } from 'next/navigation'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/auth'
import LoginForm from '@/components/admin/LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginAdminPage() {
  if (await isAuthenticated()) {
    redirect('/admin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-somma-black px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image src="/logo-special-day.svg" alt="Somma Special Day" width={200} height={100} className="h-16 w-auto" />
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
