import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Acesso liberado: a página é pública agora. Mantemos a rota /acesso
// (usada em links antigos) redirecionando para o conteúdo.
export default function AcessoPage() {
  redirect('/')
}
