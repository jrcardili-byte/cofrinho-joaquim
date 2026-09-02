# Cofrinho do Joaquim

App para controlar o **cofrinho físico** do Joaquim. O dinheiro continua sendo moeda e cédula dentro
do cofre — o app só anota o que entra e o que sai, para ele saber quanto tem lá dentro sem precisar
abrir.

A regra que guia todas as telas: **primeiro acontece no mundo real, depois se anota.** Por isso os
botões se chamam “Coloquei” e “Tirei”, no passado, e não “Depositar” e “Sacar”.

## O que já funciona

- **Primeira contagem**: no primeiro uso o app leva direto para contar o cofre por tipo de moeda e
  cédula. É assim que ele descobre o ponto de partida.
- **Coloquei / Tirei**: teclado grande, categoria da origem (presente, moedas da vó, mesada, tarefa,
  troco, vendi algo) ou do destino (brinquedo, jogo, lanche, passeio, presente pra alguém, levei pro
  banco).
- **Conferir o cofrinho**: conta de novo por denominação e compara com o anotado. Se não bater, grava
  um ajuste em vez de fingir que está certo.
- **Objetivos** com barra de progresso e data prevista, calculada pelo ritmo real de guardar.
- **Teste dos 3 dias**: saídas de R$ 10 ou mais oferecem adiar a decisão. Se ele desistir, comemora.
- **Dicas e conquistas**: dica do dia, sequência de semanas guardando, de onde veio o dinheiro,
  simulador de “e se eu guardar todo mês” e, quando o cofre passa de R$ 300, a sugestão de levar uma
  parte para o banco.
- **Extrato** agrupado por mês, com resumo em uma frase antes da lista.
- Funciona **offline** e é instalável na tela inicial (PWA).

### Tarefas e modo dos responsáveis (Etapa 2)

- **Catálogo de tarefas** criado pelo responsável: nome, ícone, valor e frequência.
- **Ciclo de aprovação**: o Joaquim marca “fiz!”, o responsável aprova, e aí a tarefa entra na
  lista **“pra receber”**. O saldo **não sobe na aprovação** — sobe quando ele recebe a moeda na mão
  e toca em “recebi”. É a mesma regra do resto do app: primeiro o mundo real, depois a anotação.
- **Mesada automática**: no dia escolhido do mês, ela entra sozinha no “pra receber”. O app lembra,
  você entrega o dinheiro.
- **Modo dos responsáveis** protegido por PIN de 4 números, com as abas Aprovar, Tarefas e Ajustes,
  além do resumo de onde vem o dinheiro dele.

> O PIN é uma tranca de confiança, não segurança de verdade: ele fica salvo no próprio aparelho e
> serve para impedir o clique impulsivo de uma criança, não um adulto determinado.

### Minha jornada e o banco (Etapa 3)

- **Gráfico do patrimônio mês a mês**, com o cofre e o banco empilhados: dá para tocar em cada barra
  e ver o mês em detalhe.
- **Gráfico do que entrou e do que saiu**, divergente em torno do zero.
- **O banco é um lugar, não um gasto.** Levar dinheiro para o banco tira do cofre e soma no banco;
  o total (“tudo que é seu”) não muda. Um app que mostrasse a criança ficando mais pobre por
  investir estaria ensinando exatamente o contrário do que se quer.
- Transferências de e para o banco ficam fora dos totais de “entrou” e “saiu” do mês, porque
  transferência não é ganho nem gasto.

As cores das séries foram validadas para daltonismo com o script do skill de visualização
(deutan ΔE 9.7 no tema claro, 8.0 no escuro; o tema escuro usa tons próprios porque os do app
ficavam fora da faixa de luminosidade). Como o verde tem contraste baixo contra o fundo claro,
**toda barra carrega o valor escrito** — a cor nunca é a única informação.

### Dois celulares, dois papéis (Etapa 4)

- **Código da família**: o responsável cria o cofrinho e o app gera um código de 6 caracteres
  (ex.: `ABC-123`). No celular da criança esse código é digitado uma vez e pronto — ela nunca faz
  login, nunca decora senha.
- **Papéis**: quem entra como *responsável* cria tarefas, define a mesada e corrige lançamentos;
  quem entra como *criança* anota entradas, saídas, conta o cofre e acompanha os objetivos.
- **Sincronização em tempo real**: aprovar uma tarefa no iPhone aparece no celular dele na hora,
  sem recarregar.
- **Aba Dinheiro** no modo dos responsáveis: lançar entrada ou saída direto e apagar lançamentos
  errados.
