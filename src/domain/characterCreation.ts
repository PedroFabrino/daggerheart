import {
  Character,
  CharacterExperience,
  DomainCard,
  Feature,
  TraitName,
  WeaponItem,
  ArmorItem,
} from '../types/daggerheart';
import { getClass } from '../data/srdService';

export interface CharacterDraft {
  name: string;
  pronouns: string;
  className: string;
  subclassName: string;
  heritage: {
    ancestryName: string;
    isMixedAncestry: boolean;
    mixedSecondaryAncestryName?: string;
    ancestryFeatures: Feature[];
    communityName: string;
    communityFeature: Feature;
  };
  traits: Record<TraitName, number>;
  startingArmor: ArmorItem | null;
  startingPrimaryWeapon: WeaponItem | null;
  startingSecondaryWeapon: WeaponItem | null;
  startingPotion: 'Minor Health Potion' | 'Minor Stamina Potion';
  experiences: CharacterExperience[];
  startingDomainCards: DomainCard[];
  backgroundNotes: string;
}

const REQUIRED_TRAIT_VALUES = [2, 1, 1, 0, 0, -1];

/**
 * Validates that assigned traits exactly match the standard array (+2, +1, +1, 0, 0, -1).
 */
export function validateTraitArray(traits: Record<TraitName, number>): boolean {
  const values = Object.values(traits).sort((a, b) => b - a);
  const required = [...REQUIRED_TRAIT_VALUES].sort((a, b) => b - a);

  if (values.length !== required.length) return false;
  return values.every((val, i) => val === required[i]);
}

/**
 * Calculates starting damage thresholds: Base thresholds + character level.
 */
export function calculateStartingThresholds(
  baseThresholds: [number, number],
  level: number = 1
): { minor: number; major: number; severe: number } {
  const minor = baseThresholds[0] + level;
  const major = baseThresholds[1] + level;
  const severe = major + 1;
  return { minor, major, severe };
}

/**
 * Constructs a fully initialized Level 1 Character from draft choices.
 */
export function buildStartingCharacter(draft: CharacterDraft): Character {
  const classDef = getClass(draft.className);
  const startingHp = classDef ? classDef.startingHp : 6;
  let evasion = classDef ? classDef.startingEvasion : 10;

  // Check armor features for evasion modifiers (e.g. Flexible +1)
  if (draft.startingArmor) {
    draft.startingArmor.features.forEach((feat) => {
      const lower = feat.text.toLowerCase();
      if (lower.includes('+1 to evasion') || lower.includes('+1 evasion')) {
        evasion += 1;
      } else if (lower.includes('-1 to evasion') || lower.includes('-1 evasion')) {
        evasion -= 1;
      }
    });
  }

  const armorBaseThresholds = draft.startingArmor
    ? draft.startingArmor.baseThresholds
    : ([5, 11] as [number, number]);

  const thresholds = calculateStartingThresholds(armorBaseThresholds, 1);
  const ancestryFeatures = draft.heritage?.ancestryFeatures || [];
  const hasShell =
    ancestryFeatures.some(
      (f) =>
        f.name?.toLowerCase().includes('shell') ||
        f.text?.toLowerCase().includes('damage thresholds equal to your proficiency')
    ) ||
    (!draft.heritage?.isMixedAncestry &&
      draft.heritage?.ancestryName?.toLowerCase().includes('galapa'));

  if (hasShell) {
    thresholds.minor += 1;
    thresholds.major += 1;
    thresholds.severe += 1;
  }

  const armorScore = draft.startingArmor ? draft.startingArmor.baseScore : 0;

  const inventory: string[] = [
    '50 feet of rope',
    'Torch',
    'Basic supplies',
    draft.startingPotion,
  ];

  if (classDef && Array.isArray(classDef.items)) {
    classDef.items.forEach((item) => {
      if (item && !inventory.includes(item)) {
        inventory.push(item);
      }
    });
  }

  const now = new Date().toISOString();

  return {
    id: `pc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: draft.name || 'Unnamed Wanderer',
    pronouns: draft.pronouns || 'they/them',
    level: 1,
    className: draft.className,
    subclassName: draft.subclassName,
    subclassCardState: 'foundation',
    heritage: draft.heritage,
    traits: draft.traits,
    markedTraitsThisTier: [],
    evasion,
    hp: {
      max: startingHp,
      currentDamage: 0,
    },
    stress: {
      max: 6,
      current: 0,
    },
    hope: {
      max: 6,
      current: 2, // Standard Daggerheart starting Hope
    },
    armor: {
      equipped: draft.startingArmor,
      score: armorScore,
      markedSlots: 0,
      maxSlots: armorScore,
    },
    damageThresholds: thresholds,
    proficiency: 1,
    experiences: draft.experiences,
    weapons: {
      primary: draft.startingPrimaryWeapon,
      secondary: draft.startingSecondaryWeapon,
    },
    inventory,
    gold: {
      handfuls: 1,
      bags: 0,
      chests: 0,
    },
    loadout: draft.startingDomainCards,
    vault: [],
    advancementHistory: [],
    backgroundNotes: draft.backgroundNotes,
    createdAt: now,
    updatedAt: now,
  };
}
