import type { GameState } from "@/lib/game/types";
import { dataLabel } from "@/lib/game/engine";

export function StatusBar({ state }: { state: GameState }) {
  const stars = "⭐".repeat(state.prestigio) + "☆".repeat(5 - state.prestigio);
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="truncate font-bold text-sm">{state.agent.agencia}</div>
          <div className="truncate text-xs text-muted-foreground">
            {state.agent.cidade} • {dataLabel(state)}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex flex-col items-end">
            <span className="font-black text-primary text-sm">
              R$ {state.dinheiro.toLocaleString("pt-BR")}
            </span>
            <span className="text-muted-foreground">
              {state.jogadores.length} jog.
            </span>
          </div>
          <div className="text-sm">{stars}</div>
        </div>
      </div>
    </div>
  );
}