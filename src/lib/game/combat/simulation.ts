import type { CombatAction, CombatMethod, CombatResult, Fighter, ScheduledFight } from '../types';
export function simulateCombat(f: Fighter, fight: ScheduledFight) {
  const seconds = fight.roundSeconds ?? (f.sport === 'Jiu-jítsu' ? 300 : f.sport === 'MMA' ? 300 : 180);
  const rounds = fight.rounds;
  const strategy = fight.strategy === 'Defensiva' ? f.attributes.defense : fight.strategy === 'Quedas e chão' || fight.strategy === 'Buscar finalização' ? (f.attributes.grappling + f.attributes.wrestling) / 2 : fight.strategy === 'Clinch e joelhadas' ? (f.attributes.striking + f.attributes.cardio) / 2 : f.attributes.striking;
  const strength = f.rating + fight.campProgress * .08 + (f.condition - 80) * .15 + (strategy - f.rating) * .08 - (fight.weightProgress < 75 && f.sport !== 'Jiu-jítsu' ? 10 : 0);
  let home = 0, away = 0; const actions: CombatAction[] = []; let method: CombatMethod | undefined; let result: CombatResult | undefined; let finishRound = rounds;
  for (let r = 1; r <= rounds; r++) {
    let h = 0, a = 0;
    for (let t = 30; t <= seconds; t += 30) {
      const won = Math.random() < Math.max(.15, Math.min(.85, .5 + (strength - fight.opponentRating) / 100));
      const technique = f.sport === 'Jiu-jítsu' ? ['queda', 'raspagem', 'passagem de guarda', 'controle das costas'][Math.floor(Math.random() * 4)] : f.sport === 'Muay Thai' ? ['chute no corpo', 'joelhada no clinch', 'combinação de socos', 'cotovelada'][Math.floor(Math.random() * 4)] : f.sport === 'MMA' ? ['combinação de socos', 'queda', 'controle no chão', 'chute baixo'][Math.floor(Math.random() * 4)] : f.sport === 'Boxe' ? 'combinação de socos' : 'combinação de socos e chutes';
      const points = f.sport === 'Jiu-jítsu' ? (technique === 'passagem de guarda' ? 3 : technique === 'controle das costas' ? 4 : 2) : 1;
      if (won) h += points; else a += points;
      actions.push({ second: (r - 1) * seconds + t, round: r, text: `${won ? f.name : fight.opponent} conecta ${technique}.`, fighterScore: home + h, opponentScore: away + a });
      if (Math.random() < .018 && t > 60) { method = f.sport === 'Jiu-jítsu' || (f.sport === 'MMA' && technique === 'controle no chão') ? 'Finalização' : 'Nocaute técnico'; result = won ? 'V' : 'D'; finishRound = r; break; }
    }
    home += h; away += a;
    if (method) break;
    actions.push({ second: r * seconds, round: r, text: `Fim do round ${r}. ${f.sport === 'Jiu-jítsu' ? `Placar: ${home} × ${away}.` : h > a ? `${f.name} teve maior efetividade.` : `${fight.opponent} teve maior efetividade.`}`, fighterScore: home, opponentScore: away });
  }
  result ??= home > away ? 'V' : home < away ? 'D' : f.sport === 'Jiu-jítsu' ? Math.random() < .5 ? 'V' : 'D' : 'E';
  method ??= result === 'E' ? 'Empate' : f.sport === 'Jiu-jítsu' ? home === away ? 'Decisão dos árbitros' : 'Pontos' : 'Decisão unânime';
  if (Math.random() < .01) { result = 'NC'; method = 'Sem resultado'; }
  const last = actions.at(-1); const elapsed = (last?.second ?? seconds) % seconds;
  const time = method.includes('Decisão') || method === 'Pontos' || method === 'Empate' ? 'Final' : `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  actions.push({ second: last?.second ?? seconds, round: finishRound, text: `${result === 'V' ? f.name : result === 'D' ? fight.opponent : 'Combate'}: ${method}.`, fighterScore: home, opponentScore: away });
  return { result, method, round: finishRound, time, actions, score: f.sport === 'Jiu-jítsu' ? `${home} × ${away}` : undefined, report: `Preparação ${fight.campProgress}%. ${f.sport === 'Jiu-jítsu' ? 'Controle posicional e finalizações' : 'Efetividade, defesa e desgaste'} determinaram o resultado. ${f.condition < 70 ? 'A condição física prejudicou o desempenho.' : 'Condição física adequada.'}` };
}
