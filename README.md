# Football Agent Tycoon

Crie um jogo web completo chamado "Project Football Agent".

O jogo deve ser uma simulação de gerenciamento onde o jogador controla um empresário de futebol começando do zero e tentando construir uma grande agência.

Tecnologias:

- React + TypeScript

- Interface moderna estilo jogo mobile

- Banco de dados para salvar progresso

- Sistema totalmente funcional

- Design responsivo para PC e celular

================================================

CONCEITO DO JOGO

O jogador começa criando seu empresário:

Campos:

Nome

Sobrenome

Nacionalidade

País

Estado

Cidade

Nome da Agência

Exemplo:

Nome:

Gustavo Oliveira

Agência:

Oliveira Sports

Local:

Três Passos - RS

Ao iniciar:

Ano: 2026

Mês: Março

Semana: 1

Dinheiro inicial:

R$ 2.000

Prestígio:

1 estrela

Jogadores contratados:

0

================================================

TELAS DO JOGO

1 - MENU PRINCIPAL

Criar:

PROJECT FOOTBALL AGENT

Botões:

Novo Jogo

Continuar

Configurações

Créditos

================================================

2 - CRIAÇÃO DO EMPRESÁRIO

Criar formulário completo.

Ao confirmar:

Gerar automaticamente:

ID do empresário

Formato:

EMP000001

Salvar dados.

================================================

3 - ESCRITÓRIO DA AGÊNCIA

Tela principal do jogo.

Mostrar:

Nome da agência

Cidade

Ano

Semana atual

Painel:

Dinheiro:

R$ 2000

Prestígio:

⭐

Jogadores:

0

Menu:

⚽ Procurar jogadores

👥 Meus jogadores

🤝 Negociações

📰 Notícias

🏢 Agência

⏩ Avançar semana

================================================

4 - SISTEMA DE TEMPO

Criar calendário.

Cada clique em:

Avançar semana

Faz:

Semana +1

Eventos aleatórios:

Exemplo:

"Um clube perguntou informações sobre um jogador."

"Um jovem talento apareceu na cidade."

"Você recebeu uma proposta."

Após 4 semanas:

Avançar mês.

================================================

5 - SISTEMA DE BUSCA DE JOGADORES

Criar locais:

Campo Municipal

Quadra

Escolinha

Escola

Várzea

Cada local gera jogadores aleatórios.

Exemplo:

Lucas Pereira

ID:

PLY000001

Idade:

13

Posição:

LE

Pé:

Canhoto

Cidade:

Três Passos

Potencial:

87

Status:

Sem clube

Sem empresário

================================================

6 - SISTEMA DE AVALIAÇÃO

Cada jogador possui:

Técnica

Velocidade

Finalização

Passe

Físico

Mental

Notas de 1 até 100.

Criar potencial escondido.

Exemplo:

Idade:

13

Atual:

55

Potencial:

90

================================================

7 - SISTEMA DE CONTRATAÇÃO

Ao clicar no jogador:

Mostrar:

Perfil completo.

Opções:

Observar

Conversar

Fazer proposta

Jogadores menores de idade:

Necessitam aprovação dos pais.

Fluxo:

Conversar:

Chance de aceitar baseada em:

Prestígio do empresário

Cidade

Idade

Personalidade

Caso aceite:

Adicionar jogador à agência.

================================================

8 - SISTEMA DE JOGADORES

Criar banco de jogadores.

Cada jogador deve possuir:

ID único

Nome

Idade

Posição

Cidade

Clube

Empresário

Atributos

Potencial

Histórico

Nunca usar nomes como identificação.

================================================

9 - SISTEMA DE CLUBES

Criar clubes fictícios:

Exemplo:

Grêmio

Internacional

Juventude

Caxias

Cada clube possui:

ID

Nome

Categoria

Orçamento

Interesse em jogadores

================================================

10 - MERCADO

Criar sistema onde:

Clubes podem procurar jogadores.

Eventos:

"Juventude demonstrou interesse em Lucas Pereira."

O empresário pode:

Negociar

Recusar

Aceitar

================================================

11 - SISTEMA FINANCEIRO

Adicionar:

Receitas:

Comissões

Contratos

Despesas:

Viagens

Observação

Documentação

Criar histórico financeiro.

================================================

12 - SISTEMA DE NOTÍCIAS

Criar feed:

Exemplo:

"Novo talento descoberto em Três Passos."

"Clube europeu observou jogador brasileiro."

================================================

13 - SISTEMA DE SAVE

Salvar tudo:

Empresário

Agência

Jogadores

Dinheiro

Data

Histórico

Permitir:

Salvar automaticamente

Continuar jogo

================================================

14 - DESIGN

Criar visual:

Inspirado em jogos mobile de gerenciamento.

Características:

Cards

Menus limpos

Ícones

Animações suaves

Modo escuro

Não criar mapa.

O jogo deve ser baseado em telas e menus.

================================================

15 - OBJETIVO FINAL

O jogador deve conseguir:

Criar empresário

Criar agência

Buscar jogadores

Contratar atletas

Evoluir reputação

Negociar contratos

Ganhar dinheiro

Criar uma agência mundial

O jogo deve estar funcional, não apenas uma demonstração visual.

Criar todos os componentes, páginas, lógica e banco necessários.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rookie-roots.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/96f39e35-909f-45d3-8669-9726a99ffaf9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
