# Somma Special Day LP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a landing page oficial do Somma Special Day com formulário de captura de leads VIP integrado ao Supabase.

**Architecture:** Projeto Next.js 14 standalone (App Router + TypeScript + Tailwind) criado do zero em `/Users/alexrodriguesdossantos/Projetos/1-ano-SommaDay`. Server Actions com Supabase service role para inserção segura de leads. GSAP 3 + ScrollSmoother para scroll cinematográfico, desativado em mobile.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, GSAP 3 + ScrollTrigger + ScrollSmoother, React Hook Form, Zod, Supabase JS v2, next/font (Bebas Neue + DM Sans)

---

## File Map

```
/Users/alexrodriguesdossantos/Projetos/1-ano-SommaDay/
├── app/
│   ├── layout.tsx                          # Root layout com fonts e metadata base
│   ├── page.tsx                            # Home: monta todas as seções
│   ├── globals.css                         # Reset, variáveis CSS, smooth-scroll CSS
│   ├── admin/
│   │   └── page.tsx                        # Painel admin protegido por query param
│   └── api/
│       └── admin/
│           └── export/
│               └── route.ts               # GET /api/admin/export?key=... → CSV
├── actions/
│   └── leads.ts                           # Server Action: validar + inserir lead
├── components/
│   ├── SmoothScroll.tsx                   # Client: wrapper GSAP ScrollSmoother
│   ├── Countdown.tsx                      # Client: countdown até 18/07/2026 07h
│   └── special-day/
│       ├── HeroSection.tsx
│       ├── AttractionsSection.tsx
│       ├── ProofSection.tsx
│       ├── MarqueeSection.tsx
│       ├── VipFormSection.tsx
│       ├── FormSuccess.tsx
│       └── FooterSection.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # createBrowserClient
│   │   └── server.ts                      # createClient com service role
│   └── validations/
│       └── lead.ts                        # Schema Zod dos leads
├── public/
│   ├── logo-special-day.png               # Arte do evento
│   └── og-image.jpg                       # 1200x630 para Open Graph
├── .env.local                             # Vars do Supabase (nunca commitado)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: Scaffold do projeto Next.js

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local`, `.gitignore`

- [ ] **Step 1: Criar o projeto**

```bash
cd /Users/alexrodriguesdossantos/Projetos/1-ano-SommaDay
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
```

Responder: Yes para todos os prompts padrão.

- [ ] **Step 2: Instalar dependências**

```bash
npm install gsap @supabase/supabase-js react-hook-form @hookform/resolvers zod
```

- [ ] **Step 3: Configurar `.env.local`**

Criar `/Users/alexrodriguesdossantos/Projetos/1-ano-SommaDay/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
ADMIN_SECRET_KEY=<strong-random-admin-key>
SESSION_SECRET=<strong-random-session-secret>
```

- [ ] **Step 4: Adicionar `.env.local` ao `.gitignore`**

Verificar que `.gitignore` já contém `.env.local`. Se não, adicionar.

- [ ] **Step 5: Commit inicial**

```bash
cd /Users/alexrodriguesdossantos/Projetos/1-ano-SommaDay
git add -A
git commit -m "feat: scaffold Next.js 14 + dependencias"
```

---

## Task 2: Supabase — tabela e clientes

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Criar tabela `vip_leads` no Supabase**

Acessar o Supabase MCP ou SQL Editor do projeto `riqfjewvygqsbuokvsjw` e executar:

```sql
CREATE TABLE IF NOT EXISTS vip_leads (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        text NOT NULL,
  email       text NOT NULL UNIQUE,
  cpf         text NOT NULL UNIQUE,
  telefone    text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  fonte       text DEFAULT 'savethedate-lp'
);

-- RLS desligado: inserção via service role na Server Action
ALTER TABLE vip_leads DISABLE ROW LEVEL SECURITY;
```

- [ ] **Step 2: Criar `lib/supabase/client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Criar `lib/supabase/server.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: supabase clients e tabela vip_leads"
```

---

## Task 3: Schema Zod e Server Action

**Files:**
- Create: `lib/validations/lead.ts`
- Create: `actions/leads.ts`

- [ ] **Step 1: Criar `lib/validations/lead.ts`**

```typescript
import { z } from 'zod'

