import { gerarClubes, gerarRivais, gerarJogador, pick, rid, rnd, calcularValorMercado, calcularSalario, sortearSonhos } from "./generators";
import { calcularOverall, evoluirAtributos } from "./attributes";
import { categoriaDoAtleta, categoriaPorIdade, registrarPassagem } from "./season";
import { montarProposta } from "./offers";
import { mundoSemanal, viradaDeAno } from "./world";
import { ganharReputacao, REP_XP } from "./reputation";
import { gerarPeneirasAbertas, avaliarPeneira as avaliarPeneiraCompleta } from "./tryouts";
import { semanaEsportiva, encerrarTemporada } from "./season";
import { clubesDaRegiao } from "./data/clubs";
import type { ScoutLocation } from "./locations";
import { localLiberado } from "./locations";
import type {
  Agent, GameState, NewsItem, Player, FinanceEntry, Negotiation, Tryout, TimelineEvent, Club,
  MatchPlayer, Fixture, ScoutNote, AgeCategory,
} from "./types";
import { MESES } from "./types";

// ============================================================
// CONSTANTES ECONÔMICAS — dinheiro é escasso de propósito
// ============================================================
export const CUSTOS = {
  observacao: 90,     // observação técnica dedicada
  conversa: 120,      // aproximação com atleta/família
  proposta: 450,      // documentação, advogado, reunião
  fixoMensal: 900,    // aluguel, telefone, combustível
  porAtleta: 180,     // acompanhamento mensal de cada cliente
};

// ============================================================
// MELHORIAS DA AGÊNCIA — investimentos de longo prazo
// ============================================================
export interface Upgrade {
  id: string;
  nome: string;
  descricao: string;
  custo: number;
  reputacaoMin: number;
}

export const UPGRADES: Upgrade[] = [
  { id: "carro", nome: "Carro próprio", descricao: "Reduz em 30% o custo de todos os deslocamentos.", custo: 6_000, reputacaoMin: 0 },
  { id: "assistente", nome: "Assistente de scout", descricao: "+1 ponto de energia por semana.", custo: 14_000, reputacaoMin: 15 },
  { id: "analista", nome: "Analista de vídeo", descricao: "Observações 40% mais baratas e estimativas de potencial mais precisas.", custo: 22_000, reputacaoMin: 25 },
  { id: "sede", nome: "Sede da agência", descricao: "Clubes confiam mais em você e sua reputação para de oscilar tanto.", custo: 45_000, reputacaoMin: 40 },
  { id: "juridico", nome: "Departamento jurídico", descricao: "+3% de comissão em todas as transferências.", custo: 80_000, reputacaoMin: 55 },
  { id: "filial", nome: "Filial internacional", descricao: "+1 energia e acesso facilitado a clubes da elite europeia.", custo: 180_000, reputacaoMin: 75 },
];

export function temUpgrade(state: GameState, id: string) {
  return state.upgrades.includes(id);
}

export function comprarUpgrade(state: GameState, id: string): { state: GameState; mensagem: string } {
  const up = UPGRADES.find(u => u.id === id);
  if (!up) return { state, mensagem: "Melhoria inválida." };
  if (temUpgrade(state, id)) return { state, mensagem: "Você já possui essa estrutura." };
  if (state.reputacao < up.reputacaoMin) return { state, mensagem: `Exige ${up.reputacaoMin} de reputação.` };
  if (state.dinheiro < up.custo) return { state, mensagem: `Sem caixa. Custo: R$ ${up.custo.toLocaleString("pt-BR")}.` };
  let s = gastar(state, up.custo, `Investimento: ${up.nome}`);
  s = ganharReputacao({ ...s, upgrades: [...s.upgrades, id] }, REP_XP.estrutura);
  s = { ...s, energiaMax: energiaMaxima(s) };
  return { state: s, mensagem: `${up.nome} em operação!` };
}

export function energiaMaxima(state: GameState) {
  return 3 + Math.floor(state.reputacao / 30)
    + (state.upgrades.includes("assistente") ? 1 : 0)
    + (state.upgrades.includes("filial") ? 1 : 0);
}

/** Custo real de deslocamento até um palco, considerando estrutura da agência. */
export function custoViagem(state: GameState, loc: ScoutLocation) {
  const desconto = state.upgrades.includes("carro") ? 0.7 : 1;
  return Math.round(loc.custoViagem * desconto);
}

