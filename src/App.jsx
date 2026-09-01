import { useState } from 'react'
import { useCofrinho } from './lib/cofrinho.js'
import Inicio from './telas/Inicio.jsx'
import Movimento from './telas/Movimento.jsx'
import Contar from './telas/Contar.jsx'
import Objetivos from './telas/Objetivos.jsx'
import Extrato from './telas/Extrato.jsx'
import Dicas from './telas/Dicas.jsx'
import Festa from './telas/Festa.jsx'
import Tarefas from './telas/Tarefas.jsx'
import Pais from './telas/Pais.jsx'

export default function App() {
  const cofre = useCofrinho()
  const [tela, setTela] = useState('inicio')
  const [festa, setFesta] = useState(null)

  const ir = (nome) => {
    setTela(nome)
    window.scrollTo(0, 0)
  }

  // Mostra a tela de comemoracao com o que acabou de acontecer.
  const comemorar = (info) => {
    setFesta(info)
    ir('festa')
  }

  let conteudo
  switch (tela) {
    case 'entrada':
    case 'saida':
      conteudo = <Movimento tipo={tela} cofre={cofre} ir={ir} comemorar={comemorar} />
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
      conteudo = <Pais cofre={cofre} ir={ir} />
      break
    case 'festa':
      conteudo = <Festa info={festa} cofre={cofre} ir={ir} />
      break
    default:
      conteudo = <Inicio cofre={cofre} ir={ir} />
  }

  return (
    <div className="app" key={tela}>
      {conteudo}
    </div>
  )
}
