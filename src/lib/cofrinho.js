import { useCallback, useEffect, useMemo, useState } from 'react'
import { mesDe } from './dinheiro.js'

const CHAVE = 'cofrinho.joaquim.v1'

export const CEDULAS = [
  { valor: 20000, rotulo: 'R$ 200', icone: '💵' },
  { valor: 10000, rotulo: 'R$ 100', icone: '💵' },
  { valor: 5000, rotulo: 'R$ 50', icone: '💵' },
  { valor: 2000, rotulo: 'R$ 20', icone: '💵' },
  { valor: 1000, rotulo: 'R$ 10', icone: '💵' },
  { valor: 500, rotulo: 'R$ 5', icone: '💵' },
  { valor: 200, rotulo: 'R$ 2', icone: '💵' },
  { valor: 100, rotulo: 'R$ 1', icone: '🪙' },
  { valor: 50, rotulo: '50 centavos', icone: '🪙' },
  { valor: 25, rotulo: '25 centavos', icone: '🪙' },
  { valor: 10, rotulo: '10 centavos', icone: '🪙' },
  { valor: 5, rotulo: '5 centavos', icone: '🪙' }
]

export const ORIGENS = [
  { id: 'presente', nome: 'Presente', icone: '🎁' },
  { id: 'vo', nome: 'Moedas da vó', icone: '👵' },
  { id: 'mesada', nome: 'Mesada', icone: '🪙' },
  { id: 'tarefa', nome: 'Tarefa', icone: '🧹' },
  { id: 'troco', nome: 'Troco que sobrou', icone: '💰' },
  { id: 'vendi', nome: 'Vendi algo', icone: '💼' },
  { id: 'outro-e', nome: 'Outro', icone: '✨' }
]

export const DESTINOS = [
  { id: 'brinquedo', nome: 'Brinquedo', icone: '🧸' },
  { id: 'jogo', nome: 'Jogo', icone: '🎮' },
  { id: 'lanche', nome: 'Lanche', icone: '🍦' },
  { id: 'passeio', nome: 'Passeio', icone: '🍿' },
  { id: 'presente-alguem', nome: 'Presente pra alguém', icone: '🎁' },
  { id: 'banco', nome: 'Levei pro banco', icone: '🏦' },
  { id: 'outro-s', nome: 'Outro', icone: '✨' }
]

export function categoria(id) {
  return (
    ORIGENS.find((c) => c.id === id) ||
    DESTINOS.find((c) => c.id === id) || { id, nome: 'Outro', icone: '✨' }
  )
}

const INICIAL = {
  versao: 1,
  nome: 'Joaquim',
  lancamentos: [], // { id, tipo: entrada|saida|ajuste, valor, categoria, nota, data }
  metas: [], // { id, nome, emoji, alvo, criadaEm, concluidaEm }
  conferencias: [], // { id, data, contagem, total, anotado }
  esperando: [] // { id, valor, categoria, data }
}

function carregar() {
  try {
    const cru = localStorage.getItem(CHAVE)
    if (!cru) return INICIAL
    return { ...INICIAL, ...JSON.parse(cru) }
  } catch {
    return INICIAL
  }
}

