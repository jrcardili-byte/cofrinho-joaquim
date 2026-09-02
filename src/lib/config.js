// Configuracao do Firebase.
//
// Cole aqui os valores que o Firebase mostra em
// Configuracoes do projeto -> Seus aplicativos -> App da Web.
//
// Estas chaves sao PUBLICAS por natureza: elas so dizem qual projeto o app usa.
// Quem protege os dados sao as regras de seguranca do Firestore, nao elas.
// Por isso podem ficar no repositorio sem problema.
//
// Enquanto estiver tudo vazio, o app funciona em modo local: os dados ficam
// so no aparelho, como antes, e nada e enviado para lugar nenhum.

export const CONFIG_FIREBASE = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
}

export const nuvemConfigurada = Boolean(CONFIG_FIREBASE.apiKey && CONFIG_FIREBASE.projectId)
