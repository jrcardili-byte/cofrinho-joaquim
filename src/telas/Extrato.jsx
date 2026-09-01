import { comCifrao, nomeDoMes, mesDe } from '../lib/dinheiro.js'
import { Anotacao } from './Inicio.jsx'

export default function Extrato({ cofre, ir }) {
  const { dados, entrouNoMes, saiuNoMes, origens } = cofre
  const grupos = agruparPorMes(dados.lancamentos)
  const maior = origens[0]

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Minha história de dinheiro</h2>

      {dados.lancamentos.length === 0 ? (
        <div className="vazio">
          <div className="porco">📖</div>
          <p>Ainda não tem nada anotado. Assim que você colocar ou tirar dinheiro, aparece aqui.</p>
        </div>
      ) : (
        <>
          <div className="dica verde">
            <strong>Este mês</strong>
            <p>
              Entrou {comCifrao(entrouNoMes)} e saiu {comCifrao(saiuNoMes)}.
              {maior ? ` A maior parte do seu cofre veio de: ${nomeOrigem(maior.id)}.` : ''}
            </p>
          </div>

          {grupos.map(([mes, itens]) => (
            <div key={mes}>
              <p className="titulinho" style={{ textTransform: 'capitalize' }}>
                {nomeDoMes(itens[0].data)}
              </p>
              {itens.map((l) => (
                <Anotacao key={l.id} lanc={l} />
              ))}
            </div>
          ))}
        </>
      )}
    </>
  )
}

function agruparPorMes(lancamentos) {
  const mapa = new Map()
  for (const l of lancamentos) {
    const k = mesDe(l.data)
    if (!mapa.has(k)) mapa.set(k, [])
    mapa.get(k).push(l)
  }
  return [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

function nomeOrigem(id) {
  const mapa = {
    presente: 'presentes',
    vo: 'moedas da vó',
    mesada: 'mesada',
    tarefa: 'tarefas',
    troco: 'troco',
    vendi: 'coisas que você vendeu'
  }
  return mapa[id] || 'outras origens'
}
