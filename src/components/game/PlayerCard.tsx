import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "./PlayerAvatar";
import { potencialEstimado } from "@/lib/game/engine";
import type { Player } from "@/lib/game/types";

export function PlayerCard({ player, onClick, revealPotencial = false }: {
  player: Player;
  onClick?: () => void;
  revealPotencial?: boolean;
}) {
  const contratado = !!player.empresario;
  const showAtual = player.observado >= 2 || contratado;
  const est = potencialEstimado(player);
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-border bg-card p-3.5 transition-all hover:border-primary hover:bg-secondary/60 hover:scale-[1.01] shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar seed={player.visual} ring={contratado} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold truncate">{player.nome}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0">{player.posicao}</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {player.idade} anos • {player.pe} • {player.altura}cm • {player.cidade}
          </div>
          <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, player.confianca)}%`, background: "var(--gradient-primary)" }} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-black">{showAtual ? player.atual : "??"}</div>
          {revealPotencial && player.observado >= 3 && (
            <div className="text-[10px] text-primary">POT {est.min}-{est.max}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">{player.status}</Badge>
        {contratado && <Badge className="text-[10px]">Cliente</Badge>}
        {player.idade < 18 && <Badge variant="outline" className="text-[10px]">Menor</Badge>}
        {player.observado <= 1 && <Badge variant="outline" className="text-[10px]">Pouco observado</Badge>}
      </div>
    </button>
  );
}
