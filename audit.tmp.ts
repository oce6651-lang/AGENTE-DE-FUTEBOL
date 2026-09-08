import { TODOS } from "./src/lib/game/data/clubs";
import { COMPETICOES, competicoesDoClube } from "./src/lib/game/data/leagues";
const counts = new Map<string, number>();
for (const c of COMPETICOES) counts.set(c.nome, 0);
for (const c of TODOS as any[]) {
  for (const comp of competicoesDoClube(c.categoria, c.pais, c.estado, c.modalidade ?? "campo"))
    counts.set(comp.nome, (counts.get(comp.nome) ?? 0) + 1);
}
console.log("VAZIAS/POUCAS:");
for (const [n, v] of counts) if (v < 4) console.log(v, n);
