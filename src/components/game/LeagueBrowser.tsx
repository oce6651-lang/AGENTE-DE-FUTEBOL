import { useMemo, useState } from "react";
import { ClubCrest } from "./ClubCrest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import type { Club, Division } from "@/lib/game/types";

/** Prestígio de 1 a 5 estrelas, calculado pela divisão e pelo orçamento do clube. */
export function prestigioDoClube(c: Club): number {
  const porDivisao: Record<Division, number> = {
    Amador: 1, "Serie D": 1, "Serie C": 2, "Serie B": 3, "Serie A": 4, Elite: 5,
  };
  const caixa = Math.log10(Math.max(10_000, c.orcamento)) - 5; // ~0 a ~4
  return Math.max(1, Math.min(5, Math.round((porDivisao[c.categoria] * 0.7) + caixa * 0.6)));
}

function Estrelas({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < n ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

/**
 * Navegador de ligas: lista todas as competições em que os clubes disputam a
 * temporada, com os participantes, o nível técnico e o prestígio de cada um.
 */
export function LeagueBrowser({ clubes, onBack }: { clubes: Club[]; onBack: () => void }) {
  const [busca, setBusca] = useState("");
  const [ligaAberta, setLigaAberta] = useState<string | null>(null);

  const ligas = useMemo(() => {
    const mapa = new Map<string, Club[]>();
    for (const c of clubes) {
      const chave = c.liga || "Sem competição definida";
      mapa.set(chave, [...(mapa.get(chave) ?? []), c]);
    }
    return Array.from(mapa.entries())
      .map(([nome, times]) => ({
        nome,
        times: times.slice().sort((a, b) => prestigioDoClube(b) - prestigioDoClube(a)),
        modalidade: times[0]?.modalidade ?? "campo",
        pais: times[0]?.pais ?? "Brasil",
      }))
      .sort((a, b) => a.pais.localeCompare(b.pais) || a.nome.localeCompare(b.nome));
  }, [clubes]);

  const filtro = busca.trim().toLowerCase();
  const visiveis = ligas.filter(l => !filtro || `${l.nome} ${l.pais}`.toLowerCase().includes(filtro));
  const atual = ligaAberta ? ligas.find(l => l.nome === ligaAberta) : null;

  if (atual) {
    return (
      <div className="p-4 space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLigaAberta(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="font-black truncate">{atual.nome}</div>
            <div className="text-[11px] text-muted-foreground">
              {atual.pais} • {atual.times.length} clubes • {atual.modalidade === "futsal" ? "Futsal" : "Futebol de campo"}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {atual.times.map(c => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
              <ClubCrest cores={c.cores} abrev={c.abrev} size={34} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate">{c.nome}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {c.cidade}/{c.estado} • {c.personalidade}
                </div>
                <Estrelas n={prestigioDoClube(c)} />
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="text-[10px]">{c.categoria}</Badge>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Caixa R$ {Math.round(c.orcamento / 1000).toLocaleString("pt-BR")} mil
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="font-black">Ligas e clubes do mundo</div>
      </div>
      <Input placeholder="Buscar liga ou país" value={busca} onChange={e => setBusca(e.target.value)} />
      <div className="space-y-2">
        {visiveis.map(l => (
          <button key={l.nome} onClick={() => setLigaAberta(l.nome)}
            className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{l.nome}</div>
              <div className="text-[11px] text-muted-foreground">
                {l.pais} • {l.times.length} clubes • {l.modalidade === "futsal" ? "Futsal" : "Campo"}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
        {!visiveis.length && (
          <div className="text-xs text-muted-foreground text-center py-8">Nenhuma liga encontrada.</div>
        )}
      </div>
    </div>
  );
}
