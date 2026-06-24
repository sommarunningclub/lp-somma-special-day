import Reveal from '@/components/esquenta/Reveal'
import { JuninoIcon } from '@/components/esquenta/JuninoIcons'

export default function ContestRules({ rules }: { rules?: string }) {
  return (
    <div className="space-y-4">
      <Reveal className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-somma-orange/50 bg-somma-orange/[0.06] p-4">
        <JuninoIcon name="chapeu" className="mt-0.5 h-6 w-6 shrink-0 text-somma-orange" />
        <p className="font-dm text-sm leading-relaxed text-somma-black/75">
          Caracterização <strong>não é obrigatória</strong>, mas quem entra no clima curte (e concorre) muito mais. Fica a dica. 😉
        </p>
      </Reveal>
      {rules && rules.trim() && (
        <Reveal delay={60} className="rounded-2xl border-4 border-somma-black bg-white p-5 shadow-[4px_4px_0_#0a0a0a]">
          <p className="mb-2 font-bebas text-xl uppercase tracking-wide text-somma-black">Regulamento</p>
          <p className="whitespace-pre-line font-dm text-sm leading-relaxed text-somma-black/75">{rules}</p>
        </Reveal>
      )}
    </div>
  )
}
