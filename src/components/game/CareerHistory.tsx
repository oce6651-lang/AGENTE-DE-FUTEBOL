import { Badge } from "@/components/ui/badge";
import { Trophy, Award } from "lucide-react";
import type { Player, SeasonRecord } from "@/lib/game/types";

/**
 * Histórico de carreira detalhado, no estilo Football Manager:
 * uma linha por competição disputada em cada temporada.
 */
export function CareerHistory({ player, compacto = false }: { player: Player; compacto?: boolean }) {
  const temporadas = [...(player.temporadas ?? [])].sort((a, b) => b.ano - a.ano);
  if (!temporadas.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
        Nenhuma temporada disputada ainda.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {temporadas.map(t => <SeasonBlock key={t.ano} t={t} compacto={compacto} />)}
    </div>
  );
}

function SeasonBlock({ t, compacto }: { t: SeasonRecord; compacto: boolean }) {
  const linhas = t.competicoes ?? [];
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center gap-2 bg-secondary/60 px-3 py-2">
        <span className="text-sm font-black">{t.ano}</span>
        <span className="text-sm font-bold truncate">{t.clube}</span>
        <Badge variant="secondary" className="text-[10px]">{t.categoria}</Badge>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {t.jogos}J • {t.gols}G • {t.assistencias}A • OVR {t.overall}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-2 text-left font-bold">Competição</th>
              <th className="p-2 font-bold">J</th>
              <th className="p-2 font-bold">G</th>
              <th className="p-2 font-bold">A</th>
              <th className="p-2 font-bold">CA</th>
              <th className="p-2 font-bold">CV</th>
              <th className="p-2 font-bold">Nota</th>
              <th className="p-2 font-bold">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 && (
              <tr><td colSpan={8} className="p-3 text-center text-muted-foreground">Sem partidas registradas.</td></tr>
            )}
            {linhas.map(c => (
              <tr key={c.competicaoId + c.categoria} className="border-b border-border/60 last:border-0">
                <td className="p-2 truncate max-w-[180px]">
                  <span className="font-semibold">{c.competicao}</span>
                  <span className="text-muted-foreground"> {c.categoria !== "Livre" ? c.categoria : ""}</span>
                </td>
                <td className="p-2 text-center">{c.jogos}</td>
                <td className="p-2 text-center font-bold">{c.gols}</td>
                <td className="p-2 text-center">{c.assistencias}</td>
                <td className="p-2 text-center text-[10px]">{c.amarelos}</td>
                <td className="p-2 text-center text-[10px]">{c.vermelhos}</td>
                <td className="p-2 text-center">{c.notaMedia ? c.notaMedia.toFixed(2) : "—"}</td>
                <td className="p-2 text-center">
                  {c.campeao
                    ? <span className="inline-flex items-center gap-1 font-black text-primary"><Trophy className="h-3 w-3" /> 1º</span>
                    : c.posicao ? `${c.posicao}º` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!compacto && (t.titulos.length > 0 || t.premios.length > 0) && (
        <div className="flex flex-wrap gap-1 border-t border-border px-3 py-2">
          {t.titulos.map(x => (
            <Badge key={x} className="gap-1 text-[10px]"><Trophy className="h-3 w-3" /> {x}</Badge>
          ))}
          {t.premios.map(x => (
            <Badge key={x} variant="secondary" className="gap-1 text-[10px]"><Award className="h-3 w-3" /> {x}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
