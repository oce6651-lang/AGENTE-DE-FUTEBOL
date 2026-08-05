import { gerarJogador, pick, rnd, TECNICOS, ARBITROS, rid } from "./generators";
import type {
  AgeCategory, Fixture, GameState, MatchEvent, MatchPlayer, MatchTeam, Player, Position,
} from "./types";
import type { ScoutLocation } from "./locations";

const FORMACOES = ["4-4-2", "4-3-3", "4-2-3-1", "3-5-2", "5-3-2"];
const ESCALACAO_BASE: Position[] = ["GOL","LD","ZAG","ZAG","LE","VOL","MC","MEI","PD","PE","ATA"];
const BANCO_BASE: Position[] = ["GOL","ZAG","MC","PD","ATA"];

const SUFIXOS = ["EC","FC","AA","SC","União","Juventus","Aliança","Estrela","Recreio"];
const BAIRROS = [
  "Vila Nova","São Jorge","Santa Rita","Bela Vista","Cruzeiro","Rio Branco","Parque Ouro",
  "Bom Jesus","Restinga","Navegantes","Jardim Europa","Vila Real",
];

const PALETAS: Array<[string, string]> = [
  ["#c0392b", "#1a0d0c"], ["#1f7a4d", "#0c221a"], ["#2b6cb0", "#0d1a26"],
  ["#d4a017", "#20180a"], ["#7d3c98", "#1a0f22"], ["#2c3e50", "#101820"],
];

function nomeTime() {
  return `${pick(SUFIXOS)} ${pick(BAIRROS)}`;
}
function abrev(nome: string) {
  return nome.replace(/[^A-Za-zÀ-ú ]/g, "").split(" ").filter(Boolean).slice(0, 3)
    .map(w => w[0].toUpperCase()).join("").padEnd(3, "C").slice(0, 3);
}

const HORARIOS: Record<AgeCategory, string> = {
  "Sub-11": "08:00",
  "Sub-13": "08:30",
  "Sub-15": "10:00",
  "Sub-17": "13:30",
  "Sub-18": "14:30",
  "Sub-20": "16:00",
  Livre: "15:30",
  Veterano: "17:00",
};

function horarioPara(cat: AgeCategory) {
  return HORARIOS[cat] ?? "15:00";
}

function gerarTime(state: GameState, local: string, categoria: AgeCategory, idBase: number, nivel: number): { time: MatchTeam; usados: number } {
  const nome = nomeTime();
  const cores = pick(PALETAS);
  let n = idBase;
  const criar = (pos: Position, numero: number, titular: boolean): MatchPlayer => {
    const player = gerarJogador({
      cidade: state.agent.cidade, local, nextId: n++, ano: state.ano, mes: state.mes,
      semana: state.semana, categoria, posicao: pos, nivel,
    });
    return { player, numero, nota: 6, titular, minutos: titular ? 0 : 0, gols: 0, destaque: false };
  };
  const titulares = ESCALACAO_BASE.map((p, i) => criar(p, i + 1, true));
  const reservas = BANCO_BASE.map((p, i) => criar(p, 12 + i, false));
  return {
    time: {
      nome, abrev: abrev(nome), cores, tecnico: pick(TECNICOS),
      formacao: pick(FORMACOES), titulares, reservas, gols: 0,
    },
    usados: n - idBase,
  };
}

/**
 * Partida especial da várzea onde os contatos pessoais do início de carreira
 * finalmente entram em campo: Sítio Canela x Bananeiras, categoria Livre.
 */
function partidaDosContatos(state: GameState, loc: ScoutLocation, idBase: number): Fixture | null {
  const pendentes = state.contatosPendentes ?? [];
  if (loc.id !== "varzea" || pendentes.length === 0) return null;

  let n = idBase;
  const montar = (nome: string, cores: [string, string]) => {
    const criar = (pos: Position, numero: number, titular: boolean): MatchPlayer => ({
      player: gerarJogador({
        cidade: state.agent.cidade, local: loc.nome, nextId: n++, ano: state.ano,
        mes: state.mes, semana: state.semana, categoria: "Livre", posicao: pos, nivel: 1,
      }),
      numero, nota: 6, titular, minutos: 0, gols: 0, destaque: false,
    });
    return {
      nome, abrev: abrev(nome), cores, tecnico: pick(TECNICOS), formacao: pick(FORMACOES),
      titulares: ESCALACAO_BASE.map((p, i) => criar(p, i + 1, true)),
      reservas: BANCO_BASE.map((p, i) => criar(p, 12 + i, false)),
      gols: 0,
    } as MatchTeam;
  };

  const casa = montar("Sítio Canela", ["#1c8a4a", "#e4b400"]);
  const fora = montar("Bananeiras", ["#e4b400", "#1a1a1a"]);

  // cada contato entra como titular, um em cada time, na sua própria posição
  pendentes.forEach((p, i) => {
    const time = i % 2 === 0 ? casa : fora;
    const alvo = time.titulares.find(m => m.player.posicao === p.posicao)
      ?? time.titulares[10 - i];
    alvo.player = p;
    alvo.destaque = true;
  });

  return {
    id: rid("FIX", 1),
    local: loc.nome,
    categoria: "Livre",
    casa, fora,
    arbitro: pick(ARBITROS),
    horario: "15:30",
    publico: rnd(40, 140),
    custoIngresso: loc.custoIngresso,
  };
}

