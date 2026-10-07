import { useEffect, useState } from 'react';
import { Pause, Play, SkipForward, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { CombatAction } from '@/lib/game/types';
import combatHub from '@/assets/combat-hub.jpg';

export function CombatPlayback({ title, actions, report, onComplete, onBack }: { title: string; actions: CombatAction[]; report?: string; onComplete?: () => void; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const finished = index >= actions.length;
  useEffect(() => {
    if (!playing || finished) return;
    const timer = window.setTimeout(() => setIndex(i => Math.min(actions.length, i + 1)), 850 / speed);
    return () => window.clearTimeout(timer);
  }, [index, playing, speed, finished, actions.length]);
  const current = actions[Math.max(0, index - 1)];
  const elapsed = current?.second ?? 0;
  return <section className="space-y-4">
    <Button variant="outline" onClick={onBack}><ArrowLeft /> Voltar à central</Button>
    <div className="relative min-h-64 overflow-hidden">
      <img src={combatHub} alt="Área de combate" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative space-y-4 p-5 text-center">
        <h3 className="text-xl font-black break-words">{title}</h3>
        <div className="text-sm text-muted-foreground">Round {current?.round ?? 1} • {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
        <div className="text-4xl font-black text-primary">{index ? current?.fighterScore ?? 0 : 0} × {index ? current?.opponentScore ?? 0 : 0}</div>
        <Progress value={actions.length ? index / actions.length * 100 : 0} />
      </div>
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" disabled={finished} aria-label={playing ? 'Pausar' : 'Iniciar'} onClick={() => setPlaying(p => !p)}>{playing ? <Pause /> : <Play />}{playing ? 'Pausar' : 'Iniciar'}</Button>
      {[1, 2, 4].map(s => <Button key={s} variant={speed === s ? 'default' : 'outline'} onClick={() => setSpeed(s)}>{s}×</Button>)}
      <Button variant="outline" onClick={() => { setIndex(actions.length); setPlaying(false); }}><SkipForward /> Ir ao resultado</Button>
    </div>
    <div className="h-64 overflow-y-auto border-y border-border py-3 space-y-2" aria-live="polite">{actions.slice(0, index).reverse().map((action, i) => <p key={i} className="text-sm"><span className="text-muted-foreground">{Math.floor(action.second / 60)}′</span> {action.text}</p>)}</div>
    {finished && <div className="space-y-3">{report && <p className="text-sm">{report}</p>}{onComplete && <Button onClick={onComplete}>Concluir observação</Button>}</div>}
  </section>;
}