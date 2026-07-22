import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/game/types";

export function PlayerCard({ player, onClick, revealPotencial = false }: {
  player: Player;
  onClick?: () => void;
  revealPotencial?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:bg-secondary transition-colors shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl grid place-items-center font-black text-lg"
          style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
          {player.posicao}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold truncate">{player.nome}</span>
            <span className="text-xs text-muted-foreground">{player.idade}a</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {player.id} • {player.pe} • {player.cidade}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-black">{player.atual}</div>
          {revealPotencial && (
            <div className="text-[10px] text-primary">POT {player.potencial}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">{player.status}</Badge>
        {player.empresario && <Badge className="text-[10px]">Contratado</Badge>}
        {player.idade < 18 && <Badge variant="outline" className="text-[10px]">Menor</Badge>}
      </div>
    </button>
  );
}