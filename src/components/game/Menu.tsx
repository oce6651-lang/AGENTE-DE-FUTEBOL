import { Button } from "@/components/ui/button";

interface Props {
  hasSave: boolean;
  onNew: () => void;
  onContinue: () => void;
}

export function Menu({ hasSave, onNew, onContinue }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--gradient-pitch)" }}>
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
          PROJECT
        </h1>
        <h2 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent"
          style={{ backgroundImage: "var(--gradient-primary)" }}>
          FOOTBALL AGENT
        </h2>
        <p className="text-muted-foreground mt-3 text-sm">Construa sua agência do zero</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button size="lg" onClick={onNew} className="h-14 text-base font-bold shadow-[var(--shadow-glow)]">
          Novo Jogo
        </Button>
        <Button size="lg" variant="secondary" disabled={!hasSave} onClick={onContinue} className="h-14 text-base font-bold">
          Continuar
        </Button>
        <Button size="lg" variant="outline" className="h-14 text-base" disabled>
          Configurações
        </Button>
        <Button size="lg" variant="ghost" className="h-14 text-base" disabled>
          Créditos
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-10">v1.0 • Save local no navegador</p>
    </div>
  );
}