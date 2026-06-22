/**
 * Cupom ativo nos disparos de e-mail.
 * Separado de PRESALE (lib/presale-constants) propositalmente: a home
 * mantem PRESALE como esta, e so os templates de e-mail apontam pra
 * este aqui. Trocar de cupom = editar este arquivo.
 */
export const EMAIL_COUPON = {
  cupom: 'SOMMA15',

  /** Preco cheio (sem cupom). */
  precoDe: 'R$ 150,00',
  /** Preco com cupom aplicado (15% off em R$ 150). */
  precoPor: 'R$ 127,50',
  /** Valor economizado em reais. */
  economia: 'R$ 22,50',
  /** Percentual do cupom. */
  descontoPct: '15%',

  loteLabel: '1º lote',
} as const
