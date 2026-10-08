import { afterEach, describe, expect, test } from 'bun:test';
import { generateFighter, processCombatWeek, seekFightOffer } from '../combat';
import { novoJogo } from '../engine';
import { attendCombatVisit, bookCombatVisit } from './discovery';
import { developFighter, emptyRecord, STAGES, transitionToMma } from './career';
import { getSaveSlots, loadGame, saveGame, selectSaveSlot } from '../storage';
import type { CombatSport } from '../types';

const initial = () => novoJogo({ nome: 'Teste', sobrenome: 'Carreira', agencia: 'Agência de teste', pais: 'Brasil', estado: 'RS', cidade: 'Três Passos', nacionalidade: 'Brasileira' });
const originalRandom = Math.random;
afterEach(() => { Math.random = originalRandom; });

describe('Descoberta e carreira de combate', () => {
  test('As cinco modalidades começam na origem informal, sem cartel profissional inventado', () => {
    const state = initial();
    expect(STAGES).toHaveLength(7);
    for (const sport of ['MMA', 'Boxe', 'Kickboxing', 'Jiu-jítsu', 'Muay Thai'] as CombatSport[]) {
      const fighter = generateFighter(state, sport);
      expect(fighter.career?.stage).toBe('Origem informal');
      expect(fighter.record).toEqual(emptyRecord());
      expect(fighter.career?.professionalRecord).toEqual(emptyRecord());
    }
  });

  test('Candidatos só aparecem depois da presença e não duplicam ao rever a visita', () => {
    const state = initial();
    Math.random = () => .5;
    const booked = bookCombatVisit(state, 'community', 'MMA', 'Treino aberto').state;
    const visit = booked.combatVisits?.[0];
    if (!visit) throw new Error('Visita não criada');
    expect(booked.combatRadar).toHaveLength(0);
    expect(visit.candidates).toHaveLength(1);
    const attended = attendCombatVisit(booked, visit.id);
    expect(attended.combatRadar?.[0]?.id).toBe(visit.candidates[0]?.id);
    expect(attendCombatVisit(attended, visit.id).combatRadar).toHaveLength(1);
  });

  test('Transição ao MMA preserva histórico e exige 16 semanas antes de competir', () => {
    const state = initial();
    const fighter = { ...generateFighter(state, 'Jiu-jítsu'), represented: true };
    const converted = transitionToMma({ ...state, combatFighters: [fighter] }, fighter.id).state;
    expect(converted.combatFighters?.[0]?.career?.transitionWeeks).toBe(16);
    expect(converted.combatFighters?.[0]?.career?.sportArchives[0]?.sport).toBe('Jiu-jítsu');
    expect(seekFightOffer(converted, fighter.id).state.combatOffers).toHaveLength(0);
  });

  test('Treino não se repete na mesma semana', () => {
    const state = initial();
    const fighter = developFighter(generateFighter(state, 'MMA'), state, 0);
    expect(developFighter(fighter, state, 0).career?.weeksTraining).toBe(1);
  });

  test('Patrocínio paga somente a comissão de 10% e não duplica na mesma semana', () => {
    const state = initial();
    const generated = generateFighter(state, 'MMA');
    if (!generated.career) throw new Error('Carreira não criada');
    const fighter = { ...generated, career: { ...generated.career, sponsorship: { name: 'Patrocinador', monthlyValue: 1000, weeksRemaining: 48 } } };
    const paid = processCombatWeek({ ...state, combatFighters: [fighter] }, []);
    expect(paid.dinheiro - state.dinheiro).toBe(100);
    expect(processCombatWeek(paid, []).dinheiro).toBe(paid.dinheiro);
  });

  test('Luta resolvida guarda ações e não repete cartel nem pagamento', () => {
    const state = initial();
    const generated = generateFighter(state, 'Muay Thai');
    const fighter = { ...generated, represented: true, scheduledFight: { id: 'fight-test', opponent: 'Adversário', opponentRating: 20, organizationId: '', event: 'Encontro amador', weeksRemaining: 1, campWeeks: 2, campProgress: 40, weightProgress: 100, strategy: 'Equilibrada' as const, rounds: 3, purse: 1000, winBonus: 200, titleFight: false, circuit: 'amador' as const } };
    const resolved = processCombatWeek({ ...state, combatFighters: [fighter] }, []);
    expect(resolved.combatFighters?.[0]?.fightHistory).toHaveLength(1);
    expect(resolved.combatFighters?.[0]?.fightHistory[0]?.actions?.length).toBeGreaterThan(0);
    const repeated = processCombatWeek(resolved, []);
    expect(repeated.combatFighters?.[0]?.record).toEqual(resolved.combatFighters?.[0]?.record);
    expect(repeated.dinheiro).toBe(resolved.dinheiro);
    expect(repeated.financas).toHaveLength(resolved.financas.length);
  });

  test('Os cinco espaços mantêm progresso independente e migram lutadores antigos', () => {
    const data = new Map<string, string>();
    const previousWindow = globalThis.window;
    const previousStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) }, configurable: true });
    try {
      for (let index = 1; index <= 5; index++) {
        const state = initial();
        const fighter = { ...generateFighter(state, 'MMA'), career: undefined, record: { ...emptyRecord(), wins: index } };
        selectSaveSlot(`slot-${index}`);
        saveGame({ ...state, dinheiro: index * 1000, combatFighters: [fighter] });
      }
      expect(getSaveSlots()).toHaveLength(5);
      for (let index = 1; index <= 5; index++) {
        const saved = loadGame(`slot-${index}`);
        expect(saved?.dinheiro).toBe(index * 1000);
        expect(saved?.combatFighters?.[0]?.career?.professionalRecord.wins).toBe(index);
        expect(saved?.combatReputation?.['Muay Thai']).toBe(0);
      }
    } finally {
      Object.defineProperty(globalThis, 'window', { value: previousWindow, configurable: true });
      Object.defineProperty(globalThis, 'localStorage', { value: previousStorage, configurable: true });
    }
  });
});