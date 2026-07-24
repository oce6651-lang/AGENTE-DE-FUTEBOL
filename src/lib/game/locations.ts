import campoImg from "@/assets/loc-campo-municipal.jpg";
import quadraImg from "@/assets/loc-quadra.jpg";
import escolinhaImg from "@/assets/loc-escolinha.jpg";
import escolaImg from "@/assets/loc-escola.jpg";
import varzeaImg from "@/assets/loc-varzea.jpg";

export const LOCATION_IMAGES: Record<string, string> = {
  "Campo Municipal": campoImg,
  "Quadra do Bairro": quadraImg,
  "Escolinha de Futebol": escolinhaImg,
  "Escola Estadual": escolaImg,
  "Várzea": varzeaImg,
};

export const LOCATION_DESC: Record<string, string> = {
  "Campo Municipal": "Onde a comunidade joga aos fins de semana. Talentos crus, muita disputa.",
  "Quadra do Bairro": "Futsal de esquina. Bons de bola, técnica apurada, físico limitado.",
  "Escolinha de Futebol": "Categoria de base organizada. Jogadores acompanhados, custo alto de aproximação.",
  "Escola Estadual": "Torneios estudantis. Idade variada, achados raros mas possíveis.",
  "Várzea": "Peladas amadoras em campos de terra. Diamantes brutos, difícil convencer as famílias.",
};