export function custoObservacao(state: GameState) {
  return Math.round(CUSTOS.observacao * (state.upgrades.includes("analista") ? 0.6 : 1));
}

export function novoJogo(agent: Omit<Agent, "id">): GameState {
  const agentWithId: Agent = { ...agent, id: rid("EMP", 1) };
  const base: GameState = {
    agent: agentWithId,
    ano: 2026,
    mes: 3,
    semana: 1,
    dinheiro: 6000,
    prestigio: 1,
    reputacao: 0,
    repXP: 0,
    energia: 3,
    energiaMax: 3,
    jogadores: [],
    radar: [],
    historicoAgencia: [],
    clubes: gerarClubes(),
    rivais: gerarRivais(),
    negociacoes: [],
    peneiras: [],
    peneirasAbertas: [],
    titulosMundo: [],
    historicoCompeticoes: [],
    upgrades: [],
    locaisVisitados: [],
    noticias: [
      {
        id: rid("NEW", 1),
        semana: 1, mes: 3, ano: 2026,
        titulo: `${agentWithId.agencia} foi fundada em ${agentWithId.cidade}`,
        texto: `${agentWithId.nome} ${agentWithId.sobrenome} começa do zero com R$ 6.000 no caixa e dois contatos dispostos a assinar. Vá aos campos, assista partidas e construa uma reputação.`,
        tipo: "info",
      },
    ],
    financas: [],
    seed: Math.floor(Math.random() * 1e9),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
  return { ...base, radar: contatosIniciais(base) };
}

/** Dois atletas de contato inicial, 100% dispostos a assinar com a agência. */
function contatosIniciais(s: GameState): Player[] {
  const comum = gerarJogador({
    cidade: s.agent.cidade, local: "Contato pessoal", nextId: 1,
    ano: s.ano, mes: s.mes, semana: s.semana,
    estado: s.agent.estado, pais: s.agent.pais,
    forcarIdade: rnd(9, 23), forcarAtual: [10, 30], forcarPotencial: [80, 100],
  });
  const gustavo = gerarJogador({
    cidade: s.agent.cidade, local: "Indicação de família", nextId: 2,
    ano: s.ano, mes: s.mes, semana: s.semana,
    estado: s.agent.estado, pais: s.agent.pais,
    forcarIdade: 16, forcarAtual: [5, 38], forcarPotencial: [90, 100],
  });
  const gremio = clubesDaRegiao("RS").find(c => c.nome === "Grêmio FBPA")?.nome ?? "Grêmio FBPA";
  const prep = (p: Player, extra: Partial<Player>): Player => ({
    ...p,
    empresario: null,
    clube: null,
    confianca: 100,
    status: "Quer assinar com você",
    familiaConfia: true,
    valorMercado: calcularValorMercado(p.atual, p.potencial, p.idade, false),
    observado: 1,
    ...extra,
  });
  return [
    prep(gustavo, {
      nome: "Gustavo Oliveira",
      nascimento: "15/09/2009",
      idade: s.ano - 2009 - (s.mes < 9 ? 1 : 0),
      pe: "Canhoto",
      personalidade: "Humilde",
      tracos: ["Humilde", "Generoso", "Esforçado", "Talentoso", "Tímido"],
      clubeCoracao: gremio,
      sonhos: sortearSonhos(gremio, 95),
    }),
    prep(comum, {}),
  ];
}

let ID_COUNTER = 1000;
export function nextEntityId() { ID_COUNTER += 1; return ID_COUNTER; }
function nextNewsId() { return rid("NEW", nextEntityId()); }
function nextFinId() { return rid("FIN", nextEntityId()); }
function nextNegId() { return rid("NEG", nextEntityId()); }
function nextTryoutId() { return rid("TRY", nextEntityId()); }

export function dataLabel(s: GameState) {
  return `${MESES[s.mes - 1]} ${s.ano} • Semana ${s.semana}`;
}

function gastar(state: GameState, valor: number, descricao: string): GameState {
  const fin: FinanceEntry = {
    id: nextFinId(), data: dataLabel(state), descricao, valor: -valor, tipo: "despesa",
  };
  return { ...state, dinheiro: state.dinheiro - valor, financas: [fin, ...state.financas] };
}

function consumirEnergia(state: GameState, qtd = 1): GameState {
  return { ...state, energia: Math.max(0, state.energia - qtd) };
}

// ============================================================
// SCOUTING — assistir partidas
// ============================================================

export function podeAssistir(state: GameState, loc: ScoutLocation): { ok: boolean; motivo?: string } {
  if (!localLiberado(loc, state.reputacao, state.prestigio))
    return { ok: false, motivo: `Você ainda não tem acesso a ${loc.nome}.` };
  if (state.energia <= 0) return { ok: false, motivo: "Você está exausto. Avance a semana." };
  const total = custoViagem(state, loc) + loc.custoIngresso;
  if (state.dinheiro < total)
    return { ok: false, motivo: `Sem caixa para ir até ${loc.nome} (R$ ${total.toLocaleString("pt-BR")}).` };
  return { ok: true };
}

export function pagarPartida(state: GameState, fx: Fixture, loc: ScoutLocation): GameState {
  const custo = custoViagem(state, loc) + fx.custoIngresso;
  let s = consumirEnergia(gastar(state, custo, `Viagem e ingresso: ${fx.categoria} em ${fx.local}`));
  // Frequentar palcos maiores dá visibilidade no meio.
  const ganho = loc.nivel >= 6 && Math.random() < 0.45 ? 1 : 0;
  if (ganho) s = ganharReputacao(s, REP_XP.palcoDeElite);
  if (!s.locaisVisitados.includes(loc.id)) s = { ...s, locaisVisitados: [...s.locaisVisitados, loc.id] };
  return s;
}

/** Registra atletas observados na partida dentro do radar da agência. */
export function adicionarAoRadar(state: GameState, destaques: MatchPlayer[], fx: Fixture): { state: GameState; adicionados: Player[] } {
  const existentes = new Set(state.radar.map(p => p.id));
  const adicionados: Player[] = [];
  for (const d of destaques) {
    if (existentes.has(d.player.id)) continue;
    const nota: ScoutNote = {
      ano: state.ano, mes: state.mes, semana: state.semana,
      partida: `${fx.casa.nome} x ${fx.fora.nome} (${fx.categoria})`,
      nota: d.nota,
      texto: `Nota ${d.nota.toFixed(1)} atuando como ${d.player.posicao}${d.gols ? `, ${d.gols} gol(s)` : ""}.`,
    };
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana, tipo: "observacao",
      texto: `Chamou atenção em ${fx.casa.nome} x ${fx.fora.nome}.`,
    };
    adicionados.push({
      ...d.player,
      observado: 1,
      relatorios: [nota],
      timeline: [...d.player.timeline, evt],
    });
  }
  if (!adicionados.length) return { state, adicionados };
  return { state: { ...state, radar: [...adicionados, ...state.radar].slice(0, 80) }, adicionados };
}

