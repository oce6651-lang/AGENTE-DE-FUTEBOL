import { pick, rnd } from "./generators";
import { ganharReputacao, REP_XP } from "./reputation";
import type {
  AgeCategory, Club, GameState, NewsItem, OpenTryout, Player, TimelineEvent, Tryout,
} from "./types";

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

const CATEGORIA_IDADE: Record<AgeCategory, number> = {
  "Sub-11": 11, "Sub-13": 13, "Sub-15": 15, "Sub-17": 17,
  "Sub-18": 18, "Sub-20": 20, Livre: 34, Veterano: 45,
};

const EXIGENCIA: Record<Club["categoria"], number> = {
  Amador: 22, "Serie D": 32, "Serie C": 42, "Serie B": 54, "Serie A": 68, Elite: 82,
};

/** Clubes divulgam peneiras gratuitas. Quanto maior o clube, mais raro o anúncio. */
export function gerarPeneirasAbertas(state: GameState): { state: GameState; manchetes: string[] } {
  const manchetes: string[] = [];
  let s = state;

  // expira peneiras cuja data já passou
  const atualSemanas = state.ano * 48 + state.mes * 4 + state.semana;
  const vigentes = s.peneirasAbertas.filter(p => (p.ano * 48 + p.mes * 4 + p.semana) >= atualSemanas);

  const novas: OpenTryout[] = [];
  const qtd = rnd(0, 2);
  for (let i = 0; i < qtd; i++) {
    const candidatos = s.clubes.filter(c => c.pais === "Brasil");
    const clube = pick(candidatos);
    const chance = { Amador: 0.9, "Serie D": 0.7, "Serie C": 0.45, "Serie B": 0.25, "Serie A": 0.1, Elite: 0.02 }[clube.categoria];
    if (Math.random() > chance) continue;
    const cats: AgeCategory[] = clube.personalidade === "Imediatista"
      ? ["Sub-20", "Livre"]
      : ["Sub-13", "Sub-15", "Sub-17", "Sub-20"];
    const categoria = pick(cats);
    const emSemanas = rnd(2, 6);
    const total = atualSemanas + emSemanas;
    novas.push({
      id: uid("OPT"),
      clubId: clube.id,
      categoria,
      idadeMax: CATEGORIA_IDADE[categoria],
      ano: Math.floor(total / 48),
      mes: Math.max(1, Math.min(12, Math.floor((total % 48) / 4) || 1)),
      semana: (total % 4) + 1,
      vagas: rnd(1, 4),
      nivel: { Amador: 2, "Serie D": 3, "Serie C": 5, "Serie B": 6, "Serie A": 8, Elite: 10 }[clube.categoria],
      inscritos: [],
    });
    manchetes.push(`${clube.nome} abre peneira gratuita ${categoria}`);
  }

  if (novas.length) {
    const noticias: NewsItem[] = novas.map(p => {
      const c = s.clubes.find(x => x.id === p.clubId)!;
      return {
        id: uid("NEW"), semana: s.semana, mes: s.mes, ano: s.ano,
        titulo: `${c.nome} abre peneira gratuita (${p.categoria})`,
        texto: `Avaliação com ${p.vagas} vaga(s) para atletas de até ${p.idadeMax} anos, em ${c.cidade}/${c.estado}. Inscrição sem custo.`,
        tipo: "mundo" as const,
      };
    });
    s = { ...s, noticias: [...noticias, ...s.noticias].slice(0, 150) };
  }

  return { state: { ...s, peneirasAbertas: [...novas, ...vigentes].slice(0, 24) }, manchetes };
}

