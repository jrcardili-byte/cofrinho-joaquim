import { useMemo, useState } from 'react'
import { CEDULAS } from '../lib/cofrinho.js'
import { comCifrao } from '../lib/dinheiro.js'

export default function Contar({ cofre, ir, comemorar }) {
  const primeiraVez = cofre.dados.lancamentos.length === 0
  const [contagem, setContagem] = useState(() =>
    Object.fromEntries(CEDULAS.map((c) => [c.valor, 0]))
  )

  const total = useMemo(
    () => Object.entries(contagem).reduce((s, [v, q]) => s + Number(v) * q, 0),
    [contagem]
  )
  const diferenca = total - cofre.saldo

  function mexer(valor, delta) {
    setContagem((c) => ({ ...c, [valor]: Math.max(0, c[valor] + delta) }))
  }

  function salvar() {
    cofre.conferir(contagem, cofre.saldo)
    comemorar({ tipo: 'conferencia', total, diferenca, saldoDepois: total, primeiraVez })
  }

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>{primeiraVez ? 'Vamos contar seu cofrinho' : 'Conferindo o cofrinho'}</h2>
      <p className="aviso" style={{ textAlign: 'left', margin: '6px 0 12px' }}>
        Separe as moedas e as notas em pilhas e vá marcando quantas você tem de cada uma.
      </p>

      {CEDULAS.map((c) => (
        <div className="conta-linha" key={c.valor}>
          <b>
            {c.icone} {c.rotulo}
          </b>
          <button
            className="passo"
            onClick={() => mexer(c.valor, -1)}
            aria-label={`Menos uma de ${c.rotulo}`}
          >
            −
          </button>
          <span className="qtd">{contagem[c.valor]}</span>
          <button
            className="passo"
            onClick={() => mexer(c.valor, 1)}
            aria-label={`Mais uma de ${c.rotulo}`}
          >
            ＋
          </button>
        </div>
      ))}

      <div className="conta-total">
        <span>Contei</span>
        <b>{comCifrao(total)}</b>
      </div>

      {primeiraVez ? (
        <p className="diferenca ok">
          Esse vai ser o ponto de partida do seu cofrinho. Daqui pra frente é só anotar o que entra e
          o que sai.
        </p>
      ) : (
        <Diferenca diferenca={diferenca} total={total} anotado={cofre.saldo} />
      )}

      <button className="btn btn-wide btn-mint" onClick={salvar} disabled={total === 0}>
        Salvar a contagem
      </button>
    </>
  )
}

function Diferenca({ diferenca, total, anotado }) {
  if (diferenca === 0) {
    return (
      <p className="diferenca ok">
        🎯 Bateu certinho com o que estava anotado ({comCifrao(anotado)}). Seu cofrinho está em dia!
      </p>
    )
  }
  if (diferenca > 0) {
    return (
      <p className="diferenca">
        Você achou {comCifrao(diferenca)} a mais do que estava anotado. Alguém colocou moeda sem
        avisar 😄 Vamos ajustar para {comCifrao(total)}.
      </p>
    )
  }
  return (
    <p className="diferenca menos">
      Faltam {comCifrao(-diferenca)} do que estava anotado. Deve ter saído dinheiro sem anotar.
      Vamos ajustar para {comCifrao(total)}.
    </p>
  )
}
