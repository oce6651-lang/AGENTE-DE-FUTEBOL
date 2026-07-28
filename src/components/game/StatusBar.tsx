import type { GameState } from "@/lib/game/types";
import { dataLabel } from "@/lib/game/engine";
import { Zap, Wallet } from "lucide-react";

export function StatusBar({ state }: { state: GameState }) {
  const stars = "★".repeat(state.prestigio) + "☆".repeat(5 - state.prestigio);
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-md shadow-[var(--shadow-card)]">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-black text-sm">{state.agent.agencia}</div>
          <div className="truncate text-[11px] text-muted-foreground">{dataLabel(state)}</div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-secondary/60 px-2 py-1" title="Energia da semana">
          {Array.from({ length: state.energiaMax }).map((_, i) => (
            <Zap key={i} className={"h-3.5 w-3.5 " + (i < state.energia ? "text-primary" : "text-muted-foreground/30")} />
          ))}
        </div>
        <div className="text-right">
          <div className={"flex items-center gap-1 font-black text-sm " + (state.dinheiro < 0 ? "text-destructive" : "text-primary")}>
            <Wallet className="h-3.5 w-3.5" /> R$ {state.dinheiro.toLocaleString("pt-BR")}
          </div>
          <div className="text-[11px] text-accent tracking-widest leading-none">{stars}</div>
        </div>
      </div>
    </div>
  );
}