/** Inscrição gratuita de um atleta em uma peneira aberta. */
export function inscreverPeneiraAberta(state: GameState, playerId: string, openId: string): { state: GameState; mensagem: string } {
  const aberta = state.peneirasAbertas.find(p => p.id === openId);
  const player = state.jogadores.find(p => p.id === playerId);
  if (!aberta || !player) return { state, mensagem: "Dados inválidos." };
  const clube = state.clubes.find(c => c.id === aberta.clubId);
  if (!clube) return { state, mensagem: "Clube indisponível." };
  if (player.clube) return { state, mensagem: `${player.nome} já tem clube. Peneiras são só para atletas livres.` };
  if (player.idade > aberta.idadeMax) return { state, mensagem: `${player.nome} tem ${player.idade} anos — o limite é ${aberta.idadeMax}.` };
  if (aberta.inscritos.includes(playerId)) return { state, mensagem: "Atleta já inscrito nessa peneira." };
  if (state.peneiras.some(t => t.playerId === playerId && (t.status === "em_andamento" || t.status === "mais_tempo")))
    return { state, mensagem: `${player.nome} já está em avaliação.` };

  const atualSemanas = state.ano * 48 + state.mes * 4 + state.semana;
  const alvo = aberta.ano * 48 + aberta.mes * 4 + aberta.semana;
  const espera = Math.max(1, alvo - atualSemanas);

  const t: Tryout = {
    id: uid("TRY"), playerId, clubId: clube.id,
    enviadaAno: state.ano, enviadaMes: state.mes, enviadaSemana: state.semana,
    duracaoSemanas: espera, restanteSemanas: espera,
    status: "em_andamento",
    gratuita: true,
    categoria: aberta.categoria,
    notas: [`Inscrito na peneira gratuita do ${clube.nome} (${aberta.categoria}) — ${aberta.vagas} vaga(s).`],
  };
  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana, tipo: "peneira",
    texto: `Inscrito na peneira aberta do ${clube.nome} (${aberta.categoria}).`,
  };
  return {
    state: {
      ...state,
      peneiras: [t, ...state.peneiras],
      peneirasAbertas: state.peneirasAbertas.map(p => p.id === openId ? { ...p, inscritos: [...p.inscritos, playerId] } : p),
      jogadores: state.jogadores.map(p => p.id === playerId
        ? { ...p, timeline: [...p.timeline, evt], status: `Aguardando peneira (${clube.abrev})` } : p),
    },
    mensagem: `${player.nome} inscrito gratuitamente na peneira do ${clube.nome}.`,
  };
}

