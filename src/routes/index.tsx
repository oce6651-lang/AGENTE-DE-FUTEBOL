import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "@/components/game/Menu";
import { Creation } from "@/components/game/Creation";
import { Office } from "@/components/game/Office";
import { hasSave, loadGame, saveGame, deleteSave } from "@/lib/game/storage";
import { novoJogo } from "@/lib/game/engine";
import type { Agent, GameState } from "@/lib/game/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Football Agent — Simulador de Empresário de Futebol" },
      { name: "description", content: "Construa sua agência de futebol do zero: descubra talentos, negocie com clubes e vire uma potência mundial." },
      { property: "og:title", content: "Project Football Agent" },
      { property: "og:description", content: "Simulação de gerenciamento onde você é o empresário. Descubra, contrate e negocie." },
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

  useEffect(() => {
    document.documentElement.classList.add("dark");
    setSaveExists(hasSave());
  }, []);

  const setState = (s: GameState) => {
    setStateInternal(s);
    saveGame(s);
    setSaveExists(true);
  };

  const handleNew = () => {
    if (hasSave()) {
      if (!confirm("Isto irá apagar seu save atual. Continuar?")) return;
      deleteSave();
    }
    setScreen("create");
  };

  const handleContinue = () => {
    const s = loadGame();
    if (s) {
      setStateInternal(s);
      setScreen("office");
    }
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
        <Menu hasSave={saveExists} onNew={handleNew} onContinue={handleContinue} />
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
