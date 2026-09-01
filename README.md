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

Tudo fica salvo no `localStorage` do próprio aparelho. Nada vai para servidor nenhum.

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
src/lib/dinheiro.js   formatação de valores e datas
src/lib/cofrinho.js   estado do cofrinho, cálculos e persistência
src/telas/            Inicio, Movimento, Contar, Objetivos, Extrato, Dicas, Festa,
                      Tarefas (visao do Joaquim) e Pais (PIN, aprovacoes, ajustes)
src/estilos.css       o visual inteiro
```

**Valores são guardados em centavos (inteiros).** Nunca use ponto flutuante para dinheiro aqui — é o
que garante que R$ 0,10 + R$ 0,20 dê exatamente R$ 0,30.

## Próximas etapas

- **Sincronizar dois celulares** — hoje os dados vivem no aparelho onde o app é usado. Para o
  Joaquim aprovar no celular dele e você no seu, é preciso um servidor (Firebase, Supabase ou
  parecido). Ainda não está feito.
- **Etapa 3** — gráficos da origem do dinheiro ao longo dos meses e a ponte para o banco.
