import { useState } from "react";
import { toast } from "sonner";
import { StatusBar } from "./StatusBar";
import { PlayerCard } from "./PlayerCard";
import { PlayerDetail } from "./PlayerDetail";
import { CareerHistory } from "./CareerHistory";
import { PlayerAvatar } from "./PlayerAvatar";
import { MatchDay } from "./MatchDay";
import { ClubCrest } from "./ClubCrest";
import { LeagueBrowser } from "./LeagueBrowser";
import { CompetitionLogo } from "./CompetitionLogo";
import { COMPETICOES } from "@/lib/game/data/leagues";
import { AdminClubs, AdminCompetitions, AdminUpgrades } from "./AdminEditors";
import { janelaAberta, statusJanela } from "@/lib/game/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Club, ClubResponse, Fixture, GameState, MatchPlayer, Player } from "@/lib/game/types";
import { MESES } from "@/lib/game/types";
import {
  avancarSemana, conversar, observarJogador, propor, responderNegociacao,
  enviarPeneira, custoPeneira, podeAssistir, pagarPartida, adicionarAoRadar, CUSTOS,
  UPGRADES, comprarUpgrade, temUpgrade, custoViagem, custoObservacao,
} from "@/lib/game/engine";
import { oferecerParaClubes, negociarComClube, CUSTO_OFERTA, CUSTO_ABORDAGEM } from "@/lib/game/offers";
import { inscreverPeneiraAberta, jogadoresElegiveis, cancelarPeneira } from "@/lib/game/tryouts";
import { gerarJogador } from "@/lib/game/generators";
import {
  acionarContatos, realizarPeneiraPropria, podeFazerPeneiraPropria, CUSTOS_DESCOBERTA,
} from "@/lib/game/discovery";
import { LOCATIONS, localLiberado, requisitoTexto, getLocation } from "@/lib/game/locations";
import type { ScoutLocation } from "@/lib/game/locations";
import officeHero from "@/assets/office-hero.jpg";
import heroArquivo from "@/assets/hero-arquivo.jpg";
import heroCompeticoes from "@/assets/hero-competicoes.jpg";
import heroTitulos from "@/assets/hero-titulos.jpg";
import {
  Search, Users, Target, Handshake, Newspaper, Briefcase, Radar, ArrowLeft, ChevronRight,
  Lock, Star, Building2, Check, Megaphone, ShieldCheck, CalendarClock, Archive, Trophy,
  Phone, ListTree, BarChart3,
} from "lucide-react";

type View =
  | "home" | "locais" | "matchday" | "radar" | "myPlayers" | "negotiations" | "news"
  | "agency" | "detail" | "tryouts" | "openTryouts" | "clubs" | "admin"
  | "arquivo" | "competicoes" | "ligas" | "descoberta" | "temporada";

