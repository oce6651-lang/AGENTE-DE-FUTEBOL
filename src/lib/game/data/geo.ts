/** Base geográfica dinâmica: país -> estados -> cidades. */
export interface StateInfo {
  sigla: string;
  nome: string;
  cidades: string[];
}

export interface CountryInfo {
  nome: string;
  nacionalidade: string;
  estados: StateInfo[];
}

export const PAISES: CountryInfo[] = [
  {
    nome: "Brasil",
    nacionalidade: "Brasileira",
    estados: [
      { sigla: "AC", nome: "Acre", cidades: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"] },
      { sigla: "AL", nome: "Alagoas", cidades: ["Maceió", "Arapiraca", "Palmeira dos Índios"] },
      { sigla: "AM", nome: "Amazonas", cidades: ["Manaus", "Parintins", "Itacoatiara"] },
      { sigla: "AP", nome: "Amapá", cidades: ["Macapá", "Santana", "Laranjal do Jari"] },
      { sigla: "BA", nome: "Bahia", cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Ilhéus", "Juazeiro"] },
      { sigla: "CE", nome: "Ceará", cidades: ["Fortaleza", "Juazeiro do Norte", "Sobral", "Maracanaú"] },
      { sigla: "DF", nome: "Distrito Federal", cidades: ["Brasília", "Taguatinga", "Ceilândia"] },
      { sigla: "ES", nome: "Espírito Santo", cidades: ["Vitória", "Vila Velha", "Cachoeiro de Itapemirim"] },
      { sigla: "GO", nome: "Goiás", cidades: ["Goiânia", "Anápolis", "Aparecida de Goiânia", "Rio Verde"] },
      { sigla: "MA", nome: "Maranhão", cidades: ["São Luís", "Imperatriz", "Caxias"] },
      { sigla: "MG", nome: "Minas Gerais", cidades: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem", "Montes Claros", "Varginha"] },
      { sigla: "MS", nome: "Mato Grosso do Sul", cidades: ["Campo Grande", "Dourados", "Três Lagoas"] },
      { sigla: "MT", nome: "Mato Grosso", cidades: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop"] },
      { sigla: "PA", nome: "Pará", cidades: ["Belém", "Ananindeua", "Santarém", "Marabá"] },
      { sigla: "PB", nome: "Paraíba", cidades: ["João Pessoa", "Campina Grande", "Patos"] },
      { sigla: "PE", nome: "Pernambuco", cidades: ["Recife", "Caruaru", "Olinda", "Petrolina"] },
      { sigla: "PI", nome: "Piauí", cidades: ["Teresina", "Parnaíba", "Picos"] },
      { sigla: "PR", nome: "Paraná", cidades: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Cianorte"] },
      { sigla: "RJ", nome: "Rio de Janeiro", cidades: ["Rio de Janeiro", "Niterói", "Volta Redonda", "Campos dos Goytacazes", "Duque de Caxias", "Nova Iguaçu"] },
      { sigla: "RN", nome: "Rio Grande do Norte", cidades: ["Natal", "Mossoró", "Parnamirim"] },
      {
        sigla: "RS", nome: "Rio Grande do Sul",
        cidades: [
          "Porto Alegre", "Caxias do Sul", "Pelotas", "Santa Maria", "Novo Hamburgo", "São Leopoldo",
          "Bagé", "Ijuí", "Erechim", "Passo Fundo", "Três Passos", "Santa Cruz do Sul",
          "Bento Gonçalves", "Frederico Westphalen", "Rio Grande", "Uruguaiana", "Gravataí", "Canoas",
        ],
      },
      { sigla: "RO", nome: "Rondônia", cidades: ["Porto Velho", "Ji-Paraná", "Ariquemes"] },
      { sigla: "RR", nome: "Roraima", cidades: ["Boa Vista", "Rorainópolis"] },
      { sigla: "SC", nome: "Santa Catarina", cidades: ["Florianópolis", "Joinville", "Blumenau", "Chapecó", "Criciúma", "Itajaí"] },
      { sigla: "SE", nome: "Sergipe", cidades: ["Aracaju", "Nossa Senhora do Socorro", "Itabaiana"] },
      {
        sigla: "SP", nome: "São Paulo",
        cidades: [
          "São Paulo", "Campinas", "Santos", "Ribeirão Preto", "São Bernardo do Campo", "Sorocaba",
          "Bragança Paulista", "São José do Rio Preto", "Araraquara", "Guarulhos", "Osasco", "Novo Horizonte",
        ],
      },
      { sigla: "TO", nome: "Tocantins", cidades: ["Palmas", "Araguaína", "Gurupi"] },
    ],
  },
  {
    nome: "Portugal",
    nacionalidade: "Portuguesa",
    estados: [
      { sigla: "LIS", nome: "Lisboa", cidades: ["Lisboa", "Amadora", "Sintra"] },
      { sigla: "POR", nome: "Porto", cidades: ["Porto", "Vila Nova de Gaia", "Matosinhos"] },
      { sigla: "BRA", nome: "Braga", cidades: ["Braga", "Guimarães", "Barcelos"] },
    ],
  },
  {
    nome: "Argentina",
    nacionalidade: "Argentina",
    estados: [
      { sigla: "BA", nome: "Buenos Aires", cidades: ["Buenos Aires", "La Plata", "Avellaneda"] },
      { sigla: "SF", nome: "Santa Fé", cidades: ["Rosário", "Santa Fé"] },
      { sigla: "CB", nome: "Córdoba", cidades: ["Córdoba", "Río Cuarto"] },
    ],
  },
  {
    nome: "Uruguai",
    nacionalidade: "Uruguaia",
    estados: [
      { sigla: "MO", nome: "Montevidéu", cidades: ["Montevidéu"] },
      { sigla: "MA", nome: "Maldonado", cidades: ["Maldonado", "Punta del Este"] },
    ],
  },
  {
    nome: "Espanha",
    nacionalidade: "Espanhola",
    estados: [
      { sigla: "MAD", nome: "Madri", cidades: ["Madri", "Getafe", "Alcalá de Henares"] },
      { sigla: "CAT", nome: "Catalunha", cidades: ["Barcelona", "Girona", "Tarragona"] },
      { sigla: "AND", nome: "Andaluzia", cidades: ["Sevilha", "Málaga", "Granada"] },
    ],
  },
  {
    nome: "Itália",
    nacionalidade: "Italiana",
    estados: [
      { sigla: "LOM", nome: "Lombardia", cidades: ["Milão", "Bérgamo", "Brescia"] },
      { sigla: "LAZ", nome: "Lácio", cidades: ["Roma", "Latina"] },
      { sigla: "PIE", nome: "Piemonte", cidades: ["Turim", "Novara"] },
    ],
  },
  {
    nome: "Inglaterra",
    nacionalidade: "Inglesa",
    estados: [
      { sigla: "LDN", nome: "Grande Londres", cidades: ["Londres", "Croydon"] },
      { sigla: "MAN", nome: "Grande Manchester", cidades: ["Manchester", "Salford"] },
      { sigla: "MER", nome: "Merseyside", cidades: ["Liverpool", "Birkenhead"] },
    ],
  },
];

export function getPais(nome: string): CountryInfo {
  return PAISES.find(p => p.nome === nome) ?? PAISES[0];
}

export function getEstados(pais: string): StateInfo[] {
  return getPais(pais).estados;
}

export function getCidades(pais: string, estadoSigla: string): string[] {
  return getEstados(pais).find(e => e.sigla === estadoSigla)?.cidades ?? [];
}

export const NACIONALIDADES = Array.from(
  new Set(PAISES.map(p => p.nacionalidade).concat(["Brasileira", "Alemã", "Francesa", "Colombiana", "Chilena"])),
).sort();