export const leadSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
  telefone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use (00) 00000-0000'),
})

export type LeadInput = z.infer<typeof leadSchema>
```

- [ ] **Step 2: Criar `actions/leads.ts`**

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { leadSchema } from '@/lib/validations/lead'

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> }

export async function submitLead(formData: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { nome, email, cpf, telefone } = parsed.data

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('vip_leads')
      .insert({ nome, email, cpf, telefone })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Voce ja esta na lista VIP!' }
      }
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/validations/ actions/
git commit -m "feat: validacao Zod e server action de leads"
```

---

## Task 4: globals.css, tailwind.config e layout raiz

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Substituir `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --somma-black:  #0a0a0a;
  --somma-blue:   #0D1B8E;
  --somma-orange: #E8561A;
  --somma-yellow: #FAC775;
  --somma-white:  #f5f2ec;
}

html, body {
  overflow: hidden;
  height: 100%;
  background-color: var(--somma-black);
}

#smooth-wrapper {
  overflow: hidden;
  height: 100vh;
}

#smooth-content {
  will-change: transform;
}

/* Mobile: desabilita overflow:hidden para scroll nativo */
@media (max-width: 767px) {
  html, body {
    overflow: auto;
    height: auto;
  }
  #smooth-wrapper {
    overflow: visible;
    height: auto;
  }
}

/* Animação do separador do countdown */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
.countdown-separator {
  animation: blink 1s ease-in-out infinite;
}
```

- [ ] **Step 2: Atualizar `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './actions/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'somma-black':  '#0a0a0a',
        'somma-blue':   '#0D1B8E',
        'somma-orange': '#E8561A',
        'somma-yellow': '#FAC775',
        'somma-white':  '#f5f2ec',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        dm:    ['var(--font-dm)',    'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Substituir `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dm = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Somma Special Day — 18 de Julho 2026 | Lista VIP',
  description:
    'O evento de aniversario de 1 ano do Somma Club. 400 vagas. 8km de percurso inedito, samba, Red Bull e muito mais.',
  openGraph: {
    title: 'Somma Special Day — 18 de Julho 2026 | Lista VIP',
    description:
      'O evento de aniversario de 1 ano do Somma Club. 400 vagas. 8km de percurso inedito, samba, Red Bull e muito mais.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${dm.variable}`}>
      <body className="font-dm bg-somma-black text-somma-white antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts app/layout.tsx
git commit -m "feat: estilos globais, paleta Somma e layout raiz"
```

---

## Task 5: SmoothScroll e Countdown components

**Files:**
- Create: `components/SmoothScroll.tsx`
- Create: `components/Countdown.tsx`

- [ ] **Step 1: Criar `components/SmoothScroll.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const smootherRef = useRef<ScrollSmoother | null>(null)

  useEffect(() => {
    if (window.innerWidth < 768) return

    const ctx = gsap.context(() => {
      smootherRef.current = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
        normalizeScroll: true,
      })
    })

    return () => {
      ctx.revert()
      smootherRef.current = null
    }
  }, [])

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/Countdown.tsx`**

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

const TARGET = new Date('2026-07-18T07:00:00-03:00').getTime()

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now())
  const days    = Math.floor(diff / 86_400_000)
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000)  / 60_000)
  const seconds = Math.floor((diff % 60_000)     / 1_000)
  return { days, hours, minutes, seconds }
}

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const secondsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setTime(getTimeLeft())

    const id = setInterval(() => {
      setTime(getTimeLeft())
      if (secondsRef.current) {
        gsap.from(secondsRef.current, { y: -8, opacity: 0, duration: 0.25, ease: 'power2.out' })
      }
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const { days, hours, minutes, seconds } = time

  return (
    <div className="flex items-center gap-2 font-bebas text-4xl md:text-6xl text-somma-yellow">
      <Unit label="DIAS"    value={pad(days)}    />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="HORAS"   value={pad(hours)}   />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="MIN"     value={pad(minutes)} />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="SEG"     value={pad(seconds)} ref={secondsRef} />
    </div>
  )
}

import { forwardRef } from 'react'
const Unit = forwardRef<HTMLSpanElement, { label: string; value: string }>(
  function Unit({ label, value }, ref) {
    return (
      <div className="flex flex-col items-center">
        <span ref={ref} className="tabular-nums">{value}</span>
        <span className="text-xs font-dm text-somma-white/50 tracking-widest">{label}</span>
      </div>
    )
  }
)
```

