import { describe, it, expect } from 'vitest';
import {
  isTierAchievementLevel,
  validateAdvancements,
  applyLevelUp,
  LevelUpPayload,
} from '../levelUp';
import { Character, DomainCard } from '../../types/daggerheart';

const sampleCard: DomainCard = {
  id: 'card-volley',
  name: 'Volley',
  domain: 'Bone',
  level: 2,
  recallCost: 1,
  type: 'Ability',
  text: 'Deal damage to multiple targets.',
};

const baseCharacter: Character = {
  id: 'pc-lvl-test',
  name: 'Valen',
  pronouns: 'they/them',
  level: 1,
  className: 'Ranger',
  subclassName: 'Wayfinder',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Elf',
    isMixedAncestry: false,
    ancestryFeatures: [{ name: 'Keen Senses', text: 'Perceive' }],
    communityName: 'Wildborne',
    communityFeature: { name: 'Wild Forager', text: 'Forage' },
  },
  traits: {
    Agility: 2,
    Strength: 1,
    Finesse: 1,
    Instinct: 0,
    Presence: 0,
    Knowledge: -1,
  },
  markedTraitsThisTier: ['Strength'],
  evasion: 10,
  hp: { max: 6, currentDamage: 0 },
  stress: { max: 6, current: 0 },
  hope: { max: 6, current: 2 },
  armor: {
    equipped: null,
    score: 0,
    markedSlots: 0,
    maxSlots: 2,
  },
  damageThresholds: { minor: 5, major: 10, severe: 11 },
  proficiency: 1,
  experiences: [{ id: 'exp-1', name: 'Scout', bonus: 2 }],
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

describe('levelUp Domain Engine - Ticket 05', () => {
  it('correctly identifies Tier Achievement levels', () => {
    expect(isTierAchievementLevel(2)).toBe(true);
    expect(isTierAchievementLevel(5)).toBe(true);
    expect(isTierAchievementLevel(8)).toBe(true);
    expect(isTierAchievementLevel(1)).toBe(false);
    expect(isTierAchievementLevel(3)).toBe(false);
    expect(isTierAchievementLevel(4)).toBe(false);
    expect(isTierAchievementLevel(6)).toBe(false);
  });

  it('validates advancement selection slot counts and marked trait restrictions', () => {
    // Fails with 1 slot
    const check1 = validateAdvancements(baseCharacter, [
      { type: 'hp', slotsCost: 1 },
    ]);
    expect(check1.valid).toBe(false);
    expect(check1.errors[0]).toContain('Must select advancements totaling exactly 2 slots');

    // Fails with previously marked trait in tier
    const check2 = validateAdvancements(baseCharacter, [
      { type: 'trait', trait: 'Strength', slotsCost: 1 },
      { type: 'hp', slotsCost: 1 },
    ]);
    expect(check2.valid).toBe(false);
    expect(check2.errors[0]).toContain('Trait "Strength" has already been marked');

    // Passes when selecting un-marked trait and HP
    const check3 = validateAdvancements(baseCharacter, [
      { type: 'trait', trait: 'Agility', slotsCost: 1 },
      { type: 'hp', slotsCost: 1 },
    ]);
    expect(check3.valid).toBe(true);

    // Bypasses validation when houseRulesOverride is enabled
    const check4 = validateAdvancements(
      baseCharacter,
      [{ type: 'trait', trait: 'Strength', slotsCost: 1 }],
      true
    );
    expect(check4.valid).toBe(true);
  });

  it('applies level 1 -> 2 progression (Tier 2 achievement)', () => {
    const payload: LevelUpPayload = {
      advancements: [
        { type: 'trait', trait: 'Agility', slotsCost: 1 },
        { type: 'hp', slotsCost: 1 },
      ],
      newCard: sampleCard,
      tierExperienceAllocations: [{ experienceId: 'exp-1', bonusAmount: 2 }],
    };

    const leveled = applyLevelUp(baseCharacter, payload);

    expect(leveled.level).toBe(2);
    // Tier achievement +1 prof
    expect(leveled.proficiency).toBe(2);
    // Damage thresholds +1
    expect(leveled.damageThresholds.minor).toBe(6);
    expect(leveled.damageThresholds.major).toBe(11);
    expect(leveled.damageThresholds.severe).toBe(12);
    // Marked traits cleared on tier transition, then Agility marked
    expect(leveled.traits.Agility).toBe(3);
    expect(leveled.markedTraitsThisTier).toEqual(['Agility']);
    // HP max +1
    expect(leveled.hp.max).toBe(7);
    // Experience upgraded
    expect(leveled.experiences[0].bonus).toBe(4);
    // New card added
    expect(leveled.loadout.some((c) => c.id === 'card-volley')).toBe(true);
    // Advancement history recorded
    expect(leveled.advancementHistory.length).toBe(1);
    expect(leveled.advancementHistory[0].level).toBe(2);
  });

  it('unlocks subclass specialization at Level 5 and mastery at Level 8', () => {
    const lvl4Char: Character = {
      ...baseCharacter,
      level: 4,
      proficiency: 2,
      subclassCardState: 'foundation',
    };

    const payloadLvl5: LevelUpPayload = {
      advancements: [
        { type: 'hp', slotsCost: 1 },
        { type: 'stress', slotsCost: 1 },
      ],
      newCard: sampleCard,
    };

    const leveled5 = applyLevelUp(lvl4Char, payloadLvl5);
    expect(leveled5.level).toBe(5);
    expect(leveled5.proficiency).toBe(3);
    expect(leveled5.subclassCardState).toBe('specialization');

    const lvl7Char: Character = {
      ...leveled5,
      level: 7,
      proficiency: 3,
      subclassCardState: 'specialization',
    };

    const leveled8 = applyLevelUp(lvl7Char, payloadLvl5);
    expect(leveled8.level).toBe(8);
    expect(leveled8.proficiency).toBe(4);
    expect(leveled8.subclassCardState).toBe('mastery');
  });

  it('scales damage thresholds with proficiency increases on level up for Galapa Shell', () => {
    const galapaChar: Character = {
      ...baseCharacter,
      level: 1,
      proficiency: 1,
      heritage: {
        ...baseCharacter.heritage,
        ancestryName: 'Galapa',
        isMixedAncestry: false,
        ancestryFeatures: [
          { name: 'Shell', text: 'Gain a bonus to your damage thresholds equal to your Proficiency.' },
        ],
      },
      damageThresholds: { minor: 6, major: 12, severe: 13 },
    };

    const payload: LevelUpPayload = {
      advancements: [
        { type: 'trait', trait: 'Agility', slotsCost: 1 },
        { type: 'hp', slotsCost: 1 },
      ],
      newCard: sampleCard,
      tierExperienceAllocations: [{ experienceId: 'exp-1', bonusAmount: 2 }],
    };

    // Level 1 -> 2: Level increases (+1 thresholds) AND Proficiency increases 1 -> 2 (+1 Shell bonus)
    const leveled = applyLevelUp(galapaChar, payload);
    expect(leveled.level).toBe(2);
    expect(leveled.proficiency).toBe(2);
    // Base 6 + 1 (lvl) + 1 (prof increase) = 8
    expect(leveled.damageThresholds.minor).toBe(8);
    expect(leveled.damageThresholds.major).toBe(14);
    expect(leveled.damageThresholds.severe).toBe(15);
  });
});
