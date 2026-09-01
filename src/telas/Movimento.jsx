import { useState } from 'react'
import { comCifrao, emReais } from '../lib/dinheiro.js'
import { ORIGENS, DESTINOS } from '../lib/cofrinho.js'

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'limpar', '0', 'apagar']
const LIMITE_ESPERA = 1000 // a partir de R$ 10,00 o app sugere esperar 3 dias

export default function Movimento({ tipo, cofre, ir, comemorar }) {
  const entrada = tipo === 'entrada'
  const lista = entrada ? ORIGENS : DESTINOS
  const [valor, setValor] = useState(0)
  const [cat, setCat] = useState(lista[0].id)
  const [nota, setNota] = useState('')

  const demais = !entrada && valor > cofre.saldo
  const podeSalvar = valor > 0 && !demais

  function digitar(t) {
    if (t === 'apagar') return setValor((v) => Math.floor(v / 10))
    if (t === 'limpar') return setValor(0)
    setValor((v) => (v >= 100000000 ? v : v * 10 + Number(t)))
  }

  function salvar() {
    if (!podeSalvar) return
    cofre.registrar(tipo, valor, cat, nota.trim())
    comemorar({
      tipo,
      valor,
      categoria: cat,
      saldoDepois: entrada ? cofre.saldo + valor : cofre.saldo - valor
    })
  }

  function esperar() {
    cofre.esperar(valor, cat)
    ir('inicio')
  }

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>{entrada ? 'Quanto você colocou no cofrinho?' : 'Quanto você tirou do cofrinho?'}</h2>

      <p className="quantia">
        <em>R$</em> {emReais(valor)}
      </p>

      {demais ? (
        <p className="aviso erro">Você só tem {comCifrao(cofre.saldo)} no cofrinho 🐷</p>
      ) : (
        <p className="aviso">
          {entrada
            ? 'Coloque o dinheiro no cofre de verdade e anote aqui'
            : `Vão sobrar ${comCifrao(cofre.saldo - valor)} lá dentro`}
        </p>
      )}

      <div className="fichas">
        {lista.map((c) => (
          <button
            key={c.id}
            className="ficha"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
          >
            {c.icone} {c.nome}
          </button>
        ))}
      </div>

      <div className="teclado">
        {TECLAS.map((t) => (
          <button key={t} className="tecla" onClick={() => digitar(t)}>
            {t === 'apagar' ? '⌫' : t === 'limpar' ? 'C' : t}
          </button>
        ))}
      </div>

      <label className="rotulo" htmlFor="nota">
        Quer escrever o que foi? (opcional)
      </label>
      <input
        id="nota"
        className="campo"
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder={entrada ? 'Presente do tio Léo' : 'Sorvete no parque'}
        maxLength={60}
      />

      <button
        className={'btn btn-wide ' + (entrada ? 'btn-mint' : 'btn-coral')}
        onClick={salvar}
        disabled={!podeSalvar}
      >
        {entrada ? 'Anotar entrada' : 'Anotar saída'}
      </button>

      {!entrada && valor >= LIMITE_ESPERA && !demais ? (
        <>
          <div className="dica vermelha">
            <strong>🐷 Pensa comigo…</strong>
            <p>
              Se você esperar 3 dias e ainda quiser, tira sem culpa. A maioria das vontades passa
              antes disso.
            </p>
          </div>
          <button className="btn btn-ghost" onClick={esperar}>
            🕒 Esperar 3 dias pra decidir
          </button>
        </>
      ) : null}
    </>
  )
}
