import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClubCrest } from "./ClubCrest";
import { Trash2, Plus, Save } from "lucide-react";
import { COMPETICOES, competicoesDoClube, ligaPrincipal, type Competition } from "@/lib/game/data/leagues";
import { UPGRADES } from "@/lib/game/engine";
import type {
  AgeCategory, Club, ClubPersonality, Division, GameState, Modalidade,
} from "@/lib/game/types";

const DIVISOES: Division[] = ["Amador", "Serie D", "Serie C", "Serie B", "Serie A", "Elite"];
const PERSONALIDADES: ClubPersonality[] = ["Formador", "Imediatista", "Pechincha", "Vitrine", "Tradicional"];
const CATEGORIAS_COMP: AgeCategory[] = ["Sub-13", "Sub-15", "Sub-17", "Sub-20", "Livre"];

/** Recalcula liga e competições de todos os clubes após mudanças administrativas. */
function recalcular(clubes: Club[], extras: Competition[]): Club[] {
  return clubes.map(c => {
    const modalidade = c.modalidade ?? "campo";
    return {
      ...c,
      liga: ligaPrincipal(c.categoria, c.pais, modalidade, c.estado),
      competicoes: competicoesDoClube(c.categoria, c.pais, c.estado, modalidade, extras).map(x => x.nome),
    };
  });
}

type ClubForm = {
  id?: string;
  nome: string; abrev: string; pais: string; estado: string; cidade: string;
  categoria: Division; personalidade: ClubPersonality; orcamento: number;
  modalidade: Modalidade; cor1: string; cor2: string;
};

const FORM_VAZIO: ClubForm = {
  nome: "", abrev: "", pais: "Brasil", estado: "RS", cidade: "", categoria: "Serie D",
  personalidade: "Formador", orcamento: 500_000, modalidade: "campo", cor1: "#1c8a4a", cor2: "#e6e6e6",
};

