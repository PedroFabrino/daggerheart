import { describe, it, expect } from 'vitest';
import { applyShortRest, applyLongRest } from '../rest';
import { Character } from '../../types/daggerheart';

const baseCharacter: Character = {
  id: 'pc-rest-test',
  name: 'Kael',
  pronouns: 'he/him',
  level: 1,
  className: 'Warrior',
  subclassName: 'Juggernaut',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Dwarf',
    isMixedAncestry: false,
    ancestryFeatures: [],
    communityName: 'Loreborne',
    communityFeature: { name: 'Lore', text: 'Know things' },
  },
  traits: {
    Agility: 0,
    Strength: 2,
    Finesse: 1,
    Instinct: 1,
    Presence: 0,
    Knowledge: -1,
  },
  markedTraitsThisTier: [],
  evasion: 9,
  hp: { max: 7, currentDamage: 4 },
  stress: { max: 6, current: 3 },
  hope: { max: 6, current: 1 },
  armor: {
    equipped: null,
    score: 3,
    markedSlots: 2,
    maxSlots: 3,
  },
  damageThresholds: { minor: 6, major: 12, severe: 13 },
  proficiency: 1,
  experiences: [],
  weapons: { primary: null, secondary: null },
  loadout: [],
  vault: [],
  inventory: [],
  gold: { handfuls: 0, bags: 0, chests: 0 },
  advancementHistory: [],
  backgroundNotes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Rest Domain Engine - Ticket 06', () => {
  it('applies Short Rest with downtime moves', () => {
    // Tend Wounds: heals 2 HP damage; Prepare: +1 Hope
    const rested = applyShortRest(baseCharacter, [
      { type: 'tend_wounds', amount: 2 },
      { type: 'prepare', amount: 1 },
    ]);

    expect(rested.hp.currentDamage).toBe(2); // 4 - 2 = 2
    expect(rested.hope.current).toBe(2); // 1 + 1 = 2
    expect(rested.stress.current).toBe(3); // Unchanged
    expect(rested.armor.markedSlots).toBe(2); // Unchanged
  });

  it('applies Short Rest clearing stress and repairing armor', () => {
    const rested = applyShortRest(baseCharacter, [
      { type: 'clear_stress', amount: 3 },
      { type: 'repair_armor', amount: 2 },
    ]);

    expect(rested.stress.current).toBe(0); // 3 - 3 = 0
    expect(rested.armor.markedSlots).toBe(0); // 2 - 2 = 0
    expect(rested.hp.currentDamage).toBe(4); // Unchanged
  });

  it('applies Long Rest resetting HP, Stress, Armor, and setting Hope to at least 2', () => {
    const fullyRested = applyLongRest(baseCharacter);

    expect(fullyRested.hp.currentDamage).toBe(0);
    expect(fullyRested.stress.current).toBe(0);
    expect(fullyRested.armor.markedSlots).toBe(0);
    expect(fullyRested.hope.current).toBe(2); // Was 1, reset to 2
  });
});
