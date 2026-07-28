import { useState } from "react";
import { toast } from "sonner";
import { StatusBar } from "./StatusBar";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetail } from "./PlayerDetail";
import { MatchDay } from "./MatchDay";
import { ClubCrest } from "./ClubCrest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LOCAIS } from "@/lib/game/types";
import type { Club, Fixture, GameState, MatchPlayer, Player } from "@/lib/game/types";
import {
  avancarSemana, conversar, observarJogador, propor, responderNegociacao,
  enviarPeneira, custoPeneira, podeAssistir, pagarPartida, adicionarAoRadar, CUSTOS,
} from "@/lib/game/engine";
import { LOCATION_IMAGES, LOCATION_DESC } from "@/lib/game/locations";
import officeHero from "@/assets/office-hero.jpg";
import {
  Search, Users, Target, Handshake, Newspaper, Briefcase, Radar, ArrowLeft, ChevronRight,
} from "lucide-react";

type View = "home" | "locais" | "matchday" | "radar" | "myPlayers" | "negotiations" | "news" | "agency" | "detail" | "tryouts" | "clubs";

export function Office({ state, setState, onExit }: {
  state: GameState;
  setState: (s: GameState) => void;
  onExit: () => void;
}) {
  const [view, setView] = useState<View>("home");
  const [local, setLocal] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voltarPara, setVoltarPara] = useState<View>("radar");
  const [peneiraFor, setPeneiraFor] = useState<Player | null>(null);

  const selected = selectedId
    ? state.jogadores.find(p => p.id === selectedId) ?? state.radar.find(p => p.id === selectedId) ?? null
    : null;

  const openPlayer = (p: Player, origem: View) => { setSelectedId(p.id); setVoltarPara(origem); setView("detail"); };

  const handleAvancar = () => {
    const { state: next, eventos } = avancarSemana(state);
    setState(next);
    toast(eventos[0] ?? "Semana avançada", { description: eventos[1] });
  };

  const abrirLocal = (l: string) => {
    const check = podeAssistir(state);
    if (!check.ok) { toast(check.motivo!); return; }
    setLocal(l); setView("matchday");
  };

  const cobrarPartida = (fx: Fixture) => {
    const check = podeAssistir(state);
    if (!check.ok) { toast(check.motivo!); return false; }
    setState(pagarPartida(state, fx));
    return true;
  };

  const salvarRadar = (destaques: MatchPlayer[], fx: Fixture) => {
    const { state: next, adicionados } = adicionarAoRadar(state, destaques, fx);
    setState(next);
    toast(adicionados.length ? `${adicionados.length} atleta(s) no radar.` : "Nenhum atleta novo.");
    setView("radar");
  };

  const handleObservar = () => {
    if (!selected) return;
    const { state: next, mensagem } = observarJogador(state, selected.id);
    setState(next); toast(mensagem);
  };
  const handleConversar = () => {
    if (!selected) return;
    const { state: next, mensagem } = conversar(state, selected);
    setState(next); toast(mensagem);
  };
  const handlePropor = () => {
    if (!selected) return;
    const { state: next, sucesso, mensagem } = propor(state, selected);
    setState(next); toast(mensagem);
    if (sucesso) setView("myPlayers");
  };
  const handleEnviarPeneira = (clube: Club) => {
    if (!peneiraFor) return;
    const { state: next, mensagem } = enviarPeneira(state, peneiraFor.id, clube.id);
    setState(next); toast(mensagem); setPeneiraFor(null);
  };

  const abertas = state.negociacoes.filter(n => n.status === "aberta").length;
  const peneirasAtivas = state.peneiras.filter(p => p.status === "em_andamento" || p.status === "mais_tempo").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-pitch)" }}>
      <StatusBar state={state} />
      <div className="max-w-3xl mx-auto pb-24">
        {view === "home" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <Card className="relative overflow-hidden border-border shadow-[var(--shadow-card)]">
              <img src={officeHero} alt="Escritório da agência" className="absolute inset-0 w-full h-full object-cover opacity-35" />
              <div className="relative p-5 bg-gradient-to-t from-background/95 via-background/60 to-transparent">
                <div className="text-xs uppercase font-bold text-primary tracking-widest">Escritório</div>
                <div className="text-2xl font-black">{state.agent.agencia}</div>
                <div className="text-sm mt-1 text-muted-foreground">
                  {state.agent.nome} {state.agent.sobrenome} • {state.agent.cidade}/{state.agent.estado}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Reputação no meio</span>
                    <span className="font-black text-primary">{state.reputacao}/100</span>
                  </div>
                  <Progress value={state.reputacao} className="h-1.5" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MenuTile icon={<Search className="h-6 w-6" />} label="Ir a campo" onClick={() => setView("locais")} />
              <MenuTile icon={<Radar className="h-6 w-6" />} label="Radar" badge={state.radar.length} onClick={() => setView("radar")} />
              <MenuTile icon={<Users className="h-6 w-6" />} label="Meus atletas" badge={state.jogadores.length} onClick={() => setView("myPlayers")} />
              <MenuTile icon={<Target className="h-6 w-6" />} label="Peneiras" badge={peneirasAtivas} onClick={() => setView("tryouts")} />
              <MenuTile icon={<Handshake className="h-6 w-6" />} label="Negociações" badge={abertas} onClick={() => setView("negotiations")} />
              <MenuTile icon={<Newspaper className="h-6 w-6" />} label="Notícias" onClick={() => setView("news")} />
              <MenuTile icon={<Briefcase className="h-6 w-6" />} label="Agência" onClick={() => setView("agency")} />
              <MenuTile icon={<ClubCrest cores={["#1f8ecd", "#0b1d2e"]} abrev="CLB" size={26} />} label="Clubes" onClick={() => setView("clubs")} />
            </div>

            <Button onClick={handleAvancar} className="w-full h-14 text-base font-black hover:scale-[1.01] transition-transform"
              style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
              Avançar semana
            </Button>
            <Button variant="ghost" onClick={onExit} className="w-full">Voltar ao menu principal</Button>
          </div>
        )}

        {view === "locais" && (
          <div className="p-4 space-y-4 animate-in fade-in duration-300">
            <SubHeader title="Ir a campo" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Cada deslocamento custa R$ {CUSTOS.viagem} + ingresso e consome 1 ponto de energia da semana.
              Escolha o local, veja a programação do dia e assista a uma partida inteira.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOCAIS.map(l => (
                <button key={l} onClick={() => abrirLocal(l)}
                  className="group relative overflow-hidden rounded-2xl border border-border text-left shadow-[var(--shadow-card)] transition-all hover:border-primary hover:scale-[1.01]">
                  <img src={LOCATION_IMAGES[l]} alt={l} loading="lazy" className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="font-black flex items-center gap-1">{l} <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" /></div>
                    <div className="text-[10px] text-muted-foreground line-clamp-2">{LOCATION_DESC[l]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "matchday" && local && (
          <MatchDay
            state={state}
            local={local}
            onSair={() => setView("locais")}
            onAssistir={cobrarPartida}
            onSalvarRadar={salvarRadar}
          />
        )}

        {view === "radar" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Radar da agência" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Atletas que chamaram sua atenção. Observe mais vezes para revelar atributos e conquistar confiança —
              empresários rivais também estão de olho.
            </p>
            {state.radar.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Radar vazio. Vá a campo e assista partidas.
              </div>
            )}
            {state.radar.map(p => <PlayerCard key={p.id} player={p} onClick={() => openPlayer(p, "radar")} />)}
          </div>
        )}

        {view === "myPlayers" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Meus atletas" onBack={() => setView("home")} />
            {state.jogadores.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhum cliente ainda. Conquiste a confiança de um atleta no radar.
              </div>
            )}
            {state.jogadores.map(p => (
              <PlayerCard key={p.id} player={p} revealPotencial onClick={() => openPlayer(p, "myPlayers")} />
            ))}
          </div>
        )}

        {view === "clubs" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Clubes" onBack={() => setView("home")} />
            {state.clubes.map(c => (
              <Card key={c.id} className="p-4 flex items-center gap-3 hover:bg-secondary/40 transition-colors">
                <ClubCrest cores={c.cores} abrev={c.abrev} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate">{c.nome}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {c.categoria} • {c.cidade} • {c.personalidade}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    Técnico: {c.tecnico} • Precisa de: {c.necessidades.join(", ") || "nada"}
                  </div>
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Confiança em você</span><span>{c.confiancaEmVoce}%</span>
                    </div>
                    <Progress value={c.confiancaEmVoce} className="h-1" />
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <div className="font-black text-primary">{c.pontos} pts</div>
                  <div className="text-muted-foreground">{c.jogos} jogos</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {view === "tryouts" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Peneiras" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Clubes só aceitam inscrições de empresários em quem confiam. Reprovações machucam sua reputação.
            </p>
            {state.peneiras.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma peneira registrada.
                <div className="mt-3"><Button variant="secondary" onClick={() => setView("myPlayers")}>Escolher atleta</Button></div>
              </div>
            )}
            {state.peneiras.map(t => {
              const p = state.jogadores.find(j => j.id === t.playerId);
              const c = state.clubes.find(cl => cl.id === t.clubId);
              if (!p || !c) return null;
              const variant = t.status === "aprovado" ? "default"
                : t.status === "reprovado" || t.status === "lesionado" ? "destructive"
                : t.status === "mais_tempo" ? "outline" : "secondary";
              return (
                <Card key={t.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <ClubCrest cores={c.cores} abrev={c.abrev} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{p.nome} → {c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.categoria} • {c.tecnico}</div>
                    </div>
                    <Badge variant={variant}>
                      {t.status === "em_andamento" ? `${t.restanteSemanas} sem` : t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {t.resultadoTexto && <div className="mt-2 text-xs italic text-muted-foreground">"{t.resultadoTexto}"</div>}
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
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma proposta. Clubes só procuram empresários com reputação.
              </div>
            )}
            {state.negociacoes.map(n => {
              const p = state.jogadores.find(j => j.id === n.playerId);
              const c = state.clubes.find(cl => cl.id === n.clubId);
              if (!p || !c) return null;
              return (
                <Card key={n.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <ClubCrest cores={c.cores} abrev={c.abrev} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{p.nome} → {c.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        R$ {n.valorProposta.toLocaleString("pt-BR")} • comissão {(n.comissao * 100).toFixed(0)}% • salário R$ {n.salario.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {n.criadaEm}{n.status === "aberta" ? ` • expira em ${n.expiraEm} sem` : ""}
                      </div>
                    </div>
                    <Badge variant={n.status === "aberta" ? "default" : "secondary"}>{n.status}</Badge>
                  </div>
                  {n.status === "aberta" && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button variant="secondary" onClick={() => {
                        const r = responderNegociacao(state, n.id, "recusar"); setState(r.state); toast(r.mensagem);
                      }}>Recusar</Button>
                      <Button variant="outline" onClick={() => {
                        const r = responderNegociacao(state, n.id, "contraproposta"); setState(r.state); toast(r.mensagem);
                      }}>Contrapor</Button>
                      <Button onClick={() => {
                        const r = responderNegociacao(state, n.id, "aceitar"); setState(r.state); toast(r.mensagem);
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
              <Card key={n.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="text-[10px] uppercase text-primary font-bold">
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
              <div className="font-bold">{state.agent.agencia}</div>
              <div className="text-sm text-muted-foreground">
                {state.agent.nome} {state.agent.sobrenome} • {state.agent.cidade} - {state.agent.estado}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-3 text-center">
                <Stat label="CAIXA" value={`R$ ${state.dinheiro.toLocaleString("pt-BR")}`} />
                <Stat label="PRESTÍGIO" value={"★".repeat(state.prestigio)} />
                <Stat label="REPUTAÇÃO" value={String(state.reputacao)} />
                <Stat label="CLIENTES" value={String(state.jogadores.length)} />
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Empresários rivais</div>
              <div className="space-y-2">
                {state.rivais.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{r.agencia} <span className="text-muted-foreground">• {r.nome}</span></span>
                    <span className="text-xs text-muted-foreground">{r.clientes} clientes • rep {r.reputacao}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div>
              <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Movimentações financeiras</div>
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
                {state.financas.length === 0 && <div className="text-center text-xs text-muted-foreground py-4">Sem lançamentos.</div>}
              </div>
            </div>
          </div>
        )}

        {view === "detail" && selected && (
          <PlayerDetail
            player={selected}
            state={state}
            onBack={() => setView(voltarPara)}
            onObservar={handleObservar}
            onConversar={handleConversar}
            onPropor={handlePropor}
            onPeneira={() => setPeneiraFor(selected)}
          />
        )}
      </div>

      <Dialog open={!!peneiraFor} onOpenChange={(o) => !o && setPeneiraFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Inscrever {peneiraFor?.nome} em peneira</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">
            Cada clube tem um perfil próprio. Nem todos vão atender você.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {state.clubes.map(c => {
              const custo = custoPeneira(c);
              return (
                <button key={c.id} disabled={state.dinheiro < custo} onClick={() => handleEnviarPeneira(c)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors disabled:opacity-40">
                  <div className="flex items-center gap-3">
                    <ClubCrest cores={c.cores} abrev={c.abrev} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{c.nome}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.categoria} • {c.personalidade}</div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-base font-black text-primary truncate">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function MenuTile({ icon, label, onClick, badge }: {
  icon: React.ReactNode; label: string; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick}
      className="relative rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-secondary hover:scale-[1.03] shadow-[var(--shadow-card)]">
      <div className="text-primary">{icon}</div>
      <div className="mt-2 text-sm font-bold">{label}</div>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground animate-in zoom-in">
          {badge}
        </span>
      )}
    </button>
  );
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="rounded-lg border border-border bg-card p-2 hover:bg-secondary transition-colors">
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h2 className="text-xl font-black">{title}</h2>
    </div>
  );
}
