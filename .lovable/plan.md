# Esportes de combate na agência

## Objetivo
Adicionar MMA, boxe e kickboxing à carreira existente, usando organizações reais e lutadores gerados pelo jogo. Futebol e lutas compartilham caixa, calendário e estruturas da agência, mas cada modalidade terá reputação e contatos próprios.

## O que será construído
- Criar lutadores com idade, nascimento, nacionalidade, altura, peso, envergadura, categoria, estilo, academia, treinador, atributos, potencial e condição física.
- Incluir organizações reais e suas categorias de peso para MMA, boxe e kickboxing, sem cadastrar atletas reais.
- Criar descoberta de talentos em academias e eventos amadores, observação progressiva, conversa e contrato de representação.
- Adicionar central de lutas com clientes, radar, rankings, organizações, propostas e agenda.
- Simular camp, preparação, corte de peso, risco de lesão, escolha de adversário, luta round a round e recuperação.
- Negociar contratos por quantidade de lutas, bolsa garantida, bônus por vitória, comissão e duração.
- Manter cartel V–D–E–NC, vitórias por nocaute/finalização/decisão e histórico permanente de cada luta.
- Processar eventos, rankings, cinturões, mudanças de categoria, rivalidades e aposentadoria enquanto o mundo evolui.
- Migrar automaticamente as cinco carreiras atuais sem perder dados e salvar todo o novo progresso em cada espaço.

## Equilíbrio
- Início regional e amador, com acesso lento a grandes organizações.
- Caixa compartilhado, incluindo custos reais de observação, camp, viagens e exames.
- Reputação separada para MMA, boxe e kickboxing, evitando que o sucesso no futebol libere imediatamente o topo das lutas.
- Potencial não garante sucesso; idade, desgaste, estilo, camp, peso e adversário influenciam o resultado.

## Detalhes técnicos
- Separar dados, geração, simulação e interface dos esportes de combate em módulos próprios.
- Integrar o processamento semanal ao calendário existente sem alterar promoção, transferências ou competições do futebol.
- Usar modelos discriminados por modalidade para regras, categorias, métodos de vitória e atributos específicos.
- Garantir valores padrão na abertura de carreiras antigas.

## Validação
- Abrir uma carreira antiga e confirmar que futebol e cinco espaços salvos continuam intactos.
- Descobrir e contratar um lutador, negociar uma luta, concluir camp e corte de peso e simular o combate.
- Confirmar atualização de cartel, histórico, bolsa, comissão, condição, ranking e notícias.
- Avançar várias semanas e verificar eventos e lutas do mundo sem erros.