/** Gera a rodada do dia em um local: uma partida por categoria disponível. */
export function gerarRodada(state: GameState, loc: ScoutLocation, idBase: number): Fixture[] {
  let n = idBase;
  const fixtures: Fixture[] = [];
  const cats = loc.categorias.filter(() => Math.random() < 0.75);
  const especial = partidaDosContatos(state, loc, idBase + 900);
  const lista = (cats.length ? cats : [pick(loc.categorias)])
    .filter(c => !(especial && c === "Livre"));
  lista.forEach((cat, i) => {
    const casa = gerarTime(state, loc.nome, cat, n, loc.nivel); n += casa.usados;
    const fora = gerarTime(state, loc.nome, cat, n, loc.nivel); n += fora.usados;
    // Categorias mais velhas atraem mais público; palcos grandes atraem ainda mais.
    const [pMin, pMax] = loc.publico;
    fixtures.push({
      id: rid("FIX", Date.now() % 100000 + i),
      local: loc.nome,
      categoria: cat,
      casa: casa.time,
      fora: fora.time,
      arbitro: pick(ARBITROS),
      horario: horarioPara(cat),
      publico: rnd(pMin, pMax),
      custoIngresso: loc.custoIngresso,
    });
  });
  if (especial) fixtures.push(especial);
  return fixtures.sort((a, b) => a.horario.localeCompare(b.horario));
}

function forcaJogador(p: Player) {
  const a = p.atributos;
  return (p.atual * 2 + a.tecnica + a.mental) / 4;
}

function forcaTime(t: MatchTeam) {
  return t.titulares.reduce((s, m) => s + forcaJogador(m.player), 0) / t.titulares.length;
}

const LANCES_NEUTROS = [
  "Bola rolando no meio-campo, jogo truncado.",
  "Time recua e tenta segurar o resultado.",
  "Muita disputa física, pouca criação.",
  "Torcida atrás do gol empurra o time.",
  "Jogo cai de ritmo sob o sol forte.",
];

/**
 * Simula a partida minuto a minuto. Retorna a linha de eventos completa
 * e os times com notas/gols atualizados (a UI reproduz os eventos no tempo).
 */
