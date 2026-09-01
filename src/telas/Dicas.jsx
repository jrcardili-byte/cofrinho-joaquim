import { useState } from 'react'
import { comCifrao, emReais } from '../lib/dinheiro.js'

const DICAS = [
  {
    cor: '',
    titulo: '🫙 A regra dos 3 potinhos',
    texto:
      'De cada R$ 10 que chegam: R$ 5 vão pro cofre, R$ 3 você pode gastar, R$ 2 pra ajudar alguém. Dá pra separar em três potes de verdade.'
  },
  {
    cor: 'vermelha',
    titulo: '🕒 O teste dos 3 dias',
    texto:
      'Bateu vontade de tirar dinheiro? Espera 3 dias. A maioria das vontades passa — e o dinheiro fica com você.'
  },
  {
    cor: 'verde',
    titulo: '🪙 Moeda pequena também conta',
    texto:
      'Guardar 50 centavos por dia dá R$ 182,50 em um ano. Não é o tamanho da moeda, é não parar de colocar.'
  },
  {
    cor: 'branca',
    titulo: '🎁 Presente também é dinheiro seu',
    texto:
      'Quando alguém te dá dinheiro, você pode escolher: gastar hoje ou virar parte de algo maior. As duas são válidas — o importante é escolher, não deixar sumir.'
  },
  {
    cor: '',
    titulo: '🛒 O preço em horas de tarefa',
    texto:
      'Antes de comprar, pense: quantas tarefas eu precisei fazer pra juntar isso? Às vezes a resposta muda a vontade.'
  }
]

export default function Dicas({ cofre, ir }) {
  const { saldo, sequencia, origens, totalEntradas, dados } = cofre
  const [porMes, setPorMes] = useState(3000) // R$ 30,00
  const dica = DICAS[new Date().getDate() % DICAS.length]

  return (
    <>
      <button className="voltar" onClick={() => ir('inicio')}>
        ← Voltar
      </button>
      <h2>Dicas e conquistas</h2>

      <div className={'dica ' + dica.cor}>
        <strong>{dica.titulo}</strong>
        <p>{dica.texto}</p>
      </div>

      <p className="titulinho">Minhas conquistas</p>
      <div className="medalhas">
        <div className={'medalha' + (sequencia > 0 ? '' : ' apagada')}>
          <b>🔥</b>
          {sequencia > 0 ? `${sequencia} semana${sequencia > 1 ? 's' : ''} guardando` : 'comece a sequência'}
        </div>
        <div className={'medalha' + (dados.metas.some((m) => m.concluidaEm) ? '' : ' apagada')}>
          <b>🏆</b>1º objetivo
        </div>
        <div className={'medalha' + (saldo >= 50000 ? '' : ' apagada')}>
          <b>🌳</b>R$ 500 no cofre
        </div>
      </div>

      {totalEntradas > 0 ? (
        <>
          <p className="titulinho">De onde veio meu dinheiro</p>
          {origens.slice(0, 5).map((o) => (
            <div className="fatia" key={o.id}>
              <span style={{ fontSize: 13, minWidth: 110 }}>{nomeOrigem(o.id)}</span>
              <div className="trilho">
                <i style={{ width: o.fatia + '%' }} />
              </div>
              <span className="pct">{o.fatia}%</span>
            </div>
          ))}
        </>
      ) : null}

      <p className="titulinho">E se eu guardar todo mês?</p>
      <div className="cartao">
        <input
          type="range"
          min="500"
          max="10000"
          step="500"
          value={porMes}
          onChange={(e) => setPorMes(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--mint)' }}
          aria-label="Quanto guardar por mês"
        />
        <div className="cartao-topo" style={{ marginTop: 6 }}>
          <span>R$ {emReais(porMes)} por mês</span>
        </div>
        <small>
          Em 1 ano: <b>{comCifrao(saldo + porMes * 12)}</b> no cofrinho.
        </small>
        <small>
          Em 2 anos: <b>{comCifrao(saldo + porMes * 24)}</b>. Dá pra comprar coisa grande.
        </small>
      </div>

      {saldo >= 30000 ? (
        <div className="dica verde">
          <strong>🏦 Seu cofre está ficando cheio</strong>
          <p>
            Moeda parada no cofre daqui a um ano continua valendo o mesmo. Na poupança, {comCifrao(saldo)}{' '}
            viraria uns <b>{comCifrao(Math.round(saldo * 1.06))}</b>. Que tal conversar com seus pais
            sobre levar uma parte pro banco? Na hora de anotar, use a opção “Levei pro banco” — não é
            gasto, é o dinheiro mudando de lugar.
          </p>
        </div>
      ) : null}

      <p className="rodape">
        <button
          onClick={() => {
            if (confirm('Isso apaga TODAS as anotações do cofrinho. Tem certeza?')) {
              cofre.apagarTudo()
              ir('inicio')
            }
          }}
        >
          apagar todas as anotações
        </button>
      </p>
    </>
  )
}

function nomeOrigem(id) {
  const mapa = {
    presente: '🎁 Presentes',
    vo: '👵 Moedas da vó',
    mesada: '🪙 Mesada',
    tarefa: '🧹 Tarefas',
    troco: '💰 Troco',
    vendi: '💼 Vendi algo'
  }
  return mapa[id] || '✨ Outros'
}
