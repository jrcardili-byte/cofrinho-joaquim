import { comCifrao, comSinal, quandoFoi, diasRestantes } from '../lib/dinheiro.js'
import { categoria } from '../lib/cofrinho.js'

export default function Inicio({ cofre, ir }) {
  const { dados, saldo, entrouNoMes, saiuNoMes, ultimaConferencia } = cofre
  const primeiraVez = dados.lancamentos.length === 0
  const ultimos = dados.lancamentos.slice(0, 4)
  const meta = dados.metas.find((m) => !m.concluidaEm)

  const diasDesdeConferencia = ultimaConferencia
    ? Math.floor((Date.now() - new Date(ultimaConferencia.data).getTime()) / 86400000)
    : null

  if (primeiraVez) {
    return (
      <>
        <p className="saudacao">Oi, {dados.nome} 👋</p>
        <div className="vazio" style={{ marginTop: 30 }}>
          <div className="porco">🐷</div>
          <h2>Quanto será que tem aí dentro?</h2>
          <p>
            Vamos descobrir juntos: tire tudo do cofrinho, separe as moedas e as notas em pilhas, e
            conte comigo.
          </p>
        </div>
        <button className="btn btn-wide btn-mint" onClick={() => ir('contar')}>
          🪙 Contar o cofrinho
        </button>
        <button className="btn btn-ghost" onClick={() => ir('entrada')}>
          Já sei quanto tem, quero só anotar
        </button>
        <p className="rodape">O app só anota. O dinheiro continua todo no cofrinho.</p>
      </>
    )
  }

  return (
    <>
      <p className="saudacao">Oi, {dados.nome} 👋</p>

      <div className="saldo-card">
        <small>Dentro do cofrinho tem</small>
        <p className="saldo">
          <em>R$</em> {comCifrao(saldo).replace('R$ ', '')}
        </p>
        <p className="saldo-sub">{resumoDoMes(entrouNoMes, saiuNoMes)}</p>
        {diasDesdeConferencia !== null ? (
          <span className="conf-pill">
            {diasDesdeConferencia > 30 ? '🕒' : '✅'} Conferido{' '}
            {diasDesdeConferencia === 0 ? 'hoje' : `há ${diasDesdeConferencia} dia${diasDesdeConferencia > 1 ? 's' : ''}`}
          </span>
        ) : (
          <span className="conf-pill">🕒 Nunca foi conferido</span>
        )}
      </div>

      <div className="acoes">
        <button className="btn btn-in" onClick={() => ir('entrada')}>
          <b>＋</b>Coloquei
        </button>
        <button className="btn btn-out" onClick={() => ir('saida')}>
          <b>－</b>Tirei
        </button>
      </div>

      <button className="btn btn-wide" onClick={() => ir('contar')}>
        🪙 Conferir o cofrinho
      </button>
      <button className="btn btn-ghost" onClick={() => ir('objetivos')}>
        🎯 Meus objetivos
      </button>
      <button className="btn btn-ghost" onClick={() => ir('dicas')}>
        💡 Dicas e conquistas
      </button>

      {meta ? <Meta meta={meta} saldo={saldo} /> : null}

      {dados.esperando.length > 0 ? (
        <Esperando lista={dados.esperando} cofre={cofre} ir={ir} />
      ) : null}

      <p className="titulinho">
        Últimas anotações
        <button onClick={() => ir('extrato')}>ver tudo</button>
      </p>
      {ultimos.map((l) => (
        <Anotacao key={l.id} lanc={l} />
      ))}

      <p className="rodape">O app só anota. O dinheiro continua todo no cofrinho. 🐷</p>
    </>
  )
}

function resumoDoMes(entrou, saiu) {
  const diferenca = entrou - saiu
  if (entrou === 0 && saiu === 0) return '🐷 Este mês você ainda não colocou nem tirou nada.'
  if (diferenca > 0) return `🌱 Este mês entrou R$ ${comCifrao(diferenca).replace('R$ ', '')} a mais do que saiu`
  if (diferenca < 0) return `🍂 Este mês saiu R$ ${comCifrao(diferenca).replace('-R$ ', '')} a mais do que entrou`
  return 'Este mês entrou e saiu a mesma coisa.'
}

function Meta({ meta, saldo }) {
  const pct = Math.min(100, Math.round((saldo / meta.alvo) * 100))
  const falta = Math.max(0, meta.alvo - saldo)
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
        {falta === 0
          ? 'Você já tem o suficiente! 🎉'
          : `${comCifrao(saldo)} de ${comCifrao(meta.alvo)} · faltam ${comCifrao(falta)}`}
      </small>
    </div>
  )
}

function Esperando({ lista, cofre, ir }) {
  return (
    <>
      <p className="titulinho">Você está esperando 3 dias 🕒</p>
      {lista.map((e) => {
        const faltam = diasRestantes(e.data, 3)
        const cat = categoria(e.categoria)
        return (
          <div className="cartao" key={e.id}>
            <div className="cartao-topo">
              <span>
                {cat.icone} {comCifrao(e.valor)} · {cat.nome}
              </span>
            </div>
            <small style={{ marginTop: 0 }}>
              {faltam > 0
                ? `Faltam ${faltam} dia${faltam > 1 ? 's' : ''} pra decidir.`
                : 'Os 3 dias passaram. E aí, ainda quer?'}
            </small>
            <div className="acoes" style={{ marginTop: 10 }}>
              <button
                className="btn btn-in"
                onClick={() => cofre.encerrarEspera(e.id)}
                style={{ fontSize: 14 }}
              >
                Desisti! 🎉
              </button>
              <button
                className="btn btn-out"
                onClick={() => {
                  cofre.encerrarEspera(e.id)
                  ir('saida')
                }}
                style={{ fontSize: 14 }}
              >
                Vou tirar
              </button>
            </div>
          </div>
        )
      })}
    </>
  )
}

export function Anotacao({ lanc }) {
  const ajuste = lanc.tipo === 'ajuste'
  const cat = categoria(lanc.categoria)
  const entrada = lanc.tipo === 'entrada'
  return (
    <div className="linha">
      <div className={'ic ' + (ajuste ? 'neutro' : entrada ? 'up' : 'down')}>
        {ajuste ? '🪙' : cat.icone}
      </div>
      <div className="linha-txt">
        <strong>{ajuste ? 'Conferi o cofrinho' : lanc.nota || cat.nome}</strong>
        <small>
          {quandoFoi(lanc.data)}
          {!ajuste && lanc.nota ? ` · ${cat.nome}` : ''}
        </small>
      </div>
      <span className={'valor ' + (ajuste ? '' : entrada ? 'up' : 'down')}>
        {ajuste ? comSinal(lanc.valor) : (entrada ? '+' : '−') + comCifrao(lanc.valor).replace('R$ ', '')}
      </span>
    </div>
  )
}