- Continua funcionando **sem internet**: as alterações ficam na fila e sobem sozinhas.

Sem a configuração do Firebase preenchida, o app roda em **modo local** exatamente como antes — os
dados ficam no aparelho e a biblioteca do Firebase nem é baixada.

## Ligando a sincronização (Firebase)

Passo a passo, uma vez só:

1. Em https://console.firebase.google.com crie um projeto (pode usar sua conta Google). Pode
   desativar o Google Analytics, não é usado aqui.
2. Dentro do projeto, clique no ícone **`</>`** (App da Web), dê um apelido e registre. O Firebase
   vai mostrar um bloco `firebaseConfig` — é ele que vai em `src/lib/config.js`.
3. Menu **Criação → Firestore Database → Criar banco de dados**. Escolha *modo de produção* e a
   região `southamerica-east1` (São Paulo).
4. Menu **Criação → Authentication → Vamos começar → Método de login → Anônimo → Ativar**.
5. Na aba **Regras** do Firestore, cole o conteúdo do arquivo `firestore.rules` deste repositório e
   publique.
6. Cole os valores do passo 2 em `src/lib/config.js`, faça commit e push. O deploy é automático.

As chaves do `firebaseConfig` são públicas por natureza — elas apenas dizem *qual* projeto o app
usa. Quem protege os dados são as regras do passo 5.

### O que as regras significam

Quem tem o código entra: **o código é o segredo**, já que não existe senha. Alguém que descobrisse
um código válido conseguiria ler e escrever naquele cofrinho. São mais de um bilhão de combinações
e o dado é o extrato de um cofrinho de criança, então a troca vale a pena. Se um dia precisar de
mais, o caminho é login de verdade com dono do documento.

## Onde os dados ficam

Sempre há uma cópia local no `localStorage` do aparelho — é ela que faz o app abrir offline. Com a
sincronização ligada, o cofrinho também vive em um documento do Firestore, e os dois celulares
assinam esse mesmo documento.

## Rodando no computador

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`.

## No ar

**https://jrcardili-byte.github.io/cofrinho-joaquim/**

Publicado no GitHub Pages. Todo `git push` na branch `main` dispara o workflow
`.github/workflows/deploy.yml`, que compila e publica sozinho — não precisa fazer mais nada.

No celular, abra o endereço e use “Adicionar à tela inicial” (menu do Chrome). A partir daí o app
abre offline, como qualquer aplicativo instalado.

Para testar na mesma rede antes de publicar, `npm run dev` já sobe com `--host`: acesse
`http://<ip-do-computador>:5173` pelo celular. Funciona, mas sem instalação offline — o service
worker exige HTTPS ou `localhost`.

## Gravando a etiqueta NFC

1. Compre uma etiqueta **NTAG213** (as adesivas, de uns R$ 2 cada).
2. Instale um app de escrita NFC no seu celular Android (o *NFC Tools* é o mais comum).
3. Grave um registro do tipo **URL** com `https://jrcardili-byte.github.io/cofrinho-joaquim/`
4. Cole a etiqueta embaixo ou atrás do cofrinho.

No Android o app abre direto ao aproximar. No iPhone aparece uma notificação do sistema e um toque
abre. Não é preciso nenhum código extra no app: a etiqueta é só um link.

## Estrutura

```
index.html            página e fontes
public/               manifest, ícones e service worker
firestore.rules       regras de seguranca do banco (colar no console do Firebase)
src/lib/config.js     chaves do Firebase (vazio = modo local)
src/lib/nuvem.js      sincronizacao: criar cofre, entrar por codigo, assinar mudancas
src/lib/sessao.js     em qual cofrinho este aparelho esta e quem esta usando
src/lib/dinheiro.js   formatação de valores e datas
src/lib/cofrinho.js   estado do cofrinho, cálculos e persistência
src/telas/            Entrar (codigo da familia), Inicio, Movimento, Contar,
                      Objetivos, Extrato, Dicas, Festa, Tarefas (visao do Joaquim),
                      Pais (aprovacoes, tarefas, dinheiro, ajustes) e Jornada
src/estilos.css       o visual inteiro
```

**Valores são guardados em centavos (inteiros).** Nunca use ponto flutuante para dinheiro aqui — é o
que garante que R$ 0,10 + R$ 0,20 dê exatamente R$ 0,30.

## Próximas etapas

- **Rendimento real do banco** — hoje a projeção usa uma taxa fixa de 6% ao ano só como ilustração.
  Dava para o responsável cadastrar a taxa da conta de verdade.