/** Único código autorizado a abrir o painel administrativo. */
const ADMIN_CODE = "GGG-209-213";

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
  const [adminCode, setAdminCode] = useState("");
  const [adminOk, setAdminOk] = useState(false);
  const [negociarFor, setNegociarFor] = useState<Player | null>(null);
  const [clubeFiltro, setClubeFiltro] = useState("");
  const [compAberta, setCompAberta] = useState<string | null>(null);
  const [arquivoAberto, setArquivoAberto] = useState<string | null>(null);
  const [compFiltro, setCompFiltro] = useState<string>("");

  const selected = selectedId
    ? state.jogadores.find(p => p.id === selectedId) ?? state.radar.find(p => p.id === selectedId) ?? null
    : null;

  const openPlayer = (p: Player, origem: View) => { setSelectedId(p.id); setVoltarPara(origem); setView("detail"); };

  const handleAvancar = () => {
    const { state: next, eventos } = avancarSemana(state);
    setState(next);
    toast(eventos[0] ?? "Semana avançada", { description: eventos[1] });
  };

  const handleAvancarMes = () => {
    let s = state;
    const acumulados: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = avancarSemana(s);
      s = r.state;
      acumulados.push(...r.eventos);
    }
    setState(s);
    toast("Um mês se passou", { description: acumulados.slice(0, 2).join(" • ") || undefined });
  };

  const handleContatos = () => {
    const r = acionarContatos(state);
    setState(r.state); toast(r.mensagem);
  };

  const handlePeneiraPropria = () => {
    const r = realizarPeneiraPropria(state);
    setState(r.state); toast(r.mensagem);
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

  const handleNegociarClube = (clube: Club) => {
    if (!negociarFor) return;
    const r = negociarComClube(state, negociarFor.id, clube.id);
    setState(r.state);
    toast(`${clube.nome}`, { description: r.mensagem });
    if (r.resposta?.resultado === "interessado") { setNegociarFor(null); setView("negotiations"); }
  };

  // ---------- ações administrativas ----------
  const avancarVarias = (semanas: number) => {
    let s = state;
    for (let i = 0; i < semanas; i++) s = avancarSemana(s).state;
    setState(s);
    toast(`${semanas} semana(s) simuladas.`);
  };

  const gerarTalentoAdmin = () => {
    const p = gerarJogador({
      cidade: state.agent.cidade, local: "Convocação administrativa",
      nextId: Math.floor(Math.random() * 900000) + 90000,
      ano: state.ano, mes: state.mes, semana: state.semana,
      estado: state.agent.estado, pais: state.agent.pais,
      forcarIdade: 16, forcarAtual: [40, 60], forcarPotencial: [88, 99],
    });
    setState({ ...state, radar: [{ ...p, confianca: 100, familiaConfia: true, observado: 4 }, ...state.radar] });
    toast(`${p.nome} adicionado ao radar.`);
  };

  const assinarAdmin = (p: Player) => {
    setState({
      ...state,
      radar: state.radar.filter(x => x.id !== p.id),
      jogadores: [{ ...p, empresario: state.agent.id, confianca: 100, status: "Sem clube" }, ...state.jogadores],
    });
    toast(`${p.nome} assinou com a agência.`);
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
              <MenuTile icon={<Archive className="h-6 w-6" />} label="Arquivo de clientes"
                badge={state.jogadores.length + (state.historicoAgencia?.length ?? 0)} onClick={() => setView("arquivo")} />
              <MenuTile icon={<Trophy className="h-6 w-6" />} label="Competições"
                badge={state.historicoCompeticoes?.length ?? 0} onClick={() => setView("competicoes")} />
              <MenuTile icon={<Briefcase className="h-6 w-6" />} label="Agência" onClick={() => setView("agency")} />
              <MenuTile icon={<ClubCrest cores={["#1f8ecd", "#0b1d2e"]} abrev="CLB" size={26} />} label="Clubes" onClick={() => setView("clubs")} />
              <MenuTile icon={<Phone className="h-6 w-6" />} label="Descoberta" onClick={() => setView("descoberta")} />
              <MenuTile icon={<ListTree className="h-6 w-6" />} label="Ligas" onClick={() => setView("ligas")} />
              <MenuTile icon={<BarChart3 className="h-6 w-6" />} label="Fim de temporada"
                badge={state.resumosTemporada?.length ?? 0} onClick={() => setView("temporada")} />
              <MenuTile icon={<ShieldCheck className="h-6 w-6" />} label="ADM" onClick={() => setView("admin")} />
            </div>

            <Button onClick={handleAvancar} className="w-full h-14 text-base font-black hover:scale-[1.01] transition-transform"
              style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
              Avançar semana
            </Button>
            <Button variant="secondary" onClick={handleAvancarMes}
              className="w-full h-12 text-sm font-bold">
              Avançar mês (4 semanas)
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
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1"
                    onClick={() => { setNegociarFor(p); setClubeFiltro(""); }}>
                    Procurar clube (R$ {CUSTO_ABORDAGEM})
                  </Button>
                  {!p.clube && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setPeneiraFor(p)}>
                      Pedir teste em clube
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
                  Área restrita ao administrador do jogo. Informe o código de acesso.
                </p>
                <div>
                  <Label>Código</Label>
                  <Input value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="XXX-000-000" />
                </div>
                <Button className="w-full" onClick={() => {
                  if (adminCode.trim().toUpperCase() === ADMIN_CODE) { setAdminOk(true); toast("Acesso liberado."); }
                  else toast("Código inválido.");
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
                  <div className="text-xs uppercase font-bold text-muted-foreground">Agência e acesso</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setState({ ...state, prestigio: Math.min(5, state.prestigio + 1) })}>+1 prestígio</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, prestigio: Math.max(1, state.prestigio - 1) })}>-1 prestígio</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, reputacao: 100, prestigio: 5 })}>Liberar todos os locais</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, upgrades: UPGRADES.map(u => u.id), energiaMax: state.energiaMax + 2 })}>
                      Liberar estruturas
                    </Button>
                    <Button variant="secondary" onClick={() => setState({
                      ...state,
                      clubes: state.clubes.map(c => ({ ...c, confiancaEmVoce: 100 })),
                    })}>Clubes confiam 100%</Button>
                    <Button variant="secondary" onClick={() => setState({ ...state, energia: 99, energiaMax: Math.max(state.energiaMax, 99) })}>
                      Energia infinita
                    </Button>
                  </div>
                </Card>
                <Card className="p-4 space-y-3">
                  <div className="text-xs uppercase font-bold text-muted-foreground">Tempo e mundo</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => avancarVarias(4)}>Avançar 1 mês</Button>
                    <Button variant="secondary" onClick={() => avancarVarias(48)}>Avançar 1 ano</Button>
                    <Button variant="secondary" onClick={() => setState({
                      ...state,
                      jogadores: state.jogadores.map(p => ({ ...p, lesaoSemanas: 0 })),
                    })}>Curar lesões</Button>
                    <Button variant="secondary" onClick={() => setState({
                      ...state,
                      negociacoes: state.negociacoes.filter(n => n.status === "aberta"),
                    })}>Limpar histórico de propostas</Button>
                  </div>
                </Card>
                <Card className="p-4 space-y-3">
                  <div className="text-xs uppercase font-bold text-muted-foreground">Radar e contratos</div>
                  <Button variant="secondary" className="w-full" onClick={gerarTalentoAdmin}>
                    Gerar talento no radar
                  </Button>
                  {state.radar.length === 0 && <div className="text-xs text-muted-foreground">Radar vazio.</div>}
                  {state.radar.slice(0, 12).map(p => (
                    <div key={p.id} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-bold truncate">{p.nome}</div>
                        <div className="text-muted-foreground">{p.idade}a • {p.posicao} • OVR {p.atual} / POT {p.potencial}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => assinarAdmin(p)}>Assinar</Button>
                    </div>
                  ))}
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
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { potencial: Math.max(p.atual, p.potencial - 5) })}>POT -5</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { lesaoSemanas: 0, status: p.clube ? `No ${p.clube}` : "Sem clube" })}>Curar</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { idade: Math.max(9, p.idade - 1) })}>Idade -1</Button>
                        <Button size="sm" variant="outline" onClick={() => editarAtleta(state, setState, p.id, { idade: p.idade + 1 })}>Idade +1</Button>
                      </div>
                    </div>
                  ))}
                </Card>
                <AdminClubs state={state} setState={setState} />
                <AdminCompetitions state={state} setState={setState} />
                <AdminUpgrades state={state} setState={setState} />
              </>

            )}
          </div>
        )}

        {view === "clubs" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Clubes" onBack={() => setView("home")} />
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img src={heroCompeticoes} alt="Estádio lotado" loading="lazy" width={1280} height={720}
                className="h-28 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute bottom-2 left-3 text-xs text-muted-foreground">
                {state.clubes.length} clubes no mundo do jogo
              </div>
            </div>
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
                  {(t.status === "em_andamento" || t.status === "mais_tempo") && (
                    <Button size="sm" variant="destructive" className="w-full mt-3"
                      onClick={() => {
                        const r = cancelarPeneira(state, t.id);
                        setState(r.state); toast(r.mensagem);
                      }}>
                      Cancelar avaliação
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {view === "negotiations" && (
          <div className="p-4 space-y-3">
            <SubHeader title="Negociações" onBack={() => setView("home")} />
            <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${janelaAberta(state.mes) ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-secondary/40 text-muted-foreground"}`}>
              {statusJanela(state)}
            </div>
            {state.negociacoes.filter(n => n.status === "aberta").length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma proposta em aberto. A maioria das ofertas chega durante as janelas de transferência.
              </div>
            )}
            {state.negociacoes.filter(n => n.status === "aberta").map(n => {
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

        {view === "arquivo" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Arquivo da agência" onBack={() => setView("home")} />
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img src={heroArquivo} alt="Arquivo de clientes da agência" loading="lazy" width={1280} height={720}
                className="h-32 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="text-lg font-black">{state.agent.agencia}</div>
                <div className="text-[11px] text-muted-foreground">
                  {state.jogadores.length} cliente(s) ativos • {(state.historicoAgencia?.length ?? 0)} ex-cliente(s)
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Todo atleta que passou pela agência fica registrado para sempre, com a carreira completa temporada a temporada.
            </p>

            <div className="text-xs font-black uppercase text-muted-foreground">Clientes atuais</div>
            {state.jogadores.length === 0 && (
              <div className="text-xs text-muted-foreground">Nenhum cliente ativo.</div>
            )}
            {state.jogadores.map(p => (
              <ArquivoItem key={p.id} p={p} aberto={arquivoAberto === p.id}
                onToggle={() => setArquivoAberto(arquivoAberto === p.id ? null : p.id)} />
            ))}

            <div className="text-xs font-black uppercase text-muted-foreground pt-2">Ex-clientes</div>
            {(state.historicoAgencia?.length ?? 0) === 0 && (
              <div className="text-xs text-muted-foreground">Nenhum ex-cliente ainda.</div>
            )}
            {(state.historicoAgencia ?? []).map(p => (
              <ArquivoItem key={p.id} p={p} antigo aberto={arquivoAberto === p.id}
                onToggle={() => setArquivoAberto(arquivoAberto === p.id ? null : p.id)} />
            ))}
          </div>
        )}

        {view === "competicoes" && (
          <div className="p-4 space-y-4">
            <SubHeader title="Competições" onBack={() => setView("home")} />
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img src={heroTitulos} alt="Sala de troféus" loading="lazy" width={1280} height={720}
                className="h-32 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <div className="text-lg font-black">Histórico de competições</div>
                <div className="text-[11px] text-muted-foreground">
                  {(state.historicoCompeticoes?.length ?? 0)} edições registradas
                </div>
              </div>
            </div>
            <Input placeholder="Filtrar por competição, categoria ou campeão"
              value={compFiltro} onChange={e => setCompFiltro(e.target.value)} />
            {(state.historicoCompeticoes?.length ?? 0) === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Nenhuma temporada encerrada ainda. Avance até dezembro para conhecer os campeões.
              </div>
            )}

            {/* Lista de competições — clique para abrir o histórico completo */}
            {!compAberta && (() => {
              const q = compFiltro.trim().toLowerCase();
              const grupos = new Map<string, { nome: string; anos: Set<number>; edicoes: number }>();
              for (const e of state.historicoCompeticoes ?? []) {
                if (q && !`${e.competicao} ${e.categoria} ${e.campeao} ${e.ano}`.toLowerCase().includes(q)) continue;
                const g = grupos.get(e.competicao) ?? { nome: e.competicao, anos: new Set<number>(), edicoes: 0 };
                g.anos.add(e.ano); g.edicoes += 1;
                grupos.set(e.competicao, g);
              }
              return Array.from(grupos.values())
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map(g => (
                  <button key={g.nome} onClick={() => setCompAberta(g.nome)}
                    className="w-full text-left rounded-2xl border border-border bg-card p-3 flex items-center gap-3 hover:border-primary hover:bg-secondary/50 transition-colors">
                    {(() => {
                      const meta = [...COMPETICOES, ...(state.competicoesCustom ?? [])]
                        .find(c => c.nome === g.nome);
                      return (
                        <CompetitionLogo nome={g.nome} tipo={meta?.tipo ?? "copa"}
                          modalidade={meta?.modalidade ?? "campo"} size={30} />
                      );
                    })()}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate">{g.nome}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {g.anos.size} temporada(s) • {g.edicoes} título(s) registrados
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </button>
                ));
            })()}

            {/* Histórico ano a ano de uma competição */}
            {compAberta && (
              <div className="space-y-3">
                <Button variant="secondary" size="sm" onClick={() => setCompAberta(null)}>
                  <ArrowLeft className="h-4 w-4" /> Todas as competições
                </Button>
                <div className="text-lg font-black">{compAberta}</div>
                {(state.historicoCompeticoes ?? [])
                  .filter(e => e.competicao === compAberta)
                  .sort((a, b) => b.ano - a.ano || a.categoria.localeCompare(b.categoria))
                  .map((e, i) => {
                    const c = state.clubes.find(x => x.nome === e.campeao);
                    return (
                      <Card key={`${e.ano}-${e.categoria}-${i}`} className="p-3 flex items-center gap-3">
                        {c ? <ClubCrest cores={c.cores} abrev={c.abrev} size={34} />
                          : <Trophy className="h-7 w-7 text-primary" />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold truncate">
                            {e.ano} <span className="text-muted-foreground font-normal">• {e.categoria}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            Campeão: <span className="text-primary font-bold">{e.campeao}</span> • Vice: {e.vice}
                          </div>
                          {!!e.clientes?.length && (
                            <div className="text-[10px] text-primary mt-0.5 truncate">
                              Seus clientes campeões: {e.clientes.map(x => x.nome).join(", ")}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{e.categoria}</Badge>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {view === "ligas" && (
          <LeagueBrowser clubes={state.clubes} onBack={() => setView("home")} />
        )}

        {view === "descoberta" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-300">
            <SubHeader title="Descoberta de talentos" onBack={() => setView("home")} />
            <p className="text-xs text-muted-foreground">
              Nem todo craque aparece indo a campo. Use a rede de contatos, organize sua própria peneira
              e deixe a central de olheiros trabalhar por você.
            </p>
            <Card className="p-4 space-y-2">
              <div className="font-bold text-sm">Acionar rede de contatos</div>
              <div className="text-xs text-muted-foreground">
                Telefonemas para treinadores e amigos do meio. Custa R$ {CUSTOS_DESCOBERTA.contatos} e 1 de energia.
              </div>
              <Button className="w-full" onClick={handleContatos}
                disabled={state.energia <= 0 || state.dinheiro < CUSTOS_DESCOBERTA.contatos}>
                Fazer as ligações
              </Button>
            </Card>
            <Card className="p-4 space-y-2">
              <div className="font-bold text-sm">Peneira própria da agência</div>
              <div className="text-xs text-muted-foreground">
                Campo, arbitragem e divulgação: R$ {CUSTOS_DESCOBERTA.peneiraPropria.toLocaleString("pt-BR")} e 2 de energia.
              </div>
              <Button className="w-full" variant="secondary" onClick={handlePeneiraPropria}
                disabled={!podeFazerPeneiraPropria(state).ok}>
                Organizar peneira
              </Button>
              {!podeFazerPeneiraPropria(state).ok && (
                <div className="text-[11px] text-muted-foreground">{podeFazerPeneiraPropria(state).motivo}</div>
              )}
            </Card>
            <Card className="p-4 space-y-1">
              <div className="font-bold text-sm">Central de olheiros</div>
              <div className="text-xs text-muted-foreground">
                {temUpgrade(state, "olheiros")
                  ? "Em operação: seus olheiros mapeiam atletas sozinhos toda semana."
                  : "Ainda não construída. Adquira na aba Agência para receber relatórios automáticos."}
              </div>
            </Card>
          </div>
        )}

        {view === "temporada" && (
          <div className="p-4 space-y-3 animate-in fade-in duration-300">
            <SubHeader title="Fim de temporada" onBack={() => setView("home")} />
            {!(state.resumosTemporada ?? []).length && (
              <div className="text-xs text-muted-foreground text-center py-10">
                Nenhuma temporada encerrada ainda. Avance até dezembro para ver o balanço da agência.
              </div>
            )}
            {(state.resumosTemporada ?? []).map(r => (
              <Card key={r.ano} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black">Temporada {r.ano}</div>
                  <Badge variant="secondary" className="text-[10px]">{r.clientes} cliente(s)</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Caixa no fim" value={`R$ ${r.dinheiroFim.toLocaleString("pt-BR")}`} />
                  <Stat label="Reputação" value={`${r.reputacaoInicio} → ${r.reputacaoFim}`} />
                  <Stat label="Receita" value={`R$ ${r.receita.toLocaleString("pt-BR")}`} />
                  <Stat label="Despesa" value={`R$ ${r.despesa.toLocaleString("pt-BR")}`} />
                </div>
                {!!r.destaques.length && (
                  <div className="space-y-1">
                    {r.destaques.map((d, i) => (
                      <div key={i} className="text-xs text-muted-foreground">• {d}</div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {r.jogadores.map(j => (
                    <div key={j.playerId} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm truncate">{j.nome}</div>
                        <Badge variant="outline" className="text-[10px]">{j.ovrInicio} → {j.ovrFim} OVR</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {j.clube || "Sem clube"} • {j.categoria} • {j.jogos}J {j.gols}G {j.assistencias}A • nota {j.notaMedia.toFixed(2)}
                      </div>
                      {!!j.titulos.length && (
                        <div className="text-[11px] text-primary font-bold mt-1">{j.titulos.join(" • ")}</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
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

      {/* Abordagem direta a um clube específico */}
      <Dialog open={!!negociarFor} onOpenChange={(o) => !o && setNegociarFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Procurar clube para {negociarFor?.nome}</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">
            Você marca uma reunião presencial. O clube analisa nível, posição, idade e filosofia antes de responder.
          </p>
          <Input placeholder="Buscar clube, cidade ou divisão"
            value={clubeFiltro} onChange={e => setClubeFiltro(e.target.value)} />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {state.clubes
              .filter(c => {
                const q = clubeFiltro.trim().toLowerCase();
                return !q || `${c.nome} ${c.cidade} ${c.estado} ${c.categoria} ${c.liga}`.toLowerCase().includes(q);
              })
              .slice(0, 60)
              .map(c => (
                <button key={c.id} disabled={state.dinheiro < CUSTO_ABORDAGEM}
                  onClick={() => handleNegociarClube(c)}
                  className="w-full text-left rounded-xl border border-border bg-card p-3 hover:bg-secondary transition-colors disabled:opacity-40">
                  <div className="flex items-center gap-3">
                    <ClubCrest cores={c.cores} abrev={c.abrev} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{c.nome}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.categoria} • {c.personalidade} • {c.cidade}/{c.estado}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Confiança em você: {c.confiancaEmVoce}%</div>
                    </div>
                  </div>
                </button>
              ))}
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

/** Ficha resumida de um cliente (ou ex-cliente) com carreira expansível. */
function ArquivoItem({ p, aberto, onToggle, antigo = false }: {
  p: Player; aberto: boolean; onToggle: () => void; antigo?: boolean;
}) {
  const totais = (p.temporadas ?? []).reduce(
    (acc, t) => ({
      jogos: acc.jogos + t.jogos, gols: acc.gols + t.gols,
      assist: acc.assist + t.assistencias, titulos: acc.titulos + t.titulos.length,
    }),
    { jogos: 0, gols: 0, assist: 0, titulos: 0 },
  );
  return (
    <Card className={"overflow-hidden " + (antigo ? "opacity-90" : "")}>
      <button onClick={onToggle} className="w-full p-3 text-left hover:bg-secondary/40 transition-colors">
        <div className="flex items-center gap-3">
          <PlayerAvatar seed={p.visual} size={40} ring={!antigo} />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm truncate">{p.nome}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {p.id} • {p.idade} anos • {p.posicao} • {p.clube ?? (antigo ? "Carreira encerrada" : "Sem clube")}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {totais.jogos} jogos • {totais.gols} gols • {totais.assist} assistências • {totais.titulos} título(s)
            </div>
          </div>
          <Badge variant={antigo ? "secondary" : "default"} className="text-[10px]">
            {antigo ? "Ex-cliente" : `OVR ${p.atual}`}
          </Badge>
        </div>
      </button>
      {aberto && (
        <div className="border-t border-border p-3 space-y-4">
          {/* Dados pessoais e situação contratual */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Info rotulo="Identificação" valor={p.id} />
            <Info rotulo="Posição" valor={`${p.posicao} • ${p.pe}`} />
            <Info rotulo="Nascimento" valor={p.nascimento ?? `${p.idade} anos`} />
            <Info rotulo="Altura" valor={`${p.altura} cm`} />
            <Info rotulo="Naturalidade" valor={`${p.cidade}/${p.estado} • ${p.pais}`} />
            <Info rotulo="Clube do coração" valor={p.clubeCoracao ?? "—"} />
            <Info rotulo="Clube atual" valor={p.clube ?? (antigo ? "Carreira encerrada" : "Sem clube")} />
            <Info rotulo="Situação" valor={p.status} />
            <Info rotulo="Salário" valor={p.salario > 0 ? `R$ ${p.salario.toLocaleString("pt-BR")}/mês` : "—"} />
            <Info rotulo="Contrato até" valor={p.contratoAteAno ? `dez/${p.contratoAteAno}` : "—"} />
            <Info rotulo="Valor de mercado" valor={`R$ ${p.valorMercado.toLocaleString("pt-BR")}`} />
            <Info rotulo="Descoberto em" valor={p.local} />
            <Info rotulo="Confiança na agência" valor={`${p.confianca}%`} />
            <Info rotulo="Overall / potencial" valor={`${p.atual} / ${p.potencial}`} />
          </div>

          {/* Personalidade e objetivos de carreira */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Personalidade</div>
              <div className="flex flex-wrap gap-1">
                <Badge className="text-[10px]">{p.personalidade}</Badge>
                {(p.tracos ?? []).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Sonhos e objetivos</div>
              <ul className="text-[11px] text-muted-foreground space-y-0.5">
                {(p.sonhos ?? []).length
                  ? p.sonhos!.map(s => <li key={s}>• {s}</li>)
                  : <li>• Ainda não revelou seus objetivos.</li>}
              </ul>
            </div>
          </div>

          {/* Conquistas */}
          {(p.titulos?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Títulos conquistados</div>
              <div className="flex flex-wrap gap-1">
                {p.titulos!.map((t, i) => (
                  <Badge key={i} className="gap-1 text-[10px]">
                    <Trophy className="h-3 w-3" /> {t.ano} • {t.competicao} ({t.clube})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(p.convocacoes?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Convocações</div>
              <div className="flex flex-wrap gap-1">
                {p.convocacoes!.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {c.ano} • {c.selecao} ({c.jogos} jogos)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de carreira completo */}
          <div>
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Histórico de carreira</div>
            <CareerHistory player={p} compacto />
          </div>

          {/* Relatórios de observação */}
          {p.relatorios.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Relatórios de scout</div>
              <div className="space-y-2">
                {p.relatorios.slice(-5).reverse().map((r, i) => (
                  <div key={i} className="rounded-xl border border-border bg-secondary/40 p-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="truncate">{r.partida}</span>
                      <span className="font-black text-primary">{r.nota.toFixed(1)}</span>
                    </div>
                    <div className="text-[11px] mt-1">{r.texto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linha do tempo completa */}
          {p.timeline.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Linha do tempo</div>
              <ol className="relative border-s-2 border-border ms-2 space-y-2">
                {p.timeline.map((e, i) => (
                  <li key={i} className="ms-4">
                    <span className="absolute -start-1.5 mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                    <div className="text-[10px] uppercase text-muted-foreground">
                      {MESES[e.mes - 1]} {e.ano} • sem {e.semana}
                    </div>
                    <div className="text-[11px]">{e.texto}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/** Linha simples de informação usada na ficha do arquivo. */
function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-secondary/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{rotulo}</div>
      <div className="truncate font-semibold">{valor}</div>
    </div>
  );
}
