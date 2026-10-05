import { COMBAT_ORGANIZATIONS, WEIGHT_KG, organizationsFor } from "./data/combat";
import type { CombatAttributes, CombatMethod, CombatOffer, CombatOrganization, CombatRecord, CombatResult, CombatSport, Fighter, FinanceEntry, GameState, NewsItem, ScheduledFight } from "./types";

const FIRST_NAMES = ["Caio", "Leandro", "Rafael", "Bruno", "Vitor", "André", "Mateus", "Henrique", "Diego", "Murilo", "Igor", "Samuel", "João", "Lucas", "Davi", "Thiago"];
const LAST_NAMES = ["Silva", "Oliveira", "Pereira", "Santos", "Costa", "Almeida", "Souza", "Ferreira", "Barbosa", "Lima", "Moura", "Nunes"];
const CITIES = ["Porto Alegre", "São Paulo", "Curitiba", "Rio de Janeiro", "Belo Horizonte", "Fortaleza", "Manaus", "Salvador"];
const GYMS = ["Academia Nova União", "Chute Boxe", "Team Nogueira", "Evolução Thai", "Capital da Luta", "Arena Combat", "CT Vale Tudo", "Boxe Brasil"];
const COACHES = ["Marcos Tavares", "Renato Alves", "Carlos Nunes", "Paulo Rocha", "Alexandre Lima", "Roberto Freitas"];

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: T[]): T => items[random(0, items.length - 1)];
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const dateLabel = (state: GameState) => `${state.mes}/${state.ano} • semana ${state.semana}`;

export function defaultCombatReputation(): Record<CombatSport, number> {
  return { MMA: 0, Boxe: 0, Kickboxing: 0 };
}

export function combatOrganizations(): CombatOrganization[] {
  return COMBAT_ORGANIZATIONS.map(organization => ({ ...organization, weightClasses: [...organization.weightClasses] }));
}

function attributes(base: number): CombatAttributes {
  const value = () => Math.max(10, Math.min(99, base + random(-12, 12)));
  return { striking: value(), grappling: value(), wrestling: value(), defense: value(), power: value(), speed: value(), cardio: value(), chin: value(), fightIQ: value(), discipline: value(), weightCut: value() };
}

function rating(attrs: CombatAttributes, sport: CombatSport) {
  const technical = sport === "MMA"
    ? (attrs.striking + attrs.grappling + attrs.wrestling) / 3
    : sport === "Boxe" ? (attrs.striking * 1.5 + attrs.defense) / 2.5 : (attrs.striking * 1.35 + attrs.defense) / 2.35;
  return Math.round(technical * 0.45 + attrs.cardio * 0.12 + attrs.speed * 0.1 + attrs.power * 0.1 + attrs.fightIQ * 0.13 + attrs.chin * 0.1);
}

