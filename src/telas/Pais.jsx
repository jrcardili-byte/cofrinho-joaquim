import { useCallback, useEffect, useState } from 'react'
import { comCifrao, emReais, quandoFoi } from '../lib/dinheiro.js'
import { ICONES_TAREFA, categoria } from '../lib/cofrinho.js'
import { apagarSessao, ehResponsavel } from '../lib/sessao.js'
import { formatarCodigo } from '../lib/nuvem.js'

export default function Pais({ cofre, ir, sessao }) {
  const { dados } = cofre
  // Quem entrou como responsavel neste aparelho ja passou pela porta.
  const [liberado, setLiberado] = useState(ehResponsavel(sessao) || !dados.pin)
  const liberar = useCallback(() => setLiberado(true), [])

  if (!liberado) return <Tranca cofre={cofre} ir={ir} liberar={liberar} />
  return <Painel cofre={cofre} ir={ir} sessao={sessao} />
}

/* ---------- PIN ---------- */

function Tranca({ cofre, ir, liberar }) {
  const [digitado, setDigitado] = useState('')
  const [errou, setErrou] = useState(false)

  // Atualizacao funcional: toques rapidos nao podem perder digitos.
  function digitar(t) {
    if (t === 'apagar') return setDigitado((d) => d.slice(0, -1))
    setDigitado((d) => (d.length >= 4 ? d : d + t))
  }

  // A conferencia acontece quando o quarto numero entra, nunca dentro do clique.
  useEffect(() => {
    if (digitado.length < 4) return
    if (digitado === cofre.dados.pin) {
      liberar()
      return
    }
    setErrou(true)
    const relogio = setTimeout(() => {
      setDigitado('')
      setErrou(false)
    }, 700)
    return () => clearTimeout(relogio)
  }, [digitado, cofre.dados.pin, liberar])

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <div className="festa" style={{ paddingBottom: 6 }}>
        <div className="porco">🔒</div>
        <h2>Modo dos responsáveis</h2>
        <p>Digite o PIN de 4 números</p>
      </div>

      <div className={'pin-bolinhas' + (errou ? ' errou' : '')}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={digitado.length > i ? 'cheia' : ''} />
        ))}
      </div>
      {errou ? <p className="aviso erro">PIN errado. Tente de novo.</p> : <p className="aviso">&nbsp;</p>}

      <div className="teclado">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'apagar'].map((t, i) =>
          t === '' ? (
            <span key={i} />
          ) : (
            <button key={i} className="tecla" onClick={() => digitar(t)}>
              {t === 'apagar' ? '⌫' : t}
            </button>
          )
        )}
      </div>
    </>
  )
}

/* ---------- painel ---------- */

