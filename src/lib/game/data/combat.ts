import type { CombatOrganization, CombatSport } from "../types";

const MMA_WEIGHTS = ["Peso-mosca", "Peso-galo", "Peso-pena", "Peso-leve", "Peso-meio-médio", "Peso-médio", "Peso-meio-pesado", "Peso-pesado"];
const BOXING_WEIGHTS = ["Peso-mosca", "Peso-galo", "Peso-pena", "Peso-leve", "Peso-meio-médio", "Peso-médio", "Peso-meio-pesado", "Peso-pesado"];
const KICK_WEIGHTS = ["Peso-galo", "Peso-pena", "Peso-leve", "Peso-meio-médio", "Peso-médio", "Peso-meio-pesado", "Peso-pesado"];
const BJJ_WEIGHTS = ["Peso-galo", "Peso-pena", "Peso-leve", "Peso-médio", "Peso-meio-pesado", "Peso-pesado", "Superpesado", "Absoluto"];
const MUAY_THAI_WEIGHTS = ["Peso-mosca", "Peso-galo", "Peso-pena", "Peso-leve", "Peso-meio-médio", "Peso-médio", "Peso-meio-pesado", "Peso-pesado"];

export const COMBAT_ORGANIZATIONS: CombatOrganization[] = [
  { id: "ufc", name: "UFC", sport: "MMA", country: "Estados Unidos", level: 10, prestige: 100, weightClasses: MMA_WEIGHTS, colors: ["#c81d25", "#111111"] },
  { id: "pfl", name: "Professional Fighters League", sport: "MMA", country: "Estados Unidos", level: 9, prestige: 86, weightClasses: MMA_WEIGHTS, colors: ["#111111", "#d6b14c"] },
  { id: "one-mma", name: "ONE Championship", sport: "MMA", country: "Singapura", level: 9, prestige: 88, weightClasses: MMA_WEIGHTS, colors: ["#d7b55a", "#111111"] },
  { id: "rizin", name: "Rizin Fighting Federation", sport: "MMA", country: "Japão", level: 8, prestige: 80, weightClasses: MMA_WEIGHTS, colors: ["#f2f2f2", "#d71920"] },
  { id: "lfa", name: "Legacy Fighting Alliance", sport: "MMA", country: "Estados Unidos", level: 6, prestige: 62, weightClasses: MMA_WEIGHTS, colors: ["#2454a6", "#d8d8d8"] },
  { id: "jungle", name: "Jungle Fight", sport: "MMA", country: "Brasil", level: 5, prestige: 55, weightClasses: MMA_WEIGHTS, colors: ["#15803d", "#facc15"] },
  { id: "shooto-br", name: "Shooto Brasil", sport: "MMA", country: "Brasil", level: 4, prestige: 48, weightClasses: MMA_WEIGHTS, colors: ["#111111", "#e5e7eb"] },
  { id: "wbc", name: "World Boxing Council", sport: "Boxe", country: "México", level: 10, prestige: 100, weightClasses: BOXING_WEIGHTS, colors: ["#0b7a3e", "#d4af37"] },
  { id: "wba", name: "World Boxing Association", sport: "Boxe", country: "Panamá", level: 10, prestige: 97, weightClasses: BOXING_WEIGHTS, colors: ["#111111", "#d4af37"] },
  { id: "ibf", name: "International Boxing Federation", sport: "Boxe", country: "Estados Unidos", level: 10, prestige: 95, weightClasses: BOXING_WEIGHTS, colors: ["#d71920", "#f5f5f5"] },
  { id: "wbo", name: "World Boxing Organization", sport: "Boxe", country: "Porto Rico", level: 10, prestige: 94, weightClasses: BOXING_WEIGHTS, colors: ["#7f1d1d", "#d4af37"] },
  { id: "cn-boxe", name: "Conselho Nacional de Boxe", sport: "Boxe", country: "Brasil", level: 4, prestige: 45, weightClasses: BOXING_WEIGHTS, colors: ["#166534", "#facc15"] },
  { id: "one-kb", name: "ONE Championship Kickboxing", sport: "Kickboxing", country: "Singapura", level: 10, prestige: 95, weightClasses: KICK_WEIGHTS, colors: ["#d7b55a", "#111111"] },
  { id: "glory", name: "GLORY Kickboxing", sport: "Kickboxing", country: "Países Baixos", level: 10, prestige: 98, weightClasses: KICK_WEIGHTS, colors: ["#ea580c", "#111111"] },
  { id: "rise", name: "RISE", sport: "Kickboxing", country: "Japão", level: 8, prestige: 80, weightClasses: KICK_WEIGHTS, colors: ["#dc2626", "#f5f5f5"] },
  { id: "k1", name: "K-1", sport: "Kickboxing", country: "Japão", level: 9, prestige: 91, weightClasses: KICK_WEIGHTS, colors: ["#2563eb", "#f5f5f5"] },
  { id: "wgp", name: "WGP Kickboxing", sport: "Kickboxing", country: "Brasil", level: 5, prestige: 58, weightClasses: KICK_WEIGHTS, colors: ["#111111", "#facc15"] },
  { id: "ibjjf", name: "IBJJF", sport: "Jiu-jítsu", country: "Estados Unidos", level: 10, prestige: 100, weightClasses: BJJ_WEIGHTS, colors: ["#1d4ed8", "#f5f5f5"] },
  { id: "adcc", name: "ADCC Submission Fighting", sport: "Jiu-jítsu", country: "Emirados Árabes Unidos", level: 10, prestige: 100, weightClasses: BJJ_WEIGHTS, colors: ["#111111", "#d4af37"] },
  { id: "ajp", name: "AJP Tour", sport: "Jiu-jítsu", country: "Emirados Árabes Unidos", level: 9, prestige: 90, weightClasses: BJJ_WEIGHTS, colors: ["#f5f5f5", "#d4af37"] },
  { id: "bjj-stars", name: "BJJ Stars", sport: "Jiu-jítsu", country: "Brasil", level: 8, prestige: 84, weightClasses: BJJ_WEIGHTS, colors: ["#111111", "#dc2626"] },
  { id: "cbjj", name: "CBJJ", sport: "Jiu-jítsu", country: "Brasil", level: 6, prestige: 68, weightClasses: BJJ_WEIGHTS, colors: ["#15803d", "#facc15"] },
  { id: "one-muay-thai", name: "ONE Championship Muay Thai", sport: "Muay Thai", country: "Singapura", level: 10, prestige: 98, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#d7b55a", "#111111"] },
  { id: "rws", name: "Rajadamnern World Series", sport: "Muay Thai", country: "Tailândia", level: 10, prestige: 97, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#dc2626", "#d4af37"] },
  { id: "wbc-muaythai", name: "WBC MuayThai", sport: "Muay Thai", country: "Tailândia", level: 9, prestige: 92, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#15803d", "#d4af37"] },
  { id: "wmc", name: "World Muaythai Council", sport: "Muay Thai", country: "Tailândia", level: 9, prestige: 90, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#1d4ed8", "#dc2626"] },
  { id: "thai-fight", name: "THAI FIGHT", sport: "Muay Thai", country: "Tailândia", level: 8, prestige: 84, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#111111", "#d4af37"] },
  { id: "cbmt", name: "Confederação Brasileira de Muay Thai", sport: "Muay Thai", country: "Brasil", level: 5, prestige: 55, weightClasses: MUAY_THAI_WEIGHTS, colors: ["#15803d", "#facc15"] },
];

export const WEIGHT_KG: Record<string, number> = {
  "Peso-mosca": 57, "Peso-galo": 61, "Peso-pena": 66, "Peso-leve": 70,
  "Peso-meio-médio": 77, "Peso-médio": 84, "Peso-meio-pesado": 93, "Peso-pesado": 110,
  "Superpesado": 100, "Absoluto": 88,
};

export function organizationsFor(sport: CombatSport) {
  return COMBAT_ORGANIZATIONS.filter(organization => organization.sport === sport);
}