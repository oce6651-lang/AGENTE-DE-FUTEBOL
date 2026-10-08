import { COMBAT_ORGANIZATIONS, WEIGHT_KG, organizationsFor } from "./data/combat";
import type { CombatAttributes, CombatMethod, CombatOffer, CombatOrganization, CombatRecord, CombatResult, CombatSport, CombatStrategy, Fighter, FinanceEntry, GameState, NewsItem, ScheduledFight } from "./types";

import { combatRating, circuitFor, developFighter, emptyRecord, migrateFighter, weekIndex } from "./combat/career";
import { simulateCombat } from "./combat/simulation";

const FIRST_NAMES = ["Caio", "Leandro", "Rafael", "Bruno", "Vitor", "André", "Mateus", "Henrique", "Diego", "Murilo", "Igor", "Samuel", "João", "Lucas", "Davi", "Thiago"];
const LAST_NAMES = ["Silva", "Oliveira", "Pereira", "Santos", "Costa", "Almeida", "Souza", "Ferreira", "Barbosa", "Lima", "Moura", "Nunes"];
const CITIES = ["Porto Alegre", "São Paulo", "Curitiba", "Rio de Janeiro", "Belo Horizonte", "Fortaleza", "Manaus", "Salvador"];
const GYMS = ["Academia Nova União", "Chute Boxe", "Team Nogueira", "Evolução Thai", "Capital da Luta", "Arena Combat", "CT Vale Tudo", "Boxe Brasil", "Alliance Jiu-Jitsu", "Gracie Barra", "Checkmat", "CT Muay Thai Brasil"];
const COACHES = ["Marcos Tavares", "Renato Alves", "Carlos Nunes", "Paulo Rocha", "Alexandre Lima", "Roberto Freitas"];

const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: T[]): T => items[random(0, items.length - 1)];
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const dateLabel = (state: GameState) => `${state.mes}/${state.ano} • semana ${state.semana}`;

export function defaultCombatReputation(): Record<CombatSport, number> {
  return { MMA: 0, Boxe: 0, Kickboxing: 0, "Jiu-jítsu": 0, "Muay Thai": 0 };
}

export function combatOrganizations(): CombatOrganization[] {
  return COMBAT_ORGANIZATIONS.map(organization => ({ ...organization, weightClasses: [...organization.weightClasses] }));
}

function attributes(base: number): CombatAttributes {
  const value = () => Math.max(10, Math.min(99, base + random(-12, 12)));
  return { striking: value(), grappling: value(), wrestling: value(), defense: value(), power: value(), speed: value(), cardio: value(), chin: value(), fightIQ: value(), discipline: value(), weightCut: value() };
}

const rating = combatRating;

export function strategiesFor(sport: CombatSport): CombatStrategy[] {
  if (sport === "Jiu-jítsu") return ["Equilibrada", "Buscar finalização", "Controlar por pontos", "Defensiva"];
  if (sport === "Muay Thai") return ["Equilibrada", "Clinch e joelhadas", "Pressão tailandesa", "Defensiva"];
  return sport === "MMA" ? ["Equilibrada", "Trocação", "Quedas e chão", "Defensiva"] : ["Equilibrada", "Trocação", "Defensiva"];
}

