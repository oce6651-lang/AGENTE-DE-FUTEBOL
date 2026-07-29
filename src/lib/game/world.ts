import { pick, rnd, TECNICOS, POSICOES, LIGAS } from "./generators";
import type { Club, Division, GameState, NewsItem, Player, TimelineEvent } from "./types";

const ORDEM: Division[] = ["Amador", "Serie D", "Serie C", "Serie B", "Serie A", "Elite"];

function sobe(d: Division): Division {
  const i = ORDEM.indexOf(d);
  return ORDEM[Math.min(ORDEM.length - 1, i + 1)];
}
function desce(d: Division): Division {
  const i = ORDEM.indexOf(d);
  return ORDEM[Math.max(0, i - 1)];
}

const NOMES_FICTICIOS = [
  "Rodrigo Vasques","Elias Prado","Tiago Bertoldo","Cauã Menezes","Léo Vidal","Juninho Barros",
  "Ramon Estevão","Wallace Duarte","Kevin Sartori","Bruno Casagrande","Marlon Pizzato",
];

function noticia(s: GameState, titulo: string, texto: string, tipo: NewsItem["tipo"] = "mundo"): NewsItem {
  return {
    id: `NEW${Math.random().toString(36).slice(2, 10)}`,
    semana: s.semana, mes: s.mes, ano: s.ano, titulo, texto, tipo,
  };
}

