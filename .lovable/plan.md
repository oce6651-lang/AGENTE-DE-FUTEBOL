# Plano: cinco carreiras e acesso correto entre divisões

## Resultado esperado
- Adicionar **Carregar jogo** no menu principal com até **5 carreiras salvas**.
- Manter **Continuar** abrindo automaticamente a carreira mais recente.
- Fazer acesso e rebaixamento trocarem **os dois primeiros e os dois últimos** entre divisões adjacentes.
- Aplicar a mesma regra ao futebol e ao futsal, incluindo a sequência **LNF → Silver → Ouro → Prata → Bronze**.

## Salvamentos
- Trocar o save único por cinco slots locais, mantendo um slot ativo durante a partida.
- Migrar automaticamente o save atual para o primeiro slot livre, sem apagar o progresso existente.
- Exibir em cada slot: nome do empresário, agência, ano do jogo, reputação e última atualização.
- Permitir carregar e excluir uma carreira com confirmação.
- Ao iniciar novo jogo, escolher um slot vazio; com os cinco ocupados, permitir selecionar qual carreira substituir.
- Salvar toda atualização apenas no slot ativo.

## Divisões
- Centralizar a ordem das divisões em uma única regra reutilizável, evitando interpretações diferentes entre liga, tela e simulação.
- Encerrar cada temporada classificando os clubes por pontos e aproveitamento, com desempate estável.
- Em cada degrau com divisões acima e abaixo válidas:
  - campeão e vice sobem;
  - último e penúltimo descem;
  - a divisão superior não promove além do seu topo;
  - a divisão inferior não rebaixa abaixo da sua base;
  - nenhum clube sobe e desce no mesmo encerramento.
- Tratar o futsal brasileiro como pirâmide contínua compatível com o modelo atual do clube: **LNF, LNF Silver, Ouro, Prata e Bronze**.
- Recalcular `liga` e competições de cada clube após a mudança, inclusive em carreiras antigas carregadas.
- Registrar os promovidos e rebaixados nas notícias de fim de temporada.

## Verificação
- Criar testes determinísticos para campeão/vice e último/penúltimo em todas as transições do futebol.
- Cobrir separadamente todas as transições do futsal, inclusive Silver/Ouro, Ouro/Prata e Prata/Bronze.
- Testar limites do topo e da base, ligas pequenas e a impossibilidade de dupla movimentação.
- Testar criação, carregamento, exclusão, limite de cinco slots e migração do save atual.
- Validar no menu a abertura de **Carregar jogo** e o início/continuação de carreiras distintas.

## Detalhes técnicos
- Persistência continua local ao navegador, agora com um índice de slots e dados completos separados.
- A lógica de classificação será isolada em funções puras para permitir simulações previsíveis e evitar regressões anuais.
- A estrutura vigente de `GameState` e os sistemas já implementados serão preservados.
