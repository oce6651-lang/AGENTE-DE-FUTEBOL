/** Sonhos e objetivos de carreira dos atletas. */
export const SONHOS = [
  "Jogar na Europa",
  "Defender o clube do coração",
  "Vestir a camisa da Seleção",
  "Permanecer perto da família",
  "Tornar-se ídolo de uma torcida",
  "Ganhar muito dinheiro",
  "Ser campeão da Libertadores",
  "Ser campeão da Champions League",
  "Jogar apenas em clubes grandes",
  "Buscar estabilidade e contrato longo",
  "Ser artilheiro de um campeonato nacional",
  "Sair da pobreza e sustentar a família",
] as const;

export type Sonho = (typeof SONHOS)[number];

/** Traços de personalidade que temperam negociações e evolução. */
export const TRACOS = [
  "Humilde", "Generoso", "Esforçado", "Talentoso", "Tímido", "Líder", "Explosivo",
  "Ganancioso", "Profissional", "Indisciplinado", "Ambicioso", "Calmo", "Teimoso", "Leal",
] as const;

export type Traco = (typeof TRACOS)[number];