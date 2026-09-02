// Em qual cofrinho este aparelho esta e quem esta usando ele.
// Fica so aqui no aparelho: e a "lembranca do login".

const CHAVE = 'cofrinho.sessao.v1'

export function lerSessao() {
  try {
    const cru = localStorage.getItem(CHAVE)
    return cru ? JSON.parse(cru) : null
  } catch {
    return null
  }
}

export function gravarSessao(sessao) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    // Sem espaco: a sessao vale so enquanto o app estiver aberto.
  }
}

export function apagarSessao() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // ignorado de proposito
  }
}

export const ehResponsavel = (sessao) => sessao?.papel === 'responsavel'
