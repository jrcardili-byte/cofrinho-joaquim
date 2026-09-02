import { useState } from 'react'
import { criarCofre, cofreExiste, formatarCodigo, limparCodigo } from '../lib/nuvem.js'
import { ESTADO_INICIAL } from '../lib/cofrinho.js'

export default function Entrar({ aoEntrar }) {
  const [passo, setPasso] = useState('inicio')
  const [codigo, setCodigo] = useState('')
  const [digitado, setDigitado] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function criar() {
    setOcupado(true)
    setErro('')
    try {
      const novo = await criarCofre(ESTADO_INICIAL)
      setCodigo(novo)
      setPasso('criado')
    } catch {
      setErro('Não consegui falar com o servidor. Verifique a internet e tente de novo.')
    }
    setOcupado(false)
  }

  async function conferir() {
    const limpo = limparCodigo(digitado)
    if (limpo.length !== 6) {
      setErro('O código tem 6 letras e números.')
      return
    }
    setOcupado(true)
    setErro('')
    try {
      if (await cofreExiste(limpo)) {
        setCodigo(limpo)
        setPasso('quem')
      } else {
        setErro('Não achei nenhum cofrinho com esse código. Confira as letras.')
      }
    } catch {
      setErro('Não consegui falar com o servidor. Verifique a internet e tente de novo.')
    }
    setOcupado(false)
  }

  /* ---------- escolha inicial ---------- */
  if (passo === 'inicio') {
    return (
      <>
        <div className="festa" style={{ paddingBottom: 10 }}>
          <div className="porco">🐷</div>
          <h2>O cofrinho</h2>
          <p>Este celular vai usar um cofrinho novo ou um que já existe?</p>
        </div>
        <button className="btn btn-wide btn-mint" onClick={criar} disabled={ocupado}>
          {ocupado ? 'Criando…' : '✨ Criar um cofrinho novo'}
        </button>
        <button className="btn btn-ghost" onClick={() => setPasso('codigo')}>
          Já tenho um código
        </button>
        {erro ? <p className="aviso erro">{erro}</p> : null}
        <p className="rodape">
          Quem cria o cofrinho é o responsável. Depois é só levar o código para o celular da criança.
        </p>
      </>
    )
  }

  /* ---------- cofre recem-criado ---------- */
  if (passo === 'criado') {
    return (
      <>
        <div className="festa" style={{ paddingBottom: 6 }}>
          <div className="porco">🔑</div>
          <h2>Cofrinho criado!</h2>
          <p>Este é o código da família. Anote — é ele que liga os dois celulares.</p>
        </div>
        <p className="codigo-grande">{formatarCodigo(codigo)}</p>
        <div className="dica">
          <strong>No celular da criança</strong>
          <p>
            Abra o mesmo endereço do app, toque em “Já tenho um código” e digite esse código. Só
            precisa fazer isso uma vez.
          </p>
        </div>
        <button
          className="btn btn-wide btn-mint"
          onClick={() => aoEntrar({ codigo, papel: 'responsavel' })}
        >
          Entrar como responsável
        </button>
      </>
    )
  }

  /* ---------- digitar codigo ---------- */
  if (passo === 'codigo') {
    return (
      <>
        <button className="voltar" onClick={() => setPasso('inicio')}>
          ← Voltar
        </button>
        <h2>Qual é o código da família?</h2>
        <p className="aviso" style={{ textAlign: 'left', margin: '6px 0 0' }}>
          São 6 letras e números, como ABC-123.
        </p>
        <input
          className="campo codigo-campo"
          value={formatarCodigo(limparCodigo(digitado))}
          onChange={(e) => setDigitado(limparCodigo(e.target.value))}
          placeholder="ABC-123"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
          inputMode="text"
        />
        {erro ? <p className="aviso erro">{erro}</p> : null}
        <button className="btn btn-wide btn-mint" onClick={conferir} disabled={ocupado}>
          {ocupado ? 'Procurando…' : 'Entrar'}
        </button>
      </>
    )
  }

  /* ---------- quem usa este celular ---------- */
  return (
    <>
      <button className="voltar" onClick={() => setPasso('codigo')}>
        ← Voltar
      </button>
      <div className="festa" style={{ paddingBottom: 6 }}>
        <div className="porco">👋</div>
        <h2>Quem vai usar este celular?</h2>
        <p>Dá pra mudar depois, é só sair e entrar de novo.</p>
      </div>
      <button
        className="btn btn-wide btn-mint"
        onClick={() => aoEntrar({ codigo, papel: 'crianca' })}
      >
        🐷 Este é o celular da criança
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => aoEntrar({ codigo, papel: 'responsavel' })}
      >
        👨‍👩‍👦 Este é o celular do responsável
      </button>
      <p className="rodape">
        No celular do responsável dá pra criar tarefas e corrigir lançamentos. No da criança, não —
        mas ela continua podendo anotar tudo que entra e sai.
      </p>
    </>
  )
}