function Painel({ cofre, ir, sessao }) {
  const { dados, esperandoAprovacao, aReceber, totalAReceber, saldo, origens, totalEntradas } = cofre
  const [aba, setAba] = useState('aprovar')

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Modo dos responsáveis</h2>

      <div className="abas">
        {[
          ['aprovar', `Aprovar${esperandoAprovacao.length ? ` (${esperandoAprovacao.length})` : ''}`],
          ['tarefas', 'Tarefas'],
          ['dinheiro', 'Dinheiro'],
          ['ajustes', 'Ajustes']
        ].map(([id, rotulo]) => (
          <button key={id} className="aba" aria-current={aba === id} onClick={() => setAba(id)}>
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'aprovar' ? (
        <Aprovar
          cofre={cofre}
          pendentes={esperandoAprovacao}
          aReceber={aReceber}
          total={totalAReceber}
          saldo={saldo}
          origens={origens}
          totalEntradas={totalEntradas}
        />
      ) : null}
      {aba === 'tarefas' ? <GerenciarTarefas cofre={cofre} /> : null}
      {aba === 'dinheiro' ? <Dinheiro cofre={cofre} ir={ir} /> : null}
      {aba === 'ajustes' ? <Ajustes cofre={cofre} dados={dados} sessao={sessao} ir={ir} /> : null}
    </>
  )
}

function Aprovar({ cofre, pendentes, aReceber, total, saldo, origens, totalEntradas }) {
  return (
    <>
      {pendentes.length === 0 ? (
        <div className="vazio">
          <div className="porco">✅</div>
          <p>Nada esperando aprovação agora.</p>
        </div>
      ) : (
        pendentes.map((m) => (
          <div className="cartao" key={m.id}>
            <div className="cartao-topo">
              <span>
                {m.icone} {m.nome}
              </span>
              <span>{comCifrao(m.valor)}</span>
            </div>
            <small style={{ marginTop: 0 }}>Marcado {quandoFoi(m.data)}</small>
            <div className="acoes" style={{ marginTop: 10 }}>
              <button
                className="btn btn-in"
                style={{ fontSize: 14 }}
                onClick={() => cofre.decidirMarcacao(m.id, true)}
              >
                Aprovar
              </button>
              <button
                className="btn btn-out"
                style={{ fontSize: 14 }}
                onClick={() => cofre.decidirMarcacao(m.id, false)}
              >
                Ainda não
              </button>
            </div>
          </div>
        ))
      )}

      {aReceber.length > 0 ? (
        <div className="dica">
          <strong>💰 Você está devendo {comCifrao(total)} pro cofrinho</strong>
          <p>
            Entregue as moedas pra ele. Só quando o dinheiro entrar no cofre de verdade é que ele
            marca “recebi” e o saldo sobe.
          </p>
        </div>
      ) : null}

      <p className="titulinho">Como está o cofrinho</p>
      <div className="cartao">
        <div className="cartao-topo">
          <span>Dentro do cofre</span>
          <span>{comCifrao(saldo)}</span>
        </div>
        {totalEntradas > 0 ? (
          <>
            <small style={{ marginTop: 0, marginBottom: 8 }}>De onde veio o dinheiro dele:</small>
            {origens.slice(0, 4).map((o) => (
              <div className="fatia" key={o.id}>
                <span style={{ fontSize: 12.5, minWidth: 96 }}>{nomeOrigem(o.id)}</span>
                <div className="trilho">
                  <i style={{ width: o.fatia + '%' }} />
                </div>
                <span className="pct">{o.fatia}%</span>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </>
  )
}

function GerenciarTarefas({ cofre }) {
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState(ICONES_TAREFA[0])
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('avulsa')

  function criar(e) {
    e.preventDefault()
    const centavos = Math.round(parseFloat(valor.replace(',', '.')) * 100)
    if (!nome.trim() || !centavos || centavos <= 0) return
    cofre.criarTarefa(nome.trim(), icone, centavos, tipo)
    setNome('')
    setValor('')
  }

  return (
    <>
      {cofre.dados.tarefas.map((t) => (
        <div className="tarefa" key={t.id}>
          <div className="ic up">{t.icone}</div>
          <div className="linha-txt">
            <strong>{t.nome}</strong>
            <small>{t.tipo === 'semanal' ? 'Toda semana' : 'Quando quiser'}</small>
          </div>
          <span className="preco">{comCifrao(t.valor)}</span>
          <button className="btn-mini apagar" onClick={() => cofre.removerTarefa(t.id)}>
            apagar
          </button>
        </div>
      ))}

      <form className="cartao" onSubmit={criar}>
        <label className="rotulo" htmlFor="nome-tarefa">
          Nova tarefa
        </label>
        <input
          id="nome-tarefa"
          className="campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Varrer a área"
          maxLength={40}
        />

        <label className="rotulo">Ícone</label>
        <div className="fichas" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          {ICONES_TAREFA.map((i) => (
            <button
              type="button"
              key={i}
              className="ficha"
              aria-pressed={icone === i}
              onClick={() => setIcone(i)}
            >
              {i}
            </button>
          ))}
        </div>

        <label className="rotulo" htmlFor="valor-tarefa">
          Quanto vale (em reais)
        </label>
        <input
          id="valor-tarefa"
          className="campo"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ''))}
          inputMode="decimal"
          placeholder="3,00"
        />

        <label className="rotulo">Com que frequência</label>
        <div className="fichas" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
          <button
            type="button"
            className="ficha"
            aria-pressed={tipo === 'avulsa'}
            onClick={() => setTipo('avulsa')}
          >
            Quando quiser
          </button>
          <button
            type="button"
            className="ficha"
            aria-pressed={tipo === 'semanal'}
            onClick={() => setTipo('semanal')}
          >
            Toda semana
          </button>
        </div>

        <button className="btn btn-wide btn-mint" type="submit">
          ＋ Criar tarefa
        </button>
      </form>
    </>
  )
}

// Onde o responsavel corrige o dinheiro: lancar direto e apagar o que ficou
// errado. Apagar some com a linha do historico; nao vira um lancamento novo.
function Dinheiro({ cofre, ir }) {
  const [confirmando, setConfirmando] = useState(null)
  const lancamentos = cofre.dados.lancamentos.slice(0, 30)

  return (
    <>
      <div className="acoes" style={{ marginTop: 12 }}>
        <button className="btn btn-in" onClick={() => ir('entrada')}>
          <b>＋</b>Lançar entrada
        </button>
        <button className="btn btn-out" onClick={() => ir('saida')}>
          <b>－</b>Lançar saída
        </button>
      </div>
      <button className="btn btn-ghost" onClick={() => ir('contar')}>
        🪙 Conferir o cofre e acertar o saldo
      </button>

      <p className="titulinho">Corrigir lançamentos</p>
      {lancamentos.length === 0 ? (
        <div className="vazio">
          <div className="porco">📖</div>
          <p>Nada anotado ainda.</p>
        </div>
      ) : (
        lancamentos.map((l) => {
          const cat = categoria(l.categoria)
          const ajuste = l.tipo === 'ajuste'
          const entrada = l.tipo === 'entrada'
          return (
            <div className="linha" key={l.id}>
              <div className={'ic ' + (ajuste ? 'neutro' : entrada ? 'up' : 'down')}>
                {ajuste ? '🪙' : cat.icone}
              </div>
              <div className="linha-txt">
                <strong>{ajuste ? 'Conferência' : l.nota || cat.nome}</strong>
                <small>{quandoFoi(l.data)}</small>
              </div>
              <span className={'valor ' + (ajuste ? '' : entrada ? 'up' : 'down')}>
                {(entrada || (ajuste && l.valor > 0) ? '+' : '−') +
                  comCifrao(Math.abs(l.valor)).replace('R$ ', '')}
              </span>
              {confirmando === l.id ? (
                <button
                  className="btn-mini"
                  style={{ background: 'var(--coral)', color: '#fff' }}
                  onClick={() => {
                    cofre.removerLancamento(l.id)
                    setConfirmando(null)
                  }}
                >
                  apagar mesmo
                </button>
              ) : (
                <button className="btn-mini apagar" onClick={() => setConfirmando(l.id)}>
                  apagar
                </button>
              )}
            </div>
          )
        })
      )}
      <p className="legenda-grafico">
        Apagar um lançamento muda o saldo na hora. Se a intenção é acertar o cofre com o dinheiro
        real, prefira a conferência — ela deixa registrado o que aconteceu.
      </p>
    </>
  )
}

function Ajustes({ cofre, dados, sessao, ir }) {
  const [valor, setValor] = useState(dados.mesada.valor ? emReais(dados.mesada.valor) : '')
  const [dia, setDia] = useState(String(dados.mesada.dia))
  const [pin, setPin] = useState('')
  const [nome, setNome] = useState(dados.nome)
  const [salvo, setSalvo] = useState('')

  function salvarMesada(e) {
    e.preventDefault()
    const centavos = Math.round(parseFloat(valor.replace(',', '.')) * 100) || 0
    const d = Math.min(28, Math.max(1, parseInt(dia, 10) || 1))
    cofre.configurarMesada({ ativa: centavos > 0, valor: centavos, dia: d })
    setDia(String(d))
    avisar('Mesada salva')
  }

  function avisar(texto) {
    setSalvo(texto)
    setTimeout(() => setSalvo(''), 2500)
  }

  return (
    <>
      <form className="cartao" onSubmit={salvarMesada}>
        <div className="cartao-topo">
          <span>🪙 Mesada automática</span>
        </div>
        <small style={{ marginTop: 0 }}>
          Todo mês, no dia escolhido, a mesada entra na lista de “pra receber” dele. Você continua
          entregando o dinheiro na mão — o app só lembra.
        </small>

        <label className="rotulo" htmlFor="valor-mesada">
          Valor (em reais, 0 desliga)
        </label>
        <input
          id="valor-mesada"
          className="campo"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ''))}
          inputMode="decimal"
          placeholder="25,00"
        />

        <label className="rotulo" htmlFor="dia-mesada">
          Dia do mês (1 a 28)
        </label>
        <input
          id="dia-mesada"
          className="campo"
          value={dia}
          onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 2))}
          inputMode="numeric"
        />

        <button className="btn btn-wide btn-mint" type="submit">
          Salvar mesada
        </button>
      </form>

      <div className="cartao">
        <div className="cartao-topo">
          <span>🔒 PIN dos responsáveis</span>
        </div>
        <small style={{ marginTop: 0 }}>
          {dados.pin
            ? 'Já existe um PIN. Digite outro para trocar, ou apague para remover a trava.'
            : 'Sem PIN, qualquer um abre este modo. Coloque 4 números.'}
        </small>
        <input
          className="campo"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          placeholder="0000"
        />
        <div className="acoes" style={{ marginTop: 10 }}>
          <button
            className="btn btn-in"
            style={{ fontSize: 14 }}
            onClick={() => {
              if (pin.length !== 4) return
              cofre.definirPin(pin)
              setPin('')
              avisar('PIN salvo')
            }}
          >
            Salvar PIN
          </button>
          <button
            className="btn btn-out"
            style={{ fontSize: 14 }}
            onClick={() => {
              cofre.definirPin(null)
              avisar('PIN removido')
            }}
          >
            Remover
          </button>
        </div>
      </div>

      <div className="cartao">
        <div className="cartao-topo">
          <span>👦 Nome da criança</span>
        </div>
        <input
          className="campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={20}
        />
        <button
          className="btn btn-wide"
          onClick={() => {
            cofre.trocarNome(nome.trim() || 'Joaquim')
            avisar('Nome salvo')
          }}
        >
          Salvar nome
        </button>
      </div>

      {sessao ? (
        <div className="cartao">
          <div className="cartao-topo">
            <span>🔑 Código da família</span>
            <span className="codigo-inline">{formatarCodigo(sessao.codigo)}</span>
          </div>
          <small style={{ marginTop: 0 }}>
            É esse código que liga os dois celulares. Digite ele no aparelho da criança para ela
            entrar no mesmo cofrinho.
          </small>
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (confirm('Sair deste cofrinho neste aparelho?')) {
                apagarSessao()
                location.reload()
              }
            }}
          >
            Sair deste cofrinho
          </button>
        </div>
      ) : null}

      {salvo ? <p className="diferenca ok">{salvo} ✅</p> : null}
    </>
  )
}

function nomeOrigem(id) {
  const mapa = {
    presente: '🎁 Presentes',
    vo: '👵 Vó',
    mesada: '🪙 Mesada',
    tarefa: '🧹 Tarefas',
    troco: '💰 Troco',
    vendi: '💼 Vendas'
  }
  return mapa[id] || '✨ Outros'
}
