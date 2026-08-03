import { useState } from "react";
import { toast } from "sonner";
import { StatusBar } from "./StatusBar";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetail } from "./PlayerDetail";
import { CareerHistory } from "./CareerHistory";
import { MatchDay } from "./MatchDay";
import { ClubCrest } from "./ClubCrest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Club, ClubResponse, Fixture, GameState, MatchPlayer, Player } from "@/lib/game/types";
import {
  avancarSemana, conversar, observarJogador, propor, responderNegociacao,
  enviarPeneira, custoPeneira, podeAssistir, pagarPartida, adicionarAoRadar, CUSTOS,
  UPGRADES, comprarUpgrade, temUpgrade, custoViagem, custoObservacao,
} from "@/lib/game/engine";
import { oferecerParaClubes, CUSTO_OFERTA } from "@/lib/game/offers";
import { inscreverPeneiraAberta, jogadoresElegiveis } from "@/lib/game/tryouts";
import { LOCATIONS, localLiberado, requisitoTexto, getLocation } from "@/lib/game/locations";
import type { ScoutLocation } from "@/lib/game/locations";
import officeHero from "@/assets/office-hero.jpg";
import heroArquivo from "@/assets/hero-arquivo.jpg";
import heroCompeticoes from "@/assets/hero-competicoes.jpg";
import heroTitulos from "@/assets/hero-titulos.jpg";
import {
  Search, Users, Target, Handshake, Newspaper, Briefcase, Radar, ArrowLeft, ChevronRight,
  Lock, Star, Building2, Check, Megaphone, ShieldCheck, CalendarClock, Archive, Trophy,
} from "lucide-react";

type View =
  | "home" | "locais" | "matchday" | "radar" | "myPlayers" | "negotiations" | "news"
  | "agency" | "detail" | "tryouts" | "openTryouts" | "clubs" | "admin"
  | "arquivo" | "competicoes";

/** Único e-mail autorizado a abrir o painel administrativo. */
const ADMIN_EMAIL = "OCE6651@GMAIL.COM";