export function generateFighter(state: GameState, sport?: CombatSport): Fighter {
  const chosenSport = sport ?? pick<CombatSport>(["MMA", "Boxe", "Kickboxing"]);
  const age = random(18, 29);
  const weightClass = pick(organizationsFor(chosenSport)[0]?.weightClasses ?? ["Peso-leve"]);
  const base = random(24, 48);
  const attrs = attributes(base);
  const current = rating(attrs, chosenSport);
  const styles = chosenSport === "MMA"
    ? ["Jiu-jítsu", "Wrestling", "Muay Thai", "Completo", "Contra-golpeador"]
    : chosenSport === "Boxe" ? ["Out-boxer", "Pressionador", "Contra-golpeador", "Boxer-puncher"] : ["Muay Thai", "Karate", "Pressionador", "Contra-golpeador"];
  const wins = random(0, 7);
  const losses = random(0, Math.min(4, Math.ceil(wins / 2)));
  const record: CombatRecord = { wins, losses, draws: Math.random() < 0.12 ? 1 : 0, noContests: 0, knockouts: random(0, wins), submissions: chosenSport === "MMA" ? random(0, wins) : 0, decisions: 0 };
  record.submissions = Math.min(record.submissions, wins - record.knockouts);
  record.decisions = Math.max(0, wins - record.knockouts - record.submissions);
  const year = state.ano - age;
  return {
    id: uid("fighter"), name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, sport: chosenSport, age,
    birthDate: `${String(random(1, 28)).padStart(2, "0")}/${String(random(1, 12)).padStart(2, "0")}/${year}`,
    nationality: "Brasil", city: pick(CITIES), height: random(weightClass === "Peso-pesado" ? 184 : 164, weightClass === "Peso-pesado" ? 202 : 190),
    reach: random(168, weightClass === "Peso-pesado" ? 211 : 198), weight: WEIGHT_KG[weightClass] ?? 70, weightClass,
    stance: pick(["Destro", "Canhoto", "Ambidestro"]), style: pick(styles), gym: pick(GYMS), coach: pick(COACHES),
    attributes: attrs, rating: current, potential: random(Math.max(current + 8, 55), Math.min(96, current + 45)),
    condition: random(78, 100), morale: random(60, 90), popularity: random(2, 18), trust: random(10, 28), scouted: 1,
    represented: false, status: "Disponível", record, fightHistory: [], goals: [pick(["Ser campeão mundial", "Lutar no exterior", "Sustentar a família", "Manter uma longa carreira", "Ser reconhecido no Brasil"])], rivalries: [], timeline: [`Descoberto em um evento regional em ${state.mes}/${state.ano}.`],
  };
}

export function discoverCombatTalent(state: GameState, sport: CombatSport): { state: GameState; message: string } {
  if (state.energia <= 0) return { state, message: "Sem energia nesta semana." };
  const cost = 280;
  if (state.dinheiro < cost) return { state, message: `São necessários R$ ${cost.toLocaleString("pt-BR")} para visitar o evento.` };
  const count = Math.random() < 0.28 ? 2 : 1;
  const fighters = Array.from({ length: count }, () => generateFighter(state, sport));
  const finance: FinanceEntry = { id: uid("combat-fin"), data: dateLabel(state), descricao: `Observação de ${sport} em evento regional`, valor: -cost, tipo: "despesa" };
  return { state: { ...state, dinheiro: state.dinheiro - cost, energia: Math.max(0, state.energia - 1), combatRadar: [...fighters, ...(state.combatRadar ?? [])].slice(0, 40), financas: [finance, ...state.financas] }, message: `${fighters.length} talento(s) de ${sport} entraram no radar.` };
}

export function scoutFighter(state: GameState, fighterId: string): { state: GameState; message: string } {
  if (state.energia <= 0 || state.dinheiro < 120) return { state, message: "Faltam energia ou R$ 120 para uma nova observação." };
  const update = (fighter: Fighter) => fighter.id === fighterId ? { ...fighter, scouted: fighter.scouted + 1, trust: Math.min(100, fighter.trust + random(2, 6)) } : fighter;
  return { state: { ...state, dinheiro: state.dinheiro - 120, energia: state.energia - 1, combatRadar: (state.combatRadar ?? []).map(update) }, message: "O relatório técnico foi aprofundado." };
}

export function signFighter(state: GameState, fighterId: string): { state: GameState; message: string } {
  const fighter = (state.combatRadar ?? []).find(item => item.id === fighterId);
  if (!fighter) return { state, message: "Lutador não encontrado." };
  if (state.dinheiro < 350) return { state, message: "Faltam R$ 350 para contrato, exames e documentação." };
  const rep = (state.combatReputation ?? defaultCombatReputation())[fighter.sport];
  const chance = 28 + fighter.trust * 0.65 + rep * 0.35 - fighter.rating * 0.22;
  if (Math.random() * 100 > Math.min(92, chance)) {
    return { state: { ...state, dinheiro: state.dinheiro - 120, combatRadar: (state.combatRadar ?? []).map(item => item.id === fighterId ? { ...item, trust: Math.max(0, item.trust - 4) } : item) }, message: `${fighter.name} decidiu esperar uma agência mais conhecida.` };
  }
  const signed = { ...fighter, represented: true, trust: Math.min(100, fighter.trust + 15), status: "Aguardando oportunidade", timeline: [...fighter.timeline, `Assinou com ${state.agent.agencia}.`] };
  return { state: { ...state, dinheiro: state.dinheiro - 350, combatRadar: (state.combatRadar ?? []).filter(item => item.id !== fighterId), combatFighters: [signed, ...(state.combatFighters ?? [])] }, message: `${fighter.name} agora é cliente da agência.` };
}