export function generateFighter(state: GameState, sport?: CombatSport): Fighter {
  const chosenSport = sport ?? pick<CombatSport>(["MMA", "Boxe", "Kickboxing", "Jiu-jítsu", "Muay Thai"]);
  const age = random(18, 29);
  const weightClass = pick(organizationsFor(chosenSport)[0]?.weightClasses ?? ["Peso-leve"]);
  const base = random(12, 28);
  const attrs = attributes(base);
  const current = rating(attrs, chosenSport);
  const styles = chosenSport === "MMA"
    ? ["Jiu-jítsu", "Wrestling", "Muay Thai", "Completo", "Contra-golpeador"]
    : chosenSport === "Boxe" ? ["Out-boxer", "Pressionador", "Contra-golpeador", "Boxer-puncher"]
      : chosenSport === "Jiu-jítsu" ? ["Guardeiro", "Passador", "Caçador de costas", "Especialista em pernas", "Completo"]
        : chosenSport === "Muay Thai" ? ["Muay Khao", "Muay Mat", "Muay Femur", "Muay Tae", "Muay Sok"]
          : ["Muay Thai", "Karate", "Pressionador", "Contra-golpeador"];
  const wins = 0;
  const losses = random(0, Math.min(4, Math.ceil(wins / 2)));
  const isBjj = chosenSport === "Jiu-jítsu";
  const record: CombatRecord = { wins, losses, draws: 0, noContests: 0, knockouts: isBjj ? 0 : random(0, wins), submissions: chosenSport === "MMA" || isBjj ? random(0, wins) : 0, decisions: 0 };
  record.submissions = Math.min(record.submissions, wins - record.knockouts);
  record.decisions = Math.max(0, wins - record.knockouts - record.submissions);
  const year = state.ano - age;
  return migrateFighter({
    id: uid("fighter"), name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, sport: chosenSport, age,
    birthDate: `${String(random(1, 28)).padStart(2, "0")}/${String(random(1, 12)).padStart(2, "0")}/${year}`,
    nationality: "Brasil", city: pick(CITIES), height: random(weightClass === "Peso-pesado" ? 184 : 164, weightClass === "Peso-pesado" ? 202 : 190),
    reach: random(168, weightClass === "Peso-pesado" ? 211 : 198), weight: WEIGHT_KG[weightClass] ?? 70, weightClass,
    stance: pick(["Destro", "Canhoto", "Ambidestro"]), style: pick(styles), belt: isBjj ? "Faixa-branca" : undefined, gym: pick(GYMS), coach: pick(COACHES),
    attributes: attrs, rating: current, potential: random(Math.max(current + 8, 55), Math.min(96, current + 45)),
    condition: random(78, 100), morale: random(60, 90), popularity: random(2, 18), trust: random(10, 28), scouted: 1,
    represented: false, status: "Disponível", record, fightHistory: [], goals: [pick(["Ser campeão mundial", "Lutar no exterior", "Sustentar a família", "Manter uma longa carreira", "Ser reconhecido no Brasil"])], rivalries: [], timeline: [`Iniciou a formação em ${state.mes}/${state.ano}.`],
  });
}