export function simularPartida(fx: Fixture): { eventos: MatchEvent[]; casa: MatchTeam; fora: MatchTeam } {
  const dur = fx.categoria === "Sub-11" ? 40 : fx.categoria === "Sub-13" ? 50
    : fx.categoria === "Sub-15" ? 60 : fx.categoria === "Veterano" ? 70 : 90;
  const casa: MatchTeam = { ...fx.casa, gols: 0, titulares: fx.casa.titulares.map(m => ({ ...m, nota: 6, gols: 0 })), reservas: fx.casa.reservas.map(m => ({ ...m })) };
  const fora: MatchTeam = { ...fx.fora, gols: 0, titulares: fx.fora.titulares.map(m => ({ ...m, nota: 6, gols: 0 })), reservas: fx.fora.reservas.map(m => ({ ...m })) };

  const fCasa = forcaTime(casa) + 3; // mando de campo
  const fFora = forcaTime(fora);
  const eventos: MatchEvent[] = [
    { minuto: 0, tipo: "apito", lado: "neutro", texto: `Apito inicial de ${fx.arbitro}. ${casa.nome} x ${fora.nome}.` },
  ];

  const escolher = (t: MatchTeam, ofensivo: boolean) => {
    const pool = t.titulares.filter(m => ofensivo
      ? ["ATA","SA","PD","PE","MEI"].includes(m.player.posicao)
      : true);
    const lista = pool.length ? pool : t.titulares;
    // atletas melhores aparecem mais
    const somaPesos = lista.reduce((s, m) => s + forcaJogador(m.player), 0);
    let r = Math.random() * somaPesos;
    for (const m of lista) { r -= forcaJogador(m.player); if (r <= 0) return m; }
    return lista[0];
  };

  for (let min = 1; min <= dur; min++) {
    const chanceLance = 0.16;
    if (Math.random() > chanceLance) continue;
    const totalF = fCasa + fFora;
    const ladoCasa = Math.random() < fCasa / totalF;
    const time = ladoCasa ? casa : fora;
    const adversario = ladoCasa ? fora : casa;
    const lado = ladoCasa ? "casa" : "fora";
    const autor = escolher(time, true);
    const roll = Math.random();

    if (roll < 0.20) {
      const gk = adversario.titulares.find(m => m.player.posicao === "GOL");
      const qualidade = autor.player.atributos.finalizacao + rnd(-15, 15);
      if (qualidade > 55) {
        time.gols += 1;
        autor.nota = Math.min(10, autor.nota + 1.4);
        autor.gols += 1;
        if (gk) gk.nota = Math.max(3, gk.nota - 0.5);
        eventos.push({ minuto: min, tipo: "gol", lado, playerId: autor.player.id,
          texto: `GOL! ${autor.player.nome} (${autor.player.posicao}) marca para o ${time.nome}. ${casa.gols} x ${fora.gols}` });
      } else {
        if (gk) gk.nota = Math.min(10, gk.nota + 0.5);
        autor.nota = Math.max(3, autor.nota - 0.2);
        eventos.push({ minuto: min, tipo: "defesa", lado, playerId: gk?.player.id,
          texto: `${autor.player.nome} finaliza, mas ${gk?.player.nome ?? "o goleiro"} espalma.` });
      }
    } else if (roll < 0.45) {
      autor.nota = Math.min(10, autor.nota + 0.35);
      eventos.push({ minuto: min, tipo: "chance", lado, playerId: autor.player.id,
        texto: `${autor.player.nome} arranca pela ponta e cria perigo.` });
    } else if (roll < 0.62) {
      const faltoso = escolher(adversario, false);
      faltoso.nota = Math.max(3, faltoso.nota - 0.25);
      eventos.push({ minuto: min, tipo: "falta", lado: lado === "casa" ? "fora" : "casa", playerId: faltoso.player.id,
        texto: `Falta dura de ${faltoso.player.nome} em ${autor.player.nome}.` });
    } else if (roll < 0.70) {
      const punido = escolher(adversario, false);
      punido.nota = Math.max(3, punido.nota - 0.8);
      eventos.push({ minuto: min, tipo: "cartao", lado: lado === "casa" ? "fora" : "casa", playerId: punido.player.id,
        texto: `Cartão amarelo para ${punido.player.nome}. ${fx.arbitro} não perdoou.` });
    } else if (roll < 0.80 && min > dur * 0.6) {
      const sai = pick(time.titulares);
      const entra = time.reservas.find(r => r.minutos === 0);
      if (entra) {
        entra.minutos = dur - min;
        eventos.push({ minuto: min, tipo: "substituicao", lado,
          texto: `${time.tecnico} mexe: sai ${sai.player.nome}, entra ${entra.player.nome}.` });
      }
    } else {
      eventos.push({ minuto: min, tipo: "lance", lado: "neutro", texto: pick(LANCES_NEUTROS) });
    }
  }

  // notas finais: performance + qualidade real com ruído (scout nunca é preciso)
  for (const t of [casa, fora]) {
    for (const m of t.titulares) {
      m.minutos = m.minutos || dur;
      const base = m.nota + (forcaJogador(m.player) - 45) / 22 + (Math.random() - 0.5);
      m.nota = Math.max(3, Math.min(10, Number(base.toFixed(1))));
    }
    for (const m of t.reservas) {
      if (m.minutos > 0) {
        m.nota = Math.max(3, Math.min(10, Number((6 + (forcaJogador(m.player) - 45) / 25 + (Math.random() - 0.5)).toFixed(1))));
      }
    }
  }

  eventos.push({ minuto: dur, tipo: "fim", lado: "neutro",
    texto: `Fim de jogo: ${casa.nome} ${casa.gols} x ${fora.gols} ${fora.nome}.` });

  return { eventos, casa, fora };
}

/** Atletas que chamaram atenção: poucos, e nem sempre os melhores de verdade. */
export function destaquesDaPartida(casa: MatchTeam, fora: MatchTeam): MatchPlayer[] {
  const todos = [...casa.titulares, ...fora.titulares, ...casa.reservas.filter(r => r.minutos > 0), ...fora.reservas.filter(r => r.minutos > 0)];
  const ordenados = [...todos].sort((a, b) => b.nota - a.nota);
  const qtd = Math.random() < 0.35 ? 2 : Math.random() < 0.8 ? 3 : 4;
  const naturais = ordenados.slice(0, qtd).filter(m => m.nota >= 6.8);
  // contatos pessoais sempre chamam atenção — foi por isso que você foi até lá
  const contatos = todos.filter(m => m.player.contatoInicial);
  const selecionados = [...contatos, ...naturais.filter(m => !m.player.contatoInicial)];
  selecionados.forEach(m => { m.destaque = true; });
  return selecionados;
}