export function seekFightOffer(state: GameState, fighterId: string): { state: GameState; message: string } {
  const fighter = (state.combatFighters ?? []).find(item => item.id === fighterId);
  if (!fighter || fighter.scheduledFight) return { state, message: "Este lutador não está disponível para negociar." };
  if (state.energia <= 0) return { state, message: "Sem energia para contatar os matchmakers." };
  const rep = (state.combatReputation ?? defaultCombatReputation())[fighter.sport];
  const possible = organizationsFor(fighter.sport).filter(org => org.level <= Math.max(5, 2 + Math.floor((fighter.rating + rep) / 18)));
  const organization = pick(possible.length ? possible : organizationsFor(fighter.sport).slice(-2));
  const opponentRating = Math.max(20, Math.min(96, fighter.rating + random(-6, 10)));
  const purse = Math.round((600 + organization.level * 650 + opponentRating * 55) / 100) * 100;
  const offer: CombatOffer = { id: uid("fight-offer"), fighterId, organizationId: organization.id, opponent: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, opponentRating, event: `${organization.name} ${random(20, 280)}`, purse, winBonus: Math.round(purse * 0.55), contractFights: organization.level >= 8 ? random(3, 5) : random(1, 3), weeksUntilFight: random(6, 10), titleFight: fighter.rank !== undefined && fighter.rank <= 3 && Math.random() < 0.28, status: "aberta", expiresIn: 2 };
  return { state: { ...state, energia: state.energia - 1, combatOffers: [offer, ...(state.combatOffers ?? [])] }, message: `${organization.name} enviou uma proposta de luta.` };
}

export function answerFightOffer(state: GameState, offerId: string, accept: boolean): { state: GameState; message: string } {
  const offer = (state.combatOffers ?? []).find(item => item.id === offerId);
  const fighter = (state.combatFighters ?? []).find(item => item.id === offer?.fighterId);
  if (!offer || !fighter) return { state, message: "Proposta indisponível." };
  if (!accept) return { state: { ...state, combatOffers: (state.combatOffers ?? []).filter(item => item.id !== offerId) }, message: "Proposta recusada." };
  const fight: ScheduledFight = { id: uid("fight"), opponent: offer.opponent, opponentRating: offer.opponentRating, organizationId: offer.organizationId, event: offer.event, weeksRemaining: offer.weeksUntilFight, campWeeks: offer.weeksUntilFight, campProgress: 0, weightProgress: 35, strategy: "Equilibrada", titleFight: offer.titleFight, purse: offer.purse, winBonus: offer.winBonus };
  const contract = fighter.contract ?? { organizationId: offer.organizationId, fightsRemaining: offer.contractFights, guaranteedPurse: offer.purse, winBonus: offer.winBonus, agencyCommission: 0.1, expiresYear: state.ano + 2 };
  return { state: { ...state, combatOffers: (state.combatOffers ?? []).filter(item => item.fighterId !== fighter.id), combatFighters: (state.combatFighters ?? []).map(item => item.id === fighter.id ? { ...item, organizationId: offer.organizationId, contract, scheduledFight: fight, status: `Camp para ${offer.event}`, timeline: [...item.timeline, `Luta marcada contra ${offer.opponent} no ${offer.event}.`] } : item) }, message: `Luta confirmada: ${fighter.name} x ${offer.opponent}.` };
}