export function scoutFighter(state: GameState, fighterId: string): { state: GameState; message: string } {
  if (state.energia <= 0 || state.dinheiro < 120) return { state, message: "Faltam energia ou R$ 120 para uma nova observação." };
  if (!(state.combatRadar ?? []).some(f => f.id === fighterId)) return { state, message: "Lutador não encontrado." };
  const update = (fighter: Fighter) => fighter.id === fighterId ? { ...fighter, scouted: fighter.scouted + 1, trust: Math.min(100, fighter.trust + random(2, 6)), scoutReports: [...(fighter.scoutReports ?? []), { weekIndex: weekIndex(state), location: fighter.gym, text: `Observação ${fighter.scouted + 1}: disciplina ${fighter.attributes.discipline >= 50 ? "consistente" : "em desenvolvimento"}, condicionamento ${fighter.attributes.cardio >= 40 ? "adequado" : "a desenvolver"}.` }] } : fighter;
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
  if (!fighter || fighter.scheduledFight || fighter.injuryWeeks || fighter.age >= 40) return { state, message: "Este lutador não está disponível para negociar." };
  if (state.energia <= 0) return { state, message: "Sem energia para contatar os matchmakers." };
  const rep = (state.combatReputation ?? defaultCombatReputation())[fighter.sport];
  const current = migrateFighter(fighter);
  const circuit = circuitFor(current);
  if ((current.career?.transitionWeeks ?? 0) > 0 || current.condition < 75) return { state, message: "Conclua a adaptação e a recuperação antes de competir." };
  if ((state.combatOffers ?? []).some(o => o.fighterId === fighterId)) return { state, message: "Há uma proposta aguardando resposta." };
  const caps = { "Origem informal": 0, "Formação amadora": 0, "MMA amador": 0, "Profissional regional": 4, "Circuito nacional": 6, "Cenário internacional": 8, "Elite mundial": 10 };
  const cap = caps[current.career?.stage ?? "Origem informal"];
  const organizations = organizationsFor(fighter.sport);
  const activeContract = current.contract && current.contract.fightsRemaining > 0 && current.contract.expiresYear >= state.ano ? current.contract : undefined;
  const possible = organizations.filter(o => o.level <= cap && (!activeContract?.exclusive || o.id === activeContract.organizationId));
  const organization = circuit === "profissional" && possible.length ? pick(possible) : undefined;
  const regional = circuit === "profissional" && !organization;
  const purse = circuit === "profissional" ? (organization ? 400 + organization.level * 180 + current.rating * 12 : 350 + current.rating * 8) : 0;
  const event = organization ? `${organization.name} • ${state.ano}` : circuit === "informal" ? `Encontro comunitário • ${current.city}` : regional ? `Circuito regional de ${current.sport} • ${current.city}` : `Encontro amador de ${current.sport} • ${current.city}`;
  const exclusive = Boolean(organization && organization.level >= 7 && ["MMA", "Kickboxing", "Muay Thai"].includes(current.sport) && !["wbc-muaythai", "wmc"].includes(organization.id));
  const offer: CombatOffer = { id: uid("fight-offer"), fighterId, organizationId: organization?.id ?? "", opponent: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, opponentRating: Math.max(10, Math.min(96, current.rating + random(-5, 7))), event, purse: Math.round(purse), winBonus: circuit === "profissional" ? Math.round(purse * .35) : 0, contractFights: activeContract?.fightsRemaining ?? (exclusive ? random(3, 5) : 1), weeksUntilFight: circuit === "profissional" ? random(6, 10) : random(2, 4), titleFight: Boolean(organization && current.rank && current.rank <= 3 && Math.random() < .2), status: "aberta", expiresIn: 3, circuit, fee: circuit === "profissional" ? 150 : circuit === "amador" ? 80 : 0, durationYears: exclusive ? 2 : 1, exclusive };
  return { state: { ...state, energia: state.energia - 1, combatOffers: [offer, ...(state.combatOffers ?? [])] }, message: `${event}: oportunidade disponível.` };
}

export function negotiateFightOffer(state: GameState, offerId: string, purse: number, fights: number, years: number): { state: GameState; message: string } {
  const offer = state.combatOffers?.find(o => o.id === offerId);
  if (!offer || offer.circuit !== "profissional" || (offer.negotiations ?? 0) >= 2) return { state, message: "Negociação indisponível." };
  if (!Number.isFinite(purse) || !Number.isFinite(fights) || !Number.isFinite(years) || purse < offer.purse || purse > offer.purse * 1.25 || fights < 1 || fights > 5 || years < 1 || years > 3 || (!offer.exclusive && fights !== 1)) return { state, message: "Revise a bolsa (até 25% a mais), lutas e duração." };
  const accepted = Math.random() < .55;
  return { state: { ...state, combatOffers: (state.combatOffers ?? []).map(o => o.id === offerId ? { ...o, negotiations: (o.negotiations ?? 0) + 1, ...(accepted ? { purse: Math.round(purse), contractFights: Math.floor(fights), durationYears: Math.floor(years) } : {}) } : o) }, message: accepted ? "Contraproposta aceita." : "Contraproposta recusada; os termos originais foram mantidos." };
}

