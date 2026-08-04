import type { Attributes, Position } from "./types";

/**
 * Sistema completo de atributos, inspirado na profundidade do Football Manager.
 * Cada atributo vai de 1 a 100 e o Overall é calculado com pesos por posição.
 */

export const ATRIBUTOS_TECNICOS = [
  ["finalizacao", "Finalização"],
  ["passeCurto", "Passe curto"],
  ["passeLongo", "Passe longo"],
  ["cruzamento", "Cruzamento"],
  ["drible", "Drible"],
  ["controleBola", "Controle de bola"],
  ["cabeceio", "Cabeceio"],
  ["marcacao", "Marcação"],
  ["desarme", "Desarme"],
  ["tecnica", "Técnica"],
  ["bolaParada", "Bola parada"],
  ["penaltis", "Pênaltis"],
] as const;

export const ATRIBUTOS_FISICOS = [
  ["velocidade", "Velocidade"],
  ["aceleracao", "Aceleração"],
  ["agilidade", "Agilidade"],
  ["resistencia", "Resistência"],
  ["forca", "Força"],
  ["impulsao", "Impulsão"],
  ["equilibrio", "Equilíbrio"],
] as const;

export const ATRIBUTOS_MENTAIS = [
  ["determinacao", "Determinação"],
  ["lideranca", "Liderança"],
  ["posicionamento", "Posicionamento"],
  ["antecipacao", "Antecipação"],
  ["concentracao", "Concentração"],
  ["decisao", "Decisão"],
  ["compostura", "Compostura"],
  ["visaoJogo", "Visão de jogo"],
  ["trabalhoEquipe", "Trabalho em equipe"],
  ["coragem", "Coragem"],
  ["inteligenciaTatica", "Inteligência tática"],
] as const;

export const ATRIBUTOS_GOLEIRO = [
  ["reflexos", "Reflexos"],
  ["saidaGol", "Saída de gol"],
  ["jogoAereo", "Jogo aéreo"],
  ["reposicao", "Reposição"],
  ["maoAmao", "Mão a mão"],
] as const;

export type AttrKey = keyof Attributes;

/** Grupos usados pela interface do perfil do atleta. */
export const GRUPOS_ATRIBUTOS: { titulo: string; itens: readonly (readonly [string, string])[] }[] = [
  { titulo: "Técnicos", itens: ATRIBUTOS_TECNICOS },
  { titulo: "Físicos", itens: ATRIBUTOS_FISICOS },
  { titulo: "Mentais", itens: ATRIBUTOS_MENTAIS },
];

/** Pesos por posição. Só os atributos listados contam para o Overall. */
const PESOS: Record<Position, Partial<Record<AttrKey, number>>> = {
  GOL: { reflexos: 5, maoAmao: 4, posicionamento: 4, jogoAereo: 3, saidaGol: 3, reposicao: 2, concentracao: 3, compostura: 2, agilidade: 3, impulsao: 2 },
  ZAG: { marcacao: 5, desarme: 4, cabeceio: 4, forca: 4, posicionamento: 4, antecipacao: 3, concentracao: 3, inteligenciaTatica: 3, passeCurto: 2, coragem: 2, velocidade: 2 },
  LD: { marcacao: 3, desarme: 3, cruzamento: 4, resistencia: 4, velocidade: 4, aceleracao: 3, posicionamento: 3, trabalhoEquipe: 2, controleBola: 2, passeCurto: 2 },
  LE: { marcacao: 3, desarme: 3, cruzamento: 4, resistencia: 4, velocidade: 4, aceleracao: 3, posicionamento: 3, trabalhoEquipe: 2, controleBola: 2, passeCurto: 2 },
  VOL: { desarme: 4, marcacao: 4, passeCurto: 4, posicionamento: 4, inteligenciaTatica: 4, antecipacao: 3, resistencia: 3, forca: 3, trabalhoEquipe: 3, compostura: 2 },
  MC: { passeCurto: 5, passeLongo: 3, visaoJogo: 4, controleBola: 4, tecnica: 3, decisao: 3, resistencia: 3, inteligenciaTatica: 3, compostura: 3, desarme: 2 },
  MEI: { passeCurto: 4, visaoJogo: 5, drible: 4, tecnica: 4, controleBola: 4, decisao: 3, bolaParada: 3, finalizacao: 3, agilidade: 2, compostura: 2 },
  PD: { drible: 5, velocidade: 5, aceleracao: 4, cruzamento: 4, tecnica: 3, agilidade: 3, finalizacao: 3, controleBola: 3, decisao: 2 },
  PE: { drible: 5, velocidade: 5, aceleracao: 4, cruzamento: 4, tecnica: 3, agilidade: 3, finalizacao: 3, controleBola: 3, decisao: 2 },
  SA: { finalizacao: 5, drible: 4, controleBola: 4, visaoJogo: 3, tecnica: 3, antecipacao: 3, compostura: 3, aceleracao: 3, decisao: 3 },
  ATA: { finalizacao: 6, cabeceio: 4, posicionamento: 4, antecipacao: 3, forca: 3, aceleracao: 3, velocidade: 3, compostura: 3, controleBola: 2, impulsao: 2 },
};

