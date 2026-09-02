// Camada de sincronizacao. O cofrinho inteiro vive em um documento do
// Firestore, em `cofres/{codigo}`. Os dois aparelhos assinam o mesmo
// documento, entao o que um escreve aparece no outro na hora.
//
// O Firebase so e carregado quando ha configuracao: sem ela, o app continua
// 100% local e nem baixa a biblioteca.

import { CONFIG_FIREBASE, nuvemConfigurada } from './config.js'

let bd = null
let fs = null
let iniciando = null

async function iniciar() {
  if (bd) return
  if (iniciando) return iniciando

  iniciando = (async () => {
    const [{ initializeApp }, firestore, autenticacao] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
      import('firebase/auth')
    ])

    const app = initializeApp(CONFIG_FIREBASE)

    // O cache local faz o app abrir e funcionar sem internet: as escritas
    // ficam na fila e sobem sozinhas quando a conexao volta.
    bd = firestore.initializeFirestore(app, {
      localCache: firestore.persistentLocalCache({
        tabManager: firestore.persistentMultipleTabManager()
      })
    })
    fs = firestore

    // Login anonimo: ninguem digita senha, mas as regras conseguem exigir
    // que quem escreve tenha passado pelo Firebase.
    const auth = autenticacao.getAuth(app)
    if (!auth.currentUser) await autenticacao.signInAnonymously(auth)
  })()

  return iniciando
}

// Sem I, O, 0 e 1: sao os que a crianca erra ao copiar do outro celular.
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function sortearCodigo() {
  let s = ''
  const nums = crypto.getRandomValues(new Uint8Array(6))
  for (const n of nums) s += ALFABETO[n % ALFABETO.length]
  return s
}

export function formatarCodigo(codigo) {
  return codigo ? `${codigo.slice(0, 3)}-${codigo.slice(3)}` : ''
}

export function limparCodigo(texto) {
  return (texto || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
}

export async function criarCofre(estadoInicial) {
  await iniciar()
  // Na pratica nunca colide, mas conferir custa uma leitura e evita o pior.
  for (let tentativa = 0; tentativa < 5; tentativa += 1) {
    const codigo = sortearCodigo()
    const ref = fs.doc(bd, 'cofres', codigo)
    const atual = await fs.getDoc(ref)
    if (atual.exists()) continue
    await fs.setDoc(ref, { ...estadoInicial, criadoEm: new Date().toISOString() })
    return codigo
  }
  throw new Error('Não consegui criar um código novo. Tente de novo.')
}

export async function cofreExiste(codigo) {
  await iniciar()
  const instantaneo = await fs.getDoc(fs.doc(bd, 'cofres', codigo))
  return instantaneo.exists()
}

// Escuta o documento e chama `aoMudar` sempre que ele muda, aqui ou no outro
// aparelho. Devolve a funcao que cancela a escuta.
export function assinarCofre(codigo, aoMudar, aoFalhar) {
  let cancelar = null
  let cancelado = false

  iniciar()
    .then(() => {
      if (cancelado) return
      cancelar = fs.onSnapshot(
        fs.doc(bd, 'cofres', codigo),
        (instantaneo) => {
          if (instantaneo.exists()) aoMudar(instantaneo.data())
        },
        (erro) => aoFalhar && aoFalhar(erro)
      )
    })
    .catch((erro) => aoFalhar && aoFalhar(erro))

  return () => {
    cancelado = true
    if (cancelar) cancelar()
  }
}

// Escreve so os campos que mudaram, e nao o documento inteiro: assim uma
// tarefa criada no iPhone nao e apagada por uma entrada anotada no outro
// celular no mesmo minuto.
export async function enviarCampos(codigo, campos) {
  await iniciar()
  await fs.updateDoc(fs.doc(bd, 'cofres', codigo), campos)
}

export { nuvemConfigurada }
