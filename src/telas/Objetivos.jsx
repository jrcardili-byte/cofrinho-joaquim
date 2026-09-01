import { useState } from 'react'
import { comCifrao, emReais } from '../lib/dinheiro.js'

const EMOJIS = ['🎮', '🚲', '⚽', '🎧', '📱', '🧩', '🎸', '👟', '🐶', '🎁']

export default function Objetivos({ cofre, ir }) {
  const { dados, saldo, entrouNoMes, saiuNoMes } = cofre
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [emoji, setEmoji] = useState('🎮')
  const [alvo, setAlvo] = useState('')

  const ritmo = Math.max(0, entrouNoMes - saiuNoMes)
  const abertos = dados.metas.filter((m) => !m.concluidaEm)
  const feitos = dados.metas.filter((m) => m.concluidaEm)

  function criar(e) {
    e.preventDefault()
    const centavos = Math.round(parseFloat(alvo.replace(',', '.')) * 100)
    if (!nome.trim() || !centavos || centavos <= 0) return
    cofre.criarMeta(nome.trim(), emoji, centavos)
    setNome('')
    setAlvo('')
    setCriando(false)
  }

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Meus objetivos</h2>

      {abertos.length === 0 && !criando ? (
        <div className="vazio">
          <div className="porco">🎯</div>
          <p>
            Guardar fica bem mais fácil quando tem um motivo. O que você quer comprar com o dinheiro
            do cofrinho?
          </p>
        </div>
      ) : null}

      {abertos.map((m) => (
        <Objetivo key={m.id} meta={m} saldo={saldo} ritmo={ritmo} cofre={cofre} />
      ))}

      {criando ? (
        <form className="cartao" onSubmit={criar}>
          <label className="rotulo" htmlFor="nome-meta">
            O que você quer?
          </label>
          <input
            id="nome-meta"
            className="campo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nintendo Switch"
            maxLength={40}
            autoFocus
          />

          <label className="rotulo">Escolha um desenho</label>
          <div className="fichas" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                className="ficha"
                aria-pressed={emoji === e}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>

          <label className="rotulo" htmlFor="alvo-meta">
            Quanto custa? (em reais)
          </label>
          <input
            id="alvo-meta"
            className="campo"
            value={alvo}
            onChange={(e) => setAlvo(e.target.value.replace(/[^\d,.]/g, ''))}
            inputMode="decimal"
            placeholder="400,00"
          />

          <button className="btn btn-wide btn-mint" type="submit">
            Criar objetivo
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setCriando(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <button className="btn btn-wide" onClick={() => setCriando(true)}>
          ＋ Criar objetivo
        </button>
      )}

      {feitos.length > 0 ? (
        <>
          <p className="titulinho">Já conquistei 🏆</p>
          {feitos.map((m) => (
            <div className="linha" key={m.id}>
              <div className="ic up">{m.emoji}</div>
              <div className="linha-txt">
                <strong>{m.nome}</strong>
                <small>{comCifrao(m.alvo)}</small>
              </div>
              <button className="ficha" onClick={() => cofre.concluirMeta(m.id)}>
                reabrir
              </button>
            </div>
          ))}
        </>
      ) : null}
    </>
  )
}

function Objetivo({ meta, saldo, ritmo, cofre }) {
  const pct = Math.min(100, Math.round((saldo / meta.alvo) * 100))
  const falta = Math.max(0, meta.alvo - saldo)
  const meses = ritmo > 0 && falta > 0 ? Math.ceil(falta / ritmo) : null

  return (
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
        {comCifrao(saldo)} de {comCifrao(meta.alvo)}
        {falta > 0 ? ` · faltam ${comCifrao(falta)}` : ' · conseguiu! 🎉'}
      </small>
      {meses ? (
        <small>
          Guardando R$ {emReais(ritmo)} por mês, você chega em <b>{quandoChega(meses)}</b>.
        </small>
      ) : null}
      {falta === 0 ? (
        <button
          className="btn btn-wide btn-mint"
          style={{ fontSize: 15 }}
          onClick={() => cofre.concluirMeta(meta.id)}
        >
          🏆 Conquistei!
        </button>
      ) : null}
      <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => cofre.removerMeta(meta.id)}>
        Apagar objetivo
      </button>
    </div>
  )
}

function quandoChega(meses) {
  const d = new Date()
  d.setMonth(d.getMonth() + meses)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
