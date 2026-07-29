import type { AgeCategory } from "./types";
import campoImg from "@/assets/loc-campo-municipal.jpg";
import quadraImg from "@/assets/loc-quadra.jpg";
import escolinhaImg from "@/assets/loc-escolinha.jpg";
import escolaImg from "@/assets/loc-escola.jpg";
import varzeaImg from "@/assets/loc-varzea.jpg";
import ctImg from "@/assets/loc-ct-profissional.jpg";
import torneioImg from "@/assets/loc-torneio-regional.jpg";
import copaImg from "@/assets/loc-copa-juniores.jpg";
import eliteImg from "@/assets/loc-academia-elite.jpg";

/** Um palco de observação. O nível define a qualidade média dos atletas em campo. */
export interface ScoutLocation {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  /** Categorias que realmente disputam partidas naquele palco. */
  categorias: AgeCategory[];
  /** 1 a 10 — quanto maior, melhores (e mais disputados) são os atletas. */
  nivel: number;
  custoViagem: number;
  custoIngresso: number;
  /** Requisitos de acesso. */
  reputacaoMin: number;
  prestigioMin: number;
  /** Faixa de público, usada na simulação. */
  publico: [number, number];
}

const TODAS: AgeCategory[] = ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-18", "Sub-20", "Livre", "Veterano"];

export const LOCATIONS: ScoutLocation[] = [
  {
    id: "varzea",
    nome: "Várzea",
    descricao: "Peladas em campo de terra. De moleque de 11 anos a veterano de 40 — o futebol mais cru que existe.",
    imagem: varzeaImg,
    categorias: TODAS,
    nivel: 1, custoViagem: 60, custoIngresso: 0,
    reputacaoMin: 0, prestigioMin: 1, publico: [20, 180],
  },
  {
    id: "quadra",
    nome: "Quadra do Bairro",
    descricao: "Futsal de esquina. Técnica apurada e drible curto, porém físico e leitura tática limitados.",
    imagem: quadraImg,
    categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Livre"],
    nivel: 2, custoViagem: 70, custoIngresso: 10,
    reputacaoMin: 0, prestigioMin: 1, publico: [15, 120],
  },
  {
    id: "escola",
    nome: "Escola Estadual",
    descricao: "Jogos escolares. Só categorias jovens e nenhum acompanhamento profissional — achados raros, mas de graça.",
    imagem: escolaImg,
    categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17"],
    nivel: 2, custoViagem: 60, custoIngresso: 0,
    reputacaoMin: 0, prestigioMin: 1, publico: [30, 220],
  },
  {
    id: "municipal",
    nome: "Campo Municipal",
    descricao: "O campo da comunidade. Torneios de fim de semana com todas as idades e muita disputa.",
    imagem: campoImg,
    categorias: TODAS,
    nivel: 3, custoViagem: 110, custoIngresso: 20,
    reputacaoMin: 4, prestigioMin: 1, publico: [80, 700],
  },
  {
    id: "escolinha",
    nome: "Escolinha de Futebol",
    descricao: "Formação organizada, com treinadores e planilhas. Trabalha apenas com categorias até o Sub-18.",
    imagem: escolinhaImg,
    categorias: ["Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-18"],
    nivel: 4, custoViagem: 140, custoIngresso: 30,
    reputacaoMin: 10, prestigioMin: 1, publico: [40, 250],
  },
  {
    id: "regional",
    nome: "Torneio Regional",
    descricao: "Seletiva entre cidades do interior. Os melhores de cada município em um só lugar.",
    imagem: torneioImg,
    categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-18", "Sub-20"],
    nivel: 5, custoViagem: 260, custoIngresso: 45,
    reputacaoMin: 20, prestigioMin: 2, publico: [200, 1500],
  },
  {
    id: "estadual",
    nome: "Copa Estadual de Base",
    descricao: "Clubes profissionais de todo o estado. Olheiros por toda parte — aqui você disputa cada nome.",
    imagem: copaImg,
    categorias: ["Sub-15", "Sub-17", "Sub-18", "Sub-20"],
    nivel: 6, custoViagem: 420, custoIngresso: 70,
    reputacaoMin: 32, prestigioMin: 2, publico: [800, 6000],
  },
  {
    id: "ct-c",
    nome: "CT de clube da Série C",
    descricao: "Treinos fechados de um clube profissional. Só entra empresário credenciado.",
    imagem: ctImg,
    categorias: ["Sub-15", "Sub-17", "Sub-20", "Livre"],
    nivel: 6, custoViagem: 380, custoIngresso: 0,
    reputacaoMin: 40, prestigioMin: 3, publico: [0, 60],
  },
  {
    id: "ct-b",
    nome: "CT de clube da Série B",
    descricao: "Estrutura de ponta, atletas com contrato e agenda cheia de jogos-treino.",
    imagem: ctImg,
    categorias: ["Sub-17", "Sub-18", "Sub-20", "Livre"],
    nivel: 7, custoViagem: 620, custoIngresso: 0,
    reputacaoMin: 52, prestigioMin: 3, publico: [0, 120],
  },
  {
    id: "base-serie-a",
    nome: "Base de clube da Série A",
    descricao: "As categorias de base dos gigantes. Talento por metro quadrado — e concorrência brutal.",
    imagem: ctImg,
    categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-18", "Sub-20"],
    nivel: 8, custoViagem: 950, custoIngresso: 90,
    reputacaoMin: 64, prestigioMin: 4, publico: [500, 4000],
  },
  {
    id: "copa-juniores",
    nome: "Copa de Juniores",
    descricao: "O maior torneio Sub-20 do país. Uma boa atuação aqui muda a vida de um atleta.",
    imagem: copaImg,
    categorias: ["Sub-20"],
    nivel: 9, custoViagem: 1400, custoIngresso: 150,
    reputacaoMin: 74, prestigioMin: 4, publico: [3000, 25000],
  },
  {
    id: "selecao",
    nome: "Seleção Estadual Sub-17",
    descricao: "Convocados de toda a federação em treinamento. Acesso restrito a agências consolidadas.",
    imagem: torneioImg,
    categorias: ["Sub-17"],
    nivel: 9, custoViagem: 1800, custoIngresso: 0,
    reputacaoMin: 84, prestigioMin: 5, publico: [0, 400],
  },
  {
    id: "academia-elite",
    nome: "Academia Europeia de Elite",
    descricao: "Convite internacional. Os melhores projetos de formação do mundo abrem as portas para você.",
    imagem: eliteImg,
    categorias: ["Sub-18", "Sub-20"],
    nivel: 10, custoViagem: 5200, custoIngresso: 0,
    reputacaoMin: 92, prestigioMin: 5, publico: [200, 2000],
  },
];

export function getLocation(id: string): ScoutLocation {
  return LOCATIONS.find(l => l.id === id) ?? LOCATIONS[0];
}

/** Um local está liberado quando a agência tem reputação e prestígio suficientes. */
export function localLiberado(loc: ScoutLocation, reputacao: number, prestigio: number): boolean {
  return reputacao >= loc.reputacaoMin && prestigio >= loc.prestigioMin;
}

export function requisitoTexto(loc: ScoutLocation): string {
  const partes: string[] = [];
  if (loc.reputacaoMin > 0) partes.push(`${loc.reputacaoMin} de reputação`);
  if (loc.prestigioMin > 1) partes.push(`${loc.prestigioMin}★ de prestígio`);
  return partes.length ? `Exige ${partes.join(" e ")}` : "Aberto a qualquer olheiro";
}