export function answerFightOffer(state: GameState, offerId: string, accept: boolean): { state: GameState; message: string } {
  const offer = (state.combatOffers ?? []).find(item => item.id === offerId && item.status === "aberta" && item.expiresIn > 0);
  const fighter = (state.combatFighters ?? []).find(item => item.id === offer?.fighterId);
  if (!offer || !fighter) return { state, message: "Proposta indisponível." };
  if (!accept) return { state: { ...state, combatOffers: (state.combatOffers ?? []).filter(item => item.id !== offerId) }, message: "Proposta recusada." };
  const current = migrateFighter(fighter);
  const fee = offer.fee ?? 0;
  const activeContract = current.contract && current.contract.fightsRemaining > 0 && current.contract.expiresYear >= state.ano ? current.contract : undefined;
  if (fighter.scheduledFight || fighter.injuryWeeks || fighter.condition < 75 || (current.career?.transitionWeeks ?? 0) > 0 || state.dinheiro < fee || (activeContract?.exclusive && activeContract.organizationId !== offer.organizationId)) return { state, message: "Confira preparação, liberação contratual e caixa para inscrição/deslocamento." };
  const circuit = offer.circuit ?? "profissional";
  const fight: ScheduledFight = { id: uid("fight"), opponent: offer.opponent, opponentRating: offer.opponentRating, organizationId: offer.organizationId, event: offer.event, weeksRemaining: offer.weeksUntilFight, campWeeks: offer.weeksUntilFight, campProgress: 0, weightProgress: fighter.sport === "Jiu-jítsu" ? 100 : 35, strategy: "Equilibrada", rounds: fighter.sport === "Jiu-jítsu" ? 1 : fighter.sport === "Boxe" ? (circuit === "profissional" ? 6 : 3) : fighter.sport === "Muay Thai" && circuit === "profissional" ? 5 : 3, roundSeconds: fighter.sport === "Jiu-jítsu" ? (circuit === "profissional" ? 600 : 300) : fighter.sport === "MMA" ? (circuit === "profissional" ? 300 : 180) : circuit === "profissional" ? 180 : 120, format: fighter.sport === "Jiu-jítsu" ? (offer.organizationId === "adcc" ? "Sem kimono" : Math.random() < .5 ? "Com kimono" : "Sem kimono") : fighter.sport === "Muay Thai" ? "Muay Thai" : undefined, titleFight: offer.titleFight, purse: offer.purse, winBonus: offer.winBonus, circuit, fee };
  const contract = circuit === "profissional" ? activeContract ?? { organizationId: offer.organizationId, fightsRemaining: offer.contractFights, guaranteedPurse: offer.purse, winBonus: offer.winBonus, agencyCommission: .1, expiresYear: state.ano + (offer.durationYears ?? 1), exclusive: offer.exclusive ?? false } : undefined;
  return { state: { ...state, dinheiro: state.dinheiro - fee, financas: fee ? [{ id: uid("combat-fee"), data: dateLabel(state), descricao: `Inscrição e deslocamento: ${fighter.name}`, valor: -fee, tipo: "despesa" }, ...state.financas] : state.financas, combatOffers: (state.combatOffers ?? []).filter(item => item.fighterId !== fighter.id), combatFighters: (state.combatFighters ?? []).map(item => item.id === fighter.id ? { ...current, organizationId: offer.organizationId || undefined, contract, scheduledFight: fight, status: `Camp para ${offer.event}`, timeline: [...item.timeline, `Luta marcada contra ${offer.opponent} no ${offer.event}.`] } : item) }, message: `Luta confirmada: ${fighter.name} x ${offer.opponent}.` };
}

export function setFightStrategy(state: GameState, fighterId: string, strategy: ScheduledFight["strategy"]): GameState {
  return { ...state, combatFighters: (state.combatFighters ?? []).map(fighter => fighter.id === fighterId && fighter.scheduledFight ? { ...fighter, scheduledFight: { ...fighter.scheduledFight, strategy } } : fighter) };
}