/** Observação técnica dedicada: revela gradualmente atributos e potencial. */
export function observarJogador(state: GameState, playerId: string): { state: GameState; mensagem: string } {
  if (state.energia <= 0) return { state, mensagem: "Sem energia nesta semana." };
  const custoObs = custoObservacao(state);
  if (state.dinheiro < custoObs) return { state, mensagem: `Sem caixa (R$ ${custoObs}).` };
  const player = state.radar.find(p => p.id === playerId) ?? state.jogadores.find(p => p.id === playerId);
  if (!player) return { state, mensagem: "Atleta não encontrado." };

  const nota: ScoutNote = {
    ano: state.ano, mes: state.mes, semana: state.semana,
    partida: "Observação individual",
    nota: Math.max(3, Math.min(10, 5.5 + (player.atual - 45) / 18 + (Math.random() - 0.5) * 2)),
    texto: pick([
      "Boa leitura de jogo, precisa de mais intensidade.",
      "Fisicamente atrasado para a idade, mas tecnicamente limpo.",
      "Some em jogos duros. Cabeça ainda imatura.",
      "Decide bem sob pressão. Perfil profissional.",
      "Muita vontade, pouca noção tática.",
    ]),
  };

  let s = consumirEnergia(gastar(state, custoObs, `Observação técnica de ${player.nome}`));
  const upd = (p: Player): Player => p.id !== playerId ? p : {
    ...p,
    observado: p.observado + 1,
    confianca: Math.min(100, p.confianca + rnd(1, 4)),
    relatorios: [nota, ...p.relatorios].slice(0, 12),
  };
  s = { ...s, radar: s.radar.map(upd), jogadores: s.jogadores.map(upd) };
  return { state: s, mensagem: `Relatório atualizado: ${player.nome}.` };
}