export function Office({ state, setState, onExit }: {
  state: GameState;
  setState: (s: GameState) => void;
  onExit: () => void;
}) {
  const [view, setView] = useState<View>("home");
  const [localId, setLocalId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voltarPara, setVoltarPara] = useState<View>("radar");
  const [peneiraFor, setPeneiraFor] = useState<Player | null>(null);
  const [ofertaFor, setOfertaFor] = useState<Player | null>(null);
  const [respostas, setRespostas] = useState<ClubResponse[]>([]);
  const [abertaFor, setAbertaFor] = useState<Player | null>(null);
  const [inscreverEm, setInscreverEm] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminOk, setAdminOk] = useState(false);

  const selected = selectedId
    ? state.jogadores.find(p => p.id === selectedId) ?? state.radar.find(p => p.id === selectedId) ?? null
    : null;

  const openPlayer = (p: Player, origem: View) => { setSelectedId(p.id); setVoltarPara(origem); setView("detail"); };

  const handleAvancar = () => {
    const { state: next, eventos } = avancarSemana(state);
    setState(next);
    toast(eventos[0] ?? "Semana avançada", { description: eventos[1] });
  };

  const abrirLocal = (l: ScoutLocation) => {
    const check = podeAssistir(state, l);
    if (!check.ok) { toast(check.motivo!); return; }
    setLocalId(l.id); setView("matchday");
  };

  const cobrarPartida = (fx: Fixture) => {
    if (!localId) return false;
    const l = getLocation(localId);
    const check = podeAssistir(state, l);
    if (!check.ok) { toast(check.motivo!); return false; }
    setState(pagarPartida(state, fx, l));
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

  const handleOferecer = (p: Player) => {
    const r = oferecerParaClubes(state, p.id);
    setState(r.state);
    toast(r.mensagem);
    if (r.respostas.length) { setOfertaFor(p); setRespostas(r.respostas); }
  };

  const handleInscrever = (playerId: string, openId: string) => {
    const r = inscreverPeneiraAberta(state, playerId, openId);
    setState(r.state); toast(r.mensagem);
    setInscreverEm(null); setAbertaFor(null);
  };

  const abertas = state.negociacoes.filter(n => n.status === "aberta").length;
  const peneirasAtivas = state.peneiras.filter(p => p.status === "em_andamento" || p.status === "mais_tempo").length;
  const peneirasAbertas = state.peneirasAbertas ?? [];

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
              <MenuTile icon={<Megaphone className="h-6 w-6" />} label="Peneiras abertas" badge={peneirasAbertas.length} onClick={() => setView("openTryouts")} />
              <MenuTile icon={<Handshake className="h-6 w-6" />} label="Negociações" badge={abertas} onClick={() => setView("negotiations")} />
              <MenuTile icon={<Newspaper className="h-6 w-6" />} label="Notícias" onClick={() => setView("news")} />
              <MenuTile icon={<Briefcase className="h-6 w-6" />} label="Agência" onClick={() => setView("agency")} />
              <MenuTile icon={<ClubCrest cores={["#1f8ecd", "#0b1d2e"]} abrev="CLB" size={26} />} label="Clubes" onClick={() => setView("clubs")} />
              <MenuTile icon={<ShieldCheck className="h-6 w-6" />} label="ADM" onClick={() => setView("admin")} />
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
              Cada palco tem suas próprias categorias, custo e nível de talento. Palcos maiores só abrem as portas
              quando o meio do futebol passa a te conhecer. Todo deslocamento consome 1 ponto de energia da semana.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LOCATIONS.map(l => {
                const liberado = localLiberado(l, state.reputacao, state.prestigio);
                const total = custoViagem(state, l) + l.custoIngresso;
                return (
                  <button
                    key={l.id}
                    onClick={() => liberado ? abrirLocal(l) : toast(requisitoTexto(l))}
                    className={"group relative overflow-hidden rounded-2xl border text-left shadow-[var(--shadow-card)] transition-all "
                      + (liberado ? "border-border hover:border-primary hover:scale-[1.01]" : "border-border/60 opacity-70")}
                  >
                    <img src={l.imagem} alt={l.nome} loading="lazy" width={1024} height={576}
                      className={"w-full h-32 object-cover transition-transform duration-700 "
                        + (liberado ? "group-hover:scale-110" : "grayscale")} />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Star className="h-3 w-3" /> Nível {l.nivel}
                      </Badge>
                      {!liberado && <Badge variant="outline" className="text-[10px] gap-1"><Lock className="h-3 w-3" /> Bloqueado</Badge>}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3">
                      <div className="font-black flex items-center gap-1">
                        {l.nome}
                        {liberado && <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">{l.descricao}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.categorias.map(c => (
                          <span key={c} className="rounded bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold text-secondary-foreground">{c}</span>
                        ))}
                      </div>
                      <div className="mt-1.5 text-[10px] font-bold">
                        {liberado
                          ? <span className="text-primary">R$ {total.toLocaleString("pt-BR")} por viagem</span>
                          : <span className="text-muted-foreground">{requisitoTexto(l)}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "matchday" && localId && (
          <MatchDay
            state={state}
            loc={getLocation(localId)}
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
              <div key={p.id} className="space-y-2">
                <PlayerCard player={p} revealPotencial onClick={() => openPlayer(p, "myPlayers")} />
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1"
                    onClick={() => handleOferecer(p)}>
                    Oferecer ao mercado (R$ {CUSTO_OFERTA})
                  </Button>
                  {!p.clube && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setAbertaFor(p)}>
                      Peneiras gratuitas
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "openTryouts" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Peneiras abertas" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Avaliações gratuitas divulgadas pelos clubes. Só atletas livres e dentro da idade podem se inscrever —
              a concorrência é enorme e a maioria volta para casa.
            </p>
            {peneirasAbertas.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma peneira divulgada nesta semana. Acompanhe as notícias.
              </div>
            )}
            {peneirasAbertas.map(pa => {
              const c = state.clubes.find(x => x.id === pa.clubId);
              if (!c) return null;
              const elegiveis = jogadoresElegiveis(state, pa);
              return (
                <Card key={pa.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <ClubCrest cores={c.cores} abrev={c.abrev} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{c.nome}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {pa.categoria} • até {pa.idadeMax} anos • {c.cidade}/{c.estado}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" /> {pa.mes}/{pa.ano} • semana {pa.semana} • {pa.vagas} vaga(s)
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">Nível {pa.nivel}</Badge>
                  </div>
                  <Button size="sm" className="mt-3 w-full" disabled={elegiveis.length === 0}
                    onClick={() => setInscreverEm(pa.id)}>
                    {elegiveis.length ? `Inscrever atleta (${elegiveis.length} elegível(is))` : "Nenhum atleta elegível"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {view === "admin" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Painel administrativo" onBack={() => setView("home")} />
            {!adminOk ? (
              <Card className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Área restrita ao administrador do jogo. Informe o e-mail autorizado.
                </p>
                <div>
                  <Label>E-mail</Label>
                  <Input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="email@exemplo.com" />
                </div>
                <Button className="w-full" onClick={() => {
                  if (adminEmail.trim().toUpperCase() === ADMIN_EMAIL) { setAdminOk(true); toast("Acesso liberado."); }
                  else toast("E-mail não autorizado.");
                }}>Entrar</Button>
              </Card>
            ) : (
              <>
                <Card className="p-4 space-y-3">
                  <div className="text-xs uppercase font-bold text-muted-foreground">Caixa e reputação</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setState({ ...state, dinheiro: state.dinheiro + 100_000 })}>+ R$ 100.000</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, dinheiro: Math.max(0, state.dinheiro - 100_000) })}>- R$ 100.000</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, reputacao: Math.min(100, state.reputacao + 5) })}>+5 reputação</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, energia: state.energiaMax })}>Recarregar energia</Button>
                  </div>
                </Card>
                <Card className="p-4 space-y-3">
                  <div className="text-xs uppercase font-bold text-muted-foreground">Editar atletas</div>
                  {state.jogadores.length === 0 && <div className="text-xs text-muted-foreground">Nenhum atleta representado.</div>}
                  {state.jogadores.map(p => (
                    <div key={p.id} className="rounded-xl border border-border bg-secondary/30 p-3">
                      <div className="font-bold text-sm">{p.nome} <span className="text-muted-foreground font-normal">• OVR {p.atual} / POT {p.potencial}</span></div>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { atual: Math.min(99, p.atual + 5) })}>OVR +5</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { atual: Math.max(1, p.atual - 5) })}>OVR -5</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { potencial: Math.min(100, p.potencial + 5) })}>POT +5</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { confianca: 100, observado: Math.max(4, p.observado) })}>Revelar</Button>
                      </div>
                    </div>
                  ))}
                </Card>
              </>
            )}
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
                    {c.liga} • {c.cidade} • {c.personalidade}
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
              <div className="text-xs uppercase font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Estrutura da agência
              </div>
              <div className="space-y-2">
                {UPGRADES.map(u => {
                  const possui = temUpgrade(state, u.id);
                  const podeComprar = !possui && state.reputacao >= u.reputacaoMin && state.dinheiro >= u.custo;
                  return (
                    <div key={u.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm flex items-center gap-2">
                          {u.nome}
                          {possui && <Badge className="text-[9px] gap-1"><Check className="h-3 w-3" /> ativo</Badge>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{u.descricao}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          R$ {u.custo.toLocaleString("pt-BR")}{u.reputacaoMin > 0 ? ` • exige ${u.reputacaoMin} de reputação` : ""}
                        </div>
                      </div>
                      {!possui && (
                        <Button size="sm" disabled={!podeComprar} onClick={() => {
                          const r = comprarUpgrade(state, u.id); setState(r.state); toast(r.mensagem);
                        }}>Investir</Button>
                      )}
                    </div>
                  );
                })}
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
            onOferecer={() => handleOferecer(selected)}
            onPeneiraAberta={() => { setAbertaFor(selected); }}
          />
        )}
      </div>

      {/* Respostas do mercado a uma oferta */}
      <Dialog open={!!ofertaFor} onOpenChange={(o) => !o && setOfertaFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Respostas do mercado — {ofertaFor?.nome}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {respostas.map(r => {
              const c = state.clubes.find(x => x.id === r.clubId);
              const cor = r.resultado === "interessado" ? "default"
                : r.resultado === "pede_teste" || r.resultado === "pede_informacoes" ? "secondary" : "outline";
              return (
                <div key={r.clubId} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2">
                    {c && <ClubCrest cores={c.cores} abrev={c.abrev} size={28} />}
                    <div className="font-bold text-sm flex-1 truncate">{r.clube}</div>
                    <Badge variant={cor as "default" | "secondary" | "outline"} className="text-[10px]">
                      {r.resultado.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{r.texto}</div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Escolher peneira gratuita para um atleta */}
      <Dialog open={!!abertaFor} onOpenChange={(o) => !o && setAbertaFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Peneiras gratuitas para {abertaFor?.nome}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {peneirasAbertas
              .filter(pa => abertaFor && !abertaFor.clube && abertaFor.idade <= pa.idadeMax && !pa.inscritos.includes(abertaFor.id))
              .map(pa => {
                const c = state.clubes.find(x => x.id === pa.clubId);
                if (!c || !abertaFor) return null;
                return (
                  <button key={pa.id} onClick={() => handleInscrever(abertaFor.id, pa.id)}
                    className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <ClubCrest cores={c.cores} abrev={c.abrev} size={30} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate text-sm">{c.nome}</div>
                        <div className="text-[11px] text-muted-foreground">{pa.categoria} • {pa.vagas} vaga(s) • nível {pa.nivel}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            {peneirasAbertas.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-6">Nenhuma peneira gratuita disponível.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Escolher atleta para uma peneira aberta específica */}
      <Dialog open={!!inscreverEm} onOpenChange={(o) => !o && setInscreverEm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Escolher atleta</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(() => {
              const pa = peneirasAbertas.find(x => x.id === inscreverEm);
              if (!pa) return null;
              return jogadoresElegiveis(state, pa).map(p => (
                <button key={p.id} onClick={() => handleInscrever(p.id, pa.id)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors">
                  <div className="font-bold text-sm">{p.nome}</div>
                  <div className="text-[11px] text-muted-foreground">{p.idade} anos • {p.posicao} • OVR {p.atual}</div>
                </button>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

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

/** Aplica ajustes administrativos em um atleta representado. */
function editarAtleta(
  state: GameState,
  setState: (s: GameState) => void,
  playerId: string,
  patch: Partial<Player>,
) {
  setState({
    ...state,
    jogadores: state.jogadores.map(p => p.id === playerId ? { ...p, ...patch } : p),
  });
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