function resolveFight(state: GameState, fighter: Fighter): { fighter: Fighter; finance: FinanceEntry; news: NewsItem; reputation: number } {
  const fight = fighter.scheduledFight;
  if (!fight) throw new Error("Luta agendada ausente.");
  const organization = COMBAT_ORGANIZATIONS.find(item => item.id === fight.organizationId);
  const simulated = simulateCombat(fighter, fight);
  const { result, method, round } = simulated;
  const circuit = fight.circuit ?? "profissional";
  const purse = fight.purse + (result === "V" ? fight.winBonus : 0);
  const commission = Math.round(purse * (fighter.contract?.agencyCommission ?? 0.1));
  const record = { ...fighter.record };
  if (result === "V") record.wins += 1;
  if (result === "D") record.losses += 1;
  if (result === "E") record.draws += 1;
  if (result === "NC") record.noContests += 1;
  if (result === "V" && (method === "Nocaute" || method === "Nocaute técnico")) record.knockouts += 1;
  if (result === "V" && method === "Finalização") record.submissions += 1;
  if (result === "V" && (method.includes("Decisão") || method === "Pontos" || method === "Vantagens")) record.decisions += 1;
  const history = { id: fight.id, year: state.ano, month: state.mes, week: state.semana, opponent: fight.opponent, event: fight.event, organization: organization?.name ?? fight.event, result, method, round, time: simulated.time, purse, titleFight: fight.titleFight, weightClass: fighter.weightClass, format: fight.format, score: simulated.score, sport: fighter.sport, circuit, actions: simulated.actions, report: simulated.report };
  const injuryWeeks = Math.random() < 0.18 ? random(2, 9) : 0;
  const contractNext = fighter.contract ? { ...fighter.contract, fightsRemaining: Math.max(0, fighter.contract.fightsRemaining - 1) } : undefined;
  const contract = contractNext && contractNext.fightsRemaining > 0 ? contractNext : undefined;
  const career = migrateFighter(fighter).career;
  const recordKey = circuit === "informal" ? "informalRecord" : circuit === "amador" ? "amateurRecord" : "professionalRecord";
  const circuitRecord = { ...(career?.[recordKey] ?? emptyRecord()) };
  for (const key of Object.keys(record) as (keyof CombatRecord)[]) circuitRecord[key] += record[key] - fighter.record[key];
  const champion = circuit === "profissional" && fight.titleFight ? result === "V" : fighter.champion;
  const title = fight.titleFight && result === "V" ? `${fight.event} • ${fighter.weightClass} • ${state.ano}` : undefined;
  const updated: Fighter = { ...fighter, record, fightHistory: [history, ...fighter.fightHistory], scheduledFight: undefined, contract, condition: Math.max(25, fighter.condition - random(15, 35)), morale: Math.max(20, Math.min(100, fighter.morale + (result === "V" ? 12 : -10))), popularity: Math.min(100, fighter.popularity + (result === "V" ? (fight.titleFight ? 10 : 2) : 1)), rating: combatRating(fighter.attributes, fighter.sport), champion, rank: circuit === "profissional" && organization ? result === "V" ? Math.max(1, (fighter.rank ?? 25) - random(1, 3)) : Math.min(30, (fighter.rank ?? 25) + random(1, 3)) : undefined, injuryWeeks, status: injuryWeeks ? `Lesionado por ${injuryWeeks} semanas` : "Em recuperação", career: career ? { ...career, [recordKey]: circuitRecord, experience: career.experience + (result === "V" ? 5 : 3), lastFightWeek: weekIndex(state), titles: title ? [...career.titles, title] : career.titles } : undefined, timeline: [...fighter.timeline, `${result} contra ${fight.opponent} por ${method} no ${fight.event}.`, ...(fighter.contract && !contract ? ["Acordo concluído: disponível para nova negociação."] : [])] };
  const finance: FinanceEntry = { id: uid("combat-income"), data: dateLabel(state), descricao: `Comissão da bolsa de ${fighter.name}`, valor: commission, tipo: "receita" };
  const news: NewsItem = { id: uid("combat-news"), semana: state.semana, mes: state.mes, ano: state.ano, titulo: `${fighter.name} ${result === "V" ? "vence" : result === "D" ? "é derrotado" : result === "E" ? "empata" : "tem luta anulada"} no ${fight.event}`, texto: `${method}, round ${round}. Cartel: ${record.wins}-${record.losses}-${record.draws}-${record.noContests} NC.`, tipo: "mundo" };
  return { fighter: updated, finance, news, reputation: result === "V" ? (circuit === "profissional" ? fight.titleFight ? 2 : .5 : .1) : 0 };
}

