import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageCharacterRepository } from '../CharacterRepository';
import { Character } from '../../types/daggerheart';

describe('CharacterRepository - LocalStorage persistence', () => {
  let repo: LocalStorageCharacterRepository;

  const mockCharacter: Character = {
    id: 'pc-1',
    name: 'Vaelin',
    pronouns: 'he/him',
    level: 1,
    className: 'Warrior',
    subclassName: 'Call of the Brave',
    subclassCardState: 'foundation',
    heritage: {
      ancestryName: 'Human',
      isMixedAncestry: false,
      ancestryFeatures: [{ name: 'Adaptable', text: 'Gain Hope' }],
      communityName: 'Loreborne',
      communityFeature: { name: 'Knowledgeable', text: 'Recall facts' },
    },
    traits: {
      Agility: 1,
      Strength: 2,
      Finesse: 0,
      Instinct: 1,
      Presence: 0,
      Knowledge: -1,
    },
    markedTraitsThisTier: [],
    evasion: 9,
    hp: { max: 7, currentDamage: 0 },
    stress: { max: 6, current: 0 },
    hope: { max: 6, current: 2 },
    armor: { equipped: null, score: 0, markedSlots: 0, maxSlots: 0 },
    damageThresholds: { minor: 6, major: 12, severe: 13 },
    proficiency: 1,
    experiences: [],
    weapons: { primary: null, secondary: null },
    inventory: ['Torch'],
    gold: { handfuls: 1, bags: 0, chests: 0 },
    loadout: [],
    vault: [],
    advancementHistory: [],
    backgroundNotes: 'Brave warrior',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageCharacterRepository();
  });

  it('saves and retrieves characters', async () => {
    expect(await repo.getAll()).toHaveLength(0);

    await repo.save(mockCharacter);
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Vaelin');

    const single = await repo.getById('pc-1');
    expect(single).not.toBeNull();
    expect(single?.name).toBe('Vaelin');
  });

  it('updates existing character in place', async () => {
    await repo.save(mockCharacter);
    const updated = { ...mockCharacter, name: 'Vaelin the Victorious' };
    await repo.save(updated);

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('Vaelin the Victorious');
  });

  it('deletes character and manages active id', async () => {
    await repo.save(mockCharacter);
    await repo.setActiveId('pc-1');
    expect(await repo.getActiveId()).toBe('pc-1');

    await repo.delete('pc-1');
    expect(await repo.getAll()).toHaveLength(0);
    expect(await repo.getActiveId()).toBeNull();
  });

  it('exports and imports character JSON', () => {
    const jsonStr = repo.exportJSON(mockCharacter);
    expect(jsonStr).toContain('"name": "Vaelin"');

    const imported = repo.importJSON(jsonStr);
    expect(imported.name).toBe('Vaelin');
    expect(imported.className).toBe('Warrior');
    expect(imported.id).not.toBe('pc-1'); // New ID generated
  });
});