/** Estimativa de potencial mostrada ao jogador (nunca exata). */
export function potencialEstimado(p: Player, precisao = 0): { min: number; max: number } {
  const erro = Math.max(2, 22 - p.observado * 4 - precisao);
  const centro = p.potencial + ((p.visual % 7) - 3);
  return { min: Math.max(20, Math.round(centro - erro)), max: Math.min(99, Math.round(centro + erro)) };
}

// ============================================================
// NEGOCIAÇÃO COM ATLETAS — difícil por padrão
// ============================================================

/**
 * Atletas do futebol amador (várzea, quadra, escola, campo municipal) não têm
 * contrato nem empresário estruturado — assinar com eles é muito mais simples.
 */
export function bonusOrigemAmadora(player: Player): number {
  const origem = (player.local ?? "").toLowerCase();
  const amador = ["várzea", "varzea", "quadra", "escola", "campo municipal", "pelada"]
    .some(t => origem.includes(t));
  if (!amador) return 0;
  return player.clube ? 12 : 30;
}

export function conversar(state: GameState, player: Player): { state: GameState; sucesso: boolean; mensagem: string } {
  if (state.energia <= 0) return { state, sucesso: false, mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTOS.conversa) return { state, sucesso: false, mensagem: `Sem caixa (R$ ${CUSTOS.conversa}).` };
  let s = consumirEnergia(gastar(state, CUSTOS.conversa, `Aproximação com ${player.nome}`));

  const chance = 6 + s.reputacao * 0.35 + s.prestigio * 4 + player.confianca * 0.25
    + (player.personalidade === "Humilde" ? 10 : 0)
    - (player.personalidade === "Ganancioso" ? 14 : 0)
    - (player.idade < 16 && !player.familiaConfia ? 12 : 0)
    + (player.familiaConfia ? 45 : 0)
    + bonusOrigemAmadora(player);
  const sucesso = rnd(1, 100) <= Math.max(4, Math.min(88, chance));

  const ganho = sucesso ? rnd(6, 14) : rnd(0, 3);
  const upd = (p: Player) => p.id === player.id ? { ...p, confianca: Math.min(100, p.confianca + ganho) } : p;
  s = { ...s, radar: s.radar.map(upd), jogadores: s.jogadores.map(upd) };

  return {
    state: s,
    sucesso,
    mensagem: sucesso
      ? `${player.nome} aceitou conversar. Confiança +${ganho}.`
      : player.idade < 18
        ? `A família de ${player.nome} não quis marcar reunião.`
        : `${player.nome} evitou o assunto e foi embora.`,
  };
}

export function propor(state: GameState, player: Player): { state: GameState; sucesso: boolean; mensagem: string } {
  if (state.energia <= 0) return { state, sucesso: false, mensagem: "Sem energia nesta semana." };
  if (state.dinheiro < CUSTOS.proposta) return { state, sucesso: false, mensagem: `Sem caixa (R$ ${CUSTOS.proposta}).` };
  let s = consumirEnergia(gastar(state, CUSTOS.proposta, `Proposta de representação: ${player.nome}`));

  let chance = 2 + s.reputacao * 0.3 + s.prestigio * 6 + player.confianca * 0.45 + player.observado * 2;
  if (player.idade < 18 && !player.familiaConfia) chance -= 22;
  if (player.familiaConfia) chance += 55;
  chance += bonusOrigemAmadora(player);
  if (player.personalidade === "Ambicioso" && s.prestigio >= 3) chance += 10;
  if (player.personalidade === "Ganancioso") chance -= 15;
  chance = Math.max(2, Math.min(player.familiaConfia ? 97 : 82, chance));
  const sucesso = rnd(1, 100) <= chance;

  if (!sucesso) {
    const upd = (p: Player) => p.id === player.id ? { ...p, confianca: Math.max(0, p.confianca - rnd(2, 8)) } : p;
    s = { ...s, radar: s.radar.map(upd) };
    return {
      state: s,
      sucesso: false,
      mensagem: player.idade < 18
        ? `Os pais de ${player.nome} recusaram: "não conhecemos sua agência".`
        : `${player.nome} recusou o contrato. Vai esperar algo melhor.`,
    };
  }

  const evt: TimelineEvent = {
    ano: s.ano, mes: s.mes, semana: s.semana, tipo: "assinatura",
    texto: `Assinou contrato de representação com ${s.agent.agencia}.`,
  };
  const contratado: Player = {
    ...player,
    empresario: s.agent.id,
    confianca: Math.min(100, player.confianca + 15),
    historico: [...player.historico, `Assinou com ${s.agent.agencia}.`],
    timeline: [...player.timeline, evt],
  };
  const noticia: NewsItem = {
    id: nextNewsId(), semana: s.semana, mes: s.mes, ano: s.ano,
    titulo: `${s.agent.agencia} fecha com ${player.nome}`,
    texto: `${player.nome} (${player.idade} anos, ${player.posicao}) passa a ser representado pela agência.`,
    tipo: "descoberta",
  };

  return {
    state: {
      ...ganharReputacao(s, REP_XP.assinatura),
      radar: s.radar.filter(p => p.id !== player.id),
      jogadores: [contratado, ...s.jogadores],
      noticias: [noticia, ...s.noticias],
    },
    sucesso: true,
    mensagem: `${player.nome} assinou com sua agência!`,
  };
}

