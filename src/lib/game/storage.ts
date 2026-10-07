import type { GameState } from "./types";
import { competicoesDoClube, ligaPrincipal } from "./data/leagues";
import { combatOrganizations, defaultCombatReputation } from "./combat";

import { migrateFighter } from "./combat/career";

const LEGACY_KEY = "pfa_save_v6";
const INDEX_KEY = "pfa_career_slots_v1";
const ACTIVE_KEY = "pfa_active_career_v1";
const MAX_SLOTS = 5;

export interface SaveSlot {
  id: string;
  agentName: string;
  agencyName: string;
  year: number;
  reputation: number;
  updatedAt: string;
}

const slotKey = (id: string) => `pfa_career_${id}`;

function parseState(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

function summary(id: string, state: GameState): SaveSlot {
  return {
    id,
    agentName: `${state.agent.nome} ${state.agent.sobrenome}`.trim(),
    agencyName: state.agent.agencia,
    year: state.ano,
    reputation: state.reputacao,
    updatedAt: state.atualizadoEm || state.criadoEm,
  };
}

function writeIndex(slots: SaveSlot[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(slots));
}

function migrateLegacySave() {
  if (typeof window === "undefined" || localStorage.getItem(INDEX_KEY)) return;
  const legacy = parseState(localStorage.getItem(LEGACY_KEY));
  if (!legacy) {
    writeIndex([]);
    return;
  }
  const id = "slot-1";
  localStorage.setItem(slotKey(id), JSON.stringify(legacy));
  writeIndex([summary(id, legacy)]);
  localStorage.setItem(ACTIVE_KEY, id);
  localStorage.removeItem(LEGACY_KEY);
}

export function getSaveSlots(): SaveSlot[] {
  if (typeof window === "undefined") return [];
  migrateLegacySave();
  try {
    const slots = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]") as SaveSlot[];
    return slots.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function getEmptySlotId(): string | null {
  const used = new Set(getSaveSlots().map(slot => slot.id));
  for (let index = 1; index <= MAX_SLOTS; index += 1) {
    const id = `slot-${index}`;
    if (!used.has(id)) return id;
  }
  return null;
}

export function selectSaveSlot(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}

export function saveGame(state: GameState) {
  if (typeof window === "undefined") return;
  const toSave = { ...state, atualizadoEm: new Date().toISOString() };
  const id = localStorage.getItem(ACTIVE_KEY) ?? getEmptySlotId() ?? getSaveSlots()[0]?.id;
  if (!id) return;
  localStorage.setItem(ACTIVE_KEY, id);
  localStorage.setItem(slotKey(id), JSON.stringify(toSave));
  const slots = getSaveSlots().filter(slot => slot.id !== id);
  writeIndex([summary(id, toSave), ...slots].slice(0, MAX_SLOTS));
}

export function loadGame(slotId?: string): GameState | null {
  if (typeof window === "undefined") return null;
  const slots = getSaveSlots();
  const id = slotId ?? slots[0]?.id;
  if (!id) return null;
  const parsed = parseState(localStorage.getItem(slotKey(id)));
  if (!parsed) return null;
  localStorage.setItem(ACTIVE_KEY, id);
  try {
    // Migração leve: campos novos em saves antigos.
    const competicoesCustom = parsed.competicoesCustom ?? [];
    return {
      ...parsed,
      clubes: (parsed.clubes ?? []).map(clube => {
        const modalidade = clube.modalidade ?? "campo";
        return {
          ...clube,
          liga: ligaPrincipal(clube.categoria, clube.pais, modalidade, clube.estado),
          competicoes: competicoesDoClube(
            clube.categoria, clube.pais, clube.estado, modalidade, competicoesCustom,
          ).map(competicao => competicao.nome),
        };
      }),
      historicoCompeticoes: parsed.historicoCompeticoes ?? [],
      historicoAgencia: parsed.historicoAgencia ?? [],
      titulosMundo: parsed.titulosMundo ?? [],
      competicoesCustom,
      combatFighters: (parsed.combatFighters ?? []).map(migrateFighter),
      combatRadar: (parsed.combatRadar ?? []).map(migrateFighter),
      combatOrganizations: [...combatOrganizations(), ...(parsed.combatOrganizations ?? []).filter(org => !combatOrganizations().some(current => current.id === org.id))],
      combatOffers: parsed.combatOffers ?? [],
      combatHistory: (parsed.combatHistory ?? []).map(migrateFighter),
      combatVisits: parsed.combatVisits ?? [],
      combatReputation: { ...defaultCombatReputation(), ...(parsed.combatReputation ?? {}) },
    };
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return getSaveSlots().length > 0;
}

export function deleteSave(slotId?: string) {
  if (typeof window === "undefined") return;
  const id = slotId ?? localStorage.getItem(ACTIVE_KEY);
  if (!id) return;
  localStorage.removeItem(slotKey(id));
  writeIndex(getSaveSlots().filter(slot => slot.id !== id));
  if (localStorage.getItem(ACTIVE_KEY) === id) localStorage.removeItem(ACTIVE_KEY);
}