import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BadgeDollarSign, CalendarClock, ChevronDown, ChevronUp, Dumbbell, Gauge, Medal, Search, Shield, Swords, Target, Trophy, Users, Weight } from "lucide-react";
import combatHub from "@/assets/combat-hub.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { answerFightOffer, defaultCombatReputation, scoutFighter, seekFightOffer, setFightStrategy, signFighter, strategiesFor } from "@/lib/game/combat";
import type { CombatOffer, CombatSport, Fighter, FightHistoryEntry, GameState } from "@/lib/game/types";

import { CombatDiscovery } from "./CombatDiscovery";
import { CombatCareerControls, CombatOfferNegotiation } from "./CombatCareerControls";
import { CombatPlayback } from "./CombatPlayback";
import { attendCombatVisit, talkToFighter } from "@/lib/game/combat/discovery";

type Section = "overview" | "radar" | "fighters" | "offers" | "organizations";

const SPORTS: CombatSport[] = ["MMA", "Boxe", "Kickboxing", "Jiu-jítsu", "Muay Thai"];

export function CombatHub({ state, setState, onBack }: {
  state: GameState;
  setState: (state: GameState) => void;
  onBack: () => void;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [sport, setSport] = useState<CombatSport>("MMA");
  const [visitId, setVisitId] = useState<string | null>(null);
  const [replay, setReplay] = useState<{ name: string; fight: FightHistoryEntry } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fighters = state.combatFighters ?? [];
  const radar = state.combatRadar ?? [];
  const offers = state.combatOffers ?? [];
  const organizations = state.combatOrganizations ?? [];
  const reputation = state.combatReputation ?? defaultCombatReputation();
  const filteredFighters = fighters.filter(fighter => fighter.sport === sport);
  const filteredRadar = radar.filter(fighter => fighter.sport === sport);
  const filteredOrganizations = organizations.filter(organization => organization.sport === sport);
  const nextFight = useMemo(() => fighters
    .filter(fighter => fighter.scheduledFight)
    .sort((a, b) => (a.scheduledFight?.weeksRemaining ?? 99) - (b.scheduledFight?.weeksRemaining ?? 99))[0], [fighters]);

  const run = (action: { state: GameState; message: string }) => {
    setState(action.state);
    toast(action.message);
  };

  const visit = (state.combatVisits ?? []).find(item => item.id === visitId);
  if (visit) return <div className="p-4"><CombatPlayback key={visit.id} title={`${visit.event} • ${visit.sport}`} actions={visit.actions} onBack={() => setVisitId(null)} onComplete={visit.attended ? undefined : () => { setState(attendCombatVisit(state, visit.id)); setVisitId(null); setSection("radar"); }} /></div>;
  if (replay) return <div className="p-4"><CombatPlayback key={replay.fight.id} title={`${replay.name} x ${replay.fight.opponent}`} actions={replay.fight.actions ?? []} report={replay.fight.report ?? `${replay.fight.result} • ${replay.fight.method}`} onBack={() => setReplay(null)} /></div>;

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="outline" aria-label="Voltar ao escritório" onClick={onBack}><ArrowLeft className="size-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-xl font-black">Central de lutas</h2>
          <p className="text-xs text-muted-foreground">MMA, boxe, kickboxing, jiu-jítsu e Muay Thai</p>
        </div>
      </div>

      <div className="relative min-h-48 overflow-hidden rounded-md border border-border shadow-[var(--shadow-card)]">
        <img src={combatHub} alt="Centro de treinamento com cage e ringue" width={1536} height={864} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="relative flex min-h-48 flex-col justify-end p-4">
          <Badge className="mb-2 w-fit">Núcleo de esportes de combate</Badge>
          <h3 className="text-2xl font-black">Do circuito regional ao cinturão mundial</h3>
          <p className="mt-1 max-w-lg text-xs text-muted-foreground">Descubra talentos, negocie bolsas, prepare o camp e construa um cartel luta por luta.</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1 rounded-md border border-border bg-card p-1">
        <SectionButton active={section === "overview"} label="Central" icon={<Gauge />} onClick={() => setSection("overview")} />
        <SectionButton active={section === "radar"} label="Radar" icon={<Search />} count={radar.length} onClick={() => setSection("radar")} />
        <SectionButton active={section === "fighters"} label="Clientes" icon={<Users />} count={fighters.length} onClick={() => setSection("fighters")} />
        <SectionButton active={section === "offers"} label="Propostas" icon={<BadgeDollarSign />} count={offers.length} onClick={() => setSection("offers")} />
        <SectionButton active={section === "organizations"} label="Eventos" icon={<Trophy />} onClick={() => setSection("organizations")} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {SPORTS.map(item => (
          <Button key={item} variant={sport === item ? "default" : "outline"} onClick={() => setSport(item)} className="px-2">
            {item}
          </Button>
        ))}
      </div>

      {section === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SPORTS.map(item => (
              <Card key={item} className="p-3 text-center">
                <div className="text-lg font-black text-primary">{reputation[item]}</div>
                <div className="text-[10px] text-muted-foreground">REPUTAÇÃO {item.toUpperCase()}</div>
              </Card>
            ))}
          </div>
          {nextFight ? (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/15 p-2 text-primary"><Swords className="size-6" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase text-primary">Próxima luta</div>
                  <div className="truncate font-black">{nextFight.name} x {nextFight.scheduledFight?.opponent}</div>
                  <div className="text-xs text-muted-foreground">{nextFight.scheduledFight?.event} • em {nextFight.scheduledFight?.weeksRemaining} semana(s)</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Meter label="Camp" value={nextFight.scheduledFight?.campProgress ?? 0} />
                     <Meter label={nextFight.sport === "Jiu-jítsu" ? "Preparação técnica" : "Controle de peso"} value={nextFight.scheduledFight?.weightProgress ?? 0} />
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center text-sm text-muted-foreground">Nenhuma luta marcada. Contrate um talento e procure uma oportunidade.</Card>
          )}
          <CombatDiscovery state={state} sport={sport} run={run} onWatch={setVisitId} />
        </div>
      )}

      {section === "radar" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Atributos e potencial ficam mais precisos após novas observações.</p>
            <Button size="sm" onClick={() => setSection("overview")}><Search className="size-4" /> Buscar</Button>
          </div>
          {!filteredRadar.length && <Empty text={`Nenhum talento de ${sport} no radar.`} />}
          {filteredRadar.map(fighter => (
            <FighterCard key={fighter.id} fighter={fighter} expanded={expanded === fighter.id} onExpand={() => setExpanded(expanded === fighter.id ? null : fighter.id)}>
              <Button variant="outline" className="w-full" onClick={() => run(talkToFighter(state, fighter.id))}>Conversar com o lutador</Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => run(scoutFighter(state, fighter.id))}>Observar • R$ 120</Button>
                <Button onClick={() => run(signFighter(state, fighter.id))}>Oferecer contrato</Button>
              </div>
            </FighterCard>
          ))}
        </div>
      )}

      {section === "fighters" && (
        <div className="space-y-3">
          {!filteredFighters.length && <Empty text={`Nenhum cliente de ${sport}.`} />}
          {filteredFighters.map(fighter => (
            <FighterCard key={fighter.id} fighter={fighter} expanded={expanded === fighter.id} onExpand={() => setExpanded(expanded === fighter.id ? null : fighter.id)}>
              {fighter.scheduledFight ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-xs">
                    <div className="font-black">{fighter.scheduledFight.event}</div>
                    <div className="text-muted-foreground">contra {fighter.scheduledFight.opponent} • em {fighter.scheduledFight.weeksRemaining} semana(s)</div>
                  </div>
                   <div className="grid grid-cols-2 gap-3"><Meter label="Camp" value={fighter.scheduledFight.campProgress} /><Meter label={fighter.sport === "Jiu-jítsu" ? "Técnica" : "Peso"} value={fighter.scheduledFight.weightProgress} /></div>
                  <div>
                    <div className="mb-1 text-[10px] font-black uppercase text-muted-foreground">Estratégia</div>
                    <div className="grid grid-cols-2 gap-2">
                       {strategiesFor(fighter.sport).map(strategy => <Button key={strategy} size="sm" variant={fighter.scheduledFight?.strategy === strategy ? "default" : "outline"} onClick={() => setState(setFightStrategy(state, fighter.id, strategy))}>{strategy}</Button>)}
                    </div>
                  </div>
                </div>
              ) : (
                <Button className="w-full" onClick={() => run(seekFightOffer(state, fighter.id))}><Target className="size-4" /> Procurar luta</Button>
              )}
              <CombatCareerControls fighter={fighter} state={state} run={run} />
              <FightHistory fighter={fighter} onReplay={fight => setReplay({ name: fighter.name, fight })} />
            </FighterCard>
          ))}
        </div>
      )}

      {section === "offers" && (
        <div className="space-y-3">
          {!offers.length && <Empty text="Nenhuma proposta em aberto." />}
          {offers.map(offer => <OfferCard key={offer.id} offer={offer} state={state} run={run} onAnswer={accept => run(answerFightOffer(state, offer.id, accept))} />)}
        </div>
      )}

      {section === "organizations" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">O acesso depende do nível do lutador e da reputação da agência na modalidade.</p>
          {filteredOrganizations.sort((a, b) => b.level - a.level).map(organization => (
            <Card key={organization.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-secondary font-black text-primary">{organization.name.split(" ").map(word => word[0]).join("").slice(0, 3)}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{organization.name}</div>
                  <div className="text-[11px] text-muted-foreground">{organization.country} • nível {organization.level} • prestígio {organization.prestige}</div>
                  <div className="mt-1 truncate text-[10px] text-muted-foreground">{organization.weightClasses.join(" • ")}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionButton({ active, label, icon, count, onClick }: { active: boolean; label: string; icon: React.ReactNode; count?: number; onClick: () => void }) {
  return <Button variant={active ? "secondary" : "ghost"} onClick={onClick} className="relative h-14 min-w-0 flex-col gap-1 px-1 text-[9px] [&_svg]:size-4">{icon}<span className="max-w-full truncate">{label}</span>{count ? <span className="absolute right-1 top-1 rounded-full bg-primary px-1 text-[8px] text-primary-foreground">{count}</span> : null}</Button>;
}

function FighterCard({ fighter, expanded, onExpand, children }: { fighter: Fighter; expanded: boolean; onExpand: () => void; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <Button variant="ghost" onClick={onExpand} className="h-auto w-full justify-start rounded-none p-3 text-left">
        <div className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary text-lg font-black text-primary">{fighter.name.split(" ").map(word => word[0]).join("").slice(0, 2)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className="truncate font-black">{fighter.name}</span>{fighter.champion && <Trophy className="size-4 shrink-0 text-accent" />}</div>
          <div className="truncate text-[11px] text-muted-foreground">{fighter.age} anos • {fighter.weightClass} • {fighter.style}</div>
          <div className="mt-1 flex gap-2 text-[10px]"><span className="font-black text-primary">{fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws} ({fighter.record.noContests} NC)</span><span className="text-muted-foreground">Nível {fighter.rating}</span></div>
        </div>
        {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </Button>
      {expanded && (
        <div className="space-y-4 border-t border-border p-3">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Info icon={<CalendarClock />} label="Nascimento" value={fighter.birthDate} />
            <Info icon={<Weight />} label="Peso / altura" value={`${fighter.weight} kg • ${fighter.height} cm`} />
            <Info icon={<Shield />} label="Academia" value={fighter.gym} />
            <Info icon={<Dumbbell />} label="Treinador" value={fighter.coach} />
            <Info icon={<Target />} label="Guarda" value={fighter.stance} />
             {fighter.belt && <Info icon={<Medal />} label="Graduação" value={fighter.belt} />}
            <Info icon={<Medal />} label="Ranking" value={fighter.rank ? `#${fighter.rank}` : "Sem ranking"} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <Meter label="Trocação" value={fighter.attributes.striking} />
            <Meter label="Defesa" value={fighter.attributes.defense} />
             {(fighter.sport === "MMA" || fighter.sport === "Jiu-jítsu") && <><Meter label="Grappling" value={fighter.attributes.grappling} /><Meter label="Wrestling" value={fighter.attributes.wrestling} /></>}
            <Meter label="Cardio" value={fighter.attributes.cardio} />
            <Meter label="QI de luta" value={fighter.attributes.fightIQ} />
            <Meter label="Condição" value={fighter.condition} />
            <Meter label="Confiança" value={fighter.trust} />
          </div>
          {children}
        </div>
      )}
    </Card>
  );
}

function FightHistory({ fighter, onReplay }: { fighter: Fighter; onReplay: (fight: FightHistoryEntry) => void }) {
  if (!fighter.fightHistory.length) return <div className="text-xs text-muted-foreground">Nenhuma luta registrada desde a entrada na agência.</div>;
  return <div><div className="mb-2 text-[10px] font-black uppercase text-muted-foreground">Histórico de lutas</div><div className="space-y-2">{fighter.fightHistory.map(fight => <div key={fight.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-secondary/40 p-2 text-[11px]"><Badge variant={fight.result === "V" ? "default" : fight.result === "D" ? "destructive" : "secondary"}>{fight.result}</Badge><div className="min-w-0"><div className="truncate font-bold">{fight.opponent}</div><div className="truncate text-muted-foreground">{fight.event} • {fight.format ? `${fight.format} • ` : ""}{fight.method}{fight.score ? ` (${fight.score})` : ""} {fighter.sport === "Jiu-jítsu" ? fight.time : `R${fight.round} ${fight.time}`}</div></div><div className="text-right"><div className="font-bold">R$ {fight.purse.toLocaleString("pt-BR")}</div><div className="text-[9px] text-muted-foreground">{fight.month}/{fight.year}</div><Button size="sm" variant="ghost" onClick={() => onReplay(fight)}>Rever luta</Button></div></div>)}</div></div>;
}

function OfferCard({ offer, state, run, onAnswer }: { offer: CombatOffer; state: GameState; run: (action: { state: GameState; message: string }) => void; onAnswer: (accept: boolean) => void }) {
  const fighter = (state.combatFighters ?? []).find(item => item.id === offer.fighterId);
  const organization = (state.combatOrganizations ?? []).find(item => item.id === offer.organizationId);
  if (!fighter) return null;
  return <Card className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-black uppercase text-primary">{organization?.name ?? "Evento regional"}</div><div className="font-black">{fighter.name} x {offer.opponent}</div><div className="text-xs text-muted-foreground">{offer.event} • em {offer.weeksUntilFight} semanas • adversário nível {offer.opponentRating}</div></div>{offer.titleFight && <Badge><Trophy className="size-3" /> Cinturão</Badge>}</div><div className="my-3 grid grid-cols-3 gap-2"><MiniStat label="Bolsa" value={`R$ ${offer.purse.toLocaleString("pt-BR")}`} /><MiniStat label="Bônus vitória" value={`R$ ${offer.winBonus.toLocaleString("pt-BR")}`} /><MiniStat label="Contrato" value={`${offer.contractFights} luta(s)`} /></div><CombatOfferNegotiation key={offer.id} offer={offer} state={state} run={run} /><div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => onAnswer(false)}>Recusar</Button><Button onClick={() => onAnswer(true)}>Aceitar e iniciar camp</Button></div></Card>;
}

function Meter({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-1 flex justify-between text-[10px]"><span className="text-muted-foreground">{label}</span><span className="font-black">{Math.round(value)}</span></div><Progress value={value} className="h-1.5" /></div>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-md bg-secondary/40 p-2"><div className="mb-1 flex items-center gap-1 text-[9px] uppercase text-muted-foreground [&_svg]:size-3">{icon}{label}</div><div className="truncate font-bold">{value}</div></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-secondary/40 p-2 text-center"><div className="truncate text-xs font-black text-primary">{value}</div><div className="text-[9px] text-muted-foreground">{label}</div></div>;
}

function Empty({ text }: { text: string }) {
  return <Card className="p-8 text-center text-sm text-muted-foreground">{text}</Card>;
}