/** Editor administrativo de clubes: criar, editar e remover. */
export function AdminClubs({ state, setState }: { state: GameState; setState: (s: GameState) => void }) {
  const [form, setForm] = useState<ClubForm>(FORM_VAZIO);
  const [busca, setBusca] = useState("");
  const extras = state.competicoesCustom ?? [];

  const salvar = () => {
    if (!form.nome.trim()) { toast("Informe o nome do clube."); return; }
    const base = {
      nome: form.nome.trim(),
      abrev: (form.abrev || form.nome.slice(0, 3)).toUpperCase(),
      categoria: form.categoria,
      pais: form.pais, estado: form.estado, cidade: form.cidade || form.estado,
      personalidade: form.personalidade,
      orcamento: Math.max(0, Math.round(form.orcamento)),
      modalidade: form.modalidade,
      cores: [form.cor1, form.cor2] as [string, string],
    };
    let clubes: Club[];
    if (form.id) {
      clubes = state.clubes.map(c => (c.id === form.id ? { ...c, ...base } : c));
      toast(`${base.nome} atualizado.`);
    } else {
      const novo: Club = {
        id: `CLB-ADM-${Date.now()}`,
        ...base,
        liga: "", competicoes: [],
        tecnico: "A definir", moralTecnico: 60, pontos: 0, jogos: 0, elenco: 24,
        necessidades: [], interesse: [], confiancaEmVoce: 0,
        investimentoBase: 40, forcaCategorias: {},
      };
      clubes = [...state.clubes, novo];
      toast(`${base.nome} criado.`);
    }
    setState({ ...state, clubes: recalcular(clubes, extras) });
    setForm(FORM_VAZIO);
  };

  const filtro = busca.trim().toLowerCase();
  const lista = state.clubes.filter(c => !filtro || c.nome.toLowerCase().includes(filtro)).slice(0, 25);

  return (
    <Card className="p-4 space-y-3">
      <div className="text-xs uppercase font-bold text-muted-foreground">Clubes</div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-[11px]">Nome</Label>
          <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
        <div><Label className="text-[11px]">Sigla</Label>
          <Input value={form.abrev} onChange={e => setForm({ ...form, abrev: e.target.value })} /></div>
        <div><Label className="text-[11px]">País</Label>
          <Input value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} /></div>
        <div><Label className="text-[11px]">Estado</Label>
          <Input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} /></div>
        <div><Label className="text-[11px]">Cidade</Label>
          <Input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
        <div><Label className="text-[11px]">Caixa (R$)</Label>
          <Input type="number" value={form.orcamento}
            onChange={e => setForm({ ...form, orcamento: Number(e.target.value) })} /></div>
        <div><Label className="text-[11px]">Cor 1</Label>
          <Input type="color" value={form.cor1} onChange={e => setForm({ ...form, cor1: e.target.value })} /></div>
        <div><Label className="text-[11px]">Cor 2</Label>
          <Input type="color" value={form.cor2} onChange={e => setForm({ ...form, cor2: e.target.value })} /></div>
      </div>
      <div className="flex flex-wrap gap-1">
        {DIVISOES.map(d => (
          <Button key={d} size="sm" variant={form.categoria === d ? "default" : "outline"}
            className="text-[10px] h-7" onClick={() => setForm({ ...form, categoria: d })}>{d}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {PERSONALIDADES.map(p => (
          <Button key={p} size="sm" variant={form.personalidade === p ? "default" : "outline"}
            className="text-[10px] h-7" onClick={() => setForm({ ...form, personalidade: p })}>{p}</Button>
        ))}
        {(["campo", "futsal"] as Modalidade[]).map(m => (
          <Button key={m} size="sm" variant={form.modalidade === m ? "secondary" : "ghost"}
            className="text-[10px] h-7" onClick={() => setForm({ ...form, modalidade: m })}>
            {m === "campo" ? "Campo" : "Futsal"}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={salvar}>
          {form.id ? <><Save className="h-4 w-4 mr-1" /> Salvar</> : <><Plus className="h-4 w-4 mr-1" /> Criar clube</>}
        </Button>
        <Button variant="outline" onClick={() => setForm(FORM_VAZIO)}>Limpar formulário</Button>
      </div>

      <Input placeholder="Buscar clube para editar" value={busca} onChange={e => setBusca(e.target.value)} />
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {lista.map(c => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
            <ClubCrest cores={c.cores} abrev={c.abrev} size={28} />
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-bold truncate">{c.nome}</div>
              <div className="text-muted-foreground truncate">{c.liga} • {c.categoria}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setForm({
              id: c.id, nome: c.nome, abrev: c.abrev, pais: c.pais, estado: c.estado, cidade: c.cidade,
              categoria: c.categoria, personalidade: c.personalidade, orcamento: c.orcamento,
              modalidade: c.modalidade ?? "campo", cor1: c.cores[0], cor2: c.cores[1],
            })}>Editar</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setState({ ...state, clubes: state.clubes.filter(x => x.id !== c.id) });
              toast(`${c.nome} removido.`);
            }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

type CompForm = {
  id?: string;
  nome: string; pais: string; tipo: Competition["tipo"]; modalidade: Modalidade;
  divisoes: Division[]; categorias: AgeCategory[]; mesInicio: number; mesFim: number; estados: string;
};

const COMP_VAZIA: CompForm = {
  nome: "", pais: "Brasil", tipo: "estadual", modalidade: "campo",
  divisoes: ["Serie D"], categorias: ["Livre"], mesInicio: 3, mesFim: 10, estados: "",
};

/** Editor administrativo de ligas e competições. */
export function AdminCompetitions({ state, setState }: { state: GameState; setState: (s: GameState) => void }) {
  const [form, setForm] = useState<CompForm>(COMP_VAZIA);
  const extras = state.competicoesCustom ?? [];

  const aplicar = (novas: Competition[]) => {
    setState({
      ...state,
      competicoesCustom: novas,
      clubes: recalcular(state.clubes, novas),
    });
  };

  const salvar = () => {
    if (!form.nome.trim()) { toast("Informe o nome da competição."); return; }
    const comp: Competition = {
      id: form.id ?? `adm-${Date.now()}`,
      nome: form.nome.trim(),
      pais: form.pais,
      tipo: form.tipo,
      divisoes: form.divisoes.length ? form.divisoes : ["Serie D"],
      categorias: form.categorias.length ? form.categorias : ["Livre"],
      mesInicio: Math.min(12, Math.max(1, form.mesInicio)),
      mesFim: Math.min(12, Math.max(1, form.mesFim)),
      modalidade: form.modalidade,
      ...(form.estados.trim()
        ? { estados: form.estados.split(",").map(s => s.trim().toUpperCase()).filter(Boolean) }
        : {}),
    };
    aplicar(form.id ? extras.map(c => (c.id === form.id ? comp : c)) : [...extras, comp]);
    toast(`${comp.nome} ${form.id ? "atualizada" : "criada"}.`);
    setForm(COMP_VAZIA);
  };

  const alternar = <T,>(lista: T[], v: T): T[] =>
    lista.includes(v) ? lista.filter(x => x !== v) : [...lista, v];

  return (
    <Card className="p-4 space-y-3">
      <div className="text-xs uppercase font-bold text-muted-foreground">Ligas e competições</div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-[11px]">Nome</Label>
          <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
        <div><Label className="text-[11px]">País / continente</Label>
          <Input value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} /></div>
        <div><Label className="text-[11px]">Mês de início</Label>
          <Input type="number" value={form.mesInicio}
            onChange={e => setForm({ ...form, mesInicio: Number(e.target.value) })} /></div>
        <div><Label className="text-[11px]">Mês de término</Label>
          <Input type="number" value={form.mesFim}
            onChange={e => setForm({ ...form, mesFim: Number(e.target.value) })} /></div>
        <div className="col-span-2"><Label className="text-[11px]">Estados (opcional, separados por vírgula)</Label>
          <Input value={form.estados} onChange={e => setForm({ ...form, estados: e.target.value })} /></div>
      </div>
      <div className="flex flex-wrap gap-1">
        {(["nacional", "copa", "continental", "estadual", "base", "amadora", "regional"] as Competition["tipo"][]).map(t => (
          <Button key={t} size="sm" variant={form.tipo === t ? "default" : "outline"} className="text-[10px] h-7"
            onClick={() => setForm({ ...form, tipo: t })}>{t}</Button>
        ))}
        {(["campo", "futsal"] as Modalidade[]).map(m => (
          <Button key={m} size="sm" variant={form.modalidade === m ? "secondary" : "ghost"} className="text-[10px] h-7"
            onClick={() => setForm({ ...form, modalidade: m })}>{m === "campo" ? "Campo" : "Futsal"}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {DIVISOES.map(d => (
          <Button key={d} size="sm" variant={form.divisoes.includes(d) ? "default" : "outline"} className="text-[10px] h-7"
            onClick={() => setForm({ ...form, divisoes: alternar(form.divisoes, d) })}>{d}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {CATEGORIAS_COMP.map(c => (
          <Button key={c} size="sm" variant={form.categorias.includes(c) ? "default" : "outline"} className="text-[10px] h-7"
            onClick={() => setForm({ ...form, categorias: alternar(form.categorias, c) })}>{c}</Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={salvar}>
          {form.id ? <><Save className="h-4 w-4 mr-1" /> Salvar</> : <><Plus className="h-4 w-4 mr-1" /> Criar competição</>}
        </Button>
        <Button variant="outline" onClick={() => setForm(COMP_VAZIA)}>Limpar formulário</Button>
      </div>

      <div className="text-[11px] text-muted-foreground">
        {COMPETICOES.length} competições oficiais • {extras.length} criadas pelo administrador
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {extras.map(c => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-bold truncate">{c.nome}</div>
              <div className="text-muted-foreground truncate">
                {c.pais} • {c.tipo} • {(c.modalidade ?? "campo") === "futsal" ? "Futsal" : "Campo"}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => setForm({
              id: c.id, nome: c.nome, pais: c.pais, tipo: c.tipo, modalidade: c.modalidade ?? "campo",
              divisoes: c.divisoes, categorias: c.categorias, mesInicio: c.mesInicio, mesFim: c.mesFim,
              estados: (c.estados ?? []).join(", "),
            })}>Editar</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              aplicar(extras.filter(x => x.id !== c.id));
              toast(`${c.nome} removida.`);
            }}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Liberação individual das estruturas da agência. */
export function AdminUpgrades({ state, setState }: { state: GameState; setState: (s: GameState) => void }) {
  return (
    <Card className="p-4 space-y-2">
      <div className="text-xs uppercase font-bold text-muted-foreground">Estruturas da agência</div>
      {UPGRADES.map(u => {
        const ativo = state.upgrades.includes(u.id);
        return (
          <div key={u.id} className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2">
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-bold truncate">{u.nome}</div>
              <div className="text-muted-foreground truncate">{u.descricao}</div>
            </div>
            {ativo && <Badge variant="secondary" className="text-[10px]">Ativa</Badge>}
            <Button size="sm" variant={ativo ? "ghost" : "outline"} onClick={() => setState({
              ...state,
              upgrades: ativo ? state.upgrades.filter(x => x !== u.id) : [...state.upgrades, u.id],
            })}>{ativo ? "Remover" : "Liberar"}</Button>
          </div>
        );
      })}
    </Card>
  );
}
