import { COMPETICOES, competicaoAtiva, competicoesDoClube } from "./data/leagues";
import type { Competition } from "./data/leagues";
import { pick, rnd } from "./generators";
import { ganharReputacao, REP_XP } from "./reputation";
import type {
  AgeCategory, Club, CompetitionSeason, GameState, NewsItem, Player,
  SeasonCompetition, SeasonRecord, TransferRecord,
} from "./types";

function uid(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

// ============================================================
// CATEGORIA DE BASE — definida pela idade (ou por promoção)
// ============================================================
export function categoriaPorIdade(idade: number): AgeCategory {
  if (idade <= 13) return "Sub-13";
  if (idade <= 15) return "Sub-15";
  if (idade <= 17) return "Sub-17";
  if (idade <= 20) return "Sub-20";
  if (idade <= 40) return "Livre";
  return "Veterano";
}

/** Categoria em que o atleta realmente atua, considerando promoções raras. */
export function categoriaDoAtleta(p: Player): AgeCategory {
  return p.categoriaForcada ?? categoriaPorIdade(p.idade);
}

/** Competições que o atleta realmente disputa neste momento do calendário. */
export function competicoesDoAtleta(clube: Club, p: Player, mes: number): Competition[] {
  const cat = categoriaDoAtleta(p);
  return competicoesDoClube(clube.categoria, clube.pais, clube.estado)
    .filter(c => c.categorias.includes(cat))
    .filter(c => competicaoAtiva(c, mes));
}

function temporadaVazia(
  ano: number, clube: string, categoria: string, liga: string, divisao?: string,
): SeasonRecord {
  return {
    id: uid("SEA"),
    ano, clube, categoria, liga, divisao,
    jogos: 0, gols: 0, assistencias: 0, overall: 0,
    valorMercado: 0, salario: 0,
    titulos: [], premios: [], lesoes: [],
    amarelos: 0, vermelhos: 0, notaMedia: 0,
    competicoes: [],
  };
}

/**
 * Abre uma nova passagem no histórico. O mesmo ano pode ter várias linhas,
 * uma para cada clube/categoria pelo qual o atleta passou.
 */
export function registrarPassagem(
  p: Player, clube: Club, categoria: AgeCategory, ano: number, transferencia?: TransferRecord,
): SeasonRecord[] {
  const nova = temporadaVazia(ano, clube.nome, categoria, clube.liga, clube.categoria);
  nova.transferencia = transferencia;
  nova.overall = p.atual;
  nova.valorMercado = p.valorMercado;
  nova.salario = p.salario;
  return [nova, ...(p.temporadas ?? [])];
}

/** Localiza a passagem corrente (mesmo ano, clube e categoria). */
function indicePassagem(temporadas: SeasonRecord[], ano: number, clube: string, categoria: string): number {
  return temporadas.findIndex(t => t.ano === ano && t.clube === clube && t.categoria === categoria);
}

function campanhaVazia(c: Competition, categoria: string): SeasonCompetition {
  return {
    competicaoId: c.id, competicao: c.nome, categoria,
    jogos: 0, gols: 0, assistencias: 0, amarelos: 0, vermelhos: 0, notaMedia: 0,
  };
}

/** Probabilidade do atleta ser escalado, conforme nível técnico e porte do clube. */
function chanceDeJogar(p: Player, clube: Club): number {
  const exigencia: Record<Club["categoria"], number> = {
    Amador: 12, "Serie D": 26, "Serie C": 38, "Serie B": 50, "Serie A": 64, Elite: 78,
  };
  const cat = categoriaDoAtleta(p);
  const desconto = cat === "Livre" ? 0 : 10; // na base o nível exigido é menor
  const delta = p.atual - (exigencia[clube.categoria] - desconto);
  return Math.max(0.05, Math.min(0.92, 0.5 + delta / 40));
}

/**
 * Simula a semana esportiva dos atletas representados: partidas disputadas,
 * gols, assistências, cartões e notas dentro de cada competição.
 */
export function semanaEsportiva(state: GameState): { state: GameState; manchetes: string[] } {
  const manchetes: string[] = [];
  const jogadores = state.jogadores.map(p => {
    if (!p.clube || p.status === "Aposentado" || (p.lesaoSemanas ?? 0) > 0) return p;
    const clube = state.clubes.find(c => c.nome === p.clube);
    if (!clube) return p;

    const comps = competicoesDoAtleta(clube, p, state.mes);
    if (!comps.length) return p;

    const categoria = categoriaDoAtleta(p);
    let temporadas = [...(p.temporadas ?? [])];
    let atualIdx = indicePassagem(temporadas, state.ano, clube.nome, categoria);
    if (atualIdx < 0) {
      temporadas = registrarPassagem(p, clube, categoria, state.ano);
      atualIdx = 0;
    }
    const temp: SeasonRecord = { ...temporadas[atualIdx], competicoes: [...(temporadas[atualIdx].competicoes ?? [])] };
    temp.liga = clube.liga;
    temp.divisao = clube.categoria;

    const rodadas = comps.length > 2 && Math.random() < 0.4 ? 2 : 1;
    let jogouAlgo = false;

    for (let i = 0; i < rodadas; i++) {
      const comp = pick(comps);
      if (Math.random() > chanceDeJogar(p, clube)) continue;
      jogouAlgo = true;

      const ofensivo = ["ATA", "SA", "PD", "PE", "MEI"].includes(p.posicao);
      const forca = p.atual / 100;
      const gols = ofensivo
        ? (Math.random() < forca * 0.45 ? 1 : 0) + (Math.random() < forca * 0.1 ? 1 : 0)
        : (Math.random() < forca * 0.08 ? 1 : 0);
      const assist = Math.random() < forca * (ofensivo ? 0.3 : 0.14) ? 1 : 0;
      const amarelo = Math.random() < 0.14 ? 1 : 0;
      const vermelho = Math.random() < 0.012 ? 1 : 0;
      const nota = Math.max(3, Math.min(10, 6 + gols * 0.9 + assist * 0.5 - vermelho * 2 + (Math.random() - 0.5) * 1.6));

      let idx = (temp.competicoes ?? []).findIndex(x => x.competicaoId === comp.id);
      if (idx < 0) { temp.competicoes!.push(campanhaVazia(comp, categoria)); idx = temp.competicoes!.length - 1; }
      const camp = { ...temp.competicoes![idx] };
      camp.notaMedia = (camp.notaMedia * camp.jogos + nota) / (camp.jogos + 1);
      camp.jogos += 1;
      camp.gols += gols;
      camp.assistencias += assist;
      camp.amarelos += amarelo;
      camp.vermelhos += vermelho;
      temp.competicoes![idx] = camp;

      temp.notaMedia = ((temp.notaMedia ?? 0) * temp.jogos + nota) / (temp.jogos + 1);
      temp.jogos += 1;
      temp.gols += gols;
      temp.assistencias += assist;
      temp.amarelos = (temp.amarelos ?? 0) + amarelo;
      temp.vermelhos = (temp.vermelhos ?? 0) + vermelho;

      if (gols >= 2) {
        manchetes.push(`${p.nome} marca ${gols} gols pelo ${clube.nome} (${comp.nome})`);
      }
    }

    temp.overall = p.atual;
    temp.valorMercado = p.valorMercado;
    temp.salario = p.salario;
    temporadas[atualIdx] = temp;
    if (!jogouAlgo) return { ...p, temporadas };
    return { ...p, temporadas };
  });

  return { state: { ...state, jogadores }, manchetes };
}

// ============================================================
// FIM DE TEMPORADA — campeões, colocações e histórico
// ============================================================

/**
 * Força do clube em uma categoria específica. Times profissionais fortes nem
 * sempre têm boas categorias de base — cada geração é diferente.
 */
function forcaNaCategoria(c: Club, cat: AgeCategory, ano: number): number {
  const base: Record<Club["categoria"], number> = {
    Amador: 10, "Serie D": 25, "Serie C": 40, "Serie B": 55, "Serie A": 72, Elite: 88,
  };
  if (cat === "Livre" || cat === "Veterano") {
    return base[c.categoria] + Math.log10(Math.max(10, c.orcamento)) * 3 + c.pontos * 0.4;
  }
  const especifica = c.forcaCategorias?.[cat] ?? 40;
  // geração da categoria naquele ano: oscila muito de temporada para temporada
  const geracao = ((c.id.charCodeAt(3) * 31 + ano * 17 + cat.length * 7) % 41) - 20;
  return base[c.categoria] * 0.45 + especifica * 0.55 + geracao;
}

/** Define campeão, vice e colocações de todas as competições da temporada. */
export function encerrarTemporada(state: GameState): { state: GameState; noticias: NewsItem[] } {
  const edicoes: CompetitionSeason[] = [];
  const noticias: NewsItem[] = [];
  // compId + categoria -> clubeNome -> posição
  const colocacoes = new Map<string, Map<string, number>>();
  // Quantos títulos cada clube já levantou neste ano — evita domínio absoluto.
  const titulosNoAno = new Map<string, number>();
  // Quantos títulos o clube já levantou em cada categoria neste ano.
  const titulosPorCategoria = new Map<string, number>();

  for (const comp of COMPETICOES) {
    const participantes = state.clubes.filter(c =>
      competicoesDoClube(c.categoria, c.pais, c.estado).some(x => x.id === comp.id));
    if (participantes.length < 2) continue;

    const porEstado = ["estadual", "amadora", "regional"].includes(comp.tipo) || comp.id === "estadual-base";
    const grupos: Club[][] = porEstado
      ? Array.from(participantes.reduce((m, c) => {
        m.set(c.estado, [...(m.get(c.estado) ?? []), c]);
        return m;
      }, new Map<string, Club[]>()).values())
      : [participantes];

    // cada categoria tem sua própria disputa e seu próprio campeão
    for (const cat of comp.categorias) {
      const mapa = new Map<string, number>();
      for (const grupo of grupos) {
        if (grupo.length < 2) continue;
        const rank = grupo
          .map(c => ({
            c,
            score: forcaNaCategoria(c, cat, state.ano) + rnd(-22, 22)
              // cada troféu já conquistado no ano pesa contra: campeonatos se distribuem
              - (titulosNoAno.get(c.nome) ?? 0) * 14
              - (titulosPorCategoria.get(`${c.nome}|${cat}`) ?? 0) * 22,
          }))
          .sort((a, b) => b.score - a.score);
        rank.forEach((r, i) => mapa.set(r.c.nome, i + 1));
        titulosNoAno.set(rank[0].c.nome, (titulosNoAno.get(rank[0].c.nome) ?? 0) + 1);
        titulosPorCategoria.set(`${rank[0].c.nome}|${cat}`, (titulosPorCategoria.get(`${rank[0].c.nome}|${cat}`) ?? 0) + 1);
        const sufixo = porEstado ? ` (${rank[0].c.estado})` : "";
        edicoes.push({
          ano: state.ano,
          competicaoId: comp.id,
          competicao: comp.nome + sufixo,
          categoria: cat,
          campeao: rank[0].c.nome,
          vice: rank[1].c.nome,
          clientes: [],
        });
      }
      colocacoes.set(`${comp.id}|${cat}`, mapa);
    }
  }

  // ---- consolidação individual dos atletas da agência ----
  let s: GameState = state;
  const jogadores = s.jogadores.map(p => {
    const temporadas = [...(p.temporadas ?? [])];
    const doAno = temporadas.map((t, i) => ({ t, i })).filter(x => x.t.ano === s.ano);
    if (!doAno.length) return p;
    const novosTitulos = [...(p.titulos ?? [])];

    for (const { t, i } of doAno) {
      const temp: SeasonRecord = { ...t };
      const titulos: string[] = [...temp.titulos];
      const premios: string[] = [...temp.premios];

      temp.competicoes = (temp.competicoes ?? []).map(camp => {
        const mapa = colocacoes.get(`${camp.competicaoId}|${camp.categoria}`);
        const posClube = mapa?.get(temp.clube) ?? rnd(3, 12);
        const ajuste = camp.notaMedia >= 7.4 ? -1 : camp.notaMedia <= 6 ? 1 : 0;
        const posicao = Math.max(1, posClube + ajuste);
        const campeao = posicao === 1 && camp.jogos >= 3;
        if (campeao) {
          const rotulo = `${camp.competicao} ${camp.categoria !== "Livre" ? camp.categoria : ""}`.trim();
          titulos.push(rotulo);
          novosTitulos.push({ ano: s.ano, competicao: rotulo, clube: temp.clube });
          const edicao = edicoes.find(e => e.competicaoId === camp.competicaoId
            && e.categoria === camp.categoria && e.campeao === temp.clube);
          if (edicao) edicao.clientes!.push({ playerId: p.id, nome: p.nome, clube: temp.clube, posicao });
        }
        return { ...camp, posicao, campeao };
      });

      if (temp.jogos >= 15 && (temp.notaMedia ?? 0) >= 7.5) premios.push("Seleção da competição");
      if (temp.gols >= 15) premios.push("Artilheiro da temporada");

      temp.titulos = titulos;
      temp.premios = premios;
      temp.overall = p.atual;
      temp.valorMercado = p.valorMercado;
      temp.salario = p.salario;
      temporadas[i] = temp;
    }

    return { ...p, temporadas, titulos: novosTitulos };
  });
  s = { ...s, jogadores };

  // ---- benefícios de carreira por títulos conquistados ----
  const titulosDoAno = (p: Player) => (p.temporadas ?? [])
    .filter(t => t.ano === state.ano).flatMap(t => t.titulos);
  const campeoes = jogadores.filter(p => titulosDoAno(p).length > 0);
  if (campeoes.length) {
    let bonusTotal = 0;
    for (const p of campeoes) {
      const qtd = titulosDoAno(p).length;
      bonusTotal += 4000 * qtd;
      s = ganharReputacao(s, REP_XP.transferenciaPequena * qtd);
    }
    s = {
      ...s,
      dinheiro: s.dinheiro + bonusTotal,
      financas: [{
        id: uid("FIN"),
        data: `12/${state.ano}`,
        descricao: `Bônus por títulos de ${campeoes.length} cliente(s)`,
        valor: bonusTotal, tipo: "receita" as const,
      }, ...s.financas],
      jogadores: s.jogadores.map(p => campeoes.some(c => c.id === p.id)
        ? {
          ...p,
          confianca: Math.min(100, p.confianca + 8),
          valorMercado: Math.round(p.valorMercado * 1.15),
          timeline: [...p.timeline, {
            ano: state.ano, mes: 12, semana: 4, tipo: "nota" as const,
            texto: `Campeão: ${titulosDoAno(p).join(", ")}.`,
          }],
        }
        : p),
    };
    noticias.push({
      id: uid("NEW"),
      semana: 4, mes: 12, ano: state.ano,
      titulo: `${campeoes.length} cliente(s) da ${state.agent.agencia} são campeões em ${state.ano}`,
      texto: campeoes.map(p => `${p.nome}: ${titulosDoAno(p).join(", ")}`).join(" • "),
      tipo: "mundo",
    });
  }

  s = {
    ...s,
    historicoCompeticoes: [...edicoes, ...(s.historicoCompeticoes ?? [])].slice(0, 4000),
    titulosMundo: [
      ...edicoes.filter(e => e.categoria === "Livre" || e.categoria === "Sub-20")
        .map(e => ({ ano: e.ano, competicao: `${e.competicao} ${e.categoria === "Livre" ? "" : e.categoria}`.trim(), campeao: e.campeao })),
      ...(s.titulosMundo ?? []),
    ].slice(0, 1200),
  };

  return { state: s, noticias };
}
