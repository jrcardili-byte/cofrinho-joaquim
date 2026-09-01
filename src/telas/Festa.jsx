import { comCifrao } from '../lib/dinheiro.js'
import { categoria } from '../lib/cofrinho.js'

export default function Festa({ info, cofre, ir }) {
  if (!info) {
    ir('inicio')
    return null
  }

  const meta = cofre.dados.metas.find((m) => !m.concluidaEm)
  const pct = meta ? Math.min(100, Math.round((info.saldoDepois / meta.alvo) * 100)) : 0
  const falta = meta ? Math.max(0, meta.alvo - info.saldoDepois) : 0

  return (
    <>
      <div className="festa">
        <div className="porco">{emoji(info)}</div>
        <h2>{titulo(info)}</h2>
        <p>
          Agora tem <b>{comCifrao(info.saldoDepois)}</b> dentro do cofrinho
        </p>
        {info.tipo === 'conferencia' && info.diferenca !== 0 && !info.primeiraVez ? (
          <p>
            {info.diferenca > 0 ? 'Apareceram ' : 'Sumiram '}
            {comCifrao(Math.abs(info.diferenca))} desde a última anotação — já está ajustado.
          </p>
        ) : null}
        {info.tipo === 'entrada' ? (
          <p>
            {categoria(info.categoria).icone} {categoria(info.categoria).nome}
          </p>
        ) : null}
      </div>

      {meta ? (
        <div className="cartao">
          <div className="cartao-topo">
            <span>
              {meta.emoji} {meta.nome}
            </span>
            <span>{pct}%</span>
          </div>
          <div className={'barra' + (pct >= 100 ? ' pronta' : '')}>
            <i style={{ width: pct + '%' }} />
          </div>
          <small>
            {falta === 0
              ? 'Você já tem o suficiente pra conquistar! 🎉'
              : `Faltam ${comCifrao(falta)}`}
          </small>
        </div>
      ) : (
        <div className="dica">
          <strong>🎯 Que tal criar um objetivo?</strong>
          <p>Guardar fica muito mais fácil quando você sabe pra quê. Dá pra criar agora.</p>
        </div>
      )}

      <button className="btn btn-wide btn-mint" onClick={() => ir('inicio')}>
        Voltar pro cofrinho
      </button>
      {!meta ? (
        <button className="btn btn-ghost" onClick={() => ir('objetivos')}>
          🎯 Criar um objetivo
        </button>
      ) : null}
    </>
  )
}

function emoji(info) {
  if (info.tipo === 'saida') return '🐷'
  if (info.tipo === 'conferencia') return '🪙'
  return '🐷🎉'
}

function titulo(info) {
  if (info.tipo === 'entrada') return 'Anotado! Dinheiro guardado 🎉'
  if (info.tipo === 'saida') return 'Anotado.'
  if (info.primeiraVez) return 'Pronto, agora você sabe!'
  if (info.diferenca === 0) return 'Bateu certinho!'
  return 'Contagem salva'
}