// ============================================================
// PENEIRAS
// ============================================================

const CATEGORIA_EXIGENCIA: Record<Club["categoria"], number> = {
  Amador: 40, "Serie D": 50, "Serie C": 59, "Serie B": 68, "Serie A": 77, Elite: 86,
};

export function custoPeneira(clube: Club): number {
  const map: Record<Club["categoria"], number> = {
    Amador: 200, "Serie D": 320, "Serie C": 480, "Serie B": 720, "Serie A": 1100, Elite: 1800,
  };
  return map[clube.categoria];
}

/** Clubes recusam inscrições quando não confiam no empresário ou não precisam da posição. */
export function aceitaInscricao(state: GameState, clube: Club, player: Player): { ok: boolean; motivo?: string } {
  const exigeConfianca = { Amador: 0, "Serie D": 8, "Serie C": 18, "Serie B": 32, "Serie A": 50, Elite: 70 }[clube.categoria];
  const bonusEstrutura = (state.upgrades.includes("sede") ? 10 : 0)
    + (state.upgrades.includes("filial") && clube.categoria === "Elite" ? 25 : 0);
  if (clube.confiancaEmVoce + state.reputacao * 0.4 + bonusEstrutura < exigeConfianca)
    return { ok: false, motivo: `${clube.nome} não responde às suas mensagens. Ganhe reputação primeiro.` };
  if (clube.personalidade === "Formador" && player.idade > 20)
    return { ok: false, motivo: `${clube.nome} só avalia atletas de base.` };
  if (clube.personalidade === "Imediatista" && player.idade < 18)
    return { ok: false, motivo: `${clube.nome} busca jogadores prontos, não promessas.` };
  return { ok: true };
}

export function enviarPeneira(state: GameState, playerId: string, clubId: string): { state: GameState; mensagem: string } {
  const player = state.jogadores.find(p => p.id === playerId);
  const clube = state.clubes.find(c => c.id === clubId);
  if (!player || !clube) return { state, mensagem: "Dados inválidos." };
  if (player.clube) return { state, mensagem: `${player.nome} já está em um clube.` };
  if (state.peneiras.some(t => t.playerId === playerId && (t.status === "em_andamento" || t.status === "mais_tempo")))
    return { state, mensagem: `${player.nome} já está em avaliação.` };

  const aceite = aceitaInscricao(state, clube, player);
  if (!aceite.ok) return { state, mensagem: aceite.motivo! };

  const custo = custoPeneira(clube);
  if (state.dinheiro < custo) return { state, mensagem: `Sem caixa. Custo: R$ ${custo}.` };

  const duracao = clube.categoria === "Serie A" || clube.categoria === "Elite" ? 3 : 2;
  const peneira: Tryout = {
    id: nextTryoutId(), playerId, clubId,
    enviadaAno: state.ano, enviadaMes: state.mes, enviadaSemana: state.semana,
    duracaoSemanas: duracao, restanteSemanas: duracao,
    status: "em_andamento",
    notas: [`Inscrito no teste do ${clube.nome} (${clube.categoria}), sob comando de ${clube.tecnico}.`],
  };
  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana, tipo: "peneira",
    texto: `Iniciou peneira no ${clube.nome}.`,
  };
  const s = gastar(state, custo, `Peneira: ${player.nome} → ${clube.nome}`);
  return {
    state: {
      ...s,
      peneiras: [peneira, ...s.peneiras],
      jogadores: s.jogadores.map(p => p.id === playerId
        ? { ...p, timeline: [...p.timeline, evt], status: `Em teste (${clube.nome})` } : p),
    },
    mensagem: `${player.nome} inscrito na peneira do ${clube.nome}.`,
  };
}

