import { comCifrao, quandoFoi } from '../lib/dinheiro.js'

export default function Tarefas({ cofre, ir, comemorar }) {
  const { dados, esperandoAprovacao, aReceber, totalAReceber, ganhoTarefasMes } = cofre
  const ativas = dados.tarefas.filter((t) => t.ativa)

  // Uma tarefa ja marcada nao aparece de novo enquanto o papai nao decidir.
  const jaMarcadas = new Set(esperandoAprovacao.map((m) => m.tarefaId))

  function pegar(m) {
    cofre.receber(m.id)
    comemorar({
      tipo: 'entrada',
      valor: m.valor,
      categoria: m.origem,
      saldoDepois: cofre.saldo + m.valor
    })
  }

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Tarefas que valem dinheiro</h2>

      {aReceber.length > 0 ? (
        <>
          <p className="titulinho">Pra você receber 🤝</p>
          <div className="dica verde">
            <strong>Peça {comCifrao(totalAReceber)} pro papai</strong>
            <p>
              Assim que ele te entregar, coloque no cofrinho e toque em “recebi” — aí o dinheiro
              entra na conta.
            </p>
          </div>
          {aReceber.map((m) => (
            <div className="tarefa aprovada" key={m.id}>
              <div className="ic up">{m.icone}</div>
              <div className="linha-txt">
                <strong>{m.nome}</strong>
                <small>Aprovado! {quandoFoi(m.decididaEm)}</small>
              </div>
              <button className="btn-mini" onClick={() => pegar(m)}>
                recebi {comCifrao(m.valor)}
              </button>
            </div>
          ))}
        </>
      ) : null}

      {esperandoAprovacao.length > 0 ? (
        <>
          <p className="titulinho">Esperando aprovação ⏳</p>
          {esperandoAprovacao.map((m) => (
            <div className="tarefa pendente" key={m.id}>
              <div className="ic neutro">⏳</div>
              <div className="linha-txt">
                <strong>{m.nome}</strong>
                <small>Você marcou {quandoFoi(m.data)}</small>
              </div>
              <span className="preco">{comCifrao(m.valor)}</span>
            </div>
          ))}
        </>
      ) : null}

      <p className="titulinho">O que dá pra fazer</p>
      {ativas.length === 0 ? (
        <div className="vazio">
          <div className="porco">🧹</div>
          <p>
            Ainda não tem nenhuma tarefa cadastrada. Peça pro seu pai ou pra sua mãe abrir o modo dos
            responsáveis e criar as tarefas que valem dinheiro.
          </p>
          <button className="btn btn-ghost" onClick={() => ir('pais')}>
            👨‍👩‍👦 Abrir modo dos responsáveis
          </button>
        </div>
      ) : (
        ativas.map((t) => (
          <div className="tarefa" key={t.id}>
            <div className="ic up">{t.icone}</div>
            <div className="linha-txt">
              <strong>{t.nome}</strong>
              <small>{t.tipo === 'semanal' ? 'Toda semana' : 'Quando quiser'}</small>
            </div>
            {jaMarcadas.has(t.id) ? (
              <span className="preco" style={{ opacity: 0.5 }}>
                marcada
              </span>
            ) : (
              <button className="btn-mini" onClick={() => cofre.marcarFeita(t)}>
                fiz! {comCifrao(t.valor)}
              </button>
            )}
          </div>
        ))
      )}

      {ganhoTarefasMes > 0 ? (
        <div className="dica">
          <strong>💪 Este mês você já ganhou {comCifrao(ganhoTarefasMes)} trabalhando</strong>
          <p>Esse dinheiro é diferente: não foi presente, você conquistou.</p>
        </div>
      ) : null}

      <button className="btn btn-ghost" onClick={() => ir('pais')}>
        👨‍👩‍👦 Modo dos responsáveis
      </button>
    </>
  )
}
