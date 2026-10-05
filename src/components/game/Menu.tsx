import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LeagueBrowser } from "./LeagueBrowser";
import { gerarClubes } from "@/lib/game/generators";
import type { SaveSlot } from "@/lib/game/storage";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, Swords, Trash2 } from "lucide-react";

interface Props {
  hasSave: boolean;
  saves: SaveSlot[];
  onNew: (slotId?: string) => void;
  onContinue: () => void;
  onLoad: (slotId: string) => void;
  onDelete: (slotId: string) => void;
}

export function Menu({ hasSave, saves, onNew, onContinue, onLoad, onDelete }: Props) {
  const [verLigas, setVerLigas] = useState(false);
  const [carregar, setCarregar] = useState(false);
  // Catálogo apenas para consulta, gerado sob demanda.
  const clubes = useMemo(() => (verLigas ? gerarClubes() : []), [verLigas]);

  if (verLigas) {
    return (
      <div className="min-h-screen" style={{ background: "var(--gradient-pitch)" }}>
        <div className="max-w-3xl mx-auto pb-16">
          <LeagueBrowser clubes={clubes} onBack={() => setVerLigas(false)} />
        </div>
      </div>
    );
  }

  if (carregar) {
    return (
      <div className="min-h-screen px-4 py-8" style={{ background: "var(--gradient-pitch)" }}>
        <div className="mx-auto max-w-2xl">
          <Button variant="ghost" className="mb-5" onClick={() => setCarregar(false)}>
            <ArrowLeft className="size-4" /> Voltar
          </Button>
          <h1 className="text-3xl font-black">Carregar carreira</h1>
          <p className="mt-1 text-sm text-muted-foreground">Até cinco histórias podem ser mantidas neste navegador.</p>
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 5 }, (_, index) => {
              const id = `slot-${index + 1}`;
              const slot = saves.find(item => item.id === id);
              if (!slot) {
                return (
                  <div key={id} className="flex min-h-28 items-center justify-between rounded-md border border-dashed border-border p-4">
                    <div><p className="font-bold">Espaço {index + 1}</p><p className="text-sm text-muted-foreground">Vazio</p></div>
                    <Button variant="outline" onClick={() => onNew(id)}>Nova carreira</Button>
                  </div>
                );
              }
              return (
                <div key={id} className="rounded-md border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black">{slot.agentName}</p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground"><BriefcaseBusiness className="size-3.5" /> {slot.agencyName}</p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label={`Excluir carreira de ${slot.agentName}`} onClick={() => {
                      if (confirm(`Excluir definitivamente a carreira de ${slot.agentName}?`)) onDelete(id);
                    }}><Trash2 className="size-4" /></Button>
                  </div>
                  <div className="my-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> {slot.year}</span>
                    <span>Reputação {slot.reputation}</span>
                    <span className="text-muted-foreground">{new Date(slot.updatedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => onLoad(id)}>Carregar</Button>
                    <Button variant="outline" onClick={() => {
                      if (confirm(`Substituir a carreira de ${slot.agentName}?`)) onNew(id);
                    }}>Substituir</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--gradient-pitch)" }}>
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="mb-4 flex items-center justify-center gap-3 text-5xl"><span>⚽</span><Swords className="size-12 text-primary" /></div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
          PROJECT
        </h1>
        <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-primary)" }}>
          SPORTS AGENT
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">Futebol, MMA, boxe e kickboxing na mesma agência</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" onClick={() => saves.length >= 5 ? setCarregar(true) : onNew()} className="h-14 text-base font-bold shadow-[var(--shadow-glow)]">
          Novo Jogo
        </Button>
        <Button size="lg" variant="secondary" disabled={!hasSave} onClick={onContinue} className="h-14 text-base font-bold">
          Continuar
        </Button>
        <Button size="lg" variant="outline" disabled={!hasSave} onClick={() => setCarregar(true)} className="h-14 text-base font-bold">
          Carregar jogo
        </Button>
        <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => setVerLigas(true)}>
          Ligas e clubes
        </Button>
        <Button size="lg" variant="ghost" className="h-14 text-base" disabled>
          Créditos
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-10">v1.0 • Save local no navegador</p>
    </div>
  );
}
