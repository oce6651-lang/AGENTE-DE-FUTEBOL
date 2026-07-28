import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GameState, Player, TimelineEvent } from "@/lib/game/types";
import { MESES } from "@/lib/game/types";
import { potencialEstimado, CUSTOS } from "@/lib/game/engine";
import { PlayerAvatar } from "./PlayerAvatar";

export function PlayerDetail({
  player,
  state,
  onBack,
  onObservar,
  onConversar,
  onPropor,
  onPeneira,
}: {
  player: Player;
  state: GameState;
  onBack: () => void;
  onObservar: () => void;
  onConversar: () => void;
  onPropor: () => void;
  onPeneira?: () => void;
}) {
  const contratado = player.empresario === state.agent.id;
  const nivel = player.observado; // 0..∞
  const revelaAtual = nivel >= 2 || contratado;
  const revelaAtributos = nivel >= 3 || contratado;
  const revelaPotencial = nivel >= 4 || contratado;
  const est = potencialEstimado(player);

  const attrs: [string, number][] = [
    ["Técnica", player.atributos.tecnica],
    ["Velocidade", player.atributos.velocidade],
    ["Finalização", player.atributos.finalizacao],
    ["Passe", player.atributos.passe],
    ["Físico", player.atributos.fisico],
    ["Mental", player.atributos.mental],
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={onBack} className="text-sm text-muted-foreground mb-3 hover:text-foreground">← Voltar</button>

      <Card className="p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <PlayerAvatar seed={player.visual} size={64} ring={contratado} />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black truncate">{player.nome}</h2>
            <p className="text-xs text-muted-foreground">{player.id} • {player.altura} cm</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Badge variant="secondary">{player.idade} anos</Badge>
              <Badge variant="secondary">{player.pe}</Badge>
              <Badge variant="secondary">{player.cidade}</Badge>
              {revelaAtributos && <Badge>{player.personalidade}</Badge>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-black">{revelaAtual ? player.atual : "??"}</div>
            <div className="text-[10px] text-muted-foreground">ATUAL</div>
            {revelaPotencial && (
              <>
                <div className="text-xl font-black text-primary mt-1">{est.min}-{est.max}</div>
                <div className="text-[10px] text-muted-foreground">POT ESTIM.</div>
              </>
            )}
          </div>
        </div>

        {revelaAtributos ? (
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
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            {nivel === 0
              ? "Você só o avistou. Observe algumas vezes para conhecer seus atributos."
              : "Continue observando para revelar os atributos técnicos."}
            <div className="mt-1 text-primary font-bold">Observações: {nivel} / 3</div>
          </div>
        )}

        <div className="mt-5 text-xs text-muted-foreground space-y-1">
          <div>Clube: {player.clube ?? "Sem clube"}</div>
          <div>Empresário: {player.empresario ? (contratado ? state.agent.agencia : "Outro empresário") : "Nenhum"}</div>
          <div>Descoberto em: {player.local}</div>
          <div>Observações realizadas: {nivel}</div>
          <div>Confiança do atleta: {player.confianca}%</div>
        </div>

        {player.relatorios.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold mb-2 text-muted-foreground uppercase">Relatórios de scout</div>
            <div className="space-y-2">
              {player.relatorios.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-secondary/40 p-3">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{r.partida}</span>
                    <span className="font-black text-primary">{r.nota.toFixed(1)}</span>
                  </div>
                  <div className="text-xs mt-1">{r.texto}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {player.timeline.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold mb-2 text-muted-foreground uppercase">Linha do tempo</div>
            <ol className="relative border-s-2 border-border ms-2 space-y-3">
              {player.timeline.map((e, i) => (
                <TimelineItem key={i} e={e} />
              ))}
            </ol>
          </div>
        )}

        {!contratado && !player.empresario && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={onObservar}>Observar (R$ {CUSTOS.observacao})</Button>
            <Button variant="secondary" onClick={onConversar}>Conversar (R$ {CUSTOS.conversa})</Button>
            <Button onClick={onPropor}>Propor (R$ {CUSTOS.proposta})</Button>
          </div>
        )}
        {contratado && !player.clube && onPeneira && (
          <div className="mt-6">
            <Button onClick={onPeneira} className="w-full">Enviar para peneira em um clube</Button>
          </div>
        )}
        {contratado && (
          <div className="mt-4 text-center text-sm text-primary font-bold">
            Representado por {state.agent.agencia}
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

function TimelineItem({ e }: { e: TimelineEvent }) {
  const cor: Record<TimelineEvent["tipo"], string> = {
    descoberta: "bg-muted-foreground",
    observacao: "bg-muted-foreground",
    assinatura: "bg-primary",
    peneira: "bg-accent",
    aprovado: "bg-primary",
    reprovado: "bg-destructive",
    transferencia: "bg-primary",
    aposentadoria: "bg-muted-foreground",
    nota: "bg-muted-foreground",
  };
  return (
    <li className="ms-4">
      <span className={`absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full ring-2 ring-background ${cor[e.tipo]}`} />
      <div className="text-[10px] uppercase text-muted-foreground">
        {MESES[e.mes - 1]} {e.ano} • sem {e.semana}
      </div>
      <div className="text-sm">{e.texto}</div>
    </li>
  );
}