export function processCombatWeek(state: GameState, events: string[]): GameState {
  let finances = state.financas;
  let news = state.noticias;
  const rep = { ...(state.combatReputation ?? defaultCombatReputation()) };
  let money = state.dinheiro;
  const fighters = (state.combatFighters ?? []).map(fighter => {
    let next = developFighter(fighter, state, rep[fighter.sport]);
    if (next.contract && (next.contract.expiresYear < state.ano || next.contract.fightsRemaining <= 0)) next = { ...next, contract: undefined, timeline: [...next.timeline, "Contrato encerrado: livre para negociar."] };
    if (next.injuryWeeks && next.injuryWeeks > 0) {
      const injuryWeeks = next.injuryWeeks - 1;
      next = { ...next, injuryWeeks, condition: Math.min(100, next.condition + 4), status: injuryWeeks ? `Lesionado por ${injuryWeeks} semanas` : "Liberado pelos médicos" };
    } else if (!next.scheduledFight) {
      next = { ...next, condition: Math.min(100, next.condition + random(2, 5)), status: next.condition < 78 ? "Em recuperação" : "Aguardando oportunidade" };
    }
    const sponsorship = next.career?.sponsorship;
    if (next.career && sponsorship && sponsorship.weeksRemaining > 0 && sponsorship.lastPaymentWeek !== weekIndex(state)) {
      const payout = state.semana === 1 ? Math.round(sponsorship.monthlyValue * (next.contract?.agencyCommission ?? .1)) : 0;
      money += payout;
      if (payout) finances = [{ id: `sponsor-${next.id}-${weekIndex(state)}`, data: dateLabel(state), descricao: `Comissão do patrocínio de ${next.name}`, valor: payout, tipo: "receita" }, ...finances];
      next = { ...next, career: { ...next.career, sponsorship: { ...sponsorship, weeksRemaining: sponsorship.weeksRemaining - 1, lastPaymentWeek: weekIndex(state) } } };
    }
    if (!next.scheduledFight) return next;
    if (next.fightHistory.some(h => h.id === next.scheduledFight?.id)) return { ...next, scheduledFight: undefined };
    if (next.injuryWeeks) return { ...next, scheduledFight: { ...next.scheduledFight, weeksRemaining: next.scheduledFight.weeksRemaining + 1 }, status: "Luta adiada por lesão" };
    const cutGain = next.sport === "Jiu-jítsu" ? 100 : next.scheduledFight.weeksRemaining <= 2
      ? Math.max(15, Math.round(next.attributes.weightCut / 5))
      : Math.max(8, Math.round(next.attributes.discipline / 12));
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
export function seekCombatSponsor(state: GameState, fighterId: string): { state: GameState; message: string } {
  const fighter = state.combatFighters?.find(f => f.id === fighterId);
  const career = fighter ? migrateFighter(fighter).career : undefined;
  if (!fighter || !career || fighter.popularity < 25 || career.professionalRecord.wins < 6 || (career.sponsorship?.weeksRemaining ?? 0) > 0 || state.energia < 1) return { state, message: "Patrocínio exige exposição 25, seis vitórias profissionais e energia." };
  const accepted = Math.random() < .35;
  return { state: { ...state, energia: state.energia - 1, combatFighters: (state.combatFighters ?? []).map(f => f.id === fighterId && accepted ? { ...f, career: { ...career, sponsorship: { name: "Comércio local", monthlyValue: Math.round(fighter.popularity * 3), weeksRemaining: 48 } }, timeline: [...f.timeline, "Firmou patrocínio anual com comércio local."] } : f) }, message: accepted ? "Patrocínio anual firmado." : "Não houve interesse comercial nesta tentativa." };
}