- [ ] **Step 3: Commit**

```bash
git add components/
git commit -m "feat: SmoothScroll GSAP e Countdown components"
```

---

## Task 6: HeroSection

**Files:**
- Create: `components/special-day/HeroSection.tsx`

- [ ] **Step 1: Criar `components/special-day/HeroSection.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import Countdown from '@/components/Countdown'

export default function HeroSection() {
  const logoRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 1.2,
        ease: 'power3.out',
      })
      gsap.from(countdownRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        ease: 'power2.out',
      })
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.0,
        ease: 'power2.out',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-somma-blue"
      data-speed="0.8"
    >
      {/* Fundo decorativo */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#FAC775,transparent_70%)]" />

      <div ref={logoRef} className="relative z-10 flex flex-col items-center">
        <Image
          src="/logo-special-day.png"
          alt="Somma Special Day"
          width={420}
          height={420}
          priority
          className="w-64 md:w-96 lg:w-[420px] drop-shadow-2xl"
        />
        <p className="mt-4 font-dm text-somma-white/80 text-sm md:text-base tracking-widest uppercase">
          18 de Julho de 2026 — COPMDF, Brasilia
        </p>
      </div>

      <div ref={countdownRef} className="relative z-10 mt-10">
        <Countdown />
      </div>

      <a
        ref={ctaRef}
        href="#formulario"
        className="relative z-10 mt-10 inline-block bg-somma-orange hover:bg-somma-orange/90 text-somma-white font-bebas text-2xl tracking-widest px-10 py-4 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        Garantir meu lugar na Lista VIP
      </a>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/special-day/HeroSection.tsx
git commit -m "feat: HeroSection com logo, countdown e CTA"
```

---

## Task 7: AttractionsSection e ProofSection

**Files:**
- Create: `components/special-day/AttractionsSection.tsx`
- Create: `components/special-day/ProofSection.tsx`

- [ ] **Step 1: Criar `components/special-day/AttractionsSection.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ATTRACTIONS = [
  { emoji: '🏃', title: '8km Percurso Inédito', desc: 'Região das embaixadas com vista para o Lago Paranoá' },
  { emoji: '🍳', title: 'Café da Manhã Big Box', desc: 'Café especial para todos os participantes' },
  { emoji: '🥋', title: 'Red Bull', desc: 'Coolers, ativação e kit exclusivo' },
  { emoji: '💪', title: 'Academia Evolve', desc: 'Aulas exclusivas no evento' },
  { emoji: '🎶', title: 'Roda de Samba ao Vivo', desc: '08h às 11h — comemore correndo e sambando' },
  { emoji: '🎧', title: 'DJ até 15h', desc: 'A festa continua depois da chegada' },
  { emoji: '🏐', title: 'Futevôlei + Altinha + Recovery', desc: 'Atividades extras para quem fica' },
  { emoji: '🎯', title: 'Gincana Somma', desc: 'Competição interna com premiação' },
  { emoji: '👕', title: 'Kit Exclusivo', desc: 'Camiseta Thermodry Track&Field + Gym Bag + brindes' },
  { emoji: '🍺', title: 'Bar Somma', desc: 'Corona, Heineken, drinks e combos em baldes' },
  { emoji: '🍽️', title: 'Almoço a Custo Popular', desc: 'Não precisa sair com fome' },
]

export default function AttractionsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.attraction-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-24 px-4 bg-somma-black">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-bebas text-5xl md:text-7xl text-somma-yellow text-center mb-4 tracking-wider">
          O que vai rolar
        </h2>
        <p className="font-dm text-somma-white/60 text-center mb-14 text-lg">
          Um sábado inteiro de celebração. 400 vagas. Não fique de fora.
        </p>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATTRACTIONS.map((a) => (
            <div
              key={a.title}
              className="attraction-card bg-somma-blue/20 border border-somma-blue/30 rounded-2xl p-6 flex gap-4"
            >
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <p className="font-bebas text-xl text-somma-yellow tracking-wide">{a.title}</p>
                <p className="font-dm text-somma-white/70 text-sm mt-1">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Criar `components/special-day/ProofSection.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 4000, suffix: '+', label: 'Membros no Somma Club' },
  { value: 400,  suffix: '',  label: 'Vagas disponíveis' },
  { value: 1,    suffix: ' ANO', label: 'De história e corrida' },
]

