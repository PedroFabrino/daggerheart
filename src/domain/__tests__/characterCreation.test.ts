import { describe, it, expect } from 'vitest';
import {
  validateTraitArray,
  calculateStartingThresholds,
  buildStartingCharacter,
  CharacterDraft,
} from '../characterCreation';
import { getAncestry, getCommunity, getDomainCards } from '../../data/srdService';


describe('Character Creation Rules Engine - Ticket 02', () => {
  it('validates exact trait array (+2, +1, +1, 0, 0, -1)', () => {
    // Valid array
    expect(
      validateTraitArray({
        Agility: 2,
        Strength: 1,
        Finesse: 1,
        Instinct: 0,
        Presence: 0,
        Knowledge: -1,
      })
    ).toBe(true);

    // Invalid: sum might match but values are wrong
    expect(
      validateTraitArray({
        Agility: 3,
        Strength: 0,
        Finesse: 0,
        Instinct: 0,
        Presence: 0,
        Knowledge: 0,
      })
    ).toBe(false);

    // Invalid: duplicate +2
    expect(
      validateTraitArray({
        Agility: 2,
        Strength: 2,
        Finesse: 0,
        Instinct: 0,
        Presence: 0,
        Knowledge: -1,
      })
    ).toBe(false);

    // Invalid: missing -1
    expect(
      validateTraitArray({
        Agility: 2,
        Strength: 1,
        Finesse: 1,
        Instinct: 0,
        Presence: 0,
        Knowledge: 0,
      })
    ).toBe(false);
  });

  it('calculates damage thresholds adding level (1) to armor base thresholds', () => {
    // Gambeson Armor base_thresholds: [5, 11]
    // At level 1, thresholds = [5 + 1, 11 + 1] = [6, 12]
    const thresholds = calculateStartingThresholds([5, 11], 1);
    expect(thresholds.minor).toBe(6);
    expect(thresholds.major).toBe(12);
    expect(thresholds.severe).toBe(13); // Severe is major + 1
  });

  it('builds a legal starting Level 1 character', () => {
    const clankAncestry = getAncestry('Clank')!;

    const wildborneCommunity = getCommunity('Wildborne')!;

    // Select 2 Level 1 domain cards from Druid domains (Sage & Arcana)
    const arcanaCards = getDomainCards({ domain: 'Arcana', level: 1 });
    const sageCards = getDomainCards({ domain: 'Sage', level: 1 });

    const draft: CharacterDraft = {
      name: 'Thistle',
      pronouns: 'they/them',
      className: 'Druid',
      subclassName: 'Warden of the Elements',
      heritage: {
        ancestryName: clankAncestry.name,
        isMixedAncestry: false,
        ancestryFeatures: clankAncestry.features,
        communityName: wildborneCommunity.name,
        communityFeature: wildborneCommunity.feature,
      },
      traits: {
        Agility: 1,
        Strength: 0,
        Finesse: -1,
        Instinct: 2,
        Presence: 0,
        Knowledge: 1,
      },
      startingArmor: {
        name: 'Gambeson Armor',
        tier: 1,
        baseScore: 3,
        baseThresholds: [5, 11],
        features: [{ name: 'Flexible', text: '+1 to Evasion' }],
      },
      startingPrimaryWeapon: {
        name: 'Quarterstaff',
        tier: 1,
        burden: 'Two-Handed',
        damage: 'd8 phy',
        physicalOrMagical: 'Physical',
        primaryOrSecondary: 'Primary',
        range: 'Melee',
        trait: 'Instinct',
        features: [],
      },
      startingSecondaryWeapon: null,
      startingPotion: 'Minor Health Potion',
      experiences: [
        { id: 'exp-1', name: 'Wilderness Tracker', bonus: 2 },
        { id: 'exp-2', name: 'Ancient Mechanism Lore', bonus: 2 },
      ],
      startingDomainCards: [arcanaCards[0], sageCards[0]],
      backgroundNotes: 'A clockwork guardian attuned to the old growth forest.',
    };

    const character = buildStartingCharacter(draft);

    expect(character.name).toBe('Thistle');
    expect(character.level).toBe(1);
    expect(character.proficiency).toBe(1);
    expect(character.className).toBe('Druid');
    expect(character.subclassName).toBe('Warden of the Elements');
    expect(character.subclassCardState).toBe('foundation');

    // HP: Druid has 6 starting HP
    expect(character.hp.max).toBe(6);
    expect(character.hp.currentDamage).toBe(0);

    // Stress: 6 slots, 0 marked
    expect(character.stress.max).toBe(6);
    expect(character.stress.current).toBe(0);

    // Hope: 2 marked starting slots
    expect(character.hope.max).toBe(6);
    expect(character.hope.current).toBe(2);

    // Armor: Base score 3, max slots 3 (equal to base score)
    expect(character.armor.score).toBe(3);
    expect(character.armor.maxSlots).toBe(3);
    expect(character.armor.markedSlots).toBe(0);

    // Evasion: Druid starting 10 + Gambeson Flexible (+1) = 11
    expect(character.evasion).toBe(11);

    // Damage thresholds: 5+1 = 6, 11+1 = 12
    expect(character.damageThresholds.minor).toBe(6);
    expect(character.damageThresholds.major).toBe(12);
    expect(character.damageThresholds.severe).toBe(13);

    // Cards: 2 starting cards in loadout, 0 in vault
    expect(character.loadout).toHaveLength(2);
    expect(character.vault).toHaveLength(0);

    // Inventory contains rope, torch, gold, potion
    expect(character.inventory).toContain('50 feet of rope');
    expect(character.inventory).toContain('Torch');
    expect(character.inventory).toContain('Minor Health Potion');
    expect(character.gold.handfuls).toBe(1);
  });

  it('builds a Galapa character with Shell proficiency bonus added to starting damage thresholds', () => {
    const draft: CharacterDraft = {
      name: 'Tortuga',
      pronouns: 'he/him',
      className: 'Warrior',
      subclassName: 'Juggernaut',
      heritage: {
        ancestryName: 'Galapa',
        isMixedAncestry: false,
        ancestryFeatures: [
          { name: 'Shell', text: 'Gain a bonus to your damage thresholds equal to your Proficiency.' },
        ],
        communityName: 'Underborne',
        communityFeature: { name: 'Low-Light Living', text: 'Dark vision' },
      },
      traits: {
        Agility: 0,
        Strength: 2,
        Finesse: 0,
        Instinct: 1,
        Presence: 1,
        Knowledge: -1,
      },
      startingArmor: {
        name: 'Gambeson Armor',
        tier: 1,
        baseScore: 3,
        baseThresholds: [5, 11],
        features: [],
      },
      startingPrimaryWeapon: {
        name: 'Battleaxe',
        tier: 1,
        burden: 'One-Handed',
        damage: 'd10 phy',
        physicalOrMagical: 'Physical',
        primaryOrSecondary: 'Primary',
        range: 'Melee',
        trait: 'Strength',
        features: [],
      },
      startingSecondaryWeapon: null,
      startingPotion: 'Minor Health Potion',
      experiences: [],
      startingDomainCards: [],
      backgroundNotes: 'Galapa juggernaut warrior.',
    };

    const character = buildStartingCharacter(draft);
    // Base 5/11 + Level 1 = 6/12/13. Shell (+Proficiency 1) adds +1 to all -> 7 / 13 / 14
    expect(character.damageThresholds.minor).toBe(7);
    expect(character.damageThresholds.major).toBe(13);
    expect(character.damageThresholds.severe).toBe(14);
  });
});
