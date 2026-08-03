import type { ClubPersonality, Division } from "../types";

/** Semente de clube: dados fixos usados para montar o mundo. */
export interface ClubSeed {
  nome: string;
  abrev: string;
  pais: string;
  estado: string;
  cidade: string;
  categoria: Division;
  personalidade: ClubPersonality;
  /** Orçamento em milhares de reais. */
  orcamentoK: number;
  cores: [string, string];
}

type Tupla = [string, string, string, string, string, Division, ClubPersonality, number, string, string];

const T: Tupla[] = [
  // ================= ELITE (Europa) =================
  ["Real Madrid", "RMA", "Espanha", "MAD", "Madri", "Elite", "Imediatista", 1_500_000, "#e8e8e8", "#1b1b1b"],
  ["FC Barcelona", "BAR", "Espanha", "CAT", "Barcelona", "Elite", "Formador", 1_300_000, "#12306b", "#8b1a3a"],
  ["Atlético de Madrid", "ATM", "Espanha", "MAD", "Madri", "Elite", "Tradicional", 700_000, "#c8102e", "#14294b"],
  ["Sevilla FC", "SEV", "Espanha", "AND", "Sevilha", "Elite", "Vitrine", 380_000, "#e6e6e6", "#b3161f"],
  ["Manchester City", "MCI", "Inglaterra", "MAN", "Manchester", "Elite", "Imediatista", 1_800_000, "#6cabdd", "#0b1c2e"],
  ["Manchester United", "MUN", "Inglaterra", "MAN", "Manchester", "Elite", "Tradicional", 1_400_000, "#c8102e", "#1a1a1a"],
  ["Liverpool FC", "LIV", "Inglaterra", "MER", "Liverpool", "Elite", "Imediatista", 1_300_000, "#c8102e", "#2a0a10"],
  ["Arsenal FC", "ARS", "Inglaterra", "LDN", "Londres", "Elite", "Formador", 1_100_000, "#ef0107", "#1b1b1b"],
  ["Chelsea FC", "CHE", "Inglaterra", "LDN", "Londres", "Elite", "Vitrine", 1_200_000, "#034694", "#0a1128"],
  ["AC Milan", "MIL", "Itália", "LOM", "Milão", "Elite", "Tradicional", 750_000, "#a8172b", "#101010"],
  ["Inter de Milão", "INT", "Itália", "LOM", "Milão", "Elite", "Imediatista", 800_000, "#1d3f8f", "#0a1128"],
  ["Juventus", "JUV", "Itália", "PIE", "Turim", "Elite", "Tradicional", 780_000, "#1a1a1a", "#e6e6e6"],
  ["AS Roma", "ROM", "Itália", "LAZ", "Roma", "Elite", "Vitrine", 520_000, "#8e1b2c", "#c8a04a"],
  ["SL Benfica", "BEN", "Portugal", "LIS", "Lisboa", "Elite", "Vitrine", 480_000, "#c8102e", "#1b1b1b"],
  ["FC Porto", "POR", "Portugal", "POR", "Porto", "Elite", "Vitrine", 460_000, "#1f4fa0", "#e6e6e6"],
  ["Sporting CP", "SCP", "Portugal", "LIS", "Lisboa", "Elite", "Formador", 430_000, "#1c8a4a", "#0e2b1b"],
  ["SC Braga", "SCB", "Portugal", "BRA", "Braga", "Elite", "Formador", 210_000, "#b3161f", "#1a1a1a"],
  ["Boca Juniors", "BOC", "Argentina", "BA", "Buenos Aires", "Elite", "Tradicional", 220_000, "#1f4fa0", "#e4b400"],
  ["River Plate", "RIV", "Argentina", "BA", "Buenos Aires", "Elite", "Formador", 240_000, "#e6e6e6", "#c8102e"],
  ["Peñarol", "PEN", "Uruguai", "MO", "Montevidéu", "Elite", "Formador", 90_000, "#e4b400", "#1a1a1a"],

  // ================= SÉRIE A =================
  ["Flamengo", "FLA", "Brasil", "RJ", "Rio de Janeiro", "Serie A", "Imediatista", 520_000, "#c62828", "#1a1a1a"],
  ["Palmeiras", "PAL", "Brasil", "SP", "São Paulo", "Serie A", "Formador", 430_000, "#0f6b3d", "#08210f"],
  ["São Paulo FC", "SPF", "Brasil", "SP", "São Paulo", "Serie A", "Tradicional", 300_000, "#b71c1c", "#101010"],
  ["Corinthians", "COR", "Brasil", "SP", "São Paulo", "Serie A", "Tradicional", 340_000, "#1a1a1a", "#e0e0e0"],
  ["Santos FC", "SAN", "Brasil", "SP", "Santos", "Serie A", "Vitrine", 180_000, "#e6e6e6", "#151515"],
  ["Grêmio FBPA", "GRE", "Brasil", "RS", "Porto Alegre", "Serie A", "Formador", 250_000, "#1f8ecd", "#0b1d2e"],
  ["Internacional", "INR", "Brasil", "RS", "Porto Alegre", "Serie A", "Imediatista", 240_000, "#c8102e", "#2a0a10"],
  ["Atlético Mineiro", "CAM", "Brasil", "MG", "Belo Horizonte", "Serie A", "Imediatista", 320_000, "#1c1c1c", "#3a3a3a"],
  ["Cruzeiro", "CRU", "Brasil", "MG", "Belo Horizonte", "Serie A", "Formador", 230_000, "#1e3f9c", "#0a132b"],
  ["Fluminense", "FLU", "Brasil", "RJ", "Rio de Janeiro", "Serie A", "Formador", 190_000, "#7b1e3a", "#0f2419"],
  ["Botafogo", "BOT", "Brasil", "RJ", "Rio de Janeiro", "Serie A", "Vitrine", 260_000, "#1a1a1a", "#e0e0e0"],
  ["Vasco da Gama", "VAS", "Brasil", "RJ", "Rio de Janeiro", "Serie A", "Tradicional", 200_000, "#1a1a1a", "#c62828"],
  ["Athletico Paranaense", "CAP", "Brasil", "PR", "Curitiba", "Serie A", "Vitrine", 210_000, "#c0392b", "#161616"],
  ["Bahia", "BAH", "Brasil", "BA", "Salvador", "Serie A", "Vitrine", 200_000, "#1565c0", "#0b1c2e"],
  ["Fortaleza", "FOR", "Brasil", "CE", "Fortaleza", "Serie A", "Imediatista", 150_000, "#1e3f9c", "#c62828"],
  ["Bragantino", "BGT", "Brasil", "SP", "Bragança Paulista", "Serie A", "Vitrine", 170_000, "#e0e0e0", "#c62828"],
  ["Cuiabá", "CUI", "Brasil", "MT", "Cuiabá", "Serie A", "Pechincha", 70_000, "#1c8a4a", "#e4b400"],
  ["Juventude", "JUV", "Brasil", "RS", "Caxias do Sul", "Serie A", "Pechincha", 60_000, "#1c8a4a", "#0e2b1b"],
  ["Vitória", "VIT", "Brasil", "BA", "Salvador", "Serie A", "Pechincha", 65_000, "#b3161f", "#1a1a1a"],
  ["Criciúma", "CRI", "Brasil", "SC", "Criciúma", "Serie A", "Pechincha", 55_000, "#e4b400", "#1a1a1a"],

  // ================= SÉRIE B =================
  ["Coritiba", "CFC", "Brasil", "PR", "Curitiba", "Serie B", "Formador", 45_000, "#0f6b3d", "#e0e0e0"],
  ["Goiás", "GOI", "Brasil", "GO", "Goiânia", "Serie B", "Formador", 40_000, "#0f6b3d", "#e0e0e0"],
  ["Atlético Goianiense", "ACG", "Brasil", "GO", "Goiânia", "Serie B", "Pechincha", 38_000, "#c62828", "#1a1a1a"],
  ["Sport Recife", "SPR", "Brasil", "PE", "Recife", "Serie B", "Tradicional", 48_000, "#c62828", "#1a1a1a"],
  ["Náutico", "NAU", "Brasil", "PE", "Recife", "Serie B", "Formador", 24_000, "#c62828", "#e0e0e0"],
  ["Santa Cruz", "STC", "Brasil", "PE", "Recife", "Serie B", "Tradicional", 18_000, "#b0202a", "#1a1a1a"],
  ["Ceará SC", "CEA", "Brasil", "CE", "Fortaleza", "Serie B", "Imediatista", 42_000, "#1a1a1a", "#e0e0e0"],
  ["Avaí", "AVA", "Brasil", "SC", "Florianópolis", "Serie B", "Tradicional", 26_000, "#1f5fb0", "#0b1a2e"],
  ["Chapecoense", "CHA", "Brasil", "SC", "Chapecó", "Serie B", "Formador", 22_000, "#1c8a4a", "#e0e0e0"],
  ["Ponte Preta", "PON", "Brasil", "SP", "Campinas", "Serie B", "Formador", 22_000, "#2b2b2b", "#c9c9c9"],
  ["Guarani", "GUR", "Brasil", "SP", "Campinas", "Serie B", "Pechincha", 18_000, "#1b7a45", "#0d2419"],
  ["Novorizontino", "NOV", "Brasil", "SP", "Novo Horizonte", "Serie B", "Vitrine", 20_000, "#e4b400", "#1a1a1a"],
  ["Mirassol", "MIR", "Brasil", "SP", "São José do Rio Preto", "Serie B", "Pechincha", 19_000, "#e4b400", "#1c8a4a"],
  ["Botafogo-SP", "BSP", "Brasil", "SP", "Ribeirão Preto", "Serie B", "Pechincha", 14_000, "#c62828", "#1a1a1a"],
  ["Caxias", "CAX", "Brasil", "RS", "Caxias do Sul", "Serie B", "Vitrine", 20_000, "#d9a441", "#20160a"],
  ["Brasil de Pelotas", "BRP", "Brasil", "RS", "Pelotas", "Serie B", "Tradicional", 12_000, "#c62828", "#1b1b1b"],
  ["Paysandu", "PAY", "Brasil", "PA", "Belém", "Serie B", "Tradicional", 20_000, "#1e3f9c", "#e0e0e0"],
  ["Remo", "REM", "Brasil", "PA", "Belém", "Serie B", "Pechincha", 18_000, "#1a1a1a", "#1f5fb0"],
  ["CRB", "CRB", "Brasil", "AL", "Maceió", "Serie B", "Pechincha", 16_000, "#c62828", "#e0e0e0"],
  ["Vila Nova", "VNO", "Brasil", "GO", "Goiânia", "Serie B", "Formador", 17_000, "#c62828", "#1a1a1a"],

  // ================= SÉRIE C =================
  ["Figueirense", "FIG", "Brasil", "SC", "Florianópolis", "Serie C", "Pechincha", 8_000, "#2f2f2f", "#d0d0d0"],
  ["Joinville", "JEC", "Brasil", "SC", "Joinville", "Serie C", "Formador", 6_000, "#1f5fb0", "#e0e0e0"],
  ["Londrina", "LON", "Brasil", "PR", "Londrina", "Serie C", "Formador", 7_000, "#1e4fa0", "#0a1428"],
  ["Operário-PR", "OPE", "Brasil", "PR", "Ponta Grossa", "Serie C", "Pechincha", 6_500, "#1a1a1a", "#e0e0e0"],
  ["Ypiranga", "YPI", "Brasil", "RS", "Erechim", "Serie C", "Vitrine", 6_000, "#1a7f5a", "#0d221a"],
  ["São José-RS", "SJO", "Brasil", "RS", "Porto Alegre", "Serie C", "Formador", 4_500, "#c62828", "#1a1a1a"],
  ["São Luiz", "SLZ", "Brasil", "RS", "Ijuí", "Serie C", "Formador", 5_000, "#2b6cb0", "#101a26"],
  ["Volta Redonda", "VRE", "Brasil", "RJ", "Volta Redonda", "Serie C", "Vitrine", 6_500, "#1d7f4c", "#f0c419"],
  ["Botafogo-PB", "BPB", "Brasil", "PB", "João Pessoa", "Serie C", "Pechincha", 5_500, "#c62828", "#1a1a1a"],
  ["Treze", "TRE", "Brasil", "PB", "Campina Grande", "Serie C", "Pechincha", 3_800, "#1a1a1a", "#e0e0e0"],
  ["ABC", "ABC", "Brasil", "RN", "Natal", "Serie C", "Tradicional", 6_000, "#1a1a1a", "#e0e0e0"],
  ["América-RN", "AME", "Brasil", "RN", "Natal", "Serie C", "Pechincha", 5_000, "#c62828", "#1a1a1a"],
  ["Sampaio Corrêa", "SAM", "Brasil", "MA", "São Luís", "Serie C", "Formador", 5_200, "#c62828", "#e4b400"],
  ["Ferroviário", "FER", "Brasil", "CE", "Fortaleza", "Serie C", "Pechincha", 4_800, "#c62828", "#1a1a1a"],
  ["Confiança", "CON", "Brasil", "SE", "Aracaju", "Serie C", "Pechincha", 4_200, "#1e3f9c", "#e0e0e0"],
  ["Manaus FC", "MAN", "Brasil", "AM", "Manaus", "Serie C", "Formador", 4_000, "#1c8a4a", "#e0e0e0"],
  ["Águia de Marabá", "AGU", "Brasil", "PA", "Marabá", "Serie C", "Pechincha", 3_200, "#1f5fb0", "#e4b400"],
  ["Tombense", "TOM", "Brasil", "MG", "Varginha", "Serie C", "Vitrine", 5_800, "#1c8a4a", "#e0e0e0"],
  ["Athletic Club", "ATH", "Brasil", "MG", "Juiz de Fora", "Serie C", "Formador", 4_600, "#1a1a1a", "#e4b400"],
  ["Ituano", "ITU", "Brasil", "SP", "Sorocaba", "Serie C", "Formador", 6_200, "#c62828", "#1a1a1a"],

  // ================= SÉRIE D =================
  ["Novo Hamburgo", "NHA", "Brasil", "RS", "Novo Hamburgo", "Serie D", "Pechincha", 3_000, "#c0392b", "#1a0f0e"],
  ["Aimoré", "AIM", "Brasil", "RS", "São Leopoldo", "Serie D", "Formador", 1_600, "#2f855a", "#11251a"],
  ["Guarany de Bagé", "GBA", "Brasil", "RS", "Bagé", "Serie D", "Pechincha", 1_200, "#2d6a9f", "#0c1a26"],
  ["Esportivo", "ESP", "Brasil", "RS", "Bento Gonçalves", "Serie D", "Formador", 1_500, "#1f7a4d", "#0c221a"],
  ["Gaúcho de Passo Fundo", "GPF", "Brasil", "RS", "Passo Fundo", "Serie D", "Pechincha", 1_100, "#1f5fb0", "#e4b400"],
  ["Cianorte", "CIA", "Brasil", "PR", "Cianorte", "Serie D", "Formador", 2_400, "#2b6cb0", "#1a1a1a"],
  ["Maringá FC", "MFC", "Brasil", "PR", "Maringá", "Serie D", "Vitrine", 2_800, "#c62828", "#1a1a1a"],
  ["FC Cascavel", "CAS", "Brasil", "PR", "Cascavel", "Serie D", "Pechincha", 2_200, "#1c8a4a", "#e0e0e0"],
  ["Marcílio Dias", "MDI", "Brasil", "SC", "Itajaí", "Serie D", "Pechincha", 1_900, "#1f5fb0", "#c62828"],
  ["Brusque", "BRU", "Brasil", "SC", "Blumenau", "Serie D", "Formador", 3_400, "#1a1a1a", "#e4b400"],
  ["Portuguesa", "POT", "Brasil", "SP", "São Paulo", "Serie D", "Tradicional", 3_600, "#c62828", "#1c8a4a"],
  ["São Bernardo FC", "SBE", "Brasil", "SP", "São Bernardo do Campo", "Serie D", "Formador", 3_100, "#e4b400", "#1a1a1a"],
  ["Inter de Limeira", "ILI", "Brasil", "SP", "Campinas", "Serie D", "Pechincha", 2_000, "#1f5fb0", "#e0e0e0"],
  ["Nova Iguaçu", "NIG", "Brasil", "RJ", "Nova Iguaçu", "Serie D", "Formador", 2_100, "#e4b400", "#1f5fb0"],
  ["Boavista-RJ", "BOA", "Brasil", "RJ", "Niterói", "Serie D", "Pechincha", 1_700, "#1f5fb0", "#e0e0e0"],
  ["Democrata", "DEM", "Brasil", "MG", "Montes Claros", "Serie D", "Pechincha", 1_300, "#1c8a4a", "#e0e0e0"],
  ["Anápolis", "ANA", "Brasil", "GO", "Anápolis", "Serie D", "Pechincha", 1_400, "#1f5fb0", "#e4b400"],
  ["Real Ariquemes", "RAR", "Brasil", "RO", "Ariquemes", "Serie D", "Formador", 900, "#1c8a4a", "#1a1a1a"],
  ["Águia Negra", "ANE", "Brasil", "MS", "Dourados", "Serie D", "Pechincha", 950, "#1a1a1a", "#c62828"],
  ["Porto Velho EC", "PVE", "Brasil", "RO", "Porto Velho", "Serie D", "Pechincha", 850, "#1f5fb0", "#e0e0e0"],

  // ================= AMADOR / REGIONAL (muitos clubes pequenos) =================
  ["União Frederiquense", "UFR", "Brasil", "RS", "Frederico Westphalen", "Amador", "Vitrine", 350, "#d4a017", "#1a1408"],
  ["Esportivo de Três Passos", "ETP", "Brasil", "RS", "Três Passos", "Amador", "Formador", 260, "#1c8a4a", "#0e2b1b"],
  ["Grêmio Santamariense", "GSM", "Brasil", "RS", "Santa Maria", "Amador", "Formador", 300, "#1f8ecd", "#0b1d2e"],
  ["Riograndense", "RGR", "Brasil", "RS", "Rio Grande", "Amador", "Pechincha", 240, "#c62828", "#e0e0e0"],
  ["Uruguaiana AC", "UAC", "Brasil", "RS", "Uruguaiana", "Amador", "Pechincha", 210, "#1f5fb0", "#e4b400"],
  ["Gravataí EC", "GEC", "Brasil", "RS", "Gravataí", "Amador", "Formador", 280, "#1c8a4a", "#e0e0e0"],
  ["Canoas SC", "CSC", "Brasil", "RS", "Canoas", "Amador", "Vitrine", 320, "#1a1a1a", "#e4b400"],
  ["Santa Cruz do Sul FC", "SCS", "Brasil", "RS", "Santa Cruz do Sul", "Amador", "Pechincha", 190, "#c62828", "#1a1a1a"],
  ["Ijuí Atlético", "IJA", "Brasil", "RS", "Ijuí", "Amador", "Formador", 230, "#1f5fb0", "#e0e0e0"],
  ["Bagé Atlético", "BGA", "Brasil", "RS", "Bagé", "Amador", "Pechincha", 180, "#7d3c98", "#180d22"],
  ["Guarulhos EC", "GUE", "Brasil", "SP", "Guarulhos", "Amador", "Formador", 340, "#1c8a4a", "#1a1a1a"],
  ["Osasco Audax", "OSA", "Brasil", "SP", "Osasco", "Amador", "Formador", 420, "#1f5fb0", "#e0e0e0"],
  ["Araraquara FC", "ARA", "Brasil", "SP", "Araraquara", "Amador", "Pechincha", 260, "#c62828", "#e4b400"],
  ["Sorocaba AC", "SOA", "Brasil", "SP", "Sorocaba", "Amador", "Vitrine", 300, "#1a1a1a", "#e0e0e0"],
  ["Duque de Caxias FC", "DCX", "Brasil", "RJ", "Duque de Caxias", "Amador", "Pechincha", 250, "#1f5fb0", "#c62828"],
  ["Campos Atlético", "CPA", "Brasil", "RJ", "Campos dos Goytacazes", "Amador", "Formador", 220, "#1c8a4a", "#e4b400"],
  ["Contagem EC", "CTG", "Brasil", "MG", "Contagem", "Amador", "Pechincha", 200, "#c62828", "#1a1a1a"],
  ["Uberlândia Base", "UBB", "Brasil", "MG", "Uberlândia", "Amador", "Formador", 310, "#1c8a4a", "#e0e0e0"],
  ["Caruaru City", "CCT", "Brasil", "PE", "Caruaru", "Amador", "Vitrine", 230, "#e4b400", "#1a1a1a"],
  ["Petrolina FC", "PET", "Brasil", "PE", "Petrolina", "Amador", "Pechincha", 190, "#1f5fb0", "#e0e0e0"],
  ["Sobral EC", "SOB", "Brasil", "CE", "Sobral", "Amador", "Formador", 210, "#1c8a4a", "#e0e0e0"],
  ["Feira de Santana AC", "FSA", "Brasil", "BA", "Feira de Santana", "Amador", "Pechincha", 200, "#c62828", "#e4b400"],
  ["Imperatriz AC", "IMP", "Brasil", "MA", "Imperatriz", "Amador", "Pechincha", 170, "#1f5fb0", "#1a1a1a"],
  ["Palmas Base", "PLB", "Brasil", "TO", "Palmas", "Amador", "Formador", 160, "#1c8a4a", "#e4b400"],
  ["Boa Vista EC", "BVE", "Brasil", "RR", "Boa Vista", "Amador", "Pechincha", 140, "#e4b400", "#1a1a1a"],
  ["Macapá FC", "MCP", "Brasil", "AP", "Macapá", "Amador", "Pechincha", 150, "#1f5fb0", "#e0e0e0"],
  ["Rio Branco Base", "RBB", "Brasil", "AC", "Rio Branco", "Amador", "Formador", 145, "#1c8a4a", "#e0e0e0"],
  ["Brasília FC", "BSB", "Brasil", "DF", "Brasília", "Amador", "Vitrine", 380, "#1f5fb0", "#e4b400"],
  ["Vila Velha AC", "VVA", "Brasil", "ES", "Vila Velha", "Amador", "Pechincha", 180, "#c62828", "#1a1a1a"],
  ["Dourados AC", "DAC", "Brasil", "MS", "Dourados", "Amador", "Pechincha", 160, "#1c8a4a", "#1a1a1a"],

  // ================= EXPANSÃO — ELITE INTERNACIONAL =================
  ["Bayern de Munique", "BAY", "Espanha", "MAD", "Munique", "Elite", "Imediatista", 1_600_000, "#c8102e", "#14294b"],
  ["Paris Saint-Germain", "PSG", "Portugal", "LIS", "Paris", "Elite", "Vitrine", 1_500_000, "#0b1d4d", "#c8102e"],
  ["Ajax", "AJX", "Portugal", "POR", "Amsterdã", "Elite", "Formador", 260_000, "#e6e6e6", "#c8102e"],
  ["Villarreal CF", "VIL", "Espanha", "AND", "Villarreal", "Elite", "Formador", 250_000, "#e4b400", "#1b3f8f"],
  ["Real Betis", "BET", "Espanha", "AND", "Sevilha", "Elite", "Tradicional", 230_000, "#1c8a4a", "#e6e6e6"],
  ["Athletic Bilbao", "ATB", "Espanha", "MAD", "Bilbao", "Elite", "Formador", 240_000, "#c8102e", "#e6e6e6"],
  ["Napoli", "NAP", "Itália", "LAZ", "Nápoles", "Elite", "Imediatista", 520_000, "#1f8ecd", "#0b1d2e"],
  ["Atalanta", "ATA", "Itália", "LOM", "Bérgamo", "Elite", "Formador", 340_000, "#1b3f8f", "#1a1a1a"],
  ["Tottenham", "TOT", "Inglaterra", "LDN", "Londres", "Elite", "Vitrine", 900_000, "#e6e6e6", "#0b1d4d"],
  ["Newcastle United", "NEW", "Inglaterra", "MAN", "Newcastle", "Elite", "Imediatista", 800_000, "#1a1a1a", "#e6e6e6"],
  ["Vitória de Guimarães", "VGU", "Portugal", "BRA", "Guimarães", "Elite", "Formador", 120_000, "#e6e6e6", "#1a1a1a"],
  ["Estudiantes", "EST", "Argentina", "BA", "La Plata", "Elite", "Formador", 90_000, "#c8102e", "#e6e6e6"],
  ["Racing Club", "RAC", "Argentina", "BA", "Avellaneda", "Elite", "Tradicional", 110_000, "#6cabdd", "#e6e6e6"],
  ["Nacional", "NAC", "Uruguai", "MO", "Montevidéu", "Elite", "Formador", 85_000, "#e6e6e6", "#1b3f8f"],

  // ================= EXPANSÃO — SÉRIE B/C/D =================
  ["América-MG", "AMG", "Brasil", "MG", "Belo Horizonte", "Serie B", "Formador", 44_000, "#1c7a3f", "#1a1a1a"],
  ["Amazonas FC", "AMZ", "Brasil", "AM", "Manaus", "Serie B", "Pechincha", 15_000, "#1c8a4a", "#e4b400"],
  ["Operário Ferroviário", "OFE", "Brasil", "PR", "Ponta Grossa", "Serie B", "Pechincha", 16_000, "#1a1a1a", "#e0e0e0"],
  ["Athletic-MG", "ATM2", "Brasil", "MG", "São João del-Rei", "Serie C", "Formador", 4_400, "#1a1a1a", "#e4b400"],
  ["Floresta EC", "FLO", "Brasil", "CE", "Fortaleza", "Serie C", "Pechincha", 3_900, "#1c8a4a", "#1a1a1a"],
  ["Aparecidense", "APA", "Brasil", "GO", "Aparecida de Goiânia", "Serie C", "Pechincha", 3_700, "#1c8a4a", "#e0e0e0"],
  ["Caxias do Sul Base", "CXB", "Brasil", "RS", "Caxias do Sul", "Serie C", "Formador", 4_100, "#e4b400", "#1a1a1a"],
  ["Pelotas EC", "PEL", "Brasil", "RS", "Pelotas", "Serie D", "Formador", 1_400, "#1a1a1a", "#e4b400"],
  ["Avenida", "AVE", "Brasil", "RS", "Santa Cruz do Sul", "Serie D", "Pechincha", 1_100, "#c62828", "#e0e0e0"],
  ["Monsoon FC", "MON", "Brasil", "RS", "Porto Alegre", "Serie D", "Vitrine", 1_000, "#1f8ecd", "#1a1a1a"],
  ["Grêmio Anápolis", "GAN", "Brasil", "GO", "Anápolis", "Serie D", "Pechincha", 1_050, "#1f5fb0", "#e0e0e0"],
  ["União Rondonópolis", "URO", "Brasil", "MT", "Rondonópolis", "Serie D", "Pechincha", 900, "#c62828", "#1a1a1a"],
  ["Trem DC", "TRD", "Brasil", "AP", "Macapá", "Serie D", "Pechincha", 700, "#1f5fb0", "#e4b400"],
  ["Fast Clube", "FAS", "Brasil", "AM", "Manaus", "Serie D", "Formador", 800, "#c62828", "#e0e0e0"],
  ["Sousa EC", "SOU", "Brasil", "PB", "Sousa", "Serie D", "Pechincha", 780, "#1c8a4a", "#e0e0e0"],

  // ================= EXPANSÃO — AMADOR / BASE =================
  ["Cruzeiro-RS", "CRS", "Brasil", "RS", "Porto Alegre", "Amador", "Formador", 200, "#1e3f9c", "#e0e0e0"],
  ["Lajeadense", "LAJ", "Brasil", "RS", "Lajeado", "Amador", "Pechincha", 170, "#1c8a4a", "#e0e0e0"],
  ["Veranópolis", "VER", "Brasil", "RS", "Veranópolis", "Amador", "Formador", 240, "#1f5fb0", "#e4b400"],
  ["São Gabriel AC", "SGA", "Brasil", "RS", "São Gabriel", "Amador", "Pechincha", 150, "#c62828", "#1a1a1a"],
  ["Taubaté EC", "TAU", "Brasil", "SP", "Taubaté", "Amador", "Formador", 290, "#1f5fb0", "#e0e0e0"],
  ["Marília AC", "MAC", "Brasil", "SP", "Marília", "Amador", "Pechincha", 210, "#1c8a4a", "#e4b400"],
  ["Bangu AC", "BAN", "Brasil", "RJ", "Rio de Janeiro", "Amador", "Tradicional", 230, "#c62828", "#e0e0e0"],
  ["Serra Macaense", "SMA", "Brasil", "RJ", "Macaé", "Amador", "Pechincha", 160, "#1f5fb0", "#1a1a1a"],
  ["Betim Base", "BET2", "Brasil", "MG", "Betim", "Amador", "Formador", 195, "#1c8a4a", "#e0e0e0"],
  ["Juazeiro Social", "JZS", "Brasil", "BA", "Juazeiro", "Amador", "Pechincha", 145, "#e4b400", "#1a1a1a"],
  ["Campina FC", "CFB", "Brasil", "PB", "Campina Grande", "Amador", "Formador", 175, "#1f5fb0", "#e0e0e0"],
  ["Rio Verde EC", "RVE", "Brasil", "GO", "Rio Verde", "Amador", "Pechincha", 155, "#1c8a4a", "#1a1a1a"],
];

export const CLUB_SEEDS: ClubSeed[] = T.map(t => ({
  nome: t[0], abrev: t[1], pais: t[2], estado: t[3], cidade: t[4],
  categoria: t[5], personalidade: t[6], orcamentoK: t[7], cores: [t[8], t[9]],
}));

/** Clubes de coração possíveis para quem nasce em determinado estado. */
export function clubesDaRegiao(estado: string): ClubSeed[] {
  const doEstado = CLUB_SEEDS.filter(c => c.estado === estado && c.pais === "Brasil");
  return doEstado.length ? doEstado : CLUB_SEEDS.filter(c => c.pais === "Brasil");
}