export default function ProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      STATS.forEach((stat, i) => {
        const el = document.querySelector(`#stat-${i}`)
        if (!el) return
        gsap.from({ val: 0 }, {
          val: stat.value,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
          onUpdate: function () {
            el.textContent = Math.round(this.targets()[0].val).toLocaleString('pt-BR') + stat.suffix
          },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-somma-blue">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <p id={`stat-${i}`} className="font-bebas text-6xl md:text-8xl text-somma-yellow">
              {stat.value.toLocaleString('pt-BR')}{stat.suffix}
            </p>
            <p className="font-dm text-somma-white/70 mt-2 text-sm tracking-widest uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/special-day/
git commit -m "feat: AttractionsSection e ProofSection com animacoes GSAP"
```

---

## Task 8: MarqueeSection

**Files:**
- Create: `components/special-day/MarqueeSection.tsx`

- [ ] **Step 1: Criar `components/special-day/MarqueeSection.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const PARTNERS = [
  'Red Bull', 'Track & Field', 'Academia Evolve', 'Corona', 'Heineken',
  'Big Box', 'Somma Club', 'COPMDF', 'Red Bull', 'Track & Field',
  'Academia Evolve', 'Corona', 'Heineken', 'Big Box', 'Somma Club',
]

export default function MarqueeSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      if (!track) return
      const totalWidth = track.scrollWidth / 2

      gsap.to(track, {
        x: -totalWidth,
        repeat: -1,
        ease: 'none',
        duration: 18,
        modifiers: {
          x: gsap.utils.unitize((x: number) => parseFloat(x) % totalWidth),
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-8 bg-somma-orange overflow-hidden">
      <div ref={trackRef} className="flex gap-12 whitespace-nowrap will-change-transform">
        {[...PARTNERS, ...PARTNERS].map((name, i) => (
          <span key={i} className="font-bebas text-2xl text-somma-white tracking-[0.2em]">
            {name} <span className="text-somma-yellow">*</span>
          </span>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/special-day/MarqueeSection.tsx
git commit -m "feat: MarqueeSection com loop GSAP seamless"
```

---

## Task 9: FormSuccess e VipFormSection

**Files:**
- Create: `components/special-day/FormSuccess.tsx`
- Create: `components/special-day/VipFormSection.tsx`

- [ ] **Step 1: Criar `components/special-day/FormSuccess.tsx`**

```typescript
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function FormSuccess() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from(ref.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.4)',
    })
  }, [])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const whatsappText = encodeURIComponent(
    `Vai ter o Somma Special Day dia 18/07! Entra na lista VIP: ${shareUrl}`
  )

  return (
    <div ref={ref} className="text-center py-12 px-6">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="font-bebas text-4xl text-somma-yellow tracking-wider mb-4">
        Voce esta na lista!
      </h3>
      <p className="font-dm text-somma-white/80 text-base max-w-md mx-auto mb-8 leading-relaxed">
        Assim que as inscricoes abrirem, voce recebe no WhatsApp e e-mail com
        acesso antecipado e desconto exclusivo.
        <br />
        <strong className="text-somma-yellow">18 de julho. COPMDF. Nos vemos na largada.</strong>
      </p>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-500 hover:bg-green-600 text-white font-bebas text-xl tracking-widest px-8 py-4 rounded-full transition-transform hover:scale-105"
      >
        Chama um amigo
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Criar `components/special-day/VipFormSection.tsx`**

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'
import { submitLead } from '@/actions/leads'
import FormSuccess from './FormSuccess'

gsap.registerPlugin(ScrollTrigger)

function maskCpf(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function VipFormSection() {
  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({ resolver: zodResolver(leadSchema) })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 60,
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 75%',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  async function onSubmit(data: LeadInput) {
    setServerError('')
    const result = await submitLead(data)
    if (result.success) {
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.4,
          onComplete: () => setSubmitted(true),
        })
      } else {
        setSubmitted(true)
      }
    } else {
      setServerError(result.error)
    }
  }

  return (
    <section id="formulario" className="py-24 px-4 bg-somma-black">
      <div className="max-w-lg mx-auto">
        <div ref={cardRef} className="bg-somma-blue/20 border border-somma-blue/40 rounded-3xl p-8 md:p-12">
          {submitted ? (
            <FormSuccess />
          ) : (
            <div ref={formRef}>
              <h2 className="font-bebas text-4xl md:text-5xl text-somma-yellow text-center tracking-wider mb-2">
                Entre na Lista VIP
              </h2>
              <p className="font-dm text-somma-white/60 text-center text-sm mb-8">
                Acesso antecipado e desconto exclusivo no 1 lote
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <Field label="Nome completo" error={errors.nome?.message}>
                  <input
                    {...register('nome')}
                    placeholder="Seu nome completo"
                    className={inputClass(!!errors.nome)}
                  />
                </Field>

                <Field label="E-mail" error={errors.email?.message}>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass(!!errors.email)}
                  />
                </Field>

                <Field label="CPF" error={errors.cpf?.message}>
                  <input
                    {...register('cpf')}
                    placeholder="000.000.000-00"
                    onChange={(e) => setValue('cpf', maskCpf(e.target.value), { shouldValidate: true })}
                    className={inputClass(!!errors.cpf)}
                  />
                </Field>

                <Field label="WhatsApp" error={errors.telefone?.message}>
                  <input
                    {...register('telefone')}
                    placeholder="(61) 99999-9999"
                    onChange={(e) => setValue('telefone', maskPhone(e.target.value), { shouldValidate: true })}
                    className={inputClass(!!errors.telefone)}
                  />
                </Field>

                {serverError && (
                  <p className="text-red-400 text-sm font-dm text-center">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-somma-orange hover:bg-somma-orange/90 disabled:opacity-60 disabled:cursor-not-allowed text-somma-white font-bebas text-2xl tracking-widest py-4 rounded-full transition-transform hover:scale-105 active:scale-95 mt-2"
                >
                  {isSubmitting ? 'Garantindo seu lugar...' : 'Garantir meu lugar'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-dm text-somma-white/80 text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs font-dm">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return [
    'bg-somma-black/50 border rounded-xl px-4 py-3 font-dm text-somma-white placeholder-somma-white/30',
    'focus:outline-none focus:ring-2 transition',
    hasError
      ? 'border-red-500 focus:ring-red-500/40'
      : 'border-somma-blue/40 focus:ring-somma-yellow/40',
  ].join(' ')
}
```

- [ ] **Step 3: Commit**

```bash
git add components/special-day/FormSuccess.tsx components/special-day/VipFormSection.tsx
git commit -m "feat: formulario VIP com mascaras, validacao e tela de sucesso"
```

---

## Task 10: FooterSection e page.tsx principal

**Files:**
- Create: `components/special-day/FooterSection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Criar `components/special-day/FooterSection.tsx`**

```typescript
export default function FooterSection() {
  return (
    <footer className="py-16 px-4 bg-somma-black border-t border-somma-blue/20 text-center">
      <p className="font-bebas text-3xl text-somma-yellow tracking-widest mb-2">
        Somma Special Day
      </p>
      <p className="font-dm text-somma-white/50 text-sm mb-1">
        18 de Julho de 2026, 06h — COPMDF, Setor de Clubes Sul, Brasilia
      </p>
      <p className="font-dm text-somma-white/50 text-sm">
        Contato: Priscila Salviano · (61) 99537-2477 · contato@sommaclub.com.br
      </p>
      <p className="font-dm text-somma-white/20 text-xs mt-8">
        Somma Running Club © 2026
      </p>
    </footer>
  )
}
```

- [ ] **Step 2: Substituir `app/page.tsx`**

```typescript
import SmoothScroll from '@/components/SmoothScroll'
import HeroSection from '@/components/special-day/HeroSection'
import AttractionsSection from '@/components/special-day/AttractionsSection'
import ProofSection from '@/components/special-day/ProofSection'
import MarqueeSection from '@/components/special-day/MarqueeSection'
import VipFormSection from '@/components/special-day/VipFormSection'
import FooterSection from '@/components/special-day/FooterSection'

export default function Home() {
  return (
    <SmoothScroll>
      <HeroSection />
      <AttractionsSection />
      <ProofSection />
      <MarqueeSection />
      <VipFormSection />
      <FooterSection />
    </SmoothScroll>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/special-day/FooterSection.tsx app/page.tsx
git commit -m "feat: FooterSection e page.tsx montando todas as secoes"
```

---

## Task 11: Painel Admin e exportação CSV

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/api/admin/export/route.ts`

- [ ] **Step 1: Criar `app/admin/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

interface Lead {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  created_at: string
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { key?: string }
}) {
  if (searchParams.key !== process.env.ADMIN_SECRET_KEY) {
    redirect('/')
  }

  const supabase = createServerClient()
  const { data: leads } = await supabase
    .from('vip_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (leads ?? []) as Lead[]

  return (
    <main className="min-h-screen bg-somma-black text-somma-white p-8 font-dm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bebas text-4xl text-somma-yellow tracking-wider">
              Lista VIP — Admin
            </h1>
            <p className="text-somma-white/60 text-sm mt-1">
              {rows.length} pessoa{rows.length !== 1 ? 's' : ''} na lista
            </p>
          </div>
          <a
            href={`/api/admin/export?key=${searchParams.key}`}
            className="bg-somma-orange hover:bg-somma-orange/90 text-white font-bebas text-lg tracking-widest px-6 py-3 rounded-full transition"
          >
            Exportar CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-somma-blue/30">
          <table className="w-full text-sm">
            <thead className="bg-somma-blue/30 text-somma-yellow font-bebas text-base tracking-wide">
              <tr>
                {['Nome', 'E-mail', 'CPF', 'Telefone', 'Data'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={i % 2 === 0 ? 'bg-somma-black' : 'bg-somma-blue/10'}
                >
                  <td className="px-4 py-3">{lead.nome}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.cpf}</td>
                  <td className="px-4 py-3">{lead.telefone}</td>
                  <td className="px-4 py-3 text-somma-white/50">
                    {new Date(lead.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-somma-white/40">
                    Nenhum lead ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Criar `app/api/admin/export/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Lead {
  nome: string
  email: string
  cpf: string
  telefone: string
  created_at: string
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('vip_leads')
    .select('nome, email, cpf, telefone, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as Lead[]
  const header = 'Nome,Email,CPF,Telefone,Data\n'
  const body = rows
    .map((r) =>
      [r.nome, r.email, r.cpf, r.telefone, new Date(r.created_at).toLocaleString('pt-BR')]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n')

  return new NextResponse(header + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="vip-leads.csv"',
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/ app/api/
git commit -m "feat: painel admin e exportacao CSV"
```

---

## Task 12: next.config e verificação final

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Atualizar `next.config.ts`**

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    formats: ['image/webp'],
  },
}

export default config
```

- [ ] **Step 2: Build de verificação**

```bash
npm run build
```

Esperado: build sem erros de TypeScript. Warnings de `any` devem ser zero.

- [ ] **Step 3: Rodar em dev e verificar**

```bash
npm run dev
```

Acessar:
- `http://localhost:3000` — LP completa
- `http://localhost:3000/login-admin` — painel admin

- [ ] **Step 4: Commit final**

```bash
git add next.config.ts
git commit -m "feat: next.config e LP Somma Special Day completa"
```

---

## Self-Review

**Spec coverage:**
- [x] Scaffold Next.js 14 App Router + TypeScript + Tailwind — Task 1
- [x] Supabase tabela `vip_leads` + clientes — Task 2
- [x] Validação Zod + Server Action com tratamento de conflito — Task 3
- [x] Paleta CSS, globals, layout com fonts — Task 4
- [x] ScrollSmoother (desktop only) + Countdown ao vivo — Task 5
- [x] Hero com GSAP, logo, countdown, CTA — Task 6
- [x] Atrações com stagger ScrollTrigger — Task 7
- [x] Prova social com counters animados — Task 7
- [x] Marquee infinita GSAP — Task 8
- [x] Formulário VIP com máscaras JS puro, estados de loading/erro/sucesso — Task 9
- [x] Tela de sucesso com botão WhatsApp — Task 9
- [x] Footer — Task 10
- [x] Admin protegido por query param — Task 11
- [x] Exportação CSV — Task 11
- [x] Build limpo sem `any` — Task 12

**Nenhum placeholder ou TBD encontrado.**
