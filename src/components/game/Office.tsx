import { useState, useMemo } from "react";
import { toast } from "sonner";
import { StatusBar } from "./StatusBar";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetail } from "./PlayerDetail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LOCAIS } from "@/lib/game/types";
import type { GameState, Player } from "@/lib/game/types";
import {
  avancarSemana, buscarJogadores, conversar, observarJogador, propor, responderNegociacao,
} from "@/lib/game/engine";

type View = "home" | "search" | "myPlayers" | "negotiations" | "news" | "agency" | "detail";

export function Office({ state, setState, onExit }: {
  state: GameState;
  setState: (s: GameState) => void;
  onExit: () => void;
}) {
  const [view, setView] = useState<View>("home");
  const [local, setLocal] = useState<string | null>(null);
  const [descobertos, setDescobertos] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const allKnown = useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of state.jogadores) map.set(p.id, p);
    for (const p of descobertos) if (!map.has(p.id)) map.set(p.id, p);
    return map;
  }, [state.jogadores, descobertos]);

  const selected = selectedId ? allKnown.get(selectedId) ?? null : null;

  const openPlayer = (p: Player) => { setSelectedId(p.id); setView("detail"); };

  const handleAvancar = () => {
    const { state: next, eventos } = avancarSemana(state);
    setState(next);
    if (eventos.length) toast(eventos[0]);
    else toast("Semana avançada");
  };

  const handleBuscar = (l: string) => {
    const { state: next, novos } = buscarJogadores(state, l);
    setState(next);
    setDescobertos(novos);
    setLocal(l);
  };

  const handleObservar = () => {
    if (!selected) return;
    const next = observarJogador(state, selected.id);
    setState(next);
    setDescobertos(descobertos.map(p => p.id === selected.id ? { ...p, observado: p.observado + 1 } : p));
    toast(`Você observou ${selected.nome}.`);
  };
  const handleConversar = () => {
    if (!selected) return;
    const { state: next, mensagem } = conversar(state, selected);
    setState(next);
    toast(mensagem);
  };
  const handlePropor = () => {
    if (!selected) return;
    const { state: next, sucesso, mensagem } = propor(state, selected);
    setState(next);
    toast(mensagem);
    if (sucesso) {
      setDescobertos(descobertos.filter(p => p.id !== selected.id));
      setView("myPlayers");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-pitch)" }}>
      <StatusBar state={state} />
      <div className="max-w-3xl mx-auto pb-24">
        {view === "home" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <Card className="p-5 shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-primary)" }}>
              <div className="text-primary-foreground">
                <div className="text-xs uppercase font-bold opacity-80">Escritório</div>
                <div className="text-2xl font-black">{state.agent.agencia}</div>
                <div className="text-sm mt-1">
                  {state.agent.nome} {state.agent.sobrenome} • {state.agent.cidade}/{state.agent.estado}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MenuTile icon="⚽" label="Procurar jogadores" onClick={() => setView("search")} />
              <MenuTile icon="👥" label="Meus jogadores" badge={state.jogadores.length} onClick={() => setView("myPlayers")} />
              <MenuTile icon="🤝" label="Negociações" badge={state.negociacoes.filter(n => n.status === "aberta").length} onClick={() => setView("negotiations")} />
              <MenuTile icon="📰" label="Notícias" badge={state.noticias.length} onClick={() => setView("news")} />
              <MenuTile icon="🏢" label="Agência" onClick={() => setView("agency")} />
              <MenuTile icon="⏩" label="Avançar semana" highlight onClick={handleAvancar} />
            </div>

            <Button variant="ghost" onClick={onExit} className="w-full">Voltar ao menu principal</Button>
          </div>
        )}

        {view === "search" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Procurar jogadores" onBack={() => setView("home")} />
            <div className="grid grid-cols-2 gap-2">
              {LOCAIS.map(l => (
                <Button
                  key={l}
                  variant={local === l ? "default" : "secondary"}
                  onClick={() => handleBuscar(l)}
                  className="h-16 text-sm"
                >
                  {l}
                </Button>
              ))}
            </div>
            {local && (
              <div className="text-xs text-muted-foreground">
                Buscando em <b>{local}</b> ({state.agent.cidade}) — custo R$ 50 por busca.
              </div>
            )}
            <div className="space-y-2">
              {descobertos.map(p => (
                <PlayerCard key={p.id} player={p} onClick={() => openPlayer(p)} />
              ))}
              {!descobertos.length && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Escolha um local para observar jogadores.
                </div>
              )}
            </div>
          </div>
        )}

        {view === "myPlayers" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Meus jogadores" onBack={() => setView("home")} />
            {state.jogadores.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Você ainda não contratou nenhum jogador.
              </div>
            )}
            {state.jogadores.map(p => (
              <PlayerCard key={p.id} player={p} revealPotencial onClick={() => openPlayer(p)} />
            ))}
          </div>
        )}

        {view === "negotiations" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Negociações" onBack={() => setView("home")} />
            {state.negociacoes.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Nenhuma negociação ainda.
              </div>
            )}
            {state.negociacoes.map(n => {
              const p = state.jogadores.find(j => j.id === n.playerId);
              const c = state.clubes.find(cl => cl.id === n.clubId);
              if (!p || !c) return null;
              return (
                <Card key={n.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{p.nome} → {c.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        R$ {n.valorProposta.toLocaleString("pt-BR")} • Comissão {(n.comissao * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{n.criadaEm}</div>
                    </div>
                    <Badge variant={n.status === "aberta" ? "default" : "secondary"}>{n.status}</Badge>
                  </div>
                  {n.status === "aberta" && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button variant="secondary" onClick={() => {
                        const { state: next, mensagem } = responderNegociacao(state, n.id, "recusar");
                        setState(next); toast(mensagem);
                      }}>Recusar</Button>
                      <Button onClick={() => {
                        const { state: next, mensagem } = responderNegociacao(state, n.id, "aceitar");
                        setState(next); toast(mensagem);
                      }}>Aceitar</Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {view === "news" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Notícias" onBack={() => setView("home")} />
            {state.noticias.map(n => (
              <Card key={n.id} className="p-4">
                <div className="text-[10px] uppercase text-muted-foreground">
                  Semana {n.semana} • {n.mes}/{n.ano} • {n.tipo}
                </div>
                <div className="font-bold mt-1">{n.titulo}</div>
                <div className="text-sm text-muted-foreground mt-1">{n.texto}</div>
              </Card>
            ))}
          </div>
        )}

        {view === "agency" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Agência" onBack={() => setView("home")} />
            <Card className="p-4">
              <div className="text-xs uppercase text-muted-foreground">Perfil</div>
              <div className="font-bold mt-1">{state.agent.agencia} ({state.agent.id})</div>
              <div className="text-sm">{state.agent.nome} {state.agent.sobrenome} • {state.agent.nacionalidade}</div>
              <div className="text-sm text-muted-foreground">{state.agent.cidade} - {state.agent.estado}, {state.agent.pais}</div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div><div className="text-lg font-black text-primary">R$ {state.dinheiro.toLocaleString("pt-BR")}</div><div className="text-[10px] text-muted-foreground">CAIXA</div></div>
                <div><div className="text-lg font-black">{"⭐".repeat(state.prestigio)}</div><div className="text-[10px] text-muted-foreground">PRESTÍGIO</div></div>
                <div><div className="text-lg font-black">{state.jogadores.length}</div><div className="text-[10px] text-muted-foreground">JOGADORES</div></div>
              </div>
            </Card>

            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Histórico financeiro</div>
              <div className="space-y-2">
                {state.financas.slice(0, 30).map(f => (
                  <div key={f.id} className="flex justify-between items-center bg-card border border-border rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{f.descricao}</div>
                      <div className="text-[10px] text-muted-foreground">{f.data}</div>
                    </div>
                    <div className={"font-bold shrink-0 " + (f.valor >= 0 ? "text-primary" : "text-destructive")}>
                      {f.valor >= 0 ? "+" : ""}R$ {f.valor.toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
                {state.financas.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">Sem movimentações.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === "detail" && selected && (
          <PlayerDetail
            player={selected}
            state={state}
            onBack={() => setView(state.jogadores.find(j => j.id === selected.id) ? "myPlayers" : "search")}
            onObservar={handleObservar}
            onConversar={handleConversar}
            onPropor={handlePropor}
          />
        )}
      </div>
    </div>
  );
}

function MenuTile({ icon, label, onClick, badge, highlight }: {
  icon: string; label: string; onClick: () => void; badge?: number; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "relative rounded-2xl border border-border p-4 text-left transition-all hover:scale-[1.02] shadow-[var(--shadow-card)] " +
        (highlight ? "text-primary-foreground" : "bg-card hover:bg-secondary")
      }
      style={highlight ? { background: "var(--gradient-primary)" } : undefined}
    >
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-sm font-bold">{label}</div>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-2 min-w-5 h-5 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-black grid place-items-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Voltar</button>
      <h2 className="text-xl font-black">{title}</h2>
    </div>
  );
}