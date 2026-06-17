import { mkdirSync, writeFileSync } from 'node:fs'
import { COUNTDOWN_STEPS } from '../lib/campaign/vip-countdown-steps'
import { renderCountdownEmail } from '../lib/emails/countdown-vip'

const OUT = '/tmp/vip-emails'
mkdirSync(OUT, { recursive: true })

const NOME = 'Ana Carolina'
const UNSUB = 'https://specialday.sommaclub.com.br/unsubscribe?token=DEMO'

const dias = ['Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo', 'Domingo']
const horas = ['20h', '10h', '10h', '10h', '10h', '20h']

const linksIndex: string[] = []

COUNTDOWN_STEPS.forEach((cfg, i) => {
  const { subject, html } = renderCountdownEmail({ nome: NOME, step: cfg.step, unsubscribeUrl: UNSUB })
  const file = `${i + 1}-${cfg.step}.html`
  writeFileSync(`${OUT}/${file}`, html, 'utf8')
  linksIndex.push(
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;"><b>${i + 1}</b></td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${dias[i]} · ${horas[i]}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${subject}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;"><a href="${file}" target="preview">abrir ›</a></td>
    </tr>`
  )
})

const index = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Preview — Campanha VIP</title>
<style>body{font-family:Arial,sans-serif;margin:0;display:flex;height:100vh}
.side{width:46%;min-width:380px;overflow:auto;border-right:1px solid #ddd;padding:18px}
.view{flex:1}iframe{width:100%;height:100%;border:0}
table{border-collapse:collapse;width:100%;font-size:14px}th{text-align:left;padding:10px 14px;background:#0a0a0a;color:#fff}</style></head>
<body><div class="side"><h2>Campanha de escassez — Lista VIP</h2>
<p style="color:#666">Nome de exemplo: <b>${NOME}</b>. Clique em "abrir" para ver cada e-mail à direita.</p>
<table><tr><th>#</th><th>Dia · Hora</th><th>Assunto</th><th></th></tr>
${linksIndex.join('\n')}</table></div>
<div class="view"><iframe name="preview" src="1-d4_anuncio.html"></iframe></div></body></html>`

writeFileSync(`${OUT}/index.html`, index, 'utf8')
console.log(`OK -> ${OUT}/index.html`)
