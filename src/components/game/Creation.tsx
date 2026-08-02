import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAISES, NACIONALIDADES, getEstados, getCidades, getPais } from "@/lib/game/data/geo";
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

  const estados = useMemo(() => getEstados(form.pais), [form.pais]);
  const cidades = useMemo(() => getCidades(form.pais, form.estado), [form.pais, form.estado]);

  /** Trocar de país reinicia estado, cidade e nacionalidade sugerida. */
  const trocarPais = (pais: string) => {
    const info = getPais(pais);
    const estado = info.estados[0];
    setForm(f => ({
      ...f, pais,
      nacionalidade: info.nacionalidade,
      estado: estado.sigla,
      cidade: estado.cidades[0],
    }));
  };

  const trocarEstado = (sigla: string) => {
    const cidade = getCidades(form.pais, sigla)[0] ?? "";
    setForm(f => ({ ...f, estado: sigla, cidade }));
  };

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
            <Select value={form.nacionalidade} onValueChange={v => setForm(f => ({ ...f, nacionalidade: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NACIONALIDADES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>País de nascimento</Label>
            <Select value={form.pais} onValueChange={trocarPais}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAISES.map(p => <SelectItem key={p.nome} value={p.nome}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={trocarEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {estados.map(e => <SelectItem key={e.sigla} value={e.sigla}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Select value={form.cidade} onValueChange={v => setForm(f => ({ ...f, cidade: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {cidades.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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