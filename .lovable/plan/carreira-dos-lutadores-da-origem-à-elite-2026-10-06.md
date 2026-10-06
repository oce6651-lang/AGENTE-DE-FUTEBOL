# Carreira dos lutadores: da origem à elite

## Objetivo
Construir os sete passos combinados e, em seguida, a observação em locais exploráveis, integrando tudo à mesma agência, calendário, finanças e cinco carreiras salvas.

## 1. Trajetória gradual
1. **Origem informal:** treinos comunitários, academias pequenas e eventos de rua simulados, com pouca recompensa e maior risco de lesão e consequências jurídicas.
2. **Formação amadora:** competições locais por modalidade, experiência, graduação no jiu-jítsu e primeiros títulos; despesas de inscrição e deslocamento, sem bolsas profissionais automáticas.
3. **MMA amador:** transição opcional para quem vem de outra modalidade, com aprendizagem das áreas deficientes e cartel amador próprio. Quem permanecer no boxe, jiu-jítsu, kickboxing ou Muay Thai continuará no seu circuito, sem obrigação de mudar para MMA.
4. **Profissional regional:** estreia condicionada à preparação e experiência, bolsas pequenas e acordos por luta.
5. **Circuito nacional:** acesso por desempenho, regularidade e contatos, com rankings, concorrência e contratos exclusivos quando cabíveis.
6. **Cenário internacional:** classificatórios, viagens, organizações intermediárias e adversários mais fortes.
7. **Elite mundial:** acesso raro a UFC, ONE, PFL, GLORY, ADCC e equivalentes apropriados à modalidade, com contratos, bônus, patrocínios e títulos quando aplicáveis.

O acesso não será automático por vencer uma luta ou completar um ano. Tempo de formação, idade, atributos, cartel, desempenho recente, disciplina e reputação específica determinarão oportunidades. Derrotas e lesões poderão atrasar a carreira; potencial não garantirá sucesso.

## 2. Desenvolvimento e gestão
- Evoluir atributos com treino, academia, treinador, experiência e idade; calcular o nível a partir dos atributos, sem aumentos independentes e incoerentes.
- Permitir escolher foco de treino e mudar de academia, com custos e efeitos na preparação.
- Manter cartéis informal, amador e profissional separados e históricos por modalidade; transições não transferirão ranking, cinturão ou reputação automaticamente.
- Registrar graduação, estreia profissional, títulos, contratos, mudanças de academia e modalidade na linha do tempo permanente.
- Adequar oportunidades ao esporte: entidades sancionadoras do boxe não serão tratadas como promotoras exclusivas, e torneios de jiu-jítsu não receberão automaticamente contratos de organização de MMA.
- Negociar bolsa, bônus, quantidade de lutas e duração; respeitar exclusividade, vencimento e renovação. Patrocínios dependerão de exposição e desempenho.

## 3. Lutas acompanháveis
- Integrar ao calendário uma tela de combate com início, pausa, velocidade e acompanhamento por rounds ou tempo de luta, semelhante às partidas de futebol.
- Mostrar ações, placar quando aplicável, desgaste, resultado e relatório técnico coerentes com cada modalidade.
- Usar a mesma simulação para o resultado acompanhado e para o avanço do calendário, sem sortear outra luta ao abrir o relatório.
- Persistir resultado e recompensas uma única vez, com atualização de cartel, lesões, bolsa, comissão, ranking, títulos e notícias.
- Respeitar formatos reais do evento: jiu-jítsu com e sem kimono, pontuação e finalizações; Muay Thai com rounds adequados ao circuito.

## 4. Depois: descoberta em locais exploráveis
- Substituir a descoberta instantânea pelo fluxo **escolher local → escolher treino ou evento → assistir → observar talentos → conversar → tentar contratar**.
- Incluir treinos comunitários, pequenas academias, eventos amadores, academias especializadas e centros de alto rendimento, com acesso por reputação, contatos e recursos.
- Mostrar localização, modalidades, agenda, custo e requisitos. Reutilizar imagens existentes onde forem adequadas e criar imagens para os novos locais necessários.
- Manter atletas identificados de forma estável para reencontrá-los e aprofundar relatórios; nem toda visita encontrará alguém aproveitável.
- Ocultar potencial e revelar atributos progressivamente. Talentos excepcionais serão raros, especialmente nos locais iniciais.

## Compatibilidade
- Preservar futebol, futsal, clientes atuais, histórico e os cinco espaços de carreira.
- Completar a migração pendente de jiu-jítsu e Muay Thai, incluindo organizações ausentes em saves anteriores.
- Não reiniciar nem rebaixar arbitrariamente lutadores já contratados; deduzir a etapa inicial deles a partir do histórico e contratos existentes.

## Detalhes técnicos
- Separar progressão, treino, descoberta, simulação e contratos em módulos do domínio de combate, com componentes visuais reutilizáveis.
- Centralizar regras e critérios por modalidade, integrando o processamento semanal existente sem alterar a simulação do futebol.
- Versionar os novos dados das carreiras e adicionar valores padrão de forma idempotente.

## Validação
- Testar os critérios das sete etapas, impedindo acesso prematuro à elite e contratos incompatíveis.
- Verificar transição para MMA sem perda do histórico nem transferência indevida de cartel ou ranking.
- Percorrer uma carreira nova: local, evento, observação, representação, treino, proposta, camp, luta e leitura do resultado.
- Conferir uma carreira antiga e a independência dos cinco espaços salvos.
- Validar os fluxos de jiu-jítsu e Muay Thai e a ausência de pagamentos ou resultados duplicados.