// ============================================================
// TEMPO
// ============================================================

export function avancarSemana(state: GameState): { state: GameState; eventos: string[] } {
  const eventos: string[] = [];
  let s: GameState = { ...state };

  s.semana += 1;
  if (s.semana > 4) {
    s.semana = 1;
    s.mes += 1;
    if (s.mes > 12) { s.mes = 1; s.ano += 1; s = viradaDeAno(s); }
    const desp = CUSTOS.fixoMensal + s.jogadores.length * CUSTOS.porAtleta;
    s = gastar(s, desp, "Custos operacionais da agência");
    eventos.push(`Custos mensais: R$ ${desp.toLocaleString("pt-BR")}`);
  }

  // energia da semana
  s = { ...s, energiaMax: energiaMaxima(s) };
  s = { ...s, energia: s.energiaMax };

  // evolução dos representados: a ficha completa evolui e o Overall é recalculado
  s.jogadores = s.jogadores.map(p => {
    if (p.status === "Aposentado") return p;
    let q = p;
    if (p.atual < p.potencial) {
      const emClube = !!p.clube;
      const jovem = p.idade < 21;
      const chance = (jovem ? 0.14 : 0.05) * (emClube ? 1.4 : 0.5);
      if (Math.random() < chance) {
        const atributos = evoluirAtributos(p.atributos, 1, p.posicao);
        const atual = Math.min(p.potencial, Math.max(p.atual + 1, calcularOverall(atributos, p.posicao)));
        q = {
          ...p, atributos, atual,
          valorMercado: calcularValorMercado(atual, p.potencial, p.idade, !!p.clube),
        };
      }
    }
    return promoverCategoria(s, q, eventos);
  });

  // peneiras
  for (const t of s.peneiras.filter(x => x.status === "em_andamento" || x.status === "mais_tempo")) {
    const restante = Math.max(0, t.restanteSemanas - 1);
    if (restante === 0) {
      const r = avaliarPeneiraCompleta(s, t);
      s = r.state;
      if (r.noticia) s = { ...s, noticias: [r.noticia, ...s.noticias] };
      if (r.resumo) eventos.push(r.resumo);
    } else {
      s = { ...s, peneiras: s.peneiras.map(x => x.id === t.id ? { ...x, restanteSemanas: restante } : x) };
    }
  }

  // propostas expiram
  s = {
    ...s,
    negociacoes: s.negociacoes.map(n => n.status !== "aberta" ? n
      : n.expiraEm <= 1 ? { ...n, status: "expirada" as const } : { ...n, expiraEm: n.expiraEm - 1 }),
  };

  // recuperação de lesões
  s = {
    ...s,
    jogadores: s.jogadores.map(p => {
      if (!p.lesaoSemanas) return p;
      const restante = p.lesaoSemanas - 1;
      return restante <= 0
        ? { ...p, lesaoSemanas: 0, status: p.clube ? `No ${p.clube}` : "Sem clube" }
        : { ...p, lesaoSemanas: restante };
    }),
  };

  // clubes divulgam peneiras gratuitas (a reputação nunca diminui)
  const abertas = gerarPeneirasAbertas(s);
  s = abertas.state;

  // clubes sondam seus atletas conforme personalidade e necessidade
  s = sondagensDeClubes(s, eventos);

  // rodadas das competições disputadas pelos seus atletas
  const esportiva = semanaEsportiva(s);
  s = esportiva.state;
  eventos.push(...esportiva.manchetes);

  // fim de temporada: campeões, colocações e histórico das competições
  if (s.mes === 12 && s.semana === 4) {
    const fim = encerrarTemporada(s);
    s = fim.state;
    if (fim.noticias.length) {
      s = { ...s, noticias: [...fim.noticias, ...s.noticias].slice(0, 150) };
      eventos.push(fim.noticias[0].titulo);
    }
  }

  // mundo vivo
  const mundo = mundoSemanal(s);
  s = mundo.state;
  eventos.push(...mundo.manchetes);

  return { state: s, eventos };
}

