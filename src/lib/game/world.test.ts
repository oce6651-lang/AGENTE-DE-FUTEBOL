import { describe, expect, it } from "vitest";
import { calcularMovimentosTemporada } from "./world";
import type { Club, Division, Modalidade } from "./types";

function club(id: string, categoria: Division, pontos: number, modalidade: Modalidade = "campo"): Club {
  return {
    id, nome: id, pais: "Brasil", estado: "RS", cidade: "Porto Alegre", categoria, modalidade,
    liga: "", competicoes: [], prestigio: 1, orcamento: 1, tecnico: "Técnico", moralTecnico: 50,
    personalidade: "Formador", filosofia: "Base", necessidades: [], elenco: 1,
    confiancaEmVoce: 0, pontos, jogos: 10,
  };
}

describe("acesso e rebaixamento", () => {
  it("move os dois primeiros e os dois últimos sem sobreposição", () => {
    const clubes = [
      ...[1, 2, 3, 4, 5, 6].map((n) => club(`A${n}`, "Serie A", 70 - n)),
      ...[1, 2, 3, 4, 5, 6].map((n) => club(`B${n}`, "Serie B", 70 - n)),
    ];
    const result = calcularMovimentosTemporada(clubes);
    expect([...result.promovidos]).toEqual(["B1", "B2"]);
    expect([...result.rebaixados]).toEqual(["A5", "A6", "B5", "B6"]);
  });

  it("mantém o campeão da primeira divisão brasileira no topo", () => {
    const clubes = [1, 2, 3, 4, 5].map((n) => club(`A${n}`, "Serie A", 70 - n));
    expect([...calcularMovimentosTemporada(clubes).promovidos]).toEqual([]);
  });

  it("liga Ouro, Silver e LNF na pirâmide do futsal", () => {
    const clubes = [
      ...[1, 2, 3, 4, 5].map((n) => club(`L${n}`, "Elite", 70 - n, "futsal")),
      ...[1, 2, 3, 4, 5].map((n) => club(`S${n}`, "Serie A", 70 - n, "futsal")),
      ...[1, 2, 3, 4, 5].map((n) => club(`O${n}`, "Serie B", 70 - n, "futsal")),
    ];
    const result = calcularMovimentosTemporada(clubes);
    expect([...result.promovidos]).toEqual(["S1", "S2", "O1", "O2"]);
    expect(result.rebaixados.has("L5")).toBe(true);
    expect(result.rebaixados.has("S5")).toBe(true);
  });
});