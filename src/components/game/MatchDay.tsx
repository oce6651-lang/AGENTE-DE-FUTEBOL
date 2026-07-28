import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClubCrest } from "./ClubCrest";
import { PlayerAvatar } from "./PlayerAvatar";
import { gerarRodada, simularPartida, destaquesDaPartida } from "@/lib/game/matches";
import type { Fixture, GameState, MatchEvent, MatchPlayer, MatchTeam } from "@/lib/game/types";
import { LOCATION_IMAGES } from "@/lib/game/locations";
import bgMatch from "@/assets/bg-match.jpg";
import {
  ArrowLeft, Clock, Users, Whistle, Play, Pause, FastForward, Star, Ticket,
} from "./icons";

type Step = "fixtures" | "lineups" | "live" | "report";

export function MatchDay({ state, local, onSair, onAssistir, onSalvarRadar }: {
  state: GameState;
  local: string;
  onSair: () => void;
  /** Cobra viagem + ingresso. Retorna false se não for possível. */
  onAssistir: (fx: Fixture) => boolean;
  onSalvarRadar: (destaques: MatchPlayer[], fx: Fixture) => void;
}) {
  const [step, setStep] = useState<Step>("fixtures");
  const [fixtures] = useState<Fixture[]>(() => gerarRodada(state, local, Math.floor(Math.random() * 500000) + 5000));
  const [fx, setFx] = useState<Fixture | null>(null);
  const [sim, setSim] = useState<{ eventos: MatchEvent[]; casa: MatchTeam; fora: MatchTeam } | null>(null);
  const [minuto, setMinuto] = useState(0);
  const [rodando, setRodando] = useState(true);
  const [velocidade, setVelocidade] = useState(1);
  const [destaques, setDestaques] = useState<MatchPlayer[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  const duracao = useMemo(() => sim ? sim.eventos[sim.eventos.length - 1].minuto : 90, [sim]);
  const visiveis = useMemo(() => sim ? sim.eventos.filter(e => e.minuto <= minuto) : [], [sim, minuto]);
  const placar = useMemo(() => {
    if (!sim) return [0, 0] as const;
    let c = 0, f = 0;
    for (const e of visiveis) if (e.tipo === "gol") { if (e.lado === "casa") c++; else f++; }
    return [c, f] as const;
  }, [visiveis, sim]);

  useEffect(() => {
    if (step !== "live" || !rodando || !sim) return;
    const t = setInterval(() => {
      setMinuto(m => {
        if (m >= duracao) return m;
        return m + 1;
      });
    }, 420 / velocidade);
    return () => clearInterval(t);
  }, [step, rodando, sim, duracao, velocidade]);

  useEffect(() => {
    if (minuto >= duracao && sim && step === "live") {
      const d = destaquesDaPartida(sim.casa, sim.fora);
      setDestaques(d);
      const t = setTimeout(() => setStep("report"), 1200);
      return () => clearTimeout(t);
    }
  }, [minuto, duracao, sim, step]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [visiveis.length]);

  const escolher = (f: Fixture) => { setFx(f); setStep("lineups"); };

  const iniciar = () => {
    if (!fx) return;
    if (!onAssistir(fx)) return;
    setSim(simularPartida(fx));
    setMinuto(0);
    setRodando(true);
    setStep("live");
  };

  // ---------- 1. calendário do dia ----------
  if (step === "fixtures") {
    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-300">
        <Header title={local} sub="Programação de hoje" onBack={onSair} />
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-card)]">
          <img src={LOCATION_IMAGES[local]} alt={local} className="h-40 w-full object-cover" width={1600} height={900} />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-bold">Dia de jogo</div>
              <div className="text-2xl font-black">{local}</div>
            </div>
            <Badge variant="secondary" className="gap-1"><Ticket /> viagem + ingresso</Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Escolha <b>uma única partida</b> para assistir. Um olheiro não consegue estar em dois campos ao mesmo tempo.
        </p>

        <div className="space-y-3">
          {fixtures.map(f => (
            <button key={f.id} onClick={() => escolher(f)}
              className="group w-full rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:bg-secondary hover:scale-[1.01] shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1 w-16">
                  <Badge className="text-[10px]">{f.categoria}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock />{f.horario}</span>
                </div>
                <div className="flex flex-1 items-center justify-center gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                    <span className="truncate text-sm font-bold text-right">{f.casa.nome}</span>
                    <ClubCrest cores={f.casa.cores} abrev={f.casa.abrev} size={34} />
                  </div>
                  <span className="text-xs text-muted-foreground font-black">x</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <ClubCrest cores={f.fora.cores} abrev={f.fora.abrev} size={34} />
                    <span className="truncate text-sm font-bold">{f.fora.nome}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Users />{f.publico} pessoas</span>
                <span className="flex items-center gap-1"><Whistle />{f.arbitro}</span>
                <span className="ml-auto text-primary font-bold group-hover:translate-x-1 transition-transform">Assistir →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- 2. escalações ----------
  if (step === "lineups" && fx) {
    return (
      <div className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <Header title={`${fx.categoria}`} sub={`${fx.local} • ${fx.horario}`} onBack={() => setStep("fixtures")} />
        <Card className="relative overflow-hidden p-4">
          <img src={bgMatch} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" width={1600} height={900} />
          <div className="relative flex items-center justify-around">
            <TeamHead time={fx.casa} />
            <div className="text-center">
              <div className="text-3xl font-black">VS</div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-center mt-1">
                <Whistle />{fx.arbitro}
              </div>
            </div>
            <TeamHead time={fx.fora} />
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          <Lineup time={fx.casa} />
          <Lineup time={fx.fora} />
        </div>

        <Button onClick={iniciar} className="w-full h-14 font-black text-base"
          style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
          <Play /> Assistir à partida
        </Button>
      </div>
    );
  }

  // ---------- 3. simulação minuto a minuto ----------
  if (step === "live" && fx && sim) {
    return (
      <div className="p-4 space-y-4">
        <Card className="relative overflow-hidden">
          <img src={bgMatch} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" width={1600} height={900} />
          <div className="relative p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <ClubCrest cores={sim.casa.cores} abrev={sim.casa.abrev} size={38} />
                <span className="truncate text-sm font-bold">{sim.casa.nome}</span>
              </div>
              <div className="text-center px-3">
                <div className="text-3xl font-black tabular-nums">{placar[0]} <span className="text-muted-foreground">:</span> {placar[1]}</div>
                <div className="text-[11px] text-primary font-bold animate-pulse">{minuto}'</div>
              </div>
              <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                <span className="truncate text-sm font-bold text-right">{sim.fora.nome}</span>
                <ClubCrest cores={sim.fora.cores} abrev={sim.fora.abrev} size={38} />
              </div>
            </div>
            <Progress value={(minuto / duracao) * 100} className="mt-3 h-1.5" />
          </div>
        </Card>

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setRodando(r => !r)}>
            {rodando ? <><Pause /> Pausar</> : <><Play /> Continuar</>}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setVelocidade(v => v === 1 ? 2 : v === 2 ? 4 : 1)}>
            <FastForward /> {velocidade}x
          </Button>
          <Button variant="outline" onClick={() => setMinuto(duracao)}>Pular</Button>
        </div>

        <div ref={feedRef} className="h-[46vh] overflow-y-auto space-y-2 pr-1">
          {visiveis.map((e, i) => (
            <div key={i}
              className={"animate-in fade-in slide-in-from-bottom-1 duration-300 rounded-xl border px-3 py-2 text-sm " +
                (e.tipo === "gol" ? "border-primary bg-primary/10 font-bold"
                  : e.tipo === "cartao" ? "border-accent/40 bg-accent/10"
                  : "border-border bg-card")}>
              <span className="mr-2 text-[11px] font-black text-muted-foreground tabular-nums">{e.minuto}'</span>
              {e.texto}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------- 4. relatório ----------
  if (step === "report" && fx && sim) {
    const todos = [...sim.casa.titulares, ...sim.fora.titulares].sort((a, b) => b.nota - a.nota);
    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-300">
        <Header title="Relatório de scout" sub={`${sim.casa.nome} ${sim.casa.gols} x ${sim.fora.gols} ${sim.fora.nome}`} onBack={onSair} />

        <Card className="p-4">
          <div className="text-xs uppercase font-bold text-primary flex items-center gap-1"><Star /> Chamaram atenção</div>
          {destaques.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Ninguém se destacou. Foi uma tarde perdida — acontece na vida de olheiro.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {destaques.map(d => (
                <div key={d.player.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
                  <PlayerAvatar seed={d.player.visual} ring />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{d.player.nome}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.player.idade} anos • {d.player.posicao} • {d.player.altura}cm • {d.player.pe}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-primary">{d.nota.toFixed(1)}</div>
                    <div className="text-[10px] text-muted-foreground">nota</div>
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={() => { onSalvarRadar(destaques, fx); onSair(); }}>
                Adicionar ao radar da agência
              </Button>
            </div>
          )}
        </Card>

        <div>
          <div className="text-xs uppercase font-bold text-muted-foreground mb-2">Notas da partida</div>
          <div className="grid gap-1 sm:grid-cols-2">
            {todos.map(m => (
              <div key={m.player.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-1.5 text-xs">
                <span className="truncate">
                  <span className="text-muted-foreground mr-1">{m.numero}</span>{m.player.nome}
                </span>
                <span className={"font-black " + (m.nota >= 7.5 ? "text-primary" : m.nota < 5 ? "text-destructive" : "")}>
                  {m.nota.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="secondary" className="w-full" onClick={onSair}>Voltar ao escritório</Button>
      </div>
    );
  }

  return null;
}

function Header({ title, sub, onBack }: { title: string; sub?: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="rounded-lg border border-border bg-card p-2 hover:bg-secondary transition-colors">
        <ArrowLeft />
      </button>
      <div className="min-w-0">
        <h2 className="text-xl font-black truncate">{title}</h2>
        {sub && <div className="text-xs text-muted-foreground truncate">{sub}</div>}
      </div>
    </div>
  );
}

function TeamHead({ time }: { time: MatchTeam }) {
  return (
    <div className="flex flex-col items-center gap-1 w-28">
      <ClubCrest cores={time.cores} abrev={time.abrev} size={52} />
      <div className="text-xs font-bold text-center leading-tight">{time.nome}</div>
      <div className="text-[10px] text-muted-foreground">{time.formacao}</div>
    </div>
  );
}

function Lineup({ time }: { time: MatchTeam }) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <ClubCrest cores={time.cores} abrev={time.abrev} size={26} />
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{time.nome}</div>
          <div className="text-[10px] text-muted-foreground truncate">Técnico: {time.tecnico}</div>
        </div>
      </div>
      <ul className="mt-2 space-y-1">
        {time.titulares.map(m => (
          <li key={m.player.id} className="flex items-center gap-2 text-xs">
            <span className="w-5 text-muted-foreground tabular-nums">{m.numero}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0">{m.player.posicao}</Badge>
            <span className="truncate">{m.player.nome}</span>
            <span className="ml-auto text-muted-foreground">{m.player.idade}a</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-border pt-2">
        <div className="text-[10px] uppercase text-muted-foreground mb-1">Banco</div>
        <ul className="space-y-0.5">
          {time.reservas.map(m => (
            <li key={m.player.id} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="w-5 tabular-nums">{m.numero}</span>
              <span className="truncate">{m.player.nome}</span>
              <span className="ml-auto">{m.player.posicao}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