export function setFightStrategy(state: GameState, fighterId: string, strategy: ScheduledFight["strategy"]): GameState {
  return { ...state, combatFighters: (state.combatFighters ?? []).map(fighter => fighter.id === fighterId && fighter.scheduledFight ? { ...fighter, scheduledFight: { ...fighter.scheduledFight, strategy } } : fighter) };
}

function resolveFight(state: GameState, fighter: Fighter): { fighter: Fighter; finance: FinanceEntry; news: NewsItem; reputation: number } {
  const fight = fighter.scheduledFight;
  if (!fight) throw new Error("Luta agendada ausente.");
  const organization = COMBAT_ORGANIZATIONS.find(item => item.id === fight.organizationId);
  const campBonus = fight.campProgress * 0.12 + Math.max(-12, (fighter.condition - 70) * 0.25);
  const styleBonus = fight.strategy === "Equilibrada" ? 2 : fight.strategy === "Trocação" ? (fighter.attributes.striking - fighter.attributes.grappling) * 0.08 : fight.strategy === "Quedas e chão" ? (fighter.attributes.grappling + fighter.attributes.wrestling - fighter.attributes.striking * 2) * 0.06 : fighter.attributes.defense * 0.04;
  const score = fighter.rating + campBonus + styleBonus + random(-18, 18) - (fight.weightProgress < 75 ? 12 : 0);
  let result: CombatResult = score >= fight.opponentRating ? "V" : "D";
  if (Math.random() < 0.025) result = "NC";
  else if (Math.abs(score - fight.opponentRating) < 2 && Math.random() < 0.2) result = "E";
  const finishChance = fighter.sport === "MMA" ? 0.52 : 0.62;
  let method: CombatMethod = result === "NC" ? "Sem resultado" : result === "E" ? "Empate" : Math.random() < finishChance ? (fighter.sport === "MMA" && fighter.attributes.grappling > fighter.attributes.striking && Math.random() < 0.52 ? "Finalização" : Math.random() < 0.48 ? "Nocaute" : "Nocaute técnico") : Math.random() < 0.72 ? "Decisão unânime" : "Decisão dividida";
  const round = method.includes("Decisão") || method === "Empate" ? (fight.titleFight ? 5 : 3) : random(1, fight.titleFight ? 5 : 3);
  const purse = fight.purse + (result === "V" ? fight.winBonus : 0);
  const commission = Math.round(purse * (fighter.contract?.agencyCommission ?? 0.1));
  const record = { ...fighter.record };
  if (result === "V") record.wins += 1;
  if (result === "D") record.losses += 1;
  if (result === "E") record.draws += 1;
  if (result === "NC") record.noContests += 1;
  if (result === "V" && (method === "Nocaute" || method === "Nocaute técnico")) record.knockouts += 1;
  if (result === "V" && method === "Finalização") record.submissions += 1;
  if (result === "V" && method.includes("Decisão")) record.decisions += 1;
  const history = { id: fight.id, year: state.ano, month: state.mes, week: state.semana, opponent: fight.opponent, event: fight.event, organization: organization?.name ?? "Evento regional", result, method, round, time: method.includes("Decisão") || method === "Empate" ? "Final" : `${random(0, 4)}:${String(random(0, 59)).padStart(2, "0")}`, purse, titleFight: fight.titleFight, weightClass: fighter.weightClass };
  const injuryWeeks = Math.random() < 0.18 ? random(2, 9) : 0;
  const contract = fighter.contract ? { ...fighter.contract, fightsRemaining: Math.max(0, fighter.contract.fightsRemaining - 1) } : undefined;
  const updated: Fighter = { ...fighter, record, fightHistory: [history, ...fighter.fightHistory], scheduledFight: undefined, contract, condition: Math.max(25, fighter.condition - random(15, 35)), morale: Math.max(20, Math.min(100, fighter.morale + (result === "V" ? 12 : -10))), popularity: Math.min(100, fighter.popularity + (result === "V" ? (fight.titleFight ? 18 : 6) : 1)), rating: Math.max(15, Math.min(fighter.potential, fighter.rating + (result === "V" ? random(1, 3) : Math.random() < 0.3 ? -1 : 0))), champion: fight.titleFight && result === "V" ? true : fighter.champion, rank: result === "V" ? Math.max(1, (fighter.rank ?? 15) - random(1, 4)) : Math.min(30, (fighter.rank ?? 15) + random(1, 3)), injuryWeeks, status: injuryWeeks ? `Lesionado por ${injuryWeeks} semanas` : "Em recuperação", timeline: [...fighter.timeline, `${result} contra ${fight.opponent} por ${method} no ${fight.event}.`] };
  const finance: FinanceEntry = { id: uid("combat-income"), data: dateLabel(state), descricao: `Comissão da bolsa de ${fighter.name}`, valor: commission, tipo: "receita" };
  const news: NewsItem = { id: uid("combat-news"), semana: state.semana, mes: state.mes, ano: state.ano, titulo: `${fighter.name} ${result === "V" ? "vence" : result === "D" ? "é derrotado" : result === "E" ? "empata" : "tem luta anulada"} no ${fight.event}`, texto: `${method}, round ${round}. Cartel: ${record.wins}-${record.losses}-${record.draws}-${record.noContests} NC.`, tipo: "mundo" };
  return { fighter: updated, finance, news, reputation: result === "V" ? (fight.titleFight ? 5 : 2) : 0 };
}

