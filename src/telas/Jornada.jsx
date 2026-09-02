import { useState } from 'react'
import { comCifrao, emReais } from '../lib/dinheiro.js'

export default function Jornada({ cofre, ir }) {
  const { historico, saldo, noBanco, patrimonio } = cofre
  const [escolhido, setEscolhido] = useState(null)

  if (historico.length === 0) {
    return (
      <>
        <button className="voltar" onClick={() => ir('inicio')}>
          ← Voltar
        </button>
        <h2>Minha jornada</h2>
        <div className="vazio">
          <div className="porco">📈</div>
          <p>
            Ainda não dá pra desenhar sua jornada. Anote suas primeiras entradas e saídas que os
            gráficos aparecem aqui.
          </p>
        </div>
      </>
    )
  }

  const mes = escolhido ? historico.find((m) => m.chave === escolhido) : null
  const primeiro = historico[0]
  const ultimo = historico[historico.length - 1]
  const cresceu = ultimo.total - primeiro.total

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Minha jornada</h2>

      <div className="saldo-card">
        <small>Tudo que é seu</small>
        <p className="saldo">
          <em>R$</em> {emReais(patrimonio)}
        </p>
        <p className="saldo-sub">
          🐷 {comCifrao(saldo)} no cofrinho
          {noBanco > 0 ? ` · 🏦 ${comCifrao(noBanco)} no banco` : ''}
        </p>
      </div>

      {/* ---- quanto tinha no fim de cada mes ---- */}
      <p className="titulinho">Quanto você já tinha em cada mês</p>
      <div className="grafico">
        <Colunas historico={historico} escolhido={escolhido} escolher={setEscolhido} />
      </div>
      <p className="legenda-grafico">
        Toque numa barra pra ver o mês. A barra mais escura embaixo é o dinheiro que está no banco.
      </p>

      {mes ? (
        <div className="dica branca">
          <strong style={{ textTransform: 'capitalize' }}>
            {new Date(mes.data).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </strong>
          <p>
            Terminou com <b>{comCifrao(mes.total)}</b>
            {mes.banco > 0 ? ` (${comCifrao(mes.cofre)} no cofre e ${comCifrao(mes.banco)} no banco)` : ''}
            . Entrou {comCifrao(mes.entrou)} e saiu {comCifrao(mes.saiu)}.
          </p>
        </div>
      ) : null}

      {/* ---- entrou e saiu ---- */}
      <p className="titulinho">O que entrou e o que saiu</p>
      <div className="chaves">
        <span className="chave">
          <i className="marca entrou" /> Entrou
        </span>
        <span className="chave">
          <i className="marca saiu" /> Saiu
        </span>
      </div>
      <div className="grafico">
        <Divergente historico={historico} escolhido={escolhido} escolher={setEscolhido} />
      </div>

      <div className={'dica ' + (cresceu >= 0 ? 'verde' : 'vermelha')}>
        <strong>
          {cresceu > 0
            ? `📈 Você cresceu ${comCifrao(cresceu)} nesse período`
            : cresceu === 0
              ? '➖ Você terminou onde começou'
              : `📉 Você diminuiu ${comCifrao(-cresceu)} nesse período`}
        </strong>
        <p>
          {cresceu > 0
            ? 'Cada barra dessas é uma escolha sua de guardar em vez de gastar.'
            : 'Tudo bem — dinheiro serve pra usar também. O importante é você saber pra onde ele foi.'}
        </p>
      </div>

      {/* ---- ponte pro banco ---- */}
      <p className="titulinho">🏦 O banco</p>
      {noBanco > 0 ? (
        <div className="cartao">
          <div className="cartao-topo">
            <span>Você tem no banco</span>
            <span>{comCifrao(noBanco)}</span>
          </div>
          <small style={{ marginTop: 0 }}>
            Esse dinheiro continua sendo seu. A diferença é que lá ele cresce sozinho, e aqui no cofre
            ele fica parado esperando.
          </small>
          <button className="btn btn-ghost" onClick={() => ir('entrada', { categoria: 'do-banco' })}>
            Peguei dinheiro de volta do banco
          </button>
        </div>
      ) : (
        <div className="cartao">
          <small style={{ marginTop: 0 }}>
            Você ainda não levou nada pro banco. Moeda no cofre não cresce: {comCifrao(saldo)} daqui a
            um ano continua {comCifrao(saldo)}. Na poupança viraria uns{' '}
            <b>{comCifrao(Math.round(saldo * 1.06))}</b>.
          </small>
        </div>
      )}

      {saldo > 0 ? (
        <button className="btn btn-wide" onClick={() => ir('saida', { categoria: 'banco' })}>
          🏦 Levar uma parte pro banco
        </button>
      ) : null}
      <p className="legenda-grafico">
        Levar pro banco não é gastar. O app guarda esse dinheiro separado e ele continua contando no
        seu total aqui em cima.
      </p>
    </>
  )
}