/** Avalia uma peneira concluída. Cinco desfechos possíveis. */
export function avaliarPeneira(state: GameState, t: Tryout): { state: GameState; noticia: NewsItem | null; resumo: string } {
  const player = state.jogadores.find(p => p.id === t.playerId);
  const clube = state.clubes.find(c => c.id === t.clubId);
  if (!player || !clube) return { state, noticia: null, resumo: "" };

  const marcar = (status: Tryout["status"], resultado: string, nota: string): GameState => ({
    ...state,
    peneiras: state.peneiras.map(x => x.id === t.id
      ? { ...x, status, resultadoTexto: resultado, notas: [...x.notas, nota] } : x),
  });

  // ---- lesão ----
  if (Math.random() < 0.06) {
    const semanas = rnd(2, 8);
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana, tipo: "nota",
      texto: `Lesionou-se durante a peneira no ${clube.nome}. Fora por ${semanas} semanas.`,
    };
    const s = marcar("lesionado", `Lesão na avaliação. ${semanas} semanas de recuperação.`, "Lesão durante o teste.");
    return {
      state: {
        ...s,
        jogadores: s.jogadores.map(p => p.id === player.id
          ? { ...p, status: "Lesionado", lesaoSemanas: semanas, timeline: [...p.timeline, evt] } : p),
      },
      noticia: null,
      resumo: `${player.nome} se lesionou na peneira do ${clube.nome}.`,
    };
  }

  const exig = EXIGENCIA[clube.categoria]
    + (clube.personalidade === "Tradicional" ? 5 : 0)
    - (clube.personalidade === "Formador" && player.idade < 19 ? 6 : 0)
    + (t.gratuita ? 4 : 0); // peneira aberta tem muito mais concorrência

  const bonusTraco = (player.tracos ?? []).reduce((acc, tr) => acc
    + (tr === "Esforçado" ? 4 : 0) + (tr === "Talentoso" ? 5 : 0)
    + (tr === "Profissional" ? 3 : 0) + (tr === "Indisciplinado" ? -6 : 0)
    + (tr === "Tímido" ? -3 : 0) + (tr === "Líder" ? 3 : 0), 0);

  const score = player.atual + Math.round(player.atributos.mental / 18) + bonusTraco + rnd(-12, 12);

  // ---- destaque da peneira ----
  if (score >= exig + 14) {
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana, tipo: "aprovado",
      texto: `Destaque da peneira do ${clube.nome} — contratado imediatamente.`,
    };
    let s = marcar("destaque", `Melhor da avaliação! ${clube.tecnico} pediu contrato imediato.`, `Nota final ${score} (exigido ${exig}).`);
    s = ganharReputacao(s, REP_XP.peneiraDestaque);
    return {
      state: {
        ...s,
        clubes: s.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 18), elenco: c.elenco + 1 } : c),
        jogadores: s.jogadores.map(p => p.id === player.id ? {
          ...p, clube: clube.nome, status: `No ${clube.nome}`,
          salario: Math.max(1200, Math.round(player.atual * 90)),
          historico: [...p.historico, `Destaque da peneira do ${clube.nome}.`],
          timeline: [...p.timeline, evt],
        } : p),
      },
      noticia: {
        id: uid("NEW"), semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${player.nome} é o destaque da peneira do ${clube.nome}`,
        texto: `${state.agent.agencia} coloca mais um nome no radar do futebol profissional.`,
        tipo: "mercado",
      },
      resumo: `${player.nome} foi destaque no ${clube.nome}!`,
    };
  }

  // ---- aprovado ----
  if (score >= exig + 4) {
    const evt: TimelineEvent = {
      ano: state.ano, mes: state.mes, semana: state.semana, tipo: "aprovado",
      texto: `Aprovado na peneira e contratado pelo ${clube.nome}.`,
    };
    let s = marcar("aprovado", `Aprovado! Contrato assinado com o ${clube.nome}.`, `Nota final ${score} (exigido ${exig}).`);
    s = ganharReputacao(s, REP_XP.peneiraAprovada);
    return {
      state: {
        ...s,
        clubes: s.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.min(100, c.confiancaEmVoce + 12), elenco: c.elenco + 1 } : c),
        jogadores: s.jogadores.map(p => p.id === player.id ? {
          ...p, clube: clube.nome, status: `No ${clube.nome}`,
          salario: Math.max(1000, Math.round(player.atual * 70)),
          historico: [...p.historico, `Aprovado na peneira do ${clube.nome}.`],
          timeline: [...p.timeline, evt],
        } : p),
      },
      noticia: {
        id: uid("NEW"), semana: state.semana, mes: state.mes, ano: state.ano,
        titulo: `${player.nome} é aprovado no ${clube.nome}`,
        texto: `Mais um atleta de ${state.agent.agencia} entra no futebol organizado.`,
        tipo: "mercado",
      },
      resumo: `${player.nome} foi aprovado no ${clube.nome}.`,
    };
  }

  // ---- convocado para nova avaliação ----
  if (score >= exig - 6) {
    const s = marcar("convocado", `${clube.tecnico} convocou o atleta para uma nova avaliação em 2 semanas.`, `Nota parcial ${score}. Reavaliação solicitada.`);
    return {
      state: {
        ...s,
        peneiras: s.peneiras.map(x => x.id === t.id ? { ...x, status: "mais_tempo", restanteSemanas: 2 } : x),
      },
      noticia: null,
      resumo: `${player.nome} foi convocado para nova avaliação no ${clube.nome}.`,
    };
  }

  // ---- reprovado ----
  const evt: TimelineEvent = {
    ano: state.ano, mes: state.mes, semana: state.semana, tipo: "reprovado",
    texto: `Reprovado na peneira do ${clube.nome}.`,
  };
  const s = marcar("reprovado", `Reprovado. Nível abaixo do exigido pela ${clube.categoria}.`, `Reprovado (nota ${score}, exigido ${exig}).`);
  return {
    state: {
      ...s,
      clubes: s.clubes.map(c => c.id === clube.id ? { ...c, confiancaEmVoce: Math.max(0, c.confiancaEmVoce - 2) } : c),
      jogadores: s.jogadores.map(p => p.id === player.id
        ? { ...p, timeline: [...p.timeline, evt], status: "Sem clube" } : p),
    },
    noticia: null,
    resumo: `${player.nome} foi reprovado no ${clube.nome}.`,
  };
}

export function nomeDaPeneira(state: GameState, p: OpenTryout): string {
  const c = state.clubes.find(x => x.id === p.clubId);
  return c ? `${c.nome} • ${p.categoria}` : p.categoria;
}

export function jogadoresElegiveis(state: GameState, p: OpenTryout): Player[] {
  return state.jogadores.filter(j => !j.clube && j.idade <= p.idadeMax && j.status !== "Aposentado" && !p.inscritos.includes(j.id));
}