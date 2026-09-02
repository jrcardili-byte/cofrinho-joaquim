import { useState } from 'react'
import { useCofrinho } from './lib/cofrinho.js'
import { nuvemConfigurada } from './lib/nuvem.js'
import { lerSessao, gravarSessao, ehResponsavel } from './lib/sessao.js'
import Entrar from './telas/Entrar.jsx'
import Inicio from './telas/Inicio.jsx'
import Movimento from './telas/Movimento.jsx'
import Contar from './telas/Contar.jsx'
import Objetivos from './telas/Objetivos.jsx'
import Extrato from './telas/Extrato.jsx'
import Dicas from './telas/Dicas.jsx'
import Festa from './telas/Festa.jsx'
import Tarefas from './telas/Tarefas.jsx'
import Pais from './telas/Pais.jsx'
import Jornada from './telas/Jornada.jsx'

export default function App() {
  const [sessao, setSessao] = useState(lerSessao)
  const cofre = useCofrinho(sessao)
  const [tela, setTela] = useState('inicio')
  const [festa, setFesta] = useState(null)
  const [extra, setExtra] = useState(null)

  // `extra` leva ajustes da tela de destino, como a categoria ja escolhida.
  const ir = (nome, opcoes = null) => {
    setExtra(opcoes)
    setTela(nome)
    window.scrollTo(0, 0)
  }

  // Mostra a tela de comemoracao com o que acabou de acontecer.
  const comemorar = (info) => {
    setFesta(info)
    ir('festa')
  }

  // Com a nuvem ligada, o aparelho precisa saber em qual cofrinho ele esta.
  // Sem configuracao, o app segue local como sempre foi.
  if (nuvemConfigurada && !sessao) {
    return (
      <div className="app">
        <Entrar
          aoEntrar={(nova) => {
            gravarSessao(nova)
            setSessao(nova)
          }}
        />
      </div>
    )
  }

  let conteudo
  switch (tela) {
    case 'entrada':
    case 'saida':
      conteudo = (
        <Movimento
          tipo={tela}
          cofre={cofre}
          ir={ir}
          comemorar={comemorar}
          categoriaInicial={extra?.categoria}
        />
      )
      break
    case 'contar':
      conteudo = <Contar cofre={cofre} ir={ir} comemorar={comemorar} />
      break
    case 'objetivos':
      conteudo = <Objetivos cofre={cofre} ir={ir} />
      break
    case 'extrato':
      conteudo = <Extrato cofre={cofre} ir={ir} />
      break
    case 'dicas':
      conteudo = <Dicas cofre={cofre} ir={ir} />
      break
    case 'tarefas':
      conteudo = <Tarefas cofre={cofre} ir={ir} comemorar={comemorar} />
      break
    case 'pais':
      conteudo = <Pais cofre={cofre} ir={ir} sessao={sessao} />
      break
    case 'jornada':
      conteudo = <Jornada cofre={cofre} ir={ir} />
      break
    case 'festa':
      conteudo = <Festa info={festa} cofre={cofre} ir={ir} />
      break
    default:
      conteudo = <Inicio cofre={cofre} ir={ir} responsavel={ehResponsavel(sessao)} />
  }

  return (
    <div className="app" key={tela}>
      {conteudo}
    </div>
  )
}