function sondagensDeClubes(state: GameState, eventos: string[]): GameState {
  return sondagem(state, eventos);
}

/**
 * Atletas muito acima da média da idade podem ser promovidos de categoria —
 * do Sub-17 direto para o profissional, por exemplo. Acontece raramente.
 */
function promoverCategoria(s: GameState, p: Player, eventos: string[]): Player {
  if (!p.clube || p.status === "Aposentado") return p;
  const natural = categoriaPorIdade(p.idade);
  const atualCat = categoriaDoAtleta(p);
  const escada: AgeCategory[] = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre"];
  const idx = escada.indexOf(atualCat);
  if (idx < 0 || idx >= escada.length - 1) return p;
  // precisa estar muito acima do nível esperado da própria categoria
  const exigencia = [14, 22, 32, 42, 54, 70][idx];
  if (p.atual < exigencia + 14) return p;
  if (Math.random() > 0.05) return p;
  const nova = escada[idx + 1];
  eventos.push(`${p.nome} foi promovido ao ${nova === "Livre" ? "time profissional" : nova}.`);
  return {
    ...p,
    categoriaForcada: nova === natural ? undefined : nova,
    confianca: Math.min(100, p.confianca + 6),
    timeline: [...p.timeline, {
      ano: s.ano, mes: s.mes, semana: s.semana, tipo: "nota" as const,
      texto: `Promovido para ${nova === "Livre" ? "o elenco profissional" : nova} do ${p.clube}.`,
    }],
  };
}

function sondagem(state: GameState, eventos: string[]): GameState {
  let s = state;
  const elegiveis = s.jogadores.filter(j => j.empresario === s.agent.id && j.status !== "Aposentado");
  if (!elegiveis.length) return s;
  const jogador = pick(elegiveis);
  const clube = pick(s.clubes);
  if (clube.nome === jogador.clube) return s;

  let interesse = (jogador.atual - 40) + clube.confiancaEmVoce * 0.3 + s.reputacao * 0.2;
  if (clube.necessidades.includes(jogador.posicao)) interesse += 20;
  if (clube.personalidade === "Formador" && jogador.idade <= 19) interesse += 15;
  if (clube.personalidade === "Imediatista" && jogador.idade < 20) interesse -= 25;
  if (clube.personalidade === "Vitrine" && jogador.idade <= 22) interesse += 12;
  if (clube.personalidade === "Pechincha") interesse -= 8;
  if (!jogador.clube) interesse -= 15;

  if (rnd(0, 100) > interesse) return s;

  const neg: Negotiation = { ...montarProposta(s, clube, jogador), id: nextNegId() };
  const not: NewsItem = {
    id: nextNewsId(), semana: s.semana, mes: s.mes, ano: s.ano,
    titulo: `${clube.nome} sonda ${jogador.nome}`,
    texto: `Proposta de R$ ${neg.valorProposta.toLocaleString("pt-BR")} chegou à sua mesa. ${clube.tecnico} pediu um ${jogador.posicao}.`,
    tipo: "mercado",
  };
  eventos.push(not.titulo);
  return { ...s, negociacoes: [neg, ...s.negociacoes], noticias: [not, ...s.noticias] };
}

// ============================================================
// NEGOCIAÇÕES COM CLUBES
// ============================================================

