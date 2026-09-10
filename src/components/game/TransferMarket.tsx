import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClubCrest } from "./ClubCrest";
import { PlayerAvatar } from "./PlayerAvatar";
import { ArrowLeft, Gavel, Handshake, Timer } from "lucide-react";
import { janelaAberta, statusJanela } from "@/lib/game/calendar";
import { responderNegociacao } from "@/lib/game/engine";
import {
  abrirLeilao, cancelarLeilao, leilaoDoAtleta, negociarTermos,
  situacaoContratual, CUSTO_LEILAO, SEMANAS_LEILAO,
} from "@/lib/game/transfers";
import type { GameState, Negotiation, Player } from "@/lib/game/types";

const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  onBack: () => void;
}

export function TransferMarket({ state, setState, onBack }: Props) {
  const [aba, setAba] = useState<"elenco" | "propostas">("elenco");
  const [negociando, setNegociando] = useState<Negotiation | null>(null);
  const [pedido, setPedido] = useState({ valor: "", salario: "", anos: "", comissao: "" });

  const abertas = state.negociacoes.filter(n => n.status === "aberta");
  const leiloes = (state.leiloes ?? []).filter(l => l.status === "aberto");

  const abrirNegociacao = (n: Negotiation) => {
    setNegociando(n);
    setPedido({
      valor: String(Math.round(n.valorProposta * 1.2)),
      salario: String(Math.round(n.salario * 1.2)),
      anos: String(n.duracaoAnos ?? 2),
      comissao: String(Math.round(n.comissao * 100)),
    });
  };

  const enviarPedido = () => {
    if (!negociando) return;
    const r = negociarTermos(state, negociando.id, {
      valor: Number(pedido.valor) || undefined,
      salario: Number(pedido.salario) || undefined,
      duracaoAnos: Number(pedido.anos) || undefined,
      comissao: Number(pedido.comissao) ? Number(pedido.comissao) / 100 : undefined,
    });
    setState(r.state);
    toast(r.mensagem);
    setNegociando(r.state.negociacoes.find(n => n.id === negociando.id) ?? null);
  };

  const responder = (n: Negotiation, acao: "aceitar" | "recusar") => {
    const r = responderNegociacao(state, n.id, acao);
    setState(r.state);
    toast(r.mensagem);
  };

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="text-lg font-black">Transferências</h2>
      </div>

      <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${janelaAberta(state.mes)
        ? "border-primary/50 bg-primary/10 text-primary"
        : "border-border bg-secondary/40 text-muted-foreground"}`}>
        {statusJanela(state)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant={aba === "elenco" ? "default" : "secondary"} onClick={() => setAba("elenco")}>
          Meus contratos ({state.jogadores.length})
        </Button>
        <Button variant={aba === "propostas" ? "default" : "secondary"} onClick={() => setAba("propostas")}>
          Propostas ({abertas.length})
        </Button>
      </div>

      {aba === "elenco" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Abra um leilão para colocar o atleta no mercado: os clubes cobrem os lances uns dos
            outros por {SEMANAS_LEILAO} semanas e o vencedor manda a proposta formal.
            Custo por leilão: {brl(CUSTO_LEILAO)}.
          </p>

          {state.jogadores.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              Nenhum cliente na agência ainda.
            </div>
          )}

          {state.jogadores.map(p => {
            const leilao = leilaoDoAtleta(state, p.id);
            const propostas = abertas.filter(n => n.playerId === p.id).length;
            const melhor = leilao ? [...leilao.lances].sort((a, b) => b.valor - a.valor)[0] : undefined;
            return (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <PlayerAvatar seed={p.visual} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{p.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.posicao} • {p.idade} anos • OVR {p.atual}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {situacaoContratual(state, p)}
                    </div>
                  </div>
                  {propostas > 0 && <Badge>{propostas} proposta(s)</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg bg-secondary/40 px-2 py-1">
                    <div className="text-muted-foreground">Valor de mercado</div>
                    <div className="font-black">{brl(p.valorMercado)}</div>
                  </div>
                  <div className="rounded-lg bg-secondary/40 px-2 py-1">
                    <div className="text-muted-foreground">Salário</div>
                    <div className="font-black">{brl(p.salario)}/mês</div>
                  </div>
                </div>

                {p.emprestimo && (
                  <div className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-[11px]">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Timer className="h-3 w-3" /> Empréstimo de {p.emprestimo.meses} mês(es)
                    </div>
                    Retorna ao {p.emprestimo.clubeOrigem} em {p.emprestimo.ate.mes}/{p.emprestimo.ate.ano}.
                  </div>
                )}

                {leilao ? (
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1"><Gavel className="h-3 w-3" /> Leilão aberto</span>
                      <span className="text-muted-foreground">{leilao.semanasRestantes} semana(s)</span>
                    </div>
                    {melhor
                      ? <div className="text-[11px]">Melhor lance: <b>{melhor.clube}</b> — {brl(melhor.valor)} • salário {brl(melhor.salario)}/mês</div>
                      : <div className="text-[11px] text-muted-foreground">Nenhum lance recebido ainda.</div>}
                    {leilao.lances.slice(0, 4).map((l, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground">
                        {l.quando} • {l.clube}: {brl(l.valor)}
                      </div>
                    ))}
                    <Button size="sm" variant="destructive" className="w-full"
                      onClick={() => { const r = cancelarLeilao(state, leilao.id); setState(r.state); toast(r.mensagem); }}>
                      Cancelar leilão
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" className="w-full"
                    onClick={() => { const r = abrirLeilao(state, p.id); setState(r.state); toast(r.mensagem); }}>
                    <Gavel className="h-4 w-4 mr-1" /> Abrir leilão ({brl(CUSTO_LEILAO)})
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {aba === "propostas" && (
        <div className="space-y-3">
          {abertas.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              Nenhuma proposta na mesa. A maioria chega durante as janelas de transferência.
            </div>
          )}
          {abertas.map(n => {
            const p = state.jogadores.find(j => j.id === n.playerId);
            const c = state.clubes.find(cl => cl.id === n.clubId);
            if (!p || !c) return null;
            const comissao = Math.round(n.valorProposta * n.comissao);
            return (
              <Card key={n.id} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ClubCrest cores={c.cores} abrev={c.abrev} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{p.nome} → {c.nome}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.liga} • {c.categoria} • {n.criadaEm}
                    </div>
                  </div>
                  <Badge variant="secondary">{n.tipo ?? "Compra definitiva"}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Info label="Valor da transferência" valor={brl(n.valorProposta)} />
                  <Info label="Salário oferecido" valor={`${brl(n.salario)}/mês`} />
                  <Info label="Duração do contrato"
                    valor={n.tipo === "Empréstimo"
                      ? `${n.duracaoMeses ?? 12} mês(es) de empréstimo`
                      : `${n.duracaoAnos ?? 2} ano(s)`} />
                  <Info label="Sua comissão" valor={`${(n.comissao * 100).toFixed(0)}% • ${brl(comissao)}`} />
                  <Info label="Categoria" valor={n.categoria ?? "Livre"} />
                  <Info label="Prazo de resposta" valor={`${n.expiraEm} semana(s)`} />
                </div>

                {n.tipo === "Empréstimo" && (
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-[11px] text-muted-foreground">
                    Ao fim dos {n.duracaoMeses ?? 12} meses o atleta volta automaticamente ao {p.clube}.
                  </div>
                )}

                {(n.etapas ?? []).slice(-3).map((e, i) => (
                  <div key={i} className="text-[10px] text-muted-foreground">{e.data} • {e.texto}</div>
                ))}

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="secondary" onClick={() => responder(n, "recusar")}>Recusar</Button>
                  <Button variant="outline" onClick={() => abrirNegociacao(n)}>
                    <Handshake className="h-4 w-4 mr-1" /> Negociar
                  </Button>
                  <Button onClick={() => responder(n, "aceitar")}>Aceitar</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!negociando} onOpenChange={(o) => !o && setNegociando(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Negociar termos</DialogTitle></DialogHeader>
          {negociando && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Peça o que quiser, mas com bom senso: cada clube aceita poucas rodadas de conversa
                antes de retirar a proposta. Rodadas usadas: {negociando.rodadas ?? 0}/3.
              </p>
              <Campo label="Valor da transferência (R$)" value={pedido.valor}
                onChange={v => setPedido({ ...pedido, valor: v })} />
              <Campo label="Salário mensal (R$)" value={pedido.salario}
                onChange={v => setPedido({ ...pedido, salario: v })} />
              <Campo label="Duração do contrato (anos)" value={pedido.anos}
                onChange={v => setPedido({ ...pedido, anos: v })} />
              <Campo label="Sua comissão (%)" value={pedido.comissao}
                onChange={v => setPedido({ ...pedido, comissao: v })} />
              <Button className="w-full" onClick={enviarPedido}>Enviar contraproposta</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 px-2 py-1">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-black truncate">{valor}</div>
    </div>
  );
}

function Campo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input inputMode="numeric" value={value} onChange={e => onChange(e.target.value.replace(/\D/g, ""))} />
    </div>
  );
}
