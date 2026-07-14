'use client'

import { useState, useEffect } from 'react'

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}
function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}
function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

type PageState = 'form' | 'processing' | 'success' | 'error' | 'pix'

const inputClass =
  'w-full rounded-xl border-4 border-somma-black bg-white px-4 py-3 font-dm text-base text-somma-black placeholder-somma-black/40 focus:outline-none focus:shadow-[4px_4px_0_#0a0a0a] transition-all'

export default function DayUseCheckout() {
  const [pageState, setPageState] = useState<PageState>('form')
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<'card' | 'pix'>('card')
  const [isCepLoading, setIsCepLoading] = useState(false)

  const [customer, setCustomer] = useState({
    name: '', email: '', cpfCnpj: '', phone: '', postalCode: '', addressNumber: '',
    street: '', neighborhood: '', city: '', state: '',
  })
  const [card, setCard] = useState({ holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' })

  // PIX
  const [pixQrCode, setPixQrCode] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null)
  const [pixCopied, setPixCopied] = useState(false)

  // CEP autopreenche endereço (necessário pro creditCardHolderInfo do Asaas).
  const handleCep = async (value: string) => {
    const formatted = formatCEP(value)
    setCustomer((p) => ({ ...p, postalCode: formatted }))
    const clean = value.replace(/\D/g, '')
    if (clean.length !== 8) return
    setIsCepLoading(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
      if (!res.ok) throw new Error()
      const d = await res.json()
      setCustomer((p) => ({ ...p, street: d.street || '', neighborhood: d.neighborhood || '', city: d.city || '', state: d.state || '' }))
    } catch {
      /* CEP não encontrado — usuário segue manualmente pelo número */
    } finally {
      setIsCepLoading(false)
    }
  }

  // Polling do PIX (a cada 3s, teto ~20min).
  useEffect(() => {
    if (pageState !== 'pix' || !pixPaymentId) return
    let attempts = 0
    const MAX = 400
    const id = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/dayuse/payment-status?paymentId=${pixPaymentId}`)
        const d = await res.json()
        if (res.ok && d.paid) {
          clearInterval(id)
          setPageState('success')
        }
      } catch {
        /* rede instável — próxima tentativa cobre */
      }
      if (attempts >= MAX) clearInterval(id)
    }, 3000)
    return () => clearInterval(id)
  }, [pageState, pixPaymentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPageState('processing')
    try {
      const custRes = await fetch('/api/dayuse/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customer.name, email: customer.email, cpfCnpj: customer.cpfCnpj, phone: customer.phone }),
      })
      const cust = await custRes.json()
      if (!custRes.ok) throw new Error(cust.error || 'Erro ao salvar seus dados')

      const payRes = await fetch('/api/dayuse/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust.id,
          method,
          customer,
          card: method === 'card' ? card : undefined,
        }),
      })
      const pay = await payRes.json()
      if (!payRes.ok) throw new Error(pay.error || 'Erro ao processar pagamento')

      if (method === 'pix') {
        const qrRes = await fetch(`/api/dayuse/pix?paymentId=${pay.paymentId}`)
        const qr = await qrRes.json()
        if (!qrRes.ok) throw new Error(qr.error || 'Erro ao gerar QR Code PIX')
        setPixPaymentId(pay.paymentId)
        setPixQrCode(qr.encodedImage)
        setPixPayload(qr.payload)
        setPageState('pix')
        return
      }

      if (pay.paid) {
        setPageState('success')
      } else {
        throw new Error('Pagamento não confirmado. Verifique os dados do cartão.')
      }
    } catch (err: any) {
      setError(err.message)
      setPageState('error')
    }
  }

  // ─── SUCCESS ───
  if (pageState === 'success') {
    return (
      <section id="dayuse-checkout" className="bg-somma-yellow px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-somma-cream p-8 shadow-[8px_8px_0_#0a0a0a]">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="font-bebas text-4xl tracking-tight text-somma-black">Ingresso garantido!</h2>
          <p className="mt-3 font-dm text-somma-black/70">
            Seu Day Use do Special Day está confirmado. Te esperamos no after,
            sábado 18/07. Bora curtir!
          </p>
          <a href="/" className="mt-6 inline-block rounded-xl border-4 border-somma-black bg-somma-blue px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]">
            Voltar ao site
          </a>
        </div>
      </section>
    )
  }

  // ─── PIX ───
  if (pageState === 'pix') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-white p-8 text-center shadow-[8px_8px_0_#0a0a0a]">
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Pague com PIX</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/60">Escaneie o QR Code ou copie o código.</p>
          {pixQrCode && (
            <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX" width={220} height={220} className="mx-auto mt-6 rounded-xl border-4 border-somma-black" />
          )}
          <p className="mt-4 font-bebas text-4xl tracking-tight text-somma-black">R$ 75</p>
          {pixPayload && (
            <button
              type="button"
              onClick={async () => { await navigator.clipboard.writeText(pixPayload); setPixCopied(true); setTimeout(() => setPixCopied(false), 3000) }}
              className="mt-4 w-full rounded-xl border-4 border-somma-black bg-somma-blue px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]"
            >
              {pixCopied ? 'Código copiado!' : 'Copiar código PIX'}
            </button>
          )}
          <p className="mt-4 font-dm text-xs text-somma-black/50">
            A confirmação aparece aqui automaticamente após o pagamento.
          </p>
        </div>
      </section>
    )
  }

  // ─── PROCESSING ───
  if (pageState === 'processing') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-24 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-somma-black border-t-somma-orange" />
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Processando…</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/60">Seu pagamento está sendo validado com segurança.</p>
        </div>
      </section>
    )
  }

  // ─── ERROR ───
  if (pageState === 'error') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-white p-8 shadow-[8px_8px_0_#0a0a0a]">
          <div className="mb-4 text-5xl">😕</div>
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Ops, deu ruim</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/70">{error || 'Ocorreu um erro ao processar seu pagamento.'}</p>
          <button
            onClick={() => { setPageState('form'); setError(null) }}
            className="mt-6 rounded-xl border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]"
          >
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  // ─── FORM ───
  return (
    <section id="dayuse-checkout" className="bg-somma-cream px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg">
        <h2 className="mb-2 text-center font-bebas text-4xl tracking-tight text-somma-black sm:text-5xl">
          Garanta seu Day Use
        </h2>
        <p className="mb-8 text-center font-dm text-sm text-somma-black/60">Ingresso único · R$ 75 · à vista</p>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border-4 border-somma-black bg-white p-6 shadow-[8px_8px_0_#0a0a0a] sm:p-8">
          {/* Dados */}
          <div className="space-y-3">
            <input required className={inputClass} placeholder="Nome completo" value={customer.name}
              onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} />
            <input required type="email" className={inputClass} placeholder="E-mail" value={customer.email}
              onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input required className={inputClass} placeholder="CPF" inputMode="numeric" value={customer.cpfCnpj}
                onChange={(e) => setCustomer((p) => ({ ...p, cpfCnpj: formatCPF(e.target.value) }))} />
              <input required className={inputClass} placeholder="WhatsApp" inputMode="tel" value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: formatPhone(e.target.value) }))} />
            </div>
          </div>

          {/* Toggle pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMethod('card')}
              className={`rounded-xl border-4 border-somma-black px-4 py-3 font-bebas text-lg tracking-wide transition-all ${method === 'card' ? 'bg-somma-blue text-somma-cream shadow-[4px_4px_0_#0a0a0a]' : 'bg-white text-somma-black/60'}`}>
              💳 Cartão
            </button>
            <button type="button" onClick={() => setMethod('pix')}
              className={`rounded-xl border-4 border-somma-black px-4 py-3 font-bebas text-lg tracking-wide transition-all ${method === 'pix' ? 'bg-somma-blue text-somma-cream shadow-[4px_4px_0_#0a0a0a]' : 'bg-white text-somma-black/60'}`}>
              ⚡ PIX
            </button>
          </div>

          {/* Cartão + endereço (só no cartão) */}
          {method === 'card' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required className={inputClass} placeholder="CEP" inputMode="numeric" value={customer.postalCode}
                  onChange={(e) => handleCep(e.target.value)} />
                <input required className={inputClass} placeholder="Número" value={customer.addressNumber}
                  onChange={(e) => setCustomer((p) => ({ ...p, addressNumber: e.target.value }))} />
              </div>
              {isCepLoading && <p className="font-dm text-xs text-somma-black/50">Buscando endereço…</p>}
              {customer.street && (
                <p className="font-dm text-xs text-somma-black/60">{customer.street}, {customer.neighborhood} · {customer.city}/{customer.state}</p>
              )}
              <input required className={inputClass} placeholder="Número do cartão" inputMode="numeric" maxLength={19} value={card.number}
                onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))} />
              <input required className={`${inputClass} uppercase`} placeholder="Nome impresso no cartão" value={card.holderName}
                onChange={(e) => setCard((p) => ({ ...p, holderName: e.target.value.toUpperCase() }))} />
              <div className="grid grid-cols-3 gap-3">
                <input required className={inputClass} placeholder="MM" maxLength={2} inputMode="numeric" value={card.expiryMonth}
                  onChange={(e) => setCard((p) => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, '') }))} />
                <input required className={inputClass} placeholder="AAAA" maxLength={4} inputMode="numeric" value={card.expiryYear}
                  onChange={(e) => setCard((p) => ({ ...p, expiryYear: e.target.value.replace(/\D/g, '') }))} />
                <input required className={inputClass} placeholder="CVV" maxLength={4} inputMode="numeric" value={card.ccv}
                  onChange={(e) => setCard((p) => ({ ...p, ccv: e.target.value.replace(/\D/g, '') }))} />
              </div>
            </div>
          )}

          {method === 'pix' && (
            <p className="rounded-xl border-4 border-somma-black bg-somma-yellow px-4 py-3 font-dm text-sm text-somma-black">
              Pagamento único de R$ 75 via PIX. O QR Code aparece na próxima tela.
            </p>
          )}

          <button type="submit"
            className="w-full rounded-xl border-4 border-somma-black bg-somma-orange px-6 py-4 font-bebas text-2xl tracking-wide text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#0a0a0a]">
            Pagar R$ 75
          </button>
          <p className="text-center font-dm text-xs text-somma-black/40">🔒 Pagamento processado com segurança pelo Asaas.</p>
        </form>
      </div>
    </section>
  )
}
