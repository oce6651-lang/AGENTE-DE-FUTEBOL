import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changeGym, setTraining, stageRequirements, transitionToMma } from '@/lib/game/combat/career';
import { negotiateFightOffer, seekCombatSponsor } from '@/lib/game/combat';
import type { CombatOffer, CombatTraining, Fighter, GameState } from '@/lib/game/types';

type Action = { state: GameState; message: string };
export function CombatCareerControls({ fighter, state, run }: { fighter: Fighter; state: GameState; run: (action: Action) => void }) {
  const career = fighter.career;
  if (!career) return null;
  return <section className="space-y-3 border-y border-border py-3">
    <h4 className="font-bold">{career.stage}</h4>
    <p className="text-xs text-muted-foreground">{career.weeksTraining} semanas de formação • {career.experience} de experiência</p>
    <p className="text-xs text-muted-foreground">Próxima etapa: {stageRequirements(career.stage)}</p>
    <div className="grid grid-cols-3 gap-2 text-xs">{[['Informal', career.informalRecord], ['Amador', career.amateurRecord], ['Profissional', career.professionalRecord]].map(([label, value]) => { if (typeof value === 'string') return null; return <div key={String(label)}><strong>{String(label)}</strong><p>{value.wins}–{value.losses}–{value.draws} ({value.noContests} NC)</p></div>; })}</div>
    <h5 className="text-xs font-bold">Foco de treino</h5>
    <div className="flex flex-wrap gap-2">{(['Equilibrado', 'Trocação', 'Grappling', 'Condicionamento', 'Defesa'] as CombatTraining[]).map(training => <Button key={training} size="sm" variant={career.training === training ? 'default' : 'outline'} onClick={() => run({ state: setTraining(state, fighter.id, training), message: 'Foco de treino atualizado.' })}>{training}</Button>)}</div>
    <h5 className="text-xs font-bold">Academia</h5>
    <div className="flex flex-wrap gap-2">{['Comunitária', 'Especializada', 'Alto rendimento'].map((gym, index) => <Button key={gym} size="sm" variant="outline" disabled={career.gymLevel === index + 1} onClick={() => run(changeGym(state, fighter.id, index + 1))}>{gym} • R$ {(index + 1) * 200}</Button>)}</div>
    {fighter.sport !== 'MMA' && <Button variant="outline" disabled={Boolean(fighter.contract || fighter.scheduledFight || fighter.injuryWeeks)} onClick={() => run(transitionToMma(state, fighter.id))}>Iniciar adaptação ao MMA • R$ 400</Button>}
    {career.transitionWeeks > 0 && <p className="text-xs">Adaptação: {career.transitionWeeks} semanas restantes.</p>}
    {fighter.contract && <p className="text-xs">Contrato: {fighter.contract.fightsRemaining} lutas • até {fighter.contract.expiresYear} • comissão {fighter.contract.agencyCommission * 100}% • {fighter.contract.exclusive ? 'Exclusivo' : 'Não exclusivo'}</p>}
    {career.sponsorship && career.sponsorship.weeksRemaining > 0 ? <p className="text-xs">{career.sponsorship.name}: R$ {career.sponsorship.monthlyValue}/mês • {career.sponsorship.weeksRemaining} semanas</p> : <Button size="sm" variant="outline" onClick={() => run(seekCombatSponsor(state, fighter.id))}>Buscar patrocínio</Button>}
    {career.sportArchives.map((archive, index) => <p key={index} className="text-xs">Arquivo {archive.sport}: {archive.record.wins}–{archive.record.losses}–{archive.record.draws} ({archive.record.noContests} NC)</p>)}
    {career.titles.map(title => <p key={title} className="text-xs text-primary">🏆 {title}</p>)}
  </section>;
}

export function CombatOfferNegotiation({ offer, state, run }: { offer: CombatOffer; state: GameState; run: (action: Action) => void }) {
  const [purse, setPurse] = useState(offer.purse);
  const [fights, setFights] = useState(offer.contractFights);
  const [years, setYears] = useState(offer.durationYears ?? 1);
  if (offer.circuit !== 'profissional') return <p className="my-3 text-xs">{offer.circuit === 'informal' ? 'Informal' : 'Amador'} • Sem bolsa profissional • Inscrição/deslocamento R$ {offer.fee ?? 0}</p>;
  return <div className="my-3 space-y-2"><div className="grid grid-cols-3 gap-2">
    <label className="text-xs">Bolsa<Input aria-label="Bolsa proposta" type="number" min={offer.purse} max={offer.purse * 1.25} value={purse} onChange={e => setPurse(Number(e.target.value))} /></label>
    <label className="text-xs">Lutas<Input aria-label="Quantidade de lutas" type="number" min={1} max={offer.exclusive ? 5 : 1} value={fights} onChange={e => setFights(Number(e.target.value))} /></label>
    <label className="text-xs">Anos<Input aria-label="Duração do contrato" type="number" min={1} max={3} value={years} onChange={e => setYears(Number(e.target.value))} /></label>
  </div><Button variant="outline" size="sm" disabled={(offer.negotiations ?? 0) >= 2} onClick={() => run(negotiateFightOffer(state, offer.id, purse, fights, years))}>Enviar contraproposta</Button></div>;
}