/* ---------- colunas empilhadas: cofre + banco ---------- */

function Colunas({ historico, escolhido, escolher }) {
  const L = 300
  const A = 130
  const base = A - 20
  const teto = Math.max(...historico.map((m) => m.total), 1)
  const largura = Math.min(38, (L - 16) / historico.length - 10)
  const passo = (L - 16) / historico.length

  return (
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Quanto havia no fim de cada mês">
      <line x1="8" y1={base} x2={L - 8} y2={base} className="eixo" />
      {historico.map((m, i) => {
        const x = 8 + passo * i + (passo - largura) / 2
        const alturaTotal = teto ? Math.round(((base - 22) * m.total) / teto) : 0
        const alturaBanco = teto ? Math.round(((base - 22) * m.banco) / teto) : 0
        const alturaCofre = Math.max(0, alturaTotal - alturaBanco)
        const selecionado = escolhido === m.chave
        return (
          <g
            key={m.chave}
            onClick={() => escolher(selecionado ? null : m.chave)}
            className={'coluna' + (selecionado ? ' escolhida' : '')}
          >
            <rect x={x - 4} y="0" width={largura + 8} height={A} fill="transparent" />
            {alturaBanco > 0 ? (
              <rect
                x={x}
                y={base - alturaBanco}
                width={largura}
                height={alturaBanco}
                rx="4"
                className="marca banco"
              />
            ) : null}
            {alturaCofre > 0 ? (
              // Um vao de 2px separa o cofre do banco: sao dois montes, nao um so.
              <rect
                x={x}
                y={base - alturaTotal}
                width={largura}
                height={Math.max(2, alturaCofre - (alturaBanco > 0 ? 2 : 0))}
                rx="4"
                className="marca entrou"
              />
            ) : null}
            <text x={x + largura / 2} y={base - alturaTotal - 6} className="rotulo-valor">
              {Math.round(m.total / 100)}
            </text>
            <text x={x + largura / 2} y={base + 13} className="rotulo-eixo">
              {m.rotulo}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- barras divergentes: entrou acima, saiu abaixo ---------- */

function Divergente({ historico, escolhido, escolher }) {
  const L = 300
  const A = 150
  const meio = A / 2
  const teto = Math.max(...historico.flatMap((m) => [m.entrou, m.saiu]), 1)
  const largura = Math.min(34, (L - 16) / historico.length - 10)
  const passo = (L - 16) / historico.length
  const escala = (v) => Math.round(((meio - 26) * v) / teto)

  return (
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label="Quanto entrou e quanto saiu por mês">
      <line x1="8" y1={meio} x2={L - 8} y2={meio} className="eixo" />
      {historico.map((m, i) => {
        const x = 8 + passo * i + (passo - largura) / 2
        const hE = escala(m.entrou)
        const hS = escala(m.saiu)
        const selecionado = escolhido === m.chave
        return (
          <g
            key={m.chave}
            onClick={() => escolher(selecionado ? null : m.chave)}
            className={'coluna' + (selecionado ? ' escolhida' : '')}
          >
            <rect x={x - 4} y="0" width={largura + 8} height={A} fill="transparent" />
            {hE > 0 ? (
              <>
                <rect x={x} y={meio - hE - 2} width={largura} height={hE} rx="4" className="marca entrou" />
                <text x={x + largura / 2} y={meio - hE - 8} className="rotulo-valor">
                  {Math.round(m.entrou / 100)}
                </text>
              </>
            ) : null}
            {hS > 0 ? (
              <>
                <rect x={x} y={meio + 2} width={largura} height={hS} rx="4" className="marca saiu" />
                <text x={x + largura / 2} y={meio + hS + 14} className="rotulo-valor">
                  {Math.round(m.saiu / 100)}
                </text>
              </>
            ) : null}
            <text x={x + largura / 2} y={meio - 6} className="rotulo-eixo">
              {hE === 0 && hS === 0 ? m.rotulo : ''}
            </text>
          </g>
        )
      })}
      {historico.map((m, i) => {
        const x = 8 + passo * i + (passo - largura) / 2
        return m.entrou === 0 && m.saiu === 0 ? null : (
          <text
            key={m.chave}
            x={x + largura / 2}
            y={A - 3}
            className="rotulo-eixo"
          >
            {m.rotulo}
          </text>
        )
      })}
    </svg>
  )
}
