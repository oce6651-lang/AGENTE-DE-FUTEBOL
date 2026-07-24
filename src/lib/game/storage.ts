import type { GameState } from "./types";

const KEY = "pfa_save_v2";

export function saveGame(state: GameState) {
  if (typeof window === "undefined") return;
  const toSave = { ...state, atualizadoEm: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(toSave));
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY);
}

export function deleteSave() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}