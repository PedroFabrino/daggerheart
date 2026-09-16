import { describe, it, expect } from 'vitest';
import {
  validateAndParseCharacterJson,
  exportCharacterToJson,
  duplicateCharacter,
} from '../rosterPortability';
import { Character } from '../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-source-1',
  name: 'Kael Stonehand',
  pronouns: 'he/him',
  level: 3,
  className: 'Guardian',
  subclassName: 'Ironclad',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Dwarf',
    isMixedAncestry: false,
    ancestryFeatures: [],
    communityName: 'Ridgeborne',
    communityFeature: { name: 'Mountain Born', text: 'Surefooted' },
  },
  traits: {
    Agility: 0,
    Strength: 3,
    Finesse: 1,
    Instinct: 1,
    Presence: 0,
    Knowledge: -1,
  },
  markedTraitsThisTier: ['Strength'],
  evasion: 9,
  hp: { max: 8, currentDamage: 0 },
  stress: { max: 6, current: 0 },
  hope: { max: 6, current: 2 },
  armor: {
    equipped: null,
    score: 3,
    markedSlots: 0,
    maxSlots: 3,
  },
  damageThresholds: { minor: 7, major: 13, severe: 14 },
  proficiency: 2,
  experiences: [],
  weapons: { primary: null, secondary: null },
  loadout: [],
  vault: [],
  inventory: [],
  gold: { handfuls: 0, bags: 0, chests: 0 },
  advancementHistory: [],
  backgroundNotes: '',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
};

describe('Roster Portability Domain Engine - Ticket 07', () => {
  it('exports character to JSON with sanitized filename', () => {
    const { filename, jsonString } = exportCharacterToJson(mockCharacter);
    expect(filename).toBe('kael_stonehand_lvl3.json');
    expect(jsonString).toContain('"name": "Kael Stonehand"');
    expect(jsonString).toContain('"level": 3');
  });

  it('validates and parses valid character JSON with newly assigned unique ID', () => {
    const { jsonString } = exportCharacterToJson(mockCharacter);
    const parsed = validateAndParseCharacterJson(jsonString);

    expect(parsed.valid).toBe(true);
    expect(parsed.character).toBeDefined();
    expect(parsed.character?.name).toBe('Kael Stonehand');
    expect(parsed.character?.id).not.toBe(mockCharacter.id); // New unique ID assigned
  });

  it('rejects invalid JSON syntax or missing required fields', () => {
    const res1 = validateAndParseCharacterJson('{ broken json');
    expect(res1.valid).toBe(false);
    expect(res1.error).toContain('Failed to parse JSON');

    const res2 = validateAndParseCharacterJson(JSON.stringify({ name: 'Incomplete' }));
    expect(res2.valid).toBe(false);
    expect(res2.error).toContain('Missing required character field');
  });

  it('duplicates character with (Copy) appended to name and new ID', () => {
    const copy = duplicateCharacter(mockCharacter);
    expect(copy.id).not.toBe(mockCharacter.id);
    expect(copy.name).toBe('Kael Stonehand (Copy)');
    expect(copy.level).toBe(3);
  });
});
