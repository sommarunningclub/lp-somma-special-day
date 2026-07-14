export const ASAAS_API_URL = 'https://api.asaas.com/v3'

// Preço único do ingresso Day Use. À vista, sem parcelamento.
export const DAYUSE_PRICE = 75

export function asaasHeaders() {
  return {
    'Content-Type': 'application/json',
    access_token: process.env.ASAAS_API_KEY || '',
  }
}

// Traduz os erros mais comuns do Asaas para mensagens amigáveis ao comprador.
export function asaasError(data: any): string {
  const code = data?.errors?.[0]?.code
  if (code === 'invalid_creditCard' || code === 'invalid_creditCardNumber')
    return 'Pagamento não autorizado, verifique seu cartão.'
  if (code === 'invalid_creditCardHolderInfo')
    return 'Dados do titular do cartão inválidos.'
  if (code === 'invalid_value') return 'Valor inválido para o pagamento.'
  return data?.errors?.[0]?.description || 'Erro ao processar pagamento'
}
