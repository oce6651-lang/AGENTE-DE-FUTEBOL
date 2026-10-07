import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { COMBAT_LOCATIONS, bookCombatVisit } from '@/lib/game/combat/discovery';
import type { CombatSport, GameState } from '@/lib/game/types';
import community from '@/assets/combat-community.jpg';
import training from '@/assets/combat-hub.jpg';

export function CombatDiscovery({ state, sport, run, onWatch }: { state: GameState; sport: CombatSport; run: (action: { state: GameState; message: string }) => void; onWatch: (id: string) => void }) {
  const [locationId, setLocationId] = useState<string>('community');
  const location = COMBAT_LOCATIONS.find(l => l.id === locationId);
  return <section className="space-y-4"><h3 className="font-black">Locais de observação</h3><div className="grid gap-3 sm:grid-cols-2">{COMBAT_LOCATIONS.map(l => <Card key={l.id} className="overflow-hidden"><img src={l.level === 1 ? community : training} alt={l.name} width={1088} height={608} loading="lazy" className="h-32 w-full object-cover" /><div className="p-3 space-y-2"><h4 className="font-bold">{l.name}</h4><p className="text-xs text-muted-foreground">{l.level === 1 ? state.agent.cidade : l.city} • R$ {l.cost} • reputação {l.reputation}</p><Button variant={locationId === l.id ? 'default' : 'outline'} disabled={(state.combatReputation?.[sport] ?? 0) < l.reputation} onClick={() => setLocationId(l.id)}>Ver agenda</Button></div></Card>)}</div>
    {location && <div className="space-y-2 border-y border-border py-3"><h4 className="font-bold">{location.name} • {sport}</h4><div className="flex flex-wrap gap-2">{location.events.map(event => <Button key={event} variant="outline" onClick={() => run(bookCombatVisit(state, location.id, sport, event))}>{event} • R$ {location.cost}</Button>)}</div></div>}
    <h4 className="font-bold">Visitas agendadas</h4>{(state.combatVisits ?? []).filter(v => v.sport === sport).map(visit => <div key={visit.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3"><div><p className="text-sm font-bold">{visit.event}</p><p className="text-xs text-muted-foreground">{COMBAT_LOCATIONS.find(l => l.id === visit.locationId)?.name} • {visit.attended ? `${visit.candidates.length} participantes avaliados` : 'Observação pendente'}</p></div><Button size="sm" variant="outline" onClick={() => onWatch(visit.id)}>{visit.attended ? 'Rever atividade' : 'Assistir atividade'}</Button></div>)}
  </section>;
}