import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "@/components/game/Menu";
import { Creation } from "@/components/game/Creation";
import { Office } from "@/components/game/Office";
import { deleteSave, getEmptySlotId, getSaveSlots, hasSave, loadGame, saveGame, selectSaveSlot } from "@/lib/game/storage";
import type { SaveSlot } from "@/lib/game/storage";
import { novoJogo } from "@/lib/game/engine";
import type { Agent, GameState } from "@/lib/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Football Agent — Simulador de Empresário de Futebol" },
      { name: "description", content: "Construa sua agência de futebol do zero: descubra talentos, negocie com clubes e vire uma potência mundial." },
      { property: "og:title", content: "Project Football Agent" },
      { property: "og:description", content: "Simulação de gerenciamento onde você é o empresário. Descubra, contrate e negocie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
  ssr: false,
});

type Screen = "menu" | "create" | "office";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [state, setStateInternal] = useState<GameState | null>(null);
  const [saveExists, setSaveExists] = useState(false);
  const [saves, setSaves] = useState<SaveSlot[]>([]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setSaveExists(hasSave());
    setSaves(getSaveSlots());
  }, []);

  const setState = (s: GameState) => {
    setStateInternal(s);
    saveGame(s);
    setSaveExists(true);
    setSaves(getSaveSlots());
  };

  const handleNew = (slotId?: string) => {
    const target = slotId ?? getEmptySlotId();
    if (!target) return;
    if (saves.some(slot => slot.id === target)) deleteSave(target);
    selectSaveSlot(target);
    setStateInternal(null);
    setSaves(getSaveSlots());
    setScreen("create");
  };

  const handleLoad = (slotId?: string) => {
    const s = loadGame(slotId);
    if (s) {
      setStateInternal(s);
      setScreen("office");
    }
  };

  const handleDelete = (slotId: string) => {
    deleteSave(slotId);
    const next = getSaveSlots();
    setSaves(next);
    setSaveExists(next.length > 0);
  };

  const handleCreate = (agent: Omit<Agent, "id">) => {
    const s = novoJogo(agent);
    setState(s);
    setScreen("office");
  };

  return (
    <>
      <Toaster position="top-center" />
      {screen === "menu" && (
        <Menu hasSave={saveExists} saves={saves} onNew={handleNew} onContinue={() => handleLoad()} onLoad={handleLoad} onDelete={handleDelete} />
      )}
      {screen === "create" && (
        <Creation onCreate={handleCreate} onBack={() => setScreen("menu")} />
      )}
      {screen === "office" && state && (
        <Office state={state} setState={setState} onExit={() => setScreen("menu")} />
      )}
    </>
  );
}