export function responderNegociacao(
  state: GameState, negId: string, acao: "aceitar" | "recusar" | "contraproposta",
): { state: GameState; mensagem: string } {
  const neg = state.negociacoes.find(n => n.id === negId);
  if (!neg || neg.status !== "aberta") return { state, mensagem: "Negociação indisponível." };
  const player = state.jogadores.find(p => p.id === neg.playerId);
  const clube = state.clubes.find(c => c.id === neg.clubId);
  if (!player || !clube) return { state, mensagem: "Dados inválidos." };

  if (acao === "recusar") {
    return {
      state: {
        ...state,
        clubes: state.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.max(0, c.confiancaEmVoce - 4) } : c),
        negociacoes: state.negociacoes.map(n => n.id === negId ? { ...n, status: "recusada" as const } : n),
      },
      mensagem: `Proposta recusada. ${clube.nome} não gostou.`,
    };
  }

  if (acao === "contraproposta") {
    const aceitaMult = clube.personalidade === "Pechincha" ? 12 : clube.personalidade === "Imediatista" ? 45 : 28;
    const chance = aceitaMult + state.reputacao * 0.25 + clube.confiancaEmVoce * 0.2;
    if (rnd(0, 100) > chance) {
      return {
        state: {
          ...state,
          clubes: state.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.max(0, c.confiancaEmVoce - 6) } : c),
          negociacoes: state.negociacoes.map(n => n.id === negId ? { ...n, status: "recusada" as const } : n),
        },
        mensagem: `${clube.nome} encerrou a conversa: "não trabalhamos assim".`,
      };
    }
    const novo = Math.floor(neg.valorProposta * (1.15 + Math.random() * 0.25));
    return {
      state: {
        ...state,
        negociacoes: state.negociacoes.map(n => n.id === negId
          ? { ...n, valorProposta: novo, comissao: Math.min(0.15, n.comissao + 0.01), expiraEm: 2 } : n),
      },
      mensagem: `${clube.nome} melhorou para R$ ${novo.toLocaleString("pt-BR")}.`,
    };
  }

  const receita = Math.floor(neg.valorProposta * neg.comissao);
  const salario = neg.salario;
  const tipo = neg.tipo ?? "Compra definitiva";
  const categoria = neg.categoria ?? categoriaDoAtleta(player);
  const transferencia = {
    de: player.clube ?? "Sem clube",
    para: clube.nome,
    tipo,
    valor: neg.valorProposta,
    salario,
    duracaoAnos: neg.duracaoAnos ?? 2,
    data: dataLabel(state),
  };
  const atualizado: Player = {
    ...player,
    clube: clube.nome,
    status: `No ${clube.nome}`,
    salario,
    categoriaForcada: categoria === categoriaPorIdade(player.idade) ? undefined : categoria,
    valorMercado: calcularValorMercado(player.atual, player.potencial, player.idade, true),
    temporadas: registrarPassagem(player, clube, categoria, state.ano, transferencia),
    historico: [...player.historico, `${tipo} para ${clube.nome} por R$ ${neg.valorProposta.toLocaleString("pt-BR")}.`],
    timeline: [...player.timeline, {
      ano: state.ano, mes: state.mes, semana: state.semana,
      tipo: "transferencia" as const,
      texto: `${tipo} para ${clube.nome} (R$ ${neg.valorProposta.toLocaleString("pt-BR")} • salário R$ ${salario.toLocaleString("pt-BR")}/mês).`,
    }],
  };
  const fin: FinanceEntry = {
    id: nextFinId(), data: dataLabel(state),
    descricao: `Comissão: ${player.nome} → ${clube.nome}`,
    valor: receita, tipo: "receita",
  };
  const not: NewsItem = {
    id: nextNewsId(), semana: state.semana, mes: state.mes, ano: state.ano,
    titulo: `${player.nome} é o novo reforço do ${clube.nome}`,
    texto: `Transferência fechada em R$ ${neg.valorProposta.toLocaleString("pt-BR")}.`,
    tipo: "mercado",
  };
  return {
    state: {
      ...ganharReputacao(state, neg.valorProposta > 800_000 ? REP_XP.transferenciaGrande
        : neg.valorProposta > 200_000 ? REP_XP.transferenciaMedia : REP_XP.transferenciaPequena),
      dinheiro: state.dinheiro + receita,
      prestigio: Math.min(5, state.prestigio + (neg.valorProposta > 800_000 ? 1 : 0)),
      clubes: state.clubes.map(c => c.id === clube.id
        ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 10), necessidades: c.necessidades.filter(p => p !== player.posicao) } : c),
      financas: [fin, ...state.financas],
      noticias: [not, ...state.noticias],
      // ao fechar com um clube, todas as outras conversas pelo atleta caem
      negociacoes: state.negociacoes.map(n =>
        n.id === negId ? { ...n, status: "aceita" as const }
          : n.playerId === player.id && n.status === "aberta"
            ? { ...n, status: "cancelada" as const } : n),
      jogadores: state.jogadores.map(p => p.id === player.id ? atualizado : p),
    },
    mensagem: `${player.nome} → ${clube.nome}. Comissão de R$ ${receita.toLocaleString("pt-BR")} recebida!`,
  };
}