/** O mundo se move sozinho: clubes contratam, emprestam, demitem, sobem e caem. */
export function mundoSemanal(state: GameState): { state: GameState; manchetes: string[] } {
  let s: GameState = { ...state };
  const manchetes: string[] = [];
  const novas: NewsItem[] = [];

  // ---- rodada dos clubes ----
  s = {
    ...s,
    clubes: s.clubes.map(c => {
      const forca = ORDEM.indexOf(c.categoria) + 1;
      const r = Math.random() * (forca + 3);
      const pontos = r > forca * 0.6 ? 3 : r > forca * 0.35 ? 1 : 0;
      const moral = Math.max(0, Math.min(100, c.moralTecnico + (pontos === 3 ? rnd(2, 6) : pontos === 1 ? 0 : -rnd(3, 9))));
      return { ...c, pontos: c.pontos + pontos, jogos: c.jogos + 1, moralTecnico: moral };
    }),
  };

  // ---- demissão de treinadores ----
  for (const c of s.clubes) {
    if (c.moralTecnico < 22 && Math.random() < 0.45) {
      const novo = pick(TECNICOS.filter(t => t !== c.tecnico));
      s = {
        ...s,
        clubes: s.clubes.map(x => x.id === c.id ? { ...x, tecnico: novo, moralTecnico: rnd(45, 65), necessidades: [pick(POSICOES), pick(POSICOES)] } : x),
      };
      const n = noticia(s, `${c.nome} demite ${c.tecnico}`, `Após má sequência, o clube anuncia ${novo} como novo treinador. O elenco deve mudar de perfil.`);
      novas.push(n); manchetes.push(n.titulo);
    }
  }

  // ---- mercado entre clubes (contratações e empréstimos) ----
  if (Math.random() < 0.55) {
    const c = pick(s.clubes);
    const alvo = pick(NOMES_FICTICIOS);
    const pos = pick(c.necessidades.length ? c.necessidades : POSICOES);
    const emprestimo = Math.random() < 0.4;
    const valor = Math.floor(c.orcamento * (c.personalidade === "Pechincha" ? 0.0008 : 0.004) * (0.5 + Math.random()));
    const n = emprestimo
      ? noticia(s, `${c.nome} acerta empréstimo de ${alvo}`, `O ${pos} chega por uma temporada para suprir carência no setor.`, "mercado")
      : noticia(s, `${c.nome} contrata ${alvo}`, `Negócio fechado por R$ ${valor.toLocaleString("pt-BR")}. O clube fecha a vaga de ${pos}.`, "mercado");
    novas.push(n); manchetes.push(n.titulo);
    s = {
      ...s,
      clubes: s.clubes.map(x => x.id === c.id
        ? { ...x, elenco: x.elenco + 1, necessidades: x.necessidades.filter(p => p !== pos), orcamento: Math.max(100_000, x.orcamento - (emprestimo ? 0 : valor)) }
        : x),
    };
  }

  // ---- clubes criam necessidades novas ----
  if (Math.random() < 0.4) {
    const c = pick(s.clubes);
    const pos = pick(POSICOES);
    if (!c.necessidades.includes(pos)) {
      s = { ...s, clubes: s.clubes.map(x => x.id === c.id ? { ...x, necessidades: [...x.necessidades, pos].slice(-3) } : x) };
    }
  }

  // ---- peneiras abertas pelos clubes ----
  if (Math.random() < 0.22) {
    const c = pick(s.clubes);
    const n = noticia(s, `${c.nome} abre peneira para a base`, `A comissão de ${c.tecnico} busca ${c.necessidades.join(", ") || "atletas"} nas próximas semanas. Empresários podem inscrever atletas.`, "mundo");
    novas.push(n); manchetes.push(n.titulo);
    s = { ...s, clubes: s.clubes.map(x => x.id === c.id ? { ...x, confiancaEmVoce: Math.min(100, x.confiancaEmVoce + 1) } : x) };
  }

  // ---- olheiros de clubes observando o SEU radar ----
  if (s.radar.length && Math.random() < 0.3) {
    const alvo = pick(s.radar);
    const c = pick(s.clubes);
    const n = noticia(s, `Olheiros do ${c.nome} estiveram em ${alvo.local}`, `Um atleta que você acompanha foi observado por outro clube. Agir rápido pode ser decisivo.`, "info");
    novas.push(n); manchetes.push(n.titulo);
  }

  // ---- empresários rivais roubam alvos do seu radar ----
  if (s.radar.length && Math.random() < 0.28) {
    const candidatos = s.radar.filter(p => !p.empresario);
    if (candidatos.length) {
      const alvo = pick(candidatos);
      const rival = pick(s.rivais);
      const protecao = alvo.confianca / 2 + s.reputacao / 3;
      if (rnd(0, 100) > protecao) {
        s = {
          ...s,
          radar: s.radar.filter(p => p.id !== alvo.id),
          rivais: s.rivais.map(r => r.id === rival.id ? { ...r, clientes: r.clientes + 1 } : r),
        };
        const n = noticia(s, `${rival.agencia} fecha com ${alvo.nome}`, `Você perdeu um alvo do seu radar para ${rival.nome}. Construir confiança leva tempo.`, "mercado");
        novas.push(n); manchetes.push(n.titulo);
      }
    }
  }

  // ---- evolução dos atletas do mundo (radar) ----
  s = {
    ...s,
    radar: s.radar.map(p => {
      if (p.atual >= p.potencial) return p;
      const chance = p.idade < 19 ? 0.09 : 0.04;
      return Math.random() < chance ? { ...p, atual: p.atual + 1 } : p;
    }),
  };

  // ---- fim de temporada: promoções e rebaixamentos ----
  if (s.mes === 12 && s.semana === 4) {
    // Cada divisão tem seu próprio campeão, promovido e rebaixado.
    const promovidos: Club[] = [];
    const rebaixados: Club[] = [];
    const campeoes: string[] = [];
    for (const div of ORDEM) {
      const daDivisao = s.clubes
        .filter(c => c.categoria === div)
        .sort((a, b) => (b.pontos / Math.max(1, b.jogos)) - (a.pontos / Math.max(1, a.jogos)));
      if (daDivisao.length < 2) continue;
      campeoes.push(`${daDivisao[0].nome} (${LIGAS[div]})`);
      if (div !== "Elite") promovidos.push(daDivisao[0]);
      if (div !== "Amador") rebaixados.push(daDivisao[daDivisao.length - 1]);
    }
    s = {
      ...s,
      clubes: s.clubes.map(c => {
        let cat = c.categoria;
        if (promovidos.some(p => p.id === c.id)) cat = sobe(c.categoria);
        if (rebaixados.some(p => p.id === c.id)) cat = desce(c.categoria);
        const liga = cat === c.categoria ? c.liga : LIGAS[cat];
        return { ...c, categoria: cat, liga, pontos: 0, jogos: 0, orcamento: Math.round(c.orcamento * (cat === c.categoria ? 1 : promovidos.some(p => p.id === c.id) ? 1.6 : 0.6)) };
      }),
    };
    const n = noticia(s, `Temporada ${s.ano} encerrada`,
      `Campeões: ${campeoes.join(", ")}. ${promovidos.map(p => p.nome).join(", ")} sobem de divisão e ${rebaixados.map(p => p.nome).join(", ")} caem.`, "mundo");
    novas.push(n); manchetes.push(n.titulo);
  }

  if (novas.length) s = { ...s, noticias: [...novas, ...s.noticias].slice(0, 120) };
  return { state: s, manchetes };
}

/** Envelhecimento e aposentadoria dos seus atletas (virada de ano). */
export function viradaDeAno(state: GameState): GameState {
  const jogadores: Player[] = state.jogadores.map(p => {
    const idade = p.idade + 1;
    if (idade >= 34 && Math.random() < (idade - 32) * 0.18) {
      const evt: TimelineEvent = {
        ano: state.ano, mes: 1, semana: 1, tipo: "aposentadoria",
        texto: `Encerrou a carreira aos ${idade} anos.`,
      };
      return { ...p, idade, status: "Aposentado", clube: null, timeline: [...p.timeline, evt] };
    }
    return { ...p, idade };
  });
  return { ...state, jogadores, radar: state.radar.map(p => ({ ...p, idade: p.idade + 1 })) };
}

export { ORDEM as DIVISOES };
