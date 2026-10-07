import type { CombatAttributes, CombatCareer, CombatCircuit, CombatSport, CombatStage, CombatTraining, Fighter, GameState } from '../types';
import { COMBAT_ORGANIZATIONS } from '../data/combat';
export const STAGES: CombatStage[] = ['Origem informal', 'Formação amadora', 'MMA amador', 'Profissional regional', 'Circuito nacional', 'Cenário internacional', 'Elite mundial'];
export const emptyRecord = () => ({ wins: 0, losses: 0, draws: 0, noContests: 0, knockouts: 0, submissions: 0, decisions: 0 });
export const weekIndex = (state: Pick<GameState, 'ano' | 'mes' | 'semana'>) => state.ano * 48 + (state.mes - 1) * 4 + state.semana;
export function combatRating(a: CombatAttributes, sport: CombatSport) {
  const technical = sport === 'MMA' ? (a.striking + a.grappling + a.wrestling) / 3 : sport === 'Jiu-jítsu' ? (a.grappling * 1.55 + a.wrestling * .85 + a.defense * .35) / 2.75 : sport === 'Muay Thai' ? (a.striking * 1.45 + a.power * .45 + a.defense * .65) / 2.55 : sport === 'Kickboxing' ? (a.striking * 1.35 + a.defense) / 2.35 : (a.striking * 1.5 + a.defense) / 2.5;
  return Math.round(technical * .45 + a.cardio * .12 + a.speed * .1 + a.power * .1 + a.fightIQ * .13 + a.chin * .1);
}
export function migrateFighter(f: Fighter): Fighter {
  if (f.career?.version === 1) return f;
  const org = COMBAT_ORGANIZATIONS.find(o => o.id === f.organizationId);
  const level = org?.level ?? 0;
  const professional = Boolean(f.contract || f.organizationId || f.fightHistory.length || f.record.wins || f.record.losses);
  const stage: CombatStage = level >= 9 ? 'Elite mundial' : level >= 7 ? 'Cenário internacional' : level >= 5 ? 'Circuito nacional' : professional ? 'Profissional regional' : 'Origem informal';
  const career: CombatCareer = { version: 1, stage, weeksTraining: professional ? 96 : 0, experience: professional ? (f.record.wins + f.record.losses) * 8 : 0, training: 'Equilibrado', gymLevel: professional ? 2 : 1, informalRecord: emptyRecord(), amateurRecord: emptyRecord(), professionalRecord: professional ? { ...f.record } : emptyRecord(), sportArchives: [], titles: [], development: 0, transitionWeeks: 0, origin: f.city };
  return { ...f, career, record: professional ? f.record : emptyRecord(), rating: combatRating(f.attributes, f.sport), scoutReports: f.scoutReports ?? [] };
}
export function stageEligible(f: Fighter, rep: number): CombatStage {
  const c = migrateFighter(f).career;
  if (!c) return 'Origem informal';
  const pro = c.professionalRecord, am = c.amateurRecord;
  const recent = f.fightHistory.slice(0, 5).filter(h => h.result === 'V').length;
  if (c.stage === 'Elite mundial' || (c.weeksTraining >= 240 && pro.wins >= 18 && pro.wins > pro.losses * 2 && recent >= 3 && f.rating >= 78 && rep >= 45 && f.attributes.discipline >= 50)) return 'Elite mundial';
  if (c.stage === 'Cenário internacional' || (c.weeksTraining >= 160 && pro.wins >= 12 && f.rating >= 65 && rep >= 25)) return 'Cenário internacional';
  if (c.stage === 'Circuito nacional' || (c.weeksTraining >= 100 && pro.wins >= 6 && f.rating >= 50 && rep >= 12)) return 'Circuito nacional';
  if (c.stage === 'Profissional regional' || (c.weeksTraining >= 48 && am.wins >= 5 && f.rating >= 35 && c.transitionWeeks === 0)) return 'Profissional regional';
  if (f.sport === 'MMA' && c.weeksTraining >= 16 && c.transitionWeeks === 0) return 'MMA amador';
  if (c.weeksTraining >= 8 && c.informalRecord.wins + c.informalRecord.losses >= 1) return 'Formação amadora';
  return c.stage;
}
export function circuitFor(f: Fighter): CombatCircuit {
  const stage = migrateFighter(f).career?.stage ?? 'Origem informal';
  return stage === 'Origem informal' ? 'informal' : stage === 'Formação amadora' || stage === 'MMA amador' ? 'amador' : 'profissional';
}
export function stageRequirements(stage: CombatStage) {
  const text: Record<CombatStage, string> = { 'Origem informal': '8 semanas de formação e participação informal', 'Formação amadora': '48 semanas de formação, 5 vitórias amadoras e nível 35', 'MMA amador': '48 semanas de formação, 5 vitórias amadoras e nível 35', 'Profissional regional': '100 semanas, 6 vitórias profissionais, nível 50 e reputação 12', 'Circuito nacional': '160 semanas, 12 vitórias profissionais, nível 65 e reputação 25', 'Cenário internacional': '240 semanas, 18 vitórias profissionais, nível 78 e reputação 45', 'Elite mundial': 'Manter desempenho, preparação e disponibilidade contratual' };
  return text[stage];
}
export function developFighter(fighter: Fighter, state: GameState, reputation: number): Fighter {
  let f = migrateFighter(fighter); const c = f.career; if (!c) return f;
  const index = weekIndex(state); if (c.lastDevelopmentWeek === index) return f;
  const [day, month, year] = f.birthDate.split('/').map(Number);
  const age = state.ano - year - (state.mes < month || (state.mes === month && state.semana * 7 < day) ? 1 : 0);
  const active = !f.injuryWeeks && age < 40;
  const growth = active ? (f.attributes.discipline / 100) * (c.gymLevel * .15 + .3) * (age < 27 ? 1 : .55) : 0;
  let development = c.development + growth;
  const attrs = { ...f.attributes };
  const focus: Record<CombatTraining, (keyof CombatAttributes)[]> = { Equilibrado: ['striking', 'grappling', 'wrestling', 'defense', 'cardio', 'fightIQ'], Trocação: ['striking', 'power', 'speed'], Grappling: ['grappling', 'wrestling', 'fightIQ'], Condicionamento: ['cardio', 'weightCut', 'chin'], Defesa: ['defense', 'speed', 'fightIQ'] };
  if (development >= 1) { const keys = focus[c.training]; const key = keys[index % keys.length]; if (key) attrs[key] = Math.min(f.potential, attrs[key] + 1); development -= 1; }
  if (age >= 34 && index % 24 === 0) { attrs.speed = Math.max(10, attrs.speed - 1); attrs.cardio = Math.max(10, attrs.cardio - 1); }
   f = { ...f, age: Math.max(18, age), attributes: attrs, rating: combatRating(attrs, f.sport), career: { ...c, development, lastDevelopmentWeek: index, weeksTraining: c.weeksTraining + (active ? 1 : 0), transitionWeeks: Math.max(0, c.transitionWeeks - (active ? 1 : 0)) } };
  const stage = stageEligible(f, reputation);
  if (stage !== c.stage && f.career) f = { ...f, career: { ...f.career, stage }, timeline: [...f.timeline, `${state.mes}/${state.ano}: avançou para ${stage}.`] };
  if (f.sport === 'Jiu-jítsu') { const weeks = f.career?.weeksTraining ?? 0; const belt = weeks >= 480 ? 'Faixa-preta' : weeks >= 360 ? 'Faixa-marrom' : weeks >= 240 ? 'Faixa-roxa' : weeks >= 96 ? 'Faixa-azul' : 'Faixa-branca'; if (!f.belt || ['Faixa-branca', 'Faixa-azul', 'Faixa-roxa', 'Faixa-marrom', 'Faixa-preta'].indexOf(belt) > ['Faixa-branca', 'Faixa-azul', 'Faixa-roxa', 'Faixa-marrom', 'Faixa-preta'].indexOf(f.belt)) f = { ...f, belt, timeline: [...f.timeline, `${state.mes}/${state.ano}: graduação ${belt}.`] }; }
  return f;
}
export function setTraining(state: GameState, id: string, training: CombatTraining): GameState { return { ...state, combatFighters: (state.combatFighters ?? []).map(f => { const next = migrateFighter(f); return f.id === id && next.career ? { ...next, career: { ...next.career, training } } : f; }) }; }
export function changeGym(state: GameState, id: string, level: number): { state: GameState; message: string } {
  const cost = level * 200; const f = (state.combatFighters ?? []).find(f => f.id === id); if (!f || f.scheduledFight || f.injuryWeeks || level < 1 || level > 3 || state.dinheiro < cost) return { state, message: 'Mudança indisponível: confira recuperação e caixa.' };
  const next = migrateFighter(f); if (!next.career) return { state, message: 'Carreira indisponível.' };
  if (level === 3 && (state.combatReputation?.[f.sport] ?? 0) < 15) return { state, message: 'O centro de alto rendimento exige reputação 15.' };
  const gym = level === 1 ? 'Academia comunitária' : level === 2 ? 'Academia especializada' : 'Centro de alto rendimento';
  return { state: { ...state, dinheiro: state.dinheiro - cost, financas: [{ id: crypto.randomUUID(), data: `${state.mes}/${state.ano}`, descricao: `Matrícula de ${f.name}: ${gym}`, valor: -cost, tipo: 'despesa' }, ...state.financas], combatFighters: (state.combatFighters ?? []).map(item => item.id === id ? { ...next, gym, career: { ...next.career as CombatCareer, gymLevel: level }, timeline: [...next.timeline, `Mudou para ${gym}.`] } : item) }, message: 'Nova academia contratada.' };
}
export function transitionToMma(state: GameState, id: string): { state: GameState; message: string } {
  const f = (state.combatFighters ?? []).find(f => f.id === id); if (!f || f.sport === 'MMA' || f.scheduledFight || f.contract || f.injuryWeeks || state.dinheiro < 400) return { state, message: 'Transição exige R$ 400, liberação contratual e médica.' };
  const next = migrateFighter(f), c = next.career; if (!c) return { state, message: 'Carreira indisponível.' };
  const career: CombatCareer = { ...c, stage: 'MMA amador', weeksTraining: 0, transitionWeeks: 16, amateurRecord: emptyRecord(), professionalRecord: emptyRecord(), informalRecord: emptyRecord(), sportArchives: [...c.sportArchives, { sport: f.sport, record: { ...f.record }, amateurRecord: { ...c.amateurRecord }, professionalRecord: { ...c.professionalRecord } }] };
  return { state: { ...state, dinheiro: state.dinheiro - 400, financas: [{ id: crypto.randomUUID(), data: `${state.mes}/${state.ano}`, descricao: `Adaptação ao MMA: ${f.name}`, valor: -400, tipo: 'despesa' }, ...state.financas], combatOffers: (state.combatOffers ?? []).filter(o => o.fighterId !== id), combatFighters: (state.combatFighters ?? []).map(item => item.id === id ? { ...next, sport: 'MMA', style: `Base de ${f.sport}`, career, record: emptyRecord(), rating: combatRating(f.attributes, 'MMA'), rank: undefined, champion: false, organizationId: undefined, timeline: [...f.timeline, `Iniciou adaptação de 16 semanas ao MMA; histórico de ${f.sport} preservado.`] } : item) }, message: 'Adaptação ao MMA iniciada. Cartel e ranking não foram transferidos.' };
}
