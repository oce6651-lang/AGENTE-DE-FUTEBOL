import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GameState, Player } from "@/lib/game/types";

export function PlayerDetail({
  player,
  state,
  onBack,
  onObservar,
  onConversar,
  onPropor,
}: {
  player: Player;
  state: GameState;
  onBack: () => void;
  onObservar: () => void;
  onConversar: () => void;
  onPropor: () => void;
}) {
  const contratado = player.empresario === state.agent.id;
  const attrs: [string, number][] = [
    ["Técnica", player.atributos.tecnica],
    ["Velocidade", player.atributos.velocidade],
    ["Finalização", player.atributos.finalizacao],
    ["Passe", player.atributos.passe],
    ["Físico", player.atributos.fisico],
    ["Mental", player.atributos.mental],
  ];
  const potencialRevelado = contratado || player.observado >= 2;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={onBack} className="text-sm text-muted-foreground mb-3 hover:text-foreground">← Voltar</button>

      <Card className="p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl grid place-items-center font-black text-xl shrink-0"
            style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
            {player.posicao}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black truncate">{player.nome}</h2>
            <p className="text-xs text-muted-foreground">{player.id}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="secondary">{player.idade} anos</Badge>
              <Badge variant="secondary">{player.pe}</Badge>
              <Badge variant="secondary">{player.cidade}</Badge>
              <Badge>{player.personalidade}</Badge>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-black">{player.atual}</div>
            <div className="text-[10px] text-muted-foreground">ATUAL</div>
            {potencialRevelado && (
              <>
                <div className="text-xl font-black text-primary mt-1">{player.potencial}</div>
                <div className="text-[10px] text-muted-foreground">POT</div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {attrs.map(([nome, v]) => (
            <div key={nome}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{nome}</span>
                <span className="font-bold">{v}</span>
              </div>
              <Progress value={v} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-5 text-xs text-muted-foreground space-y-1">
          <div>Clube: {player.clube ?? "Sem clube"}</div>
          <div>Empresário: {player.empresario ? (contratado ? state.agent.agencia : "Outro empresário") : "Nenhum"}</div>
          <div>Descoberto em: {player.local}</div>
          <div>Observações: {player.observado}</div>
        </div>

        {player.historico.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold mb-2 text-muted-foreground uppercase">Histórico</div>
            <ul className="text-xs space-y-1">
              {player.historico.map((h, i) => <li key={i}>• {h}</li>)}
            </ul>
          </div>
        )}

        {!contratado && !player.empresario && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={onObservar}>Observar</Button>
            <Button variant="secondary" onClick={onConversar}>Conversar</Button>
            <Button onClick={onPropor}>Propor</Button>
          </div>
        )}
        {contratado && (
          <div className="mt-6 text-center text-sm text-primary font-bold">
            Este jogador é representado pela sua agência.
          </div>
        )}
        {!contratado && player.empresario && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Este jogador já possui empresário.
          </div>
        )}
      </Card>
    </div>
  );
}