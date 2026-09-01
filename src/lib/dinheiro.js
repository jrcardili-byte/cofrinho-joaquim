// Todo valor no app e guardado em CENTAVOS (numero inteiro).
// Assim R$ 0,10 + R$ 0,20 nunca vira R$ 0,30000000000000004.

export function emReais(centavos) {
  const n = Math.abs(centavos) / 100
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function comCifrao(centavos) {
  return (centavos < 0 ? '-R$ ' : 'R$ ') + emReais(centavos)
}

export function comSinal(centavos) {
  if (centavos === 0) return 'R$ 0,00'
  return (centavos > 0 ? '+' : '−') + emReais(centavos)
}

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']

export function quandoFoi(iso) {
  const d = new Date(iso)
  const hoje = new Date()
  const so = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((so(hoje) - so(d)) / 86400000)
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (diff === 0) return `Hoje · ${hora}`
  if (diff === 1) return `Ontem · ${hora}`
  if (diff < 7) return `${DIAS[d.getDay()]} · ${hora}`
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${hora}`
}

export function mesDe(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nomeDoMes(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long' })
}

// Quantos dias faltam para completar `total` dias desde `iso`.
export function diasRestantes(iso, total) {
  const passados = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return Math.max(0, total - passados)
}