const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useCofrinho() {
  const [dados, setDados] = useState(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(dados))
    } catch {
      // Sem espaco no navegador: o app continua funcionando nesta sessao.
    }
  }, [dados])

  const registrar = useCallback((tipo, valor, cat, nota = '') => {
    if (!valor || valor <= 0) return
    setDados((d) => ({
      ...d,
      lancamentos: [
        { id: novoId(), tipo, valor, categoria: cat, nota, data: new Date().toISOString() },
        ...d.lancamentos
      ]
    }))
  }, [])

  // Contagem do cofre de verdade. Se nao bater com o anotado, grava o ajuste.
  const conferir = useCallback((contagem, anotado) => {
    const total = Object.entries(contagem).reduce((s, [v, q]) => s + Number(v) * q, 0)
    const diferenca = total - anotado
    setDados((d) => {
      const conf = {
        id: novoId(),
        data: new Date().toISOString(),
        contagem,
        total,
        anotado
      }
      const lancs = [...d.lancamentos]
      if (diferenca !== 0) {
        lancs.unshift({
          id: novoId(),
          tipo: 'ajuste',
          valor: diferenca,
          categoria: 'conferencia',
          nota: 'Conferi o cofrinho',
          data: conf.data
        })
      }
      return { ...d, lancamentos: lancs, conferencias: [conf, ...d.conferencias] }
    })
    return { total, diferenca }
  }, [])

  const criarMeta = useCallback((nome, emoji, alvo) => {
    setDados((d) => ({
      ...d,
      metas: [
        ...d.metas,
        { id: novoId(), nome, emoji, alvo, criadaEm: new Date().toISOString(), concluidaEm: null }
      ]
    }))
  }, [])

  const removerMeta = useCallback((id) => {
    setDados((d) => ({ ...d, metas: d.metas.filter((m) => m.id !== id) }))
  }, [])

  const concluirMeta = useCallback((id) => {
    setDados((d) => ({
      ...d,
      metas: d.metas.map((m) =>
        m.id === id ? { ...m, concluidaEm: m.concluidaEm ? null : new Date().toISOString() } : m
      )
    }))
  }, [])

  const esperar = useCallback((valor, cat) => {
    setDados((d) => ({
      ...d,
      esperando: [
        { id: novoId(), valor, categoria: cat, data: new Date().toISOString() },
        ...d.esperando
      ]
    }))
  }, [])

  const encerrarEspera = useCallback((id) => {
    setDados((d) => ({ ...d, esperando: d.esperando.filter((e) => e.id !== id) }))
  }, [])

  const trocarNome = useCallback((nome) => setDados((d) => ({ ...d, nome })), [])

  const apagarTudo = useCallback(() => setDados(INICIAL), [])

  const resumo = useMemo(() => calcular(dados), [dados])

  return {
    dados,
    ...resumo,
    registrar,
    conferir,
    criarMeta,
    removerMeta,
    concluirMeta,
    esperar,
    encerrarEspera,
    trocarNome,
    apagarTudo
  }
}

function calcular(dados) {
  const { lancamentos } = dados

  const saldo = lancamentos.reduce((s, l) => {
    if (l.tipo === 'entrada') return s + l.valor
    if (l.tipo === 'saida') return s - l.valor
    return s + l.valor // ajuste ja vem com sinal
  }, 0)

  const mesAtual = mesDe(new Date().toISOString())
  const doMes = lancamentos.filter((l) => mesDe(l.data) === mesAtual)
  const entrouNoMes = doMes.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const saiuNoMes = doMes.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)

  // De onde veio o dinheiro (todas as entradas, por categoria).
  const porOrigem = {}
  for (const l of lancamentos) {
    if (l.tipo !== 'entrada') continue
    porOrigem[l.categoria] = (porOrigem[l.categoria] || 0) + l.valor
  }
  const totalEntradas = Object.values(porOrigem).reduce((s, v) => s + v, 0)
  const origens = Object.entries(porOrigem)
    .map(([id, valor]) => ({
      id,
      valor,
      fatia: totalEntradas ? Math.round((valor / totalEntradas) * 100) : 0
    }))
    .sort((a, b) => b.valor - a.valor)

  return {
    saldo,
    entrouNoMes,
    saiuNoMes,
    origens,
    totalEntradas,
    sequencia: contarSequencia(lancamentos),
    ultimaConferencia: dados.conferencias[0] || null
  }
}

// Semanas seguidas em que entrou algum dinheiro no cofre.
// A semana atual so quebra a sequencia depois que ela termina.
function contarSequencia(lancamentos) {
  const semanas = new Set(
    lancamentos.filter((l) => l.tipo === 'entrada').map((l) => chaveSemana(new Date(l.data)))
  )
  if (semanas.size === 0) return 0

  let n = 0
  const cursor = new Date()
  if (!semanas.has(chaveSemana(cursor))) cursor.setDate(cursor.getDate() - 7) // semana em aberto
  while (semanas.has(chaveSemana(cursor))) {
    n += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return n
}

function chaveSemana(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  x.setDate(x.getDate() - x.getDay()) // volta pro domingo
  return x.toISOString().slice(0, 10)
}