/** Overall ponderado pela posição — nunca é a simples média dos atributos. */
export function calcularOverall(a: Attributes, posicao: Position): number {
  const pesos = PESOS[posicao];
  let soma = 0;
  let total = 0;
  for (const [k, peso] of Object.entries(pesos) as [AttrKey, number][]) {
    soma += (a[k] ?? 1) * peso;
    total += peso;
  }
  return Math.max(1, Math.min(99, Math.round(soma / Math.max(1, total))));
}

function clamp(v: number) {
  return Math.max(1, Math.min(99, Math.round(v)));
}

/** Bônus naturais por posição — o perfil físico e técnico muda conforme a função. */
const PERFIL: Record<Position, Partial<Record<AttrKey, number>>> = {
  GOL: { reflexos: 14, maoAmao: 12, saidaGol: 10, jogoAereo: 10, reposicao: 8, finalizacao: -35, drible: -30, marcacao: -20, velocidade: -12 },
  ZAG: { marcacao: 12, desarme: 12, cabeceio: 12, forca: 10, finalizacao: -18, drible: -14, velocidade: -5 },
  LD: { cruzamento: 10, resistencia: 10, velocidade: 8, marcacao: 5, finalizacao: -12, cabeceio: -6 },
  LE: { cruzamento: 10, resistencia: 10, velocidade: 8, marcacao: 5, finalizacao: -12, cabeceio: -6 },
  VOL: { desarme: 12, marcacao: 10, posicionamento: 8, forca: 6, finalizacao: -12, drible: -8 },
  MC: { passeCurto: 12, visaoJogo: 8, resistencia: 8, controleBola: 6, cabeceio: -6 },
  MEI: { visaoJogo: 14, drible: 10, tecnica: 10, passeCurto: 8, bolaParada: 8, marcacao: -14, forca: -6 },
  PD: { drible: 14, velocidade: 12, aceleracao: 12, cruzamento: 10, marcacao: -16, cabeceio: -10, forca: -6 },
  PE: { drible: 14, velocidade: 12, aceleracao: 12, cruzamento: 10, marcacao: -16, cabeceio: -10, forca: -6 },
  SA: { finalizacao: 12, drible: 10, controleBola: 8, visaoJogo: 6, marcacao: -18, desarme: -16 },
  ATA: { finalizacao: 16, posicionamento: 8, cabeceio: 8, antecipacao: 6, marcacao: -20, desarme: -18, passeLongo: -8 },
};

const TODAS: AttrKey[] = [
  ...ATRIBUTOS_TECNICOS.map(x => x[0]),
  ...ATRIBUTOS_FISICOS.map(x => x[0]),
  ...ATRIBUTOS_MENTAIS.map(x => x[0]),
  ...ATRIBUTOS_GOLEIRO.map(x => x[0]),
] as AttrKey[];

/**
 * Gera a ficha completa de atributos em torno de um nível-base, respeitando o
 * perfil da posição. O Overall real é recalculado a partir da ficha.
 */
export function gerarAtributos(base: number, posicao: Position): Attributes {
  const perfil = PERFIL[posicao];
  const a = {} as Attributes;
  for (const k of TODAS) {
    a[k] = clamp(base + (perfil[k] ?? 0) * (base / 70) + (Math.random() * 20 - 10));
  }
  // Resumos usados pelas telas compactas e por sistemas antigos.
  a.fisico = resumoFisico(a);
  a.mental = resumoMental(a);
  return a;
}

export function resumoFisico(a: Attributes): number {
  const itens = ATRIBUTOS_FISICOS.map(x => a[x[0] as AttrKey] ?? 1);
  return Math.round(itens.reduce((s, v) => s + v, 0) / itens.length);
}

export function resumoMental(a: Attributes): number {
  const itens = ATRIBUTOS_MENTAIS.map(x => a[x[0] as AttrKey] ?? 1);
  return Math.round(itens.reduce((s, v) => s + v, 0) / itens.length);
}

/** Ajusta a ficha inteira quando o atleta evolui (ou regride). */
export function evoluirAtributos(a: Attributes, delta: number, posicao: Position): Attributes {
  const pesos = PESOS[posicao];
  const novo: Attributes = { ...a };
  for (const k of TODAS) {
    const relevante = (pesos[k] ?? 0) > 0;
    const ganho = delta * (relevante ? 1.4 : 0.5) * (0.5 + Math.random());
    novo[k] = clamp((novo[k] ?? 1) + ganho);
  }
  novo.fisico = resumoFisico(novo);
  novo.mental = resumoMental(novo);
  return novo;
}
