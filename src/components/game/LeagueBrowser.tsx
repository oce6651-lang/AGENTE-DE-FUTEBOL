import { useMemo, useState } from "react";
import { ClubCrest } from "./ClubCrest";
import { CompetitionLogo } from "./CompetitionLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { COMPETICOES, type Competition } from "@/lib/game/data/leagues";
import type { Club, Division, Modalidade } from "@/lib/game/types";
import heroFutebol from "@/assets/hero-ligas-futebol.jpg";
import heroFutsal from "@/assets/hero-ligas-futsal.jpg";
import heroCompeticao from "@/assets/hero-competicao-detalhe.jpg";

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

const NIVEL_LIGA: Record<Division, string> = {
  Amador: "Amador", "Serie D": "Base nacional", "Serie C": "Intermediária",
  "Serie B": "Profissional", "Serie A": "Alto nível", Elite: "Elite mundial",
};

/** Nível médio da competição, calculado pelas divisões dos participantes. */
function nivelDaCompeticao(times: Club[]): string {
  if (!times.length) return "Sem participantes";
  const ordem: Division[] = ["Amador", "Serie D", "Serie C", "Serie B", "Serie A", "Elite"];
  const media = times.reduce((s, c) => s + ordem.indexOf(c.categoria), 0) / times.length;
  return NIVEL_LIGA[ordem[Math.round(media)]];
}

/**
 * Navegador de ligas: mostra todas as competições do mundo separadas por
 * modalidade, com os clubes participantes, o nível técnico e o prestígio.
 */
export function LeagueBrowser({ clubes, onBack, competicoesExtras = [] }: {
  clubes: Club[];
  onBack: () => void;
  competicoesExtras?: Competition[];
}) {
  const [modalidade, setModalidade] = useState<Modalidade>("campo");
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<string | null>(null);

  const competicoes = useMemo(() => {
    const todas = [...COMPETICOES, ...competicoesExtras];
    return todas
      .filter(c => (c.modalidade ?? "campo") === modalidade)
      .map(c => ({
        comp: c,
        times: clubes
          .filter(cl => (cl.modalidade ?? "campo") === modalidade && cl.competicoes?.includes(c.nome))
          .sort((a, b) => prestigioDoClube(b) - prestigioDoClube(a)),
      }))
      .sort((a, b) => b.times.length - a.times.length || a.comp.nome.localeCompare(b.comp.nome));
  }, [clubes, modalidade, competicoesExtras]);

  const filtro = busca.trim().toLowerCase();
  const visiveis = competicoes.filter(l =>
    !filtro || `${l.comp.nome} ${l.comp.pais} ${l.comp.tipo}`.toLowerCase().includes(filtro));
  const atual = aberta ? competicoes.find(l => l.comp.nome === aberta) : null;

  if (atual) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="relative h-32 overflow-hidden">
          <img src={heroCompeticao} alt="Troféu da competição" loading="lazy" width={1280} height={640}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
          <Button variant="ghost" size="icon" onClick={() => setAberta(null)}
            className="absolute top-2 left-2 bg-background/60 backdrop-blur">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-3">
            <CompetitionLogo nome={atual.comp.nome} tipo={atual.comp.tipo}
              modalidade={atual.comp.modalidade ?? "campo"} size={40} />
            <div className="min-w-0">
              <div className="font-black text-lg truncate">{atual.comp.nome}</div>
              <div className="text-[11px] text-muted-foreground">
                {atual.comp.pais} • {atual.times.length} clubes • {nivelDaCompeticao(atual.times)}
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex flex-wrap gap-1">
            {atual.comp.categorias.map(cat => (
              <Badge key={cat} variant="secondary" className="text-[10px]">{cat}</Badge>
            ))}
          </div>
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
          {!atual.times.length && (
            <div className="text-xs text-muted-foreground text-center py-8">
              Nenhum clube disputa esta competição nesta temporada.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="relative h-32 overflow-hidden">
        <img src={modalidade === "futsal" ? heroFutsal : heroFutebol}
          alt={modalidade === "futsal" ? "Quadra de futsal lotada" : "Estádio de futebol lotado"}
          loading="lazy" width={1280} height={640} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
        <Button variant="ghost" size="icon" onClick={onBack}
          className="absolute top-2 left-2 bg-background/60 backdrop-blur">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="absolute bottom-2 left-4 font-black text-lg">Ligas e clubes do mundo</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button variant={modalidade === "campo" ? "default" : "outline"} className="h-11 font-bold"
            onClick={() => { setModalidade("campo"); setAberta(null); }}>
            Futebol
          </Button>
          <Button variant={modalidade === "futsal" ? "default" : "outline"} className="h-11 font-bold"
            onClick={() => { setModalidade("futsal"); setAberta(null); }}>
            Futsal
          </Button>
        </div>
        <Input placeholder="Buscar competição ou país" value={busca} onChange={e => setBusca(e.target.value)} />
        <div className="space-y-2">
          {visiveis.map(l => (
            <button key={l.comp.id} onClick={() => setAberta(l.comp.nome)}
              className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors flex items-center gap-3">
              <CompetitionLogo nome={l.comp.nome} tipo={l.comp.tipo}
                modalidade={l.comp.modalidade ?? "campo"} size={30} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm truncate">{l.comp.nome}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {l.comp.pais} • {l.times.length} clubes • {nivelDaCompeticao(l.times)}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          {!visiveis.length && (
            <div className="text-xs text-muted-foreground text-center py-8">Nenhuma competição encontrada.</div>
          )}
        </div>
      </div>
    </div>
  );
}
