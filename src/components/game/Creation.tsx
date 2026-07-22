import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { Agent } from "@/lib/game/types";

interface Props {
  onCreate: (agent: Omit<Agent, "id">) => void;
  onBack: () => void;
}

export function Creation({ onCreate, onBack }: Props) {
  const [form, setForm] = useState({
    nome: "Gustavo",
    sobrenome: "Oliveira",
    nacionalidade: "Brasileira",
    pais: "Brasil",
    estado: "RS",
    cidade: "Três Passos",
    agencia: "Oliveira Sports",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const valid = Object.values(form).every(v => v.trim().length > 0);

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--gradient-pitch)" }}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="text-sm text-muted-foreground mb-4 hover:text-foreground">← Voltar</button>
        <h1 className="text-2xl font-black mb-1">Criar Empresário</h1>
        <p className="text-sm text-muted-foreground mb-6">Configure seu perfil e sua agência.</p>

        <Card className="p-5 space-y-4 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome</Label>
              <Input value={form.nome} onChange={update("nome")} />
            </div>
            <div>
              <Label>Sobrenome</Label>
              <Input value={form.sobrenome} onChange={update("sobrenome")} />
            </div>
          </div>
          <div>
            <Label>Nacionalidade</Label>
            <Input value={form.nacionalidade} onChange={update("nacionalidade")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>País</Label>
              <Input value={form.pais} onChange={update("pais")} />
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={form.estado} onChange={update("estado")} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={update("cidade")} />
            </div>
          </div>
          <div>
            <Label>Nome da Agência</Label>
            <Input value={form.agencia} onChange={update("agencia")} />
          </div>

          <Button
            className="w-full h-12 font-bold"
            disabled={!valid}
            onClick={() => onCreate(form)}
          >
            Fundar Agência
          </Button>
        </Card>
      </div>
    </div>
  );
}