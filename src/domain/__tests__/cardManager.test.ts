import { describe, it, expect } from 'vitest';
import {
  canRecallCard,
  swapVaultToLoadout,
  vaultLoadoutCard,
} from '../cardManager';
import { Character, DomainCard } from '../../types/daggerheart';

const createMockCard = (id: string, name: string, recallCost: number): DomainCard => ({
  id,
  name,
  domain: 'Sage',
  level: 1,
  recallCost,
  type: 'Ability',
  text: 'Feature description',
});

const createMockCharacter = (loadout: DomainCard[], vault: DomainCard[], currentStress: number = 0): Character => ({
  id: 'pc-test',
  name: 'Test Character',
  pronouns: 'they/them',
  level: 1,
  className: 'Druid',
  subclassName: 'Warden of the Elements',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Clank',
    ancestryFeatures: [],
    communityName: 'Wildborne',
    communityFeature: { name: '', text: '' },
  },
  traits: { Agility: 0, Strength: 0, Finesse: 0, Instinct: 0, Presence: 0, Knowledge: 0 },
  markedTraitsThisTier: [],
  evasion: 10,
  hp: { max: 6, currentDamage: 0 },
  stress: { max: 6, current: currentStress },
  hope: { max: 6, current: 2 },
  armor: { equipped: null, score: 0, markedSlots: 0, maxSlots: 0 },
  damageThresholds: { minor: 5, major: 10, severe: 11 },
  proficiency: 1,
  experiences: [],
  weapons: { primary: null, secondary: null },
  inventory: [],
  gold: { handfuls: 0, bags: 0, chests: 0 },
  loadout,
  vault,
  advancementHistory: [],
  backgroundNotes: '',
  createdAt: '',
  updatedAt: '',
});

describe('Card Manager & Recall Rules Engine - Ticket 04', () => {
  it('allows free recall during downtime rest', () => {
    const card = createMockCard('c-1', 'Nature Ward', 2);
    const character = createMockCharacter([], [card], 4);

    const check = canRecallCard(character, card, true);
    expect(check.allowed).toBe(true);
    expect(check.stressCost).toBe(0);
  });

  it('charges exact recall stress cost outside of rest', () => {
    const card = createMockCard('c-1', 'Nature Ward', 2);
    const character = createMockCharacter([], [card], 2);

    const check = canRecallCard(character, card, false);
    expect(check.allowed).toBe(true);
    expect(check.stressCost).toBe(2);
  });

  it('rejects recall outside rest if player does not have enough stress slots remaining', () => {
    const card = createMockCard('c-1', 'Nature Ward', 2);
    // Character has 5 marked stress out of 6. Recalling cost 2 would exceed 6.
    const character = createMockCharacter([], [card], 5);

    const check = canRecallCard(character, card, false);
    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Not enough Stress slots');
  });

  it('moves card from vault to loadout and marks recall stress', () => {
    const c1 = createMockCard('c-1', 'Card 1', 1);
    const v1 = createMockCard('v-1', 'Vault Card', 2);

    const character = createMockCharacter([c1], [v1], 1);

    const updated = swapVaultToLoadout(character, 'v-1', undefined, false);

    expect(updated.loadout).toHaveLength(2);
    expect(updated.loadout.some((c) => c.id === 'v-1')).toBe(true);
    expect(updated.vault).toHaveLength(0);
    // Stress increased from 1 to 3 (cost 2)
    expect(updated.stress.current).toBe(3);
  });

  it('swaps vaulted card with an active loadout card when loadout is full (5/5)', () => {
    const activeCards = [
      createMockCard('c-1', 'Card 1', 1),
      createMockCard('c-2', 'Card 2', 1),
      createMockCard('c-3', 'Card 3', 1),
      createMockCard('c-4', 'Card 4', 1),
      createMockCard('c-5', 'Card 5', 1),
    ];
    const vaultedCard = createMockCard('v-1', 'Vault Card', 1);

    const character = createMockCharacter(activeCards, [vaultedCard], 0);

    // Replace c-3 with v-1 during rest (free)
    const updated = swapVaultToLoadout(character, 'v-1', 'c-3', true);

    expect(updated.loadout).toHaveLength(5);
    expect(updated.loadout.some((c) => c.id === 'v-1')).toBe(true);
    expect(updated.loadout.some((c) => c.id === 'c-3')).toBe(false);

    expect(updated.vault).toHaveLength(1);
    expect(updated.vault[0].id).toBe('c-3');
    expect(updated.stress.current).toBe(0); // Free during rest
  });

  it('vaults a loadout card freely without stress', () => {
    const c1 = createMockCard('c-1', 'Card 1', 1);
    const c2 = createMockCard('c-2', 'Card 2', 1);
    const character = createMockCharacter([c1, c2], [], 3);

    const updated = vaultLoadoutCard(character, 'c-1');
    expect(updated.loadout).toHaveLength(1);
    expect(updated.vault).toHaveLength(1);
    expect(updated.vault[0].id).toBe('c-1');
    expect(updated.stress.current).toBe(3); // No stress cost to vault
  });
});
