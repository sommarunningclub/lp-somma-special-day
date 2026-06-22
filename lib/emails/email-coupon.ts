/**
 * Cupom ativo nos disparos de e-mail.
 * Separado de PRESALE (lib/presale-constants) propositalmente: a home
 * mantem PRESALE como esta, e so os templates de e-mail apontam pra
 * este aqui. Trocar de cupom = editar este arquivo.
 */
export const EMAIL_COUPON = {
  cupom: 'SOMMA15',

  /** Preco antes do cupom (base do 1º lote). */
  precoDe: 'R$ 127,50',
  /** Preco com cupom aplicado (15% off). */
  precoPor: 'R$ 108,38',
  /** Valor economizado em reais. */
  economia: 'R$ 19,12',
  /** Percentual do cupom. */
  descontoPct: '15%',

  loteLabel: '1º lote',
} as const
