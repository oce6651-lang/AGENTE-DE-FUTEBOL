import type { CombatAttributes, CombatSport, CombatVisit, GameState } from '../types';
import { generateFighter } from '../combat';
import { combatRating, weekIndex } from './career';

export const COMBAT_LOCATIONS = [
  { id: 'community', name: 'Quadra comunitária', city: 'Bairro da agência', cost: 40, reputation: 0, level: 1, events: ['Treino aberto', 'Encontro informal'] },
  { id: 'small-gym', name: 'Academia de bairro', city: 'Centro da cidade', cost: 90, reputation: 0, level: 1, events: ['Treino técnico', 'Sparring supervisionado'] },
  { id: 'amateur', name: 'Ginásio municipal', city: 'Circuito local', cost: 160, reputation: 3, level: 2, events: ['Encontro amador', 'Seletiva local'] },
  { id: 'specialist', name: 'Academia especializada', city: 'Polo regional', cost: 280, reputation: 10, level: 2, events: ['Treino de competição', 'Avaliação de equipe'] },
  { id: 'performance', name: 'Centro de alto rendimento', city: 'Circuito nacional', cost: 550, reputation: 25, level: 3, events: ['Camp aberto', 'Avaliação técnica'] },
] as const;

export function bookCombatVisit(state: GameState, locationId: string, sport: CombatSport, event: string): { state: GameState; message: string } {
  const location = COMBAT_LOCATIONS.find(l => l.id === locationId);
  if (!location || !location.events.some(item => item === event)) return { state, message: 'Agenda indisponível.' };
  const existing = state.combatVisits?.find(v => v.locationId === locationId && v.sport === sport && v.event === event && v.weekIndex === weekIndex(state));
  if (existing) return { state, message: 'Visita já agendada nesta semana.' };
  if (state.energia < 1 || state.dinheiro < location.cost || (state.combatReputation?.[sport] ?? 0) < location.reputation) return { state, message: 'Confira energia, reputação e custo da visita.' };
  const count = Math.random() < .25 ? 0 : Math.random() < .75 ? 1 : 2;
  const candidates = Array.from({ length: count }, () => {
    const fighter = generateFighter(state, sport);
    const bonus = (location.level - 1) * 7;
    const attributes = { ...fighter.attributes };
    for (const key of Object.keys(attributes) as (keyof CombatAttributes)[]) attributes[key] = Math.min(65, attributes[key] + bonus);
    return { ...fighter, attributes, rating: combatRating(attributes, sport), city: state.agent.cidade, gym: location.name, timeline: [`Conhecido em ${location.name} • ${state.mes}/${state.ano}.`], career: fighter.career ? { ...fighter.career, origin: location.name } : undefined };
  });
  const visit: CombatVisit = { id: crypto.randomUUID(), locationId, sport, event, weekIndex: weekIndex(state), candidates, attended: false, actions: Array.from({ length: 8 }, (_, i) => ({ second: (i + 1) * 30, round: 1, fighterScore: 0, opponentScore: 0, text: i === 7 ? 'Atividade encerrada. Avaliação dos participantes disponível.' : `${event}: ${['aquecimento e movimentação', 'exercícios técnicos', 'trabalho de defesa', 'troca de posições', 'condicionamento', 'atividade em dupla', 'orientação do treinador'][i]}.` })) };
  return { state: { ...state, energia: state.energia - 1, dinheiro: state.dinheiro - location.cost, combatVisits: [visit, ...(state.combatVisits ?? [])], financas: [{ id: crypto.randomUUID(), data: `${state.mes}/${state.ano}`, descricao: `Visita: ${location.name} • ${sport}`, valor: -location.cost, tipo: 'despesa' }, ...state.financas] }, message: 'Visita agendada.' };
}

export function attendCombatVisit(state: GameState, visitId: string): GameState {
  const visit = state.combatVisits?.find(v => v.id === visitId);
  if (!visit || visit.attended) return state;
  const knownIds = new Set([...(state.combatRadar ?? []), ...(state.combatFighters ?? [])].map(f => f.id));
  return { ...state, combatVisits: (state.combatVisits ?? []).map(v => v.id === visitId ? { ...v, attended: true } : v), combatRadar: [...(state.combatRadar ?? []), ...visit.candidates.filter(f => !knownIds.has(f.id)).map(f => ({ ...f, scoutReports: [{ weekIndex: visit.weekIndex, location: f.gym, text: 'Primeira observação: avaliação ainda incompleta.' }] }))] };
}

export function talkToFighter(state: GameState, fighterId: string): { state: GameState; message: string } {
  const fighter = state.combatRadar?.find(f => f.id === fighterId);
  if (!fighter || state.energia < 1) return { state, message: 'Conversa indisponível nesta semana.' };
  const marker = `${weekIndex(state)}: conversa com a agência.`;
  if (fighter.timeline.includes(marker)) return { state, message: 'Vocês já conversaram nesta semana.' };
  return { state: { ...state, energia: state.energia - 1, combatRadar: (state.combatRadar ?? []).map(f => f.id === fighterId ? { ...f, trust: Math.min(100, f.trust + 12), timeline: [...f.timeline, marker] } : f) }, message: `${fighter.name} contou seus objetivos e conheceu a agência.` };
}