export function processCombatWeek(state: GameState, events: string[]): GameState {
  let finances = state.financas;
  let news = state.noticias;
  const rep = { ...(state.combatReputation ?? defaultCombatReputation()) };
  let money = state.dinheiro;
  const fighters = (state.combatFighters ?? []).map(fighter => {
    let next = fighter;
    if (next.injuryWeeks && next.injuryWeeks > 0) {
      const injuryWeeks = next.injuryWeeks - 1;
      next = { ...next, injuryWeeks, condition: Math.min(100, next.condition + 4), status: injuryWeeks ? `Lesionado por ${injuryWeeks} semanas` : "Liberado pelos médicos" };
    } else if (!next.scheduledFight) {
      next = { ...next, condition: Math.min(100, next.condition + random(2, 5)), status: next.condition < 78 ? "Em recuperação" : "Aguardando oportunidade" };
    }
    if (!next.scheduledFight) return next;
    const cutGain = next.scheduledFight.weeksRemaining <= 2
      ? Math.max(6, Math.round(next.attributes.weightCut / 8))
      : Math.max(2, Math.round(next.attributes.discipline / 22));
    const campGain = Math.max(3, Math.round((next.attributes.discipline + next.attributes.cardio) / 28));
    const scheduledFight = { ...next.scheduledFight, weeksRemaining: next.scheduledFight.weeksRemaining - 1, campProgress: Math.min(100, next.scheduledFight.campProgress + campGain), weightProgress: Math.min(100, next.scheduledFight.weightProgress + cutGain) };
    next = { ...next, scheduledFight, condition: Math.max(45, next.condition - random(1, 4)), status: scheduledFight.weeksRemaining > 0 ? `Camp: ${scheduledFight.weeksRemaining} semana(s)` : next.status };
    if (scheduledFight.weeksRemaining > 0) return next;
    const resolved = resolveFight(state, next);
    finances = [resolved.finance, ...finances];
    news = [resolved.news, ...news].slice(0, 150);
    money += resolved.finance.valor;
    rep[next.sport] = Math.min(100, rep[next.sport] + resolved.reputation);
    events.push(resolved.news.titulo);
    return resolved.fighter;
  });
  const offers = (state.combatOffers ?? []).filter(offer => offer.status === "aberta" && offer.expiresIn > 1).map(offer => ({ ...offer, expiresIn: offer.expiresIn - 1 }));
  return { ...state, combatFighters: fighters, combatOffers: offers, combatReputation: rep, dinheiro: money, financas: finances, noticias: news };
}