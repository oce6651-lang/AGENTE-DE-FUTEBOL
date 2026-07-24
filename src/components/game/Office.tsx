import { useState, useMemo } from "react";
import { toast } from "sonner";
import { StatusBar } from "./StatusBar";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetail } from "./PlayerDetail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LOCAIS } from "@/lib/game/types";
import type { GameState, Player, Club } from "@/lib/game/types";
import {
  avancarSemana, buscarJogadores, conversar, observarJogador, propor,
  responderNegociacao, enviarPeneira, custoPeneira,
} from "@/lib/game/engine";
import { LOCATION_IMAGES, LOCATION_DESC } from "@/lib/game/locations";
import officeHero from "@/assets/office-hero.jpg";

type View = "home" | "search" | "myPlayers" | "negotiations" | "news" | "agency" | "detail" | "tryouts";

export function Office({ state, setState, onExit }: {
  state: GameState;
  setState: (s: GameState) => void;
  onExit: () => void;
}) {
  const [view, setView] = useState<View>("home");
  const [local, setLocal] = useState<string | null>(null);
  const [descobertos, setDescobertos] = useState<Player[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peneiraFor, setPeneiraFor] = useState<Player | null>(null);

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
    if (eventos.length) toast(eventos[0]); else toast("Semana avançada");
  };

  const handleBuscar = (l: string) => {
    if (state.dinheiro < 150) { toast("Sem caixa para viajar (R$ 150)."); return; }
    const { state: next, novos } = buscarJogadores(state, l);
    setState(next);
    setDescobertos(novos);
    setLocal(l);
    if (novos.length === 0) toast(`Nada visto em ${l} desta vez.`);
  };

  const handleObservar = () => {
    if (!selected) return;
    if (state.dinheiro < 60) { toast("Sem caixa (R$ 60)."); return; }
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
  const handleAbrirPeneira = () => { if (selected) setPeneiraFor(selected); };
  const handleEnviarPeneira = (clube: Club) => {
    if (!peneiraFor) return;
    const { state: next, mensagem } = enviarPeneira(state, peneiraFor.id, clube.id);
    setState(next);
    toast(mensagem);
    setPeneiraFor(null);
  };

  const abertas = state.negociacoes.filter(n => n.status === "aberta").length;
  const peneirasAtivas = state.peneiras.filter(p => p.status === "em_andamento" || p.status === "mais_tempo").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-pitch)" }}>
      <StatusBar state={state} />
      <div className="max-w-3xl mx-auto pb-24">
        {view === "home" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <Card className="relative overflow-hidden shadow-[var(--shadow-card)] border-border">
              <img src={officeHero} alt="Escritório da agência" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="relative p-5 bg-gradient-to-t from-background/95 via-background/60 to-transparent">
                <div className="text-xs uppercase font-bold text-primary">Escritório</div>
                <div className="text-2xl font-black">{state.agent.agencia}</div>
                <div className="text-sm mt-1 text-muted-foreground">
                  {state.agent.nome} {state.agent.sobrenome} • {state.agent.cidade}/{state.agent.estado}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div><span className="text-muted-foreground">Reputação </span><span className="font-black text-primary">{state.reputacao}</span></div>
                  <div><span className="text-muted-foreground">Prestígio </span>{"⭐".repeat(state.prestigio)}</div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MenuTile icon="⚽" label="Procurar jogadores" onClick={() => setView("search")} />
              <MenuTile icon="👥" label="Meus jogadores" badge={state.jogadores.length} onClick={() => setView("myPlayers")} />
              <MenuTile icon="🎯" label="Peneiras" badge={peneirasAtivas} onClick={() => setView("tryouts")} />
              <MenuTile icon="🤝" label="Negociações" badge={abertas} onClick={() => setView("negotiations")} />
              <MenuTile icon="📰" label="Notícias" badge={state.noticias.length} onClick={() => setView("news")} />
              <MenuTile icon="🏢" label="Agência" onClick={() => setView("agency")} />
            </div>

            <Button onClick={handleAvancar} className="w-full h-14 text-base font-black" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
              ⏩ Avançar Semana
            </Button>
            <Button variant="ghost" onClick={onExit} className="w-full">Voltar ao menu principal</Button>
          </div>
        )}

        {view === "search" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Procurar jogadores" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Cada viagem custa R$ 150. Nem toda ida a campo revela algo — quanto maior sua reputação, mais talentos você consegue avistar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOCAIS.map(l => (
                <button
                  key={l}
                  onClick={() => handleBuscar(l)}
                  className={"group relative overflow-hidden rounded-2xl border text-left shadow-[var(--shadow-card)] transition-all hover:scale-[1.01] " +
                    (local === l ? "border-primary" : "border-border")}
                >
                  <img src={LOCATION_IMAGES[l]} alt={l} loading="lazy" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="font-black">{l}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2">{LOCATION_DESC[l]}</div>
                  </div>
                </button>
              ))}
            </div>
            {local && (
              <div className="text-xs text-muted-foreground">
                Última visita: <b>{local}</b> — {descobertos.length} pessoas avistadas.
              </div>
            )}
            <div className="space-y-2">
              {descobertos.map(p => (
                <PlayerCard key={p.id} player={p} onClick={() => openPlayer(p)} />
              ))}
              {!descobertos.length && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Escolha um local para procurar jogadores.
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
                Ainda sem jogadores. Vá procurar em campos e escolinhas.
              </div>
            )}
            {state.jogadores.map(p => (
              <PlayerCard key={p.id} player={p} onClick={() => openPlayer(p)} revealPotencial />
            ))}
          </div>
        )}

        {view === "tryouts" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Peneiras" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Jogadores desconhecidos não recebem propostas. Você precisa levá-los para testes. Cada clube avalia por conta própria.
            </p>
            {state.peneiras.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Nenhuma peneira em andamento.
                <div className="mt-3">
                  <Button variant="secondary" onClick={() => setView("myPlayers")}>Escolher jogador</Button>
                </div>
              </div>
            )}
            {state.peneiras.map(t => {
              const p = state.jogadores.find(j => j.id === t.playerId);
              const c = state.clubes.find(cl => cl.id === t.clubId);
              if (!p || !c) return null;
              const statusColor: Record<string, string> = {
                em_andamento: "secondary", mais_tempo: "outline",
                aprovado: "default", reprovado: "destructive", lesionado: "destructive",
              };
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{p.nome} → {c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.categoria} • {c.cidade}</div>
                    </div>
                    <Badge variant={(statusColor[t.status] as "secondary" | "outline" | "default" | "destructive")}>
                      {t.status === "em_andamento" ? `${t.restanteSemanas}sem` : t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {t.resultadoTexto && (
                    <div className="mt-2 text-xs text-muted-foreground italic">"{t.resultadoTexto}"</div>
                  )}
                  <ul className="mt-2 text-[11px] text-muted-foreground space-y-0.5">
                    {t.notas.map((n, i) => <li key={i}>• {n}</li>)}
                  </ul>
                </Card>
              );
            })}
          </div>
        )}

        {view === "negotiations" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Negociações" onBack={() => setView("home")} />
            {state.negociacoes.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Nenhuma negociação ainda. Clubes só sondam jogadores que já jogam profissionalmente.
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
              <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                <div><div className="text-lg font-black text-primary">R$ {state.dinheiro.toLocaleString("pt-BR")}</div><div className="text-[10px] text-muted-foreground">CAIXA</div></div>
                <div><div className="text-lg font-black">{"⭐".repeat(state.prestigio)}</div><div className="text-[10px] text-muted-foreground">PRESTÍGIO</div></div>
                <div><div className="text-lg font-black">{state.reputacao}</div><div className="text-[10px] text-muted-foreground">REPUTAÇÃO</div></div>
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
                    <div className={"font-black " + (f.valor >= 0 ? "text-primary" : "text-destructive")}>
                      {f.valor >= 0 ? "+" : ""}R$ {f.valor.toLocaleString("pt-BR")}
                    </div>
                  </div>
                ))}
                {state.financas.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">Sem lançamentos.</div>
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
            onPeneira={handleAbrirPeneira}
          />
        )}
      </div>

      <Dialog open={!!peneiraFor} onOpenChange={(o) => !o && setPeneiraFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar {peneiraFor?.nome} para peneira</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Escolha um clube. Clubes maiores exigem mais, mas abrem portas maiores.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {state.clubes.map(c => {
              const custo = custoPeneira(c);
              const podeEnviar = state.dinheiro >= custo;
              return (
                <button
                  key={c.id}
                  disabled={!podeEnviar}
                  onClick={() => handleEnviarPeneira(c)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors disabled:opacity-40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.categoria} • {c.cidade}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-primary">R$ {custo}</div>
                      <div className="text-[10px] text-muted-foreground">custo</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
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
